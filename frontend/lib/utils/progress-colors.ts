// Progress bar color utility with updated color coding
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

// Enhanced progress color functions for different contexts
export function getProgressColor(progress: number): string {
  return getProgressBarColor(progress)
}

export function getProgressTextColor(progress: number): string {
  if (progress <= 30) return 'text-red-600 dark:text-red-400'
  if (progress <= 70) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-green-600 dark:text-green-400'
}

export function getProgressBorderColor(progress: number): string {
  if (progress <= 30) return 'border-red-200 dark:border-red-800'
  if (progress <= 70) return 'border-yellow-200 dark:border-yellow-800'
  return 'border-green-200 dark:border-green-800'
}

// Progress status text based on percentage
export function getProgressStatus(progress: number): string {
  if (progress <= 30) return 'Needs Attention'
  if (progress <= 70) return 'In Progress'
  return 'On Track'
}