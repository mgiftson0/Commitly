"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Target, ArrowLeft, CheckCircle2, Flame, AlertTriangle, Edit, Pause, Play, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"
import { supabase, authHelpers } from "@/lib/supabase-client"
import { SuspendResumeDialog } from "@/components/goals/suspend-resume-dialog"
import { ActivityCompletionDialog } from "@/components/goals/activity-completion-dialog"

export default function UpdateGoalPage() {
  const [goal, setGoal] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [canUpdate, setCanUpdate] = useState(true)
  const [canEdit, setCanEdit] = useState(false)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const router = useRouter()
  const params = useParams()
  const goalId = params.id as string

  useEffect(() => {
    loadGoalData()
  }, [goalId])

  const loadGoalData = async () => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get goal from database
      const { data: goalData, error: goalError } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .maybeSingle()

      if (goalError || !goalData) {
        toast.error('Goal not found')
        setGoal(null)
        setLoading(false)
        return
      }

      // Check if goal is completed
      if (goalData.completed_at || goalData.status === 'completed') {
        setGoal({ ...goalData, completed_at: goalData.completed_at || new Date().toISOString() })
        setCanUpdate(false)
        setCanEdit(false)
        setLoading(false)
        return
      }
      
      // Check if goal is pending (start date in future)
      const today = new Date().toISOString().split('T')[0]
      const startDate = goalData.start_date ? goalData.start_date.split('T')[0] : null
      const isPending = goalData.status === 'pending' || (startDate && startDate > today)
      
      // For pending goals, allow edit until 5 hours before start date
      // For active goals, allow edit within 5 hours of creation
      let editAllowed = false
      if (isPending && startDate) {
        const startDateTime = new Date(startDate).getTime()
        const fiveHoursBeforeStart = startDateTime - (5 * 60 * 60 * 1000)
        editAllowed = Date.now() <= fiveHoursBeforeStart
      } else {
        const created = new Date(goalData.created_at).getTime()
        const fiveHours = 5 * 60 * 60 * 1000
        editAllowed = (Date.now() - created) <= fiveHours
      }
      
      setCanEdit(editAllowed)
      setCanUpdate(true) // Allow activity updates for pending goals

      setGoal(goalData)

      // Get activities if multi-activity goal
      if (goalData.goal_type === 'multi-activity') {
        const { data: activitiesData } = await supabase
          .from('goal_activities')
          .select('*')
          .eq('goal_id', goalId)
          .order('order_index')

        setActivities(activitiesData || [])
      } else {
        // For single-activity goals, create a virtual activity
        setActivities([{ 
          id: 'single', 
          title: goalData.title, 
          completed: goalData.status === 'completed',
          goal_id: goalId,
          order_index: 0
        }])
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading goal:', error)
      toast.error("Failed to load goal")
      setLoading(false)
    }
  }

  const toggleActivity = async (activityIndex: number) => {
    if (goal.status === 'completed' || goal.completed_at) {
      toast.error('Goal is completed and cannot be updated')
      return
    }
    
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) return

      const updatedActivities = activities.map((activity, index) => {
        if (index === activityIndex) {
          return { ...activity, completed: !activity.completed }
        }
        return activity
      })
      
      setActivities(updatedActivities)

      // Update activity in database
      const activity = activities[activityIndex]
      if (activity.id !== 'single') {
        await supabase
          .from('goal_activities')
          .update({ completed: !activity.completed })
          .eq('id', activity.id)
      }

      // Calculate new progress
      const completedCount = updatedActivities.filter(a => a.completed).length
      const progress = updatedActivities.length > 0 ? Math.round((completedCount / updatedActivities.length) * 100) : 0
      
      // Update goal in database
      const isCompleted = progress === 100
      const { error } = await supabase
        .from('goals')
        .update({
          progress,
          status: isCompleted ? 'completed' : 'active',
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)

      if (error) {
        console.error('Error updating goal:', error)
        toast.error('Failed to update progress')
        return
      }

      // Create activity notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: updatedActivities[activityIndex].completed ? 'Activity Completed!' : 'Activity Unchecked',
          message: updatedActivities[activityIndex].completed 
            ? `You completed: ${activity.title || 'an activity'}` 
            : `You unchecked: ${activity.title || 'an activity'}`,
          type: 'activity_completed',
          read: false,
          data: { goal_id: goalId, activity_id: activity.id }
        })

      // If goal completed, create completion notification and check achievements
      if (isCompleted) {
        try {
          await supabase
            .from('notifications')
            .insert({
              user_id: user.id,
              title: 'Goal Completed! 🎉',
              message: `Congratulations! You completed: ${goal?.title}`,
              type: 'goal_completed',
              read: false,
              data: { goal_id: goalId }
            })
        } catch (notifError) {
          console.error('Failed to create completion notification:', notifError)
        }
        
        // Check for completion achievements
        try {
          const { data: completedGoals } = await supabase
            .from('goals')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('status', 'completed')
          
          if (completedGoals === 1) {
            await supabase
              .from('user_achievements')
              .insert({
                user_id: user.id,
                achievement_type: 'first_completion',
                unlocked_at: new Date().toISOString(),
                data: { goal_id: goalId }
              })
          }
          
          if (completedGoals === 10) {
            await supabase
              .from('user_achievements')
              .insert({
                user_id: user.id,
                achievement_type: 'goal_master',
                unlocked_at: new Date().toISOString(),
                data: { completed_goals: completedGoals }
              })
          }
        } catch (achievementError) {
          console.error('Failed to check completion achievements:', achievementError)
        }
      }
      
      // Trigger update event
      window.dispatchEvent(new CustomEvent('goalUpdated'))
      
      toast.success(isCompleted ? 'Goal completed! 🎉' : 'Progress updated!')
      
      // Reload goal data
      if (isCompleted) {
        setTimeout(() => loadGoalData(), 500)
      }
    } catch (error) {
      console.error('Error toggling activity:', error)
      toast.error('Failed to update progress')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <Target className="h-12 w-12 text-primary animate-pulse" />
        </div>
      </MainLayout>
    )
  }

  if (!goal) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Goal not found</p>
          <Link href="/goals">
            <Button>Back to Goals</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  // Check if goal is completed and redirect
  if (goal.completed_at) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-lg font-semibold mb-2">Goal Completed!</p>
          <p className="text-muted-foreground mb-4">This goal has been completed and can no longer be updated.</p>
          <Link href={`/goals/${goalId}`}>
            <Button>View Goal Details</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const completedActivities = activities.filter(a => a.completed).length
  const totalActivities = activities.length
  const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0

  return (
    <MainLayout>
      {!canUpdate && goal.status === 'completed' && (
        <Card className="border-green-200 bg-green-50 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
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
      
      {goal.status === 'pending' && (
        <Card className="border-blue-200 bg-blue-50 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Goal Pending</span>
            </div>
            <p className="text-sm text-blue-700">
              This goal will become active on {goal.start_date ? new Date(goal.start_date).toLocaleDateString() : 'the start date'}. You can still edit activities and dates.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Update Goal Progress</h1>
            <p className="text-muted-foreground">
              {goal.status === 'pending' 
                ? 'Goal is pending - you can edit activities and dates'
                : 'Mark activities as completed to track your progress'
              }
            </p>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <Link href={`/goals/${goalId}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Goal
                </Button>
              </Link>
            )}
            <SuspendResumeDialog
              goalId={goalId}
              goalTitle={goal.title}
              isSuspended={goal.status === 'paused' || goal.is_suspended}
              onStatusChange={loadGoalData}
            />
            <Button variant="outline" onClick={() => router.push('/goals')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Goals
            </Button>
          </div>
        </div>

        <Card className="border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)] dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {goal.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {goal.scheduleType === 'recurring' && (
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">Current Streak: {goal.streak || 0} days</span>
              </div>
            )}
          </CardContent>
        </Card>

        {goal.goal_type === 'multi-activity' && (
          <Card className="border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)] dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Activities</CardTitle>
                <Button 
                  onClick={() => setShowCompletionDialog(true)}
                  disabled={!canUpdate || goal.status === 'pending'}
                  size="sm"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm Completion
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Checkbox
                    checked={activity.completed}
                    onCheckedChange={() => toggleActivity(index)}
                    disabled={goal.status === 'pending'}
                  />
                  <div className="flex-1">
                    <span className={`text-sm ${activity.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {activity.title || 'Activity'}
                    </span>
                  </div>
                  {activity.completed && (
                    <Badge className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Done
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {goal.goal_type === 'single-activity' && (
          <Card>
            <CardHeader>
              <CardTitle>Mark as Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowCompletionDialog(true)}
                className="w-full"
                variant={activities[0]?.completed ? "outline" : "default"}
                disabled={goal.status === 'pending'}
              >
                {activities[0]?.completed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
        <ActivityCompletionDialog
          open={showCompletionDialog}
          onOpenChange={setShowCompletionDialog}
          goalId={goalId}
          goalTitle={goal.title}
          activities={activities.map(a => ({ id: a.id, title: a.title, completed: a.completed }))}
          onComplete={loadGoalData}
        />
      </div>
    </MainLayout>
  )
}