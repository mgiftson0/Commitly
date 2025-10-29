-- Complete Group Goals Schema with activity assignments

-- Add group goal columns to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS is_group_goal BOOLEAN DEFAULT FALSE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS group_goal_status TEXT DEFAULT 'active';

-- Group goal members table
CREATE TABLE IF NOT EXISTS group_goal_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'pending',
  can_edit BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(goal_id, user_id)
);

-- Add activity assignment columns
ALTER TABLE goal_activities ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id);
ALTER TABLE goal_activities ADD COLUMN IF NOT EXISTS assigned_to_all BOOLEAN DEFAULT FALSE;

-- Activity completions for group goals
CREATE TABLE IF NOT EXISTS activity_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES goal_activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(activity_id, user_id)
);

-- Disable RLS for testing
ALTER TABLE group_goal_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_completions DISABLE ROW LEVEL SECURITY;