"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Target, ArrowLeft, CheckCircle2, Flame, Clock, Edit, Trash2, Pause, Play } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { getSupabaseClient, type Goal, type Activity, type Streak } from "@/lib/supabase"
import { isMockAuthEnabled, mockDelay } from "@/lib/mock-auth"
import { toast } from "sonner"

export default function GoalDetailPage() {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [streak, setStreak] = useState<Streak | null>(null)
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)
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
      // Mock goal data for frontend display
      const mockGoal: Goal = {
        id: goalId,
        user_id: 'mock-user-id',
        title: 'Morning Workout Routine',
        description: 'Daily exercise to build strength and endurance',
        goal_type: 'multi' as const,
        visibility: 'public' as const,
        start_date: new Date().toISOString(),
        is_suspended: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      const mockActivities: Activity[] = [
        { id: '1', goal_id: goalId, title: '10 push-ups', description: null, is_completed: false, order_index: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '2', goal_id: goalId, title: '20 sit-ups', description: null, is_completed: true, completed_at: new Date().toISOString(), order_index: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '3', goal_id: goalId, title: '5 minute plank', description: null, is_completed: false, order_index: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ]
      
      const mockStreak: Streak = {
        id: '1',
        goal_id: goalId,
        user_id: 'mock-user-id',
        current_streak: 12,
        longest_streak: 15,
        total_completions: 45,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      setGoal(mockGoal)
      setActivities(mockActivities)
      setStreak(mockStreak)
      setLoading(false)
      return
    }
    
    if (!supabase) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
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
      if (goalData.goal_type === "multi") {
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Target className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">Goal Details</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Goal Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2">
                <Badge>{goal.goal_type}</Badge>
                <Badge variant="outline">{goal.visibility}</Badge>
                {goal.is_suspended && <Badge variant="destructive">Suspended</Badge>}
                {goal.completed_at && <Badge variant="default" className="bg-green-600">Completed</Badge>}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleSuspend}>
                  {goal.is_suspended ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={deleteGoal}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardTitle className="text-3xl">{goal.title}</CardTitle>
            {goal.description && (
              <CardDescription className="text-base mt-2">{goal.description}</CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Current Streak</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Flame className="h-6 w-6 text-orange-600" />
                {streak?.current_streak || 0} days
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Longest Streak</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                {streak?.longest_streak || 0} days
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Completions</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Clock className="h-6 w-6 text-blue-600" />
                {streak?.total_completions || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Activities Checklist */}
        {goal.goal_type === "multi" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Activities</CardTitle>
              <CardDescription>
                {completedActivities} of {totalActivities} completed
              </CardDescription>
              <Progress value={progress} className="mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Checkbox
                    checked={activity.is_completed}
                    onCheckedChange={() => toggleActivity(activity.id, activity.is_completed)}
                  />
                  <span className={activity.is_completed ? "line-through text-slate-500" : ""}>
                    {activity.title}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Complete Goal Button */}
        {!goal.completed_at && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <Button onClick={completeGoal} className="w-full" size="lg">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Mark Goal as Complete
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Notes Section */}
        <Card>
          <CardHeader>
            <CardTitle>Notes & Encouragement</CardTitle>
            <CardDescription>Add personal notes or receive encouragement from partners</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Add a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
              <Button onClick={addNote} disabled={!note.trim()}>
                Add Note
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
