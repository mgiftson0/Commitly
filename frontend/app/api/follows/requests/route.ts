import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// PATCH - Accept or reject a follow request
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { request_id, action } = await request.json();

    if (!request_id || !action) {
      return NextResponse.json(
        { error: 'request_id and action are required' },
        { status: 400 }
      );
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "accept" or "reject"' },
        { status: 400 }
      );
    }

    // Verify the request belongs to the current user
    const { data: followRequest, error: fetchError } = await supabase
      .from('follows')
      .select('*')
      .eq('id', request_id)
      .eq('following_id', user.id)
      .eq('status', 'pending')
      .single();

    if (fetchError || !followRequest) {
      return NextResponse.json(
        { error: 'Follow request not found' },
        { status: 404 }
      );
    }

    if (action === 'accept') {
      // Update status to accepted
      const { error: updateError } = await supabase
        .from('follows')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', request_id);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        message: 'Follow request accepted'
      });

    } else {
      // Delete the request (reject)
      const { error: deleteError } = await supabase
        .from('follows')
        .delete()
        .eq('id', request_id);

      if (deleteError) throw deleteError;

      return NextResponse.json({
        success: true,
        message: 'Follow request rejected'
      });
    }

  } catch (error) {
    console.error('Error handling follow request:', error);
    return NextResponse.json(
      { error: 'Failed to handle follow request' },
      { status: 500 }
    );
  }
}
