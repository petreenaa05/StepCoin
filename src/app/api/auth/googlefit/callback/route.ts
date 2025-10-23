import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  console.log("🔗 Google Fit callback received:", {
    code: code ? "present" : "missing",
    error,
  });

  if (error) {
    console.log("❌ Google Fit auth error:", error);
    return NextResponse.redirect(
      new URL("/googlefit/callback?error=auth_denied", request.url)
    );
  }

  if (!code) {
    console.log("❌ No authorization code received");
    return NextResponse.redirect(
      new URL("/googlefit/callback?error=no_code", request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: `${new URL(request.url).origin}/api/auth/googlefit/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.access_token) {
      // Store token securely
      const response = NextResponse.redirect(
        new URL("/googlefit/callback?success=true", request.url)
      );

      // Set secure httpOnly cookie with access token
      response.cookies.set("googlefit_access_token", tokenData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: tokenData.expires_in || 3600, // 1 hour default
      });

      // Also set refresh token if available
      if (tokenData.refresh_token) {
        response.cookies.set("googlefit_refresh_token", tokenData.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
      }

      return response;
    } else {
      console.error("Google Fit token exchange failed:", tokenData);
      return NextResponse.redirect(
        new URL("/googlefit/callback?error=token_failed", request.url)
      );
    }
  } catch (error) {
    console.error("Google Fit OAuth error:", error);
    return NextResponse.redirect(
      new URL("/googlefit/callback?error=server_error", request.url)
    );
  }
}