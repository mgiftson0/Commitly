import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell, Star } from "lucide-react"

interface MotivationCardProps {
  motivationEnabled: boolean
  showMotivation: boolean
  todayMotivation: {
    quote: string
    author: string
  }
  onToggleMotivation: () => void
  onHideMotivation: () => void
}

export function MotivationCard({
  motivationEnabled,
  showMotivation,
  todayMotivation,
  onToggleMotivation,
  onHideMotivation
}: MotivationCardProps) {
  if (!motivationEnabled || !showMotivation) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-blue-100 dark:border-blue-800">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Star className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-900 dark:text-gray-100 italic truncate">
              &ldquo;{todayMotivation.quote}&rdquo;
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate">
              — {todayMotivation.author}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMotivation}
            className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full"
            title="Toggle daily notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onHideMotivation}
            className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full"
            title="Hide motivation"
          >
            ×
          </Button>
        </div>
      </div>
    </div>
  )
}
