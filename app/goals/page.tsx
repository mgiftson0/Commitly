"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Target,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Users,
  Flame,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  Edit,
  Trash2,
  Eye
} from "lucide-react"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"

// Mock data for goals
const mockGoals = [
  {
    id: 1,
    title: "Morning Workout Routine",
    description: "Daily exercise to build strength and endurance",
    type: "recurring",
    status: "active",
    progress: 75,
    streak: 12,
    totalCompletions: 45,
    visibility: "public",
    createdAt: "2024-01-15",
    dueDate: "2024-12-31",
    category: "Health & Fitness",
    priority: "high"
  },
  {
    id: 2,
    title: "Read 30 minutes daily",
    description: "Build knowledge through consistent reading",
    type: "recurring",
    status: "active",
    progress: 45,
    streak: 5,
    totalCompletions: 23,
    visibility: "private",
    createdAt: "2024-01-20",
    dueDate: "2024-12-31",
    category: "Education",
    priority: "medium"
  },
  {
    id: 3,
    title: "Learn Spanish Basics",
    description: "Complete beginner Spanish course",
    type: "multi",
    status: "active",
    progress: 30,
    streak: 8,
    totalCompletions: 15,
    visibility: "public",
    createdAt: "2024-02-01",
    dueDate: "2024-06-30",
    category: "Language",
    priority: "high"
  },
  {
    id: 4,
    title: "Complete Project Portfolio",
    description: "Build and showcase development projects",
    type: "single",
    status: "completed",
    progress: 100,
    streak: 0,
    totalCompletions: 1,
    visibility: "public",
    createdAt: "2024-01-01",
    dueDate: "2024-03-31",
    category: "Career",
    priority: "high"
  },
  {
    id: 5,
    title: "Meditation Practice",
    description: "10 minutes of daily mindfulness",
    type: "recurring",
    status: "paused",
    progress: 60,
    streak: 0,
    totalCompletions: 30,
    visibility: "private",
    createdAt: "2024-01-10",
    dueDate: "2024-12-31",
    category: "Wellness",
    priority: "medium"
  }
]

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-green-500"
    case "completed": return "bg-blue-500"
    case "paused": return "bg-yellow-500"
    default: return "bg-gray-500"
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "recurring": return <Flame className="h-4 w-4" />
    case "single": return <CheckCircle2 className="h-4 w-4" />
    case "multi": return <Target className="h-4 w-4" />
    default: return <Target className="h-4 w-4" />
  }
}

export default function GoalsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  const filteredGoals = mockGoals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || goal.type === filterType
    const matchesStatus = filterStatus === "all" || goal.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const sortedGoals = [...filteredGoals].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "progress":
        return b.progress - a.progress
      case "streak":
        return b.streak - a.streak
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
      default:
        return 0
    }
  })



  const stats = {
    total: mockGoals.length,
    active: mockGoals.filter(g => g.status === "active").length,
    completed: mockGoals.filter(g => g.status === "completed").length,
    paused: mockGoals.filter(g => g.status === "paused").length
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
            <p className="text-muted-foreground">
              Track and manage your personal goals
            </p>
          </div>
          <Link href="/goals/create">
            <Button className="hover-lift">
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
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
                  <TrendingUp className="h-5 w-5 text-green-600" />
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
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Award className="h-5 w-5 text-blue-600" />
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
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paused</p>
                  <p className="text-2xl font-bold">{stats.paused}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search goals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                    <SelectItem value="multi">Multi-step</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="streak">Streak</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Goals ({sortedGoals.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
            <TabsTrigger value="paused">Paused ({stats.paused})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <GoalsGrid goals={sortedGoals} />
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <GoalsGrid goals={sortedGoals.filter(g => g.status === "active")} />
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <GoalsGrid goals={sortedGoals.filter(g => g.status === "completed")} />
          </TabsContent>

          <TabsContent value="paused" className="space-y-4">
            <GoalsGrid goals={sortedGoals.filter(g => g.status === "paused")} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

function GoalsGrid({ goals }: { goals: typeof mockGoals }) {
  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No goals found</p>
          <Link href="/goals/create">
            <Button>Create your first goal</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {goals.map((goal) => (
        <Card key={goal.id} className="hover-lift group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getTypeIcon(goal.type)}
                <Badge variant="outline" className="text-xs">
                  {goal.type}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/goals/${goal.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/goals/${goal.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Goal
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Goal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <CardTitle className="line-clamp-2">{goal.title}</CardTitle>
              {goal.description && (
                <CardDescription className="line-clamp-2">
                  {goal.description}
                </CardDescription>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
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

            {/* Meta info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{goal.category}</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(goal.status)}`} />
                <span className="capitalize">{goal.status}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
