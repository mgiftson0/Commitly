"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Target, Calendar, Users, Trophy, Flame } from 'lucide-react'

interface AnalyticsData {
  totalSeasonalGoals: number
  completedGoals: number
  activeStreaks: number
  avgCompletionRate: number
  topCategories: Array<{ category: string; count: number }>
  monthlyProgress: Array<{ month: string; completed: number }>
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSeasonalGoals: 0,
    completedGoals: 0,
    activeStreaks: 0,
    avgCompletionRate: 0,
    topCategories: [],
    monthlyProgress: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with real API call
    setTimeout(() => {
      setAnalytics({
        totalSeasonalGoals: 156,
        completedGoals: 89,
        activeStreaks: 23,
        avgCompletionRate: 72,
        topCategories: [
          { category: 'Health & Fitness', count: 45 },
          { category: 'Learning', count: 38 },
          { category: 'Career', count: 32 }
        ],
        monthlyProgress: [
          { month: 'Jan', completed: 12 },
          { month: 'Feb', completed: 18 },
          { month: 'Mar', completed: 15 }
        ]
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded"></div>)}
    </div>
  }

  const completionRate = analytics.totalSeasonalGoals > 0 
    ? (analytics.completedGoals / analytics.totalSeasonalGoals) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSeasonalGoals}</div>
            <p className="text-xs text-muted-foreground">Seasonal commitments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedGoals}</div>
            <p className="text-xs text-muted-foreground">
              {completionRate.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Streaks</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeStreaks}</div>
            <p className="text-xs text-muted-foreground">Consistency tracking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">Community average</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {analytics.completedGoals}/{analytics.totalSeasonalGoals}
              </span>
            </div>
            <Progress value={completionRate} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topCategories.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <span className="font-medium">{category.category}</span>
                </div>
                <span className="text-sm text-muted-foreground">{category.count} goals</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}