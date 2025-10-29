"use client"

import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, Users } from 'lucide-react'
import { authHelpers } from '@/lib/supabase-client'

interface MemberProgress {
  id: string
  name: string
  avatar: string
  completed: boolean
}

interface GroupActivityProgressProps {
  activityId: string
  activityTitle: string
  assignedMembers: string[]
  currentUserId?: string
}

export function GroupActivityProgress({ 
  activityId, 
  activityTitle, 
  assignedMembers,
  currentUserId 
}: GroupActivityProgressProps) {
  const [memberProgress, setMemberProgress] = useState<MemberProgress[]>([])
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [isAssigned, setIsAssigned] = useState(false)
  const [userCompleted, setUserCompleted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadActivityProgress()
  }, [activityId])

  const loadActivityProgress = async () => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) return

      setIsAssigned(assignedMembers.includes(user.id))
      
      // Mock member progress data
      const mockProgress: MemberProgress[] = assignedMembers.map((memberId, index) => ({
        id: memberId,
        name: `Member ${index + 1}`,
        avatar: '/placeholder-avatar.jpg',
        completed: Math.random() > 0.5 // Random completion for demo
      }))

      setMemberProgress(mockProgress)
      
      const completedCount = mockProgress.filter(m => m.completed).length
      const percentage = assignedMembers.length > 0 ? Math.round((completedCount / assignedMembers.length) * 100) : 0
      setProgressPercentage(percentage)
      
      const userProgress = mockProgress.find(m => m.id === user.id)
      setUserCompleted(userProgress?.completed || false)
    } catch (error) {
      console.error('Error loading activity progress:', error)
    }
  }

  const handleToggleCompletion = async () => {
    if (!isAssigned) return
    
    setLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newCompleted = !userCompleted
      setUserCompleted(newCompleted)
      
      // Update member progress
      const updatedProgress = memberProgress.map(member => 
        member.id === currentUserId ? { ...member, completed: newCompleted } : member
      )
      setMemberProgress(updatedProgress)
      
      const completedCount = updatedProgress.filter(m => m.completed).length
      const percentage = assignedMembers.length > 0 ? Math.round((completedCount / assignedMembers.length) * 100) : 0
      setProgressPercentage(percentage)
    } catch (error) {
      console.error('Error updating activity:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
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

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Team Progress</span>
          <span>{memberProgress.filter(m => m.completed).length}/{assignedMembers.length} completed</span>
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

      {isAssigned && (
        <Button
          onClick={handleToggleCompletion}
          disabled={loading}
          size="sm"
          variant={userCompleted ? "outline" : "default"}
          className="w-full"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              Updating...
            </div>
          ) : userCompleted ? (
            <>
              <CheckCircle2 className="h-3 w-3 mr-2" />
              Mark Incomplete
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3 w-3 mr-2" />
              Mark Complete
            </>
          )}
        </Button>
      )}
    </div>
  )
}