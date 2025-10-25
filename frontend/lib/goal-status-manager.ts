import { supabase } from './supabase-client'

export interface GoalStatusInfo {
  id: string
  status: string
  start_date: string | null
  created_at: string
}

/**
 * Check if a goal can be edited based on its status and dates
 */
export function canEditGoal(goal: GoalStatusInfo): boolean {
  if (goal.status === 'completed') return false
  
  const today = new Date().toISOString().split('T')[0]
  const startDate = goal.start_date ? goal.start_date.split('T')[0] : null
  const isPending = goal.status === 'pending' || (startDate && startDate > today)
  
  if (isPending && startDate) {
    // For pending goals, allow edit until 5 hours before start date
    const startDateTime = new Date(startDate).getTime()
    const fiveHoursBeforeStart = startDateTime - (5 * 60 * 60 * 1000)
    return Date.now() <= fiveHoursBeforeStart
  } else {
    // For active goals, allow edit within 5 hours of creation
    const created = new Date(goal.created_at).getTime()
    const fiveHours = 5 * 60 * 60 * 1000
    return (Date.now() - created) <= fiveHours
  }
}

/**
 * Check if a goal can be updated (activities marked as complete)
 */
export function canUpdateGoal(goal: GoalStatusInfo): boolean {
  if (goal.status === 'completed') return false
  
  const today = new Date().toISOString().split('T')[0]
  const startDate = goal.start_date ? goal.start_date.split('T')[0] : null
  
  // Cannot update if goal is pending (start date in future)
  return !(goal.status === 'pending' || (startDate && startDate > today))
}

/**
 * Get the appropriate status badge info for a goal
 */
export function getGoalStatusBadge(goal: GoalStatusInfo) {
  const today = new Date().toISOString().split('T')[0]
  const startDate = goal.start_date ? goal.start_date.split('T')[0] : null
  
  if (goal.status === 'completed') {
    return { text: 'Completed', color: 'bg-green-600', icon: 'CheckCircle2' }
  }
  
  if (goal.status === 'pending' || (startDate && startDate > today)) {
    const daysUntilStart = startDate ? Math.ceil((new Date(startDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)) : 0
    return { 
      text: `Starts in ${daysUntilStart} day${daysUntilStart !== 1 ? 's' : ''}`, 
      color: 'bg-blue-600', 
      icon: 'Clock' 
    }
  }
  
  if (goal.status === 'paused') {
    return { text: 'Paused', color: 'bg-yellow-600', icon: 'Pause' }
  }
  
  return { text: 'Active', color: 'bg-green-600', icon: 'Target' }
}

/**
 * Activate pending goals that have reached their start date
 */
export async function activatePendingGoals(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('activate_pending_goals')
    
    if (error) {
      console.error('Error activating pending goals:', error)
      return 0
    }
    
    return data || 0
  } catch (error) {
    console.error('Error calling activate_pending_goals:', error)
    return 0
  }
}

/**
 * Validate start date constraints
 */
export function validateStartDate(startDate: string): { valid: boolean; error?: string } {
  const today = new Date()
  const start = new Date(startDate)
  
  // Check if start date is more than 2 months in future
  const twoMonthsFromNow = new Date()
  twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2)
  
  if (start > twoMonthsFromNow) {
    return { valid: false, error: 'Start date cannot be more than 2 months in the future' }
  }
  
  return { valid: true }
}

/**
 * Get time remaining for editing a pending goal
 */
export function getEditTimeRemaining(goal: GoalStatusInfo): string | null {
  if (goal.status !== 'pending' || !goal.start_date) return null
  
  const startDateTime = new Date(goal.start_date).getTime()
  const fiveHoursBeforeStart = startDateTime - (5 * 60 * 60 * 1000)
  const remaining = fiveHoursBeforeStart - Date.now()
  
  if (remaining <= 0) return null
  
  const hours = Math.floor(remaining / (60 * 60 * 1000))
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
  
  return `${hours}h ${minutes}m until start date`
}