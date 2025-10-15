// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface IStepCoin {
    function verifyAndReward(
        address user,
        uint8 provider,
        uint256 steps,
        uint256 calories,
        uint256 distance,
        string calldata ipfsHash,
        bytes32 proofHash
    ) external;
}

/**
 * @title ProofVerifier
 * @dev Verifies Reclaim Protocol proofs for fitness data
 * Validates signatures and proof integrity before rewarding users
 */
contract ProofVerifier is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    
    // Reclaim Protocol configuration
    struct ReclaimProof {
        string claimInfo;
        string signedClaim;
        string context;
    }
    
    struct FitnessData {
        uint8 provider; // 0: Google Fit, 1: Apple Health, 2: Fitbit, 3: Strava
        uint256 steps;
        uint256 calories;
        uint256 distance;
        uint256 timestamp;
        string ipfsHash;
    }
    
    // Events
    event ProofVerified(
        address indexed user,
        bytes32 indexed proofHash,
        uint8 provider,
        string ipfsHash
    );
    
    event ReclaimProviderAdded(string providerId, address verifierAddress);
    event StepCoinContractUpdated(address indexed oldContract, address indexed newContract);
    
    // Storage
    IStepCoin public stepCoinContract;
    mapping(string => address) public reclaimProviders; // providerId => verifier address
    mapping(bytes32 => bool) public verifiedProofs;
    mapping(address => bool) public authorizedCallers;
    
    // Reclaim Protocol provider IDs
    string public constant GOOGLE_FIT_PROVIDER = "google-fit-provider-id";
    string public constant APPLE_HEALTH_PROVIDER = "apple-health-provider-id";
    string public constant FITBIT_PROVIDER = "fitbit-provider-id";
    string public constant STRAVA_PROVIDER = "strava-provider-id";
    
    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender] || msg.sender == owner(), "Unauthorized caller");
        _;
    }
    
    constructor(address initialOwner) Ownable(initialOwner) {
        // StepCoin contract will be set after deployment
        authorizedCallers[initialOwner] = true;
        
        // Initialize default Reclaim providers (these would be real addresses in production)
        reclaimProviders[GOOGLE_FIT_PROVIDER] = address(0x1); // Placeholder
        reclaimProviders[APPLE_HEALTH_PROVIDER] = address(0x2); // Placeholder
        reclaimProviders[FITBIT_PROVIDER] = address(0x3); // Placeholder
        reclaimProviders[STRAVA_PROVIDER] = address(0x4); // Placeholder
    }
    
    /**
     * @dev Verify Reclaim Protocol proof and trigger StepCoin rewards
     * @param user The user submitting the proof
     * @param fitnessData Parsed fitness data from the proof
     * @param proof The Reclaim Protocol proof structure
     */
    function verifyProofAndReward(
        address user,
        FitnessData calldata fitnessData,
        ReclaimProof calldata proof
    ) external onlyAuthorized nonReentrant {
        _verifyProofAndRewardInternal(user, fitnessData, proof);
    }
    
    /**
     * @dev Verify Reclaim Protocol proof signature and content
     * In a real implementation, this would validate against Reclaim's verification logic
     */
    function _verifyReclaimProof(
        uint8 provider,
        ReclaimProof memory proof
    ) internal view returns (bool) {
        // Get the provider's verification address
        string memory providerId = _getProviderIdByType(provider);
        address verifierAddress = reclaimProviders[providerId];
        
        require(verifierAddress != address(0), "Unsupported fitness provider");
        
        // In a real implementation, this would:
        // 1. Parse the signedClaim to extract the signature
        // 2. Verify the signature against the claimInfo using the provider's public key
        // 3. Validate the context and claim structure
        // 4. Ensure the data hasn't been tampered with
        
        // For now, we'll do basic validation
        require(bytes(proof.claimInfo).length > 0, "Empty claim info");
        require(bytes(proof.signedClaim).length > 0, "Empty signed claim");
        
        // Simulate signature verification (in production, use actual Reclaim verification)
        bytes32 claimHash = keccak256(bytes(proof.claimInfo));
        
        // Mock verification - in reality, this would verify against Reclaim's attestation
        return claimHash != bytes32(0);
    }
    
    /**
     * @dev Get provider ID string by provider type
     */
    function _getProviderIdByType(uint8 provider) internal pure returns (string memory) {
        if (provider == 0) return GOOGLE_FIT_PROVIDER;
        if (provider == 1) return APPLE_HEALTH_PROVIDER;
        if (provider == 2) return FITBIT_PROVIDER;
        if (provider == 3) return STRAVA_PROVIDER;
        revert("Invalid provider type");
    }
    
    /**
     * @dev Batch verify multiple proofs for gas efficiency
     */
    function batchVerifyProofs(
        address[] calldata users,
        FitnessData[] calldata fitnessDataArray,
        ReclaimProof[] calldata proofs
    ) external onlyAuthorized {
        require(users.length == fitnessDataArray.length, "Array length mismatch");
        require(users.length == proofs.length, "Array length mismatch");
        require(users.length <= 50, "Batch size too large");
        
        for (uint256 i = 0; i < users.length; i++) {
            _verifyProofAndRewardInternal(users[i], fitnessDataArray[i], proofs[i]);
        }
    }
    
    /**
     * @dev Internal function for proof verification (used by both single and batch functions)
     */
    function _verifyProofAndRewardInternal(
        address user,
        FitnessData calldata fitnessData,
        ReclaimProof calldata proof
    ) internal {
        require(user != address(0), "Invalid user address");
        require(fitnessData.timestamp > 0, "Invalid timestamp");
        require(bytes(fitnessData.ipfsHash).length > 0, "Invalid IPFS hash");
        
        // Create proof hash to prevent replay attacks
        bytes32 proofHash = keccak256(abi.encodePacked(
            user,
            fitnessData.provider,
            fitnessData.steps,
            fitnessData.calories,
            fitnessData.distance,
            fitnessData.timestamp,
            proof.signedClaim
        ));
        
        require(!verifiedProofs[proofHash], "Proof already processed");
        
        // Verify the Reclaim Protocol proof
        require(_verifyReclaimProof(fitnessData.provider, proof), "Invalid Reclaim proof");
        
        // Mark proof as verified
        verifiedProofs[proofHash] = true;
        
        // Call StepCoin contract to mint rewards
        stepCoinContract.verifyAndReward(
            user,
            fitnessData.provider,
            fitnessData.steps,
            fitnessData.calories,
            fitnessData.distance,
            fitnessData.ipfsHash,
            proofHash
        );
        
        emit ProofVerified(user, proofHash, fitnessData.provider, fitnessData.ipfsHash);
    }
    
    /**
     * @dev Check if a proof has been verified
     */
    function isProofVerified(bytes32 proofHash) external view returns (bool) {
        return verifiedProofs[proofHash];
    }
    
    /**
     * @dev Generate proof hash for verification
     */
    function generateProofHash(
        address user,
        FitnessData calldata fitnessData,
        string calldata signedClaim
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            user,
            fitnessData.provider,
            fitnessData.steps,
            fitnessData.calories,
            fitnessData.distance,
            fitnessData.timestamp,
            signedClaim
        ));
    }
    
    /**
     * @dev Admin functions
     */
    function setStepCoinContract(address _newContract) external onlyOwner {
        require(_newContract != address(0), "Invalid contract address");
        address oldContract = address(stepCoinContract);
        stepCoinContract = IStepCoin(_newContract);
        emit StepCoinContractUpdated(oldContract, _newContract);
    }
    
    function addReclaimProvider(string calldata providerId, address verifierAddress) external onlyOwner {
        require(verifierAddress != address(0), "Invalid verifier address");
        reclaimProviders[providerId] = verifierAddress;
        emit ReclaimProviderAdded(providerId, verifierAddress);
    }
    
    function removeReclaimProvider(string calldata providerId) external onlyOwner {
        delete reclaimProviders[providerId];
    }
    
    function addAuthorizedCaller(address caller) external onlyOwner {
        require(caller != address(0), "Invalid caller address");
        authorizedCallers[caller] = true;
    }
    
    function removeAuthorizedCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = false;
    }
    
    /**
     * @dev Get provider verification address
     */
    function getProviderVerifier(string calldata providerId) external view returns (address) {
        return reclaimProviders[providerId];
    }
    
    /**
     * @dev Emergency functions
     */
    function emergencyPause() external onlyOwner {
        // In a real implementation, this would pause the contract
        // For now, we can remove all authorized callers except owner
        // This effectively pauses external verification calls
    }
}