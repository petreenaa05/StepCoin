import { ethers } from "ethers";
import hre from "hardhat";
import { expect } from "chai";
import { StepCoin, ProofVerifier } from "../typechain-types";

describe("StepCoin Integration", function () {
  let stepCoin: StepCoin;
  let proofVerifier: ProofVerifier;
  let owner: any;
  let user: any;
  let addrs: any[];

  beforeEach(async function () {
    // Get signers
    [owner, user, ...addrs] = await hre.ethers.getSigners();

    // Deploy ProofVerifier
    const ProofVerifier = await hre.ethers.getContractFactory("ProofVerifier");
    proofVerifier = await ProofVerifier.deploy(owner.address);
    await proofVerifier.waitForDeployment();

    // Deploy StepCoin
    const StepCoin = await hre.ethers.getContractFactory("StepCoin");
    stepCoin = await StepCoin.deploy(
      owner.address,
      await proofVerifier.getAddress()
    );
    await stepCoin.waitForDeployment();

    // Configure ProofVerifier with StepCoin address
    await proofVerifier.setStepCoinContract(await stepCoin.getAddress());
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await stepCoin.owner()).to.equal(owner.address);
      expect(await proofVerifier.owner()).to.equal(owner.address);
    });

    it("Should mint initial supply to owner", async function () {
      const totalSupply = await stepCoin.totalSupply();
      const ownerBalance = await stepCoin.balanceOf(owner.address);
      expect(ownerBalance).to.equal(totalSupply);
      expect(totalSupply).to.equal(hre.ethers.parseEther("100000000")); // 100M tokens
    });

    it("Should have correct token metadata", async function () {
      expect(await stepCoin.name()).to.equal("StepCoin");
      expect(await stepCoin.symbol()).to.equal("STEP");
      expect(await stepCoin.decimals()).to.equal(18);
    });
  });

  describe("Proof Verification and Rewards", function () {
    it("Should verify proof and distribute rewards", async function () {
      // Mock fitness data
      const fitnessData = {
        provider: 0, // Google Fit
        steps: 10000,
        calories: 500,
        distance: 8000, // 8km in meters
        timestamp: Math.floor(Date.now() / 1000),
        ipfsHash: "QmTest1234567890",
      };

      // Mock Reclaim proof
      const reclaimProof = {
        claimInfo: JSON.stringify({ steps: 10000, provider: "google-fit" }),
        signedClaim: JSON.stringify(["mock-signature"]),
        context: "fitness-verification-test",
      };

      // Get user's initial balance
      const initialBalance = await stepCoin.balanceOf(user.address);
      expect(initialBalance).to.equal(0);

      // Verify proof and reward (as owner since owner is authorized)
      await proofVerifier.verifyProofAndReward(
        user.address,
        fitnessData,
        reclaimProof
      );

      // Check user received rewards
      const finalBalance = await stepCoin.balanceOf(user.address);
      expect(finalBalance).to.be.gt(0);

      // Check user activity was recorded
      const activity = await stepCoin.getUserActivity(user.address);
      expect(activity[0]).to.equal(fitnessData.steps); // totalSteps
      expect(activity[1]).to.equal(fitnessData.calories); // totalCalories
      expect(activity[2]).to.equal(fitnessData.distance); // totalDistance
      expect(activity[4]).to.equal(true); // isVerified
    });

    it("Should prevent replay attacks", async function () {
      const fitnessData = {
        provider: 0,
        steps: 5000,
        calories: 250,
        distance: 4000,
        timestamp: Math.floor(Date.now() / 1000),
        ipfsHash: "QmTest1234567891",
      };

      const reclaimProof = {
        claimInfo: JSON.stringify({ steps: 5000, provider: "google-fit" }),
        signedClaim: JSON.stringify(["mock-signature-2"]),
        context: "fitness-verification-test-2",
      };

      // First verification should succeed
      await proofVerifier.verifyProofAndReward(
        user.address,
        fitnessData,
        reclaimProof
      );

      // Second verification with same proof should fail
      await expect(
        proofVerifier.verifyProofAndReward(
          user.address,
          fitnessData,
          reclaimProof
        )
      ).to.be.revertedWith("Proof already processed");
    });

    it("Should calculate rewards correctly", async function () {
      // Test different step counts and expected rewards
      const testCases = [
        { steps: 1000, expectedMultiplier: 1 },
        { steps: 5000, expectedMultiplier: 1.5 },
        { steps: 10000, expectedMultiplier: 2 },
        { steps: 15000, expectedMultiplier: 2.5 },
        { steps: 20000, expectedMultiplier: 3 },
      ];

      for (const testCase of testCases) {
        const rewards = await stepCoin.calculateRewards(
          addrs[0].address, // Fresh user address
          testCase.steps,
          500, // calories
          8000 // distance
        );

        const expectedStepsReward =
          BigInt(testCase.steps) * hre.ethers.parseEther("0.01");
        expect(rewards[0]).to.equal(expectedStepsReward); // stepsReward
      }
    });
  });

  describe("Access Control", function () {
    it("Should only allow authorized verifiers", async function () {
      const fitnessData = {
        provider: 0,
        steps: 1000,
        calories: 100,
        distance: 1000,
        timestamp: Math.floor(Date.now() / 1000),
        ipfsHash: "QmTest",
      };

      const reclaimProof = {
        claimInfo: JSON.stringify({ steps: 1000 }),
        signedClaim: JSON.stringify(["signature"]),
        context: "test",
      };

      // Should fail when called by unauthorized user
      await expect(
        proofVerifier
          .connect(user)
          .verifyProofAndReward(user.address, fitnessData, reclaimProof)
      ).to.be.revertedWith("Unauthorized caller");
    });

    it("Should allow owner to add/remove authorized verifiers", async function () {
      // Add user as authorized verifier
      await proofVerifier.addAuthorizedCaller(user.address);

      const fitnessData = {
        provider: 0,
        steps: 1000,
        calories: 100,
        distance: 1000,
        timestamp: Math.floor(Date.now() / 1000),
        ipfsHash: "QmTest",
      };

      const reclaimProof = {
        claimInfo: JSON.stringify({ steps: 1000 }),
        signedClaim: JSON.stringify(["signature"]),
        context: "test",
      };

      // Should now succeed
      await proofVerifier
        .connect(user)
        .verifyProofAndReward(user.address, fitnessData, reclaimProof);

      // Remove authorization
      await proofVerifier.removeAuthorizedCaller(user.address);

      // Should fail again
      await expect(
        proofVerifier
          .connect(user)
          .verifyProofAndReward(
            user.address,
            { ...fitnessData, timestamp: Math.floor(Date.now() / 1000) + 1 },
            reclaimProof
          )
      ).to.be.revertedWith("Unauthorized caller");
    });
  });

  describe("1MB.io DataCoin Integration", function () {
    it("Should return correct DataCoin information", async function () {
      const dataCoinInfo = await stepCoin.getDataCoinInfo();
      expect(dataCoinInfo[0]).to.equal("FITNESS");
      expect(dataCoinInfo[1]).to.equal("RECLAIM_PROTOCOL");
      expect(dataCoinInfo[2]).to.include("fitness data");
    });

    it("Should track metrics for DataCoin compliance", async function () {
      const initialMetrics = await stepCoin.getRewardMetrics();
      expect(initialMetrics[0]).to.equal(0); // totalUsers
      expect(initialMetrics[1]).to.equal(0); // totalRewards

      // Add some users
      const fitnessData = {
        provider: 0,
        steps: 10000,
        calories: 500,
        distance: 8000,
        timestamp: Math.floor(Date.now() / 1000),
        ipfsHash: "QmTest1234567890",
      };

      const reclaimProof = {
        claimInfo: JSON.stringify({ steps: 10000 }),
        signedClaim: JSON.stringify(["signature"]),
        context: "test",
      };

      await proofVerifier.verifyProofAndReward(
        user.address,
        fitnessData,
        reclaimProof
      );

      const finalMetrics = await stepCoin.getRewardMetrics();
      expect(finalMetrics[0]).to.equal(1); // totalUsers
      expect(finalMetrics[1]).to.be.gt(0); // totalRewards
    });
  });
});
