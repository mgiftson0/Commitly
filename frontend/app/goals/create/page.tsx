"use client"

import { useEffect, useMemo, useState } from "react"
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
// Frontend-only mode - no backend dependencies
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"
import { notifications } from "@/lib/notifications"

export default function CreateGoalPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [goalNature, setGoalNature] = useState<"personal" | "group">("personal")
  const [goalType, setGoalType] = useState<"single-activity" | "multi-activity">("single-activity")
  const [visibility, setVisibility] = useState<"public" | "private" | "restricted">("private")
  const [activities, setActivities] = useState<string[]>([""])
  const [recurrencePattern, setRecurrencePattern] = useState("daily")
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPartners, setSelectedPartners] = useState<string[]>([])
  const [groupMembers, setGroupMembers] = useState<string[]>([]) // includes owner by default when group
  const [activityAssignments, setActivityAssignments] = useState<{[key: number]: string[]}>({})
  // Single-activity personal specific fields
  const [singleActivity, setSingleActivity] = useState("")
  const [scheduleType, setScheduleType] = useState<'date' | 'recurring'>('date')
  const [singleDate, setSingleDate] = useState("")
  
  // Mock current user (owner)
  const currentUser = { id: "mock-user-id", name: "You", username: "you" }

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
  // Frontend-only mode

  const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

  // All candidates for group membership (owner + partners)
  const allGroupCandidates = useMemo(() => [currentUser, ...availablePartners], [])

  // Ensure owner is included when group is selected and counts toward max 5
  useEffect(() => {
    if (goalNature === 'group') {
      setGroupMembers((prev) => {
        if (prev.includes(currentUser.id)) return prev
        return [currentUser.id, ...prev].slice(0, 5)
      })
    } else {
      setGroupMembers([])
    }
  }, [goalNature])

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
      // Generate unique ID
      const goalId = Date.now().toString()
      const now = new Date().toISOString()
      
      // Prepare goal data
      const newGoal = {
        id: goalId,
        userId: 'current-user',
        title: title || 'Untitled Goal',
        description,
        type: goalType,
        visibility,
        status: 'active',
        progress: 0,
        streak: 0,
        totalCompletions: 0,
        category: category || 'Personal',
        priority: 'medium',
        createdAt: now,
        updatedAt: now,
        completedAt: null,
        scheduleType,
        recurrencePattern: scheduleType === 'recurring' ? recurrencePattern : null,
        recurrenceDays: (scheduleType === 'recurring' && recurrencePattern === 'custom') ? recurrenceDays : null,
        dueDate: singleDate || null,
        activities: goalType === 'multi-activity'
          ? activities.filter(a => a.trim()).map(a => a.trim())
          : goalType === 'single-activity' && singleActivity.trim()
            ? [singleActivity.trim()]
            : [],
        isGroupGoal: goalNature === 'group',
        groupMembers: goalNature === 'group' ? groupMembers.map(id => {
          const member = allGroupCandidates.find(p => p.id === id)
          return { 
            id, 
            name: member?.name || 'Member',
            status: id === currentUser.id ? 'accepted' : 'pending' // Owner auto-accepted, others pending
          }
        }) : [],
        accountabilityPartners: goalNature === 'personal' ? selectedPartners.map(id => {
          const partner = availablePartners.find(p => p.id === id)
          return { id, name: partner?.name || 'Partner', avatar: '/placeholder-avatar.jpg' }
        }) : []
      }
      
      // Save to localStorage
      const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]')
      existingGoals.push(newGoal)
      localStorage.setItem('goals', JSON.stringify(existingGoals))
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('goalUpdated', { detail: { goalId: newGoal.id } }))
      
      toast.success('Goal created successfully!')
      await notifications.goalCreated(title)
      router.push('/goals')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create goal')
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
                      Description <span className="text-destructive">*</span>
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
                    <Label className="text-sm font-medium">Goal Nature <span className="text-destructive">*</span></Label>
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
                              Owner included + up to 4 others (max 5)
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
                            The owner is automatically included. Add up to 4 more members (max 5 total).
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
                          {allGroupCandidates
                            .filter(p => p.id !== currentUser.id)
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
                            const member = allGroupCandidates.find(p => p.id === memberId)
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
                                {memberId !== currentUser.id && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setGroupMembers(groupMembers.filter(id => id !== memberId))}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Category Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Category <span className="text-destructive">*</span></Label>
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
                    <Label className="text-sm font-medium">Goal Type <span className="text-destructive">*</span></Label>
                    <RadioGroup value={goalType} onValueChange={(value: string) => setGoalType(value as 'single-activity' | 'multi-activity')}>
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
                              Multiple tasks to complete
                            </p>
                          </div>
                          <Target className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Activity (for any single-activity goal) */}
                  {goalType === 'single-activity' && (
                    <div className="space-y-2">
                      <Label htmlFor="singleActivity" className="text-sm font-medium">Activity <span className="text-destructive">*</span></Label>
                      <Input
                        id="singleActivity"
                        placeholder="e.g., Run 5K, Submit portfolio"
                        value={singleActivity}
                        onChange={(e) => setSingleActivity(e.target.value)}
                        className="focus-ring"
                        required
                      />
                    </div>
                  )}

                  {/* Schedule for all goal types */}
                  <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                    <Label className="text-sm font-medium">Schedule <span className="text-destructive">*</span></Label>
                    <RadioGroup value={scheduleType} onValueChange={(v: 'date' | 'recurring') => setScheduleType(v)}>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50 ${scheduleType === 'date' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                          <RadioGroupItem value="date" id="schedule-date" />
                          <div className="flex-1">
                            <Label htmlFor="schedule-date" className="font-medium cursor-pointer">Specific Date</Label>
                            <p className="text-sm text-muted-foreground">Pick the day to complete this</p>
                          </div>
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50 ${scheduleType === 'recurring' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                          <RadioGroupItem value="recurring" id="schedule-recurring" />
                          <div className="flex-1">
                            <Label htmlFor="schedule-recurring" className="font-medium cursor-pointer">Recurring</Label>
                            <p className="text-sm text-muted-foreground">Repeat on a schedule</p>
                          </div>
                          <Flame className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </RadioGroup>

                    {scheduleType === 'date' ? (
                      <div className="space-y-2">
                        <Label htmlFor="singleDate" className="text-sm font-medium">Select Date <span className="text-destructive">*</span></Label>
                        <Input 
                          id="singleDate" 
                          type="date" 
                          value={singleDate} 
                          onChange={(e) => setSingleDate(e.target.value)} 
                          className="focus-ring" 
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">Recurrence Pattern <span className="text-destructive">*</span></Label>
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
                            <Label className="text-sm">Select Days <span className="text-destructive">*</span></Label>
                            <div className="grid grid-cols-2 gap-2">
                              {weekDays.map((day) => (
                                <div key={day} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`sa-${day}`}
                                    checked={recurrenceDays.includes(day)}
                                    onCheckedChange={() => toggleRecurrenceDay(day)}
                                  />
                                  <Label htmlFor={`sa-${day}`} className="font-normal cursor-pointer capitalize text-sm">
                                    {day}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <Label htmlFor="recurringDue" className="text-sm font-medium">Due Date <span className="text-destructive">*</span></Label>
                          <Input 
                            id="recurringDue" 
                            type="date" 
                            value={singleDate} 
                            onChange={(e) => setSingleDate(e.target.value)} 
                            className="focus-ring" 
                            min={new Date().toISOString().split('T')[0]}
                            max={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                            required
                          />
                          <p className="text-xs text-muted-foreground">Maximum 2 months from today</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Activities (for multi-activity goals) */}
                  {goalType === "multi-activity" && (
                    <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Activities <span className="text-destructive">*</span></Label>
                        <Button type="button" variant="outline" size="sm" onClick={addActivity}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Activity
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Add at least 2 activities</p>
                      <div className="space-y-3">
                        {activities.map((activity, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder={`Activity ${index + 1}`}
                              value={activity}
                              onChange={(e) => updateActivity(index, e.target.value)}
                              className="focus-ring"
                              required
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





                  {/* Accountability Partners (only for personal goals) */}
                  {goalNature === 'personal' && (
                    <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                      <div>
                        <Label className="text-sm font-medium">Accountability Partners</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Optional: Select partners to help keep you accountable
                        </p>
                      </div>

                      {/* Partners Dropdown */}
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (selectedPartners.length >= 2) {
                            try { toast.error('You can select up to 2 partners') } catch {}
                            return
                          }
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

                      <div className="text-xs text-muted-foreground">Selected {selectedPartners.length}/2</div>

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
                    <Label className="text-sm font-medium">Visibility <span className="text-destructive">*</span></Label>
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
                    <Button type="submit" className="flex-1 hover-lift" disabled={loading || !title.trim() || !description.trim() || !category || !goalNature || (goalType === 'single-activity' && !singleActivity.trim()) || (goalType === 'multi-activity' && activities.filter(a => a.trim()).length < 2) || (scheduleType === 'date' && !singleDate) || (scheduleType === 'recurring' && recurrencePattern === 'custom' && recurrenceDays.length === 0)}>
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
                <CardTitle className="text-lg">?? Pro Tips</CardTitle>
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
