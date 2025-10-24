"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"
import { StreakBadge } from "./streak-badge"

interface LeaderboardEntry {
  user_id: string
  username: string
  first_name: string
  last_name: string
  profile_picture_url?: string
  current_streak: number
  longest_streak: number
  total_completions: number
  streak_rank: number
}

interface StreakLeaderboardProps {
  entries: LeaderboardEntry[]
  goalTitle?: string
}

export function StreakLeaderboard({ entries, goalTitle }: StreakLeaderboardProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Partner Streaks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No active streaks yet
          </p>
        </CardContent>
      </Card>
    )
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-500">🥇 1st</Badge>
      case 2:
        return <Badge className="bg-gray-400">🥈 2nd</Badge>
      case 3:
        return <Badge className="bg-orange-600">🥉 3rd</Badge>
      default:
        return <Badge variant="outline">#{rank}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Partner Streaks
          {goalTitle && <span className="text-sm text-muted-foreground">• {goalTitle}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.user_id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-shrink-0">
                {getRankBadge(entry.streak_rank)}
              </div>
              
              <Avatar className="h-10 w-10">
                <AvatarImage src={entry.profile_picture_url} />
                <AvatarFallback>
                  {entry.first_name?.[0]}{entry.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {entry.first_name} {entry.last_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{entry.username} • {entry.total_completions} completions
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <StreakBadge streak={entry.current_streak} size="sm" showLabel={false} />
                {entry.longest_streak > entry.current_streak && (
                  <p className="text-xs text-muted-foreground">
                    Best: {entry.longest_streak}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
