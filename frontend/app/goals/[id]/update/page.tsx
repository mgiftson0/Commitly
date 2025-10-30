"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Target, ArrowLeft, CheckCircle2, Flame, AlertTriangle, Edit, Pause, Play, Clock, Users, Star, Sparkles, Trophy, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"
import { supabase, authHelpers } from "@/lib/supabase-client"
import { SuspendResumeDialog } from "@/components/goals/suspend-resume-dialog"
import { GoalCompletionDialog } from "@/components/goals/goal-completion-dialog"
import { getGoalTheme, getGoalTypeIcon, getGoalNatureIcon, animatedPatterns } from "@/lib/goal-theme-styles"

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
      
      // Update goal progress in database (but don't auto-complete)
      const { error } = await supabase
        .from('goals')
        .update({
          progress,
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
      
      // Trigger update event
      window.dispatchEvent(new CustomEvent('goalUpdated'))
      
      // Show completion dialog if all activities are done
      if (progress === 100) {
        setShowCompletionDialog(true)
        toast.success('All activities completed! Confirm to complete goal.')
      } else {
        toast.success('Progress updated!')
      }
      
      // Update local goal state
      setGoal({ ...goal, progress })
    } catch (error) {
      console.error('Error toggling activity:', error)
      toast.error('Failed to update progress')
    }
  }

  const handleCompleteGoal = async (reflection?: string) => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) return

      // Mark goal as completed
      const { error } = await supabase
        .from('goals')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          progress: 100,
          completion_reflection: reflection || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)

      if (error) throw error

      // Create completion notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Goal Completed! 🎉',
          message: `Congratulations! You completed: ${goal?.title}`,
          type: 'goal_completed',
          read: false,
          data: { goal_id: goalId, reflection }
        })

      // Check for achievements
      const { data: completedGoals } = await supabase
        .from('goals')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'completed')
      
      if (completedGoals && completedGoals.length === 1) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_type: 'first_completion',
            unlocked_at: new Date().toISOString(),
            data: { goal_id: goalId }
          })
      }
      
      if (completedGoals && completedGoals.length === 10) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_type: 'goal_master',
            unlocked_at: new Date().toISOString(),
            data: { completed_goals: completedGoals.length }
          })
      }

      window.dispatchEvent(new CustomEvent('goalUpdated'))
      toast.success('Goal completed! 🎉')
      setShowCompletionDialog(false)
      
      // Redirect to goal details
      setTimeout(() => router.push(`/goals/${goalId}`), 1500)
    } catch (error) {
      console.error('Error completing goal:', error)
      toast.error('Failed to complete goal')
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

  // Get dynamic theme
  const goalNature = goal.is_group_goal ? 'group' : goal.duration_type === 'seasonal' || goal.is_seasonal ? 'seasonal' : 'individual'
  const theme = getGoalTheme(goal.goal_type || 'single-activity', goalNature, false)
  const typeEmoji = getGoalTypeIcon(goal.goal_type || 'single-activity')
  const natureEmoji = getGoalNatureIcon(goalNature)

  return (
    <MainLayout>
      {/* Animated Background */}
      <div className={`fixed inset-0 -z-10 ${theme.backgroundPattern} ${animatedPatterns.dots}`} />
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

      <div className="space-y-4 sm:space-y-6">
        {/* Hero Header with Dynamic Styling */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.containerGradient} border-2 ${theme.containerBorder} shadow-2xl ${theme.containerShadow} p-6 sm:p-8`}>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-3xl sm:text-4xl">{typeEmoji}</span>
                  <Badge className={`${theme.badgeGradient} ${theme.badgeText} border ${theme.badgeBorder} text-xs sm:text-sm`}>
                    {goal.goal_type?.replace('-', ' ') || 'Goal'}
                  </Badge>
                  {goalNature !== 'individual' && (
                    <Badge className={`${theme.badgeGradient} ${theme.badgeText} border ${theme.badgeBorder} text-xs sm:text-sm`}>
                      {goalNature === 'group' && <Users className="h-3 w-3 mr-1" />}
                      {goalNature === 'seasonal' && <Star className="h-3 w-3 mr-1" />}
                      {goalNature}
                    </Badge>
                  )}
                </div>
                <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${theme.headerText} mb-2`}>
                  Update Progress
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {goal.status === 'pending' 
                    ? '⏳ Goal is pending - you can edit activities and dates'
                    : '✨ Mark activities as completed to track your progress'
                  }
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {canEdit && (
                  <Link href={`/goals/${goalId}/edit`}>
                    <Button variant="outline" size="sm" className="border-2">
                      <Edit className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Edit Goal</span>
                    </Button>
                  </Link>
                )}
                <SuspendResumeDialog
                  goalId={goalId}
                  goalTitle={goal.title}
                  isSuspended={goal.status === 'paused' || goal.is_suspended}
                  onStatusChange={loadGoalData}
                />
                <Button variant="outline" size="sm" onClick={() => router.push('/goals')} className="border-2">
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Info Card with Dynamic Styling */}
        <Card className={`relative overflow-hidden border-2 ${theme.containerBorder} bg-gradient-to-br ${theme.containerGradient} shadow-xl`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-2xl" />
          
          <CardHeader className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className={`text-xl sm:text-2xl ${theme.headerText} flex items-center gap-2 mb-2`}>
                  <Target className={`h-5 w-5 sm:h-6 sm:w-6 ${theme.headerIcon}`} />
                  <span className="line-clamp-2">{goal.title}</span>
                </CardTitle>
                {goal.description && (
                  <CardDescription className="text-sm sm:text-base line-clamp-2">
                    {goal.description}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-6 relative z-10">
            {/* Progress Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${theme.headerText}`}>{progress}%</span>
                  {progress === 100 && <Trophy className={`h-5 w-5 ${theme.headerIcon} animate-bounce`} />}
                </div>
              </div>
              <div className={`relative h-4 rounded-full ${theme.progressTrack} overflow-hidden shadow-inner`}>
                <div 
                  className={`h-full ${theme.progressBar} transition-all duration-500 ease-out relative overflow-hidden`}
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{completedActivities} of {totalActivities} activities completed</span>
                {progress === 100 && <span className="text-emerald-600 dark:text-emerald-400 font-medium">Ready to complete! 🎉</span>}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goal.scheduleType === 'recurring' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Current Streak</p>
                    <p className="text-sm font-semibold">{goal.streak || 0} days</p>
                  </div>
                </div>
              )}
              {goal.target_date && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <Calendar className={`h-5 w-5 ${theme.headerIcon}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">Target Date</p>
                    <p className="text-sm font-semibold">{new Date(goal.target_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activities Section */}
        {goal.goal_type === 'multi-activity' && (
          <Card className={`relative overflow-hidden border-2 ${theme.containerBorder} bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-xl`}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className={`h-5 w-5 ${theme.headerIcon}`} />
                  Activities Checklist
                </CardTitle>
                <Button 
                  onClick={() => setShowCompletionDialog(true)}
                  disabled={progress !== 100 || goal.status === 'pending'}
                  size="sm"
                  className={`${progress === 100 ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg animate-pulse' : ''}`}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Complete Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {activities.map((activity, index) => (
                <div 
                  key={index} 
                  className={`group flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 ${
                    activity.completed 
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <Checkbox
                    checked={activity.completed}
                    onCheckedChange={() => toggleActivity(index)}
                    disabled={goal.status === 'pending'}
                    className="h-5 w-5"
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm sm:text-base font-medium ${activity.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {activity.title || 'Activity'}
                    </span>
                  </div>
                  {activity.completed && (
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 flex-shrink-0">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Done
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Single Activity Completion */}
        {goal.goal_type === 'single-activity' && (
          <Card className={`relative overflow-hidden border-2 ${theme.containerBorder} bg-gradient-to-br ${theme.containerGradient} shadow-xl`}>
            <CardHeader>
              <CardTitle className={`${theme.headerText} flex items-center gap-2`}>
                <Trophy className={`h-5 w-5 ${theme.headerIcon}`} />
                Complete This Goal
              </CardTitle>
              <CardDescription>
                Click the button below to mark this goal as complete
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowCompletionDialog(true)}
                className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={goal.status === 'pending'}
              >
                <Trophy className="h-5 w-5 mr-2" />
                Complete Goal
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Completion Confirmation Dialog */}
        <GoalCompletionDialog
          open={showCompletionDialog}
          onOpenChange={setShowCompletionDialog}
          onConfirm={handleCompleteGoal}
          goalTitle={goal.title}
          goalType={goal.goal_type || 'single-activity'}
        />
      </div>
    </MainLayout>
  )
}