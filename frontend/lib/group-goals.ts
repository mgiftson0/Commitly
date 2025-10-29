/**
 * Group Goals Service
 * Handles all group goal operations including invitations, member management, and activity assignments
 */

import { supabase } from './supabase-client'

export interface GroupGoalMember {
  id: string
  goal_id: string
  user_id: string
  role: 'owner' | 'member'
  status: 'pending' | 'accepted' | 'declined'
  invited_at: string
  responded_at?: string
  can_edit: boolean
  profile?: {
    first_name: string
    last_name: string
    username: string
    profile_picture_url?: string
  }
}

export interface GroupGoalInvitation {
  id: string
  goal_id: string
  inviter_id: string
  invitee_id: string
  status: 'pending' | 'accepted' | 'declined' | 'cancelled'
  message?: string
  created_at: string
  responded_at?: string
  goal?: {
    title: string
    description: string
  }
  inviter?: {
    first_name: string
    last_name: string
    username: string
  }
}

export interface ActivityAssignment {
  activity_id: string
  assigned_to?: string // specific user ID
  assigned_to_all: boolean
  activity_type: 'individual' | 'collaborative'
}

export interface ActivityCompletion {
  id: string
  activity_id: string
  user_id: string
  goal_id: string
  completed_at: string
  notes?: string
}

/**
 * Create a group goal with initial members
 */
export async function createGroupGoal(
  goalData: {
    title: string
    description: string
    goal_type: string
    category?: string
    priority?: string
    visibility: string
  },
  memberIds: string[]
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Create the goal
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .insert({
        ...goalData,
        user_id: user.id,
        is_group_goal: true,
        group_goal_status: 'pending'
      })
      .select()
      .single()

    if (goalError) throw goalError

    // Add owner as accepted member
    await supabase.from('group_goal_members').insert({
      goal_id: goal.id,
      user_id: user.id,
      role: 'owner',
      status: 'accepted',
      can_edit: true
    })

    // Send invitations to members
    const invitations = memberIds.map(memberId => ({
      goal_id: goal.id,
      inviter_id: user.id,
      invitee_id: memberId,
      status: 'pending' as const,
      message: `Join our group goal: ${goalData.title}`
    }))

    const { error: inviteError } = await supabase
      .from('group_goal_invitations')
      .insert(invitations)

    if (inviteError) throw inviteError

    // Create notifications for invitees
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, username')
      .eq('id', user.id)
      .single()

    const userName = profile 
      ? `${profile.first_name} ${profile.last_name}`.trim() || profile.username
      : 'Someone'

    // Insert notifications with proper structure for Commitly
    const notifications = memberIds.map(memberId => ({
      user_id: memberId,
      type: 'accountability_request', // Use existing notification type
      title: 'Group Goal Invitation 🎯',
      message: `${userName} invited you to join the group goal: "${goal.title}"`,
      data: {
        goal_id: goal.id,
        inviter_id: user.id,
        invitation_type: 'group_goal',
        action_required: true
      },
      read: false
    }))

    const { error: notifError } = await supabase.from('notifications').insert(notifications)
    if (notifError) console.error('Notification error:', notifError)

    return { goal, success: true }
  } catch (error) {
    console.error('Error creating group goal:', error)
    return { error, success: false }
  }
}

/**
 * Get pending invitations for current user
 */
export async function getPendingInvitations() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('group_goal_invitations')
      .select(`
        *,
        goal:goals(title, description, category),
        inviter:profiles!group_goal_invitations_inviter_id_fkey(
          first_name, last_name, username, profile_picture_url
        )
      `)
      .eq('invitee_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, success: true }
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return { error, success: false }
  }
}

/**
 * Accept group goal invitation
 */
export async function acceptGroupGoalInvitation(invitationId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('group_goal_invitations')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString()
      })
      .eq('id', invitationId)
      .eq('invitee_id', user.id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return { error, success: false }
  }
}

/**
 * Decline group goal invitation
 */
export async function declineGroupGoalInvitation(invitationId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('group_goal_invitations')
      .update({
        status: 'declined',
        responded_at: new Date().toISOString()
      })
      .eq('id', invitationId)
      .eq('invitee_id', user.id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error declining invitation:', error)
    return { error, success: false }
  }
}

/**
 * Get group goal members
 */
