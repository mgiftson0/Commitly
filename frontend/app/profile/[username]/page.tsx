"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Clock
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
import { Flame } from "lucide-react"
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {goals.length} goals
            </p>
          </div>
        </div>

        {/* Profile Header */}
        <div className="relative">
          {/* Cover */}
          <div className="h-48 bg-gradient-to-br from-primary/10 via-primary/20 to-primary/10" />
          
          {/* Profile Info */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-4">
              <Avatar className="h-24 w-24 -mt-12 border-4 border-background">
                <AvatarImage src={profile.profile_picture_url} />
                <AvatarFallback className="text-2xl">
                  {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex gap-2">
                {!isOwnProfile && currentUser && (
                  <>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    
                    {followState === 'none' && (
                      <Button size="sm" onClick={() => handleFollowAction('follow')}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </Button>
                    )}
                    
                    {followState === 'pending' && (
                      <Button size="sm" variant="outline" disabled>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Pending
                      </Button>
                    )}
                    
                    {followState === 'following' && (
                      <Button size="sm" variant="outline" onClick={() => setShowUnfollowDialog(true)}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Following
                      </Button>
                    )}
                    
                    {followState === 'mutual' && (
                      <Button size="sm" variant="outline" onClick={() => setShowUnfollowDialog(true)}>
                        <Users className="h-4 w-4 mr-2" />
                        Mutual
                      </Button>
                    )}
                  </>
                )}
                
                {isOwnProfile && (
                  <Link href="/profile/edit">
                    <Button variant="outline" size="sm">
                      Edit Profile
                    </Button>
                  </Link>
                )}
                

                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h2 className="text-2xl font-bold">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>
              
              {profile.bio && (
                <p className="text-sm leading-relaxed">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
                

                
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
              
              <div className="flex gap-6 text-sm">
                <span 
                  className="cursor-pointer hover:underline"
                  onClick={() => {
                    setFollowersModalTab('following')
                    setShowFollowersModal(true)
                  }}
                >
                  <strong>{followingCount}</strong> <span className="text-muted-foreground">Following</span>
                </span>
                <span 
                  className="cursor-pointer hover:underline"
                  onClick={() => {
                    setFollowersModalTab('followers')
                    setShowFollowersModal(true)
                  }}
                >
                  <strong>{followersCount}</strong> <span className="text-muted-foreground">Followers</span>
                </span>
              </div>
              
              <SocialLinks profile={{
                instagram: profile?.instagram,
                twitter: profile?.twitter,
                snapchat: profile?.snapchat,
                email: profile?.email
              }} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 border-b">
          <div className="text-center py-4">
            <div className="text-lg font-bold">{activeGoals.length}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="text-center py-4">
            <div className="text-lg font-bold">{completedGoals.length}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center py-4">
            <div className="text-lg font-bold">
              {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">Success</div>
          </div>
          <div className="text-center py-4">
            <div className="text-lg font-bold">
              {Math.max(...goals.map(g => g.progress || 0), 0)}%
            </div>
            <div className="text-xs text-muted-foreground">Best</div>
          </div>
        </div>

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

  const GoalCard = ({ goal }: { goal: any }) => {
    const isSeasonalGoal = goal.is_seasonal || goal.duration_type === 'seasonal'
    const isGroupGoal = goal.goal_nature === 'group'
    const isCompleted = goal.completed_at || goal.status === 'completed'
    const isPaused = goal.status === 'paused'
    const progress = isCompleted ? 100 : (goal.progress || 0)
    
    const getStatusIcon = () => {
      if (isCompleted) return <CheckCircle2 className="h-4 w-4 text-green-600" />
      if (isPaused) return <Clock className="h-4 w-4 text-yellow-600" />
      if (goal.status === 'pending') return <Clock className="h-4 w-4 text-blue-600" />
      return <Target className="h-4 w-4 text-blue-600" />
    }
    
    const getGoalTypeIcon = () => {
      if (isSeasonalGoal) return <Star className="h-4 w-4 text-amber-600" />
      if (isGroupGoal) return <Users className="h-4 w-4 text-purple-600" />
      return <Target className="h-4 w-4 text-blue-600" />
    }
    
    const getGoalCardStyle = () => {
      if (isSeasonalGoal) return "border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-background"
      if (isGroupGoal) return "border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-background"
      return ""
    }

    return (
      <Link href={`/goals/${goal.id}`}>
        <div className={`aspect-[4/3] p-4 rounded-lg border hover:bg-accent/50 transition-colors group cursor-pointer bg-card ${getGoalCardStyle()}`}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-muted">
                  {getStatusIcon()}
                </div>
                <div className="p-1.5 rounded bg-muted">
                  {getGoalTypeIcon()}
                </div>
              </div>
              {goal.streak && goal.streak.current_streak > 0 && (
                <Badge className="bg-orange-500 text-white text-xs px-2">
                  🔥{goal.streak.current_streak}
                </Badge>
              )}
            </div>
            <h4 className="font-medium text-sm line-clamp-2 flex-1 leading-tight mb-3">{goal.title}</h4>
            <div className="mt-auto space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    progress <= 30 ? 'bg-red-500' : progress <= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Tabs defaultValue="active" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="active">Active ({activeGoals.length})</TabsTrigger>
        <TabsTrigger value="completed">Completed ({completedGoals.length})</TabsTrigger>
        <TabsTrigger value="paused">Paused ({pausedGoals.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="active">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {activeGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
        </div>
      </TabsContent>
      
      <TabsContent value="completed">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {completedGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
        </div>
      </TabsContent>
      
      <TabsContent value="paused">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {pausedGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
        </div>
      </TabsContent>
    </Tabs>
  )
}