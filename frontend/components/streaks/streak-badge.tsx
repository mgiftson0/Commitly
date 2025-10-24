"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StreakBadgeProps {
  streak: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function StreakBadge({ streak, size = 'md', showLabel = true, className }: StreakBadgeProps) {
  if (streak === 0) return null
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }
  
  const getStreakColor = () => {
    if (streak >= 100) return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
    if (streak >= 30) return "bg-red-500 text-white"
    if (streak >= 14) return "bg-orange-500 text-white"
    if (streak >= 7) return "bg-yellow-500 text-white"
    return "bg-gray-500 text-white"
  }
  
  return (
    <Badge className={cn(
      "gap-1 font-semibold",
      sizeClasses[size],
      getStreakColor(),
      className
    )}>
      🔥 {streak} {showLabel && (streak === 1 ? 'day' : 'days')}
    </Badge>
  )
}

interface StreakStatsProps {
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  className?: string
}

export function StreakStats({ currentStreak, longestStreak, totalCompletions, className }: StreakStatsProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-4", className)}>
      <div className="text-center">
        <p className="text-2xl font-bold text-orange-500">🔥 {currentStreak}</p>
        <p className="text-xs text-muted-foreground">Current</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-yellow-500">🏆 {longestStreak}</p>
        <p className="text-xs text-muted-foreground">Best</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-green-500">✓ {totalCompletions}</p>
        <p className="text-xs text-muted-foreground">Total</p>
      </div>
    </div>
  )
}
