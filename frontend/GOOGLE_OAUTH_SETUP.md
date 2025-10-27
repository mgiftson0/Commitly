# Google OAuth Setup Guide

## Current Status
✅ **Google OAuth is already implemented** in your Commitly app!
✅ **Frontend code is ready** - Login and signup pages now show Google buttons
✅ **Auth callback handler exists** - `/auth/callback/route.ts` handles OAuth flow
✅ **Supabase client configured** - `authHelpers.signInWithGoogle()` method available

## What You Need to Do

### 1. Configure Google OAuth in Supabase Dashboard

1. Go to your Supabase project: https://supabase.com/dashboard/project/gyygnbjffgmhxmmmirbf
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click **Configure**
4. Enable Google provider
5. Add your Google OAuth credentials:
   - **Client ID**: Get from Google Cloud Console
   - **Client Secret**: Get from Google Cloud Console

### 2. Set up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** and **Google Identity API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen first if prompted
6. For **Application type**, select **Web application**
7. Add authorized redirect URIs:
   ```
   https://gyygnbjffgmhxmmmirbf.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback (for development)
   ```
8. Copy the **Client ID** and **Client Secret**

### 3. Update Supabase Configuration

1. In Supabase Dashboard → Authentication → Providers → Google:
   - Paste your **Client ID**
   - Paste your **Client Secret**
   - Save the configuration

### 4. Test the Integration

1. Start your development server: `npm run dev`
2. Go to `/auth/login` or `/auth/signup`
3. Click "Continue with Google" button
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you'll be redirected back to your app

## Demo Mode

If you don't want to set up Google OAuth right now, the app works in **Demo Mode**:
- Shows "Continue with Google (Demo)" button
- Simulates Google login with mock user data
- No actual Google integration required

## Troubleshooting

### Common Issues:
1. **"Google OAuth is not enabled"** - Configure Google provider in Supabase
2. **"Invalid redirect URI"** - Check redirect URIs in Google Cloud Console
3. **"Access blocked"** - Configure OAuth consent screen in Google Cloud Console

### Environment Variables
Your `.env.local` already has the correct Supabase configuration:
```
NEXT_PUBLIC_SUPABASE_URL=https://gyygnbjffgmhxmmmirbf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Security Notes

- Never commit Google OAuth secrets to version control
- Use environment variables for sensitive data
- Configure proper OAuth scopes (email, profile)
- Set up proper redirect URI validation

## Next Steps

1. Set up Google Cloud Console project
2. Configure Google OAuth in Supabase
3. Test the integration
4. Deploy to production with proper redirect URIs