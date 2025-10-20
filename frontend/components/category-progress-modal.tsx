"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Heart, BookOpen, Briefcase, Star } from "lucide-react"

// Progress-based color utility
const getProgressColor = (progress: number) => {
  if (progress < 30) return 'text-red-500'
  if (progress <= 70) return 'text-yellow-500'
  return 'text-green-500'
}

interface CategoryProgressModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryStats: any[]
}

export function CategoryProgressModal({ open, onOpenChange, categoryStats }: CategoryProgressModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-md mx-2 sm:mx-4 p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            All Category Progress
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4 max-h-[70vh] sm:max-h-96 overflow-y-auto">
          {categoryStats.map((category) => {
            const Icon = category.icon
            const percentage = (category.completed / category.total) * 100
            return (
              <div key={category.name} className="space-y-2 p-2 sm:p-3 rounded-lg border bg-card">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                    <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 ${category.color.replace('bg-', 'text-')}`} />
                    <span className="text-xs sm:text-sm font-medium truncate">{category.name}</span>
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                    {category.completed}/{category.total}
                  </span>
                </div>
                <Progress value={percentage} className={`h-1.5 sm:h-2 ${getProgressColor(percentage)}`} />
                <div className="text-[10px] sm:text-xs text-muted-foreground text-center">
                  {Math.round(percentage)}% Complete
                </div>
              </div>
            )
          })}
          
          {categoryStats.length === 0 && (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-50" />
              <p className="text-xs sm:text-sm">No category progress yet</p>
              <p className="text-[10px] sm:text-xs mt-1">Create goals in different categories to see progress!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
