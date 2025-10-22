# Commitly Database Setup Checklist

Use this checklist to ensure your Supabase database is properly configured for Commitly.

## 📋 Pre-Setup Checklist

- [ ] Supabase account created
- [ ] New Supabase project created
- [ ] Project URL and anon key saved
- [ ] Environment variables configured in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🗄️ Database Setup

### Step 1: Access SQL Editor
- [ ] Logged into Supabase dashboard
- [ ] Navigated to SQL Editor (icon in left sidebar)
- [ ] Created new query or opened existing one

### Step 2: Run Schema
- [ ] Opened `frontend/backend/scripts/schema.sql`
- [ ] Copied entire file contents
- [ ] Pasted into Supabase SQL Editor
- [ ] Clicked "Run" button (or pressed Ctrl/Cmd + Enter)
- [ ] Waited for execution to complete (~30 seconds)
- [ ] Verified success message: "Database schema created successfully!"

### Step 3: Verify Tables Created
- [ ] Navigated to Table Editor in Supabase dashboard
- [ ] Confirmed 11 tables exist:
  - [ ] `users`
  - [ ] `goals`
  - [ ] `activities`
  - [ ] `goal_members`
  - [ ] `accountability_partners`
  - [ ] `streaks`
  - [ ] `milestones`
  - [ ] `notes`
  - [ ] `notifications`
  - [ ] `goal_completions`
  - [ ] `followers`

## 🔒 Security Verification

### Row Level Security (RLS)
- [ ] Go to Authentication → Policies
- [ ] Verify RLS is enabled on all tables
- [ ] Check policy count:
  - [ ] users: 4 policies
  - [ ] goals: 7 policies
  - [ ] activities: 5 policies
  - [ ] goal_members: 4 policies
  - [ ] accountability_partners: 4 policies
  - [ ] streaks: 5 policies
  - [ ] milestones: 3 policies
  - [ ] notes: 6 policies
  - [ ] notifications: 4 policies
  - [ ] goal_completions: 5 policies
  - [ ] followers: 3 policies

### Storage Policies
- [ ] Go to Storage → Policies
- [ ] Verify `avatars` bucket exists
- [ ] Check 4 storage policies exist:
  - [ ] `avatar_select`
  - [ ] `avatar_insert`
  - [ ] `avatar_update`
  - [ ] `avatar_delete`

## ⚙️ Functions & Triggers

### Functions
- [ ] Go to Database → Functions
- [ ] Verify 3 functions exist:
  - [ ] `update_updated_at_column()`
  - [ ] `update_streak()`
  - [ ] `notify_accountability_partners()`

### Triggers
- [ ] Run this query in SQL Editor:
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```
- [ ] Verify 7 triggers exist:
  - [ ] `update_users_updated_at` on `users`
  - [ ] `update_goals_updated_at` on `goals`
  - [ ] `update_activities_updated_at` on `activities`
  - [ ] `update_accountability_partners_updated_at` on `accountability_partners`
  - [ ] `update_streaks_updated_at` on `streaks`
  - [ ] `update_streak_trigger` on `goals`
  - [ ] `notify_partners_trigger` on `goals`

## 📊 Indexes Verification

- [ ] Run this query to check indexes:
```sql
SELECT tablename, COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```
- [ ] Verify indexes exist for key tables:
  - [ ] users: 3+ indexes
  - [ ] goals: 7+ indexes
  - [ ] activities: 3+ indexes
  - [ ] notifications: 4+ indexes
  - [ ] Other tables: 2+ indexes each

## 🧪 Testing

### Test 1: User Creation
- [ ] Sign up a test user via your app
- [ ] Run query:
```sql
SELECT * FROM public.users WHERE id = auth.uid();
```
- [ ] Verify user record exists
- [ ] Check `created_at` and `updated_at` are set

### Test 2: Goal Creation
- [ ] Create a test goal via your app
- [ ] Run query:
```sql
SELECT * FROM public.goals WHERE user_id = auth.uid();
```
- [ ] Verify goal exists
- [ ] Check `created_at` and `updated_at` are set

### Test 3: RLS Policies
- [ ] Create a goal with visibility = 'private'
- [ ] Log out and try to query it (should fail):
```sql
SELECT * FROM public.goals WHERE id = 'your-goal-id';
```
- [ ] Should return empty or permission denied
- [ ] Create a public goal
- [ ] Log out and query it (should succeed)

### Test 4: Streak Trigger
- [ ] Create a recurring goal
- [ ] Mark it as completed:
```sql
UPDATE public.goals
SET is_completed = true, completed_at = NOW()
WHERE id = 'your-goal-id' AND user_id = auth.uid();
```
- [ ] Check streak was created:
```sql
SELECT * FROM public.streaks WHERE goal_id = 'your-goal-id';
```
- [ ] Verify `current_streak = 1`

### Test 5: Accountability Partners Notification
- [ ] Create two test users
- [ ] Create accountability partner relationship
- [ ] Accept the request
- [ ] Complete the goal
- [ ] Check notification was created:
```sql
SELECT * FROM public.notifications
WHERE user_id = 'partner-user-id'
  AND notification_type = 'partner_completed';
