"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, User, CheckCircle2, Clock } from "lucide-react"

interface GroupMember {
  id: string
  name: string
  avatar?: string
  status: 'accepted' | 'pending' | 'declined'
}

interface ActivityAssignmentProps {
  activityIndex: number
  groupMembers: GroupMember[]
  assignment: string | null
  assignedToAll: boolean
  onAssignmentChange: (index: number, assignment: string | null, assignedToAll: boolean) => void
}

export function ActivityAssignment({ 
  activityIndex, 
  groupMembers, 
  assignment, 
  assignedToAll,
  onAssignmentChange 
}: ActivityAssignmentProps) {
  const acceptedMembers = groupMembers.filter(m => m.status === 'accepted')

  const handleAssignmentChange = (value: string) => {
    if (value === 'all') {
      onAssignmentChange(activityIndex, null, true)
    } else if (value === 'unassigned') {
      onAssignmentChange(activityIndex, null, false)
    } else {
      onAssignmentChange(activityIndex, value, false)
    }
  }

  const getCurrentValue = () => {
    if (assignedToAll) return 'all'
    if (assignment) return assignment
    return 'unassigned'
  }

  const getAssignmentDisplay = () => {
    if (assignedToAll) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Users className="h-3 w-3 mr-1" />
          All Members ({acceptedMembers.length})
        </Badge>
      )
    }
    
    if (assignment) {
      const member = acceptedMembers.find(m => m.id === assignment)
      return member ? (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <User className="h-3 w-3 mr-1" />
          {member.name}
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
          {acceptedMembers.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              <div className="flex items-center gap-2">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-xs">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>{member.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}