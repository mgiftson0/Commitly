export function createSampleStreakNotifications() {
  const sampleNotifications = [
    {
      id: 'streak-1',
      type: 'streak_started',
      title: 'Streak Started! 🔥',
      message: 'You started a streak for "Morning Workout"',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      is_read: false,
      related_goal_id: 'goal-1'
    },
    {
      id: 'streak-2',
      type: 'streak_milestone',
      title: '7-Day Streak! 🏆',
      message: 'Amazing! You\'ve maintained "Daily Reading" for 7 days',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      is_read: false,
      related_goal_id: 'goal-2'
    },
    {
      id: 'streak-3',
      type: 'streak_milestone',
      title: '30-Day Streak! 🎉',
      message: 'Incredible! You\'ve maintained "Learn Spanish" for 30 days',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      is_read: false,
      related_goal_id: 'goal-3'
    },
    {
      id: 'streak-4',
      type: 'streak_at_risk',
      title: 'Streak at Risk! ⚠️',
      message: 'Your 12-day streak for "Meditation Practice" is at risk. Complete it before midnight!',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      is_read: false,
      related_goal_id: 'goal-4'
    },
    {
      id: 'streak-5',
      type: 'streak_broken',
      title: 'Streak Ended 💔',
      message: 'Your 15-day streak for "Evening Workout" has ended. Start again tomorrow!',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      is_read: false,
      related_goal_id: 'goal-5'
    },
    {
      id: 'streak-6',
      type: 'group_streak_started',
      title: 'Group Streak Started! 👥🔥',
      message: 'Your group started a streak for "Team Fitness Challenge"',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      is_read: false,
      related_goal_id: 'group-goal-1'
    },
    {
      id: 'streak-7',
      type: 'group_streak_milestone',
      title: '14-Day Group Streak! 🎉',
      message: 'Your group has maintained "Morning Study Group" for 14 days together!',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      is_read: false,
      related_goal_id: 'group-goal-2'
    },
    {
      id: 'streak-8',
      type: 'group_streak_at_risk',
      title: 'Group Streak at Risk! 👥⚠️',
      message: 'The group\'s 21-day streak for "Code Review Sessions" needs your contribution!',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      is_read: false,
      related_goal_id: 'group-goal-3'
    },
    {
      id: 'streak-9',
      type: 'streak_milestone',
      title: '100-Day Streak! 🌟',
      message: 'LEGENDARY! You\'ve maintained "Daily Journaling" for 100 days straight!',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      is_read: false,
      related_goal_id: 'goal-6'
    },
    {
      id: 'streak-10',
      type: 'streak_continuing',
      title: 'Keep It Going! 💪',
      message: 'Day 45 of your "Healthy Eating" streak. You\'re doing amazing!',
      createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
      is_read: false,
      related_goal_id: 'goal-7'
    }
  ]

  // Add to existing notifications
  try {
    const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]')
    const allNotifications = [...existingNotifications, ...sampleNotifications]
    localStorage.setItem('notifications', JSON.stringify(allNotifications))
    
    // Trigger update events
    window.dispatchEvent(new CustomEvent('newNotification'))
    return true
  } catch (error) {
    console.error('Failed to create sample notifications:', error)
    return false
  }
}

// Auto-create sample notifications if none exist
export function initializeSampleNotifications() {
  try {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
    const hasStreakNotifications = notifications.some((n: any) => 
      ['streak_started', 'streak_milestone', 'streak_at_risk', 'streak_broken', 'group_streak_started', 'group_streak_milestone', 'group_streak_at_risk', 'streak_continuing'].includes(n.type)
    )
    
    if (!hasStreakNotifications) {
      createSampleStreakNotifications()
    }
  } catch (error) {
    console.error('Failed to initialize sample notifications:', error)
  }
}