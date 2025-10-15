import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Deploying StepCoin contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy ProofVerifier first
  console.log("\n📋 Deploying ProofVerifier...");
  const ProofVerifier = await ethers.getContractFactory("ProofVerifier");
  const proofVerifier = await ProofVerifier.deploy(
    deployer.address // initialOwner
  );
  await proofVerifier.waitForDeployment();
  const proofVerifierAddress = await proofVerifier.getAddress();
  console.log("✅ ProofVerifier deployed to:", proofVerifierAddress);

  // Deploy StepCoin with ProofVerifier address
  console.log("\n🪙 Deploying StepCoin...");
  const StepCoin = await ethers.getContractFactory("StepCoin");
  const stepCoin = await StepCoin.deploy(
    deployer.address, // initialOwner
    proofVerifierAddress // proofVerifierContract
  );
  await stepCoin.waitForDeployment();
  const stepCoinAddress = await stepCoin.getAddress();
  console.log("✅ StepCoin deployed to:", stepCoinAddress);

  // Update ProofVerifier with StepCoin address
  console.log("\n🔗 Configuring contracts...");
  const setStepCoinTx = await proofVerifier.setStepCoinContract(
    stepCoinAddress
  );
  await setStepCoinTx.wait();
  console.log("✅ ProofVerifier configured with StepCoin address");

  // Display deployment summary
  console.log("\n📊 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📋 ProofVerifier: ${proofVerifierAddress}`);
  console.log(`🪙 StepCoin:      ${stepCoinAddress}`);
  console.log(`🌐 Network:       ${(await ethers.provider.getNetwork()).name}`);
  console.log(`⛽ Deployer:      ${deployer.address}`);

  // Get initial token supply
  const totalSupply = await stepCoin.totalSupply();
  console.log(`💎 Initial Supply: ${ethers.formatEther(totalSupply)} STEP`);

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      ProofVerifier: proofVerifierAddress,
      StepCoin: stepCoinAddress,
    },
    deployedAt: new Date().toISOString(),
    totalSupply: ethers.formatEther(totalSupply),
  };

  console.log("\n💾 Deployment Info (save this for frontend configuration):");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verify contracts if on a supported network
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 31337n) {
    // Not local hardhat
    console.log("\n🔍 Contract verification:");
    console.log("Run these commands to verify on block explorer:");
    console.log(
      `npx hardhat verify --network ${
        process.env.HARDHAT_NETWORK || "sepolia"
      } ${proofVerifierAddress} "${deployer.address}"`
    );
    console.log(
      `npx hardhat verify --network ${
        process.env.HARDHAT_NETWORK || "sepolia"
      } ${stepCoinAddress} "${deployer.address}" "${proofVerifierAddress}"`
    );
  }

  console.log("\n✨ Deployment completed successfully!");
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
