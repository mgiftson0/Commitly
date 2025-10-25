"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Target,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Users,
  Flame,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  Edit,
  Trash2,
  Eye,
  GitFork,
  Crown,
  User,
  MessageCircle,
  Lock,
  Globe,
  AlertTriangle,
  Star
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EncouragementCard } from "@/components/goals/encouragement-card"
import * as React from "react"
import { getProgressColor } from "@/lib/utils/progress-colors"
import { supabase, authHelpers } from "@/lib/supabase-client"

// Mock data for goals with enhanced features
const mockGoals: any[] = [
  {
    id: "1",
    title: "Morning Workout Routine",
    description: "Daily exercise to build strength and endurance",
    type: "recurring",
    status: "active",
    progress: 75,
    streak: 12,
    totalCompletions: 45,
    visibility: "public",
    createdAt: "2024-01-15",
    dueDate: "2024-12-31",
    category: "Health & Fitness",
    priority: "high",
    isForked: false,
    forkedFrom: null,
    accountabilityPartners: [
      { id: "1", name: "Sarah Martinez", avatar: "/placeholder-avatar.jpg" },
      { id: "2", name: "Mike Chen", avatar: "/placeholder-avatar.jpg" }
    ],
    isGroupGoal: false,
    groupMembers: []
  },
  {
    id: 2,
    title: "Read 30 minutes daily",
    description: "Build knowledge through consistent reading",
    type: "recurring",
    status: "active",
    progress: 45,
    streak: 5,
    totalCompletions: 23,
    visibility: "private",
    createdAt: "2024-01-20",
    dueDate: "2024-12-31",
    category: "Education",
    priority: "medium",
    isForked: true,
    forkedFrom: "Emily Rodriguez",
    accountabilityPartners: [],
    isGroupGoal: false,
    groupMembers: []
  },
  {
    id: 3,
    title: "Learn Spanish Basics",
    description: "Complete beginner Spanish course",
    type: "multi",
    status: "active",
    progress: 30,
    streak: 8,
    totalCompletions: 15,
    visibility: "public",
    createdAt: "2024-02-01",
    dueDate: "2024-06-30",
    category: "Language",
    priority: "high",
    isForked: false,
    forkedFrom: null,
    accountabilityPartners: [
      { id: "3", name: "Alex Thompson", avatar: "/placeholder-avatar.jpg" }
    ],
    isGroupGoal: false,
    groupMembers: []
  },
  {
    id: 4,
    title: "Team Fitness Challenge",
    description: "Group workout challenge with friends",
    type: "group",
    status: "active",
    progress: 60,
    streak: 0,
    totalCompletions: 0,
    visibility: "restricted",
    createdAt: "2024-02-05",
    dueDate: "2024-03-31",
    category: "Health & Fitness",
    priority: "high",
    isForked: false,
    forkedFrom: null,
    accountabilityPartners: [],
    isGroupGoal: true,
    groupMembers: [
      { id: "1", name: "Sarah Martinez", avatar: "/placeholder-avatar.jpg", role: "creator" },
      { id: "2", name: "Mike Chen", avatar: "/placeholder-avatar.jpg", role: "member" },
      { id: "3", name: "Alex Thompson", avatar: "/placeholder-avatar.jpg", role: "member" },
      { id: "4", name: "Jessica Liu", avatar: "/placeholder-avatar.jpg", role: "member" }
    ]
  },
  {
    id: 5,
    title: "Complete Project Portfolio (Forked)",
    description: "Build and showcase development projects",
    type: "single",
    status: "completed",
    progress: 100,
    streak: 0,
    totalCompletions: 1,
    visibility: "public",
    createdAt: "2024-01-01",
    dueDate: "2024-03-31",
    category: "Career",
    priority: "high",
    isForked: true,
    forkedFrom: "David Kim",
    accountabilityPartners: [],
    isGroupGoal: false,
    groupMembers: []
  },
  {
    id: 6,
    title: "Meditation Practice",
    description: "10 minutes of daily mindfulness",
    type: "recurring",
    status: "paused",
    progress: 60,
    streak: 0,
    totalCompletions: 30,
    visibility: "private",
    createdAt: "2024-01-10",
    dueDate: "2024-12-31",
    category: "Wellness",
    priority: "medium",
    isForked: false,
    forkedFrom: null,
    accountabilityPartners: [
      { id: "5", name: "Rachel Green", avatar: "/placeholder-avatar.jpg" }
    ],
    isGroupGoal: false,
    groupMembers: []
  },
  {
    id: 7,
    title: "Learn Guitar Basics",
    description: "Practice guitar 20 minutes daily",
    type: "recurring",
    status: "active",
    progress: 35,
    streak: 7,
    totalCompletions: 18,
    visibility: "public",
    createdAt: "2024-02-10",
    dueDate: "2024-08-31",
    category: "Music",
    priority: "medium",
    isForked: false,
    forkedFrom: null,
    accountabilityPartners: [
      { id: "mock-user-id", name: "You", avatar: "/placeholder-avatar.jpg" }
    ],
    isGroupGoal: false,
    groupMembers: [],
    goalOwner: { id: "6", name: "David Kim", avatar: "/placeholder-avatar.jpg" }
  },
  {
    id: 8,
    title: "Weekly Running Challenge",
    description: "Run 5K three times per week",
    type: "recurring",
    status: "active",
    progress: 80,
    streak: 15,
    totalCompletions: 42,
    visibility: "public",
    createdAt: "2024-01-25",
    dueDate: "2024-12-31",
    category: "Health & Fitness",
    priority: "high",
    isForked: true,
    forkedFrom: "Fitness Pro",
    accountabilityPartners: [
      { id: "mock-user-id", name: "You", avatar: "/placeholder-avatar.jpg" }
    ],
    isGroupGoal: false,
    groupMembers: [],
    goalOwner: { id: "7", name: "Lisa Wong", avatar: "/placeholder-avatar.jpg" }
  },
  {
    id: 9,
    title: "Photography Project",
    description: "Take and edit one photo daily",
    type: "recurring",
    status: "active",
    progress: 55,
    streak: 12,
    totalCompletions: 28,
    visibility: "restricted",
    createdAt: "2024-02-01",
    dueDate: "2024-05-31",
    category: "Creative Arts",
    priority: "medium",
    isForked: false,
    forkedFrom: null,
    accountabilityPartners: [
      { id: "mock-user-id", name: "You", avatar: "/placeholder-avatar.jpg" }
    ],
    isGroupGoal: false,
    groupMembers: [],
    goalOwner: { id: "12", name: "Alex Thompson", avatar: "/placeholder-avatar.jpg" }
  },
  {
    id: 10,
    title: "Coding Interview Prep",
    description: "Solve 2 coding problems daily",
    type: "recurring",
    status: "active",
    progress: 70,
    streak: 21,
    totalCompletions: 63,
    visibility: "public",
    createdAt: "2024-01-15",
    dueDate: "2024-06-30",
    category: "Career",
    priority: "high",
    isForked: false,
    forkedFrom: null,
    accountabilityPartners: [
      { id: "mock-user-id", name: "You", avatar: "/placeholder-avatar.jpg" }
    ],
    isGroupGoal: false,
    groupMembers: [],
    goalOwner: { id: "9", name: "Jennifer Liu", avatar: "/placeholder-avatar.jpg" }
  },
  {
    id: 11,
    title: "Healthy Cooking Challenge",
    description: "Cook healthy meals 5 days per week",
    type: "recurring",
    status: "active",
    progress: 45,
    streak: 8,
    totalCompletions: 32,
    visibility: "public",
    createdAt: "2024-02-05",
    dueDate: "2024-12-31",
    category: "Health & Fitness",
    priority: "medium",
    isForked: false,
    forkedFrom: null,
    accountabilityPartners: [
      { id: "mock-user-id", name: "You", avatar: "/placeholder-avatar.jpg" }
    ],
    isGroupGoal: false,
    groupMembers: [],
    goalOwner: { id: "10", name: "Maria Garcia", avatar: "/placeholder-avatar.jpg" }
  },
  {
    id: 12,
    title: "Language Exchange",
    description: "Practice Spanish conversation weekly",
    type: "recurring",
    status: "active",
    progress: 60,
    streak: 0,
    totalCompletions: 12,
    visibility: "restricted",
    createdAt: "2024-01-30",
    dueDate: "2024-12-31",
    category: "Language",
    priority: "medium",
    isForked: false,
    forkedFrom: null,
    accountabilityPartners: [
      { id: "mock-user-id", name: "You", avatar: "/placeholder-avatar.jpg" }
    ],
    isGroupGoal: false,
    groupMembers: [],
    goalOwner: { id: "11", name: "Carlos Rodriguez", avatar: "/placeholder-avatar.jpg" }
  }
]

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-green-500"
    case "completed": return "bg-blue-500"
    case "paused": return "bg-yellow-500"
    default: return "bg-gray-500"
  }
}

