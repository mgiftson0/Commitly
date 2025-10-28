"use client"

import { useState, useMemo } from "react"
import { AchievementGrid } from "./achievement-grid"
import { BalloonAchievementModal } from "./balloon-achievement-modal"
import { ACHIEVEMENTS_DATA } from "./achievements-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Filter, Star, Target, Users, Calendar, TrendingUp, Crown } from "lucide-react"

type Achievement = typeof ACHIEVEMENTS_DATA[0]

export function AchievementShowcase() {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Calculate achievement statistics
  const stats = useMemo(() => {
    const total = ACHIEVEMENTS_DATA.length
    const unlocked = ACHIEVEMENTS_DATA.filter(a => a.unlocked).length
    const locked = total - unlocked
    const completionRate = Math.round((unlocked / total) * 100)

    return { total, unlocked, locked, completionRate }
  }, [])

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    let achievements = ACHIEVEMENTS_DATA.map(achievement => ({
      ...achievement,
      progressPercentage: achievement.total > 0 ? Math.min((achievement.progress / achievement.total) * 100, 100) : 0
    }))

    // Apply status filter
    if (filter === 'unlocked') {
      achievements = achievements.filter(a => a.unlocked)
    } else if (filter === 'locked') {
      achievements = achievements.filter(a => !a.unlocked)
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      achievements = achievements.filter(a => a.category === categoryFilter)
    }

    return achievements
  }, [filter, categoryFilter])

  const handleAchievementClick = (achievement: Achievement) => {
    if (achievement.unlocked) {
      setSelectedAchievement(achievement)
      setShowModal(true)
    }
  }

  const categories = [
    { value: 'all', label: 'All', icon: Trophy },
    { value: 'goals', label: 'Goals', icon: Target },
    { value: 'completion', label: 'Completion', icon: Trophy },
    { value: 'streaks', label: 'Streaks', icon: TrendingUp },
    { value: 'social', label: 'Social', icon: Users },
    { value: 'progress', label: 'Progress', icon: Star },
    { value: 'special', label: 'Special', icon: Crown },
    { value: 'seasonal', label: 'Seasonal', icon: Calendar },
    { value: 'time', label: 'Time', icon: Calendar }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Achievement Showcase
          </CardTitle>
          <CardDescription>
            Track your progress across 100 unique achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.unlocked}</div>
              <div className="text-sm text-muted-foreground">Unlocked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.locked}</div>
              <div className="text-sm text-muted-foreground">Locked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'unlocked', label: 'Unlocked' },
                { value: 'locked', label: 'Locked' }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={filter === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(option.value as any)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.value}
                    variant={categoryFilter === category.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter(category.value)}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {category.label}
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredAchievements.length} of {ACHIEVEMENTS_DATA.length} achievements
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <AchievementGrid
        achievements={filteredAchievements}
        onAchievementClick={handleAchievementClick}
      />

      {/* Balloon Modal */}
      <BalloonAchievementModal
        achievement={selectedAchievement}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </div>
  )
}
