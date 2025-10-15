"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";
import { useState, useEffect } from "react";
import { StatCard } from "../components/ui/StatCard";
import { AchievementsGrid } from "../components/ui/Achievements";
import { Leaderboard } from "../components/ui/Leaderboard";
import { ProofModal } from "../components/ui/ProofModal";
import { Footer } from "../components/ui/Footer";
import TextType from "../components/ui/TextType";
import LiquidEther from "../components/ui/LiquidEther";
import GooeyNav from "../components/ui/GooeyNav";
import { FitnessHistory } from "../components/ui/FitnessHistory";
import ContractTest from "../components/ContractTest";

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
        className="p-6 flex justify-between items-center backdrop-blur-sm relative z-50"
        style={{
          backgroundColor: "#000000",
          borderBottom: "none",
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

        {/* Floating Gooey Navigation - Only show when connected */}
        {isConnected && (
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <GooeyNav
              key={activeTab} // Force re-render when activeTab changes
              items={[
                { label: "📊 Dashboard", href: "#dashboard" },
                { label: "🏆 Achievements", href: "#achievements" },
                { label: "🥇 Leaderboard", href: "#leaderboard" },
              ]}
              particleCount={12}
              particleDistances={[60, 8]}
              particleR={80}
              initialActiveIndex={
                activeTab === "dashboard"
                  ? 0
                  : activeTab === "achievements"
                  ? 1
                  : 2
              }
              animationTime={500}
              timeVariance={250}
              colors={[1, 2, 3, 4]}
              onItemClick={(index) => {
                const tabs = ["dashboard", "achievements", "leaderboard"];
                setActiveTab(tabs[index] as any);
              }}
            />
          </div>
        )}

        <ConnectButton />
      </header>

      {/* Main Content */}
      {!isConnected ? (
        /* Black Background Landing Page with Liquid Animation */
        <div
          className="relative min-h-screen flex items-center overflow-hidden"
          style={{ background: "#000000" }}
        >
          {/* Liquid Ether Background Animation */}
          <div className="absolute inset-0 z-0">
            <LiquidEther
              colors={["#F70670", "#FF6EC7", "#E91E63"]}
              mouseForce={20}
              cursorSize={100}
              isViscous={false}
              viscous={30}
              iterationsViscous={32}
              iterationsPoisson={32}
              resolution={0.5}
              isBounce={false}
              autoDemo={true}
              autoSpeed={0.3}
              autoIntensity={1.8}
              takeoverDuration={0.25}
              autoResumeDelay={3000}
              autoRampDuration={0.6}
            />
          </div>

          {/* Subtle Pink Accent Overlay */}
          <div
            className="absolute inset-0 opacity-10 z-1"
            style={{
              background: `
                radial-gradient(ellipse 60% 40% at 80% 20%, rgba(247, 6, 112, 0.3) 0%, transparent 60%),
                radial-gradient(ellipse 40% 30% at 20% 80%, rgba(233, 30, 99, 0.2) 0%, transparent 50%)
              `,
            }}
          />

          <div className="container mx-auto px-8 relative z-20">
            <div className="max-w-6xl">
              {/* Hero Content - Left Aligned */}
              <div className="space-y-12">
                {/* Main Title */}
                <div className="space-y-6">
                  <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold text-white leading-tight tracking-tight">
                    <TextType
                      text={["Prove Your Fitness,\nClaim Your Rewards"]}
                      typingSpeed={85}
                      pauseDuration={1500}
                      showCursor={true}
                      cursorCharacter="|"
                      as="span"
                      loop={false}
                    />
                  </h1>

                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-white/90 leading-relaxed">
                    No Data Leaks, Only{" "}
                    <span className="text-gradient-pink font-semibold">
                      Healthy Gains.
                    </span>
                  </h2>
                </div>

                {/* Subtitle */}
                <div className="max-w-2xl">
                  <p className="text-lg md:text-xl text-white/80 leading-relaxed font-light">
                    Sync your steps, verify, and earn StepCoin while unlocking
                    medals and achievements. Get fit, join challenges, and win
                    real rewards for activity.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-8">
                  <ConnectButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Connected Dashboard */
        <main className="container mx-auto px-6 py-12 relative">
          {/* Welcome Section */}
          <div className="text-left mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 font-mono">
              Welcome back! 👋
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>

          {/* Main Content Area */}
          <div className="min-h-screen">
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
                      Generate zero-knowledge proofs of your fitness data and
                      earn StepCoins
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

                {/* Fitness History Section */}
                <FitnessHistory walletAddress={address} />

                {/* Smart Contract Test Panel */}
                <ContractTest />
              </div>
            )}

            {activeTab === "achievements" && <AchievementsGrid />}
            {activeTab === "leaderboard" && <Leaderboard />}
          </div>
        </main>
      )}

      {/* Proof Modal */}
      <ProofModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        onProofSuccess={(stepCount, reward) => {
          // Update step count and StepCoins from the verified proof
          setStepCount(stepCount);
          setStepCoins((prev) => prev + reward.stepCoins);
          setTotalSteps((prev) => prev + stepCount);

          console.log("✅ Updated stats from proof:", { stepCount, reward });
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
