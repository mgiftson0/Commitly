import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Lazy initialization of Supabase client
let supabaseInstance: SupabaseClient | null = null

export const getSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  
  return supabaseInstance
}

// Don't initialize at module load - only when explicitly called
export const supabase = null

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  return createClientComponentClient()
}

// Helper to check if Supabase is configured
export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'))
}

// Database Types
export type User = {
  id: string
  username: string
  display_name: string
  phone_number: string
  email: string
  bio?: string
  profile_picture_url?: string
  created_at: string
  updated_at: string
}

export type Goal = {
  id: string
  user_id: string
  title: string
  description?: string
  goal_type: 'single' | 'multi' | 'recurring'
  visibility: 'public' | 'private' | 'restricted'
  start_date: string
  end_date?: string
  recurrence_pattern?: string
  recurrence_days?: string[]
  default_time_allocation?: number
  is_suspended: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

export type Activity = {
  id: string
  goal_id: string
  title: string
  description?: string
  is_completed: boolean
  completed_at?: string
  order_index: number
  created_at: string
  updated_at: string
}

export type Streak = {
  id: string
  goal_id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_completed_date?: string
  total_completions: number
  created_at: string
  updated_at: string
}

export type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  notification_type: 'goal_created' | 'goal_completed' | 'goal_missed' | 'accountability_request' | 'reminder' | 'partner_update'
  related_goal_id?: string
  related_user_id?: string
  is_read: boolean
  created_at: string
}

export type AccountabilityPartner = {
  id: string
  requester_id: string
  partner_id: string
  goal_id?: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  updated_at: string
}
