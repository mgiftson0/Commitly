import { seasonalGoalsApi } from './seasonal-goals-api'
import { cohortsApi } from './cohorts-api'

// Integration utilities for seasonal goals system
export const seasonalIntegration = {
  // Check if user can create seasonal goals
  canCreateSeasonalGoal(): boolean {
    return seasonalGoalsApi.isCreationWindowOpen()
  },

  // Get seasonal goal stats for dashboard
  async getSeasonalStats(userId: string) {
    try {
      const goals = await seasonalGoalsApi.getSeasonalGoals()
      const annual = goals.filter(g => g.duration_type === 'annual')
      const quarterly = goals.filter(g => g.duration_type === 'quarterly')
      const biannual = goals.filter(g => g.duration_type === 'biannual')
      
      return {
        total: goals.length,
        annual: annual.length,
        quarterly: quarterly.length,
        biannual: biannual.length,
        completed: goals.filter(g => g.is_completed).length,
        active: goals.filter(g => !g.is_completed).length
      }
    } catch (error) {
      console.error('Failed to get seasonal stats:', error)
      return { total: 0, annual: 0, quarterly: 0, biannual: 0, completed: 0, active: 0 }
    }
  },

  // Get next creation window dates
  getNextCreationWindow(): { start: Date; end: Date } {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    
    if (currentMonth === 12 && now.getDate() >= 15) {
      // Currently in window
      return {
        start: new Date(currentYear, 11, 15), // Dec 15
        end: new Date(currentYear + 1, 0, 15) // Jan 15 next year
      }
    } else if (currentMonth === 1 && now.getDate() <= 15) {
      // Currently in window
      return {
        start: new Date(currentYear - 1, 11, 15), // Dec 15 last year
        end: new Date(currentYear, 0, 15) // Jan 15 this year
      }
    } else {
      // Next window
      return {
        start: new Date(currentYear, 11, 15), // Dec 15 this year
        end: new Date(currentYear + 1, 0, 15) // Jan 15 next year
      }
    }
  }
}