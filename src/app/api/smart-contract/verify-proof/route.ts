import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

interface SmartContractRequest {
  user: string;
  provider: number;
  steps: number;
  calories: number;
  distance: number;
  ipfsHash: string;
  proof: any;
}

interface SmartContractResponse {
  success: boolean;
  error?: string;
  txHash?: string;
  rewardsDistributed?: string;
}

// Smart contract ABIs (would be imported from compiled contracts)
const STEP_COIN_ABI = [
  "function verifyAndReward(address user, uint8 provider, uint256 steps, uint256 calories, uint256 distance, string calldata ipfsHash, bytes32 proofHash) external",
  "function getUserActivity(address user) external view returns (uint256, uint256, uint256, uint256, bool, uint256, uint256, uint256)",
  "function balanceOf(address account) external view returns (uint256)",
];

const PROOF_VERIFIER_ABI = [
  "function verifyProofAndReward(address user, tuple(uint8 provider, uint256 steps, uint256 calories, uint256 distance, uint256 timestamp, string ipfsHash) fitnessData, tuple(string claimInfo, string signedClaim, string context) proof) external",
];

export async function POST(
  request: NextRequest
): Promise<NextResponse<SmartContractResponse>> {
  try {
    console.log("📥 Received smart contract verification request");

    const body: SmartContractRequest = await request.json();

    if (!body.user || !body.proof) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get environment variables
    const rpcUrl = process.env.RPC_URL || process.env.BASE_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const stepCoinAddress = process.env.STEP_COIN_CONTRACT_ADDRESS;
    const proofVerifierAddress = process.env.PROOF_VERIFIER_CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey || !stepCoinAddress || !proofVerifierAddress) {
      console.error("❌ Missing contract configuration");
      return NextResponse.json(
        { success: false, error: "Contract configuration not available" },
        { status: 500 }
      );
    }

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);

    // Initialize contracts
    const proofVerifierContract = new ethers.Contract(
      proofVerifierAddress,
      PROOF_VERIFIER_ABI,
      signer
    );

    // Prepare proof data for the smart contract
    const fitnessData = {
      provider: body.provider,
      steps: body.steps,
      calories: body.calories,
      distance: body.distance,
      timestamp: Math.floor(Date.now() / 1000),
      ipfsHash: body.ipfsHash || "",
    };

    const reclaimProof = {
      claimInfo: JSON.stringify(body.proof.claimData || {}),
      signedClaim: JSON.stringify(body.proof.signatures || []),
      context: body.proof.claimData?.context || "fitness-verification",
    };

    console.log("🔗 Calling smart contract verification...", {
      user: body.user,
      fitnessData,
      proofVerifierAddress,
    });

    // Call the smart contract
    const tx = await proofVerifierContract.verifyProofAndReward(
      body.user,
      fitnessData,
      reclaimProof
    );

    console.log("📝 Transaction submitted:", tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      console.log("✅ Transaction confirmed:", receipt.hash);

      // Parse events to get reward information
      let rewardsDistributed = "0";
      try {
        const stepCoinContract = new ethers.Contract(
          stepCoinAddress,
          STEP_COIN_ABI,
          provider
        );

        // Look for RewardsDistributed event
        const events = await stepCoinContract.queryFilter(
          "RewardsDistributed",
          receipt.blockNumber,
          receipt.blockNumber
        );

        if (events.length > 0) {
          const event = events.find((e) => e.args && e.args[0] === body.user);
          if (event && event.args) {
            rewardsDistributed = ethers.formatEther(event.args[4]); // totalReward
          }
        }
      } catch (eventError) {
        console.warn("⚠️ Could not parse reward events:", eventError);
      }

      return NextResponse.json({
        success: true,
        txHash: receipt.hash,
        rewardsDistributed,
      });
    } else {
      console.error("❌ Transaction failed");
      return NextResponse.json(
        { success: false, error: "Transaction failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error in smart contract verification:", error);

    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;

      // Handle specific error types
      if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient gas funds for transaction";
      } else if (error.message.includes("execution reverted")) {
        errorMessage =
          "Smart contract execution failed - proof may be invalid or already processed";
      } else if (error.message.includes("network")) {
        errorMessage = "Network connection error";
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint to check proof verification status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const proofId = searchParams.get("proofId");
    const userAddress = searchParams.get("user");

    if (!proofId && !userAddress) {
      return NextResponse.json(
        { success: false, error: "Missing proofId or user parameter" },
        { status: 400 }
      );
    }

    // This would query your database for proof status
    // For now, return a placeholder response
    return NextResponse.json({
      success: false,
      error: "Proof status checking not yet implemented",
    });
  } catch (error) {
    console.error("❌ Error checking proof status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
