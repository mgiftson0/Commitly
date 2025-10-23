"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  UserPlus, 
  UserCheck, 
  MessageCircle, 
  Target, 
  Calendar,
  MapPin,
  Users,
  Trophy,
  Flame
} from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { supabase, authHelpers } from "@/lib/supabase-client"
import { toast } from "sonner"

interface UserProfile {
  id: string
  username: string
  first_name: string
  last_name: string
  profile_picture_url: string
  bio: string
  location: string
  date_of_birth: string
  created_at: string
}

interface Goal {
  id: string
  title: string
  description: string
  category: string
  status: string
  progress: number
  created_at: string
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isPartner, setIsPartner] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [requestLoading, setRequestLoading] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get current user
        const user = await authHelpers.getCurrentUser()
        if (!user) {
          router.push('/auth/login')
          return
        }
        setCurrentUser(user)

        // Get profile by username
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .maybeSingle()

        if (profileError || !profileData) {
          toast.error('User not found')
          router.push('/partners')
          return
        }

        setProfile(profileData)

        // Check if already partners
        const { data: partnerCheck } = await supabase
          .from('accountability_partners')
          .select('*')
          .or(`and(user_id.eq.${user.id},partner_id.eq.${profileData.id}),and(user_id.eq.${profileData.id},partner_id.eq.${user.id})`)
          .maybeSingle()

        if (partnerCheck) {
          setIsPartner(partnerCheck.status === 'accepted')
          setRequestSent(partnerCheck.status === 'pending')
        }

        // Get user's public goals
        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', profileData.id)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(6)

        setGoals(goalsData || [])
      } catch (error) {
        console.error('Error loading profile:', error)
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      loadProfile()
    }
  }, [username, router])

  const sendPartnerRequest = async () => {
    if (!currentUser || !profile) return

    setRequestLoading(true)
    try {
      const { error } = await supabase
        .from('accountability_partners')
        .insert({
          user_id: currentUser.id,
          partner_id: profile.id,
          status: 'pending'
        })

      if (error) throw error

      // Create notification for the user
      await supabase
        .from('notifications')
        .insert({
          user_id: profile.id,
          title: 'New Partner Request',
          message: `${currentUser.email} wants to be your accountability partner`,
          type: 'partner_request',
          read: false,
          data: { requester_id: currentUser.id }
        })

      setRequestSent(true)
      toast.success('Partner request sent!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send request')
    } finally {
      setRequestLoading(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Target className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <Button onClick={() => router.push('/partners')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Partners
          </Button>
        </div>
      </MainLayout>
    )
  }

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username
  const isOwnProfile = currentUser?.id === profile.id

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile.profile_picture_url} />
                  <AvatarFallback className="text-2xl">
                    {fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                {!isOwnProfile && (
                  <div className="flex gap-2">
                    {isPartner ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        Partner
                      </Badge>
                    ) : requestSent ? (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Request Sent
                      </Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={sendPartnerRequest}
                        disabled={requestLoading}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {requestLoading ? 'Sending...' : 'Add Partner'}
                      </Button>
                    )}
                    
                    {isPartner && (
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold">{fullName}</h1>
                    <p className="text-muted-foreground">@{profile.username}</p>
                  </div>

                  {profile.bio && (
                    <p className="text-sm">{profile.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{goals.length}</div>
                      <div className="text-xs text-muted-foreground">Public Goals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {goals.filter(g => g.status === 'completed').length}
                      </div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {goals.filter(g => g.status === 'active').length}
                      </div>
                      <div className="text-xs text-muted-foreground">Active</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="goals" className="space-y-4">
          <TabsList>
            <TabsTrigger value="goals">Public Goals</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-4">
            {goals.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No public goals</h3>
                  <p className="text-muted-foreground">
                    {isOwnProfile ? "You haven't created any public goals yet." : `${fullName} hasn't shared any public goals yet.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {goals.map((goal) => (
                  <Card key={goal.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                          {goal.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {goal.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="capitalize">{goal.category?.replace('_', ' ')}</span>
                        <span>{goal.progress}% complete</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Achievements</h3>
                <p className="text-muted-foreground">
                  Achievement system coming soon!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}