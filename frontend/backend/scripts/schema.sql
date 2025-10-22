-- ============================================
-- COMMITLY DATABASE SCHEMA
-- Complete Supabase Setup Script
-- Version: 2.0
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- DROP EXISTING OBJECTS (for clean setup)
-- ============================================

DROP TRIGGER IF EXISTS update_streak_trigger ON public.goals CASCADE;
DROP TRIGGER IF EXISTS notify_partners_trigger ON public.goals CASCADE;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users CASCADE;
DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals CASCADE;
DROP TRIGGER IF EXISTS update_activities_updated_at ON public.activities CASCADE;
DROP TRIGGER IF EXISTS update_accountability_partners_updated_at ON public.accountability_partners CASCADE;
DROP TRIGGER IF EXISTS update_streaks_updated_at ON public.streaks CASCADE;

DROP FUNCTION IF EXISTS update_streak() CASCADE;
DROP FUNCTION IF EXISTS notify_accountability_partners() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

DROP TABLE IF EXISTS public.followers CASCADE;
DROP TABLE IF EXISTS public.goal_completions CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.milestones CASCADE;
DROP TABLE IF EXISTS public.streaks CASCADE;
DROP TABLE IF EXISTS public.accountability_partners CASCADE;
DROP TABLE IF EXISTS public.goal_members CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- TABLE DEFINITIONS
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  phone_number TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

COMMENT ON TABLE public.users IS 'User profiles extending Supabase authentication';

-- Goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('single', 'multi', 'recurring')),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'restricted')),
  category TEXT CHECK (category IN ('health', 'fitness', 'education', 'career', 'finance', 'personal', 'social', 'creative', 'other')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', 'custom')),
  recurrence_days TEXT[],
  default_time_allocation INTEGER,
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT title_not_empty CHECK (char_length(trim(title)) > 0),
  CONSTRAINT end_date_after_start CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT completed_requires_completed_at CHECK (
    (is_completed = FALSE AND completed_at IS NULL) OR
    (is_completed = TRUE AND completed_at IS NOT NULL)
  )
);

COMMENT ON TABLE public.goals IS 'User goals with various types and configurations';

-- Activities table (for multi-activity goals)
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT title_not_empty CHECK (char_length(trim(title)) > 0),
  CONSTRAINT completed_requires_completed_at CHECK (
    (is_completed = FALSE AND completed_at IS NULL) OR
    (is_completed = TRUE AND completed_at IS NOT NULL)
  )
);

COMMENT ON TABLE public.activities IS 'Individual activities within multi-activity goals';

-- Goal members table (for group goals)
CREATE TABLE public.goal_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member', 'viewer')),
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_goal_member UNIQUE(goal_id, user_id)
);

COMMENT ON TABLE public.goal_members IS 'Members of shared/group goals';

-- Accountability partners table
CREATE TABLE public.accountability_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,

  CONSTRAINT different_users CHECK (requester_id != partner_id),
  CONSTRAINT unique_accountability_request UNIQUE(requester_id, partner_id, goal_id)
);

COMMENT ON TABLE public.accountability_partners IS 'Accountability partner relationships for goals';

-- Streaks table
CREATE TABLE public.streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  total_completions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_goal_streak UNIQUE(goal_id, user_id),
  CONSTRAINT valid_streak_values CHECK (current_streak >= 0 AND longest_streak >= 0 AND total_completions >= 0),
  CONSTRAINT longest_streak_valid CHECK (longest_streak >= current_streak)
);

COMMENT ON TABLE public.streaks IS 'Streak tracking for recurring goals';

-- Milestones table
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('streak', 'completion', 'custom', 'first_goal', 'tenth_goal', 'month_streak', 'year_streak')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT title_not_empty CHECK (char_length(trim(title)) > 0)
);

COMMENT ON TABLE public.milestones IS 'Achievement milestones for users';

-- Notes table (encouragement and feedback)
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'encouragement' CHECK (note_type IN ('encouragement', 'feedback', 'reminder', 'update')),
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT content_not_empty CHECK (char_length(trim(content)) > 0)
);

