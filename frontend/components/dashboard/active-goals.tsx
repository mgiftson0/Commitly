import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Flame, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Goal } from "@/lib/types/dashboard"
import { getProgressColor } from "@/lib/utils/progress-colors"

interface ActiveGoalsProps {
  activeGoals: Goal[]
  loading: boolean
}

export function ActiveGoals({ activeGoals, loading }: ActiveGoalsProps) {
  if (loading) {
    return (
      <Card className="hover-lift h-[400px] w-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Active Goals
              </CardTitle>
              <CardDescription>
                {activeGoals.length} goals in progress
              </CardDescription>
            </div>
            <Link href="/goals">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Target className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
            <p className="text-slate-600">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover-lift h-[400px] w-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Active Goals
            </CardTitle>
            <CardDescription>
              {activeGoals.length} goals in progress
            </CardDescription>
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
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 3)
              .map((goal) => (
                <div key={goal.id} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer h-[80px] w-full">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-medium text-sm truncate text-slate-900 dark:text-slate-100">{goal.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {goal.goal_type}
                      </Badge>
                      {goal.streak > 0 && (
                        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                          <Flame className="h-3 w-3 text-orange-500 dark:text-orange-400" />
                          <span>{goal.streak}d</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col justify-center">
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{goal.progress}%</div>
                    <Progress value={goal.progress} className={`w-16 h-1.5 mt-1 ${getProgressColor(goal.progress)}`} />
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
