# Bug Fix: Single Goal Completion Error

## Issue
When completing a single-activity goal, the system was throwing an error:
```
invalid input syntax for type uuid: "single"
/rest/v1/goal_activities?id=eq.single:1
Failed to load resource: the server responded with a status of 400
```

## Root Cause
The application creates **virtual activities** for single-activity goals with `id: 'single'` to maintain a consistent interface. However, when toggling these virtual activities, the code was attempting to update the `goal_activities` table with this non-UUID 'single' ID, causing a database error.

### Where Virtual Activities Are Created
**File**: `app/goals/[id]/update/page.tsx` (lines 96-104)
```typescript
} else {
  // For single-activity goals, create a virtual activity
  setActivities([{ 
    id: 'single', 
    title: goalData.title, 
    completed: goalData.status === 'completed',
    goal_id: goalId,
    order_index: 0
  }])
}
```

## Solution Applied

### Fixed File: `app/goals/seasonal/[id]/update/page.tsx`

**Before** (lines 78-84):
```typescript
try {
  const { error } = await supabase
    .from('goal_activities')
    .update({ completed })
    .eq('id', activityId)

  if (error) throw error
```

**After** (lines 78-87):
```typescript
try {
  // Only update database for real activities (not virtual 'single' activities)
  if (activityId !== 'single') {
    const { error } = await supabase
      .from('goal_activities')
      .update({ completed })
      .eq('id', activityId)

    if (error) throw error
  }
```

## All Files Fixed

### Files That Already Had the Check
- ✅ `app/goals/[id]/update/page.tsx` (line 136)

### Files Fixed in This Update
- ✅ `app/goals/seasonal/[id]/update/page.tsx` (line 80)
- ✅ `app/goals/[id]/page.tsx` (line 198) - **Main culprit**
- ✅ `components/goals/activity-completion-dialog.tsx` (line 59)

## How It Works Now

1. **Single-Activity Goals**:
   - Virtual activity created with `id: 'single'`
   - When toggled, the check `if (activityId !== 'single')` prevents database query
   - Goal progress is updated directly in the `goals` table

2. **Multi-Activity Goals**:
   - Real activities with UUID IDs
   - Normal database updates to `goal_activities` table
   - Goal progress calculated from activity completion

## Testing Checklist

- [x] Single-activity goal completion works without errors
- [x] Multi-activity goal completion still works
- [x] Seasonal goal updates work correctly
- [x] Virtual activities don't trigger database queries
- [x] Goal progress updates correctly for both types

## Related Files

### Core Logic
- `app/goals/[id]/update/page.tsx` - Main goal update page (already fixed)
- `app/goals/seasonal/[id]/update/page.tsx` - Seasonal goal update (now fixed)

### Database Schema
- `goal_activities` table - Stores activities for multi-activity goals only
- `goals` table - Stores all goals with progress field

## Prevention

To prevent similar issues in the future:

1. **Always check for virtual IDs** before database operations:
   ```typescript
   if (activityId !== 'single') {
     // Database operation
   }
   ```

2. **Document virtual entities** clearly in code comments

3. **Consider using TypeScript discriminated unions**:
   ```typescript
   type Activity = 
     | { type: 'real', id: string, ... }
     | { type: 'virtual', id: 'single', ... }
   ```

## Impact

- ✅ **Fixed**: Single goal completion now works without errors
- ✅ **No Breaking Changes**: Multi-activity goals continue to work as before
- ✅ **Performance**: No additional database queries
- ✅ **User Experience**: Seamless goal completion for all goal types

## Deployment Notes

- No database migration required
- Frontend-only fix
- Safe to deploy immediately
- No rollback needed

---

**Status**: ✅ RESOLVED
**Priority**: HIGH (user-blocking bug)
**Type**: Bug Fix
**Affected Users**: All users completing single-activity goals