COMMENT ON TABLE public.notes IS 'Notes, encouragement, and feedback on goals';

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'goal_created', 'goal_completed', 'goal_missed', 'goal_reminder',
    'accountability_request', 'accountability_accepted', 'accountability_declined',
    'partner_completed', 'partner_note', 'milestone_achieved',
    'streak_milestone', 'follower_new', 'system'
  )),
  related_goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  related_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  action_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT read_requires_read_at CHECK (
    (is_read = FALSE AND read_at IS NULL) OR
    (is_read = TRUE AND read_at IS NOT NULL)
  )
);

COMMENT ON TABLE public.notifications IS 'User notifications for various events';

-- Goal completions table (history)
CREATE TABLE public.goal_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  completion_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actual_time_spent INTEGER,
  notes TEXT,
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'struggling', 'difficult')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.goal_completions IS 'History of goal completions';

-- Followers table
CREATE TABLE public.followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT different_users CHECK (follower_id != following_id),
  CONSTRAINT unique_follow UNIQUE(follower_id, following_id)
);

COMMENT ON TABLE public.followers IS 'User follow relationships';

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_email ON public.users(email);

CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_user_completed ON public.goals(user_id, is_completed);
CREATE INDEX idx_goals_visibility ON public.goals(visibility);
CREATE INDEX idx_goals_category ON public.goals(category);
CREATE INDEX idx_goals_end_date ON public.goals(end_date) WHERE end_date IS NOT NULL;
CREATE INDEX idx_goals_created_at ON public.goals(created_at DESC);

CREATE INDEX idx_activities_goal_id ON public.activities(goal_id);
CREATE INDEX idx_activities_goal_order ON public.activities(goal_id, order_index);

CREATE INDEX idx_goal_members_goal_id ON public.goal_members(goal_id);
CREATE INDEX idx_goal_members_user_id ON public.goal_members(user_id);

CREATE INDEX idx_accountability_requester ON public.accountability_partners(requester_id);
CREATE INDEX idx_accountability_partner ON public.accountability_partners(partner_id);
CREATE INDEX idx_accountability_goal ON public.accountability_partners(goal_id);
CREATE INDEX idx_accountability_status ON public.accountability_partners(status);

CREATE INDEX idx_streaks_goal_id ON public.streaks(goal_id);
CREATE INDEX idx_streaks_user_id ON public.streaks(user_id);

CREATE INDEX idx_milestones_goal_id ON public.milestones(goal_id);
CREATE INDEX idx_milestones_user_id ON public.milestones(user_id);
CREATE INDEX idx_milestones_type ON public.milestones(milestone_type);

CREATE INDEX idx_notes_goal_id ON public.notes(goal_id);
CREATE INDEX idx_notes_author_id ON public.notes(author_id);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

CREATE INDEX idx_completions_goal_id ON public.goal_completions(goal_id);
CREATE INDEX idx_completions_user_id ON public.goal_completions(user_id);
CREATE INDEX idx_completions_date ON public.goal_completions(completion_date DESC);

CREATE INDEX idx_followers_follower_id ON public.followers(follower_id);
CREATE INDEX idx_followers_following_id ON public.followers(following_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accountability_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - USERS
-- ============================================

CREATE POLICY "users_select_all" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_delete_own" ON public.users FOR DELETE USING (auth.uid() = id);

-- ============================================
-- RLS POLICIES - GOALS
-- ============================================

CREATE POLICY "goals_select_own" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "goals_select_public" ON public.goals FOR SELECT USING (visibility = 'public');
CREATE POLICY "goals_select_restricted" ON public.goals FOR SELECT USING (
  visibility = 'restricted' AND EXISTS (
    SELECT 1 FROM public.accountability_partners
    WHERE goal_id = goals.id AND partner_id = auth.uid() AND status = 'accepted'
  )
);
CREATE POLICY "goals_select_member" ON public.goals FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.goal_members WHERE goal_id = goals.id AND user_id = auth.uid())
);
CREATE POLICY "goals_insert_own" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals_update_own" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "goals_delete_own" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - ACTIVITIES
-- ============================================

