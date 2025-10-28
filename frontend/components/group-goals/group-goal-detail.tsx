"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Target,
  CheckCircle2,
  Clock,
  TrendingUp,
  UserCheck,
  UserX,
  AlertCircle,
  Crown,
  Heart,
  MessageCircle,
  Zap
} from "lucide-react"
import { ActivityAssignment } from "./activity-assignment"
import {
  getGroupGoalMembers,
  getGroupGoalProgress,
  type GroupGoalMember
} from "@/lib/group-goals"
import { supabase, authHelpers } from "@/lib/supabase-client"

interface GroupGoalDetailProps {
  goalId: string
}

export function GroupGoalDetail({ goalId }: GroupGoalDetailProps) {
  const [goal, setGoal] = useState<any>(null)
  const [members, setMembers] = useState<GroupGoalMember[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [progress, setProgress] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGoalData()
  }, [goalId])

  const loadGoalData = async () => {
    setLoading(true)
    const user = await authHelpers.getCurrentUser()
    if (!user) return

    // Load goal
    const { data: goalData } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .single()

    if (goalData) {
      setGoal(goalData)
      setIsOwner(goalData.user_id === user.id)
    }

    // Load members
    const membersResult = await getGroupGoalMembers(goalId)
    if (membersResult.success && membersResult.data) {
      setMembers(membersResult.data as any)
    }

    // Load activities
    const { data: activitiesData } = await supabase
      .from('goal_activities')
      .select('*')
      .eq('goal_id', goalId)
      .order('order_index', { ascending: true })

    if (activitiesData) {
      setActivities(activitiesData)
    }

    // Load progress
    const progressResult = await getGroupGoalProgress(goalId)
    if (progressResult.success && progressResult.data) {
      setProgress(progressResult.data)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Target className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading group goal...</p>
        </div>
      </div>
    )
  }

  if (!goal) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Goal not found</p>
        </CardContent>
      </Card>
    )
  }

  const acceptedMembers = members.filter(m => m.status === 'accepted')
  const pendingMembers = members.filter(m => m.status === 'pending')
  const declinedMembers = members.filter(m => m.status === 'declined')
  const admin = members.find(m => m.role === 'owner')

  const overallProgress = progress?.totalActivities > 0
    ? Math.round((progress.completedActivities / progress.totalActivities) * 100)
    : 0

  const encouragementMessages = [
    "You've got this! Keep pushing forward! 🚀",
    "Amazing progress! Let's keep the momentum going! 💪",
    "Together we're unstoppable! Keep it up team! ⭐",
    "Every step counts! Proud of this team! 🎯",
    "We're crushing it! Keep up the great work! 🔥"
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-pink-500 hover:bg-pink-600">
                  <Users className="h-3 w-3 mr-1" />
                  Group Goal
                </Badge>
                {isOwner && (
                  <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/20">
                    <Crown className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
                {goal.group_goal_status === 'pending' && (
                  <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Responses
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl mb-2">{goal.title}</CardTitle>
              <CardDescription className="text-base">
                {goal.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Overall Progress */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">{acceptedMembers.length}</p>
              <p className="text-xs text-muted-foreground">Active Members</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">{progress?.completedActivities || 0}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <Clock className="h-5 w-5 text-orange-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">
                {(progress?.totalActivities || 0) - (progress?.completedActivities || 0)}
              </p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <TrendingUp className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">{progress?.totalActivities || 0}</p>
              <p className="text-xs text-muted-foreground">Total Activities</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activities">
            Activities ({activities.length})
          </TabsTrigger>
          <TabsTrigger value="members">
            Members ({acceptedMembers.length})
          </TabsTrigger>
          <TabsTrigger value="progress">
            Progress
          </TabsTrigger>
          <TabsTrigger value="encouragement">
            <Heart className="h-4 w-4 mr-1" />
            Support
          </TabsTrigger>
        </TabsList>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-3">
          {activities.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No activities yet</p>
              </CardContent>
            </Card>
          ) : (
            activities.map(activity => (
              <ActivityAssignment
                key={activity.id}
                activity={activity}
                goalId={goalId}
                isOwner={isOwner}
                onUpdate={loadGoalData}
              />
            ))
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          {/* Accepted Members */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                Active Members ({acceptedMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {acceptedMembers.map(member => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.profile?.profile_picture_url} />
                    <AvatarFallback>
                      {member.profile?.first_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {member.profile?.first_name} {member.profile?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{member.profile?.username}
                    </p>
                  </div>
                  <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                    {member.role}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending Members */}
          {pendingMembers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Pending Invitations ({pendingMembers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingMembers.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.profile?.profile_picture_url} />
                      <AvatarFallback>
                        {member.profile?.first_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {member.profile?.first_name} {member.profile?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Invited {new Date(member.invited_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                      Pending
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Declined Members */}
          {declinedMembers.length > 0 && isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserX className="h-5 w-5 text-red-600" />
                  Declined ({declinedMembers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {declinedMembers.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20"
                  >
                    <Avatar className="h-10 w-10 opacity-50">
                      <AvatarImage src={member.profile?.profile_picture_url} />
                      <AvatarFallback>
                        {member.profile?.first_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {member.profile?.first_name} {member.profile?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Declined {member.responded_at ? new Date(member.responded_at).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-red-500 text-red-700">
                      Declined
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-3">
          {progress?.memberProgress?.map((memberProg: any) => (
            <Card key={memberProg.user_id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {memberProg.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{memberProg.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {memberProg.completed}/{memberProg.assigned} activities completed
                    </p>
                  </div>
                  <Badge variant={memberProg.progress === 100 ? 'default' : 'secondary'}>
                    {memberProg.progress}%
                  </Badge>
                </div>
                <Progress value={memberProg.progress} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Encouragement Tab */}
        <TabsContent value="encouragement" className="space-y-4">
          <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-300">
                <Heart className="h-5 w-5" />
                Team Encouragement
              </CardTitle>
              <CardDescription>
                Send motivation and support to your team members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Messages */}
              <div>
                <h4 className="text-sm font-medium mb-3">Quick Messages</h4>
                <div className="space-y-2">
                  {encouragementMessages.map((msg, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left bg-white dark:bg-slate-900 hover:bg-pink-50 dark:hover:bg-pink-950/30 rounded-lg p-3 border border-pink-200 dark:border-pink-800 transition-all group"
                    >
                      <div className="flex items-start gap-2">
                        <Avatar className="h-6 w-6 mt-0.5">
                          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-xs">
                            You
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {msg}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to send to all members
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Custom Message</h4>
                <div className="space-y-2">
                  <textarea
                    placeholder="Write your own encouragement message..."
                    className="w-full min-h-[100px] p-3 rounded-lg border border-pink-200 dark:border-pink-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send to All Members
                    </Button>
                    <Button variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-50">
                      <Zap className="h-4 w-4 mr-2" />
                      Quick Nudge
                    </Button>
                  </div>
                </div>
              </div>

              {/* Member List for Individual Messages */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Send to Individual Member</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {acceptedMembers.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-950/20 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.profile?.profile_picture_url} />
                        <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-xs">
                          {member.profile?.first_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {member.profile?.first_name} {member.profile?.last_name}
                        </p>
                        {member.role === 'owner' && (
                          <Badge variant="outline" className="text-xs border-amber-500 text-amber-700">
                            <Crown className="h-2 w-2 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <Button size="sm" variant="ghost" className="text-pink-600 hover:text-pink-700 hover:bg-pink-50">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
