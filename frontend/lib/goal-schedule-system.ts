// Comprehensive goal scheduling and completion system
export type ScheduleType = 'once' | 'daily' | 'weekly' | 'monthly' | 'custom'
export type EndCondition = 'date' | 'completions' | 'streak' | 'never'

export interface SchedulePattern {
  type: ScheduleType
  frequency?: number // For custom patterns (e.g., every 3 days)
  daysOfWeek?: number[] // 0-6, Sunday=0
  daysOfMonth?: number[] // 1-31
  customDates?: string[] // Specific dates for 'once' type
}

export interface EndCondition {
  type: EndCondition
  endDate?: string
  targetCompletions?: number
  targetStreak?: number
}

export interface GoalSchedule {
  id: string
  pattern: SchedulePattern
  endCondition: EndCondition
  startDate: string
  isActive: boolean
  completions: number
  currentStreak: number
  longestStreak: number
}

export class GoalScheduleCalculator {
  /**
   * Check if goal should be active on a specific date
   */
  static isActiveOnDate(schedule: GoalSchedule, date: string): boolean {
    const targetDate = new Date(date)
    const startDate = new Date(schedule.startDate)
    
    // Check if date is after start date
    if (targetDate < startDate) return false
    
    // Check end conditions
    if (!this.isWithinEndCondition(schedule, date)) return false
    
    // Check schedule pattern
    return this.matchesSchedulePattern(schedule.pattern, date, schedule.startDate)
  }

  /**
   * Check if goal is within end condition limits
   */
  private static isWithinEndCondition(schedule: GoalSchedule, date: string): boolean {
    const { endCondition } = schedule
    
    switch (endCondition.type) {
      case 'date':
        return endCondition.endDate ? new Date(date) <= new Date(endCondition.endDate) : true
      
      case 'completions':
        return endCondition.targetCompletions ? 
          schedule.completions < endCondition.targetCompletions : true
      
      case 'streak':
        return endCondition.targetStreak ? 
          schedule.longestStreak < endCondition.targetStreak : true
      
      case 'never':
        return true
      
      default:
        return true
    }
  }

