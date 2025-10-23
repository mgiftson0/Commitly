"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase, hasSupabase } from "@/lib/supabase";
import { authHelpers } from "@/lib/supabase-client";
import Link from "next/link";

export default function TestConfigPage() {
  const [checks, setChecks] = useState({
    envVars: false,
    supabaseConnection: false,
    hasSession: false,
    emailConfirmed: false,
    hasProfile: false,
  });
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    const results: any = {};

    try {
      // Check 1: Environment variables
      results.envVars = Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      // Check 2: Supabase connection
      results.supabaseConnection = hasSupabase();

      // Check 3: Current session
      if (results.supabaseConnection) {
        try {
          const session = await authHelpers.getSession();
          results.hasSession = !!session;
          setSessionInfo(session);

          if (session?.user) {
            results.emailConfirmed = !!session.user.email_confirmed_at;

            // Check 4: Profile exists
            try {
              const { data: profile } = await supabase!
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              results.hasProfile = !!profile;
            } catch (err) {
              results.hasProfile = false;
            }
          }
        } catch (err: any) {
          setError(`Session check failed: ${err.message}`);
        }
      }

      setChecks(results);
    } catch (err: any) {
      setError(`Diagnostic failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearSession = async () => {
    try {
      await authHelpers.clearSession();
      window.location.href = '/auth/login';
    } catch (err: any) {
      setError(`Clear session failed: ${err.message}`);
    }
  };

  const CheckItem = ({ label, status }: { label: string; status: boolean }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="font-medium">{label}</span>
      {status ? (
        <CheckCircle className="h-5 w-5 text-green-600" />
      ) : (
        <XCircle className="h-5 w-5 text-red-600" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Supabase Configuration Test
          </h1>
          <p className="text-gray-600">
            Diagnose authentication and email verification issues
          </p>
        </div>

        {/* Main Diagnostics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>System Checks</span>
              <Button onClick={runDiagnostics} size="sm" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  "Re-run Checks"
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-gray-600">Running diagnostics...</p>
              </div>
            ) : (
              <>
                <CheckItem label="Environment Variables Set" status={checks.envVars} />
                <CheckItem label="Supabase Connected" status={checks.supabaseConnection} />
                <CheckItem label="Active Session Exists" status={checks.hasSession} />
                {checks.hasSession && (
                  <>
                    <CheckItem label="Email Verified" status={checks.emailConfirmed} />
                    <CheckItem label="Profile Created" status={checks.hasProfile} />
                  </>
                )}
              </>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Info Card */}
        {sessionInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Current Session Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">User ID:</div>
                <div className="font-mono text-xs">{sessionInfo.user?.id}</div>
                
                <div className="font-medium">Email:</div>
                <div>{sessionInfo.user?.email}</div>
                
                <div className="font-medium">Email Confirmed:</div>
                <div>{sessionInfo.user?.email_confirmed_at ? (
                  <span className="text-green-600">✓ Yes</span>
                ) : (
                  <span className="text-red-600">✗ No</span>
                )}</div>
                
                <div className="font-medium">Created:</div>
                <div className="text-xs">{new Date(sessionInfo.user?.created_at).toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Issue Diagnosis */}
        <Card>
          <CardHeader>
            <CardTitle>Issue Diagnosis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!checks.envVars && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-medium text-yellow-900">❌ Environment Variables Missing</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Create a <code className="bg-yellow-100 px-1 rounded">.env.local</code> file with:
                </p>
                <pre className="bg-yellow-100 p-2 rounded mt-2 text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
                </pre>
              </div>
            )}

            {checks.hasSession && !checks.emailConfirmed && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="font-medium text-orange-900">⚠️ Email Not Verified</p>
                <p className="text-sm text-orange-700 mt-1">
                  You have an active session but your email is not verified. This is why you're being redirected to KYC.
                </p>
                <p className="text-sm text-orange-700 mt-2">
                  <strong>Solution:</strong> Clear your session and sign up again with email confirmation enabled.
                </p>
              </div>
            )}

            {checks.hasSession && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-900">ℹ️ Old Session Detected</p>
                <p className="text-sm text-blue-700 mt-1">
                  You have an existing session. This is why the signup page redirects you to KYC.
                </p>
                <Button onClick={clearSession} className="mt-2" size="sm">
                  Clear Session & Start Fresh
                </Button>
              </div>
            )}

            {!checks.hasSession && checks.supabaseConnection && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-900">✓ Ready for Signup</p>
                <p className="text-sm text-green-700 mt-1">
                  No active session. You can now test the signup flow.
                </p>
                <p className="text-sm text-green-700 mt-2">
                  <strong>Next step:</strong> Ensure email confirmation is enabled in Supabase Dashboard.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/auth/signup">
              <Button className="w-full" variant="outline">
                Go to Signup Page
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button className="w-full" variant="outline">
                Go to Login Page
              </Button>
            </Link>
            {checks.hasSession && (
              <Button onClick={clearSession} className="w-full" variant="destructive">
                Clear Session & Logout
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Supabase Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Supabase Email Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium mb-1">1. Enable Email Confirmation</p>
              <p className="text-gray-600">
                Supabase Dashboard → Authentication → Providers → Email → Enable "Confirm email" ✓
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">2. Configure Email Template</p>
              <p className="text-gray-600">
                Supabase Dashboard → Authentication → Email Templates → Confirm signup
              </p>
              <code className="block bg-gray-100 p-2 rounded mt-1">
                {"{{ .SiteURL }}/auth/callback"}
              </code>
            </div>
            <div>
              <p className="font-medium mb-1">3. Check Auth Logs</p>
              <p className="text-gray-600">
                Supabase Dashboard → Logs → Auth Logs (to see if emails are being sent)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Info</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">Supabase URL:</div>
              <div className="font-mono text-xs truncate">
                {process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set"}
              </div>
              
              <div className="font-medium">Anon Key:</div>
              <div className="font-mono text-xs">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
                  `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 
                  "Not set"}
              </div>
              
              <div className="font-medium">Has Supabase:</div>
              <div>{hasSupabase() ? "✓ Yes" : "✗ No"}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
