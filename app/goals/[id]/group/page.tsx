"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Target, ArrowLeft, Users, Crown, Edit, CheckCircle2, Pause, Play, Trash2, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { getSupabaseClient, type Goal, type Activity } from "@/lib/supabase"
import { isMockAuthEnabled } from "@/lib/mock-auth"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"

export default function GroupGoalDetailPage() {
  const [personalNote, setPersonalNote] = useState("")
  const [personalNotes, setPersonalNotes] = useState<string[]>([])
  const [inviteStatus, setInviteStatus] = useState<'pending' | 'accepted' | 'declined'>('accepted')
  const [goal, setGoal] = useState<Goal | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const supabase = getSupabaseClient()
  const goalId = params.id as string

  const currentUser = { id: 'mock-user-id', name: 'You' }
  const groupMembers = useMemo(() => ([
    { id: 'mock-user-id', name: 'You', role: 'member', avatar: '/placeholder-avatar.jpg' },
    { id: '2', name: 'Mike Chen', role: 'member', avatar: '/placeholder-avatar.jpg' },
    { id: '3', name: 'Emily Rodriguez', role: 'creator', avatar: '/placeholder-avatar.jpg' },
  ]), [])

  const [activityAssignments, setActivityAssignments] = useState<{[key: string]: string[]}>({
    '1': ['all'],
    '2': ['mock-user-id', '2'],
  })

  useEffect(() => {
    loadGoalData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalId])

  const loadGoalData = async () => {
    if (isMockAuthEnabled()) {
      const mockGoal: Goal = {
        id: goalId,
        user_id: '3',
        title: 'Group: Team Fitness Challenge',
        description: 'Group workout challenge with friends',
        goal_type: 'multi' as const,
        visibility: 'restricted' as const,
        start_date: new Date().toISOString(),
        is_suspended: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const mockActivities: Activity[] = [
        { id: '1', goal_id: goalId, title: 'Cardio (20 min)', description: undefined, is_completed: false, order_index: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '2', goal_id: goalId, title: 'Strength (10 min)', description: undefined, is_completed: true, completed_at: new Date().toISOString(), order_index: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ]
      setGoal(mockGoal)
      setActivities(mockActivities)
      setLoading(false)
      return
    }

    if (!supabase) return
    try {
      const { data: goalData } = await supabase
        .from("goals")
        .select("*")
        .eq("id", goalId)
        .single()
      setGoal(goalData)

      if (goalData?.goal_type === "multi" || goalData?.goal_type === "multi-activity") {
        const { data: activitiesData } = await supabase
          .from("activities")
          .select("*")
          .eq("goal_id", goalId)
          .order("order_index")
        setActivities(activitiesData || [])
      }
    } catch (_error: unknown) {
      toast.error("Failed to load goal")
    } finally {
      setLoading(false)
    }
  }

  const isUserAssignedToActivity = (activityId: string) => {
    const assigned = activityAssignments[activityId] || []
    if (assigned.includes('all')) return true
    return assigned.includes(currentUser.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Target className="h-12 w-12 text-blue-600 animate-pulse" />
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Goal not found</p>
          <Link href="/goals">
            <Button>Back to Goals</Button>
          </Link>
        </div>
      </div>
    )
  }

  const completedActivities = activities.filter(a => a.is_completed).length
  const totalActivities = activities.length
  const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0

  const isOwner = goal?.user_id === currentUser.id
  const createdAtTs = goal?.created_at ? new Date(goal.created_at).getTime() : Date.now()
  const canEditWithin5h = (Date.now() - createdAtTs) <= (5 * 60 * 60 * 1000)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Group Goal</h1>
            <p className="text-muted-foreground">Collaborate with your group to complete this goal.</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/goals/${goal.id}/edit`}>
              <Button variant="outline" className="hover-lift" disabled={!canEditWithin5h} title={!canEditWithin5h ? 'Editing period ended (5 hours)' : undefined}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Goal
              </Button>
            </Link>
            {isOwner && (
              <>
                <Button variant="outline" className="hover-lift" onClick={() => toast.success(goal.is_suspended ? 'Goal resumed' : 'Goal paused')}>
                  {goal.is_suspended ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                  {goal.is_suspended ? 'Resume' : 'Pause'}
                </Button>
                <Button variant="outline" className="hover-lift text-destructive" onClick={() => { if (confirm('Delete goal?')) toast.success('Goal deleted') }}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {inviteStatus === 'pending' && (
          <Card className="hover-lift border-yellow-200 bg-yellow-50/50">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">You’ve been invited to join this group goal.</p>
                <p className="text-xs text-muted-foreground">Accept to participate and add your own activities.</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { setInviteStatus('accepted'); try { const { setInviteStatus: setInvite, addNotification } = require("@/lib/mock-store"); setInvite('group', goal.id, 'accepted'); addNotification({ title: 'Group Invite Accepted', message: `You joined the group goal: ${goal.title}.`, type: 'partner_update', related_goal_id: goal.id }); } catch {} }}>Accept</Button>
                <Button size="sm" variant="outline" onClick={() => { setInviteStatus('declined'); try { const { setInviteStatus: setInvite, addNotification } = require("@/lib/mock-store"); setInvite('group', goal.id, 'declined'); addNotification({ title: 'Group Invite Declined', message: `You declined to join: ${goal.title}.`, type: 'partner_update', related_goal_id: goal.id }); } catch {} }}>Decline</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="hover-lift">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  {goal.title}
                  <Crown className="h-5 w-5 text-purple-600" />
                </CardTitle>
                {goal.description && (
                  <CardDescription>{goal.description}</CardDescription>
                )}
              </div>
              <div className="space-y-2 w-full lg:w-64">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Group Members</span>
                <Badge variant="outline">{groupMembers.length} members</Badge>
              </div>
              <div className="flex -space-x-2">
                {groupMembers.map((m) => (
                  <Avatar key={m.id} className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={m.avatar} />
                    <AvatarFallback>{m.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {goal.goal_type === 'multi' && (
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="text-lg">Activities & Assignments</CardTitle>
              <CardDescription>Only assigned members (or All) can check off an activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Your personal activities (members can add their own) */}
              <div className="space-y-2 p-3 rounded-md bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Your Activities</span>
                  <Button size="sm" variant="outline" onClick={() => {
                    const newId = Math.random().toString(36).slice(2)
                    setActivities(prev => [...prev, { id: newId, goal_id: goalId, title: 'New Activity', is_completed: false, order_index: prev.length, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as any])
                    toast.success('Activity added')
                  }}>Add</Button>
                </div>
                <p className="text-xs text-muted-foreground">You can add your own activities alongside the owner’s list.</p>
              </div>
              {activities.map((activity) => (
                <div key={activity.id} className="p-3 rounded-lg border flex items-start gap-3">
                  <Checkbox
                    checked={activity.is_completed}
                    disabled={!isUserAssignedToActivity(activity.id)}
                    onCheckedChange={() => {
                      // Frontend-only toggle for demo
                      setActivities((prev) => prev.map(a => a.id === activity.id ? { ...a, is_completed: !a.is_completed } : a))
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${activity.is_completed ? 'line-through text-muted-foreground' : ''}`}>{activity.title}</span>
                      {activity.is_completed && <Badge className="bg-green-600">Done</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">Assigned:</span>
                      {activityAssignments[activity.id]?.includes('all') ? (
                        <Badge variant="outline" className="text-xs">All Members</Badge>
                      ) : (
                        <div className="flex -space-x-1">
                          {groupMembers.filter(m => (activityAssignments[activity.id] || []).includes(m.id)).map((m) => (
                            <Avatar key={m.id} className="h-5 w-5 border border-background">
                              <AvatarImage src={m.avatar} />
                              <AvatarFallback className="text-[10px]">{m.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Personal Notes (members only, private to user) */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Personal Notes
            </CardTitle>
            <CardDescription>Only visible to you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Add a personal note about this group goal..."
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              rows={3}
              className="focus-ring"
            />
            <Button
              onClick={() => {
                if (personalNote.trim()) {
                  setPersonalNotes([personalNote.trim(), ...personalNotes])
                  setPersonalNote("")
                  toast.success('Note saved')
                }
              }}
              disabled={!personalNote.trim()}
              className="hover-lift"
            >
              Save Note
            </Button>
            {personalNotes.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                {personalNotes.map((n, idx) => (
                  <div key={idx} className="p-2 rounded-md border bg-card text-sm">
                    {n}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
