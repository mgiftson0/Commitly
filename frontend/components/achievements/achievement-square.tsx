"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface AchievementSquareProps {
  achievement: {
    id: string
    title: string
    description: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    icon: any
    color: string
    unlocked: boolean
    progress: number
    total: number
    progressPercentage: number
  }
  size?: 'sm' | 'md'
}

const rarityConfig = {
  common: { 
    unlockedBg: "bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30",
    lockedBg: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50", 
    border: "border-gray-300 dark:border-gray-600",
    badge: "bg-gray-500 text-white"
  },
  rare: { 
    unlockedBg: "bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-800/30",
    lockedBg: "bg-gradient-to-br from-blue-50/30 to-blue-100/30 dark:from-blue-900/10 dark:to-blue-800/10", 
    border: "border-blue-400 dark:border-blue-600",
    badge: "bg-blue-500 text-white"
  },
  epic: { 
    unlockedBg: "bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-800/30",
    lockedBg: "bg-gradient-to-br from-purple-50/30 to-purple-100/30 dark:from-purple-900/10 dark:to-purple-800/10", 
    border: "border-purple-400 dark:border-purple-600",
    badge: "bg-purple-500 text-white"
  },
  legendary: { 
    unlockedBg: "bg-gradient-to-br from-yellow-50 via-orange-100 to-red-100 dark:from-yellow-900/30 dark:via-orange-800/30 dark:to-red-800/30",
    lockedBg: "bg-gradient-to-br from-yellow-50/30 via-orange-50/30 to-red-50/30 dark:from-yellow-900/10 dark:via-orange-900/10 dark:to-red-900/10", 
    border: "border-2 border-gradient-to-r from-yellow-400 via-orange-400 to-red-400",
    badge: "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white"
  }
}

export function AchievementSquare({ achievement, size = 'md' }: AchievementSquareProps) {
  const config = rarityConfig[achievement.rarity]
  const Icon = achievement.icon
  const isSmall = size === 'sm'
  const isLocked = !achievement.unlocked

  return (
    <div className={cn(
      "relative aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105 cursor-pointer group",
      isLocked ? config.lockedBg : config.unlockedBg,
      config.border,
      isLocked && "opacity-70",
      isSmall ? "p-3 min-h-[80px]" : "p-4 min-h-[100px]"
    )}>
      {/* Rarity badge */}
      <div className="absolute -top-1 -right-1 z-10">
        <Badge className={cn(config.badge, "text-xs px-1 py-0.5 rounded-full")}>
          {achievement.rarity[0].toUpperCase()}
        </Badge>
      </div>

      {/* Lock icon for locked achievements */}
      {isLocked && (
        <div className="absolute bottom-1 right-1 bg-black/60 rounded-full p-1">
          <Lock className="h-3 w-3 text-white" />
        </div>
      )}

      {/* Content */}
      <div className="h-full flex flex-col">
        {/* Icon */}
        <div className="flex-1 flex items-center justify-center">
          <div className={cn(
            "rounded-full p-2 bg-white/80 dark:bg-gray-800/80",
            isSmall ? "p-1.5" : "p-2"
          )}>
            <Icon className={cn(
              achievement.color,
              isSmall ? "h-6 w-6" : "h-8 w-8",
              isLocked && "text-gray-400"
            )} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mt-1">
          <h3 className={cn(
            "font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight",
            isSmall ? "text-[10px]" : "text-xs"
          )}>
            {achievement.title}
          </h3>
        </div>

        {/* Progress display */}
        {!isLocked && (
          <div className="mt-1">
            {achievement.progress < achievement.total ? (
              <>
                <Progress 
                  value={achievement.progressPercentage} 
                  className="h-1"
                />
                <div className="text-[8px] text-center text-gray-500 mt-0.5">
                  {achievement.progress}/{achievement.total}
                </div>
              </>
            ) : (
              <div className="text-[8px] text-center text-green-600 font-medium">
                ✓ Unlocked
              </div>
            )}
          </div>
        )}

        {/* Locked indicator */}
        {isLocked && (
          <div className="mt-1 text-center">
            <div className="text-[8px] text-gray-400">
              {achievement.progress}/{achievement.total}
            </div>
          </div>
        )}
      </div>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap">
        {achievement.description}
      </div>

      {/* Legendary glow effect */}
      {achievement.rarity === 'legendary' && achievement.unlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg animate-pulse" />
      )}
    </div>
  )
}