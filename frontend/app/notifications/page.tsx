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
  CheckCheck
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

  const handlePartnerRequest = async (notificationId: string, senderId: string, action: 'accept' | 'decline') => {
    try {
      const user = await authHelpers.getCurrentUser()
      if (!user) return

      if (action === 'accept') {
        // Get acceptor's profile data for notification
        const { data: acceptorProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, username')
          .eq('id', user.id)
          .single()

        const acceptorName = acceptorProfile?.first_name 
          ? `${acceptorProfile.first_name} ${acceptorProfile.last_name || ''}`.trim()
          : acceptorProfile?.username || 'Someone'

        // Update the accountability_partners status to accepted
        const { error: updateError } = await supabase
          .from('accountability_partners')
          .update({ status: 'accepted' })
          .eq('user_id', senderId)
          .eq('partner_id', user.id)
          .eq('status', 'pending')

        if (updateError) throw updateError

        // Create notification for sender
        await supabase
          .from('notifications')
          .insert({
            user_id: senderId,
            title: 'Partner Request Accepted',
            message: `${acceptorName} accepted your partner request!`,
            type: 'partner_accepted',
            read: false,
            data: { partner_id: user.id, partner_name: acceptorName }
          })

        toast.success('Partner request accepted!')
      } else {
        // Delete the pending request
        const { error: deleteError } = await supabase
          .from('accountability_partners')
          .delete()
          .eq('user_id', senderId)
          .eq('partner_id', user.id)
          .eq('status', 'pending')

        if (deleteError) throw deleteError

        toast.success('Partner request declined')
      }

      // Delete the notification
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
      default: return Bell
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'goal_completed': return 'text-green-600'
      case 'goal_created': return 'text-blue-600'
      case 'achievement_unlocked': return 'text-yellow-600'
      case 'partner_request': return 'text-purple-600'
      case 'goal_partner_request': return 'text-blue-600'
      case 'encouragement_received': return 'text-pink-600'
      default: return 'text-gray-600'
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
        {notifications.length === 0 ? (
          <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-xl opacity-50" />
                <div className="relative bg-background rounded-full p-4 border border-primary/20">
                  <Bell className="h-8 sm:h-12 w-8 sm:w-12 text-primary/60" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                No notifications yet
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                When you complete goals, receive encouragements, or get partner requests, they'll appear here.
              </p>
              <Button variant="outline" className="mt-4 border-primary/30 hover:bg-primary/10" asChild>
                <Link href="/goals">Create Your First Goal</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type)
              const color = getNotificationColor(notification.type)

              return (
                <Card
                  key={notification.id}
                  className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.01] border-l-4 ${
                    !notification.read
                      ? 'border-l-primary bg-gradient-to-r from-primary/5 to-transparent shadow-md'
                      : 'border-l-muted bg-card'
                  }`}
                >
                  {/* Subtle background gradient for unread notifications */}
                  {!notification.read && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/2 to-transparent opacity-50" />
                  )}

                  <CardContent className="p-3 sm:p-4 relative">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Icon with modern styling */}
                      <div className={`relative flex-shrink-0 p-2 sm:p-3 rounded-xl bg-gradient-to-br ${color.replace('text-', 'from-').replace('-600', '-100')} ${color.replace('text-', 'to-').replace('-600', '-50')} border border-current/20`}>
                        <Icon className={`h-4 sm:h-5 w-4 sm:w-5 ${color} drop-shadow-sm`} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base mb-1 flex items-center gap-2">
                              <span className="truncate">{notification.title}</span>
                              {!notification.read && (
                                <Badge
                                  variant="secondary"
                                  className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5 animate-pulse"
                                >
                                  New
                                </Badge>
                              )}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground/70">
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
                                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-8 w-8 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Goal view button */}
                        {notification.data?.goal_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-xs sm:text-sm border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                            onClick={() => router.push(`/goals/${notification.data.goal_id}`)}
                          >
                            <Target className="h-3.5 w-3.5 mr-1.5" />
                            View Goal
                          </Button>
                        )}

                        {/* Partner request section */}
                        {notification.type === 'partner_request' && notification.data?.sender_id && (
                          <div className="bg-muted/30 rounded-lg p-3 sm:p-4 border border-muted/50">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10">
                                  {notification.data.sender_name?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
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
                                className="flex-1 text-xs sm:text-sm border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50"
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handlePartnerRequest(notification.id, notification.data.sender_id, 'accept')}
                                className="flex-1 text-xs sm:text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
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
                            className="w-full text-xs sm:text-sm border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                            onClick={() => router.push(`/goals/${notification.data.goal_id}`)}
                          >
                            <Users className="h-3.5 w-3.5 mr-1.5" />
                            View Goal & Respond
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Footer with link to landing page */}
        <div className="text-center py-4 sm:py-6 border-t border-muted/20">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
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