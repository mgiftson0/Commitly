"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Target,
  Plus,
  Bell,
  Flame,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  Calendar,
  Users,
  BookOpen,
  Briefcase,
  Heart,
  Star,
  ArrowRight,
  Zap,
  Trophy,
  Settings,
  Edit,
  MapPin,
  Link as LinkIcon
} from "lucide-react"
import Link from "next/link"
import { Celebration } from "@/components/achievements/celebration"

// Import new components
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { MotivationCard } from "@/components/dashboard/motivation-card"
import { WelcomeHeader } from "@/components/dashboard/welcome-header"
import { ActiveGoals } from "@/components/dashboard/active-goals"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { PartnerRequests } from "@/components/dashboard/partner-requests"
import { CloseToUnlock } from "@/components/dashboard/close-to-unlock"

// Import hooks and utilities
import { useGoals } from "@/hooks/use-goals"
import { useNotifications } from "@/hooks/use-notifications"
import { getProgressColor } from "@/lib/utils/progress-colors"
import { CATEGORIES, CATEGORY_MAP } from "@/lib/constants/categories"
import { authHelpers, supabase } from "@/lib/supabase-client"
import { seasonalIntegration } from "@/lib/seasonal-goals-integration"

export default function DashboardPage() {
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showMotivation, setShowMotivation] = useState(true)
  const [bellShake, setBellShake] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationAchievement, setCelebrationAchievement] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [motivationEnabled, setMotivationEnabled] = useState(() => {
    try {
      return localStorage.getItem('dailyMotivationEnabled') !== 'false'
    } catch {
      return true
    }
  })
  const router = useRouter()

  const motivations = [
    { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { quote: "Your limitation—it's only your imagination.", author: "Unknown" },
    { quote: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
    { quote: "Great things never come from comfort zones.", author: "Unknown" },
    { quote: "Dream it. Wish it. Do it.", author: "Unknown" },
    { quote: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
    { quote: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
    { quote: "Don't stop when you're tired. Stop when you're done.", author: "James Bond" },
    { quote: "Wake up with determination. Go to bed with satisfaction.", author: "George Lorimer" }
  ]

  const todayMotivation = motivations[new Date().getDate() % motivations.length]

  // Get upcoming deadlines from real goals
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

  // Calculate category progress from real goals with combined progress
  const categoryProgress = useMemo(() => {
    const categories = ['Health & Fitness', 'Learning', 'Career', 'Personal']
    const iconMap = {
      'Health & Fitness': Heart,
      'Learning': BookOpen,
      'Career': Briefcase,
      'Personal': Star
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

  // Get real recent activity from database
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [seasonalStats, setSeasonalStats] = useState<any>(null)
  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const user = await authHelpers.getCurrentUser()
        if (!user) return

        // Load recent notifications
        const { data: notifications } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3)

        console.log('Loaded notifications:', notifications)

        const iconMap = {
          goal_completed: CheckCircle2,
          goal_created: Target,
          partner_request: Users,
          achievement_unlocked: Trophy
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
        
        const activities = (notifications || []).map((n: any) => ({
          id: n.id,
          type: n.type || 'general',
          title: n.title || 'Notification',
          description: n.message || 'No message',
          time: timeAgo(n.created_at),
          icon: iconMap[n.type as keyof typeof iconMap] || Bell,
          color: colorMap[n.type as keyof typeof colorMap] || 'text-gray-600',
          goalId: n.data?.goal_id
        }))
        
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
        const seasonalData = await seasonalIntegration.getSeasonalStats(user.id)
        setSeasonalStats(seasonalData)
        
        console.log('Dashboard stats:', stats)
        console.log('Seasonal stats:', seasonalData)
        console.log('Goals data:', goals)
        console.log('Goal IDs:', goals.map(g => ({ id: g.id, type: typeof g.id, title: g.title })))
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }
    
    if (goals.length >= 0) {
      loadDashboardData()
    }
  }, [goals])

  const toggleMotivation = () => {
    const newValue = !motivationEnabled
    setMotivationEnabled(newValue)
    localStorage.setItem('dailyMotivationEnabled', String(newValue))
    if (!newValue) setShowMotivation(false)
  }

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
      audio.volume = 0.3
      audio.play().catch(() => {})
    } catch {}
  }

  // Suppress extension communication errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('message channel closed')) {
        event.preventDefault()
        return false
      }
    }
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  // Listen for new notifications and reload activities
  useEffect(() => {
    const handleNewNotification = () => {
      setBellShake(true)
      playNotificationSound()
      loadGoals() // Reload to update recent activity
      setTimeout(() => setBellShake(false), 1000)
    }

    const handleAchievementUnlocked = (event: any) => {
      setCelebrationAchievement(event.detail)
      setShowCelebration(true)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('newNotification', handleNewNotification)
      window.addEventListener('achievementUnlocked', handleAchievementUnlocked)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('newNotification', handleNewNotification)
        window.removeEventListener('achievementUnlocked', handleAchievementUnlocked)
      }
    }
  }, [])

  useEffect(() => {
    checkAuth()
    loadGoals()
    loadProfile()
  }, [])

  const checkAuth = async () => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      const hasKyc = await authHelpers.hasCompletedKyc()
      if (!hasKyc) {
        router.push('/auth/kyc')
        return
      }
    } catch (error) {
      router.push('/auth/login')
    }
  }

  const loadProfile = async () => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

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

  const loadGoals = async () => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

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

  // Live update when localStorage changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', loadGoals)
      window.addEventListener('goalUpdated', loadGoals)
      window.addEventListener('goalDeleted', loadGoals)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', loadGoals)
        window.removeEventListener('goalUpdated', loadGoals)
        window.removeEventListener('goalDeleted', loadGoals)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Target className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Daily Motivation - Single Container, One Line */}
        {motivationEnabled && showMotivation && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-blue-100 dark:border-blue-800">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Star className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100 italic truncate">
                    &ldquo;{todayMotivation.quote}&rdquo;
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate">
                    — {todayMotivation.author}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMotivation}
                  className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full"
                  title="Toggle daily notifications"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMotivation(false)}
                  className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full"
                  title="Hide motivation"
                >
                  ×
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Header - 2 Lines Maximum */}
        <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-950/30 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Welcome back, <span className="text-blue-600 dark:text-blue-400">{profile?.first_name || 'User'}!</span>
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                You are on a <span className="font-semibold text-orange-600 dark:text-orange-400">{todayStats.streak}-day streak</span>! 🔥
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Link href="/goals/create">
                <Button className="shadow-md bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">New Goal</span>
                </Button>
              </Link>
              <Link href="/partners/find" className="hidden sm:block">
                <Button variant="outline" className="shadow-md border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Find Partners
                </Button>
              </Link>
              {!motivationEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMotivationEnabled(true)
                    setShowMotivation(true)
                    localStorage.setItem('dailyMotivationEnabled', 'true')
                  }}
                  className="shadow-md animate-pulse border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30"
                >
                  <Star className="h-4 w-4 mr-2 animate-spin text-amber-600 dark:text-amber-400" />
                  Enable Motivation
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Today's Summary Cards - Profile Page Style */}
        <div className="border rounded-lg p-3 sm:p-4 bg-card">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-bold">{todayStats.completed}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full bg-orange-500/10">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-bold">{todayStats.pending}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Flame className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-bold">{todayStats.streak}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Streak</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full bg-purple-500/10">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-bold">{todayStats.longestStreak}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Best</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-[800px_400px] 2xl:justify-center">
          {/* Active Goals */}
          <Card className="hover-lift h-[400px] w-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Active Goals
                  </CardTitle>
                  <CardDescription>
                    How you are doing across different areas
                  </CardDescription>
                </div>
                <Link href="/goals">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {activeGoals.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No active goals yet. Create your first goal to get started!
                  </p>
                  <Link href="/goals/create">
                    <Button>Create Your First Goal</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeGoals
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 3)
                    .map((goal) => {
                      const isSeasonalGoal = goal.is_seasonal || goal.duration_type === 'seasonal'
                      return (
                        <div key={goal.id} className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer h-[80px] w-full ${
                          isSeasonalGoal 
                            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`} onClick={() => {
                          console.log('Clicking goal:', goal)
                          console.log('Goal ID:', goal.id, 'Type:', typeof goal.id)
                          if (goal.id && goal.id !== 'undefined' && goal.id !== 'null' && !isNaN(goal.id)) {
                            router.push(`/goals/${goal.id}`)
                          } else {
                            console.error('Invalid goal ID:', goal.id, 'Full goal object:', goal)
                          }
                        }}>
                          <div className={`p-2 rounded-lg flex-shrink-0 ${
                            isSeasonalGoal 
                              ? 'bg-amber-100 dark:bg-amber-900/30' 
                              : 'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            <Target className={`h-4 w-4 ${
                              isSeasonalGoal 
                                ? 'text-amber-600 dark:text-amber-400' 
                                : 'text-blue-600 dark:text-blue-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="font-medium text-sm truncate text-slate-900 dark:text-slate-100">{goal.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {goal.goal_type || 'Standard'}
                              </Badge>
                              {isSeasonalGoal && (
                                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                  <Star className="h-3 w-3 mr-1" />
                                  Seasonal
                                </Badge>
                              )}
                              {goal.streak > 0 && (
                                <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                                  <Flame className="h-3 w-3 text-orange-500 dark:text-orange-400" />
                                  <span>{goal.streak}d</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 flex flex-col justify-center">
                            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{goal.progress || 0}%</div>
                            <Progress value={goal.progress || 0} className={`w-16 h-1.5 mt-1 ${getProgressColor(goal.progress || 0)}`} />
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity - Matches Active Goals Styling */}
          <Card className="hover-lift h-[400px] w-full flex flex-col">
            <CardHeader className="flex-shrink-0 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className={`h-5 w-5 transition-transform duration-200 ${bellShake ? 'animate-bounce' : ''}`} />
                  Recent Activity
                </CardTitle>
                <Link href="/notifications">
                  <Button variant="ghost" size="sm" className="h-8">
                    View All
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
              <CardDescription className="pt-1">
                Your latest achievements and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-6">
                  <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No recent activity yet. Complete some goals to see your progress here!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentActivity.slice(0, 3).map((activity: any) => {
                    const Icon = activity.icon
                    const getNotificationColor = (type: string) => {
                      if (type === 'goal_completed') return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                      if (type === 'streak_milestone') return 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'
                      if (type === 'partner_joined') return 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'
                      if (type === 'goal_created') return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                      if (type === 'activity_completed') return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                      if (type === 'encouragement_received') return 'bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800'
                      return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                    }
                    return (
                      <div
                        key={activity.id}
                        className={`flex items-start gap-2 p-2 rounded-lg border transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 ${getNotificationColor(activity.type)}`}
                        onClick={() => activity.goalId && router.push(`/goals/${activity.goalId}`)}
                      >
                        <div className="p-1.5 rounded bg-white dark:bg-slate-800/50 mt-0.5">
                          <Icon className={`h-3.5 w-3.5 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">{activity.title}</h4>
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 whitespace-nowrap">
                              {activity.time}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                            {activity.description}
                          </p>
                          {activity.goalId && (
                            <div className="mt-1">
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                View Goal →
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-2 2xl:justify-center">
          {/* Upcoming Deadlines - Matches Recent Activity */}
          <Card className="hover-lift h-auto w-full flex flex-col">
            <CardHeader className="flex-shrink-0 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
                <Button variant="ghost" size="sm" className="h-8">
                  View All
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
              <CardDescription className="pt-1">
                Goals that need your attention
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No upcoming deadlines
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingDeadlines.slice(0, 3).map((goal: any) => {
                    const dueDate = new Date(goal.dueDate)
                    const today = new Date()
                    const diffTime = dueDate.getTime() - today.getTime()
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    
                    const getUrgencyColor = () => {
                      if (diffDays < 0) return 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
                      if (diffDays <= 3) return 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800'
                      if (diffDays <= 7) return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800'
                      return 'bg-card border-border'
                    }
                    
                    const getDueDateText = () => {
                      if (diffDays < 0) return 'Overdue'
                      if (diffDays === 0) return 'Due Today'
                      if (diffDays === 1) return 'Due Tomorrow'
                      return `${diffDays} days left`
                    }
                    
                    return (
                      <div 
                        key={goal.id} 
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${getUrgencyColor()}`} 
                        onClick={() => goal.id && router.push(`/goals/${goal.id}`)}
                      >
                        <div className="p-1.5 rounded bg-white dark:bg-slate-800/50">
                          <Target className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">{goal.title}</h4>
                            <Badge 
                              variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'} 
                              className="text-xs h-5"
                            >
                              {goal.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                            {getDueDateText()}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {goal.progress}% complete
                            </span>
                            <Progress 
                              value={goal.progress} 
                              className={`flex-1 h-2 ${getProgressColor(goal.progress)}`} 
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Progress */}
          <Card className="hover-lift h-auto w-full flex flex-col">
            <CardHeader className="px-4 sm:px-6 py-1">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium bg-muted/30 px-2 py-1 rounded-md w-fit">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  Category Progress
                </CardTitle>
                {categoryProgress.length > 3 && (
                  <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-[10px] h-6 px-2 border bg-background">
                        View All
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>All Category Progress</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {categoryProgress.map((category) => {
                          const Icon = category.icon
                          return (
                            <div key={category.name} className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg ${category.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                                <Icon className={`h-3.5 w-3.5 ${category.color.replace('bg-', 'text-')}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">{category.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {category.completed || 0}/{category.total || 0}
                                  </span>
                                </div>
                                <Progress value={category.progress} className={`h-1.5 ${getProgressColor(category.progress)}`} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6 pt-0 h-full overflow-y-auto">
              {categoryProgress.length === 0 ? (
                <div className="text-center py-6">
                  <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No goals created yet
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 sm:space-y-2">
                  {categoryProgress.slice(0, 3).map((category) => {
                    const Icon = category.icon
                    return (
                      <div key={category.name} className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Icon className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${category.color.replace('bg-', 'text-')}`} />
                            <span className="text-xs sm:text-sm font-medium truncate">{category.name}</span>
                          </div>
                          <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                            {category.completed || 0}/{category.total || 0}
                          </span>
                        </div>

                        <Progress value={category.progress || 0} className={`h-1.5 sm:h-2 ${getProgressColor(category.progress || 0)}`} />
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Partner Requests */}
        <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-2 2xl:justify-center">
          {/* Quick Actions - Responsive 2x2 Grid */}
          <Card className="hover-lift h-[400px] w-full flex flex-col">
            <CardHeader className="flex-shrink-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Zap className="h-4 w-4 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-1 sm:gap-2 p-1 sm:p-2 pb-2">
              <Link href="/goals/create" className="block">
                <div className="aspect-square p-1.5 rounded-lg sm:rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all hover:scale-105 cursor-pointer shadow-md">
                  <div className="h-full flex flex-col items-center justify-center text-center gap-0.5">
                    <div className="p-1 sm:p-1.5 bg-white/20 rounded-full">
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <div className="text-[9px] sm:text-xs font-bold leading-tight">CREATE</div>
                    <div className="text-[7px] sm:text-[10px] opacity-90">New Goal</div>
                  </div>
                </div>
              </Link>
              <Link href="/partners/find">
                <div className="aspect-square p-1.5 sm:p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-all hover:scale-105 cursor-pointer shadow-lg overflow-hidden">
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="p-1.5 sm:p-2 bg-white/20 rounded-full mb-1">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="text-[9px] sm:text-xs font-bold leading-tight">PARTNERS</div>
                    <div className="text-[7px] sm:text-[10px] opacity-90 font-medium">Find Help</div>
                  </div>
                </div>
              </Link>
              <Link href="/goals">
                <div className="aspect-square p-1.5 sm:p-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all hover:scale-105 cursor-pointer shadow-lg overflow-hidden">
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="p-1.5 sm:p-2 bg-white/20 rounded-full mb-1">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="text-[9px] sm:text-xs font-bold leading-tight">BROWSE</div>
                    <div className="text-[7px] sm:text-[10px] opacity-90 font-medium">All Goals</div>
                  </div>
                </div>
              </Link>
              <Link href="/achievements">
                <div className="aspect-square p-1.5 sm:p-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition-all hover:scale-105 cursor-pointer shadow-lg overflow-hidden">
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="p-1.5 sm:p-2 bg-white/20 rounded-full mb-1">
                      <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="text-[9px] sm:text-xs font-bold leading-tight">AWARDS</div>
                    <div className="text-[7px] sm:text-[10px] opacity-90 font-medium">Badges</div>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Partner Activities - Matches Recent Activity */}
          <Card className="hover-lift h-[400px] w-full flex flex-col">
            <CardHeader className="flex-shrink-0 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Partner Activities</CardTitle>
                <Link href="/partners/find">
                  <Button variant="ghost" size="sm" className="h-8">
                    Find Partners
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
              <CardDescription className="pt-1">
                Recent achievements from your partners
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No partner activities yet
                  </p>
                  <Link href="/partners/find" className="mt-2 inline-block">
                    <Button variant="outline" size="sm" className="mt-2">
                      Find Partners
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentActivity.slice(0, 3).map((activity: any) => {
                    const Icon = activity.type === 'goal_completed' ? CheckCircle2 : 
                                 activity.type === 'streak_milestone' ? Flame :
                                 activity.type === 'achievement_unlocked' ? Trophy :
                                 activity.type === 'partner_request' ? Users :
                                 Target
                    
                    const getNotificationColor = (type: string) => {
                      if (type === 'goal_completed') return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                      if (type === 'streak_milestone') return 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'
                      if (type === 'partner_joined') return 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'
                      if (type === 'goal_created') return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                      if (type === 'activity_completed') return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                      if (type === 'encouragement_received') return 'bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800'
                      return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                    }

                    return (
                      <div
                        key={activity.id}
                        className={`flex items-start gap-2 p-2 rounded-lg border transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 ${getNotificationColor(activity.type)}`}
                        onClick={() => activity.goalId && router.push(`/goals/${activity.goalId}`)}
                      >
                        <div className="p-1.5 rounded bg-white dark:bg-slate-800/50 mt-0.5">
                          <Icon className={`h-3.5 w-3.5 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">{activity.title}</h4>
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 whitespace-nowrap">
                              {activity.time}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                            {activity.description}
                          </p>
                          {activity.goalId && (
                            <div className="mt-1">
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                View Goal →
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Achievement Celebration */}
        <Celebration 
          show={showCelebration}
          onComplete={() => setShowCelebration(false)}
          achievement={celebrationAchievement}
        />
      </div>
    </MainLayout>
  )
}