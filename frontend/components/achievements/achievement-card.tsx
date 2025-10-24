"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Award, Target } from "lucide-react"
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
          bg: 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900',
          border: 'border-gray-300 dark:border-gray-700',
          icon: 'bg-gray-200 dark:bg-gray-700',
          text: 'text-gray-700 dark:text-gray-300'
        }
      case 'rare':
        return {
          bg: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800',
          border: 'border-blue-300 dark:border-blue-700',
          icon: 'bg-blue-200 dark:bg-blue-700',
          text: 'text-blue-700 dark:text-blue-300'
        }
      case 'epic':
        return {
          bg: 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800',
          border: 'border-purple-300 dark:border-purple-700',
          icon: 'bg-purple-200 dark:bg-purple-700',
          text: 'text-purple-700 dark:text-purple-300'
        }
      case 'legendary':
        return {
          bg: 'bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-yellow-900 dark:to-orange-800',
          border: 'border-yellow-300 dark:border-yellow-700',
          icon: 'bg-yellow-200 dark:bg-yellow-700',
          text: 'text-yellow-700 dark:text-yellow-300'
        }
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900',
          border: 'border-gray-300 dark:border-gray-700',
          icon: 'bg-gray-200 dark:bg-gray-700',
          text: 'text-gray-700 dark:text-gray-300'
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          card: 'p-3',
          icon: 'h-8 w-8 p-1.5',
          iconSize: 'h-5 w-5',
          title: 'text-sm',
          description: 'text-xs',
          badge: 'text-xs px-2 py-0.5'
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
          card: 'p-4',
          icon: 'h-12 w-12 p-2.5',
          iconSize: 'h-7 w-7',
          title: 'text-lg',
          description: 'text-sm',
          badge: 'text-xs px-2.5 py-1'
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
        rarityStyles.bg,
        rarityStyles.border,
        !achievement.unlocked && "opacity-60 grayscale",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
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