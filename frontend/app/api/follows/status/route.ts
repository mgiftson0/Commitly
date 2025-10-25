import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Check follow status between current user and target user
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const target_id = searchParams.get('target_id');

    if (!target_id) {
      return NextResponse.json({ error: 'target_id is required' }, { status: 400 });
    }

    // Use the database function to get follow status
    const { data, error } = await supabase
      .rpc('get_follow_status', {
        requester_id: user.id,
        target_id: target_id
      });

    if (error) throw error;

    // Also get counts
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('followers_count, following_count, is_private')
      .eq('id', target_id)
      .single();

    if (profileError) throw profileError;

    return NextResponse.json({
      ...data[0],
      target_followers_count: targetProfile.followers_count,
      target_following_count: targetProfile.following_count,
      target_is_private: targetProfile.is_private
    });

  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    );
  }
}
