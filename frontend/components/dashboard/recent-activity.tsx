import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, ArrowRight } from "lucide-react"
import { Activity } from "@/lib/types/dashboard"

interface RecentActivityProps {
  recentActivity: Activity[]
  bellShake: boolean
}

export function RecentActivity({ recentActivity, bellShake }: RecentActivityProps) {
  const getNotificationColor = (type: string) => {
    if (type === 'goal_completed') return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
    if (type === 'streak_milestone') return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
    if (type === 'partner_joined') return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950'
    if (type === 'goal_created') return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
    if (type === 'activity_completed') return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
    if (type === 'encouragement_received') return 'border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-950'
    return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
  }

  return (
    <Card className="hover-lift h-[400px] w-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Bell className={`h-5 w-5 transition-transform duration-200 ${bellShake ? 'animate-bounce' : ''}`} />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your latest achievements and updates
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4">
        <div className="flex-1 overflow-y-auto mb-4">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 flex-1">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No recent activity yet. Complete some goals to see your progress here!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((activity: Activity) => {
                const Icon = activity.icon
                return (
                  <div
                    key={activity.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer hover:bg-accent/50 ${getNotificationColor(activity.type)} ${activity.goalId ? 'hover:border-primary/50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="p-1.5 rounded-full bg-background/80">
                          <Icon className={`h-4 w-4 ${activity.color}`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm">{activity.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {activity.time}
                          </span>
                          {activity.goalId && (
                            <span className="text-xs text-primary font-medium">
                              View Goal →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className="w-full text-sm h-10 flex-shrink-0 mb-2 border border-slate-200 dark:border-slate-700"
          onClick={() => window.open('/notifications', '_self')}
        >
          View All Activity
        </Button>
      </CardContent>
    </Card>
  )
}
