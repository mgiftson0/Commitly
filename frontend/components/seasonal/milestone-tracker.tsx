"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Target } from 'lucide-react'
import { seasonalGoalsApi, SeasonalMilestone } from '@/lib/seasonal-goals-api'

interface MilestoneTrackerProps {
  goalId: string
}

export function MilestoneTracker({ goalId }: MilestoneTrackerProps) {
  const [milestones, setMilestones] = useState<SeasonalMilestone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMilestones()
  }, [goalId])

  const loadMilestones = async () => {
    try {
      const data = await seasonalGoalsApi.getMilestones(goalId)
      setMilestones(data)
    } catch (error) {
      console.error('Failed to load milestones:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleMilestone = async (milestone: SeasonalMilestone) => {
    try {
      const updates = {
        is_completed: !milestone.is_completed,
        completed_at: !milestone.is_completed ? new Date().toISOString() : null
      }
      
      await seasonalGoalsApi.updateMilestone(milestone.id, updates)
      setMilestones(prev => prev.map(m => m.id === milestone.id ? { ...m, ...updates } : m))
    } catch (error) {
      console.error('Failed to update milestone:', error)
    }
  }

  const completedCount = milestones.filter(m => m.is_completed).length
  const progressPercentage = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0

  if (loading) return <div className="animate-pulse h-32 bg-gray-200 rounded"></div>

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Milestones
          </div>
          <Badge variant="outline">{completedCount}/{milestones.length}</Badge>
        </CardTitle>
        <Progress value={progressPercentage} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {milestones.map((milestone) => (
          <div key={milestone.id} className="flex items-center gap-3 p-3 rounded-lg border">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto"
              onClick={() => toggleMilestone(milestone)}
            >
              {milestone.is_completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
            </Button>
            <div className="flex-1">
              <p className={milestone.is_completed ? 'line-through text-gray-500' : ''}>
                {milestone.title}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}