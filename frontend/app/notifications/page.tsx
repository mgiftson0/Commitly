"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
              <p className="text-muted-foreground">
                When you complete goals or receive encouragements, they'll appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type)
              const color = getNotificationColor(notification.type)
              
              return (
                <Card 
                  key={notification.id} 
                  className={`transition-all hover:shadow-md ${!notification.read ? 'border-primary/50 bg-primary/5' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full bg-muted flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm mb-1">
                              {notification.title}
                              {!notification.read && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  New
                                </Badge>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {timeAgo(notification.created_at)}
                            </p>
                          </div>
                          
                          <div className="flex gap-1 flex-shrink-0">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-8 w-8 p-0"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {notification.data?.goal_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => router.push(`/goals/${notification.data.goal_id}`)}
                          >
                            View Goal
                          </Button>
                        )}
                        
                        {notification.type === 'partner_request' && notification.data?.sender_id && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {notification.data.sender_name?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{notification.data.sender_name || 'User'}</p>
                                <p className="text-xs text-muted-foreground">@{notification.data.sender_username || 'user'}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePartnerRequest(notification.id, notification.data.sender_id, 'decline')}
                                className="flex-1"
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handlePartnerRequest(notification.id, notification.data.sender_id, 'accept')}
                                className="flex-1"
                              >
                                Accept
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}