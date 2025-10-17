"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Heart, BookOpen, Briefcase, Star } from "lucide-react"

interface CategoryProgressModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryStats: any[]
}

export function CategoryProgressModal({ open, onOpenChange, categoryStats }: CategoryProgressModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            All Category Progress
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {categoryStats.map((category) => {
            const Icon = category.icon
            const percentage = (category.completed / category.total) * 100
            return (
              <div key={category.name} className="space-y-2 p-3 rounded-lg border bg-card">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Icon className={`h-4 w-4 flex-shrink-0 ${category.color.replace('bg-', 'text-')}`} />
                    <span className="text-sm font-medium truncate">{category.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground flex-shrink-0">
                    {category.completed}/{category.total}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="text-xs text-muted-foreground text-center">
                  {Math.round(percentage)}% Complete
                </div>
              </div>
            )
          })}
          
          {categoryStats.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No category progress yet</p>
              <p className="text-xs mt-1">Create goals in different categories to see progress!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}