-- =====================================================
-- COMPREHENSIVE STREAK SYSTEM FOR ALL GOAL TYPES
-- =====================================================

-- 1. GOAL STREAKS TABLE
-- Tracks streaks for all goal types
CREATE TABLE IF NOT EXISTS public.goal_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Core streak data
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_completions INT DEFAULT 0,
  
  -- Timestamps
  last_completed_at TIMESTAMPTZ,
  last_broken_at TIMESTAMPTZ,
  streak_started_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Configuration
  grace_hours INT DEFAULT 2, -- Grace period after expected time
  freeze_uses_remaining INT DEFAULT 1, -- Recovery power-up
  
  -- Multi-step specific
  work_days_count INT DEFAULT 0, -- For multi-step: count activities completed
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one streak per user per goal
  UNIQUE(goal_id, user_id)
);

-- 2. ACTIVITY COMPLETION LOGS
-- Audit trail of all completions
CREATE TABLE IF NOT EXISTS public.goal_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_id UUID, -- For multi-step goals, reference to specific activity
  
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_date DATE GENERATED ALWAYS AS (DATE(completed_at AT TIME ZONE 'UTC')) STORED,
  
  -- Metadata
  was_late BOOLEAN DEFAULT FALSE, -- Completed after grace period
  used_freeze BOOLEAN DEFAULT FALSE, -- Used streak freeze power-up
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate completions on same day for same goal
  UNIQUE(goal_id, user_id, completed_date)
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_goal_streaks_goal_id ON public.goal_streaks(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_streaks_user_id ON public.goal_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_activity_logs_goal_id ON public.goal_activity_logs(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_activity_logs_user_id ON public.goal_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_activity_logs_completed_date ON public.goal_activity_logs(completed_date);

-- 4. UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_goal_streaks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_update_goal_streaks_updated_at 
  BEFORE UPDATE ON public.goal_streaks 
  FOR EACH ROW EXECUTE FUNCTION update_goal_streaks_updated_at();

-- 5. ROW LEVEL SECURITY
ALTER TABLE public.goal_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goal_streaks
CREATE POLICY "Users can view their own streaks" ON public.goal_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" ON public.goal_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" ON public.goal_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for goal_activity_logs
CREATE POLICY "Users can view their own activity logs" ON public.goal_activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs" ON public.goal_activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Partners can view each other's logs on shared goals
CREATE POLICY "Partners can view shared goal activity logs" ON public.goal_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.goal_partners
      WHERE goal_id = goal_activity_logs.goal_id
      AND (user_id = auth.uid() OR partner_id = auth.uid())
    )
  );

-- 6. STREAK CALCULATION FUNCTION
-- Determines if streak should continue or break
CREATE OR REPLACE FUNCTION calculate_streak_status(
  p_goal_id UUID,
  p_user_id UUID,
  p_goal_type TEXT,
  p_frequency TEXT DEFAULT 'daily'
)
RETURNS TABLE (
  should_continue BOOLEAN,
  new_streak_value INT,
  status TEXT
) AS $$
DECLARE
  v_streak RECORD;
  v_hours_since_last NUMERIC;
  v_expected_hours NUMERIC;
BEGIN
  -- Get current streak data
  SELECT * INTO v_streak 
  FROM goal_streaks 
  WHERE goal_id = p_goal_id AND user_id = p_user_id;
  
  -- If no streak record exists, this is first completion
  IF v_streak IS NULL THEN
    RETURN QUERY SELECT TRUE, 1, 'first_completion'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate hours since last completion
  v_hours_since_last := EXTRACT(EPOCH FROM (NOW() - v_streak.last_completed_at)) / 3600;
  
  -- Determine expected interval based on goal type and frequency
  IF p_goal_type = 'recurring' THEN
    CASE p_frequency
      WHEN 'daily' THEN v_expected_hours := 24;
      WHEN 'weekly' THEN v_expected_hours := 168; -- 7 days
      WHEN 'monthly' THEN v_expected_hours := 720; -- 30 days
      ELSE v_expected_hours := 24;
    END CASE;
  ELSIF p_goal_type = 'multi' THEN
    -- Multi-step goals: work days count, no time constraint between activities
    RETURN QUERY SELECT TRUE, v_streak.work_days_count + 1, 'work_day_added'::TEXT;
    RETURN;
  ELSE
    -- Single goals: no streak tracking
    RETURN QUERY SELECT TRUE, 1, 'single_goal'::TEXT;
    RETURN;
  END IF;
  
  -- Check if within grace period
  IF v_hours_since_last <= (v_expected_hours + v_streak.grace_hours) THEN
    RETURN QUERY SELECT TRUE, v_streak.current_streak + 1, 'continued'::TEXT;
  -- Check if freeze available
  ELSIF v_hours_since_last <= (v_expected_hours + 48) AND v_streak.freeze_uses_remaining > 0 THEN
    RETURN QUERY SELECT TRUE, v_streak.current_streak, 'freeze_available'::TEXT;
  ELSE
    -- Streak broken
    RETURN QUERY SELECT FALSE, 1, 'broken'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. VALIDATE MUTUAL ACCOUNTABILITY WITH TRIGGER
