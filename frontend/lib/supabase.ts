import { createClient } from "@supabase/supabase-js";
import { isGoogleOAuthEnabled } from "./config";

// Supabase URL and Key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if Supabase is configured
const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "your-project-url-here" &&
    supabaseAnonKey !== "your-anon-key-here",
);

// Create Supabase client for browser
let supabaseClient: ReturnType<typeof createClient> | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage:
          typeof window !== "undefined" ? window.localStorage : undefined,
        flowType: "pkce",
      },
    });
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
}

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
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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
    } catch (error: any) {
      // Re-throw with better error message
      if (
        error.message?.includes("provider is not enabled") ||
        error.message?.includes("Unsupported provider")
      ) {
        throw new Error(
          "Google OAuth is not enabled. Please enable it in your Supabase dashboard: Authentication → Providers → Google",
        );
      }
      throw error;
    }
  },

  // Check if Google OAuth is available (helper function)
  // Reads from config.ts to determine if Google OAuth should be shown
  // To enable: Configure Google OAuth in Supabase dashboard, then set
  // enableGoogleOAuth to true in frontend/lib/config.ts
  isGoogleOAuthAvailable: async () => {
    if (!hasSupabase()) {
      return false;
    }
    // Return the configuration setting
    // Set to true in config.ts after configuring Google OAuth in Supabase
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

    const {
      data: { session },
      error,
    } = await supabase!.auth.getSession();
    if (error) {
      console.error("Error getting session:", error);
      return null;
    }
    return session;
  },

  // Reset password
  resetPassword: async (email: string) => {
    if (!hasSupabase()) {
      throw new Error(
        "Supabase is not configured. Please add your credentials to .env.local",
      );
    }

    const { data, error } = await supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password/confirm`,
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
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!hasSupabase()) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    return supabase!.auth.onAuthStateChange(callback);
  },
};

// Export types for TypeScript
export type SupabaseClient = typeof supabaseClient;
export type User = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
  app_metadata?: {
    provider?: string;
    [key: string]: any;
  };
  created_at?: string;
};

export type Session = {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_at?: number;
};

// Export configuration status
export { isSupabaseConfigured };

// Default export
export default supabase;
