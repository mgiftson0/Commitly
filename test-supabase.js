const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing Supabase Connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables not set!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // Test 1: Check if we can access the auth service
    console.log('\n📡 Test 1: Checking auth service...')
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('❌ Auth service error:', error.message)
    } else {
      console.log('✅ Auth service is accessible')
      console.log('   Current session:', session ? 'Active' : 'None')
    }

    // Test 2: Try to get auth settings
    console.log('\n📡 Test 2: Checking project status...')
    const { data, error: settingsError } = await supabase.auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password: 'test123456'
    })
    
    if (settingsError) {
      console.error('❌ Signup test error:', settingsError.message)
      console.error('   Status:', settingsError.status)
      console.error('   Full error:', JSON.stringify(settingsError, null, 2))
    } else {
      console.log('✅ Signup endpoint is working')
      console.log('   User ID:', data.user?.id || 'No user returned')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testConnection()