const getProgressColor = (progress: number) => {
  if (progress < 30) return 'bg-red-500'
  if (progress <= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "recurring": return <Flame className="h-4 w-4" />
    case "single": return <CheckCircle2 className="h-4 w-4" />
    case "multi": return <Target className="h-4 w-4" />
    default: return <Target className="h-4 w-4" />
  }
}

const formatRecurrence = (goal: any) => {
  const pattern = goal?.recurrencePattern
  if (!pattern) return null
  if (pattern !== 'custom') return pattern.charAt(0).toUpperCase() + pattern.slice(1)
  const days: string[] = goal?.recurrenceDays || []
  const map: Record<string, string> = {
    monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
  }
  if (days.length === 0) return 'Custom'
  return days.map(d => map[d] || d).slice(0, 3).join('/')
}

const isSingleActivity = (goal: typeof mockGoals[0]) => goal.type === 'single' || goal.type === 'single-activity'

// Mock: list of user partners (not per-goal accountability partners)
const myPartnerIds = new Set<string>(['6','7','9','10','11','12'])

const isPartnerWithOwner = (goal: typeof mockGoals[0], currentUserId: string = 'mock-user-id') => {
  if (!goal.goalOwner) return false
  if (goal.accountabilityPartners.some(p => p.id === currentUserId)) return false // not allowed if AP on this goal
  return myPartnerIds.has(goal.goalOwner.id)
}

