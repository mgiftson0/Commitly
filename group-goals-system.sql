-- ============================================
-- GROUP GOALS SYSTEM WITH ACTIVITY ASSIGNMENTS
-- Comprehensive implementation for collaborative goals
-- ============================================
--
-- PREREQUISITES:
-- 1. Base schema must be applied first (schema.sql)
-- 2. Required tables: goals, activities, auth.users
-- 3. If you get column errors, ensure base schema is complete
--
-- INSTALLATION:
-- Run this script AFTER the base schema is in place
-- ============================================

-- Add group goal support to goals table
ALTER TABLE public.goals 
ADD COLUMN IF NOT EXISTS is_group_goal BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS group_goal_status TEXT DEFAULT 'active' CHECK (group_goal_status IN ('active', 'pending', 'cancelled', 'completed'));

-- Create group_goal_members table (enhanced goal_members)
CREATE TABLE IF NOT EXISTS public.group_goal_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  can_edit BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT unique_group_goal_member UNIQUE(goal_id, user_id)
);

-- Create group_goal_invitations table for tracking invites
CREATE TABLE IF NOT EXISTS public.group_goal_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  
  CONSTRAINT unique_group_invitation UNIQUE(goal_id, invitee_id)
);

-- Enhanced goal_activities table with assignment support
ALTER TABLE public.goal_activities 
ADD COLUMN IF NOT EXISTS assigned_to_all BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS activity_type TEXT DEFAULT 'individual' CHECK (activity_type IN ('individual', 'collaborative'));

-- Create activity_completions table for per-member tracking
CREATE TABLE IF NOT EXISTS public.activity_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.goal_activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  
  CONSTRAINT unique_activity_completion UNIQUE(activity_id, user_id)
);

-- Create activity_notifications table for member notifications
CREATE TABLE IF NOT EXISTS public.activity_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.goal_activities(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  completed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notified_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('member_completed', 'all_completed', 'activity_assigned')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_activity_notification UNIQUE(activity_id, completed_by, notified_user)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_goal_members_goal_id ON public.group_goal_members(goal_id);
CREATE INDEX IF NOT EXISTS idx_group_goal_members_user_id ON public.group_goal_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_goal_members_status ON public.group_goal_members(status);

CREATE INDEX IF NOT EXISTS idx_group_goal_invitations_goal_id ON public.group_goal_invitations(goal_id);
CREATE INDEX IF NOT EXISTS idx_group_goal_invitations_invitee_id ON public.group_goal_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_group_goal_invitations_status ON public.group_goal_invitations(status);

CREATE INDEX IF NOT EXISTS idx_goal_activities_assigned_to_all ON public.goal_activities(assigned_to_all);
CREATE INDEX IF NOT EXISTS idx_activity_completions_activity_id ON public.activity_completions(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_completions_user_id ON public.activity_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_notifications_notified_user ON public.activity_notifications(notified_user, is_read);

-- Enable RLS
ALTER TABLE public.group_goal_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_goal_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_notifications ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies for goal_activities should already exist from base schema
-- If not, add them manually  );

-- RLS Policies for group_goal_invitations
CREATE POLICY "invitations_select" ON public.group_goal_invitations
  FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "invitations_insert" ON public.group_goal_invitations
  FOR INSERT WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "invitations_update" ON public.group_goal_invitations
  FOR UPDATE USING (auth.uid() = invitee_id OR auth.uid() = inviter_id);

CREATE POLICY "invitations_delete" ON public.group_goal_invitations
  FOR DELETE USING (auth.uid() = inviter_id);

-- RLS Policies for activity_completions
CREATE POLICY "activity_completions_select" ON public.activity_completions
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.group_goal_members 
      WHERE goal_id = activity_completions.goal_id 
      AND user_id = auth.uid() 
      AND status = 'accepted'
    )
  );

CREATE POLICY "activity_completions_insert" ON public.activity_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "activity_completions_delete" ON public.activity_completions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for activity_notifications
CREATE POLICY "activity_notifications_select" ON public.activity_notifications
  FOR SELECT USING (auth.uid() = notified_user);

CREATE POLICY "activity_notifications_insert" ON public.activity_notifications
  FOR INSERT WITH CHECK (true); -- System can insert

CREATE POLICY "activity_notifications_update" ON public.activity_notifications
  FOR UPDATE USING (auth.uid() = notified_user);

-- ============================================
-- FUNCTIONS FOR GROUP GOAL LOGIC
-- ============================================

-- Function to handle group goal invitation acceptance
CREATE OR REPLACE FUNCTION handle_group_goal_invitation_response()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Add user to group_goal_members
    INSERT INTO public.group_goal_members (goal_id, user_id, role, status, responded_at)
    VALUES (NEW.goal_id, NEW.invitee_id, 'member', 'accepted', NOW())
    ON CONFLICT (goal_id, user_id) DO UPDATE SET status = 'accepted', responded_at = NOW();
    
    -- Notify goal owner
    INSERT INTO public.notifications (user_id, title, message, notification_type, related_goal_id, related_user_id)
    SELECT 
      g.user_id,
      'Group Goal Accepted',
      (SELECT COALESCE(p.first_name || ' ' || p.last_name, p.username) FROM public.profiles p WHERE p.id = NEW.invitee_id) || ' accepted your group goal invitation',
      'accountability_accepted',
      NEW.goal_id,
      NEW.invitee_id
    FROM public.goals g WHERE g.id = NEW.goal_id;
    
  ELSIF NEW.status = 'declined' AND OLD.status = 'pending' THEN
    -- Update member status to declined
    INSERT INTO public.group_goal_members (goal_id, user_id, role, status, responded_at)
    VALUES (NEW.goal_id, NEW.invitee_id, 'member', 'declined', NOW())
    ON CONFLICT (goal_id, user_id) DO UPDATE SET status = 'declined', responded_at = NOW();
    
    -- Notify goal owner
    INSERT INTO public.notifications (user_id, title, message, notification_type, related_goal_id, related_user_id)
    SELECT 
      g.user_id,
      'Group Goal Declined',
      (SELECT COALESCE(p.first_name || ' ' || p.last_name, p.username) FROM public.profiles p WHERE p.id = NEW.invitee_id) || ' declined your group goal invitation',
      'accountability_declined',
      NEW.goal_id,
      NEW.invitee_id
    FROM public.goals g WHERE g.id = NEW.goal_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify members when activity is completed
