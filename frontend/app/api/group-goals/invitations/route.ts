import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function PATCH(request: NextRequest) {
  try {
    const { invitationId, action } = await request.json()
    console.log('Processing invitation response:', { invitationId, action })
    
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First get the invitation to find the goal_id
    const { data: notification } = await supabase
      .from('notifications')
      .select('data')
      .eq('id', invitationId)
      .single()

    if (!notification?.data?.goal_id) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    const goalId = notification.data.goal_id
    const inviterId = notification.data.inviter_id

    // Update or create invitation record
    const { error: inviteError } = await supabase
      .from('group_goal_invitations')
      .upsert({
        goal_id: goalId,
        inviter_id: inviterId,
        invitee_id: user.id,
        status: action,
        responded_at: new Date().toISOString()
      })

    if (inviteError) {
      console.error('Invitation update error:', inviteError)
    }

    // Update group goal members table based on action
    if (action === 'accepted') {
      await supabase.from('group_goal_members').upsert({
        goal_id: goalId,
        user_id: user.id,
        role: 'member',
        status: 'accepted',
        can_edit: false
      })
    } else if (action === 'declined') {
      // Add as declined member - this will trigger activity reassignment
      await supabase.from('group_goal_members').upsert({
        goal_id: goalId,
        user_id: user.id,
        role: 'member',
        status: 'declined',
        can_edit: false
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}