"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Users, Crown, Edit, Trash2, Target, Calendar, CheckCircle2, Clock, AlertCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import { GroupGoalDetails } from '@/components/goals/group-goal-details'
import { authHelpers, supabase } from '@/lib/supabase-client'
import { toast } from 'sonner'

export default function GroupGoalViewPage() {
  const params = useParams()
  const router = useRouter()
  const goalId = params.goalId as string
  
  const [goal, setGoal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUserId, setCurrentUserId] = useState('')
  const [goalData, setGoalData] = useState<any>({})

  useEffect(() => {
    loadGoal()
  }, [goalId])

  const loadGoal = async () => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      setCurrentUserId(user.id)

      const { data: goalData, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .single()

      if (error || !goalData) {
        toast.error('Goal not found')
        router.push('/goals')
        return
      }

      setGoal(goalData)

      // Load members
      const { data: members, error: membersError } = await supabase
        .from('group_goal_members')
        .select(`
          *,
          profile:profiles(first_name, last_name, username, profile_picture_url)
        `)
        .eq('goal_id', goalId)
        .order('created_at', { ascending: true })
      
      if (!membersError) {
        setGoalData({ members: members || [] })
      }

      // Check if user is admin
      const isOwner = goalData.user_id === user.id
      let adminStatus = isOwner

      if (goalData.is_group_goal && !isOwner) {
        const { data: membership } = await supabase
          .from('group_goal_members')
          .select('role')
          .eq('goal_id', goalId)
          .eq('user_id', user.id)
          .single()

        adminStatus = membership?.role === 'admin' || membership?.role === 'creator'
      }

      setIsAdmin(adminStatus)
    } catch (error) {
      console.error('Error loading goal:', error)
      toast.error('Failed to load goal')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this group goal? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/group-goals/${goalId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete goal')
      }

      toast.success('Group goal deleted successfully')
      router.push('/goals')
    } catch (error: any) {
      console.error('Error deleting goal:', error)
      toast.error(error.message || 'Failed to delete goal')
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

  if (!goal) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Goal not found</h1>
          <Link href="/goals">
            <Button>Back to Goals</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const isSeasonalGoal = goal.is_seasonal || goal.duration_type === 'seasonal'

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-200 dark:border-purple-800 shadow-xl p-6 sm:p-8">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-3xl sm:text-4xl">👥</span>
                  <Badge className="bg-purple-600 hover:bg-purple-700 text-white border border-purple-400 text-xs sm:text-sm">
                    <Users className="h-3 w-3 mr-1" />
                    Group Goal
                  </Badge>
                  {isSeasonalGoal && (
                    <Badge className="bg-amber-600 hover:bg-amber-700 text-white border border-amber-400 text-xs sm:text-sm">
                      ⭐ Seasonal
                    </Badge>
                  )}
                  {isAdmin && (
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-400 text-xs sm:text-sm">
                      <Crown className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-900 dark:text-purple-50 mb-2">
                  {goal?.title}
                </h1>
                {goal?.description && (
                  <p className="text-sm sm:text-base text-purple-700 dark:text-purple-200 line-clamp-2">
                    {goal.description}
                  </p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                {isAdmin && (
                  <>
                    <Link href={`/goals/group/${goalId}/edit`}>
                      <Button variant="outline" size="sm" className="border-2">
                        <Edit className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    </Link>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                      <Trash2 className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" className="border-2" onClick={() => router.push('/goals')}>
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Status & Progress Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Goal Info */}
          <Card className="relative overflow-hidden border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-purple-950/20 shadow-xl">
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Goal Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-2xl font-bold text-purple-600">{goal?.progress || 0}%</span>
                </div>
                <Progress 
                  value={goal?.progress || 0} 
                  className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500" 
                />
              </div>
              
              {goal?.target_date && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Target Date</p>
                    <p className="text-sm font-semibold">{new Date(goal.target_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-semibold capitalize text-green-700 dark:text-green-300">
                    {goal?.status || 'Active'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-semibold capitalize text-indigo-700 dark:text-indigo-300">
                    {goal?.goal_type || 'Multi'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members Summary */}
          <Card className="relative overflow-hidden border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-purple-950/20 shadow-xl">
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              {goalData?.members && goalData.members.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {goalData.members.slice(0, 3).map((member: any) => {
                      const profile = member.profile
                      const memberName = profile 
                        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username || 'Member'
                        : 'Member'
                      const statusColor = member.status === 'accepted' ? 'bg-green-100' : member.status === 'declined' ? 'bg-red-100' : 'bg-yellow-100'
                      
                      return (
                        <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-card/50 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={profile?.profile_picture_url} />
                              <AvatarFallback className="text-xs">
                                {memberName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{memberName}</p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${statusColor} ${member.status === 'accepted' ? 'border-green-300' : member.status === 'declined' ? 'border-red-300' : 'border-yellow-300'}`}
                          >
                            {member.role === 'owner' && <Crown className="h-3 w-3 mr-1" />}
                            {member.status}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                  {goalData.members.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center pt-2 border-t">
                      +{goalData.members.length - 3} more members
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No members yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details Section */}
        <GroupGoalDetails 
          goalId={goalId} 
          isAdmin={isAdmin} 
          currentUserId={currentUserId} 
        />
      </div>
    </MainLayout>
  )
}