// Multi-activity streak system for goals with multiple activities
export interface ActivityStreak {
  activityId: string
  currentStreak: number
  longestStreak: number
  lastCompletedDate: string | null
}

export interface GoalStreakConfig {
  requirementType: 'all' | 'any' | 'minimum' | 'percentage'
  minimumRequired?: number // For 'minimum' type
  percentageRequired?: number // For 'percentage' type (0-100)
}

export interface MultiActivityGoal {
  id: string
  activities: Array<{
    id: string
    name: string
    required: boolean
  }>
  streakConfig: GoalStreakConfig
  activityStreaks: ActivityStreak[]
  goalStreak: {
    current: number
    longest: number
    lastValidDate: string | null
  }
}

export class MultiActivityStreakCalculator {
  /**
   * Calculate if goal streak continues based on activity completions for a date
   */
  static calculateGoalStreakForDate(
    goal: MultiActivityGoal,
    date: string,
    completedActivities: string[]
  ): boolean {
    const { streakConfig, activities } = goal
    const requiredActivities = activities.filter(a => a.required)
    const totalActivities = activities.length
    
    switch (streakConfig.requirementType) {
      case 'all':
        // All activities must be completed
        return activities.every(activity => 
          completedActivities.includes(activity.id)
        )
      
      case 'any':
        // At least one activity must be completed
        return completedActivities.length > 0
      
      case 'minimum':
        // Minimum number of activities must be completed
        const minRequired = streakConfig.minimumRequired || 1
        return completedActivities.length >= minRequired
      
      case 'percentage':
        // Percentage of activities must be completed
        const percentRequired = streakConfig.percentageRequired || 50
        const requiredCount = Math.ceil((totalActivities * percentRequired) / 100)
        return completedActivities.length >= requiredCount
      
      default:
        return false
    }
  }

  /**
   * Update activity streaks based on completions
   */
  static updateActivityStreaks(
    activityStreaks: ActivityStreak[],
    date: string,
    completedActivities: string[]
  ): ActivityStreak[] {
    return activityStreaks.map(streak => {
      const wasCompleted = completedActivities.includes(streak.activityId)
      const lastDate = streak.lastCompletedDate
      const isConsecutive = lastDate ? 
        this.isConsecutiveDay(lastDate, date) : false

      if (wasCompleted) {
        const newStreak = isConsecutive || !lastDate ? streak.currentStreak + 1 : 1
        return {
          ...streak,
          currentStreak: newStreak,
          longestStreak: Math.max(streak.longestStreak, newStreak),
          lastCompletedDate: date
        }
      } else {
        // Reset streak if not completed and was expected
        return {
          ...streak,
          currentStreak: isConsecutive ? 0 : streak.currentStreak,
          lastCompletedDate: streak.lastCompletedDate
        }
      }
    })
  }

  /**
   * Update goal-level streak
   */
  static updateGoalStreak(
    goal: MultiActivityGoal,
    date: string,
    completedActivities: string[]
  ): MultiActivityGoal {
    const goalStreakValid = this.calculateGoalStreakForDate(goal, date, completedActivities)
    const lastValidDate = goal.goalStreak.lastValidDate
    const isConsecutive = lastValidDate ? this.isConsecutiveDay(lastValidDate, date) : false

    let newGoalStreak = goal.goalStreak.current

    if (goalStreakValid) {
      newGoalStreak = isConsecutive || !lastValidDate ? newGoalStreak + 1 : 1
    } else if (isConsecutive) {
      // Break streak if requirements not met
      newGoalStreak = 0
    }

    return {
      ...goal,
      activityStreaks: this.updateActivityStreaks(goal.activityStreaks, date, completedActivities),
      goalStreak: {
        current: newGoalStreak,
        longest: Math.max(goal.goalStreak.longest, newGoalStreak),
        lastValidDate: goalStreakValid ? date : goal.goalStreak.lastValidDate
      }
    }
  }

  /**
   * Get overall user streak across all goals
   */
  static calculateOverallStreak(
    goals: MultiActivityGoal[],
    date: string
  ): number {
    // User maintains overall streak if ANY goal has a valid streak for the date
    const hasAnyValidStreak = goals.some(goal => {
      const lastValidDate = goal.goalStreak.lastValidDate
      return lastValidDate === date && goal.goalStreak.current > 0
    })

    return hasAnyValidStreak ? 1 : 0 // Return 1 if streak continues, 0 if broken
  }

  private static isConsecutiveDay(lastDate: string, currentDate: string): boolean {
    const last = new Date(lastDate)
    const current = new Date(currentDate)
    const diffTime = current.getTime() - last.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays === 1
  }
}

// Database schema additions needed:
/*
-- Add to goals table
ALTER TABLE goals ADD COLUMN streak_config JSONB DEFAULT '{"requirementType": "all"}';

-- Activity streaks table
CREATE TABLE activity_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Goal streaks table (separate from individual activity streaks)
CREATE TABLE goal_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_valid_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Overall user streaks
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
*/