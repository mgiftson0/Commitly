"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Sparkles, Star } from "lucide-react"
import { AchievementSquare } from "@/components/achievements/achievement-square"

interface BalloonAchievementModalProps {
  achievement: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BalloonAchievementModal({ achievement, open, onOpenChange }: BalloonAchievementModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [balloonScale, setBalloonScale] = useState(0)

  useEffect(() => {
    if (open) {
      // Balloon pop animation
      setTimeout(() => setBalloonScale(1), 100)
      setTimeout(() => setShowConfetti(true), 500)
    } else {
      setBalloonScale(0)
      setShowConfetti(false)
    }
  }, [open])

  if (!achievement) return null

  const Icon = achievement.icon

  const getRarityConfig = () => {
    const rarity = achievement?.rarity || 'common'
    switch (rarity) {
      case 'common':
        return {
          bg: 'bg-gradient-to-br from-green-50/95 via-white to-green-50/95 dark:from-green-950/95 dark:to-green-950/95',
          border: 'border-green-300 dark:border-green-700',
          badge: 'bg-green-600 text-white',
          glow: 'shadow-green-200/50 dark:shadow-green-900/30',
          icon: 'text-green-600',
          balloon: 'from-green-400 to-green-500'
        }
      case 'rare':
        return {
          bg: 'bg-gradient-to-br from-blue-50/95 via-white to-blue-50/95 dark:from-blue-950/95 dark:to-blue-950/95',
          border: 'border-blue-300 dark:border-blue-700',
          badge: 'bg-blue-600 text-white',
          glow: 'shadow-blue-200/50 dark:shadow-blue-900/30',
          icon: 'text-blue-600',
          balloon: 'from-blue-400 to-blue-500'
        }
      case 'epic':
        return {
          bg: 'bg-gradient-to-br from-purple-50/95 via-white to-purple-50/95 dark:from-purple-950/95 dark:to-purple-950/95',
          border: 'border-purple-300 dark:border-purple-700',
          badge: 'bg-purple-600 text-white',
          glow: 'shadow-purple-200/50 dark:shadow-purple-900/30',
          icon: 'text-purple-600',
          balloon: 'from-purple-400 to-purple-500'
        }
      case 'legendary':
        return {
          bg: 'bg-gradient-to-br from-yellow-50/95 via-orange-50/90 to-red-50/95 dark:from-yellow-950/95 dark:via-orange-950/90 dark:to-red-950/95',
          border: 'border-yellow-300 dark:border-yellow-700',
          badge: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
          glow: 'shadow-yellow-200/50 dark:shadow-yellow-900/30',
          icon: 'text-yellow-600',
          balloon: 'from-yellow-400 via-orange-400 to-red-400'
        }
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-50/95 via-white to-gray-50/95 dark:from-gray-950/95 dark:to-gray-950/95',
          border: 'border-gray-300 dark:border-gray-700',
          badge: 'bg-gray-600 text-white',
          glow: 'shadow-gray-200/50 dark:shadow-gray-900/30',
          icon: 'text-gray-600',
          balloon: 'from-gray-400 to-gray-500'
        }
    }
  }

  const rarityConfig = getRarityConfig()
  const rarity = achievement?.rarity || 'common'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4 overflow-hidden p-0 border-0 bg-transparent shadow-none">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-t-lg" />
          <DialogHeader className="px-6 py-4 relative">
            <DialogTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-xl bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold">Achievement Unlocked!</span>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Congratulations! You have unlocked a new achievement. {achievement?.title || 'Achievement'} - {achievement?.description || 'Great job!'}
            </DialogDescription>
          </DialogHeader>
        </div>
        {/* Balloon Background */}
        <div
          className={`relative rounded-full bg-gradient-to-br ${rarityConfig.balloon} p-8 transition-transform duration-700 ease-out ${rarityConfig.glow}`}
          style={{
            transform: `scale(${balloonScale})`,
            transformOrigin: 'center bottom'
          }}
        >
          {/* Balloon String */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-white/30 rounded-full"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12 w-1 h-1 bg-white/50 rounded-full"></div>

          {/* Confetti Effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Achievement Content */}
          <div className="text-center space-y-4">
            {/* Trophy Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-150"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-full p-4 inline-block">
                <Trophy className="h-12 w-12 text-yellow-500" />
              </div>
              {/* Sparkles */}
              <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-yellow-400 animate-pulse" />
              <Sparkles className="absolute -bottom-1 -left-1 h-4 w-4 text-yellow-300 animate-pulse delay-300" />
            </div>

            {/* Achievement Badge */}
            <div className="space-y-2">
              <Badge className={`${rarityConfig.badge} text-xs px-3 py-1 font-bold uppercase tracking-wide`}>
                {rarity} Achievement
              </Badge>
              <h3 className="text-xl font-bold text-white drop-shadow-lg">
                {achievement.title}
              </h3>
              <p className="text-sm text-white/90 leading-relaxed px-2">
                {achievement.description}
              </p>
            </div>

            {/* Achievement Square */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 inline-block">
              <AchievementSquare achievement={achievement} size="lg" />
            </div>

            {/* Progress Bar */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm text-white">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Progress
                </span>
                <span className="font-bold">
                  {achievement.progress}/{achievement.total}
                </span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${achievement.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Close hint */}
        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">Click anywhere to close</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
