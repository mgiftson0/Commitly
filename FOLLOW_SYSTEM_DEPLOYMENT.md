# Follow System - Deployment Guide

## Quick Start (5 Minutes)

### Step 1: Run Database Migration
Execute the migration script in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Open `complete-follow-system-migration.sql`
3. Click "Run" to execute

**What this does:**
- Creates `follows` table with RLS policies
- Updates `profiles` table (adds `is_private`, `followers_count`, `following_count`)
- Creates database triggers for auto-count updates
- Creates notification triggers for follow events
- Sets up helper functions (`are_mutuals`, `get_follow_status`)

### Step 2: Verify Database
Run this query to confirm setup:

```sql
-- Check if follows table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'follows'
) as follows_exists;

-- Check if triggers are active
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name IN ('trigger_update_follow_counts', 'trigger_notify_on_follow');

-- Verify profile columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('is_private', 'followers_count', 'following_count');
```

All queries should return positive results.

### Step 3: Test API Routes
The following API routes are now available:

```bash
# Test follow status (replace USER_ID)
curl http://localhost:3000/api/follows/status?target_id=USER_ID

# Test getting followers
curl http://localhost:3000/api/follows?user_id=USER_ID&type=followers

# Test getting following
curl http://localhost:3000/api/follows?user_id=USER_ID&type=following
```

### Step 4: Add Components to Your Pages

#### Profile Page - Add Follow Button
```tsx
import { FollowButton } from '@/components/profile/follow-button';

export default function ProfilePage({ params }) {
  return (
    <div>
      <FollowButton userId={params.userId} username={params.username} />
    </div>
  );
}
```

#### Followers/Following Page
```tsx
import { FollowersList } from '@/components/profile/followers-list';

export default function FollowersPage({ params }) {
  return (
    <div>
      <h1>Followers</h1>
      <FollowersList 
        userId={params.userId} 
        type="followers" 
        currentUserId={currentUser?.id}
      />
    </div>
  );
}
```

#### Notifications Page - Follow Requests
```tsx
import { FollowRequests } from '@/components/profile/follow-requests';

export default function NotificationsPage() {
  return (
    <div>
      <h2>Follow Requests</h2>
      <FollowRequests />
    </div>
  );
}
```

## Complete Feature Set

### ✅ For Users
- **Follow/Unfollow** - One-click follow actions
- **Private Accounts** - Require approval for follows
- **Mutual Detection** - Shows when both users follow each other
- **Follow Requests** - Manage incoming requests
- **Real-time Counts** - Accurate follower/following numbers
- **Notifications** - Get notified of new follows and approvals

### ✅ For Developers
- **Type-safe** - Full TypeScript support
- **Optimized** - Denormalized counts for fast reads
- **Secure** - Row-level security on all operations
- **Scalable** - Database triggers handle updates
- **Simple API** - RESTful endpoints
- **React Hooks** - Easy integration with `useFollow()`

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
├─────────────────────────────────────────────────────────────┤
│  FollowButton  │  FollowersList  │  FollowRequests          │
└────────┬───────────────┬────────────────┬───────────────────┘
         │               │                │
         └───────────────┴────────────────┘
                         │
                    useFollow() Hook
                         │
         ┌───────────────┴────────────────┐
         │        API Routes              │
         ├────────────────────────────────┤
         │  /api/follows                  │
         │  /api/follows/requests         │
         │  /api/follows/status           │
         └────────────────┬───────────────┘
                         │
         ┌───────────────┴────────────────┐
         │      Supabase Database         │
         ├────────────────────────────────┤
         │  follows (RLS)                 │
         │  profiles (updated)            │
         │  notifications                 │
         │                                │
         │  Triggers:                     │
         │  • update_follow_counts()      │
         │  • notify_on_follow()          │
         │                                │
         │  Functions:                    │
         │  • get_follow_status()         │
         │  • are_mutuals()               │
         └────────────────────────────────┘
```

## Data Flow Examples

### 1. User Follows Another (Public Account)
```
User clicks Follow → POST /api/follows
  ↓
Insert into follows (status='accepted')
  ↓
Trigger: update_follow_counts() → Updates both profiles
  ↓
Trigger: notify_on_follow() → Creates notification
  ↓
UI updates → Button shows "Following"
```

### 2. User Follows Private Account
```
User clicks Follow → POST /api/follows
  ↓
Insert into follows (status='pending')
  ↓
Trigger: notify_on_follow() → Creates follow request notification
  ↓
UI updates → Button shows "Requested"
  ↓
Target user approves → PATCH /api/follows/requests
  ↓
Update status to 'accepted'
  ↓
Trigger: update_follow_counts() → Updates counts
  ↓
Trigger: notify_on_follow() → Notifies requester of acceptance
```

## Performance Metrics

### Database Queries
- **Follow Status Check**: 1 function call (`get_follow_status`)
- **Get Followers**: 1 SELECT with JOIN
- **Follow Action**: 1 INSERT + 2 UPDATEs (via trigger)
- **Unfollow**: 1 DELETE + 2 UPDATEs (via trigger)

### Indexes (All Auto-Created)
- `idx_follows_follower_id`
- `idx_follows_following_id`
- `idx_follows_status`
- `idx_follows_follower_status`
- `idx_follows_following_status`

### Caching Strategy
- Counts are denormalized in `profiles` table
- Updated automatically via database triggers
- No application-level cache needed

## Security Model

### Row Level Security (RLS)
All operations are protected by RLS policies:

```sql
-- Anyone can view accepted follows
CREATE POLICY "follows_select_public" ON follows
  FOR SELECT USING (status = 'accepted');

