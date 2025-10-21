// Progress-based color utilities
export const getProgressColor = (progress: number) => {
  if (progress < 30) return 'bg-red-500'
  if (progress <= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

export const getProgressBgColor = (progress: number) => {
  if (progress < 30) return 'bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800/50'
  if (progress <= 70) return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/50 dark:border-yellow-800/50'
  return 'bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800/50'
}

export const getProgressTextColor = (progress: number) => {
  if (progress < 30) return 'text-red-600'
  if (progress <= 70) return 'text-yellow-600'
  return 'text-green-600'
}
