// Streak recovery and missed day handling system
export type StreakRecoveryMode = 'strict' | 'flexible' | 'grace_period'

export interface StreakState {
  currentStreak: number
  longestStreak: number
  lastCompletionDate: string | null
  missedDays: number
  graceDaysUsed: number
  streakFrozen: boolean
  freezeEndDate: string | null
}

export interface StreakConfig {
  recoveryMode: StreakRecoveryMode
  graceDays?: number // Days allowed to miss without breaking streak
  maxMissedDays?: number // Max consecutive missed days before permanent break
  allowStreakFreeze?: boolean // Allow users to freeze streak temporarily
  maxFreezePerMonth?: number // Limit freeze usage
}

export class StreakRecoveryCalculator {
  /**
   * Update streak considering missed days and recovery rules
   */
  static updateStreakWithRecovery(
    streakState: StreakState,
    config: StreakConfig,
    completionDate: string,
    wasCompleted: boolean,
    goalSchedule: any // From previous goal-schedule-system
  ): StreakState {
    const lastDate = streakState.lastCompletionDate
    const daysMissed = this.calculateMissedDays(lastDate, completionDate, goalSchedule)
    
    // Handle streak freeze
    if (streakState.streakFrozen && streakState.freezeEndDate) {
      if (new Date(completionDate) <= new Date(streakState.freezeEndDate)) {
        return { ...streakState } // Streak remains unchanged during freeze
      } else {
        // Unfreeze streak
        streakState = { ...streakState, streakFrozen: false, freezeEndDate: null }
      }
    }

    if (wasCompleted) {
      return this.handleCompletion(streakState, config, completionDate, daysMissed)
    } else {
      return this.handleMissedDay(streakState, config, completionDate, daysMissed)
    }
  }

  /**
   * Handle successful completion
   */
  private static handleCompletion(
    streakState: StreakState,
    config: StreakConfig,
    completionDate: string,
    daysMissed: number
  ): StreakState {
    let newStreak = streakState.currentStreak
    let newMissedDays = 0
    let graceDaysUsed = streakState.graceDaysUsed

    switch (config.recoveryMode) {
      case 'strict':
        // Any missed day breaks streak
        newStreak = daysMissed > 0 ? 1 : newStreak + 1
        break

      case 'flexible':
        // Allow recovery within max missed days limit
        if (daysMissed > 0 && daysMissed <= (config.maxMissedDays || 3)) {
          newStreak += 1 // Continue streak
        } else if (daysMissed > (config.maxMissedDays || 3)) {
          newStreak = 1 // Reset streak
        } else {
          newStreak += 1 // Normal continuation
        }
        break

      case 'grace_period':
        // Use grace days for missed days
        const graceDaysAvailable = (config.graceDays || 2) - graceDaysUsed
        if (daysMissed > 0 && daysMissed <= graceDaysAvailable) {
          graceDaysUsed += daysMissed
          newStreak += 1 // Continue streak using grace days
        } else if (daysMissed > graceDaysAvailable) {
          newStreak = 1 // Reset streak
          graceDaysUsed = 0 // Reset grace days for new streak
        } else {
          newStreak += 1 // Normal continuation
        }
        break
    }

    return {
      ...streakState,
      currentStreak: newStreak,
      longestStreak: Math.max(streakState.longestStreak, newStreak),
      lastCompletionDate: completionDate,
      missedDays: newMissedDays,
      graceDaysUsed
    }
  }

  /**
   * Handle missed day (no completion)
   */
  private static handleMissedDay(
    streakState: StreakState,
    config: StreakConfig,
    date: string,
    daysMissed: number
  ): StreakState {
    let newStreak = streakState.currentStreak
    let newMissedDays = streakState.missedDays + 1

    // Check if streak should be broken
    const shouldBreakStreak = this.shouldBreakStreak(config, newMissedDays, streakState.graceDaysUsed)

    if (shouldBreakStreak) {
      newStreak = 0
      newMissedDays = 0
    }

    return {
      ...streakState,
      currentStreak: newStreak,
      missedDays: newMissedDays
    }
  }

