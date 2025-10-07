"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, ArrowLeft, Bell, CheckCircle2, AlertCircle, Users, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseClient, type Notification } from "@/lib/supabase"
import { toast } from "sonner"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error: any) {
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)

      if (error) throw error
      await loadNotifications()
    } catch (error: any) {
      toast.error("Failed to mark as read")
    }
  }

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false)

      if (error) throw error
      await loadNotifications()
      toast.success("All notifications marked as read")
    } catch (error: any) {
      toast.error("Failed to mark all as read")
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "goal_created":
        return <Target className="h-5 w-5 text-blue-600" />
      case "goal_completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "goal_missed":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "accountability_request":
        return <Users className="h-5 w-5 text-purple-600" />
      case "reminder":
        return <Clock className="h-5 w-5 text-orange-600" />
      case "partner_update":
        return <Bell className="h-5 w-5 text-blue-600" />
      default:
        return <Bell className="h-5 w-5 text-slate-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Target className="h-12 w-12 text-blue-600 animate-pulse" />
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <Target className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount}</Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                Mark All as Read
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No notifications yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all ${
                  !notification.is_read
                    ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950"
                    : ""
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{notification.title}</CardTitle>
                        {!notification.is_read && (
                          <Badge variant="default" className="shrink-0">New</Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1">
                        {notification.message}
                      </CardDescription>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                {notification.related_goal_id && (
                  <CardContent className="pt-0">
                    <Link href={`/goals/${notification.related_goal_id}`}>
                      <Button variant="outline" size="sm">
                        View Goal
                      </Button>
                    </Link>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
