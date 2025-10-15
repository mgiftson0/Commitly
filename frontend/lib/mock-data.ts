// Mock data types that match the expected backend data structures

export type Goal = {
  id: string
  title: string
  description: string
  type: 'single' | 'multi' | 'recurring'
  status: 'active' | 'completed' | 'paused'
  progress: number
  streak: number
  total_completions: number
  visibility: 'private' | 'restricted' | 'public'
  created_at: string
  updated_at: string
  user_id: string
  category: string
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  is_suspended: boolean
  completed_at?: string
}

export type User = {
  id: string
  username: string
  display_name: string
  email: string
  phone_number: string
  bio?: string
  created_at: string
  updated_at: string
}

export type Notification = {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  user_id: string
  related_goal_id?: string
}

// Sample data for demonstration
export const sampleGoals: Goal[] = [
  {
    id: 'goal_1',
    title: 'Daily Exercise',
    description: 'Complete 30 minutes of exercise every day',
    type: 'recurring',
    status: 'active',
    progress: 75,
    streak: 5,
    total_completions: 12,
    visibility: 'private',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user_1',
    category: 'Health & Fitness',
    priority: 'high',
    is_suspended: false
  },
  {
    id: 'goal_2',
    title: 'Read 12 Books This Year',
    description: 'Read at least one book per month',
    type: 'multi',
    status: 'active',
    progress: 33,
    streak: 0,
    total_completions: 4,
    visibility: 'public',
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user_1',
    category: 'Learning',
    priority: 'medium',
    due_date: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString(),
    is_suspended: false
  },
  {
    id: 'goal_3',
    title: 'Learn TypeScript',
    description: 'Complete a comprehensive TypeScript course',
    type: 'single',
    status: 'completed',
    progress: 100,
    streak: 0,
    total_completions: 1,
    visibility: 'restricted',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    user_id: 'user_1',
    category: 'Career',
    priority: 'high',
    is_suspended: false,
    completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export const sampleUsers: User[] = [
  {
    id: 'user_1',
    username: 'demo_user',
    display_name: 'Demo User',
    email: 'demo@example.com',
    phone_number: '+1234567890',
    bio: 'Passionate about achieving goals and personal growth',
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const sampleNotifications: Notification[] = [
  {
    id: 'notif_1',
    title: 'Goal Completed! 🎉',
    message: 'Congratulations! You completed your "Daily Exercise" goal for today.',
    type: 'goal_completed',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user_id: 'user_1',
    related_goal_id: 'goal_1'
  },
  {
    id: 'notif_2',
    title: 'Streak Milestone! 🔥',
    message: 'Amazing! You\'ve maintained a 5-day exercise streak. Keep it up!',
    type: 'streak_milestone',
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    user_id: 'user_1',
    related_goal_id: 'goal_1'
  },
  {
    id: 'notif_3',
    title: 'Goal Reminder',
    message: 'Don\'t forget to work on your reading goal today!',
    type: 'reminder',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user_id: 'user_1',
    related_goal_id: 'goal_2'
  }
]

// Helper functions to initialize sample data in localStorage (deprecated - now handled by mock store)
// Keeping for backward compatibility
export function initializeSampleData() {
  // Sample data is now handled automatically by the mock store
  // This function can be removed in future cleanup
  return
}
