"use client"

import { AchievementCard } from "./achievement-card"

interface AchievementGridProps {
  achievements: Array<{
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
  }>
  onAchievementClick?: (achievement: any) => void
}

export function AchievementGrid({ achievements, onAchievementClick }: AchievementGridProps) {
  if (!achievements || achievements.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No achievements found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((achievement) => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
          size="md"
          onClick={() => onAchievementClick?.(achievement)}
        />
      ))}
    </div>
  )
}