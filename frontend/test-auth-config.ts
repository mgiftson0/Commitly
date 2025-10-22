import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function checkAuthSettings() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials')
    return
  }

  console.log('Checking Supabase Auth Configuration...')
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Test basic auth endpoint
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Auth endpoint test failed:', sessionError)
    } else {
      console.log('✓ Auth endpoints are accessible')
    }

    // Test user creation
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: `test${Date.now()}@commitly.app`,
      password: 'Test123456!',
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    })

    if (signUpError) {
      console.error('User creation test failed:', signUpError)
    } else {
      console.log('✓ User creation is working')
      console.log('User creation response:', {
        id: signUpData.user?.id,
        email: signUpData.user?.email,
        emailConfirm: signUpData.user?.confirmed_at ? 'Required' : 'Not Required'
      })
    }

  } catch (error) {
    console.error('Auth check failed:', error)
  }
}

checkAuthSettings()