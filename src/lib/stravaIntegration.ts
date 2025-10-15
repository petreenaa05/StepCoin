import {
  useWriteContract,
  useAccount,
  useWaitForTransactionReceipt,
} from "wagmi";
import { PROOF_VERIFIER_ABI, PROOF_VERIFIER_ADDRESS } from "../contracts";

interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  achievement_count: number;
  kudos_count: number;
  average_speed: number;
  max_speed: number;
}

interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  profile: string;
}

// Simplified Strava OAuth - much easier than Google
export const connectStrava = () => {
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || "demo";
  const redirectUri = encodeURIComponent(window.location.origin);
  const scope = "read,activity:read_all";

  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=${scope}`;

  // Open Strava auth in popup
  const popup = window.open(authUrl, "strava-auth", "width=600,height=600");

  return new Promise<string>((resolve, reject) => {
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        const code = localStorage.getItem("strava_code");
        if (code) {
          localStorage.removeItem("strava_code");
          resolve(code);
        } else {
          reject(new Error("Authentication cancelled"));
        }
      }
    }, 1000);
  });
};

// Exchange code for access token
export const getStravaAccessToken = async (code: string) => {
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code: code,
      grant_type: "authorization_code",
    }),
  });

  return response.json();
};

// Fetch recent Strava activities
export const fetchStravaActivities = async (
  accessToken: string
): Promise<StravaActivity[]> => {
  const response = await fetch(
    "https://www.strava.com/api/v3/athlete/activities?per_page=30",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Strava activities");
  }

  return response.json();
};

// Calculate fitness score from activities
export const calculateFitnessScore = (activities: StravaActivity[]): number => {
  const last7Days = activities.filter((activity) => {
    const activityDate = new Date(activity.start_date);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return activityDate >= weekAgo;
  });

  let score = 0;

  last7Days.forEach((activity) => {
    // Different scoring for different activity types
    switch (activity.type.toLowerCase()) {
      case "run":
        score += Math.floor(activity.distance / 1000) * 10; // 10 points per km
        break;
      case "ride":
        score += Math.floor(activity.distance / 1000) * 5; // 5 points per km
        break;
      case "walk":
        score += Math.floor(activity.distance / 1000) * 8; // 8 points per km
        break;
      case "swim":
        score += Math.floor(activity.distance / 1000) * 20; // 20 points per km
        break;
      default:
        score += Math.floor(activity.moving_time / 60) * 2; // 2 points per minute
    }

    // Bonus for consistency
    score += activity.achievement_count * 5;
  });

  return Math.min(score, 1000); // Cap at 1000 points
};

// Generate proof for Strava fitness data
export const generateStravaFitnessProof = async (accessToken: string) => {
  try {
    const activities = await fetchStravaActivities(accessToken);
    const fitnessScore = calculateFitnessScore(activities);

    const proofData = {
      provider: "strava",
      fitnessScore,
      activitiesCount: activities.length,
      weeklyDistance: activities
        .filter((a) => {
          const date = new Date(a.start_date);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return date >= weekAgo;
        })
        .reduce((total, a) => total + a.distance, 0),
      timestamp: Date.now(),
      activities: activities.slice(0, 5), // Include recent 5 activities as proof
    };

    // Store proof data for contract submission
    sessionStorage.setItem("strava_fitness_proof", JSON.stringify(proofData));

    return proofData;
  } catch (error) {
    console.error("Error generating Strava proof:", error);
    throw error;
  }
};

// Hook for submitting Strava proof to smart contract
export const useStravaProofSubmission = () => {
  const { address } = useAccount();
  const { writeContract, isPending, error, data: hash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const submitProof = async (proofData: any) => {
    if (!address) throw new Error("No wallet connected");

    // Convert proof to contract format
    const proofString = JSON.stringify({
      provider: proofData.provider,
      score: proofData.fitnessScore,
      timestamp: proofData.timestamp,
      activities: proofData.activitiesCount,
    });

    writeContract({
      address: PROOF_VERIFIER_ADDRESS,
      abi: PROOF_VERIFIER_ABI,
      functionName: "verifyAndReward",
      args: [address, proofString, proofData.fitnessScore],
    });
  };

  return {
    submitProof,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
};

// Complete Strava integration flow
export const useStravaIntegration = () => {
  const proofSubmission = useStravaProofSubmission();

  const connectAndProve = async () => {
    try {
      // Step 1: Connect to Strava
      const code = await connectStrava();

      // Step 2: Get access token
      const tokenResponse = await getStravaAccessToken(code);

      if (tokenResponse.access_token) {
        // Step 3: Generate fitness proof
        const proofData = await generateStravaFitnessProof(
          tokenResponse.access_token
        );

        // Step 4: Submit to smart contract
        await proofSubmission.submitProof(proofData);

        return proofData;
      } else {
        throw new Error("Failed to get Strava access token");
      }
    } catch (error) {
      console.error("Strava integration error:", error);
      throw error;
    }
  };

  return {
    connectAndProve,
    ...proofSubmission,
  };
};
