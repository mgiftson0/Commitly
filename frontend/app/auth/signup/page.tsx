"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Target,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Chrome,
  AlertCircle,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authHelpers, supabase } from "@/lib/supabase-client";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [googleOAuthAvailable, setGoogleOAuthAvailable] = useState(false);
  const [useSupabase, setUseSupabase] = useState(false);
  const router = useRouter();



  // Enable Supabase mode when env variables are present
  useEffect(() => {
    const hasEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    setUseSupabase(hasEnv);
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form fields
    if (!fullName.trim() || fullName.length < 2) {
      toast.error("Full name must be at least 2 characters long");
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(fullName)) {
      toast.error("Full name can only contain letters and spaces");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      toast.error("Password must contain at least one uppercase letter, one lowercase letter, and one number");
      return;
    }

    if (!acceptTerms) {
      toast.error("Please accept the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);

    try {
      const { user } = await authHelpers.signUp(email.toLowerCase(), password, fullName.trim());

      if (!user) {
        throw new Error("Failed to create account");
      }

      // Redirect to KYC for profile completion
      toast.success("Account created successfully! Please complete your profile.");
      
      // Refresh session to ensure cookies are synced
      await supabase.auth.refreshSession();
      
      // Small delay to ensure session is fully synced
      await new Promise(resolve => setTimeout(resolve, 500));
      
      router.push("/auth/kyc");
    } catch (error: any) {
      console.error("Signup error:", error);

      if (error.message?.includes("User already registered")) {
        toast.error("An account with this email already exists");
      } else if (error.message?.toLowerCase().includes("weak password")) {
        toast.error("Password is too weak. Please choose a stronger password");
      } else {
        toast.error("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      await authHelpers.signInWithGoogle();
      // User will be redirected to Google, then back to /auth/callback
    } catch (error) {
      console.error("Google signup error:", error);
      toast.error("Failed to sign up with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-100/50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-20 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-20 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-gradient-radial from-transparent via-indigo-50/10 to-transparent rounded-full" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/5 left-1/5 w-3 h-3 bg-indigo-400/40 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-2/5 right-1/3 w-2 h-2 bg-purple-400/30 rounded-full animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-pink-400/50 rounded-full animate-float" style={{ animationDelay: '5s' }} />
        <div className="absolute top-3/4 right-1/5 w-2.5 h-2.5 bg-indigo-400/35 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-600 rounded-2xl blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/20">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl" />
                <div className="relative">
                  <Target className="h-10 w-10 text-indigo-600 drop-shadow-lg" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                Join Commitly
              </h1>
              <p className="text-lg text-gray-600 font-medium">
                Start your journey to success today
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

          {/* Enhanced Signup Card */}
          <Card className="relative overflow-hidden bg-white/80 backdrop-blur-2xl shadow-2xl border-0 shadow-indigo-100/50">
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-indigo-50/30 to-purple-50/30" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <CardContent className="relative p-8 sm:p-10">
              <form onSubmit={handleSignUp} className="space-y-6">
                {/* Enhanced Name Field */}
                <div className="space-y-3">
                  <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-indigo-500" />
                    Full Name
                  </Label>
                  <div className="relative group">
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12 pl-12 pr-4 bg-gray-50/80 border-gray-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all duration-300 group-hover:shadow-md"
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <User className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Enhanced Email Field */}
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-indigo-500" />
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-12 pr-4 bg-gray-50/80 border-gray-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all duration-300 group-hover:shadow-md"
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Enhanced Password Field */}
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-indigo-500" />
                    Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-12 pr-12 bg-gray-50/80 border-gray-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all duration-300 group-hover:shadow-md"
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:text-indigo-500 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Enhanced Confirm Password Field */}
                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-indigo-500" />
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 pl-12 pr-12 bg-gray-50/80 border-gray-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all duration-300 group-hover:shadow-md"
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:text-indigo-500 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Enhanced Terms Checkbox */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                  <Checkbox
                    id="acceptTerms"
                    checked={acceptTerms}
                    onCheckedChange={setAcceptTerms}
                    className="mt-0.5 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                  />
                  <div className="text-sm">
                    <Label htmlFor="acceptTerms" className="font-medium text-gray-700 cursor-pointer">
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-indigo-600 hover:text-indigo-700 hover:underline font-semibold"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-indigo-600 hover:text-indigo-700 hover:underline font-semibold"
                      >
                        Privacy Policy
                      </Link>
                    </Label>
                    <p className="text-gray-500 mt-1">
                      Your data is secure and will never be shared with third parties.
                    </p>
                  </div>
                </div>

                {/* Enhanced Signup Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-indigo-200/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating your account...</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Your Account
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

                    {/* Enhanced Google Signup */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleSignUp}
                      className="w-full h-12 border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 shadow-sm hover:shadow-md"
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

              {/* Enhanced Login Link */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      href="/auth/login"
                      className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-all duration-200"
                    >
                      Sign in instead →
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Footer */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <span>🚀 Join 10K+ Achievers</span>
              <span>•</span>
              <span>💪 Build Better Habits</span>
              <span>•</span>
              <span>🎯 Reach Your Goals</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
