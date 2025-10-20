"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Heart,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  related_goal_id?: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotifications = async () => {
    try {
      const stored = localStorage.getItem("notifications");
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const stored = localStorage.getItem("notifications");
      if (stored) {
        const notifications = JSON.parse(stored);
        const updated = notifications.map((n: any) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        );
        localStorage.setItem("notifications", JSON.stringify(updated));
        await loadNotifications();
        // Trigger header bell update
        window.dispatchEvent(new CustomEvent("storage"));
      }
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    markAsRead(notification.id);

    // Navigate if has related goal
    if (notification.related_goal_id) {
      router.push(`/goals/${notification.related_goal_id}`);
    }
  };

  const markAllAsRead = async () => {
    try {
      const stored = localStorage.getItem("notifications");
      if (stored) {
        const notifications = JSON.parse(stored);
        const updated = notifications.map((n: any) => ({
          ...n,
          is_read: true,
        }));
        localStorage.setItem("notifications", JSON.stringify(updated));
        await loadNotifications();
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "goal_created":
        return <Target className="h-5 w-5 text-blue-600" />;
      case "goal_completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "goal_missed":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "accountability_request":
        return <Users className="h-5 w-5 text-purple-600" />;
      case "reminder":
        return <Clock className="h-5 w-5 text-orange-600" />;
      case "partner_update":
        return <Bell className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-slate-600" />;
    }
  };

  // Mock data for rich notifications experience
  const mockSeedNotifications = [
    {
      id: 1,
      title: "Goal Completed! ??",
      message:
        "Congratulations! You completed your 'Morning Workout' goal for today.",
      type: "goal_completed",
      is_read: false,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      related_goal_id: "1",
      user: {
        name: "You",
        avatar: null,
      },
    },
    {
      id: 2,
      title: "Streak Milestone! ??",
      message:
        "Amazing! You've maintained a 15-day reading streak. Keep it up!",
      type: "streak_milestone",
      is_read: false,
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      related_goal_id: "2",
      user: {
        name: "You",
        avatar: null,
      },
    },
    {
      id: 3,
      title: "Partner Request",
      message:
        "Sarah Martinez wants to be your accountability partner for fitness goals.",
      type: "accountability_request",
      is_read: true,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      related_goal_id: null,
      user: {
        name: "Sarah Martinez",
        avatar: "/placeholder-avatar.jpg",
      },
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
        avatar: null,
      },
    },
    {
      id: 5,
      title: "New Achievement",
      message:
        "You've earned the 'Consistency Champion' badge for 30 days of goal completion!",
      type: "achievement",
      is_read: true,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      related_goal_id: null,
      user: {
        name: "System",
        avatar: null,
      },
    },
  ];

  const mockNotifications = [
    ...notifications.map((n) => ({
      ...n,
      related_goal_id: n.related_goal_id || null,
      user: { name: "System", avatar: null },
    })),
    ...mockSeedNotifications,
  ];

  const unreadCount = mockNotifications.filter((n) => !n.is_read).length;
  const todayNotifications = mockNotifications.filter(
    (n) => new Date(n.created_at).toDateString() === new Date().toDateString(),
  );

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
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Notifications
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Stay updated with your goal progress and achievements
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={markAllAsRead}
                className="hover-lift"
              >
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
        <div className="flex gap-3 sm:gap-4 overflow-x-auto">
          <Card className="hover-lift min-w-[160px] flex-shrink-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">
                    {mockNotifications.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift min-w-[160px] flex-shrink-0">
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
          <Card className="hover-lift min-w-[160px] flex-shrink-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold">
                    {todayNotifications.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift min-w-[160px] flex-shrink-0">
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
            <TabsTrigger value="all">
              All ({mockNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="achievements">Achievements (3)</TabsTrigger>
            <TabsTrigger value="social">Social (2)</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <NotificationsList
              notifications={mockNotifications}
              onNotificationClick={handleNotificationClick}
            />
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            <NotificationsList
              notifications={mockNotifications.filter((n) => !n.is_read)}
              onNotificationClick={handleNotificationClick}
            />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <NotificationsList
              notifications={mockNotifications.filter(
                (n) =>
                  n.type === "achievement" || n.type === "streak_milestone",
              )}
              onNotificationClick={handleNotificationClick}
            />
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <NotificationsList
              notifications={mockNotifications.filter(
                (n) =>
                  n.type === "accountability_request" ||
                  n.type === "partner_update",
              )}
              onNotificationClick={handleNotificationClick}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

interface NotificationItem {
  id: number | string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  related_goal_id: string | null;
  user: {
    name: string;
    avatar: string | null;
  };
}

function NotificationsList({
  notifications,
  onNotificationClick,
}: {
  notifications: NotificationItem[];
  onNotificationClick: (notification: NotificationItem) => void;
}) {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            No notifications in this category
          </p>
          <Button variant="outline">View All Notifications</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onNotificationClick={onNotificationClick}
        />
      ))}
    </div>
  );
}

function NotificationCard({
  notification,
  onNotificationClick,
}: {
  notification: NotificationItem;
  onNotificationClick: (notification: NotificationItem) => void;
}) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "goal_completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "streak_milestone":
        return <Flame className="h-4 w-4 text-orange-600" />;
      case "accountability_request":
        return <Users className="h-4 w-4 text-purple-600" />;
      case "reminder":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "achievement":
        return <Trophy className="h-4 w-4 text-yellow-600" />;
      case "goal_created":
        return <Target className="h-4 w-4 text-blue-600" />;
      case "activity_completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "encouragement_received":
        return <Heart className="h-4 w-4 text-pink-600" />;
      default:
        return <Bell className="h-4 w-4 text-slate-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    if (notification.is_read) return "";
    switch (type) {
      case "goal_completed":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950";
      case "streak_milestone":
        return "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950";
      case "accountability_request":
        return "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950";
      case "reminder":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950";
      case "achievement":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950";
      default:
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950";
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <div
      className={`p-3 rounded-lg border transition-all cursor-pointer hover:bg-accent/50 ${getNotificationColor(notification.type)} ${notification.related_goal_id ? "hover:border-primary/50" : ""}`}
      onClick={() => onNotificationClick(notification)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="p-1.5 rounded-full bg-background/80">
            {getNotificationIcon(notification.type)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm">{notification.title}</h3>
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {timeAgo(notification.created_at)}
            </span>
            {notification.related_goal_id && (
              <span className="text-xs text-primary font-medium">
                View Goal →
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
