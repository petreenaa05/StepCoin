"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";
import { useState, useEffect } from "react";
import { StatCard } from "../components/ui/StatCard";
import { AchievementsGrid } from "../components/ui/Achievements";
import { Leaderboard } from "../components/ui/Leaderboard";
import { ProofModal } from "../components/ui/ProofModal";
import { Footer } from "../components/ui/Footer";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [stepCount, setStepCount] = useState(8547);
  const [stepCoins, setStepCoins] = useState(127.35);
  const [totalSteps, setTotalSteps] = useState(245680);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "achievements" | "leaderboard"
  >("dashboard");

  // Mock balance for demonstration - you'll replace this with actual token balance
  const { data: balance } = useBalance({
    address: address,
  });

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--primary-black)" }}
    >
      {/* Header */}
      <header
        className="p-6 flex justify-between items-center backdrop-blur-sm border-b"
        style={{
          backgroundColor: "var(--surface-card)",
          borderColor: "var(--surface-border)",
        }}
      >
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "var(--gradient-pink)" }}
          >
            <span className="text-white text-sm font-bold">SC</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-mono">
            StepCoin
          </h1>
        </div>
        <ConnectButton />
      </header>

      {/* Main Content */}
      {!isConnected ? (
        /* Futuristic Landing Page */
        <div className="relative min-h-screen flex items-center overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <h1 className="text-6xl lg:text-8xl font-bold text-white leading-none tracking-tight">
                    FUTURE
                    <br />
                    <span className="text-gradient-pink">FORWARD</span>
                  </h1>

                  <div className="space-y-4 max-w-lg">
                    <p className="text-xl text-white font-light">
                      Innovate. Create.{" "}
                      <span className="text-gradient-pink font-semibold">
                        Elevate
                      </span>{" "}
                      your fitness experience.
                    </p>

                    <p
                      className="text-base leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Transform your daily activities into cryptocurrency
                      rewards with privacy-preserving zero-knowledge proofs
                      powered by cutting-edge blockchain technology.
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    className="group px-10 py-4 border text-white font-medium rounded-full transition-all duration-500 uppercase tracking-widest text-sm hover:shadow-2xl relative overflow-hidden"
                    style={{
                      borderColor: "var(--accent-pink)",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--gradient-pink)";
                      e.currentTarget.style.borderColor = "transparent";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 20px 40px rgba(247, 6, 112, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "var(--accent-pink)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span className="relative z-10">LEARN MORE</span>
                  </button>
                </div>
              </div>

              {/* Right Content - 3D Cube */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  {/* 3D Cube Container */}
                  <div className="relative w-64 h-64">
                    {/* Glow effect */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-60 animate-pulse"
                      style={{
                        background: "var(--gradient-pink)",
                        filter: "blur(20px)",
                        transform: "rotate(12deg) scale(1.1)",
                      }}
                    />

                    {/* Main cube */}
                    <div
                      className="relative w-full h-full rounded-2xl transform rotate-12 transition-transform duration-700 hover:rotate-6"
                      style={{
                        background:
                          "linear-gradient(135deg, #F70670 0%, #E91E63 50%, #AD1457 100%)",
                        boxShadow: `
                          0 0 60px rgba(247, 6, 112, 0.4),
                          inset 0 0 60px rgba(255, 255, 255, 0.1),
                          inset 0 -20px 40px rgba(0, 0, 0, 0.2)
                        `,
                      }}
                    >
                      {/* Inner highlight */}
                      <div
                        className="absolute top-8 left-8 right-8 h-16 rounded-lg opacity-30"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(255, 255, 255, 0.8), transparent)",
                        }}
                      />
                    </div>

                    {/* Reflection */}
                    <div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 w-48 h-12 mt-8 rounded-full opacity-20"
                      style={{
                        background:
                          "radial-gradient(ellipse, #F70670 0%, rgba(247, 6, 112, 0.5) 40%, transparent 70%)",
                        filter: "blur(12px)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Connected Dashboard */
        <main className="container mx-auto px-6 py-12">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 font-mono">
              Welcome back! 👋
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div
              className="backdrop-blur-lg rounded-2xl p-2 flex space-x-2 border"
              style={{
                backgroundColor: "var(--surface-glass)",
                borderColor: "var(--surface-border)",
              }}
            >
              {[
                { id: "dashboard", label: "Dashboard", icon: "📊" },
                { id: "achievements", label: "Achievements", icon: "🏆" },
                { id: "leaderboard", label: "Leaderboard", icon: "🥇" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 font-mono ${
                    activeTab === tab.id
                      ? "text-white shadow-lg"
                      : "hover:text-white"
                  }`}
                  style={
                    activeTab === tab.id
                      ? {
                          background: "var(--gradient-pink)",
                          color: "var(--text-primary)",
                        }
                      : {
                          color: "var(--text-secondary)",
                        }
                  }
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dashboard Content */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6">
                <StatCard
                  title="Steps Today"
                  value={stepCount}
                  subtitle="Today's progress"
                  icon={
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  }
                  color="bg-pink-500"
                  trend={{ value: "+12.5%", isPositive: true }}
                />

                <StatCard
                  title="StepCoins"
                  value={stepCoins.toFixed(2)}
                  subtitle="Total earned"
                  icon={
                    <span className="text-white text-sm font-bold">SC</span>
                  }
                  color="bg-pink-600"
                  trend={{ value: "+85.47", isPositive: true }}
                />

                <StatCard
                  title="Total Steps"
                  value={totalSteps}
                  subtitle="All time"
                  icon={<span className="text-white text-lg">🏃‍♂️</span>}
                  color="bg-pink-700"
                />

                <StatCard
                  title="ETH Balance"
                  value={
                    balance
                      ? parseFloat(balance.formatted).toFixed(4)
                      : "0.0000"
                  }
                  subtitle="Wallet balance"
                  icon={
                    <span className="text-white text-xs font-bold">ETH</span>
                  }
                  color="bg-pink-800"
                />
              </div>

              {/* Prove Steps Section */}
              <div
                className="backdrop-blur-lg rounded-2xl p-8 border"
                style={{
                  backgroundColor: "var(--surface-card)",
                  borderColor: "var(--surface-border)",
                }}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2 font-mono">
                    Prove Your Fitness Activity
                  </h3>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Generate zero-knowledge proofs of your fitness data and earn
                    StepCoins
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => setIsProofModalOpen(true)}
                    className="text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 border font-mono"
                    style={{
                      background: "var(--gradient-pink)",
                      borderColor: "var(--accent-pink)",
                      boxShadow: "0 10px 25px rgba(247, 6, 112, 0.25)",
                    }}
                  >
                    <span className="text-2xl">🔒</span>
                    <span>Generate Fitness Proof</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "achievements" && <AchievementsGrid />}
          {activeTab === "leaderboard" && <Leaderboard />}
        </main>
      )}

      {/* Proof Modal */}
      <ProofModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
