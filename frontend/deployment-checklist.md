# Seasonal Goals System - Deployment Checklist

## Database Migration Steps

### 1. Execute Schema Migration
```sql
-- Run seasonal-goals-schema.sql in Supabase SQL Editor
-- This creates all necessary tables and columns
```

### 2. Seed Template Data
```sql
-- Run lib/seasonal-templates-seed.sql in Supabase SQL Editor
-- This populates the seasonal_goal_templates table
```

### 3. Set Row Level Security Policies
```sql
-- Add RLS policies for new tables
ALTER TABLE seasonal_goal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_cohort_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_milestones ENABLE ROW LEVEL SECURITY;

-- Templates are public read
CREATE POLICY "Templates are publicly readable" ON seasonal_goal_templates FOR SELECT USING (true);

-- Cohorts policies
CREATE POLICY "Public cohorts are readable" ON seasonal_cohorts FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create cohorts" ON seasonal_cohorts FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Cohort members policies
CREATE POLICY "Users can view cohort members" ON seasonal_cohort_members FOR SELECT USING (true);
CREATE POLICY "Users can join cohorts" ON seasonal_cohort_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Milestones policies
CREATE POLICY "Users can view their milestones" ON seasonal_milestones 
FOR SELECT USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_id AND goals.user_id = auth.uid()));
CREATE POLICY "Users can manage their milestones" ON seasonal_milestones 
FOR ALL USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_id AND goals.user_id = auth.uid()));
```

## Environment Configuration

### 1. Feature Flags (Optional)
```env
NEXT_PUBLIC_SEASONAL_GOALS_ENABLED=true
NEXT_PUBLIC_COHORTS_ENABLED=true
NEXT_PUBLIC_CREATION_WINDOW_OVERRIDE=false  # For testing only
```

### 2. Supabase Configuration
- Ensure all API endpoints have proper CORS settings
- Verify authentication is working correctly
- Test database connection and queries

## Testing Checklist

### 1. Creation Window Logic
- [ ] Test creation between Dec 15 - Jan 15 (should work)
- [ ] Test creation outside window (should be blocked)
- [ ] Verify error messages display correctly

### 2. Goal Creation Flow
- [ ] Template selection works
- [ ] Milestone creation/editing works
- [ ] Cohort joining works
- [ ] Form validation works
- [ ] Database saves correctly

### 3. Milestone Tracking
- [ ] Milestones load correctly
- [ ] Toggle completion works
- [ ] Progress calculation is accurate
- [ ] UI updates in real-time

### 4. Cohort System
- [ ] Cohort browsing works
- [ ] Member count updates correctly
- [ ] Capacity limits enforced
- [ ] Join/leave functionality works

### 5. Analytics Dashboard
- [ ] Stats load correctly
- [ ] Charts display properly
- [ ] Data refreshes appropriately

## Performance Considerations

### 1. Database Indexes
```sql
-- Already included in schema
CREATE INDEX IF NOT EXISTS idx_goals_seasonal ON public.goals(is_seasonal, duration_type, seasonal_year);
CREATE INDEX IF NOT EXISTS idx_seasonal_cohorts_period ON public.seasonal_cohorts(duration_type, year, quarter);
```

### 2. Query Optimization
- Use proper SELECT statements (avoid SELECT *)
- Implement pagination for large datasets
- Cache template data on client side

### 3. Loading States
- All components have loading states
- Error boundaries implemented
- Graceful degradation for failed requests

## Monitoring & Analytics

### 1. Key Metrics to Track
- Seasonal goal creation rate
- Completion rates by duration type
- Cohort participation rates
- Template usage statistics
- Creation window utilization

### 2. Error Monitoring
- API endpoint errors
- Database query failures
- Client-side JavaScript errors
- Authentication issues

## Rollback Plan

### 1. Database Rollback
```sql
-- If needed, remove new columns
ALTER TABLE goals DROP COLUMN IF EXISTS duration_type;
ALTER TABLE goals DROP COLUMN IF EXISTS seasonal_year;
-- etc.

-- Drop new tables
DROP TABLE IF EXISTS seasonal_milestones;
DROP TABLE IF EXISTS seasonal_cohort_members;
DROP TABLE IF EXISTS seasonal_cohorts;
DROP TABLE IF EXISTS seasonal_goal_templates;
```

### 2. Code Rollback
- Revert to previous commit
- Remove seasonal-specific routes
- Update navigation to exclude seasonal links

## Success Criteria

### 1. Technical
- [ ] All API endpoints respond correctly
- [ ] Database queries execute efficiently
- [ ] UI components render properly
- [ ] No console errors or warnings

### 2. Functional
- [ ] Users can create seasonal goals during window
- [ ] Milestone tracking works accurately
- [ ] Cohort system enables community participation
- [ ] Analytics provide meaningful insights

### 3. Performance
- [ ] Page load times < 2 seconds
- [ ] API response times < 500ms
- [ ] Database queries < 100ms
- [ ] No memory leaks or performance degradation

## Post-Deployment Tasks

### 1. User Communication
- Announce seasonal goals feature
- Provide tutorial/onboarding
- Share creation window dates
- Highlight community benefits

### 2. Data Collection
- Monitor usage patterns
- Collect user feedback
- Track completion rates
- Analyze popular templates

### 3. Iterative Improvements
- Refine templates based on usage
- Optimize cohort matching
- Enhance analytics dashboard
- Add requested features