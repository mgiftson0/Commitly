"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Filter,
  LogOut,
  Moon,
  Sun,
  Monitor
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { checkAchievements } from "@/lib/achievements"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [activeGoalsFilter, setActiveGoalsFilter] = useState("all")
  const [closeAchievements, setCloseAchievements] = useState<any[]>([])
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

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

  // Mock data with categories for filtering
  const allGoals = [
    {
      id: 1,
      title: "Morning Workout",
      progress: 75,
      type: "recurring",
      streak: 12,
      category: "Health & Fitness"
    },
    {
      id: 2,
      title: "Read 30 minutes",
      progress: 45,
      type: "single",
      streak: 5,
      category: "Learning"
    },
    {
      id: 3,
      title: "Learn Spanish",
      progress: 30,
      type: "multi",
      streak: 8,
      category: "Learning"
    },
    {
      id: 4,
      title: "Meditation Practice",
      progress: 60,
      type: "recurring",
      streak: 15,
      category: "Wellness"
    },
    {
      id: 5,
      title: "Project Planning",
      progress: 20,
      type: "single",
      streak: 3,
      category: "Career"
    }
  ]

  const filteredGoals = activeGoalsFilter === "all"
    ? allGoals
    : allGoals.filter(goal => {
        switch (activeGoalsFilter) {
          case "health":
            return goal.category === "Health & Fitness"
          case "learning":
            return goal.category === "Learning"
          case "career":
            return goal.category === "Career"
          case "wellness":
            return goal.category === "Wellness"
          case "recurring":
            return goal.type === "recurring"
          case "single":
            return goal.type === "single"
          case "multi":
            return goal.type === "multi"
          default:
            return true
        }
      })

  const activeGoals = filteredGoals.slice(0, 3) // Show top 3 filtered goals

  // Load close achievements
  useEffect(() => {
    try {
      const storedGoals = localStorage.getItem('goals')
      const goals = storedGoals ? JSON.parse(storedGoals) : []
      const userStats = {
        encouragementsSent: parseInt(localStorage.getItem('encouragementsSent') || '0')
      }
      
      const allAchievements = checkAchievements(goals, userStats)
      const closeToUnlock = allAchievements
        .filter(a => !a.unlocked && a.progressPercentage >= 50)
        .sort((a, b) => b.progressPercentage - a.progressPercentage)
        .slice(0, 3)
      
      setCloseAchievements(closeToUnlock)
    } catch {
      setCloseAchievements([])
    }
  }, [])

  // Listen for goal updates
  useEffect(() => {
    const handleGoalUpdate = () => {
      try {
        const storedGoals = localStorage.getItem('goals')
        const goals = storedGoals ? JSON.parse(storedGoals) : []
        const userStats = {
          encouragementsSent: parseInt(localStorage.getItem('encouragementsSent') || '0')
        }
        
        const allAchievements = checkAchievements(goals, userStats)
        const closeToUnlock = allAchievements
          .filter(a => !a.unlocked && a.progressPercentage >= 50)
          .sort((a, b) => b.progressPercentage - a.progressPercentage)
          .slice(0, 3)
        
        setCloseAchievements(closeToUnlock)
      } catch {
        setCloseAchievements([])
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('goalUpdated', handleGoalUpdate)
      window.addEventListener('goalDeleted', handleGoalUpdate)
      window.addEventListener('storage', handleGoalUpdate)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('goalUpdated', handleGoalUpdate)
        window.removeEventListener('goalDeleted', handleGoalUpdate)
        window.removeEventListener('storage', handleGoalUpdate)
      }
    }
  }, [])

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-card transition-all duration-300 text-[13px] sm:text-[14px]",
      collapsed ? "w-14" : "w-56 md:w-72",
      className
    )}>
      {/* Header - Enhanced Mobile Profile Info */}
      <div className="flex h-14 md:h-16 items-center justify-between px-3 sm:px-4 border-b">
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

      {/* Mobile Profile Section - Only visible when collapsed on mobile */}
      {collapsed && (
        <div className="p-3 border-b md:hidden">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                {(() => {
                  try {
                    const kycData = localStorage.getItem('kycData')
                    if (kycData) {
                      const profile = JSON.parse(kycData)
                      return `${profile.firstName?.[0] || 'J'}${profile.lastName?.[0] || 'D'}`
                    }
                  } catch {}
                  return 'JD'
                })()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {(() => {
                  try {
                    const kycData = localStorage.getItem('kycData')
                    if (kycData) {
                      const profile = JSON.parse(kycData)
                      return `${profile.firstName || 'John'} ${profile.lastName || 'Doe'}`
                    }
                  } catch {}
                  return 'John Doe'
                })()}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                @{(() => {
                  try {
                    const kycData = localStorage.getItem('kycData')
                    if (kycData) {
                      const profile = JSON.parse(kycData)
                      return profile.username || 'johndoe'
                    }
                  } catch {}
                  return 'johndoe'
                })()}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Navigation */}
        <nav className="p-3 sm:p-4 space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] sm:text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
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
          <div className="p-3 sm:p-4">
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

        {/* Close Achievements */}
        {!collapsed && (
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Close to Unlock
              </h3>
              <Trophy className="h-6 w-6 text-yellow-500 animate-pulse" />
            </div>
            <div className="space-y-3">
              {closeAchievements.map((achievement) => {
                const Icon = achievement.icon
                const getRarityBg = () => {
                  switch (achievement.rarity) {
                    case 'common': return 'bg-gradient-to-br from-gray-100/80 to-gray-200/80 dark:from-gray-800/80 dark:to-gray-900/80 border-gray-300/50'
                    case 'rare': return 'bg-gradient-to-br from-blue-100/80 to-blue-200/80 dark:from-blue-900/80 dark:to-blue-800/80 border-blue-300/50'
                    case 'epic': return 'bg-gradient-to-br from-purple-100/80 to-purple-200/80 dark:from-purple-900/80 dark:to-purple-800/80 border-purple-300/50'
                    case 'legendary': return 'bg-gradient-to-br from-yellow-100/80 to-orange-200/80 dark:from-yellow-900/80 dark:to-orange-800/80 border-yellow-300/50'
                    default: return 'bg-gradient-to-br from-gray-100/80 to-gray-200/80 dark:from-gray-800/80 dark:to-gray-900/80 border-gray-300/50'
                  }
                }
                const getIconBg = () => {
                  switch (achievement.rarity) {
                    case 'common': return 'bg-gray-200/60 dark:bg-gray-700/60'
                    case 'rare': return 'bg-blue-200/60 dark:bg-blue-700/60'
                    case 'epic': return 'bg-purple-200/60 dark:bg-purple-700/60'
                    case 'legendary': return 'bg-yellow-200/60 dark:bg-yellow-700/60'
                    default: return 'bg-gray-200/60 dark:bg-gray-700/60'
                  }
                }
                return (
                  <Link key={achievement.id} href="/achievements">
                    <div className={`p-1 rounded border backdrop-blur-sm hover:backdrop-blur-md transition-all hover-lift ${getRarityBg()}`}>
                      <div className="flex items-start gap-1 mb-1">
                        <div className={`p-1 rounded ${getIconBg()} backdrop-blur-sm`}>
                          <Trophy className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11px] font-semibold line-clamp-1 mb-0.5">
                            {achievement.title}
                          </h4>
                          <div className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
                            achievement.rarity === 'common' ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                            achievement.rarity === 'rare' ? 'bg-blue-200 text-blue-700 dark:bg-blue-700 dark:text-blue-300' :
                            achievement.rarity === 'epic' ? 'bg-purple-200 text-purple-700 dark:bg-purple-700 dark:text-purple-300' :
                            'bg-yellow-200 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-300'
                          }`}>
                            {achievement.rarity}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">Progress</span>
                          <span className="font-bold">{achievement.progress}/{achievement.total}</span>
                        </div>
                        <Progress value={achievement.progressPercentage} className={`h-1 ${achievement.progressPercentage >= 90 ? '[&>div]:bg-green-500' : '[&>div]:bg-orange-500'}`} />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            {!collapsed && (
              <Link href="/achievements">
                <Button variant="ghost" className="w-full mt-4 text-sm backdrop-blur-sm">
                  View All Achievements
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Today's Summary */}
        {!collapsed && (
          <>
            <Separator className="mx-4" />
            <div className="p-3 sm:p-4">
              <h3 className="mb-2 sm:mb-3 text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Today&apos;s Summary
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
      <div className="p-3 sm:p-4 border-t mt-auto">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Theme</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme('light')} title="Light">
                  <Sun className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme('dark')} title="Dark">
                  <Moon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme('system')} title="System">
                  <Monitor className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme('light')} title="Light">
              <Sun className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme('dark')} title="Dark">
              <Moon className="h-4 w-4" />
            </Button>
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
