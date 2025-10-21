# Goal System Updated Blueprint

## Recent Changes Summary

### 1. Merged View and Edit Functionality
- **Combined Pages**: Goal detail view and edit are now in one page using tabs
- **Tab Structure**: "View Details" and "Update Goal" tabs
- **Removed Restriction**: No more 5-hour edit window limitation
- **Real-time Updates**: Changes save immediately to localStorage and reflect in goal preview

### 2. Goal Completion Flow
- **Completion Status**: When goal is marked complete, `completedAt` timestamp is saved
- **Status Update**: Goal status changes to 'completed' in localStorage
- **UI Reflection**: Completed badge shows in goal preview and detail view
- **Persistence**: Completion state persists across page refreshes

### 3. Updated Page Structure

#### View Details Tab
```tsx
- Goal Title Card (with badges for status)
- Activity Tracking Interface (based on goal type)
  - Multi-activity: Checkbox list with progress bar
  - Single-activity: Complete button with celebration UI
- Encouragement Section (only if accountability partners exist)
- Sidebar with goal details, partners, and actions
```

#### Update Goal Tab
```tsx
- Edit Form Card
  - Title input (required)
  - Description textarea (required)
  - Visibility select (always available)
  - Activities inputs (for multi-activity goals)
  - Save Changes button
- Quick Actions Sidebar
  - Delete Goal button
```

## Data Flow Updates

### Goal Completion Process
```typescript
const completeGoal = async () => {
  // 1. Update local state
  const completedGoal = { ...goal, completed_at: new Date().toISOString() }
  setGoal(completedGoal)
  
  // 2. Update localStorage
  const goals = JSON.parse(localStorage.getItem('goals') || '[]')
  const goalIndex = goals.findIndex(g => g.id === goalId)
  goals[goalIndex].completedAt = completedGoal.completed_at
  goals[goalIndex].status = 'completed'
  localStorage.setItem('goals', JSON.stringify(goals))
  
  // 3. Show success feedback
  toast.success("🎉 Goal completed! Great job!")
}
```

### Goal Update Process
```typescript
const saveGoalUpdates = async () => {
  // 1. Validate required fields
  if (!editTitle.trim()) return
  
  // 2. Update localStorage
  const goals = JSON.parse(localStorage.getItem('goals') || '[]')
  const goalIndex = goals.findIndex(g => g.id === goalId)
  goals[goalIndex].title = editTitle
  goals[goalIndex].description = editDescription
  goals[goalIndex].visibility = editVisibility
  goals[goalIndex].updatedAt = new Date().toISOString()
  
  // 3. Update activities for multi-activity goals
  if (goal?.goal_type === 'multi') {
    goals[goalIndex].activities = editActivities.filter(a => a.trim()).map((title, index) => ({
      title: title.trim(),
      completed: activities[index]?.is_completed || false
    }))
  }
  
  localStorage.setItem('goals', JSON.stringify(goals))
  
  // 4. Reload data and show feedback
  await loadGoalData()
  toast.success("Goal updated successfully!")
}
```

## UI Component Structure

### Tab Navigation
```tsx
<Tabs defaultValue="details">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="details">View Details</TabsTrigger>
    <TabsTrigger value="update">Update Goal</TabsTrigger>
  </TabsList>
  
  <TabsContent value="details">
    {/* View interface */}
  </TabsContent>
  
  <TabsContent value="update">
    {/* Edit interface */}
  </TabsContent>
</Tabs>
```

### Goal Status Badges
```tsx
<div className="flex flex-wrap items-center gap-2">
  <Badge variant="outline">{goal.goal_type}</Badge>
  {isGroupGoal && <Badge variant="outline">Group</Badge>}
  {goal.is_suspended && <Badge variant="destructive">Paused</Badge>}
  {goal.completed_at && <Badge className="bg-green-600">Completed</Badge>}
</div>
```

### Activity Tracking Interface
```tsx
// Multi-activity goals
{activities.map((activity) => (
  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
    <Checkbox
      checked={activity.is_completed}
      onCheckedChange={() => toggleActivity(activity.id, activity.is_completed)}
    />
    <div className="flex-1">
      <p className={activity.is_completed ? "line-through text-muted-foreground" : ""}>
        {activity.title}
      </p>
    </div>
    {activity.is_completed && <CheckCircle2 className="h-4 w-4 text-green-600" />}
  </div>
))}

// Single-activity goals
{goal.completed_at ? (
  <div className="text-center py-8">
    <div className="text-5xl">🎉</div>
    <p className="font-semibold text-green-700">Goal Completed!</p>
    <p className="text-sm text-muted-foreground">
      Completed on {new Date(goal.completed_at).toLocaleDateString()}
    </p>
  </div>
) : (
  <Button onClick={completeGoal} className="w-full" size="lg">
    <CheckCircle2 className="h-5 w-5 mr-2" />
    Mark as Complete
  </Button>
)}
```

