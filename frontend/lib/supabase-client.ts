'use client';

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";
import type { UserProfile, AuthError, UsernameCheck, EmailCheck } from "@/types/auth";

// Supabase URL and Key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";



// Create Supabase client (Next.js Auth Helpers uses cookies for SSR compatibility)
export const supabase = createClientComponentClient<Database>();

// Simple auth helpers
export const authHelpers = {
  signUp: async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) throw error;
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },

  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
    return data;
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  hasCompletedKyc: async () => {
    const user = await authHelpers.getCurrentUser();
    if (!user) return false;
    
    const { data } = await supabase
      .from('profiles')
      .select('has_completed_kyc')
      .eq('id', user.id)
      .maybeSingle();
    
    return data?.has_completed_kyc === true;
  }
};