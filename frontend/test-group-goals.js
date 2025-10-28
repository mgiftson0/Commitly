const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rnqjqjqjqjqjqjqj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucWpxanFqcWpxanFqcWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczMjU1NzY5NCwiZXhwIjoyMDQ4MTMzNjk0fQ.example'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testGroupGoalsTables() {
  try {
    console.log('Testing group goals tables...')
    
    // Test if goals table has group goal columns
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('id, is_group_goal, group_goal_status')
      .limit(1)
    
    if (goalsError) {
      console.error('Goals table error:', goalsError.message)
      if (goalsError.message.includes('column "is_group_goal" does not exist')) {
        console.log('❌ Group goal columns missing from goals table')
      }
    } else {
      console.log('✅ Goals table has group goal columns')
    }
    
    // Test group_goal_invitations table
    const { data: invitations, error: invitationsError } = await supabase
      .from('group_goal_invitations')
      .select('id')
      .limit(1)
    
    if (invitationsError) {
      console.error('Invitations table error:', invitationsError.message)
      if (invitationsError.message.includes('relation "public.group_goal_invitations" does not exist')) {
        console.log('❌ group_goal_invitations table does not exist')
      }
    } else {
      console.log('✅ group_goal_invitations table exists')
    }
    
    // Test group_goal_members table
    const { data: members, error: membersError } = await supabase
      .from('group_goal_members')
      .select('id')
      .limit(1)
    
    if (membersError) {
      console.error('Members table error:', membersError.message)
      if (membersError.message.includes('relation "public.group_goal_members" does not exist')) {
        console.log('❌ group_goal_members table does not exist')
      }
    } else {
      console.log('✅ group_goal_members table exists')
    }
    
  } catch (error) {
    console.error('Test error:', error)
  }
}

testGroupGoalsTables()