## Validation Rules (Updated)

### Goal Update Validation
```typescript
// Required fields for updates
- title: string (min 1 char, cannot be empty)
- description: string (can be empty in updates)
- visibility: "private" | "restricted" | "public"

// Optional fields
- activities: string[] (for multi-activity goals only)

// Validation logic
const isValidUpdate = editTitle.trim().length > 0
```

### Edit Restrictions Removed
- ~~No more 5-hour edit window~~
- Goals can be updated at any time (except completed goals)
- Only restriction: Cannot edit completed goals
- All fields remain editable throughout goal lifecycle

## localStorage Data Structure (Updated)

### Goal Object in Storage
```typescript
interface StoredGoal {
  id: string
  userId: string
  title: string
  description: string
  type: "single-activity" | "multi-activity"
  visibility: "private" | "restricted" | "public"
  status: "active" | "paused" | "completed" // Updated on completion
  
  // Timestamps
  createdAt: string
  updatedAt: string // Updated on each edit
  completedAt: string | null // Set when goal completed
  
  // Activities
  activities: Array<{
    title: string
    completed: boolean
    completedAt?: string
  }>
  
  // Relationships
  accountabilityPartners: Array<{
    id: string
    name: string
    avatar?: string
  }>
  
  // Schedule
  scheduleType: "date" | "recurring"
  dueDate?: string
  recurrencePattern?: string
}
```

## Backend Implementation Notes

### API Endpoints (Future)
```typescript
// Goal management
PUT /api/goals/:id - Update goal (no time restrictions)
POST /api/goals/:id/complete - Mark goal as complete
GET /api/goals/:id - Get goal with completion status

// Activity management  
PUT /api/goals/:id/activities/:activityId - Toggle activity completion
PUT /api/goals/:id/activities - Bulk update activities

// Status tracking
GET /api/goals/:id/status - Get current goal status
PUT /api/goals/:id/status - Update goal status (active/paused/completed)
```

### Database Schema Updates
```sql
-- Add completion tracking
ALTER TABLE goals ADD COLUMN completed_at TIMESTAMPTZ;
ALTER TABLE goals ADD COLUMN status goal_status_enum DEFAULT 'active';

-- Update goal status enum
CREATE TYPE goal_status_enum AS ENUM ('active', 'paused', 'completed');

-- Add indexes for performance
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_completed_at ON goals(completed_at);
CREATE INDEX idx_goals_user_status ON goals(user_id, status);
```

### Business Logic Updates
```typescript
// Goal completion rules
- Single-activity goals: Mark complete immediately
- Multi-activity goals: Auto-complete when all activities done
- Completed goals: Cannot be edited (only viewed)
- Completion triggers: Notifications, streak updates, achievement checks

// Edit permissions
- Goal owner: Can always edit (except completed goals)
- Group members: Can edit group goals (except completed)
- Accountability partners: View-only access
- Public goals: View-only for non-owners
```

## Testing Scenarios

### Goal Completion Flow
1. **Single Activity**: Click "Mark as Complete" → Goal shows completed badge
2. **Multi Activity**: Complete all activities → Auto-completion option appears
3. **Persistence**: Refresh page → Completion status maintained
4. **Goal List**: Navigate to goals list → Completed badge visible

### Goal Update Flow
1. **Edit Title**: Change title → Save → Title updates in view tab
2. **Edit Description**: Modify description → Save → Description updates
3. **Change Visibility**: Switch visibility → Save → New visibility reflected
4. **Update Activities**: Modify activity names → Save → Activities updated
5. **Validation**: Try empty title → Save disabled

### Data Persistence
1. **localStorage Sync**: All changes immediately saved to localStorage
2. **Page Refresh**: All data persists across refreshes
3. **Navigation**: Changes visible when navigating between pages
4. **Goal List**: Updates reflected in goal preview cards

## Performance Considerations

### Optimizations
- **Lazy Loading**: Edit form only renders when Update tab is active
- **Debounced Saves**: Prevent excessive localStorage writes
- **Optimistic Updates**: UI updates immediately, then syncs to storage
- **Efficient Re-renders**: Use React.memo for expensive components

### Memory Management
- **State Cleanup**: Clear edit states when component unmounts
- **Event Listeners**: Properly remove event listeners
- **localStorage Limits**: Monitor storage usage for large goal lists

This updated blueprint reflects the current implementation with merged view/edit functionality, removed edit restrictions, and proper goal completion tracking.