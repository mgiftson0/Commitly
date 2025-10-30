"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Link as LinkIcon,
  UserPlus,
  UserCheck,
  MessageCircle,
  Target,
  Trophy,
  Star,
  Heart,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Users,
  MoreHorizontal,
  Clock,
  Flame
} from "lucide-react"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { authHelpers, supabase } from "@/lib/supabase-client"
import { toast } from "sonner"

import { SocialLinks } from "@/components/profile/social-links"
import { getGoalStreak } from "@/lib/streak-manager"
import { StreakBadge } from "@/components/streaks/streak-badge"
import { UnfollowDialog } from "@/components/ui/unfollow-dialog"
import { ShareProfile } from "@/components/profile/share-profile"
import { FollowersModal } from "@/components/profile/followers-modal"

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  
  const [profile, setProfile] = useState<any>(null)
  const [goals, setGoals] = useState<any[]>([])
  const [goalsWithStreaks, setGoalsWithStreaks] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [followState, setFollowState] = useState<'none' | 'pending' | 'following' | 'mutual'>('none')
  const [loading, setLoading] = useState(true)
  const [followingCount, setFollowingCount] = useState(0)
  const [followersCount, setFollowersCount] = useState(0)
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false)
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [followersModalTab, setFollowersModalTab] = useState<'followers' | 'following'>('followers')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await authHelpers.getCurrentUser()
        setCurrentUser(user)

        // Load profile by username
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single()

        if (profileError) {
          console.error('Profile not found:', profileError)
          router.push('/404')
          return
        }

        setProfile(profileData)

        // Load public goals
        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', profileData.id)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })

        setGoals(goalsData || [])

        // Load streaks for public goals
        if (goalsData && goalsData.length > 0) {
          const goalsWithStreakData = await Promise.all(
            goalsData.map(async (goal) => {
              const streak = await getGoalStreak(goal.id, profileData.id)
              return { ...goal, streak }
            })
          )
          setGoalsWithStreaks(goalsWithStreakData)
        }

        // Force fresh follow counts
        const { data: freshCounts } = await supabase
          .from('profiles')
          .select('followers_count, following_count')
          .eq('id', profileData.id)
          .single()
        
        console.log('Profile counts for', profileData.username, ':', freshCounts)
        setFollowingCount(freshCounts?.following_count || 0)
        setFollowersCount(freshCounts?.followers_count || 0)

        // Check follow relationship if user is logged in
        if (user && user.id !== profileData.id) {
          const { data: followData } = await supabase
            .from('follows')
            .select('status')
            .eq('follower_id', user.id)
            .eq('following_id', profileData.id)
            .maybeSingle()

          if (followData && followData.status === 'accepted') {
            // Check if it's mutual (they follow back)
            const { data: reverseFollow } = await supabase
              .from('follows')
              .select('status')
              .eq('follower_id', profileData.id)
              .eq('following_id', user.id)
              .eq('status', 'accepted')
              .maybeSingle()
            
            setFollowState(reverseFollow ? 'mutual' : 'following')
          } else if (followData) {
            setFollowState('pending')
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        router.push('/404')
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      loadProfile()
    }
  }, [username, router])

  const handleFollowAction = async (action: 'follow' | 'unfollow') => {
    if (!currentUser || !profile) return

    try {
      if (action === 'follow') {
        // Get sender's profile data for notification
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, username')
          .eq('id', currentUser.id)
          .single()

        // Insert follow relationship
        const followStatus = profile.is_private ? 'pending' : 'accepted'
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: profile.id,
            status: followStatus
          })

        if (error) {
          if (error.code === '23505') {
            toast.error('Already following or request sent')
          } else {
            console.error('Follow error:', error)
            throw error
          }
          return
        }

        // Create notification
        const senderName = senderProfile?.first_name 
          ? `${senderProfile.first_name} ${senderProfile.last_name || ''}`.trim()
          : senderProfile?.username || 'Someone'

        const notificationType = profile.is_private ? 'follow_request' : 'new_follower'
        const notificationMessage = profile.is_private 
          ? `${senderName} wants to follow you!`
          : `${senderName} started following you!`

        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: profile.id,
            related_user_id: currentUser.id,
            title: profile.is_private ? 'New Follow Request' : 'New Follower',
            message: notificationMessage,
            type: notificationType,
            is_read: false,
            data: { 
              sender_id: currentUser.id,
              sender_name: senderName,
              sender_username: senderProfile?.username || 'user'
            }
          })

        if (notifError) {
          console.error('Notification error:', notifError)
        }

        setFollowState(followStatus === 'accepted' ? 'following' : 'pending')
        
        // Refresh profile data to get updated counts
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('followers_count, following_count')
          .eq('id', profile.id)
          .single()
        
        if (updatedProfile) {
          setFollowersCount(updatedProfile.followers_count || 0)
        }
        
        // Update local counts if accepted immediately
        if (followStatus === 'accepted') {
          toast.success('Following successfully!')
        } else {
          toast.success('Follow request sent!')
        }
        
      } else if (action === 'unfollow') {
        // Delete the follow relationship
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id)

        if (error) {
          console.error('Unfollow error:', error)
          throw error
        }

        // Refresh profile data to get updated counts
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('followers_count, following_count')
          .eq('id', profile.id)
          .single()
        
        if (updatedProfile) {
          setFollowersCount(updatedProfile.followers_count || 0)
        }
        
        setFollowState('none')
        toast.success('Unfollowed successfully!')
      }
    } catch (error: any) {
      console.error('Follow action error:', error)
      toast.error(error.message || 'Action failed')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    )
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <Link href="/search">
            <Button>Search Users</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const isOwnProfile = currentUser?.id === profile.id
  const completedGoals = goals.filter(g => g.completed_at || g.status === 'completed')
  const activeGoals = goals.filter(g => !g.completed_at && g.status !== 'completed')

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center gap-4 p-4 border-b bg-card/50 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover-lift">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gradient-primary">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {goals.length} public goals • {followersCount} followers
            </p>
          </div>
        </div>

        {/* Enhanced Profile Header Card */}
        <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
          {/* Enhanced Cover Image */}
          <div className="h-32 sm:h-40 md:h-48 bg-gradient-to-br from-primary/10 via-primary/20 to-primary/10 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
          </div>

          {/* Profile Info */}
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="relative -mt-12 sm:-mt-16">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-xl" />
                <Avatar className="relative h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={profile.profile_picture_url} />
                  <AvatarFallback className="text-2xl sm:text-3xl md:text-4xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 text-primary-foreground font-bold">
                    {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex gap-2 mt-2">
                {!isOwnProfile && currentUser && (
                  <>
                    <Button variant="outline" size="sm" className="hover-lift">
                      <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Message</span>
                    </Button>

                    {followState === 'none' && (
                      <Button size="sm" onClick={() => handleFollowAction('follow')} className="hover-lift">
                        <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Follow
                      </Button>
                    )}

                    {followState === 'pending' && (
                      <Button size="sm" variant="outline" disabled className="hover-lift">
                        <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Pending
                      </Button>
                    )}

                    {followState === 'following' && (
                      <Button size="sm" variant="outline" onClick={() => setShowUnfollowDialog(true)} className="hover-lift">
                        <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Following
                      </Button>
                    )}

                    {followState === 'mutual' && (
                      <Button size="sm" variant="outline" onClick={() => setShowUnfollowDialog(true)} className="hover-lift">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Mutual
                      </Button>
                    )}
                  </>
                )}

                {isOwnProfile && (
                  <Link href="/profile/edit">
                    <Button variant="outline" size="sm" className="hover-lift">
                      Edit Profile
                    </Button>
                  </Link>
                )}

                <ShareProfile
                  username={profile.username}
                  displayName={profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || 'User' : 'User'}
                  profilePicture={profile.profile_picture_url}
                />

                <Button variant="ghost" size="icon" className="hover-lift">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Enhanced Profile Info */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground font-medium">
                  @{profile.username}
                </p>
              </div>

              {profile.bio && (
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground max-w-2xl">
                  {profile.bio}
                </p>
              )}

              {/* Enhanced Location & Links */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
                {profile.location && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full hover-lift">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full hover-lift">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              <SocialLinks profile={{
                instagram: profile?.instagram,
                twitter: profile?.twitter,
                snapchat: profile?.snapchat,
                email: profile?.email
              }} />

              {/* Enhanced Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-border/50">
                <div
                  className="text-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer hover-lift hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
                  onClick={() => {
                    setFollowersModalTab('following')
                    setShowFollowersModal(true)
                  }}
                >
                  <div className="font-bold text-lg sm:text-xl text-primary">{followingCount}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Following</div>
                </div>
                <div
                  className="text-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer hover-lift hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
                  onClick={() => {
                    setFollowersModalTab('followers')
                    setShowFollowersModal(true)
                  }}
                >
                  <div className="font-bold text-lg sm:text-xl text-primary">{followersCount}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors hover-lift hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                  <div className="font-bold text-lg sm:text-xl text-primary">{goals.length}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Goals</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors hover-lift hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                  <div className="font-bold text-lg sm:text-xl text-primary">
                    {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals Tabs */}
        <Tabs defaultValue="goals" className="space-y-0">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
            <TabsTrigger value="goals" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
              Goals
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-0 mt-0">
            <GoalsList goals={goals} />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-0 mt-0">
            <div className="py-12 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No achievements to show</p>
            </div>
          </TabsContent>
        </Tabs>
        
        <FollowersModal
          open={showFollowersModal}
          onOpenChange={setShowFollowersModal}
          userId={profile.id}
          initialTab={followersModalTab}
        />
        
        <UnfollowDialog
          open={showUnfollowDialog}
          onOpenChange={setShowUnfollowDialog}
          onConfirm={() => {
            handleFollowAction('unfollow')
            setShowUnfollowDialog(false)
          }}
          userName={profile.first_name || profile.username}
        />
      </div>
    </MainLayout>
  )
}

function GoalsList({ goals }: { goals: any[] }) {
  if (goals.length === 0) {
    return (
      <div className="py-12 text-center">
        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No public goals to show</p>
      </div>
    )
  }

  const activeGoals = goals.filter(g => !g.completed_at && g.status !== 'paused')
  const completedGoals = goals.filter(g => g.completed_at || g.status === 'completed')
  const pausedGoals = goals.filter(g => g.status === 'paused')
  const groupGoals = goals.filter(g => g.is_group_goal)

  const GoalCard = ({ goal }: { goal: any }) => {
    const isSeasonalGoal = goal.is_seasonal || goal.duration_type === 'seasonal'
    const isGroupGoal = goal.is_group_goal
    const isCompleted = goal.completed_at || goal.status === 'completed'
    const isPaused = goal.status === 'paused'
    const progress = isCompleted ? 100 : (goal.progress || 0)
    
    const getStatusColor = (status: string) => {
      switch (status) {
        case "active": return "bg-green-500"
        case "completed": return "bg-blue-500"
        case "paused": return "bg-yellow-500"
        case "pending": return "bg-orange-500"
        default: return "bg-gray-500"
      }
    }
    
    const getTypeIcon = (type: string) => {
      switch (type) {
        case "recurring": return <Flame className="h-4 w-4" />
        case "single": return <CheckCircle2 className="h-4 w-4" />
        case "multi": return <Target className="h-4 w-4" />
        default: return <Target className="h-4 w-4" />
      }
    }
    
    const getGoalCardStyle = () => {
      if (isCompleted) {
        return "ring-1 ring-green-200/50 hover:ring-green-300/70 shadow-green-100/50 hover:shadow-green-200/60 bg-gradient-to-br from-green-50/60 via-white to-green-50/30 dark:from-green-950/30 dark:via-background dark:to-green-950/20"
      }
      if (isSeasonalGoal) {
        return "ring-1 ring-amber-200/50 hover:ring-amber-300/70 shadow-amber-100/50 hover:shadow-amber-200/60 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 dark:from-amber-950/30 dark:via-background dark:to-amber-950/20"
      }
      if (isGroupGoal) {
        return "ring-1 ring-pink-200/50 hover:ring-pink-300/70 shadow-md shadow-pink-100/50 hover:shadow-lg hover:shadow-pink-200/60 bg-gradient-to-br from-pink-50/60 via-white to-pink-50/30 dark:from-pink-950/30 dark:via-background dark:to-pink-950/20 border-pink-200/40"
      }
      return "ring-1 ring-border/50 hover:ring-primary/30 shadow-slate-100/50 hover:shadow-slate-200/60"
    }

    return (
      <Link href={`/goals/${goal.id}`}>
        <Card className={`hover-lift group transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1 border-0 shadow-slate-900/15 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm ${getGoalCardStyle()}`}>
          {isGroupGoal && (
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-b border-purple-200/40 dark:border-purple-800/40 px-4 py-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Group Goal</span>
                {goal.group_goal_status && (
                  <Badge variant="outline" className="text-xs border-purple-200 text-purple-600 dark:border-purple-700 dark:text-purple-400">
                    {goal.group_goal_status}
                  </Badge>
                )}
              </div>
            </div>
          )}
          <CardHeader className="pb-2 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1 flex-wrap">
                {getTypeIcon(goal.goal_type || goal.type)}
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 shadow-sm bg-background/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors duration-200">
                  {goal.goal_type || goal.type}
                </Badge>
                {isSeasonalGoal && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200 shadow-sm hover:shadow-amber-200/50 transition-all duration-200">
                    <Star className="h-2.5 w-2.5 mr-0.5" />
                    Seasonal
                  </Badge>
                )}
              </div>
              {goal.streak && goal.streak > 0 && (
                <Badge className="bg-orange-500 text-white text-xs px-2">
                  <Flame className="h-3 w-3 mr-1" />
                  {goal.streak}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <CardTitle className="line-clamp-2 text-sm sm:text-base flex items-center gap-1.5">
                {isGroupGoal && (
                  <Users className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                )}
                <span className="truncate flex-1 break-words">{goal.title}</span>
              </CardTitle>
              {goal.description && (
                <CardDescription className="line-clamp-2 text-xs break-words">
                  {goal.description}
                </CardDescription>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className={`h-3 rounded-full bg-gradient-to-r from-muted/50 to-muted/30 border border-border/30 shadow-inner ${progress <= 30 ? '[&>div]:bg-red-500' : progress <= 70 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`} />
            </div>

            {/* Category and Due Date */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {goal.category?.replace('_', ' ') || 'Personal'}
              </span>
              {goal.target_date && (() => {
                const dueDate = new Date(goal.target_date)
                const today = new Date()
                
                // Set both dates to start of day for accurate comparison
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
                const dueDateStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
                
                const diffTime = dueDateStart.getTime() - todayStart.getTime()
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
                
                const getUrgencyColor = () => {
                  if (diffDays < 0) return 'text-red-600'
                  if (diffDays === 0) return 'text-orange-600'
                  if (diffDays <= 3) return 'text-yellow-600'
                  if (diffDays <= 7) return 'text-blue-600'
                  return 'text-muted-foreground'
                }
                
                const getText = () => {
                  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
                  if (diffDays === 0) return 'Due today'
                  if (diffDays === 1) return 'Due tomorrow'
                  return `${diffDays}d left`
                }
                
                return (
                  <div className={`flex items-center gap-1 ${getUrgencyColor()}`}>
                    <Calendar className="h-3 w-3" />
                    <span className="font-medium text-xs">{getText()}</span>
                  </div>
                )
              })()}
            </div>

            {/* Status and Created Date */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(goal.status)}`} />
                <span className="capitalize">{goal.status}</span>
              </div>
              <span>
                Created {new Date(goal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Tabs defaultValue="active" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="active">Active ({activeGoals.length})</TabsTrigger>
        <TabsTrigger value="completed">Completed ({completedGoals.length})</TabsTrigger>
        <TabsTrigger value="paused">Paused ({pausedGoals.length})</TabsTrigger>
        <TabsTrigger value="groups">Groups ({groupGoals.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="active" className="mt-6">
        {activeGoals.length === 0 ? (
          <div className="py-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No active goals</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="completed" className="mt-6">
        {completedGoals.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No completed goals</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {completedGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="paused" className="mt-6">
        {pausedGoals.length === 0 ? (
          <div className="py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No paused goals</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {pausedGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="groups" className="mt-6">
        {groupGoals.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No group goals</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {groupGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}