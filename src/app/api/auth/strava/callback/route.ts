import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  console.log("🔗 Strava callback received:", {
    code: code ? "present" : "missing",
    error,
  });

  if (error) {
    console.log("❌ Strava auth error:", error);
    return NextResponse.redirect(
      new URL("/strava/callback?error=auth_denied", request.url)
    );
  }

  if (!code) {
    console.log("❌ No authorization code received");
    return NextResponse.redirect(
      new URL("/strava/callback?error=no_code", request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://www.strava.com/oauth/token", {
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

    const tokenData = await tokenResponse.json();

    if (tokenData.access_token) {
      // Store token securely (in a real app, use encrypted cookies or database)
      const response = NextResponse.redirect(
        new URL("/strava/callback?success=true", request.url)
      );

      // Set secure httpOnly cookie with access token
      response.cookies.set("strava_access_token", tokenData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: tokenData.expires_in || 21600, // 6 hours default
      });

      // Also set refresh token if available
      if (tokenData.refresh_token) {
        response.cookies.set("strava_refresh_token", tokenData.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
      }

      return response;
    } else {
      console.error("Strava token exchange failed:", tokenData);
      return NextResponse.redirect(
        new URL("/strava/callback?error=token_failed", request.url)
      );
    }
  } catch (error) {
    console.error("Strava OAuth error:", error);
    return NextResponse.redirect(
      new URL("/strava/callback?error=server_error", request.url)
    );
  }
}
