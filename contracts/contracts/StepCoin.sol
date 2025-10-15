// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title StepCoin
 * @dev ERC-20 token that rewards users for verified fitness activity
 * Integrates with Reclaim Protocol for fitness data verification
 * Compatible with 1MB.io DataCoin requirements
 */
contract StepCoin is ERC20, Ownable, ReentrancyGuard, Pausable {
    
    // Reward rates per activity type (in tokens with 18 decimals)
    uint256 public constant STEPS_REWARD_RATE = 1e16; // 0.01 STEP per step
    uint256 public constant CALORIES_REWARD_RATE = 1e17; // 0.1 STEP per calorie
    uint256 public constant DISTANCE_REWARD_RATE = 1e18; // 1 STEP per km
    
    // Maximum rewards per day to prevent gaming
    uint256 public constant MAX_DAILY_STEPS_REWARD = 10000e18; // 10,000 STEP
    uint256 public constant MAX_DAILY_CALORIES_REWARD = 5000e18; // 5,000 STEP
    uint256 public constant MAX_DAILY_DISTANCE_REWARD = 100e18; // 100 STEP
    
    // Fitness data providers
    enum FitnessProvider { GOOGLE_FIT, APPLE_HEALTH, FITBIT, STRAVA }
    
    // User activity tracking
    struct UserActivity {
        uint256 totalSteps;
        uint256 totalCalories;
        uint256 totalDistance; // in meters
        uint256 lastRewardDate;
        uint256 dailyStepsReward;
        uint256 dailyCaloriesReward;
        uint256 dailyDistanceReward;
        bool isVerified;
    }
    
    // Proof verification structure
    struct FitnessProof {
        address user;
        FitnessProvider provider;
        uint256 steps;
        uint256 calories;
        uint256 distance;
        uint256 timestamp;
        string ipfsHash; // Lighthouse storage hash
        bool isVerified;
    }
    
    // Events
    event FitnessDataVerified(
        address indexed user,
        FitnessProvider provider,
        uint256 steps,
        uint256 calories,
        uint256 distance,
        string ipfsHash
    );
    
    event RewardsDistributed(
        address indexed user,
        uint256 stepsReward,
        uint256 caloriesReward,
        uint256 distanceReward,
        uint256 totalReward
    );
    
    event ProofVerifierUpdated(address indexed oldVerifier, address indexed newVerifier);
    
    // Storage
    mapping(address => UserActivity) public userActivities;
    mapping(bytes32 => bool) public processedProofs;
    mapping(address => bool) public authorizedVerifiers;
    
    address public proofVerifierContract;
    uint256 public totalUsersRewarded;
    uint256 public totalRewardsDistributed;
    
    // 1MB.io DataCoin integration
    string public constant DATA_COIN_CATEGORY = "FITNESS";
    string public constant DATA_SOURCE = "RECLAIM_PROTOCOL";
    
    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender] || msg.sender == proofVerifierContract, "Unauthorized verifier");
        _;
    }
    
    constructor(
        address initialOwner,
        address _proofVerifierContract
    ) ERC20("StepCoin", "STEP") Ownable(initialOwner) {
        proofVerifierContract = _proofVerifierContract;
        authorizedVerifiers[_proofVerifierContract] = true;
        
        // Mint initial supply for rewards pool (100M tokens)
        _mint(initialOwner, 100_000_000 * 10**decimals());
    }
    
    /**
     * @dev Verify and process fitness data proof from Reclaim Protocol
     * @param user The user address
     * @param provider The fitness data provider
     * @param steps Number of steps
     * @param calories Calories burned
     * @param distance Distance traveled in meters
     * @param ipfsHash Lighthouse IPFS hash of the stored data
     * @param proofHash Unique hash of the proof to prevent replay
     */
    function verifyAndReward(
        address user,
        FitnessProvider provider,
        uint256 steps,
        uint256 calories,
        uint256 distance,
        string calldata ipfsHash,
        bytes32 proofHash
    ) external onlyVerifier nonReentrant whenNotPaused {
        require(user != address(0), "Invalid user address");
        require(!processedProofs[proofHash], "Proof already processed");
        require(bytes(ipfsHash).length > 0, "Invalid IPFS hash");
        
        // Mark proof as processed
        processedProofs[proofHash] = true;
        
        // Get user activity data
        UserActivity storage activity = userActivities[user];
        
        // Reset daily rewards if it's a new day
        if (block.timestamp / 1 days > activity.lastRewardDate / 1 days) {
            activity.dailyStepsReward = 0;
            activity.dailyCaloriesReward = 0;
            activity.dailyDistanceReward = 0;
        }
        
        // Calculate rewards
        (uint256 stepsReward, uint256 caloriesReward, uint256 distanceReward) = 
            calculateRewards(user, steps, calories, distance);
        
        uint256 totalReward = stepsReward + caloriesReward + distanceReward;
        
        if (totalReward > 0) {
            // Update user activity
            activity.totalSteps += steps;
            activity.totalCalories += calories;
            activity.totalDistance += distance;
            activity.lastRewardDate = block.timestamp;
            activity.dailyStepsReward += stepsReward;
            activity.dailyCaloriesReward += caloriesReward;
            activity.dailyDistanceReward += distanceReward;
            activity.isVerified = true;
            
            // Mint rewards to user
            _mint(user, totalReward);
            
            // Update global stats
            if (activity.totalSteps == steps) { // First time user
                totalUsersRewarded++;
            }
            totalRewardsDistributed += totalReward;
            
            emit RewardsDistributed(user, stepsReward, caloriesReward, distanceReward, totalReward);
        }
        
        emit FitnessDataVerified(user, provider, steps, calories, distance, ipfsHash);
    }
    
    /**
     * @dev Calculate rewards based on activity data and daily limits
     */
    function calculateRewards(
        address user,
        uint256 steps,
        uint256 calories,
        uint256 distance
    ) public view returns (uint256 stepsReward, uint256 caloriesReward, uint256 distanceReward) {
        UserActivity storage activity = userActivities[user];
        
        // Calculate potential rewards
        uint256 potentialStepsReward = steps * STEPS_REWARD_RATE;
        uint256 potentialCaloriesReward = calories * CALORIES_REWARD_RATE;
        uint256 potentialDistanceReward = (distance / 1000) * DISTANCE_REWARD_RATE; // Convert meters to km
        
        // Apply daily limits
        stepsReward = _min(potentialStepsReward, MAX_DAILY_STEPS_REWARD - activity.dailyStepsReward);
        caloriesReward = _min(potentialCaloriesReward, MAX_DAILY_CALORIES_REWARD - activity.dailyCaloriesReward);
        distanceReward = _min(potentialDistanceReward, MAX_DAILY_DISTANCE_REWARD - activity.dailyDistanceReward);
    }
    
    /**
     * @dev Get user's fitness activity summary
     */
    function getUserActivity(address user) external view returns (
        uint256 totalSteps,
        uint256 totalCalories,
        uint256 totalDistance,
        uint256 lastRewardDate,
        bool isVerified,
        uint256 todayStepsReward,
        uint256 todayCaloriesReward,
        uint256 todayDistanceReward
    ) {
        UserActivity storage activity = userActivities[user];
        return (
            activity.totalSteps,
            activity.totalCalories,
            activity.totalDistance,
            activity.lastRewardDate,
            activity.isVerified,
            activity.dailyStepsReward,
            activity.dailyCaloriesReward,
            activity.dailyDistanceReward
        );
    }
    
    /**
     * @dev Admin functions
     */
    function setProofVerifier(address _newVerifier) external onlyOwner {
        require(_newVerifier != address(0), "Invalid verifier address");
        address oldVerifier = proofVerifierContract;
        
        authorizedVerifiers[oldVerifier] = false;
        authorizedVerifiers[_newVerifier] = true;
        proofVerifierContract = _newVerifier;
        
        emit ProofVerifierUpdated(oldVerifier, _newVerifier);
    }
    
    function addAuthorizedVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid verifier address");
        authorizedVerifiers[verifier] = true;
    }
    
    function removeAuthorizedVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = false;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= balanceOf(address(this)), "Insufficient contract balance");
        _transfer(address(this), owner(), amount);
    }
    
    /**
     * @dev Utility functions
     */
    function _min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }
    
    /**
     * @dev 1MB.io DataCoin integration functions
     */
    function getDataCoinInfo() external pure returns (
        string memory category,
        string memory dataSource,
        string memory description
    ) {
        return (
            DATA_COIN_CATEGORY,
            DATA_SOURCE,
            "Verified fitness data from multiple providers via Reclaim Protocol"
        );
    }
    
    function getTotalDataPoints() external view returns (uint256) {
        return totalUsersRewarded;
    }
    
    function getRewardMetrics() external view returns (
        uint256 totalUsers,
        uint256 totalRewards,
        uint256 currentSupply
    ) {
        return (
            totalUsersRewarded,
            totalRewardsDistributed,
            totalSupply()
        );
    }
}