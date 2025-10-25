"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, Target, Users, ArrowLeft, Plus, X, Lock, Globe, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"
import { supabase, authHelpers } from "@/lib/supabase-client"

export default function EditSeasonalGoalPage() {
  const [goal, setGoal] = useState<any>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [milestones, setMilestones] = useState<string[]>([""])
  const [loading, setLoading] = useState(false)
  const [visibility, setVisibility] = useState<"public" | "private" | "restricted">("public")

  const [canEdit, setCanEdit] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState("")
  const router = useRouter()
  const params = useParams()
  const goalId = params.id as string

  const checkEditPermission = (createdAt: string, status: string) => {
    if (status === 'completed') return false
    const created = new Date(createdAt).getTime()
    const now = Date.now()
    const fiveHours = 5 * 60 * 60 * 1000
    const timeDiff = now - created
    
    if (timeDiff <= fiveHours) {
      const remaining = fiveHours - timeDiff
      const hours = Math.floor(remaining / (60 * 60 * 1000))
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
      setTimeRemaining(`${hours}h ${minutes}m`)
      return true
    }
    return false
  }

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

        const editAllowed = checkEditPermission(goalData.created_at, goalData.status)
        setCanEdit(editAllowed)

        setGoal(goalData)
        setTitle(goalData.title)
        setDescription(goalData.description || '')
        setCategory(goalData.category?.replace('_', '-') || '')
        setVisibility(goalData.visibility)


        const { data: activities } = await supabase
          .from('goal_activities')
          .select('*')
          .eq('goal_id', goalId)
          .order('order_index')

        if (activities && activities.length > 0) {
          setMilestones(activities.map(a => a.title))
        }
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

  const addMilestone = () => {
    setMilestones([...milestones, ""])
  }

  const updateMilestone = (index: number, value: string) => {
    const newMilestones = [...milestones]
    newMilestones[index] = value
    setMilestones(newMilestones)
  }

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
    const newDates = { ...milestonesDates }
    delete newDates[index]
    setMilestonesDates(newDates)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit) {
      toast.error('Goal can no longer be edited')
      return
    }

    setLoading(true)

    try {
      const { error: goalError } = await supabase
        .from('goals')
        .update({
          title,
          description,
          category: category.replace('-', '_'),
          visibility,
          target_date: null
        })
        .eq('id', goalId)

      if (goalError) throw goalError

      await supabase
        .from('goal_activities')
        .delete()
        .eq('goal_id', goalId)

      if (milestones.filter(m => m.trim()).length > 0) {
        const milestoneData = milestones
          .filter(m => m.trim())
          .map((milestone, index) => ({
            goal_id: goalId,
            title: milestone.trim(),
            completed: false,
            order_index: index
          }))

        await supabase
          .from('goal_activities')
          .insert(milestoneData)
      }

      toast.success('Goal updated successfully!')
      window.dispatchEvent(new CustomEvent('goalUpdated', { detail: { goalId } }))
      router.push('/goals')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update goal')
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Seasonal Goal</h1>
            <p className="text-muted-foreground">
              {canEdit ? `Edit within ${timeRemaining} remaining` : 'Goal can only be edited within 5 hours of creation'}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/goals')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Button>
        </div>

        {!canEdit && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-900">Editing Disabled</span>
              </div>
              <p className="text-sm text-amber-700">
                {goal.status === 'completed' 
                  ? 'This goal is completed and cannot be edited.'
                  : 'Goals can only be edited within 5 hours of creation. Use the Update page to track progress.'}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Goal Details</CardTitle>
                  <CardDescription>Edit your seasonal goal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Goal Title <span className="text-destructive">*</span></Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={!canEdit}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      disabled={!canEdit}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category <span className="text-destructive">*</span></Label>
                    <Select value={category} onValueChange={setCategory} disabled={!canEdit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="health-fitness">Health & Fitness</SelectItem>
                        <SelectItem value="learning">Learning & Education</SelectItem>
                        <SelectItem value="career">Career & Business</SelectItem>
                        <SelectItem value="creative">Creative Arts</SelectItem>
                        <SelectItem value="personal">Personal Growth</SelectItem>
                        <SelectItem value="relationships">Relationships</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Key Milestones <span className="text-destructive">*</span></Label>
                      {canEdit && (
                        <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Milestone
                        </Button>
                      )}
                    </div>
                    

                    
                    <div className="space-y-3">
                      {milestones.map((milestone, index) => (
                        <div key={index} className="space-y-2 p-3 rounded-lg border bg-card">
                          <div className="flex gap-2">
                            <Input
                              placeholder={`Milestone ${index + 1}`}
                              value={milestone}
                              onChange={(e) => updateMilestone(index, e.target.value)}
                              disabled={!canEdit}
                              required
                            />
                            {canEdit && milestones.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeMilestone(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Visibility <span className="text-destructive">*</span></Label>
                    <Select value={visibility} onValueChange={setVisibility} disabled={!canEdit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Private</div>
                              <div className="text-xs text-muted-foreground">Only you can see</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="restricted">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Partners Only</div>
                              <div className="text-xs text-muted-foreground">Only your partners can see</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Public</div>
                              <div className="text-xs text-muted-foreground">Everyone can see</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Link href="/goals" className="flex-1">
                      <Button type="button" variant="outline" className="w-full">Cancel</Button>
                    </Link>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={!canEdit || loading || !title.trim() || !description.trim() || !category || milestones.filter(m => m.trim()).length === 0}
                    >
                      {loading ? 'Updating...' : 'Update Goal'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Goal Info</CardTitle>
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
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(goal.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}