```

### Test 6: Storage Upload
- [ ] Upload an avatar image via your app
- [ ] Verify file exists in Storage → avatars bucket
- [ ] Check public URL works
- [ ] Verify profile_picture_url updated in users table

## 🔍 Common Issues Check

### Issue 1: Can't Create User Profile
- [ ] Verify user is authenticated (`auth.uid()` returns value)
- [ ] Check `users_insert_own` policy exists
- [ ] Ensure user ID matches auth user ID

### Issue 2: Can't Query Other Users' Public Goals
- [ ] Verify `goals_select_public` policy exists
- [ ] Check goal `visibility` is set to 'public'
- [ ] Ensure RLS is enabled on goals table

### Issue 3: Triggers Not Firing
- [ ] Verify triggers exist (see Functions & Triggers section)
- [ ] Check trigger functions exist
- [ ] Test trigger manually:
```sql
UPDATE public.goals
SET updated_at = NOW()
WHERE id = 'test-goal-id';
```
- [ ] Verify `updated_at` changed

### Issue 4: Storage Upload Fails
- [ ] Check `avatars` bucket exists
- [ ] Verify storage policies are created
- [ ] Ensure file path follows pattern: `{user_id}/filename.ext`
- [ ] Check file size limits (default: 50MB)

## 📝 Post-Setup Configuration

### Authentication Settings
- [ ] Go to Authentication → Settings
- [ ] Configure Site URL: `http://localhost:3000` (dev)
- [ ] Add Redirect URLs:
  - [ ] `http://localhost:3000/auth/callback`
  - [ ] `http://localhost:3000/auth/reset-password/confirm`

### Email Templates (Optional)
- [ ] Go to Authentication → Email Templates
- [ ] Customize "Confirm Signup" template
- [ ] Customize "Reset Password" template
- [ ] Customize "Magic Link" template

### Email Provider (Optional)
- [ ] Go to Project Settings → Auth
- [ ] Configure SMTP settings (for production)
- [ ] Test email delivery

## 🚀 Production Checklist

When deploying to production:

- [ ] Updated environment variables with production Supabase project
- [ ] Changed Site URL to production domain
- [ ] Updated Redirect URLs with production domain
- [ ] Enabled email confirmations
- [ ] Configured custom SMTP provider
- [ ] Set up database backups
- [ ] Reviewed and tightened RLS policies if needed
- [ ] Set up monitoring and alerts
- [ ] Created read replica (if needed for scaling)
- [ ] Reviewed storage bucket settings
- [ ] Set up CDN for storage assets (optional)

## 📊 Performance Checklist

- [ ] Verified indexes are being used:
```sql
EXPLAIN ANALYZE
SELECT * FROM public.goals
WHERE user_id = 'test-user-id'
  AND is_completed = false;
```
- [ ] Checked query performance in Supabase Dashboard → Database → Query Performance
- [ ] Reviewed slow queries and optimized as needed
- [ ] Configured connection pooling (for high traffic)

## 🔐 Security Best Practices

- [ ] Never expose service_role key in client-side code
- [ ] Always use anon key in frontend
- [ ] Reviewed all RLS policies for security holes
- [ ] Tested policies with different user roles
- [ ] Enabled email verification for production
- [ ] Set up rate limiting (if available)
- [ ] Configured password requirements
- [ ] Set session timeout appropriately

## 📚 Documentation Review

- [ ] Read `DATABASE_SETUP.md` for detailed information
- [ ] Review `QUICK_REFERENCE.md` for common queries
- [ ] Bookmark Supabase documentation
- [ ] Save project credentials securely
- [ ] Document any custom modifications

## ✅ Final Verification

Run this comprehensive check:

```sql
-- Table count
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';
-- Should return: 11

-- RLS enabled check
SELECT COUNT(*) as rls_enabled_count
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;
-- Should return: 11

-- Policy count
SELECT COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public';
-- Should return: 50+

-- Function count
SELECT COUNT(*) as function_count
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION';
-- Should return: 3+

-- Trigger count
SELECT COUNT(*) as trigger_count
FROM information_schema.triggers
WHERE trigger_schema = 'public';
-- Should return: 7

-- Index count
SELECT COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public';
-- Should return: 50+

-- Storage bucket count
SELECT COUNT(*) as bucket_count
FROM storage.buckets
WHERE id = 'avatars';
-- Should return: 1
```

**All counts should match the expected values above.**

## 🎉 Success!

If all checkboxes are marked and verifications pass:

- ✅ Database is fully configured
- ✅ Security policies are in place
- ✅ Triggers and functions are working
- ✅ Storage is configured
- ✅ Ready for development/production

## 🆘 Need Help?

If you encounter issues:

1. Check the [Troubleshooting section](./DATABASE_SETUP.md#troubleshooting) in DATABASE_SETUP.md
2. Review the [Quick Reference](./scripts/QUICK_REFERENCE.md) for common queries
3. Check Supabase logs: Dashboard → Logs
4. Review SQL Editor output for errors
5. Consult [Supabase Documentation](https://supabase.com/docs)

---

**Last Updated:** 2024  
**Schema Version:** 2.0  
**Checklist Version:** 1.0