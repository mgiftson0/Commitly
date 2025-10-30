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

// Drag and drop imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

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

// New extracted components
import { WelcomeHeaderSection } from "@/components/dashboard/welcome-header-section"
import { ActiveGoalsSection } from "@/components/dashboard/active-goals-section"
import { RecentActivitySection } from "@/components/dashboard/recent-activity-section"
import { UpcomingDeadlinesSection } from "@/components/dashboard/upcoming-deadlines-section"
import { CategoryProgressSection } from "@/components/dashboard/category-progress-section"
import { QuickActionsSection } from "@/components/dashboard/quick-actions-section"
import { PartnerActivitiesSection } from "@/components/dashboard/partner-activities-section"

// New hooks
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useDashboardAnimations } from "@/hooks/use-dashboard-animations"
import { useDashboardLayout, DashboardSection } from "@/hooks/use-dashboard-layout"

// Layout components
import { DraggableSection } from "@/components/dashboard/draggable-section"
import { DashboardLayoutControls } from "@/components/dashboard/dashboard-layout-controls"

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
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showMotivation, setShowMotivation] = useState(true)
  const [bellShake, setBellShake] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationAchievement, setCelebrationAchievement] = useState<any>(null)
  const [motivationEnabled, setMotivationEnabled] = useState(() => {
    try {
      return localStorage.getItem('dailyMotivationEnabled') !== 'false'
    } catch {
      return true
    }
  })
  const router = useRouter()

  // Layout management
  const { layout, isEditMode, setLayout, resetLayout, toggleEditMode } = useDashboardLayout()

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Use new hooks
  const {
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
    loadProfile
  } = useDashboardData()

  const { animationsLoaded, exitingItems, enteringItems } = useDashboardAnimations(
    goals.filter(g => !g.completed_at && !g.is_suspended),
    recentActivity,
    upcomingDeadlines
  )

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

  const toggleMotivation = () => {
    const newValue = !motivationEnabled
    setMotivationEnabled(newValue)
    localStorage.setItem('dailyMotivationEnabled', String(newValue))
    if (!newValue) setShowMotivation(false)
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = layout.indexOf(active.id as DashboardSection)
      const newIndex = layout.indexOf(over.id as DashboardSection)
      setLayout(arrayMove(layout, oldIndex, newIndex))
    }
  }

  // Render section based on type
  const renderSection = (sectionType: DashboardSection) => {
    switch (sectionType) {
      case 'active-goals':
        return (
          <ActiveGoalsSection
            goals={goals}
            animationsLoaded={animationsLoaded}
            exitingItems={exitingItems}
            enteringItems={enteringItems}
          />
        )
      case 'recent-activity':
        return (
          <RecentActivitySection
            activities={recentActivity}
            animationsLoaded={animationsLoaded}
            exitingItems={exitingItems}
            enteringItems={enteringItems}
          />
        )
      case 'upcoming-deadlines':
        return (
          <UpcomingDeadlinesSection
            deadlines={upcomingDeadlines}
            animationsLoaded={animationsLoaded}
            exitingItems={exitingItems}
            enteringItems={enteringItems}
          />
        )
      case 'category-progress':
        return (
          <CategoryProgressSection
            categories={categoryProgress}
            showCategoryModal={showCategoryModal}
            onToggleCategoryModal={() => setShowCategoryModal(!showCategoryModal)}
          />
        )
      case 'quick-actions':
        return <QuickActionsSection />
      case 'partner-activities':
        return (
          <PartnerActivitiesSection
            activities={recentActivity}
            animationsLoaded={animationsLoaded}
            exitingItems={exitingItems}
            enteringItems={enteringItems}
          />
        )
      default:
        return null
    }
  }

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DwtmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
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
          {/* Welcome Header Section - Fixed Position */}
          <WelcomeHeaderSection
            profile={profile}
            todayMotivation={todayMotivation}
            motivationEnabled={motivationEnabled}
            showMotivation={showMotivation}
            onToggleMotivation={toggleMotivation}
            onHideMotivation={() => setShowMotivation(false)}
            todayStats={todayStats}
          />

          {/* Layout Controls */}
          <DashboardLayoutControls
            isEditMode={isEditMode}
            onToggleEditMode={toggleEditMode}
            onResetLayout={resetLayout}
          />

          {/* Draggable Dashboard Sections - 6 Containers */}
          {isEditMode ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={layout} strategy={verticalListSortingStrategy}>
                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 auto-rows-fr">
                  {layout.map((sectionType) => {
                    const section = renderSection(sectionType)
                    if (!section) return null

                    return (
                      <DraggableSection
                        key={`draggable-${sectionType}`}
                        id={sectionType}
                        isEditMode={isEditMode}
                      >
                        {section}
                      </DraggableSection>
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 auto-rows-fr">
              {layout.map((sectionType) => {
                const section = renderSection(sectionType)
                if (!section) return null

                return (
                  <div key={`static-${sectionType}`} className="h-[420px]">
                    {section}
                  </div>
                )
              })}
            </div>
          )}

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