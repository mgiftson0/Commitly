# Google OAuth Setup Guide for Commitly

## 🎯 Overview

This guide will help you enable Google Sign-In for your Commitly app. The "Continue with Google" button currently shows an error because Google OAuth is not yet configured in your Supabase project.

**Time Required**: 10-15 minutes

## ⚠️ Current Status

**Google OAuth**: ❌ Not Configured

When users click "Continue with Google", they see:
```
Error: Google Sign-In is not configured
```

This is normal! Follow this guide to enable it.

## 📋 Prerequisites

- ✅ Supabase project (already set up)
- ✅ Google account (for Google Cloud Console)
- ✅ 15 minutes of your time

## 🚀 Step-by-Step Setup

### Part 1: Create Google OAuth Credentials (5 minutes)

#### Step 1: Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with your Google account

#### Step 2: Create or Select a Project

**Option A: Create New Project**
1. Click the project dropdown at the top
2. Click "NEW PROJECT"
3. Name it: `Commitly` (or your preferred name)
4. Click "CREATE"
5. Wait for the project to be created (~30 seconds)

**Option B: Use Existing Project**
1. Select your existing project from the dropdown

#### Step 3: Configure OAuth Consent Screen

1. In the left sidebar, go to: **APIs & Services** → **OAuth consent screen**

2. Choose **External** (for public use)
   - Click "CREATE"

3. Fill in the required fields:

   **App Information**:
   - **App name**: `Commitly`
   - **User support email**: Your email address
   - **App logo**: (Optional - you can skip this)

   **App Domain** (Optional for testing):
   - Leave blank for now

   **Developer contact information**:
   - **Email addresses**: Your email address

4. Click **"SAVE AND CONTINUE"**

5. **Scopes** screen:
   - Click **"ADD OR REMOVE SCOPES"**
   - Select these scopes:
     - ✅ `userinfo.email`
     - ✅ `userinfo.profile`
     - ✅ `openid`
   - Click **"UPDATE"**
   - Click **"SAVE AND CONTINUE"**

6. **Test users** (for development):
   - Click **"+ ADD USERS"**
   - Add your email address (and any test users)
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**

7. **Summary** screen:
   - Review your settings
   - Click **"BACK TO DASHBOARD"**

#### Step 4: Create OAuth 2.0 Credentials

1. In the left sidebar, go to: **APIs & Services** → **Credentials**

2. Click **"+ CREATE CREDENTIALS"** at the top

3. Select **"OAuth 2.0 Client ID"**

4. Configure the OAuth client:

   **Application type**: 
   - Select **"Web application"**

   **Name**: 
   ```
   Commitly Web App
   ```

   **Authorized JavaScript origins**:
   - Click **"+ ADD URI"**
   - Add: `http://localhost:3000` (for development)
   - Click **"+ ADD URI"** again
   - Add: `https://wfjspkyptjipolxnlzya.supabase.co` (your Supabase URL)

   **Authorized redirect URIs**:
   - Click **"+ ADD URI"**
   - Add: `https://wfjspkyptjipolxnlzya.supabase.co/auth/v1/callback`
   
   ⚠️ **Important**: The redirect URI must be EXACTLY:
   ```
   https://wfjspkyptjipolxnlzya.supabase.co/auth/v1/callback
   ```

5. Click **"CREATE"**

6. A popup will show your credentials:
   - **Client ID**: Copy this (long string starting with numbers)
   - **Client Secret**: Copy this (shorter string)
   - Click **"OK"**

7. **Save these credentials** - you'll need them in the next step!

### Part 2: Configure Supabase (3 minutes)

#### Step 1: Open Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com/project/wfjspkyptjipolxnlzya)
2. Or navigate to: https://app.supabase.com
3. Select your project: **wfjspkyptjipolxnlzya**

#### Step 2: Enable Google Provider

1. In the left sidebar, click: **Authentication**

2. Click on: **Providers** (under Configuration)

3. Find **Google** in the list of providers

4. Click on **Google** to expand it

5. Toggle **"Enable Sign in with Google"** to **ON** (green)

6. Fill in the credentials:

   **Client ID (for OAuth)**:
   ```
   Paste your Client ID from Google Cloud Console
   ```

   **Client Secret (for OAuth)**:
   ```
   Paste your Client Secret from Google Cloud Console
   ```

7. Click **"Save"** at the bottom

