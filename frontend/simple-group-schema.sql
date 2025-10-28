-- Simple Group Goals Schema without RLS for testing

-- Add group goal columns to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS is_group_goal BOOLEAN DEFAULT FALSE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS group_goal_status TEXT DEFAULT 'active';

-- Group goal members table (simple version)
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

-- Disable RLS for testing
ALTER TABLE group_goal_members DISABLE ROW LEVEL SECURITY;