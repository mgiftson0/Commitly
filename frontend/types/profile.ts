export interface Profile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  bio?: string;
  location?: string;
  website?: string;
  interests?: string[];
  goal_categories?: string[];
  profile_picture_url?: string;
  has_completed_kyc: boolean;
  created_at: string;
  updated_at: string;
  followers_count?: number;
  following_count?: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  goal_type?: string;
  deadline?: string;
  progress: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_public: boolean;
  partner_id?: string;
  is_seasonal?: boolean;
  duration_type?: string;
  status?: string;
  streak?: number;
  is_suspended?: boolean;
}

export interface Notification {
  id: string;
  type: 'goal_completed' | 'streak_milestone' | 'partner_joined' | 'goal_created' | 'activity_completed' | 'encouragement_received' | 'achievement_unlocked';
  title: string;
  message: string;
  user_id: string;
  created_at: string;
  read: boolean;
  read_at?: string;
  data?: any;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  unlocked_at?: string;
  progress?: number;
  requirements: {
    type: string;
    count: number;
  };
}

export interface CategoryStat {
  name: string;
  completed: number;
  total: number;
  progress?: number;
  standardGoals?: number;
  seasonalGoals?: number;
  color: string;
  icon: React.ComponentType;
}