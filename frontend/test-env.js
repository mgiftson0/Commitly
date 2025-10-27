import fs from 'fs';
import path from 'path';

// test-env.js
console.log('Current working directory:', process.cwd());
console.log('Environment variables:', {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '**present**' : '**missing**',
});

// Try to read the .env.local file directly
try {
  const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
  console.log('\n.env.local file contents:', envContent);
} catch (error) {
  console.error('Error reading .env.local:', error);
}