/**
 * Dynamic Goal Theme Styling System
 * Provides creative, type-based styling for goal pages
 */

export interface GoalTheme {
  // Container styles
  containerGradient: string
  containerBorder: string
  containerShadow: string
  
  // Header styles
  headerGradient: string
  headerText: string
  headerIcon: string
  
  // Badge styles
  badgeGradient: string
  badgeText: string
  badgeBorder: string
  
  // Progress bar
  progressBar: string
  progressTrack: string
  
  // Accent colors
  accentPrimary: string
  accentSecondary: string
  
  // Background patterns
  backgroundPattern: string
  
  // Animation
  animation: string
}

// Category-specific themes
export function getCategoryTheme(category: string): Partial<GoalTheme> {
  const normalizedCategory = category?.toLowerCase().replace(/[_\s&]/g, '-') || ''
  
  const categoryThemes: Record<string, Partial<GoalTheme>> = {
    'health-fitness': {
      containerGradient: 'from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/40 dark:via-emerald-950/40 dark:to-teal-950/40',
      containerBorder: 'border-green-300/50 dark:border-green-700/50',
      headerText: 'text-green-700 dark:text-green-300',
      headerIcon: 'text-green-600 dark:text-green-400',
      badgeGradient: 'from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50',
      progressBar: 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500',
      backgroundPattern: 'bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.12),transparent_60%)]',
    },
    'career': {
      containerGradient: 'from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40',
      containerBorder: 'border-blue-300/50 dark:border-blue-700/50',
      headerText: 'text-blue-700 dark:text-blue-300',
      headerIcon: 'text-blue-600 dark:text-blue-400',
      badgeGradient: 'from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50',
      progressBar: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500',
      backgroundPattern: 'bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.12),transparent_60%)]',
    },
    'learning': {
      containerGradient: 'from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/40 dark:via-purple-950/40 dark:to-fuchsia-950/40',
      containerBorder: 'border-violet-300/50 dark:border-violet-700/50',
      headerText: 'text-violet-700 dark:text-violet-300',
      headerIcon: 'text-violet-600 dark:text-violet-400',
      badgeGradient: 'from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50',
      progressBar: 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500',
      backgroundPattern: 'bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.12),transparent_60%)]',
    },
    'wellness': {
      containerGradient: 'from-pink-50 via-rose-50 to-red-50 dark:from-pink-950/40 dark:via-rose-950/40 dark:to-red-950/40',
      containerBorder: 'border-pink-300/50 dark:border-pink-700/50',
      headerText: 'text-pink-700 dark:text-pink-300',
      headerIcon: 'text-pink-600 dark:text-pink-400',
      badgeGradient: 'from-pink-100 to-rose-100 dark:from-pink-900/50 dark:to-rose-900/50',
      progressBar: 'bg-gradient-to-r from-pink-500 via-rose-500 to-red-500',
      backgroundPattern: 'bg-[radial-gradient(circle_at_40%_60%,rgba(236,72,153,0.12),transparent_60%)]',
    },
    'creative-arts': {
      containerGradient: 'from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/40 dark:via-amber-950/40 dark:to-yellow-950/40',
      containerBorder: 'border-orange-300/50 dark:border-orange-700/50',
      headerText: 'text-orange-700 dark:text-orange-300',
      headerIcon: 'text-orange-600 dark:text-orange-400',
      badgeGradient: 'from-orange-100 to-amber-100 dark:from-orange-900/50 dark:to-amber-900/50',
      progressBar: 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500',
      backgroundPattern: 'bg-[radial-gradient(circle_at_60%_40%,rgba(249,115,22,0.12),transparent_60%)]',
    },
    'language': {
      containerGradient: 'from-cyan-50 via-teal-50 to-emerald-50 dark:from-cyan-950/40 dark:via-teal-950/40 dark:to-emerald-950/40',
      containerBorder: 'border-cyan-300/50 dark:border-cyan-700/50',
      headerText: 'text-cyan-700 dark:text-cyan-300',
      headerIcon: 'text-cyan-600 dark:text-cyan-400',
      badgeGradient: 'from-cyan-100 to-teal-100 dark:from-cyan-900/50 dark:to-teal-900/50',
      progressBar: 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500',
      backgroundPattern: 'bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.12),transparent_60%)]',
    },
  }
  
  return categoryThemes[normalizedCategory] || {}
}

