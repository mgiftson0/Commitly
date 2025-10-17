"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Target, ArrowLeft, CheckCircle2, Flame } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"

export default function UpdateGoalPage() {
  const [goal, setGoal] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const goalId = params.id as string

  useEffect(() => {
    loadGoalData()
  }, [goalId])

  const loadGoalData = () => {
    try {
      const storedGoals = localStorage.getItem('goals')
      if (!storedGoals) {
        setGoal(null)
        setLoading(false)
        return
      }
      
      const goals = JSON.parse(storedGoals)
      const foundGoal = goals.find((g: any) => g.id === goalId)
      
      if (!foundGoal) {
        setGoal(null)
        setLoading(false)
        return
      }
      
      // Check if goal is completed
      if (foundGoal.completedAt || foundGoal.status === 'completed') {
        setGoal({ ...foundGoal, completedAt: foundGoal.completedAt || new Date().toISOString() })
        setLoading(false)
        return
      }
      
      setGoal(foundGoal)
      setActivities(foundGoal.activities || [])
      setLoading(false)
    } catch (error) {
      toast.error("Failed to load goal")
      setLoading(false)
    }
  }

  const toggleActivity = (activityIndex: number) => {
    const updatedActivities = activities.map((activity, index) => {
      if (index === activityIndex) {
        return { ...activity, completed: !activity.completed }
      }
      return activity
    })
    
    setActivities(updatedActivities)
    
    // Update localStorage
    const storedGoals = localStorage.getItem('goals')
    if (storedGoals) {
      const goals = JSON.parse(storedGoals)
      const updatedGoals = goals.map((g: any) => {
        if (g.id === goalId) {
          const completedCount = updatedActivities.filter(a => a.completed).length
          const progress = updatedActivities.length > 0 ? Math.round((completedCount / updatedActivities.length) * 100) : 0
          
          // Update streak for recurring goals
          let newStreak = g.streak || 0
          if (g.scheduleType === 'recurring' && completedCount === updatedActivities.length) {
            newStreak = (g.streak || 0) + 1
          }
          
          return {
            ...g,
            activities: updatedActivities,
            progress,
            streak: newStreak,
            updatedAt: new Date().toISOString(),
            completedAt: progress === 100 ? new Date().toISOString() : null
          }
        }
        return g
      })
      
      localStorage.setItem('goals', JSON.stringify(updatedGoals))
      
      // Trigger update event
      window.dispatchEvent(new CustomEvent('goalUpdated'))
      
      toast.success('Progress updated!')
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
          <p className="text-muted-foreground mb-4">Goal not found</p>
          <Link href="/goals">
            <Button>Back to Goals</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  // Check if goal is completed and redirect
  if (goal.completedAt) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-lg font-semibold mb-2">Goal Completed!</p>
          <p className="text-muted-foreground mb-4">This goal has been completed and can no longer be updated.</p>
          <Link href={`/goals/${goalId}`}>
            <Button>View Goal Details</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const completedActivities = activities.filter(a => a.completed).length
  const totalActivities = activities.length
  const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Update Goal Progress</h1>
            <p className="text-muted-foreground">Mark activities as completed to track your progress</p>
          </div>
          <Link href={`/goals/${goalId}`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Goal
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {goal.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {goal.scheduleType === 'recurring' && (
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">Current Streak: {goal.streak || 0} days</span>
              </div>
            )}
          </CardContent>
        </Card>

        {goal.type === 'multi-activity' && (
          <Card>
            <CardHeader>
              <CardTitle>Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Checkbox
                    checked={activity.completed}
                    onCheckedChange={() => toggleActivity(index)}
                  />
                  <div className="flex-1">
                    <span className={`text-sm ${activity.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {typeof activity === 'string' ? activity : activity.title || 'Activity'}
                    </span>
                  </div>
                  {activity.completed && (
                    <Badge className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Done
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {goal.type === 'single-activity' && (
          <Card>
            <CardHeader>
              <CardTitle>Mark as Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => toggleActivity(0)}
                className="w-full"
                variant={goal.completedAt ? "outline" : "default"}
              >
                {goal.completedAt ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}