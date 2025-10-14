"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Target,
  ArrowLeft,
  Save,
  X,
  Lightbulb,
  Clock,
  Users,
  Lock,
  Globe,
  CheckCircle2,
  Flame,
  Calendar,
  Zap,
  BookOpen,
  Dumbbell,
  Briefcase,
  Heart,
  Star,
  Sparkles,
  Edit,
  Plus
} from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { getSupabaseClient, type Goal, type Activity } from "@/lib/supabase"
import { isMockAuthEnabled, mockDelay } from "@/lib/mock-auth"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"

export default function EditGoalPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [goalType, setGoalType] = useState<"single-activity" | "multi-activity" | "recurring">("single-activity")
  const [visibility, setVisibility] = useState<"public" | "private" | "restricted">("private")
  const [activities, setActivities] = useState<string[]>([""])
  const [recurrencePattern, setRecurrencePattern] = useState("daily")
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([])
  const [defaultTimeAllocation, setDefaultTimeAllocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const params = useParams()
  const supabase = getSupabaseClient()
  const goalId = params.id as string

  const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

  useEffect(() => {
    loadGoalData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalId])

  const loadGoalData = async () => {
    if (isMockAuthEnabled()) {
      // Mock data for edit form
      setTitle("Morning Workout Routine")
      setDescription("Daily exercise to build strength and endurance")
      setGoalType("multi-activity")
      setVisibility("public")
      setActivities(["10 push-ups", "20 sit-ups", "5 minute plank"])
      setDefaultTimeAllocation("30")
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

      setTitle(goalData.title)
      setDescription(goalData.description || "")
      setGoalType(goalData.goal_type as 'single-activity' | 'multi-activity' | 'recurring')
      setVisibility(goalData.visibility)
      setDefaultTimeAllocation(goalData.default_time_allocation?.toString() || "")

      // Load activities if multi-activity goal
      if (goalData.goal_type === "multi") {
        const { data: activitiesData, error: activitiesError } = await supabase
          .from("activities")
          .select("*")
          .eq("goal_id", goalId)
          .order("order_index")

        if (activitiesError) throw activitiesError
        setActivities(activitiesData?.map(a => a.title) || [""])
      }
    } catch (error: unknown) {
      toast.error("Failed to load goal")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const addActivity = () => {
    setActivities([...activities, ""])
  }

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index))
  }

  const updateActivity = (index: number, value: string) => {
    const newActivities = [...activities]
    newActivities[index] = value
    setActivities(newActivities)
  }

  const toggleRecurrenceDay = (day: string) => {
    if (recurrenceDays.includes(day)) {
      setRecurrenceDays(recurrenceDays.filter(d => d !== day))
    } else {
      setRecurrenceDays([...recurrenceDays, day])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isMockAuthEnabled()) {
      setSaving(true)
      await mockDelay(1000)
      toast.success("Goal updated successfully! (Mock Mode)")
      router.push(`/goals/${goalId}`)
      setSaving(false)
      return
    }

    if (!supabase) {
      toast.error("Authentication service is not available")
      return
    }
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Update goal
      const { error: goalError } = await supabase
        .from("goals")
        .update({
          title,
          description,
          goal_type: goalType,
          visibility,
          recurrence_pattern: goalType === "recurring" ? recurrencePattern : null,
          recurrence_days: goalType === "recurring" && recurrencePattern === "custom" ? recurrenceDays : null,
          default_time_allocation: defaultTimeAllocation ? parseInt(defaultTimeAllocation) : null,
        })
        .eq("id", goalId)

      if (goalError) throw goalError

      // Update activities for multi-activity goals
      if (goalType === "multi-activity" && activities.length > 0) {
        // First, delete existing activities
        await supabase.from("activities").delete().eq("goal_id", goalId)

        // Then insert new activities
        const activitiesData = activities
          .filter(a => a.trim())
          .map((activity, index) => ({
            goal_id: goalId,
            title: activity,
            order_index: index,
          }))

        const { error: activitiesError } = await supabase
          .from("activities")
          .insert(activitiesData)

        if (activitiesError) throw activitiesError
      }

      toast.success("Goal updated successfully!")
      router.push(`/goals/${goalId}`)
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err.message || "Failed to update goal")
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
            <p className="text-muted-foreground">Loading goal...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Goal</h1>
            <p className="text-muted-foreground">
              Update your goal settings and preferences
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/goals/${goalId}`}>
              <Button variant="outline" className="hover-lift">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Goal
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5 text-primary" />
                    Goal Settings
                  </CardTitle>
                  <CardDescription>
                    Update your goal information and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Goal Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Workout every morning, Read 30 minutes daily"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="focus-ring"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what you want to achieve and why it matters to you..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="focus-ring"
                    />
                  </div>

                  {/* Goal Type Selection */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Goal Type</Label>
                    <RadioGroup value={goalType} onValueChange={(value: string) => setGoalType(value as 'single-activity' | 'multi-activity' | 'recurring')}>
                      <div className="grid gap-3">
                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50 ${
                          goalType === 'single-activity' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}>
                          <RadioGroupItem value="single-activity" id="single-activity" />
                          <div className="flex-1">
                            <Label htmlFor="single-activity" className="font-medium cursor-pointer">
                              Single Activity
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              One specific task to complete
                            </p>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50 ${
                          goalType === 'multi-activity' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}>
                          <RadioGroupItem value="multi-activity" id="multi-activity" />
                          <div className="flex-1">
                            <Label htmlFor="multi-activity" className="font-medium cursor-pointer">
                              Multi-Activity Checklist
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Daily checklist with multiple tasks
                            </p>
                          </div>
                          <Target className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50 ${
                          goalType === 'recurring' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}>
                          <RadioGroupItem value="recurring" id="recurring" />
                          <div className="flex-1">
                            <Label htmlFor="recurring" className="font-medium cursor-pointer">
                              Recurring Schedule
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Repeats on a schedule
                            </p>
                          </div>
                          <Flame className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Activities (for multi-activity goals) */}
                  {goalType === "multi-activity" && (
                    <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Daily Activities</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addActivity}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Activity
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {activities.map((activity, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder={`Activity ${index + 1}`}
                              value={activity}
                              onChange={(e) => updateActivity(index, e.target.value)}
                              className="focus-ring"
                            />
                            {activities.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeActivity(index)}
                                className="shrink-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recurrence Settings (for recurring goals) */}
                  {goalType === "recurring" && (
                    <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                      <Label className="text-sm font-medium">Recurrence Pattern</Label>

                      <Select value={recurrencePattern} onValueChange={setRecurrencePattern}>
                        <SelectTrigger className="focus-ring">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="custom">Custom Days</SelectItem>
                        </SelectContent>
                      </Select>

                      {recurrencePattern === "custom" && (
                        <div className="space-y-3">
                          <Label className="text-sm">Select Days</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {weekDays.map((day) => (
                              <div key={day} className="flex items-center space-x-2">
                                <Checkbox
                                  id={day}
                                  checked={recurrenceDays.includes(day)}
                                  onCheckedChange={() => toggleRecurrenceDay(day)}
                                />
                                <Label htmlFor={day} className="font-normal cursor-pointer capitalize text-sm">
                                  {day}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Time Allocation */}
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm font-medium">
                      Time Allocation (minutes)
                    </Label>
                    <Input
                      id="time"
                      type="number"
                      placeholder="How long does this usually take?"
                      value={defaultTimeAllocation}
                      onChange={(e) => setDefaultTimeAllocation(e.target.value)}
                      min="1"
                      className="focus-ring"
                    />
                  </div>

                  {/* Visibility */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Visibility</Label>
                    <Select value={visibility} onValueChange={(value: string) => setVisibility(value as 'private' | 'restricted' | 'public')}>
                      <SelectTrigger className="focus-ring">
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

                  {/* Submit Actions */}
                  <div className="flex gap-3 pt-4">
                    <Link href={`/goals/${goalId}`} className="flex-1">
                      <Button type="button" variant="outline" className="w-full hover-lift">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" className="flex-1 hover-lift" disabled={saving || !title.trim()}>
                      {saving ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Save Changes
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Sidebar - Tips & Info */}
          <div className="space-y-6">
            {/* Tips Card */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="text-lg">💡 Editing Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Update your goal to match your current priorities
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Adjust activities to better fit your schedule
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Change visibility to control who can see your progress
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Settings */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="text-lg">Current Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="capitalize">
                    {goalType.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Visibility:</span>
                  <Badge variant="outline" className="capitalize">
                    {visibility}
                  </Badge>
                </div>
                {activities.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Activities:</span>
                    <span className="font-medium">{activities.length}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
