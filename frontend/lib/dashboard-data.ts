import { supabase } from './supabase-client'

export interface DashboardStats {
  totalGoals: number
  activeGoals: number
  completedGoals: number
  completionRate: number
  currentStreak: number
  totalAchievements: number
}

export interface RecentActivity {
  id: string
  type: 'goal_created' | 'goal_completed' | 'achievement_unlocked' | 'partner_added'
  title: string
  description: string
  timestamp: string
  icon: string
}

export interface CategoryStats {
  category: string
  count: number
  completedCount: number
  percentage: number
}

export async function getDashboardData(userId: string) {
  try {
    // Get goals stats
    const { data: goals } = await supabase
      .from('goals')
      .select('id, status, category, created_at, completed_at')
      .eq('user_id', userId)

    const totalGoals = goals?.length || 0
    const activeGoals = goals?.filter(g => g.status === 'active').length || 0
    const completedGoals = goals?.filter(g => g.status === 'completed').length || 0
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

    // Get recent activities
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    const recentActivities: RecentActivity[] = (notifications || []).map(n => ({
      id: n.id,
      type: n.type || 'goal_created',
      title: n.title,
      description: n.message,
      timestamp: n.created_at,
      icon: getActivityIcon(n.type)
    }))

    // Get category stats
    const categoryMap = new Map<string, { total: number, completed: number }>()
    goals?.forEach(goal => {
      const category = goal.category || 'other'
      const current = categoryMap.get(category) || { total: 0, completed: 0 }
      current.total++
      if (goal.status === 'completed') current.completed++
      categoryMap.set(category, current)
    })

    const categoryStats: CategoryStats[] = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category: category.replace('_', ' '),
      count: stats.total,
      completedCount: stats.completed,
      percentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    }))

    // Get achievements count
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)

    const stats: DashboardStats = {
      totalGoals,
      activeGoals,
      completedGoals,
      completionRate,
      currentStreak: 0, // TODO: Calculate streak
      totalAchievements: userAchievements?.length || 0
    }

    return {
      stats,
      recentActivities,
      categoryStats
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      stats: {
        totalGoals: 0,
        activeGoals: 0,
        completedGoals: 0,
        completionRate: 0,
        currentStreak: 0,
        totalAchievements: 0
      },
      recentActivities: [],
      categoryStats: []
    }
  }
}

function getActivityIcon(type: string): string {
  switch (type) {
    case 'goal_created': return 'target'
    case 'goal_completed': return 'check-circle'
    case 'achievement_unlocked': return 'trophy'
    case 'partner_added': return 'users'
    default: return 'bell'
  }
}