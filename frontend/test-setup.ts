import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testFullSetup() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    console.log('1. Testing Database Connection...')
    const { data: versionData, error: versionError } = await supabase
      .rpc('version')
      .single()
    
    if (versionError) throw versionError
    console.log('✓ Database connection successful')

    console.log('\n2. Testing Tables Setup...')
    const tables = ['users', 'goals', 'activities', 'accountability_partners', 'notifications']
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        if (error.message.includes('permission denied')) {
          console.log(`✓ Table '${table}' exists (access denied as expected due to RLS)`)
        } else {
          throw new Error(`Table '${table}' check failed: ${error.message}`)
        }
      } else {
        console.log(`✓ Table '${table}' exists and is accessible`)
      }
    }

    console.log('\n3. Testing Auth Configuration...')
    const { data: authConfig, error: authError } = await supabase.auth.getSession()
    if (authError) throw authError
    console.log('✓ Auth is properly configured')

    console.log('\nAll systems are ready! You can now test user signup.')
    
  } catch (error) {
    console.error('Setup test failed:', error)
  }
}

testFullSetup()