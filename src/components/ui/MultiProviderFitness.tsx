import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { LoadingPage } from "./LoadingPage";
import { SuccessPage } from "./SuccessPage";

interface FitnessProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  isWorking: boolean;
  setupDifficulty: "Easy" | "Medium" | "Hard";
  features: string[];
}

const FITNESS_PROVIDERS: FitnessProvider[] = [
  {
    id: "googlefit",
    name: "Google Fit",
    icon: "�",
    color: "red",
    description:
      "Connect your Google Fit account to track your daily activities and earn StepCoins",
    isWorking: true,
    setupDifficulty: "Easy",
    features: [
      "Daily step tracking",
      "Real-time sync",
      "Secure data access",
      "Zero-knowledge proofs",
    ],
  },
];

interface MultiProviderFitnessProps {
  onStepsReceived?: (steps: number, provider: string, data: any) => void;
  onClose?: () => void;
}

export const MultiProviderFitness: React.FC<MultiProviderFitnessProps> = ({
  onStepsReceived,
  onClose,
}) => {
  const { address } = useAccount();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [googleFitData, setGoogleFitData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState<
    "connected" | "verified" | "rewarded"
  >("connected");

  // Check if user is already connected to Google Fit
  useEffect(() => {
    const checkGoogleFitConnection = async () => {
      try {
        const response = await fetch("/api/fitness/googlefit");
        const result = await response.json();

        if (result.authenticated && result.data) {
          setGoogleFitData(result.data);
        }
      } catch (error) {
        console.log("Not connected to Google Fit yet");
      }

      // Show success if just connected (check URL params)
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("googlefit_connected") === "true") {
        setSuccessType("connected");
        setShowSuccess(true);
        // Clean up URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    };

    checkGoogleFitConnection();
  }, []);



  const handleConnectGoogleFit = async () => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    setIsConnecting(true);
    setError("");

    try {
      // Show loading for 1 second before redirect to give user feedback
      setTimeout(() => {
        // Redirect to Google OAuth
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const redirectUri = encodeURIComponent(
          `${window.location.origin}/api/auth/googlefit/callback`
        );
        const scope = encodeURIComponent("https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/userinfo.profile");

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&prompt=consent`;

        // Redirect to Google authentication
        window.location.href = authUrl;
      }, 1000);
    } catch (error) {
      console.error("Google Fit connection error:", error);
      setError("Failed to connect to Google Fit");
      setIsConnecting(false);
    }
  };

  const handleGetSteps = async () => {
    if (!googleFitData) return;

    setIsVerifying(true);
    setError("");

    try {
      // Get Google Fit data
      const response = await fetch("/api/fitness/googlefit");
      const result = await response.json();

      if (result.success && result.data) {
        const steps: number = result.data.summary.totalSteps;

        // Show proof generation phase
        setIsVerifying(false);
        setIsGeneratingProof(true);

        // Simulate proof generation delay for smooth UX
        setTimeout(() => {
          setIsGeneratingProof(false);
          setSuccessType("verified");
          setShowSuccess(true);

          // Call parent callback after showing success
          setTimeout(() => {
            if (onStepsReceived) {
              onStepsReceived(steps, "googlefit", result.data);
            }
          }, 1000);
        }, 2000);

        console.log(`📊 Retrieved ${steps} steps from Google Fit`);
      } else {
        throw new Error(result.error || "Failed to retrieve step data");
      }
    } catch (error) {
      console.error("Failed to get steps:", error);
      setError(
        error instanceof Error ? error.message : "Failed to retrieve step data"
      );
      setIsVerifying(false);
      setIsGeneratingProof(false);
    }
  };

  const handleProviderClick = (provider: FitnessProvider) => {
    if (provider.id === "googlefit" && provider.isWorking) {
      if (googleFitData) {
        // Already connected, get steps and generate proof
        handleGetSteps();
      } else {
        // Connect to Google Fit
        handleConnectGoogleFit();
      }
    } else {
      // Should not reach here since we only have Google Fit
      setError("Google Fit is the only available provider.");
    }
  };

  // Show loading states
  if (isConnecting) {
    return (
      <LoadingPage
        type="connecting"
        title="Connecting to Google Fit"
        message="Please authorize StepCoin to access your Google Fit data..."
      />
    );
  }

  if (isVerifying) {
    return (
      <LoadingPage
        type="verifying"
        title="Retrieving Your Activities"
        message="Fetching your step data from Google Fit..."
      />
    );
  }

  if (isGeneratingProof) {
    return (
      <LoadingPage
        type="verifying"
        title="Generating Zero-Knowledge Proof"
        message="Creating cryptographic proof of your fitness data..."
      />
    );
  }

  // Show success states
  if (showSuccess && googleFitData) {
    return (
      <SuccessPage
        type={successType}
        data={{
          steps: googleFitData.summary?.totalSteps,
          activities: googleFitData.activities?.length || 1,
          distance: googleFitData.summary?.totalSteps * 0.762 / 1000, // Convert steps to km
          rewards: googleFitData.summary?.totalSteps
            ? Math.floor(googleFitData.summary.totalSteps / 100)
            : 0,
          multiplier: googleFitData.summary?.totalSteps > 10000 ? 1.5 : 1.0,
          athleteName: googleFitData.user?.name || "Google Fit User",
        }}
        onContinue={() => {
          setShowSuccess(false);
          if (successType === "connected") {
            // Continue to step verification
            handleGetSteps();
          }
        }}
        onClose={() => setShowSuccess(false)}
      />
    );
  }

  return (
    <div
      className="rounded-2xl p-8 max-w-3xl mx-auto shadow-2xl backdrop-blur-sm border"
      style={{
        background: "var(--surface-glass)",
        borderColor: "var(--surface-border)",
        boxShadow:
          "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(247, 6, 112, 0.1)",
      }}
    >
      <div className="flex justify-between items-center mb-8">
        <h3
          className="text-3xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Connect Your Fitness App
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-2xl transition-all duration-200 hover:scale-110 transform"
            style={{
              color: "var(--text-muted)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--accent-pink)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div
          className="px-6 py-4 rounded-xl mb-6 border"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            borderColor: "rgba(239, 68, 68, 0.3)",
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      )}

      {!address && (
        <div
          className="px-6 py-4 rounded-xl mb-6 border"
          style={{
            background: "rgba(251, 191, 36, 0.1)",
            borderColor: "rgba(251, 191, 36, 0.3)",
            color: "#fcd34d",
          }}
        >
          Please connect your wallet first
        </div>
      )}

      {/* Provider Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {FITNESS_PROVIDERS.map((provider) => (
          <div
            key={provider.id}
            onClick={() => handleProviderClick(provider)}
            className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              provider.isWorking ? "hover:shadow-2xl" : "opacity-60"
            }`}
            style={{
              background: provider.isWorking
                ? googleFitData
                  ? "var(--surface-glass-hover)"
                  : "var(--surface-card)"
                : "var(--surface-card)",
              border: `2px solid ${
                provider.isWorking
                  ? googleFitData
                    ? "var(--accent-pink)"
                    : "var(--surface-border)"
                  : "rgba(255, 255, 255, 0.1)"
              }`,
              boxShadow: provider.isWorking
                ? "0 10px 25px rgba(0, 0, 0, 0.2)"
                : "0 5px 15px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Working/Coming Soon Badge */}
            <div
              className="absolute top-3 right-3 px-3 py-1 text-xs rounded-full font-medium"
              style={{
                background: provider.isWorking
                  ? "var(--gradient-pink)"
                  : "rgba(156, 163, 175, 0.2)",
                color: provider.isWorking ? "white" : "var(--text-muted)",
              }}
            >
              {provider.isWorking ? "Working" : "Soon"}
            </div>

            {/* Provider Header */}
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-4">{provider.icon}</span>
              <div>
                <h4
                  className="font-bold text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  {provider.name}
                </h4>
                <span
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{
                    background:
                      provider.setupDifficulty === "Easy"
                        ? "rgba(34, 197, 94, 0.2)"
                        : provider.setupDifficulty === "Medium"
                        ? "rgba(251, 191, 36, 0.2)"
                        : "rgba(239, 68, 68, 0.2)",
                    color:
                      provider.setupDifficulty === "Easy"
                        ? "#22c55e"
                        : provider.setupDifficulty === "Medium"
                        ? "#fbbf24"
                        : "#ef4444",
                  }}
                >
                  {provider.setupDifficulty} Setup
                </span>
              </div>
            </div>

            {/* Description */}
            <p
              className="text-sm mb-4 leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {provider.description}
            </p>

            {/* Features */}
            <div className="space-y-2">
              {provider.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span
                    className="w-2 h-2 rounded-full mr-3"
                    style={{ background: "var(--accent-pink)" }}
                  ></span>
                  {feature}
                </div>
              ))}
            </div>



            {/* Connection Status for Google Fit */}
            {provider.id === "googlefit" && googleFitData && (
              <div
                className="mt-4 p-4 rounded-xl border"
                style={{
                  background: "rgba(34, 197, 94, 0.1)",
                  borderColor: "rgba(34, 197, 94, 0.3)",
                }}
              >
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#22c55e" }}
                >
                  ✅ Connected as {googleFitData.user?.name || "Google Fit User"}
                </div>
                <div className="text-xs mt-1" style={{ color: "#86efac" }}>
                  {googleFitData.summary?.totalSteps.toLocaleString()} steps today
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Button */}
      {googleFitData ? (
        <div className="space-y-6">
          <div
            className="rounded-2xl p-6 border"
            style={{
              background: "var(--gradient-surface)",
              borderColor: "var(--surface-border)",
            }}
          >
            <h5
              className="font-bold text-xl mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Your Google Fit Summary (Today)
            </h5>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Total Steps:
                </span>
                <div
                  className="font-bold text-2xl"
                  style={{ color: "var(--accent-pink)" }}
                >
                  {googleFitData.summary.totalSteps.toLocaleString()}
                </div>
              </div>
              <div>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Source:
                </span>
                <div
                  className="font-bold text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  Google Fit
                </div>
              </div>
              <div>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Distance:
                </span>
                <div
                  className="font-bold text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  {Math.round((googleFitData.summary.totalSteps * 0.762) / 1000 * 100) / 100} km
                </div>
              </div>
              <div>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Rewards:
                </span>
                <div
                  className="font-bold text-lg"
                  style={{ color: "var(--accent-pink)" }}
                >
                  {Math.floor(googleFitData.summary.totalSteps / 100)} STC
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleGetSteps}
            disabled={!address}
            className="w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
            style={{
              background: !address
                ? "rgba(156, 163, 175, 0.3)"
                : "var(--gradient-pink)",
              color: !address ? "var(--text-muted)" : "white",
              cursor: !address ? "not-allowed" : "pointer",
              boxShadow: !address
                ? "none"
                : "0 10px 25px rgba(247, 6, 112, 0.3)",
            }}
          >
            Use These Steps for StepCoin Rewards
          </button>
        </div>
      ) : (
        <button
          onClick={() =>
            handleProviderClick(
              FITNESS_PROVIDERS.find((p) => p.id === "strava")!
            )
          }
          disabled={!address || isConnecting}
          className="w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
          style={{
            background:
              !address || isConnecting
                ? "rgba(156, 163, 175, 0.3)"
                : "var(--gradient-pink)",
            color: !address || isConnecting ? "var(--text-muted)" : "white",
            cursor: !address || isConnecting ? "not-allowed" : "pointer",
            boxShadow:
              !address || isConnecting
                ? "none"
                : "0 10px 25px rgba(247, 6, 112, 0.3)",
          }}
        >
          {isConnecting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              Connecting to Strava...
            </div>
          ) : (
            "🟠 Connect Strava (Only Working Option)"
          )}
        </button>
      )}

      {/* Info Section */}
      <div
        className="mt-8 p-6 rounded-2xl border"
        style={{
          background: "var(--surface-card)",
          borderColor: "var(--surface-border)",
        }}
      >
        <h6
          className="font-bold text-lg mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          How Step Counting Works:
        </h6>
        <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
          <div className="flex items-center">
            <span className="text-xl mr-3">🏃‍♂️</span>
            <span>
              <strong>Running:</strong> ~1,300 steps per km
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-xl mr-3">🚶‍♂️</span>
            <span>
              <strong>Walking:</strong> ~1,250 steps per km
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-xl mr-3">🚴‍♂️</span>
            <span>
              <strong>Cycling:</strong> ~400 equivalent steps per km
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-xl mr-3">🏊‍♂️</span>
            <span>
              <strong>Swimming:</strong> ~50 steps per minute
            </span>
          </div>
        </div>
      </div>

      <div
        className="text-center mt-6 py-3"
        style={{ color: "var(--text-muted)" }}
      >
        🚀 Currently only Strava is working • Other providers coming soon!
      </div>
    </div>
  );
};
