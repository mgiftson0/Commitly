"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Target } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { supabase, authHelpers } from "@/lib/supabase-client"
import { toast } from "sonner"

interface Goal {
  id: string
  title: string
  description: string
  category: string
  visibility: string
  target_date: string
}

export default function EditGoalPage() {
  const params = useParams()
  const router = useRouter()
  const goalId = params.id as string
  
  const [goal, setGoal] = useState<Goal | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [visibility, setVisibility] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
          .maybeSingle()

        if (error || !goalData) {
          toast.error('Goal not found or access denied')
          router.push('/goals')
          return
        }

        setGoal(goalData)
        setTitle(goalData.title)
        setDescription(goalData.description || '')
        setCategory(goalData.category || '')
        setVisibility(goalData.visibility || 'private')
        setTargetDate(goalData.target_date ? goalData.target_date.split('T')[0] : '')
      } catch (error) {
        console.error('Error loading goal:', error)
        toast.error('Failed to load goal')
      } finally {
        setLoading(false)
      }
    }

    if (goalId) {
      loadGoal()
    }
  }, [goalId, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('goals')
        .update({
          title: title.trim(),
          description: description.trim(),
          category: category.replace('-', '_'),
          visibility,
          target_date: targetDate || null
        })
        .eq('id', goalId)

      if (error) throw error

      toast.success('Goal updated successfully!')
      router.push(`/goals/${goalId}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update goal')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <Target className="h-12 w-12 text-primary animate-pulse" />
        </div>
      </MainLayout>
    )
  }

  if (!goal) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Goal not found</h1>
          <Button onClick={() => router.push('/goals')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Goal</h1>
        </div>

        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle>Goal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter goal title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your goal"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health-fitness">Health & Fitness</SelectItem>
                    <SelectItem value="career">Career & Business</SelectItem>
                    <SelectItem value="learning">Learning & Education</SelectItem>
                    <SelectItem value="personal">Personal Growth</SelectItem>
                    <SelectItem value="relationships">Relationships</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="creative">Creative Arts</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="restricted">Partners Only</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || !title.trim()} className="flex-1">
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  )
}