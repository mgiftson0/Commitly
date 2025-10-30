import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { goalId: string } }
) {
  try {
    const goalId = params.goalId
    
    // Get current user
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (goal owner)
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('user_id, title, is_group_goal')
      .eq('id', goalId)
      .single()

    if (goalError || !goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    if (goal.user_id !== user.id) {
      return NextResponse.json({ error: 'Only the goal admin can delete this goal' }, { status: 403 })
    }

    // Get all members to notify them (before deletion)
    const { data: members } = await supabase
      .from('group_goal_members')
      .select('user_id, profile:profiles(first_name, last_name)')
      .eq('goal_id', goalId)
      .eq('status', 'accepted')
      .neq('user_id', user.id) // Exclude the admin

    // Delete the goal (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    // Notify all members about goal deletion
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

      const { error: notifError } = await supabase.from('notifications').insert(notifications)
      if (notifError) {
        console.error('Notification error:', notifError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting group goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { goalId: string } }
) {
  try {
    const goalId = params.goalId
    const updates = await request.json()
    
    // Get current user
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (goal owner)
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('user_id, is_group_goal')
      .eq('id', goalId)
      .single()

    if (goalError || !goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    if (goal.user_id !== user.id) {
      return NextResponse.json({ error: 'Only the goal admin can edit this goal' }, { status: 403 })
    }

    // Update the goal
    const { error: updateError } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', goalId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

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

        const { error: notifError } = await supabase.from('notifications').insert(notifications)
        if (notifError) {
          console.error('Notification error:', notifError)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating group goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}