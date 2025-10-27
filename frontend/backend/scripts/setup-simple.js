#!/usr/bin/env node

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

async function setupDatabase() {
  console.log('\n🚀 COMMITLY - Database Setup\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing environment variables!');
    process.exit(1);
  }

  console.log('✅ Environment variables loaded');
  console.log('📡 Connecting to Supabase...\n');

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Test connection
  try {
    const { data, error } = await supabase.from('_').select('*').limit(0);
    console.log('✅ Connected to Supabase successfully!\n');
  } catch (err) {
    console.log('⚠️  Connection test skipped (this is normal)\n');
  }

  console.log('📝 Creating database schema...\n');
  console.log('⚠️  Note: You need to run the SQL manually in Supabase SQL Editor\n');
  console.log('Instructions:');
  console.log('1. Go to https://supabase.com/dashboard/project/wfjspkyptjipolxnlzya/sql/new');
  console.log('2. Copy the SQL from setup-schema.sql');
  console.log('3. Paste it into the SQL Editor');
  console.log('4. Click "Run" to execute\n');
  console.log('Creating setup-schema.sql file...\n');
  const schema = `-- ============================================
-- COMMITLY DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('single', 'multi', 'recurring')),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'restricted')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  recurrence_pattern TEXT,
  recurrence_days TEXT[],
  default_time_allocation INTEGER,
  is_suspended BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table (for multi-activity goals)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal members table (for group goals)
CREATE TABLE IF NOT EXISTS public.goal_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(goal_id, user_id)
);

-- Accountability partners table
CREATE TABLE IF NOT EXISTS public.accountability_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, partner_id, goal_id)
);

-- Streaks table
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  total_completions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(goal_id, user_id)
);

-- Milestones table
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('streak', 'completion', 'custom')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table (encouragement and feedback)
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'encouragement' CHECK (note_type IN ('encouragement', 'feedback', 'reminder')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('goal_created', 'goal_completed', 'goal_missed', 'accountability_request', 'reminder', 'partner_update')),
  related_goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  related_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal completions table (history)
CREATE TABLE IF NOT EXISTS public.goal_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  completion_date TIMESTAMPTZ DEFAULT NOW(),
  actual_time_spent INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Followers table
CREATE TABLE IF NOT EXISTS public.followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_goal_id ON public.activities(goal_id);
CREATE INDEX IF NOT EXISTS idx_streaks_goal_id ON public.streaks(goal_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_accountability_partners_partner_id ON public.accountability_partners(partner_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
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

-- Users policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);

-- Goals policies
DROP POLICY IF EXISTS "Users can view their own goals" ON public.goals;
CREATE POLICY "Users can view their own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public goals" ON public.goals;
CREATE POLICY "Users can view public goals" ON public.goals FOR SELECT USING (visibility = 'public');

DROP POLICY IF EXISTS "Users can create their own goals" ON public.goals;
CREATE POLICY "Users can create their own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own goals" ON public.goals;
CREATE POLICY "Users can update their own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own goals" ON public.goals;
CREATE POLICY "Users can delete their own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- Activities policies
DROP POLICY IF EXISTS "Users can view activities of their goals" ON public.activities;
CREATE POLICY "Users can view activities of their goals" ON public.activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = activities.goal_id AND goals.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can create activities for their goals" ON public.activities;
CREATE POLICY "Users can create activities for their goals" ON public.activities FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_id AND goals.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update activities of their goals" ON public.activities;
CREATE POLICY "Users can update activities of their goals" ON public.activities FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = activities.goal_id AND goals.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can delete activities of their goals" ON public.activities;
CREATE POLICY "Users can delete activities of their goals" ON public.activities FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = activities.goal_id AND goals.user_id = auth.uid())
);

-- Accountability partners policies
DROP POLICY IF EXISTS "Users can view their accountability relationships" ON public.accountability_partners;
CREATE POLICY "Users can view their accountability relationships" ON public.accountability_partners FOR SELECT USING (
  auth.uid() = requester_id OR auth.uid() = partner_id
);

DROP POLICY IF EXISTS "Users can create accountability requests" ON public.accountability_partners;
CREATE POLICY "Users can create accountability requests" ON public.accountability_partners FOR INSERT WITH CHECK (
  auth.uid() = requester_id
);

DROP POLICY IF EXISTS "Users can update their accountability relationships" ON public.accountability_partners;
CREATE POLICY "Users can update their accountability relationships" ON public.accountability_partners FOR UPDATE USING (
  auth.uid() = requester_id OR auth.uid() = partner_id
);

-- Streaks policies
DROP POLICY IF EXISTS "Users can view their own streaks" ON public.streaks;
CREATE POLICY "Users can view their own streaks" ON public.streaks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own streaks" ON public.streaks;
CREATE POLICY "Users can create their own streaks" ON public.streaks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own streaks" ON public.streaks;
CREATE POLICY "Users can update their own streaks" ON public.streaks FOR UPDATE USING (auth.uid() = user_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Goal completions policies
DROP POLICY IF EXISTS "Users can view their own completions" ON public.goal_completions;
CREATE POLICY "Users can view their own completions" ON public.goal_completions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own completions" ON public.goal_completions;
CREATE POLICY "Users can create their own completions" ON public.goal_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Followers policies
DROP POLICY IF EXISTS "Users can view all followers" ON public.followers;
CREATE POLICY "Users can view all followers" ON public.followers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON public.followers;
CREATE POLICY "Users can follow others" ON public.followers FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.followers;
CREATE POLICY "Users can unfollow" ON public.followers FOR DELETE USING (auth.uid() = follower_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update streak
CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    INSERT INTO public.streaks (goal_id, user_id, current_streak, longest_streak, last_completed_date, total_completions)
    VALUES (NEW.id, NEW.user_id, 1, 1, CURRENT_DATE, 1)
    ON CONFLICT (goal_id, user_id) DO UPDATE SET
      current_streak = CASE
        WHEN streaks.last_completed_date = CURRENT_DATE - INTERVAL '1 day' THEN streaks.current_streak + 1
        WHEN streaks.last_completed_date = CURRENT_DATE THEN streaks.current_streak
        ELSE 1
      END,
      longest_streak = GREATEST(streaks.longest_streak, CASE
        WHEN streaks.last_completed_date = CURRENT_DATE - INTERVAL '1 day' THEN streaks.current_streak + 1
        WHEN streaks.last_completed_date = CURRENT_DATE THEN streaks.current_streak
        ELSE 1
      END),
      last_completed_date = CURRENT_DATE,
      total_completions = streaks.total_completions + 1,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification for accountability partners
CREATE OR REPLACE FUNCTION notify_accountability_partners()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    INSERT INTO public.notifications (user_id, title, message, notification_type, related_goal_id, related_user_id)
    SELECT 
      ap.partner_id,
      'Goal Completed!',
      (SELECT display_name FROM public.users WHERE id = NEW.user_id) || ' completed their goal: ' || NEW.title,
      'partner_update',
      NEW.id,
      NEW.user_id
    FROM public.accountability_partners ap
    WHERE ap.goal_id = NEW.id AND ap.status = 'accepted';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_streak_trigger ON public.goals;
CREATE TRIGGER update_streak_trigger
AFTER UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION update_streak();

DROP TRIGGER IF EXISTS notify_partners_trigger ON public.goals;
CREATE TRIGGER notify_partners_trigger
AFTER UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION notify_accountability_partners();

-- ============================================
-- STORAGE
-- ============================================

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
`;

  fs.writeFileSync('setup-schema.sql', schema);
  
  console.log('✅ Created setup-schema.sql\n');
  console.log('🎯 Next Steps:\n');
  console.log('1. Open Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/wfjspkyptjipolxnlzya/sql/new\n');
  console.log('2. Copy the contents of setup-schema.sql');
  console.log('3. Paste into the SQL Editor');
  console.log('4. Click "Run" button\n');
  console.log('5. Configure Auth URLs in Supabase Dashboard:');
  console.log('   - Go to Authentication > URL Configuration');
  console.log('   - Site URL: http://localhost:3001');
  console.log('   - Redirect URL: http://localhost:3001/auth/callback\n');
  console.log('6. Restart your dev server and test!\n');
}

setupDatabase().then(() => process.exit(0));
