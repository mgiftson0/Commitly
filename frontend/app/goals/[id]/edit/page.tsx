"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Save, Clock, Edit3, AlertCircle, CheckCircle2, Target, Sparkles } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { supabase, authHelpers } from "@/lib/supabase-client"
import { toast } from "sonner"
import type { Database } from "@/types/supabase"

export default function EditGoalPage() {
  const params = useParams()
  const router = useRouter()
  const goalId = params.id as string
  const [goal, setGoal] = useState<Database['public']['Tables']['goals']['Row'] | null>(null)
  const [activities, setActivities] = useState<Database['public']['Tables']['goal_activities']['Row'][]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [targetDate, setTargetDate] = useState('')

  const loadGoalData = useCallback(async () => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

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

      // Check if goal can be edited
      const today = new Date().toISOString().split('T')[0]
      const startDate = goalData.start_date ? goalData.start_date.split('T')[0] : null
      const isPending = goalData.status === 'pending' || (startDate && startDate > today)
      
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

      if (!editAllowed) {
        toast.error('Goal can no longer be edited')
        router.push(`/goals/${goalId}/update`)
        return
      }

      setCanEdit(true)
      setGoal(goalData)
      setTitle(goalData.title || '')
      setDescription(goalData.description || '')
      setStartDate(goalData.start_date ? goalData.start_date.split('T')[0] : '')
      setTargetDate(goalData.target_date ? goalData.target_date.split('T')[0] : '')

      // Load activities for multi-activity goals
      if (goalData.goal_type === 'multi-activity') {
        const { data: activitiesData } = await supabase
          .from('goal_activities')
          .select('*')
          .eq('goal_id', goalId)
          .order('order_index')
        setActivities(activitiesData || [])
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading goal:', error)
      toast.error('Failed to load goal')
      router.push('/goals')
    }
  }, [goalId, router])

  useEffect(() => {
    loadGoalData()
  }, [loadGoalData])

  const addActivity = () => {
    const newActivity = {
      id: `temp-${Date.now()}`,
      goal_id: goalId,
      title: '',
      description: null,
      completed: false,
      order_index: activities.length,
      due_date: null,
      assigned_to: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setActivities([...activities, newActivity])
  }

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index))
  }

  const updateActivity = (index: number, title: string) => {
    const updated = activities.map((activity, i) => 
      i === index ? { ...activity, title } : activity
    )
    setActivities(updated)
  }

  const saveGoal = async () => {
    if (!title.trim()) {
      toast.error('Goal title is required')
      return
    }

    if (goal?.goal_type === 'multi-activity' && activities.some(a => !a.title.trim())) {
      toast.error('All activities must have a title')
      return
    }

    // Validate dates
    if (startDate && targetDate && new Date(startDate) >= new Date(targetDate)) {
      toast.error('Start date must be before target date')
      return
    }

    // Check 2-month future limit for start date
    if (startDate) {
      const maxDate = new Date()
      maxDate.setMonth(maxDate.getMonth() + 2)
      if (new Date(startDate) > maxDate) {
        toast.error('Start date cannot be more than 2 months in the future')
        return
      }
    }

    setSaving(true)
    try {
      // Update goal
      const { error: goalError } = await supabase
        .from('goals')
        .update({
          title: title.trim(),
          description: description.trim(),
          start_date: startDate || null,
          target_date: targetDate || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)

      if (goalError) throw goalError

      // Update activities for multi-activity goals
      if (goal?.goal_type === 'multi-activity') {
        // Delete existing activities
        await supabase
          .from('goal_activities')
          .delete()
          .eq('goal_id', goalId)

        // Insert new activities
        if (activities.length > 0) {
          const activitiesToInsert = activities.map((activity, index) => ({
            goal_id: goalId,
            title: activity.title.trim(),
            order_index: index,
            completed: false
          }))

          const { error: activitiesError } = await supabase
            .from('goal_activities')
            .insert(activitiesToInsert)

          if (activitiesError) throw activitiesError
        }
      }

      toast.success('Goal updated successfully')
      router.push(`/goals/${goalId}`)
    } catch (error) {
      console.error('Error saving goal:', error)
      toast.error('Failed to save goal')
    } finally {
      setSaving(false)
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

  if (!canEdit) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Goal can no longer be edited</p>
          <Button onClick={() => router.push(`/goals/${goalId}/update`)}>Go to Update Page</Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800 shadow-xl p-6 sm:p-8">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-200/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-3xl sm:text-4xl">✏️</span>
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-400 text-xs sm:text-sm">
                    {goal?.status === 'pending' ? '⏳ Pending' : '✨ Active'}
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 dark:text-blue-50 mb-2">
                  Edit Goal
                </h1>
                <p className="text-sm sm:text-base text-blue-700 dark:text-blue-200">
                  {goal?.status === 'pending' 
                    ? 'Update activities and dates for your pending goal before it starts' 
                    : 'Make adjustments to your goal details and activities'
                  }
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => router.push('/goals')} className="border-2">
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        {goal?.status === 'pending' && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border-2 border-blue-200 dark:border-blue-800 p-4 sm:p-6 shadow-md">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full blur-lg -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex items-start gap-3">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-50 mb-1">Goal Status</h3>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  This goal will become active on <span className="font-semibold">{startDate ? new Date(startDate).toLocaleDateString() : 'the start date'}</span>. You can edit all details until 5 hours before it starts.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {goal?.status !== 'pending' && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border-2 border-amber-200 dark:border-amber-800 p-4 sm:p-6 shadow-md">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/30 rounded-full blur-lg -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-50 mb-1">Time Limited</h3>
                <p className="text-sm text-amber-700 dark:text-amber-200">
                  You can only edit this goal within 5 hours of creation. Edit carefully as time is running out.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Goal Details Card */}
        <Card className="relative overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-200/20 to-transparent rounded-full blur-2xl" />
          
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Edit3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-xl sm:text-2xl">Goal Details</CardTitle>
            </div>
            <CardDescription>Update your goal's core information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            {/* Title Field */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="title" className="text-base font-semibold mb-2 block">Goal Title <span className="text-red-500">*</span></Label>
                <p className="text-xs text-muted-foreground mb-2">Give your goal a clear, motivating title</p>
              </div>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Learn JavaScript in 30 days"
                className="h-10 text-base border-2 focus:border-blue-500"
              />
              {title && <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Title looks good!</p>}
            </div>

            {/* Description Field */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="description" className="text-base font-semibold mb-2 block">Description</Label>
                <p className="text-xs text-muted-foreground mb-2">Explain why this goal matters and what you hope to achieve</p>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share your motivation and goals for this objective..."
                rows={4}
                className="border-2 focus:border-blue-500 resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">{description.length}/500 characters</p>
            </div>

            {/* Dates Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 sm:p-6 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="startDate" className="text-base font-semibold mb-2 block">Start Date</Label>
                  <p className="text-xs text-muted-foreground mb-2">When should this goal begin?</p>
                </div>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 border-2 focus:border-blue-500"
                />
                {startDate && <p className="text-xs text-muted-foreground">{new Date(startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>}
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="targetDate" className="text-base font-semibold mb-2 block">Target Date</Label>
                  <p className="text-xs text-muted-foreground mb-2">When do you want to complete it?</p>
                </div>
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="h-10 border-2 focus:border-blue-500"
                />
                {targetDate && <p className="text-xs text-muted-foreground">{new Date(targetDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>}
              </div>
            </div>
            
            {/* Date Validation Info */}
            {startDate && targetDate && new Date(startDate) < new Date(targetDate) && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-xs text-green-700 dark:text-green-300">Timeline looks good! You have {Math.ceil((new Date(targetDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days to complete this goal.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activities Card */}
        {goal?.goal_type === 'multi-activity' && (
          <Card className="relative overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-xl">
            <CardHeader className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <CardTitle className="text-xl sm:text-2xl">Activities Breakdown</CardTitle>
                  </div>
                  <CardDescription>Define the key steps to complete your goal</CardDescription>
                </div>
                <Button onClick={addActivity} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              {activities.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Sparkles className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No activities yet. Break down your goal into smaller steps!
                  </p>
                </div>
              ) : (
                activities.map((activity, index) => (
                  <div key={index} className="group flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors bg-white dark:bg-slate-800">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 w-6 text-center flex-shrink-0">{index + 1}</span>
                    <Input
                      value={activity.title}
                      onChange={(e) => updateActivity(index, e.target.value)}
                      placeholder={`Activity ${index + 1} - e.g., Set up development environment`}
                      className="flex-1 border-0 focus:ring-0 px-0 text-sm"
                    />
                    <Button
                      onClick={() => removeActivity(index)}
                      size="sm"
                      variant="ghost"
                      disabled={activities.length <= 1}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))
              )}
              {activities.length > 0 && (
                <p className="text-xs text-muted-foreground text-center pt-2 border-t border-slate-200 dark:border-slate-700 mt-4">
                  You have <span className="font-semibold">{activities.length}</span> {activities.length === 1 ? 'activity' : 'activities'} to complete
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            onClick={saveGoal} 
            disabled={saving}
            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-base shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push(`/goals/${goalId}`)}
            className="flex-1 h-12 border-2 text-base"
          >
            Cancel
          </Button>
        </div>
        
        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-muted-foreground mb-1">Title</p>
            <p className="text-sm font-semibold truncate">{title || 'Not set'}</p>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
            <p className="text-xs text-muted-foreground mb-1">Timeline</p>
            <p className="text-sm font-semibold">{startDate && targetDate ? 'Set' : startDate || targetDate ? 'Partial' : 'Not set'}</p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs text-muted-foreground mb-1">Activities</p>
            <p className="text-sm font-semibold">{goal?.goal_type === 'multi-activity' ? activities.length : '1 (Single)'}</p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}