"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Calendar, CheckCircle, Star, Sparkles } from "lucide-react"
import { AchievementSquare } from "@/components/achievements/achievement-square"

interface AchievementModalProps {
  achievement: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AchievementModal({ achievement, open, onOpenChange }: AchievementModalProps) {
  if (!achievement) return null

  const Icon = achievement.icon

  const getRarityConfig = () => {
    switch (achievement.rarity) {
      case 'common':
        return {
          bg: 'bg-white/10 backdrop-blur-xl border border-white/20',
          border: 'border-green-200/50 dark:border-green-800/50',
          badge: 'bg-green-600/80 backdrop-blur-sm text-white border border-white/20',
          glow: 'shadow-green-200/60 dark:shadow-green-900/40',
          icon: 'text-green-600',
          iconBg: 'bg-green-500/20 backdrop-blur-sm border border-green-400/30'
        }
      case 'rare':
        return {
          bg: 'bg-white/15 backdrop-blur-2xl border border-white/30',
          border: 'border-blue-200/60 dark:border-blue-800/60',
          badge: 'bg-blue-600/80 backdrop-blur-sm text-white border border-white/20',
          glow: 'shadow-blue-200/70 dark:shadow-blue-900/50',
          icon: 'text-blue-600',
          iconBg: 'bg-blue-500/25 backdrop-blur-sm border border-blue-400/40'
        }
      case 'epic':
        return {
          bg: 'bg-white/20 backdrop-blur-3xl border border-white/40',
          border: 'border-purple-200/70 dark:border-purple-800/70',
          badge: 'bg-purple-600/80 backdrop-blur-sm text-white border border-white/20',
          glow: 'shadow-purple-200/80 dark:shadow-purple-900/60',
          icon: 'text-purple-600',
          iconBg: 'bg-purple-500/30 backdrop-blur-md border border-purple-400/50'
        }
      case 'legendary':
        return {
          bg: 'bg-gradient-to-br from-white/25 via-orange-50/20 to-red-50/20 backdrop-blur-3xl border-2 border-yellow-300/60 via-orange-300/60 to-red-300/60',
          border: 'border-orange-200/80 dark:border-orange-800/80',
          badge: 'bg-gradient-to-r from-yellow-500/80 via-orange-500/80 to-red-500/80 backdrop-blur-sm text-white border border-white/20',
          glow: 'shadow-yellow-200/90 via-orange-200/90 to-red-200/90 dark:shadow-yellow-900/70',
          icon: 'text-orange-600',
          iconBg: 'bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-red-400/30 backdrop-blur-md border border-yellow-300/50'
        }
      default:
        return {
          bg: 'bg-white/10 backdrop-blur-xl border border-white/20',
          border: 'border-gray-200/50 dark:border-gray-800/50',
          badge: 'bg-gray-600/80 backdrop-blur-sm text-white border border-white/20',
          glow: 'shadow-gray-200/60 dark:shadow-gray-900/40',
          icon: 'text-gray-600',
          iconBg: 'bg-gray-500/20 backdrop-blur-sm border border-gray-400/30'
        }
    }
  }

  const rarityConfig = getRarityConfig()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md mx-4 overflow-hidden ${rarityConfig.bg} ${rarityConfig.border} ${rarityConfig.glow} shadow-2xl`}>
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Trophy className={`h-6 w-6 ${rarityConfig.icon}`} />
            Achievement Unlocked!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhanced Achievement Display */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Glow effect for unlocked achievements */}
              {achievement.unlocked && (
                <div className={`absolute inset-0 rounded-full blur-xl opacity-30 ${rarityConfig.bg}`} />
              )}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                <AchievementSquare
                  achievement={achievement}
                  size="lg"
                />
              </div>
              {/* Sparkle effects for unlocked achievements */}
              {achievement.unlocked && (
                <div className="absolute -top-2 -right-2">
                  <Sparkles className={`h-4 w-4 ${rarityConfig.icon}`} />
                </div>
              )}
            </div>
          </div>

          {/* Achievement Info Card */}
          <Card className={`border-2 ${rarityConfig.border} ${rarityConfig.bg} shadow-lg`}>
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-3">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  {achievement.title}
                </h3>
                <Badge className={`text-sm px-3 py-1 ${rarityConfig.badge} border-0`}>
                  {achievement.rarity.toUpperCase()} ACHIEVEMENT
                </Badge>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground text-center leading-relaxed">
                {achievement.description}
              </p>

              {/* Enhanced Progress Section */}
              <div className="space-y-4 p-4 bg-background/50 rounded-lg border">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <Star className={`h-4 w-4 ${rarityConfig.icon}`} />
                    Progress
                  </span>
                  <span className={`font-bold ${rarityConfig.icon}`}>
                    {achievement.progress}/{achievement.total}
                  </span>
                </div>
                <Progress
                  value={achievement.progressPercentage}
                  className="h-3 bg-background/30"
                />
                <div className="text-center">
                  <span className={`text-sm font-semibold ${rarityConfig.icon}`}>
                    {achievement.progressPercentage}% Complete
                  </span>
                </div>
              </div>

              {/* Success Message */}
              {achievement.unlocked && (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-green-800 dark:text-green-200 text-sm">
                      Achievement Unlocked!
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Congratulations on your accomplishment! 🎉
                    </div>
                  </div>
                </div>
              )}

              {/* Category Info */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border/50">
                <Calendar className="h-4 w-4" />
                <span>Category: {achievement.type}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