-- Use trigger instead of CHECK constraint (PostgreSQL doesn't allow subqueries in CHECK)
CREATE OR REPLACE FUNCTION validate_mutual_partnership()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip validation if same user (shouldn't happen but safe)
  IF NEW.requester_id = NEW.partner_id THEN
    RETURN NEW;
  END IF;
  
  -- Check if users are mutual accountability partners
  IF NOT EXISTS (
    SELECT 1 FROM public.accountability_partners
    WHERE user_id = NEW.requester_id 
    AND partner_id = NEW.partner_id 
    AND status = 'accepted'
  ) OR NOT EXISTS (
    SELECT 1 FROM public.accountability_partners
    WHERE user_id = NEW.partner_id 
    AND partner_id = NEW.requester_id 
    AND status = 'accepted'
  ) THEN
    RAISE EXCEPTION 'Users must be mutual accountability partners to share goals'
      USING ERRCODE = '23514'; -- check_violation error code
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS trigger_validate_mutual_partnership ON public.goal_partner_requests;

-- Create trigger on INSERT
CREATE TRIGGER trigger_validate_mutual_partnership
  BEFORE INSERT ON public.goal_partner_requests
  FOR EACH ROW
  EXECUTE FUNCTION validate_mutual_partnership();

-- 8. HELPER FUNCTION: Check if users are mutual accountability partners
CREATE OR REPLACE FUNCTION are_mutual_partners(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.accountability_partners
    WHERE user_id = user1_id 
    AND partner_id = user2_id 
    AND status = 'accepted'
  ) AND EXISTS (
    SELECT 1 FROM public.accountability_partners
    WHERE user_id = user2_id 
    AND partner_id = user1_id 
    AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql;

-- 9. GROUP GOAL STREAK LOGIC
-- Each partner maintains their own independent streak on shared goals
-- This is already handled by the UNIQUE constraint on goal_streaks (goal_id, user_id)
-- When partner completes an activity, only their streak updates

-- Add helper view to see all streaks on a goal
CREATE OR REPLACE VIEW goal_streaks_leaderboard AS
SELECT 
  gs.goal_id,
  g.title as goal_title,
  gs.user_id,
  p.username,
  p.first_name,
  p.last_name,
  gs.current_streak,
  gs.longest_streak,
  gs.total_completions,
  gs.work_days_count,
  gs.last_completed_at,
  RANK() OVER (PARTITION BY gs.goal_id ORDER BY gs.current_streak DESC) as streak_rank
FROM goal_streaks gs
JOIN goals g ON g.id = gs.goal_id
JOIN profiles p ON p.id = gs.user_id
WHERE gs.current_streak > 0
ORDER BY gs.goal_id, gs.current_streak DESC;

-- 10. STATISTICS VIEW
CREATE OR REPLACE VIEW user_streak_stats AS
SELECT 
  user_id,
  COUNT(DISTINCT goal_id) as active_goals_with_streaks,
  SUM(current_streak) as total_current_streaks,
  MAX(current_streak) as best_current_streak,
  MAX(longest_streak) as personal_best_streak,
  SUM(total_completions) as lifetime_completions,
  AVG(current_streak) as average_streak
FROM goal_streaks
WHERE current_streak > 0
GROUP BY user_id;

-- 11. NOTIFICATION TRIGGER FOR STREAK MILESTONES
CREATE OR REPLACE FUNCTION notify_streak_milestone()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify on milestone streaks (7, 14, 30, 100 days)
  IF NEW.current_streak IN (7, 14, 30, 100) THEN
    INSERT INTO notifications (user_id, title, message, type, data)
    VALUES (
      NEW.user_id,
      '🔥 Streak Milestone!',
      format('You hit a %s-day streak! Keep it going!', NEW.current_streak),
      'streak_milestone',
      jsonb_build_object(
        'goal_id', NEW.goal_id,
        'streak_days', NEW.current_streak
      )
    );
  END IF;
  
  -- Notify on new longest streak
  IF NEW.current_streak > NEW.longest_streak THEN
    INSERT INTO notifications (user_id, title, message, type, data)
    VALUES (
      NEW.user_id,
      '🏆 New Personal Best!',
      format('New longest streak: %s days!', NEW.current_streak),
      'personal_best',
      jsonb_build_object(
        'goal_id', NEW.goal_id,
        'streak_days', NEW.current_streak
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_streak_milestone
  AFTER UPDATE ON goal_streaks
  FOR EACH ROW
  WHEN (NEW.current_streak > OLD.current_streak)
  EXECUTE FUNCTION notify_streak_milestone();

-- 12. COMMENTS
COMMENT ON TABLE goal_streaks IS 'Tracks streak progress for all goal types: recurring (consecutive days), multi-step (work days count), single (no streak)';
COMMENT ON TABLE goal_activity_logs IS 'Audit trail of all goal completions with timestamps and metadata';
COMMENT ON COLUMN goal_streaks.work_days_count IS 'For multi-step goals: counts number of activities completed (not consecutive days)';
COMMENT ON COLUMN goal_streaks.freeze_uses_remaining IS 'Recovery power-up: can save streak once per period';
COMMENT ON FUNCTION calculate_streak_status IS 'Determines if completing an activity continues or breaks streak based on goal type';
COMMENT ON FUNCTION are_mutual_partners IS 'Checks if two users are mutual accountability partners (both following each other)';
COMMENT ON FUNCTION validate_mutual_partnership IS 'TRIGGER function: Validates users are mutual accountability partners before allowing goal partner requests';
