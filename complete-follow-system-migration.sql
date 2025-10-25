-- ============================================
-- COMPLETE FOLLOW SYSTEM & NOTIFICATION FIX
-- Production-Ready Migration
-- ============================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 1: DROP OLD FOLLOWERS TABLE
-- ============================================

-- Drop existing followers table if exists
DROP TABLE IF EXISTS public.followers CASCADE;

-- ============================================
-- STEP 2: CREATE FOLLOWS TABLE
-- ============================================

-- Create follows table with status support for private accounts
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT follows_different_users CHECK (follower_id != following_id),
  CONSTRAINT follows_unique UNIQUE(follower_id, following_id)
);

COMMENT ON TABLE public.follows IS 'User follow relationships with support for private accounts';
COMMENT ON COLUMN public.follows.status IS 'pending: awaiting approval for private accounts, accepted: approved follow, blocked: blocked user';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_status ON public.follows(status);
CREATE INDEX IF NOT EXISTS idx_follows_follower_status ON public.follows(follower_id, status);
CREATE INDEX IF NOT EXISTS idx_follows_following_status ON public.follows(following_id, status);

-- ============================================
-- STEP 3: UPDATE PROFILES TABLE
-- ============================================

-- Add missing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add constraints (using DO block for conditional constraint creation)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_follower_count_positive' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_follower_count_positive CHECK (followers_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_following_count_positive' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_following_count_positive CHECK (following_count >= 0);
  END IF;
END $$;

-- Update existing profiles with proper display names if missing
UPDATE public.profiles 
SET display_name = COALESCE(first_name || ' ' || last_name, username) 
WHERE display_name IS NULL OR display_name = '';

-- ============================================
-- STEP 4: FUNCTIONS FOR COUNT UPDATES
-- ============================================

-- Function to update follower/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Only count accepted follows
    IF NEW.status = 'accepted' THEN
      -- Increment following count for follower
      UPDATE public.profiles 
      SET following_count = following_count + 1 
      WHERE id = NEW.follower_id;
      
      -- Increment follower count for following
      UPDATE public.profiles 
      SET followers_count = followers_count + 1 
      WHERE id = NEW.following_id;
    END IF;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status != NEW.status THEN
      IF OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
        -- Decrement counts when changing from accepted
        UPDATE public.profiles 
        SET following_count = GREATEST(following_count - 1, 0)
        WHERE id = NEW.follower_id;
        
        UPDATE public.profiles 
        SET followers_count = GREATEST(followers_count - 1, 0)
        WHERE id = NEW.following_id;
        
      ELSIF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
        -- Increment counts when changing to accepted
        UPDATE public.profiles 
        SET following_count = following_count + 1 
        WHERE id = NEW.follower_id;
        
        UPDATE public.profiles 
        SET followers_count = followers_count + 1 
        WHERE id = NEW.following_id;
      END IF;
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Only decrement if was accepted
    IF OLD.status = 'accepted' THEN
      UPDATE public.profiles 
      SET following_count = GREATEST(following_count - 1, 0)
      WHERE id = OLD.follower_id;
      
      UPDATE public.profiles 
      SET followers_count = GREATEST(followers_count - 1, 0)
      WHERE id = OLD.following_id;
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 5: NOTIFICATION SYSTEM FUNCTIONS
-- ============================================

-- Simplified function to create follow notifications
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  v_follower_name TEXT;
  v_following_profile RECORD;
