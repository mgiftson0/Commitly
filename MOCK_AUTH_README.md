# Mock Authentication Mode

## Overview

The Commitly app now supports a **Mock Authentication Mode** for development purposes. This allows you to bypass Supabase authentication errors and test the UI/UX without a fully configured backend.

## Problem Solved

Your Supabase project was returning errors:
- **Login**: 400 Bad Request - Invalid credentials
- **Signup**: 500 Internal Server Error - "Database error saving new user"

This indicates that while your Supabase credentials are correct, the database schema is not properly configured for user authentication.

## Solution: Mock Auth Mode

Instead of fixing the Supabase database (which requires backend setup), we've implemented a development-only mock authentication system.

## How to Use

### Enable Mock Auth

In your `.env.local` file, set:

```env
NEXT_PUBLIC_USE_MOCK_AUTH=true
```

### Disable Mock Auth (Use Real Supabase)

```env
NEXT_PUBLIC_USE_MOCK_AUTH=false
```

or simply comment out the line:

```env
# NEXT_PUBLIC_USE_MOCK_AUTH=true
```

## What Works in Mock Mode

✅ **Login Page** - Any email/password will work
✅ **Signup Page** - Account creation will succeed (without actual database)
✅ **Dashboard** - Loads with empty state (no real data)
✅ **Logout** - Returns to homepage
✅ **Google OAuth** - Simulates successful OAuth flow

## What Doesn't Work in Mock Mode

❌ **Real Data** - No goals, streaks, or user profile data will be saved/loaded
❌ **API Calls** - Database queries are skipped
❌ **Session Persistence** - Refreshing the page may log you out
❌ **Multi-device Sync** - Mock auth is client-side only

## Files Modified

### New Files
- `lib/mock-auth.ts` - Helper utilities for mock authentication

### Modified Files
- `.env.local` - Added `NEXT_PUBLIC_USE_MOCK_AUTH=true`
- `app/auth/login/page.tsx` - Added mock auth bypass
- `app/auth/signup/page.tsx` - Added mock auth bypass
- `app/dashboard/page.tsx` - Added mock auth bypass

## Mock User Data

When mock auth is enabled, a default user is created:

```typescript
{
  id: 'mock-user-id-123',
  email: 'mockuser@commitly.dev',
  created_at: '2025-...',
  updated_at: '2025-...'
}
```

## Next Steps to Use Real Auth

To switch to real authentication, you need to:

1. **Configure Supabase Database**
   - Set up proper database schema
   - Enable user authentication tables
   - Configure email auth provider

2. **Update `.env.local`**
   ```env
   NEXT_PUBLIC_USE_MOCK_AUTH=false
   ```

3. **Restart Dev Server**
   ```bash
   npm run dev
   ```

## Testing

### Current Setup (Mock Mode)
```bash
# Server is already running at http://localhost:3000
# Try logging in with any credentials:
# Email: anything@example.com
# Password: anything
```

You should see:
- ✅ Login succeeds with toast: "Welcome back! (Mock Auth Mode)"
- ✅ Redirects to dashboard
- ✅ Dashboard shows empty state (no auth errors)
- ✅ Navigation works without redirect loops

## Troubleshooting

**Problem**: Still getting Supabase errors
**Solution**: Make sure `.env.local` has `NEXT_PUBLIC_USE_MOCK_AUTH=true` and restart the dev server

**Problem**: Dashboard redirects back to login
**Solution**: Clear browser cache/cookies and try again. The mock mode sets a client-side flag.

**Problem**: Changes not reflected
**Solution**: Kill the dev server, remove `.next` folder, and restart:
```bash
# Stop server (Ctrl+C or kill process)
rm -rf .next    # or Remove-Item -Recurse -Force .\.next on Windows
npm run dev
```

## Production Considerations

⚠️ **IMPORTANT**: Mock auth mode should NEVER be enabled in production!

Before deploying:
1. Set `NEXT_PUBLIC_USE_MOCK_AUTH=false` (or remove the variable)
2. Ensure real Supabase authentication is properly configured
3. Test thoroughly with real auth
4. Verify all protected routes work correctly

## Support

If you encounter issues or need to set up real Supabase authentication, refer to:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
