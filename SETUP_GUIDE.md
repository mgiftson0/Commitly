# Commitly Setup Guide

## Quick Start

This guide will help you set up the complete Commitly platform with Supabase backend.

## Prerequisites

1. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)
2. **Node.js 18+** or **Bun** installed
3. **Git** (optional, for version control)

## Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: commitly (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

### 2. Get Supabase Credentials

1. In your Supabase project, go to **Settings** (gear icon)
2. Click **API** in the sidebar
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - keep this secret!)

### 3. Configure Environment Variables

1. Open `.env.local` in the project root
2. Replace the placeholder values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Run Database Setup

The `setup.js` script will create all necessary database tables, policies, and functions.

```bash
node setup.js
```

**What the script does:**
- Creates 11 database tables
- Sets up Row Level Security (RLS) policies
- Creates database functions and triggers
- Configures storage buckets for avatars
- Generates `.env.local` file

**If the script fails:**
1. A `supabase-schema.sql` file will be created
2. Open your Supabase project
3. Go to **SQL Editor**
4. Click "New query"
5. Paste the contents of `supabase-schema.sql`
6. Click "Run"

### 5. Configure Supabase Auth (Important!)

1. In Supabase, go to **Authentication** > **URL Configuration**
2. Add your site URL to **Site URL**: `http://localhost:3000`
3. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://your-production-domain.com/auth/callback` (when deploying)

4. Go to **Authentication** > **Email Templates**
5. Customize email templates (optional but recommended)

### 6. Install Dependencies & Run

```bash
# Install dependencies
bun install

# Run development server
bun run dev
```

Visit `http://localhost:3000` - you should see the landing page!

## Testing the Application

### 1. Create an Account
1. Click "Sign Up"
2. Enter email and password
3. Check your email for verification link
4. Click the verification link
5. Complete KYC form (username, display name, phone)

### 2. Create a Goal
1. From dashboard, click "Create New Goal"
2. Choose goal type (single/multi/recurring)
3. Fill in details
4. Click "Create Goal"

### 3. Test Features
- Mark activities complete
- View streak tracking
- Add notes
- Search for users
- Send accountability requests

## Database Schema Overview

### Core Tables

**users** - User profiles
- Extends Supabase auth.users
- Stores username, display name, phone, bio, profile picture

**goals** - Goal records
- Types: single, multi, recurring
- Visibility: public, private, restricted
- Tracks completion status and suspension

**activities** - Multi-activity goal tasks
- Linked to goals
- Individual completion tracking
- Ordered list

**streaks** - Progress tracking
- Current and longest streaks
- Total completions
- Last completion date

**accountability_partners** - Partner relationships
- Request/accept/decline flow
- Links users to goals

**notifications** - User notifications
- Goal updates
- Partner activities
- Reminders

### Security

All tables have **Row Level Security (RLS)** enabled:
- Users can only see their own data
- Public goals visible to all
- Partners can see restricted goals
- Proper authentication required

## Troubleshooting

### "Not authenticated" errors
- Check `.env.local` has correct Supabase credentials
- Verify email is confirmed
- Clear browser cookies and try again

### Database errors
- Ensure `setup.js` ran successfully
- Check Supabase SQL Editor for errors
- Verify RLS policies are enabled

### Build errors
```bash
# Clear cache
rm -rf .next node_modules
bun install
bun run dev
```

### Email not sending
- Check Supabase Auth settings
- Verify email templates are configured
- Check spam folder

## Production Deployment

### 1. Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. Update Supabase Settings

In Supabase **Authentication** > **URL Configuration**:
- Update Site URL to your production domain
- Add production callback URL

### 3. Configure Custom Domain (Optional)

In Vercel:
1. Go to project settings
2. Add custom domain
3. Update DNS records

## Advanced Configuration

### Email Notifications

To enable email notifications for goal updates:

1. Create Supabase Edge Function:
```bash
supabase functions new send-email
```

2. Use a service like:
   - Resend
   - SendGrid
   - AWS SES

3. Trigger from database using webhooks

### Scheduled Reminders

Use Supabase Edge Functions with cron:
```sql
-- Create cron job for daily reminders
SELECT cron.schedule(
  'daily-reminders',
  '0 9 * * *', -- 9 AM daily
  $$ SELECT send_daily_reminders() $$
);
```

### File Uploads

Profile pictures use Supabase Storage:
- Bucket: `avatars`
- Public access enabled
- User-specific folders

To add file upload UI:
```typescript
const uploadAvatar = async (file: File) => {
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`${user.id}/${file.name}`, file)
}
```

## Support & Resources

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com)

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Rotate service role key** if exposed
3. **Use RLS policies** for all data access
4. **Validate user input** on both client and server
5. **Enable email verification** for new accounts
6. **Use HTTPS** in production
7. **Regular backups** of Supabase database

## Next Steps

After setup, consider adding:
- Push notifications (using Firebase or OneSignal)
- Social login (Google, GitHub, etc.)
- Analytics (Plausible, PostHog)
- Error tracking (Sentry)
- Payment integration (Stripe) for premium features
- Mobile app (React Native or Flutter)

---

**Need help?** Check the README.md for more information.
