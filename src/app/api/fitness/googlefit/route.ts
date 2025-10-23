import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("googlefit_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { authenticated: false, error: "No access token found" },
        { status: 401 }
      );
    }

    // Get fitness data from Google Fit API
    const today = new Date();
    const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endTime = today.getTime();

    // Get step count data
    const stepsResponse = await fetch(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aggregateBy: [
            {
              dataTypeName: "com.google.step_count.delta",
              dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
            },
          ],
          bucketByTime: { durationMillis: 86400000 }, // 24 hours
          startTimeMillis: startTime,
          endTimeMillis: endTime,
        }),
      }
    );

    const stepsData = await stepsResponse.json();

    // Get user profile
    const profileResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const profileData = await profileResponse.json();

    if (stepsData.bucket && stepsData.bucket.length > 0) {
      const todaySteps = stepsData.bucket[0].dataset[0].point.reduce(
        (total: number, point: any) => {
          return total + (point.value[0]?.intVal || 0);
        },
        0
      );

      return NextResponse.json({
        authenticated: true,
        success: true,
        data: {
          provider: "googlefit",
          user: {
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            picture: profileData.picture,
          },
          summary: {
            totalSteps: todaySteps,
            date: today.toISOString().split("T")[0],
            source: "Google Fit",
          },
          activities: [
            {
              id: `gfit_${today.toISOString().split("T")[0]}`,
              name: "Daily Steps",
              type: "Walk",
              steps: todaySteps,
              distance: Math.round((todaySteps * 0.762) / 1000 * 100) / 100, // Approximate km
              date: today.toISOString(),
              source: "Google Fit",
            },
          ],
        },
      });
    } else {
      return NextResponse.json({
        authenticated: true,
        success: true,
        data: {
          provider: "googlefit",
          user: {
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            picture: profileData.picture,
          },
          summary: {
            totalSteps: 0,
            date: today.toISOString().split("T")[0],
            source: "Google Fit",
          },
          activities: [],
        },
      });
    }
  } catch (error) {
    console.error("Google Fit API error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Failed to fetch fitness data" },
      { status: 500 }
    );
  }
}