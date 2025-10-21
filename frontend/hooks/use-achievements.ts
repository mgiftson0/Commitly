import { useState, useEffect, useMemo } from 'react'
import { checkAchievements } from '@/lib/achievements'

export const useAchievements = (goals: any[]) => {
  const [achievements, setAchievements] = useState<any[]>([])

  useEffect(() => {
    if (goals.length > 0) {
      const userStats = {
        encouragementsSent: parseInt(localStorage.getItem('encouragementsSent') || '0')
      }
      const checkedAchievements = checkAchievements(goals, userStats)
      setAchievements(checkedAchievements)
    }
  }, [goals])

  const unlockedAchievements = useMemo(() =>
    achievements.filter(a => a.unlocked), [achievements]
  )

  const lockedAchievements = useMemo(() =>
    achievements.filter(a => !a.unlocked), [achievements]
  )

  return {
    achievements,
    unlockedAchievements,
    lockedAchievements
  }
}
