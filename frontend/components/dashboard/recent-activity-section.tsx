"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, ArrowRight } from "lucide-react"
import Link from "next/link"
import { NotificationTile } from "@/components/shared/notification-tile"

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
  return (
    <Card className="hover-lift h-[380px] w-full flex flex-col hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1 shadow-slate-900/15 transition-all duration-200 border-2 border-blue-400/50 overflow-hidden">
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
            {activities.slice(0, 3).map((activity: ActivityItem, index) => (
              <div
                key={activity.id}
                className={`relative aurora-glow rounded-lg transition-all duration-500 ease-in-out ${
                  exitingItems.has(activity.id)
                    ? 'animate-out slide-out-to-bottom-full duration-600 fill-mode-forwards'
                    : enteringItems.has(activity.id)
                    ? 'animate-in slide-in-from-top-full duration-800 fill-mode-forwards'
                    : animationsLoaded
                    ? `animate-in slide-in-from-top-full duration-800 fill-mode-forwards ${index === 0 ? 'delay-200' : index === 1 ? 'delay-400' : 'delay-600'}`
                    : 'opacity-0'
                }`}
              >
                <NotificationTile
                  id={activity.id}
                  type={activity.type}
                  title={activity.title}
                  description={activity.description}
                  time={activity.time}
                  icon={activity.icon}
                  color={activity.color}
                  goalId={activity.goalId}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
