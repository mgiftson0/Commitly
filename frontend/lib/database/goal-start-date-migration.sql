-- Add start_date and related columns to goals table
ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS schedule_type VARCHAR(20) DEFAULT 'date',
ADD COLUMN IF NOT EXISTS recurrence_pattern VARCHAR(20),
ADD COLUMN IF NOT EXISTS recurrence_days TEXT[],
ADD COLUMN IF NOT EXISTS end_condition VARCHAR(30),
ADD COLUMN IF NOT EXISTS target_completions INTEGER;

-- Update existing goals to have start_date as created_at date for backward compatibility
UPDATE goals 
SET start_date = DATE(created_at)
WHERE start_date IS NULL;

-- Create function to automatically update goal status based on start_date
CREATE OR REPLACE FUNCTION update_goal_status_on_start_date()
RETURNS TRIGGER AS $$
BEGIN
  -- If start_date is in the future, set status to pending
  IF NEW.start_date > CURRENT_DATE THEN
    NEW.status = 'pending';
  -- If start_date is today or past and status is pending, set to active
  ELSIF NEW.start_date <= CURRENT_DATE AND NEW.status = 'pending' THEN
    NEW.status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update status when start_date changes
DROP TRIGGER IF EXISTS trigger_update_goal_status ON goals;
CREATE TRIGGER trigger_update_goal_status
  BEFORE INSERT OR UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_status_on_start_date();

-- Create function to activate pending goals daily (to be run by cron job)
CREATE OR REPLACE FUNCTION activate_pending_goals()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE goals 
  SET status = 'active', updated_at = NOW()
  WHERE status = 'pending' 
    AND start_date <= CURRENT_DATE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Add index for better performance on start_date queries
CREATE INDEX IF NOT EXISTS idx_goals_start_date ON goals(start_date);
CREATE INDEX IF NOT EXISTS idx_goals_status_start_date ON goals(status, start_date);

-- Add comments for documentation
COMMENT ON COLUMN goals.start_date IS 'Date when the goal should become active (for both specific date and recurring goals)';
COMMENT ON COLUMN goals.target_date IS 'End date for specific date goals, or end date for recurring goals with by-date condition';
COMMENT ON COLUMN goals.schedule_type IS 'Type of schedule: date (specific period) or recurring (repeating pattern)';
COMMENT ON COLUMN goals.recurrence_pattern IS 'Pattern for recurring goals: daily, weekly, monthly, custom';
COMMENT ON COLUMN goals.recurrence_days IS 'Array of days for custom recurrence pattern';
COMMENT ON COLUMN goals.end_condition IS 'How the recurring goal should end: ongoing, by-date, after-completions';
COMMENT ON COLUMN goals.target_completions IS 'Number of completions needed for after-completions end condition';