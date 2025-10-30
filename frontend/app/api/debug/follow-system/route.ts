import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Test if follows table exists
    const { data: tables, error: tablesError } = await supabase
      .from('follows')
      .select('count')
      .limit(1);
    
    if (tablesError) {
      return NextResponse.json({ 
        error: 'Follows table not found', 
        details: tablesError.message 
      }, { status: 500 });
    }
    
    // Test if profiles has the required columns
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('followers_count, following_count, is_private')
      .limit(1);
    
    if (profilesError) {
      return NextResponse.json({ 
        error: 'Profiles table missing columns', 
        details: profilesError.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Follow system tables exist',
      followsCount: tables?.length || 0
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Database check failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
