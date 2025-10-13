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
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Target,
  Plus,
  X,
  ArrowLeft,
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
  Sparkles
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { isMockAuthEnabled, mockDelay } from "@/lib/mock-auth"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"

export default function CreateGoalPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [goalNature, setGoalNature] = useState<"personal" | "group">("personal")
  const [goalType, setGoalType] = useState<"single-activity" | "multi-activity" | "recurring">("single-activity")
  const [visibility, setVisibility] = useState<"public" | "private" | "restricted">("private")
  const [activities, setActivities] = useState<string[]>([""])
  const [recurrencePattern, setRecurrencePattern] = useState("daily")
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([])
  const [defaultTimeAllocation, setDefaultTimeAllocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedPartners, setSelectedPartners] = useState<string[]>([])
  const [groupMembers, setGroupMembers] = useState<string[]>([])
  const [activityAssignments, setActivityAssignments] = useState<{[key: number]: string[]}>({})
  
  // Mock partners data
  const availablePartners = [
    { id: "1", name: "Sarah Martinez", username: "sarah_m" },
    { id: "2", name: "Mike Chen", username: "mike_c" },
    { id: "3", name: "Emily Rodriguez", username: "emily_r" },
    { id: "4", name: "John Doe", username: "john_d" },
    { id: "5", name: "Jane Smith", username: "jane_s" },
  ]
  const [category, setCategory] = useState("")
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
    
    if (isMockAuthEnabled()) {
      setLoading(true)
      await mockDelay(1000)
      toast.success("Goal created successfully! (Mock Mode)")
      router.push("/dashboard")
      setLoading(false)
      return
    }
    
    if (!supabase) {
      toast.error("Authentication service is not available")
      return
    }
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
      if (goalType === "multi-activity" && activities.length > 0) {
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
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err.message || "Failed to create goal")
    } finally {
      setLoading(false)
    }
  }

  // Goal templates for inspiration
  const goalTemplates = [
    {
      title: "Morning Workout",
      description: "Build strength and energy for the day",
      type: "recurring" as const,
      category: "Health & Fitness",
      icon: Dumbbell,
      color: "text-green-600"
    },
    {
      title: "Read for 30 minutes",
      description: "Expand knowledge and reduce stress",
      type: "recurring" as const,
      category: "Learning",
      icon: BookOpen,
      color: "text-blue-600"
    },
    {
      title: "Complete Project Portfolio",
      description: "Showcase your work and skills",
      type: "single" as const,
      category: "Career",
      icon: Briefcase,
      color: "text-purple-600"
    },
    {
      title: "Practice Meditation",
      description: "Find inner peace and mindfulness",
      type: "recurring" as const,
      category: "Wellness",
      icon: Heart,
      color: "text-pink-600"
    }
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Goal</h1>
            <p className="text-muted-foreground">
              Set a meaningful goal and start your journey to success
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/goals">
              <Button variant="outline" className="hover-lift">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Goals
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
                    <Sparkles className="h-5 w-5 text-primary" />
                    Goal Details
                  </CardTitle>
                  <CardDescription>
                    Define what you want to achieve and how you&lsquo;ll track it
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

                  {/* Goal Nature - Personal or Group */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Goal Nature</Label>
                    <RadioGroup value={goalNature} onValueChange={(value: string) => setGoalNature(value as 'personal' | 'group')}>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50 ${
                          goalNature === 'personal' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}>
                          <RadioGroupItem value="personal" id="personal" />
                          <div className="flex-1">
                            <Label htmlFor="personal" className="font-medium cursor-pointer">
                              Personal Goal
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Just for you
                            </p>
                          </div>
                          <Target className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50 ${
                          goalNature === 'group' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}>
                          <RadioGroupItem value="group" id="group" />
                          <div className="flex-1">
                            <Label htmlFor="group" className="font-medium cursor-pointer">
                              Group Goal
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Up to 5 people
                            </p>
                          </div>
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Group Members Selection (only for group goals) */}
                  {goalNature === 'group' && (
                    <div className="space-y-4 p-4 rounded-lg bg-muted/30 border-2 border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Group Members</Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Select 1-5 members for your group goal
                          </p>
                        </div>
                        <Badge variant="outline">
                          {groupMembers.length}/5
                        </Badge>
                      </div>

                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (!groupMembers.includes(value) && groupMembers.length < 5) {
                            setGroupMembers([...groupMembers, value])
                          }
                        }}
                      >
                        <SelectTrigger className="focus-ring">
                          <SelectValue placeholder="Add a member..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePartners
                            .filter(p => !groupMembers.includes(p.id))
                            .map(partner => (
                              <SelectItem key={partner.id} value={partner.id}>
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-xs font-medium">{partner.name.charAt(0)}</span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">{partner.name}</div>
                                    <div className="text-xs text-muted-foreground">@{partner.username}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>

                      {groupMembers.length > 0 && (
                        <div className="space-y-2">
                          {groupMembers.map(memberId => {
                            const member = availablePartners.find(p => p.id === memberId)
                            if (!member) return null
                            return (
                              <div key={memberId} className="flex items-center justify-between p-2 rounded-md bg-background border">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-sm font-medium">{member.name.charAt(0)}</span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">{member.name}</div>
                                    <div className="text-xs text-muted-foreground">@{member.username}</div>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setGroupMembers(groupMembers.filter(id => id !== memberId))}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Category Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="focus-ring">
                        <SelectValue placeholder="Select a category for your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="health-fitness">Health & Fitness</SelectItem>
                        <SelectItem value="career">Career & Business</SelectItem>
                        <SelectItem value="learning">Learning & Education</SelectItem>
                        <SelectItem value="personal">Personal Growth</SelectItem>
                        <SelectItem value="relationships">Relationships</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="creative">Creative Arts</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="wellness">Wellness</SelectItem>
                        <SelectItem value="productivity">Productivity</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
                              One specific task to complete (e.g., &ldquo;Run 5K&rdquo;)
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
                              Daily checklist with multiple tasks (e.g., &ldquo;Morning Routine&rdquo;)
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
                              Repeats on a schedule (e.g., &ldquo;Workout 3x per week&rdquo;)
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
                          <div key={index} className="space-y-2">
                            <div className="flex gap-2">
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

                            {/* Member Assignment for Multi-Activity (only for group goals) */}
                            {goalNature === 'group' && groupMembers.length > 0 && (
                              <div className="ml-2 p-2 rounded-md bg-background/50 border">
                                <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                                  Assign to Members:
                                </Label>
                                <div className="flex flex-wrap gap-1">
                                  <Button
                                    type="button"
                                    variant={activityAssignments[index]?.includes("all") ? "default" : "outline"}
                                    size="sm"
                                    className="text-xs h-6"
                                    onClick={() => {
                                      const current = activityAssignments[index] || []
                                      if (current.includes("all")) {
                                        setActivityAssignments({
                                          ...activityAssignments,
                                          [index]: current.filter(id => id !== "all")
                                        })
                                      } else {
                                      setActivityAssignments({
                                        ...activityAssignments,
                                        [index]: ["all", ...groupMembers]
                                      })
                                      }
                                    }}
                                  >
                                    All Members
                                  </Button>
                                  {groupMembers.map((memberId) => {
                                    const member = availablePartners.find(p => p.id === memberId)
                                    const isAssigned = activityAssignments[index]?.includes(memberId)

                                    return (
                                      <Button
                                        key={memberId}
                                        type="button"
                                        variant={isAssigned ? "default" : "outline"}
                                        size="sm"
                                        className="text-xs h-6"
                                        onClick={() => {
                                          const current = activityAssignments[index] || []
                                          if (current.includes(memberId)) {
                                            setActivityAssignments({
                                              ...activityAssignments,
                                              [index]: current.filter(id => id !== memberId)
                                            })
                                          } else {
                                            setActivityAssignments({
                                              ...activityAssignments,
                                              [index]: [...current.filter(id => id !== "all"), memberId]
                                            })
                                          }
                                        }}
                                      >
                                        {member?.name.split(" ")[0]}
                                      </Button>
                                    )
                                  })}
                                </div>
                              </div>
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

                  {/* Accountability Partners (only for personal goals) */}
                  {goalNature === 'personal' && (
                    <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                      <div>
                        <Label className="text-sm font-medium">Accountability Partners</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Optional: Select friends who will help keep you accountable
                        </p>
                      </div>

                      {/* Partners Dropdown */}
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (!selectedPartners.includes(value)) {
                            setSelectedPartners([...selectedPartners, value])
                          }
                        }}
                      >
                        <SelectTrigger className="focus-ring">
                          <SelectValue placeholder="Add an accountability partner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePartners
                            .filter(p => !selectedPartners.includes(p.id))
                            .map(partner => (
                              <SelectItem key={partner.id} value={partner.id}>
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-xs font-medium">{partner.name.charAt(0)}</span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">{partner.name}</div>
                                    <div className="text-xs text-muted-foreground">@{partner.username}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>

                      {selectedPartners.length > 0 && (
                        <div className="space-y-2">
                          {selectedPartners.map(partnerId => {
                            const partner = availablePartners.find(p => p.id === partnerId)
                            if (!partner) return null
                            return (
                              <div key={partnerId} className="flex items-center justify-between p-2 rounded-md bg-background border">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-xs font-medium">{partner.name.charAt(0)}</span>
                                  </div>
                                  <div className="text-sm font-medium">{partner.name}</div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => setSelectedPartners(selectedPartners.filter(id => id !== partnerId))}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

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
                    <Link href="/goals" className="flex-1">
                      <Button type="button" variant="outline" className="w-full hover-lift">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" className="flex-1 hover-lift" disabled={loading || !title.trim()}>
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Create Goal
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Sidebar - Templates & Tips */}
          <div className="space-y-6">
            {/* Goal Templates */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Goal Templates
                </CardTitle>
                <CardDescription>
                  Get inspired with these popular goal ideas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {goalTemplates.map((template, index) => {
                  const Icon = template.icon
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-auto p-3 hover-lift"
                      onClick={() => {
                        setTitle(template.title)
                        setDescription(template.description)
                        setGoalType(template.type as 'single-activity' | 'multi-activity' | 'recurring')
                      }}
                    >
                      <div className="flex items-start gap-3 text-left">
                        <div className={`p-2 rounded-lg bg-muted ${template.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{template.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {template.description}
                          </div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="text-lg">💡 Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Start with specific, measurable goals
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Break large goals into smaller milestones
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Share with partners for accountability
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Track progress and celebrate wins
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Indicator */}
            <Card className="hover-lift">
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <div className="text-sm font-medium">Goal Creation Progress</div>
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 text-sm ${title ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {title ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2 border-current" />}
                      Goal Title
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${goalType ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {goalType ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2 border-current" />}
                      Goal Type
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${category ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {category ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2 border-current" />}
                      Category
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${visibility ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {visibility ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2 border-current" />}
                      Visibility
                    </div>
                  </div>
                  <Progress value={
                    title && goalType && category && visibility ? 100 :
                    (title && goalType && category ? 75 :
                    (title && goalType ? 50 :
                    (title ? 25 : 0)))
                  } className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
