import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '.env.local') })

const testConnection = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Testing Supabase connection...')
  console.log('SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
  console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing')

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing environment variables')
    return
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      throw error
    }
    
    console.log('✓ Successfully connected to Supabase')
  } catch (error) {
    console.error('✗ Failed to connect to Supabase:', error)
  }
}

testConnection()