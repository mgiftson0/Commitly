import { useState, useEffect, useMemo } from 'react'
import { Goal } from '@/lib/types/dashboard'

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const loadGoals = () => {
    try {
      const storedGoals = localStorage.getItem('goals')
      if (storedGoals) {
        const goalsData = JSON.parse(storedGoals)
        const mapped = goalsData.map((g: any) => {
          // Calculate real progress
          let realProgress = 0
          if (g.activities && Array.isArray(g.activities)) {
            if (g.type === 'multi-activity') {
              const completed = g.activities.filter((a: any) => a.completed).length
              realProgress = g.activities.length > 0 ? Math.round((completed / g.activities.length) * 100) : 0
            } else if (g.type === 'single-activity') {
              realProgress = g.activities[0]?.completed ? 100 : 0
            }
          }

          // Calculate streak
          let streak = 0
          if (g.scheduleType === 'recurring' && g.type !== 'single-activity') {
            const goalAge = Math.floor((Date.now() - new Date(g.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            if (goalAge >= 1) {
              streak = g.streak !== undefined ? g.streak : 0
            }
          }

          return {
            id: String(g.id),
            user_id: 'mock-user-id',
            title: g.title,
            description: g.description,
            goal_type: g.type === 'multi-activity' ? 'multi' : g.type === 'single-activity' ? 'single' : g.type,
            visibility: g.visibility,
            start_date: g.createdAt,
            is_suspended: g.status === 'paused',
            created_at: g.createdAt,
            updated_at: g.updatedAt || g.createdAt,
            completed_at: g.completedAt || null,
            progress: g.completedAt ? 100 : realProgress,
            streak: streak,
            dueDate: g.dueDate,
            priority: g.priority || 'medium'
          } as Goal
        })
        setGoals(mapped)
      }
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGoals()

    // Listen for storage changes
    const handleStorageChange = () => loadGoals()
    const handleGoalChange = () => loadGoals()

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      window.addEventListener('goalUpdated', handleGoalChange)
      window.addEventListener('goalDeleted', handleGoalChange)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('goalUpdated', handleGoalChange)
        window.removeEventListener('goalDeleted', handleGoalChange)
      }
    }
  }, [])

  const activeGoals = useMemo(() =>
    goals.filter(g => !g.completed_at && !g.is_suspended), [goals]
  )

  const completedGoals = useMemo(() =>
    goals.filter(g => g.completed_at), [goals]
  )

  const maxStreak = useMemo(() =>
    Math.max(...goals.map(g => g.streak || 0), 0), [goals]
  )

  const avgStreak = useMemo(() =>
    goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + (g.streak || 0), 0) / goals.length) : 0, [goals]
  )

  const todayStats = useMemo(() => ({
    completed: completedGoals.length,
    pending: activeGoals.length,
    streak: avgStreak,
    longestStreak: maxStreak
  }), [completedGoals.length, activeGoals.length, avgStreak, maxStreak])

  return {
    goals,
    loading,
    activeGoals,
    completedGoals,
    todayStats,
    loadGoals,
    maxStreak,
    avgStreak
  }
}
