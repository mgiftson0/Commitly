-- Enhanced Group Goals Schema
-- Adds support for assigned_members array and member acceptance logic

-- Add assigned_members column to goal_activities if not exists
ALTER TABLE goal_activities ADD COLUMN IF NOT EXISTS assigned_members UUID[] DEFAULT '{}';

-- Add created_at column to group_goal_members if not exists
ALTER TABLE group_goal_members ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add activity_type variations
ALTER TABLE goal_activities DROP CONSTRAINT IF EXISTS goal_activities_activity_type_check;
ALTER TABLE goal_activities ADD CONSTRAINT goal_activities_activity_type_check 
  CHECK (activity_type IN ('individual', 'collaborative', 'multi_member'));

-- Create function to check if all members have responded
CREATE OR REPLACE FUNCTION check_all_members_responded(p_goal_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 
    FROM group_goal_members 
    WHERE goal_id = p_goal_id 
    AND status = 'pending'
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to get accepted member IDs
CREATE OR REPLACE FUNCTION get_accepted_member_ids(p_goal_id UUID)
RETURNS UUID[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT user_id 
    FROM group_goal_members 
    WHERE goal_id = p_goal_id 
    AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to reassign declined member activities
CREATE OR REPLACE FUNCTION reassign_declined_member_activities()
RETURNS TRIGGER AS $$
DECLARE
  v_accepted_members UUID[];
  v_activity RECORD;
BEGIN
  -- Only process when status changes to declined
  IF NEW.status = 'declined' AND OLD.status != 'declined' THEN
    -- Get all accepted members for this goal
    v_accepted_members := get_accepted_member_ids(NEW.goal_id);
    
    -- Update activities assigned to this declined member
    -- Reassign to all accepted members if there are any
    IF array_length(v_accepted_members, 1) > 0 THEN
      UPDATE goal_activities
      SET 
        assigned_members = CASE
          -- If only assigned to declining member, reassign to all accepted
          WHEN assigned_members = ARRAY[NEW.user_id] THEN v_accepted_members
          -- If assigned to multiple including declining member, remove declining member
          WHEN NEW.user_id = ANY(assigned_members) THEN 
            array_remove(assigned_members, NEW.user_id)
          ELSE assigned_members
        END,
        assigned_to = CASE
          -- If individually assigned to declining member, clear it
          WHEN assigned_to = NEW.user_id THEN NULL
          ELSE assigned_to
        END,
        assigned_to_all = CASE
          -- If newly reassigned to all accepted members, mark as assigned_to_all
          WHEN assigned_members = ARRAY[NEW.user_id] THEN TRUE
          ELSE assigned_to_all
        END
      WHERE goal_id = NEW.goal_id
      AND (assigned_to = NEW.user_id OR NEW.user_id = ANY(assigned_members));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for activity reassignment on member decline
DROP TRIGGER IF EXISTS reassign_on_decline_trigger ON group_goal_members;
CREATE TRIGGER reassign_on_decline_trigger
  AFTER UPDATE ON group_goal_members
  FOR EACH ROW
  WHEN (NEW.status = 'declined' AND OLD.status != 'declined')
  EXECUTE FUNCTION reassign_declined_member_activities();

-- Add index for assigned_members array
CREATE INDEX IF NOT EXISTS idx_goal_activities_assigned_members 
  ON goal_activities USING GIN (assigned_members);

-- Add comments
COMMENT ON COLUMN goal_activities.assigned_members IS 'Array of user IDs assigned to this activity';
COMMENT ON FUNCTION check_all_members_responded(UUID) IS 'Check if all group members have responded to invitation';
COMMENT ON FUNCTION get_accepted_member_ids(UUID) IS 'Get array of accepted member user IDs for a goal';
COMMENT ON FUNCTION reassign_declined_member_activities() IS 'Automatically reassign activities when a member declines';
