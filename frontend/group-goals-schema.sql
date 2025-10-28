-- Group Goals Database Schema

-- Add group goal columns to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS is_group_goal BOOLEAN DEFAULT FALSE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS group_goal_status TEXT DEFAULT 'active' CHECK (group_goal_status IN ('pending', 'active', 'completed', 'cancelled'));

-- Group goal invitations table
CREATE TABLE IF NOT EXISTS group_goal_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(goal_id, invitee_id)
);

-- Group goal members table
CREATE TABLE IF NOT EXISTS group_goal_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member', 'viewer')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  can_edit BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(goal_id, user_id)
);

-- Update goal_activities to support assignment
ALTER TABLE goal_activities ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id);
ALTER TABLE goal_activities ADD COLUMN IF NOT EXISTS assigned_to_all BOOLEAN DEFAULT FALSE;
ALTER TABLE goal_activities ADD COLUMN IF NOT EXISTS activity_type TEXT DEFAULT 'individual' CHECK (activity_type IN ('individual', 'collaborative'));

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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_goal_invitations_invitee ON group_goal_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_group_goal_invitations_goal ON group_goal_invitations(goal_id);
CREATE INDEX IF NOT EXISTS idx_group_goal_members_goal ON group_goal_members(goal_id);
CREATE INDEX IF NOT EXISTS idx_group_goal_members_user ON group_goal_members(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_completions_activity ON activity_completions(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_completions_user ON activity_completions(user_id);

-- RLS Policies
ALTER TABLE group_goal_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_goal_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_completions ENABLE ROW LEVEL SECURITY;

-- Group goal invitations policies
CREATE POLICY "Users can view their invitations" ON group_goal_invitations
  FOR SELECT USING (invitee_id = auth.uid() OR inviter_id = auth.uid());

CREATE POLICY "Users can send invitations for their goals" ON group_goal_invitations
  FOR INSERT WITH CHECK (
    inviter_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM goals WHERE id = goal_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update their received invitations" ON group_goal_invitations
  FOR UPDATE USING (invitee_id = auth.uid());

-- Group goal members policies
CREATE POLICY "Users can view members of accessible goals" ON group_goal_members
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM goals WHERE id = goal_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM group_goal_members gm WHERE gm.goal_id = group_goal_members.goal_id AND gm.user_id = auth.uid())
  );

CREATE POLICY "Goal owners can manage members" ON group_goal_members
  FOR ALL USING (EXISTS (SELECT 1 FROM goals WHERE id = goal_id AND user_id = auth.uid()));

CREATE POLICY "Users can join groups they're invited to" ON group_goal_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Activity completions policies
CREATE POLICY "Users can view completions for accessible activities" ON activity_completions
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM goals WHERE id = goal_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM group_goal_members WHERE goal_id = activity_completions.goal_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can complete assigned activities" ON activity_completions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    (EXISTS (
      SELECT 1 FROM goal_activities 
      WHERE id = activity_id AND (assigned_to_all = true OR assigned_to = auth.uid())
    ) OR EXISTS (
      SELECT 1 FROM goals WHERE id = goal_id AND user_id = auth.uid()
    ))
  );