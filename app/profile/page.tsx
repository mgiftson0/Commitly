"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Target,
  ArrowLeft,
  Trophy,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Edit,
  Settings,
  Award,
  TrendingUp,
  Flame,
  CheckCircle2,
  Clock,
  Users,
  Star,
  BookOpen,
  Dumbbell,
  Briefcase,
  Heart,
  Palette,
  Camera,
  Mail,
  Phone,
  Globe,
  Github,
  Twitter,
  Linkedin
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseClient, type User, type Goal } from "@/lib/supabase"
import { isMockAuthEnabled, getMockUser } from "@/lib/mock-auth"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"

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
    if (isMockAuthEnabled()) {
      setUser(getMockUser() as unknown as User)
      setLoading(false)
      return
    }
    
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

  // Mock data for rich profile experience
  const achievements = [
    {
      id: 1,
      title: "Early Bird",
      description: "Complete 10 morning goals",
      icon: "🌅",
      earnedAt: "2024-01-15",
      rarity: "common"
    },
    {
      id: 2,
      title: "Streak Master",
      description: "Maintain a 30-day streak",
      icon: "🔥",
      earnedAt: "2024-02-01",
      rarity: "rare"
    },
    {
      id: 3,
      title: "Goal Crusher",
      description: "Complete 50 goals",
      icon: "💪",
      earnedAt: "2024-02-10",
      rarity: "epic"
    },
    {
      id: 4,
      title: "Social Butterfly",
      description: "Connect with 10 partners",
      icon: "🦋",
      earnedAt: "2024-02-20",
      rarity: "rare"
    }
  ]

  const categoryStats = [
    { name: "Health & Fitness", completed: 12, total: 15, color: "bg-green-500", icon: Heart },
    { name: "Learning", completed: 8, total: 12, color: "bg-blue-500", icon: BookOpen },
    { name: "Career", completed: 5, total: 8, color: "bg-purple-500", icon: Briefcase },
    { name: "Personal", completed: 10, total: 14, color: "bg-orange-500", icon: Star }
  ]

  const recentActivity = [
    {
      id: 1,
      type: "goal_completed",
      title: "Morning Workout",
      time: "2 hours ago",
      icon: Dumbbell,
      color: "text-green-600"
    },
    {
      id: 2,
      type: "achievement_earned",
      title: "Earned 'Streak Master' badge",
      time: "1 day ago",
      icon: Trophy,
      color: "text-yellow-600"
    },
    {
      id: 3,
      type: "partner_joined",
      title: "Connected with Sarah Martinez",
      time: "3 days ago",
      icon: Users,
      color: "text-blue-600"
    }
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">
              Manage your profile and showcase your achievements
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/settings">
              <Button variant="outline" className="hover-lift">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button className="hover-lift">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Profile Header */}
        <Card className="hover-lift">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-primary/20">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full hover-lift"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm text-muted-foreground">Level</span>
                    <Badge variant="secondary">25</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    2,450 / 3,000 XP to next level
                  </div>
                  <Progress value={75} className="w-32 h-1.5 mt-2" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="mb-4">
                  <h2 className="text-3xl font-bold mb-2">{user?.display_name || "John Doe"}</h2>
                  <p className="text-muted-foreground mb-2">@{user?.username || "johndoe"}</p>
                  <p className="text-sm leading-relaxed max-w-2xl">
                    {user?.bio || "Goal-oriented individual passionate about personal growth and helping others achieve their dreams. Love connecting with like-minded people to share motivation and accountability."}
                  </p>
                </div>

                {/* Location & Social */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LinkIcon className="h-4 w-4" />
                    <span>johndoe.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Github className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Linkedin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{followers}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{following}</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{goals.length}</div>
                    <div className="text-sm text-muted-foreground">Goals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{achievements.length}</div>
                    <div className="text-sm text-muted-foreground">Badges</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Goals</p>
                  <p className="text-3xl font-bold">{activeGoals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/10">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold">{completedGoals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-500/10">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-3xl font-bold">12</p>
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
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-3xl font-bold">94%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Goals Overview */}
            <Card className="hover-lift">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Goals Overview
                  </CardTitle>
                  <Link href="/goals">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="recent" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="recent">Recent ({goals.length})</TabsTrigger>
                    <TabsTrigger value="active">Active ({activeGoals.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({completedGoals.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="recent" className="space-y-3">
                    {goals.slice(0, 5).map((goal) => (
                      <Link key={goal.id} href={`/goals/${goal.id}`}>
                        <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Target className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{goal.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {goal.goal_type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {goal.visibility}
                              </Badge>
                            </div>
                          </div>
                          {goal.completed_at ? (
                            <Badge className="bg-green-600">Completed</Badge>
                          ) : (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </TabsContent>

                  <TabsContent value="active" className="space-y-3">
                    {activeGoals.slice(0, 5).map((goal) => (
                      <Link key={goal.id} href={`/goals/${goal.id}`}>
                        <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Target className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{goal.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {goal.goal_type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {goal.visibility}
                              </Badge>
                            </div>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      </Link>
                    ))}
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-3">
                    {completedGoals.slice(0, 5).map((goal) => (
                      <Link key={goal.id} href={`/goals/${goal.id}`}>
                        <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                          <div className="p-2 rounded-lg bg-green-500/10">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{goal.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {goal.goal_type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {goal.visibility}
                              </Badge>
                            </div>
                          </div>
                          <Badge className="bg-green-600">Completed</Badge>
                        </div>
                      </Link>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(achievement.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={achievement.rarity === 'epic' ? 'default' : 'secondary'} className="text-xs">
                      {achievement.rarity}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full text-sm">
                  View All Achievements
                </Button>
              </CardContent>
            </Card>

            {/* Category Progress */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Category Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryStats.map((category) => {
                  const Icon = category.icon
                  const percentage = (category.completed / category.total) * 100
                  return (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${category.color.replace('bg-', 'text-')}`} />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {category.completed}/{category.total}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
