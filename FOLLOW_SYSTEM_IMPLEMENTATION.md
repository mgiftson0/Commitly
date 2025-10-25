# Follow System Implementation Guide

## Overview
Complete follow system with support for private accounts, mutual follows, and real-time notifications.

## Features Implemented

### ✅ Database Schema
- **follows** table with status support (pending, accepted, blocked)
- Automatic follower/following count updates via triggers
- Mutual follow detection
- Support for private account follow requests

### ✅ Backend (Database Functions & Triggers)
- `update_follow_counts()` - Automatically maintains accurate counts
- `notify_on_follow()` - Creates notifications for follows and requests
- `are_mutuals()` - Check if two users follow each other
- `get_follow_status()` - Get complete follow relationship between users

### ✅ API Routes
1. **`/api/follows`**
   - `GET` - Fetch followers, following, or pending requests
   - `POST` - Follow a user (creates pending request for private accounts)
   - `DELETE` - Unfollow a user

2. **`/api/follows/requests`**
   - `PATCH` - Accept or reject follow requests

3. **`/api/follows/status`**
   - `GET` - Check follow status between current user and target

### ✅ Frontend Components
1. **`FollowButton`** - Smart follow/unfollow button with states:
   - Follow (not following)
   - Following (accepted follow)
   - Mutual (both users follow each other)
   - Requested (pending approval)

2. **`FollowersList`** - Display followers or following with inline follow actions

3. **`FollowRequests`** - Manage incoming follow requests (accept/reject)

### ✅ Custom Hook
- **`useFollow(userId)`** - Complete follow management:
  - `status` - Current follow relationship
  - `followUser()` - Send follow request
  - `unfollowUser()` - Remove follow
  - `acceptFollowRequest()` - Approve pending request
  - `rejectFollowRequest()` - Decline request
  - `refresh()` - Reload status

## Database Migration

Run the migration script to set up the complete system:

```bash
psql -f complete-follow-system-migration.sql
```

Or execute via Supabase dashboard SQL editor.

## Schema Details

### follows Table
```sql
id              UUID PRIMARY KEY
follower_id     UUID (who is following)
following_id    UUID (who is being followed)
status          TEXT (pending/accepted/blocked)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### profiles Table (updated columns)
```sql
is_private         BOOLEAN (default false)
followers_count    INTEGER (auto-updated)
following_count    INTEGER (auto-updated)
display_name       TEXT
```

## Row Level Security (RLS)

### Public Access
- Anyone can view **accepted** follows (for public profiles)

### User Access
- Users can view their own follow relationships (all statuses)
- Users can create follows (request to follow others)
- Users being followed can update status (accept/reject)
- Users can delete their own follows (unfollow)

## Notification Types

New notification types added:
- `follower_new` - Someone followed you (public account)
- `follow_request` - Someone wants to follow you (private account)
- `follow_accepted` - Your follow request was accepted

## Usage Examples

### 1. Display Follow Button on Profile
```tsx
import { FollowButton } from '@/components/profile/follow-button';

<FollowButton 
  userId={profileUserId} 
  username={username}
  variant="default"
  size="default"
  showText={true}
/>
```

### 2. Show Followers List
```tsx
import { FollowersList } from '@/components/profile/followers-list';

<FollowersList 
  userId={profileUserId}
  type="followers" // or "following"
  currentUserId={currentUser?.id}
/>
```

### 3. Manage Follow Requests
```tsx
import { FollowRequests } from '@/components/profile/follow-requests';

<FollowRequests />
```

### 4. Use Hook Directly
```tsx
import { useFollow } from '@/hooks/use-follow';

