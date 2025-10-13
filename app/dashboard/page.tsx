"use client"

import { useEffect, useState } from "react"
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
import { getSupabaseClient, type Goal, type Streak } from "@/lib/supabase"
import { isMockAuthEnabled, getMockUser } from "@/lib/mock-auth"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"

export default function DashboardPage() {
  const [, setUser] = useState<unknown>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    checkUser()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkUser = async () => {
    // Check if mock auth is enabled
    if (isMockAuthEnabled()) {
      setUser(getMockUser())
      setLoading(false)
      // Don't try to load real data in mock mode
      return
    }
    
    if (!supabase) {
      router.push("/auth/login")
      return
    }
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)
      await loadDashboardData(user.id)
    } catch (error) {
      console.error("Error:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardData = async (userId: string) => {
    if (!supabase) return
    try {
      // Load goals
      const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (goalsError) throw goalsError
      setGoals(goalsData || [])

      // Load streaks
      const { data: streaksData, error: streaksError } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", userId)

      if (streaksError) throw streaksError
      setStreaks(streaksData || [])
    } catch (_error: unknown) {
      toast.error("Failed to load dashboard data")
    }
  }

  const handleLogout = async () => {
    if (isMockAuthEnabled()) {
      router.push("/")
      return
    }
    
    if (!supabase) return
    await supabase.auth.signOut()
    router.push("/")
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

  const activeGoals = goals.filter(g => !g.completed_at && !g.is_suspended)
  const completedGoals = goals.filter(g => g.completed_at)
  const totalStreak = streaks.reduce((sum, s) => sum + s.current_streak, 0)
  const totalCompletions = streaks.reduce((sum, s) => sum + s.total_completions, 0)

  // Mock data for rich dashboard content
  const todayStats = {
    completed: 7,
    pending: 3,
    streak: 12,
    longestStreak: 28
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

  const upcomingDeadlines = [
    {
      id: 1,
      title: "Complete React Course",
      dueDate: "2024-02-15",
      progress: 75,
      priority: "high"
    },
    {
      id: 2,
      title: "Finish Book Reading",
      dueDate: "2024-02-20",
      progress: 45,
      priority: "medium"
    }
  ]

  const categoryProgress = [
    { name: "Health & Fitness", progress: 80, color: "bg-green-500", icon: Heart },
    { name: "Career", progress: 65, color: "bg-blue-500", icon: Briefcase },
    { name: "Learning", progress: 55, color: "bg-purple-500", icon: BookOpen },
    { name: "Personal", progress: 40, color: "bg-orange-500", icon: Star }
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, <span className="text-gradient-primary">John!</span>
            </h1>
            <p className="text-muted-foreground">
              You're on a {todayStats.streak}-day streak! Keep up the great work! 🔥
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/goals/create">
              <Button className="hover-lift">
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </Link>
            <Link href="/partners/find">
              <Button variant="outline" className="hover-lift">
                <Users className="h-4 w-4 mr-2" />
                Find Partners
              </Button>
            </Link>
          </div>
        </div>

        {/* Today's Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="text-3xl font-bold">{todayStats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-500/10">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Today</p>
                  <p className="text-3xl font-bold">{todayStats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Flame className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-3xl font-bold">{todayStats.streak}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Best Streak</p>
                  <p className="text-3xl font-bold">{todayStats.longestStreak}</p>
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
                {upcomingDeadlines.map((goal) => (
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
                ))}
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
                How you're doing across different areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryProgress.map((category) => {
                  const Icon = category.icon
                  return (
                    <div key={category.name} className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                        <Icon className={`h-4 w-4 ${category.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-sm text-muted-foreground">{category.progress}%</span>
                        </div>
                        <Progress value={category.progress} className="h-2" />
                      </div>
                    </div>
                  )
                })}
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
