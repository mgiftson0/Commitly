/**
 * Streak Management System
 * Handles all streak tracking logic for different goal types
 */

import { supabase, authHelpers } from "./supabase-client"

interface StreakData {
  id: string
  goal_id: string
  user_id: string
  current_streak: number
  longest_streak: number
  total_completions: number
  last_completed_at: string | null
  last_broken_at: string | null
  work_days_count: number
  freeze_uses_remaining: number
  grace_hours: number
}

interface StreakStatus {
  should_continue: boolean
  new_streak_value: number
  status: 'first_completion' | 'continued' | 'work_day_added' | 'broken' | 'freeze_available'
}

/**
 * Log goal completion and update streak
 */
export async function logGoalCompletion(
  goalId: string,
  goalType: 'single' | 'multi' | 'recurring',
  frequency: 'daily' | 'weekly' | 'monthly' = 'daily',
  activityId?: string
) {
  try {
    const user = await authHelpers.getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    // Check if already completed today
    const today = new Date().toISOString().split('T')[0]
    const { data: existingLog } = await supabase
      .from('goal_activity_logs')
      .select('id')
      .eq('goal_id', goalId)
      .eq('user_id', user.id)
      .gte('completed_at', `${today}T00:00:00`)
      .maybeSingle()

    if (existingLog) {
      return { success: false, message: 'Already completed today' }
    }

    // Calculate streak status
    const { data: streakStatus } = await supabase
      .rpc('calculate_streak_status', {
        p_goal_id: goalId,
        p_user_id: user.id,
        p_goal_type: goalType,
        p_frequency: frequency
      })
      .single()

    const status = streakStatus as StreakStatus

    // Log the completion
    const { error: logError } = await supabase
      .from('goal_activity_logs')
      .insert({
        goal_id: goalId,
        user_id: user.id,
        activity_id: activityId,
        was_late: status.status === 'freeze_available',
        completed_at: new Date().toISOString()
      })

    if (logError) throw logError

    // Update or create streak record
    const { data: existingStreak } = await supabase
      .from('goal_streaks')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingStreak) {
      // Update existing streak
      const newStreak = status.should_continue ? status.new_streak_value : 1
      const longestStreak = Math.max(newStreak, existingStreak.longest_streak)
      
      const { error: updateError } = await supabase
        .from('goal_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          total_completions: existingStreak.total_completions + 1,
          work_days_count: goalType === 'multi' ? status.new_streak_value : existingStreak.work_days_count,
          last_completed_at: new Date().toISOString(),
          last_broken_at: status.should_continue ? existingStreak.last_broken_at : new Date().toISOString()
        })
        .eq('id', existingStreak.id)

      if (updateError) throw updateError

      return {
        success: true,
        streak: newStreak,
        status: status.status,
        broke: !status.should_continue,
        isNewBest: newStreak > existingStreak.longest_streak
      }
    } else {
      // Create new streak record
      const { error: insertError } = await supabase
        .from('goal_streaks')
        .insert({
          goal_id: goalId,
          user_id: user.id,
          current_streak: 1,
          longest_streak: 1,
          total_completions: 1,
          work_days_count: goalType === 'multi' ? 1 : 0,
          last_completed_at: new Date().toISOString(),
          streak_started_at: new Date().toISOString()
        })

      if (insertError) throw insertError

      return {
        success: true,
        streak: 1,
        status: 'first_completion',
        broke: false,
        isNewBest: true
      }
    }
  } catch (error) {
    console.error('Error logging completion:', error)
    throw error
  }
}

/**
 * Get streak data for a goal
 */
export async function getGoalStreak(goalId: string, userId?: string) {
  try {
    const user = userId || (await authHelpers.getCurrentUser())?.id
    if (!user) return null

    const { data, error } = await supabase
      .from('goal_streaks')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', user)
      .maybeSingle()

    if (error) throw error
    return data as StreakData | null
  } catch (error) {
    console.error('Error fetching streak:', error)
    return null
  }
}

/**
 * Get all streaks for current user
 */
export async function getUserStreaks() {
  try {
    const user = await authHelpers.getCurrentUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('goal_streaks')
      .select(`
        *,
        goals:goal_id (
          title,
          goal_type,
          category
        )
      `)
      .eq('user_id', user.id)
      .order('current_streak', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching user streaks:', error)
    return []
  }
}

/**
 * Get leaderboard for a specific goal
 */
export async function getGoalLeaderboard(goalId: string) {
  try {
    const { data, error } = await supabase
      .from('goal_streaks_leaderboard')
      .select('*')
      .eq('goal_id', goalId)
      .order('streak_rank', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }
}

/**
 * Use streak freeze power-up
 */
export async function useStreakFreeze(goalId: string) {
  try {
    const user = await authHelpers.getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data: streak } = await supabase
      .from('goal_streaks')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', user.id)
      .single()

    if (!streak || streak.freeze_uses_remaining <= 0) {
      return { success: false, message: 'No freeze uses remaining' }
    }

    // Update streak to use freeze
    const { error } = await supabase
      .from('goal_streaks')
      .update({
        freeze_uses_remaining: streak.freeze_uses_remaining - 1,
        last_completed_at: new Date().toISOString() // Reset last completed to now
      })
      .eq('id', streak.id)

    if (error) throw error

    // Log the freeze usage
    await supabase
      .from('goal_activity_logs')
      .insert({
        goal_id: goalId,
        user_id: user.id,
        used_freeze: true,
        notes: 'Used streak freeze power-up',
        completed_at: new Date().toISOString()
      })

    return {
      success: true,
      message: 'Streak freeze activated!',
      remaining: streak.freeze_uses_remaining - 1
    }
  } catch (error) {
    console.error('Error using freeze:', error)
    throw error
  }
}

/**
 * Get user's overall streak statistics
 */
export async function getUserStreakStats() {
  try {
    const user = await authHelpers.getCurrentUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('user_streak_stats')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching streak stats:', error)
    return null
  }
}

/**
 * Check if users are mutual accountability partners
 */
export async function areMutualPartners(user1Id: string, user2Id: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('are_mutual_partners', {
        user1_id: user1Id,
        user2_id: user2Id
      })

    if (error) throw error
    return data as boolean
  } catch (error) {
    console.error('Error checking mutual partners:', error)
    return false
  }
}

/**
 * Get activity log for a goal
 */
export async function getGoalActivityLog(goalId: string, limit = 30) {
  try {
    const user = await authHelpers.getCurrentUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('goal_activity_logs')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching activity log:', error)
    return []
  }
}
