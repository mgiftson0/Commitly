import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { isGoogleOAuthEnabled } from "./config";

// Supabase URL and Key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "your-project-url-here" &&
  supabaseAnonKey !== "your-anon-key-here"
);

// Initialize Supabase client
const supabaseClient = isSupabaseConfigured 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Export the Supabase client
export const supabase = supabaseClient;

// Helper function to check if Supabase is available
export const hasSupabase = (): boolean => {
  return isSupabaseConfigured && supabaseClient !== null;
};

// Auth helper functions
export const authHelpers = {
  // Sign up with email and password
  signUp: async (
    email: string,
    password: string,
    metadata?: { full_name?: string },
  ) => {
    if (!hasSupabase()) {
      throw new Error(
        "Supabase is not configured. Please add your credentials to .env.local",
      );
    }

    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: typeof window !== 'undefined' 
          ? `${window.location.origin}/auth/callback` 
          : undefined,
      },
    });
    
    if (error) throw error;
    return data;
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    if (!hasSupabase()) {
      throw new Error(
        "Supabase is not configured. Please add your credentials to .env.local",
      );
    }

    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign in with Google OAuth
  signInWithGoogle: async () => {
    if (!hasSupabase()) {
      throw new Error(
        "Supabase is not configured. Please add your credentials to .env.local",
      );
    }

    try {
      const { data, error } = await supabase!.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        // Handle specific Google OAuth errors
        if (
          error.message?.includes("provider is not enabled") ||
          error.message?.includes("Unsupported provider")
        ) {
          throw new Error(
            "Google OAuth is not enabled in your Supabase project. Please enable it in: Authentication → Providers → Google",
          );
        }
        throw error;
      }
      return data;
    } catch (error: unknown) {
      // Re-throw with better error message
      const err = error as Error;
      if (
        err.message?.includes("provider is not enabled") ||
        err.message?.includes("Unsupported provider")
      ) {
        throw new Error(
          "Google OAuth is not enabled. Please enable it in your Supabase dashboard: Authentication → Providers → Google",
        );
      }
      throw err;
    }
  },

  // Check if Google OAuth is available
  isGoogleOAuthAvailable: async (): Promise<boolean> => {
    if (!hasSupabase()) {
      return false;
    }
    // Return the configuration setting from config.ts
    return isGoogleOAuthEnabled();
  },

  // Sign out
  signOut: async () => {
    if (!hasSupabase()) {
      throw new Error("Supabase is not configured");
    }

    const { error } = await supabase!.auth.signOut();
    if (error) throw error;

    // Clear local storage authentication state
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("currentUser");
    }
  },

  // Clear session completely
  clearSession: async () => {
    try {
      if (hasSupabase()) {
        await supabase!.auth.signOut();
      }
      
      // Clear all auth-related storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("currentUser");
        
        // Clear all auth cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      }
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  },

  // Get current user
  getUser: async () => {
    if (!hasSupabase()) {
      return null;
    }

    const {
      data: { user },
      error,
    } = await supabase!.auth.getUser();
    
    if (error) {
      console.error("Error getting user:", error);
      return null;
    }
    return user;
  },

  // Get current session
  getSession: async () => {
    if (!hasSupabase()) {
      return null;
    }

    try {
      const {
        data: { session },
        error,
      } = await supabase!.auth.getSession();
      
      if (error) {
        console.error("Error getting session:", error);
        // Don't clear session automatically - let caller decide
        return null;
      }
      return session;
    } catch (error) {
      console.error("Failed to get session:", error);
      // Don't clear session automatically - let caller decide
      return null;
    }
  },

  // Get KYC status
  getKycStatus: async () => {
    try {
      const session = await authHelpers.getSession();
      if (!session?.user) return false;

      const { data, error } = await supabase!
        .from('profiles')
        .select('has_completed_kyc')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.error('Error fetching KYC status:', error);
        return false;
      }

      return (data as { has_completed_kyc: boolean | null })?.has_completed_kyc === true;
    } catch (err) {
      console.error('Error checking KYC status:', err);
      return false;
    }
  },

  // Reset password - send email with reset link
  resetPassword: async (email: string) => {
    if (!hasSupabase()) {
      throw new Error(
        "Supabase is not configured. Please add your credentials to .env.local",
      );
    }

    const { data, error } = await supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) throw error;
    return data;
  },

  // Update password (for reset password flow)
  updatePassword: async (newPassword: string) => {
    if (!hasSupabase()) {
      throw new Error("Supabase is not configured");
    }

    const { data, error } = await supabase!.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    if (!hasSupabase()) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    return supabase!.auth.onAuthStateChange(callback);
  },
};

// Log environment variables and test connection in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log('Supabase Environment Configuration:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isConfigured: isSupabaseConfigured,
  });

  // Test the connection
  if (hasSupabase()) {
    supabase!.auth.getSession()
      .then(() => console.log('✓ Supabase connection successful'))
      .catch(err => console.error('✗ Supabase connection failed:', err));
  }
}

// Export types for TypeScript
export type SupabaseClient = typeof supabaseClient;
export type User = {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
  app_metadata?: {
    provider?: string;
    [key: string]: unknown;
  };
  created_at?: string;
};

export type Session = {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_at?: number;
};

// Default export
export default supabase;
