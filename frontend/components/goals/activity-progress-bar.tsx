"use client"

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, Users } from 'lucide-react'

interface MemberProgress {
  id: string
  name: string
  avatar: string
  completed: boolean
}

interface ActivityProgressBarProps {
  activityTitle: string
  memberProgress: MemberProgress[]
  totalAssigned: number
  completedCount: number
  progressPercentage: number
  className?: string
}

export function ActivityProgressBar({
  activityTitle,
  memberProgress,
  totalAssigned,
  completedCount,
  progressPercentage,
  className = ""
}: ActivityProgressBarProps) {
  return (
    <div className={`space-y-3 p-4 border rounded-lg bg-card ${className}`}>
      {/* Activity Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm truncate flex-1">{activityTitle}</h4>
        <Badge variant={progressPercentage === 100 ? "default" : "secondary"} className="text-xs">
          {progressPercentage === 100 ? (
            <>
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Complete
            </>
          ) : (
            <>
              <Clock className="h-3 w-3 mr-1" />
              In Progress
            </>
          )}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{completedCount}/{totalAssigned} members completed</span>
        </div>
        <Progress 
          value={progressPercentage} 
          className={`h-2 ${
            progressPercentage === 100 
              ? '[&>div]:bg-green-500' 
              : progressPercentage >= 50 
                ? '[&>div]:bg-blue-500' 
                : '[&>div]:bg-yellow-500'
          }`} 
        />
      </div>

      {/* Member Avatars */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>Assigned Members</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {memberProgress.map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <div className="relative">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs bg-muted">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {member.completed && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-2 w-2 text-white" />
                  </div>
                )}
              </div>
              <span className={`text-xs ${member.completed ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                {member.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}