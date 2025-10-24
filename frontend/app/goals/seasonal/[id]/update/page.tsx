"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, Target, ArrowLeft, CheckCircle2, Clock, AlertTriangle, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"
import { supabase, authHelpers } from "@/lib/supabase-client"

export default function UpdateSeasonalGoalPage() {
  const [goal, setGoal] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [completionNote, setCompletionNote] = useState("")
  const [canUpdate, setCanUpdate] = useState(true)
  const router = useRouter()
  const params = useParams()
  const goalId = params.id as string

  useEffect(() => {
    const loadGoal = async () => {
      try {
        const user = await authHelpers.getCurrentUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: goalData, error } = await supabase
          .from('goals')
          .select('*')
          .eq('id', goalId)
          .eq('user_id', user.id)
          .single()

        if (error || !goalData) {
          toast.error('Goal not found')
          router.push('/goals')
          return
        }

        setGoal(goalData)
        setCanUpdate(goalData.status !== 'completed')

        const { data: activitiesData } = await supabase
          .from('goal_activities')
          .select('*')
          .eq('goal_id', goalId)
          .order('order_index')

        setActivities(activitiesData || [])
      } catch (error) {
        console.error('Error loading goal:', error)
        toast.error('Failed to load goal')
        router.push('/goals')
      }
    }

    if (goalId) {
      loadGoal()
    }
  }, [goalId, router])

  const toggleActivity = async (activityId: string, completed: boolean) => {
    if (!canUpdate) {
      toast.error('Goal is completed and cannot be updated')
      return
    }

    try {
      const { error } = await supabase
        .from('goal_activities')
        .update({ completed })
        .eq('id', activityId)

      if (error) throw error

      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId ? { ...activity, completed } : activity
        )
      )

      // Calculate new progress
      const updatedActivities = activities.map(activity => 
        activity.id === activityId ? { ...activity, completed } : activity
      )
      const completedCount = updatedActivities.filter(a => a.completed).length
      const progress = Math.round((completedCount / updatedActivities.length) * 100)

      // Update goal progress
      await supabase
        .from('goals')
        .update({ progress })
        .eq('id', goalId)

      toast.success(completed ? 'Activity completed!' : 'Activity marked as incomplete')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update activity')
    }
  }

  const markGoalComplete = async () => {
    if (!canUpdate) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('goals')
        .update({ 
          status: 'completed',
          progress: 100,
          completed_at: new Date().toISOString(),
          completion_note: completionNote
        })
        .eq('id', goalId)

      if (error) throw error

      // Mark all activities as completed
      await supabase
        .from('goal_activities')
        .update({ completed: true })
        .eq('goal_id', goalId)

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: goal.user_id,
          title: 'Goal Completed! 🎉',
          message: `Congratulations! You completed your seasonal goal: ${goal.title}`,
          type: 'goal_completed',
          read: false,
          data: { goal_id: goalId }
        })

      toast.success('Congratulations! Goal marked as completed!')
      window.dispatchEvent(new CustomEvent('goalUpdated', { detail: { goalId } }))
      router.push('/goals')
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete goal')
    } finally {
      setLoading(false)
    }
  }

  if (!goal) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Target className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Loading goal...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const completedActivities = activities.filter(a => a.completed).length
  const progress = activities.length > 0 ? Math.round((completedActivities / activities.length) * 100) : 0
  const allActivitiesCompleted = activities.length > 0 && completedActivities === activities.length

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Update Seasonal Goal</h1>
            <p className="text-muted-foreground">Track your progress and mark milestones as complete</p>
          </div>
          <Link href="/goals">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        {!canUpdate && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Goal Completed</span>
              </div>
              <p className="text-sm text-green-700">
                This goal has been completed and can no longer be updated.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Goal Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {goal.title}
                </CardTitle>
                <CardDescription>{goal.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completed Milestones</span>
                    <span className="font-medium">{completedActivities} of {activities.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activities/Milestones */}
            <Card>
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
                <CardDescription>Check off milestones as you complete them</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-4 rounded-lg border bg-card">
                      <Checkbox
                        id={`activity-${activity.id}`}
                        checked={activity.completed}
                        onCheckedChange={(checked) => toggleActivity(activity.id, !!checked)}
                        disabled={!canUpdate}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <Label 
                          htmlFor={`activity-${activity.id}`} 
                          className={`cursor-pointer font-medium ${activity.completed ? 'line-through text-muted-foreground' : ''}`}
                        >
                          {activity.title}
                        </Label>

                      </div>
                      {activity.completed && (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-1" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Complete Goal Section */}
            {allActivitiesCompleted && canUpdate && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <CheckCircle2 className="h-5 w-5" />
                    Ready to Complete Goal
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    All milestones completed! Mark this goal as finished.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="completion-note">Completion Note (Optional)</Label>
                    <Textarea
                      id="completion-note"
                      placeholder="Add a note about your achievement, lessons learned, or next steps..."
                      value={completionNote}
                      onChange={(e) => setCompletionNote(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={markGoalComplete} 
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? 'Completing...' : 'Mark Goal as Complete'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Goal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline">Seasonal</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="capitalize">{goal.duration_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                    {goal.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="capitalize">{goal.category?.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(goal.created_at).toLocaleDateString()}</span>
                </div>
                {goal.target_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target Date:</span>
                    <span>{new Date(goal.target_date).toLocaleDateString()}</span>
                  </div>
                )}
                {goal.completed_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed:</span>
                    <span>{new Date(goal.completed_at).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {goal.completion_note && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Completion Note
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{goal.completion_note}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Progress Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress:</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="font-medium">{completedActivities}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="font-medium">{activities.length - completedActivities}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">{activities.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}