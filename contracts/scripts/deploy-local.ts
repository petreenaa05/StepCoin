import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Starting local deployment for development...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy ProofVerifier first
  console.log("\n📋 Deploying ProofVerifier...");
  const ProofVerifier = await hre.ethers.getContractFactory("ProofVerifier");
  const proofVerifier = await ProofVerifier.deploy(deployer.address);
  await proofVerifier.waitForDeployment();
  const proofVerifierAddress = await proofVerifier.getAddress();
  console.log("✅ ProofVerifier deployed to:", proofVerifierAddress);

  // Deploy StepCoin
  console.log("\n🪙 Deploying StepCoin...");
  const StepCoin = await hre.ethers.getContractFactory("StepCoin");
  const stepCoin = await StepCoin.deploy(
    deployer.address,
    proofVerifierAddress
  );
  await stepCoin.waitForDeployment();
  const stepCoinAddress = await stepCoin.getAddress();
  console.log("✅ StepCoin deployed to:", stepCoinAddress);

  // Configure ProofVerifier with StepCoin address
  console.log("\n🔗 Configuring contracts...");
  const setStepCoinTx = await proofVerifier.setStepCoinContract(
    stepCoinAddress
  );
  await setStepCoinTx.wait();
  console.log("✅ ProofVerifier configured with StepCoin address");

  // Get network info
  const network = await hre.ethers.provider.getNetwork();

  // Create deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    contracts: {
      ProofVerifier: proofVerifierAddress,
      StepCoin: stepCoinAddress,
    },
    deployedAt: new Date().toISOString(),
    totalSupply: hre.ethers.formatEther(await stepCoin.totalSupply()),
  };

  // Save deployment info to JSON file
  const deploymentPath = path.join(
    process.cwd(),
    "deployments",
    `${network.name}_${Date.now()}.json`
  );
  const deploymentDir = path.dirname(deploymentPath);

  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

  // Display summary
  console.log("\n📊 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📋 ProofVerifier: ${proofVerifierAddress}`);
  console.log(`🪙 StepCoin:      ${stepCoinAddress}`);
  console.log(`🌐 Network:       ${network.name} (${network.chainId})`);
  console.log(`⛽ Deployer:      ${deployer.address}`);
  console.log(`💎 Initial Supply: ${deploymentInfo.totalSupply} STEP`);

  // Generate environment variables
  console.log("\n🔧 Environment Variables:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Add these to your .env.local file:");
  console.log("");
  console.log(`STEP_COIN_CONTRACT_ADDRESS=${stepCoinAddress}`);
  console.log(`PROOF_VERIFIER_CONTRACT_ADDRESS=${proofVerifierAddress}`);

  if (network.chainId === 1337n || network.chainId === 31337n) {
    console.log(`RPC_URL=http://127.0.0.1:8545`);
    console.log(`CHAIN_ID=31337`);
  } else {
    console.log(`CHAIN_ID=${network.chainId}`);
  }

  console.log("\n✨ Deployment completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Copy the contract addresses above to your .env.local file");
  console.log("2. Restart your Next.js development server");
  console.log("3. Test the integration in your frontend");

  return deploymentInfo;
}

main()
  .then((info) => {
    console.log("\n🎉 Ready to integrate with frontend!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
