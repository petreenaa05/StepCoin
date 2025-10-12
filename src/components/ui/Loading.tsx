interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function LoadingSpinner({
  size = "md",
  color = "border-blue-500",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${color} border-4 border-t-transparent rounded-full animate-spin`}
    ></div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <h2 className="text-2xl font-bold text-white mt-4 mb-2">
          Loading StepCoin
        </h2>
        <p className="text-gray-300">Connecting to the blockchain...</p>
      </div>
    </div>
  );
}
