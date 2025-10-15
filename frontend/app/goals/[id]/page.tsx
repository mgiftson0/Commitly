"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Target,
  ArrowLeft,
  CheckCircle2,
  Flame,
  Clock,
  Edit,
  Trash2,
  Pause,
  Play,
  Copy,
  Users,
  MessageCircle,
  Calendar,
  TrendingUp,
  Award,
  UserPlus,
  Settings,
  MoreHorizontal,
  Heart,
  Star,
  GitFork,
  Crown,
  Save
} from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"
import { EncouragementCard } from "@/components/goals/encouragement-card"
import { notifications } from "@/lib/notifications"

type Goal = {
  id: string
  user_id: string
  title: string
  description: string
  goal_type: 'single' | 'multi' | 'recurring'
  visibility: 'public' | 'private' | 'restricted'
  start_date: string
  is_suspended: boolean
  created_at: string
  updated_at: string
  completed_at: string | null
}

type Activity = {
  id: string
  goal_id: string
  title: string
  description?: string
  is_completed: boolean
  order_index: number
  created_at: string
  updated_at: string
  completed_at?: string
  assigned_members?: string[]
}

export default function GoalDetailPage() {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [storeMeta, setStoreMeta] = useState<{ dueDate?: string | null; recurrencePattern?: string; recurrenceDays?: string[] } | null>(null)
  const [storeRole, setStoreRole] = useState<{ isGroupGoal?: boolean; groupMembers?: { id: string; name: string; avatar?: string; status?: 'pending' | 'accepted' | 'declined' }[]; accountabilityPartners?: { id: string; name: string; avatar?: string }[]; ownerName?: string } | null>(null)
  const [activityAssignments, setActivityAssignments] = useState<{[key: string]: string[]}>({})
  
  // Edit form states
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editVisibility, setEditVisibility] = useState<"public" | "private" | "restricted">("private")
  const [editActivities, setEditActivities] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  
  const router = useRouter()
  const params = useParams()
  const goalId = params.id as string

  useEffect(() => {
    loadGoalData()
  }, [goalId])

  useEffect(() => {
    if (goal) {
      setEditTitle(goal.title)
      setEditDescription(goal.description)
      setEditVisibility(goal.visibility)
      setEditActivities(activities.map(a => a.title))
    }
  }, [goal, activities])

  const loadGoalData = async () => {
    try {
      const storedGoals = localStorage.getItem('goals')
      const storedPartnerGoals = localStorage.getItem('partnerGoals')
      
      // Initialize partner goals if they don't exist
      if (!storedPartnerGoals) {
        const partnerGoals = [
          {
            id: 'partner-1',
            userId: 'sarah-martinez',
            ownerName: 'Sarah Martinez',
            title: 'Morning Yoga Practice',
            description: 'Daily 20-minute yoga session to improve flexibility and mindfulness',
            type: 'single-activity',
            visibility: 'restricted',
            status: 'active',
            progress: 65,
            streak: 8,
            category: 'Health & Fitness',
            createdAt: '2024-01-20T08:00:00Z',
            dueDate: '2024-03-20',
            scheduleType: 'recurring',
            recurrencePattern: 'daily',
            activities: ['Complete 20-minute yoga session'],
            accountabilityPartners: [{ id: 'mock-user-id', name: 'You', avatar: '/placeholder-avatar.jpg' }]
          },
          {
            id: 'partner-2', 
            userId: 'mike-chen',
            ownerName: 'Mike Chen',
            title: 'Learn Python Programming',
            description: 'Complete Python course and build 3 projects',
            type: 'multi-activity',
            visibility: 'restricted',
            status: 'active',
            progress: 40,
            streak: 0,
            category: 'Learning',
            createdAt: '2024-02-01T10:00:00Z',
            dueDate: '2024-04-01',
            scheduleType: 'date',
            activities: [
              { title: 'Complete Python basics course', completed: true },
              { title: 'Build calculator app', completed: true },
              { title: 'Build todo list app', completed: false },
              { title: 'Build weather app', completed: false },
              { title: 'Complete final project', completed: false }
            ],
            accountabilityPartners: [{ id: 'mock-user-id', name: 'You', avatar: '/placeholder-avatar.jpg' }]
          }
        ]
        localStorage.setItem('partnerGoals', JSON.stringify(partnerGoals))
      }
      
      // Check if this is a partner goal first
      const partnerGoals = JSON.parse(localStorage.getItem('partnerGoals') || '[]')
      const partnerGoal = partnerGoals.find((g: any) => g.id === goalId)
      if (partnerGoal) {
          const mappedGoal: Goal = {
            id: partnerGoal.id,
            user_id: partnerGoal.userId,
            title: partnerGoal.title,
            description: partnerGoal.description || '',
            goal_type: partnerGoal.type === 'multi-activity' ? 'multi' : 'single',
            visibility: partnerGoal.visibility || 'private',
            start_date: partnerGoal.createdAt,
            is_suspended: partnerGoal.status === 'paused',
            created_at: partnerGoal.createdAt,
            updated_at: partnerGoal.updatedAt || partnerGoal.createdAt,
            completed_at: partnerGoal.completedAt || null,
          }
          
          const mappedActivities: Activity[] = (partnerGoal.activities || []).map((activity: any, index: number) => ({
            id: String(index + 1),
            goal_id: goalId,
            title: activity.title || activity,
            description: activity.description,
            is_completed: activity.completed || false,
            order_index: index,
            created_at: partnerGoal.createdAt,
            updated_at: partnerGoal.updatedAt || partnerGoal.createdAt,
            completed_at: activity.completedAt
          }))
          
          setGoal(mappedGoal)
          setActivities(mappedActivities)
          setStoreMeta({ 
            dueDate: partnerGoal.dueDate, 
            recurrencePattern: partnerGoal.recurrencePattern, 
            recurrenceDays: partnerGoal.recurrenceDays,
            scheduleType: partnerGoal.scheduleType
          })
          setStoreRole({
            isGroupGoal: false,
            groupMembers: [],
            accountabilityPartners: partnerGoal.accountabilityPartners || [],
            ownerName: partnerGoal.ownerName
          })
          setLoading(false)
          return
        }
      
      if (!storedGoals) {
        setGoal(null)
        setLoading(false)
        return
      }
      
      const goals = JSON.parse(storedGoals)
      const foundGoal = goals.find((g: any) => g.id === goalId)
      
      if (!foundGoal) {
        setGoal(null)
        setLoading(false)
        return
      }
      
      const mappedGoal: Goal = {
        id: foundGoal.id,
        user_id: foundGoal.userId || 'current-user',
        title: foundGoal.title,
        description: foundGoal.description || '',
        goal_type: foundGoal.type === 'multi-activity' ? 'multi' : 'single',
        visibility: foundGoal.visibility || 'private',
        start_date: foundGoal.createdAt,
        is_suspended: foundGoal.status === 'paused',
        created_at: foundGoal.createdAt,
        updated_at: foundGoal.updatedAt || foundGoal.createdAt,
        completed_at: foundGoal.completedAt || null,
      }
      
      const mappedActivities: Activity[] = (foundGoal.activities || []).map((activity: any, index: number) => ({
        id: String(index + 1),
        goal_id: goalId,
        title: activity.title || activity,
        description: activity.description,
        is_completed: activity.completed || false,
        order_index: index,
        created_at: foundGoal.createdAt,
        updated_at: foundGoal.updatedAt || foundGoal.createdAt,
        completed_at: activity.completedAt,
        assigned_members: activity.assigned_members || []
      }))
      
      if (foundGoal.isGroupGoal) {
        const assignments: {[key: string]: string[]} = {}
        mappedActivities.forEach(activity => {
          assignments[activity.id] = activity.assigned_members || []
        })
        setActivityAssignments(assignments)
      }
      
      setGoal(mappedGoal)
      setActivities(mappedActivities)
      setStoreMeta({ 
        dueDate: foundGoal.dueDate, 
        recurrencePattern: foundGoal.recurrencePattern, 
        recurrenceDays: foundGoal.recurrenceDays,
        scheduleType: foundGoal.scheduleType
      })
      setStoreRole({
        isGroupGoal: foundGoal.isGroupGoal || false,
        groupMembers: (foundGoal.groupMembers || []).map((member: any) => ({
          ...member,
          status: member.status || 'accepted'
        })),
        accountabilityPartners: foundGoal.accountabilityPartners || [],
        ownerName: foundGoal.ownerName
      })
    } catch (error) {
      setGoal(null)
    }
    setLoading(false)
  }

  const toggleActivity = async (activityId: string, isCompleted: boolean) => {
    const updatedActivities = activities.map(a => 
      a.id === activityId 
        ? { ...a, is_completed: !isCompleted, completed_at: !isCompleted ? new Date().toISOString() : undefined }
        : a
    )
    setActivities(updatedActivities)
    
    try {
      const storedGoals = localStorage.getItem('goals')
      if (storedGoals) {
        const goals = JSON.parse(storedGoals)
        const goalIndex = goals.findIndex((g: any) => g.id === goalId)
        if (goalIndex !== -1) {
          goals[goalIndex].activities = updatedActivities.map(a => ({
            title: a.title,
            description: a.description,
            completed: a.is_completed,
            completedAt: a.completed_at,
            assigned_members: activityAssignments[a.id] || []
          }))
          localStorage.setItem('goals', JSON.stringify(goals))
          window.dispatchEvent(new CustomEvent('goalUpdated'))
        }
      }
    } catch (error) {
      toast.error("Failed to update activity")
    }
    
    toast.success(isCompleted ? "Activity unchecked" : "Activity completed!")
  }

  const completeGoal = async () => {
    if (goal) {
      const completedGoal = { ...goal, completed_at: new Date().toISOString() }
      setGoal(completedGoal)
      
      try {
        const storedGoals = localStorage.getItem('goals')
        if (storedGoals) {
          const goals = JSON.parse(storedGoals)
          const goalIndex = goals.findIndex((g: any) => g.id === goalId)
          if (goalIndex !== -1) {
            goals[goalIndex].completedAt = completedGoal.completed_at
            goals[goalIndex].status = 'completed'
            localStorage.setItem('goals', JSON.stringify(goals))
            window.dispatchEvent(new CustomEvent('goalUpdated'))
          }
        }
      } catch (error) {
        toast.error("Failed to complete goal")
      }
      
      toast.success("🎉 Goal completed! Great job!")
      await notifications.goalCompleted(goal.title)
    }
  }

  const toggleSuspend = async () => {
    if (goal) {
      const updatedGoal = { ...goal, is_suspended: !goal.is_suspended }
      setGoal(updatedGoal)
      
      try {
        const storedGoals = localStorage.getItem('goals')
        if (storedGoals) {
          const goals = JSON.parse(storedGoals)
          const goalIndex = goals.findIndex((g: any) => g.id === goalId)
          if (goalIndex !== -1) {
            goals[goalIndex].status = updatedGoal.is_suspended ? 'paused' : 'active'
            localStorage.setItem('goals', JSON.stringify(goals))
            window.dispatchEvent(new CustomEvent('goalUpdated'))
          }
        }
      } catch (error) {
        toast.error("Failed to update goal status")
      }
      
      toast.success(goal.is_suspended ? "Goal resumed" : "Goal suspended")
    }
  }

  const deleteGoal = async () => {
    if (confirm("Are you sure you want to delete this goal?")) {
      try {
        const storedGoals = localStorage.getItem('goals')
        if (storedGoals) {
          const goals = JSON.parse(storedGoals)
          const filteredGoals = goals.filter((g: any) => g.id !== goalId)
          localStorage.setItem('goals', JSON.stringify(filteredGoals))
          window.dispatchEvent(new CustomEvent('goalDeleted'))
        }
        toast.success("Goal deleted")
        router.push("/goals")
      } catch (error) {
        toast.error("Failed to delete goal")
      }
    }
  }

  const saveGoalUpdates = async () => {
    setSaving(true)
    try {
      const storedGoals = localStorage.getItem('goals')
      if (storedGoals) {
        const goals = JSON.parse(storedGoals)
        const goalIndex = goals.findIndex((g: any) => g.id === goalId)
        if (goalIndex !== -1) {
          goals[goalIndex].title = editTitle
          goals[goalIndex].description = editDescription
          goals[goalIndex].visibility = editVisibility
          if (goal?.goal_type === 'multi') {
            goals[goalIndex].activities = editActivities.filter(a => a.trim()).map((title, index) => {
              const activityId = String(index + 1)
              const existingActivity = activities[index]
              return {
                title: title.trim(),
                completed: existingActivity?.is_completed || false,
                completedAt: existingActivity?.completed_at,
                assigned_members: activityAssignments[activityId] || []
              }
            })
          }
          goals[goalIndex].updatedAt = new Date().toISOString()
          localStorage.setItem('goals', JSON.stringify(goals))
          window.dispatchEvent(new CustomEvent('goalUpdated'))
          
          await loadGoalData()
          toast.success("Goal updated successfully!")
        }
      }
    } catch (error) {
      toast.error("Failed to update goal")
    }
    setSaving(false)
  }

  const updateActivityAssignment = (activityId: string, memberIds: string[]) => {
    setActivityAssignments(prev => ({
      ...prev,
      [activityId]: memberIds
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Target className="h-12 w-12 text-blue-600 animate-pulse" />
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Goal not found</p>
          <Link href="/goals">
            <Button>Back to Goals</Button>
          </Link>
        </div>
      </div>
    )
  }

  const completedActivities = activities.filter(a => a.is_completed).length
  const totalActivities = activities.length
  const progress = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0

  const apList = storeRole?.accountabilityPartners || []
  const groupMembersList = storeRole?.groupMembers || []
  const currentUserId = 'mock-user-id'
  const isYourGoal = goal?.user_id === currentUserId
  const isGroupGoal = !!(storeRole?.isGroupGoal)
  const isMultiActivity = goal && (goal.goal_type === "multi")
  const isAccountabilityPartner = apList.some(p => p.id === currentUserId) && !isYourGoal && !isGroupGoal
  const isGroupMember = groupMembersList.some(m => m.id === currentUserId && m.status === 'accepted') && !isYourGoal
  const goalOwnerName = isYourGoal ? "yourself" : (storeRole?.ownerName || "the goal owner")
  const acceptedMembers = groupMembersList.filter(m => m.status === 'accepted')
  const isPartnerView = isAccountabilityPartner

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/goals">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex gap-2">
            {isYourGoal && (
              <Button variant="outline" size="sm" onClick={toggleSuspend}>
                {goal.is_suspended ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                {goal.is_suspended ? "Resume" : "Pause"}
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList className={`grid w-full ${isPartnerView ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <TabsTrigger value="details">View Details</TabsTrigger>
            {!isPartnerView && <TabsTrigger value="update">Update Goal</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {goal.goal_type.replace('-', ' ')}
                      </Badge>
                      {isGroupGoal && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                          <Users className="h-3 w-3 mr-1" /> Group
                        </Badge>
                      )}
                      {goal.is_suspended && <Badge variant="destructive" className="text-xs">Paused</Badge>}
                      {goal.completed_at && <Badge className="bg-green-600 text-xs">Completed</Badge>}
                    </div>
                    <CardTitle className="text-2xl">{goal.title}</CardTitle>
                    {goal.description && (
                      <CardDescription className="text-sm mt-2">{goal.description}</CardDescription>
                    )}
                  </CardHeader>
                </Card>

                {isMultiActivity ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          {isGroupGoal ? "Group Activities" : "Track Activities"}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                          {completedActivities} / {totalActivities}
                        </div>
                      </div>
                      <Progress value={progress} className="h-2 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {activities.map((activity) => {
                        const assignedMembers = activityAssignments[activity.id] || []
                        const isAssignedToMe = !isGroupGoal || assignedMembers.length === 0 || assignedMembers.includes(currentUserId)
                        const canToggle = (isYourGoal || (isGroupMember && isAssignedToMe)) && !isPartnerView
                        
                        return (
                          <div key={activity.id} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={activity.is_completed}
                                onCheckedChange={() => toggleActivity(activity.id, activity.is_completed)}
                                disabled={!canToggle}
                                className="mt-0.5"
                              />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${activity.is_completed ? "line-through text-muted-foreground" : ""}`}>
                                  {activity.title}
                                </p>
                                {isGroupGoal && assignedMembers.length > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs text-muted-foreground">Assigned to:</span>
                                    <div className="flex -space-x-1">
                                      {assignedMembers.slice(0, 3).map(memberId => {
                                        const member = acceptedMembers.find(m => m.id === memberId)
                                        return member ? (
                                          <div key={memberId} className="w-5 h-5 rounded-full bg-primary/20 border border-background flex items-center justify-center" title={member.name}>
                                            <span className="text-xs font-medium">{member.name.charAt(0)}</span>
                                          </div>
                                        ) : null
                                      })}
                                      {assignedMembers.length > 3 && (
                                        <div className="w-5 h-5 rounded-full bg-muted border border-background flex items-center justify-center">
                                          <span className="text-xs">+{assignedMembers.length - 3}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              {activity.is_completed && (
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Complete Your Goal</CardTitle>
                      <CardDescription>
                        {storeMeta?.dueDate ? `Due: ${new Date(storeMeta.dueDate).toLocaleDateString()}` : "Track your progress"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {goal.completed_at ? (
                        <div className="text-center py-8 space-y-3">
                          <div className="text-5xl">🎉</div>
                          <div>
                            <p className="font-semibold text-green-700">Goal Completed!</p>
                            <p className="text-sm text-muted-foreground">Completed on {new Date(goal.completed_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-center py-6">
                            <div className="text-4xl mb-3">🎯</div>
                            <p className="text-sm text-muted-foreground">Ready to mark this goal as complete?</p>
                          </div>
                          {isYourGoal && !isPartnerView && (
                            <Button onClick={completeGoal} className="w-full" size="lg">
                              <CheckCircle2 className="h-5 w-5 mr-2" />
                              Mark as Complete
                            </Button>
                          )}
                          {isPartnerView && (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground mb-3">
                                You're an accountability partner for {goalOwnerName}'s goal
                              </p>
                              <EncouragementCard 
                                isPartner={true}
                                goalOwnerName={goalOwnerName}
                                compact={true}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {((isYourGoal || isGroupMember) && (storeRole?.accountabilityPartners?.length > 0 || isGroupGoal)) || isPartnerView && (
                  <EncouragementCard 
                    isPartner={isPartnerView}
                    goalOwnerName={isGroupGoal ? "the group" : goalOwnerName}
                    newMessageCount={isPartnerView ? 0 : 2}
                  />
                )}
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Goal Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="capitalize">{goal.goal_type.replace('-', ' ')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Visibility</span>
                      <span className="capitalize">{goal.visibility}</span>
                    </div>
                    {(() => {
                      const goalAge = Date.now() - new Date(goal.created_at).getTime()
                      const isMoreThanOneMinute = goalAge > 60 * 1000
                      const streak = (() => {
                        try {
                          const storedGoals = localStorage.getItem('goals')
                          if (storedGoals) {
                            const goals = JSON.parse(storedGoals)
                            const foundGoal = goals.find((g: any) => g.id === goalId)
                            return foundGoal?.streak || 0
                          }
                        } catch {}
                        return 0
                      })()
                      return isYourGoal && storeMeta?.scheduleType !== 'date' && isMoreThanOneMinute && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            Streak
                          </span>
                          <span className="font-medium">{streak} days</span>
                        </div>
                      )
                    })()}
                    {storeMeta?.dueDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Due Date</span>
                        <span>{new Date(storeMeta.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(goal.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {(apList.length > 0 || groupMembersList.length > 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {isGroupGoal ? "Group Members" : "Accountability Partners"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {isGroupGoal ? (
                          groupMembersList.map((member) => (
                            <div key={member.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={member.avatar} />
                                  <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="text-sm">{member.name}</span>
                                  {member.id === goal?.user_id && (
                                    <Crown className="h-3 w-3 text-yellow-500 inline ml-1" title="Owner" />
                                  )}
                                </div>
                              </div>
                              <Badge 
                                variant={member.status === 'accepted' ? 'default' : member.status === 'pending' ? 'secondary' : 'destructive'}
                                className="text-xs"
                              >
                                {member.status}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          apList.slice(0, 5).map((person) => (
                            <div key={person.id} className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={person.avatar} />
                                <AvatarFallback className="text-xs">{person.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{person.name}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="update" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Update Goal</CardTitle>
                    <CardDescription>Make changes to your goal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Title</Label>
                      <Input
                        id="edit-title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Goal title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Goal description"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Visibility</Label>
                      <Select value={editVisibility} onValueChange={(value: "public" | "private" | "restricted") => setEditVisibility(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="restricted">Partners Only</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {goal?.goal_type === 'multi' && (
                      <div className="space-y-4">
                        <Label>Activities</Label>
                        <div className="space-y-4">
                          {editActivities.map((activity, index) => {
                            const activityId = String(index + 1)
                            const assignedMembers = activityAssignments[activityId] || []
                            
                            return (
                              <div key={index} className="space-y-2 p-3 border rounded-lg">
                                <Input
                                  value={activity}
                                  onChange={(e) => {
                                    const newActivities = [...editActivities]
                                    newActivities[index] = e.target.value
                                    setEditActivities(newActivities)
                                  }}
                                  placeholder={`Activity ${index + 1}`}
                                />
                                {isGroupGoal && isYourGoal && (
                                  <div className="space-y-2">
                                    <Label className="text-xs">Assignment</Label>
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          checked={assignedMembers.length === 0}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              updateActivityAssignment(activityId, [])
                                            }
                                          }}
                                        />
                                        <span className="text-xs">Assign to all members</span>
                                      </div>
                                      <div className="pl-4 space-y-1">
                                        <p className="text-xs text-muted-foreground">Or assign to specific members:</p>
                                        {acceptedMembers.map(member => (
                                          <div key={member.id} className="flex items-center space-x-2">
                                            <Checkbox
                                              checked={assignedMembers.includes(member.id)}
                                              onCheckedChange={(checked) => {
                                                const newAssignments = checked 
                                                  ? [...assignedMembers, member.id]
                                                  : assignedMembers.filter(id => id !== member.id)
                                                updateActivityAssignment(activityId, newAssignments)
                                              }}
                                            />
                                            <span className="text-xs">{member.name}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-4">
                      <Button onClick={saveGoalUpdates} disabled={saving || !editTitle.trim()}>
                        {saving ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Save Changes
                          </div>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                {isYourGoal && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start" onClick={deleteGoal}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Goal
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}