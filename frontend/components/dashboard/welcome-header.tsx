import { Button } from "@/components/ui/button"
import { Plus, Users, Star } from "lucide-react"
import Link from "next/link"
import { TodayStats } from "@/lib/types/dashboard"

interface WelcomeHeaderProps {
  userName: string
  todayStats: TodayStats
  motivationEnabled: boolean
  onEnableMotivation: () => void
}

export function WelcomeHeader({
  userName,
  todayStats,
  motivationEnabled,
  onEnableMotivation
}: WelcomeHeaderProps) {
  return (
    <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-950/30 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
            Welcome back, <span className="text-blue-600 dark:text-blue-400">{userName}!</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            You're on a <span className="font-semibold text-orange-600 dark:text-orange-400">{todayStats.streak}-day streak</span>! 🔥
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Link href="/goals/create">
            <Button className="shadow-md bg-blue-600 hover:bg-blue-700 text-white" size="sm">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">New Goal</span>
            </Button>
          </Link>
          <Link href="/partners/find" className="hidden sm:block">
            <Button variant="outline" className="shadow-md border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Find Partners
            </Button>
          </Link>
          {!motivationEnabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEnableMotivation}
              className="shadow-md animate-pulse border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30"
            >
              <Star className="h-4 w-4 mr-2 animate-spin text-amber-600 dark:text-amber-400" />
              Enable Motivation
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
