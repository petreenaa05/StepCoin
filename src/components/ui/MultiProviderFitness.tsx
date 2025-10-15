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
    id: "strava",
    name: "Strava",
    icon: "🟠",
    color: "orange",
    description:
      "Connect your Strava account to track running, cycling, and walking activities",
    isWorking: true,
    setupDifficulty: "Easy",
    features: [
      "Running steps",
      "Walking distance",
      "Cycling equivalent",
      "All device sync",
    ],
  },
  {
    id: "googlefit",
    name: "Google Fit",
    icon: "🔴",
    color: "red",
    description:
      "Google Fit integration for Android users with comprehensive step tracking",
    isWorking: false, // We'll implement this next
    setupDifficulty: "Medium",
    features: [
      "Daily steps",
      "Heart rate",
      "Multiple devices",
      "Android integration",
    ],
  },
  {
    id: "applehealth",
    name: "Apple Health",
    icon: "❤️",
    color: "pink",
    description:
      "Apple HealthKit integration for iOS users and Apple Watch data",
    isWorking: false, // Future implementation
    setupDifficulty: "Hard",
    features: ["iPhone steps", "Apple Watch", "Health metrics", "iOS only"],
  },
  {
    id: "fitbit",
    name: "Fitbit",
    icon: "💙",
    color: "blue",
    description:
      "Fitbit device integration for accurate step and activity tracking",
    isWorking: false, // Future implementation
    setupDifficulty: "Medium",
    features: [
      "Device steps",
      "24/7 tracking",
      "Sleep data",
      "Heart rate zones",
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
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [stravaData, setStravaData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState<
    "connected" | "verified" | "rewarded"
  >("connected");

  // Check if user is already connected to Strava
  useEffect(() => {
    const checkStravaConnection = async () => {
      try {
        const response = await fetch("/api/fitness/strava");
        const result = await response.json();

        if (result.authenticated && result.data) {
          setStravaData(result.data);
          setSelectedProvider("strava");

          // Show success if just connected (check URL params)
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get("strava_connected") === "true") {
            setSuccessType("connected");
            setShowSuccess(true);
            // Clean up URL
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          }
        }
      } catch (error) {
        console.log("Not connected to Strava yet");
      }
    };

    checkStravaConnection();
  }, []);

  const handleConnectStrava = async () => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    setIsConnecting(true);
    setError("");

    try {
      // Show loading for 1 second before redirect to give user feedback
      setTimeout(() => {
        // Redirect to Strava OAuth
        const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
        const redirectUri = encodeURIComponent(
          `${window.location.origin}/api/auth/strava/callback`
        );
        const scope = "read,activity:read_all";

        const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=${scope}`;

        // Redirect to Strava authentication
        window.location.href = authUrl;
      }, 1000);
    } catch (error) {
      console.error("Strava connection error:", error);
      setError("Failed to connect to Strava");
      setIsConnecting(false);
    }
  };

  const handleGetSteps = async () => {
    if (!stravaData) return;

    setIsVerifying(true);
    setError("");

    try {
      // Get updated step data
      const response = await fetch("/api/fitness/strava");
      const result = await response.json();

      if (result.success && result.data) {
        const steps = result.data.summary.totalSteps;

        // Show success page first
        setSuccessType("verified");
        setShowSuccess(true);
        setIsVerifying(false);

        // Call parent callback after showing success
        setTimeout(() => {
          if (onStepsReceived) {
            onStepsReceived(steps, "strava", result.data);
          }
        }, 2000);

        console.log(`📊 Retrieved ${steps} steps from Strava activities`);
      } else {
        throw new Error(result.error || "Failed to retrieve step data");
      }
    } catch (error) {
      console.error("Failed to get steps:", error);
      setError(
        error instanceof Error ? error.message : "Failed to retrieve step data"
      );
      setIsVerifying(false);
    }
  };

  const handleProviderClick = (provider: FitnessProvider) => {
    if (provider.id === "strava" && provider.isWorking) {
      if (stravaData) {
        // Already connected, get steps
        handleGetSteps();
      } else {
        // Connect to Strava
        handleConnectStrava();
      }
    } else {
      // Show coming soon message for other providers
      setError(
        `${provider.name} integration coming soon! Currently only Strava is working.`
      );
    }
  };

  // Show loading states
  if (isConnecting) {
    return (
      <LoadingPage
        type="connecting"
        title="Connecting to Strava"
        message="Please complete the authorization in your browser..."
      />
    );
  }

  if (isVerifying) {
    return (
      <LoadingPage
        type="verifying"
        title="Retrieving Your Activities"
        message="Converting your real workouts to step counts..."
      />
    );
  }

  // Show success states
  if (showSuccess && stravaData) {
    return (
      <SuccessPage
        type={successType}
        data={{
          steps: stravaData.summary?.totalSteps,
          activities: stravaData.summary?.activitiesCount,
          distance: stravaData.summary?.totalDistance,
          rewards: stravaData.summary?.totalSteps
            ? Math.floor(stravaData.summary.totalSteps / 100)
            : 0,
          multiplier: stravaData.summary?.totalSteps > 10000 ? 1.5 : 1.0,
          athleteName: stravaData.athlete?.name,
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
                ? selectedProvider === provider.id
                  ? "var(--surface-glass-hover)"
                  : "var(--surface-card)"
                : "var(--surface-card)",
              border: `2px solid ${
                provider.isWorking
                  ? selectedProvider === provider.id
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

            {/* Connection Status for Strava */}
            {provider.id === "strava" && stravaData && (
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
                  ✅ Connected as {stravaData.athlete?.name || "Strava User"}
                </div>
                <div className="text-xs mt-1" style={{ color: "#86efac" }}>
                  {stravaData.summary?.totalSteps.toLocaleString()} steps from{" "}
                  {stravaData.summary?.activitiesCount} activities
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Button */}
      {selectedProvider === "strava" && stravaData ? (
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
              Your Strava Summary (Last 7 Days)
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
                  {stravaData.summary.totalSteps.toLocaleString()}
                </div>
              </div>
              <div>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Activities:
                </span>
                <div
                  className="font-bold text-2xl"
                  style={{ color: "var(--text-primary)" }}
                >
                  {stravaData.summary.activitiesCount}
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
                  {Math.round(stravaData.summary.totalDistance / 1000)} km
                </div>
              </div>
              <div>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Time:
                </span>
                <div
                  className="font-bold text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  {Math.round(stravaData.summary.totalTime / 60)} min
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
