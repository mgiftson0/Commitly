"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Users, Crown, Shield, UserCheck, Calendar, Target, MessageCircle } from 'lucide-react'
import { GroupActivityProgress } from './group-activity-progress'

interface GroupMember {
  id: string
  name: string
  avatar: string
  role: 'admin' | 'member' | 'creator'
  joinedAt: string
  status: 'active' | 'pending' | 'inactive'
}

interface GroupActivity {
  id: string
  title: string
  description: string
  assignedMembers: string[]
  progress: number
  completed: boolean
}

interface GroupGoalDetailsProps {
  goalId: string
  isAdmin: boolean
  currentUserId: string
}

export function GroupGoalDetails({ goalId, isAdmin, currentUserId }: GroupGoalDetailsProps) {
  const [members, setMembers] = useState<GroupMember[]>([])
  const [activities, setActivities] = useState<GroupActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGroupDetails()
  }, [goalId])

  const loadGroupDetails = async () => {
    try {
      // Mock data for demonstration
      const mockMembers: GroupMember[] = [
        {
          id: 'user1',
          name: 'John Doe',
          avatar: '/placeholder-avatar.jpg',
          role: 'creator',
          joinedAt: '2024-01-15',
          status: 'active'
        },
        {
          id: 'user2', 
          name: 'Jane Smith',
          avatar: '/placeholder-avatar.jpg',
          role: 'admin',
          joinedAt: '2024-01-16',
          status: 'active'
        },
        {
          id: 'user3',
          name: 'Mike Johnson',
          avatar: '/placeholder-avatar.jpg', 
          role: 'member',
          joinedAt: '2024-01-17',
          status: 'active'
        }
      ]

      const mockActivities: GroupActivity[] = [
        {
          id: 'activity1',
          title: 'Complete workout routine',
          description: 'Daily 30-minute workout',
          assignedMembers: ['user1', 'user2'],
          progress: 75,
          completed: false
        },
        {
          id: 'activity2', 
          title: 'Track nutrition',
          description: 'Log daily meals and calories',
          assignedMembers: ['user2', 'user3'],
          progress: 50,
          completed: false
        }
      ]

      setMembers(mockMembers)
      setActivities(mockActivities)
    } catch (error) {
      console.error('Error loading group details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'creator': return <Crown className="h-3 w-3 text-yellow-500" />
      case 'admin': return <Shield className="h-3 w-3 text-blue-500" />
      default: return <UserCheck className="h-3 w-3 text-green-500" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'creator': return <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">Creator</Badge>
      case 'admin': return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Admin</Badge>
      default: return <Badge variant="outline" className="text-xs">Member</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Group Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.name}</span>
                      {getRoleIcon(member.role)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getRoleBadge(member.role)}
                  <Badge 
                    variant={member.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {member.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Group Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Group Activities ({activities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <GroupActivityProgress
                key={activity.id}
                activityId={activity.id}
                activityTitle={activity.title}
                assignedMembers={activity.assignedMembers}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Group Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Group Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="font-bold text-lg text-primary">{members.length}</div>
              <div className="text-xs text-muted-foreground">Total Members</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="font-bold text-lg text-primary">{activities.length}</div>
              <div className="text-xs text-muted-foreground">Activities</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="font-bold text-lg text-primary">
                {Math.round(activities.reduce((sum, a) => sum + a.progress, 0) / activities.length) || 0}%
              </div>
              <div className="text-xs text-muted-foreground">Avg Progress</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="font-bold text-lg text-primary">
                {activities.filter(a => a.completed).length}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}