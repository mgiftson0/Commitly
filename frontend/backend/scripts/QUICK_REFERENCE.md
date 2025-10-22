# Commitly Database - Quick Reference

Quick SQL commands and queries for common operations.

## 🚀 Setup Commands

### Run Complete Schema
```sql
-- Copy and paste contents of schema.sql into Supabase SQL Editor
-- Or run from command line:
psql -U postgres -d your_database < schema.sql
```

### Check if Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Verify RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## 👤 User Queries

### Create User Profile
```sql
INSERT INTO public.users (id, username, display_name, email)
VALUES (
  auth.uid(),
  'johndoe',
  'John Doe',
  'john@example.com'
);
```

### Get User by Username
```sql
SELECT * FROM public.users 
WHERE username = 'johndoe';
```

### Update User Profile
```sql
UPDATE public.users 
SET bio = 'New bio text',
    display_name = 'New Name'
WHERE id = auth.uid();
```

### Get User's Followers
```sql
SELECT u.* 
FROM public.followers f
JOIN public.users u ON u.id = f.follower_id
WHERE f.following_id = 'user-uuid';
```

### Get Users Following
```sql
SELECT u.* 
FROM public.followers f
JOIN public.users u ON u.id = f.following_id
WHERE f.follower_id = 'user-uuid';
```

## 🎯 Goal Queries

### Create a Goal
```sql
INSERT INTO public.goals (
  user_id, title, description, goal_type, visibility, category
) VALUES (
  auth.uid(),
  'Morning Exercise',
  'Exercise for 30 minutes every morning',
  'recurring',
  'public',
  'fitness'
);
```

### Get User's Active Goals
```sql
SELECT * FROM public.goals
WHERE user_id = auth.uid()
  AND is_completed = false
  AND is_suspended = false
ORDER BY created_at DESC;
```

### Get All Public Goals
```sql
SELECT g.*, u.username, u.display_name
FROM public.goals g
JOIN public.users u ON u.id = g.user_id
WHERE g.visibility = 'public'
ORDER BY g.created_at DESC
LIMIT 20;
```

### Mark Goal as Complete
```sql
UPDATE public.goals
SET is_completed = true,
    completed_at = NOW()
WHERE id = 'goal-uuid'
  AND user_id = auth.uid();
```

### Get Goals by Category
```sql
SELECT * FROM public.goals
WHERE category = 'fitness'
  AND visibility = 'public'
ORDER BY created_at DESC;
```

### Get Recurring Goals Due Today
```sql
SELECT * FROM public.goals
WHERE user_id = auth.uid()
  AND goal_type = 'recurring'
  AND is_completed = false
  AND is_suspended = false;
```

## 📋 Activity Queries

### Add Activities to Goal
```sql
INSERT INTO public.activities (goal_id, title, description, order_index)
VALUES 
  ('goal-uuid', 'Step 1: Warm up', '5 minute warm up', 0),
  ('goal-uuid', 'Step 2: Exercise', '20 minute workout', 1),
  ('goal-uuid', 'Step 3: Cool down', '5 minute cool down', 2);
```

### Get Goal Activities
```sql
SELECT * FROM public.activities
WHERE goal_id = 'goal-uuid'
ORDER BY order_index;
```

### Mark Activity Complete
```sql
UPDATE public.activities
SET is_completed = true,
    completed_at = NOW()
WHERE id = 'activity-uuid';
```

### Get Goal Progress
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) as completed,
  ROUND(100.0 * SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) / COUNT(*)) as progress_percent
FROM public.activities
WHERE goal_id = 'goal-uuid';
```

## 🤝 Accountability Partner Queries

### Send Partner Request
```sql
INSERT INTO public.accountability_partners (
  requester_id, partner_id, goal_id, message, status
) VALUES (
  auth.uid(),
  'partner-user-uuid',
  'goal-uuid',
  'Would you like to be my accountability partner?',
  'pending'
);
```

### Get Pending Requests (Received)
```sql
SELECT ap.*, u.username, u.display_name, g.title as goal_title
FROM public.accountability_partners ap
JOIN public.users u ON u.id = ap.requester_id
JOIN public.goals g ON g.id = ap.goal_id
WHERE ap.partner_id = auth.uid()
  AND ap.status = 'pending'
