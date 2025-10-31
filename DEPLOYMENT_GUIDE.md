# Group Goals Enhancement - Deployment Guide

## 🚀 Quick Start

Follow these steps to deploy all enhancements to production:

---

## Step 1: Database Migration

Run the enhanced schema SQL in your Supabase dashboard:

```sql
-- Navigate to: Supabase Dashboard > SQL Editor > New Query
-- Copy and paste: lib/database/group-goals-enhanced-schema.sql
-- Click "Run"
```

**Verify Migration:**
```sql
-- Check if assigned_members column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'goal_activities' 
AND column_name = 'assigned_members';

-- Should return: assigned_members | ARRAY
```

---

## Step 2: Verify Asset Files

Ensure logo files exist in `/public`:

```
✅ /public/Comittly-logo.png (main logo)
✅ /public/icon-192x192.png (notification badge)
```

**If missing:** Copy logo files to public folder before deployment.

---

## Step 3: Build & Test Locally

```bash
# Install dependencies (if needed)
npm install

# Run development server
npm run dev

# Test critical paths:
# 1. Create group goal → verify admin permissions
# 2. Assign activity → check progress tracking
# 3. Test seasonal goal with partners
# 4. Check status badges on all goal types
```

---

## Step 4: Deploy to Production

```bash
# Build production bundle
npm run build

# Deploy to your hosting (e.g., Vercel)
vercel --prod

# OR for other platforms:
# npm run deploy
```

---

## Step 5: Post-Deployment Verification

### Test Admin Permissions
1. Create a group goal as User A
2. Log in as User B (member)
3. **Verify:** User B cannot see edit/delete buttons
4. **Verify:** User B cannot access `/goals/group/[id]/edit`

### Test Activity Assignment
1. Create group goal with activities
2. Assign activity to specific member
3. **Verify:** Only assigned member sees update button
4. **Verify:** Progress bar updates correctly

### Test Progress Blocking
1. Create group goal, invite members
2. Try updating progress before responses
3. **Verify:** Alert shows "Waiting for all members to respond"
4. Members accept → **Verify:** Progress updates allowed

### Test Status Display
1. Create goals with different states:
   - Completed goal
   - Paused goal
   - Goal past due date
2. **Verify:** Each shows correct status badge
3. **Verify:** Due date text is accurate

### Test Firebase Notifications
1. Enable notifications in browser
2. Create group goal invitation
3. **Verify:** Notification shows logo correctly
4. **Verify:** Notification is actionable (View/Dismiss)

### Test Seasonal Goals
1. Create seasonal goal
2. Select accountability partners
3. **Verify:** Partner requests sent
4. **Verify:** Partners receive notifications
5. **Verify:** Both group and personal work

---

## 🔍 Troubleshooting

### Issue: Admin delete button not showing
**Solution:**
```typescript
// Check group-goal-detail.tsx line ~239
{(isAdmin || isOwner) && (
  <DropdownMenu>...</DropdownMenu>
)}
```
Ensure `isOwner` is calculated correctly from `goal.user_id`

### Issue: Progress blocking not working
**Solution:**
```typescript
// Verify in lib/group-goals.ts
const allResponded = await checkAllMembersResponded(goalId)
// Should return false if ANY member has status='pending'
```

### Issue: Status badges not showing
**Solution:**
```tsx
// Import in component:
import { CompactGoalStatus } from "@/components/goals/goal-status-badge"

// Usage:
<CompactGoalStatus goal={goal} />
```

### Issue: Firebase notification logo not loading
**Solution:**
1. Check file exists: `/public/Comittly-logo.png` (case-sensitive!)
2. Verify service worker registered: Check browser console
3. Clear service worker cache: Dev Tools > Application > Service Workers > Unregister

### Issue: Seasonal partner requests not sending
**Solution:**
```typescript
// Verify in seasonal/create/page.tsx line ~287
if (goalNature === "personal" && selectedPartners.length > 0) {
  // Should create requests here
}
```

---

## 🧪 Testing Checklist

Copy this to your testing document:

```
□ Admin Permissions
  □ Only admin sees edit/delete
  □ Non-admin blocked from actions
  □ Deletion notifies all members

□ Activity Assignment
  □ Assign to specific members
  □ Only assigned can update
  □ Progress calculates correctly
  □ Reassignment on decline

□ Progress Blocking
  □ Blocks until responses
  □ Blocks if all decline
  □ Shows reason in alert
  □ Works for seasonal goals

□ Status Display
  □ Completed shows date
  □ Paused shows "Paused"
  □ Overdue shows days
  □ Resumed-overdue works
  □ Upcoming status correct

□ Firebase Notifications
  □ Logo displays
  □ Badge shows
  □ Actions work (View/Dismiss)
  □ Vibration on mobile

□ Seasonal Goals
  □ Partner selection
  □ Requests sent
  □ Notifications sent
  □ Group seasonal works
```

---

## 📊 Performance Monitoring

After deployment, monitor these metrics:

### Database Queries
```sql
-- Check slow queries related to group goals
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%group_goal%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Error Logs
Monitor for these patterns:
- `Error checking admin permissions`
- `Error updating activity assignment`
- `Failed to send partner requests`

### User Metrics
Track:
- Group goal creation rate
- Member acceptance rate
- Activity completion rate
- Notification delivery success

---

## 🔄 Rollback Plan

If issues occur after deployment:

### Option 1: Feature Flag (Recommended)
```typescript
// Add to environment variables
NEXT_PUBLIC_ENABLE_ENHANCED_GROUP_GOALS=false

// Wrap new features
if (process.env.NEXT_PUBLIC_ENABLE_ENHANCED_GROUP_GOALS === 'true') {
  // New features
}
```

### Option 2: Git Revert
```bash
# Find deployment commit
git log --oneline -10

# Revert to previous version
git revert <commit-hash>

# Redeploy
vercel --prod
```

### Option 3: Database Rollback
```sql
-- If needed, rollback schema changes
ALTER TABLE goal_activities DROP COLUMN IF EXISTS assigned_members;
DROP FUNCTION IF EXISTS reassign_declined_member_activities();
```

---

## 📞 Support Contacts

- **Database Issues:** Check Supabase logs
- **Build Errors:** Review Vercel/hosting logs
- **Feature Bugs:** Check browser console for errors

---

## ✅ Deployment Sign-Off

Complete this checklist before marking deployment as successful:

```
□ Database migration completed without errors
□ All asset files verified in production
□ Build succeeded without warnings
□ All 6 test scenarios passed
□ No errors in production logs (first 1 hour)
□ Performance metrics within acceptable range
□ Team notified of new features
□ Documentation updated
```

---

## 🎉 Success Criteria

Deployment is successful when:

1. ✅ All existing goals still function correctly
2. ✅ New group goals can be created with admin permissions
3. ✅ Activity assignments work for assigned members only
4. ✅ Status badges display correctly across app
5. ✅ Progress blocking prevents premature updates
6. ✅ Firebase notifications show correct logo
7. ✅ Seasonal goal partners receive requests
8. ✅ No increase in error rates
9. ✅ No performance degradation
10. ✅ User feedback is positive

---

**Deployment Checklist Completed By:** _____________  
**Date:** _____________  
**Production URL:** _____________  
**Verification Status:** □ Passed  □ Failed  □ Partial

---

Good luck with the deployment! 🚀
