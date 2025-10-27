import { supabase } from './supabase-client'

export interface StreakData {
  goalId: string
  userId: string
  currentStreak: number
  longestStreak: number
  lastActivityDate: string
  streakType: 'individual' | 'group' | 'partner' | 'seasonal'
}

export interface ActivityData {
  goalId: string
  userId: string
  activityDate: string
  completed: boolean
  notes?: string
}

export class StreakSystem {
  // Individual goal streak logic
  static async updateIndividualStreak(goalId: string, userId: string, completed: boolean): Promise<StreakData> {
    const today = new Date().toISOString().split('T')[0]
    
    // Get current streak data
    const { data: currentStreak } = await supabase
      .from('goal_streaks')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', userId)
      .eq('streak_type', 'individual')
      .single()

    // Record today's activity
    await supabase
      .from('goal_activities')
      .upsert({
        goal_id: goalId,
        user_id: userId,
        activity_date: today,
        completed
      })

    if (!currentStreak) {
      // Create new streak record
      const newStreak = {
        goal_id: goalId,
        user_id: userId,
        current_streak: completed ? 1 : 0,
        longest_streak: completed ? 1 : 0,
        last_activity_date: today,
        streak_type: 'individual'
      }
      
      await supabase.from('goal_streaks').insert(newStreak)
      return {
        goalId: newStreak.goal_id,
        userId: newStreak.user_id,
        currentStreak: newStreak.current_streak,
        longestStreak: newStreak.longest_streak,
        lastActivityDate: newStreak.last_activity_date,
        streakType: newStreak.streak_type
      }
    }

    // Calculate new streak
    const lastDate = new Date(currentStreak.last_activity_date)
    const todayDate = new Date(today)
    const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    let newCurrentStreak = currentStreak.current_streak
    
    if (completed) {
      if (daysDiff === 1) {
        // Consecutive day
        newCurrentStreak += 1
      } else if (daysDiff === 0) {
        // Same day update
        newCurrentStreak = Math.max(1, currentStreak.current_streak)
      } else {
        // Gap in days - reset streak
        newCurrentStreak = 1
      }
    } else {
      if (daysDiff >= 1) {
        // Missed day - reset streak
        newCurrentStreak = 0
      }
    }

    const newLongestStreak = Math.max(currentStreak.longest_streak, newCurrentStreak)

    // Update streak record
    const updatedStreak = {
      current_streak: newCurrentStreak,
      longest_streak: newLongestStreak,
      last_activity_date: today
    }

    await supabase
      .from('goal_streaks')
      .update(updatedStreak)
      .eq('goal_id', goalId)
      .eq('user_id', userId)
      .eq('streak_type', 'individual')

    return {
      goalId,
      userId,
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastActivityDate: today,
      streakType: 'individual'
    }
  }

  // Group goal streak logic
  static async updateGroupStreak(goalId: string, userId: string, completed: boolean): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    
    // Update individual streak within group
    await this.updateIndividualStreak(goalId, userId, completed)
    
    // Get all group members
    const { data: goal } = await supabase
      .from('goals')
      .select('*, goal_members(*)')
      .eq('id', goalId)
      .single()

    if (!goal?.goal_members) return

    // Check if all members completed today
    const { data: todayActivities } = await supabase
      .from('goal_activities')
      .select('user_id, completed')
      .eq('goal_id', goalId)
      .eq('activity_date', today)

    const memberIds = goal.goal_members.map((m: { user_id: string }) => m.user_id)
    const completedMembers = todayActivities?.filter((a: { completed: boolean; user_id: string }) => a.completed).map((a: { user_id: string }) => a.user_id) || []
    
    const participationRate = completedMembers.length / memberIds.length

