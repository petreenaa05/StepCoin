import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useStravaIntegration } from "../../lib/stravaIntegration";

interface StravaProofGeneratorProps {
  onProofComplete?: (
    fitnessScore: number,
    reward: { stepCoins: number; multiplier: number }
  ) => void;
  onClose?: () => void;
}

export const StravaProofGenerator: React.FC<StravaProofGeneratorProps> = ({
  onProofComplete,
  onClose,
}) => {
  const { address } = useAccount();
  const [isConnecting, setIsConnecting] = useState(false);
  const [fitnessData, setFitnessData] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const stravaIntegration = useStravaIntegration();

  const handleConnectStrava = async () => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    setIsConnecting(true);
    setError("");

    try {
      console.log("🎯 Connecting to Strava...");

      const proofData = await stravaIntegration.connectAndProve();

      if (proofData) {
        setFitnessData(proofData);

        // Calculate reward based on fitness score
        const reward = {
          stepCoins: Math.floor(proofData.fitnessScore / 10),
          multiplier: proofData.activitiesCount > 5 ? 1.5 : 1.0,
        };

        console.log("✅ Strava proof generated successfully!");
        console.log("📊 Fitness score:", proofData.fitnessScore);
        console.log("💰 Reward:", reward);

        if (onProofComplete) {
          onProofComplete(proofData.fitnessScore, reward);
        }
      }
    } catch (error) {
      console.error("❌ Strava connection error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to connect to Strava"
      );
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Connect Your Fitness
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!address && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
          Please connect your wallet first
        </div>
      )}

      {!fitnessData ? (
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M15.387 17.944l-2.089-4.116h-2.597L9.613 17.944H7.824l3.464-6.876H8.613V9.356h6.774v1.712h-2.675l3.464 6.876h-1.789z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">
              Connect Strava
            </h4>
            <p className="text-gray-600 text-sm mb-6">
              Connect your Strava account to verify your fitness activities and
              earn StepCoin rewards based on your real workout data.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h5 className="font-medium text-gray-800 mb-2">
              What we'll track:
            </h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Running, cycling, and walking activities</li>
              <li>• Distance and duration</li>
              <li>• Recent 7 days of activities</li>
              <li>• Achievement count for bonuses</li>
            </ul>
          </div>

          <button
            onClick={handleConnectStrava}
            disabled={!address || isConnecting}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              !address || isConnecting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700 text-white"
            }`}
          >
            {isConnecting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Connecting to Strava...
              </div>
            ) : (
              "Connect Strava Account"
            )}
          </button>

          <div className="text-xs text-gray-500 text-center">
            Powered by Strava API • Secure OAuth Authentication
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">
              Strava Connected!
            </h4>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-medium text-green-800 mb-2">
              Fitness Summary:
            </h5>
            <div className="text-sm text-green-700 space-y-1">
              <div>
                Fitness Score:{" "}
                <span className="font-bold">{fitnessData.fitnessScore}</span>
              </div>
              <div>
                Activities (7 days):{" "}
                <span className="font-bold">{fitnessData.activitiesCount}</span>
              </div>
              <div>
                Weekly Distance:{" "}
                <span className="font-bold">
                  {Math.floor(fitnessData.weeklyDistance / 1000)} km
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-800 mb-2">Rewards Earned:</h5>
            <div className="text-sm text-blue-700">
              <div>
                StepCoin Tokens:{" "}
                <span className="font-bold">
                  {Math.floor(fitnessData.fitnessScore / 10)}
                </span>
              </div>
              <div>
                Multiplier:{" "}
                <span className="font-bold">
                  {fitnessData.activitiesCount > 5 ? "1.5x" : "1.0x"}
                </span>
              </div>
            </div>
          </div>

          {stravaIntegration.isConfirming && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              Confirming transaction on blockchain...
            </div>
          )}

          {stravaIntegration.isSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              ✅ Rewards successfully distributed to your wallet!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
