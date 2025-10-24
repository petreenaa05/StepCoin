"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingPage } from "../../../components/ui/LoadingPage";
import { SuccessPage } from "../../../components/ui/SuccessPage";

function GoogleFitCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string>("");
  const [stepData, setStepData] = useState<any>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const success = searchParams.get("success");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setStatus("error");
        setError("Authentication was denied or cancelled");
        return;
      }

      if (success === "true") {
        try {
          // Wait a moment for tokens to be set, then fetch step data
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const response = await fetch("/api/fitness/googlefit");
          const result = await response.json();

          if (result.authenticated && result.data) {
            setStepData(result.data);
            setStatus("success");
          } else {
            setStatus("error");
            setError("Failed to fetch your fitness data");
          }
        } catch (error) {
          setStatus("error");
          setError("Failed to complete authentication");
        }
      } else {
        setStatus("error");
        setError("No authorization received");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (status === "loading") {
    return (
      <LoadingPage
        type="connecting"
        title="Connecting Google Fit"
        message="Verifying your authentication and fetching your step data..."
      />
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Connection Failed
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.replace("/")}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center border border-green-200">
        <div className="text-8xl mb-6">✅</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Connected Successfully!
        </h2>
        <p className="text-gray-600 mb-6">
          Your Google Fit account has been connected to StepCoin
        </p>
        
        {stepData && (
          <div className="bg-green-50 rounded-xl p-6 mb-6 border border-green-200">
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Today's Steps
            </h3>
            <div className="text-4xl font-bold text-green-600 mb-2">
              {stepData.totalSteps?.toLocaleString() || '0'}
            </div>
            <p className="text-green-700 text-sm">
              Connected as {stepData.userName || 'Google Fit User'}
            </p>
          </div>
        )}
        
        <button
          onClick={() => router.replace("/?googlefit_connected=true")}
          className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
        >
          Continue to Earn Rewards
        </button>
      </div>
    </div>
  );
}

export default function GoogleFitCallback() {
  return (
    <Suspense fallback={<LoadingPage type="connecting" title="Loading..." message="Setting up your connection..." />}>
      <GoogleFitCallbackContent />
    </Suspense>
  );
}