function ProfilePage({ targetUserId }) {
  const { status, loading, followUser, unfollowUser } = useFollow(targetUserId);
  
  return (
    <div>
      <p>Followers: {status.followersCount}</p>
      <p>Following: {status.followingCount}</p>
      <p>Is Mutual: {status.isMutual ? 'Yes' : 'No'}</p>
      
      <button onClick={followUser} disabled={loading}>
        Follow
      </button>
    </div>
  );
}
```

## API Usage

### Check Follow Status
```typescript
const response = await fetch(`/api/follows/status?target_id=${userId}`);
const data = await response.json();
// Returns: { is_following, is_follower, is_mutual, follow_status, is_pending, ... }
```

### Follow a User
```typescript
const response = await fetch('/api/follows', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ following_id: targetUserId }),
});
```

### Unfollow
```typescript
await fetch(`/api/follows?following_id=${targetUserId}`, {
  method: 'DELETE',
});
```

### Accept/Reject Request
```typescript
await fetch('/api/follows/requests', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    request_id: requestId, 
    action: 'accept' // or 'reject'
  }),
});
```

## Privacy & Access Control

### Public Accounts (is_private = false)
- Follows are immediately accepted
- Anyone can see followers/following
- Notification sent: "X started following you"

### Private Accounts (is_private = true)
- Follows create pending requests
- Owner must approve requests
- Only accepted follows are visible
- Notifications sent for both request and acceptance

## Performance Considerations

### Indexes Created
- `idx_follows_follower_id` - Fast follower lookups
- `idx_follows_following_id` - Fast following lookups
- `idx_follows_status` - Filter by status
- `idx_follows_follower_status` - Combined queries
- `idx_follows_following_status` - Combined queries

### Count Caching
Follower/following counts are denormalized in the `profiles` table and updated via database triggers for optimal read performance.

## Testing Checklist

- [ ] Public account: Follow → immediate acceptance
- [ ] Private account: Follow → pending request → accept/reject
- [ ] Unfollow removes relationship and updates counts
- [ ] Mutual follows display correctly
- [ ] Notifications created for new follows
- [ ] Notifications created for follow requests
- [ ] Notifications created when request accepted
- [ ] RLS prevents unauthorized access
- [ ] Counts update in real-time
- [ ] Can't follow yourself (validation)
- [ ] Can't follow same user twice (unique constraint)

## Future Enhancements

1. **Block functionality** - Use status='blocked' to prevent follows
2. **Follow suggestions** - Recommend users based on mutuals
3. **Activity feed** - Show follows from people you follow
4. **Follower insights** - Analytics on follower growth
5. **Bulk actions** - Remove multiple followers at once
6. **Export followers** - Download follower list

## Troubleshooting

### Counts Not Updating
```sql
-- Manually recalculate all counts
UPDATE public.profiles p
SET 
  followers_count = (SELECT COUNT(*) FROM public.follows WHERE following_id = p.id AND status = 'accepted'),
  following_count = (SELECT COUNT(*) FROM public.follows WHERE follower_id = p.id AND status = 'accepted');
```

### Check Trigger Status
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name IN ('trigger_update_follow_counts', 'trigger_notify_on_follow');
```

### View Follow Relationships
```sql
-- See all relationships for a user
SELECT * FROM get_follow_status('user_id_here', 'target_id_here');
```

## Files Created

### Database
- `complete-follow-system-migration.sql` - Complete migration script

### Backend
- `app/api/follows/route.ts` - Main follow operations
- `app/api/follows/requests/route.ts` - Request management
- `app/api/follows/status/route.ts` - Status checks
- `lib/supabase-server.ts` - Server-side Supabase client

### Frontend
- `hooks/use-follow.ts` - Follow management hook
- `hooks/use-toast.ts` - Toast notification hook
- `components/profile/follow-button.tsx` - Follow button component
- `components/profile/followers-list.tsx` - Followers/following list
- `components/profile/follow-requests.tsx` - Pending requests manager

### Documentation
- `FOLLOW_SYSTEM_IMPLEMENTATION.md` - This file

## Support

For issues or questions:
1. Check database trigger logs
2. Verify RLS policies are active
3. Confirm environment variables are set
4. Review browser console for API errors
5. Check Supabase logs for backend errors
