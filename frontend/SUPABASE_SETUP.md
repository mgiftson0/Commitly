# Supabase Authentication Setup Guide

This guide will help you configure real Supabase authentication for the Commitly frontend. The app supports **dual-mode operation**: it can work with Supabase authentication OR fall back to local storage mock authentication if Supabase is not configured.

## 🎯 Overview

The authentication pages (login, signup, Google OAuth, password reset) can use either:
- **Supabase Mode**: Real authentication with Supabase backend
- **Mock Mode**: Local storage-based authentication (no backend required)

The app automatically detects which mode to use based on your environment configuration.

## 📋 Prerequisites

1. A Supabase account (create one at [supabase.com](https://supabase.com))
2. A Supabase project (free tier is sufficient)
3. Node.js installed on your machine

## 🚀 Quick Start

### Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the project details:
   - **Name**: Commitly (or your preferred name)
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose the closest region to your users
4. Click "Create new project" and wait for provisioning (takes ~2 minutes)

### Step 2: Get Your Supabase Credentials

1. Once your project is ready, go to **Settings** (gear icon in sidebar)
2. Navigate to **API** section
3. You'll need two values:
   - **Project URL**: Found under "Project URL" (e.g., `https://xyzcompany.supabase.co`)
   - **Anon/Public Key**: Found under "Project API keys" → `anon` `public` key (long string starting with `eyJ...`)

### Step 3: Configure Environment Variables

1. Open or create `.env.local` in the frontend directory:
   ```bash
   cd frontend
   ```

2. Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Replace the placeholder values with your actual credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
   ```

### Step 4: Configure Authentication Settings in Supabase

1. In your Supabase project dashboard, go to **Authentication** → **Settings**

2. **Site URL Configuration**:
   - Set **Site URL** to: `http://localhost:3000` (for development)
   - For production, set it to your deployed URL (e.g., `https://yourapp.com`)

3. **Redirect URLs**:
   - Add the following redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/reset-password/confirm`
   - For production, add:
     - `https://yourapp.com/auth/callback`
     - `https://yourapp.com/auth/reset-password/confirm`

4. **Email Templates** (Optional):
   - Go to **Authentication** → **Email Templates**
   - Customize the "Confirm Signup" and "Reset Password" email templates
   - Make sure the redirect URLs match your configuration

### Step 5: Enable Email Authentication

1. In **Authentication** → **Providers**
2. Ensure **Email** is enabled (it should be by default)
3. Configure email settings:
   - **Enable email confirmations**: Toggle ON if you want users to verify their email
   - **Secure email change**: Toggle ON for additional security

## 🔐 Configure Google OAuth (Optional)

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if not done:
   - User Type: External
   - Add app name, user support email, and developer contact
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: Commitly
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - Your production URL
   - Authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - Find your exact callback URL in Supabase dashboard

### Step 2: Configure Google OAuth in Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle **Enable Google Provider** to ON
4. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. Click **Save**

### Step 3: Test Google OAuth

1. Restart your development server:
   ```bash
   npm run dev
   ```
2. Go to login or signup page
3. Click "Continue with Google"
4. You should be redirected to Google login

## 🧪 Testing Your Setup

### Test Email/Password Authentication

1. Start the development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/signup`

3. Create a new account with email and password

4. Check your email for confirmation (if email confirmation is enabled)

5. Try logging in at `http://localhost:3000/auth/login`

### Test Password Reset

1. Go to `http://localhost:3000/auth/reset-password`
2. Enter your email address
3. Check your email for the reset link
4. Click the link and set a new password

### Verify Mode Detection

The app will show a badge indicating which mode it's using:
- **Green badge**: Supabase mode active
- **Amber badge**: "Demo Mode - Using local storage" (mock mode)

## 🔄 Switching Between Modes

### Use Supabase Mode
- Ensure `.env.local` has valid Supabase credentials
- Restart the dev server
- The app will automatically use Supabase authentication

### Use Mock Mode
- Remove or invalidate Supabase credentials in `.env.local`
- Or delete the `.env.local` file
- Restart the dev server
- The app will automatically fall back to mock authentication

## 📊 Database Setup (Optional)

Currently, the app uses **localStorage** for all data storage (goals, notifications, etc.), even when using Supabase authentication. This means:

✅ **What works with Supabase**:
- User signup/login
- Google OAuth
- Password reset
- Session management

📦 **What uses localStorage** (not affected by Supabase):
- Goals and activities
- Achievements
- Notifications
- User preferences
- Streaks and progress

If you want to migrate data storage to Supabase as well, you'll need to:
1. Create database tables in Supabase (see `SUPABASE_DATABASE_SCHEMA.md`)
2. Update the data layer to use Supabase instead of localStorage
3. Implement RLS (Row Level Security) policies

## 🐛 Troubleshooting

### Issue: "Supabase is not configured" error

**Solution**: Check that your `.env.local` file has valid credentials and restart the dev server.

### Issue: Google OAuth doesn't work

**Possible causes**:
1. Google OAuth credentials not configured in Supabase
2. Redirect URLs don't match
3. OAuth consent screen not published

**Solution**: 
- Verify all redirect URLs are correct
- Check Google Cloud Console for any errors
- Ensure OAuth app is published (or add test users)

### Issue: Email confirmation link doesn't work

**Solution**:
- Check that redirect URLs in Supabase include `/auth/callback`
- Verify email templates have correct redirect URLs
- Check spam folder for confirmation emails

### Issue: "Invalid redirect URL" error

**Solution**:
- Add the URL to the allowed redirect URLs in Supabase dashboard
- Ensure the URL matches exactly (including protocol and port)

### Issue: Session not persisting after login

**Solution**:
- Check browser console for errors
- Clear localStorage and cookies
- Ensure `persistSession: true` in Supabase client config

## 🔒 Security Best Practices

1. **Never commit `.env.local`** to version control (it's in `.gitignore`)
2. **Use environment variables** for production deployments
3. **Enable email confirmation** for production
4. **Set up Row Level Security (RLS)** if using Supabase database
5. **Use HTTPS in production** (required for OAuth)
6. **Rotate keys** if they're accidentally exposed
7. **Set up rate limiting** in Supabase dashboard

## 📝 Production Deployment

### Environment Variables for Production

Set these in your hosting platform (Vercel, Netlify, etc.):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Update Supabase Settings

1. Add production domain to **Site URL**
2. Add production URLs to **Redirect URLs**:
   - `https://yourapp.com/auth/callback`
   - `https://yourapp.com/auth/reset-password/confirm`
3. Update Google OAuth redirect URIs if using Google login

## 🎓 Additional Resources

- [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Google OAuth Setup](https://support.google.com/cloud/answer/6158849)

## 💡 Tips

- **Development**: Use mock mode for rapid development without backend dependencies
- **Testing**: Use Supabase mode to test real authentication flows
- **Production**: Always use Supabase mode with proper security configuration
- **Debugging**: Check browser console and Supabase logs for detailed error messages

## 🤝 Support

If you encounter issues:
1. Check the browser console for error messages
2. Review Supabase project logs (Dashboard → Logs)
3. Verify all configuration steps were completed
4. Check that environment variables are loaded (restart dev server)

---

**Note**: The rest of the application (goals, notifications, achievements, etc.) will continue to work with localStorage regardless of whether you use Supabase authentication or mock authentication. This hybrid approach allows you to use real authentication while keeping the rest of the app frontend-only.