-- Users see their own relationships
CREATE POLICY "follows_select_involved" ON follows
  FOR SELECT USING (auth.uid() IN (follower_id, following_id));

-- Users can only follow as themselves
CREATE POLICY "follows_insert_own" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Only target can update status (accept/reject)
CREATE POLICY "follows_update_involved" ON follows
  FOR UPDATE USING (auth.uid() = following_id);

-- Users can only unfollow themselves
CREATE POLICY "follows_delete_own" ON follows
  FOR DELETE USING (auth.uid() = follower_id);
```

## Notification Integration

### Notification Types Created
1. **`follower_new`** - Public account follow
   - Sent to: User being followed
   - When: Immediate upon follow
   - Action: None required

2. **`follow_request`** - Private account follow request
   - Sent to: Private account owner
   - When: Follow attempted on private account
   - Action: Accept or reject in UI

3. **`follow_accepted`** - Request approved
   - Sent to: User who sent request
   - When: Private account owner accepts
   - Action: None required

### Notification Format
```typescript
{
  user_id: UUID,
  title: string,           // e.g., "New Follower"
  message: string,         // e.g., "@johndoe started following you"
  notification_type: string, // follower_new, follow_request, follow_accepted
  related_user_id: UUID,   // The other user in the relationship
  is_read: boolean,
  created_at: timestamp
}
```

## Troubleshooting

### Issue: Counts not updating
**Solution:**
```sql
-- Recalculate all counts manually
UPDATE public.profiles p
SET 
  followers_count = (SELECT COUNT(*) FROM follows WHERE following_id = p.id AND status = 'accepted'),
  following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = p.id AND status = 'accepted');
```

### Issue: Can't follow users
**Check:**
1. RLS policies are enabled
2. User is authenticated
3. Not trying to follow self
4. Unique constraint not violated (already following)

**Debug query:**
```sql
SELECT * FROM follows 
WHERE follower_id = 'YOUR_USER_ID' 
  AND following_id = 'TARGET_USER_ID';
```

### Issue: Notifications not appearing
**Check:**
1. Triggers are active:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_notify_on_follow';
```

2. Notifications table exists and is accessible
3. RLS policy allows reading own notifications

### Issue: TypeScript errors
**Solution:**
- Run `npm install` to ensure all dependencies are installed
- Restart TypeScript server: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
- The `use-toast` hook was created - IDE may need refresh

## Production Checklist

Before deploying to production:

- [ ] Database migration executed successfully
- [ ] All triggers are active
- [ ] RLS policies tested and verified
- [ ] API routes return expected data
- [ ] Follow button works in UI
- [ ] Unfollow works correctly
- [ ] Private account flow tested
- [ ] Notifications appear for follows
- [ ] Counts update in real-time
- [ ] Performance tested with realistic data volume
- [ ] Error handling tested (network failures, etc.)
- [ ] Mobile responsive design verified

## Monitoring

### Key Metrics to Track
1. **Follow rate** - Follows created per day
2. **Accept rate** - % of follow requests accepted (private accounts)
3. **Unfollow rate** - Unfollows per day
4. **Average followers per user**
5. **Notification delivery rate**

### Database Health Checks
```sql
-- Check for orphaned follows (users deleted)
SELECT COUNT(*) FROM follows f
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE id = f.follower_id)
   OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id = f.following_id);

-- Verify count accuracy
SELECT 
  p.id,
  p.followers_count,
  (SELECT COUNT(*) FROM follows WHERE following_id = p.id AND status = 'accepted') as actual_followers,
  p.following_count,
  (SELECT COUNT(*) FROM follows WHERE follower_id = p.id AND status = 'accepted') as actual_following
FROM profiles p
WHERE p.followers_count != (SELECT COUNT(*) FROM follows WHERE following_id = p.id AND status = 'accepted')
   OR p.following_count != (SELECT COUNT(*) FROM follows WHERE follower_id = p.id AND status = 'accepted');
```

## Next Steps

1. **Run the migration** - Execute `complete-follow-system-migration.sql`
2. **Test locally** - Try following/unfollowing in dev environment
3. **Add to profile pages** - Integrate `FollowButton` component
4. **Style components** - Customize to match your design system
5. **Add analytics** - Track follow metrics
6. **Monitor performance** - Watch database query times

## Support & Documentation

- **Full Documentation**: `FOLLOW_SYSTEM_IMPLEMENTATION.md`
- **Database Migration**: `complete-follow-system-migration.sql`
- **API Documentation**: Check individual route files for detailed specs

---

**Estimated Setup Time**: 5-10 minutes
**Complexity Level**: Low (all automated via migration)
**Dependencies**: Supabase, Next.js 13+, React 18+
