/**
 * Lighthouse Protocol Integration for StepCoin
 * Handles decentralized storage of fitness data on IPFS/Filecoin
 */

import lighthouse from "@lighthouse-web3/sdk";

// Lighthouse configuration
const LIGHTHOUSE_API_KEY =
  process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || "your-lighthouse-api-key";

export interface FitnessDataPackage {
  userId: string;
  walletAddress: string;
  timestamp: number;
  date: string;
  stepData: {
    stepCount: number;
    calories?: number;
    distance?: number;
    activeMinutes?: number;
    heartRate?: number;
  };
  provider: string; // 'google-fit', 'apple-health', 'fitbit'
  reclaimProofId?: string;
  verified: boolean;
  metadata: {
    deviceType?: string;
    appVersion: string;
    dataQuality: "high" | "medium" | "low";
  };
}

export interface StorageResponse {
  success: boolean;
  cid?: string; // IPFS Content Identifier
  filecoinDealId?: string;
  error?: string;
  url?: string;
}

/**
 * Store fitness data package on Lighthouse (IPFS + Filecoin)
 */
export async function storeFitnessData(
  fitnessData: FitnessDataPackage
): Promise<StorageResponse> {
  try {
    console.log("🚀 Storing fitness data on Lighthouse...", {
      userId: fitnessData.userId,
      steps: fitnessData.stepData.stepCount,
      provider: fitnessData.provider,
    });

    // Convert fitness data to JSON string
    const dataString = JSON.stringify(fitnessData, null, 2);
    const dataBlob = new Blob([dataString], { type: "application/json" });

    // Create a File object for Lighthouse upload
    const fileName = `stepdata_${fitnessData.userId}_${fitnessData.timestamp}.json`;
    const file = new File([dataBlob], fileName, { type: "application/json" });

    // Upload to Lighthouse
    const uploadResponse = await lighthouse.upload(file, LIGHTHOUSE_API_KEY);

    if (!uploadResponse || !uploadResponse.data) {
      throw new Error("Failed to upload to Lighthouse");
    }

    const cid = uploadResponse.data.Hash;
    const lighthouseUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;

    console.log("✅ Fitness data stored successfully:", {
      cid,
      url: lighthouseUrl,
      fileName,
    });

    return {
      success: true,
      cid,
      url: lighthouseUrl,
    };
  } catch (error) {
    console.error("❌ Error storing fitness data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown storage error",
    };
  }
}

/**
 * Retrieve fitness data from Lighthouse using CID
 */
export async function retrieveFitnessData(
  cid: string
): Promise<FitnessDataPackage | null> {
  try {
    console.log("📥 Retrieving fitness data from Lighthouse:", cid);

    const response = await fetch(
      `https://gateway.lighthouse.storage/ipfs/${cid}`
    );

    if (!response.ok) {
      throw new Error(`Failed to retrieve data: ${response.statusText}`);
    }

    const fitnessData: FitnessDataPackage = await response.json();

    console.log("✅ Fitness data retrieved successfully:", {
      userId: fitnessData.userId,
      steps: fitnessData.stepData.stepCount,
      date: fitnessData.date,
    });

    return fitnessData;
  } catch (error) {
    console.error("❌ Error retrieving fitness data:", error);
    return null;
  }
}

/**
 * Store aggregated monthly fitness data for analytics
 */
export async function storeMonthlyFitnessReport(
  walletAddress: string,
  monthlyData: {
    month: string; // "2025-10"
    totalSteps: number;
    totalStepCoins: number;
    averageDaily: number;
    bestDay: { date: string; steps: number };
    consistency: number; // percentage of days active
    dataPoints: number; // number of proofs submitted
  }
): Promise<StorageResponse> {
  try {
    const reportData = {
      walletAddress,
      reportType: "monthly-fitness",
      generatedAt: Date.now(),
      ...monthlyData,
    };

    const dataString = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataString], { type: "application/json" });

    const fileName = `monthly_report_${walletAddress.slice(0, 8)}_${
      monthlyData.month
    }.json`;
    const file = new File([dataBlob], fileName, { type: "application/json" });

    const uploadResponse = await lighthouse.upload(file, LIGHTHOUSE_API_KEY);
    const cid = uploadResponse.data.Hash;

    return {
      success: true,
      cid,
      url: `https://gateway.lighthouse.storage/ipfs/${cid}`,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to store monthly report",
    };
  }
}

/**
 * Create encrypted fitness data for privacy
 */
export async function storeEncryptedFitnessData(
  fitnessData: FitnessDataPackage,
  walletAddress: string
): Promise<StorageResponse> {
  try {
    // Encrypt data using Lighthouse encryption
    const dataString = JSON.stringify(fitnessData);

    // Upload encrypted file
    const fileName = `encrypted_stepdata_${fitnessData.userId}_${fitnessData.timestamp}.json`;
    const file = new File([dataString], fileName, { type: "application/json" });

    // Upload with encryption (accessible only by wallet owner)
    const uploadResponse = await lighthouse.uploadEncrypted(
      file,
      LIGHTHOUSE_API_KEY,
      walletAddress // Only this wallet can decrypt
    );

    const cid = uploadResponse.data[0].Hash;

    return {
      success: true,
      cid,
      url: `https://gateway.lighthouse.storage/ipfs/${cid}`,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Encryption storage failed",
    };
  }
}

/**
 * Get user's fitness data history from Lighthouse
 */
export async function getUserFitnessHistory(
  walletAddress: string,
  limit: number = 30
): Promise<string[]> {
  try {
    // This would typically query your backend that indexes Lighthouse CIDs
    // For now, return mock CIDs - in production, you'd have a database mapping wallet -> CIDs

    console.log("📊 Getting fitness history for:", walletAddress);

    // In a real implementation, you'd:
    // 1. Query your backend for CIDs associated with this wallet
    // 2. Return the list of CIDs for fitness data files

    return []; // Return actual CIDs from your indexing system
  } catch (error) {
    console.error("❌ Error getting fitness history:", error);
    return [];
  }
}

/**
 * Utility function to create fitness data package from proof
 */
export function createFitnessDataPackage(
  walletAddress: string,
  stepCount: number,
  provider: string,
  reclaimProofId?: string
): FitnessDataPackage {
  const now = new Date();

  return {
    userId: walletAddress.slice(0, 10), // Anonymized user ID
    walletAddress,
    timestamp: now.getTime(),
    date: now.toISOString().split("T")[0], // YYYY-MM-DD
    stepData: {
      stepCount,
      calories: Math.round(stepCount * 0.04), // Rough calculation
      distance: stepCount * 0.0008, // km estimate
      activeMinutes: Math.round(stepCount / 120), // Rough estimate
    },
    provider,
    reclaimProofId,
    verified: !!reclaimProofId,
    metadata: {
      appVersion: "1.0.0",
      dataQuality:
        stepCount > 1000 ? "high" : stepCount > 500 ? "medium" : "low",
    },
  };
}

/**
 * Lighthouse storage configuration
 */
export const lighthouseConfig = {
  apiKey: LIGHTHOUSE_API_KEY,
  gateway: "https://gateway.lighthouse.storage/ipfs/",
  uploadEndpoint: "https://node.lighthouse.storage/api/v0/add",
  maxFileSize: 100 * 1024 * 1024, // 100MB
  supportedTypes: ["application/json", "text/plain"],
};
