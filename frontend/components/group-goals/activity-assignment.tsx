"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  VisuallyHidden,
} from "@/components/ui/sheet"
import { CheckCircle2, Users, User, Clock, Check } from "lucide-react"
import { toast } from "sonner"
import {
  getGroupGoalMembers,
  assignActivity,
  completeActivity,
  getActivityCompletions,
  canUserUpdateActivity,
  type GroupGoalMember,
  type ActivityCompletion
} from "@/lib/group-goals"
import { authHelpers } from "@/lib/supabase-client"

interface Activity {
  id: string
  title: string
  description?: string
  assigned_to?: string
  assigned_to_all: boolean
  completed: boolean
  goal_id: string
}

interface ActivityAssignmentProps {
  activity: Activity
  goalId: string
  isOwner: boolean
  onUpdate?: () => void
}

export function ActivityAssignment({ activity, goalId, isOwner, onUpdate }: ActivityAssignmentProps) {
  const [members, setMembers] = useState<GroupGoalMember[]>([])
  const [completions, setCompletions] = useState<ActivityCompletion[]>([])
  const [canUpdate, setCanUpdate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [activity.id])

  const loadData = async () => {
    const user = await authHelpers.getCurrentUser()
    if (!user) return

    // Load members
    const membersResult = await getGroupGoalMembers(goalId)
    if (membersResult.success && membersResult.data) {
      setMembers(membersResult.data.filter((m: any) => m.status === 'accepted'))
    }

    // Load completions
    const completionsResult = await getActivityCompletions(activity.id)
    if (completionsResult.success && completionsResult.data) {
      setCompletions(completionsResult.data as any)
    }

    // Check permissions
    const hasPermission = await canUserUpdateActivity(activity.id, user.id)
    setCanUpdate(hasPermission)
  }

  const handleAssignment = async (assignmentType: 'all' | 'specific', userId?: string) => {
    setLoading(true)
    const result = await assignActivity(activity.id, {
      assignedTo: userId,
      assignedToAll: assignmentType === 'all'
    })

    if (result.success) {
      toast.success("Activity assignment updated")
      onUpdate?.()
      loadData()
    } else {
      toast.error("Failed to update assignment")
    }
    setLoading(false)
  }

  const handleComplete = async () => {
    setLoading(true)
    const result = await completeActivity(activity.id, goalId)

    if (result.success) {
      toast.success("Activity marked as complete!")
      onUpdate?.()
      loadData()
    } else {
      const errorMessage = result.error && typeof result.error === 'object' && 'message' in result.error 
        ? (result.error as any).message 
        : "Failed to complete activity"
      toast.error(errorMessage)
    }
    setLoading(false)
  }

  const userHasCompleted = async () => {
    const user = await authHelpers.getCurrentUser()
    if (!user) return false
    return completions.some(c => c.user_id === user.id)
  }

  const getAssignmentBadge = () => {
    if (activity.assigned_to_all) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          <Users className="h-3 w-3 mr-1" />
          All Members
        </Badge>
      )
    } else if (activity.assigned_to) {
      const assignedMember = members.find(m => m.user_id === activity.assigned_to)
      return (
        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
          <User className="h-3 w-3 mr-1" />
          {assignedMember?.profile?.first_name || 'Assigned'}
        </Badge>
      )
    }
    return (
      <Badge variant="outline">
        <Clock className="h-3 w-3 mr-1" />
        Unassigned
      </Badge>
    )
  }

  const completionPercentage = activity.assigned_to_all && members.length > 0
    ? Math.round((completions.length / members.length) * 100)
    : activity.completed ? 100 : 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">{activity.title}</h4>
            {activity.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {activity.description}
              </p>
            )}
          </div>
          {getAssignmentBadge()}
        </div>

        {/* Progress for collaborative activities */}
        {activity.assigned_to_all && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Team Progress</span>
              <span className="font-medium">{completions.length}/{members.length} completed</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        )}

        {/* Completion status */}
        {activity.completed ? (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mb-3">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">Completed</span>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex gap-2">
          {canUpdate && !activity.completed && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleComplete}
              disabled={loading}
              className="flex-1"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark Complete
            </Button>
          )}

          {isOwner && (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="flex-1">
                  <Users className="h-3 w-3 mr-1" />
                  Manage
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Activity Assignment</SheetTitle>
                  <VisuallyHidden>
                    <SheetDescription>
                      Assign this activity to specific members or all team members
                    </SheetDescription>
                  </VisuallyHidden>
                </SheetHeader>

                <div className="space-y-4 mt-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Assignment Type</h4>
                    <Select
                      value={activity.assigned_to_all ? 'all' : activity.assigned_to || 'none'}
                      onValueChange={(value) => {
                        if (value === 'all') {
                          handleAssignment('all')
                        } else if (value !== 'none') {
                          handleAssignment('specific', value)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Members</SelectItem>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {members.map(member => (
                          <SelectItem key={member.user_id} value={member.user_id}>
                            {member.profile?.first_name} {member.profile?.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Completion tracking */}
                  {completions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-3">Completion Status</h4>
                      <div className="space-y-2">
                        {completions.map((completion: any) => (
                          <div key={completion.id} className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-950/20">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={completion.user?.profile_picture_url} />
                              <AvatarFallback>
                                {completion.user?.first_name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {completion.user?.first_name} {completion.user?.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(completion.completed_at).toLocaleString()}
                              </p>
                            </div>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
