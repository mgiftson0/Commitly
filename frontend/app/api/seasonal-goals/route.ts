import { createClient } from '@/lib/supabase-client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const durationType = searchParams.get('duration_type')

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_seasonal', true)
      .order('created_at', { ascending: false })

    if (durationType) {
      query = query.eq('duration_type', durationType)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch seasonal goals' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check creation window (Dec 15 - Jan 15)
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    const isCreationWindowOpen = (month === 12 && day >= 15) || (month === 1 && day <= 15)

    if (!isCreationWindowOpen) {
      return NextResponse.json(
        { error: 'Seasonal goals can only be created between December 15th and January 15th' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { data, error } = await supabase
      .from('goals')
      .insert({
        ...body,
        is_seasonal: true,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create seasonal goal' }, { status: 500 })
  }
}