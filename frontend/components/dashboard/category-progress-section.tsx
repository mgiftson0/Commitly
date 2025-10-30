"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Heart, BookOpen, Briefcase, Star } from "lucide-react"
import { getProgressColor } from "@/lib/utils/progress-colors"

interface CategoryData {
  name: string
  completed: number
  total: number
  progress: number
  standardGoals: number
  seasonalGoals: number
  color: string
  icon: React.ComponentType<any>
}

interface CategoryProgressSectionProps {
  categories: CategoryData[]
  showCategoryModal: boolean
  onToggleCategoryModal: () => void
}

export function CategoryProgressSection({
  categories,
  showCategoryModal,
  onToggleCategoryModal
}: CategoryProgressSectionProps) {
  return (
    <Card className="hover-lift h-[420px] w-full flex flex-col hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 shadow-lg transition-all duration-200 border-2 border-purple-400/50">
      <CardHeader className="px-4 sm:px-6 py-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium bg-muted/30 px-2 py-1 rounded-md w-fit">
            <TrendingUp className="h-3 w-3 text-primary" />
            Category Progress
          </CardTitle>
          {categories.length > 3 && (
            <Dialog open={showCategoryModal} onOpenChange={onToggleCategoryModal}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-[10px] h-6 px-2 border bg-background">
                  View All
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>All Category Progress</DialogTitle>
                  <DialogDescription>
                    View detailed progress for all goal categories
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-hidden pr-2">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <div key={category.name} className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${category.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                          <Icon className={`h-3.5 w-3.5 ${category.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{category.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {category.completed || 0}/{category.total || 0}
                            </span>
                          </div>
                          <Progress value={category.progress} className={`h-1.5 ${getProgressColor(category.progress)}`} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
        {categories.length === 0 ? (
          <div className="text-center py-6">
            <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No goals created yet
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 sm:space-y-2">
            {categories.slice(0, 3).map((category) => {
              const Icon = category.icon
              return (
                <div key={category.name} className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Icon className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${category.color.replace('bg-', 'text-')}`} />
                      <span className="text-xs sm:text-sm font-medium truncate">{category.name}</span>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                      {category.completed || 0}/{category.total || 0}
                    </span>
                  </div>

                  <Progress value={category.progress || 0} className={`h-1.5 sm:h-2 ${(category.progress || 0) <= 30 ? '[&>div]:bg-red-500' : (category.progress || 0) <= 70 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`} />
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
