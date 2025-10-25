// Progress bar color utility
export function getProgressBarColor(progress: number): string {
  if (progress <= 30) return 'bg-red-500'
  if (progress <= 70) return 'bg-yellow-500' 
  return 'bg-green-500'
}

export function getProgressBarBg(progress: number): string {
  if (progress <= 30) return 'bg-red-100 dark:bg-red-950'
  if (progress <= 70) return 'bg-yellow-100 dark:bg-yellow-950'
  return 'bg-green-100 dark:bg-green-950'
}

// Legacy export for compatibility
export function getProgressColor(progress: number): string {
  return getProgressBarColor(progress)
}