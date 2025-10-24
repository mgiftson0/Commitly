"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Target, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { supabase, authHelpers } from "@/lib/supabase-client"

export default function SeasonalGoalsPage() {
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadSeasonalGoals = async () => {
      try {
        const user = await authHelpers.getCurrentUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: seasonalGoals, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_seasonal', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching seasonal goals:', error)
        } else {
          setGoals(seasonalGoals || [])
        }
      } catch (error) {
        console.error('Error loading seasonal goals:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSeasonalGoals()
  }, [router])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Loading seasonal goals...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Seasonal Goals</h1>
            <p className="text-muted-foreground">Long-term commitments for meaningful transformation</p>
          </div>
          <div className="flex gap-2">
            <Link href="/goals">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                All Goals
              </Button>
            </Link>
            <Link href="/goals/seasonal/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Seasonal Goal
              </Button>
            </Link>
          </div>
        </div>

        {goals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No seasonal goals yet</p>
              <Link href="/goals/seasonal/create">
                <Button>Create your first seasonal goal</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <Card key={goal.id} className="hover-lift">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <Badge variant="outline" className="text-xs">
                        {goal.duration_type}
                      </Badge>
                    </div>
                    <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                      {goal.status}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{goal.title}</CardTitle>
                  {goal.description && (
                    <CardDescription className="line-clamp-2">
                      {goal.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{goal.progress || 0}%</span>
                    </div>
                    <Progress value={goal.progress || 0} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{goal.category?.replace('_', ' ')}</span>
                    <span>Created {new Date(goal.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/goals/${goal.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    {goal.status !== 'completed' && (
                      <Link href={`/goals/seasonal/${goal.id}/update`} className="flex-1">
                        <Button size="sm" className="w-full">
                          Update Progress
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}