"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, X, Save, Clock } from "lucide-react"
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

  useEffect(() => {
    loadGoalData()
  }, [loadGoalData])

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

  const addActivity = () => {
    setActivities([...activities, { title: '', order_index: activities.length }])
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

    if (goal.goal_type === 'multi-activity' && activities.some(a => !a.title.trim())) {
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
      if (goal.goal_type === 'multi-activity') {
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
          <div className="animate-pulse">Loading...</div>
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Goal</h1>
            <p className="text-sm text-muted-foreground">
              {goal.status === 'pending' ? 'Edit activities and dates for pending goal' : 'Edit goal details and activities'}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/goals')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Button>
        </div>

        {goal.status === 'pending' && (
          <Card className="border-blue-200 bg-blue-50 shadow-[0_16px_38px_rgba(15,23,42,0.12)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Pending Goal</span>
              </div>
              <p className="text-sm text-blue-700">
                This goal will become active on {startDate ? new Date(startDate).toLocaleDateString() : 'the start date'}.
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)] dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Goal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter goal title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter goal description (optional)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {goal.goal_type === 'multi-activity' && (
          <Card className="border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)] dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Activities</CardTitle>
                <Button onClick={addActivity} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={activity.title}
                    onChange={(e) => updateActivity(index, e.target.value)}
                    placeholder={`Activity ${index + 1}`}
                  />
                  <Button
                    onClick={() => removeActivity(index)}
                    size="sm"
                    variant="outline"
                    disabled={activities.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No activities added yet. Click &ldquo;Add Activity&rdquo; to get started.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button onClick={saveGoal} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" onClick={() => router.push(`/goals/${goalId}`)}>Cancel</Button>
        </div>
      </div>
    </MainLayout>
  )
}