BEGIN
  -- Get follower's display name
  SELECT COALESCE(display_name, username) INTO v_follower_name
  FROM public.profiles
  WHERE id = NEW.follower_id;
  
  -- Get following user's profile
  SELECT is_private INTO v_following_profile
  FROM public.profiles
  WHERE id = NEW.following_id;
  
  IF TG_OP = 'INSERT' THEN
    IF v_following_profile.is_private THEN
      -- For private accounts, send follow request notification
      IF NEW.status = 'pending' THEN
        INSERT INTO public.notifications (
          user_id, 
          title, 
          message, 
          type,
          related_user_id,
          is_read
        ) VALUES (
          NEW.following_id,
          'Follow Request',
          v_follower_name || ' wants to follow you',
          'follow_request',
          NEW.follower_id,
          FALSE
        );
      END IF;
    ELSE
      -- For public accounts, send new follower notification
      IF NEW.status = 'accepted' THEN
        INSERT INTO public.notifications (
          user_id, 
          title, 
          message, 
          type,
          related_user_id,
          is_read
        ) VALUES (
          NEW.following_id,
          'New Follower',
          v_follower_name || ' started following you',
          'follower_new',
          NEW.follower_id,
          FALSE
        );
      END IF;
    END IF;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- When request is accepted, notify the requester
    IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
      SELECT COALESCE(display_name, username) INTO v_follower_name
      FROM public.profiles
      WHERE id = NEW.following_id;
      
      INSERT INTO public.notifications (
        user_id, 
        title, 
        message, 
        type,
        related_user_id,
        is_read,
        data
      ) VALUES (
        NEW.follower_id,
        'Follow Request Accepted',
        v_follower_name || ' accepted your follow request',
        'follow_accepted',
        NEW.following_id,
        FALSE,
        jsonb_build_object('sender_name', v_follower_name, 'sender_id', NEW.following_id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 6: CREATE TRIGGERS
-- ============================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_follow_counts ON public.follows;
DROP TRIGGER IF EXISTS trigger_notify_on_follow ON public.follows;

-- Create trigger for count updates
CREATE TRIGGER trigger_update_follow_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();

-- Create trigger for notifications
CREATE TRIGGER trigger_notify_on_follow
  AFTER INSERT OR UPDATE ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_follow();

-- ============================================
-- STEP 7: RLS POLICIES FOR FOLLOWS
-- ============================================

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "follows_select_public" ON public.follows;
DROP POLICY IF EXISTS "follows_select_involved" ON public.follows;
DROP POLICY IF EXISTS "follows_insert_own" ON public.follows;
DROP POLICY IF EXISTS "follows_update_involved" ON public.follows;
DROP POLICY IF EXISTS "follows_delete_own" ON public.follows;

-- Anyone can view accepted follows (for public profiles)
CREATE POLICY "follows_select_public" 
  ON public.follows FOR SELECT 
  USING (status = 'accepted');

-- Users can view their own follow requests and relationships
CREATE POLICY "follows_select_involved" 
  ON public.follows FOR SELECT 
  USING (
    auth.uid() = follower_id OR 
    auth.uid() = following_id
  );

-- Users can create follow relationships (request to follow)
CREATE POLICY "follows_insert_own" 
  ON public.follows FOR INSERT 
  WITH CHECK (auth.uid() = follower_id);

-- Users can update follow status if they're the one being followed (accept/reject)
CREATE POLICY "follows_update_involved" 
  ON public.follows FOR UPDATE 
  USING (auth.uid() = following_id)
  WITH CHECK (auth.uid() = following_id);

-- Users can delete their own follows (unfollow)
CREATE POLICY "follows_delete_own" 
  ON public.follows FOR DELETE 
  USING (auth.uid() = follower_id);

-- ============================================
-- STEP 8: UPDATE NOTIFICATION TYPES
-- ============================================

-- Update notification types to include follow-related notifications
DO $$ 
BEGIN
  -- Check if type constraint exists and update it
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'notifications' AND column_name = 'type'
  ) THEN
    ALTER TABLE public.notifications 
    DROP CONSTRAINT IF EXISTS notifications_type_check;
  END IF;
END $$;

ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN (
    'goal_created', 'goal_completed', 'goal_missed', 'goal_reminder', 'goal_due',
    'partner_request', 'partner_accepted', 'partner_declined',
    'accountability_request', 'accountability_accepted', 'accountability_declined',
    'partner_completed', 'partner_note', 'milestone_achieved',
    'streak_milestone', 'new_follower', 'follow_request', 'follow_accepted', 
    'follow_rejected', 'follow_unfollowed', 'follower_new', 'follow_request_received',
    'follow_request_accepted', 'follow_request_rejected',
    'system', 'general', 'achievement_unlocked', 'partner_joined', 'activity_completed', 
    'encouragement_received', 'encouragement'
  ));

-- ============================================
-- STEP 9: HELPER FUNCTIONS FOR FOLLOW LOGIC
-- ============================================

-- Function to check if two users are mutuals (both follow each other)
CREATE OR REPLACE FUNCTION are_mutuals(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.follows 
    WHERE follower_id = user1_id 
      AND following_id = user2_id 
      AND status = 'accepted'
  ) AND EXISTS (
    SELECT 1 FROM public.follows 
    WHERE follower_id = user2_id 
      AND following_id = user1_id 
      AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get follow status between two users
CREATE OR REPLACE FUNCTION get_follow_status(requester_id UUID, target_id UUID)
RETURNS TABLE(
  is_following BOOLEAN,
  is_follower BOOLEAN,
  is_mutual BOOLEAN,
  follow_status TEXT,
  is_pending BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(
      SELECT 1 FROM public.follows 
      WHERE follower_id = requester_id 
        AND following_id = target_id
        AND status = 'accepted'
    ) AS is_following,
    EXISTS(
      SELECT 1 FROM public.follows 
      WHERE follower_id = target_id 
        AND following_id = requester_id
        AND status = 'accepted'
    ) AS is_follower,
    are_mutuals(requester_id, target_id) AS is_mutual,
    COALESCE(
      (SELECT status FROM public.follows 
       WHERE follower_id = requester_id AND following_id = target_id),
      'none'
    ) AS follow_status,
    EXISTS(
      SELECT 1 FROM public.follows 
      WHERE follower_id = requester_id 
        AND following_id = target_id
        AND status = 'pending'
    ) AS is_pending;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 10: SYNC EXISTING DATA
-- ============================================

-- Recalculate all follower/following counts for existing users
UPDATE public.profiles p
SET 
  followers_count = COALESCE((
    SELECT COUNT(*) FROM public.follows 
    WHERE following_id = p.id AND status = 'accepted'
  ), 0),
  following_count = COALESCE((
    SELECT COUNT(*) FROM public.follows 
    WHERE follower_id = p.id AND status = 'accepted'
  ), 0);

-- ============================================
-- STEP 11: GRANT PERMISSIONS
-- ============================================

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.follows TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION update_follow_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_on_follow() TO authenticated;
GRANT EXECUTE ON FUNCTION are_mutuals(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_follow_status(UUID, UUID) TO authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

SELECT 'Follow system migration completed successfully!' AS status;
