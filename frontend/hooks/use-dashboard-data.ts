"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { authHelpers, supabase } from "@/lib/supabase-client"
import { CATEGORIES, CATEGORY_MAP } from "@/lib/constants/categories"

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
  description?: string
  dueDate: string
  category?: string
  progress?: number
  status?: string
}

interface CategoryData {
  name: string
  completed: number
  total: number
  progress: number
  standardGoals: number
  seasonalGoals: number
  color: string
  icon: React.ComponentType<any>
}

interface DashboardStats {
  totalGoals: number
  activeGoals: number
  completedGoals: number
  completionRate: number
}

interface SeasonalStats {
  currentSeason?: string
  seasonProgress?: number
  seasonalGoals?: number
  seasonalAchievements?: number
}

interface Profile {
  id: string
  first_name?: string
  last_name?: string
  profile_picture_url?: string
}

export function useDashboardData() {
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [seasonalStats, setSeasonalStats] = useState<SeasonalStats | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  // Load profile data
  const loadProfile = async () => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profileData) {
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  // Load goals data
  const loadGoals = async () => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) return

      const { data: goalsData, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      console.log('Raw goals data from DB:', goalsData)
      setGoals(goalsData || [])
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load dashboard data (notifications, stats, seasonal data)
  const loadDashboardData = async () => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) return

      // Load mutual followers' public activities
      // First, get mutual followers (users who follow you and you follow them)
      const { data: mutualFollowers } = await supabase
        .from('follows')
        .select('follower_id, following_id')
        .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`)
        .eq('status', 'accepted')

      // Find mutual followers (both directions exist)
      const followerIds = mutualFollowers?.filter(f => f.following_id === user.id).map(f => f.follower_id) || []
      const followingIds = mutualFollowers?.filter(f => f.follower_id === user.id).map(f => f.following_id) || []
      const mutualIds = followerIds.filter(id => followingIds.includes(id))

      console.log('Mutual follower IDs:', mutualIds)

      // Load recent public activities from mutual followers
      let notifications: any[] = []
      if (mutualIds.length > 0) {
        const { data: mutualActivities } = await supabase
          .from('notifications')
          .select('*, profiles!notifications_user_id_fkey(first_name, last_name, username)')
          .in('user_id', mutualIds)
          .in('type', ['goal_completed', 'goal_created', 'streak_milestone', 'achievement_unlocked', 'activity_completed'])
          .order('created_at', { ascending: false })
          .limit(5)

        notifications = mutualActivities || []
      }

      console.log('Loaded mutual followers activities:', notifications)

      const iconMap = {
        goal_completed: require("lucide-react").CheckCircle2,
        goal_created: require("lucide-react").Target,
        partner_request: require("lucide-react").Users,
        achievement_unlocked: require("lucide-react").Trophy
      }
      const colorMap = {
        goal_completed: 'text-green-600',
        goal_created: 'text-blue-600',
        partner_request: 'text-purple-600',
        achievement_unlocked: 'text-yellow-600'
      }

      const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (days > 0) return `${days}d ago`
        if (hours > 0) return `${hours}h ago`
        if (minutes > 0) return `${minutes}m ago`
        return 'Just now'
      }

      const activities = (notifications || []).map((n: any) => {
        const userName = n.profiles 
          ? `${n.profiles.first_name || ''} ${n.profiles.last_name || ''}`.trim() || n.profiles.username || 'Someone'
          : 'Someone'
        
        return {
          id: n.id,
          type: n.type || 'general',
          title: `${userName} - ${n.title || 'Activity'}`,
          description: n.message || 'No message',
          time: timeAgo(n.created_at),
          icon: iconMap[n.type as keyof typeof iconMap] || require("lucide-react").Bell,
          color: colorMap[n.type as keyof typeof colorMap] || 'text-gray-600',
          goalId: n.data?.goal_id
        }
      })

      console.log('Processed activities:', activities)

      setRecentActivity(activities)

      // Calculate dashboard stats from goals
      const stats = {
        totalGoals: goals.length,
        activeGoals: goals.filter(g => g.status === 'active').length,
        completedGoals: goals.filter(g => g.status === 'completed').length,
        completionRate: goals.length > 0 ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) : 0
      }
      setDashboardStats(stats)

      // Load seasonal stats
      const seasonalData: any = await require("@/lib/seasonal-goals-integration").seasonalIntegration.getSeasonalStats(user.id)
      setSeasonalStats(seasonalData)

      console.log('Dashboard stats:', stats)
      console.log('Seasonal stats:', seasonalData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  // Get upcoming deadlines from goals
  const upcomingDeadlines = useMemo(() => {
    const deadlines = goals
      .filter(g => g.target_date && !g.completed_at && !g.is_suspended)
      .map(g => ({
        id: g.id,
        title: g.title,
        dueDate: g.target_date,
        progress: g.progress || 0,
        priority: g.priority || 'medium'
      }))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3)

    console.log('Upcoming deadlines:', deadlines)
    return deadlines
  }, [goals])

  // Calculate category progress from goals
  const categoryProgress = useMemo(() => {
    const categories = ['Health & Fitness', 'Learning', 'Career', 'Personal']
    const iconMap = {
      'Health & Fitness': require("lucide-react").Heart,
      'Learning': require("lucide-react").BookOpen,
      'Career': require("lucide-react").Briefcase,
      'Personal': require("lucide-react").Star
    }
    const colorMap = {
      'Health & Fitness': 'bg-green-500',
      'Learning': 'bg-blue-500',
      'Career': 'bg-purple-500',
      'Personal': 'bg-orange-500'
    }

    return categories.map(category => {
      const categoryGoals = goals.filter(g => {
        const goalCategory = g.category || g.goal_type || 'personal'
        return goalCategory === category.toLowerCase().replace(' & ', '-').replace(' ', '-')
      })

      // Calculate combined progress for all goals in category
      const totalProgress = categoryGoals.reduce((sum, goal) => {
        if (goal.completed_at || goal.status === 'completed') {
          return sum + 100
        }
        return sum + (goal.progress || 0)
      }, 0)

      const averageProgress = categoryGoals.length > 0 ? Math.round(totalProgress / categoryGoals.length) : 0
      const completed = categoryGoals.filter(g => g.completed_at || g.status === 'completed').length
      const total = categoryGoals.length

      // Include seasonal and standard goals
      const standardGoals = categoryGoals.filter(g => !g.is_seasonal && g.duration_type !== 'seasonal').length
      const seasonalGoals = categoryGoals.filter(g => g.is_seasonal || g.duration_type === 'seasonal').length

      return {
        name: category,
        completed,
        total,
        progress: averageProgress,
        standardGoals,
        seasonalGoals,
        color: colorMap[category as keyof typeof colorMap],
        icon: iconMap[category as keyof typeof iconMap]
      }
    }).filter(c => c.total > 0)
  }, [goals])

  // Calculate today stats
  const activeGoals = goals.filter(g => !g.completed_at && !g.is_suspended)
  const completedGoals = goals.filter(g => g.completed_at)
  const maxStreak = Math.max(...goals.map(g => g.streak || 0), 0)
  const avgStreak = goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + (g.streak || 0), 0) / goals.length) : 0

  const todayStats = {
    completed: completedGoals.length,
    pending: activeGoals.length,
    streak: avgStreak,
    longestStreak: maxStreak
  }

  useEffect(() => {
    if (goals.length >= 0) {
      loadDashboardData()
    }
  }, [goals])

  return {
    goals,
    loading,
    recentActivity,
    dashboardStats,
    seasonalStats,
    profile,
    upcomingDeadlines,
    categoryProgress,
    todayStats,
    loadGoals,
    loadProfile,
    loadDashboardData
  }
}
