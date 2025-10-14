import { useState } from "react";
import { ReclaimProofGenerator } from "./ReclaimProofGenerator";

interface ProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProofSuccess?: (
    stepCount: number,
    reward: { stepCoins: number; multiplier: number }
  ) => void;
}

export function ProofModal({
  isOpen,
  onClose,
  onProofSuccess,
}: ProofModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [proofResult, setProofResult] = useState<{
    stepCount: number;
    reward: { stepCoins: number; multiplier: number };
  } | null>(null);

  if (!isOpen) return null;

  const handleProofComplete = (
    stepCount: number,
    reward: { stepCoins: number; multiplier: number }
  ) => {
    setProofResult({ stepCount, reward });
    setShowSuccess(true);

    // Notify parent component
    if (onProofSuccess) {
      onProofSuccess(stepCount, reward);
    }

    // Auto-close after showing success
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  const handleClose = () => {
    setShowSuccess(false);
    setProofResult(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      onClick={handleClose}
    >
      <div
        className="backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--surface-card)",
          borderColor: "var(--surface-border)",
        }}
      >
        {showSuccess && proofResult ? (
          // Success State
          <div className="text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <h3 className="text-2xl font-bold text-white font-mono">
              Proof Verified Successfully!
            </h3>
            <div
              className="backdrop-blur-lg rounded-2xl p-6 border"
              style={{
                backgroundColor: "var(--surface-card)",
                borderColor: "var(--surface-border)",
              }}
            >
              <div className="space-y-3">
                <p className="text-lg text-white font-mono">
                  Steps Verified:{" "}
                  <span
                    className="font-bold"
                    style={{ color: "var(--accent-pink)" }}
                  >
                    {new Intl.NumberFormat().format(proofResult.stepCount)}
                  </span>
                </p>
                <p className="text-lg text-white font-mono">
                  StepCoins Earned:{" "}
                  <span
                    className="font-bold"
                    style={{ color: "var(--accent-pink)" }}
                  >
                    {proofResult.reward.stepCoins} SC
                  </span>
                </p>
                <p
                  className="text-sm font-mono"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Multiplier: {proofResult.reward.multiplier}x
                </p>
              </div>
            </div>
            <p
              className="text-sm font-mono"
              style={{ color: "var(--text-secondary)" }}
            >
              🔒 Your fitness data was verified using zero-knowledge proofs
            </p>
          </div>
        ) : (
          // Proof Generation State
          <ReclaimProofGenerator
            onProofComplete={handleProofComplete}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
}
