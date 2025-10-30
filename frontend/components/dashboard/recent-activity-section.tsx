"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle2, Target, Trophy, Users, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  time: string
  icon: React.ComponentType<any>
  color: string
  goalId?: string
}

interface RecentActivitySectionProps {
  activities: ActivityItem[]
  animationsLoaded: boolean
  exitingItems: Set<string>
  enteringItems: Set<string>
}

export function RecentActivitySection({
  activities,
  animationsLoaded,
  exitingItems,
  enteringItems
}: RecentActivitySectionProps) {
  const router = useRouter()

  return (
    <Card className="hover-lift h-[420px] w-full flex flex-col hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1 shadow-slate-900/15 transition-all duration-200 border-2 border-blue-400/50 overflow-hidden">
      <CardHeader className="flex-shrink-0 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <Link href="/notifications">
            <Button variant="ghost" size="sm" className="h-8">
              View All
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pb-4">
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No recent activity yet. Complete some goals to see your progress here!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.slice(0, 3).map((activity: ActivityItem, index) => {
              const Icon = activity.icon
              const getNotificationColor = (type: string) => {
                if (type === 'goal_completed') return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                if (type === 'streak_milestone') return 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'
                if (type === 'partner_joined') return 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'
                if (type === 'goal_created') return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                if (type === 'activity_completed') return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                if (type === 'encouragement_received') return 'bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800'
                return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
              }
              return (
                <div
                  key={activity.id}
                  className={`relative aurora-glow rounded-lg transition-all duration-500 ease-in-out hover:scale-105 ${
                    exitingItems.has(activity.id)
                      ? 'animate-out slide-out-to-bottom-full duration-600 fill-mode-forwards'
                      : enteringItems.has(activity.id)
                      ? 'animate-in slide-in-from-top-full duration-800 fill-mode-forwards'
                      : animationsLoaded
                      ? `animate-in slide-in-from-top-full duration-800 fill-mode-forwards ${index === 0 ? 'delay-200' : index === 1 ? 'delay-400' : 'delay-600'}`
                      : 'opacity-0'
                  }`}
                >
                  <div className={`flex items-start gap-2 p-2 rounded-lg border transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 ${getNotificationColor(activity.type)}`} onClick={() => activity.goalId && router.push(`/goals/${activity.goalId}`)}>
                    <div className="p-1.5 rounded bg-white dark:bg-slate-800/50 mt-0.5">
                      <Icon className={`h-3.5 w-3.5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">{activity.title}</h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 whitespace-nowrap">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                        {activity.description}
                      </p>
                      {activity.goalId && (
                        <div className="mt-1">
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            View Goal →
                          </span>
                        </div>
                      )}
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
