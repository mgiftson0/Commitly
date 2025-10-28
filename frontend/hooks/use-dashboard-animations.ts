"use client"

import { useState, useEffect, useRef } from "react"

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  time: string
  icon: React.ComponentType<any>
  color: string
  goalId?: string
}

interface GoalItem {
  id: string
  title: string
  dueDate: string
  progress: number
  priority: string
}

export function useDashboardAnimations(
  activeGoals: any[],
  recentActivity: ActivityItem[],
  upcomingDeadlines: GoalItem[]
) {
  const [animationsLoaded, setAnimationsLoaded] = useState(false)
  const [exitingItems, setExitingItems] = useState<Set<string>>(new Set())
  const [enteringItems, setEnteringItems] = useState<Set<string>>(new Set())

  // Refs to track previous states for transition animations
  const prevActiveGoalsRef = useRef<any[]>([])
  const prevRecentActivityRef = useRef<ActivityItem[]>([])
  const prevUpcomingDeadlinesRef = useRef<GoalItem[]>([])

  useEffect(() => {
    const currentActiveGoals = activeGoals.slice(0, 3).map(g => g.id)
    const prevActiveGoals = prevActiveGoalsRef.current.map(g => g.id)

    const currentRecentActivity = recentActivity.slice(0, 3).map(a => a.id)
    const prevRecentActivity = prevRecentActivityRef.current.map(a => a.id)

    const currentUpcomingDeadlines = upcomingDeadlines.slice(0, 3).map(d => d.id)
    const prevUpcomingDeadlines = prevUpcomingDeadlinesRef.current.map(d => d.id)

    // Find exiting items (items that were in previous but not in current)
    const exiting = new Set([
      ...prevActiveGoals.filter(id => !currentActiveGoals.includes(id)),
      ...prevRecentActivity.filter(id => !currentRecentActivity.includes(id)),
      ...prevUpcomingDeadlines.filter(id => !currentUpcomingDeadlines.includes(id))
    ])

    // Find entering items (items that are in current but not in previous)
    const entering = new Set([
      ...currentActiveGoals.filter(id => !prevActiveGoals.includes(id)),
      ...currentRecentActivity.filter(id => !prevRecentActivity.includes(id)),
      ...currentUpcomingDeadlines.filter(id => !prevUpcomingDeadlines.includes(id))
    ])

    if (exiting.size > 0 || entering.size > 0) {
      setExitingItems(exiting)
      setEnteringItems(entering)

      // Clear exiting items after animation
      setTimeout(() => {
        setExitingItems(new Set())
      }, 600)

      // Clear entering items after animation completes
      setTimeout(() => {
        setEnteringItems(new Set())
      }, 1000)
    }

    // Update refs
    prevActiveGoalsRef.current = activeGoals.slice(0, 3)
    prevRecentActivityRef.current = recentActivity.slice(0, 3)
    prevUpcomingDeadlinesRef.current = upcomingDeadlines.slice(0, 3)
  }, [activeGoals, recentActivity, upcomingDeadlines])

  // Trigger animations after loading completes
  useEffect(() => {
    if (!animationsLoaded) {
      const timer = setTimeout(() => {
        setAnimationsLoaded(true)
      }, 300) // Increased delay to ensure smooth loading experience
      return () => clearTimeout(timer)
    }
  }, [animationsLoaded])

  return {
    animationsLoaded,
    exitingItems,
    enteringItems
  }
}