// Check if current user owns this goal (can edit/delete)
const isGoalOwner = (goal: typeof mockGoals[0], currentUserId: string = 'mock-user-id') => {
  if (goal.goalOwner) {
    return goal.goalOwner.id === currentUserId
  }
  return !goal.accountabilityPartners.some(partner => partner.id === currentUserId)
}

// Check if current user can fork this goal per rule: must be partners with owner (not AP on this goal) and goal is public
const canForkGoal = (goal: typeof mockGoals[0], currentUserId: string = 'mock-user-id') => {
  return !isGoalOwner(goal, currentUserId) && goal.visibility === "public" && isPartnerWithOwner(goal, currentUserId)
}

const getNewEncouragements = (goal: typeof mockGoals[0], isPartnerView?: boolean) => {
  if (isPartnerView) return 0
  // Mock: show 2 new for goals with partners or group goals
  if (goal.accountabilityPartners.length > 0 || goal.isGroupGoal) return 2
  return 0
}

// Check if current user is an accountability partner (not owner)
const isAccountabilityPartner = (goal: typeof mockGoals[0], currentUserId: string = 'mock-user-id') => {
  return goal.accountabilityPartners.some(partner => partner.id === currentUserId) && !isGoalOwner(goal, currentUserId)
}

// Get goal card styling based on type
const getGoalCardStyle = (goal: typeof mockGoals[0]) => {
  if ((goal as any).is_seasonal || (goal as any).duration_type === 'seasonal') {
    return "border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-background"
  }
  if (goal.isGroupGoal) {
    return "border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-background"
  }
  if (goal.isForked) {
    return "border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background"
  }
  return ""
}

