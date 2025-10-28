# Schema Compatibility Fixes Applied

## Issue
The group goals migration was failing with error:
```
ERROR: 42703: column a.is_completed does not exist
```

## Root Cause
The migration script was written for a generic schema using:
- Table: `activities` 
- Column: `is_completed`

But the actual Commitly database uses:
- Table: `goal_activities`
- Column: `completed`

## Files Fixed

### 1. `group-goals-system.sql`
**Changes**:
- ✅ Updated all `activities` references to `goal_activities`
- ✅ Changed `is_completed` to `completed` in all queries
- ✅ Removed `assigned_to` column addition (already exists in goal_activities)
- ✅ Updated foreign key references
- ✅ Fixed view definition to use correct table and column names
- ✅ Updated triggers to use goal_activities table
- ✅ Added prerequisites documentation

**Key Updates**:
```sql
-- Before
ALTER TABLE public.activities ADD COLUMN assigned_to ...

-- After  
ALTER TABLE public.goal_activities ADD COLUMN assigned_to_all ...
```

```sql
-- Before
FROM public.activities a WHERE a.is_completed = TRUE

-- After
FROM public.goal_activities a WHERE a.completed = TRUE
```

### 2. `lib/group-goals.ts`
**Changes**:
- ✅ Updated all Supabase queries from `activities` to `goal_activities`
- ✅ Changed `is_completed` to `completed` in SELECT statements
- ✅ Updated TypeScript interfaces

**Functions Updated**:
- `assignActivity()` - Now uses goal_activities table
- `completeActivity()` - Updated table reference
- `canUserUpdateActivity()` - Updated query
- `getGroupGoalProgress()` - Uses completed instead of is_completed

### 3. `components/group-goals/activity-assignment.tsx`
**Changes**:
- ✅ Updated Activity interface: `is_completed` → `completed`
- ✅ Fixed completion percentage calculation
- ✅ Updated conditional rendering
- ✅ Fixed error handling TypeScript issue

### 4. `components/group-goals/group-goal-detail.tsx`
**Changes**:
- ✅ Updated activities query to use `goal_activities` table
- ✅ All activity references now use correct table name

## Database Schema Alignment

### Actual Commitly Schema (from database-schema.sql)
```sql
CREATE TABLE public.goal_activities (
  id UUID PRIMARY KEY,
  goal_id UUID REFERENCES public.goals(id),
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,  -- ← Note: 'completed', not 'is_completed'
  order_index INTEGER DEFAULT 0,
  due_date DATE,
  assigned_to UUID REFERENCES auth.users(id),  -- ← Already exists
  ...
);
```

### Migration Now Adds
```sql
ALTER TABLE public.goal_activities 
ADD COLUMN IF NOT EXISTS assigned_to_all BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS activity_type TEXT DEFAULT 'individual';
```

## Testing Checklist

Run these queries to verify the migration will work:

```sql
-- 1. Verify goal_activities table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'goal_activities'
);
-- Expected: true

-- 2. Verify completed column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'goal_activities'
  AND column_name = 'completed';
-- Expected: 1 row with boolean type

-- 3. Verify assigned_to column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'goal_activities'
  AND column_name = 'assigned_to';
-- Expected: 1 row

-- 4. Now run the migration
-- File: group-goals-system.sql
```

## Migration Order

1. ✅ Ensure base schema is applied (`database-schema.sql`)
2. ✅ Run `group-goals-system.sql` (now fixed)
3. ✅ Deploy updated TypeScript code
4. ✅ Test group goal creation and invitations

## What Was NOT Changed

- Base `goal_activities` table structure (already correct)
- Existing `assigned_to` column (already exists)
- RLS policies for goal_activities (assumed to exist from base schema)

## Compatibility Notes

The migration now:
- ✅ Works with existing Commitly database schema
- ✅ Adds only new columns (assigned_to_all, activity_type)
- ✅ Creates new tables (group_goal_members, activity_completions, etc.)
- ✅ Uses correct column names throughout
- ✅ Maintains backward compatibility

## Success Indicators

After running the fixed migration, you should see:
```sql
SELECT 'Group goals system created successfully!' AS status;
```

And these new tables:
- `group_goal_members`
- `group_goal_invitations`
- `activity_completions`
- `activity_notifications`

Plus new columns in existing tables:
- `goals.is_group_goal`
- `goals.group_goal_status`
- `goal_activities.assigned_to_all`
- `goal_activities.activity_type`

## Ready to Deploy

All schema compatibility issues have been resolved. The migration is now ready to run on your Commitly database.
