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
            Join Commitly
          </h1>
          <p className="text-gray-600">
            Start your journey to achieving your goals
          </p>

          {/* Show mode indicator */}
          {!useSupabase && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-700">
              <AlertCircle className="h-3 w-3" />
              Demo Mode - Using local storage
            </div>
          )}
        </div>

        {/* Signup Card */}
        <Card className="backdrop-blur-xl bg-white/80 shadow-2xl border-0 shadow-blue-100/50">
          <CardContent className="p-8">
            <form onSubmit={handleSignUp} className="space-y-6">
              {/* Full Name Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-sm font-medium text-gray-700"
                >
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                    className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200"
                    required
                    minLength={2}
                    maxLength={50}
                  />
                </div>
              </div>

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
                    onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                    className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200"
                    required
                    pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
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
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200"
                    required
                    minLength={6}
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
                <p className="text-xs text-gray-500">
                  Must be at least 6 characters long
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) =>
                    setAcceptTerms(checked as boolean)
                  }
                  className="mt-1"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-gray-600 leading-relaxed cursor-pointer"
                >
                  I agree to the{" "}
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
                </Label>
              </div>

              {/* Signup Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading || !acceptTerms}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating your account...
                  </div>
                ) : (
                  "Create Your Account"
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

                  {/* Google Signup */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignUp}
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

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Join thousands of goal achievers who are turning their dreams into
            reality
          </p>
        </div>
      </div>
    </div>
  );
}
