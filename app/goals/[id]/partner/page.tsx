"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Target, ArrowLeft, CheckCircle2, Users, Edit } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { getSupabaseClient, type Goal, type Activity, type Streak } from "@/lib/supabase"
import { isMockAuthEnabled } from "@/lib/mock-auth"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"
import { EncouragementCard } from "@/components/goals/encouragement-card"

export default function PartnerGoalDetailPage() {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [streak, setStreak] = useState<Streak | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteStatus, setInviteStatus] = useState<'pending' | 'accepted' | 'declined'>('accepted')
  const router = useRouter()
  const params = useParams()
  const supabase = getSupabaseClient()
  const goalId = params.id as string

  useEffect(() => {
    loadGoalData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalId])

  const loadGoalData = async () => {
    if (isMockAuthEnabled()) {
      const mockGoal: Goal = {
        id: goalId,
        user_id: 'owner-id',
        title: 'Partner: Morning Workout Routine',
        description: 'Daily exercise to build strength and endurance',
        goal_type: 'multi' as const,
        visibility: 'public' as const,
        start_date: new Date().toISOString(),
        is_suspended: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const mockActivities: Activity[] = [
        { id: '1', goal_id: goalId, title: '10 push-ups', description: undefined, is_completed: false, order_index: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '2', goal_id: goalId, title: '20 sit-ups', description: undefined, is_completed: true, completed_at: new Date().toISOString(), order_index: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ]
      const mockStreak: Streak = {
        id: '1', goal_id: goalId, user_id: 'owner-id', current_streak: 10, longest_streak: 15, total_completions: 38, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }
      setGoal(mockGoal)
      setActivities(mockActivities)
      setStreak(mockStreak)
      setLoading(false)
      return
    }

    if (!supabase) return
    try {
      const { data: goalData, error: goalError } = await supabase
        .from("goals")
        .select("*")
        .eq("id", goalId)
        .single()
      if (goalError) throw goalError
      setGoal(goalData)

      if (goalData.goal_type === "multi" || goalData.goal_type === "multi-activity") {
        const { data: activitiesData } = await supabase
          .from("activities")
          .select("*")
          .eq("goal_id", goalId)
          .order("order_index")
        setActivities(activitiesData || [])
      }

      const { data: streakData } = await supabase
        .from("streaks")
        .select("*")
        .eq("goal_id", goalId)
        .single()
      setStreak(streakData)
    } catch (error: unknown) {
      toast.error("Failed to load goal")
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


  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Partner Goal Details</h1>
            <p className="text-muted-foreground">You are an accountability partner for this goal.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/goals">
              <Button variant="outline" className="hover-lift">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Goals
              </Button>
            </Link>
          </div>
        </div>

        {inviteStatus === 'pending' && (
          <Card className="hover-lift border-yellow-200 bg-yellow-50/50">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">You’ve been invited to be an accountability partner.</p>
                <p className="text-xs text-muted-foreground">Accept to view details and send encouragement.</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { setInviteStatus('accepted'); try { const { setInviteStatus: setInvite, addNotification } = require("@/lib/mock-store"); setInvite('partner', goal.id, 'accepted'); addNotification({ title: 'Partner Request Accepted', message: `You accepted a partner request for ${goal.title}.`, type: 'partner_update', related_goal_id: goal.id }); } catch {} toast.success('Invitation accepted') }}>Accept</Button>
                <Button size="sm" variant="outline" onClick={() => { setInviteStatus('declined'); try { const { setInviteStatus: setInvite, addNotification } = require("@/lib/mock-store"); setInvite('partner', goal.id, 'declined'); addNotification({ title: 'Partner Request Declined', message: `You declined a partner request for ${goal.title}.`, type: 'partner_update', related_goal_id: goal.id }); } catch {} toast.success('Invitation declined') }}>Decline</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-2xl">{goal.title}</CardTitle>
            {goal.description && (
              <CardDescription>{goal.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {totalActivities > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Activities</span>
                </div>
                <div className="space-y-2">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-2 rounded-md border bg-card">
                      <Checkbox checked={activity.is_completed} disabled />
                      <div className="flex-1 text-sm">
                        {activity.title}
                      </div>
                      {activity.is_completed && (
                        <Badge className="bg-green-600">Done</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <EncouragementCard isPartner goalOwnerName="Goal Owner" />
      </div>
    </MainLayout>
  )
}
