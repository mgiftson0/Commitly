"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Target,
  ArrowLeft,
  CheckCircle2,
  Flame,
  Clock,
  Edit,
  Trash2,
  Pause,
  Play,
  Copy,
  Users,
  MessageCircle,
  Calendar,
  TrendingUp,
  Award,
  UserPlus,
  Settings,
  MoreHorizontal,
  Heart,
  Star,
  GitFork,
  Crown
} from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { getSupabaseClient, type Goal, type Activity, type Streak } from "@/backend/lib/supabase"
import { isMockAuthEnabled } from "@/backend/lib/mock-auth"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"
import { EncouragementCard } from "@/components/goals/encouragement-card"

export default function GoalDetailPage() {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [streak, setStreak] = useState<Streak | null>(null)
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [storeMeta, setStoreMeta] = useState<{ dueDate?: string | null; recurrencePattern?: string; recurrenceDays?: string[] } | null>(null)
  const [activityAssignments, setActivityAssignments] = useState<{[key: string]: string[]}>({
    '1': ['1', '2'],
    '2': ['all'],
    '3': ['3']
  })
  const [storeRole, setStoreRole] = useState<{ isGroupGoal?: boolean; groupMembers?: { id: string; name: string; avatar?: string }[]; accountabilityPartners?: { id: string; name: string; avatar?: string }[] } | null>(null)
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
      try {
        const store = require("@/backend/lib/mock-store")
        const sg = store.getGoals()
        const g = sg.find((x: any) => String(x.id) === String(goalId))
        if (g && g.type !== null && g.type !== undefined) {
          const mapped: Goal = {
            id: String(g.id),
            user_id: g.goalOwner?.id || 'mock-user-id',
            title: g.title,
            description: g.description,
            goal_type: (g.type as any) || 'single',
            visibility: g.visibility as any,
            start_date: g.createdAt,
            is_suspended: g.status === 'paused',
            created_at: g.createdAt,
            updated_at: g.createdAt,
            completed_at: g.completed_at || null,
          }
          setGoal(mapped)
          setStoreMeta({ dueDate: g.dueDate || null, recurrencePattern: g.recurrencePattern, recurrenceDays: g.recurrenceDays })
          const acts: Activity[] = (g.activities || []).map((a: any) => ({
            id: String(a.orderIndex),
            goal_id: String(g.id),
            title: a.title,
            description: undefined,
            is_completed: false,
            order_index: a.orderIndex,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
          setActivities(acts)
          setStoreRole({
            isGroupGoal: !!g.isGroupGoal,
            groupMembers: (g.groupMembers || []).map((m: any) => ({ id: m.id, name: m.name, avatar: '/placeholder-avatar.jpg' })),
            accountabilityPartners: (g.accountabilityPartners || []).map((p: any) => ({ id: p.id, name: p.name, avatar: '/placeholder-avatar.jpg' }))
          })
          setLoading(false)
          return
        } else {
          // Goal not found or invalid
          console.warn("Goal not found or invalid:", goalId)
          setGoal(null)
          setLoading(false)
          return
        }
      } catch (error) {
        console.error("Error loading goal data:", error)
        setGoal(null)
        setLoading(false)
        return
      }
    }
    
    if (!supabase) return
    try {
      const { data: { user } } = await Promise.resolve(supabase.auth.getUser())
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Load goal
      const { data: goalData, error: goalError } = await supabase
        .from("goals")
        .select("*")
        .eq("id", goalId)
        .single()

      if (goalError) throw goalError
      setGoal(goalData)

      // Load activities if multi-activity goal
      if (goalData.goal_type === "multi" || goalData.goal_type === "multi-activity") {
        const { data: activitiesData, error: activitiesError } = await supabase
          .from("activities")
          .select("*")
          .eq("goal_id", goalId)
          .order("order_index")

        if (activitiesError) throw activitiesError
        setActivities(activitiesData || [])
      }

      // Load streak
      const { data: streakData, error: streakError } = await supabase
        .from("streaks")
        .select("*")
        .eq("goal_id", goalId)
        .eq("user_id", user.id)
        .single()

      if (streakError && streakError.code !== "PGRST116") throw streakError
      setStreak(streakData)
    } catch (error: unknown) {
      toast.error("Failed to load goal")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const toggleActivity = async (activityId: string, isCompleted: boolean) => {
    if (isMockAuthEnabled()) {
      setActivities(activities.map(a => 
        a.id === activityId 
          ? { ...a, is_completed: !isCompleted, completed_at: !isCompleted ? new Date().toISOString() : undefined }
          : a
      ))
      toast.success(isCompleted ? "Activity unchecked" : "Activity completed!")
      return
    }
    if (!supabase) return
    try {
      const { error } = await supabase
        .from("activities")
        .update({
          is_completed: !isCompleted,
          completed_at: !isCompleted ? new Date().toISOString() : null,
        })
        .eq("id", activityId)

      if (error) throw error

      // Reload activities
      await loadGoalData()
      toast.success(isCompleted ? "Activity unchecked" : "Activity completed!")
    } catch (_error: unknown) {
      toast.error("Failed to update activity")
    }
  }

  const completeGoal = async () => {
    if (isMockAuthEnabled()) {
      if (goal) {
        setGoal({ ...goal, completed_at: new Date().toISOString() })
        try { const { addNotification } = require("@/backend/lib/mock-store"); addNotification({ title: 'Goal Completed', message: `You completed: ${goal.title}.`, type: 'goal_completed', related_goal_id: goal.id }); } catch {}
        toast.success("🎉 Goal completed! Great job!")
      }
      return
    }
    if (!supabase) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Mark goal as completed
      const { error: goalError } = await supabase
        .from("goals")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", goalId)

      if (goalError) throw goalError

      // Create completion record
      await supabase.from("goal_completions").insert({
        goal_id: goalId,
        user_id: user.id,
        completion_date: new Date().toISOString().split('T')[0],
      })

      toast.success("🎉 Goal completed! Great job!")
      await loadGoalData()
    } catch (_error: unknown) {
      toast.error("Failed to complete goal")
    }
  }

  const toggleSuspend = async () => {
    if (isMockAuthEnabled()) {
      if (goal) {
        setGoal({ ...goal, is_suspended: !goal.is_suspended })
        toast.success(goal.is_suspended ? "Goal resumed" : "Goal suspended")
      }
      return
    }
    if (!supabase) return
    try {
      const { error } = await supabase
        .from("goals")
        .update({ is_suspended: !goal?.is_suspended })
        .eq("id", goalId)

      if (error) throw error

      toast.success(goal?.is_suspended ? "Goal resumed" : "Goal suspended")
      await loadGoalData()
    } catch (_error: unknown) {
      toast.error("Failed to update goal")
    }
  }

  const deleteGoal = async () => {
    if (isMockAuthEnabled()) {
      if (confirm("Are you sure you want to delete this goal?")) {
        toast.success("Goal deleted")
        router.push("/dashboard")
      }
      return
    }
    if (!supabase) return
    if (!confirm("Are you sure you want to delete this goal?")) return

    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", goalId)

      if (error) throw error

      toast.success("Goal deleted")
      router.push("/dashboard")
    } catch (_error: unknown) {
      toast.error("Failed to delete goal")
    }
  }

  const addNote = async () => {
    if (isMockAuthEnabled()) {
      if (note.trim()) {
        toast.success("Note added")
        setNote("")
      }
      return
    }
    if (!supabase) return
    if (!note.trim()) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("notes").insert({
        goal_id: goalId,
        author_id: user.id,
        content: note,
        note_type: "personal",
      })

      if (error) throw error

      toast.success("Note added")
      setNote("")
    } catch (_error: unknown) {
      toast.error("Failed to add note")
    }
  }

  const forkGoal = async () => {
    if (isMockAuthEnabled()) {
      toast.success("Goal forked successfully! (Mock Mode)")
      router.push("/goals/create")
      return
    }
    if (!supabase || !goal) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Check if user is a partner of the goal creator
      // For now, allow forking of public goals
      if (goal.visibility === "public") {
        // Create a new goal based on the current one
        const { data: forkedGoal, error: forkError } = await supabase
          .from("goals")
          .insert({
            user_id: user.id,
            title: `${goal.title} (Forked)`,
            description: goal.description,
            goal_type: goal.goal_type,
            visibility: "private", // Default to private for forked goals
          })
          .select()
          .single()

        if (forkError) throw forkError

        toast.success("Goal forked! You can now customize it.")
        router.push(`/goals/${forkedGoal.id}/edit`)
      } else {
        toast.error("You can only fork public goals")
      }
    } catch (_error: unknown) {
      toast.error("Failed to fork goal")
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
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const completedActivities = activities.filter(a => a.is_completed).length
  const totalActivities = activities.length
  const progress = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0

  // Partner and group info from store (mock mode)
  const apList = storeRole?.accountabilityPartners || []
  const groupMembersList = storeRole?.groupMembers || []

  // Determine goal type and ownership
  const currentUserId = 'mock-user-id' // In real app, get from auth
  const isYourGoal = goal?.user_id === currentUserId
  const isGroupGoal = !!(storeRole?.isGroupGoal)
  const isForkedGoal = goal?.title?.includes("(Forked)") || false
  const isMultiActivity = goal && (goal.goal_type === "multi")

  // Check if current user is an accountability partner for this goal (not the owner, not a group member)
  const isAccountabilityPartner = apList.some(p => p.id === currentUserId) && !isYourGoal && !isGroupGoal

  // Check if user is a group member (can edit)
  const isGroupMember = isGroupGoal && groupMembersList.some(m => m.id === currentUserId)

  // Check if this goal can be forked (not yours, public, and from a partner)
  const canForkGoalProp = !isYourGoal && goal?.visibility === "public" && !isAccountabilityPartner && !isGroupMember

  // Mock current user for demo purposes
  const currentUser = { id: currentUserId, name: 'You' }
  
  // Check if goal is completed
  const isGoalCompleted = goal?.completed_at !== undefined && goal?.completed_at !== null

  // 5-hour edit window from goal creation
  const createdAtTs = goal?.created_at ? new Date(goal.created_at).getTime() : Date.now()
  const canEditWithin5h = (Date.now() - createdAtTs) <= (5 * 60 * 60 * 1000)
  
  // Get goal owner name for encouragement
  const goalOwnerName = isYourGoal ? "yourself" : (goal?.user_id ? "the goal owner" : "Goal Owner")

  // Group members for assignment rendering (mock store)
  const groupMembersForAssign = groupMembersList

  // Helper function to get assigned members for an activity
  const getAssignedMembers = (activityId: string) => {
    const assignedIds = activityAssignments[activityId] || []
    if (assignedIds.includes('all')) {
      return groupMembersForAssign
    }
    return groupMembersForAssign.filter(member => assignedIds.includes(member.id))
  }

  // Helper function to check if current user is assigned to activity
  const isUserAssignedToActivity = (activityId: string) => {
    const assignedMembers = getAssignedMembers(activityId)
    return assignedMembers.some(member => member.id === currentUser.id)
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/goals">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex gap-2">
            {!isAccountabilityPartner && (
              <>
                <Link href={`/goals/${goal.id}/edit`}>
                  <Button variant="outline" size="sm" disabled={!canEditWithin5h}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={toggleSuspend}>
                  {goal.is_suspended ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                  {goal.is_suspended ? "Resume" : "Pause"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Two Column Layout: Update Interface + Details */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left: Update/Track Interface */}
          <div className="lg:col-span-2 space-y-4">
            {/* Goal Title Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    {goal.goal_type.replace('-', ' ')}
                  </Badge>
                  {isGroupGoal && (
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                      <Users className="h-3 w-3 mr-1" /> Group
                    </Badge>
                  )}
                  {goal.is_suspended && <Badge variant="destructive" className="text-xs">Paused</Badge>}
                  {goal.completed_at && <Badge className="bg-green-600 text-xs">Completed</Badge>}
                </div>
                <CardTitle className="text-2xl">{goal.title}</CardTitle>
                {goal.description && (
                  <CardDescription className="text-sm mt-2">{goal.description}</CardDescription>
                )}
              </CardHeader>
            </Card>

            {/* Dynamic Update Interface Based on Goal Type */}
            {isMultiActivity ? (
              /* Multi-Activity Goal: Show Activity Checklist */
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Track Activities
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {completedActivities} / {totalActivities}
                    </div>
                  </div>
                  <Progress value={progress} className="h-2 mt-2" />
                </CardHeader>
                <CardContent className="space-y-2">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <Checkbox
                        checked={activity.is_completed}
                        onCheckedChange={() => toggleActivity(activity.id, activity.is_completed)}
                        disabled={isAccountabilityPartner}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${activity.is_completed ? "line-through text-muted-foreground" : ""}`}>
                          {activity.title}
                        </p>
                        {activity.description && (
                          <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                        )}
                      </div>
                      {activity.is_completed && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : goal.goal_type === "recurring" ? (
              /* Recurring Goal: Show Daily Tracker */
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    Daily Progress
                  </CardTitle>
                  <CardDescription>Track your consistency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* This Week Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                      <div key={day} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">{day}</div>
                        <div className={`h-12 rounded-lg border-2 flex items-center justify-center ${
                          index < 5 ? "bg-green-50 border-green-500" : 
                          index === 5 ? "bg-orange-50 border-orange-500" :
                          "border-muted"
                        }`}>
                          {index < 5 && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                          {index === 5 && <Clock className="h-5 w-5 text-orange-600" />}
                        </div>
                      </div>
                    ))}
                  </div>
                  {!goal.completed_at && !isAccountabilityPartner && (
                    <Button onClick={completeGoal} className="w-full" size="lg">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Complete Today
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              /* Single Activity Goal: Show Simple Complete Button */
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Complete Your Goal</CardTitle>
                  <CardDescription>
                    {storeMeta?.dueDate ? `Due: ${new Date(storeMeta.dueDate).toLocaleDateString()}` : "Track your progress"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goal.completed_at ? (
                    <div className="text-center py-8 space-y-3">
                      <div className="text-5xl">🎉</div>
                      <div>
                        <p className="font-semibold text-green-700">Goal Completed!</p>
                        <p className="text-sm text-muted-foreground">Completed on {new Date(goal.completed_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center py-6">
                        <div className="text-4xl mb-3">🎯</div>
                        <p className="text-sm text-muted-foreground">Ready to mark this goal as complete?</p>
                      </div>
                      {!isAccountabilityPartner && (
                        <Button onClick={completeGoal} className="w-full" size="lg">
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          Mark as Complete
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Encouragement Section */}
            {!isAccountabilityPartner && (
              <EncouragementCard 
                isPartner={false}
                goalOwnerName={goalOwnerName}
                newMessageCount={2}
              />
            )}
          </div>

          {/* Right: Goal Details Sidebar */}
          <div className="space-y-4">
            {/* Goal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Goal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="capitalize">{goal.goal_type.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Visibility</span>
                  <span className="capitalize">{goal.visibility}</span>
                </div>
                {storeMeta?.dueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Due Date</span>
                    <span>{new Date(storeMeta.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                {storeMeta?.recurrencePattern && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Recurrence</span>
                    <span className="capitalize">{storeMeta.recurrencePattern}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(goal.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Partners/Members */}
            {(apList.length > 0 || groupMembersList.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {isGroupGoal ? "Group Members" : "Accountability Partners"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(isGroupGoal ? groupMembersList : apList).slice(0, 5).map((person) => (
                      <div key={person.id} className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={person.avatar} />
                          <AvatarFallback className="text-xs">{person.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{person.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!isAccountabilityPartner && (
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={deleteGoal}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Goal
                  </Button>
                )}
                {canForkGoalProp && (
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={forkGoal}>
                    <GitFork className="h-4 w-4 mr-2" />
                    Fork Goal
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Motivation */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-4 text-center space-y-2">
                <div className="text-3xl">💪</div>
                <p className="text-sm font-medium">Keep Going!</p>
                <p className="text-xs text-muted-foreground">You&apos;re making progress</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
