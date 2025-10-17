"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Trophy,
  Target,
  Flame,
  Star,
  Award,
  Crown,
  Zap,
  CheckCircle2,
  Calendar,
  Users,
  TrendingUp,
  Heart
} from "lucide-react"

export type AchievementType = 
  | 'first_goal' 
  | 'goal_master' 
  | 'streak_warrior' 
  | 'consistency_champion'
  | 'early_bird'
  | 'night_owl'
  | 'social_butterfly'
  | 'mentor'
  | 'perfectionist'
  | 'speed_demon'
  | 'marathon_runner'
  | 'category_expert'

export interface Achievement {
  id: string
  type: AchievementType
  title: string
  description: string
  icon: any
  color: string
  bgColor: string
  borderColor: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt: string
  progress?: number
  maxProgress?: number
}

const achievementConfig: Record<AchievementType, Omit<Achievement, 'id' | 'unlockedAt' | 'progress' | 'maxProgress'>> = {
  first_goal: {
    type: 'first_goal',
    title: 'First Steps',
    description: 'Created your first goal',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    rarity: 'common'
  },
  goal_master: {
    type: 'goal_master',
    title: 'Goal Master',
    description: 'Completed 10 goals',
    icon: Trophy,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    rarity: 'epic'
  },
  streak_warrior: {
    type: 'streak_warrior',
    title: 'Streak Warrior',
    description: 'Maintained a 30-day streak',
    icon: Flame,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    rarity: 'rare'
  },
  consistency_champion: {
    type: 'consistency_champion',
    title: 'Consistency Champion',
    description: 'Completed goals for 7 days straight',
    icon: Award,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    rarity: 'rare'
  },
  early_bird: {
    type: 'early_bird',
    title: 'Early Bird',
    description: 'Completed 5 goals before 8 AM',
    icon: Star,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    rarity: 'common'
  },
  night_owl: {
    type: 'night_owl',
    title: 'Night Owl',
    description: 'Completed 5 goals after 10 PM',
    icon: Crown,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    rarity: 'common'
  },
  social_butterfly: {
    type: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Added 5 accountability partners',
    icon: Users,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    rarity: 'rare'
  },
  mentor: {
    type: 'mentor',
    title: 'Mentor',
    description: 'Helped 3 partners achieve their goals',
    icon: Heart,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    rarity: 'epic'
  },
  perfectionist: {
    type: 'perfectionist',
    title: 'Perfectionist',
    description: 'Completed 5 goals with 100% accuracy',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    rarity: 'rare'
  },
  speed_demon: {
    type: 'speed_demon',
    title: 'Speed Demon',
    description: 'Completed a goal in under 24 hours',
    icon: Zap,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    rarity: 'common'
  },
  marathon_runner: {
    type: 'marathon_runner',
    title: 'Marathon Runner',
    description: 'Maintained a goal for 100 days',
    icon: Calendar,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    rarity: 'legendary'
  },
  category_expert: {
    type: 'category_expert',
    title: 'Category Expert',
    description: 'Completed 10 goals in one category',
    icon: TrendingUp,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    rarity: 'epic'
  }
}

const rarityConfig = {
  common: {
    badge: 'bg-gray-100 text-gray-700 border-gray-300',
    glow: '',
    label: 'Common'
  },
  rare: {
    badge: 'bg-blue-100 text-blue-700 border-blue-300',
    glow: 'shadow-blue-200/50',
    label: 'Rare'
  },
  epic: {
    badge: 'bg-purple-100 text-purple-700 border-purple-300',
    glow: 'shadow-purple-200/50',
    label: 'Epic'
  },
  legendary: {
    badge: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-orange-300',
    glow: 'shadow-orange-200/50 shadow-lg',
    label: 'Legendary'
  }
}

interface AchievementBadgeProps {
  achievement: Achievement
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
}

export function AchievementBadge({ achievement, size = 'md', showProgress = false }: AchievementBadgeProps) {
  const config = achievementConfig[achievement.type]
  const rarity = rarityConfig[achievement.rarity]
  const Icon = config.icon

  const sizeClasses = {
    sm: {
      card: 'p-2',
      icon: 'h-4 w-4',
      title: 'text-xs font-medium',
      desc: 'text-xs',
      badge: 'text-xs px-1.5 py-0.5'
    },
    md: {
      card: 'p-3',
      icon: 'h-5 w-5',
      title: 'text-sm font-medium',
      desc: 'text-xs',
      badge: 'text-xs px-2 py-1'
    },
    lg: {
      card: 'p-4',
      icon: 'h-6 w-6',
      title: 'text-base font-semibold',
      desc: 'text-sm',
      badge: 'text-sm px-2 py-1'
    }
  }

  const classes = sizeClasses[size]

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2 ${rarity.glow} transition-all hover:scale-105 cursor-pointer`}>
      <CardContent className={classes.card}>
        <div className="flex items-start gap-2">
          <div className={`p-1.5 rounded-full ${config.bgColor} ${config.borderColor} border`}>
            <Icon className={`${classes.icon} ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <h3 className={`${classes.title} truncate`}>{config.title}</h3>
              <Badge variant="outline" className={`${classes.badge} ${rarity.badge} border`}>
                {rarity.label}
              </Badge>
            </div>
            <p className={`${classes.desc} text-muted-foreground line-clamp-2`}>
              {config.description}
            </p>
            {showProgress && achievement.progress !== undefined && achievement.maxProgress && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{achievement.progress}/{achievement.maxProgress}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${config.color.replace('text-', 'bg-')}`}
                    style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  />
                </div>
              </div>
            )}
            <div className="mt-1">
              <span className="text-xs text-muted-foreground">
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Achievement grid component
interface AchievementGridProps {
  achievements: Achievement[]
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
  maxItems?: number
}

export function AchievementGrid({ achievements, size = 'md', showProgress = false, maxItems }: AchievementGridProps) {
  const displayAchievements = maxItems ? achievements.slice(0, maxItems) : achievements

  return (
    <div className={`grid gap-2 ${size === 'sm' ? 'grid-cols-2 sm:grid-cols-3' : size === 'md' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
      {displayAchievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          size={size}
          showProgress={showProgress}
        />
      ))}
    </div>
  )
}

// Helper function to create achievements
export function createAchievement(
  type: AchievementType,
  progress?: number,
  maxProgress?: number
): Achievement {
  const config = achievementConfig[type]
  return {
    id: `${type}_${Date.now()}`,
    ...config,
    unlockedAt: new Date().toISOString(),
    progress,
    maxProgress
  }
}

// Sample achievements for testing
export const sampleAchievements: Achievement[] = [
  createAchievement('first_goal'),
  createAchievement('streak_warrior', 25, 30),
  createAchievement('goal_master', 7, 10),
  createAchievement('consistency_champion'),
  createAchievement('social_butterfly', 3, 5),
  createAchievement('perfectionist')
]