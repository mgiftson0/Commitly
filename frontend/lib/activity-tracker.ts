// Activity tracker utility for managing recent activities and notifications

export const addActivity = (activity: {
  type: 'goal_completed' | 'streak_milestone' | 'partner_joined' | 'goal_created' | 'activity_completed' | 'encouragement_received' | 'achievement_unlocked'
  title: string
  message: string
  goalId?: string
  data?: any
}) => {
  try {
    // Create notification object
    const notification = {
      id: Date.now().toString(),
      title: activity.title,
      message: activity.message,
      type: activity.type,
      is_read: false,
      createdAt: new Date().toISOString(),
      related_goal_id: activity.goalId || null,
      data: activity.data || null
    }

    // Add to notifications
    const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]')
    const updatedNotifications = [notification, ...existingNotifications]
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications))

    // Trigger bell shake and sound
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('newNotification'))
      
      // Special handling for achievement notifications
      if (activity.type === 'achievement_unlocked') {
        window.dispatchEvent(new CustomEvent('achievementUnlocked', {
          detail: activity.data
        }))
      }
    }

    return notification
  } catch (error) {
    console.error('Failed to add activity:', error)
  }
}

export const getRecentActivities = (limit = 3) => {
  try {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
    return notifications
      .filter((n: any) => {
        // Only show activity-worthy notifications
        return ['goal_completed', 'streak_milestone', 'partner_joined', 'goal_created', 'activity_completed', 'encouragement_received'].includes(n.type)
      })
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  } catch {
    return []
  }
}

// Activity type definitions for better type safety
export const ACTIVITY_TYPES = {
  GOAL_COMPLETED: 'goal_completed',
  STREAK_MILESTONE: 'streak_milestone', 
  PARTNER_JOINED: 'partner_joined',
  GOAL_CREATED: 'goal_created',
  ACTIVITY_COMPLETED: 'activity_completed',
  ENCOURAGEMENT_RECEIVED: 'encouragement_received'
} as const

// Helper to create specific activity types
export const createGoalCompletedActivity = (goalTitle: string, goalId: string) => {
  const activity = addActivity({
    type: ACTIVITY_TYPES.GOAL_COMPLETED,
    title: 'Goal Completed! 🎉',
    message: `Congratulations! You completed your '${goalTitle}' goal.`,
    goalId
  })
  
  // Check for achievements after goal completion
  if (typeof window !== 'undefined') {
    import('./achievement-tracker').then(({ triggerAchievementCheck }) => {
      triggerAchievementCheck()
    })
  }
  
  return activity
}

export const createStreakMilestoneActivity = (goalTitle: string, streakDays: number, goalId: string) =>
  addActivity({
    type: ACTIVITY_TYPES.STREAK_MILESTONE,
    title: 'Streak Milestone! 🔥',
    message: `Amazing! You've maintained a ${streakDays}-day streak for '${goalTitle}'.`,
    goalId
  })

export const createActivityCompletedActivity = (activityTitle: string, goalTitle: string, goalId: string) =>
  addActivity({
    type: ACTIVITY_TYPES.ACTIVITY_COMPLETED,
    title: 'Activity Completed! ✅',
    message: `You completed '${activityTitle}' in your '${goalTitle}' goal.`,
    goalId
  })

export const createGoalCreatedActivity = (goalTitle: string, goalId: string) => {
  const activity = addActivity({
    type: ACTIVITY_TYPES.GOAL_CREATED,
    title: 'New Goal Created! 🎯',
    message: `You created a new goal: '${goalTitle}'. Time to make it happen!`,
    goalId
  })
  
  // Check for achievements after goal creation
  if (typeof window !== 'undefined') {
    import('./achievement-tracker').then(({ triggerAchievementCheck }) => {
      triggerAchievementCheck()
    })
  }
  
  return activity
}

// Test function to create a goal completion notification
export const testGoalCompletion = () => {
  createGoalCompletedActivity('Test Goal', 'test-123')
}