ORDER BY ap.created_at DESC;
```

### Accept Partner Request
```sql
UPDATE public.accountability_partners
SET status = 'accepted',
    responded_at = NOW()
WHERE id = 'request-uuid'
  AND partner_id = auth.uid();
```

### Get Active Accountability Partners
```sql
SELECT ap.*, u.username, u.display_name, g.title as goal_title
FROM public.accountability_partners ap
JOIN public.users u ON u.id = CASE 
  WHEN ap.requester_id = auth.uid() THEN ap.partner_id
  ELSE ap.requester_id
END
JOIN public.goals g ON g.id = ap.goal_id
WHERE (ap.requester_id = auth.uid() OR ap.partner_id = auth.uid())
  AND ap.status = 'accepted';
```

## 🔥 Streak Queries

### Get User's Current Streaks
```sql
SELECT s.*, g.title as goal_title
FROM public.streaks s
JOIN public.goals g ON g.id = s.goal_id
WHERE s.user_id = auth.uid()
  AND s.current_streak > 0
ORDER BY s.current_streak DESC;
```

### Get Longest Streaks
```sql
SELECT s.*, g.title as goal_title, u.username
FROM public.streaks s
JOIN public.goals g ON g.id = s.goal_id
JOIN public.users u ON u.id = s.user_id
WHERE g.visibility = 'public'
ORDER BY s.longest_streak DESC
LIMIT 10;
```

### Get Streak Stats for Goal
```sql
SELECT * FROM public.streaks
WHERE goal_id = 'goal-uuid'
  AND user_id = auth.uid();
```

## 🏆 Milestone Queries

### Get User Milestones
```sql
SELECT m.*, g.title as goal_title
FROM public.milestones m
JOIN public.goals g ON g.id = m.goal_id
WHERE m.user_id = auth.uid()
ORDER BY m.achieved_at DESC;
```

### Get Recent Milestones (Public)
```sql
SELECT m.*, g.title as goal_title, u.username, u.display_name
FROM public.milestones m
JOIN public.goals g ON g.id = m.goal_id
JOIN public.users u ON u.id = m.user_id
WHERE g.visibility = 'public'
ORDER BY m.achieved_at DESC
LIMIT 20;
```

### Count User's Milestones by Type
```sql
SELECT milestone_type, COUNT(*) as count
FROM public.milestones
WHERE user_id = auth.uid()
GROUP BY milestone_type
ORDER BY count DESC;
```

## 💬 Note Queries

### Add Note to Goal
```sql
INSERT INTO public.notes (goal_id, author_id, content, note_type, is_private)
VALUES (
  'goal-uuid',
  auth.uid(),
  'Great progress! Keep it up!',
  'encouragement',
  false
);
```

### Get Goal Notes
```sql
SELECT n.*, u.username, u.display_name, u.profile_picture_url
FROM public.notes n
JOIN public.users u ON u.id = n.author_id
WHERE n.goal_id = 'goal-uuid'
ORDER BY n.created_at DESC;
```

## 🔔 Notification Queries

### Get Unread Notifications
```sql
SELECT * FROM public.notifications
WHERE user_id = auth.uid()
  AND is_read = false
ORDER BY created_at DESC;
```

### Mark Notification as Read
```sql
UPDATE public.notifications
SET is_read = true,
    read_at = NOW()
WHERE id = 'notification-uuid'
  AND user_id = auth.uid();
```

### Mark All as Read
```sql
UPDATE public.notifications
SET is_read = true,
    read_at = NOW()
WHERE user_id = auth.uid()
  AND is_read = false;
```

### Get Notification Count
```sql
SELECT COUNT(*) as unread_count
FROM public.notifications
WHERE user_id = auth.uid()
  AND is_read = false;
```

## 📊 Statistics Queries

### User Dashboard Stats
```sql
SELECT
  (SELECT COUNT(*) FROM public.goals WHERE user_id = auth.uid() AND is_completed = false) as active_goals,
  (SELECT COUNT(*) FROM public.goals WHERE user_id = auth.uid() AND is_completed = true) as completed_goals,
  (SELECT COUNT(*) FROM public.streaks WHERE user_id = auth.uid() AND current_streak > 0) as active_streaks,
  (SELECT COUNT(*) FROM public.milestones WHERE user_id = auth.uid()) as total_milestones,
  (SELECT COUNT(*) FROM public.followers WHERE following_id = auth.uid()) as followers_count,
  (SELECT COUNT(*) FROM public.followers WHERE follower_id = auth.uid()) as following_count;
