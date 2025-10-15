import { NextRequest, NextResponse } from "next/server";
import { Reclaim } from "@reclaimprotocol/js-sdk";

interface ReclaimProof {
  claimData: {
    provider: string;
    parameters: string;
    owner: string;
    timestampS: number;
    context: string;
    identifier: string;
    epoch: number;
  };
  signatures: string[];
  witnesses: {
    id: string;
    url: string;
  }[];
  extractedParameterValues: {
    [key: string]: string;
  };
}

interface StepDataResponse {
  ok: boolean;
  stepCount?: number;
  error?: string;
  reward?: {
    stepCoins: number;
    multiplier: number;
  };
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<StepDataResponse>> {
  try {
    console.log("📥 Received Reclaim proof callback");

    // Parse the incoming proof data
    const proof: ReclaimProof = await request.json();

    if (!proof || !proof.claimData || !proof.signatures) {
      console.error("❌ Invalid proof structure");
      return NextResponse.json(
        { ok: false, error: "Invalid proof structure" },
        { status: 400 }
      );
    }

    // Verify the proof using Reclaim SDK
    const isProofValid = await Reclaim.verifyProof(proof);

    if (!isProofValid) {
      console.error("❌ Proof verification failed");
      return NextResponse.json(
        { ok: false, error: "Invalid proof signature" },
        { status: 400 }
      );
    }

    console.log("🔍 Verifying proof from provider:", proof.claimData.provider);

    // Verify the signed proof using Reclaim SDK
    const isValid = await Reclaim.verifySignedProof(proof);

    if (!isValid) {
      console.error("❌ Proof verification failed");
      return NextResponse.json(
        { ok: false, error: "Invalid proof - verification failed" },
        { status: 400 }
      );
    }

    console.log("✅ Proof verified successfully");

    // Extract step count from the proof
    const extractedValues = proof.extractedParameterValues;
    let stepCount = 0;

    // Handle different fitness providers
    if (extractedValues.steps) {
      stepCount = parseInt(extractedValues.steps, 10);
    } else if (extractedValues.stepCount) {
      stepCount = parseInt(extractedValues.stepCount, 10);
    } else if (extractedValues.daily_steps) {
      stepCount = parseInt(extractedValues.daily_steps, 10);
    } else {
      console.warn("⚠️ No step data found in proof");
      return NextResponse.json(
        { ok: false, error: "No step data found in proof" },
        { status: 400 }
      );
    }

    if (isNaN(stepCount) || stepCount < 0) {
      console.error("❌ Invalid step count:", extractedValues);
      return NextResponse.json(
        { ok: false, error: "Invalid step count data" },
        { status: 400 }
      );
    }

    console.log("📊 Extracted step count:", stepCount);

    // Calculate StepCoin rewards
    const reward = calculateStepCoinReward(stepCount);

    // Log the successful verification and reward
    console.log(
      `💰 Rewarding user: ${stepCount} steps = ${reward.stepCoins} StepCoins`
    );

    // TODO: In a real implementation, you would:
    // 1. Save the proof verification to your database
    // 2. Update the user's step count and StepCoin balance
    // 3. Prevent duplicate proofs for the same time period
    // 4. Implement proper authentication to link proof to user wallet

    return NextResponse.json({
      ok: true,
      stepCount,
      reward,
    });
  } catch (error) {
    console.error("💥 Error processing Reclaim proof:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate StepCoin rewards based on step count
 * Implements a progressive reward system with bonuses for higher activity
 */
function calculateStepCoinReward(stepCount: number): {
  stepCoins: number;
  multiplier: number;
} {
  // Base conversion: 100 steps = 1 StepCoin
  let baseReward = stepCount / 100;
  let multiplier = 1;

  // Progressive bonuses
  if (stepCount >= 20000) {
    // Ultra active: 20k+ steps = 3x multiplier
    multiplier = 3;
  } else if (stepCount >= 15000) {
    // Very active: 15k+ steps = 2.5x multiplier
    multiplier = 2.5;
  } else if (stepCount >= 10000) {
    // Active: 10k+ steps = 2x multiplier
    multiplier = 2;
  } else if (stepCount >= 5000) {
    // Moderate: 5k+ steps = 1.5x multiplier
    multiplier = 1.5;
  }

  const stepCoins = Math.round(baseReward * multiplier * 100) / 100; // Round to 2 decimal places

  return { stepCoins, multiplier };
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
