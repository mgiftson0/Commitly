"use client"

import { useEffect, useState } from "react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Target,
  Plus,
  Bell,
  User,
  Search,
  Flame,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  Calendar,
  Users,
  BookOpen,
  Dumbbell,
  Briefcase,
  Heart,
  Star,
  ArrowRight,
  Play,
  Pause,
  MoreHorizontal
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"

export default function DashboardPage() {
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Get upcoming deadlines from real goals
  const upcomingDeadlines = React.useMemo(() => {
    try {
      const storedGoals = localStorage.getItem('goals')
      if (!storedGoals) return []
      
      const goals = JSON.parse(storedGoals)
      return goals
        .filter((g: any) => g.dueDate && !g.completedAt && g.status === 'active')
        .map((g: any) => ({
          id: g.id,
          title: g.title,
          dueDate: g.dueDate,
          progress: g.progress || 0,
          priority: g.priority || 'medium'
        }))
        .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 3)
    } catch {
      return []
    }
  }, [])

  // Calculate category progress from real goals
  const categoryProgress = React.useMemo(() => {
    try {
      const storedGoals = localStorage.getItem('goals')
      if (!storedGoals) return []
      
      const goals = JSON.parse(storedGoals)
      const categories = ['Health & Fitness', 'Learning', 'Career', 'Personal']
      const categoryMap = {
        'health-fitness': 'Health & Fitness',
        'learning': 'Learning', 
        'career': 'Career',
        'personal': 'Personal'
      }
      
      return categories.map(category => {
        const categoryGoals = goals.filter((g: any) => {
          const mappedCategory = categoryMap[g.category as keyof typeof categoryMap] || g.category
          return mappedCategory === category
        })
        const completed = categoryGoals.filter((g: any) => g.completedAt).length
        const total = categoryGoals.length
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0
        
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
        
        return {
          name: category,
          completed,
          total,
          progress,
          color: colorMap[category as keyof typeof colorMap],
          icon: iconMap[category as keyof typeof iconMap]
        }
      }).filter(c => c.total > 0)
    } catch {
      return []
    }
  }, [])

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = () => {
    try {
      const storedGoals = localStorage.getItem('goals')
      if (storedGoals) {
        const goals = JSON.parse(storedGoals)
        const mapped = goals.map((g: any) => ({
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
        }))
        setGoals(mapped as any)
      }
    } catch {}
    setLoading(false)
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

  // Calculate real stats from goals data
  const todayStats = {
    completed: completedGoals.length,
    pending: activeGoals.length,
    streak: 12, // Could be calculated from goal completion history
    longestStreak: 28 // Could be calculated from goal completion history
  }

  const recentActivity = [
    {
      id: 1,
      type: "goal_completed",
      title: "Morning Workout",
      description: "Completed daily exercise routine",
      time: "2 hours ago",
      icon: Dumbbell,
      color: "text-green-600"
    },
    {
      id: 2,
      type: "streak_milestone",
      title: "Reading Streak",
      description: "Reached 15-day reading streak!",
      time: "5 hours ago",
      icon: BookOpen,
      color: "text-blue-600"
    },
    {
      id: 3,
      type: "partner_joined",
      title: "New Partner",
      description: "Sarah joined your accountability group",
      time: "1 day ago",
      icon: Users,
      color: "text-purple-600"
    }
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, <span className="text-gradient-primary">{(() => {
                try {
                  const kycData = localStorage.getItem('kycData')
                  if (kycData) {
                    const profile = JSON.parse(kycData)
                    return profile.firstName || 'John'
                  }
                } catch {}
                return 'John'
              })()}!</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              You&apos;re on a {todayStats.streak}-day streak! Keep up the great work! 🔥
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/goals/create">
              <Button className="hover-lift" size="sm">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">New Goal</span>
              </Button>
            </Link>
            <Link href="/partners/find" className="hidden sm:block">
              <Button variant="outline" className="hover-lift" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Find Partners
              </Button>
            </Link>
          </div>
        </div>

        {/* Today's Summary Cards */}
        <div className="flex gap-3 sm:gap-4 overflow-x-auto">
          <Card className="hover-lift min-w-[160px] flex-shrink-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-full bg-green-500/10 w-fit">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl sm:text-3xl font-bold">{todayStats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift min-w-[160px] flex-shrink-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-full bg-orange-500/10 w-fit">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl sm:text-3xl font-bold">{todayStats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift min-w-[160px] flex-shrink-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-full bg-blue-500/10 w-fit">
                  <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Streak</p>
                  <p className="text-2xl sm:text-3xl font-bold">{todayStats.streak}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift min-w-[160px] flex-shrink-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-full bg-purple-500/10 w-fit">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Best</p>
                  <p className="text-2xl sm:text-3xl font-bold">{todayStats.longestStreak}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Active Goals */}
          <div className="lg:col-span-2">
            <Card className="hover-lift">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Active Goals
                    </CardTitle>
                    <CardDescription>
                      {activeGoals.length} goals in progress
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
              <CardContent>
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
                  <div className="space-y-4">
                    {activeGoals.slice(0, 3).map((goal) => (
                      <div key={goal.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{goal.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {goal.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {goal.goal_type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {goal.visibility}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Flame className="h-3 w-3" />
                              <span>Streak: 5 days</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">75%</div>
                          <Progress value={75} className="w-20 h-2 mt-1" />
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest achievements and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`p-2 rounded-full bg-muted`}>
                        <Icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-sm">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Deadlines */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
              <CardDescription>
                Goals that need your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No upcoming deadlines</p>
                ) : (
                  upcomingDeadlines.map((goal) => (
                    <div key={goal.id} className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Target className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{goal.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(goal.dueDate).toLocaleDateString()}
                        </p>
                        <Progress value={goal.progress} className="w-full h-1.5 mt-2" />
                      </div>
                      <Badge variant={goal.priority === 'high' ? 'default' : 'secondary'}>
                        {goal.priority}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Progress */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Category Progress
              </CardTitle>
              <CardDescription>
                How you&apos;re doing across different areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryProgress.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No goals created yet</p>
                ) : (
                  categoryProgress.map((category) => {
                    const Icon = category.icon
                    return (
                      <div key={category.name} className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${category.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                          <Icon className={`h-4 w-4 ${category.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{category.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {category.completed || 0}/{category.total || 0}
                            </span>
                          </div>
                          <Progress value={category.progress} className="h-2" />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Motivation */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Jump into your most common tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/goals/create">
                <Button className="w-full justify-start hover-lift">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Goal
                </Button>
              </Link>
              <Link href="/partners/find">
                <Button variant="outline" className="w-full justify-start hover-lift">
                  <Users className="h-4 w-4 mr-2" />
                  Find Partners
                </Button>
              </Link>
              <Link href="/goals">
                <Button variant="outline" className="w-full justify-start hover-lift">
                  <Target className="h-4 w-4 mr-2" />
                  Browse All Goals
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Today's Motivation */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Daily Motivation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="text-lg font-medium mb-3">
                &ldquo;Success is the sum of small efforts, repeated day in and day out.&rdquo;
              </blockquote>
              <p className="text-sm text-muted-foreground">
                — Robert Collier
              </p>
            </CardContent>
          </Card>

          {/* Partner Requests */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Partner Requests
              </CardTitle>
              <CardDescription>
                People who want to team up with you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sarah Martinez</p>
                    <p className="text-xs text-muted-foreground">
                      Wants to be your fitness partner
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">Decline</Button>
                    <Button size="sm">Accept</Button>
                  </div>
                </div>
              </div>
              <Button variant="ghost" className="w-full mt-3 text-sm">
                View All Requests
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}