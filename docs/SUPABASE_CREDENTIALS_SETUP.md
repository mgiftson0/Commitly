# Quick Start: Adding Your Supabase Credentials

This guide will help you configure real Supabase authentication for Commitly in **under 5 minutes**.

## 🎯 What You Need

- A Supabase account (free tier works perfectly)
- 5 minutes of your time

## 📝 Step-by-Step Instructions

### Step 1: Get Your Supabase Project (2 minutes)

1. **Go to [supabase.com](https://supabase.com)** and sign in (or create a free account)

2. **Click "New Project"** 
   - **Project Name**: `Commitly` (or any name you prefer)
   - **Database Password**: Choose a strong password and **save it somewhere safe**
   - **Region**: Choose the closest region to you
   - Click **"Create new project"**

3. **Wait ~2 minutes** for your project to be provisioned (you'll see a progress indicator)

### Step 2: Copy Your Credentials (1 minute)

Once your project is ready:

1. In your Supabase project dashboard, click the **⚙️ Settings** icon (gear icon in the left sidebar)

2. Click **"API"** in the Configuration section

3. You'll see a page with your credentials. **Copy these two values**:

   **📍 Project URL** 
   ```
   Example: https://abcdefghijklmnop.supabase.co
   ```
   
   **🔑 anon/public key**
   ```
   Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
   (This is a long string - copy the entire thing)
   ```

### Step 3: Add Credentials to Your Project (1 minute)

1. **Open the `.env.local` file** in either:
   - **Project root**: `Commitly/.env.local`  
   - **OR Frontend folder**: `Commitly/frontend/.env.local`

2. **Replace the placeholder values**:

   ```env
   # BEFORE (placeholders):
   NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

   # AFTER (your actual values):
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
   ```

3. **Save the file**

### Step 4: Configure Supabase Auth Settings (1 minute)

Back in your Supabase dashboard:

1. Go to **Authentication** → **URL Configuration** (in the left sidebar)

2. Add these URLs:

   **Site URL:**
   ```
   http://localhost:3000
   ```

   **Redirect URLs (click "+ Add URL" for each):**
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/reset-password/confirm
   ```

3. Click **"Save"**

### Step 5: Restart Your Dev Server

```bash
# Stop the server if it's running (Ctrl+C)
# Then restart it:
npm run dev
# OR
bun dev
```

## ✅ Verification

1. Go to `http://localhost:3000/auth/login`
2. You should **NOT** see the amber "Demo Mode" badge
3. Try creating an account - you should receive a real confirmation email!

## 🎊 You're Done!

Your app now uses **real Supabase authentication** for:
- ✅ User signup/login
- ✅ Google OAuth (after additional setup)
- ✅ Password reset via email
- ✅ Email confirmation
- ✅ Secure session management

**Note**: Goals, notifications, and other features still use localStorage (by design). This keeps the app working offline and without a database until you're ready to fully migrate.

---

## 🔧 Optional: Enable Google Sign-In

Want to add Google OAuth? Follow these additional steps:

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
5. Configure consent screen if prompted
6. Choose **Web application**
7. Add authorized redirect URI:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
   (Find exact URL in Supabase: Authentication → Providers → Google)
8. Copy **Client ID** and **Client Secret**

### 2. Add to Supabase

1. In Supabase, go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle **"Enable Google Provider"** to ON
4. Paste your **Client ID** and **Client Secret**
5. Click **"Save"**

### 3. Test It

- Restart dev server
- Go to login/signup page
- Click "Continue with Google"
- Should redirect to Google login!

---

## 🆘 Troubleshooting

### "Supabase is not configured" error
- **Check**: Did you replace BOTH placeholder values in `.env.local`?
- **Check**: Did you restart the dev server after saving?
- **Check**: Are the values copied correctly (no extra spaces)?

### Email confirmation not working
- **Check**: Did you add redirect URLs in Supabase settings?
- **Check**: Is email provider configured in Supabase? (Authentication → Email Templates)
- **Check**: Check spam folder

### Google OAuth doesn't work
- **Check**: Did you add the correct callback URL in Google Cloud Console?
- **Check**: Is Google provider enabled in Supabase?
- **Check**: Are Client ID and Secret correct?

### "Demo Mode" badge still showing
- **Solution**: The credentials might not be detected. Check:
  1. Values in `.env.local` don't say "your-project-url-here"
  2. Dev server was restarted after editing `.env.local`
  3. File is in the correct location (either root or frontend folder)

---

## 📚 More Resources

- **Full Setup Guide**: See `frontend/SUPABASE_SETUP.md` for detailed instructions
- **Supabase Docs**: [supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)
- **Database Setup**: See `backend/scripts/` for database schema setup (optional)

---

## 🎉 That's It!

You now have real authentication running with Supabase while keeping the rest of your app working offline with localStorage. This hybrid approach gives you the best of both worlds!

**Next Steps:**
- Create a test account
- Try password reset
- Set up Google OAuth (optional)
- Deploy to production (update URLs in Supabase when ready)

**Questions?** Check the detailed guides in `frontend/SUPABASE_SETUP.md` or Supabase documentation.