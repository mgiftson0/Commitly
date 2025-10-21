import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Clock, Flame, Award } from "lucide-react"
import { TodayStats } from "@/lib/types/dashboard"

interface DashboardStatsProps {
  todayStats: TodayStats
}

export function DashboardStats({ todayStats }: DashboardStatsProps) {
  return (
    <div className="border rounded-lg p-3 sm:p-4 bg-card">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 rounded-full bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-base sm:text-lg md:text-xl font-bold">{todayStats.completed}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 rounded-full bg-orange-500/10">
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <p className="text-base sm:text-lg md:text-xl font-bold">{todayStats.pending}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 rounded-full bg-blue-500/10">
            <Flame className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-base sm:text-lg md:text-xl font-bold">{todayStats.streak}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Streak</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 rounded-full bg-purple-500/10">
            <Award className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <p className="text-base sm:text-lg md:text-xl font-bold">{todayStats.longestStreak}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Best</p>
          </div>
        </div>
      </div>
    </div>
  )
}
