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

    // Check if follows table exists
    try {
      const { error: testError } = await supabase.from('follows').select('id').limit(1);
      if (testError) {
        console.log('Follows table error:', testError.message, 'Code:', testError.code);
        return NextResponse.json({
          is_following: false,
          is_follower: false,
          is_mutual: false,
          follow_status: 'none',
          is_pending: false,
          target_followers_count: 0,
          target_following_count: 0,
          target_is_private: false
        });
      }
    } catch (testErr) {
      console.log('Follows table test failed, returning default status:', testErr);
      return NextResponse.json({
        is_following: false,
        is_follower: false,
        is_mutual: false,
        follow_status: 'none',
        is_pending: false,
        target_followers_count: 0,
        target_following_count: 0,
        target_is_private: false
      });
    }

    // Use the database function to get follow status
    let followStatus;
    try {
      const { data, error } = await supabase
        .rpc('get_follow_status', {
          requester_id: user.id,
          target_id: target_id
        });

      if (error) {
        console.log('get_follow_status function not found, using fallback query');
        // Fallback to manual query if function doesn't exist
        const { data: followData, error: followError } = await supabase
          .from('follows')
          .select('status')
          .or(`and(follower_id.eq.${user.id},following_id.eq.${target_id}),and(follower_id.eq.${target_id},following_id.eq.${user.id})`);

        followStatus = {
          is_following: followData?.some(f => f.follower_id === user.id && f.following_id === target_id && f.status === 'accepted') || false,
          is_follower: followData?.some(f => f.follower_id === target_id && f.following_id === user.id && f.status === 'accepted') || false,
          is_mutual: followData?.filter(f => f.status === 'accepted').length === 2 || false,
          follow_status: followData?.find(f => f.follower_id === user.id && f.following_id === target_id)?.status || 'none',
          is_pending: followData?.some(f => f.follower_id === user.id && f.following_id === target_id && f.status === 'pending') || false
        };
      } else {
        followStatus = data[0];
      }
    } catch (funcErr) {
      console.log('Follow status check failed, using defaults');
      followStatus = {
        is_following: false,
        is_follower: false,
        is_mutual: false,
        follow_status: 'none',
        is_pending: false
      };
    }

    // Also get counts
    let targetProfile;
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('followers_count, following_count, is_private')
        .eq('id', target_id)
        .single();

      if (profileError) {
        // If columns don't exist, use defaults
        targetProfile = {
          followers_count: 0,
          following_count: 0,
          is_private: false
        };
      } else {
        targetProfile = data;
      }
    } catch (profileErr) {
      targetProfile = {
        followers_count: 0,
        following_count: 0,
        is_private: false
      };
    }

    return NextResponse.json({
      ...followStatus,
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
