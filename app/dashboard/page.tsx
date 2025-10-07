"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Plus, Bell, User, Search, Flame, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseClient, type Goal, type Streak } from "@/lib/supabase"
import { toast } from "sonner"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
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
    } catch (error: any) {
      toast.error("Failed to load dashboard data")
    }
  }

  const handleLogout = async () => {
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Target className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold">Commitly</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/search">
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Goals</CardDescription>
              <CardTitle className="text-3xl">{activeGoals.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <Target className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Streak</CardDescription>
              <CardTitle className="text-3xl">{totalStreak}</CardTitle>
            </CardHeader>
            <CardContent>
              <Flame className="h-8 w-8 text-orange-600" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">{completedGoals.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Completions</CardDescription>
              <CardTitle className="text-3xl">{totalCompletions}</CardTitle>
            </CardHeader>
            <CardContent>
              <Clock className="h-8 w-8 text-purple-600" />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Link href="/goals/create">
            <Button size="lg" className="w-full md:w-auto">
              <Plus className="h-5 w-5 mr-2" />
              Create New Goal
            </Button>
          </Link>
        </div>

        {/* Active Goals */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Active Goals</h2>
          {activeGoals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  No active goals yet. Create your first goal to get started!
                </p>
                <Link href="/goals/create">
                  <Button>Create Goal</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeGoals.map((goal) => (
                <Link key={goal.id} href={`/goals/${goal.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={
                          goal.goal_type === 'single' ? 'default' :
                          goal.goal_type === 'multi' ? 'secondary' : 'outline'
                        }>
                          {goal.goal_type}
                        </Badge>
                        <Badge variant="outline">{goal.visibility}</Badge>
                      </div>
                      <CardTitle className="line-clamp-2">{goal.title}</CardTitle>
                      {goal.description && (
                        <CardDescription className="line-clamp-2">
                          {goal.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Progress</span>
                          <span className="font-medium">0%</span>
                        </div>
                        <Progress value={0} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Completions */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Recently Completed</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedGoals.slice(0, 3).map((goal) => (
                <Link key={goal.id} href={`/goals/${goal.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-75">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <Badge variant="outline">Completed</Badge>
                      </div>
                      <CardTitle className="line-clamp-2">{goal.title}</CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
