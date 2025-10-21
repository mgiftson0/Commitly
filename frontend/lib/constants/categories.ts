// Category constants and mappings
export const CATEGORIES = ['Health & Fitness', 'Learning', 'Career', 'Personal'] as const

export const CATEGORY_MAP = {
  'health-fitness': 'Health & Fitness',
  'learning': 'Learning',
  'career': 'Career',
  'personal': 'Personal'
} as const

export const CATEGORY_ICONS = {
  'Health & Fitness': 'Heart',
  'Learning': 'BookOpen',
  'Career': 'Briefcase',
  'Personal': 'Star'
} as const

export const CATEGORY_COLORS = {
  'Health & Fitness': 'bg-green-500',
  'Learning': 'bg-blue-500',
  'Career': 'bg-purple-500',
  'Personal': 'bg-orange-500'
} as const

// Navigation constants
export const NAVIGATION_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "Home"
  },
  {
    name: "Goals",
    href: "/goals",
    icon: "Target"
  },
  {
    name: "Partners",
    href: "/partners",
    icon: "Users"
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: "TrendingUp"
  }
] as const

// Activity type constants
export const ACTIVITY_TYPES = [
  'goal_completed',
  'streak_milestone',
  'partner_joined',
  'goal_created',
  'activity_completed',
  'encouragement_received',
  'achievement_unlocked'
] as const
