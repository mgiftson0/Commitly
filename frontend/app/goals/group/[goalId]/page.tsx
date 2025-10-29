"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Users, Crown, Edit, Trash2, Target, Calendar } from 'lucide-react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import { GroupGoalDetails } from '@/components/goals/group-goal-details'
import { authHelpers, supabase } from '@/lib/supabase-client'
import { toast } from 'sonner'

export default function GroupGoalViewPage() {
  const params = useParams()
  const router = useRouter()
  const goalId = params.goalId as string
  
  const [goal, setGoal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUserId, setCurrentUserId] = useState('')

  useEffect(() => {
    loadGoal()
  }, [goalId])

  const loadGoal = async () => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      setCurrentUserId(user.id)

      const { data: goalData, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .single()

      if (error || !goalData) {
        toast.error('Goal not found')
        router.push('/goals')
        return
      }

      setGoal(goalData)

      // Check if user is admin
      const isOwner = goalData.user_id === user.id
      let adminStatus = isOwner

      if (goalData.is_group_goal && !isOwner) {
        const { data: membership } = await supabase
          .from('group_goal_members')
          .select('role')
          .eq('goal_id', goalId)
          .eq('user_id', user.id)
          .single()

        adminStatus = membership?.role === 'admin' || membership?.role === 'creator'
      }

      setIsAdmin(adminStatus)
    } catch (error) {
      console.error('Error loading goal:', error)
      toast.error('Failed to load goal')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this group goal? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/group-goals/${goalId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete goal')
      }

      toast.success('Group goal deleted successfully')
      router.push('/goals')
    } catch (error: any) {
      console.error('Error deleting goal:', error)
      toast.error(error.message || 'Failed to delete goal')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    )
  }

  if (!goal) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Goal not found</h1>
          <Link href="/goals">
            <Button>Back to Goals</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const isSeasonalGoal = goal.is_seasonal || goal.duration_type === 'seasonal'

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 p-4 border-b bg-card/50 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-purple-600" />
              <h1 className="text-xl font-bold">Group Goal</h1>
              {isSeasonalGoal && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Seasonal
                </Badge>
              )}
              {isAdmin && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Crown className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Link href={`/goals/group/${goalId}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <Card className="ring-1 ring-pink-200/50 bg-gradient-to-br from-pink-50/60 via-white to-pink-50/30">
          <CardHeader>
            <CardTitle className="text-2xl mb-2">{goal.title}</CardTitle>
            {goal.description && (
              <p className="text-muted-foreground mb-4">{goal.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{goal.goal_type}</Badge>
              <Badge variant="outline">{goal.category?.replace('_', ' ') || 'Personal'}</Badge>
              <Badge variant="outline" className="capitalize">{goal.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-bold">{goal.progress || 0}%</span>
                </div>
                <Progress 
                  value={goal.progress || 0} 
                  className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-pink-500 [&>div]:to-purple-500" 
                />
              </div>
              
              {goal.target_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {new Date(goal.target_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <GroupGoalDetails 
          goalId={goalId} 
          isAdmin={isAdmin} 
          currentUserId={currentUserId} 
        />
      </div>
    </MainLayout>
  )
}