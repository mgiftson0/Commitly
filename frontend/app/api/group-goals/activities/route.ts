import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function PATCH(request: NextRequest) {
  try {
    const { activityId, completed } = await request.json()
    
    if (!activityId || typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'Activity ID and completion status required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is assigned to this activity
    const { data: activity, error: activityError } = await supabase
      .from('goal_activities')
      .select('*, assigned_members, goal_id')
      .eq('id', activityId)
      .single()

    if (activityError || !activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    // Check if user is assigned to this activity
    const assignedMembers = activity.assigned_members || []
    if (!assignedMembers.includes(user.id)) {
      return NextResponse.json({ error: 'Not authorized to update this activity' }, { status: 403 })
    }

    // Update activity completion for this user
    const { error: updateError } = await supabase
      .from('goal_activity_completions')
      .upsert({
        activity_id: activityId,
        user_id: user.id,
        completed: completed,
        completed_at: completed ? new Date().toISOString() : null
      })

    if (updateError) throw updateError

    // Calculate overall activity progress
    const { data: completions } = await supabase
      .from('goal_activity_completions')
      .select('completed, user_id')
      .eq('activity_id', activityId)
      .in('user_id', assignedMembers)

    const totalAssigned = assignedMembers.length
    const completedCount = completions?.filter(c => c.completed).length || 0
    const progressPercentage = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0

    // Update activity progress
    await supabase
      .from('goal_activities')
      .update({ 
        progress: progressPercentage,
        completed: progressPercentage === 100
      })
      .eq('id', activityId)

    // Get member completion details for progress bar
    const { data: memberProfiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, username, profile_picture_url')
      .in('id', assignedMembers)

    const memberProgress = assignedMembers.map(memberId => {
      const profile = memberProfiles?.find(p => p.id === memberId)
      const completion = completions?.find(c => c.user_id === memberId)
      return {
        id: memberId,
        name: profile?.first_name 
          ? `${profile.first_name} ${profile.last_name || ''}`.trim()
          : profile?.username || 'Member',
        avatar: profile?.profile_picture_url || '/placeholder-avatar.jpg',
        completed: completion?.completed || false
      }
    })

    return NextResponse.json({ 
      success: true, 
      progress: progressPercentage,
      completed: progressPercentage === 100,
      memberProgress,
      completedCount,
      totalAssigned
    })
  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const goalId = searchParams.get('goalId')
    
    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get activities with completion status for current user
    const { data: activities, error } = await supabase
      .from('goal_activities')
      .select(`
        *,
        completions:goal_activity_completions!inner(completed, user_id)
      `)
      .eq('goal_id', goalId)
      .order('order_index', { ascending: true })

    if (error) throw error

    return NextResponse.json({ activities: activities || [] })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}