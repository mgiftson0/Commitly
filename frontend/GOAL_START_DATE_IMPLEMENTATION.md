# Goal Start Date Implementation

## Overview
This implementation adds comprehensive start date functionality to goals with proper status management and edit restrictions.

## Key Features

### 1. Start Date Management
- **Specific Date Goals**: Have both start date and end date (goal active during this period)
- **Recurring Goals**: Have start date and optional end date with recurrence pattern
- **Maximum Future Date**: Start dates cannot be more than 2 months in the future
- **Automatic Status**: Goals with future start dates automatically get `pending` status

### 2. Goal Status System
- **pending**: Goal has future start date, not yet active
- **active**: Goal is currently active and can be updated
- **paused**: Goal is temporarily suspended
- **completed**: Goal is finished

### 3. Edit Restrictions
- **Pending Goals**: Can edit until 5 hours before start date
- **Active Goals**: Can edit within 5 hours of creation
- **Completed Goals**: Cannot edit
- **Update vs Edit**: Updates (activity completion) only allowed after start date

### 4. Database Schema
```sql
-- New columns added to goals table
start_date DATE                 -- When goal becomes active
schedule_type VARCHAR(20)       -- 'date' or 'recurring'
recurrence_pattern VARCHAR(20)  -- 'daily', 'weekly', 'monthly', 'custom'
recurrence_days TEXT[]          -- Days for custom recurrence
end_condition VARCHAR(30)       -- 'ongoing', 'by-date', 'after-completions'
target_completions INTEGER      -- Number of completions needed
```

### 5. Automatic Status Updates
- Database trigger automatically sets status based on start_date
- Function `activate_pending_goals()` can be called daily to activate goals
- Status changes: pending → active when start date arrives

## Implementation Details

### Frontend Changes
1. **Goal Creation**: Added start date fields with validation
2. **Goal Update**: Restricted updates for pending goals
3. **Goal Edit**: Time-based restrictions based on status
4. **UI Indicators**: Pending status badges and colors
5. **Status Management**: Utility functions for status checks

### Database Changes
1. **Schema Migration**: Added new columns with proper indexes
2. **Triggers**: Automatic status management
3. **Functions**: Batch activation of pending goals
4. **Constraints**: Data validation at database level

### Status Logic
```typescript
// Pending status determination
const isPending = startDate > today || status === 'pending'

// Edit permission for pending goals
const canEdit = Date.now() <= (startDate - 5_hours)

// Update permission
const canUpdate = !isPending && status !== 'completed'
```

## Usage Examples

### Creating Goals
```typescript
// Specific date goal (active from start to end date)
{
  schedule_type: 'date',
  start_date: '2024-01-15',  // When goal becomes active
  target_date: '2024-01-25'  // When goal ends
}

// Recurring goal with future start
{
  schedule_type: 'recurring',
  start_date: '2024-01-20',
  recurrence_pattern: 'daily',
  end_condition: 'by-date',
  target_date: '2024-03-20'
}
```

### Status Transitions
1. **Creation**: Goal created with future start_date → status = 'pending'
2. **Activation**: Start date arrives → status = 'active' (via trigger/cron)
3. **Completion**: All activities done → status = 'completed'
4. **Suspension**: User pauses → status = 'paused'

## Files Modified

### Core Implementation
- `app/goals/create/page.tsx` - Added start date fields and validation
- `app/goals/[id]/update/page.tsx` - Pending goal restrictions
- `app/goals/page.tsx` - Pending status handling
- `lib/goal-status-manager.ts` - Status utility functions

### Database
- `lib/database/goal-start-date-migration.sql` - Schema changes
- Database triggers for automatic status management

### UI Updates
- Profile pages updated to show pending status
- Goal cards show appropriate status indicators
- Edit/update restrictions enforced in UI

## Validation Rules
1. Start date ≤ 2 months from today
2. End date ≥ start date (for recurring goals)
3. Edit allowed until 5 hours before start (pending) or 5 hours after creation (active)
4. Updates only allowed after start date
5. Delete allowed within 24 hours of creation

## Cron Job Recommendation
Set up daily cron job to activate pending goals:
```sql
SELECT activate_pending_goals();
```

This ensures goals automatically become active on their start date without manual intervention.