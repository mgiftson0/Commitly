import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { completed } = await request.json()
    const activityId = params.id
    
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get activity details with assignment info
    const { data: activity, error: activityError } = await supabase
      .from('goal_activities')
      .select('*, goals!inner(user_id, is_group_goal)')
      .eq('id', activityId)
      .single()

    if (activityError || !activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    // Check permissions
    const isGoalOwner = activity.goals.user_id === user.id
    const isAssignedToUser = activity.assigned_to === user.id
    const isAssignedToAll = activity.assigned_to_all === true
    
    if (!isGoalOwner && !isAssignedToUser && !isAssignedToAll) {
      return NextResponse.json({ error: 'Not authorized to update this activity' }, { status: 403 })
    }

    // For group goals with assigned_to_all, handle completion tracking
    if (activity.goals.is_group_goal && activity.assigned_to_all) {
      if (completed) {
        // Add completion record for this user
        await supabase
          .from('activity_completions')
          .upsert({
            activity_id: activityId,
            user_id: user.id,
            goal_id: activity.goal_id,
            completed_at: new Date().toISOString()
          })
      } else {
        // Remove completion record for this user
        await supabase
          .from('activity_completions')
          .delete()
          .eq('activity_id', activityId)
          .eq('user_id', user.id)
      }

      // Check if all members have completed it
      const { data: members } = await supabase
        .from('group_goal_members')
        .select('user_id')
        .eq('goal_id', activity.goal_id)
        .eq('status', 'accepted')

      const { data: completions } = await supabase
        .from('activity_completions')
        .select('user_id')
        .eq('activity_id', activityId)

      const memberIds = (members || []).map(m => m.user_id)
      const completedByIds = (completions || []).map(c => c.user_id)
      
      // Activity is fully completed when all members have completed it
      const allCompleted = memberIds.every(id => completedByIds.includes(id))
      
      // Update activity completion status
      await supabase
        .from('goal_activities')
        .update({ completed: allCompleted })
        .eq('id', activityId)

    } else {
      // Regular activity update (single user or assigned to specific user)
      await supabase
        .from('goal_activities')
        .update({ completed })
        .eq('id', activityId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}