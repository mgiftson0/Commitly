"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Target, ArrowLeft, Trophy, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseClient, type User, type Goal } from "@/lib/supabase"
import { toast } from "sonner"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [followers, setFollowers] = useState(0)
  const [following, setFollowing] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    loadProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadProfile = async () => {
    if (!supabase) return
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push("/auth/login")
        return
      }

      // Load user profile
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (userError && userError.code !== "PGRST116") throw userError
      setUser(userData)

      // Load goals
      const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false })

      if (goalsError) throw goalsError
      setGoals(goalsData || [])

      // Load followers count
      const { count: followersCount } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("following_id", authUser.id)

      setFollowers(followersCount || 0)

      // Load following count
      const { count: followingCount } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", authUser.id)

      setFollowing(followingCount || 0)
    } catch (error: unknown) {
      toast.error("Failed to load profile")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Target className="h-12 w-12 text-blue-600 animate-pulse" />
      </div>
    )
  }

  // const publicGoals = goals.filter(g => g.visibility === "public")
  const completedGoals = goals.filter(g => g.completed_at)
  const activeGoals = goals.filter(g => !g.completed_at && !g.is_suspended)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Target className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.profile_picture_url} />
                <AvatarFallback className="text-2xl">
                  {user?.display_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-1">{user?.display_name || "User"}</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-2">@{user?.username || "username"}</p>
                {user?.bio && <p className="text-slate-700 dark:text-slate-300 mb-4">{user.bio}</p>}
                <div className="flex gap-6 justify-center md:justify-start">
                  <div className="text-center">
                    <div className="font-bold text-xl">{followers}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl">{following}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl">{goals.length}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Goals</div>
                  </div>
                </div>
              </div>
              <Button>Edit Profile</Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Goals</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Target className="h-6 w-6 text-blue-600" />
                {activeGoals.length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed Goals</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-6 w-6 text-green-600" />
                {completedGoals.length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Member Since</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calendar className="h-6 w-6 text-purple-600" />
                {user?.created_at ? new Date(user.created_at).getFullYear() : "2025"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Goals Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All ({goals.length})</TabsTrigger>
                <TabsTrigger value="active">Active ({activeGoals.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedGoals.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4 mt-4">
                {goals.length === 0 ? (
                  <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                    No goals yet
                  </div>
                ) : (
                  goals.map((goal) => (
                    <Link key={goal.id} href={`/goals/${goal.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{goal.title}</CardTitle>
                            <div className="flex gap-2">
                              <Badge variant="outline">{goal.goal_type}</Badge>
                              {goal.completed_at && <Badge className="bg-green-600">Completed</Badge>}
                            </div>
                          </div>
                          {goal.description && (
                            <CardDescription className="line-clamp-2">{goal.description}</CardDescription>
                          )}
                        </CardHeader>
                      </Card>
                    </Link>
                  ))
                )}
              </TabsContent>
              <TabsContent value="active" className="space-y-4 mt-4">
                {activeGoals.length === 0 ? (
                  <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                    No active goals
                  </div>
                ) : (
                  activeGoals.map((goal) => (
                    <Link key={goal.id} href={`/goals/${goal.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{goal.title}</CardTitle>
                            <Badge variant="outline">{goal.goal_type}</Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))
                )}
              </TabsContent>
              <TabsContent value="completed" className="space-y-4 mt-4">
                {completedGoals.length === 0 ? (
                  <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                    No completed goals yet
                  </div>
                ) : (
                  completedGoals.map((goal) => (
                    <Link key={goal.id} href={`/goals/${goal.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{goal.title}</CardTitle>
                            <Badge className="bg-green-600">Completed</Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
