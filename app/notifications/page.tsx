"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Target,
  ArrowLeft,
  Bell,
  CheckCircle2,
  AlertCircle,
  Users,
  Clock,
  Flame,
  Trophy,
  Settings,
  Filter,
  Search,
  Check,
  X,
  MoreHorizontal,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseClient, type Notification } from "@/lib/supabase"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    loadNotifications()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadNotifications = async () => {
    if (!supabase) return
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
    } catch (_error: unknown) {
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    if (!supabase) return
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)

      if (error) throw error
      await loadNotifications()
    } catch (_error: unknown) {
      toast.error("Failed to mark as read")
    }
  }

  const markAllAsRead = async () => {
    if (!supabase) return
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
    } catch (_error: unknown) {
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

  // Mock data for rich notifications experience
  const mockNotifications = [
    {
      id: 1,
      title: "Goal Completed! 🎉",
      message: "Congratulations! You completed your 'Morning Workout' goal for today.",
      type: "goal_completed",
      is_read: false,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      related_goal_id: "1",
      user: {
        name: "You",
        avatar: null
      }
    },
    {
      id: 2,
      title: "Streak Milestone! 🔥",
      message: "Amazing! You've maintained a 15-day reading streak. Keep it up!",
      type: "streak_milestone",
      is_read: false,
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      related_goal_id: "2",
      user: {
        name: "You",
        avatar: null
      }
    },
    {
      id: 3,
      title: "Partner Request",
      message: "Sarah Martinez wants to be your accountability partner for fitness goals.",
      type: "accountability_request",
      is_read: true,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      related_goal_id: null,
      user: {
        name: "Sarah Martinez",
        avatar: "/placeholder-avatar.jpg"
      }
    },
    {
      id: 4,
      title: "Goal Reminder",
      message: "Don't forget to complete your daily meditation practice!",
      type: "reminder",
      is_read: true,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      related_goal_id: "3",
      user: {
        name: "System",
        avatar: null
      }
    },
    {
      id: 5,
      title: "New Achievement",
      message: "You've earned the 'Consistency Champion' badge for 30 days of goal completion!",
      type: "achievement",
      is_read: true,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      related_goal_id: null,
      user: {
        name: "System",
        avatar: null
      }
    }
  ]

  const unreadCount = mockNotifications.filter(n => !n.is_read).length
  const todayNotifications = mockNotifications.filter(n =>
    new Date(n.created_at).toDateString() === new Date().toDateString()
  )

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Bell className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with your goal progress and achievements
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead} className="hover-lift">
                <Check className="h-4 w-4 mr-2" />
                Mark All Read ({unreadCount})
              </Button>
            )}
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="achievements">Achievements</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{mockNotifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unread</p>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold">{todayNotifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Trophy className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({mockNotifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="achievements">Achievements (3)</TabsTrigger>
            <TabsTrigger value="social">Social (2)</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <NotificationsList notifications={mockNotifications} />
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            <NotificationsList notifications={mockNotifications.filter(n => !n.is_read)} />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <NotificationsList notifications={mockNotifications.filter(n => n.type === 'achievement' || n.type === 'streak_milestone')} />
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <NotificationsList notifications={mockNotifications.filter(n => n.type === 'accountability_request' || n.type === 'partner_update')} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

interface NotificationItem {
  id: number
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  related_goal_id: string | null
  user: {
    name: string
    avatar: string | null
  }
}

function NotificationsList({ notifications }: { notifications: NotificationItem[] }) {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No notifications in this category</p>
          <Button variant="outline">View All Notifications</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </div>
  )
}

function NotificationCard({ notification }: { notification: NotificationItem }) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "goal_completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "streak_milestone":
        return <Flame className="h-5 w-5 text-orange-600" />
      case "accountability_request":
        return <Users className="h-5 w-5 text-purple-600" />
      case "reminder":
        return <Clock className="h-5 w-5 text-blue-600" />
      case "achievement":
        return <Trophy className="h-5 w-5 text-yellow-600" />
      default:
        return <Bell className="h-5 w-5 text-slate-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "goal_completed":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
      case "streak_milestone":
        return "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
      case "accountability_request":
        return "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950"
      case "reminder":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
      case "achievement":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
      default:
        return ""
    }
  }

  return (
    <Card className={`hover-lift group transition-all ${!notification.is_read ? getNotificationColor(notification.type) : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Notification Icon */}
          <div className="flex-shrink-0 mt-1">
            <div className="p-2 rounded-full bg-muted">
              {getNotificationIcon(notification.type)}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{notification.title}</h3>
                  {!notification.is_read && (
                    <Badge variant="default" className="text-xs">New</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {notification.message}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                  <span>{new Date(notification.created_at).toLocaleTimeString()}</span>
                  {notification.user && (
                    <span className="flex items-center gap-1">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={notification.user.avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {notification.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {notification.user.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notification.is_read && (
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Related Goal Action */}
            {notification.related_goal_id && (
              <div className="mt-3 pt-3 border-t">
                <Link href={`/goals/${notification.related_goal_id}`}>
                  <Button variant="outline" size="sm" className="hover-lift">
                    View Goal
                    <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
