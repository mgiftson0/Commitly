import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const durationType = searchParams.get('duration_type')

  try {
    let query = supabase
      .from('seasonal_cohorts')
      .select(`
        *,
        seasonal_cohort_members(count)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (durationType) {
      query = query.eq('duration_type', durationType)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cohorts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { data, error } = await supabase
      .from('seasonal_cohorts')
      .insert({
        ...body,
        created_by: user.id,
        current_members: 1
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create cohort' }, { status: 500 })
  }
}