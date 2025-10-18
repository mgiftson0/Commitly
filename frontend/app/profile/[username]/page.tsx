"use client"

import { useEffect, useState } from "react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  UserPlus,
  UserMinus,
  Lock,
  Eye,
  EyeOff
} from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"
import { AchievementSquare } from "@/components/achievements/achievement-square"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [goals, setGoals] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [canViewProfile, setCanViewProfile] = useState(false)
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const [followers, setFollowers] = useState<any[]>([])
  const [following, setFollowing] = useState<any[]>([])
  
  const router = useRouter()
  const params = useParams()
  const username = params.username as string
  const currentUserId = 'mock-user-id'

  useEffect(() => {
    loadProfile()
  }, [username])

  const loadProfile = async () => {
    try {
      // Simple profile loading - just check if user exists
      // Always show profile for johndoe
      const targetProfile = {
        id: 'mock-user-id',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Goal-oriented individual passionate about personal growth.',
        joinDate: '2024-01-15',
        followersCount: 125,
        followingCount: 89,
        visibility: {
          profileVisibility: 'public',
          showStreaks: true,
          showAchievements: true,
          showProgress: true,
          showFollowers: true,
          showFollowing: true,
          showGoals: true
        }
      }
      
      if (!targetProfile) {
        setProfile(null)
        setCanViewProfile(false)
        setLoading(false)
        return
      }

      setProfile(targetProfile)
      setIsOwner(targetProfile.id === currentUserId)
      setCanViewProfile(true)
      
      // Load sample goals
      setGoals([
        { id: '1', title: 'Morning Workout', visibility: 'public', status: 'active', progress: 75, completedAt: null },
        { id: '2', title: 'Learn Spanish', visibility: 'public', status: 'active', progress: 45, completedAt: null }
      ])
      
      // Load sample achievements
      setAchievements([
        { id: 'first_goal', unlocked: true, title: 'First Steps', rarity: 'common' },
        { id: 'streak_starter', unlocked: true, title: 'Streak Starter', rarity: 'rare' }
      ])
    } catch (error) {
      console.error('Failed to load profile:', error)
      setProfile(null)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Target className="h-12 w-12 text-blue-600 animate-pulse" />
      </div>
    )
  }

  if (!canViewProfile || !profile) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Lock className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h1 className="text-2xl font-bold">Profile Not Available</h1>
              <p className="text-muted-foreground">
                {!profile ? 'User not found' : 'This profile is private'}
              </p>
            </div>
            <Link href="/dashboard">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Profile Header Card */}
        <Card className="overflow-hidden">
          <div className="h-24 sm:h-32 md:h-40 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20" />
          
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="relative -mt-12 sm:-mt-16">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 border-4 border-background">
                  <AvatarImage src={profile.avatar || "/placeholder-avatar.jpg"} />
                  <AvatarFallback className="text-xl sm:text-2xl md:text-3xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex gap-2">
                {isOwner ? (
                  <>
                    <Link href="/settings/privacy">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Settings className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Privacy</span>
                      </Button>
                    </Link>
                    <Link href="/profile/edit">
                      <Button size="sm" className="text-xs">
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Edit Profile</span>
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button size="sm" className="text-xs">
                    <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Follow</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  @{profile.username}
                </p>
              </div>

              {profile.bio && (
                <p className="text-xs sm:text-sm leading-relaxed">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Follow Stats */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
                <div>
                  <span className="font-bold text-sm sm:text-base">{profile.followersCount}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-bold text-sm sm:text-base">{profile.followingCount}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground ml-1">Following</span>
                </div>
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

        {/* Content Tabs */}
        <Tabs defaultValue="goals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="goals">Goals ({goals.length})</TabsTrigger>
            <TabsTrigger value="achievements">Achievements ({achievements.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-4">
            {goals.length > 0 ? (
              <div className="grid gap-4">
                {goals.map(goal => (
                  <Card key={goal.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{goal.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {goal.visibility}
                            </Badge>
                            <Badge variant="outline" className="text-xs">Active</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{goal.progress}%</div>
                          <Progress value={goal.progress} className="w-16 h-1.5 mt-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No goals yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            {achievements.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {achievements.map(achievement => (
                  <AchievementSquare 
                    key={achievement.id}
                    achievement={achievement}
                    size="md"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No achievements yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}