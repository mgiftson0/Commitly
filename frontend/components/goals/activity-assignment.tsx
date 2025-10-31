"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, User, CheckCircle2, Clock, Target, Settings } from "lucide-react"
import { toast } from "sonner"
import { updateActivityAssignment, getActivityProgress, isGroupGoalAdmin } from "@/lib/group-goals"
import { authHelpers } from "@/lib/supabase-client"

interface GroupMember {
  id: string
  name: string
  avatar?: string
  status: 'accepted' | 'pending' | 'declined'
  profile?: {
    first_name?: string
    last_name?: string
    username?: string
    profile_picture_url?: string
  }
}

interface ActivityAssignmentProps {
  activity?: {
    id: string
    title: string
    assigned_to?: string
    assigned_to_all?: boolean
    assigned_members?: string[]
    goal_id: string
  }
  activityIndex?: number
  groupMembers: GroupMember[]
  assignment?: string | null
  assignedToAll?: boolean
  assignedMembers?: string[]
  isOwner?: boolean
  onAssignmentChange?: (index: number, assignment: string | null, assignedToAll: boolean, assignedMembers?: string[]) => void
  onUpdate?: () => void
}

export function ActivityAssignment({ 
  activity,
  activityIndex = 0, 
  groupMembers, 
  assignment, 
  assignedToAll = false,
  assignedMembers = [],
  isOwner = false,
  onAssignmentChange,
  onUpdate
}: ActivityAssignmentProps) {
  const [activityData, setActivityData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  
  const acceptedMembers = groupMembers.filter(m => m.status === 'accepted')
  
  // Use activity data if provided, otherwise use props
  const currentAssignment = activity?.assigned_to || assignment
  const currentAssignedToAll = activity?.assigned_to_all ?? assignedToAll
  const currentAssignedMembers = activity?.assigned_members || assignedMembers || []

  useEffect(() => {
    if (activity?.id) {
      loadActivityData()
      checkAdminStatus()
    }
  }, [activity?.id])

  const loadActivityData = async () => {
    if (!activity?.id) return
    
    setLoading(true)
    try {
      const result = await getActivityProgress(activity.id)
      if (result.success && result.data) {
        setActivityData(result.data)
      }
    } catch (error) {
      console.error('Error loading activity data:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkAdminStatus = async () => {
    if (!activity?.goal_id) return
    
    try {
      const user = await authHelpers.getCurrentUser()
      if (user) {
        const adminStatus = await isGroupGoalAdmin(activity.goal_id, user.id)
        setIsAdmin(adminStatus)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  const handleAssignmentChange = async (value: string) => {
    if (activity?.id && isAdmin) {
      // Update in database
      setUpdating(true)
      try {
        const result = await updateActivityAssignment(activity.id, {
          assignedTo: value === 'all' || value === 'unassigned' || value === 'multiple' ? undefined : value,
          assignedToAll: value === 'all',
          assignedMembers: value === 'multiple' ? currentAssignedMembers : undefined
        })
        
        if (result.success) {
          toast.success('Assignment updated')
          await loadActivityData()
          onUpdate?.()
        } else {
          const errorMessage = result.error && typeof result.error === 'object' && 'message' in result.error 
            ? (result.error as any).message 
            : 'Failed to update assignment'
          toast.error(errorMessage)
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to update assignment')
      } finally {
        setUpdating(false)
      }
    } else if (onAssignmentChange) {
      // Update in parent component (for creation flow)
      if (value === 'all') {
        onAssignmentChange(activityIndex, null, true, [])
      } else if (value === 'unassigned') {
        onAssignmentChange(activityIndex, null, false, [])
      } else if (value === 'multiple') {
        onAssignmentChange(activityIndex, null, false, currentAssignedMembers)
      } else {
        onAssignmentChange(activityIndex, value, false, [])
      }
    }
  }

  const handleMemberToggle = (memberId: string, checked: boolean) => {
    const newAssignedMembers = checked 
      ? [...currentAssignedMembers, memberId]
      : currentAssignedMembers.filter(id => id !== memberId)
    
    // Limit to max 5 members per activity
    if (newAssignedMembers.length > 5) {
      toast.error('Maximum 5 members can be assigned to an activity')
      return
    }
    
    if (onAssignmentChange) {
      onAssignmentChange(activityIndex, null, false, newAssignedMembers)
    }
  }

  const getCurrentValue = () => {
    if (currentAssignedToAll) return 'all'
    if (currentAssignedMembers.length > 1) return 'multiple'
    if (currentAssignment || currentAssignedMembers.length === 1) return currentAssignment || currentAssignedMembers[0]
    return 'unassigned'
  }

  const getAssignmentDisplay = () => {
    if (currentAssignedToAll) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Users className="h-3 w-3 mr-1" />
          All Members ({acceptedMembers.length})
        </Badge>
      )
    }
    
    if (currentAssignedMembers.length > 1) {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <Users className="h-3 w-3 mr-1" />
          {currentAssignedMembers.length} Members
        </Badge>
      )
    }
    
    if (currentAssignment || currentAssignedMembers.length === 1) {
      const memberId = currentAssignment || currentAssignedMembers[0]
      const member = acceptedMembers.find(m => m.id === memberId)
      const memberName = member ? (
        member.profile 
          ? `${member.profile.first_name || ''} ${member.profile.last_name || ''}`.trim() || member.profile.username || member.name
          : member.name
      ) : 'Unknown'
      
      return member ? (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <User className="h-3 w-3 mr-1" />
          {memberName}
        </Badge>
      ) : null
    }

    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
        <Clock className="h-3 w-3 mr-1" />
        Unassigned
      </Badge>
    )
  }

  // Show progress if we have activity data
  if (activity?.id && activityData) {
    const { progressPercentage, completedCount, totalAssigned, assignedMembers, completions } = activityData
    
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium">{activity.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                {getAssignmentDisplay()}
                {isAdmin && (
                  <Badge variant="outline" className="text-xs">
                    <Settings className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completedCount}/{totalAssigned} ({progressPercentage}%)</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-green-500" 
            />
          </div>

          {/* Assignment Control (Admin Only) */}
          {isAdmin && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Assignment:</span>
                <span className="text-xs text-muted-foreground">Admin Controls</span>
              </div>
              
              <Select 
                value={getCurrentValue()} 
                onValueChange={handleAssignmentChange}
                disabled={updating}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Assign to..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>Unassigned</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      <span>All Members ({acceptedMembers.length})</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="multiple">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      <span>Select Multiple</span>
                    </div>
                  </SelectItem>
                  {acceptedMembers.map((member) => {
                    const memberName = member.profile 
                      ? `${member.profile.first_name || ''} ${member.profile.last_name || ''}`.trim() || member.profile.username || member.name
                      : member.name
                    
                    return (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          {member.profile?.profile_picture_url ? (
                            <img 
                              src={member.profile.profile_picture_url} 
                              alt={memberName}
                              className="h-3 w-3 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-3 w-3 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <span className="text-[8px] font-semibold">
                                {memberName.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span>{memberName}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {updating && (
                <p className="text-xs text-muted-foreground">Updating assignment...</p>
              )}
              
              {/* Multiple Member Selection */}
              {getCurrentValue() === 'multiple' && (
                <div className="space-y-2 mt-2 p-2 border rounded-lg bg-muted/20">
                  <p className="text-xs font-medium">Select Members:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {acceptedMembers.map((member) => {
                      const memberName = member.profile 
                        ? `${member.profile.first_name || ''} ${member.profile.last_name || ''}`.trim() || member.profile.username || member.name
                        : member.name
                      
                      return (
                        <div key={member.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`member-${member.id}`}
                            checked={currentAssignedMembers.includes(member.id)}
                            onCheckedChange={(checked) => handleMemberToggle(member.id, checked as boolean)}
                          />
                          <div className="flex items-center gap-2">
                            {member.profile?.profile_picture_url ? (
                              <img 
                                src={member.profile.profile_picture_url} 
                                alt={memberName}
                                className="h-3 w-3 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-3 w-3 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <span className="text-[8px] font-semibold">
                                  {memberName.charAt(0)}
                                </span>
                              </div>
                            )}
                            <label htmlFor={`member-${member.id}`} className="text-xs cursor-pointer">
                              {memberName}
                            </label>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Assigned Members List */}
          {assignedMembers.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground">
                Assigned Members ({assignedMembers.length})
              </h5>
              <div className="space-y-1">
                {assignedMembers.slice(0, 3).map((member: any) => {
                  const isCompleted = completions.some((c: any) => c.user_id === member.user_id)
                  const profile = member.profile || member
                  const memberName = profile 
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username || 'Unknown'
                    : 'Unknown'
                  
                  return (
                    <div key={member.user_id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {profile?.profile_picture_url ? (
                          <img 
                            src={profile.profile_picture_url} 
                            alt={memberName}
                            className="h-4 w-4 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <span className="text-[9px] font-semibold">
                              {memberName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span>{memberName}</span>
                      </div>
                      {isCompleted ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : (
                        <Clock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  )
                })}
                {assignedMembers.length > 3 && (
                  <p className="text-xs text-muted-foreground">+{assignedMembers.length - 3} more</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Simple assignment selector for creation flow
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Assignment:</span>
        {getAssignmentDisplay()}
      </div>
      
      <Select value={getCurrentValue()} onValueChange={handleAssignmentChange}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Assign to..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Unassigned</span>
            </div>
          </SelectItem>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3" />
              <span>All Members ({acceptedMembers.length})</span>
            </div>
          </SelectItem>
          <SelectItem value="multiple">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3" />
              <span>Select Multiple</span>
            </div>
          </SelectItem>
          {acceptedMembers.map((member) => {
            const memberName = member.profile 
              ? `${member.profile.first_name || ''} ${member.profile.last_name || ''}`.trim() || member.profile.username || member.name
              : member.name
            
            return (
              <SelectItem key={member.id} value={member.id}>
                <div className="flex items-center gap-2">
                  {member.profile?.profile_picture_url ? (
                    <img 
                      src={member.profile.profile_picture_url} 
                      alt={memberName}
                      className="h-4 w-4 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <span className="text-[9px] font-semibold">
                        {memberName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span>{memberName}</span>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {/* Multiple Member Selection in Creation Flow */}
      {getCurrentValue() === 'multiple' && (
        <div className="space-y-2 mt-2 p-2 border rounded-lg bg-muted/20">
          <p className="text-xs font-medium">Select Members ({currentAssignedMembers.length} selected):</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {acceptedMembers.map((member) => {
              const memberName = member.profile 
                ? `${member.profile.first_name || ''} ${member.profile.last_name || ''}`.trim() || member.profile.username || member.name
                : member.name
              
              return (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`member-create-${member.id}`}
                    checked={currentAssignedMembers.includes(member.id)}
                    onCheckedChange={(checked) => handleMemberToggle(member.id, checked as boolean)}
                  />
                  <div className="flex items-center gap-2">
                    {member.profile?.profile_picture_url ? (
                      <img 
                        src={member.profile.profile_picture_url} 
                        alt={memberName}
                        className="h-3 w-3 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-3 w-3 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <span className="text-[8px] font-semibold">
                          {memberName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <label htmlFor={`member-create-${member.id}`} className="text-xs cursor-pointer">
                      {memberName}
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}