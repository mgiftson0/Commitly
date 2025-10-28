"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Bell, 
  CheckCircle2, 
  Target, 
  Users, 
  Trophy, 
  Heart,
  Trash2,
  CheckCheck,
  Flame,
  Calendar,
  Star,
  MessageCircle,
  UserPlus,
  Gift,
  Zap,
  Award,
  TrendingUp,
  Clock,
  AlertTriangle,
  PartyPopper,
  Sparkles
} from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { supabase, authHelpers } from "@/lib/supabase-client"
import { toast } from "sonner"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
  data?: any
}

// Sample notifications for demonstration
const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'Goal Completed! 🎉',
    message: 'Congratulations! You completed "Morning Workout Routine"',
    type: 'goal_completed',
    read: false,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    data: { goal_id: 'goal-1' }
  },
  {
    id: '2',
    title: '7-Day Streak! 🔥',
    message: 'Amazing! You\'ve maintained your "Daily Reading" streak for 7 days',
    type: 'streak_milestone',
    read: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    data: { streak_count: 7, goal_id: 'goal-2' }
  },
  {
    id: '3',
    title: 'Goal Partner Request',
    message: 'Sarah Johnson wants to be your accountability partner for "Learn Spanish"',
    type: 'partner_request',
    read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    data: { requester_id: 'user-2', requester_name: 'Sarah Johnson', goal_id: 'goal-spanish', goal_title: 'Learn Spanish' }
  },
  {
    id: '4',
    title: 'Achievement Unlocked! 🏆',
    message: 'You earned the "Early Bird" badge for completing 5 morning goals',
    type: 'achievement_unlocked',
    read: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    data: { achievement_id: 'early-bird' }
  },
  {
    id: '5',
    title: 'Encouragement Received 💝',
    message: 'Mike sent you encouragement: "Keep going! You\'re doing great!"',
    type: 'encouragement_received',
    read: true,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    data: { sender_name: 'Mike', goal_id: 'goal-3' }
  },
  {
    id: '6',
    title: 'Goal Reminder ⏰',
    message: 'Don\'t forget to complete "Evening Meditation" today',
    type: 'goal_reminder',
    read: true,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    data: { goal_id: 'goal-4' }
  },
  {
    id: '7',
    title: 'Weekly Progress Report 📊',
    message: 'You completed 85% of your goals this week. Great job!',
    type: 'weekly_report',
    read: true,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    data: { completion_rate: 85 }
  },
  {
    id: '8',
    title: 'Streak at Risk! ⚠️',
    message: 'Your 12-day "Healthy Eating" streak is at risk. Complete it before midnight!',
    type: 'streak_at_risk',
    read: false,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    data: { streak_count: 12, goal_id: 'goal-5' }
  },
  {
    id: '9',
    title: 'New Feature Available! ✨',
    message: 'Check out the new seasonal goals feature to boost your motivation',
    type: 'feature_announcement',
    read: true,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    data: { feature: 'seasonal_goals' }
  },
  {
    id: '10',
    title: 'Goal Shared 🤝',
    message: 'Alex shared their "Learn Spanish" goal with you',
    type: 'goal_shared',
    read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    data: { sender_name: 'Alex', goal_id: 'goal-6' }
  }
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error loading notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) return

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark all as read')
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      toast.success('Notification deleted')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete notification')
    }
  }

  const handleGoalPartnerRequest = async (notificationId: string, requesterId: string, goalId: string, action: 'accept' | 'decline') => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) return

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name, username')
        .eq('id', user.id)
        .single()

      const userName = userProfile?.first_name 
        ? `${userProfile.first_name} ${userProfile.last_name || ''}`.trim()
        : userProfile?.username || 'Someone'

      if (action === 'accept') {
        // Create acceptance notification for requester
        const { error: partnerError } = await supabase
          .from('notifications')
          .insert({
            user_id: requesterId,
            title: 'Goal Partner Request Accepted! 🎉',
            message: `${userName} accepted your accountability partner request`,
            type: 'goal_created',
            read: false,
            data: { partner_id: user.id, partner_name: userName, goal_id: goalId }
          })

        // Create partnership record for tracking
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title: 'Partnership Established',
            message: 'You are now an accountability partner',
            type: 'goal_created',
            read: true,
            data: { partner_id: requesterId, partner_name: 'Partner', goal_id: goalId }
          })

        if (partnerError) throw partnerError

        await supabase
          .from('notifications')
          .insert({
            user_id: requesterId,
            title: 'Goal Partner Request Accepted! 🎉',
            message: `${userName} accepted your accountability partner request`,
            type: 'goal_created',
            read: false,
            data: { partner_id: user.id, partner_name: userName, goal_id: goalId }
          })

        toast.success('Goal partner request accepted!')
      } else {
        await supabase
          .from('notifications')
          .insert({
            user_id: requesterId,
            title: 'Goal Partner Request Declined',
            message: `${userName} declined your accountability partner request`,
            type: 'goal_created',
            read: false,
            data: { partner_id: user.id, partner_name: userName }
          })

        toast.success('Goal partner request declined')
      }

      await deleteNotification(notificationId)
      
    } catch (error: any) {
      console.error('Error handling goal partner request:', error)
      toast.error(error.message || 'Failed to process request')
    }
  }

  const handleGroupGoalInvitation = async (notificationId: string, goalId: string, action: 'accepted' | 'declined') => {
    try {
      const response = await fetch('/api/group-goals/invitations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationId: notificationId,
          action
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process invitation')
      }

      await deleteNotification(notificationId)
      toast.success(`Group goal invitation ${action}!`)
      
    } catch (error: any) {
      console.error('Error handling group goal invitation:', error)
      toast.error(error.message || 'Failed to process invitation')
    }
  }

  const handlePartnerRequest = async (notificationId: string, senderId: string, action: 'accept' | 'decline') => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) return

      if (action === 'accept') {
        const { data: acceptorProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, username')
          .eq('id', user.id)
          .single()

        const acceptorName = acceptorProfile?.first_name 
          ? `${acceptorProfile.first_name} ${acceptorProfile.last_name || ''}`.trim()
          : acceptorProfile?.username || 'Someone'

        const { error: updateError } = await supabase
          .from('accountability_partners')
          .update({ status: 'accepted' })
          .eq('user_id', senderId)
          .eq('partner_id', user.id)
          .eq('status', 'pending')

        if (updateError) throw updateError

        await supabase
          .from('notifications')
          .insert({
            user_id: senderId,
            title: 'Partner Request Accepted',
            message: `${acceptorName} accepted your partner request!`,
            type: 'goal_created',
            read: false,
            data: { partner_id: user.id, partner_name: acceptorName }
          })

        toast.success('Partner request accepted!')
      } else {
        const { error: deleteError } = await supabase
          .from('accountability_partners')
          .delete()
          .eq('user_id', senderId)
          .eq('partner_id', user.id)
          .eq('status', 'pending')

        if (deleteError) throw deleteError

        toast.success('Partner request declined')
      }

      await deleteNotification(notificationId)
      
    } catch (error: any) {
      console.error('Error handling partner request:', error)
      toast.error(error.message || 'Failed to process request')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'goal_completed': return CheckCircle2
      case 'goal_created': return Target
      case 'achievement_unlocked': return Trophy
      case 'partner_request': return Users
      case 'goal_partner_request': return Users
      case 'encouragement_received': return Heart
      case 'streak_milestone': return Flame
      case 'streak_at_risk': return AlertTriangle
      case 'goal_reminder': return Clock
      case 'weekly_report': return TrendingUp
      case 'feature_announcement': return Sparkles
      case 'goal_shared': return UserPlus
      case 'seasonal_goal': return Star
      case 'milestone_reached': return Award
      case 'celebration': return PartyPopper
      default: return Bell
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'goal_completed': return 'text-emerald-600'
      case 'goal_created': return 'text-blue-600'
      case 'achievement_unlocked': return 'text-amber-600'
      case 'partner_request': return 'text-purple-600'
      case 'goal_partner_request': return 'text-indigo-600'
      case 'encouragement_received': return 'text-pink-600'
      case 'streak_milestone': return 'text-orange-600'
      case 'streak_at_risk': return 'text-red-600'
      case 'goal_reminder': return 'text-cyan-600'
      case 'weekly_report': return 'text-teal-600'
      case 'feature_announcement': return 'text-violet-600'
      case 'goal_shared': return 'text-sky-600'
      case 'seasonal_goal': return 'text-yellow-600'
      case 'milestone_reached': return 'text-gold-600'
      case 'celebration': return 'text-rose-600'
      default: return 'text-slate-600'
    }
  }

  const getNotificationGradient = (type: string) => {
    switch (type) {
      case 'goal_completed': return 'from-emerald-400/20 via-green-300/10 to-emerald-500/20'
      case 'streak_milestone': return 'from-orange-400/20 via-red-300/10 to-orange-500/20'
      case 'achievement_unlocked': return 'from-amber-400/20 via-yellow-300/10 to-amber-500/20'
      case 'partner_request': return 'from-purple-400/20 via-violet-300/10 to-purple-500/20'
      case 'encouragement_received': return 'from-pink-400/20 via-rose-300/10 to-pink-500/20'
      case 'streak_at_risk': return 'from-red-400/20 via-orange-300/10 to-red-500/20'
      case 'goal_reminder': return 'from-cyan-400/20 via-blue-300/10 to-cyan-500/20'
      case 'weekly_report': return 'from-teal-400/20 via-emerald-300/10 to-teal-500/20'
      case 'feature_announcement': return 'from-violet-400/20 via-purple-300/10 to-violet-500/20'
      case 'goal_shared': return 'from-sky-400/20 via-blue-300/10 to-sky-500/20'
      default: return 'from-slate-400/20 via-gray-300/10 to-slate-500/20'
    }
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

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <Bell className="h-12 w-12 text-primary animate-pulse" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        {/* Header Section with Gradient Background */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-6 border border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  {unreadCount > 0 ? (
                    <span className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                      {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    'All caught up! 🎉'
                  )}
                </p>
              </div>
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  className="w-full sm:w-auto bg-background/50 backdrop-blur-sm border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type)
            const color = getNotificationColor(notification.type)
            const gradient = getNotificationGradient(notification.type)

            return (
              <div
                key={notification.id}
                className={`group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.02] ${
                  !notification.read ? 'shadow-md' : 'shadow-sm'
                }`}
              >
                {/* Animated Gradient Border */}
                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-60 animate-pulse`} />
                <div className="absolute inset-0 bg-gradient-conic from-transparent via-white/20 to-transparent animate-spin" style={{ animationDuration: '8s' }} />
                
                {/* Main Card Content */}
                <div className="relative bg-background/95 backdrop-blur-sm m-0.5 rounded-lg border border-border/50">
                  {/* Aurora Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-30 blur-sm`} />
                  
                  <div className="relative p-3">
                    <div className="flex items-start gap-3">
                      {/* Icon with shimmer effect */}
                      <div className={`relative flex-shrink-0 p-2 rounded-lg bg-gradient-to-br ${color.replace('text-', 'from-').replace('-600', '-100')} ${color.replace('text-', 'to-').replace('-600', '-50')} border border-current/20 overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer" style={{ animationDuration: '3s' }} />
                        <Icon className={`h-4 w-4 ${color} relative z-10`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm mb-1 flex items-center gap-2">
                              <span className="truncate">{notification.title}</span>
                              {!notification.read && (
                                <Badge
                                  variant="secondary"
                                  className="bg-primary/10 text-primary border-primary/20 text-xs px-1.5 py-0.5 animate-pulse"
                                >
                                  New
                                </Badge>
                              )}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground/60">
                              {timeAgo(notification.created_at)}
                            </p>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-1 flex-shrink-0">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Goal view button */}
                        {notification.data?.goal_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 h-7"
                            onClick={() => router.push(`/goals/${notification.data.goal_id}`)}
                          >
                            <Target className="h-3 w-3 mr-1" />
                            View Goal
                          </Button>
                        )}

                        {/* Goal partner request actions - show for partner requests with goal_id */}
                        {notification.type === 'partner_request' && notification.data?.requester_id && notification.data?.goal_id && (
                          <div className="space-y-2 mt-2">
                            <div className="text-xs text-muted-foreground">
                              Goal: {notification.data.goal_title || 'Untitled Goal'}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGoalPartnerRequest(notification.id, notification.data.requester_id, notification.data.goal_id, 'decline')}
                                className="text-xs h-6 px-2 border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50"
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleGoalPartnerRequest(notification.id, notification.data.requester_id, notification.data.goal_id, 'accept')}
                                className="text-xs h-6 px-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                              >
                                Accept
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Regular partner request section */}
                        {notification.type === 'partner_request' && notification.data?.sender_id && !notification.data?.goal_id && (
                          <div className="bg-muted/20 rounded-lg p-2 border border-muted/30 mt-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10">
                                  {notification.data.sender_name?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                  {notification.data.sender_name || 'User'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  @{notification.data.sender_username || 'user'}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePartnerRequest(notification.id, notification.data.sender_id, 'decline')}
                                className="flex-1 text-xs h-7 border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50"
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handlePartnerRequest(notification.id, notification.data.sender_id, 'accept')}
                                className="flex-1 text-xs h-7 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                              >
                                Accept
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Group goal invitation actions */}
                        {notification.data?.invitation_type === 'group_goal' && notification.data?.goal_id && (
                          <div className="space-y-2 mt-2">
                            <div className="text-xs text-muted-foreground">
                              Group Goal Invitation
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGroupGoalInvitation(notification.id, notification.data.goal_id, 'declined')}
                                className="text-xs h-6 px-2 border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50"
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleGroupGoalInvitation(notification.id, notification.data.goal_id, 'accepted')}
                                className="text-xs h-6 px-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                              >
                                Accept
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Goal partner request */}
                        {notification.type === 'goal_partner_request' && notification.data?.requester_id && notification.data?.goal_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 mt-2"
                            onClick={() => router.push(`/goals/${notification.data.goal_id}`)}
                          >
                            <Users className="h-3 w-3 mr-1" />
                            View Goal & Respond
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Custom CSS for animations */}
        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%) skewX(-12deg); }
            100% { transform: translateX(200%) skewX(-12deg); }
          }
          .animate-shimmer {
            animation: shimmer 3s infinite;
          }
        `}</style>

        {/* Footer with link to landing page */}
        <div className="text-center py-4 border-t border-muted/20">
          <p className="text-xs text-muted-foreground mb-2">
            Want to learn more about Commitly?
          </p>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" asChild>
            <Link href="/">
              Visit Landing Page →
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}