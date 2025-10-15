import React from "react";

interface LoadingPageProps {
  title?: string;
  message?: string;
  type?: "connecting" | "verifying" | "processing" | "general";
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  title,
  message,
  type = "general",
}) => {
  const getLoadingContent = () => {
    switch (type) {
      case "connecting":
        return {
          title: title || "Connecting to Strava",
          message:
            message || "Please authorize StepCoin dApp in the popup window...",
          icon: "🔗",
          steps: [
            "Opening Strava authentication",
            "Waiting for your authorization",
            "Securing your connection",
          ],
        };
      case "verifying":
        return {
          title: title || "Retrieving Your Activities",
          message: message || "Fetching your real fitness data from Strava...",
          icon: "📊",
          steps: [
            "Connecting to Strava API",
            "Downloading your activities",
            "Converting to step counts",
            "Calculating rewards",
          ],
        };
      case "processing":
        return {
          title: title || "Processing Rewards",
          message:
            message ||
            "Submitting to smart contract and distributing StepCoins...",
          icon: "💰",
          steps: [
            "Generating fitness proof",
            "Submitting to blockchain",
            "Verifying transaction",
            "Distributing StepCoins",
          ],
        };
      default:
        return {
          title: title || "Loading",
          message: message || "Please wait...",
          icon: "⏳",
          steps: ["Processing your request"],
        };
    }
  };

  const content = getLoadingContent();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0, 0, 0, 0.8)" }}
    >
      <div
        className="rounded-3xl p-10 max-w-lg w-full mx-4 shadow-2xl backdrop-blur-sm border"
        style={{
          background: "var(--surface-glass)",
          borderColor: "var(--surface-border)",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 50px rgba(247, 6, 112, 0.2)",
        }}
      >
        {/* Loading Icon */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-6 animate-bounce">{content.icon}</div>
          <h2
            className="text-3xl font-bold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            {content.title}
          </h2>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            {content.message}
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className="mb-8">
          <div
            className="w-full rounded-full h-3"
            style={{ background: "rgba(255, 255, 255, 0.1)" }}
          >
            <div
              className="h-3 rounded-full animate-pulse"
              style={{
                width: "70%",
                background: "var(--gradient-pink)",
                animation: "progress 2s ease-in-out infinite",
              }}
            ></div>
          </div>
        </div>

        {/* Loading Steps */}
        <div className="space-y-4">
          {content.steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-5 h-5 rounded-full mr-4 flex items-center justify-center"
                style={{
                  background:
                    index === 0
                      ? "var(--gradient-pink)"
                      : "rgba(255, 255, 255, 0.1)",
                }}
              >
                {index === 0 && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </div>
              <span
                className="text-sm font-medium"
                style={{
                  color:
                    index === 0 ? "var(--accent-pink)" : "var(--text-muted)",
                }}
              >
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Spinner */}
        <div className="flex justify-center mt-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>

        <style jsx>{`
          @keyframes progress {
            0% {
              width: 10%;
            }
            50% {
              width: 70%;
            }
            100% {
              width: 90%;
            }
          }
        `}</style>
      </div>
    </div>
  );
};
