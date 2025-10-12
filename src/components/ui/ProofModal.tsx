interface ProofModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProofModal({ isOpen, onClose }: ProofModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-pink-500/20 rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-white">
            Generate Fitness Proof
          </h3>
          <p className="text-gray-400">
            Generate a zero-knowledge proof of your fitness activities to earn
            STEP tokens.
          </p>
          <div className="space-y-4">
            <button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Connect Fitness App
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
