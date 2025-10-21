# Goal System Validation & Business Logic Blueprint

## Overview
This document serves as the technical blueprint for implementing the goal creation and management system with proper validation rules, business logic, and data structures.

## Goal Creation Validation Rules

### Required Fields (Cannot be empty/null)
1. **Title** - Goal title (string, min 1 char, max 200 chars)
2. **Description** - Goal description (string, min 1 char, max 1000 chars)
3. **Goal Nature** - Personal or Group (enum: "personal" | "group")
4. **Category** - Goal category (enum: predefined categories)
5. **Goal Type** - Single or Multi-activity (enum: "single-activity" | "multi-activity")
6. **Schedule Type** - Date or Recurring (enum: "date" | "recurring")

### Optional Fields
1. **Accountability Partners** - Array of partner IDs (max 2 for personal goals)
2. **Group Members** - Array of member IDs (max 5 total including owner for group goals)

### Conditional Required Fields
1. **Single Activity** - Required when goal_type = "single-activity"
2. **Activities Array** - Required when goal_type = "multi-activity" (min 2 activities)
3. **Due Date** - Required when schedule_type = "date"
4. **Recurrence Pattern** - Required when schedule_type = "recurring"
5. **Recurrence Days** - Required when recurrence_pattern = "custom"

## Visibility Logic

### Visibility Options
- **Private**: Only the goal owner can see
- **Partners Only**: Only accountability partners/group members can see
- **Public**: Everyone can see

### Visibility Validation Rules
- All visibility options are always available regardless of partner selection
- If "Partners Only" is selected but no partners exist, the goal is effectively private
- No validation dependency between visibility and accountability partners

## Goal Nature Business Logic

### Personal Goals
- Owner: Single user
- Accountability Partners: 0-2 optional partners
- Group Members: N/A
- Visibility: All options available
- Activities: Can be assigned to owner only

### Group Goals
- Owner: Automatically included as first member
- Group Members: Owner + up to 4 additional members (max 5 total)
- Accountability Partners: N/A (group members serve this role)
- Visibility: All options available
- Activities: Can be assigned to specific members or all members

## Schedule System

### Date-based Goals
- Have a specific due date
- Streak = 0 (no streak tracking for one-time goals)
- Progress tracked as completion percentage
- Can be single or multi-activity

### Recurring Goals
- Have recurrence pattern (daily, weekly, monthly, custom)
- Streak tracking enabled
- Progress tracked as streak + completion rate
- Can be single or multi-activity

## Data Structures

### Goal Object
```typescript
interface Goal {
  id: string
  userId: string // Goal owner
  title: string // Required
  description: string // Required
  goalNature: "personal" | "group" // Required
  goalType: "single-activity" | "multi-activity" // Required
  category: string // Required (from predefined list)
  visibility: "private" | "restricted" | "public" // Required
  scheduleType: "date" | "recurring" // Required
  
  // Conditional fields
  dueDate?: string // Required if scheduleType = "date"
  recurrencePattern?: "daily" | "weekly" | "monthly" | "custom" // Required if scheduleType = "recurring"
  recurrenceDays?: string[] // Required if recurrencePattern = "custom"
  
  // Activities
  activities: Activity[] // Required for multi-activity, single item for single-activity
  
  // Relationships
  accountabilityPartners: Partner[] // Optional, max 2 for personal goals
  groupMembers: Member[] // Required for group goals, max 5 including owner
  
  // Status
  status: "active" | "paused" | "completed"
  progress: number // 0-100
  streak: number // 0 for date-based goals
  
  // Timestamps
  createdAt: string
  updatedAt: string
  completedAt?: string
}
```

### Activity Object
```typescript
interface Activity {
  id: string
  goalId: string
  title: string // Required
  description?: string
  orderIndex: number
  isCompleted: boolean
  assignedMembers?: string[] // For group goals
  completedAt?: string
  createdAt: string
  updatedAt: string
}
```

