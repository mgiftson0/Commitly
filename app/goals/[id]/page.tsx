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
  Star
} from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { getSupabaseClient, type Goal, type Activity, type Streak } from "@/lib/supabase"
import { isMockAuthEnabled, mockDelay } from "@/lib/mock-auth"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"

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
        { id: '1', goal_id: goalId, title: '10 push-ups', description: undefined, is_completed: false, order_index: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '2', goal_id: goalId, title: '20 sit-ups', description: undefined, is_completed: true, completed_at: new Date().toISOString(), order_index: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '3', goal_id: goalId, title: '5 minute plank', description: undefined, is_completed: false, order_index: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
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
    if (!supabase) return

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

  // Mock data for enhanced goal details
  const accountabilityPartners = [
    { id: "1", name: "Sarah Martinez", username: "sarah_m", avatar: "/placeholder-avatar.jpg" },
    { id: "2", name: "Mike Chen", username: "mike_c", avatar: "/placeholder-avatar.jpg" }
  ]

  const groupMembers = [
    { id: "1", name: "Sarah Martinez", username: "sarah_m", avatar: "/placeholder-avatar.jpg", role: "member" },
    { id: "2", name: "Mike Chen", username: "mike_c", avatar: "/placeholder-avatar.jpg", role: "member" },
    { id: "3", name: "Emily Rodriguez", username: "emily_r", avatar: "/placeholder-avatar.jpg", role: "member" }
  ]

  const isGroupGoal = false // For now, treating all goals as individual until group functionality is fully implemented
  const isMultiActivity = goal && (goal.goal_type === "multi" || goal.goal_type === "multi-activity")

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Goal Details</h1>
            <p className="text-muted-foreground">
              Track your progress and stay motivated
            </p>
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

        {/* Goal Header Card */}
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              {/* Goal Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="outline" className="capitalize">
                    {goal.goal_type.replace('-', ' ')}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {goal.visibility}
                  </Badge>
                  {goal.is_suspended && <Badge variant="destructive">Suspended</Badge>}
                  {goal.completed_at && <Badge className="bg-green-600">Completed</Badge>}
                </div>

                <CardTitle className="text-3xl mb-3">{goal.title}</CardTitle>
                {goal.description && (
                  <CardDescription className="text-base mb-4">
                    {goal.description}
                  </CardDescription>
                )}

                {/* Partner Avatars */}
                {accountabilityPartners.length > 0 && !isGroupGoal && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Accountability Partners:</span>
                      <div className="flex -space-x-2">
                        {accountabilityPartners.slice(0, 3).map((partner, index) => (
                          <Avatar key={partner.id} className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={partner.avatar} />
                            <AvatarFallback className="text-xs">
                              {partner.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {accountabilityPartners.length > 3 && (
                          <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">+{accountabilityPartners.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Group Members */}
                {isGroupGoal && groupMembers.length > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Group Members:</span>
                      <div className="flex -space-x-2">
                        {groupMembers.slice(0, 4).map((member, index) => (
                          <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xs">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {groupMembers.length > 4 && (
                          <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">+{groupMembers.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="hover-lift">
                  <Copy className="h-4 w-4 mr-2" />
                  Fork Goal
                </Button>
                <Link href={`/goals/${goal.id}/edit`}>
                  <Button variant="outline" size="sm" className="hover-lift">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSuspend}
                  className="hover-lift"
                >
                  {goal.is_suspended ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                  {goal.is_suspended ? "Resume" : "Pause"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteGoal}
                  className="hover-lift text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Current Streak */}
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="p-4 rounded-full bg-orange-500/10 mb-3">
                  <Flame className="h-12 w-12 text-orange-600" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                <p className="text-5xl font-bold text-orange-600">{streak?.current_streak || 0}</p>
                <p className="text-sm text-muted-foreground">days</p>
              </div>
              <div className="text-center">
                <div className="p-4 rounded-full bg-green-500/10 mb-3">
                  <Award className="h-12 w-12 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Best Streak</p>
                <p className="text-5xl font-bold text-green-600">{streak?.longest_streak || 0}</p>
                <p className="text-sm text-muted-foreground">days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Activities Section */}
            {isMultiActivity && (
              <Card className="hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Activities
                      </CardTitle>
                      <CardDescription>
                        {completedActivities} of {totalActivities} completed
                      </CardDescription>
                    </div>
                    <Progress value={progress} className="w-32 h-2" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                      <Checkbox
                        checked={activity.is_completed}
                        onCheckedChange={() => toggleActivity(activity.id, activity.is_completed)}
                      />
                      <div className="flex-1">
                        <span className={`font-medium ${activity.is_completed ? "line-through text-muted-foreground" : ""}`}>
                          {activity.title}
                        </span>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      {activity.is_completed && (
                        <Badge className="bg-green-600">Done</Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Complete Goal Button */}
            {!goal.completed_at && (
              <Card className="hover-lift">
                <CardContent className="p-6">
                  <Button onClick={completeGoal} className="w-full h-12 text-lg hover-lift">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Mark Goal as Complete
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Notes Section */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Notes & Encouragement
                </CardTitle>
                <CardDescription>
                  Add personal notes or receive encouragement from partners
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a note about your progress, challenges, or wins..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="focus-ring"
                  />
                  <Button onClick={addNote} disabled={!note.trim()} className="hover-lift">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>

                {/* Mock Notes */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Sarah Martinez</p>
                      <p className="text-sm text-muted-foreground">
                        Great progress! You're crushing this goal! 💪
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start hover-lift">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Partners
                </Button>
                <Button variant="outline" className="w-full justify-start hover-lift">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Calendar
                </Button>
                <Button variant="outline" className="w-full justify-start hover-lift">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Progress History */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="text-lg">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{day}</span>
                      <div className="flex items-center gap-2">
                        {index < 5 && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        {index === 5 && <Clock className="h-4 w-4 text-orange-600" />}
                        {index === 6 && <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Encouragement */}
            <Card className="hover-lift">
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <div className="text-4xl">💪</div>
                  <div>
                    <p className="font-medium">Keep it up!</p>
                    <p className="text-sm text-muted-foreground">
                      You're doing great. Stay consistent!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
