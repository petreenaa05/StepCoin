/**
 * API endpoint for Lighthouse storage operations
 * Handles storing and retrieving fitness data on IPFS/Filecoin
 */

import { NextRequest, NextResponse } from "next/server";
import {
  storeFitnessData,
  retrieveFitnessData,
  createFitnessDataPackage,
  storeMonthlyFitnessReport,
  FitnessDataPackage,
} from "../../../lib/lighthouse";

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case "store_fitness_data": {
        const { walletAddress, stepCount, provider, reclaimProofId } = data;

        // Create fitness data package
        const fitnessPackage = createFitnessDataPackage(
          walletAddress,
          stepCount,
          provider,
          reclaimProofId
        );

        // Store on Lighthouse
        const result = await storeFitnessData(fitnessPackage);

        return NextResponse.json({
          success: result.success,
          cid: result.cid,
          url: result.url,
          error: result.error,
          fitnessData: fitnessPackage,
        });
      }

      case "store_monthly_report": {
        const { walletAddress, monthlyData } = data;

        const result = await storeMonthlyFitnessReport(
          walletAddress,
          monthlyData
        );

        return NextResponse.json({
          success: result.success,
          cid: result.cid,
          url: result.url,
          error: result.error,
        });
      }

      case "retrieve_fitness_data": {
        const { cid } = data;

        const fitnessData = await retrieveFitnessData(cid);

        return NextResponse.json({
          success: !!fitnessData,
          data: fitnessData,
          error: !fitnessData ? "Failed to retrieve fitness data" : undefined,
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("❌ Lighthouse API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get("cid");

    if (!cid) {
      return NextResponse.json(
        { error: "CID parameter is required" },
        { status: 400 }
      );
    }

    // Retrieve fitness data by CID
    const fitnessData = await retrieveFitnessData(cid);

    if (!fitnessData) {
      return NextResponse.json(
        { error: "Fitness data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: fitnessData,
    });
  } catch (error) {
    console.error("❌ Lighthouse GET error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve fitness data" },
      { status: 500 }
    );
  }
}