export default function GoalsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [realGoals, setRealGoals] = useState<any[]>([])
  const [devModeOverride, setDevModeOverride] = useState<boolean>(false)
  const router = useRouter()

  // Load real goals from Supabase database
  useEffect(() => {
    const loadGoals = async () => {
      try {
        const user = await authHelpers.getCurrentUser()
        if (!user) {
          console.log('No user logged in')
          setRealGoals([])
          return
        }

        // Fetch user's own goals
        const { data: userGoals, error: userGoalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (userGoalsError) {
          console.error('Error fetching user goals:', userGoalsError)
        }

        // Fetch goal activities for multi-activity goals
        const goalsWithActivities = await Promise.all((userGoals || []).map(async (goal) => {
          if (goal.goal_type === 'multi-activity') {
            const { data: activities } = await supabase
              .from('goal_activities')
              .select('*')
              .eq('goal_id', goal.id)
              .order('order_index', { ascending: true })

            return {
              ...goal,
              activities: activities || [],
              type: goal.goal_type,
              userId: goal.user_id,
              createdAt: goal.created_at,
              visibility: goal.visibility,
              status: goal.status,
              category: goal.category?.replace('_', ' '),
              priority: goal.priority,
              dueDate: goal.target_date,
              isPartnerGoal: false
            }
          }
          
          return {
            ...goal,
            activities: [],
            type: goal.goal_type,
            userId: goal.user_id,
            createdAt: goal.created_at,
            visibility: goal.visibility,
            status: goal.status,
            category: goal.category?.replace('_', ' '),
            priority: goal.priority,
            dueDate: goal.target_date,
            isPartnerGoal: false
          }
        }))

        console.log('Loaded goals from database:', goalsWithActivities)
        setRealGoals(goalsWithActivities)
      } catch (error) {
        console.error('Error loading goals:', error)
        setRealGoals([])
      }
    }
    
    loadGoals()
    
    // Listen for custom events
    const handleGoalChange = () => loadGoals()
    
    window.addEventListener('goalDeleted', handleGoalChange)
    window.addEventListener('goalUpdated', handleGoalChange)
    window.addEventListener('goalCreated', handleGoalChange)
    
    return () => {
      window.removeEventListener('goalDeleted', handleGoalChange)
      window.removeEventListener('goalUpdated', handleGoalChange)
      window.removeEventListener('goalCreated', handleGoalChange)
    }
  }, [])

  // Convert real goals to display format with real progress data
  const allGoals = React.useMemo(() => {
    const convertedGoals = realGoals.map(goal => {
      // Calculate real progress from activities
      let realProgress = 0
      let completedActivities = 0
      let totalActivities = 0
      
      if (goal.activities && Array.isArray(goal.activities)) {
        if (goal.type === 'multi-activity') {
          totalActivities = goal.activities.length
          completedActivities = goal.activities.filter((activity: any) => activity.completed).length
          realProgress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0
        } else if (goal.type === 'single-activity') {
          // For single activity, check if the single activity is completed
          const activity = goal.activities[0]
          realProgress = activity && activity.completed ? 100 : 0
          completedActivities = realProgress === 100 ? 1 : 0
          totalActivities = 1
        }
      }
      
      // Calculate streak starting from 0
      let calculatedStreak = 0
      if (goal.scheduleType === 'recurring' && goal.type !== 'single-activity') {
        // For recurring goals, calculate streak based on completion history
        const goalAge = Math.floor((Date.now() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        if (goalAge >= 1) {
          calculatedStreak = goal.streak !== undefined ? goal.streak : Math.min(goalAge, 5)
        }
      }
      
      // Determine status - if completedAt exists, status should be completed
      let finalStatus = goal.status || 'active'
      if (goal.completedAt || realProgress === 100) {
        finalStatus = 'completed'
      }
      
      return {
        id: String(goal.id), // Convert to string to support both numeric and UUID IDs
        title: goal.title,
        description: goal.description || '',
        type: goal.type,
        status: finalStatus,
        progress: finalStatus === 'completed' ? 100 : realProgress,
        streak: calculatedStreak,
        totalCompletions: completedActivities,
        visibility: goal.visibility || 'private',
        createdAt: goal.createdAt,
        dueDate: goal.dueDate,
        category: goal.category || 'Personal',
        priority: goal.priority || 'medium',
        isForked: false,
        forkedFrom: null,
        accountabilityPartners: goal.accountabilityPartners || [],
        isGroupGoal: goal.isGroupGoal || false,
        groupMembers: goal.groupMembers || [],
        recurrencePattern: goal.recurrencePattern,
        recurrenceDays: goal.recurrenceDays,
        scheduleType: goal.scheduleType,
        isPartnerGoal: goal.isPartnerGoal || false,
        ownerName: goal.ownerName,
        goalOwner: goal.ownerName ? { id: goal.userId, name: goal.ownerName, avatar: '/placeholder-avatar.jpg' } : undefined,
        is_seasonal: goal.is_seasonal || false,
        duration_type: goal.duration_type || 'standard',
        seasonal_year: goal.seasonal_year,
        seasonal_quarter: goal.seasonal_quarter,
        updated_at: goal.updated_at,
        completed_at: goal.completed_at
      }
    })
    
    return convertedGoals
  }, [realGoals])

  // Filter goals based on current view and user role
  const filteredGoals = allGoals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || goal.type === filterType
    const matchesStatus = filterStatus === "all" || goal.status === filterStatus
    const matchesCategory = filterCategory === "all" || goal.category === filterCategory

    return matchesSearch && matchesType && matchesStatus && matchesCategory
  })

  // Separate goals into user's goals and partner goals
  const userGoals = filteredGoals.filter(goal => isGoalOwner(goal) && !(goal as any).isPartnerGoal)
  const partnerGoals = filteredGoals
    .filter(goal => (goal.accountabilityPartners.some((partner: any) => partner.id === 'mock-user-id') && !isGoalOwner(goal)) || (goal as any).isPartnerGoal)

  const categories = Array.from(new Set(allGoals.map(g => g.category)))

  const sortedGoals = [...filteredGoals].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "progress":
        return b.progress - a.progress
      case "streak":
        return b.streak - a.streak
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
      default:
        return 0
    }
  })



  const stats = {
    total: allGoals.length,
    active: allGoals.filter(g => g.status === "active").length,
    completed: allGoals.filter(g => g.status === "completed").length,
    paused: allGoals.filter(g => g.status === "paused").length
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Goals</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track and manage your personal goals
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/goals/create">
              <Button className="hover-lift" variant="default">
                <Target className="h-4 w-4 mr-2" />
                Standard Goal
              </Button>
            </Link>
            <Link href="/goals/seasonal/create">
              <Button className="hover-lift" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Seasonal Goal
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards - Dashboard Style */}
        <div className="border rounded-lg p-3 sm:p-4 bg-card">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-bold">{stats.total}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-bold">{stats.active}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Award className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-bold">{stats.completed}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Done</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full bg-yellow-500/10">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-bold">{stats.paused}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Paused</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search goals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap overflow-x-auto">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-28 sm:w-32 text-xs sm:text-sm">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                    <SelectItem value="multi">Multi-step</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-28 sm:w-32 text-xs sm:text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-32 sm:w-40 text-xs sm:text-sm">
                    <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-28 sm:w-32 text-xs sm:text-sm">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="streak">Streak</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Goals ({sortedGoals.length})</TabsTrigger>
            <TabsTrigger value="my-goals">My Goals ({userGoals.length})</TabsTrigger>
            <TabsTrigger value="partner-goals">Partner Goals ({partnerGoals.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* User's Goals Section */}
            {userGoals.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">My Goals</h2>
                  <Badge variant="outline">{userGoals.length}</Badge>
                </div>
                <GoalsGrid goals={userGoals} router={router} isPartnerView={false} onGoalDeleted={() => {
                  const updatedGoals = JSON.parse(localStorage.getItem('goals') || '[]')
                  setRealGoals(updatedGoals)
                }} />
              </div>
            )}

            {/* Partner Goals Section */}
            {partnerGoals.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold">Accountability Partner Goals</h2>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{partnerGoals.length}</Badge>
                </div>
                <GoalsGrid goals={partnerGoals} router={router} isPartnerView={true} onGoalDeleted={() => {
                  const updatedGoals = JSON.parse(localStorage.getItem('goals') || '[]')
                  setRealGoals(updatedGoals)
                }} />
              </div>
            )}

            {userGoals.length === 0 && partnerGoals.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No goals found</p>
                  <Link href="/goals/create">
                    <Button>Create your first goal</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-goals" className="space-y-4">
            <GoalsGrid goals={userGoals} router={router} isPartnerView={false} onGoalDeleted={() => {
              const updatedGoals = JSON.parse(localStorage.getItem('goals') || '[]')
              setRealGoals(updatedGoals)
            }} />
          </TabsContent>

          <TabsContent value="partner-goals" className="space-y-4">
            {partnerGoals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No partner goals found</p>
                  <p className="text-sm text-muted-foreground mt-2">Partner goals will appear here when you're added as an accountability partner</p>
                </CardContent>
              </Card>
            ) : (
              <GoalsGrid goals={partnerGoals} router={router} isPartnerView={true} onGoalDeleted={() => {
                const updatedGoals = JSON.parse(localStorage.getItem('goals') || '[]')
                setRealGoals(updatedGoals)
              }} />
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <GoalsGrid goals={sortedGoals.filter(g => g.status === "active")} router={router} onGoalDeleted={() => {
              const updatedGoals = JSON.parse(localStorage.getItem('goals') || '[]')
              setRealGoals(updatedGoals)
            }} />
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <GoalsGrid goals={sortedGoals.filter(g => g.status === "completed")} router={router} onGoalDeleted={() => {
              const updatedGoals = JSON.parse(localStorage.getItem('goals') || '[]')
              setRealGoals(updatedGoals)
            }} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

function GoalsGrid({ goals, router, isPartnerView = false, onGoalDeleted }: { goals: typeof mockGoals; router: ReturnType<typeof useRouter>; isPartnerView?: boolean; onGoalDeleted?: () => void }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)
  const [partnerInvites, setPartnerInvites] = useState<Record<string, 'pending' | 'accepted' | 'declined'>>(() => {
    const map: Record<string, 'pending' | 'accepted' | 'declined'> = {}
    goals.forEach(g => { 
      // For mock data with numeric IDs or real UUIDs
      const goalId = String(g.id)
      map[goalId] = (isPartnerView && goals.indexOf(g) % 5 === 0) ? 'pending' : 'accepted' 
    })
    return map
  })
  const [groupInvites, setGroupInvites] = useState<Record<string, 'pending' | 'accepted' | 'declined'>>(() => {
    const map: Record<string, 'pending' | 'accepted' | 'declined'> = {}
    goals.forEach(g => { 
      const goalId = String(g.id)
      map[goalId] = (g.isGroupGoal && !isPartnerView && goals.indexOf(g) % 4 === 0) ? 'pending' : 'accepted' 
    })
    return map
  })

  useEffect(() => {
    // Frontend doesn't depend on backend invite status
    // Use default invite states for partner goals
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canEditWithin5hFromCreated = (createdAt?: string) => {
    if (!createdAt) return false
    const created = new Date(createdAt).getTime()
    return (Date.now() - created) <= (5 * 60 * 60 * 1000)
  }
  
  const canDeleteWithin24h = (createdAt?: string, status?: string) => {
    if (!createdAt || status === 'completed') return false
    const created = new Date(createdAt).getTime()
    return (Date.now() - created) <= (24 * 60 * 60 * 1000)
  }
  const handleDelete = async (goalId: number | string, goalTitle: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)

      if (error) {
        console.error('Error deleting goal:', error)
        toast.error("Failed to delete goal")
        return
      }
      
      toast.success(`Goal "${goalTitle}" deleted successfully`)
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('goalDeleted', { detail: { goalId } }))
      
      // Trigger parent component to reload goals
      if (onGoalDeleted) {
        onGoalDeleted()
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast.error("Failed to delete goal")
    }
  }

  const handleViewDetails = (goalId: string, goal: typeof mockGoals[0]) => {
    router.push(`/goals/${goalId}`)
  }



  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No goals found</p>
          <Link href="/goals/create">
            <Button>Create your first goal</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {goals.map((goal, index) => (
        <Card key={`${goal.id}-${index}-${goal.title.replace(/\s+/g, '-').toLowerCase()}`} className={`hover-lift group ${getGoalCardStyle(goal)}`}>
          <CardHeader className="pb-3">
            {/* Requests handled in Notifications. Status shown below. */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getTypeIcon(goal.type)}
                <Badge variant="outline" className="text-xs">
                  {goal.type}
                </Badge>
                {((goal as any).is_seasonal || (goal as any).duration_type === 'seasonal') && (
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                    <Star className="h-3 w-3 mr-1" />
                    Seasonal
                  </Badge>
                )}
                {goal.isGroupGoal && (
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                    <Users className="h-3 w-3 mr-1" />
                    Group
                  </Badge>
                )}
                {/* Recurrence badge if available */}
                {(goal as any).recurrencePattern && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatRecurrence(goal)}
                  </Badge>
                )}
                {/* Only show forked badge if user owns the goal */}
                {goal.isForked && isGoalOwner(goal) && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <GitFork className="h-3 w-3 mr-1" />
                    Forked
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Edit lock indicator if 5h window ended (owners/members) */}
                {!isPartnerView && !canEditWithin5hFromCreated(goal.createdAt) && (
                  <div className="h-8 w-8 flex items-center justify-center" title="Editing period ended (5 hours)">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                {/* New messages indicator for owners/members - show if has accountability partners or is group goal */}
                {!isPartnerView && ((goal.accountabilityPartners && goal.accountabilityPartners.length > 0) || goal.isGroupGoal) && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="relative h-8 w-8 flex items-center justify-center cursor-pointer" title="View encouragement notes">
                        <MessageCircle className="h-4 w-4 text-primary" />
                        {(() => {
                          const messageCount = (() => {
                            try {
                              const messages = JSON.parse(localStorage.getItem(`encouragement_${goal.id}`) || '[]')
                              return messages.filter((msg: any) => !msg.read).length
                            } catch {
                              return 0
                            }
                          })()
                          return messageCount > 0 && (
                            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] bg-primary text-primary-foreground">
                              {messageCount}
                            </span>
                          )
                        })()}
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Encouragement Notes</DialogTitle>
                      </DialogHeader>
                      <EncouragementCard goalId={goal.id} goalOwnerName={goal.goalOwner?.name || 'You'} />
                    </DialogContent>
                  </Dialog>
                )}
                {/* Fork Button - Only show for goals that can be forked (not owned by user) */}
                {!isPartnerView && canForkGoal(goal) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      toast.success("Goal forked! (Mock Mode)")
                      router.push("/goals/create")
                    }}
                  >
                    <GitFork className="h-4 w-4" />
                  </Button>
                )}
                {/* Only show edit/delete menu for owned goals, not partner goals */}
                {!isPartnerView && isGoalOwner(goal) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(goal.id, goal)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {goal.status !== 'completed' && (
                        <DropdownMenuItem onClick={() => {
                          const isSeasonalGoal = (goal as any).duration_type === 'seasonal' || (goal as any).is_seasonal
                          const updatePath = isSeasonalGoal ? `/goals/seasonal/${goal.id}/update` : `/goals/${goal.id}/update`
                          router.push(updatePath)
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Update Goal
                        </DropdownMenuItem>
                      )}
                      {canEditWithin5hFromCreated(goal.createdAt) && goal.status !== 'completed' && (
                        <DropdownMenuItem onClick={() => {
                          const isSeasonalGoal = (goal as any).duration_type === 'seasonal' || (goal as any).is_seasonal
                          const editPath = isSeasonalGoal ? `/goals/seasonal/${goal.id}/edit` : `/goals/${goal.id}/edit`
                          router.push(editPath)
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Goal
                        </DropdownMenuItem>
                      )}
                      {canDeleteWithin24h(goal.createdAt, goal.status) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Goal
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {goal.title} ? This action cannot be undone and all progress will be lost.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(goal.id, goal.title)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Goal
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <CardTitle className="line-clamp-2 flex items-center gap-2">
                {goal.title}
                {goal.isGroupGoal && (
                  <Crown className="h-4 w-4 text-purple-600" />
                )}
                {isPartnerView && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <User className="h-3 w-3 mr-1" />
                    Partner
                  </Badge>
                )}
              </CardTitle>
              {goal.description && (
                <CardDescription className="line-clamp-2">
                  {goal.description}
                </CardDescription>
              )}
              {/* Show accountability partners for partner goals */}
              {isPartnerView && goal.accountabilityPartners.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Partners:</span>
                  <div className="flex -space-x-1">
                    {goal.accountabilityPartners.slice(0, 3).map((partner: any, index: number) => (
                      <div key={partner.id} className="w-5 h-5 rounded-full bg-muted border border-background flex items-center justify-center">
                        <span className="text-xs font-medium">{partner.name.charAt(0)}</span>
                      </div>
                    ))}
                    {goal.accountabilityPartners.length > 3 && (
                      <div className="w-5 h-5 rounded-full bg-muted border border-background flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">+{goal.accountabilityPartners.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Progress */}


            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className={`h-2 ${getProgressColor(goal.progress)}`} />
            </div>

            {/* Stats - Different for partner goals */}
            {isPartnerView ? (
              /* For partner goals, show owner and visibility */
              <div className="flex items-center justify-between text-xs">
                {goal.goalOwner && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="font-medium">{goal.goalOwner.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {goal.visibility === 'private' && <Lock className="h-3 w-3 text-muted-foreground" />}
                  {goal.visibility === 'restricted' && <Users className="h-3 w-3 text-muted-foreground" />}
                  {goal.visibility === 'public' && <Globe className="h-3 w-3 text-muted-foreground" />}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium">{goal.totalCompletions}</span>
              </div>
            )}

            {/* Compact Due Date and Streak */}
            <div className="flex items-center gap-2 text-xs">
              {goal.dueDate && (() => {
                const dueDate = new Date(goal.dueDate)
                const today = new Date()
                const diffTime = dueDate.getTime() - today.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                
                const getUrgencyColor = () => {
                  if (diffDays < 0) return 'text-red-600'
                  if (diffDays <= 3) return 'text-red-600'
                  if (diffDays <= 7) return 'text-yellow-600'
                  return 'text-blue-600'
                }
                
                const getText = () => {
                  if (diffDays < 0) return 'Overdue'
                  if (diffDays === 0) return 'Today'
                  if (diffDays === 1) return '1d'
                  return `${diffDays}d`
                }
                
                return (
                  <div className={`flex items-center gap-1 ${getUrgencyColor()}`}>
                    <Calendar className="h-3 w-3" />
                    <span className="font-medium">{getText()}</span>
                  </div>
                )
              })()}
              
              {(() => {
                const goalAge = Date.now() - new Date(goal.createdAt).getTime()
                const isMoreThanOneDay = goalAge > 24 * 60 * 60 * 1000
                const isSingle = goal.type === 'single' || goal.type === 'single-activity'
                const showStreak = !isSingle && (goal as any).scheduleType !== 'date' && isMoreThanOneDay && goal.streak !== undefined && !isPartnerView
                return showStreak && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <Flame className="h-3 w-3" />
                    <span className="font-medium">{goal.streak}</span>
                  </div>
                )
              })()}
            </div>

            {/* Meta info and Actions */}
            <div className="space-y-3">
            {isPartnerView ? (
              /* Partner view - Show completion status if goal is completed */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span>{goal.category}</span>

                  </span>
                  {goal.status === "completed" ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span className="text-green-600 font-medium">Completed</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(goal.status)}`} />
                      <span className="capitalize">{goal.status}</span>
                    </div>
                  )}
                </div>
                  {/* Action Buttons for Partner Goals */}
                  <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover-lift"
                    onClick={() => handleViewDetails(goal.id, goal)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 hover-lift">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Encourage
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Encouragement</DialogTitle>
                      </DialogHeader>
                      <EncouragementCard 
                        isPartner={true}
                        goalOwnerName={goal.goalOwner?.name || 'Owner'}
                      />
                    </DialogContent>
                  </Dialog>
                  </div>
                </div>
              ) : (
                /* Owner/member view - Show full meta info */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                      {goal.category}
                      {/* Group invite membership indicator */}
                      {goal.isGroupGoal && groupInvites[String(goal.id)] && (
                        <Badge
                          variant={groupInvites[String(goal.id)] === 'accepted' ? 'default' : (groupInvites[String(goal.id)] === 'pending' ? 'secondary' : 'outline')}
                          className="text-[10px]"
                        >
                          {groupInvites[String(goal.id)] === 'accepted' ? 'Joined' : groupInvites[String(goal.id)] === 'pending' ? 'Invite Sent' : 'Declined'}
                        </Badge>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      {goal.isForked && (
                        <div className="flex items-center gap-1">
                          <GitFork className="h-3 w-3 text-blue-600" />
                          <span className="text-xs text-blue-600">Forked</span>
                        </div>
                      )}
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(goal.status)}`} />
                      <span className="capitalize">{goal.status}</span>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