  /**
   * Check if date matches schedule pattern
   */
  private static matchesSchedulePattern(
    pattern: SchedulePattern, 
    date: string, 
    startDate: string
  ): boolean {
    const targetDate = new Date(date)
    const start = new Date(startDate)
    
    switch (pattern.type) {
      case 'once':
        // Single occurrence - check if date is in customDates or is startDate
        return pattern.customDates?.includes(date) || date === startDate
      
      case 'daily':
        // Every day or every N days
        if (!pattern.frequency || pattern.frequency === 1) return true
        const daysDiff = Math.floor((targetDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        return daysDiff % pattern.frequency === 0
      
      case 'weekly':
        // Specific days of week
        const dayOfWeek = targetDate.getDay()
        return pattern.daysOfWeek?.includes(dayOfWeek) || false
      
      case 'monthly':
        // Specific days of month
        const dayOfMonth = targetDate.getDate()
        return pattern.daysOfMonth?.includes(dayOfMonth) || false
      
      case 'custom':
        // Custom pattern logic can be extended
        return this.evaluateCustomPattern(pattern, date, startDate)
      
      default:
        return false
    }
  }

  /**
   * Custom pattern evaluation (extensible)
   */
  private static evaluateCustomPattern(
    pattern: SchedulePattern,
    date: string,
    startDate: string
  ): boolean {
    // Implement custom logic based on pattern configuration
    // This can be extended for complex patterns like "every 2 weeks on Monday and Friday"
    return false
  }

  /**
   * Update goal completion and streaks
   */
  static updateGoalCompletion(
    schedule: GoalSchedule,
    completionDate: string,
    wasCompleted: boolean
  ): GoalSchedule {
    if (!this.isActiveOnDate(schedule, completionDate)) {
      return schedule // Goal not active on this date
    }

    const lastCompletionDate = this.getLastCompletionDate(schedule)
    const isConsecutive = lastCompletionDate ? 
      this.isConsecutiveScheduledDay(schedule, lastCompletionDate, completionDate) : false

    let newStreak = schedule.currentStreak
    let newCompletions = schedule.completions

    if (wasCompleted) {
      newCompletions += 1
      newStreak = isConsecutive || schedule.currentStreak === 0 ? newStreak + 1 : 1
    } else if (isConsecutive) {
      // Break streak if goal was expected but not completed
      newStreak = 0
    }

    // Check if goal should be marked as completed based on end condition
    const isGoalCompleted = this.checkGoalCompletion({
      ...schedule,
      completions: newCompletions,
      currentStreak: newStreak,
      longestStreak: Math.max(schedule.longestStreak, newStreak)
    })

    return {
      ...schedule,
      completions: newCompletions,
      currentStreak: newStreak,
      longestStreak: Math.max(schedule.longestStreak, newStreak),
      isActive: !isGoalCompleted
    }
  }

  /**
   * Check if goal is completed based on end condition
   */
  private static checkGoalCompletion(schedule: GoalSchedule): boolean {
    const { endCondition } = schedule
    
    switch (endCondition.type) {
      case 'completions':
        return endCondition.targetCompletions ? 
          schedule.completions >= endCondition.targetCompletions : false
      
      case 'streak':
        return endCondition.targetStreak ? 
          schedule.longestStreak >= endCondition.targetStreak : false
      
      case 'date':
      case 'never':
      default:
        return false
    }
  }

  /**
   * Check if two dates are consecutive according to schedule pattern
   */
  private static isConsecutiveScheduledDay(
    schedule: GoalSchedule,
    lastDate: string,
    currentDate: string
  ): boolean {
    const pattern = schedule.pattern
    const last = new Date(lastDate)
    const current = new Date(currentDate)
    
    switch (pattern.type) {
      case 'once':
        return false // Single occurrence goals don't have consecutive days
      
      case 'daily':
        const expectedDays = pattern.frequency || 1
        const daysDiff = Math.floor((current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
        return daysDiff === expectedDays
      
      case 'weekly':
        // Find next scheduled day after lastDate
        return this.isNextScheduledDay(schedule, lastDate, currentDate)
      
      case 'monthly':
        return this.isNextScheduledDay(schedule, lastDate, currentDate)
      
      default:
        return false
    }
  }

  /**
   * Check if currentDate is the next scheduled day after lastDate
   */
  private static isNextScheduledDay(
    schedule: GoalSchedule,
    lastDate: string,
    currentDate: string
  ): boolean {
    const last = new Date(lastDate)
    const current = new Date(currentDate)
    
    // Find the next date after lastDate that matches the pattern
    let nextDate = new Date(last)
    nextDate.setDate(nextDate.getDate() + 1)
    
    while (nextDate <= current) {
      if (this.matchesSchedulePattern(schedule.pattern, nextDate.toISOString().split('T')[0], schedule.startDate)) {
        return nextDate.toISOString().split('T')[0] === currentDate
      }
      nextDate.setDate(nextDate.getDate() + 1)
    }
    
    return false
  }

  private static getLastCompletionDate(schedule: GoalSchedule): string | null {
    // This would typically come from the database
    // For now, return null - implement based on your completion tracking
    return null
  }
}

// Database schema additions:
/*
-- Update goals table
ALTER TABLE goals ADD COLUMN schedule_pattern JSONB DEFAULT '{"type": "daily"}';
ALTER TABLE goals ADD COLUMN end_condition JSONB DEFAULT '{"type": "never"}';
ALTER TABLE goals ADD COLUMN start_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE goals ADD COLUMN completions INTEGER DEFAULT 0;

-- Goal completions tracking
CREATE TABLE goal_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  completed BOOLEAN DEFAULT true,
  activities_completed JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(goal_id, completion_date)
);
*/