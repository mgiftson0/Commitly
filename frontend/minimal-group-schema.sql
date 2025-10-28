-- Minimal Group Goals Schema (run only missing parts)

-- Add group goal columns to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS is_group_goal BOOLEAN DEFAULT FALSE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS group_goal_status TEXT DEFAULT 'active';

-- Group goal invitations table (only if not exists)
CREATE TABLE IF NOT EXISTS group_goal_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(goal_id, invitee_id)
);

-- Group goal members table (only if not exists)
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

-- Enable RLS
ALTER TABLE group_goal_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_goal_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop existing if they exist)
DROP POLICY IF EXISTS "Users can view their invitations" ON group_goal_invitations;
CREATE POLICY "Users can view their invitations" ON group_goal_invitations
  FOR SELECT USING (invitee_id = auth.uid() OR inviter_id = auth.uid());

DROP POLICY IF EXISTS "Users can view group members" ON group_goal_members;
CREATE POLICY "Users can view group members" ON group_goal_members
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM goals WHERE id = goal_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert group members" ON group_goal_members;
CREATE POLICY "Users can insert group members" ON group_goal_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view activity completions" ON activity_completions;
CREATE POLICY "Users can view activity completions" ON activity_completions
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM goals WHERE id = goal_id AND user_id = auth.uid())
  );