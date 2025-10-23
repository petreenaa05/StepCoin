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

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setStatus("error");
        setError("Authentication was denied or cancelled");
        return;
      }

      if (!code) {
        setStatus("error");
        setError("No authorization code received");
        return;
      }

      try {
        // The callback route should handle the token exchange
        // Just redirect back to the main page with success indicator
        setTimeout(() => {
          router.replace("/?googlefit_connected=true");
        }, 2000);

        setStatus("success");
      } catch (error) {
        setStatus("error");
        setError("Failed to complete authentication");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (status === "loading") {
    return (
      <LoadingPage
        type="connecting"
        title="Completing Google Fit Connection"
        message="Finalizing your authentication and setting up your account..."
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
    <SuccessPage
      type="connected"
      title="Google Fit Connected Successfully!"
      message="Redirecting you back to claim your step rewards..."
      onContinue={() => router.replace("/?googlefit_connected=true")}
    />
  );
}

export default function GoogleFitCallback() {
  return (
    <Suspense fallback={<LoadingPage type="connecting" title="Loading..." message="Setting up your connection..." />}>
      <GoogleFitCallbackContent />
    </Suspense>
  );
}