CREATE OR REPLACE FUNCTION notify_activity_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_activity RECORD;
  v_goal_id UUID;
  v_total_members INT;
  v_completed_count INT;
  v_user_name TEXT;
BEGIN
  -- Get activity details
  SELECT * INTO v_activity FROM public.goal_activities WHERE id = NEW.activity_id;
  v_goal_id := v_activity.goal_id;
  
  -- Get user name
  SELECT COALESCE(first_name || ' ' || last_name, username) INTO v_user_name 
  FROM public.profiles WHERE id = NEW.user_id;
  
  -- If activity is assigned to all members, check if all completed
  IF v_activity.assigned_to_all = TRUE THEN
    -- Count total accepted members
    SELECT COUNT(*) INTO v_total_members 
    FROM public.group_goal_members 
    WHERE goal_id = v_goal_id AND status = 'accepted';
    
    -- Count completed members
    SELECT COUNT(*) INTO v_completed_count 
    FROM public.activity_completions 
    WHERE activity_id = NEW.activity_id;
    
    -- Notify all other members about this completion
    INSERT INTO public.activity_notifications (activity_id, goal_id, completed_by, notified_user, notification_type)
    SELECT 
      NEW.activity_id,
      v_goal_id,
      NEW.user_id,
      gm.user_id,
      'member_completed'
    FROM public.group_goal_members gm
    WHERE gm.goal_id = v_goal_id 
      AND gm.status = 'accepted' 
      AND gm.user_id != NEW.user_id
    ON CONFLICT DO NOTHING;
    
    -- Create notifications for members
    INSERT INTO public.notifications (user_id, title, message, notification_type, related_goal_id, related_user_id)
    SELECT 
      gm.user_id,
      'Activity Completed',
      v_user_name || ' completed activity: ' || v_activity.title,
      'partner_completed',
      v_goal_id,
      NEW.user_id
    FROM public.group_goal_members gm
    WHERE gm.goal_id = v_goal_id 
      AND gm.status = 'accepted' 
      AND gm.user_id != NEW.user_id;
    
    -- If all members completed, mark activity as fully completed
    IF v_completed_count >= v_total_members THEN
      UPDATE public.goal_activities 
      SET completed = TRUE 
      WHERE id = NEW.activity_id;
      
      -- Notify all members that activity is fully completed
      INSERT INTO public.notifications (user_id, title, message, notification_type, related_goal_id)
      SELECT 
        gm.user_id,
        'Activity Fully Completed! 🎉',
        'All members completed: ' || v_activity.title,
        'goal_completed',
        v_goal_id
      FROM public.group_goal_members gm
      WHERE gm.goal_id = v_goal_id AND gm.status = 'accepted';
    END IF;
  ELSE
    -- Individual activity - mark as completed immediately
    UPDATE public.goal_activities 
    SET completed = TRUE 
    WHERE id = NEW.activity_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER group_goal_invitation_response_trigger
  AFTER UPDATE ON public.group_goal_invitations
  FOR EACH ROW
  WHEN (NEW.status != OLD.status)
  EXECUTE FUNCTION handle_group_goal_invitation_response();

CREATE TRIGGER activity_completion_notification_trigger
  AFTER INSERT ON public.activity_completions
  FOR EACH ROW
  EXECUTE FUNCTION notify_activity_completion();

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View for group goal progress
-- Uses goal_activities table with completed column
CREATE OR REPLACE VIEW group_goal_progress AS
SELECT 
  g.id AS goal_id,
  g.title,
  g.user_id AS owner_id,
  COUNT(DISTINCT gm.user_id) FILTER (WHERE gm.status = 'accepted') AS accepted_members,
  COUNT(DISTINCT gm.user_id) FILTER (WHERE gm.status = 'pending') AS pending_members,
  COUNT(DISTINCT gm.user_id) FILTER (WHERE gm.status = 'declined') AS declined_members,
  COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN a.id END) AS total_activities,
  COUNT(DISTINCT CASE WHEN a.id IS NOT NULL AND a.completed = TRUE THEN a.id END) AS completed_activities,
  CASE 
    WHEN COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN a.id END) > 0 
    THEN ROUND((COUNT(DISTINCT CASE WHEN a.id IS NOT NULL AND a.completed = TRUE THEN a.id END)::NUMERIC / 
                COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN a.id END)) * 100)
    ELSE 0 
  END AS progress_percentage
FROM public.goals g
LEFT JOIN public.group_goal_members gm ON g.id = gm.goal_id
LEFT JOIN public.goal_activities a ON g.id = a.goal_id
WHERE g.is_group_goal = TRUE
GROUP BY g.id, g.title, g.user_id;

COMMENT ON VIEW group_goal_progress IS 'Aggregated progress view for group goals';

-- ============================================
-- SETUP COMPLETE
-- ============================================

SELECT 'Group goals system created successfully!' AS status;
