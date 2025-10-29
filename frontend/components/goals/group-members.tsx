"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Crown, Check, X, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

interface GroupMember {
  id: string
  name: string
  avatar?: string
  role: string
  status: 'pending' | 'accepted' | 'declined'
  joined_at?: string
}

interface GroupMembersProps {
  goalId: string
  className?: string
}

export function GroupMembers({ goalId, className = "" }: GroupMembersProps) {
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMembers()
  }, [goalId])

  const loadMembers = async () => {
    try {
      // Get all group members (accepted, pending, declined)
      const { data: memberData } = await supabase
        .from('group_goal_members')
        .select('user_id, role, status, joined_at')
        .eq('goal_id', goalId)

      if (memberData && memberData.length > 0) {
        // Get profiles for members
        const userIds = memberData.map(m => m.user_id)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, username, profile_picture_url')
          .in('id', userIds)

        const membersWithProfiles = memberData.map(member => {
          const profile = profiles?.find(p => p.id === member.user_id)
          return {
            id: member.user_id,
            name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username || 'Member' : 'Member',
            avatar: profile?.profile_picture_url,
            role: member.role,
            status: member.status,
            joined_at: member.joined_at
          }
        })

        setMembers(membersWithProfiles)
      }
    } catch (error) {
      console.error('Error loading group members:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Users className="h-4 w-4 text-muted-foreground animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading members...</span>
      </div>
    )
  }

  if (members.length === 0) {
    return null
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <Check className="h-3 w-3 text-green-600" />
      case 'declined': return <X className="h-3 w-3 text-red-600" />
      case 'pending': return <Clock className="h-3 w-3 text-yellow-600" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-50 text-green-700 border-green-200'
      case 'declined': return 'bg-red-50 text-red-700 border-red-200'
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Group Members ({members.length})</span>
      </div>
      
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-2 rounded-lg border bg-card">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {member.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{member.name}</span>
                {member.role === 'owner' && (
                  <Crown className="h-3 w-3 text-amber-600" />
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${getStatusColor(member.status)}`}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(member.status)}
                  <span className="capitalize">{member.status}</span>
                </div>
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}