```

### Goal Completion Rate
```sql
SELECT
  COUNT(*) as total_goals,
  SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) as completed_goals,
  ROUND(100.0 * SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) / COUNT(*)) as completion_rate
FROM public.goals
WHERE user_id = auth.uid();
```

### Activity Over Time (Last 30 Days)
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as goals_created
FROM public.goals
WHERE user_id = auth.uid()
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;
```

### Category Breakdown
```sql
SELECT
  category,
  COUNT(*) as goal_count,
  SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) as completed_count
FROM public.goals
WHERE user_id = auth.uid()
  AND category IS NOT NULL
GROUP BY category
ORDER BY goal_count DESC;
```

## 🔍 Search Queries

### Search Public Goals
```sql
SELECT g.*, u.username, u.display_name
FROM public.goals g
JOIN public.users u ON u.id = g.user_id
WHERE g.visibility = 'public'
  AND (
    g.title ILIKE '%search_term%' OR
    g.description ILIKE '%search_term%'
  )
ORDER BY g.created_at DESC;
```

### Search Users
```sql
SELECT * FROM public.users
WHERE username ILIKE '%search_term%'
   OR display_name ILIKE '%search_term%'
LIMIT 20;
```

## 🛠️ Maintenance Queries

### Delete Completed Goals Older Than 1 Year
```sql
DELETE FROM public.goals
WHERE user_id = auth.uid()
  AND is_completed = true
  AND completed_at < NOW() - INTERVAL '1 year';
```

### Archive Old Notifications
```sql
DELETE FROM public.notifications
WHERE user_id = auth.uid()
  AND is_read = true
  AND created_at < NOW() - INTERVAL '30 days';
```

### Reset Broken Streaks
```sql
UPDATE public.streaks
SET current_streak = 0
WHERE user_id = auth.uid()
  AND last_completed_date < CURRENT_DATE - INTERVAL '1 day';
```

## 🧪 Testing Queries

### Count All Records
```sql
SELECT
  (SELECT COUNT(*) FROM public.users) as users,
  (SELECT COUNT(*) FROM public.goals) as goals,
  (SELECT COUNT(*) FROM public.activities) as activities,
  (SELECT COUNT(*) FROM public.streaks) as streaks,
  (SELECT COUNT(*) FROM public.milestones) as milestones,
  (SELECT COUNT(*) FROM public.notes) as notes,
  (SELECT COUNT(*) FROM public.notifications) as notifications,
  (SELECT COUNT(*) FROM public.followers) as followers;
```

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Check Triggers
```sql
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

### Check Indexes
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## 📱 Storage Queries

### Upload Avatar URL
```sql
UPDATE public.users
SET profile_picture_url = 'https://your-project.supabase.co/storage/v1/object/public/avatars/user-uuid/avatar.png'
WHERE id = auth.uid();
```

### List Storage Files
```sql
SELECT * FROM storage.objects
WHERE bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text;
```

## 🚨 Common Issues

### Fix Missing Streaks
```sql
-- Create streak records for goals that don't have one
INSERT INTO public.streaks (goal_id, user_id, current_streak, longest_streak, total_completions)
SELECT g.id, g.user_id, 0, 0, 0
FROM public.goals g
WHERE NOT EXISTS (
  SELECT 1 FROM public.streaks s WHERE s.goal_id = g.id AND s.user_id = g.user_id
)
AND g.goal_type = 'recurring';
```

### Reset User's Test Data
```sql
-- WARNING: This deletes all data for the authenticated user
DELETE FROM public.goals WHERE user_id = auth.uid();
-- Other tables will cascade delete automatically
```

### Repair Constraint Violations
```sql
-- Fix goals with completed flag but no completed_at
UPDATE public.goals
SET completed_at = updated_at
WHERE is_completed = true
  AND completed_at IS NULL;
```

---

**Version:** 2.0  
**Last Updated:** 2024

## 💡 Pro Tips

1. Always use `auth.uid()` in queries to respect RLS
2. Use prepared statements to prevent SQL injection
3. Index columns you frequently query or join on
4. Use EXPLAIN ANALYZE to optimize slow queries
5. Keep transactions short to avoid locks
6. Use batch operations for multiple inserts
7. Test queries in SQL Editor before using in code