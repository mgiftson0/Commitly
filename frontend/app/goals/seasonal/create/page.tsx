"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, Target, Star, Clock, Users, ArrowLeft, Lightbulb, Plus, X, Lock, Globe, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"
import { supabase, authHelpers } from "@/lib/supabase-client"
import { ActivityAssignment } from "@/components/goals/activity-assignment"

const SEASONAL_TEMPLATES = {
  annual: [
    {
      title: "Master a New Language",
      description: "Achieve conversational fluency in a new language through daily practice",
      category: "learning",
      milestones: ["Complete beginner course", "Hold 5-minute conversation", "Read a book", "Watch movie without subtitles"]
    },
    {
      title: "Transform Physical Health",
      description: "Complete fitness transformation with strength, cardio, and nutrition",
      category: "health-fitness",
      milestones: ["Establish workout routine", "Reach target weight", "Complete fitness challenge", "Maintain for 3 months"]
    },
    {
      title: "Build Professional Skills",
      description: "Develop expertise in your field through courses, projects, and networking",
      category: "career",
      milestones: ["Complete certification", "Lead major project", "Expand network", "Get promotion/new role"]
    }
  ],
  quarterly: [
    {
      title: "Launch Side Project",
      description: "Build and launch a meaningful side project from concept to completion",
      category: "career",
      milestones: ["Define project scope", "Build MVP", "Get first users", "Launch publicly"]
    },
    {
      title: "Fitness Challenge",
      description: "Complete a focused 90-day fitness transformation",
      category: "health-fitness",
      milestones: ["Week 1-2: Foundation", "Week 3-6: Building", "Week 7-10: Intensity", "Week 11-12: Peak"]
    }
  ],
  biannual: [
    {
      title: "Creative Mastery",
      description: "Develop advanced skills in a creative discipline over 6 months",
      category: "creative",
      milestones: ["Learn fundamentals", "Complete first project", "Advanced techniques", "Portfolio showcase"]
    }
  ]
}

