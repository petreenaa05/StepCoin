/**
 * Test script for Lighthouse integration
 * Run with: node test-lighthouse.js
 */

const lighthouse = require("@lighthouse-web3/sdk");

// Your API key
const API_KEY = "1ee10db0.af881f422a5e4194b8ccc6b655ca30b2";

async function testLighthouseIntegration() {
  console.log("🚀 Testing StepCoin Lighthouse Integration...\n");

  try {
    // Test 1: Create sample fitness data
    const sampleFitnessData = {
      userId: "test_user_123",
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      timestamp: Date.now(),
      date: new Date().toISOString().split("T")[0],
      stepData: {
        stepCount: 12000,
        calories: 480,
        distance: 9.6,
        activeMinutes: 100,
      },
      provider: "google-fit-steps",
      reclaimProofId: "test_proof_" + Date.now(),
      verified: true,
      metadata: {
        appVersion: "1.0.0",
        dataQuality: "high",
      },
    };

    console.log("📊 Sample Fitness Data:", sampleFitnessData);
    console.log("\n1️⃣ Creating test file...");

    // Convert to JSON and create file
    const dataString = JSON.stringify(sampleFitnessData, null, 2);
    const fileName = `test_stepdata_${Date.now()}.json`;

    // Create a text file (Node.js compatible)
    const fs = require("fs");
    const path = require("path");

    // Write to temporary file
    const tempFilePath = path.join(__dirname, fileName);
    fs.writeFileSync(tempFilePath, dataString);

    console.log("✅ Test file created:", fileName);
    console.log("\n2️⃣ Uploading to Lighthouse...");

    // Upload to Lighthouse
    const uploadResponse = await lighthouse.upload(tempFilePath, API_KEY);

    if (!uploadResponse || !uploadResponse.data) {
      throw new Error("Upload failed - no response data");
    }

    const cid = uploadResponse.data.Hash;
    const lighthouseUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;

    console.log("✅ Upload successful!");
    console.log("📝 File Details:");
    console.log(`   • CID: ${cid}`);
    console.log(`   • Size: ${uploadResponse.data.Size} bytes`);
    console.log(`   • URL: ${lighthouseUrl}`);

    console.log("\n3️⃣ Testing retrieval...");

    // Test retrieval
    const response = await fetch(lighthouseUrl);

    if (!response.ok) {
      throw new Error(`Retrieval failed: ${response.statusText}`);
    }

    const retrievedData = await response.json();
    console.log("✅ Data retrieved successfully!");
    console.log("📊 Retrieved Data Sample:", {
      stepCount: retrievedData.stepData.stepCount,
      provider: retrievedData.provider,
      verified: retrievedData.verified,
    });

    console.log("\n4️⃣ Testing file info...");

    // Get file info
    const fileInfo = await lighthouse.getFileInfo(cid);
    console.log("📋 File Info:", {
      fileName: fileInfo.fileName,
      mimeType: fileInfo.mimeType,
      fileSize: fileInfo.fileSize,
    });

    // Clean up temporary file
    fs.unlinkSync(tempFilePath);
    console.log("\n🧹 Cleaned up temporary file");

    console.log("\n🎉 LIGHTHOUSE INTEGRATION TEST SUCCESSFUL! 🎉");
    console.log("\n📋 Summary:");
    console.log(`   • API Key: Valid ✅`);
    console.log(`   • Upload: Working ✅`);
    console.log(`   • Storage: IPFS/Filecoin ✅`);
    console.log(`   • Retrieval: Working ✅`);
    console.log(`   • StepCoin Ready: YES ✅`);

    console.log("\n🔗 Your fitness data is now stored permanently on IPFS!");
    console.log(`   View at: ${lighthouseUrl}`);

    return {
      success: true,
      cid,
      url: lighthouseUrl,
    };
  } catch (error) {
    console.error("\n❌ LIGHTHOUSE TEST FAILED:", error.message);
    console.error("🔍 Details:", error);

    // Common error solutions
    console.log("\n💡 Troubleshooting:");
    console.log("   • Check API key is correct");
    console.log("   • Ensure internet connection");
    console.log("   • Verify Lighthouse service status");

    return {
      success: false,
      error: error.message,
    };
  }
}

// Run the test
testLighthouseIntegration()
  .then((result) => {
    if (result.success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("Test script error:", err);
    process.exit(1);
  });
