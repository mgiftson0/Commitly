'use client';

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";
import type { UserProfile, AuthError, UsernameCheck, EmailCheck } from "@/types/auth";

// Supabase URL and Key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Username validation regex
const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

// Create Supabase client (Next.js Auth Helpers uses cookies for SSR compatibility)
export const supabase = createClientComponentClient<Database>();

// Auth helper functions
export const authHelpers = {
  signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
    if (error) throw error;
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  getKycStatus: async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) return false;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return false;
      }

      // If we have any profile data, KYC is completed
      return !!data;
    } catch (err) {
      console.error('Error checking KYC status:', err);
      return false;
    }
  },

  isGoogleOAuthAvailable: async (): Promise<boolean> => {
    // Client-side capability check. We can't query provider settings from the browser.
    // Treat Google OAuth as available if Supabase env vars are configured.
    return Boolean(supabaseUrl && supabaseAnonKey);
  }
};