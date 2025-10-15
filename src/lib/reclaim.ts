/**
 * Reclaim Protocol Integration Utilities
 * Handles the frontend integration with Reclaim Protocol for fitness data verification
 * Enhanced with Lighthouse storage for decentralized fitness data storage
 */

export interface ReclaimProofRequest {
  applicationId: string;
  providerId: string;
  callbackUrl: string;
  userWallet?: string;
}

export interface ReclaimProofResponse {
  success: boolean;
  stepCount?: number;
  reward?: {
    stepCoins: number;
    multiplier: number;
  };
  error?: string;
  proofId?: string;
  lighthouseCid?: string; // IPFS CID for stored fitness data
  lighthouseUrl?: string; // Lighthouse gateway URL
}

export interface FitnessProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  logo: string;
  supported: boolean;
}

/**
 * Supported fitness providers for Reclaim Protocol
 */
export const SUPPORTED_FITNESS_PROVIDERS: FitnessProvider[] = [
  {
    id: "google-fit-steps",
    name: "Google Fit",
    description: "Verify your daily steps from Google Fit",
    icon: "🔍",
    logo: "https://developers.google.com/static/fit/images/google-fit-logo.svg",
    supported: true,
  },
  {
    id: "apple-health-steps",
    name: "Apple Health",
    description: "Verify your daily steps from Apple Health",
    icon: "🍎",
    logo: "https://developer.apple.com/assets/elements/icons/healthkit/healthkit-96x96_2x.png",
    supported: true,
  },
  {
    id: "fitbit-steps",
    name: "Fitbit",
    description: "Verify your daily steps from Fitbit",
    icon: "⌚",
    logo: "https://logo.clearbit.com/fitbit.com",
    supported: true,
  },
  {
    id: "samsung-health-steps",
    name: "Samsung Health",
    description: "Verify your daily steps from Samsung Health",
    icon: "📱",
    logo: "https://img.icons8.com/color/48/samsung-health.png",
    supported: false, // Not yet implemented
  },
];

/**
 * Initiate real fitness proof generation using actual APIs
 */
