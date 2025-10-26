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
import { authHelpers, supabase } from "@/lib/supabase-client";
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



  // Enable Supabase mode when env variables are present
  useEffect(() => {
    const hasEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    setUseSupabase(hasEnv);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user } = await authHelpers.signIn(email, password);
      
      if (!user) {
        throw new Error("Login failed");
      }

      const hasKyc = await authHelpers.hasCompletedKyc();
      
      toast.success("Welcome back!");
      
      // Refresh session to ensure cookies are synced
      await supabase.auth.refreshSession();
      
      // Small delay to ensure session is fully synced
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (hasKyc) {
        router.push("/dashboard");
      } else {
        router.push("/auth/kyc");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Show specific error messages
      if (error.message?.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else if (error.message?.includes("Email not confirmed")) {
        toast.error("Please verify your email address before logging in");
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-indigo-400/15 to-purple-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-transparent via-blue-50/10 to-transparent rounded-full" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/40 rounded-full animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-cyan-400/30 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-indigo-400/50 rounded-full animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute top-2/3 right-1/4 w-2.5 h-2.5 bg-purple-400/35 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 rounded-2xl blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-2xl" />
                <div className="relative">
                  <Target className="h-10 w-10 text-blue-600 drop-shadow-lg" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-lg text-gray-600 font-medium">
                Continue your journey to success
              </p>
            </div>

            {/* Enhanced Mode Indicator */}
            {!useSupabase && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-full text-sm text-amber-700 shadow-sm">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Demo Mode Active</span>
              </div>
            )}
          </div>

          {/* Enhanced Login Card */}
          <Card className="relative overflow-hidden bg-white/80 backdrop-blur-2xl shadow-2xl border-0 shadow-blue-100/50">
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-blue-50/30 to-cyan-50/30" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500" />

            <CardContent className="relative p-8 sm:p-10">
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Enhanced Email Field */}
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-12 pr-4 bg-gray-50/80 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 group-hover:shadow-md"
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Enhanced Password Field */}
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-500" />
                    Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-12 pr-12 bg-gray-50/80 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 group-hover:shadow-md"
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:text-blue-500 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Enhanced Forgot Password */}
                <div className="flex justify-end">
                  <Link
                    href="/auth/reset-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200"
                  >
                    Forgot your password?
                  </Link>
                </div>

                {/* Enhanced Login Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-700 hover:via-cyan-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing you in...</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In to Your Account
                      <Target className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                {/* Enhanced Google OAuth Section */}
                {useSupabase && googleOAuthAvailable && (
                  <>
                    {/* Enhanced Divider */}
                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center">
                        <div className="bg-white px-4 text-sm text-gray-500 font-medium">
                          Or continue with
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Google Login */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleLogin}
                      className="w-full h-12 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md"
                      disabled={loading}
                    >
                      <Chrome className="h-5 w-5 mr-3 text-blue-600" />
                      <span className="font-semibold text-gray-700">
                        Continue with Google
                      </span>
                    </Button>
                  </>
                )}
              </form>

              {/* Enhanced Sign Up Link */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    New to Commitly?{" "}
                    <Link
                      href="/auth/signup"
                      className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200"
                    >
                      Create your account →
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Footer */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <span>🔒 Secure & Private</span>
              <span>•</span>
              <span>⚡ Fast & Reliable</span>
              <span>•</span>
              <span>🎯 Goal-Oriented</span>
            </div>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              By signing in, you agree to our{" "}
              <Link
                href="/terms"
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
