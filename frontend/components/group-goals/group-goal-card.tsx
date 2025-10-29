"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Crown,
  MessageCircle,
  Heart,
  Zap,
  Eye,
  CheckCircle2,
  Clock
} from "lucide-react"
import { useState } from "react"

interface GroupGoalMember {
  id: string
  user_id: string
  role: 'owner' | 'member'
  status: 'accepted' | 'pending' | 'declined'
  profile?: {
    first_name: string
    last_name: string
    username: string
    profile_picture_url?: string
  }
}

interface GroupGoalCardProps {
  goal: {
    id: string
    title: string
    description: string
    progress: number
    status: string
    category?: string
    created_at: string
    target_date?: string
  }
  members: GroupGoalMember[]
  isAdmin?: boolean
  messageCount?: number
  onViewDetails?: () => void
}

export function GroupGoalCard({ goal, members, isAdmin, messageCount = 0, onViewDetails }: GroupGoalCardProps) {
  const [showEncouragement, setShowEncouragement] = useState(false)
  
  const acceptedMembers = members.filter(m => m.status === 'accepted')
  const admin = members.find(m => m.role === 'owner')
  
  const encouragementMessages = [
    "You've got this! Keep pushing forward! 🚀",
    "Amazing progress! Let's keep the momentum going! 💪",
    "Together we're unstoppable! Keep it up team! ⭐"
  ]

  return (
    <Card className="hover:shadow-pink-200/50 hover:shadow-lg transition-all duration-300 border-pink-100 dark:border-pink-900/30 shadow-md shadow-pink-100/50 dark:shadow-pink-900/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-pink-500 hover:bg-pink-600">
                <Users className="h-3 w-3 mr-1" />
                Group Goal
              </Badge>
              {isAdmin && (
                <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/20">
                  <Crown className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg sm:text-xl mb-1 line-clamp-2">{goal.title}</CardTitle>
            <CardDescription className="line-clamp-2 text-sm">
              {goal.description}
            </CardDescription>
          </div>
        </div>

        {/* Member Avatars */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex -space-x-2">
            {acceptedMembers.slice(0, 5).map((member) => (
              <Avatar 
                key={member.id} 
                className="h-8 w-8 border-2 border-white dark:border-slate-800 ring-2 ring-pink-200 dark:ring-pink-800"
              >
                <AvatarImage src={member.profile?.profile_picture_url} />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-xs">
                  {member.profile?.first_name?.[0] || 'M'}
                </AvatarFallback>
              </Avatar>
            ))}
            {acceptedMembers.length > 5 && (
              <div className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-800 bg-pink-100 dark:bg-pink-900 flex items-center justify-center ring-2 ring-pink-200 dark:ring-pink-800">
                <span className="text-xs font-medium text-pink-700 dark:text-pink-300">
                  +{acceptedMembers.length - 5}
                </span>
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {acceptedMembers.length} {acceptedMembers.length === 1 ? 'member' : 'members'}
          </span>
          {admin && (
            <div className="ml-auto flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <Crown className="h-3 w-3" />
              <span>{admin.profile?.first_name || 'Admin'}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Team Progress</span>
            <span className="font-medium">{goal.progress}%</span>
          </div>
          <Progress 
            value={goal.progress} 
            className="h-2 bg-pink-100 dark:bg-pink-950 [&>div]:bg-gradient-to-r [&>div]:from-pink-500 [&>div]:to-purple-500" 
          />
        </div>

        {/* Status and Category */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {goal.category && (
              <Badge variant="outline" className="text-xs">
                {goal.category}
              </Badge>
            )}
            <Badge 
              variant={goal.status === 'active' ? 'default' : 'secondary'}
              className={goal.status === 'active' ? 'bg-green-600' : ''}
            >
              {goal.status}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="truncate">
              {goal.target_date 
                ? `Due ${new Date(goal.target_date).toLocaleDateString()}` 
                : `Created ${new Date(goal.created_at).toLocaleDateString()}`
              }
            </span>
          </div>
        </div>

        {/* Encouragement Section */}
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start text-pink-600 hover:text-pink-700 hover:bg-pink-50 dark:hover:bg-pink-950/20"
              onClick={() => setShowEncouragement(!showEncouragement)}
            >
              <Heart className="h-4 w-4 mr-2" />
              {showEncouragement ? 'Hide' : 'Send'} Encouragement
            </Button>
            {messageCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageCircle className="h-3 w-3" />
                <span>{messageCount}</span>
              </div>
            )}
          </div>

          {showEncouragement && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              {encouragementMessages.map((msg, idx) => (
                <button
                  key={idx}
                  className="w-full text-left bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 hover:from-pink-100 hover:to-purple-100 dark:hover:from-pink-950/50 dark:hover:to-purple-950/50 rounded-lg p-2.5 border border-pink-200/50 dark:border-pink-800/50 transition-all"
                >
                  <p className="text-xs text-pink-900 dark:text-pink-100">
                    {msg}
                  </p>
                </button>
              ))}
              <Button size="sm" variant="outline" className="w-full border-pink-300 text-pink-700 hover:bg-pink-50">
                <MessageCircle className="h-3 w-3 mr-1.5" />
                Custom Message
              </Button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onViewDetails}
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Update Progress
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
