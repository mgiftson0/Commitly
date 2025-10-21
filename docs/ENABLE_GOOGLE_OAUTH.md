# Enable Google OAuth Button - Quick Guide

## 🎯 Current Status

The "Continue with Google" button is **currently hidden** to prevent errors. This is intentional!

## ⚡ Quick Enable (2 Steps)

Once you've configured Google OAuth in your Supabase dashboard, follow these steps:

### Step 1: Configure Google OAuth in Supabase

**Required**: Follow the complete setup in `GOOGLE_OAUTH_SETUP.md` (10 minutes)

Quick checklist:
- [ ] Created Google OAuth credentials in Google Cloud Console
- [ ] Configured OAuth consent screen
- [ ] Added redirect URI: `https://wfjspkyptjipolxnlzya.supabase.co/auth/v1/callback`
- [ ] Enabled Google provider in Supabase dashboard
- [ ] Added Client ID and Client Secret in Supabase
- [ ] Clicked "Save" in Supabase

### Step 2: Enable in Code

Open: `frontend/lib/config.ts`

Find this line:
```typescript
enableGoogleOAuth: false,
```

Change it to:
```typescript
enableGoogleOAuth: true,
```

Save the file.

### Step 3: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
# Restart:
npm run dev
```

## ✅ Verification

1. Go to: http://localhost:3000/auth/login
2. You should now see: **"Continue with Google"** button
3. Click it - should redirect to Google login
4. Sign in with Google
5. Get redirected back to your app
6. ✅ Success!

## ⚠️ Common Issues

### Button Still Not Showing

**Check**:
1. Did you save `config.ts`?
2. Did you restart the dev server?
3. Is `enableGoogleOAuth` set to `true`?
4. Clear browser cache and refresh

### Button Shows but Gives Error

**Check**:
1. Is Google OAuth enabled in Supabase?
2. Are Client ID and Secret correct?
3. Is redirect URI correct in Google Console?
4. Wait 5 minutes for Google changes to propagate

### "redirect_uri_mismatch" Error

**Fix**:
- Redirect URI in Google Console must be exactly:
  ```
  https://wfjspkyptjipolxnlzya.supabase.co/auth/v1/callback
  ```
- No trailing slash!
- Must be HTTPS (Supabase URL)

## 🔄 To Disable Again

If you need to hide the button again:

1. Open: `frontend/lib/config.ts`
2. Set: `enableGoogleOAuth: false`
3. Save and restart server

## 📚 Full Documentation

- **Complete Setup**: `GOOGLE_OAUTH_SETUP.md`
- **Supabase Settings**: https://app.supabase.com/project/wfjspkyptjipolxnlzya
- **Google Console**: https://console.cloud.google.com

## 💡 Why This Approach?

We hide the Google OAuth button by default because:
- ✅ Prevents errors when not configured
- ✅ Cleaner UX - users only see working options
- ✅ Easy to enable when ready
- ✅ No code changes needed (just config)

## 🎉 That's It!

Once configured in Supabase and enabled in config.ts, the Google OAuth button appears automatically on both login and signup pages.

**Questions?** Check `GOOGLE_OAUTH_SETUP.md` for detailed instructions.