export default function CreateSeasonalGoalPage() {
  const [durationType, setDurationType] = useState<"annual" | "quarterly" | "biannual">("annual")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [seasonalYear, setSeasonalYear] = useState(2026)
  const [seasonalQuarter, setSeasonalQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3))
  const [milestones, setMilestones] = useState<string[]>([""])
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [joinCohort, setJoinCohort] = useState(false)
  const [loading, setLoading] = useState(false)
  const [goalNature, setGoalNature] = useState<"personal" | "group">("personal")
  const [visibility, setVisibility] = useState<"public" | "private" | "restricted">("public")
  const [selectedPartners, setSelectedPartners] = useState<string[]>([])
  const [groupMembers, setGroupMembers] = useState<string[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [availablePartners, setAvailablePartners] = useState<any[]>([])
  const [activityAssignments, setActivityAssignments] = useState<{[key: number]: string}>({})

  const router = useRouter()

  // Load user data
  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await authHelpers.getCurrentUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        setCurrentUser({
          id: user.id,
          name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'You' : 'You',
          username: profile?.username || 'you'
        })

        const { data: partners } = await supabase
          .from('accountability_partners')
          .select(`
            *,
            partner_profile:profiles!accountability_partners_partner_id_fkey(*),
            user_profile:profiles!accountability_partners_user_id_fkey(*)
          `)
          .or(`user_id.eq.${user.id},partner_id.eq.${user.id}`)
          .eq('status', 'accepted')

        const partnersList = (partners || []).map(p => {
          const isUserInitiator = p.user_id === user.id
          const partnerProfile = isUserInitiator ? p.partner_profile : p.user_profile
          return {
            id: isUserInitiator ? p.partner_id : p.user_id,
            name: partnerProfile ? `${partnerProfile.first_name || ''} ${partnerProfile.last_name || ''}`.trim() || 'Partner' : 'Partner',
            username: partnerProfile?.username || 'partner'
          }
        })

        setAvailablePartners(partnersList)
      } catch (error) {
        console.error('Error loading data:', error)
        router.push('/auth/login')
      }
    }

    loadData()
  }, [router])

  // Group members management
  useEffect(() => {
    if (goalNature === "group" && currentUser) {
      setGroupMembers((prev) => {
        if (prev.includes(currentUser.id)) return prev
        return [currentUser.id, ...prev].slice(0, 2)
      })
    } else {
      setGroupMembers([])
    }
  }, [goalNature, currentUser])

  const allGroupCandidates = useMemo(
    () => currentUser ? [currentUser, ...availablePartners] : [],
    [currentUser, availablePartners]
  )

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
  }

  const applyTemplate = (template: any) => {
    setTitle(template.title)
    setDescription(template.description)
    setCategory(template.category)
    setMilestones(template.milestones || [""])
    setSelectedTemplate(template)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        toast.error('Please log in to create goals')
        return
      }

      // Create seasonal goal
      const goalData = {
        user_id: user.id,
        title,
        description,
        goal_type: 'multi-activity',
        duration_type: durationType,
        seasonal_year: seasonalYear,
        seasonal_quarter: durationType === 'quarterly' ? seasonalQuarter : null,
        start_date: new Date().toISOString().split('T')[0],
        category: category.replace('-', '_'),
        status: 'active',
        progress: 0,
        visibility,
        priority: 'high',
        is_seasonal: true,
        target_date: durationType === 'annual' 
          ? `${seasonalYear}-12-31` 
          : durationType === 'quarterly'
            ? `${seasonalYear}-${seasonalQuarter * 3}-${new Date(seasonalYear, seasonalQuarter * 3, 0).getDate()}`
            : durationType === 'biannual'
              ? `${seasonalYear}-06-30`
              : null
      }

      let newGoal;
      
      // Handle group goals differently
      if (goalNature === "group" && groupMembers.length > 1) {
        // Use group goals API
        const memberIds = groupMembers.filter(id => id !== user.id); // Exclude owner
        
        if (memberIds.length === 0) {
          toast.error('Please add at least one member to create a group goal')
          return
        }
        
        const response = await fetch('/api/group-goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            goalData: {
              ...goalData,
              is_group_goal: true,
              group_goal_status: 'pending'
            },
            memberIds
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          console.error('Group goal creation error:', result.error)
          toast.error(result.error || 'Failed to create group goal')
          return
        }
        
        newGoal = result.goal;
        toast.success(`Seasonal group goal created! Invitations sent to ${memberIds.length} members.`);
      } else {
        // Create regular seasonal goal
        const { data: goal, error } = await supabase
          .from('goals')
          .insert([goalData])
          .select()
          .single()

        if (error) throw error
        
        newGoal = goal;
      }

      // Create milestones as goal activities
      if (milestones.filter(m => m.trim()).length > 0) {
        const milestoneData = milestones
          .filter(m => m.trim())
          .map((milestone, index) => ({
            goal_id: newGoal.id,
            title: milestone.trim(),
            completed: false,
            order_index: index,
            assigned_to: goalNature === "group" && activityAssignments[index] ? activityAssignments[index] : null,
            assigned_to_all: goalNature === "group" && !activityAssignments[index] ? true : false
          }))

        const { error: milestonesError } = await supabase
          .from('goal_activities')
          .insert(milestoneData)
        
        if (milestonesError) {
          console.error('Error creating milestones:', milestonesError)
          toast.error('Goal created but failed to add milestones')
        }
      }

      // Send accountability partner requests for personal goals
      if (goalNature === "personal" && selectedPartners.length > 0) {
        try {
          const partnerRequests = selectedPartners.map(partnerId => ({
            requester_id: user.id,
            partner_id: partnerId,
            goal_id: newGoal.id,
            status: 'pending',
            message: `Help me with my seasonal goal: ${title}`
          }))

          const { error: partnerError } = await supabase
            .from('accountability_partners')
            .insert(partnerRequests)

          if (partnerError) {
            console.error('Error creating partner requests:', partnerError)
          } else {
            // Create notifications for each partner
            const partnerNotifications = selectedPartners.map(partnerId => ({
              user_id: partnerId,
              type: 'accountability_request',
              title: 'New Accountability Partner Request 🤝',
              message: `${currentUser?.name || 'Someone'} invited you as an accountability partner for: "${title}"`,
              data: {
                goal_id: newGoal.id,
                requester_id: user.id,
                goal_title: title,
                goal_type: 'seasonal'
              },
              read: false
            }))

            await supabase.from('notifications').insert(partnerNotifications)
            toast.success(`Accountability partner requests sent to ${selectedPartners.length} partner${selectedPartners.length > 1 ? 's' : ''}`)
          }
        } catch (partnerError) {
          console.error('Failed to send partner requests:', partnerError)
        }
      }

      // Create notification
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Seasonal Goal Created! 🌟',
          message: `You created a new seasonal goal: ${title}`,
          type: 'seasonal_goal_created',
          read: false,
          data: { goal_id: newGoal.id, duration_type: durationType }
        })
    } catch (notifError) {
      console.error('Failed to create notification:', notifError)
    }

    // Check for seasonal goal achievements
    try {
      const { data: seasonalGoalCount } = await supabase
        .from('goals')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_seasonal', true)
      
      if (seasonalGoalCount === 1) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_type: 'first_seasonal_goal',
            unlocked_at: new Date().toISOString(),
            data: { goal_id: newGoal.id, duration_type: durationType }
          })
      }
      
      if (durationType === 'annual' && seasonalGoalCount >= 3) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_type: 'annual_planner',
            unlocked_at: new Date().toISOString(),
            data: { seasonal_goal_count: seasonalGoalCount }
          })
      }
    } catch (achievementError) {
      console.error('Failed to check seasonal achievements:', achievementError)
    }

      toast.success('Seasonal goal created successfully!')
      window.dispatchEvent(new CustomEvent('goalCreated', { detail: { goalId: newGoal.id } }))
      router.push('/goals')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create seasonal goal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
              Create Seasonal Goal
            </h1>
            <p className="text-xs text-muted-foreground">
              Long-term transformation goals
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/goals">
              <Button variant="outline" size="sm" className="hover-lift h-7 text-xs px-2">
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="rounded-xl border border-border bg-card overflow-hidden min-h-[500px] md:min-h-[600px]">
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="flex items-center gap-2 text-xs">
                    <Target className="h-3 w-3 text-primary" />
                    Goal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4 overflow-y-auto max-h-[calc(100vh-300px)] md:max-h-none">
                  {/* Duration Type */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Duration</Label>
                    <RadioGroup value={durationType} onValueChange={(v: any) => setDurationType(v)}>
                      <div className="grid gap-1 sm:grid-cols-3">
                        <div className={`flex items-center space-x-2 p-2 rounded border transition-all cursor-pointer hover:bg-accent/30 ${
                          durationType === 'annual' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}>
                          <RadioGroupItem value="annual" id="annual" />
                          <div className="flex-1">
                            <Label htmlFor="annual" className="font-medium cursor-pointer text-xs">
                              Annual
                            </Label>
                            <p className="text-xs text-muted-foreground">12m</p>
                          </div>
                          <Calendar className="h-3 w-3 text-blue-500" />
                        </div>
                        <div className={`flex items-center space-x-2 p-2 rounded border transition-all cursor-pointer hover:bg-accent/30 ${
                          durationType === 'quarterly' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}>
                          <RadioGroupItem value="quarterly" id="quarterly" />
                          <div className="flex-1">
                            <Label htmlFor="quarterly" className="font-medium cursor-pointer text-xs">
                              Quarterly
                            </Label>
                            <p className="text-xs text-muted-foreground">3m</p>
                          </div>
                          <Target className="h-3 w-3 text-green-500" />
                        </div>
                        <div className={`flex items-center space-x-2 p-2 rounded border transition-all cursor-pointer hover:bg-accent/30 ${
                          durationType === 'biannual' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}>
                          <RadioGroupItem value="biannual" id="biannual" />
                          <div className="flex-1">
                            <Label htmlFor="biannual" className="font-medium cursor-pointer text-xs">
                              Bi-Annual
                            </Label>
                            <p className="text-xs text-muted-foreground">6m</p>
                          </div>
                          <Star className="h-3 w-3 text-purple-500" />
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Seasonal Settings */}
                  <div className="grid gap-1 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Year</Label>
                      <Select value={seasonalYear.toString()} onValueChange={(v) => setSeasonalYear(parseInt(v))}>
                        <SelectTrigger className="h-7 text-xs focus-ring">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 5}, (_, i) => {
                            const year = 2026 + i
                            return <SelectItem key={year} value={year.toString()} className="text-xs">{year}</SelectItem>
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    {durationType === 'quarterly' && (
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Quarter</Label>
                        <Select value={seasonalQuarter.toString()} onValueChange={(v) => setSeasonalQuarter(parseInt(v))}>
                          <SelectTrigger className="h-7 text-xs focus-ring">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1" className="text-xs">Q1</SelectItem>
                            <SelectItem value="2" className="text-xs">Q2</SelectItem>
                            <SelectItem value="3" className="text-xs">Q3</SelectItem>
                            <SelectItem value="4" className="text-xs">Q4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <Label htmlFor="title" className="text-xs font-medium">
                      Goal Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Master Spanish Language"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-7 text-xs focus-ring"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <Label htmlFor="description" className="text-xs font-medium">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your seasonal commitment..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="text-xs focus-ring resize-none"
                      required
                    />
                  </div>

                  {/* Goal Nature */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">
                      Type <span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup
                      value={goalNature}
                      onValueChange={(value: string) => setGoalNature(value as "personal" | "group")}
                    >
                      <div className="grid gap-1 sm:grid-cols-2">
                        <div className={`flex items-center space-x-2 p-2 rounded border transition-all cursor-pointer hover:bg-accent/30 ${
                          goalNature === "personal" ? "border-primary bg-primary/5" : "border-border"
                        }`}>
                          <RadioGroupItem value="personal" id="personal" />
                          <div className="flex-1">
                            <Label htmlFor="personal" className="font-medium cursor-pointer text-xs">
                              Personal
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Just you
                            </p>
                          </div>
                          <Target className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className={`flex items-center space-x-2 p-2 rounded border transition-all cursor-pointer hover:bg-accent/30 ${
                          goalNature === "group" ? "border-primary bg-primary/5" : "border-border"
                        }`}>
                          <RadioGroupItem value="group" id="group" />
                          <div className="flex-1">
                            <Label htmlFor="group" className="font-medium cursor-pointer text-xs">
                              Group
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Up to 2 people
                            </p>
                          </div>
                          <Users className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Group Members */}
                  {goalNature === "group" && (
                    <div className="space-y-2 p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-xs font-medium">Members</Label>
                          <p className="text-xs text-muted-foreground">Add 1 more (max 2)</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{groupMembers.length}/2</Badge>
                      </div>
                      <Select value="" onValueChange={(value) => {
                        if (!groupMembers.includes(value) && groupMembers.length < 2) {
                          setGroupMembers([...groupMembers, value])
                        }
                      }}>
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue placeholder="Add member..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allGroupCandidates.filter((p) => p.id !== currentUser?.id).filter((p) => !groupMembers.includes(p.id)).map((partner) => (
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
                          ))}
                        </SelectContent>
                      </Select>
                      {groupMembers.length > 0 && (
                        <div className="space-y-2">
                          {groupMembers.map((memberId) => {
                            const member = allGroupCandidates.find((p) => p.id === memberId)
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
                                {memberId !== currentUser?.id && (
                                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setGroupMembers(groupMembers.filter((id) => id !== memberId))}>
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

                  {/* Category */}
                  <div className="space-y-2">
                    <Label>Category <span className="text-destructive">*</span></Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="health-fitness">Health & Fitness</SelectItem>
                        <SelectItem value="career">Career</SelectItem>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="wellness">Wellness</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Milestones */}
                  <div className="space-y-2 p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Milestones <span className="text-destructive">*</span></Label>
                      <Button type="button" variant="outline" size="sm" className="h-6 text-xs px-2" onClick={addMilestone}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {milestones.map((milestone, index) => (
                        <div key={index} className="space-y-2 p-3 rounded-lg border bg-card">
                          <div className="flex gap-2">
                            <Input
                              placeholder={`Milestone ${index + 1}`}
                              value={milestone}
                              onChange={(e) => updateMilestone(index, e.target.value)}
                              className="h-7 text-xs"
                              required
                            />
                            {milestones.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => removeMilestone(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>

                          {/* Activity Assignment for Group Goals */}
                          {goalNature === "group" && groupMembers.length > 1 && (
                            <ActivityAssignment
                              activityIndex={index}
                              groupMembers={allGroupCandidates.filter(m => groupMembers.includes(m.id)).map(m => ({ ...m, status: 'accepted' as const }))}
                              assignment={activityAssignments[index] || null}
                              assignedToAll={!activityAssignments[index]}
                              onAssignmentChange={(idx, assignment, assignedToAll) => {
                                const newAssignments = { ...activityAssignments };
                                if (assignedToAll) {
                                  delete newAssignments[idx];
                                } else {
                                  newAssignments[idx] = assignment;
                                }
                                setActivityAssignments(newAssignments);
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accountability Partners (only for personal goals) */}
                  {goalNature === "personal" && (
                    <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                      <div>
                        <Label className="text-sm font-medium">Accountability Partners</Label>
                        <p className="text-xs text-muted-foreground mt-1">Optional: Select partners to help keep you accountable</p>
                      </div>
                      <Select value="" onValueChange={(value) => {
                        if (selectedPartners.length >= 2) {
                          toast.error("You can select up to 2 partners")
                          return
                        }
                        if (!selectedPartners.includes(value)) {
                          setSelectedPartners([...selectedPartners, value])
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Add an accountability partner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePartners.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm mb-2">No accountability partners available</p>
                              <p className="text-xs">You can add partners later from your Partners page.</p>
                            </div>
                          ) : (
                            availablePartners.filter((p) => !selectedPartners.includes(p.id)).map((partner) => (
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
                          )}
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-muted-foreground">Selected {selectedPartners.length}/2</div>
                      {selectedPartners.length > 0 && (
                        <div className="space-y-2">
                          {selectedPartners.map((partnerId) => {
                            const partner = availablePartners.find((p) => p.id === partnerId)
                            if (!partner) return null
                            return (
                              <div key={partnerId} className="flex items-center justify-between p-2 rounded-md bg-background border">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-xs font-medium">{partner.name.charAt(0)}</span>
                                  </div>
                                  <div className="text-sm font-medium">{partner.name}</div>
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedPartners(selectedPartners.filter((id) => id !== partnerId))}>
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
                    <Select value={visibility} onValueChange={(value: string) => setVisibility(value as "private" | "restricted" | "public")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <Lock className="h-3 w-3" />
                            <span className="text-xs">Private</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="restricted">
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span className="text-xs">Partners</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="h-3 w-3" />
                            <span className="text-xs">Public</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-2 pt-2">
                    <Link href="/goals" className="flex-1">
                      <Button type="button" variant="outline" className="w-full h-7 text-xs hover-lift">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" className="flex-1 h-7 text-xs hover-lift" disabled={loading || !title.trim() || !description.trim() || !category || milestones.filter(m => m.trim()).length === 0}>
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Star className="h-3 w-3" />
                          Create Goal
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Templates Sidebar */}
          <div className="space-y-2">
            <Card className="hover-lift">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs">
                  <Lightbulb className="h-3 w-3 text-yellow-500" />
                  Templates
                </CardTitle>
                <CardDescription className="text-xs">
                  {durationType} ideas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {SEASONAL_TEMPLATES[durationType].map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-2 text-left"
                    onClick={() => applyTemplate(template)}
                  >
                    <div>
                      <div className="font-medium text-xs">
                        {template.title}
                      </div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {template.category.replace('-', ' ')}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}