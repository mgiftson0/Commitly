"use client"

import { Button } from "@/components/ui/button"
import { Target } from "lucide-react"
import { useRouter } from "next/navigation"

interface NotificationTileProps {
  id: string
  type: string
  title: string
  description: string
  time: string
  icon: React.ComponentType<any>
  color: string
  goalId?: string
  onClick?: () => void
  showViewGoal?: boolean
}

export function NotificationTile({
  id,
  type,
  title,
  description,
  time,
  icon: Icon,
  color,
  goalId,
  onClick,
  showViewGoal = true
}: NotificationTileProps) {
  const router = useRouter()

  const getNotificationColor = (type: string) => {
    if (type === 'goal_completed') return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
    if (type === 'streak_milestone') return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
    if (type === 'partner_joined') return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950'
    if (type === 'goal_created') return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
    if (type === 'activity_completed') return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
    if (type === 'encouragement_received') return 'border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-950'
    if (type === 'achievement_unlocked') return 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950'
    return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
  }

  return (
    <div
      className={`flex items-start gap-2 p-2.5 rounded-lg border transition-colors cursor-pointer hover:bg-accent/50 h-[100px] ${getNotificationColor(type)}`}
      onClick={() => {
        if (onClick) onClick()
        else if (goalId) router.push(`/goals/${goalId}`)
      }}
    >
      <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 mt-0.5 flex-shrink-0">
        <img src="/Comittly-logo.png" alt="Commitly" className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-xs text-slate-900 dark:text-slate-100 truncate">{title}</h4>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-2 whitespace-nowrap flex-shrink-0">
              {time}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
            {description}
          </p>
        </div>
        {showViewGoal && goalId && (
          <div className="mt-auto">
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
              <Target className="h-2.5 w-2.5" />
              View Goal
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