  /**
   * Calculate missed scheduled days between dates
   */
  private static calculateMissedDays(
    lastDate: string | null,
    currentDate: string,
    goalSchedule: any
  ): number {
    if (!lastDate) return 0

    const start = new Date(lastDate)
    const end = new Date(currentDate)
    let missedCount = 0
    let checkDate = new Date(start)
    checkDate.setDate(checkDate.getDate() + 1)

    while (checkDate < end) {
      // Use goal schedule system to check if this date was scheduled
      if (this.wasScheduledDay(goalSchedule, checkDate.toISOString().split('T')[0])) {
        missedCount++
      }
      checkDate.setDate(checkDate.getDate() + 1)
    }

    return missedCount
  }

  /**
   * Check if streak should be broken based on config
   */
  private static shouldBreakStreak(
    config: StreakConfig,
    missedDays: number,
    graceDaysUsed: number
  ): boolean {
    switch (config.recoveryMode) {
      case 'strict':
        return missedDays > 0

      case 'flexible':
        return missedDays > (config.maxMissedDays || 3)

      case 'grace_period':
        const graceDaysAvailable = (config.graceDays || 2) - graceDaysUsed
        return missedDays > graceDaysAvailable

      default:
        return true
    }
  }

  /**
   * Freeze streak temporarily (e.g., vacation, illness)
   */
  static freezeStreak(
    streakState: StreakState,
    config: StreakConfig,
    freezeDays: number
  ): StreakState | null {
    if (!config.allowStreakFreeze) return null

    const today = new Date()
    const freezeEndDate = new Date(today)
    freezeEndDate.setDate(freezeEndDate.getDate() + freezeDays)

    return {
      ...streakState,
      streakFrozen: true,
      freezeEndDate: freezeEndDate.toISOString().split('T')[0]
    }
  }

  /**
   * Get streak status and recovery options
   */
  static getStreakStatus(
    streakState: StreakState,
    config: StreakConfig
  ): {
    status: 'active' | 'at_risk' | 'broken' | 'frozen'
    canRecover: boolean
    graceDaysRemaining: number
    recoveryMessage: string
  } {
    if (streakState.streakFrozen) {
      return {
        status: 'frozen',
        canRecover: false,
        graceDaysRemaining: 0,
        recoveryMessage: `Streak frozen until ${streakState.freezeEndDate}`
      }
    }

    const graceDaysRemaining = config.recoveryMode === 'grace_period' 
      ? (config.graceDays || 2) - streakState.graceDaysUsed 
      : 0

    if (streakState.currentStreak === 0) {
      return {
        status: 'broken',
        canRecover: false,
        graceDaysRemaining: 0,
        recoveryMessage: 'Streak broken. Start a new streak!'
      }
    }

    if (streakState.missedDays > 0) {
      const canRecover = config.recoveryMode !== 'strict' && 
        (config.recoveryMode === 'flexible' 
          ? streakState.missedDays <= (config.maxMissedDays || 3)
          : graceDaysRemaining > 0)

      return {
        status: 'at_risk',
        canRecover,
        graceDaysRemaining,
        recoveryMessage: canRecover 
          ? `Complete today to continue your ${streakState.currentStreak}-day streak`
          : 'Streak will break if not completed today'
      }
    }

    return {
      status: 'active',
      canRecover: false,
      graceDaysRemaining,
      recoveryMessage: `${streakState.currentStreak}-day streak active`
    }
  }

  private static wasScheduledDay(goalSchedule: any, date: string): boolean {
    // Integration with goal-schedule-system
    // This would use the GoalScheduleCalculator.isActiveOnDate method
    return true // Simplified for now
  }
}

// Database schema additions:
/*
-- Add to goals table
ALTER TABLE goals ADD COLUMN streak_config JSONB DEFAULT '{"recoveryMode": "strict"}';
ALTER TABLE goals ADD COLUMN streak_state JSONB DEFAULT '{"currentStreak": 0, "longestStreak": 0, "missedDays": 0, "graceDaysUsed": 0, "streakFrozen": false}';

-- Streak freeze history
CREATE TABLE streak_freezes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  freeze_start DATE NOT NULL,
  freeze_end DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
*/