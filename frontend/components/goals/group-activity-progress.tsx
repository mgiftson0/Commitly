"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  CheckCircle2, 
  Circle, 
  Users, 
  User, 
  Clock, 
  MessageSquare,
  Target,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  getActivityProgress, 
  completeActivity, 
  uncompleteActivity,
  canUserEditActivity 
} from '@/lib/group-goals'
import { authHelpers } from '@/lib/supabase-client'

interface GroupActivityProgressProps {
  activityId: string
  activityTitle: string
  assignedMembers: string[]
  currentUserId: string
  onUpdate?: () => void
}

export function GroupActivityProgress({ 
  activityId, 
  activityTitle, 
  assignedMembers, 
  currentUserId,
  onUpdate 
}: GroupActivityProgressProps) {
  const [activityData, setActivityData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [notes, setNotes] = useState('')
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    loadActivityProgress()
    checkEditPermissions()
  }, [activityId])

  const loadActivityProgress = async () => {
    try {
      const result = await getActivityProgress(activityId)
      if (result.success && result.data) {
        setActivityData(result.data)
      }
    } catch (error) {
      console.error('Error loading activity progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkEditPermissions = async () => {
    try {
      const canUserEdit = await canUserEditActivity(activityId, currentUserId)
      setCanEdit(canUserEdit)
    } catch (error) {
      console.error('Error checking permissions:', error)
    }
  }

  const handleComplete = async () => {
    if (!activityData?.activity) return
    
    setCompleting(true)
    try {
      const result = await completeActivity(
        activityId, 
        activityData.activity.goal_id, 
        notes.trim() || undefined
      )
      
      if (result.success) {
        toast.success('Activity completed!')
        setShowCompletionDialog(false)
        setNotes('')
        await loadActivityProgress()
        onUpdate?.()
      } else {
        const errorMessage = result.error && typeof result.error === 'object' && 'message' in result.error 
          ? (result.error as any).message 
          : 'Failed to complete activity'
        toast.error(errorMessage)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete activity')
    } finally {
      setCompleting(false)
    }
  }

  const handleUncomplete = async () => {
    if (!activityData?.activity) return
    
    try {
      const result = await uncompleteActivity(activityId, activityData.activity.goal_id)
      
      if (result.success) {
        toast.success('Activity marked as incomplete')
        await loadActivityProgress()
        onUpdate?.()
      } else {
        const errorMessage = result.error && typeof result.error === 'object' && 'message' in result.error 
          ? (result.error as any).message 
          : 'Failed to uncomplete activity'
        toast.error(errorMessage)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to uncomplete activity')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-2 bg-muted rounded w-full" />
            <div className="h-8 bg-muted rounded w-1/4" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!activityData) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          Activity not found
        </CardContent>
      </Card>
    )
  }

  const { activity, assignedMembers: members, completions, progressPercentage, completedCount, totalAssigned } = activityData
  const isCompletedByUser = completions.some((c: any) => c.user_id === currentUserId)
  const isAssignedToUser = activity.assigned_to_all || activity.assigned_to === currentUserId

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              {activity.title}
            </CardTitle>
            {activity.description && (
              <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activity.assigned_to_all ? (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Users className="h-3 w-3 mr-1" />
                All Members
              </Badge>
            ) : activity.assigned_to ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <User className="h-3 w-3 mr-1" />
                Assigned
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                <Clock className="h-3 w-3 mr-1" />
                Unassigned
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{completedCount}/{totalAssigned}</span>
              <span className="text-muted-foreground">({progressPercentage}%)</span>
            </div>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-green-500" 
          />
        </div>

        {/* Assigned Members */}
        {members.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Assigned Members ({members.length})
            </h4>
            <div className="space-y-2">
              {members.map((member: any) => {
                const isCompleted = completions.some((c: any) => c.user_id === member.user_id)
                const profile = member.profile || member
                const memberName = profile 
                  ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username || 'Unknown'
                  : 'Unknown'
                
                return (
                  <div key={member.user_id} className="flex items-center justify-between p-2 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={profile?.profile_picture_url} />
                        <AvatarFallback className="text-xs">
                          {memberName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{memberName}</span>
                      {member.user_id === currentUserId && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {isCompleted ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Completions List */}
        {completions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              Recent Completions
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {completions.slice(0, 3).map((completion: any) => {
                const user = completion.user
                const userName = user 
                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Someone'
                  : 'Someone'
                
                return (
                  <div key={completion.id} className="flex items-start gap-2 p-2 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-900">{userName}</p>
                      <p className="text-xs text-green-700">
                        {new Date(completion.completed_at).toLocaleDateString()} at{' '}
                        {new Date(completion.completed_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      {completion.notes && (
                        <p className="text-xs text-green-600 mt-1 italic">"{completion.notes}"</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {canEdit && isAssignedToUser && (
          <div className="flex gap-2 pt-2 border-t">
            {!isCompletedByUser ? (
              <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex-1">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Complete Activity</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        You're about to mark "{activity.title}" as complete.
                      </p>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Notes (optional)</label>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add any notes about completing this activity..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleComplete} 
                        disabled={completing}
                        className="flex-1"
                      >
                        {completing ? 'Completing...' : 'Complete Activity'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCompletionDialog(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUncomplete}
                className="flex-1"
              >
                <Circle className="h-4 w-4 mr-2" />
                Mark Incomplete
              </Button>
            )}
          </div>
        )}

        {/* Info for non-assigned users */}
        {!isAssignedToUser && (
          <div className="text-center py-2 text-sm text-muted-foreground border-t">
            This activity is not assigned to you
          </div>
        )}
      </CardContent>
    </Card>
  )
}