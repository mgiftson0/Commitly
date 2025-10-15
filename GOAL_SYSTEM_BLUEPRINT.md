# Goal System Blueprint for Backend Implementation

## Goal Creation Requirements

### Required Fields (All marked with *)
- **title**: string (required, non-empty)
- **description**: string (required, non-empty) 
- **goalNature**: 'personal' | 'group' (required)
- **category**: string (required, from predefined list)
- **goalType**: 'single-activity' | 'multi-activity' (required)
- **scheduleType**: 'date' | 'recurring' (required)
- **visibility**: 'private' | 'restricted' | 'public' (required)

### Conditional Required Fields
- **singleActivity**: string (required if goalType === 'single-activity')
- **activities**: string[] (required if goalType === 'multi-activity', minimum 2 items)
- **singleDate**: ISO date string (required if scheduleType === 'date', must be present or future)
- **recurrencePattern**: 'daily' | 'weekly' | 'monthly' | 'custom' (required if scheduleType === 'recurring')
- **recurrenceDays**: string[] (required if recurrencePattern === 'custom', minimum 1 day)

### Optional Fields
- **accountabilityPartners**: Partner[] (optional, can be empty array)
- **groupMembers**: Member[] (optional for group goals)

### Validation Rules

#### Goal Type Validation
```typescript
if (goalType === 'single-activity') {
  // Must have singleActivity field
  if (!singleActivity || singleActivity.trim() === '') {
    throw new Error('Activity is required for single-activity goals')
  }
}

if (goalType === 'multi-activity') {
  // Must have at least 2 activities
  const validActivities = activities.filter(a => a.trim() !== '')
  if (validActivities.length < 2) {
    throw new Error('Multi-activity goals must have at least 2 activities')
  }
}
```

#### Schedule Validation
```typescript
if (scheduleType === 'date') {
  // Must have future or present date
  if (!singleDate) {
    throw new Error('Date is required for date-based goals')
  }
  
  const selectedDate = new Date(singleDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (selectedDate < today) {
    throw new Error('Goal date must be present or future')
  }
}

if (scheduleType === 'recurring') {
  if (!recurrencePattern) {
    throw new Error('Recurrence pattern is required for recurring goals')
  }
  
  if (recurrencePattern === 'custom') {
    if (!recurrenceDays || recurrenceDays.length === 0) {
      throw new Error('At least one day must be selected for custom recurrence')
    }
  }
}
```

#### Visibility Validation
```typescript
if (visibility === 'restricted') {
  // Can only be restricted if there are accountability partners
  if (!accountabilityPartners || accountabilityPartners.length === 0) {
    throw new Error('Cannot set visibility to "Partners Only" without accountability partners')
  }
}
```

## Data Structure

### Goal Object
```typescript
interface Goal {
  id: string
  userId: string
  title: string
  description: string
  goalNature: 'personal' | 'group'
  category: string
  type: 'single-activity' | 'multi-activity'
  scheduleType: 'date' | 'recurring'
  visibility: 'private' | 'restricted' | 'public'
  
  // Schedule fields
  dueDate?: string | null // ISO date string if scheduleType === 'date'
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'custom' | null
  recurrenceDays?: string[] | null // ['monday', 'tuesday', etc.] if custom
  
  // Activities
  activities: string[] // Single item for single-activity, multiple for multi-activity
  
  // Relationships
  accountabilityPartners: Partner[]
  groupMembers: Member[] // For group goals
  
  // Status
  status: 'active' | 'paused' | 'completed'
  progress: number // 0-100
  streak: number // Only for recurring goals, 0 for date-based goals
  totalCompletions: number
  
  // Timestamps
  createdAt: string // ISO string
  updatedAt: string // ISO string
  completedAt?: string | null // ISO string when completed
}
```

### Partner Object
```typescript
interface Partner {
  id: string
  name: string
  avatar?: string
}
```

### Member Object (for group goals)
```typescript
interface Member {
  id: string
  name: string
  avatar?: string
  role?: 'creator' | 'member'
}
```

## Business Logic Rules

### Streak Calculation
- **Date-based goals**: Always streak = 0 (no streak tracking)
- **Recurring goals**: Track consecutive completions based on recurrence pattern

### Progress Calculation
- **Single-activity**: 0% (not started) or 100% (completed)
- **Multi-activity**: (completed_activities / total_activities) * 100

### Encouragement Notes
- Only show encouragement features if `accountabilityPartners.length > 0`
- Hide encouragement button/section for goals without partners

### Edit Restrictions
- Goals can only be edited within 5 hours of creation
- After 5 hours, only progress updates allowed (activity completion, goal completion, pause/resume)

## API Endpoints Structure

### POST /api/goals
```typescript
// Request body validation
{
  title: string (required, min 1 char)
  description: string (required, min 1 char)
  goalNature: 'personal' | 'group' (required)
  category: string (required)
  goalType: 'single-activity' | 'multi-activity' (required)
  scheduleType: 'date' | 'recurring' (required)
  visibility: 'private' | 'restricted' | 'public' (required)
  
  // Conditional fields based on goalType
  singleActivity?: string
  activities?: string[]
  
  // Conditional fields based on scheduleType
  singleDate?: string
  recurrencePattern?: string
  recurrenceDays?: string[]
  
  // Optional fields
  accountabilityPartners?: Partner[]
  groupMembers?: Member[]
}
```

### PUT /api/goals/:id
```typescript
// Only allowed within 5 hours of creation
// Same validation as POST
```

### PATCH /api/goals/:id/progress
```typescript
// Always allowed - for progress updates
{
  activityCompletions?: { activityIndex: number, completed: boolean }[]
  goalCompleted?: boolean
  status?: 'active' | 'paused'
}
```

## Database Schema Considerations

### Goals Table
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  goal_nature VARCHAR(20) NOT NULL CHECK (goal_nature IN ('personal', 'group')),
  category VARCHAR(100) NOT NULL,
  goal_type VARCHAR(20) NOT NULL CHECK (goal_type IN ('single-activity', 'multi-activity')),
  schedule_type VARCHAR(20) NOT NULL CHECK (schedule_type IN ('date', 'recurring')),
  visibility VARCHAR(20) NOT NULL CHECK (visibility IN ('private', 'restricted', 'public')),
  
  due_date DATE NULL,
  recurrence_pattern VARCHAR(20) NULL,
  recurrence_days JSONB NULL,
  
  activities JSONB NOT NULL,
  accountability_partners JSONB NOT NULL DEFAULT '[]',
  group_members JSONB NOT NULL DEFAULT '[]',
  
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  progress INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  total_completions INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE NULL
);
```

### Indexes
```sql
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_created_at ON goals(created_at);
CREATE INDEX idx_goals_category ON goals(category);
```

## Frontend-Backend Data Flow

### Goal Creation Flow
1. Frontend validates required fields
2. Frontend sends POST request with all goal data
3. Backend validates data structure and business rules
4. Backend creates goal record
5. Backend returns created goal with generated ID
6. Frontend redirects to goals list page

### Goal Update Flow
1. Frontend checks if goal is within 5-hour edit window
2. If yes: Allow full edit, send PUT request
3. If no: Only allow progress updates, send PATCH request
4. Backend validates edit permissions and data
5. Backend updates goal record
6. Backend returns updated goal

This blueprint provides the complete structure for implementing the goal system backend while maintaining consistency with the frontend implementation.