export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          first_name: string | null
          last_name: string | null
          phone_number: string | null
          email: string | null
          bio: string | null
          location: string | null
          website: string | null
          interests: string[] | null
          goal_categories: string[] | null
          profile_picture_url: string | null
          has_completed_kyc: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          email?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          interests?: string[] | null
          goal_categories?: string[] | null
          profile_picture_url?: string | null
          has_completed_kyc?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          email?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          interests?: string[] | null
          goal_categories?: string[] | null
          profile_picture_url?: string | null
          has_completed_kyc?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string | null
          title: string
          description: string | null
          target_date: string | null
          status: string | null
          created_at: string
          updated_at: string
          category: string | null
          priority: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          description?: string | null
          target_date?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
          category?: string | null
          priority?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          description?: string | null
          target_date?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
          category?: string | null
          priority?: string | null
        }
      }
      activities: {
        Row: {
          id: string
          goal_id: string | null
          user_id: string | null
          description: string
          activity_date: string
          created_at: string
        }
        Insert: {
          id?: string
          goal_id?: string | null
          user_id?: string | null
          description: string
          activity_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          goal_id?: string | null
          user_id?: string | null
          description?: string
          activity_date?: string
          created_at?: string
        }
      }
      accountability_partners: {
        Row: {
          id: string
          user_id: string | null
          partner_id: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          partner_id?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          partner_id?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          title: string
          message: string
          read: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          message: string
          read?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          message?: string
          read?: boolean | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}