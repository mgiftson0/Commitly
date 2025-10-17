"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Trophy, Target, Zap, Calendar, Users, Star, Award, Crown, Flame, CheckCircle, TrendingUp, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface UserAchievement {
  id: string
  type: 'first_goal' | 'goal_master' | 'streak_warrior' | 'consistency_king' | 'team_player' | 'motivator' | 'perfectionist' | 'speed_demon' | 'dedication' | 'milestone_crusher' | 'habit_builder' | 'time_master'
  title: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt: string
  progress?: {
    current: number
    total: number
  }
}

const achievementConfig = {
  first_goal: { icon: Target, color: "text-green-600" },
  goal_master: { icon: Trophy, color: "text-yellow-600" },
  streak_warrior: { icon: Flame, color: "text-orange-600" },
  consistency_king: { icon: Calendar, color: "text-blue-600" },
  team_player: { icon: Users, color: "text-purple-600" },
  motivator: { icon: Star, color: "text-pink-600" },
  perfectionist: { icon: CheckCircle, color: "text-emerald-600" },
  speed_demon: { icon: Zap, color: "text-cyan-600" },
  dedication: { icon: Award, color: "text-indigo-600" },
  milestone_crusher: { icon: TrendingUp, color: "text-red-600" },
  habit_builder: { icon: Crown, color: "text-amber-600" },
  time_master: { icon: Clock, color: "text-slate-600" }
}

const rarityConfig = {
  common: { 
    bg: "bg-gray-50 dark:bg-gray-800/50", 
    border: "border-gray-200 dark:border-gray-700",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
  },
  rare: { 
    bg: "bg-blue-50 dark:bg-blue-900/20", 
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300"
  },
  epic: { 
    bg: "bg-purple-50 dark:bg-purple-900/20", 
    border: "border-purple-200 dark:border-purple-800",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300"
  },
  legendary: { 
    bg: "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20", 
    border: "border-gradient-to-r from-yellow-200 to-orange-200 dark:from-yellow-800 dark:to-orange-800",
    badge: "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 dark:from-yellow-800 dark:to-orange-800 dark:text-yellow-200"
  }
}

interface UserAchievementProps {
  achievement: UserAchievement
  size?: 'sm' | 'md'
}

export function UserAchievement({ achievement, size = 'md' }: UserAchievementProps) {
  const config = achievementConfig[achievement.type]
  const rarity = rarityConfig[achievement.rarity]
  const Icon = config.icon

  const isSmall = size === 'sm'
  const unlocked = new Date(achievement.unlockedAt)

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200 hover:shadow-md",
      rarity.bg,
      rarity.border,
      isSmall ? "p-3" : "p-4"
    )}>
      {/* Rarity indicator */}
      <div className="absolute top-2 right-2">
        <Badge 
          variant="secondary" 
          className={cn(
            rarity.badge,
            isSmall ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-1"
          )}
        >
          {achievement.rarity}
        </Badge>
      </div>

      <div className={cn("flex items-start gap-3", isSmall && "gap-2")}>
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 rounded-full p-2 bg-white/80 dark:bg-gray-800/80",
          isSmall ? "p-1.5" : "p-2"
        )}>
          <Icon className={cn(
            config.color,
            isSmall ? "h-4 w-4" : "h-5 w-5"
          )} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold text-gray-900 dark:text-gray-100 truncate",
            isSmall ? "text-sm" : "text-base"
          )}>
            {achievement.title}
          </h3>
          
          <p className={cn(
            "text-gray-600 dark:text-gray-400 mt-1",
            isSmall ? "text-xs line-clamp-2" : "text-sm line-clamp-3"
          )}>
            {achievement.description}
          </p>

          {/* Progress bar if applicable */}
          {achievement.progress && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Progress
                </span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {achievement.progress.current}/{achievement.progress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((achievement.progress.current / achievement.progress.total) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Unlock date */}
          <div className="mt-2 flex items-center gap-1">
            <Trophy className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Unlocked {unlocked.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Legendary glow effect */}
      {achievement.rarity === 'legendary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 pointer-events-none" />
      )}
    </Card>
  )
}

// Grid container for multiple achievements
interface UserAchievementsGridProps {
  achievements: UserAchievement[]
  size?: 'sm' | 'md'
  columns?: 1 | 2 | 3 | 4
}

export function UserAchievementsGrid({ 
  achievements, 
  size = 'md', 
  columns = 2 
}: UserAchievementsGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  }

  return (
    <div className={cn(
      "grid gap-4",
      gridCols[columns],
      size === 'sm' && "gap-3"
    )}>
      {achievements.map((achievement) => (
        <UserAchievement 
          key={achievement.id} 
          achievement={achievement} 
          size={size}
        />
      ))}
    </div>
  )
}