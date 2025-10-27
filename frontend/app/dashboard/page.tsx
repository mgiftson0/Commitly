"use client"

import { useEffect, useState, useMemo, useRef } from "react"
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
import { AnimatedBackground } from "@/components/dashboard/animated-background"

// Import hooks and utilities
import { useGoals } from "@/hooks/use-goals"
import { useNotifications } from "@/hooks/use-notifications"
import { getProgressColor } from "@/lib/utils/progress-colors"
import { CATEGORIES, CATEGORY_MAP } from "@/lib/constants/categories"
import { authHelpers, supabase } from "@/lib/supabase-client"
import { seasonalIntegration } from "@/lib/seasonal-goals-integration"

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

interface Notification {
  id: string
  type?: string
  title?: string
  message?: string
  created_at: string
  data?: {
    goal_id?: string
  }
}

interface AchievementEvent {
  detail: any
}

export default function DashboardPage() {
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [animationsLoaded, setAnimationsLoaded] = useState(false)
  const [exitingItems, setExitingItems] = useState<Set<string>>(new Set())
  const [enteringItems, setEnteringItems] = useState<Set<string>>(new Set())
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showMotivation, setShowMotivation] = useState(true)
  const [bellShake, setBellShake] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationAchievement, setCelebrationAchievement] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [motivationEnabled, setMotivationEnabled] = useState(() => {
    try {
      return localStorage.getItem('dailyMotivationEnabled') !== 'false'
    } catch {
      return true
    }
  })
  const router = useRouter()

  // Refs to track previous states for transition animations
  const prevActiveGoalsRef = useRef<any[]>([])
  const prevRecentActivityRef = useRef<ActivityItem[]>([])
  const prevUpcomingDeadlinesRef = useRef<GoalItem[]>([])

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
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [seasonalStats, setSeasonalStats] = useState<SeasonalStats | null>(null)
  
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
        
        const activities = (notifications || []).map((n: Notification) => ({
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
        const seasonalData: any = await seasonalIntegration.getSeasonalStats(user.id)
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
      window.addEventListener('achievementUnlocked', handleAchievementUnlocked as EventListener)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('newNotification', handleNewNotification)
        window.removeEventListener('achievementUnlocked', handleAchievementUnlocked as EventListener)
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

  // Trigger animations after loading completes
  useEffect(() => {
    if (!loading && !animationsLoaded) {
      const timer = setTimeout(() => {
        setAnimationsLoaded(true)
      }, 300) // Increased delay to ensure smooth loading experience
      return () => clearTimeout(timer)
    }
  }, [loading, animationsLoaded])

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

  return (
    <>
      <AnimatedBackground />
      <MainLayout>
        <div className="space-y-6">
        {/* Modern Compact Welcome Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-600 dark:via-teal-600 dark:to-cyan-600 rounded-xl p-6 sm:p-8 shadow-xl min-h-[160px] sm:min-h-[180px]">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20"></div>
          </div>

          <div className="relative flex flex-col gap-4">
            {/* Top Row - Welcome & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {/* Welcome Text Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                    <img 
                      src={profile?.profile_picture_url || '/default-avatar.png'} 
                      alt={profile?.first_name || 'User'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-white font-bold text-lg">${profile?.first_name?.[0]?.toUpperCase() || 'U'}</span>`;
                        }
                      }}
                    />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                      Welcome back, <span className="text-yellow-300 drop-shadow-lg">{profile?.first_name || 'User'}</span>
                    </h1>
                    <p className="text-emerald-100 text-sm leading-relaxed">
                      Ready to crush your goals? You're on fire with a{' '}
                      <span className="font-semibold text-yellow-300">{todayStats.streak}-day streak</span>! 🔥
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Primary Action */}
                <Link href="/goals/create" className="inline-flex">
                  <Button className="bg-white text-emerald-600 hover:bg-emerald-50 font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="text-sm">New Goal</span>
                  </Button>
                </Link>

                {/* Secondary Actions Row */}
                <div className="flex gap-2">
                  <Link href="/partners/find" className="hidden xs:inline-flex">
                    <Button variant="outline" size="sm" className="border-white/40 bg-white/15 text-white hover:bg-white/25 hover:border-white/60 backdrop-blur-sm shadow-lg transition-all duration-200">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline text-xs">Partners</span>
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
                      className="border-yellow-300/60 bg-yellow-400/25 text-yellow-100 hover:bg-yellow-400/35 hover:border-yellow-300 shadow-lg animate-pulse backdrop-blur-sm"
                    >
                      <Star className="h-3 w-3 mr-1 animate-spin" />
                      <span className="text-xs">Motivate</span>
                    </Button>
                  )}

                  {/* Mobile Menu Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="sm:hidden bg-white/15 text-white hover:bg-white/25 border-white/30 shadow-lg"
                    onClick={() => {/* Could add mobile menu logic */}}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Motivation Quote Section */}
            {motivationEnabled && showMotivation && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-inner">
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-yellow-300 mt-0.5 flex-shrink-0 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white italic text-sm leading-relaxed mb-1">
                      "{todayMotivation.quote}"
                    </p>
                    <p className="text-emerald-100 text-xs font-medium">
                      — {todayMotivation.author}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMotivation(false)}
                    className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20 rounded-full flex-shrink-0"
                    title="Hide motivation"
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}

            {/* Bottom Stats Bar */}
            <div className="pt-2 border-t border-white/25">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="text-xl font-bold text-white drop-shadow-lg">{todayStats.completed}</div>
                  <div className="text-xs text-emerald-100 font-medium">Goals Done</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-xl font-bold text-yellow-300 drop-shadow-lg">{todayStats.streak}</div>
                  <div className="text-xs text-emerald-100 font-medium">Day Streak</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-xl font-bold text-white drop-shadow-lg">{activeGoals.length}</div>
                  <div className="text-xs text-emerald-100 font-medium">Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-2 2xl:justify-center">
          {/* Active Goals */}
          <Card className="hover-lift h-auto w-full flex flex-col hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1 shadow-slate-900/15 transition-all duration-200 border-2 border-yellow-400/50">
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
                    .map((goal, index) => {
                      const isSeasonalGoal = goal.is_seasonal || goal.duration_type === 'seasonal'
                      const tileSurfaceClass = isSeasonalGoal
                        ? 'border-amber-200/70 dark:border-amber-800/60 bg-gradient-to-br from-amber-50/85 via-white to-white dark:from-amber-950/20 dark:via-slate-900/40 dark:to-slate-900/60'
                        : 'border-slate-200/70 dark:border-slate-700/60 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-900/40 dark:to-slate-900/60'
                      const accentBarClass = isSeasonalGoal
                        ? 'from-amber-400 via-amber-300 to-amber-500'
                        : 'from-sky-500 via-emerald-400 to-blue-500'
                      const iconWrapperClass = isSeasonalGoal
                        ? 'border border-amber-200/60 dark:border-amber-800/50 bg-amber-100/70 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300'
                        : 'border border-sky-200/60 dark:border-sky-800/50 bg-sky-100/70 dark:bg-sky-900/30 text-sky-600 dark:text-sky-300'
                      return (
                        <div
                          key={goal.id}
                          className={`relative group cursor-pointer select-none overflow-hidden rounded-xl border backdrop-blur transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-xl ${tileSurfaceClass} ${
                            exitingItems.has(goal.id) 
                              ? 'animate-out slide-out-to-bottom-full duration-600 fill-mode-forwards' 
                              : enteringItems.has(goal.id)
                              ? 'animate-in slide-in-from-top-full duration-800 fill-mode-forwards'
                              : animationsLoaded 
                              ? `animate-in slide-in-from-top-full duration-800 fill-mode-forwards ${index === 0 ? 'delay-200' : index === 1 ? 'delay-400' : 'delay-600'}`
                              : 'opacity-0'
                          }`}
                          onClick={() => {
                            console.log('Clicking goal:', goal)
                            console.log('Goal ID:', goal.id, 'Type:', typeof goal.id)
                            if (goal.id && goal.id !== 'undefined' && goal.id !== 'null' && !isNaN(goal.id)) {
                              router.push(`/goals/${goal.id}`)
                            } else {
                              console.error('Invalid goal ID:', goal.id, 'Full goal object:', goal)
                            }
                          }}
                        >
                          <span className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentBarClass} opacity-80 transition-opacity duration-500 group-hover:opacity-100`} />
                          <span className="pointer-events-none absolute -bottom-10 -right-16 h-28 w-28 rounded-full bg-gradient-to-tr from-cyan-200/40 via-blue-200/20 to-transparent blur-3xl dark:from-cyan-500/20 dark:via-blue-500/10" />
                          <div className="relative flex items-center gap-3 p-4">
                            <div className={`flex-shrink-0 rounded-xl p-3 transition-colors duration-500 ${iconWrapperClass}`}>
                              <Target className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <h4 className="font-medium text-sm truncate text-slate-900 dark:text-slate-100">{goal.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs backdrop-blur-sm">
                                  {goal.goal_type || 'Standard'}
                                </Badge>
                                {isSeasonalGoal && (
                                  <Badge variant="outline" className="text-xs bg-amber-50/80 text-amber-700 border-amber-200">
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
                              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{goal.progress || 0}%</div>
                              <Progress value={goal.progress || 0} className={`w-16 h-1.5 mt-1 ${getProgressColor(goal.progress || 0)}`} />
                            </div>
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
          <Card className="hover-lift h-auto w-full flex flex-col hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1 shadow-slate-900/15 transition-all duration-200 border-2 border-blue-400/50">
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
                  {recentActivity.slice(0, 3).map((activity: any, index) => {
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
                        className={`relative aurora-glow rounded-lg transition-all duration-500 ease-in-out hover:scale-105 ${
                          exitingItems.has(activity.id) 
                            ? 'animate-out slide-out-to-bottom-full duration-600 fill-mode-forwards' 
                            : enteringItems.has(activity.id)
                            ? 'animate-in slide-in-from-top-full duration-800 fill-mode-forwards'
                            : animationsLoaded 
                            ? `animate-in slide-in-from-top-full duration-800 fill-mode-forwards ${index === 0 ? 'delay-200' : index === 1 ? 'delay-400' : 'delay-600'}`
                            : 'opacity-0'
                        }`}
                      >
                        <div className={`flex items-start gap-2 p-2 rounded-lg border transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 ${getNotificationColor(activity.type)}`} onClick={() => activity.goalId && router.push(`/goals/${activity.goalId}`)}>
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
          <Card className="hover-lift h-auto w-full flex flex-col hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 shadow-lg transition-all duration-200 border-2 border-orange-400/50">
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
                  {upcomingDeadlines.slice(0, 3).map((goal: any, index) => {
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
                        className={`${
                          exitingItems.has(goal.id)
                            ? 'animate-out slide-out-to-bottom-full duration-600 fill-mode-forwards'
                            : enteringItems.has(goal.id)
                            ? 'animate-in slide-in-from-top-full duration-800 fill-mode-forwards'
                            : animationsLoaded
                            ? `animate-in slide-in-from-top-full duration-800 fill-mode-forwards ${index === 0 ? 'delay-200' : index === 1 ? 'delay-400' : 'delay-600'}`
                            : 'opacity-0'
                        } flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${getUrgencyColor()}`}
                        onClick={() => goal.id && router.push(`/goals/${goal.id}`)}
                      >
                        <div className="p-1.5 rounded bg-white dark:bg-slate-800/50">
                          <Target className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{goal.title}</h4>
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
          <Card className="hover-lift h-auto w-full flex flex-col hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 shadow-lg transition-all duration-200 border-2 border-purple-400/50">
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
          <Card className="hover-lift h-[400px] w-full flex flex-col hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 shadow-lg transition-all duration-200 border-2 border-green-400/50">
            <CardHeader className="flex-shrink-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Zap className="h-4 w-4 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 grid grid-cols-2 gap-3 p-3">
              <Link href="/goals/create" className="block group">
                <div className="h-20 border-2 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 rounded-2xl hover:border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-all duration-200 cursor-pointer overflow-hidden">
                  <div className="h-full flex flex-col items-center justify-center text-center p-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <div className="font-bold text-blue-900 dark:text-blue-100 text-xs mb-1">Create</div>
                    <div className="text-blue-600 dark:text-blue-300 text-[10px]">New Goal</div>
                  </div>
                </div>
              </Link>
              
              <Link href="/partners/find" className="block group">
                <div className="h-20 border-2 border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800 rounded-2xl hover:border-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/40 transition-all duration-200 cursor-pointer overflow-hidden">
                  <div className="h-full flex flex-col items-center justify-center text-center p-2">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="font-bold text-purple-900 dark:text-purple-100 text-xs mb-1">Partners</div>
                    <div className="text-purple-600 dark:text-purple-300 text-[10px]">Find Help</div>
                  </div>
                </div>
              </Link>
              
              <Link href="/goals" className="block group">
                <div className="h-20 border-2 border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 rounded-2xl hover:border-green-400 hover:bg-green-100 dark:hover:bg-green-950/40 transition-all duration-200 cursor-pointer overflow-hidden">
                  <div className="h-full flex flex-col items-center justify-center text-center p-2">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div className="font-bold text-green-900 dark:text-green-100 text-xs mb-1">Browse</div>
                    <div className="text-green-600 dark:text-green-300 text-[10px]">All Goals</div>
                  </div>
                </div>
              </Link>
              
              <Link href="/achievements" className="block group">
                <div className="h-20 border-2 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 rounded-2xl hover:border-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/40 transition-all duration-200 cursor-pointer overflow-hidden">
                  <div className="h-full flex flex-col items-center justify-center text-center p-2">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div className="font-bold text-orange-900 dark:text-orange-100 text-xs mb-1">Awards</div>
                    <div className="text-orange-600 dark:text-orange-300 text-[10px]">Badges</div>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Partner Activities - Matches Recent Activity */}
          <Card className="hover-lift h-[400px] w-full flex flex-col hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 shadow-lg transition-all duration-200 border-2 border-teal-400/50">
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
                  {recentActivity.slice(0, 3).map((activity: any, index) => {
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
                        className={`relative aurora-glow rounded-lg transition-all duration-500 ease-in-out hover:scale-105 ${
                          exitingItems.has(activity.id)
                            ? 'animate-out slide-out-to-bottom-full duration-600 fill-mode-forwards'
                            : enteringItems.has(activity.id)
                            ? 'animate-in slide-in-from-top-full duration-800 fill-mode-forwards'
                            : animationsLoaded
                            ? `animate-in slide-in-from-top-full duration-800 fill-mode-forwards ${index === 0 ? 'delay-200' : index === 1 ? 'delay-400' : 'delay-600'}`
                            : 'opacity-0'
                        }`}
                      >
                        <div
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
    </>
  )
}