#### Step 3: Verify Redirect URL

While still in the Google provider settings, you should see:

**Callback URL (for OAuth)**:
```
https://wfjspkyptjipolxnlzya.supabase.co/auth/v1/callback
```

This should match what you added in Google Cloud Console. ✅

### Part 3: Test Google OAuth (2 minutes)

#### Step 1: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

#### Step 2: Test on Login Page

1. Go to: http://localhost:3000/auth/login

2. Click **"Continue with Google"** button

3. You should be redirected to Google's login page

4. Sign in with your Google account

5. Grant permissions when prompted

6. You'll be redirected back to Commitly (Dashboard or KYC page)

7. ✅ Success! You're now logged in with Google

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Google Cloud Console project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Client ID and Secret copied
- [ ] Google provider enabled in Supabase
- [ ] Credentials pasted into Supabase
- [ ] Settings saved in Supabase
- [ ] Dev server restarted
- [ ] "Continue with Google" button works
- [ ] Can successfully log in with Google

## 🐛 Troubleshooting

### Error: "Google Sign-In is not configured"

**Cause**: Google provider not enabled in Supabase

**Solution**:
1. Check Supabase → Authentication → Providers → Google
2. Ensure toggle is ON (green)
3. Verify Client ID and Secret are entered
4. Click "Save"
5. Restart dev server

### Error: "redirect_uri_mismatch"

**Cause**: Redirect URI in Google Console doesn't match Supabase

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Click your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", ensure you have:
   ```
   https://wfjspkyptjipolxnlzya.supabase.co/auth/v1/callback
   ```
4. Must be EXACTLY this URL (no trailing slash!)
5. Click "Save"
6. Wait 5 minutes for changes to propagate
7. Try again

### Error: "Access blocked: This app's request is invalid"

**Cause**: OAuth consent screen not configured

**Solution**:
1. Go to Google Cloud Console → OAuth consent screen
2. Complete all required fields
3. Add your email as a test user
4. Save changes
5. Try again

### Error: "This app isn't verified"

**Cause**: App is in testing mode (normal for development)

**Solution**:
1. On the warning screen, click "Advanced"
2. Click "Go to Commitly (unsafe)"
3. This is expected for unverified apps
4. For production, submit app for verification

### Google Login Works but User Not Created

**Cause**: Database schema not set up

**Solution**:
```bash
# Run database setup
node backend/scripts/setup-auto.js
```

This creates the users table and other required database structures.

## 🔒 Security Notes

### Development vs Production

**Development** (current setup):
- OAuth consent screen in "Testing" mode
- Only test users can sign in
- Shows "unverified app" warning

**Production** (future):
- Submit app for Google verification
- Remove "unverified app" warning
- Allow any Google user to sign in

### Best Practices

1. ✅ Keep Client Secret secure (never commit to git)
2. ✅ Use test users during development
3. ✅ Submit for verification before public launch
4. ✅ Update redirect URIs for production domain
5. ✅ Review OAuth scopes (only request what you need)

## 📝 For Production Deployment

When deploying to production, update these settings:

### Google Cloud Console

**Authorized JavaScript origins**:
```
https://your-production-domain.com
```

**Authorized redirect URIs**:
```
https://wfjspkyptjipolxnlzya.supabase.co/auth/v1/callback
```
(Same as development)

### Supabase Dashboard

**Site URL** (Authentication → URL Configuration):
```
https://your-production-domain.com
```

**Redirect URLs**:
```
https://your-production-domain.com/auth/callback
```

## 🎉 Success!

Once configured, users can:
- ✅ Sign up with Google (instant account creation)
- ✅ Sign in with Google (one-click login)
- ✅ No password to remember
- ✅ Secure Google authentication

## 📚 Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [OAuth Consent Screen Setup](https://support.google.com/cloud/answer/6158849)

## 💡 Quick Reference

**Your Supabase Project**: 
- URL: https://wfjspkyptjipolxnlzya.supabase.co
- Dashboard: https://app.supabase.com/project/wfjspkyptjipolxnlzya

**Google Cloud Console**:
- https://console.cloud.google.com

**Required Redirect URI**:
```
https://wfjspkyptjipolxnlzya.supabase.co/auth/v1/callback
```

---

**Questions?** Check the troubleshooting section or refer to the official documentation.

**Note**: Google OAuth is optional. Email/password authentication works perfectly without it!