"use client"

import { useEffect, useState } from "react"
import * as React from "react"
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
// Removed backend dependencies - using localStorage only
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"

// Mock auth helper
const isMockAuthEnabled = () => true

export default function ProfilePage() {
  const [goals, setGoals] = useState<any[]>([])
  const [followers, setFollowers] = useState(125)
  const [following, setFollowing] = useState(89)
  const [loading, setLoading] = useState(true)
  const [myStoreGoals, setMyStoreGoals] = useState<any[]>([])
  const [partnerStoreGoals, setPartnerStoreGoals] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const router = useRouter()

  // Calculate category stats from real goals
  const categoryStats = React.useMemo(() => {
    try {
      const categories = ['Health & Fitness', 'Learning', 'Career', 'Personal']
      const categoryMap = {
        'health-fitness': 'Health & Fitness',
        'learning': 'Learning', 
        'career': 'Career',
        'personal': 'Personal'
      }
      
      return categories.map(category => {
        const categoryGoals = myStoreGoals.filter((g: any) => {
          const mappedCategory = categoryMap[g.category as keyof typeof categoryMap] || g.category
          return mappedCategory === category
        })
        const completed = categoryGoals.filter((g: any) => g.completedAt).length
        const total = categoryGoals.length
        
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
          color: colorMap[category as keyof typeof colorMap],
          icon: iconMap[category as keyof typeof iconMap]
        }
      }).filter(c => c.total > 0)
    } catch {
      return []
    }
  }, [myStoreGoals])

  useEffect(() => {
    loadGoals()
    loadUserProfile()
  }, [])

  const loadUserProfile = () => {
    try {
      const kycData = localStorage.getItem('kycData')
      if (kycData) {
        setUserProfile(JSON.parse(kycData))
      } else {
        // Default profile if no KYC data
        setUserProfile({
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'john@example.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          website: 'johndoe.com',
          bio: 'Goal-oriented individual passionate about personal growth and helping others achieve their dreams.'
        })
      }
    } catch {
      setUserProfile({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        website: 'johndoe.com',
        bio: 'Goal-oriented individual passionate about personal growth and helping others achieve their dreams.'
      })
    }
  }

  const loadGoals = () => {
    try {
      const storedGoals = localStorage.getItem('goals')
      const storedPartnerGoals = localStorage.getItem('partnerGoals')
      
      if (storedGoals) {
        const goals = JSON.parse(storedGoals)
        const mapped = goals.map((g: any) => ({
          id: String(g.id),
          user_id: 'mock-user-id',
          title: g.title,
          description: g.description,
          goal_type: g.type === 'multi-activity' ? 'multi' : g.type === 'single-activity' ? 'single' : g.type,
          visibility: g.visibility,
          is_suspended: g.status === 'paused',
          created_at: g.createdAt,
          updated_at: g.updatedAt || g.createdAt,
          completed_at: g.completedAt || null,
          start_date: g.createdAt,
        }))
        setGoals(mapped as any)
        setMyStoreGoals(goals)
      }
      
      if (storedPartnerGoals) {
        const partnerGoals = JSON.parse(storedPartnerGoals)
        setPartnerStoreGoals(partnerGoals)
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
      icon: "??",
      earnedAt: "2024-01-15",
      rarity: "common"
    },
    {
      id: 2,
      title: "Streak Master",
      description: "Maintain a 30-day streak",
      icon: "??",
      earnedAt: "2024-02-01",
      rarity: "rare"
    },
    {
      id: 3,
      title: "Goal Crusher",
      description: "Complete 50 goals",
      icon: "??",
      earnedAt: "2024-02-10",
      rarity: "epic"
    },
    {
      id: 4,
      title: "Social Butterfly",
      description: "Connect with 10 partners",
      icon: "??",
      earnedAt: "2024-02-20",
      rarity: "rare"
    }
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
      <div className="space-y-4 sm:space-y-6">
        {/* Profile Header Card */}
        <Card className="overflow-hidden">
          {/* Cover Image */}
          <div className="h-24 sm:h-32 md:h-40 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20" />
          
          <CardContent className="p-3 sm:p-4 md:p-6">
            {/* Avatar & Action Buttons */}
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="relative -mt-12 sm:-mt-16">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 border-4 border-background">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="text-xl sm:text-2xl md:text-3xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                    JD
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex gap-2">
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Settings</span>
                  </Button>
                </Link>
                <Link href="/profile/edit">
                  <Button size="sm" className="text-xs">
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Edit Profile</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-2 sm:space-y-3">
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
                  {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'John Doe'}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  @{userProfile?.username || 'johndoe'}
                </p>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed">
                {userProfile?.bio || 'Goal-oriented individual passionate about personal growth and helping others achieve their dreams.'}
              </p>

              {/* Location & Links */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                {userProfile?.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{userProfile.location}</span>
                  </div>
                )}
                {userProfile?.website && (
                  <div className="flex items-center gap-1.5">
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span>{userProfile.website}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Joined January 2024</span>
                </div>
              </div>

              {/* Twitter-style Stats Row */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
                <button className="hover:underline">
                  <span className="font-bold text-sm sm:text-base">{followers}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground ml-1">Followers</span>
                </button>
                <button className="hover:underline">
                  <span className="font-bold text-sm sm:text-base">{following}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground ml-1">Following</span>
                </button>
                <div>
                  <span className="font-bold text-sm sm:text-base">{goals.length}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground ml-1">Goals</span>
                </div>
                <div>
                  <span className="font-bold text-sm sm:text-base">{achievements.length}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground ml-1">Badges</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compact Stats Row - No Cards */}
        <div className="border rounded-lg p-3 sm:p-4 bg-card">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-bold">{activeGoals.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <Trophy className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-bold">{completedGoals.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full bg-orange-500/10">
                <Flame className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-bold">12</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Streak</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full bg-purple-500/10">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-base sm:text-lg md:text-xl font-bold">94%</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Success</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Goals Overview */}
            <Card className="hover-lift">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                    Goals Overview
                  </CardTitle>
                  <Link href="/goals">
                    <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <Tabs defaultValue="recent" className="space-y-3 sm:space-y-4">
                  <TabsList className="grid w-full grid-cols-3 h-auto">
                    <TabsTrigger value="recent" className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-3 py-1.5 sm:py-2">Recent ({goals.length})</TabsTrigger>
                    <TabsTrigger value="active" className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-3 py-1.5 sm:py-2">Active ({activeGoals.length})</TabsTrigger>
                    <TabsTrigger value="completed" className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-3 py-1.5 sm:py-2">Completed ({completedGoals.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="recent" className="space-y-2 sm:space-y-3">
                    {goals.slice(0, 5).map((goal) => (
                      <Link key={goal.id} href={`/goals/${goal.id}`}>
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-xs sm:text-sm truncate">{goal.title}</h4>
                            <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-[10px] sm:text-xs">
                                {goal.goal_type}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] sm:text-xs">
                                {goal.visibility}
                              </Badge>
                              {isMockAuthEnabled() && (() => {
                                try {
                                  const s = myStoreGoals.find((g: any) => String(g.id) === String(goal.id))
                                  if (!s) return null
                                  return (
                                    <>
                                      {s.dueDate && (
                                        <Badge variant="outline" className="text-[10px] sm:text-xs">Due: {new Date(s.dueDate).toLocaleDateString()}</Badge>
                                      )}
                                      {s.recurrencePattern && (
                                        <Badge variant="outline" className="text-[10px] sm:text-xs">{s.recurrencePattern === 'custom' ? 'Custom' : (s.recurrencePattern.charAt(0).toUpperCase() + s.recurrencePattern.slice(1))}</Badge>
                                      )}
                                    </>
                                  )
                                } catch { return null }
                              })()}
                            </div>
                          </div>
                          {goal.completed_at ? (
                            <Badge className="bg-green-600 text-[10px] sm:text-xs flex-shrink-0">Completed</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">Active</Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </TabsContent>

                  <TabsContent value="active" className="space-y-2 sm:space-y-3">
                    {activeGoals.slice(0, 5).map((goal) => (
                      <Link key={goal.id} href={`/goals/${goal.id}`}>
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-xs sm:text-sm truncate">{goal.title}</h4>
                            <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-[10px] sm:text-xs">
                                {goal.goal_type}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] sm:text-xs">
                                {goal.visibility}
                              </Badge>
                              {isMockAuthEnabled() && (() => {
                                try {
                                  const s = myStoreGoals.find((g: any) => String(g.id) === String(goal.id))
                                  if (!s) return null
                                  return (
                                    <>
                                      {s.dueDate && (
                                        <Badge variant="outline" className="text-[10px] sm:text-xs">Due: {new Date(s.dueDate).toLocaleDateString()}</Badge>
                                      )}
                                      {s.recurrencePattern && (
                                        <Badge variant="outline" className="text-[10px] sm:text-xs">{s.recurrencePattern === 'custom' ? 'Custom' : (s.recurrencePattern.charAt(0).toUpperCase() + s.recurrencePattern.slice(1))}</Badge>
                                      )}
                                    </>
                                  )
                                } catch { return null }
                              })()}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">Active</Badge>
                        </div>
                      </Link>
                    ))}
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-2 sm:space-y-3">
                    {completedGoals.slice(0, 5).map((goal) => (
                      <Link key={goal.id} href={`/goals/${goal.id}`}>
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/10 flex-shrink-0">
                            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-xs sm:text-sm truncate">{goal.title}</h4>
                            <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-[10px] sm:text-xs">
                                {goal.goal_type}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] sm:text-xs">
                                {goal.visibility}
                              </Badge>
                              {isMockAuthEnabled() && (() => {
                                try {
                                  const s = myStoreGoals.find((g: any) => String(g.id) === String(goal.id))
                                  if (!s) return null
                                  return (
                                    <>
                                      {s.dueDate && (
                                        <Badge variant="outline" className="text-[10px] sm:text-xs">Due: {new Date(s.dueDate).toLocaleDateString()}</Badge>
                                      )}
                                      {s.recurrencePattern && (
                                        <Badge variant="outline" className="text-[10px] sm:text-xs">{s.recurrencePattern === 'custom' ? 'Custom' : (s.recurrencePattern.charAt(0).toUpperCase() + s.recurrencePattern.slice(1))}</Badge>
                                      )}
                                    </>
                                  )
                                } catch { return null }
                              })()}
                            </div>
                          </div>
                          <Badge className="bg-green-600 text-[10px] sm:text-xs flex-shrink-0">Completed</Badge>
                        </div>
                      </Link>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Partner Goals */}
            {partnerStoreGoals.length > 0 && (
              <Card className="hover-lift mt-4 sm:mt-6">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                      Partner Goals
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] sm:text-xs">{partnerStoreGoals.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
                  {partnerStoreGoals.slice(0, 5).map((g: any) => (
                    <Link key={g.id} href={`/goals/${g.id}/partner`}>
                      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-muted flex-shrink-0">
                          <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-xs sm:text-sm truncate">{g.title}</h4>
                          <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-[10px] sm:text-xs">{g.type}</Badge>
                            <Badge variant="outline" className="text-[10px] sm:text-xs">{g.visibility}</Badge>
                            {g.recurrencePattern && (
                              <Badge variant="outline" className="text-[10px] sm:text-xs">{g.recurrencePattern === 'custom' ? 'Custom' : (g.recurrencePattern.charAt(0).toUpperCase() + g.recurrencePattern.slice(1))}</Badge>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">Partner</Badge>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Achievements */}
            <Card className="hover-lift">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
                {achievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50">
                    <div className="text-xl sm:text-2xl flex-shrink-0">{achievement.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs sm:text-sm truncate">{achievement.title}</h4>
                      <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                        {achievement.description}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        {new Date(achievement.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={achievement.rarity === 'epic' ? 'default' : 'secondary'} className="text-[10px] sm:text-xs flex-shrink-0">
                      {achievement.rarity}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full text-xs sm:text-sm">
                  View All Achievements
                </Button>
              </CardContent>
            </Card>

            {/* Category Progress */}
            <Card className="hover-lift">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Category Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                {categoryStats.map((category) => {
                  const Icon = category.icon
                  const percentage = (category.completed / category.total) * 100
                  return (
                    <div key={category.name} className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Icon className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${category.color.replace('bg-', 'text-')}`} />
                          <span className="text-xs sm:text-sm font-medium truncate">{category.name}</span>
                        </div>
                        <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                          {category.completed}/{category.total}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-1.5 sm:h-2" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="hover-lift">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon
                  return (
                    <div key={activity.id} className="flex items-start gap-2 sm:gap-3">
                      <div className={`p-1.5 sm:p-2 rounded-full bg-muted flex-shrink-0`}>
                        <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium line-clamp-2">{activity.title}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
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
