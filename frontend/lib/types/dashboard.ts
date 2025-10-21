// Dashboard-specific TypeScript interfaces
export interface TodayStats {
  completed: number
  pending: number
  streak: number
  longestStreak: number
}

export interface Activity {
  id: string
  type: string
  title: string
  description: string
  time: string
  icon: any
  color: string
  goalId?: string
}

export interface CategoryProgress {
  name: string
  completed: number
  total: number
  progress: number
  color: string
  icon: any
}

export interface Deadline {
  id: string
  title: string
  dueDate: string
  progress: number
  priority: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string
  goal_type: string
  visibility: string
  start_date: string
  is_suspended: boolean
  created_at: string
  updated_at: string
  completed_at: string | null
  progress: number
  streak: number
  dueDate?: string
  priority: string
}
