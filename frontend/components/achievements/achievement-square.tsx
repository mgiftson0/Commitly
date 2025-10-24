"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Lock, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface AchievementSquareProps {
  achievement: {
    id: string
    title: string
    description: string
    rarity?: 'common' | 'rare' | 'epic' | 'legendary'
    icon?: any
    color?: string
    unlocked: boolean
    progress: number
    total: number
    progressPercentage?: number
  }
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const rarityConfig = {
  common: {
    unlockedBg: "bg-white/10 backdrop-blur-sm border border-white/20",
    lockedBg: "bg-gray-900/10 backdrop-blur-sm border border-gray-700/20",
    border: "border-white/30 dark:border-gray-600/30",
    badge: "bg-gray-600/80 backdrop-blur-sm text-white border border-white/20",
    iconBg: "bg-green-500/20 backdrop-blur-sm border border-green-400/30",
    glow: "shadow-green-200/50 dark:shadow-green-900/30"
  },
  rare: {
    unlockedBg: "bg-white/15 backdrop-blur-md border border-white/30",
    lockedBg: "bg-gray-900/15 backdrop-blur-sm border border-gray-600/20",
    border: "border-blue-300/40 dark:border-blue-600/40",
    badge: "bg-blue-600/80 backdrop-blur-sm text-white border border-white/20",
    iconBg: "bg-blue-500/25 backdrop-blur-sm border border-blue-400/40",
    glow: "shadow-blue-200/60 dark:shadow-blue-900/40"
  },
  epic: {
    unlockedBg: "bg-white/20 backdrop-blur-lg border border-white/40",
    lockedBg: "bg-gray-900/20 backdrop-blur-sm border border-gray-500/25",
    border: "border-purple-300/50 dark:border-purple-500/50",
    badge: "bg-purple-600/80 backdrop-blur-sm text-white border border-white/20",
    iconBg: "bg-purple-500/30 backdrop-blur-md border border-purple-400/50",
    glow: "shadow-purple-200/70 dark:shadow-purple-900/50"
  },
  legendary: {
    unlockedBg: "bg-gradient-to-br from-white/25 via-orange-50/20 to-red-50/20 backdrop-blur-xl border-2 border-gradient-to-r from-yellow-300/60 via-orange-300/60 to-red-300/60",
    lockedBg: "bg-gradient-to-br from-gray-900/25 via-gray-800/20 to-gray-700/20 backdrop-blur-sm border border-gray-500/30",
    border: "border-2 border-yellow-300/40 via-orange-300/40 to-red-300/40",
    badge: "bg-gradient-to-r from-yellow-500/80 via-orange-500/80 to-red-500/80 backdrop-blur-sm text-white border border-white/20",
    iconBg: "bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-red-400/30 backdrop-blur-md border border-yellow-300/50",
    glow: "shadow-yellow-200/80 via-orange-200/80 to-red-200/80 dark:shadow-yellow-900/60"
  }
}

export function AchievementSquare({ achievement, size = 'md', onClick }: AchievementSquareProps) {
  // Ensure rarity is valid, default to 'common' if undefined
  const validRarity = achievement.rarity && rarityConfig[achievement.rarity] 
    ? achievement.rarity 
    : 'common'
  const config = rarityConfig[validRarity]
  const Icon = achievement.icon || Trophy
  const isSmall = size === 'sm'
  const isLarge = size === 'lg'
  const isLocked = !achievement.unlocked
  const progressPercentage = achievement.progressPercentage ?? Math.round((achievement.progress / achievement.total) * 100)

  return (
    <div 
      className={cn(
        "relative aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105 cursor-pointer group",
        isLocked ? config.lockedBg : config.unlockedBg,
        config.border,
        isLocked && "opacity-70",
        isSmall ? "p-3 min-h-[80px]" : isLarge ? "p-6 min-h-[140px]" : "p-4 min-h-[100px]"
      )}
      onClick={onClick}
    >
      {/* Rarity badge */}
      <div className="absolute -top-1 -right-1 z-10">
        <Badge className={cn(config.badge, "text-xs px-1 py-0.5 rounded-full")}>
          {validRarity[0].toUpperCase()}
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
            "rounded-full transition-all duration-300 hover:scale-110",
            config.iconBg,
            isSmall ? "p-2" : isLarge ? "p-4" : "p-3",
            achievement.unlocked && config.glow
          )}>
            <Icon className={cn(
              achievement.color || "text-yellow-600",
              isSmall ? "h-6 w-6" : isLarge ? "h-10 w-10" : "h-8 w-8",
              isLocked && "text-gray-400",
              achievement.unlocked && "drop-shadow-sm"
            )} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mt-1">
          <h3 className={cn(
            "font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight",
            isSmall ? "text-[10px]" : isLarge ? "text-sm" : "text-xs"
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
                  value={progressPercentage} 
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
      {validRarity === 'legendary' && achievement.unlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg animate-pulse" />
      )}
    </div>
  )
}