### Partner/Member Object
```typescript
interface Partner {
  id: string
  name: string
  username?: string
  avatar?: string
}

interface Member extends Partner {
  role?: "owner" | "member"
}
```

## Validation Functions

### Frontend Validation
```typescript
function validateGoalCreation(goalData: Partial<Goal>): ValidationResult {
  const errors: string[] = []
  
  // Required fields
  if (!goalData.title?.trim()) errors.push("Title is required")
  if (!goalData.description?.trim()) errors.push("Description is required")
  if (!goalData.goalNature) errors.push("Goal nature is required")
  if (!goalData.category) errors.push("Category is required")
  if (!goalData.goalType) errors.push("Goal type is required")
  if (!goalData.scheduleType) errors.push("Schedule type is required")
  
  // Conditional validation
  if (goalData.goalType === "single-activity" && !goalData.singleActivity?.trim()) {
    errors.push("Activity is required for single-activity goals")
  }
  
  if (goalData.goalType === "multi-activity") {
    const validActivities = goalData.activities?.filter(a => a.trim()) || []
    if (validActivities.length < 2) {
      errors.push("At least 2 activities required for multi-activity goals")
    }
  }
  
  if (goalData.scheduleType === "date" && !goalData.dueDate) {
    errors.push("Due date is required for date-based goals")
  }
  
  if (goalData.scheduleType === "recurring") {
    if (!goalData.recurrencePattern) {
      errors.push("Recurrence pattern is required")
    }
    if (goalData.recurrencePattern === "custom" && (!goalData.recurrenceDays || goalData.recurrenceDays.length === 0)) {
      errors.push("At least one day must be selected for custom recurrence")
    }
  }
  
  // Partner limits
  if (goalData.goalNature === "personal" && goalData.accountabilityPartners && goalData.accountabilityPartners.length > 2) {
    errors.push("Maximum 2 accountability partners allowed")
  }
  
  if (goalData.goalNature === "group" && goalData.groupMembers && goalData.groupMembers.length > 5) {
    errors.push("Maximum 5 group members allowed")
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
```

## Business Rules

### Edit Restrictions
- Goals can be fully edited within 5 hours of creation
- After 5 hours, only progress updates allowed (activity completion, notes)
- Completed goals cannot be edited

### Streak Calculation
- Only applies to recurring goals
- Date-based goals always have streak = 0
- Streak increments on successful daily completion
- Streak resets if a day is missed (based on recurrence pattern)

### Progress Calculation
- Single-activity: 0% (not started) or 100% (completed)
- Multi-activity: (completed_activities / total_activities) * 100
- Recurring: Based on streak and completion rate over time period

### Encouragement System
- Only visible when accountability partners exist
- Partners can leave encouragement notes
- Goal owner receives notifications for new encouragement
- Encouragement history is preserved

### Visibility Enforcement
- Private: Only owner can view/edit
- Partners Only: Owner + accountability partners/group members can view
- Public: Everyone can view, only owner/members can edit

## API Endpoints (Backend Implementation)

### Goal Management
```
POST /api/goals - Create new goal
GET /api/goals - List user's goals
GET /api/goals/:id - Get goal details
PUT /api/goals/:id - Update goal (with edit window validation)
DELETE /api/goals/:id - Delete goal
POST /api/goals/:id/complete - Mark goal as complete
POST /api/goals/:id/suspend - Pause/resume goal
```

### Activity Management
```
PUT /api/goals/:id/activities/:activityId - Toggle activity completion
POST /api/goals/:id/activities - Add new activity (within edit window)
DELETE /api/goals/:id/activities/:activityId - Remove activity (within edit window)
```

### Social Features
```
POST /api/goals/:id/encouragement - Add encouragement note
GET /api/goals/:id/encouragement - Get encouragement history
POST /api/goals/:id/fork - Fork public goal
```

## Database Schema

