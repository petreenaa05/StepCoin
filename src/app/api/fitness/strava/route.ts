import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

interface StravaActivity {
  id: number;
  name: string;
  distance: number; // meters
  moving_time: number; // seconds
  type: string;
  start_date: string;
  average_speed: number;
}

// Convert different activities to step counts
function convertActivityToSteps(activity: StravaActivity): number {
  const { type, distance, moving_time } = activity;

  switch (type.toLowerCase()) {
    case "run":
    case "virtualrun":
      // Running: ~1,300 steps per km (average stride)
      return Math.round((distance / 1000) * 1300);

    case "walk":
    case "hike":
      // Walking: ~1,250 steps per km
      return Math.round((distance / 1000) * 1250);

    case "ride":
    case "virtualride":
      // Cycling: convert to equivalent walking steps (1/3 ratio)
      return Math.round((distance / 1000) * 400);

    case "swim":
      // Swimming: convert time to equivalent steps (rough estimate)
      return Math.round((moving_time / 60) * 50); // 50 steps per minute

    default:
      // Other activities: time-based conversion
      return Math.round((moving_time / 60) * 100); // 100 steps per minute
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("strava_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "No Strava access token found",
          authenticated: false,
        },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");

    // Fetch activities from Strava
    const activitiesResponse = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?per_page=50&page=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!activitiesResponse.ok) {
      if (activitiesResponse.status === 401) {
        return NextResponse.json(
          {
            error: "Strava token expired",
            authenticated: false,
          },
          { status: 401 }
        );
      }
      throw new Error("Failed to fetch Strava activities");
    }

    const activities: StravaActivity[] = await activitiesResponse.json();

    // Filter activities from the last N days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.start_date);
      return activityDate >= cutoffDate;
    });

    // Convert activities to steps
    const stepsData = recentActivities.map((activity) => ({
      id: activity.id,
      name: activity.name,
      type: activity.type,
      date: activity.start_date.split("T")[0],
      distance: activity.distance,
      duration: activity.moving_time,
      steps: convertActivityToSteps(activity),
    }));

    // Calculate totals
    const totalSteps = stepsData.reduce(
      (sum, activity) => sum + activity.steps,
      0
    );
    const totalDistance = recentActivities.reduce(
      (sum, activity) => sum + activity.distance,
      0
    );
    const totalTime = recentActivities.reduce(
      (sum, activity) => sum + activity.moving_time,
      0
    );

    // Get athlete info
    const athleteResponse = await fetch(
      "https://www.strava.com/api/v3/athlete",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    let athlete = null;
    if (athleteResponse.ok) {
      athlete = await athleteResponse.json();
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: {
        athlete: {
          id: athlete?.id,
          name: `${athlete?.firstname || ""} ${athlete?.lastname || ""}`.trim(),
          profile: athlete?.profile,
        },
        summary: {
          totalSteps,
          totalDistance: Math.round(totalDistance), // meters
          totalTime, // seconds
          activitiesCount: recentActivities.length,
          period: `${days} days`,
        },
        activities: stepsData,
      },
    });
  } catch (error) {
    console.error("Strava API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch fitness data",
        authenticated: false,
      },
      { status: 500 }
    );
  }
}
