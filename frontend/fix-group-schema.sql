-- Fix group goals schema - only add missing columns and tables

-- Check and add missing columns to goals table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'is_group_goal') THEN
        ALTER TABLE goals ADD COLUMN is_group_goal BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'group_goal_status') THEN
        ALTER TABLE goals ADD COLUMN group_goal_status TEXT DEFAULT 'active';
    END IF;
END $$;

-- Check and add missing columns to goal_activities table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goal_activities' AND column_name = 'assigned_to') THEN
        ALTER TABLE goal_activities ADD COLUMN assigned_to UUID REFERENCES profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goal_activities' AND column_name = 'assigned_to_all') THEN
        ALTER TABLE goal_activities ADD COLUMN assigned_to_all BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create group_goal_invitations table if it doesn't exist
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

-- Create activity_completions table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES goal_activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(activity_id, user_id)
);

-- Check and add missing columns to group_goal_members table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_goal_members') THEN
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'group_goal_members' AND column_name = 'invited_at') THEN
            ALTER TABLE group_goal_members ADD COLUMN invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'group_goal_members' AND column_name = 'responded_at') THEN
            ALTER TABLE group_goal_members ADD COLUMN responded_at TIMESTAMP WITH TIME ZONE;
        END IF;
        
        -- Rename joined_at to invited_at if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'group_goal_members' AND column_name = 'joined_at') 
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'group_goal_members' AND column_name = 'invited_at') THEN
            ALTER TABLE group_goal_members RENAME COLUMN joined_at TO invited_at;
        END IF;
    END IF;
END $$;

-- Disable RLS for testing (if tables exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_goal_members') THEN
        ALTER TABLE group_goal_members DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_goal_invitations') THEN
        ALTER TABLE group_goal_invitations DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_completions') THEN
        ALTER TABLE activity_completions DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;