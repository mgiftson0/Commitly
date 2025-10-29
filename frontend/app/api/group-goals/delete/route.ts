import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function DELETE(request: NextRequest) {
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

    // Check if user is admin of the group goal
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('user_id, is_group_goal')
      .eq('id', goalId)
      .single()

    if (goalError || !goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Check if user is the goal owner or admin
    let isAdmin = goal.user_id === user.id

    if (goal.is_group_goal && !isAdmin) {
      const { data: membership } = await supabase
        .from('group_goal_members')
        .select('role')
        .eq('goal_id', goalId)
        .eq('user_id', user.id)
        .single()

      isAdmin = membership?.role === 'admin' || membership?.role === 'creator'
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Not authorized to delete this goal' }, { status: 403 })
    }

    // Delete the goal (cascading deletes will handle related records)
    const { error: deleteError } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting group goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}