    // Update group streak based on participation threshold (80%)
    if (participationRate >= 0.8) {
      await this.updateGroupCollectiveStreak(goalId, true)
    } else {
      await this.updateGroupCollectiveStreak(goalId, false)
    }
  }

  // Group collective streak
  static async updateGroupCollectiveStreak(goalId: string, achieved: boolean): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data: groupStreak } = await supabase
      .from('goal_streaks')
      .select('*')
      .eq('goal_id', goalId)
      .eq('streak_type', 'group')
      .single()

    if (!groupStreak) {
      await supabase.from('goal_streaks').insert({
        goal_id: goalId,
        user_id: null, // Group streak has no specific user
        current_streak: achieved ? 1 : 0,
        longest_streak: achieved ? 1 : 0,
        last_activity_date: today,
        streak_type: 'group'
      })
      return
    }

    const lastDate = new Date(groupStreak.last_activity_date)
    const todayDate = new Date(today)
    const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    let newCurrentStreak = groupStreak.current_streak

    if (achieved) {
      if (daysDiff === 1) {
        newCurrentStreak += 1
      } else if (daysDiff === 0) {
        newCurrentStreak = Math.max(1, groupStreak.current_streak)
      } else {
        newCurrentStreak = 1
      }
    } else {
      if (daysDiff >= 1) {
        newCurrentStreak = 0
      }
    }

    await supabase
      .from('goal_streaks')
      .update({
        current_streak: newCurrentStreak,
        longest_streak: Math.max(groupStreak.longest_streak, newCurrentStreak),
        last_activity_date: today
      })
      .eq('goal_id', goalId)
      .eq('streak_type', 'group')
  }

  // Seasonal goal streak (weekly-based)
  static async updateSeasonalStreak(goalId: string, userId: string, milestoneCompleted: boolean): Promise<void> {
    const today = new Date()
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split('T')[0]
    
    // Record weekly milestone completion
    await supabase
      .from('goal_activities')
      .upsert({
        goal_id: goalId,
        user_id: userId,
        activity_date: weekStart,
        completed: milestoneCompleted,
        notes: 'Weekly milestone'
      })

    // Update weekly streak
    const { data: seasonalStreak } = await supabase
      .from('goal_streaks')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', userId)
      .eq('streak_type', 'seasonal')
      .single()

    if (!seasonalStreak) {
      await supabase.from('goal_streaks').insert({
        goal_id: goalId,
        user_id: userId,
        current_streak: milestoneCompleted ? 1 : 0,
        longest_streak: milestoneCompleted ? 1 : 0,
        last_activity_date: weekStart,
        streak_type: 'seasonal'
      })
      return
    }

    // Calculate weekly streak
    const lastWeek = new Date(seasonalStreak.last_activity_date)
    const currentWeek = new Date(weekStart)
    const weeksDiff = Math.floor((currentWeek.getTime() - lastWeek.getTime()) / (1000 * 60 * 60 * 24 * 7))

    let newCurrentStreak = seasonalStreak.current_streak

    if (milestoneCompleted) {
      if (weeksDiff === 1) {
        newCurrentStreak += 1
      } else if (weeksDiff === 0) {
        newCurrentStreak = Math.max(1, seasonalStreak.current_streak)
      } else {
        newCurrentStreak = 1
      }
    } else {
      if (weeksDiff >= 1) {
        newCurrentStreak = 0
      }
    }

    await supabase
      .from('goal_streaks')
      .update({
        current_streak: newCurrentStreak,
        longest_streak: Math.max(seasonalStreak.longest_streak, newCurrentStreak),
        last_activity_date: weekStart
      })
      .eq('goal_id', goalId)
      .eq('user_id', userId)
      .eq('streak_type', 'seasonal')
  }

  // Partner streak logic
  static async updatePartnerStreak(goalId: string, userId: string, partnerId: string, completed: boolean): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    
    // Update individual streaks first
    await this.updateIndividualStreak(goalId, userId, completed)
    
    // Check if partner also completed today
    const { data: partnerActivity } = await supabase
      .from('goal_activities')
      .select('completed')
      .eq('goal_id', goalId)
      .eq('user_id', partnerId)
      .eq('activity_date', today)
      .single()

    const bothCompleted = completed && partnerActivity?.completed

    // Update mutual streak
    const partnerStreakId = userId < partnerId ? `${goalId}-${userId}-${partnerId}` : `${goalId}-${partnerId}-${userId}`
    
    const { data: mutualStreak } = await supabase
      .from('goal_streaks')
      .select('*')
      .eq('goal_id', goalId)
      .eq('streak_type', 'partner')
      .single()

    if (!mutualStreak) {
      await supabase.from('goal_streaks').insert({
        goal_id: goalId,
        user_id: partnerStreakId, // Use combined ID for partner streaks
        current_streak: bothCompleted ? 1 : 0,
        longest_streak: bothCompleted ? 1 : 0,
        last_activity_date: today,
        streak_type: 'partner'
      })
      return
    }

    // Calculate mutual streak
    const lastDate = new Date(mutualStreak.last_activity_date)
    const todayDate = new Date(today)
    const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    let newCurrentStreak = mutualStreak.current_streak

    if (bothCompleted) {
      if (daysDiff === 1) {
        newCurrentStreak += 1
      } else if (daysDiff === 0) {
        newCurrentStreak = Math.max(1, mutualStreak.current_streak)
      } else {
        newCurrentStreak = 1
      }
    } else {
      if (daysDiff >= 1) {
        newCurrentStreak = 0
      }
    }

    await supabase
      .from('goal_streaks')
      .update({
        current_streak: newCurrentStreak,
        longest_streak: Math.max(mutualStreak.longest_streak, newCurrentStreak),
        last_activity_date: today
      })
      .eq('goal_id', goalId)
      .eq('streak_type', 'partner')
  }

  // Get streak data for display
  static async getStreakData(goalId: string, userId?: string): Promise<StreakData[]> {
    let query = supabase
      .from('goal_streaks')
      .select('*')
      .eq('goal_id', goalId)

    if (userId) {
      query = query.or(`user_id.eq.${userId},streak_type.eq.group,streak_type.eq.partner`)
    }

    const { data } = await query
    
    return (data || []).map(streak => ({
      goalId: streak.goal_id,
      userId: streak.user_id,
      currentStreak: streak.current_streak,
      longestStreak: streak.longest_streak,
      lastActivityDate: streak.last_activity_date,
      streakType: streak.streak_type
    }))
  }

  // Check if user can maintain streak (grace period logic)
  static async checkStreakGracePeriod(goalId: string, userId: string): Promise<boolean> {
    const { data: streak } = await supabase
      .from('goal_streaks')
      .select('last_activity_date, current_streak')
      .eq('goal_id', goalId)
      .eq('user_id', userId)
      .single()

    if (!streak || streak.current_streak === 0) return false

    const lastDate = new Date(streak.last_activity_date)
    const today = new Date()
    const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    // Allow 1 day grace period for streaks > 7 days
    return daysDiff <= 1 && streak.current_streak >= 7
  }
}