CREATE POLICY "activities_select_own" ON public.activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = activities.goal_id AND goals.user_id = auth.uid())
);
CREATE POLICY "activities_select_public" ON public.activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = activities.goal_id AND goals.visibility = 'public')
);
CREATE POLICY "activities_insert_own" ON public.activities FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_id AND goals.user_id = auth.uid())
);
CREATE POLICY "activities_update_own" ON public.activities FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = activities.goal_id AND goals.user_id = auth.uid())
);
CREATE POLICY "activities_delete_own" ON public.activities FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = activities.goal_id AND goals.user_id = auth.uid())
);

-- ============================================
-- RLS POLICIES - GOAL MEMBERS
-- ============================================

CREATE POLICY "goal_members_select" ON public.goal_members FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.goals WHERE goals.id = goal_members.goal_id AND
    (goals.user_id = auth.uid() OR goals.visibility = 'public')
  )
);
CREATE POLICY "goal_members_insert" ON public.goal_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_id AND goals.user_id = auth.uid())
);
CREATE POLICY "goal_members_update" ON public.goal_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_members.goal_id AND goals.user_id = auth.uid())
);
CREATE POLICY "goal_members_delete" ON public.goal_members FOR DELETE USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.goals WHERE goals.id = goal_members.goal_id AND goals.user_id = auth.uid()
  )
);

-- ============================================
-- RLS POLICIES - ACCOUNTABILITY PARTNERS
-- ============================================

CREATE POLICY "accountability_select" ON public.accountability_partners FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = partner_id);
CREATE POLICY "accountability_insert" ON public.accountability_partners FOR INSERT
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "accountability_update" ON public.accountability_partners FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = partner_id);
CREATE POLICY "accountability_delete" ON public.accountability_partners FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = partner_id);

-- ============================================
-- RLS POLICIES - STREAKS
-- ============================================

CREATE POLICY "streaks_select_own" ON public.streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "streaks_select_public" ON public.streaks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = streaks.goal_id AND goals.visibility = 'public')
);
CREATE POLICY "streaks_insert_system" ON public.streaks FOR INSERT WITH CHECK (true);
CREATE POLICY "streaks_update_system" ON public.streaks FOR UPDATE USING (true);
CREATE POLICY "streaks_delete_system" ON public.streaks FOR DELETE USING (true);

-- ============================================
-- RLS POLICIES - MILESTONES
-- ============================================

CREATE POLICY "milestones_select_own" ON public.milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "milestones_select_public" ON public.milestones FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = milestones.goal_id AND goals.visibility = 'public')
);
CREATE POLICY "milestones_insert_system" ON public.milestones FOR INSERT WITH CHECK (true);

-- ============================================
-- RLS POLICIES - NOTES
-- ============================================

CREATE POLICY "notes_select_own" ON public.notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = notes.goal_id AND goals.user_id = auth.uid())
);
CREATE POLICY "notes_select_public" ON public.notes FOR SELECT USING (
  NOT is_private AND EXISTS (SELECT 1 FROM public.goals WHERE goals.id = notes.goal_id AND goals.visibility = 'public')
);
CREATE POLICY "notes_select_partners" ON public.notes FOR SELECT USING (
  NOT is_private AND EXISTS (
    SELECT 1 FROM public.accountability_partners ap
    JOIN public.goals g ON g.id = ap.goal_id
    WHERE g.id = notes.goal_id AND ap.partner_id = auth.uid() AND ap.status = 'accepted'
  )
);
CREATE POLICY "notes_insert" ON public.notes FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "notes_update" ON public.notes FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "notes_delete" ON public.notes FOR DELETE USING (auth.uid() = author_id);

-- ============================================
-- RLS POLICIES - NOTIFICATIONS
-- ============================================

CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_system" ON public.notifications FOR INSERT WITH CHECK (true);

-- ============================================
-- RLS POLICIES - GOAL COMPLETIONS
-- ============================================

