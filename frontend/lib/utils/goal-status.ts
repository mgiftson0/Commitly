/**
 * Goal Status Utilities
 * Provides smart status calculation for goals based on completion, pause, and due dates
 */

export interface GoalStatusInfo {
  status: 'completed' | 'paused' | 'overdue' | 'active' | 'upcoming'
  label: string
  color: string
  icon: string
  priority: number
}

export interface GoalWithStatus {
  id: string
  is_completed?: boolean
  is_suspended?: boolean
  is_paused?: boolean
  completed_at?: string
  target_date?: string
  end_date?: string
  start_date?: string
  resumed_at?: string
}

/**
 * Calculate comprehensive status for a goal
 */
export function getGoalStatus(goal: GoalWithStatus): GoalStatusInfo {
  // Priority 1: Completed
  if (goal.is_completed) {
    return {
      status: 'completed',
      label: 'Completed',
      color: 'bg-green-500 text-white',
      icon: 'CheckCircle2',
      priority: 1
    }
  }

  // Priority 2: Paused/Suspended
  if (goal.is_paused || goal.is_suspended) {
    return {
      status: 'paused',
      label: 'Paused',
      color: 'bg-yellow-500 text-white',
      icon: 'Pause',
      priority: 2
    }
  }

  // Check due date status
  const dueDate = goal.target_date || goal.end_date
  if (dueDate) {
    const now = new Date()
    const due = new Date(dueDate)
    
    // If resumed and past due date
    if (goal.resumed_at) {
      const resumedDate = new Date(goal.resumed_at)
      if (resumedDate > due) {
        return {
          status: 'overdue',
          label: 'Overdue (Resumed)',
          color: 'bg-red-500 text-white',
          icon: 'AlertTriangle',
          priority: 3
        }
      }
    }
    
    // Priority 3: Overdue
    if (now > due) {
      return {
        status: 'overdue',
        label: 'Overdue',
        color: 'bg-red-500 text-white',
        icon: 'AlertTriangle',
        priority: 3
      }
    }
    
    // Priority 5: Active (due soon - within 7 days)
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntilDue <= 7) {
      return {
        status: 'active',
        label: `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
        color: 'bg-orange-500 text-white',
        icon: 'Clock',
        priority: 4
      }
    }
  }

  // Check if upcoming (hasn't started yet)
  const startDate = goal.start_date ? new Date(goal.start_date) : null
  if (startDate && startDate > new Date()) {
    return {
      status: 'upcoming',
      label: 'Upcoming',
      color: 'bg-blue-500 text-white',
      icon: 'Calendar',
      priority: 5
    }
  }

  // Default: Active
  return {
    status: 'active',
    label: 'Active',
    color: 'bg-blue-600 text-white',
    icon: 'Target',
    priority: 4
  }
}

/**
 * Get formatted due date text with status awareness
 */
export function getDueDateText(goal: GoalWithStatus): string | null {
  if (goal.is_completed && goal.completed_at) {
    return `Completed ${new Date(goal.completed_at).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    })}`
  }

  if (goal.is_paused || goal.is_suspended) {
    return 'Paused'
  }

  const dueDate = goal.target_date || goal.end_date
  if (!dueDate) return null

  const now = new Date()
  const due = new Date(dueDate)
  const isOverdue = now > due

  // If resumed after due date
  if (goal.resumed_at && isOverdue) {
    const resumedDate = new Date(goal.resumed_at)
    if (resumedDate > due) {
      return `Overdue (Resumed ${new Date(resumedDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })})`
    }
  }

  if (isOverdue) {
    const daysOverdue = Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
    return `Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`
  }

  const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilDue === 0) {
    return 'Due today'
  } else if (daysUntilDue === 1) {
    return 'Due tomorrow'
  } else if (daysUntilDue <= 7) {
    return `Due in ${daysUntilDue} days`
  } else {
    return `Due ${due.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: due.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })}`
  }
}

/**
 * Check if goal can be updated (not completed or paused)
 */
export function canUpdateGoal(goal: GoalWithStatus): boolean {
  return !goal.is_completed && !goal.is_paused && !goal.is_suspended
}

/**
 * Get status badge variant for UI components
 */
export function getStatusBadgeVariant(status: GoalStatusInfo['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default'
    case 'paused':
      return 'secondary'
    case 'overdue':
      return 'destructive'
    case 'active':
      return 'default'
    case 'upcoming':
      return 'outline'
    default:
      return 'outline'
  }
}
