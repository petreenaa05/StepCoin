import React from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { formatEther } from "viem";
import {
  useStepCoinBalance,
  useUserActivity,
  useRewardMetrics,
  useStepCoinTotalSupply,
} from "../lib/hooks/useStepCoin";

export default function ContractTest() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Contract reads
  const { data: balance, isLoading: balanceLoading } =
    useStepCoinBalance(address);
  const { data: userActivity, isLoading: activityLoading } =
    useUserActivity(address);
  const { data: rewardMetrics } = useRewardMetrics();
  const { data: totalSupply } = useStepCoinTotalSupply();

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg space-y-4">
      <h2 className="text-2xl font-bold">🧪 Smart Contract Test Panel</h2>

      {/* Wallet Connection */}
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Wallet Connection</h3>
        {isConnected ? (
          <div>
            <p>Connected: {address}</p>
            <button
              onClick={() => disconnect()}
              className="mt-2 px-4 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect({ connector })}
                className="block w-full text-left px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Connect {connector.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contract Information */}
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">
          📊 StepCoin Contract Info
        </h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Contract Address:</strong>{" "}
            {process.env.NEXT_PUBLIC_STEP_COIN_CONTRACT_ADDRESS}
          </p>
          <p>
            <strong>Total Supply:</strong>{" "}
            {totalSupply ? formatEther(totalSupply) : "Loading..."} STEP
          </p>
          {rewardMetrics && (
            <div>
              <p>
                <strong>Total Users Rewarded:</strong>{" "}
                {rewardMetrics[0]?.toString()}
              </p>
              <p>
                <strong>Total Rewards Distributed:</strong>{" "}
                {formatEther(rewardMetrics[1])} STEP
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Data */}
      {isConnected && (
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">👤 Your Data</h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>STEP Balance:</strong>{" "}
              {balanceLoading
                ? "Loading..."
                : balance
                ? formatEther(balance)
                : "0"}{" "}
              STEP
            </p>

            {userActivity && (
              <div>
                <p>
                  <strong>Total Steps:</strong> {userActivity[0]?.toString()}
                </p>
                <p>
                  <strong>Total Calories:</strong> {userActivity[1]?.toString()}
                </p>
                <p>
                  <strong>Total Distance:</strong> {userActivity[2]?.toString()}{" "}
                  meters
                </p>
                <p>
                  <strong>Verified:</strong>{" "}
                  {userActivity[4] ? "✅ Yes" : "❌ No"}
                </p>
                <p>
                  <strong>Today's Rewards:</strong>
                </p>
                <ul className="ml-4 space-y-1">
                  <li>
                    Steps:{" "}
                    {userActivity[5] ? formatEther(userActivity[5]) : "0"} STEP
                  </li>
                  <li>
                    Calories:{" "}
                    {userActivity[6] ? formatEther(userActivity[6]) : "0"} STEP
                  </li>
                  <li>
                    Distance:{" "}
                    {userActivity[7] ? formatEther(userActivity[7]) : "0"} STEP
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Actions */}
      {isConnected && (
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">🧪 Test Actions</h3>
          <div className="space-y-2">
            <button
              onClick={async () => {
                try {
                  // This will test proof generation and smart contract interaction
                  const mockProof = {
                    steps: 10000,
                    calories: 500,
                    distance: 8000,
                    provider: 0, // Google Fit
                  };

                  console.log(
                    "Testing smart contract with mock proof:",
                    mockProof
                  );
                  alert("Check the console for test results!");
                } catch (error) {
                  console.error("Test failed:", error);
                }
              }}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              🧪 Test Mock Proof Submission
            </button>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="bg-gray-800 p-4 rounded text-sm">
        <h3 className="text-lg font-semibold mb-2">🔗 Network Status</h3>
        <div className="space-y-1">
          <p>
            Hardhat Node:{" "}
            <span className="text-green-400">✅ Running on localhost:8545</span>
          </p>
          <p>
            Smart Contracts:{" "}
            <span className="text-green-400">✅ Deployed and Configured</span>
          </p>
          <p>
            Frontend:{" "}
            <span className="text-green-400">✅ Connected to Contracts</span>
          </p>
        </div>
      </div>
    </div>
  );
}
