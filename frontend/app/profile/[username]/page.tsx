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
  MoreHorizontal
} from "lucide-react"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { authHelpers, supabase } from "@/lib/supabase-client"
import { toast } from "sonner"
import { getProgressColor } from "@/lib/utils/progress-colors"
import { SocialLinks } from "@/components/profile/social-links"

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  
  const [profile, setProfile] = useState<any>(null)
  const [goals, setGoals] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [followState, setFollowState] = useState<'none' | 'pending' | 'following' | 'followers'>('none')
  const [loading, setLoading] = useState(true)

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
          .eq('is_public', true)
          .order('created_at', { ascending: false })

        setGoals(goalsData || [])

        // Check follow relationship if user is logged in
        if (user && user.id !== profileData.id) {
          const { data: followData } = await supabase
            .from('accountability_partners')
            .select('status, user_id, partner_id')
            .or(`and(user_id.eq.${user.id},partner_id.eq.${profileData.id}),and(user_id.eq.${profileData.id},partner_id.eq.${user.id})`)
            .maybeSingle()

          if (followData) {
            if (followData.user_id === user.id) {
              setFollowState(followData.status === 'accepted' ? 'following' : 'pending')
            } else {
              setFollowState(followData.status === 'accepted' ? 'following' : 'followers')
            }
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
        // Check if both users exist in profiles table
        const { data: currentUserExists } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', currentUser.id)
          .single()

        if (!currentUserExists) {
          toast.error('Your profile not found')
          return
        }

        const { error } = await supabase
          .from('accountability_partners')
          .insert({
            user_id: currentUser.id,
            partner_id: profile.id,
            status: 'pending'
          })

        if (error) {
          if (error.code === '23505') {
            toast.error('Request already sent')
          } else {
            throw error
          }
          return
        }

        await supabase
          .from('notifications')
          .insert({
            user_id: profile.id,
            title: 'New Follow Request',
            message: `${currentUser.first_name || 'Someone'} wants to follow you!`,
            type: 'partner_request',
            read: false,
            data: { sender_id: currentUser.id }
          })

        setFollowState('pending')
        toast.success('Follow request sent!')
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
                      <Button size="sm" variant="outline">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Following
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
                <span><strong>0</strong> <span className="text-muted-foreground">Following</span></span>
                <span><strong>0</strong> <span className="text-muted-foreground">Followers</span></span>
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health-fitness': return Heart
      case 'learning': return BookOpen
      case 'career': return Briefcase
      case 'personal': return Star
      default: return Target
    }
  }

  return (
    <div className="space-y-0">
      {goals.map((goal) => {
        const Icon = getCategoryIcon(goal.category)
        const isSeasonalGoal = goal.is_seasonal || goal.duration_type === 'seasonal'
        const isCompleted = goal.completed_at || goal.status === 'completed'
        
        return (
          <div key={goal.id} className="border-b hover:bg-muted/50 transition-colors p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg mt-1 ${
                isSeasonalGoal 
                  ? 'bg-amber-100 dark:bg-amber-900/30' 
                  : isCompleted
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-primary/10'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Icon className={`h-4 w-4 ${
                    isSeasonalGoal 
                      ? 'text-amber-600 dark:text-amber-400' 
                      : 'text-primary'
                  }`} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold line-clamp-2">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {goal.description}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {isCompleted ? '100%' : `${goal.progress || 0}%`}
                    </div>
                    <Progress 
                      value={isCompleted ? 100 : (goal.progress || 0)} 
                      className={`w-16 h-1.5 mt-1 ${getProgressColor(isCompleted ? 100 : (goal.progress || 0))}`} 
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {goal.category}
                  </Badge>
                  
                  {isSeasonalGoal && (
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                      <Star className="h-3 w-3 mr-1" />
                      Seasonal
                    </Badge>
                  )}
                  
                  {isCompleted && (
                    <Badge className="text-xs bg-green-600">
                      Completed
                    </Badge>
                  )}
                  
                  <span className="text-xs text-muted-foreground">
                    {new Date(goal.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}