import React from "react";

interface SuccessPageProps {
  title?: string;
  message?: string;
  type?: "connected" | "verified" | "rewarded" | "general";
  data?: {
    steps?: number;
    activities?: number;
    distance?: number;
    rewards?: number;
    multiplier?: number;
    athleteName?: string;
  };
  onContinue?: () => void;
  onClose?: () => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({
  title,
  message,
  type = "general",
  data,
  onContinue,
  onClose,
}) => {
  const getSuccessContent = () => {
    switch (type) {
      case "connected":
        return {
          title: title || "Successfully Connected!",
          message:
            message ||
            `Welcome ${
              data?.athleteName || "Athlete"
            }! Your Strava account is now connected to StepCoin.`,
          icon: "✅",
          color: "green",
          celebration: "🎉",
        };
      case "verified":
        return {
          title: title || "Activities Verified!",
          message:
            message ||
            "Your fitness data has been successfully retrieved and converted to steps.",
          icon: "🏆",
          color: "blue",
          celebration: "🎯",
        };
      case "rewarded":
        return {
          title: title || "Rewards Distributed!",
          message:
            message || "StepCoins have been successfully sent to your wallet.",
          icon: "💰",
          color: "yellow",
          celebration: "🚀",
        };
      default:
        return {
          title: title || "Success!",
          message: message || "Operation completed successfully.",
          icon: "✨",
          color: "green",
          celebration: "🎉",
        };
    }
  };

  const content = getSuccessContent();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0, 0, 0, 0.8)" }}
    >
      <div
        className="rounded-3xl p-10 max-w-2xl w-full mx-4 shadow-2xl relative overflow-hidden backdrop-blur-sm border"
        style={{
          background: "var(--surface-glass)",
          borderColor: "var(--surface-border)",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 50px rgba(247, 6, 112, 0.2)",
        }}
      >
        {/* Celebration Animation */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div
            className="absolute top-4 left-4 text-2xl animate-bounce"
            style={{ animationDelay: "0s" }}
          >
            {content.celebration}
          </div>
          <div
            className="absolute top-8 right-8 text-xl animate-bounce"
            style={{ animationDelay: "0.5s" }}
          >
            {content.celebration}
          </div>
          <div
            className="absolute bottom-8 left-8 text-xl animate-bounce"
            style={{ animationDelay: "1s" }}
          >
            {content.celebration}
          </div>
          <div
            className="absolute bottom-4 right-4 text-2xl animate-bounce"
            style={{ animationDelay: "1.5s" }}
          >
            {content.celebration}
          </div>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-2xl z-10 transition-all duration-200 hover:scale-110 transform"
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

        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-6 animate-pulse">{content.icon}</div>
          <h2
            className="text-4xl font-bold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            {content.title}
          </h2>
          <p className="text-xl" style={{ color: "var(--text-secondary)" }}>
            {content.message}
          </p>
        </div>

        {/* Success Details */}
        {data && (
          <div
            className="rounded-2xl p-6 mb-8 border"
            style={{
              background: "var(--surface-card)",
              borderColor: "var(--surface-border)",
            }}
          >
            <h3
              className="font-bold text-xl mb-4 text-center"
              style={{ color: "var(--text-primary)" }}
            >
              {type === "connected" && "🔗 Connection Details"}
              {type === "verified" && "📊 Fitness Summary"}
              {type === "rewarded" && "💰 Reward Summary"}
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {data.steps && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {data.steps.toLocaleString()}
                  </div>
                  <div className="text-gray-600">Total Steps</div>
                </div>
              )}

              {data.activities && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {data.activities}
                  </div>
                  <div className="text-gray-600">Activities</div>
                </div>
              )}

              {data.distance && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(data.distance / 1000)}km
                  </div>
                  <div className="text-gray-600">Distance</div>
                </div>
              )}

              {data.rewards && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Math.floor(data.rewards)}
                  </div>
                  <div className="text-gray-600">StepCoins</div>
                </div>
              )}
            </div>

            {data.multiplier && data.multiplier > 1 && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  🎉 {data.multiplier}x Bonus Applied!
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-center items-center mb-6">
          <div className="flex space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                content.color === "green" ? "bg-green-500" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`w-3 h-3 rounded-full ${
                content.color === "blue" ? "bg-blue-500" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`w-3 h-3 rounded-full ${
                content.color === "yellow" ? "bg-yellow-500" : "bg-gray-300"
              }`}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {onContinue && (
            <button
              onClick={onContinue}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                content.color === "green"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : content.color === "blue"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : content.color === "yellow"
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                  : "bg-gray-600 hover:bg-gray-700 text-white"
              }`}
            >
              {type === "connected" && "Get My Steps"}
              {type === "verified" && "Claim Rewards"}
              {type === "rewarded" && "View Wallet"}
              {type === "general" && "Continue"}
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          )}
        </div>

        {/* Fun Facts */}
        {type === "verified" && data?.steps && (
          <div className="mt-4 text-center text-xs text-gray-500">
            💡 Fun fact: You've walked approximately{" "}
            {Math.round((data.steps * 0.762) / 1000)} km worth of steps!
          </div>
        )}

        {type === "rewarded" && data?.rewards && (
          <div className="mt-4 text-center text-xs text-gray-500">
            🎯 Keep it up! Every 100 steps = 1 StepCoin. You're doing great!
          </div>
        )}
      </div>
    </div>
  );
};
