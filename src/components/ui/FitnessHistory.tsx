import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";

interface FitnessHistoryProps {
  walletAddress?: string;
}

interface StoredFitnessData {
  cid: string;
  date: string;
  stepCount: number;
  stepCoins: number;
  provider: string;
  verified: boolean;
  url: string;
}

export const FitnessHistory: React.FC<FitnessHistoryProps> = ({
  walletAddress,
}) => {
  const { address } = useAccount();
  const [fitnessHistory, setFitnessHistory] = useState<StoredFitnessData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userAddress = walletAddress || address;

  const loadFitnessHistory = async () => {
    if (!userAddress) return;

    setLoading(true);
    setError("");

    try {
      // In a real implementation, you'd query your backend for CIDs associated with this wallet
      // For demo purposes, we'll show mock data
      const mockHistory: StoredFitnessData[] = [
        {
          cid: "QmX1YZ2ABC123...",
          date: "2025-10-14",
          stepCount: 12000,
          stepCoins: 240,
          provider: "Google Fit",
          verified: true,
          url: "https://gateway.lighthouse.storage/ipfs/QmX1YZ2ABC123...",
        },
        {
          cid: "QmX1YZ2DEF456...",
          date: "2025-10-13",
          stepCount: 8500,
          stepCoins: 127.5,
          provider: "Apple Health",
          verified: true,
          url: "https://gateway.lighthouse.storage/ipfs/QmX1YZ2DEF456...",
        },
        {
          cid: "QmX1YZ2GHI789...",
          date: "2025-10-12",
          stepCount: 15000,
          stepCoins: 375,
          provider: "Fitbit",
          verified: true,
          url: "https://gateway.lighthouse.storage/ipfs/QmX1YZ2GHI789...",
        },
      ];

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFitnessHistory(mockHistory);
    } catch (err) {
      setError("Failed to load fitness history");
      console.error("❌ Error loading fitness history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userAddress) {
      loadFitnessHistory();
    }
  }, [userAddress]);

  const viewOnIPFS = (url: string) => {
    window.open(url, "_blank");
  };

  if (!userAddress) {
    return (
      <div className="text-center py-8">
        <p style={{ color: "var(--text-secondary)" }} className="font-mono">
          Connect your wallet to view fitness history
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white font-mono">
          📊 Fitness Data History
        </h3>
        <button
          onClick={loadFitnessHistory}
          disabled={loading}
          className="px-4 py-2 rounded-xl font-mono text-sm transition-colors"
          style={{
            backgroundColor: "var(--surface-card)",
            borderColor: "var(--surface-border)",
            color: "var(--text-secondary)",
          }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <span
              style={{ color: "var(--text-secondary)" }}
              className="font-mono"
            >
              Loading fitness history from Lighthouse...
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          className="backdrop-blur-lg rounded-2xl p-4 border"
          style={{
            backgroundColor: "rgba(220, 38, 38, 0.1)",
            borderColor: "rgba(220, 38, 38, 0.3)",
          }}
        >
          <p className="text-red-400 text-sm font-mono">❌ {error}</p>
        </div>
      )}

      {/* Fitness History List */}
      {!loading && !error && (
        <div className="space-y-3">
          {fitnessHistory.length === 0 ? (
            <div
              className="text-center py-8 backdrop-blur-lg rounded-2xl border"
              style={{
                backgroundColor: "var(--surface-card)",
                borderColor: "var(--surface-border)",
              }}
            >
              <p
                style={{ color: "var(--text-secondary)" }}
                className="font-mono"
              >
                No fitness data found. Generate your first proof to see history
                here.
              </p>
            </div>
          ) : (
            fitnessHistory.map((data, index) => (
              <div
                key={data.cid}
                className="backdrop-blur-lg rounded-2xl p-4 border transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: "var(--surface-card)",
                  borderColor: "var(--surface-border)",
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-white font-semibold font-mono">
                        {data.date}
                      </h4>
                      {data.verified && (
                        <span
                          className="text-xs px-2 py-1 rounded-full font-mono"
                          style={{
                            backgroundColor: "var(--accent-pink)",
                            color: "white",
                          }}
                        >
                          ✅ Verified
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p
                          style={{ color: "var(--text-secondary)" }}
                          className="font-mono"
                        >
                          Steps
                        </p>
                        <p className="text-white font-semibold font-mono">
                          {new Intl.NumberFormat().format(data.stepCount)}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{ color: "var(--text-secondary)" }}
                          className="font-mono"
                        >
                          Earned
                        </p>
                        <p
                          className="font-semibold font-mono"
                          style={{ color: "var(--accent-pink)" }}
                        >
                          {data.stepCoins} SC
                        </p>
                      </div>
                      <div>
                        <p
                          style={{ color: "var(--text-secondary)" }}
                          className="font-mono"
                        >
                          Provider
                        </p>
                        <p className="text-white font-mono">{data.provider}</p>
                      </div>
                      <div>
                        <p
                          style={{ color: "var(--text-secondary)" }}
                          className="font-mono"
                        >
                          Storage
                        </p>
                        <p className="text-white font-mono">Lighthouse IPFS</p>
                      </div>
                    </div>

                    <div
                      className="text-xs font-mono"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      CID: {data.cid.slice(0, 20)}...{data.cid.slice(-10)}
                    </div>
                  </div>

                  <button
                    onClick={() => viewOnIPFS(data.url)}
                    className="px-3 py-2 rounded-lg text-xs font-mono transition-colors"
                    style={{
                      backgroundColor: "var(--accent-pink)",
                      color: "white",
                    }}
                  >
                    📋 View Data
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Info Section */}
      <div
        className="backdrop-blur-lg rounded-2xl p-4 border"
        style={{
          backgroundColor: "var(--surface-card)",
          borderColor: "var(--surface-border)",
        }}
      >
        <h4 className="text-white font-semibold font-mono mb-3">
          🔒 Privacy & Storage
        </h4>
        <div
          className="space-y-2 text-sm font-mono"
          style={{ color: "var(--text-secondary)" }}
        >
          <p>• Your fitness data is stored on IPFS via Lighthouse Protocol</p>
          <p>
            • Data is cryptographically verified using Reclaim zero-knowledge
            proofs
          </p>
          <p>• All data is decentralized and cannot be censored or lost</p>
          <p>• You own your data - access it anytime via IPFS CID</p>
        </div>
      </div>
    </div>
  );
};
