"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Target, Plus, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

export default function CreateGoalPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [goalType, setGoalType] = useState<"single" | "multi" | "recurring">("single")
  const [visibility, setVisibility] = useState<"public" | "private" | "restricted">("private")
  const [activities, setActivities] = useState<string[]>([""])
  const [recurrencePattern, setRecurrencePattern] = useState("daily")
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([])
  const [defaultTimeAllocation, setDefaultTimeAllocation] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

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
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Create goal
      const { data: goal, error: goalError } = await supabase
        .from("goals")
        .insert({
          user_id: user.id,
          title,
          description,
          goal_type: goalType,
          visibility,
          recurrence_pattern: goalType === "recurring" ? recurrencePattern : null,
          recurrence_days: goalType === "recurring" && recurrencePattern === "custom" ? recurrenceDays : null,
          default_time_allocation: defaultTimeAllocation ? parseInt(defaultTimeAllocation) : null,
        })
        .select()
        .single()

      if (goalError) throw goalError

      // Create activities for multi-activity goals
      if (goalType === "multi" && activities.length > 0) {
        const activitiesData = activities
          .filter(a => a.trim())
          .map((activity, index) => ({
            goal_id: goal.id,
            title: activity,
            order_index: index,
          }))

        const { error: activitiesError } = await supabase
          .from("activities")
          .insert(activitiesData)

        if (activitiesError) throw activitiesError
      }

      // Create initial streak record
      await supabase.from("streaks").insert({
        goal_id: goal.id,
        user_id: user.id,
      })

      // Create notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Goal Created",
        message: `You created a new goal: ${title}`,
        notification_type: "goal_created",
        related_goal_id: goal.id,
      })

      toast.success("Goal created successfully!")
      router.push(`/goals/${goal.id}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to create goal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Target className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold">Create Goal</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Goal Details</CardTitle>
              <CardDescription>Set up your new goal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Workout every day"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What do you want to achieve?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Goal Type */}
              <div className="space-y-2">
                <Label>Goal Type *</Label>
                <RadioGroup value={goalType} onValueChange={(value: any) => setGoalType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single" className="font-normal cursor-pointer">
                      Single Activity - One task to complete
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multi" id="multi" />
                    <Label htmlFor="multi" className="font-normal cursor-pointer">
                      Multi-Activity - Daily checklist with multiple tasks
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="recurring" id="recurring" />
                    <Label htmlFor="recurring" className="font-normal cursor-pointer">
                      Recurring - Repeats on a schedule
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Activities (for multi-activity goals) */}
              {goalType === "multi" && (
                <div className="space-y-2">
                  <Label>Activities</Label>
                  {activities.map((activity, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Activity ${index + 1}`}
                        value={activity}
                        onChange={(e) => updateActivity(index, e.target.value)}
                      />
                      {activities.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeActivity(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addActivity} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </div>
              )}

              {/* Recurrence (for recurring goals) */}
              {goalType === "recurring" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recurrence">Recurrence Pattern</Label>
                    <Select value={recurrencePattern} onValueChange={setRecurrencePattern}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="custom">Custom Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {recurrencePattern === "custom" && (
                    <div className="space-y-2">
                      <Label>Select Days</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {weekDays.map((day) => (
                          <div key={day} className="flex items-center space-x-2">
                            <Checkbox
                              id={day}
                              checked={recurrenceDays.includes(day)}
                              onCheckedChange={() => toggleRecurrenceDay(day)}
                            />
                            <Label htmlFor={day} className="font-normal cursor-pointer capitalize">
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
                <Label htmlFor="time">Default Time Allocation (minutes)</Label>
                <Input
                  id="time"
                  type="number"
                  placeholder="e.g., 30"
                  value={defaultTimeAllocation}
                  onChange={(e) => setDefaultTimeAllocation(e.target.value)}
                  min="1"
                />
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private - Only you can see</SelectItem>
                    <SelectItem value="restricted">Restricted - Only partners can see</SelectItem>
                    <SelectItem value="public">Public - Everyone can see</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Link href="/dashboard" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Creating..." : "Create Goal"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
