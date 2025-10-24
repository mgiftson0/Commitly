import { createClient } from '@/lib/supabase-client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const durationType = searchParams.get('duration_type')

  try {
    let query = supabase
      .from('seasonal_goal_templates')
      .select('*')
      .order('popularity_score', { ascending: false })

    if (durationType) {
      query = query.eq('duration_type', durationType)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}