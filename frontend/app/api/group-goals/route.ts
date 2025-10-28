import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { goalData, memberIds } = await request.json()
    console.log('Group goal creation request:', { goalData, memberIds })
    
    // Get current user
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Auth error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('Authenticated user:', user.id)

    // Create the group goal
    const goalPayload = {
      ...goalData,
      user_id: user.id,
      is_group_goal: true,
      group_goal_status: 'pending'
    }
    console.log('Creating goal with payload:', goalPayload)
    
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .insert(goalPayload)
      .select()
      .single()

    if (goalError) {
      console.error('Goal creation error:', goalError)
      return NextResponse.json({ error: goalError.message }, { status: 400 })
    }
    
    console.log('Goal created successfully:', goal.id)

    // Add owner as group member
    await supabase.from('group_goal_members').insert({
      goal_id: goal.id,
      user_id: user.id,
      role: 'owner',
      status: 'accepted',
      can_edit: true
    })

    // Send invitations to members
    const invitations = memberIds.map((memberId: string) => ({
      goal_id: goal.id,
      inviter_id: user.id,
      invitee_id: memberId,
      status: 'pending',
      message: `Join our group goal: ${goalData.title}`
    }))
    
    console.log('Sending invitations:', invitations)
    const { error: inviteError } = await supabase.from('group_goal_invitations').insert(invitations)
    
    if (inviteError) {
      console.error('Invitation error:', inviteError)
    }

    // Create notifications for invitees
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, username')
      .eq('id', user.id)
      .single()

    const userName = profile 
      ? `${profile.first_name} ${profile.last_name}`.trim() || profile.username
      : 'Someone'

    const notifications = memberIds.map((memberId: string) => ({
      user_id: memberId,
      type: 'goal_created',
      title: 'Group Goal Invitation 🎯',
      message: `${userName} invited you to join the group goal: "${goal.title}"`,
      data: {
        goal_id: goal.id,
        inviter_id: user.id,
        invitation_type: 'group_goal'
      },
      read: false
    }))

    console.log('Sending notifications:', notifications)
    const { error: notifError } = await supabase.from('notifications').insert(notifications)
    
    if (notifError) {
      console.error('Notification error:', notifError)
    }

    return NextResponse.json({ goal, success: true })
  } catch (error) {
    console.error('Error creating group goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}