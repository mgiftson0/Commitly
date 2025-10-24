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
import { Badge } from "@/components/ui/badge"
import { Calendar, Target, Star, Clock, Users, ArrowLeft, Lightbulb, Plus, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"
import { supabase, authHelpers } from "@/lib/supabase-client"
import { seasonalGoalsApi } from "@/lib/seasonal-goals-api"
import { cohortsApi } from "@/lib/cohorts-api"
import { CohortBrowser } from "@/components/seasonal/cohort-browser"

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
  const router = useRouter()

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

      // Check seasonal creation window
      if (!seasonalGoalsApi.isCreationWindowOpen()) {
        toast.error('Seasonal goals can only be created between December 15th and January 15th')
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
        visibility: 'public',
        priority: 'high',
        is_seasonal: true
      }

      const { data: newGoal, error } = await supabase
        .from('goals')
        .insert([goalData])
        .select()
        .single()

      if (error) throw error

      // Create milestones
      if (milestones.filter(m => m.trim()).length > 0) {
        const milestoneData = milestones
          .filter(m => m.trim())
          .map((milestone, index) => ({
            goal_id: newGoal.id,
            title: milestone.trim(),
            order_index: index,
            target_date: null // Will be set later based on duration
          }))

        await supabase
          .from('seasonal_milestones')
          .insert(milestoneData)
      }
      
      // Join cohort if selected
      if (joinCohort && selectedCohortId) {
        try {
          await cohortsApi.joinCohort(selectedCohortId, newGoal.id)
        } catch (error) {
          console.error('Failed to join cohort:', error)
        }
      }

      toast.success('Seasonal goal created successfully!')
      router.push('/goals/seasonal')
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
                    <Label htmlFor="title">Goal Title</Label>
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
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your seasonal commitment and what success looks like..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label>Category</Label>
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
                      <Label>Key Milestones</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Milestone
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {milestones.map((milestone, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Milestone ${index + 1}`}
                            value={milestone}
                            onChange={(e) => updateMilestone(index, e.target.value)}
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
                      ))}
                    </div>
                  </div>

                  {/* Community Options */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="join-cohort"
                        checked={joinCohort}
                        onCheckedChange={(checked) => setJoinCohort(!!checked)}
                      />
                      <Label htmlFor="join-cohort">Join community cohort for accountability</Label>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-3 pt-4">
                    <Link href="/goals/seasonal" className="flex-1">
                      <Button type="button" variant="outline" className="w-full">Cancel</Button>
                    </Link>
                    <Button type="submit" className="flex-1" disabled={loading || !title || !description || !category}>
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

            {/* Cohort Browser */}
            {joinCohort && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Join Cohort
                  </CardTitle>
                  <CardDescription>Find accountability partners</CardDescription>
                </CardHeader>
                <CardContent>
                  <CohortBrowser 
                    durationType={durationType} 
                    onJoinCohort={setSelectedCohortId}
                  />
                </CardContent>
              </Card>
            )}

            {/* Creation Window Notice */}
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-900">Creation Window</span>
                </div>
                <p className="text-sm text-amber-700">
                  Seasonal goals can only be created between December 15th - January 15th for synchronized community participation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}