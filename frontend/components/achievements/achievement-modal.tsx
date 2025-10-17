"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Calendar, CheckCircle } from "lucide-react"
import { AchievementSquare } from "@/components/achievements/achievement-square"

interface AchievementModalProps {
  achievement: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AchievementModal({ achievement, open, onOpenChange }: AchievementModalProps) {
  if (!achievement) return null

  const Icon = achievement.icon
  
  const getRarityColor = () => {
    switch (achievement.rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md mx-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg sm:text-xl font-bold text-center">
            Achievement Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Achievement Card Display */}
          <div className="flex justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24">
              <AchievementSquare 
                achievement={achievement}
                size="lg"
              />
            </div>
          </div>
          
          {/* Achievement Info */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg sm:text-xl font-bold">{achievement.title}</h3>
                <Badge className={`text-xs ${getRarityColor()}`}>
                  {achievement.rarity.toUpperCase()}
                </Badge>
              </div>
              
              <p className="text-sm sm:text-base text-muted-foreground text-center leading-relaxed">
                {achievement.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progress</span>
                  <span className="text-muted-foreground">
                    {achievement.progress}/{achievement.total}
                  </span>
                </div>
                <Progress value={achievement.progressPercentage} className="h-2" />
                <div className="text-center text-xs text-muted-foreground">
                  {achievement.progressPercentage}% Complete
                </div>
              </div>

              {achievement.unlocked && (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-green-800 dark:text-green-200 text-sm">
                      Achievement Unlocked!
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Congratulations on your accomplishment
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                <Calendar className="h-3 w-3" />
                <span>Category: {achievement.type}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}