CREATE POLICY "completions_select_own" ON public.goal_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "completions_select_public" ON public.goal_completions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_completions.goal_id AND goals.visibility = 'public')
);
CREATE POLICY "completions_insert_own" ON public.goal_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "completions_update_own" ON public.goal_completions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "completions_delete_own" ON public.goal_completions FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - FOLLOWERS
-- ============================================

CREATE POLICY "followers_select_all" ON public.followers FOR SELECT USING (true);
CREATE POLICY "followers_insert_own" ON public.followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "followers_delete_own" ON public.followers FOR DELETE USING (auth.uid() = follower_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update streak when goal is completed
CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_streak_record RECORD;
  v_new_current_streak INTEGER;
  v_new_longest_streak INTEGER;
BEGIN
  IF NEW.is_completed = TRUE AND (OLD.is_completed = FALSE OR OLD.is_completed IS NULL) THEN
    SELECT * INTO v_streak_record FROM public.streaks WHERE goal_id = NEW.id AND user_id = NEW.user_id;

    IF v_streak_record IS NULL THEN
      INSERT INTO public.streaks (goal_id, user_id, current_streak, longest_streak, last_completed_date, total_completions)
      VALUES (NEW.id, NEW.user_id, 1, 1, CURRENT_DATE, 1);
      v_new_current_streak := 1;
      v_new_longest_streak := 1;
    ELSE
      IF v_streak_record.last_completed_date = CURRENT_DATE THEN
        v_new_current_streak := v_streak_record.current_streak;
      ELSIF v_streak_record.last_completed_date = CURRENT_DATE - INTERVAL '1 day' THEN
        v_new_current_streak := v_streak_record.current_streak + 1;
      ELSE
        v_new_current_streak := 1;
      END IF;

      v_new_longest_streak := GREATEST(v_streak_record.longest_streak, v_new_current_streak);

      UPDATE public.streaks SET
        current_streak = v_new_current_streak,
        longest_streak = v_new_longest_streak,
        last_completed_date = CURRENT_DATE,
        total_completions = v_streak_record.total_completions + 1,
        updated_at = NOW()
      WHERE goal_id = NEW.id AND user_id = NEW.user_id;
    END IF;

    IF v_new_current_streak IN (7, 30, 100, 365) THEN
      INSERT INTO public.milestones (goal_id, user_id, title, description, milestone_type, metadata)
      VALUES (
        NEW.id, NEW.user_id,
        v_new_current_streak || ' Day Streak!',
        'Completed goal for ' || v_new_current_streak || ' days in a row',
        'streak',
        jsonb_build_object('streak_days', v_new_current_streak)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify accountability partners when goal is completed
CREATE OR REPLACE FUNCTION notify_accountability_partners()
RETURNS TRIGGER AS $$
DECLARE
  v_user_name TEXT;
BEGIN
  IF NEW.is_completed = TRUE AND (OLD.is_completed = FALSE OR OLD.is_completed IS NULL) THEN
    SELECT display_name INTO v_user_name FROM public.users WHERE id = NEW.user_id;

    INSERT INTO public.notifications (user_id, title, message, notification_type, related_goal_id, related_user_id, action_url)
    SELECT
      ap.partner_id,
      'Goal Completed! 🎉',
      v_user_name || ' completed their goal: "' || NEW.title || '"',
      'partner_completed',
      NEW.id,
      NEW.user_id,
      '/goals/' || NEW.id
    FROM public.accountability_partners ap
    WHERE ap.goal_id = NEW.id AND ap.status = 'accepted';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accountability_partners_updated_at
  BEFORE UPDATE ON public.accountability_partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at
  BEFORE UPDATE ON public.streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streak_trigger
  AFTER UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION update_streak();

CREATE TRIGGER notify_partners_trigger
  AFTER UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION notify_accountability_partners();

-- ============================================
-- STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "avatar_select" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatar_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "avatar_update" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "avatar_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- SETUP COMPLETE
-- ============================================

SELECT 'Database schema created successfully!' AS status;
