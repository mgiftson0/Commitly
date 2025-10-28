"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Award, Target, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface AchievementCardProps {
  achievement: {
    id: string
    title: string
    description: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    unlocked: boolean
    progress: number
    total: number
    progressPercentage: number
    icon?: string
    category?: string
  }
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function AchievementCard({ achievement, size = 'md', onClick }: AchievementCardProps) {
  const getRarityStyles = () => {
    switch (achievement.rarity) {
      case 'common':
        return {
          bg: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
          border: 'border-slate-200 dark:border-slate-700',
          icon: 'bg-slate-200 dark:bg-slate-700',
          text: 'text-slate-700 dark:text-slate-300',
          lockedBg: 'bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50'
        }
      case 'rare':
        return {
          bg: 'bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900',
          border: 'border-cyan-200 dark:border-cyan-800',
          icon: 'bg-cyan-200 dark:bg-cyan-700',
          text: 'text-cyan-700 dark:text-cyan-300',
          lockedBg: 'bg-gradient-to-br from-cyan-50/50 to-cyan-100/50 dark:from-cyan-950/50 dark:to-cyan-900/50'
        }
      case 'epic':
        return {
          bg: 'bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900',
          border: 'border-violet-200 dark:border-violet-800',
          icon: 'bg-violet-200 dark:bg-violet-700',
          text: 'text-violet-700 dark:text-violet-300',
          lockedBg: 'bg-gradient-to-br from-violet-50/50 to-violet-100/50 dark:from-violet-950/50 dark:to-violet-900/50'
        }
      case 'legendary':
        return {
          bg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 dark:from-amber-950 dark:via-yellow-950 dark:to-orange-900',
          border: 'border-amber-300 dark:border-amber-700',
          icon: 'bg-amber-200 dark:bg-amber-700',
          text: 'text-amber-700 dark:text-amber-300',
          lockedBg: 'bg-gradient-to-br from-amber-50/50 via-yellow-50/50 to-orange-100/50 dark:from-amber-950/50 dark:via-yellow-950/50 dark:to-orange-900/50'
        }
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
          border: 'border-slate-200 dark:border-slate-700',
          icon: 'bg-slate-200 dark:bg-slate-700',
          text: 'text-slate-700 dark:text-slate-300',
          lockedBg: 'bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50'
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          card: 'p-2',
          icon: 'h-6 w-6 p-1',
          iconSize: 'h-4 w-4',
          title: 'text-xs',
          description: 'text-xs',
          badge: 'text-xs px-1.5 py-0.5'
        }
      case 'lg':
        return {
          card: 'p-6',
          icon: 'h-16 w-16 p-3',
          iconSize: 'h-10 w-10',
          title: 'text-xl',
          description: 'text-base',
          badge: 'text-sm px-3 py-1'
        }
      default:
        return {
          card: 'p-3',
          icon: 'h-8 w-8 p-1.5',
          iconSize: 'h-5 w-5',
          title: 'text-sm',
          description: 'text-xs',
          badge: 'text-xs px-2 py-0.5'
        }
    }
  }

  const rarityStyles = getRarityStyles()
  const sizeStyles = getSizeStyles()

  const getIcon = () => {
    switch (achievement.category) {
      case 'goals': return Target
      case 'streaks': return Star
      case 'social': return Award
      default: return Trophy
    }
  }

  const Icon = getIcon()

  return (
    <Card 
      className={cn(
        "relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg",
        achievement.unlocked ? rarityStyles.bg : rarityStyles.lockedBg,
        rarityStyles.border,
        !achievement.unlocked && "grayscale",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      {/* Lock overlay for locked achievements */}
      {!achievement.unlocked && (
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20 flex items-center justify-center z-10">
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg">
            <Lock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      )}

      <CardContent className={sizeStyles.card}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "rounded-full flex items-center justify-center flex-shrink-0",
            rarityStyles.icon,
            sizeStyles.icon
          )}>
            <Icon className={cn(sizeStyles.iconSize, rarityStyles.text)} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className={cn("font-semibold line-clamp-2", sizeStyles.title)}>
                {achievement.title}
              </h3>
              <Badge 
                variant="secondary" 
                className={cn(
                  "capitalize flex-shrink-0",
                  sizeStyles.badge,
                  rarityStyles.text
                )}
              >
                {achievement.rarity}
              </Badge>
            </div>
            
            <p className={cn(
              "text-muted-foreground line-clamp-2 mb-3",
              sizeStyles.description
            )}>
              {achievement.description}
            </p>
            
            {!achievement.unlocked && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {achievement.progress}/{achievement.total}
                  </span>
                </div>
                <Progress 
                  value={achievement.progressPercentage} 
                  className="h-2"
                />
              </div>
            )}
            
            {achievement.unlocked && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-medium">Unlocked!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}