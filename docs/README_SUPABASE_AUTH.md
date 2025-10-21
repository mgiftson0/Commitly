# Supabase Authentication for Commitly

## 🎯 Overview

Commitly now supports **real Supabase authentication** for the signup, login, Google OAuth, and password reset pages. The app uses a **smart dual-mode system** that automatically switches between:

- **Supabase Mode**: Real authentication with Supabase backend
- **Mock Mode**: Local storage authentication (no backend required)

**Important**: Only the authentication pages use Supabase. The rest of the app (goals, notifications, achievements, etc.) continues to use localStorage, ensuring it works offline and without a database.

## 🚀 Quick Start

### Option 1: Use Without Supabase (Instant)

No setup needed! Just run:

```bash
cd frontend
npm run dev
```

The app automatically uses **Mock Mode** with localStorage authentication. All features work immediately.

### Option 2: Add Real Supabase Authentication (5 minutes)

1. **Create Supabase Project** at [supabase.com](https://supabase.com)

2. **Get Your Credentials**:
   - Go to Settings → API
   - Copy **Project URL** 
   - Copy **anon/public key**

3. **Add to `.env.local`**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Configure Redirect URLs in Supabase**:
   - Authentication → URL Configuration
   - Add: `http://localhost:3000/auth/callback`

5. **Restart Dev Server**:
   ```bash
   npm run dev
   ```

✅ Done! You now have real authentication.

**Detailed instructions**: See `SUPABASE_CREDENTIALS_SETUP.md`

## 📋 What Works with Supabase

### ✅ Using Supabase Authentication
- Email/password signup with confirmation emails
- Email/password login with session management
- Google OAuth (after additional setup)
- Password reset via email
- Automatic session persistence
- Secure token management

### 📦 Still Using localStorage (By Design)
- Goals and activities
- Notifications and reminders
- Achievements and streaks
- User preferences
- Profile data (beyond auth)
- All other app features

**Why this hybrid approach?**
- App works offline
- No database setup required
- Gradual migration path
- Zero breaking changes
- Best of both worlds

## 🔄 How Mode Detection Works

```
App Startup
     ↓
Check .env.local for Supabase credentials
     ↓
     ├─→ Valid credentials? → Supabase Mode
     │                         - Real authentication
     │                         - Email confirmations
     │                         - OAuth support
     │
     └─→ No/invalid credentials? → Mock Mode
                                   - localStorage auth
                                   - Works immediately
                                   - No emails sent
```

### Visual Indicator

**Mock Mode**: Shows amber badge on auth pages
```
🟡 Demo Mode - Using local storage
```

**Supabase Mode**: No badge shown (production ready)

## 📁 File Structure

### New Files Created

```
frontend/
├── lib/
│   └── supabase.ts                    # Real Supabase client & auth helpers
├── .env.local                          # Supabase credentials (gitignored)
├── SUPABASE_SETUP.md                   # Comprehensive setup guide (285 lines)
└── AUTH_IMPLEMENTATION_SUMMARY.md      # Technical implementation details

Commitly/
├── .env.local                          # Root-level credentials (shared)
└── SUPABASE_CREDENTIALS_SETUP.md       # Quick 5-minute setup guide
```

### Modified Files

```
frontend/app/auth/
├── login/page.tsx                     # Added Supabase login
├── signup/page.tsx                    # Added Supabase signup
├── reset-password/page.tsx            # Added Supabase password reset
└── callback/route.ts                  # Added OAuth callback handler
```

## 🔐 Authentication Features

### Email/Password Authentication

**Signup**:
- Collects: Full name, email, password
- Sends email confirmation (Supabase mode)
- Creates user account
- Redirects to KYC page

**Login**:
- Validates credentials
- Establishes session
- Stores user info in localStorage
- Redirects to dashboard

**Password Reset**:
- Sends reset email (Supabase mode)
- Secure reset link
- Updates password
- Maintains security

### Google OAuth

**Setup Required**:
1. Create Google OAuth credentials
2. Configure in Supabase dashboard
3. Test with "Continue with Google" button

**Flow**:
1. Click "Continue with Google"
2. Redirect to Google login
3. User grants permissions
4. Redirect back to app
5. Session established automatically

**Guide**: See `frontend/SUPABASE_SETUP.md` → "Configure Google OAuth"

## 🧪 Testing

### Test Mock Mode

```bash
# Run without Supabase credentials
npm run dev

# Visit http://localhost:3000/auth/login
# You should see: "🟡 Demo Mode - Using local storage"

# Test features:
✓ Sign up → Instant account creation
✓ Login → Immediate access
✓ Password reset → Simulated success
✓ Google OAuth → Simulated (mock)
```

### Test Supabase Mode

```bash
# Add credentials to .env.local
# Restart server
npm run dev

# Visit http://localhost:3000/auth/signup
# You should NOT see the demo mode badge

# Test features:
✓ Sign up → Receive confirmation email
✓ Check email → Click confirmation link
✓ Login → Real authentication
✓ Password reset → Receive reset email
✓ Google OAuth → Real Google login (if configured)
```

## 🛠️ Configuration

### Environment Variables

**Location**: `frontend/.env.local` or `Commitly/.env.local`

**Required for Supabase Mode**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Optional (for backend operations)**:
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Supabase Dashboard Configuration

**Required Settings**:

1. **Site URL** (Authentication → URL Configuration):
   ```
   http://localhost:3000
   ```

2. **Redirect URLs** (Authentication → URL Configuration):
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/reset-password/confirm
   ```

3. **Email Provider** (Authentication → Email Templates):
   - Default provider works for testing
   - Configure custom SMTP for production

**For Production**:
- Update Site URL to your domain
- Add production redirect URLs
- Configure custom email provider
- Enable additional security features

## 🔍 How It Works

### Authentication Helper Functions

The `authHelpers` object in `frontend/lib/supabase.ts` provides:

```typescript
// Sign up new user
await authHelpers.signUp(email, password, { full_name: "John Doe" })

// Sign in existing user
await authHelpers.signIn(email, password)

// Sign in with Google
await authHelpers.signInWithGoogle()

// Sign out
await authHelpers.signOut()

// Get current user
const user = await authHelpers.getUser()

// Get current session
const session = await authHelpers.getSession()

// Reset password
await authHelpers.resetPassword(email)

// Listen to auth changes
authHelpers.onAuthStateChange((event, session) => {
  console.log('Auth event:', event)
})
```

### Mode Detection

```typescript
import { hasSupabase } from '@/lib/supabase'

if (hasSupabase()) {
  // Use real Supabase authentication
  await authHelpers.signIn(email, password)
} else {
  // Use mock authentication
  localStorage.setItem('isAuthenticated', 'true')
}
```

### Session Management

**Supabase Mode**:
- Session stored in Supabase client (localStorage)
- Auto-refresh enabled
- Secure token management
- PKCE flow for OAuth

**Mock Mode**:
- Simple flag in localStorage
- User data stored locally
- No expiration

## 📊 Data Flow

### User Signup (Supabase Mode)

```
User fills form
     ↓
authHelpers.signUp()
     ↓
Supabase creates user
     ↓
Email sent to user
     ↓
User clicks confirmation link
     ↓
Redirect to /auth/callback
     ↓
Session established
     ↓
User info stored in localStorage
     ↓
Redirect to KYC page
```

### User Login (Supabase Mode)

```
User enters credentials
     ↓
authHelpers.signIn()
     ↓
Supabase validates
     ↓
Session created
     ↓
User info stored in localStorage
     ↓
Redirect to dashboard
```

### OAuth Flow

```
User clicks "Continue with Google"
     ↓
authHelpers.signInWithGoogle()
     ↓
Redirect to Google
     ↓
User grants permissions
     ↓
Google redirects to /auth/callback?code=xxx
     ↓
Exchange code for session
     ↓
Check if new user
     ↓
Redirect to KYC (new) or Dashboard (existing)
```

## 🐛 Troubleshooting

### "Supabase is not configured" Error

**Cause**: Environment variables not set or invalid

**Solution**:
1. Check `.env.local` has both variables
2. Values don't say "your-project-url-here"
3. Restart dev server after changes
4. Check file is in correct location

### Demo Mode Badge Still Showing

**Cause**: Credentials not detected

**Solution**:
1. Verify `.env.local` has real values
2. Restart dev server completely
3. Clear browser cache
4. Check browser console for errors

### Email Confirmation Not Working

**Cause**: Redirect URLs not configured

**Solution**:
1. Go to Supabase → Authentication → URL Configuration
2. Add `http://localhost:3000/auth/callback`
3. Check email templates have correct URLs
4. Verify email provider is working

### Google OAuth Fails

**Cause**: Missing or incorrect configuration

**Solution**:
1. Check Google OAuth credentials in Supabase
2. Verify redirect URI matches Supabase callback URL
3. Ensure Google Cloud Console project is configured
4. Check OAuth consent screen is published

### Session Not Persisting

**Cause**: Browser storage issues

**Solution**:
1. Check browser allows localStorage
2. Clear all localStorage and cookies
3. Ensure `persistSession: true` in config
4. Check for browser extensions blocking storage

## 📈 Production Deployment

### Pre-Deployment Checklist

- [ ] Add Supabase credentials to hosting platform
- [ ] Update Site URL in Supabase to production domain
- [ ] Add production redirect URLs in Supabase
- [ ] Configure custom email provider (not default)
- [ ] Enable email confirmation for new accounts
- [ ] Test all auth flows in staging
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure rate limiting in Supabase
- [ ] Review security settings
- [ ] Update Google OAuth redirect URIs (if using)

### Environment Variables for Production

**In Vercel/Netlify/etc**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

### Update Supabase Settings

**Site URL**:
```
https://yourapp.com
```

**Redirect URLs**:
```
https://yourapp.com/auth/callback
https://yourapp.com/auth/reset-password/confirm
```

## 📚 Documentation

- **Quick Setup**: `SUPABASE_CREDENTIALS_SETUP.md` (5-minute guide)
- **Detailed Setup**: `frontend/SUPABASE_SETUP.md` (comprehensive guide)
- **Implementation Details**: `frontend/AUTH_IMPLEMENTATION_SUMMARY.md`
- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **Next.js + Supabase**: https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs

## 🤝 Support

### Common Questions

**Q: Do I need Supabase to use the app?**  
A: No! The app works perfectly in Mock Mode without Supabase.

**Q: Will my localStorage data be lost if I add Supabase?**  
A: No! Goals and other data remain in localStorage. Only authentication changes.

**Q: Can I switch between modes?**  
A: Yes! Add/remove Supabase credentials and restart the server.

**Q: Is the free Supabase tier enough?**  
A: Yes! The free tier supports 50,000 monthly active users.

**Q: How do I migrate data to Supabase database?**  
A: See backend scripts in `backend/scripts/` for database setup. This is optional.

### Need Help?

1. Check browser console for error messages
2. Review Supabase project logs (Dashboard → Logs)
3. Verify all configuration steps
4. Check documentation files
5. Ensure environment variables are loaded

## ✨ Features Summary

### ✅ Implemented
- Dual-mode authentication (Supabase + Mock)
- Email/password signup with confirmation
- Email/password login with sessions
- Google OAuth support (configurable)
- Password reset via email
- Automatic mode detection
- Mode indicator UI
- Comprehensive error handling
- Session persistence
- TypeScript support
- Full documentation

### 📦 Unchanged (Still localStorage)
- Goals and activities management
- Notifications system
- Achievements and badges
- Streaks tracking
- User preferences
- Profile data (beyond basic auth)
- Offline functionality

## 🎉 Success!

Your Commitly app now has **production-ready authentication** that:
- ✅ Works without configuration (Mock Mode)
- ✅ Supports real Supabase auth when configured
- ✅ Includes Google OAuth
- ✅ Has comprehensive documentation
- ✅ Maintains backward compatibility
- ✅ Provides excellent UX
- ✅ Is fully TypeScript typed
- ✅ Has proper error handling
- ✅ Follows security best practices

**Next Steps**:
1. Add your Supabase credentials (5 minutes)
2. Test authentication flows
3. Configure Google OAuth (optional)
4. Deploy to production
5. Celebrate! 🎊

---

**Questions or issues?** Check the detailed guides or Supabase documentation.