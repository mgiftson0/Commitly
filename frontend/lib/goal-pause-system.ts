// Goal pause and resume system with streak handling
export type PauseReason = 'vacation' | 'illness' | 'personal' | 'other'

export interface GoalPauseState {
  isPaused: boolean
  pausedAt: string | null
  resumedAt: string | null
  pauseReason?: PauseReason
  streakPreserved: boolean
  pauseDuration: number // days paused
}

export interface PauseConfig {
  preserveStreak: boolean // Whether to preserve streak during pause
  maxPauseDuration?: number // Max days allowed to pause (null = unlimited)
  allowedPausesPerMonth?: number // Limit pause frequency
}

export class GoalPauseManager {
  /**
   * Pause a goal with streak preservation options
   */
  static pauseGoal(
    goalId: string,
    reason: PauseReason,
    preserveStreak: boolean = true
  ): GoalPauseState {
    const pauseDate = new Date().toISOString().split('T')[0]
    
    return {
      isPaused: true,
      pausedAt: pauseDate,
      resumedAt: null,
      pauseReason: reason,
      streakPreserved: preserveStreak,
      pauseDuration: 0
    }
  }

  /**
   * Resume a paused goal
   */
  static resumeGoal(
    pauseState: GoalPauseState,
    streakState: any // From streak-recovery-system
  ): { pauseState: GoalPauseState; streakState: any } {
    if (!pauseState.isPaused || !pauseState.pausedAt) {
      throw new Error('Goal is not currently paused')
    }

    const resumeDate = new Date().toISOString().split('T')[0]
    const pauseDuration = this.calculatePauseDuration(pauseState.pausedAt, resumeDate)

    const newPauseState: GoalPauseState = {
      ...pauseState,
      isPaused: false,
      resumedAt: resumeDate,
      pauseDuration
    }

    // Handle streak based on preservation setting
    let newStreakState = streakState
    if (!pauseState.streakPreserved) {
      // Reset streak if not preserved
      newStreakState = {
        ...streakState,
        currentStreak: 0,
        missedDays: 0,
        graceDaysUsed: 0
      }
    }
    // If preserved, streak continues as if no time passed

    return {
      pauseState: newPauseState,
      streakState: newStreakState
    }
  }

  /**
   * Check if goal should be active considering pause state
   */
  static isGoalActive(
    pauseState: GoalPauseState,
    goalSchedule: any,
    date: string
  ): boolean {
    if (pauseState.isPaused) return false
    
    // Use existing goal schedule system
    // return GoalScheduleCalculator.isActiveOnDate(goalSchedule, date)
    return true // Simplified
  }

  /**
   * Update streak considering pause state
   */
  static updateStreakWithPause(
    pauseState: GoalPauseState,
    streakState: any,
    date: string,
    wasCompleted: boolean
  ): any {
    // If goal is paused, don't update streak
    if (pauseState.isPaused) {
      return streakState
    }

    // If just resumed, handle first completion after resume
    if (pauseState.resumedAt === date && wasCompleted) {
      if (pauseState.streakPreserved) {
        // Continue streak as normal
        return {
          ...streakState,
          currentStreak: streakState.currentStreak + 1,
          longestStreak: Math.max(streakState.longestStreak, streakState.currentStreak + 1),
          lastCompletionDate: date
        }
      } else {
        // Start new streak
        return {
          ...streakState,
          currentStreak: 1,
          longestStreak: Math.max(streakState.longestStreak, 1),
          lastCompletionDate: date,
          missedDays: 0,
          graceDaysUsed: 0
        }
      }
    }

    // Use normal streak update logic
    // return StreakRecoveryCalculator.updateStreakWithRecovery(...)
    return streakState // Simplified
  }

  /**
   * Get pause status and options
   */
  static getPauseStatus(
    pauseState: GoalPauseState,
    config: PauseConfig
  ): {
    canPause: boolean
    canResume: boolean
    pauseMessage: string
    remainingPauseDays?: number
  } {
    if (pauseState.isPaused) {
      const daysPaused = pauseState.pausedAt 
        ? this.calculatePauseDuration(pauseState.pausedAt, new Date().toISOString().split('T')[0])
        : 0

      const remainingDays = config.maxPauseDuration 
        ? Math.max(0, config.maxPauseDuration - daysPaused)
        : undefined

      return {
        canPause: false,
        canResume: true,
        pauseMessage: `Goal paused for ${daysPaused} days${pauseState.streakPreserved ? ' (streak preserved)' : ' (streak reset)'}`,
        remainingPauseDays: remainingDays
      }
    }

    return {
      canPause: true,
      canResume: false,
      pauseMessage: 'Goal is active'
    }
  }

  /**
   * Calculate days between pause and resume
   */
  private static calculatePauseDuration(pauseDate: string, resumeDate: string): number {
    const pause = new Date(pauseDate)
    const resume = new Date(resumeDate)
    return Math.floor((resume.getTime() - pause.getTime()) / (1000 * 60 * 60 * 24))
  }

  /**
   * Validate pause request
   */
  static validatePauseRequest(
    pauseState: GoalPauseState,
    config: PauseConfig,
    currentMonth: string
  ): { valid: boolean; reason?: string } {
    if (pauseState.isPaused) {
      return { valid: false, reason: 'Goal is already paused' }
    }

    // Check pause frequency limits (would need database query)
    // if (config.allowedPausesPerMonth) {
    //   const pausesThisMonth = getPausesForMonth(goalId, currentMonth)
    //   if (pausesThisMonth >= config.allowedPausesPerMonth) {
    //     return { valid: false, reason: 'Monthly pause limit reached' }
    //   }
    // }

    return { valid: true }
  }
}

// Database schema additions:
/*
-- Add to goals table
ALTER TABLE goals ADD COLUMN pause_state JSONB DEFAULT '{"isPaused": false, "streakPreserved": true}';
ALTER TABLE goals ADD COLUMN pause_config JSONB DEFAULT '{"preserveStreak": true}';

-- Goal pause history
CREATE TABLE goal_pauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  paused_at DATE NOT NULL,
  resumed_at DATE,
  pause_reason TEXT,
  streak_preserved BOOLEAN DEFAULT true,
  duration_days INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
*/