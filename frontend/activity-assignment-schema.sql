-- Add activity assignment columns
ALTER TABLE goal_activities ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id);
ALTER TABLE goal_activities ADD COLUMN IF NOT EXISTS assigned_to_all BOOLEAN DEFAULT FALSE;