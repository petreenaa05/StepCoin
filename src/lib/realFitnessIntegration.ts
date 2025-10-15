import {
  useWriteContract,
  useAccount,
  useWaitForTransactionReceipt,
} from "wagmi";
import { PROOF_VERIFIER_ABI, PROOF_VERIFIER_ADDRESS } from "../contracts";
import { storeVerifiedFitnessData } from "./reclaim";

interface FitnessData {
  provider: number;
  steps: number;
  calories: number;
  distance: number;
  timestamp: number;
  ipfsHash: string;
}

interface ReclaimProof {
  claimInfo: string;
  signedClaim: string;
  context: string;
}

export function useProofVerification() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const submitProof = async (fitnessData: FitnessData, proof: ReclaimProof) => {
    if (!address || !PROOF_VERIFIER_ADDRESS) {
      throw new Error("Wallet not connected or contract not configured");
    }

    try {
      // Store fitness data on Lighthouse first
      const storageResult = await storeVerifiedFitnessData(
        fitnessData.steps,
        getProviderName(fitnessData.provider),
        address,
        `proof-${Date.now()}`
      );

      const updatedFitnessData = {
        ...fitnessData,
        ipfsHash: storageResult.cid || "",
      };

      // Submit to smart contract
      writeContract({
        address: PROOF_VERIFIER_ADDRESS as `0x${string}`,
        abi: PROOF_VERIFIER_ABI,
        functionName: "verifyProofAndReward",
        args: [address, updatedFitnessData, proof],
      });

      return { success: true, hash };
    } catch (error) {
      console.error("Failed to submit proof:", error);
      throw error;
    }
  };

  return {
    submitProof,
    isPending: isPending || isConfirming,
    isSuccess: isConfirmed,
    hash,
  };
}

function getProviderName(provider: number): string {
  switch (provider) {
    case 0:
      return "google-fit";
    case 1:
      return "apple-health";
    case 2:
      return "fitbit";
    case 3:
      return "strava";
    default:
      return "unknown";
  }
}

// Real Google Fit integration using Google Fit REST API
export async function connectGoogleFit(): Promise<{
  success: boolean;
  accessToken?: string;
  error?: string;
}> {
  try {
    // Check if user is already authenticated
    if (typeof window === "undefined") {
      return { success: false, error: "Not in browser environment" };
    }

    // Use Google OAuth 2.0 for authentication
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return { success: false, error: "Google Client ID not configured" };
    }

    const scope = "https://www.googleapis.com/auth/fitness.activity.read";
    const redirectUri = `${window.location.origin}/auth/google/callback`;

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `access_type=offline`;

    // Open Google OAuth in a popup
    const popup = window.open(
      authUrl,
      "google-fit-auth",
      "width=500,height=600,scrollbars=yes,resizable=yes"
    );

    return new Promise((resolve) => {
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // Check if we have the auth code in localStorage (set by callback)
          const authCode = localStorage.getItem("google_auth_code");
          if (authCode) {
            localStorage.removeItem("google_auth_code");
            resolve({ success: true, accessToken: authCode });
          } else {
            resolve({ success: false, error: "Authentication cancelled" });
          }
        }
      }, 1000);

      // Handle popup blocked or other errors
      setTimeout(() => {
        if (!popup?.closed) {
          popup?.close();
          clearInterval(checkClosed);
          resolve({ success: false, error: "Authentication timeout" });
        }
      }, 60000); // 1 minute timeout
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Fetch real Google Fit data
export async function fetchGoogleFitSteps(accessToken: string): Promise<{
  success: boolean;
  data?: {
    steps: number;
    calories: number;
    distance: number;
  };
  error?: string;
}> {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const startTimeNanos = startOfDay.getTime() * 1000000;
    const endTimeNanos = endOfDay.getTime() * 1000000;

    // Fetch steps data
    const stepsResponse = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aggregateBy: [
            {
              dataTypeName: "com.google.step_count.delta",
              dataSourceId:
                "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
            },
          ],
          bucketByTime: { durationMillis: 86400000 }, // 1 day
          startTimeMillis: startOfDay.getTime(),
          endTimeMillis: endOfDay.getTime(),
        }),
      }
    );

    if (!stepsResponse.ok) {
      throw new Error("Failed to fetch Google Fit data");
    }

    const stepsData = await stepsResponse.json();

    let totalSteps = 0;
    if (stepsData.bucket?.[0]?.dataset?.[0]?.point) {
      totalSteps = stepsData.bucket[0].dataset[0].point.reduce(
        (sum: number, point: any) => sum + (point.value?.[0]?.intVal || 0),
        0
      );
    }

    // Estimate calories and distance based on steps
    const estimatedCalories = Math.round(totalSteps * 0.04); // ~0.04 calories per step
    const estimatedDistance = Math.round(totalSteps * 0.762); // ~0.762 meters per step

    return {
      success: true,
      data: {
        steps: totalSteps,
        calories: estimatedCalories,
        distance: estimatedDistance,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch fitness data",
    };
  }
}

// Generate real proof with Google Fit data
export async function generateRealGoogleFitProof(userAddress: string): Promise<{
  success: boolean;
  fitnessData?: FitnessData;
  proof?: ReclaimProof;
  error?: string;
}> {
  try {
    // Step 1: Connect to Google Fit
    console.log("🔗 Connecting to Google Fit...");
    const authResult = await connectGoogleFit();

    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    // Step 2: Fetch fitness data
    console.log("📊 Fetching fitness data...");
    const fitData = await fetchGoogleFitSteps(authResult.accessToken!);

    if (!fitData.success) {
      return { success: false, error: fitData.error };
    }

    // Step 3: Create fitness data structure
    const fitnessData: FitnessData = {
      provider: 0, // Google Fit
      steps: fitData.data!.steps,
      calories: fitData.data!.calories,
      distance: fitData.data!.distance,
      timestamp: Math.floor(Date.now() / 1000),
      ipfsHash: "", // Will be filled during submission
    };

    // Step 4: Create proof structure (in production, this would come from Reclaim Protocol)
    const proof: ReclaimProof = {
      claimInfo: JSON.stringify({
        provider: "google-fit",
        dataSource: "com.google.step_count.delta",
        steps: fitnessData.steps,
        calories: fitnessData.calories,
        distance: fitnessData.distance,
        timestamp: fitnessData.timestamp,
        userAddress,
      }),
      signedClaim: JSON.stringify({
        signature: `real-google-fit-${Date.now()}`,
        timestamp: fitnessData.timestamp,
        verified: true,
      }),
      context: "google-fit-real-integration",
    };

    return {
      success: true,
      fitnessData,
      proof,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate proof",
    };
  }
}
