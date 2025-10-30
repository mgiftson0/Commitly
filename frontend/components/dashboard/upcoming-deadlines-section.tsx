"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Target, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface GoalItem {
  id: string
  title: string
  dueDate: string
  progress: number
  priority: string
}

interface UpcomingDeadlinesSectionProps {
  deadlines: GoalItem[]
  animationsLoaded: boolean
  exitingItems: Set<string>
  enteringItems: Set<string>
}

export function UpcomingDeadlinesSection({
  deadlines,
  animationsLoaded,
  exitingItems,
  enteringItems
}: UpcomingDeadlinesSectionProps) {
  const router = useRouter()

  return (
    <Card className="hover-lift h-[420px] w-full flex flex-col hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 shadow-lg transition-all duration-200 border-2 border-orange-400/50 overflow-hidden">
      <CardHeader className="flex-shrink-0 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>

          </div>
          <Button variant="ghost" size="sm" className="h-8">
            View All
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pb-4">
        {deadlines.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No upcoming deadlines
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {deadlines.slice(0, 3).map((goal: GoalItem, index) => {
              const dueDate = new Date(goal.dueDate)
              const today = new Date()
              const diffTime = dueDate.getTime() - today.getTime()
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

              const getUrgencyColor = () => {
                if (diffDays < 0) return 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
                if (diffDays <= 3) return 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800'
                if (diffDays <= 7) return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800'
                return 'bg-card border-border'
              }

              const getDueDateText = () => {
                if (diffDays < 0) return 'Overdue'
                if (diffDays === 0) return 'Due Today'
                if (diffDays === 1) return 'Due Tomorrow'
                return `${diffDays} days left`
              }

              return (
                <div
                  key={goal.id}
                  className={`${
                    exitingItems.has(goal.id)
                      ? 'animate-out slide-out-to-bottom-full duration-600 fill-mode-forwards'
                      : enteringItems.has(goal.id)
                      ? 'animate-in slide-in-from-top-full duration-800 fill-mode-forwards'
                      : animationsLoaded
                      ? `animate-in slide-in-from-top-full duration-800 fill-mode-forwards ${index === 0 ? 'delay-200' : index === 1 ? 'delay-400' : 'delay-600'}`
                      : 'opacity-0'
                  } flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${getUrgencyColor()}`}
                  onClick={() => goal.id && router.push(`/goals/${goal.id}`)}
                >
                  <div className="p-1.5 rounded bg-white dark:bg-slate-800/50">
                    <Target className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{goal.title}</h4>
                      <Badge
                        variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}
                        className="text-xs h-5"
                      >
                        {goal.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                      {getDueDateText()}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {goal.progress}% complete
                      </span>
                      <Progress
                        value={goal.progress}
                        className={`flex-1 h-2 ${goal.progress <= 30 ? '[&>div]:bg-red-500' : goal.progress <= 70 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
