# Commitly Database Setup Guide

This guide explains how to set up the complete database schema for Commitly in Supabase.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Setup](#quick-setup)
- [Database Schema](#database-schema)
- [Security & RLS Policies](#security--rls-policies)
- [Functions & Triggers](#functions--triggers)
- [Storage](#storage)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Commitly database consists of:
- **11 Tables**: Users, Goals, Activities, Accountability Partners, Streaks, Milestones, Notes, Notifications, Goal Completions, Followers, Goal Members
- **50+ Indexes**: For optimal query performance
- **30+ RLS Policies**: Row-level security for data protection
- **3 Database Functions**: Automated streak tracking and notifications
- **7 Triggers**: Auto-update timestamps and business logic
- **1 Storage Bucket**: For user avatars

## ✅ Prerequisites

1. A Supabase account (free tier works)
2. A Supabase project created
3. Access to the SQL Editor in your Supabase dashboard

## 🚀 Quick Setup

### Step 1: Access SQL Editor

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Schema

1. Open the file `frontend/backend/scripts/schema.sql`
2. Copy the entire contents
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl/Cmd + Enter)
5. Wait for execution to complete (~30 seconds)

### Step 3: Verify Setup

If successful, you'll see:
```
Database schema created successfully!
```

You can verify the tables were created by:
1. Going to **Table Editor** in the Supabase dashboard
2. You should see 11 tables: `users`, `goals`, `activities`, etc.

## 🗄️ Database Schema

### Table Structure

#### 1. **users**
Extends Supabase authentication with profile information.

```sql
- id (UUID, PK) - References auth.users
- username (TEXT, UNIQUE) - Unique username (3-30 chars)
- display_name (TEXT) - Display name
- phone_number (TEXT, UNIQUE) - Optional phone
- email (TEXT, UNIQUE) - User email
- bio (TEXT) - User biography
- profile_picture_url (TEXT) - Avatar URL
- created_at, updated_at (TIMESTAMPTZ)
```

**Relationships:**
- One-to-many with `goals`
- One-to-many with `notifications`
- Many-to-many with `followers` (self-referential)

---

#### 2. **goals**
User goals with various types and configurations.

```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- title (TEXT) - Goal title
- description (TEXT) - Goal description
- goal_type (TEXT) - 'single', 'multi', or 'recurring'
- visibility (TEXT) - 'public', 'private', or 'restricted'
- category (TEXT) - Optional category
- start_date, end_date (TIMESTAMPTZ)
- recurrence_pattern (TEXT) - For recurring goals
- recurrence_days (TEXT[]) - Days for custom recurrence
- default_time_allocation (INTEGER) - Expected time in minutes
- is_suspended (BOOLEAN)
- is_completed (BOOLEAN)
- completed_at (TIMESTAMPTZ)
- progress (INTEGER, 0-100)
- created_at, updated_at (TIMESTAMPTZ)
```

**Goal Types:**
- `single`: One-time goal
- `multi`: Goal with multiple activities/sub-tasks
- `recurring`: Repeating goal (daily, weekly, monthly)

**Visibility:**
- `public`: Visible to everyone
- `private`: Only visible to owner
- `restricted`: Only visible to accountability partners

---

#### 3. **activities**
Sub-tasks for multi-activity goals.

```sql
- id (UUID, PK)
- goal_id (UUID, FK → goals)
- title (TEXT)
- description (TEXT)
- is_completed (BOOLEAN)
- completed_at (TIMESTAMPTZ)
- order_index (INTEGER) - Display order
- created_at, updated_at (TIMESTAMPTZ)
```

---

#### 4. **accountability_partners**
Accountability partner relationships for goals.

```sql
- id (UUID, PK)
- requester_id (UUID, FK → users)
- partner_id (UUID, FK → users)
- goal_id (UUID, FK → goals)
- status (TEXT) - 'pending', 'accepted', 'declined', 'cancelled'
- message (TEXT) - Optional message
- responded_at (TIMESTAMPTZ)
- created_at, updated_at (TIMESTAMPTZ)
```

---

#### 5. **streaks**
Streak tracking for recurring goals.

```sql
- id (UUID, PK)
- goal_id (UUID, FK → goals)
- user_id (UUID, FK → users)
- current_streak (INTEGER)
- longest_streak (INTEGER)
- last_completed_date (DATE)
- total_completions (INTEGER)
- created_at, updated_at (TIMESTAMPTZ)
```

**Constraints:**
- Unique constraint on (goal_id, user_id)
- longest_streak >= current_streak

---

#### 6. **milestones**
Achievement milestones for users.

```sql
- id (UUID, PK)
- goal_id (UUID, FK → goals)
- user_id (UUID, FK → users)
- title (TEXT)
- description (TEXT)
- achieved_at (TIMESTAMPTZ)
- milestone_type (TEXT) - 'streak', 'completion', 'custom', etc.
- metadata (JSONB) - Additional data
- created_at (TIMESTAMPTZ)
```

**Milestone Types:**
- `streak`: Streak milestones (7, 30, 100, 365 days)
- `completion`: Goal completion milestones
- `first_goal`, `tenth_goal`: Achievement milestones
- `month_streak`, `year_streak`: Long-term streaks
- `custom`: User-defined milestones

---

#### 7. **notes**
Encouragement, feedback, and updates on goals.

```sql
- id (UUID, PK)
- goal_id (UUID, FK → goals)
- author_id (UUID, FK → users)
- content (TEXT)
- note_type (TEXT) - 'encouragement', 'feedback', 'reminder', 'update'
- is_private (BOOLEAN) - Visible only to goal owner
- created_at (TIMESTAMPTZ)
```

---

#### 8. **notifications**
User notifications for various events.

```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- title (TEXT)
- message (TEXT)
- notification_type (TEXT) - Type of notification
- related_goal_id (UUID, FK → goals)
- related_user_id (UUID, FK → users)
- action_url (TEXT) - Optional action link
- is_read (BOOLEAN)
- read_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
```

**Notification Types:**
- `goal_created`, `goal_completed`, `goal_missed`, `goal_reminder`
- `accountability_request`, `accountability_accepted`, `accountability_declined`
- `partner_completed`, `partner_note`
- `milestone_achieved`, `streak_milestone`
- `follower_new`, `system`

---

#### 9. **goal_completions**
Historical record of goal completions.

```sql
- id (UUID, PK)
- goal_id (UUID, FK → goals)
- user_id (UUID, FK → users)
- completion_date (TIMESTAMPTZ)
- actual_time_spent (INTEGER) - Time in minutes
- notes (TEXT) - Completion notes
- mood (TEXT) - 'great', 'good', 'okay', 'struggling', 'difficult'
- created_at (TIMESTAMPTZ)
```

---

#### 10. **followers**
User follow relationships.

```sql
- id (UUID, PK)
- follower_id (UUID, FK → users)
- following_id (UUID, FK → users)
- created_at (TIMESTAMPTZ)
```

**Constraints:**
- Unique constraint on (follower_id, following_id)
- follower_id != following_id (can't follow yourself)

---

#### 11. **goal_members**
Members of shared/group goals.

```sql
- id (UUID, PK)
- goal_id (UUID, FK → goals)
- user_id (UUID, FK → users)
- role (TEXT) - 'owner', 'member', 'viewer'
- can_edit (BOOLEAN)
- joined_at (TIMESTAMPTZ)
```

## 🔒 Security & RLS Policies

All tables have Row Level Security (RLS) enabled. Here's a summary of access rules:

### Users
- ✅ Everyone can view all profiles
- ✅ Users can insert/update/delete their own profile

### Goals
- ✅ Users can view their own goals
- ✅ Everyone can view public goals
- ✅ Accountability partners can view restricted goals
- ✅ Users can create/update/delete their own goals

### Activities
- ✅ Users can manage activities for their own goals
- ✅ Everyone can view activities of public goals

### Accountability Partners
- ✅ Users can view/manage their own accountability relationships
- ✅ Both requester and partner can update status

### Streaks
- ✅ Users can view their own streaks
- ✅ Everyone can view streaks of public goals
- ✅ System can create/update streaks (for triggers)

### Milestones
- ✅ Users can view their own milestones
- ✅ Everyone can view milestones of public goals
- ✅ System can create milestones (for triggers)

### Notes
- ✅ Goal owners can view all notes on their goals
- ✅ Everyone can view non-private notes on public goals
- ✅ Accountability partners can view non-private notes
- ✅ Users can create/update/delete their own notes

### Notifications
- ✅ Users can view/update/delete their own notifications
- ✅ System can create notifications

### Goal Completions
- ✅ Users can view their own completions
- ✅ Everyone can view completions of public goals
- ✅ Users can manage their own completions

### Followers
- ✅ Everyone can view all follow relationships
- ✅ Users can follow/unfollow others

### Goal Members
- ✅ Users can view members of goals they have access to
- ✅ Goal owners can add/remove members
- ✅ Members can remove themselves

## ⚙️ Functions & Triggers

### 1. **update_updated_at_column()**
Automatically updates the `updated_at` timestamp when a row is modified.

**Applies to:** users, goals, activities, accountability_partners, streaks

### 2. **update_streak()**
Automatically tracks streaks when a goal is completed.

**Logic:**
- If completed today: maintain current streak
- If completed yesterday: increment streak
- If gap in completions: reset to 1
- Creates milestone for 7, 30, 100, 365-day streaks

**Trigger:** Fires after goal is marked as completed

### 3. **notify_accountability_partners()**
Sends notifications to accountability partners when a goal is completed.

**Trigger:** Fires after goal is marked as completed

**Creates notification:**
- Title: "Goal Completed! 🎉"
- Message: "[User] completed their goal: [Title]"
- Links to goal details page

## 📦 Storage

### Avatars Bucket

A storage bucket named `avatars` is created for user profile pictures.

**Configuration:**
- Public: Yes (avatars are publicly accessible)
- File naming: `{user_id}/avatar.{extension}`

**Policies:**
- ✅ Everyone can view avatars
- ✅ Users can upload/update/delete their own avatar

**Usage Example:**
```javascript
// Upload avatar
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file);

// Get public URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.png`);
```

## 🔍 Indexes

The schema includes 50+ indexes for optimal performance:

**Key Indexes:**
- Username and email lookups (users)
- User's goals by completion status
- Goal visibility and category
- Activity ordering within goals
- Accountability partner lookups
- Unread notifications
- Recent completions
- Follower relationships

**Composite Indexes:**
- `(user_id, is_completed)` on goals
- `(goal_id, order_index)` on activities
- `(user_id, is_read)` on notifications

## 🐛 Troubleshooting

### Issue: "relation does not exist"

**Cause:** Schema wasn't run or partially failed

**Solution:**
1. Go to SQL Editor
2. Run the schema again (it will drop and recreate everything)
3. Check for error messages in the output

---

### Issue: "permission denied for table"

**Cause:** RLS policies not created or auth user not set

**Solution:**
1. Verify RLS is enabled: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
2. Check policies exist in Table Editor → Policies tab
3. Ensure you're authenticated when testing

---

### Issue: "duplicate key value violates unique constraint"

**Cause:** Trying to insert duplicate data

**Solution:**
- Check unique constraints: username, email, phone_number
- Use upsert for updates: `upsert()` instead of `insert()`

---

### Issue: Triggers not firing

**Cause:** Triggers might not be created

**Solution:**
1. Check triggers exist:
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE event_object_schema = 'public';
   ```
2. Re-run the schema to recreate triggers

---

### Issue: Storage policies not working

**Cause:** Storage policies need to be created separately

**Solution:**
1. The schema creates storage policies automatically
2. If issues persist, check: Authentication → Policies → storage.objects
3. Ensure auth.uid() matches folder structure

---

### Issue: Can't query other users' public goals

**Cause:** RLS policy might be restrictive

**Solution:**
- Public goals should be queryable with: `visibility = 'public'`
- Check the `goals_select_public` policy exists
- Test query:
  ```sql
  SELECT * FROM goals WHERE visibility = 'public';
  ```

## 📊 Database Diagram

```
┌─────────┐
│  users  │
└────┬────┘
     │
     ├─────────────────────────────────┐
     │                                 │
     ▼                                 ▼
┌─────────┐                    ┌──────────────┐
│  goals  │◄───────────────────┤ goal_members │
└────┬────┘                    └──────────────┘
     │
     ├──────────┬──────────────┬──────────────┬──────────────┬────────────┐
     ▼          ▼              ▼              ▼              ▼            ▼
┌──────────┐ ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌─────────────┐ ┌────────┐
│activities│ │ streaks │ │milestones│ │   notes   │ │accountability│ │goal_   │
│          │ │         │ │          │ │           │ │  _partners   │ │comple- │
│          │ │         │ │          │ │           │ │              │ │tions   │
└──────────┘ └─────────┘ └──────────┘ └───────────┘ └─────────────┘ └────────┘

┌─────────────────┐
│  notifications  │◄── Created by triggers
└─────────────────┘

┌───────────┐
│ followers │◄── Self-referential to users
└───────────┘
```

## 🎓 Best Practices

### 1. Always Use Transactions for Complex Operations
```javascript
const { data, error } = await supabase.rpc('transaction_function');
```

### 2. Leverage Indexes for Queries
The schema includes indexes for common queries. Use them:
```javascript
// Good: Uses idx_goals_user_completed
const { data } = await supabase
  .from('goals')
  .select('*')
  .eq('user_id', userId)
  .eq('is_completed', false);
```

### 3. Respect RLS Policies
Always authenticate before querying protected data:
```javascript
const { data } = await supabase.auth.getUser();
// Now queries will respect RLS policies
```

### 4. Use Triggers for Business Logic
Let the database handle:
- Streak calculations
- Notification creation
- Timestamp updates

Don't duplicate this logic in your application.

### 5. Optimize for Common Queries
The schema is optimized for:
- User dashboard (active goals)
- Goal details with activities
- Notification feed
- Public goal discovery
- Accountability partner tracking

## 📝 Migration Notes

If you're updating from an older schema:

1. **Backup your data** before running the schema
2. The schema includes `DROP TABLE IF EXISTS` statements
3. All data will be lost - export important data first
4. Consider using migrations for production databases

## 🤝 Support

If you encounter issues:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review SQL output for error messages
3. Test queries in SQL Editor
4. Check browser console for client-side errors
5. Verify authentication state

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/triggers.html)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [SQL Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html)

---

**Schema Version:** 2.0  
**Last Updated:** 2024  
**Maintainer:** Commitly Team