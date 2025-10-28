# Quick Start: Group Goals System

## 🚀 Setup (One-Time)

### 1. Run Database Migration
```sql
-- Execute in Supabase SQL Editor:
-- File: group-goals-system.sql
```

### 2. Verify Installation
Check that these tables exist in your database:
- `group_goal_members`
- `group_goal_invitations`
- `activity_completions`
- `activity_notifications`

## 📋 Usage Examples

### Display Pending Invitations
```tsx
import { GroupGoalInvitations } from '@/components/group-goals'

// In your dashboard or goals page
<GroupGoalInvitations />
```

### Show Group Goal Details
```tsx
import { GroupGoalDetail } from '@/components/group-goals'

<GroupGoalDetail goalId={goalId} />
```

### Create a Group Goal (Programmatic)
```typescript
import { createGroupGoal } from '@/lib/group-goals'

const result = await createGroupGoal(
  {
    title: "Team Challenge",
    description: "Complete together",
    goal_type: "multi-activity",
    category: "fitness",
    visibility: "restricted"
  },
  [memberId1, memberId2] // Array of user IDs to invite
)
```

## 🎯 Key Workflows

### For Goal Owners

1. **Create Group Goal** → System sends invitations
2. **Assign Activities**:
   - To specific user: Select member from dropdown
   - To all members: Select "All Members" option
3. **Track Progress**: View per-member completion in Progress tab
4. **Manage Members**: See accepted, pending, and declined members

### For Group Members

1. **Receive Invitation** → Notification appears
2. **Accept/Decline** → Click button in invitation card
3. **View Assigned Activities** → See only your assignments
4. **Complete Activities** → Mark complete when done
5. **Get Notified** → When other members complete activities

## 🔔 Notification Flow

```
Owner creates goal
    ↓
Members receive invitation notification
    ↓
Member accepts/declines
    ↓
Owner receives response notification
    ↓
Owner assigns activity to member(s)
    ↓
Assigned members receive notification
    ↓
Member completes activity
    ↓
All group members receive completion notification
    ↓
(For collaborative activities)
When all members complete → Full completion notification
```

## 🎨 UI Features

### Encouragement Messages (Chat Style)
- Modern chat interface
- Pre-written support messages
- Click to send encouragement
- No scrollbar, clean design

### Activity Cards
- Visual assignment badges
- Progress bars for collaborative activities
- Completion status indicators
- Member avatars

### Member Management
- Accepted members (green)
- Pending invitations (yellow)
- Declined members (red, owner-only)

## 🔐 Permissions

| Action | Owner | Assigned Member | Other Members |
|--------|-------|-----------------|---------------|
| Create goal | ✅ | ❌ | ❌ |
| Invite members | ✅ | ❌ | ❌ |
| Assign activities | ✅ | ❌ | ❌ |
| Complete own activity | ✅ | ✅ | ❌ |
| View progress | ✅ | ✅ | ✅ |
| View declined members | ✅ | ❌ | ❌ |

## 🐛 Troubleshooting

**Invitation not showing?**
- Check notifications table
- Verify user_id is correct
- Ensure RLS policies are enabled

**Can't complete activity?**
- Verify you're assigned to it
- Check if already completed
- Ensure you're an accepted member

**Progress not updating?**
- Refresh the page
- Check activity_completions table
- Verify database triggers are active

## 📊 Example: Complete Workflow

```typescript
// 1. Owner creates group goal
const { goal } = await createGroupGoal(
  { title: "30-Day Fitness", ... },
  [user1, user2, user3]
)

// 2. Members accept invitations
await acceptGroupGoalInvitation(invitationId)

// 3. Owner assigns activity to all
await assignActivity(activityId, { assignedToAll: true })

// 4. Each member completes
await completeActivity(activityId, goalId, "Done!")

// 5. Check progress
const { data } = await getGroupGoalProgress(goalId)
console.log(data.memberProgress)
// [
//   { user_id: '...', name: 'John', completed: 5, assigned: 10, progress: 50 },
//   { user_id: '...', name: 'Jane', completed: 8, assigned: 10, progress: 80 }
// ]
```

## ✅ Testing Checklist

- [ ] Create group goal with 2+ members
- [ ] Accept invitation as member
- [ ] Decline invitation as different member
- [ ] Assign activity to specific user
- [ ] Assign activity to all members
- [ ] Complete activity as assigned user
- [ ] Try to complete as non-assigned user (should fail)
- [ ] Complete collaborative activity with all members
- [ ] Verify all notifications sent
- [ ] Check progress tracking accuracy

## 🎓 Best Practices

1. **Keep groups small** (5-10 members) for better engagement
2. **Assign activities clearly** - specific users for accountability
3. **Use collaborative activities** for team bonding
4. **Send encouragement** when members lag behind
5. **Review declined members** to understand why
6. **Track progress regularly** to keep momentum

## 📞 Need Help?

Refer to `GROUP_GOALS_IMPLEMENTATION.md` for:
- Complete API documentation
- Database schema details
- Advanced use cases
- Security considerations
- Performance optimization tips
