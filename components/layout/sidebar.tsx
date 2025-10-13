"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Target,
  Home,
  Plus,
  Users,
  Settings,
  Trophy,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Filter
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      current: pathname === "/dashboard"
    },
    {
      name: "Goals",
      href: "/goals",
      icon: Target,
      current: pathname.startsWith("/goals"),
      badge: "12"
    },
    {
      name: "Partners",
      href: "/partners",
      icon: Users,
      current: pathname.startsWith("/partners"),
      badge: "3"
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: TrendingUp,
      current: pathname.startsWith("/analytics")
    }
  ]

  const quickActions = [
    {
      name: "Create Goal",
      href: "/goals/create",
      icon: Plus,
      color: "bg-primary text-primary-foreground"
    },
    {
      name: "Find Partners",
      href: "/partners/find",
      icon: Search,
      color: "bg-accent text-accent-foreground"
    }
  ]

  const activeGoals = [
    {
      id: 1,
      title: "Morning Workout",
      progress: 75,
      type: "recurring",
      streak: 12
    },
    {
      id: 2,
      title: "Read 30 minutes",
      progress: 45,
      type: "single",
      streak: 5
    },
    {
      id: 3,
      title: "Learn Spanish",
      progress: 30,
      type: "multi",
      streak: 8
    }
  ]

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-card transition-all duration-300",
      collapsed ? "w-16" : "w-64 md:w-80",
      className
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Commitly</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
                  item.current && "bg-primary text-primary-foreground shadow-sm",
                  collapsed && "justify-center px-0"
                )}>
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        <Separator className="mx-4" />

        {/* Quick Actions */}
        {!collapsed && (
          <div className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.name} href={action.href}>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto py-3 px-3 hover-lift"
                    >
                      <div className={cn("p-1.5 rounded-md mr-3", action.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm">{action.name}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        <Separator className="mx-4" />

        {/* Active Goals */}
        {!collapsed && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Active Goals
              </h3>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {activeGoals.map((goal) => (
                <Link key={goal.id} href={`/goals/${goal.id}`}>
                  <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors hover-lift">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium line-clamp-1">
                        {goal.title}
                      </h4>
                      <div className="flex items-center gap-1 ml-2">
                        {goal.type === "recurring" && (
                          <Flame className="h-3 w-3 text-orange-500" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {goal.streak}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-1.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {!collapsed && (
              <Link href="/goals">
                <Button variant="ghost" className="w-full mt-3 text-sm">
                  View All Goals
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Today's Summary */}
        {!collapsed && (
          <>
            <Separator className="mx-4" />
            <div className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Today's Summary
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">7</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-accent">3</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground text-center">
            <p>🔥 Current Streak: 12 days</p>
            <p className="mt-1">Keep it up!</p>
          </div>
        </div>
      )}
    </div>
  )
}
