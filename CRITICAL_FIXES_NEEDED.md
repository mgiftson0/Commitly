# Critical Group Goal Fixes

## Issues Identified

### 1. Group Goal Invitation Accept/Decline Buttons Not Showing ❌
**Problem:** Notification shows message but no accept/decline buttons  
**Root Cause:** Notification type check mismatch  
- API creates notifications with `type: 'goal_created'`  
- UI checks for `invitation_type === 'group_goal'` in data object  

**Files to Fix:**
- `app/notifications/page.tsx` - Line 675: Change condition to check for both

### 2. Assignment Limited to 1 Member ❌  
**Problem:** Can only assign to single member, not multiple  
**Root Cause:** Goal creation uses `assigned_to` (single) instead of `assigned_members` (array)  

**Files to Fix:**
- `app/goals/create/page.tsx` - Activity creation logic  
- `app/goals/seasonal/create/page.tsx` - Activity creation logic  
- State type needs to support multiple member selections

### 3. Non-Assigned Members Can Accept/Decline Activities ❌
**Problem:** All members see accept/decline for activities not assigned to them  
**Root Cause:** Permission check not properly filtering by assigned members  

**Files to Check:**
- Activity completion components
- Permission checks in `lib/group-goals.ts`

---

## Implementation Plan

### Fix 1: Notification Buttons

**Change in `/app/notifications/page.tsx` line ~675:**

```typescript
// OLD:
{notification.data?.invitation_type === 'group_goal' && notification.data?.goal_id && (

// NEW:
{(notification.type === 'goal_created' || notification.data?.invitation_type === 'group_goal') && notification.data?.goal_id && notification.data?.inviter_id && (
```

### Fix 2: Multiple Member Assignment

**Update state type in goal creation pages:**

```typescript
// Change from single ID to support multiple
const [activityAssignments, setActivityAssignments] = useState<{
  [key: number]: {
    type: 'single' | 'multiple' | 'all' | 'unassigned'
    members: string[]
  }
}>({})
```

**Update activity creation:**

```typescript
.map((activity, index) => ({
  goal_id: newGoal.id,
  title: activity.trim(),
  completed: false,
  order_index: index,
  // Handle different assignment types
  assigned_to: activityAssignments[index]?.type === 'single' 
    ? activityAssignments[index].members[0] 
    : null,
  assigned_to_all: !activityAssignments[index] || activityAssignments[index]?.type === 'all',
  assigned_members: activityAssignments[index]?.type === 'multiple' 
    ? activityAssignments[index].members 
    : []
}))
```

### Fix 3: Permission Filtering

**Update lib/group-goals.ts canUserEditActivity:**

```typescript
// Check if activity is assigned to specific members
if (activity.assigned_members && activity.assigned_members.length > 0) {
  return activity.assigned_members.includes(userId)
}
```

---

## Files Modified Summary

1. ✅ `app/api/group-goals/invitations/route.ts` - Added declined member handling  
2. ✅ `components/goals/activity-assignment.tsx` - Added "Select Multiple" option  
3. ⏳ `app/notifications/page.tsx` - Fix button visibility  
4. ⏳ `app/goals/create/page.tsx` - Update assignment logic  
5. ⏳ `app/goals/seasonal/create/page.tsx` - Update assignment logic  
6. ⏳ `lib/group-goals.ts` - Fix permission checks  

---

## Testing Checklist

After fixes:
- [ ] Create group goal with invitation
- [ ] Check notification shows accept/decline buttons
- [ ] Click accept - verify added to group_goal_members
- [ ] Create activity assigned to multiple specific members (2+)
- [ ] Verify only assigned members see update button
- [ ] Verify admin can manage all activities
- [ ] Test with standard goals
- [ ] Test with seasonal goals
