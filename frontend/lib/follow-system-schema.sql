-- Follow system database schema with proper foreign key constraints

-- First, check if follows table exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'follows') THEN
        CREATE TABLE follows (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked')),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(follower_id, following_id),
          CHECK (follower_id != following_id)
        );
    END IF;
END $$;

-- Update notifications table to reference profiles instead of users
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add missing columns to notifications if they don't exist
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Update existing read column to is_read if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read') THEN
        ALTER TABLE notifications RENAME COLUMN read TO is_read;
    END IF;
EXCEPTION
    WHEN duplicate_column THEN
        -- Column already exists, do nothing
        NULL;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_status ON follows(status);

-- Add follow counts to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Function to update follow counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update following count for follower
    UPDATE profiles 
    SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    
    -- Update followers count for followed user (only if accepted)
    IF NEW.status = 'accepted' THEN
      UPDATE profiles 
      SET followers_count = followers_count + 1 
      WHERE id = NEW.following_id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status != NEW.status THEN
      IF OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
        -- Removing accepted follow
        UPDATE profiles 
        SET followers_count = followers_count - 1 
        WHERE id = NEW.following_id;
      ELSIF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
        -- Adding accepted follow
        UPDATE profiles 
        SET followers_count = followers_count + 1 
        WHERE id = NEW.following_id;
      END IF;
    END IF;
    
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    -- Update following count for follower
    UPDATE profiles 
    SET following_count = following_count - 1 
    WHERE id = OLD.follower_id;
    
    -- Update followers count for followed user (only if was accepted)
    IF OLD.status = 'accepted' THEN
      UPDATE profiles 
      SET followers_count = followers_count - 1 
      WHERE id = OLD.following_id;
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for follow counts
DROP TRIGGER IF EXISTS trigger_update_follow_counts ON follows;
CREATE TRIGGER trigger_update_follow_counts
  AFTER INSERT OR UPDATE OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Initialize follow counts for existing profiles
UPDATE profiles SET 
  followers_count = (
    SELECT COUNT(*) FROM follows 
    WHERE following_id = profiles.id AND status = 'accepted'
  ),
  following_count = (
    SELECT COUNT(*) FROM follows 
    WHERE follower_id = profiles.id
  );

-- Add privacy settings to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS allow_follow_requests BOOLEAN DEFAULT true;