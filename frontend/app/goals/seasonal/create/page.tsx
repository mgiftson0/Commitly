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
  const [seasonalYear, setSeasonalYear] = useState(new Date().getFullYear())
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
        return [currentUser.id, ...prev].slice(0, 5)
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
        category: category.replace('-', '_'),
        status: 'active',
        progress: 0,
        visibility,
        priority: 'high',
        is_seasonal: true,
        target_date: null
      }

      const { data: newGoal, error } = await supabase
        .from('goals')
        .insert([goalData])
        .select()
        .single()

      if (error) throw error

      // Create milestones as goal activities
      if (milestones.filter(m => m.trim()).length > 0) {
        const milestoneData = milestones
          .filter(m => m.trim())
          .map((milestone, index) => ({
            goal_id: newGoal.id,
            title: milestone.trim(),
            completed: false,
            order_index: index
          }))

        await supabase
          .from('goal_activities')
          .insert(milestoneData)
      }

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Seasonal Goal Created!',
          message: `You created a new seasonal goal: ${title}`,
          type: 'goal_created',
          read: false,
          data: { goal_id: newGoal.id }
        })

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Seasonal Goal</h1>
            <p className="text-muted-foreground">Set ambitious long-term objectives for meaningful transformation</p>
          </div>
          <Link href="/goals/seasonal">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Goal Details</CardTitle>
                  <CardDescription>Define your seasonal commitment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Duration Type */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Duration Type</Label>
                    <RadioGroup value={durationType} onValueChange={(v: any) => setDurationType(v)}>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${durationType === 'annual' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                          <RadioGroupItem value="annual" id="annual" />
                          <div className="flex-1">
                            <Label htmlFor="annual" className="font-medium cursor-pointer">Annual</Label>
                            <p className="text-sm text-muted-foreground">12 months</p>
                          </div>
                          <Calendar className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${durationType === 'quarterly' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                          <RadioGroupItem value="quarterly" id="quarterly" />
                          <div className="flex-1">
                            <Label htmlFor="quarterly" className="font-medium cursor-pointer">Quarterly</Label>
                            <p className="text-sm text-muted-foreground">3 months</p>
                          </div>
                          <Target className="h-5 w-5 text-green-500" />
                        </div>
                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${durationType === 'biannual' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                          <RadioGroupItem value="biannual" id="biannual" />
                          <div className="flex-1">
                            <Label htmlFor="biannual" className="font-medium cursor-pointer">Bi-Annual</Label>
                            <p className="text-sm text-muted-foreground">6 months</p>
                          </div>
                          <Star className="h-5 w-5 text-purple-500" />
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Seasonal Settings */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Select value={seasonalYear.toString()} onValueChange={(v) => setSeasonalYear(parseInt(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 3}, (_, i) => {
                            const year = new Date().getFullYear() + i
                            return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    {durationType === 'quarterly' && (
                      <div className="space-y-2">
                        <Label>Quarter</Label>
                        <Select value={seasonalQuarter.toString()} onValueChange={(v) => setSeasonalQuarter(parseInt(v))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                            <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                            <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                            <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Goal Title <span className="text-destructive">*</span></Label>
                    <Input
                      id="title"
                      placeholder="e.g., Master Spanish Language, Complete Marathon Training"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your seasonal commitment and what success looks like..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  {/* Goal Nature */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">
                      Goal Nature <span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup
                      value={goalNature}
                      onValueChange={(value: string) => setGoalNature(value as "personal" | "group")}
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50 ${goalNature === "personal" ? "border-primary bg-primary/5" : "border-border"}`}>
                          <RadioGroupItem value="personal" id="personal" />
                          <div className="flex-1">
                            <Label htmlFor="personal" className="font-medium cursor-pointer">Personal Goal</Label>
                            <p className="text-sm text-muted-foreground">Just for you</p>
                          </div>
                          <Target className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent/50 ${goalNature === "group" ? "border-primary bg-primary/5" : "border-border"}`}>
                          <RadioGroupItem value="group" id="group" />
                          <div className="flex-1">
                            <Label htmlFor="group" className="font-medium cursor-pointer">Group Goal</Label>
                            <p className="text-sm text-muted-foreground">Owner + up to 4 others (max 5)</p>
                          </div>
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Group Members */}
                  {goalNature === "group" && (
                    <div className="space-y-4 p-4 rounded-lg bg-muted/30 border-2 border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Group Members</Label>
                          <p className="text-xs text-muted-foreground mt-1">Owner is automatically included. Add up to 4 more members (max 5 total).</p>
                        </div>
                        <Badge variant="outline">{groupMembers.length}/5</Badge>
                      </div>
                      <Select value="" onValueChange={(value) => {
                        if (!groupMembers.includes(value) && groupMembers.length < 5) {
                          setGroupMembers([...groupMembers, value])
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Add a member..." />
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
                        <SelectItem value="learning">Learning & Education</SelectItem>
                        <SelectItem value="career">Career & Business</SelectItem>
                        <SelectItem value="creative">Creative Arts</SelectItem>
                        <SelectItem value="personal">Personal Growth</SelectItem>
                        <SelectItem value="relationships">Relationships</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Milestones */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Key Milestones <span className="text-destructive">*</span></Label>
                      <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Milestone
                      </Button>
                    </div>
                    

                    
                    <div className="space-y-3">
                      {milestones.map((milestone, index) => (
                        <div key={index} className="space-y-2 p-3 rounded-lg border bg-card">
                          <div className="flex gap-2">
                            <Input
                              placeholder={`Milestone ${index + 1}`}
                              value={milestone}
                              onChange={(e) => updateMilestone(index, e.target.value)}
                              required
                            />
                            {milestones.length > 1 && (
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

                  {/* Submit */}
                  <div className="flex gap-3 pt-4">
                    <Link href="/goals/seasonal" className="flex-1">
                      <Button type="button" variant="outline" className="w-full">Cancel</Button>
                    </Link>
                    <Button type="submit" className="flex-1" disabled={loading || !title.trim() || !description.trim() || !category || milestones.filter(m => m.trim()).length === 0}>
                      {loading ? 'Creating...' : 'Create Seasonal Goal'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Templates Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Templates
                </CardTitle>
                <CardDescription>Popular {durationType} goal ideas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {SEASONAL_TEMPLATES[durationType].map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => applyTemplate(template)}
                  >
                    <div className="text-left">
                      <div className="font-medium text-sm">{template.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{template.description}</div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {template.category.replace('-', ' ')}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>



            <Card>
              <CardHeader>
                <CardTitle>Seasonal Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Set long-term commitments with structured milestones
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Track progress over months with clear deadlines
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Build accountability with partners or groups
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}