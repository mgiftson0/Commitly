import { notifications } from './notifications'

export class DueDateChecker {
  private static instance: DueDateChecker
  private intervalId: NodeJS.Timeout | null = null

  static getInstance(): DueDateChecker {
    if (!DueDateChecker.instance) {
      DueDateChecker.instance = new DueDateChecker()
    }
    return DueDateChecker.instance
  }

  start() {
    // Check every hour
    this.intervalId = setInterval(() => {
      this.checkDueDates()
    }, 60 * 60 * 1000)
    
    // Check immediately
    this.checkDueDates()
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private checkDueDates() {
    try {
      const goals = JSON.parse(localStorage.getItem('goals') || '[]')
      const now = new Date()
      
      goals.forEach((goal: any) => {
        if (!goal.dueDate || goal.completedAt || goal.status !== 'active') return
        
        const dueDate = new Date(goal.dueDate)
        const timeDiff = dueDate.getTime() - now.getTime()
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
        
        // Notify if due in 1 day or less (and not already notified today)
        if (daysDiff <= 1 && daysDiff >= 0) {
          const notificationKey = `due-${goal.id}-${dueDate.toDateString()}`
          const alreadyNotified = localStorage.getItem(notificationKey)
          
          if (!alreadyNotified) {
            notifications.goalDueSoon(goal.title, daysDiff)
            localStorage.setItem(notificationKey, 'true')
          }
        }
      })
    } catch (error) {
      console.error('Error checking due dates:', error)
    }
  }
}

export const dueDateChecker = DueDateChecker.getInstance()