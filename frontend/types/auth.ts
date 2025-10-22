export interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  bio?: string;
  profile_picture_url?: string;
  location?: string;
  website?: string;
  interests?: string[];
  goal_categories?: string[];
  has_completed_kyc: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface UsernameCheck {
  available: boolean;
  message: string;
}

export interface EmailCheck {
  available: boolean;
  message: string;
}