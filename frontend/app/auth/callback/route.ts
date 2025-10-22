import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(errorDescription || error)}`,
        request.url,
      ),
    );
  }

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  const isSupabaseConfigured = Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl !== "your-project-url-here" &&
      supabaseAnonKey !== "your-anon-key-here",
  );

  // If Supabase is not configured, redirect to dashboard (mock mode)
  if (!isSupabaseConfigured) {
    console.log("Supabase not configured, using mock mode");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If no code is provided, something went wrong
  if (!code) {
    console.error("No code provided in callback");
    return NextResponse.redirect(
      new URL("/auth/login?error=No authorization code provided", request.url),
    );
  }

  try {
    // Create a Supabase server client that can set cookies on the response
    const response = NextResponse.next();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options, path: "/" });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({ name, ...options, path: "/" });
        },
      },
    });

    // Exchange the code for a session and set auth cookies
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Error exchanging code for session:", exchangeError);
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(exchangeError.message)}`,
          request.url,
        ),
      );
    }

    if (!data.session) {
      console.error("No session returned from code exchange");
      return NextResponse.redirect(
        new URL("/auth/login?error=Failed to establish session", request.url),
      );
    }

    // Check if this is a new user (check user metadata or created_at timestamp)
    const user = data.user;
    
    // Get KYC data from localStorage to check if profile is complete
    const cookies = request.cookies;
    const kycData = cookies.get('kycData');
    const hasCompletedKyc = kycData !== undefined;

    // Create response with redirect
    const redirectUrl = hasCompletedKyc
      ? new URL("/dashboard", request.url)
      : new URL("/auth/kyc", request.url);

    // Redirect with cookies attached so middleware and client see the session
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Unexpected error in auth callback:", error);
    return NextResponse.redirect(
      new URL(
        "/auth/login?error=Authentication failed. Please try again.",
        request.url,
      ),
    );
  }
}