### Goals Table
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  goal_nature goal_nature_enum NOT NULL,
  goal_type goal_type_enum NOT NULL,
  category VARCHAR(50) NOT NULL,
  visibility visibility_enum NOT NULL DEFAULT 'private',
  schedule_type schedule_type_enum NOT NULL,
  due_date DATE,
  recurrence_pattern recurrence_pattern_enum,
  recurrence_days TEXT[], -- JSON array of day names
  status goal_status_enum NOT NULL DEFAULT 'active',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  streak INTEGER DEFAULT 0 CHECK (streak >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

### Activities Table
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  assigned_members UUID[], -- Array of user IDs for group goals
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Goal Members Table (for group goals)
```sql
CREATE TABLE goal_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role member_role_enum DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(goal_id, user_id)
);
```

### Accountability Partners Table
```sql
CREATE TABLE accountability_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status partner_status_enum DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(goal_id, partner_id)
);
```

### Encouragement Table
```sql
CREATE TABLE encouragement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Enums

```sql
CREATE TYPE goal_nature_enum AS ENUM ('personal', 'group');
CREATE TYPE goal_type_enum AS ENUM ('single-activity', 'multi-activity');
CREATE TYPE visibility_enum AS ENUM ('private', 'restricted', 'public');
CREATE TYPE schedule_type_enum AS ENUM ('date', 'recurring');
CREATE TYPE recurrence_pattern_enum AS ENUM ('daily', 'weekly', 'monthly', 'custom');
CREATE TYPE goal_status_enum AS ENUM ('active', 'paused', 'completed');
CREATE TYPE member_role_enum AS ENUM ('owner', 'member');
CREATE TYPE partner_status_enum AS ENUM ('pending', 'accepted', 'declined');
```

## Row Level Security (RLS) Policies

### Goals Table Policies
```sql
-- Users can view their own goals
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (user_id = auth.uid());

-- Users can view public goals
CREATE POLICY "Users can view public goals" ON goals
  FOR SELECT USING (visibility = 'public');

-- Partners can view restricted goals
CREATE POLICY "Partners can view restricted goals" ON goals
  FOR SELECT USING (
    visibility = 'restricted' AND (
      id IN (
        SELECT goal_id FROM accountability_partners 
        WHERE partner_id = auth.uid() AND status = 'accepted'
      ) OR
      id IN (
        SELECT goal_id FROM goal_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Users can insert their own goals
CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own goals
CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own goals
CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (user_id = auth.uid());
```

## Implementation Checklist

### Frontend Updates ✅
- [x] Remove accountability partner dependency from visibility validation
- [x] Make description, category, and goal nature required fields
- [x] Keep accountability partners optional
- [x] Hide encouragement section when no partners exist
- [x] Update form validation logic

### Backend Implementation (TODO)
- [ ] Create database schema with proper constraints
- [ ] Implement RLS policies for data security
- [ ] Create API endpoints with validation
- [ ] Add business logic for edit restrictions
- [ ] Implement streak calculation logic
- [ ] Add encouragement system
- [ ] Create notification system
- [ ] Add goal forking functionality

### Testing Requirements
- [ ] Unit tests for validation functions
- [ ] Integration tests for API endpoints
- [ ] E2E tests for goal creation flow
- [ ] Security tests for RLS policies
- [ ] Performance tests for large datasets

## Error Handling

### Client-Side Errors
- Form validation errors with specific field feedback
- Network connectivity issues
- Permission denied scenarios
- Data consistency errors

### Server-Side Errors
- Database constraint violations
- Authentication/authorization failures
- Business rule violations
- Rate limiting and abuse prevention

## Performance Considerations

### Database Optimization
- Indexes on frequently queried fields (user_id, goal_id, status)
- Pagination for goal lists
- Efficient queries for dashboard data
- Caching for public goal data

### Frontend Optimization
- Lazy loading for goal details
- Optimistic updates for activity completion
- Debounced search and filtering
- Efficient re-rendering with React optimization

This blueprint serves as the complete technical specification for implementing a robust goal management system with proper validation, security, and scalability considerations.