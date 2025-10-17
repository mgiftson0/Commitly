import { Target, Trophy, Flame, Calendar, Users, Star, Award, Crown, CheckCircle, TrendingUp, Clock, Zap, Heart, Shield, Rocket, Diamond, Gem, Medal, Gift, Sparkles, Mountain, Sun, Moon, Coffee, Book, Dumbbell, Briefcase, Home, Music, Camera, Gamepad2 } from "lucide-react"

export interface Achievement {
  id: string
  type: string
  title: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon: any
  color: string
  condition: (goals: any[], userStats: any) => { unlocked: boolean; progress: number; total: number }
}

export const ACHIEVEMENTS: Achievement[] = [
  // Beginner Achievements (Common)
  {
    id: "first_goal",
    type: "milestone",
    title: "First Steps",
    description: "Create your very first goal",
    rarity: "common",
    icon: Target,
    color: "text-green-600",
    condition: (goals) => ({
      unlocked: goals.length >= 1,
      progress: Math.min(goals.length, 1),
      total: 1
    })
  },
  {
    id: "first_completion",
    type: "completion",
    title: "Achiever",
    description: "Complete your first goal",
    rarity: "common",
    icon: CheckCircle,
    color: "text-blue-600",
    condition: (goals) => {
      const completed = goals.filter(g => g.completedAt).length
      return {
        unlocked: completed >= 1,
        progress: Math.min(completed, 1),
        total: 1
      }
    }
  },
  {
    id: "early_bird",
    type: "time",
    title: "Early Bird",
    description: "Complete a goal before 9 AM",
    rarity: "common",
    icon: Sun,
    color: "text-yellow-600",
    condition: (goals) => {
      const earlyCompletions = goals.filter(g => {
        if (!g.completedAt) return false
        const hour = new Date(g.completedAt).getHours()
        return hour < 9
      }).length
      return {
        unlocked: earlyCompletions >= 1,
        progress: Math.min(earlyCompletions, 1),
        total: 1
      }
    }
  },
  {
    id: "night_owl",
    type: "time",
    title: "Night Owl",
    description: "Complete a goal after 10 PM",
    rarity: "common",
    icon: Moon,
    color: "text-purple-600",
    condition: (goals) => {
      const lateCompletions = goals.filter(g => {
        if (!g.completedAt) return false
        const hour = new Date(g.completedAt).getHours()
        return hour >= 22
      }).length
      return {
        unlocked: lateCompletions >= 1,
        progress: Math.min(lateCompletions, 1),
        total: 1
      }
    }
  },
  {
    id: "social_butterfly",
    type: "social",
    title: "Social Butterfly",
    description: "Add your first accountability partner",
    rarity: "common",
    icon: Users,
    color: "text-pink-600",
    condition: (goals) => {
      const withPartners = goals.filter(g => g.accountabilityPartners?.length > 0).length
      return {
        unlocked: withPartners >= 1,
        progress: Math.min(withPartners, 1),
        total: 1
      }
    }
  },

  // Progress Achievements (Common to Rare)
  {
    id: "goal_collector",
    type: "milestone",
    title: "Goal Collector",
    description: "Create 5 goals",
    rarity: "common",
    icon: Trophy,
    color: "text-amber-600",
    condition: (goals) => ({
      unlocked: goals.length >= 5,
      progress: Math.min(goals.length, 5),
      total: 5
    })
  },
  {
    id: "completionist",
    type: "completion",
    title: "Completionist",
    description: "Complete 5 goals",
    rarity: "rare",
    icon: Medal,
    color: "text-green-600",
    condition: (goals) => {
      const completed = goals.filter(g => g.completedAt).length
      return {
        unlocked: completed >= 5,
        progress: Math.min(completed, 5),
        total: 5
      }
    }
  },
  {
    id: "goal_master",
    type: "completion",
    title: "Goal Master",
    description: "Complete 10 goals",
    rarity: "epic",
    icon: Crown,
    color: "text-purple-600",
    condition: (goals) => {
      const completed = goals.filter(g => g.completedAt).length
      return {
        unlocked: completed >= 10,
        progress: Math.min(completed, 10),
        total: 10
      }
    }
  },
  {
    id: "legend",
    type: "completion",
    title: "Legend",
    description: "Complete 25 goals",
    rarity: "legendary",
    icon: Diamond,
    color: "text-cyan-600",
    condition: (goals) => {
      const completed = goals.filter(g => g.completedAt).length
      return {
        unlocked: completed >= 25,
        progress: Math.min(completed, 25),
        total: 25
      }
    }
  },

  // Streak Achievements
  {
    id: "streak_starter",
    type: "streak",
    title: "Streak Starter",
    description: "Maintain a 3-day streak",
    rarity: "common",
    icon: Flame,
    color: "text-orange-600",
    condition: (goals) => {
      const maxStreak = Math.max(...goals.map(g => g.streak || 0), 0)
      return {
        unlocked: maxStreak >= 3,
        progress: Math.min(maxStreak, 3),
        total: 3
      }
    }
  },
  {
    id: "streak_warrior",
    type: "streak",
    title: "Streak Warrior",
    description: "Maintain a 7-day streak",
    rarity: "rare",
    icon: Shield,
    color: "text-red-600",
    condition: (goals) => {
      const maxStreak = Math.max(...goals.map(g => g.streak || 0), 0)
      return {
        unlocked: maxStreak >= 7,
        progress: Math.min(maxStreak, 7),
        total: 7
      }
    }
  },
  {
    id: "streak_champion",
    type: "streak",
    title: "Streak Champion",
    description: "Maintain a 30-day streak",
    rarity: "epic",
    icon: Rocket,
    color: "text-blue-600",
    condition: (goals) => {
      const maxStreak = Math.max(...goals.map(g => g.streak || 0), 0)
      return {
        unlocked: maxStreak >= 30,
        progress: Math.min(maxStreak, 30),
        total: 30
      }
    }
  },
  {
    id: "streak_legend",
    type: "streak",
    title: "Streak Legend",
    description: "Maintain a 100-day streak",
    rarity: "legendary",
    icon: Gem,
    color: "text-emerald-600",
    condition: (goals) => {
      const maxStreak = Math.max(...goals.map(g => g.streak || 0), 0)
      return {
        unlocked: maxStreak >= 100,
        progress: Math.min(maxStreak, 100),
        total: 100
      }
    }
  },

  // Category Specific Achievements
  {
    id: "fitness_enthusiast",
    type: "category",
    title: "Fitness Enthusiast",
    description: "Complete 3 health & fitness goals",
    rarity: "rare",
    icon: Dumbbell,
    color: "text-green-600",
    condition: (goals) => {
      const fitnessGoals = goals.filter(g => 
        (g.category === 'health-fitness' || g.category === 'Health & Fitness') && g.completedAt
      ).length
      return {
        unlocked: fitnessGoals >= 3,
        progress: Math.min(fitnessGoals, 3),
        total: 3
      }
    }
  },
  {
    id: "knowledge_seeker",
    type: "category",
    title: "Knowledge Seeker",
    description: "Complete 3 learning goals",
    rarity: "rare",
    icon: Book,
    color: "text-blue-600",
    condition: (goals) => {
      const learningGoals = goals.filter(g => 
        (g.category === 'learning' || g.category === 'Learning') && g.completedAt
      ).length
      return {
        unlocked: learningGoals >= 3,
        progress: Math.min(learningGoals, 3),
        total: 3
      }
    }
  },
  {
    id: "career_climber",
    type: "category",
    title: "Career Climber",
    description: "Complete 3 career goals",
    rarity: "rare",
    icon: Briefcase,
    color: "text-purple-600",
    condition: (goals) => {
      const careerGoals = goals.filter(g => 
        (g.category === 'career' || g.category === 'Career') && g.completedAt
      ).length
      return {
        unlocked: careerGoals >= 3,
        progress: Math.min(careerGoals, 3),
        total: 3
      }
    }
  },
  {
    id: "personal_growth",
    type: "category",
    title: "Personal Growth",
    description: "Complete 3 personal goals",
    rarity: "rare",
    icon: Star,
    color: "text-yellow-600",
    condition: (goals) => {
      const personalGoals = goals.filter(g => 
        (g.category === 'personal' || g.category === 'Personal') && g.completedAt
      ).length
      return {
        unlocked: personalGoals >= 3,
        progress: Math.min(personalGoals, 3),
        total: 3
      }
    }
  },

  // Speed Achievements
  {
    id: "speed_demon",
    type: "speed",
    title: "Speed Demon",
    description: "Complete a goal within 24 hours of creation",
    rarity: "rare",
    icon: Zap,
    color: "text-yellow-600",
    condition: (goals) => {
      const quickCompletions = goals.filter(g => {
        if (!g.completedAt || !g.createdAt) return false
        const timeDiff = new Date(g.completedAt).getTime() - new Date(g.createdAt).getTime()
        return timeDiff <= 24 * 60 * 60 * 1000
      }).length
      return {
        unlocked: quickCompletions >= 1,
        progress: Math.min(quickCompletions, 1),
        total: 1
      }
    }
  },
  {
    id: "lightning_fast",
    type: "speed",
    title: "Lightning Fast",
    description: "Complete 3 goals within 24 hours each",
    rarity: "epic",
    icon: Sparkles,
    color: "text-cyan-600",
    condition: (goals) => {
      const quickCompletions = goals.filter(g => {
        if (!g.completedAt || !g.createdAt) return false
        const timeDiff = new Date(g.completedAt).getTime() - new Date(g.createdAt).getTime()
        return timeDiff <= 24 * 60 * 60 * 1000
      }).length
      return {
        unlocked: quickCompletions >= 3,
        progress: Math.min(quickCompletions, 3),
        total: 3
      }
    }
  },

  // Perfectionist Achievements
  {
    id: "perfectionist",
    type: "perfect",
    title: "Perfectionist",
    description: "Complete 3 goals with 100% accuracy",
    rarity: "epic",
    icon: Award,
    color: "text-emerald-600",
    condition: (goals) => {
      const perfectGoals = goals.filter(g => g.completedAt && g.progress === 100).length
      return {
        unlocked: perfectGoals >= 3,
        progress: Math.min(perfectGoals, 3),
        total: 3
      }
    }
  },

  // Social Achievements
  {
    id: "team_player",
    type: "social",
    title: "Team Player",
    description: "Complete 3 group goals",
    rarity: "rare",
    icon: Users,
    color: "text-blue-600",
    condition: (goals) => {
      const groupGoals = goals.filter(g => g.type === 'group' && g.completedAt).length
      return {
        unlocked: groupGoals >= 3,
        progress: Math.min(groupGoals, 3),
        total: 3
      }
    }
  },
  {
    id: "motivator",
    type: "social",
    title: "The Motivator",
    description: "Send 10 encouragement messages",
    rarity: "rare",
    icon: Heart,
    color: "text-pink-600",
    condition: (goals, userStats) => {
      const messages = userStats?.encouragementsSent || 0
      return {
        unlocked: messages >= 10,
        progress: Math.min(messages, 10),
        total: 10
      }
    }
  },

  // Time-based Achievements
  {
    id: "consistency_king",
    type: "consistency",
    title: "Consistency King",
    description: "Complete goals for 7 consecutive days",
    rarity: "epic",
    icon: Calendar,
    color: "text-indigo-600",
    condition: (goals) => {
      // Check for consecutive days with completions
      const completionDates = goals
        .filter(g => g.completedAt)
        .map(g => new Date(g.completedAt).toDateString())
      const uniqueDates = [...new Set(completionDates)].sort()
      
      let maxConsecutive = 0
      let current = 1
      
      for (let i = 1; i < uniqueDates.length; i++) {
        const prev = new Date(uniqueDates[i-1])
        const curr = new Date(uniqueDates[i])
        const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
        
        if (diffDays === 1) {
          current++
        } else {
          maxConsecutive = Math.max(maxConsecutive, current)
          current = 1
        }
      }
      maxConsecutive = Math.max(maxConsecutive, current)
      
      return {
        unlocked: maxConsecutive >= 7,
        progress: Math.min(maxConsecutive, 7),
        total: 7
      }
    }
  },

  // Special Achievements
  {
    id: "weekend_warrior",
    type: "special",
    title: "Weekend Warrior",
    description: "Complete 5 goals on weekends",
    rarity: "rare",
    icon: Mountain,
    color: "text-green-600",
    condition: (goals) => {
      const weekendCompletions = goals.filter(g => {
        if (!g.completedAt) return false
        const day = new Date(g.completedAt).getDay()
        return day === 0 || day === 6 // Sunday or Saturday
      }).length
      return {
        unlocked: weekendCompletions >= 5,
        progress: Math.min(weekendCompletions, 5),
        total: 5
      }
    }
  },
  {
    id: "multitasker",
    type: "special",
    title: "Multitasker",
    description: "Have 5 active goals simultaneously",
    rarity: "rare",
    icon: TrendingUp,
    color: "text-purple-600",
    condition: (goals) => {
      const activeGoals = goals.filter(g => !g.completedAt && g.status === 'active').length
      return {
        unlocked: activeGoals >= 5,
        progress: Math.min(activeGoals, 5),
        total: 5
      }
    }
  },
  {
    id: "comeback_kid",
    type: "special",
    title: "Comeback Kid",
    description: "Resume and complete a paused goal",
    rarity: "rare",
    icon: Rocket,
    color: "text-orange-600",
    condition: (goals) => {
      const resumedGoals = goals.filter(g => g.completedAt && g.resumedAt).length
      return {
        unlocked: resumedGoals >= 1,
        progress: Math.min(resumedGoals, 1),
        total: 1
      }
    }
  },

  // Advanced Achievements
  {
    id: "goal_architect",
    type: "advanced",
    title: "Goal Architect",
    description: "Create goals in all 4 categories",
    rarity: "epic",
    icon: Crown,
    color: "text-gold-600",
    condition: (goals) => {
      const categories = new Set(goals.map(g => g.category))
      const requiredCategories = ['health-fitness', 'learning', 'career', 'personal']
      const hasAllCategories = requiredCategories.every(cat => 
        categories.has(cat) || categories.has(cat.replace('-', ' & ').replace(/\b\w/g, l => l.toUpperCase()))
      )
      return {
        unlocked: hasAllCategories,
        progress: requiredCategories.filter(cat => 
          categories.has(cat) || categories.has(cat.replace('-', ' & ').replace(/\b\w/g, l => l.toUpperCase()))
        ).length,
        total: 4
      }
    }
  },
  {
    id: "time_master",
    type: "advanced",
    title: "Time Master",
    description: "Complete goals at different times of day",
    rarity: "epic",
    icon: Clock,
    color: "text-blue-600",
    condition: (goals) => {
      const completionHours = goals
        .filter(g => g.completedAt)
        .map(g => new Date(g.completedAt).getHours())
      
      const timeSlots = {
        morning: completionHours.some(h => h >= 6 && h < 12),
        afternoon: completionHours.some(h => h >= 12 && h < 18),
        evening: completionHours.some(h => h >= 18 && h < 24),
        night: completionHours.some(h => h >= 0 && h < 6)
      }
      
      const slotsCompleted = Object.values(timeSlots).filter(Boolean).length
      return {
        unlocked: slotsCompleted >= 3,
        progress: slotsCompleted,
        total: 3
      }
    }
  },

  // Ultimate Achievements
  {
    id: "goal_emperor",
    type: "ultimate",
    title: "Goal Emperor",
    description: "Complete 50 goals",
    rarity: "legendary",
    icon: Crown,
    color: "text-gold-600",
    condition: (goals) => {
      const completed = goals.filter(g => g.completedAt).length
      return {
        unlocked: completed >= 50,
        progress: Math.min(completed, 50),
        total: 50
      }
    }
  },
  {
    id: "immortal_streak",
    type: "ultimate",
    title: "Immortal Streak",
    description: "Maintain a 365-day streak",
    rarity: "legendary",
    icon: Gem,
    color: "text-rainbow",
    condition: (goals) => {
      const maxStreak = Math.max(...goals.map(g => g.streak || 0), 0)
      return {
        unlocked: maxStreak >= 365,
        progress: Math.min(maxStreak, 365),
        total: 365
      }
    }
  }
]

export function checkAchievements(goals: any[], userStats: any = {}) {
  return ACHIEVEMENTS.map(achievement => {
    const result = achievement.condition(goals, userStats)
    return {
      ...achievement,
      unlocked: result.unlocked,
      progress: result.progress,
      total: result.total,
      progressPercentage: Math.round((result.progress / result.total) * 100)
    }
  })
}

export function getNewlyUnlockedAchievements(goals: any[], userStats: any = {}) {
  const existingAchievements = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]')
  const currentAchievements = checkAchievements(goals, userStats)
  
  const newlyUnlocked = currentAchievements.filter(achievement => 
    achievement.unlocked && !existingAchievements.includes(achievement.id)
  )
  
  if (newlyUnlocked.length > 0) {
    const updatedUnlocked = [...existingAchievements, ...newlyUnlocked.map(a => a.id)]
    localStorage.setItem('unlockedAchievements', JSON.stringify(updatedUnlocked))
  }
  
  return newlyUnlocked
}