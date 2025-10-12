import { useState } from "react";
import { Modal } from "./Modal";

interface ProofModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProofModal({ isOpen, onClose }: ProofModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [step, setStep] = useState<
    "select" | "connecting" | "qr" | "verifying" | "success"
  >("select");

  const providers = [
    {
      id: "google-fit",
      name: "Google Fit",
      icon: "📱",
      description: "Connect your Google Fit data",
      color: "from-blue-500 to-cyan-600",
    },
    {
      id: "strava",
      name: "Strava",
      icon: "🏃‍♀️",
      description: "Connect your Strava activities",
      color: "from-orange-500 to-red-600",
    },
    {
      id: "apple-health",
      name: "Apple Health",
      icon: "❤️",
      description: "Connect your Apple Health data",
      color: "from-red-500 to-pink-600",
    },
    {
      id: "fitbit",
      name: "Fitbit",
      icon: "⌚",
      description: "Connect your Fitbit device",
      color: "from-green-500 to-emerald-600",
    },
  ];

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setStep("connecting");

    // Simulate connection process
    setTimeout(() => setStep("qr"), 1000);
  };

  const handleStartProof = () => {
    setStep("verifying");

    // Simulate verification process
    setTimeout(() => setStep("success"), 3000);
  };

  const resetModal = () => {
    setStep("select");
    setSelectedProvider(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300); // Reset after modal closes
  };

  const renderContent = () => {
    switch (step) {
      case "select":
        return (
          <div className="space-y-4">
            <p className="text-gray-300 mb-6">
              Choose your fitness data provider to generate a privacy-preserving
              proof:
            </p>

            <div className="grid grid-cols-2 gap-3">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderSelect(provider.id)}
                  className={`p-4 rounded-xl bg-gradient-to-r ${provider.color} hover:scale-105 transition-all duration-300 text-white`}
                >
                  <div className="text-2xl mb-2">{provider.icon}</div>
                  <div className="text-sm font-bold">{provider.name}</div>
                  <div className="text-xs opacity-80 mt-1">
                    {provider.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case "connecting":
        return (
          <div className="text-center py-8">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h4 className="text-white font-bold mb-2">
              Connecting to{" "}
              {providers.find((p) => p.id === selectedProvider)?.name}...
            </h4>
            <p className="text-gray-300 text-sm">
              Setting up secure connection
            </p>
          </div>
        );

      case "qr":
        return (
          <div className="text-center">
            <div className="bg-white p-4 rounded-xl mb-4 mx-auto w-48 h-48 flex items-center justify-center">
              <div className="text-6xl">📱</div>
            </div>
            <h4 className="text-white font-bold mb-2">Scan QR Code</h4>
            <p className="text-gray-300 text-sm mb-6">
              Open the Reclaim app and scan this QR code to generate your proof
            </p>
            <div className="space-y-3">
              <button
                onClick={handleStartProof}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
              >
                I've Scanned the QR Code
              </button>
              <button
                onClick={() => setStep("select")}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300"
              >
                Back to Provider Selection
              </button>
            </div>
          </div>
        );

      case "verifying":
        return (
          <div className="text-center py-8">
            <div className="relative mb-6">
              <div className="animate-pulse w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <div className="absolute inset-0 animate-ping w-16 h-16 bg-purple-500/20 rounded-full mx-auto"></div>
            </div>
            <h4 className="text-white font-bold mb-2">
              Verifying Your Proof...
            </h4>
            <p className="text-gray-300 text-sm mb-4">
              Our zkTLS system is verifying your fitness data
            </p>
            <div className="flex justify-center space-x-1">
              <div
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <h4 className="text-white font-bold mb-2">Proof Verified!</h4>
            <p className="text-gray-300 text-sm mb-4">
              Your fitness activity has been verified and StepCoins have been
              minted to your wallet.
            </p>
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-green-300">Steps Verified:</span>
                <span className="text-white font-bold">8,547 steps</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-green-300">StepCoins Earned:</span>
                <span className="text-white font-bold">+85.47 SC</span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Awesome! 🎉
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Prove Your Fitness Activity"
    >
      {renderContent()}
    </Modal>
  );
}
