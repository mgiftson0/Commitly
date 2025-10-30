"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Save, Users, Crown, Plus, X, Target } from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'
import { toast } from 'sonner'
import { 
  getGroupGoalDetails, 
  updateGroupGoal, 
  isGroupGoalAdmin 
} from '@/lib/group-goals'
import { authHelpers, supabase } from '@/lib/supabase-client'

export default function EditGroupGoalPage() {
  const params = useParams()
  const router = useRouter()
  const goalId = params.goalId as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [goalData, setGoalData] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [activities, setActivities] = useState<any[]>([])

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

      // Check admin permissions
      const adminStatus = await isGroupGoalAdmin(goalId, user.id)
      if (!adminStatus) {
        toast.error('Only admins can edit group goals')
        router.push(`/goals/group/${goalId}`)
        return
      }

      setIsAdmin(true)

      // Load goal details
      const result = await getGroupGoalDetails(goalId)
      if (!result.success || !result.data) {
        toast.error('Failed to load group goal')
        router.push('/goals')
        return
      }

      const { goal, activities: goalActivities } = result.data
      setGoalData(result.data)
      setTitle(goal.title || '')
      setDescription(goal.description || '')
      setTargetDate(goal.target_date ? goal.target_date.split('T')[0] : '')
      setActivities(goalActivities || [])
    } catch (error) {
      console.error('Error loading goal data:', error)
      toast.error('Failed to load goal data')
      router.push('/goals')
    } finally {
      setLoading(false)
    }
  }

  const addActivity = () => {
    const newActivity = {
      id: `temp-${Date.now()}`,
      goal_id: goalId,
      title: '',
      completed: false,
      order_index: activities.length,
      assigned_to: null,
      assigned_to_all: true
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

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Goal title is required')
      return
    }

    if (activities.some(a => !a.title.trim())) {
      toast.error('All activities must have a title')
      return
    }

    setSaving(true)
    try {
      // Update goal
      const goalUpdateResult = await updateGroupGoal(goalId, {
        title: title.trim(),
        description: description.trim(),
        target_date: targetDate || null,
        updated_at: new Date().toISOString()
      })

      if (!goalUpdateResult.success) {
        const errorMessage = goalUpdateResult.error && typeof goalUpdateResult.error === 'object' && 'message' in goalUpdateResult.error 
          ? (goalUpdateResult.error as any).message 
          : 'Failed to update goal'
        throw new Error(errorMessage)
      }

      // Update activities
      if (goalData?.goal?.goal_type === 'multi-activity') {
        // Delete existing activities
        await supabase
          .from('goal_activities')
          .delete()
          .eq('goal_id', goalId)

        // Insert new activities
        if (activities.length > 0) {
          const activitiesToInsert = activities
            .filter(a => a.title.trim())
            .map((activity, index) => ({
              goal_id: goalId,
              title: activity.title.trim(),
              order_index: index,
              completed: false,
              assigned_to: activity.assigned_to,
              assigned_to_all: activity.assigned_to_all ?? true
            }))

          const { error: activitiesError } = await supabase
            .from('goal_activities')
            .insert(activitiesToInsert)

          if (activitiesError) throw activitiesError
        }
      }

      toast.success('Group goal updated successfully')
      router.push(`/goals/group/${goalId}`)
    } catch (error: any) {
      console.error('Error saving goal:', error)
      toast.error(error.message || 'Failed to save goal')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Target className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Loading group goal...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Only admins can edit group goals</p>
          <Button onClick={() => router.push(`/goals/group/${goalId}`)}>
            Back to Goal
          </Button>
        </div>
      </MainLayout>
    )
  }

  const { goal, members } = goalData
  const acceptedMembers = members?.filter((m: any) => m.status === 'accepted') || []

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-6 w-6 text-purple-600" />
              <h1 className="text-2xl font-bold">Edit Group Goal</h1>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Crown className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Make changes to your group goal and activities
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push(`/goals/group/${goalId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goal
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Goal Details */}
            <Card>
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
                    placeholder="Enter goal description"
                    rows={3}
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
              </CardContent>
            </Card>

            {/* Activities */}
            {goal?.goal_type === 'multi-activity' && (
              <Card>
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
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <Input
                        value={activity.title}
                        onChange={(e) => updateActivity(index, e.target.value)}
                        placeholder={`Activity ${index + 1}`}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2">
                        {activity.assigned_to_all ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Users className="h-3 w-3 mr-1" />
                            All
                          </Badge>
                        ) : activity.assigned_to ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Assigned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            Unassigned
                          </Badge>
                        )}
                        <Button
                          onClick={() => removeActivity(index)}
                          size="sm"
                          variant="outline"
                          disabled={activities.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No activities added yet. Click "Add Activity" to get started.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Group Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members ({acceptedMembers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {acceptedMembers.map((member: any) => {
                    const profile = member.profile
                    const memberName = profile 
                      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username || 'Member'
                      : 'Member'
                    
                    return (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile?.profile_picture_url} />
                          <AvatarFallback className="text-xs">
                            {memberName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{memberName}</p>
                          <p className="text-xs text-muted-foreground">
                            @{profile?.username || 'member'}
                          </p>
                        </div>
                        <Badge variant={member.role === 'owner' ? 'default' : 'secondary'} className="text-xs">
                          {member.role === 'owner' && <Crown className="h-3 w-3 mr-1" />}
                          {member.role}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Save Actions */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving || !title.trim()}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push(`/goals/group/${goalId}`)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Changes will be saved and all members will be notified.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}