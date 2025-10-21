"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Chrome,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authHelpers, hasSupabase } from "@/lib/supabase";
import { initializeSampleData } from "@/lib/mock-data";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [useSupabase, setUseSupabase] = useState(false);
  const [googleOAuthAvailable, setGoogleOAuthAvailable] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for error in URL params
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast.error(decodeURIComponent(error));
    }
  }, [searchParams]);

  // Check if Supabase is configured on mount
  useEffect(() => {
    const checkSupabase = async () => {
      const isConfigured = hasSupabase();
      setUseSupabase(isConfigured);

      // Only check Google OAuth if Supabase is configured
      if (isConfigured) {
        try {
          const available = await authHelpers.isGoogleOAuthAvailable();
          setGoogleOAuthAvailable(available);
        } catch (error) {
          setGoogleOAuthAvailable(false);
        }
      }
    };

    checkSupabase();
  }, []);

  const handleSupabaseLogin = async () => {
    try {
      const { user, session } = await authHelpers.signIn(email, password);

      if (!session) {
        throw new Error("Failed to establish session");
      }

      // Set authentication flag
      localStorage.setItem("isAuthenticated", "true");

      // Store user info in localStorage for app use
      if (user) {
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split("@")[0],
            avatar: user.user_metadata?.avatar_url,
          }),
        );
      }

      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Supabase login error:", error);
      throw error;
    }
  };

  const handleMockLogin = async () => {
    // Initialize sample data for mock mode
    initializeSampleData();

    await new Promise((resolve) => setTimeout(resolve, 1000));
    localStorage.setItem("isAuthenticated", "true");

    // Store mock user info
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: "mock-user-id",
        email: email || "demo@commitly.com",
        name: email ? email.split("@")[0] : "Demo User",
        avatar: null,
      }),
    );

    toast.success("Welcome back!");
    router.push("/dashboard");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (useSupabase) {
        await handleSupabaseLogin();
      } else {
        await handleMockLogin();
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Show specific error messages
      if (error.message?.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else if (error.message?.includes("Email not confirmed")) {
        toast.error("Please verify your email address before logging in");
      } else if (error.message?.includes("not configured")) {
        toast.error(error.message);
      } else {
        toast.error("Failed to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSupabaseGoogleLogin = async () => {
    try {
      await authHelpers.signInWithGoogle();
      // User will be redirected to Google, then back to /auth/callback
    } catch (error: any) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const handleMockGoogleLogin = async () => {
    initializeSampleData();
    await new Promise((resolve) => setTimeout(resolve, 800));
    localStorage.setItem("isAuthenticated", "true");

    // Store mock Google user info
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: "mock-google-user-id",
        email: "google.user@gmail.com",
        name: "Google User",
        avatar: null,
      }),
    );

    toast.success("Google login successful!");
    router.push("/dashboard");
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      if (useSupabase) {
        await handleSupabaseGoogleLogin();
      } else {
        await handleMockGoogleLogin();
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      if (error.message?.includes("not configured")) {
        toast.error(error.message);
      } else if (error.message?.includes("provider is not enabled") ||
                 error.message?.includes("Unsupported provider") ||
                 error.message?.includes("Google OAuth is not enabled")) {
        toast.error("Google Sign-In is not configured. Please use email/password login instead.", {
          description: "Contact the administrator to enable Google OAuth in Supabase settings."
        });
      } else {
        toast.error("Failed to login with Google");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur opacity-75 animate-pulse" />
              <div className="relative bg-white rounded-full p-3 shadow-lg">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Continue your journey to success</p>

          {/* Show mode indicator */}
          {!useSupabase && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-700">
              <AlertCircle className="h-3 w-3" />
              Demo Mode - Using local storage
            </div>
          )}
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-xl bg-white/80 shadow-2xl border-0 shadow-blue-100/50">
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  href="/auth/reset-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing you in...
                  </div>
                ) : (
                  "Sign In to Your Account"
                )}
              </Button>

              {/* Google OAuth Section - Only show if configured */}
              {useSupabase && googleOAuthAvailable && (
                <>
                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* Google Login */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    className="w-full h-12 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                    disabled={loading}
                  >
                    <Chrome className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="font-semibold text-gray-700">
                      Continue with Google
                    </span>
                  </Button>
                </>
              )}
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                New to Commitly?{" "}
                <Link
                  href="/auth/signup"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Create your account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            By signing in, you agree to our{" "}
            <Link
              href="#"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="#"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
