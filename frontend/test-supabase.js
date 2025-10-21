#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 * Tests if your Supabase credentials are configured correctly
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');

  if (!fs.existsSync(envPath)) {
    log('❌ .env.local file not found!', 'red');
    log('   Create a .env.local file with your Supabase credentials', 'yellow');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });

  return true;
}

async function testSupabase() {
  log('\n🚀 Testing Supabase Connection\n', 'cyan');
  log('━'.repeat(50), 'blue');

  // Load environment variables
  if (!loadEnv()) {
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if credentials exist
  log('\n📋 Checking Configuration...', 'cyan');

  if (!supabaseUrl || supabaseUrl === 'your-project-url-here') {
    log('❌ NEXT_PUBLIC_SUPABASE_URL not configured', 'red');
    log('   Please add your Supabase URL to .env.local', 'yellow');
    return;
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
    log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not configured', 'red');
    log('   Please add your Supabase anon key to .env.local', 'yellow');
    return;
  }

  log(`✅ URL: ${supabaseUrl}`, 'green');
  log(`✅ Key: ${supabaseAnonKey.substring(0, 30)}...`, 'green');

  // Create Supabase client
  log('\n🔌 Creating Supabase Client...', 'cyan');

  let supabase;
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    log('✅ Client created successfully', 'green');
  } catch (error) {
    log(`❌ Failed to create client: ${error.message}`, 'red');
    return;
  }

  // Test 1: Check auth service
  log('\n🧪 Test 1: Authentication Service', 'cyan');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      log(`⚠️  Auth service accessible but no active session`, 'yellow');
      log(`   Error: ${error.message}`, 'yellow');
    } else {
      log('✅ Auth service is accessible', 'green');
      if (session) {
        log(`   Active session found for user: ${session.user.email}`, 'green');
      } else {
        log('   No active session (this is normal for first run)', 'yellow');
      }
    }
  } catch (error) {
    log(`❌ Auth service check failed: ${error.message}`, 'red');
    log('   This might indicate network issues or incorrect credentials', 'yellow');
  }

  // Test 2: Try to sign up with a test email (will fail but confirms endpoint works)
  log('\n🧪 Test 2: Signup Endpoint', 'cyan');
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test123456';

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (error) {
      // Check for specific error types
      if (error.message.includes('Email rate limit exceeded') ||
          error.message.includes('too many requests')) {
        log('⚠️  Rate limit reached (this is actually good - endpoint works!)', 'yellow');
      } else if (error.message.includes('not authorized')) {
        log('⚠️  Email signups may be disabled', 'yellow');
        log('   Enable email auth in Supabase: Authentication → Providers → Email', 'yellow');
      } else {
        log(`⚠️  Signup endpoint responded with: ${error.message}`, 'yellow');
      }
    } else if (data.user) {
      log('✅ Signup endpoint is working!', 'green');
      log(`   Test user created: ${data.user.id}`, 'green');
      if (data.user.email_confirmed_at) {
        log('   Email confirmation not required (auto-confirm enabled)', 'yellow');
      } else {
        log('   Email confirmation required (check your email)', 'yellow');
      }
    }
  } catch (error) {
    log(`❌ Signup test failed: ${error.message}`, 'red');
  }

  // Test 3: Check project status
  log('\n🧪 Test 3: Project Status', 'cyan');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        log('✅ Login endpoint is working (expected error for wrong credentials)', 'green');
      } else if (error.message.includes('Email not confirmed')) {
        log('✅ Login endpoint is working (email confirmation required)', 'green');
      } else {
        log(`⚠️  Login responded with: ${error.message}`, 'yellow');
      }
    } else {
      log('⚠️  Unexpected: Login succeeded with test credentials', 'yellow');
    }
  } catch (error) {
    log(`❌ Login test failed: ${error.message}`, 'red');
  }

  // Summary
  log('\n' + '━'.repeat(50), 'blue');
  log('\n✨ Test Complete!\n', 'cyan');

  log('📝 Next Steps:', 'cyan');
  log('1. Configure redirect URLs in Supabase:', 'reset');
  log('   Authentication → URL Configuration', 'reset');
  log('   Add: http://localhost:3000/auth/callback', 'reset');
  log('', 'reset');
  log('2. Restart your dev server:', 'reset');
  log('   npm run dev', 'reset');
  log('', 'reset');
  log('3. Visit: http://localhost:3000/auth/login', 'reset');
  log('   You should NOT see "Demo Mode" badge', 'reset');
  log('', 'reset');
  log('4. Try signing up - you should receive a real email!', 'reset');
  log('\n' + '━'.repeat(50), 'blue');
}

// Run the test
testSupabase().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
