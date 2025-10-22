import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testSignup() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials')
    return
  }

  console.log('Testing signup with Supabase...')
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    const testEmail = `test${Date.now()}@example.com`
    const testPassword = 'Test123456!'

    console.log(`Attempting to sign up with email: ${testEmail}`)
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    })

    if (error) {
      console.error('Signup error:', {
        message: error.message,
        status: error.status,
        details: error.details,
      })
    } else {
      console.log('Signup successful:', {
        userId: data.user?.id,
        email: data.user?.email,
        confirmed: data.user?.confirmed_at,
      })
    }
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testSignup()