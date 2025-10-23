import { supabase } from './supabase-client'

export async function checkAndUnlockAchievements(userId: string, action: string, data?: any) {
  try {
    // Get user's current achievements
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)

    const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || [])

    // Get all achievements
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')

    if (!achievements) return

    const newAchievements = []

    for (const achievement of achievements) {
      if (unlockedIds.has(achievement.id)) continue

      let shouldUnlock = false

      switch (achievement.name) {
        case 'First Goal':
          if (action === 'goal_created') {
            const { data: goals } = await supabase
              .from('goals')
              .select('id')
              .eq('user_id', userId)
            shouldUnlock = (goals?.length || 0) >= 1
          }
          break

        case 'Goal Achiever':
          if (action === 'goal_completed') {
            const { data: completedGoals } = await supabase
              .from('goals')
              .select('id')
              .eq('user_id', userId)
              .eq('status', 'completed')
            shouldUnlock = (completedGoals?.length || 0) >= 1
          }
          break

        case 'Goal Master':
          if (action === 'goal_completed') {
            const { data: completedGoals } = await supabase
              .from('goals')
              .select('id')
              .eq('user_id', userId)
              .eq('status', 'completed')
            shouldUnlock = (completedGoals?.length || 0) >= 10
          }
          break

        case 'Social Butterfly':
          if (action === 'partner_added') {
            const { data: partners } = await supabase
              .from('accountability_partners')
              .select('id')
              .or(`user_id.eq.${userId},partner_id.eq.${userId}`)
              .eq('status', 'accepted')
            shouldUnlock = (partners?.length || 0) >= 1
          }
          break
      }

      if (shouldUnlock) {
        // Unlock achievement
        await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id
          })

        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Achievement Unlocked!',
            message: `You earned "${achievement.name}" - ${achievement.description}`,
            type: 'achievement_unlocked',
            read: false,
            data: { achievement_id: achievement.id }
          })

        newAchievements.push(achievement)
      }
    }

    return newAchievements
  } catch (error) {
    console.error('Error checking achievements:', error)
    return []
  }
}