import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testSupabaseSetup() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials')
    return
  }

  console.log('Testing Supabase configuration...')
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Test authentication setup
    console.log('\nTesting auth configuration...')
    const { data: authSettings, error: authError } = await supabase
      .from('auth.users')
      .select('count')
      .limit(1)
    
    if (authError) {
      console.error('Auth configuration error:', authError)
    } else {
      console.log('Auth configuration: OK')
    }

    // Test connection
    const { data: { version }, error: versionError } = await supabase
      .rpc('version')
      .single()

    if (versionError) {
      console.error('Database connection error:', versionError)
    } else {
      console.log('Database connection: OK, version:', version)
    }

  } catch (error) {
    console.error('Test failed:', error)
  }
}

testSupabaseSetup()