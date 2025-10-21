import { useState, useEffect, useMemo } from 'react'
import { Activity } from '@/lib/types/dashboard'
import {
  CheckCircle2,
  Flame,
  Users,
  Target,
  Heart,
  Bell,
  Trophy
} from 'lucide-react'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([])

  const recentActivity = useMemo((): Activity[] => {
    try {
      const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]')
      const activityTypes = ['goal_completed', 'streak_milestone', 'partner_joined', 'goal_created', 'activity_completed', 'encouragement_received']

      return storedNotifications
        .filter((n: any) => activityTypes.includes(n.type) && !n.is_read)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
        .map((n: any) => {
          const iconMap = {
            goal_completed: CheckCircle2,
            streak_milestone: Flame,
            partner_joined: Users,
            goal_created: Target,
            activity_completed: CheckCircle2,
            encouragement_received: Heart
          }
          const colorMap = {
            goal_completed: 'text-green-600',
            streak_milestone: 'text-orange-600',
            partner_joined: 'text-purple-600',
            goal_created: 'text-blue-600',
            activity_completed: 'text-green-600',
            encouragement_received: 'text-pink-600'
          }

          const timeAgo = (date: string) => {
            const diff = Date.now() - new Date(date).getTime()
            const minutes = Math.floor(diff / 60000)
            const hours = Math.floor(diff / 3600000)
            const days = Math.floor(diff / 86400000)

            if (days > 0) return `${days}d ago`
            if (hours > 0) return `${hours}h ago`
            if (minutes > 0) return `${minutes}m ago`
            return 'Just now'
          }

          return {
            id: n.id,
            type: n.type,
            title: n.title,
            description: n.message,
            time: timeAgo(n.createdAt),
            icon: iconMap[n.type as keyof typeof iconMap] || Bell,
            color: colorMap[n.type as keyof typeof colorMap] || 'text-gray-600',
            goalId: n.related_goal_id
          }
        })
    } catch {
      return []
    }
  }, [])

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
      audio.volume = 0.3
      audio.play().catch(() => {})
    } catch {}
  }

  return {
    recentActivity,
    playNotificationSound
  }
}
