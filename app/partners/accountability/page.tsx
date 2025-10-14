"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Search,
  Filter,
  Target,
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  Award,
  MessageCircle,
  Eye,
  Calendar,
  AlertCircle,
  Check,
  X,
  Star,
  Heart,
  Zap
} from "lucide-react"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"

// Mock data for accountability goals
const mockAccountabilityGoals = [
  {
    id: 1,
    title: "Daily Morning Workout",
    description: "Build strength and consistency with daily exercise",
    creator: {
      name: "Sarah Martinez",
      username: "sarah_m",
      avatar: "/placeholder-avatar.jpg"
    },
    goalType: "recurring",
    status: "active",
    progress: 75,
    streak: 12,
    yourRole: "accountability_partner",
    createdAt: "2024-01-15",
    lastActivity: "2 hours ago",
    priority: "high",
    category: "Health & Fitness",
    totalCompletions: 45,
    encouragementNeeded: true,
    lastCheckIn: "yesterday"
  },
  {
    id: 2,
    title: "Read 30 minutes daily",
    description: "Expand knowledge through consistent reading habits",
    creator: {
      name: "Mike Chen",
      username: "mike_c",
      avatar: "/placeholder-avatar.jpg"
    },
    goalType: "recurring",
    status: "active",
    progress: 60,
    streak: 8,
    yourRole: "accountability_partner",
    createdAt: "2024-02-01",
    lastActivity: "1 day ago",
    priority: "medium",
    category: "Learning",
    totalCompletions: 23,
    encouragementNeeded: false,
    lastCheckIn: "today"
  },
  {
    id: 3,
    title: "Complete React Certification",
    description: "Master React development skills for career advancement",
    creator: {
      name: "Emily Rodriguez",
      username: "emily_r",
      avatar: "/placeholder-avatar.jpg"
    },
    goalType: "single",
    status: "completed",
    progress: 100,
    streak: 0,
    yourRole: "accountability_partner",
    createdAt: "2024-01-20",
    lastActivity: "3 days ago",
    priority: "high",
    category: "Career",
    totalCompletions: 1,
    encouragementNeeded: false,
    lastCheckIn: "last week"
  },
  {
    id: 4,
    title: "Meditation Practice",
    description: "10 minutes of daily mindfulness and stress reduction",
    creator: {
      name: "Alex Thompson",
      username: "alex_t",
      avatar: "/placeholder-avatar.jpg"
    },
    goalType: "recurring",
    status: "struggling",
    progress: 30,
    streak: 2,
    yourRole: "accountability_partner",
    createdAt: "2024-02-10",
    lastActivity: "5 days ago",
    priority: "medium",
    category: "Wellness",
    totalCompletions: 15,
    encouragementNeeded: true,
    lastCheckIn: "3 days ago"
  }
]

export default function AccountabilityGoalsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredGoals = mockAccountabilityGoals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.creator.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || goal.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: mockAccountabilityGoals.length,
    active: mockAccountabilityGoals.filter(g => g.status === "active").length,
    completed: mockAccountabilityGoals.filter(g => g.status === "completed").length,
    needEncouragement: mockAccountabilityGoals.filter(g => g.encouragementNeeded).length
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accountability Goals</h1>
            <p className="text-muted-foreground">
              Goals where you&apos;re helping others stay accountable
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/partners">
              <Button variant="outline" className="hover-lift">
                <Users className="h-4 w-4 mr-2" />
                All Partners
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Goals</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
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
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Heart className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Need Support</p>
                  <p className="text-2xl font-bold">{stats.needEncouragement}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search goals or partners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Goals ({filteredGoals.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
            <TabsTrigger value="need-support">Need Support ({stats.needEncouragement})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <AccountabilityGoalsList goals={filteredGoals} />
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <AccountabilityGoalsList goals={filteredGoals.filter(g => g.status === "active")} />
          </TabsContent>

          <TabsContent value="need-support" className="space-y-4">
            <AccountabilityGoalsList goals={filteredGoals.filter(g => g.encouragementNeeded)} />
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <AccountabilityGoalsList goals={filteredGoals.filter(g => g.status === "completed")} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

function AccountabilityGoalsList({ goals }: { goals: typeof mockAccountabilityGoals }) {
  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No accountability goals found</p>
          <Link href="/partners/find">
            <Button>Find Partners to Support</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {goals.map((goal) => (
        <AccountabilityGoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  )
}

function AccountabilityGoalCard({ goal }: { goal: typeof mockAccountabilityGoals[0] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500"
      case "completed": return "bg-blue-500"
      case "struggling": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-600">Active</Badge>
      case "completed": return <Badge className="bg-blue-600">Completed</Badge>
      case "struggling": return <Badge className="bg-yellow-600">Needs Support</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card className="hover-lift group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={goal.creator.avatar} />
              <AvatarFallback>{goal.creator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{goal.title}</CardTitle>
              <CardDescription>by {goal.creator.name}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {goal.description}
        </p>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Their Progress</span>
            <span className="font-medium">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-muted-foreground">Streak:</span>
            <span className="font-medium">{goal.streak} days</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">Completed:</span>
            <span className="font-medium">{goal.totalCompletions}</span>
          </div>
        </div>

        {/* Status and Category */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {goal.category}
            </Badge>
            {getStatusBadge(goal.status)}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{goal.lastActivity}</span>
          </div>
        </div>

        {/* Encouragement Needed */}
        {goal.encouragementNeeded && (
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Encouragement Needed
              </span>
            </div>
            <p className="text-xs text-orange-700 dark:text-orange-300 mb-3">
              {goal.creator.name} hasn&apos;t checked in for {goal.lastCheckIn}. Send some motivation!
            </p>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                <MessageCircle className="h-3 w-3 mr-1" />
                Send Message
              </Button>
              <Button size="sm" variant="outline">
                <Zap className="h-3 w-3 mr-1" />
                Quick Check-in
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <MessageCircle className="h-3 w-3 mr-1" />
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