export async function getGroupGoalMembers(goalId: string) {
  try {
    const { data, error } = await supabase
      .from('group_goal_members')
      .select(`
        *,
        profile:profiles(first_name, last_name, username, profile_picture_url)
      `)
      .eq('goal_id', goalId)
      .order('invited_at', { ascending: true })

    if (error) throw error
    return { data, success: true }
  } catch (error) {
    console.error('Error fetching members:', error)
    return { error, success: false }
  }
}

/**
 * Assign activity to user(s)
 */
export async function assignActivity(
  activityId: string,
  assignment: { assignedTo?: string; assignedToAll: boolean }
) {
  try {
    const { error } = await supabase
      .from('goal_activities')
      .update({
        assigned_to: assignment.assignedTo || null,
        assigned_to_all: assignment.assignedToAll,
        activity_type: assignment.assignedToAll ? 'collaborative' : 'individual'
      })
      .eq('id', activityId)

    if (error) throw error

    // If assigned to all, create notification for all members
    if (assignment.assignedToAll) {
      const { data: activity } = await supabase
        .from('goal_activities')
        .select('goal_id, title')
        .eq('id', activityId)
        .single()

      if (activity) {
        const { data: members } = await supabase
          .from('group_goal_members')
          .select('user_id')
          .eq('goal_id', activity.goal_id)
          .eq('status', 'accepted')

        if (members) {
          const notifications = members.map(m => ({
            user_id: m.user_id,
            type: 'goal_reminder',
            title: 'New Activity Assigned',
            message: `Activity assigned to all members: "${activity.title}"`,
            data: {
              activity_id: activityId,
              goal_id: activity.goal_id
            },
            read: false
          }))

          await supabase.from('notifications').insert(notifications)
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error assigning activity:', error)
    return { error, success: false }
  }
}

/**
 * Complete activity for current user
 */
export async function completeActivity(
  activityId: string,
  goalId: string,
  notes?: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if activity is assigned to this user
    const { data: activity } = await supabase
      .from('goal_activities')
      .select('assigned_to, assigned_to_all')
      .eq('id', activityId)
      .single()

    if (!activity) throw new Error('Activity not found')

    // Verify user can complete this activity
    if (!activity.assigned_to_all && activity.assigned_to !== user.id) {
      throw new Error('You are not assigned to this activity')
    }

    // Insert completion record
    const { error } = await supabase
      .from('activity_completions')
      .insert({
        activity_id: activityId,
        user_id: user.id,
        goal_id: goalId,
        notes
      })

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error completing activity:', error)
    return { error, success: false }
  }
}

/**
 * Get activity completion status for group goal
 */
export async function getActivityCompletions(activityId: string) {
  try {
    const { data, error } = await supabase
      .from('activity_completions')
      .select(`
        *,
        user:profiles(first_name, last_name, username, profile_picture_url)
      `)
      .eq('activity_id', activityId)
      .order('completed_at', { ascending: false })

    if (error) throw error
    return { data, success: true }
  } catch (error) {
    console.error('Error fetching completions:', error)
    return { error, success: false }
  }
}

/**
 * Check if user can update activity
 */
export async function canUserUpdateActivity(activityId: string, userId: string) {
  try {
    const { data: activity } = await supabase
      .from('goal_activities')
      .select('assigned_to, assigned_to_all, goal_id')
      .eq('id', activityId)
      .single()

    if (!activity) return false

    // Check if user is assigned
    if (activity.assigned_to_all) return true
    if (activity.assigned_to === userId) return true

    // Check if user is goal admin (owner)
    const isAdmin = await isGroupGoalAdmin(activity.goal_id, userId)
    return isAdmin
  } catch (error) {
    console.error('Error checking permissions:', error)
    return false
  }
}

/**
 * Check if user is admin (owner) of a group goal
 */
export async function isGroupGoalAdmin(goalId: string, userId: string): Promise<boolean> {
  try {
    // Check if user is the goal owner
    const { data: goal } = await supabase
      .from('goals')
      .select('user_id, is_group_goal')
      .eq('id', goalId)
      .single()

    if (!goal) return false
    
    // For group goals, check if user is the owner
    if (goal.is_group_goal) {
      return goal.user_id === userId
    }
    
    // For regular goals, only owner can manage
    return goal.user_id === userId
  } catch (error) {
    console.error('Error checking admin permissions:', error)
    return false
  }
}

/**
 * Delete group goal (admin only)
 */
export async function deleteGroupGoal(goalId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if user is admin
    const isAdmin = await isGroupGoalAdmin(goalId, user.id)
    if (!isAdmin) {
      throw new Error('Only the goal admin can delete this goal')
    }

    // Get goal details for notifications
    const { data: goal } = await supabase
      .from('goals')
      .select('title')
      .eq('id', goalId)
      .single()

    // Get all members to notify them
    const { data: members } = await supabase
      .from('group_goal_members')
      .select('user_id, profile:profiles(first_name, last_name)')
      .eq('goal_id', goalId)
      .eq('status', 'accepted')
      .neq('user_id', user.id) // Exclude the admin

    // Delete the goal (cascade will handle related records)
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)

    if (error) throw error

    // Notify all members about goal deletion
    if (members && members.length > 0 && goal) {
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name, username')
        .eq('id', user.id)
        .single()

      const adminName = adminProfile 
        ? `${adminProfile.first_name} ${adminProfile.last_name}`.trim() || adminProfile.username
        : 'Admin'

      const notifications = members.map(member => ({
        user_id: member.user_id,
        type: 'goal_deleted',
        title: 'Group Goal Deleted',
        message: `${adminName} deleted the group goal: "${goal.title}"`,
        data: {
          goal_id: goalId,
          goal_title: goal.title,
          deleted_by: user.id,
          deleted_by_name: adminName
        },
        read: false
      }))

      await supabase.from('notifications').insert(notifications)
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting group goal:', error)
    return { error, success: false }
  }
}

/**
 * Update group goal (admin only)
 */
export async function updateGroupGoal(goalId: string, updates: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if user is admin
    const isAdmin = await isGroupGoalAdmin(goalId, user.id)
    if (!isAdmin) {
      throw new Error('Only the goal admin can edit this goal')
    }

    const { error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', goalId)

    if (error) throw error

    // If significant changes, notify members
    if (updates.title || updates.description || updates.target_date) {
      const { data: members } = await supabase
        .from('group_goal_members')
        .select('user_id')
        .eq('goal_id', goalId)
        .eq('status', 'accepted')
        .neq('user_id', user.id)

      if (members && members.length > 0) {
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, username')
          .eq('id', user.id)
          .single()

        const adminName = adminProfile 
          ? `${adminProfile.first_name} ${adminProfile.last_name}`.trim() || adminProfile.username
          : 'Admin'

        const notifications = members.map(member => ({
          user_id: member.user_id,
          type: 'goal_updated',
          title: 'Group Goal Updated',
          message: `${adminName} updated the group goal details`,
          data: {
            goal_id: goalId,
            updated_by: user.id,
            updated_by_name: adminName
          },
          read: false
        }))

        await supabase.from('notifications').insert(notifications)
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating group goal:', error)
    return { error, success: false }
  }
}

/**
 * Get group goal progress with member stats
 */
export async function getGroupGoalProgress(goalId: string) {
  try {
    // Get all activities
    const { data: activities } = await supabase
      .from('goal_activities')
      .select('id, title, assigned_to, assigned_to_all, completed')
      .eq('goal_id', goalId)

    if (!activities) return { data: null, success: false }

    // Get all accepted members
    const { data: members } = await supabase
      .from('group_goal_members')
      .select('user_id, profile:profiles(first_name, last_name, username)')
      .eq('goal_id', goalId)
      .eq('status', 'accepted')

    // Get all completions
    const { data: completions } = await supabase
      .from('activity_completions')
      .select('activity_id, user_id')
      .eq('goal_id', goalId)

    const memberProgress = members?.map(member => {
      const assignedActivities = activities.filter(
        a => a.assigned_to_all || a.assigned_to === member.user_id
      )
      const completedActivities = assignedActivities.filter(a =>
        completions?.some(c => c.activity_id === a.id && c.user_id === member.user_id)
      )

      const profile = member.profile as any
      return {
        user_id: member.user_id,
        name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown',
        assigned: assignedActivities.length,
        completed: completedActivities.length,
        progress: assignedActivities.length > 0
          ? Math.round((completedActivities.length / assignedActivities.length) * 100)
          : 0
      }
    })

    return {
      data: {
        totalActivities: activities.length,
        completedActivities: activities.filter(a => a.completed).length,
        memberProgress
      },
      success: true
    }
  } catch (error) {
    console.error('Error fetching progress:', error)
    return { error, success: false }
  }
}
