"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle2,
  Target,
  Calendar,
  User,
  MoreHorizontal,
  Clock,
  Flame
} from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { supabase, authHelpers } from "@/lib/supabase-client"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Goal {
  id: string
  title: string
  description: string
  category: string
  status: string
  progress: number
  visibility: string
  goal_type: string
  target_date: string
  created_at: string
  user_id: string
  duration_type?: string
  seasonal_year?: number
  seasonal_quarter?: number
  dev_mode_override?: boolean
  schedule_type?: string
  recurrence_pattern?: string
  recurrence_days?: string[]
  end_condition?: string
  target_completions?: number
  is_suspended?: boolean
  completed_at?: string
}

interface Activity {
  id: string
  title: string
  completed: boolean
  order_index: number
}

// Helper function to get quarter date range
const getQuarterDateRange = (quarter: number): string => {
  const year = new Date().getFullYear();
  const quarters = {
    1: { start: `${year}-01-01`, end: `${year}-03-31` },
    2: { start: `${year}-04-01`, end: `${year}-06-30` },
    3: { start: `${year}-07-01`, end: `${year}-09-30` },
    4: { start: `${year}-10-01`, end: `${year}-12-31` }
  };

  const q = quarters[quarter as keyof typeof quarters];
  if (!q) return '';

  const startDate = new Date(q.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endDate = new Date(q.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `${startDate} - ${endDate}`;
};

export default function GoalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const goalId = params.id as string
  
  const [goal, setGoal] = useState<Goal | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const loadGoal = async () => {
      try {
        const user = await authHelpers.getCurrentUser()
        if (!user) {
          router.push('/auth/login')
          return
        }
        setCurrentUser(user)

        // Validate goal ID
        if (!goalId || goalId === 'undefined' || goalId === 'null' || goalId === 'NaN') {
          console.error('Invalid goal ID:', goalId)
          toast.error('Invalid goal ID')
          router.push('/goals')
          return
        }

        // Get goal details
        const { data: goalData, error: goalError } = await supabase
          .from('goals')
          .select('*')
          .eq('id', goalId)
          .maybeSingle()

        if (goalError || !goalData) {
          toast.error('Goal not found')
          router.push('/goals')
          return
        }

        setGoal(goalData)
        setIsOwner(goalData.user_id === user.id)

        // Get activities if multi-activity goal
        if (goalData.goal_type === 'multi-activity') {
          const { data: activitiesData } = await supabase
            .from('goal_activities')
            .select('*')
            .eq('goal_id', goalId)
            .order('order_index')

          setActivities(activitiesData || [])
        }
      } catch (error) {
        console.error('Error loading goal:', error)
        toast.error('Failed to load goal')
      } finally {
        setLoading(false)
      }
    }

    if (goalId) {
      loadGoal()
    }
  }, [goalId, router])

  const toggleActivity = async (activityId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('goal_activities')
        .update({ completed })
        .eq('id', activityId)

      if (error) throw error

      setActivities(prev => 
        prev.map(a => a.id === activityId ? { ...a, completed } : a)
      )

      // Update goal progress
      const completedCount = activities.filter(a => a.id === activityId ? completed : a.completed).length
      const newProgress = Math.round((completedCount / activities.length) * 100)
      
      await supabase
        .from('goals')
        .update({ progress: newProgress })
        .eq('id', goalId)

      setGoal(prev => prev ? { ...prev, progress: newProgress } : null)
      
      toast.success(completed ? 'Activity completed!' : 'Activity unchecked')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update activity')
    }
  }

  const completeGoal = async () => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ 
          status: 'completed', 
          progress: 100,
          completed_at: new Date().toISOString()
        })
        .eq('id', goalId)

      if (error) throw error

      setGoal(prev => prev ? { ...prev, status: 'completed', progress: 100 } : null)
      
      // Check for achievements
      if (currentUser) {
        const { checkAndUnlockAchievements } = await import('@/lib/achievements')
        await checkAndUnlockAchievements(currentUser.id, 'goal_completed')
      }
      
      toast.success('Goal completed! 🎉')
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete goal')
    }
  }

  const deleteGoal = async () => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)

      if (error) throw error

      toast.success('Goal deleted')
      router.push('/goals')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete goal')
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
          <h1 className="text-2xl font-bold mb-4">Goal not found</h1>
          <Button onClick={() => router.push('/goals')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.push('/goals')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Button>
          
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/goals/${goalId}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Goal
                </DropdownMenuItem>
                {goal.status !== 'completed' && goal.status !== 'pending' && (
                  <DropdownMenuItem onClick={completeGoal}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Complete
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={deleteGoal} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Goal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Goal Details */}
        <Card className="border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.16)] dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{goal.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                    {goal.status}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {goal.category?.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline">
                    {goal.goal_type === 'multi-activity' ? 'Multi-Activity' : 'Single Activity'}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{goal.progress}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">{goal.description}</p>
            
            <Progress value={goal.progress} className="h-3" />
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Target Date</div>
                  <div className="text-sm text-muted-foreground">
                    {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'No deadline'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Visibility</div>
                  <div className="text-sm text-muted-foreground capitalize">{goal.visibility}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Created</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(goal.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Seasonal Goal Information */}
              {goal.duration_type && goal.duration_type !== 'standard' && (
                <>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Duration Type</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {goal.duration_type === 'annual' && 'Annual Goal'}
                        {goal.duration_type === 'quarterly' && 'Quarterly Goal'}
                        {goal.duration_type === 'biannual' && 'Bi-Annual Goal'}
                      </div>
                    </div>
                  </div>
                  {goal.seasonal_year && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Year</div>
                        <div className="text-sm text-muted-foreground">{goal.seasonal_year}</div>
                      </div>
                    </div>
                  )}
                  {goal.seasonal_quarter && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Quarter</div>
                        <div className="text-sm text-muted-foreground">
                          Q{goal.seasonal_quarter} ({getQuarterDateRange(goal.seasonal_quarter)})
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Schedule Information */}
              {goal.schedule_type && (
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Schedule</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {goal.schedule_type === 'recurring' ? 'Recurring' : 'One-time'}
                      {goal.schedule_type === 'recurring' && goal.recurrence_pattern && (
                        <span className="ml-1">({goal.recurrence_pattern})</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* End Condition */}
              {goal.schedule_type === 'recurring' && goal.end_condition && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">End Condition</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {goal.end_condition === 'by-date' && goal.target_date && `Ends ${new Date(goal.target_date).toLocaleDateString()}`}
                      {goal.end_condition === 'after-completions' && goal.target_completions && `After ${goal.target_completions} completions`}
                      {goal.end_condition === 'ongoing' && 'Ongoing (no end date)'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activities */}
        {goal.goal_type === 'multi-activity' && activities.length > 0 && (
          <Card className="border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.16)] dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle>Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Checkbox
                      checked={activity.completed}
                      onCheckedChange={(checked) => toggleActivity(activity.id, !!checked)}
                      disabled={!isOwner || goal.status === 'completed' || goal.status === 'pending'}
                    />
                    <span className={`flex-1 ${activity.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {activity.title}
                    </span>
                    {activity.completed && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
