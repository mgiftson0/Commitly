import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get followers or following list
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id') || user.id;
    const type = searchParams.get('type'); // 'followers' | 'following' | 'pending'

    // Check if follows table exists by testing a simple query first
    try {
      const { data: testData, error: testError } = await supabase
        .from('follows')
        .select('id')
        .limit(1);
      
      if (testError) {
        // Table doesn't exist or any other database error, return empty results
        console.log('Follows table error:', testError.message, 'Code:', testError.code);
        return NextResponse.json({ 
          followers: [], 
          following: [], 
          pending: [] 
        });
      }
    } catch (testErr) {
      console.log('Follows table test failed, assuming table does not exist:', testErr);
      return NextResponse.json({ 
        followers: [], 
        following: [], 
        pending: [] 
      });
    }

    if (type === 'followers') {
      // Get users who follow this user
      const { data, error } = await supabase
        .from('follows')
        .select(`
          id,
          follower_id,
          status,
          created_at,
          follower:follower_id (
            id,
            username,
            display_name,
            profile_picture_url,
            bio
          )
        `)
        .eq('following_id', userId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Error fetching followers:', error.message);
        return NextResponse.json({ followers: [] });
      }

      return NextResponse.json({ 
        followers: data?.map(f => f.follower) || [] 
      });

    } else if (type === 'following') {
      // Get users this user follows
      const { data, error } = await supabase
        .from('follows')
        .select(`
          id,
          following_id,
          status,
          created_at,
          following:following_id (
            id,
            username,
            display_name,
            profile_picture_url,
            bio
          )
        `)
        .eq('follower_id', userId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Error fetching following:', error.message);
        return NextResponse.json({ following: [] });
      }

      return NextResponse.json({ 
        following: data?.map(f => f.following) || [] 
      });

    } else if (type === 'pending') {
      // Get pending follow requests (only for authenticated user)
      if (userId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { data, error } = await supabase
        .from('follows')
        .select(`
          id,
          follower_id,
          created_at,
          follower:follower_id (
            id,
            username,
            display_name,
            profile_picture_url,
            bio
          )
        `)
        .eq('following_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Error fetching pending requests:', error.message);
        return NextResponse.json({ pending: [] });
      }

      return NextResponse.json({ 
        pending: data?.map(f => ({ ...f.follower, request_id: f.id, created_at: f.created_at })) || [] 
      });

    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error fetching follows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch follows' },
      { status: 500 }
    );
  }
}

// POST - Follow a user
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if follows table exists
    try {
      const { error: testError } = await supabase.from('follows').select('id').limit(1);
      if (testError) {
        console.log('Follows table error:', testError.message, 'Code:', testError.code);
        return NextResponse.json({ 
          error: 'Follow system not available - please run database migration' 
        }, { status: 503 });
      }
    } catch (testErr) {
      console.log('Follows table test failed, cannot follow user:', testErr);
      return NextResponse.json({ 
        error: 'Follow system not available - please run database migration' 
      }, { status: 503 });
    }

    const { following_id } = await request.json();

    if (!following_id) {
      return NextResponse.json({ error: 'following_id is required' }, { status: 400 });
    }

    if (following_id === user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if target profile is private
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('is_private, username, display_name')
      .eq('id', following_id)
      .single();

    if (profileError) throw profileError;

    // Determine status based on privacy setting
    const status = targetProfile.is_private ? 'pending' : 'accepted';

    // Insert follow relationship
    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id,
        status
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Already following this user' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: status === 'pending' 
        ? 'Follow request sent' 
        : `Now following ${targetProfile.display_name || targetProfile.username}`
    });

  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json(
      { error: 'Failed to follow user' },
      { status: 500 }
    );
  }
}

// DELETE - Unfollow a user
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if follows table exists
    try {
      const { error: testError } = await supabase.from('follows').select('id').limit(1);
      if (testError) {
        console.log('Follows table error:', testError.message, 'Code:', testError.code);
        return NextResponse.json({ 
          error: 'Follow system not available - please run database migration' 
        }, { status: 503 });
      }
    } catch (testErr) {
      console.log('Follows table test failed, cannot unfollow user:', testErr);
      return NextResponse.json({ 
        error: 'Follow system not available - please run database migration' 
      }, { status: 503 });
    }

    const searchParams = request.nextUrl.searchParams;
    const following_id = searchParams.get('following_id');

    if (!following_id) {
      return NextResponse.json({ error: 'following_id is required' }, { status: 400 });
    }

    // Delete the follow relationship
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', following_id);

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: 'Successfully unfollowed user'
    });

  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json(
      { error: 'Failed to unfollow user' },
      { status: 500 }
    );
  }
}
