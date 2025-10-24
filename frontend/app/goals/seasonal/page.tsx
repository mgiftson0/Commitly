"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Trophy, Users, Target, Flame, Clock, Star } from "lucide-react"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { supabase, authHelpers } from "@/lib/supabase-client"
import { seasonalGoalsApi } from "@/lib/seasonal-goals-api"
import { MilestoneTracker } from "@/components/seasonal/milestone-tracker"

export default function SeasonalGoalsPage() {
  const [seasonalGoals, setSeasonalGoals] = useState<any[]>([])
  const [cohorts, setCohorts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("annual")

  useEffect(() => {
    loadSeasonalData()
  }, [])

  const loadSeasonalData = async () => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) return

      // Load seasonal goals
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .in('duration_type', ['annual', 'quarterly', 'biannual'])
        .order('created_at', { ascending: false })

      setSeasonalGoals(goals || [])
    } catch (error) {
      console.error('Error loading seasonal data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterGoalsByType = (type: string) => {
    return seasonalGoals.filter(goal => goal.duration_type === type)
  }

  const getSeasonalBadge = (goal: any) => {
    if (goal.duration_type === 'annual') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700">Annual {goal.seasonal_year}</Badge>
    }
    if (goal.duration_type === 'quarterly') {
      return <Badge variant="outline" className="bg-green-50 text-green-700">Q{goal.seasonal_quarter} {goal.seasonal_year}</Badge>
    }
    if (goal.duration_type === 'biannual') {
      return <Badge variant="outline" className="bg-purple-50 text-purple-700">H{goal.seasonal_quarter <= 2 ? '1' : '2'} {goal.seasonal_year}</Badge>
    }
    return null
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Seasonal Goals</h1>
            <p className="text-muted-foreground">
              Long-term commitments for meaningful transformation
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/goals/seasonal/create">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Calendar className="h-4 w-4 mr-2" />
                Create Seasonal Goal
              </Button>
            </Link>
            <Link href="/goals">
              <Button variant="outline">View All Goals</Button>
            </Link>
          </div>
        </div>

        {/* Seasonal Creation Window Notice */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <h3 className="font-medium text-amber-900 dark:text-amber-100">
                  Seasonal Goal Creation Window
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Create seasonal goals between December 15th - January 15th for maximum impact and community participation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different seasonal types */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="annual">Annual</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
            <TabsTrigger value="biannual">Bi-Annual</TabsTrigger>
          </TabsList>

          <TabsContent value="annual" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filterGoalsByType('annual').map((goal) => (
                <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        {getSeasonalBadge(goal)}
                      </div>
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{goal.progress || 0}%</span>
                      </div>
                      <Progress value={goal.progress || 0} className="h-2" />
                      {goal.streak > 0 && (
                        <div className="flex items-center gap-2 text-sm text-orange-600">
                          <Flame className="h-4 w-4" />
                          <span>{goal.streak} day streak</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filterGoalsByType('annual').length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Annual Goals</h3>
                  <p className="text-muted-foreground mb-4">Create your first annual goal for long-term success</p>
                  <Link href="/goals/create">
                    <Button>Create Annual Goal</Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="quarterly" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filterGoalsByType('quarterly').map((goal) => (
                <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        {getSeasonalBadge(goal)}
                      </div>
                      <Target className="h-5 w-5 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{goal.progress || 0}%</span>
                      </div>
                      <Progress value={goal.progress || 0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filterGoalsByType('quarterly').length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Quarterly Goals</h3>
                  <p className="text-muted-foreground mb-4">Set focused 3-month objectives</p>
                  <Link href="/goals/create">
                    <Button>Create Quarterly Goal</Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="biannual" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filterGoalsByType('biannual').map((goal) => (
                <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        {getSeasonalBadge(goal)}
                      </div>
                      <Star className="h-5 w-5 text-purple-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{goal.progress || 0}%</span>
                      </div>
                      <Progress value={goal.progress || 0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filterGoalsByType('biannual').length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Bi-Annual Goals</h3>
                  <p className="text-muted-foreground mb-4">Plan for 6-month transformations</p>
                  <Link href="/goals/create">
                    <Button>Create Bi-Annual Goal</Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}