export function getGoalTheme(goalType: string, goalNature: string, isCompleted: boolean = false, category?: string): GoalTheme {
  // Start with category theme if available
  const categoryTheme = category ? getCategoryTheme(category) : {}
  
  // Completed goals get special styling
  if (isCompleted) {
    return {
      containerGradient: 'from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-950/40 dark:to-teal-950/40',
      containerBorder: 'border-emerald-300/50 dark:border-emerald-700/50',
      containerShadow: 'shadow-emerald-200/50 dark:shadow-emerald-900/50',
      headerGradient: 'from-emerald-500 to-green-600',
      headerText: 'text-emerald-700 dark:text-emerald-300',
      headerIcon: 'text-emerald-600 dark:text-emerald-400',
      badgeGradient: 'from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      badgeBorder: 'border-emerald-300 dark:border-emerald-700',
      progressBar: 'bg-gradient-to-r from-emerald-500 to-green-500',
      progressTrack: 'bg-emerald-100 dark:bg-emerald-900/30',
      accentPrimary: 'emerald',
      accentSecondary: 'green',
      backgroundPattern: 'bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)]',
      animation: 'animate-pulse-slow'
    }
  }

  // Group goals
  if (goalNature === 'group') {
    return {
      ...categoryTheme,
      containerGradient: categoryTheme.containerGradient || 'from-purple-50 via-fuchsia-50 to-pink-50 dark:from-purple-950/40 dark:via-fuchsia-950/40 dark:to-pink-950/40',
      containerBorder: categoryTheme.containerBorder || 'border-purple-300/50 dark:border-purple-700/50',
      containerShadow: 'shadow-purple-200/50 dark:shadow-purple-900/50',
      headerGradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
      headerText: categoryTheme.headerText || 'text-purple-700 dark:text-purple-300',
      headerIcon: categoryTheme.headerIcon || 'text-purple-600 dark:text-purple-400',
      badgeGradient: categoryTheme.badgeGradient || 'from-purple-100 to-fuchsia-100 dark:from-purple-900/50 dark:to-fuchsia-900/50',
      badgeText: 'text-purple-700 dark:text-purple-300',
      badgeBorder: 'border-purple-300 dark:border-purple-700',
      progressBar: categoryTheme.progressBar || 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500',
      progressTrack: 'bg-purple-100 dark:bg-purple-900/30',
      accentPrimary: 'purple',
      accentSecondary: 'fuchsia',
      backgroundPattern: categoryTheme.backgroundPattern || 'bg-[radial-gradient(circle_at_70%_30%,rgba(168,85,247,0.15),transparent_60%)]',
      animation: 'animate-gradient-shift'
    } as GoalTheme
  }

  // Seasonal goals
  if (goalNature === 'seasonal') {
    return {
      ...categoryTheme,
      containerGradient: categoryTheme.containerGradient || 'from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/40 dark:via-yellow-950/40 dark:to-orange-950/40',
      containerBorder: categoryTheme.containerBorder || 'border-amber-300/50 dark:border-amber-700/50',
      containerShadow: 'shadow-amber-200/50 dark:shadow-amber-900/50',
      headerGradient: 'from-amber-500 via-yellow-500 to-orange-500',
      headerText: categoryTheme.headerText || 'text-amber-700 dark:text-amber-300',
      headerIcon: categoryTheme.headerIcon || 'text-amber-600 dark:text-amber-400',
      badgeGradient: categoryTheme.badgeGradient || 'from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50',
      badgeText: 'text-amber-700 dark:text-amber-300',
      badgeBorder: 'border-amber-300 dark:border-amber-700',
      progressBar: categoryTheme.progressBar || 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500',
      progressTrack: 'bg-amber-100 dark:bg-amber-900/30',
      accentPrimary: 'amber',
      accentSecondary: 'yellow',
      backgroundPattern: categoryTheme.backgroundPattern || 'bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.12),transparent_70%)]',
      animation: 'animate-shimmer'
    } as GoalTheme
  }

  // Recurring goals
  if (goalType === 'recurring') {
    return {
      ...categoryTheme,
      containerGradient: categoryTheme.containerGradient || 'from-orange-50 via-red-50 to-rose-50 dark:from-orange-950/40 dark:via-red-950/40 dark:to-rose-950/40',
      containerBorder: categoryTheme.containerBorder || 'border-orange-300/50 dark:border-orange-700/50',
      containerShadow: 'shadow-orange-200/50 dark:shadow-orange-900/50',
      headerGradient: 'from-orange-500 via-red-500 to-rose-500',
      headerText: categoryTheme.headerText || 'text-orange-700 dark:text-orange-300',
      headerIcon: categoryTheme.headerIcon || 'text-orange-600 dark:text-orange-400',
      badgeGradient: categoryTheme.badgeGradient || 'from-orange-100 to-red-100 dark:from-orange-900/50 dark:to-red-900/50',
      badgeText: 'text-orange-700 dark:text-orange-300',
      badgeBorder: 'border-orange-300 dark:border-orange-700',
      progressBar: categoryTheme.progressBar || 'bg-gradient-to-r from-orange-500 via-red-500 to-rose-500',
      progressTrack: 'bg-orange-100 dark:bg-orange-900/30',
      accentPrimary: 'orange',
      accentSecondary: 'red',
      backgroundPattern: categoryTheme.backgroundPattern || 'bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.12),transparent_60%)]',
      animation: 'animate-pulse'
    } as GoalTheme
  }

  // Multi-activity goals
  if (goalType === 'multi-activity') {
    return {
      ...categoryTheme,
      containerGradient: categoryTheme.containerGradient || 'from-cyan-50 via-sky-50 to-blue-50 dark:from-cyan-950/40 dark:via-sky-950/40 dark:to-blue-950/40',
      containerBorder: categoryTheme.containerBorder || 'border-cyan-300/50 dark:border-cyan-700/50',
      containerShadow: 'shadow-cyan-200/50 dark:shadow-cyan-900/50',
      headerGradient: 'from-cyan-500 via-sky-500 to-blue-500',
      headerText: categoryTheme.headerText || 'text-cyan-700 dark:text-cyan-300',
      headerIcon: categoryTheme.headerIcon || 'text-cyan-600 dark:text-cyan-400',
      badgeGradient: categoryTheme.badgeGradient || 'from-cyan-100 to-sky-100 dark:from-cyan-900/50 dark:to-sky-900/50',
      badgeText: 'text-cyan-700 dark:text-cyan-300',
      badgeBorder: 'border-cyan-300 dark:border-cyan-700',
      progressBar: categoryTheme.progressBar || 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500',
      progressTrack: 'bg-cyan-100 dark:bg-cyan-900/30',
      accentPrimary: 'cyan',
      accentSecondary: 'sky',
      backgroundPattern: categoryTheme.backgroundPattern || 'bg-[radial-gradient(circle_at_20%_80%,rgba(6,182,212,0.12),transparent_60%)]',
      animation: 'animate-bounce-slow'
    } as GoalTheme
  }

  // Single-activity goals (default) - merge with category theme
  return {
    containerGradient: categoryTheme.containerGradient || 'from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-violet-950/40',
    containerBorder: categoryTheme.containerBorder || 'border-blue-300/50 dark:border-blue-700/50',
    containerShadow: 'shadow-blue-200/50 dark:shadow-blue-900/50',
    headerGradient: 'from-blue-500 via-indigo-500 to-violet-500',
    headerText: categoryTheme.headerText || 'text-blue-700 dark:text-blue-300',
    headerIcon: categoryTheme.headerIcon || 'text-blue-600 dark:text-blue-400',
    badgeGradient: categoryTheme.badgeGradient || 'from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50',
    badgeText: 'text-blue-700 dark:text-blue-300',
    badgeBorder: 'border-blue-300 dark:border-blue-700',
    progressBar: categoryTheme.progressBar || 'bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500',
    progressTrack: 'bg-blue-100 dark:bg-blue-900/30',
    accentPrimary: 'blue',
    accentSecondary: 'indigo',
    backgroundPattern: categoryTheme.backgroundPattern || 'bg-[radial-gradient(circle_at_50%_20%,rgba(59,130,246,0.12),transparent_60%)]',
    animation: 'animate-fade-in'
  }
}

export function getGoalTypeIcon(goalType: string) {
  const icons = {
    'recurring': '🔄',
    'single-activity': '🎯',
    'multi-activity': '📋',
    'default': '⭐'
  }
  return icons[goalType as keyof typeof icons] || icons.default
}

export function getGoalNatureIcon(goalNature: string) {
  const icons = {
    'group': '👥',
    'seasonal': '🌟',
    'individual': '👤',
    'default': '🎯'
  }
  return icons[goalNature as keyof typeof icons] || icons.default
}

export function getCategoryIcon(category: string) {
  const normalizedCategory = category?.toLowerCase().replace(/[_\s&]/g, '-') || ''
  const icons: Record<string, string> = {
    'health-fitness': '💪',
    'career': '💼',
    'learning': '📚',
    'wellness': '🧘',
    'creative-arts': '🎨',
    'language': '🌐',
    'music': '🎵',
    'education': '🎓',
    'personal': '✨',
  }
  return icons[normalizedCategory] || '🎯'
}

// Animated background patterns
export const animatedPatterns = {
  dots: 'bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]',
  grid: 'bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]',
  diagonal: 'bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.03)_10px,rgba(0,0,0,0.03)_20px)]',
  waves: 'bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.04),transparent_50%)]'
}