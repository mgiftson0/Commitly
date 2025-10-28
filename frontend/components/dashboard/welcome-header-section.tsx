"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Plus,
  Star,
  Users,
  Settings,
  Edit,
  MapPin,
  Link as LinkIcon
} from "lucide-react"
import Link from "next/link"

interface WelcomeHeaderSectionProps {
  profile: {
    id: string
    first_name?: string
    last_name?: string
    profile_picture_url?: string
  } | null
  todayMotivation: {
    quote: string
    author: string
  }
  motivationEnabled: boolean
  showMotivation: boolean
  onToggleMotivation: () => void
  onHideMotivation: () => void
  todayStats: {
    completed: number
    pending: number
    streak: number
    longestStreak: number
  }
}

export function WelcomeHeaderSection({
  profile,
  todayMotivation,
  motivationEnabled,
  showMotivation,
  onToggleMotivation,
  onHideMotivation,
  todayStats
}: WelcomeHeaderSectionProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-600 dark:via-teal-600 dark:to-cyan-600 rounded-xl p-6 sm:p-8 shadow-xl min-h-[160px] sm:min-h-[180px]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20"></div>
      </div>

      <div className="relative flex flex-col gap-4">
        {/* Top Row - Welcome & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {/* Welcome Text Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                <img
                  src={profile?.profile_picture_url || '/default-avatar.png'}
                  alt={profile?.first_name || 'User'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="text-white font-bold text-lg">${profile?.first_name?.[0]?.toUpperCase() || 'U'}</span>`;
                    }
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  Welcome back, <span className="text-yellow-300 drop-shadow-lg">{profile?.first_name || 'User'}</span>
                </h1>
                <p className="text-emerald-100 text-sm leading-relaxed">
                  Ready to crush your goals? You're on fire with a{' '}
                  <span className="font-semibold text-yellow-300">{todayStats.streak}-day streak</span>! 🔥
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Primary Action */}
            <Link href="/goals/create" className="inline-flex">
              <Button className="bg-white text-emerald-600 hover:bg-emerald-50 font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl">
                <Plus className="h-4 w-4 mr-2" />
                <span className="text-sm">New Goal</span>
              </Button>
            </Link>

            {/* Secondary Actions Row */}
            <div className="flex gap-2">
              <Link href="/partners/find" className="hidden xs:inline-flex">
                <Button variant="outline" size="sm" className="border-white/40 bg-white/15 text-white hover:bg-white/25 hover:border-white/60 backdrop-blur-sm shadow-lg transition-all duration-200">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline text-xs">Partners</span>
                </Button>
              </Link>

              {!motivationEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleMotivation}
                  className="border-yellow-300/60 bg-yellow-400/25 text-yellow-100 hover:bg-yellow-400/35 hover:border-yellow-300 shadow-lg animate-pulse backdrop-blur-sm"
                >
                  <Star className="h-3 w-3 mr-1 animate-spin" />
                  <span className="text-xs">Motivate</span>
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="sm:hidden bg-white/15 text-white hover:bg-white/25 border-white/30 shadow-lg"
                onClick={() => {/* Could add mobile menu logic */}}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Motivation Quote Section */}
        {motivationEnabled && showMotivation && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-inner">
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-yellow-300 mt-0.5 flex-shrink-0 animate-pulse" />
              <div className="flex-1 min-w-0">
                <p className="text-white italic text-sm leading-relaxed mb-1">
                  "{todayMotivation.quote}"
                </p>
                <p className="text-emerald-100 text-xs font-medium">
                  — {todayMotivation.author}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onHideMotivation}
                className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20 rounded-full flex-shrink-0"
                title="Hide motivation"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Stats Bar */}
        <div className="pt-2 border-t border-white/25">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-white drop-shadow-lg">{todayStats.completed}</div>
              <div className="text-xs text-emerald-100 font-medium">Goals Done</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-yellow-300 drop-shadow-lg">{todayStats.streak}</div>
              <div className="text-xs text-emerald-100 font-medium">Day Streak</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-white drop-shadow-lg">{todayStats.pending}</div>
              <div className="text-xs text-emerald-100 font-medium">Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
