"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, Flame, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface GoalItem {
  id: string
  title: string
  description?: string
  category?: string
  progress?: number
  status?: string
  streak?: number
  goal_type?: string
  is_seasonal?: boolean
  duration_type?: string
  created_at?: string
}

interface ActiveGoalsSectionProps {
  goals: GoalItem[]
  animationsLoaded: boolean
  exitingItems: Set<string>
  enteringItems: Set<string>
}

export function ActiveGoalsSection({
  goals,
  animationsLoaded,
  exitingItems,
  enteringItems
}: ActiveGoalsSectionProps) {
  const router = useRouter()

  const activeGoals = goals.filter(g => !g.status || g.status === 'active')

  const handleGoalClick = (goal: GoalItem) => {
    console.log('Clicking goal:', goal)
    console.log('Goal ID:', goal.id, 'Type:', typeof goal.id)
    if (goal.id && goal.id !== 'undefined' && goal.id !== 'null' && !isNaN(Number(goal.id))) {
      router.push(`/goals/${goal.id}`)
    } else {
      console.error('Invalid goal ID:', goal.id, 'Full goal object:', goal)
    }
  }

  return (
    <Card className="hover-lift h-[380px] w-full flex flex-col hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1 shadow-slate-900/15 transition-all duration-200 border-2 border-yellow-400/50 overflow-hidden">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Active Goals
            </CardTitle>

          </div>
          <Link href="/goals">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {activeGoals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No active goals yet. Create your first goal to get started!
            </p>
            <Link href="/goals/create">
              <Button>Create Your First Goal</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals
              .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
              .slice(0, 3)
              .map((goal, index) => {
                const isSeasonalGoal = goal.is_seasonal || goal.duration_type === 'seasonal'
                const tileSurfaceClass = isSeasonalGoal
                  ? 'border-amber-200/70 dark:border-amber-800/60 bg-gradient-to-br from-amber-50/85 via-white to-white dark:from-amber-950/20 dark:via-slate-900/40 dark:to-slate-900/60'
                  : 'border-slate-200/70 dark:border-slate-700/60 bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-900/40 dark:to-slate-900/60'
                const accentBarClass = isSeasonalGoal
                  ? 'from-amber-400 via-amber-300 to-amber-500'
                  : 'from-sky-500 via-emerald-400 to-blue-500'
                const iconWrapperClass = isSeasonalGoal
                  ? 'border border-amber-200/60 dark:border-amber-800/50 bg-amber-100/70 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300'
                  : 'border border-sky-200/60 dark:border-sky-800/50 bg-sky-100/70 dark:bg-sky-900/30 text-sky-600 dark:text-sky-300'
                return (
                  <div
                    key={goal.id}
                    className={`relative group cursor-pointer select-none overflow-hidden rounded-xl border backdrop-blur transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-xl ${tileSurfaceClass} ${
                      exitingItems.has(goal.id)
                        ? 'animate-out slide-out-to-bottom-full duration-600 fill-mode-forwards'
                        : enteringItems.has(goal.id)
                        ? 'animate-in slide-in-from-top-full duration-800 fill-mode-forwards'
                        : animationsLoaded
                        ? `animate-in slide-in-from-top-full duration-800 fill-mode-forwards ${index === 0 ? 'delay-200' : index === 1 ? 'delay-400' : 'delay-600'}`
                        : 'opacity-0'
                    }`}
                    onClick={() => handleGoalClick(goal)}
                  >
                    <span className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentBarClass} opacity-80 transition-opacity duration-500 group-hover:opacity-100`} />
                    <span className="pointer-events-none absolute -bottom-10 -right-16 h-28 w-28 rounded-full bg-gradient-to-tr from-cyan-200/40 via-blue-200/20 to-transparent blur-3xl dark:from-cyan-500/20 dark:via-blue-500/10" />
                    <div className="relative flex items-center gap-3 p-4">
                      <div className={`flex-shrink-0 rounded-xl p-3 transition-colors duration-500 ${iconWrapperClass}`}>
                        <Target className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-medium text-sm truncate text-slate-900 dark:text-slate-100">{goal.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs backdrop-blur-sm">
                            {goal.goal_type || 'Standard'}
                          </Badge>
                          {isSeasonalGoal && (
                            <Badge variant="outline" className="text-xs bg-amber-50/80 text-amber-700 border-amber-200">
                              <Flame className="h-3 w-3 mr-1" />
                              Seasonal
                            </Badge>
                          )}
                          {goal.streak && goal.streak > 0 && (
                            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                              <Flame className="h-3 w-3 text-orange-500 dark:text-orange-400" />
                              <span>{goal.streak}d</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 flex flex-col justify-center">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{goal.progress || 0}%</div>
                        <Progress value={goal.progress || 0} className={`w-16 h-1.5 mt-1 ${(goal.progress || 0) <= 30 ? '[&>div]:bg-red-500' : (goal.progress || 0) <= 70 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`} />
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        )}
      </CardContent>
    </Card>
  )
}
