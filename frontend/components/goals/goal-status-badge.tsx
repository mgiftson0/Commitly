"use client"

import { Badge } from "@/components/ui/badge"
import { getGoalStatus, getDueDateText, type GoalWithStatus } from "@/lib/utils/goal-status"
import { 
  CheckCircle2, 
  Pause, 
  AlertTriangle, 
  Clock, 
  Target, 
  Calendar 
} from "lucide-react"
import { cn } from "@/lib/utils"

interface GoalStatusBadgeProps {
  goal: GoalWithStatus
  showText?: boolean
  showDueDate?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const iconMap = {
  CheckCircle2,
  Pause,
  AlertTriangle,
  Clock,
  Target,
  Calendar
}

export function GoalStatusBadge({ 
  goal, 
  showText = true, 
  showDueDate = false,
  className,
  size = 'md'
}: GoalStatusBadgeProps) {
  const status = getGoalStatus(goal)
  const Icon = iconMap[status.icon as keyof typeof iconMap] || Target
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        className={cn(
          status.color,
          sizeClasses[size],
          "font-medium flex items-center gap-1.5",
          className
        )}
      >
        <Icon className={iconSizes[size]} />
        {showText && status.label}
      </Badge>
      
      {showDueDate && (
        <span className="text-xs text-muted-foreground">
          {getDueDateText(goal)}
        </span>
      )}
    </div>
  )
}

interface CompactGoalStatusProps {
  goal: GoalWithStatus
  className?: string
}

/**
 * Compact status display with icon and due date text
 */
export function CompactGoalStatus({ goal, className }: CompactGoalStatusProps) {
  const status = getGoalStatus(goal)
  const dueText = getDueDateText(goal)
  const Icon = iconMap[status.icon as keyof typeof iconMap] || Target

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <div className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md",
        status.status === 'completed' && "bg-green-50 text-green-700 dark:bg-green-950/30",
        status.status === 'paused' && "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30",
        status.status === 'overdue' && "bg-red-50 text-red-700 dark:bg-red-950/30",
        status.status === 'active' && "bg-blue-50 text-blue-700 dark:bg-blue-950/30",
        status.status === 'upcoming' && "bg-purple-50 text-purple-700 dark:bg-purple-950/30"
      )}>
        <Icon className="h-3.5 w-3.5" />
        <span className="font-medium">{dueText || status.label}</span>
      </div>
    </div>
  )
}