export async function initiateReclaimProof(
  providerId: string,
  userWallet: string
): Promise<{
  success: boolean;
  redirectUrl?: string;
  error?: string;
  requestUrl?: string;
}> {
  try {
    console.log("🚀 Initiating real fitness proof for provider:", providerId);

    if (providerId.includes("google-fit")) {
      // Import the real Google Fit integration
      const { generateRealGoogleFitProof } = await import(
        "./realFitnessIntegration"
      );

      const result = await generateRealGoogleFitProof(userWallet);

      if (result.success && result.fitnessData && result.proof) {
        // Store the proof data for the modal to access
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            "latest_fitness_proof",
            JSON.stringify({
              fitnessData: result.fitnessData,
              proof: result.proof,
              providerId,
            })
          );
        }

        return {
          success: true,
          requestUrl: `#real-google-fit-proof-${Date.now()}`,
          redirectUrl: `#real-google-fit-proof-${Date.now()}`,
        };
      } else {
        throw new Error(result.error || "Failed to generate Google Fit proof");
      }
    } else {
      // For other providers, show a message that real integration is needed
      throw new Error(
        `Real integration for ${providerId} is not yet implemented. Please use Google Fit for now.`
      );
    }
  } catch (error) {
    console.error("❌ Error initiating real fitness proof:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if a proof has been submitted and processed
 * Queries the backend for proof verification status
 */
export async function checkProofStatus(
  proofId: string
): Promise<ReclaimProofResponse> {
  try {
    console.log("🔍 Checking proof status:", proofId);

    // Query the backend for proof status
    const statusResponse = await fetch(
      `/api/reclaim-callback/status?proofId=${proofId}`
    );

    if (!statusResponse.ok) {
      throw new Error(
        `HTTP ${statusResponse.status}: ${statusResponse.statusText}`
      );
    }

    const statusData = await statusResponse.json();

    return {
      success: statusData.verified || false,
      stepCount: statusData.stepCount,
      reward: statusData.reward,
      proofId: proofId,
      lighthouseCid: statusData.lighthouseCid,
      lighthouseUrl: statusData.lighthouseUrl,
      error: statusData.error,
    };
  } catch (error) {
    console.error("❌ Error checking proof status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Verify a Reclaim proof using the Reclaim SDK
 */
export async function verifyReclaimProof(
  proof: any,
  providerId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log("🔐 Verifying Reclaim proof for provider:", providerId);

    // For development, simulate proof verification
    // Import Reclaim SDK dynamically
    const reclaimModule = await import("@reclaimprotocol/js-sdk");

    // Use the correct import method
    const isValid = await reclaimModule.verifyProof(proof);

    if (!isValid) {
      return {
        success: false,
        error: "Invalid proof signature or data",
      };
    }

    // Extract fitness data from the verified proof
    const extractedData = extractFitnessDataFromProof(proof, providerId);

    return {
      success: true,
      data: extractedData,
    };
  } catch (error) {
    console.error("❌ Error verifying Reclaim proof:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Extract fitness data from a verified Reclaim proof
 */
function extractFitnessDataFromProof(proof: any, providerId: string): any {
  try {
    // Parse the claim data from the proof
    const claimData = JSON.parse(proof.claimData);

    if (providerId.includes("google-fit")) {
      return {
        steps: claimData.steps || claimData.value || 0,
        calories: claimData.calories || 0,
        distance: claimData.distance || 0,
        timestamp: claimData.timestamp || Date.now(),
        provider: "google-fit",
      };
    } else if (providerId.includes("apple-health")) {
      return {
        steps: claimData.stepCount || claimData.count || 0,
        calories: claimData.activeEnergyBurned || 0,
        distance: claimData.distanceWalkingRunning || 0,
        timestamp: claimData.endDate || Date.now(),
        provider: "apple-health",
      };
    } else if (providerId.includes("fitbit")) {
      return {
        steps:
          claimData.steps || claimData["activities-steps"]?.[0]?.value || 0,
        calories:
          claimData.calories ||
          claimData["activities-calories"]?.[0]?.value ||
          0,
        distance:
          claimData.distance ||
          claimData["activities-distance"]?.[0]?.value ||
          0,
        timestamp: claimData.dateTime || Date.now(),
        provider: "fitbit",
      };
    }

    // Default parsing for unknown providers
    return {
      steps: claimData.steps || 0,
      calories: claimData.calories || 0,
      distance: claimData.distance || 0,
      timestamp: claimData.timestamp || Date.now(),
      provider: providerId,
    };
  } catch (error) {
    console.error("❌ Error extracting fitness data from proof:", error);
    return {
      steps: 0,
      calories: 0,
      distance: 0,
      timestamp: Date.now(),
      provider: providerId,
    };
  }
}

/**
 * Calculate potential StepCoin rewards based on step count
 * This mirrors the calculation logic in the backend
 */
export function calculatePotentialReward(stepCount: number): {
  stepCoins: number;
  multiplier: number;
} {
  let baseReward = stepCount / 100;
  let multiplier = 1;

  // Progressive bonuses (same as backend)
  if (stepCount >= 20000) {
    multiplier = 3;
  } else if (stepCount >= 15000) {
    multiplier = 2.5;
  } else if (stepCount >= 10000) {
    multiplier = 2;
  } else if (stepCount >= 5000) {
    multiplier = 1.5;
  }

  const stepCoins = Math.round(baseReward * multiplier * 100) / 100;
  return { stepCoins, multiplier };
}

/**
 * Format step count with proper thousands separators
 */
export function formatStepCount(steps: number): string {
  return new Intl.NumberFormat().format(steps);
}

/**
 * Get user-friendly provider name
 */
export function getProviderDisplayName(providerId: string): string {
  const provider = SUPPORTED_FITNESS_PROVIDERS.find((p) => p.id === providerId);
  return provider?.name || providerId;
}

/**
 * Store verified fitness data on Lighthouse after successful Reclaim proof
 */
export async function storeVerifiedFitnessData(
  stepCount: number,
  providerId: string,
  walletAddress: string,
  reclaimProofId: string
): Promise<{ cid?: string; url?: string; error?: string }> {
  try {
    console.log("💾 Storing verified fitness data on Lighthouse...", {
      stepCount,
      provider: providerId,
      proofId: reclaimProofId,
    });

    const response = await fetch("/api/lighthouse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "store_fitness_data",
        data: {
          walletAddress,
          stepCount,
          provider: providerId,
          reclaimProofId,
        },
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Fitness data stored on Lighthouse:", {
        cid: result.cid,
        url: result.url,
      });

      return {
        cid: result.cid,
        url: result.url,
      };
    } else {
      console.error("❌ Failed to store fitness data:", result.error);
      return { error: result.error };
    }
  } catch (error) {
    console.error("❌ Error storing fitness data on Lighthouse:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to store fitness data",
    };
  }
}

/**
 * Complete proof processing workflow
 * Handles the full cycle from proof verification to reward distribution
 */
export async function processReclaimProof(
  proof: any,
  providerId: string,
  userWallet: string
): Promise<ReclaimProofResponse> {
  try {
    console.log("🔄 Processing complete Reclaim proof workflow...");

    // Step 1: Verify the Reclaim proof
    const verificationResult = await verifyReclaimProof(proof, providerId);
    if (!verificationResult.success) {
      return {
        success: false,
        error: `Proof verification failed: ${verificationResult.error}`,
      };
    }

    const fitnessData = verificationResult.data;
    console.log("✅ Fitness data extracted:", fitnessData);

    // Step 2: Store data on Lighthouse
    const storageResult = await storeVerifiedFitnessData(
      fitnessData.steps,
      providerId,
      userWallet,
      proof.identifier || `proof-${Date.now()}`
    );

    if (storageResult.error) {
      console.warn(
        "⚠️ Storage failed but continuing with rewards:",
        storageResult.error
      );
    }

    // Step 3: Calculate rewards
    const reward = calculatePotentialReward(fitnessData.steps);

    // Step 4: Submit to smart contract for verification and minting
    try {
      const contractResult = await submitToSmartContract({
        user: userWallet,
        provider: getProviderTypeId(providerId),
        steps: fitnessData.steps,
        calories: fitnessData.calories,
        distance: fitnessData.distance,
        ipfsHash: storageResult.cid || "",
        proof: proof,
      });

      if (!contractResult.success) {
        console.warn(
          "⚠️ Smart contract submission failed:",
          contractResult.error
        );
      }
    } catch (contractError) {
      console.warn("⚠️ Smart contract not available, skipping:", contractError);
    }

    return {
      success: true,
      stepCount: fitnessData.steps,
      reward,
      proofId: proof.identifier,
      lighthouseCid: storageResult.cid,
      lighthouseUrl: storageResult.url,
    };
  } catch (error) {
    console.error("❌ Error processing Reclaim proof:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Submit verified fitness data to smart contract
 */
async function submitToSmartContract(data: {
  user: string;
  provider: number;
  steps: number;
  calories: number;
  distance: number;
  ipfsHash: string;
  proof: any;
}): Promise<{ success: boolean; error?: string; txHash?: string }> {
  try {
    // This would integrate with the smart contract deployment
    // For now, we'll call a backend API that handles contract interaction
    const response = await fetch("/api/smart-contract/verify-proof", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Contract submission failed",
    };
  }
}

/**
 * Get numeric provider type for smart contract
 */
function getProviderTypeId(providerId: string): number {
  if (providerId.includes("google-fit")) return 0;
  if (providerId.includes("apple-health")) return 1;
  if (providerId.includes("fitbit")) return 2;
  if (providerId.includes("strava")) return 3;
  return 0; // Default to Google Fit
}
