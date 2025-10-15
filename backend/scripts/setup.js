#!/usr/bin/env node

/**
 * COMMITLY - Complete Setup Script
 * 
 * This script sets up the complete Supabase backend for Commitly
 * including all tables, RLS policies, and functions.
 * 
 * Prerequisites:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Get your project URL and anon key from Project Settings > API
 * 3. Get your service role key (keep this secret!)
 * 
 * Usage:
 * node setup.js
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupDatabase() {
  console.log('\n🚀 COMMITLY - Database Setup\n');
  console.log('This will create all necessary tables, policies, and functions in your Supabase project.\n');

  const supabaseUrl = await question('Enter your Supabase Project URL: ');
  const supabaseServiceKey = await question('Enter your Supabase Service Role Key: ');

  console.log('\n⏳ Connecting to Supabase...\n');

  const supabase = createClient(supabaseUrl.trim(), supabaseServiceKey.trim());

  // SQL Schema
  const schema = `
-- ============================================
-- COMMITLY DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- ============================================
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

-- ============================================
-- 2. FOLLOWERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- ============================================
-- 3. GOALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('single', 'multi', 'recurring')),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'restricted')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly', 'yearly', 'custom'
  recurrence_days TEXT[], -- ['monday', 'wednesday', 'friday']
  default_time_allocation INTEGER, -- in minutes
  is_suspended BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. ACTIVITIES TABLE (for multi-activity goals)
-- ============================================
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

-- ============================================
-- 5. GOAL MEMBERS TABLE (for group/patterned goals)
-- ============================================
CREATE TABLE IF NOT EXISTS public.goal_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(goal_id, user_id)
);

-- ============================================
-- 6. ACCOUNTABILITY PARTNERS TABLE
-- ============================================
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

-- ============================================
-- 7. STREAKS TABLE
-- ============================================
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

-- ============================================
-- 8. MILESTONES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  milestone_type TEXT CHECK (milestone_type IN ('streak', 'completion', 'custom')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. NOTES TABLE (encouragement & feedback)
-- ============================================
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'encouragement' CHECK (note_type IN ('encouragement', 'feedback', 'personal')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. NOTIFICATIONS TABLE
-- ============================================
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

-- ============================================
-- 11. GOAL COMPLETIONS TABLE (track actual completion times)
-- ============================================
CREATE TABLE IF NOT EXISTS public.goal_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  actual_time_spent INTEGER, -- in minutes
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_goal_id ON public.activities(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_members_goal_id ON public.goal_members(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_members_user_id ON public.goal_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_goal_id ON public.streaks(goal_id);
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON public.followers(following_id);
CREATE INDEX IF NOT EXISTS idx_accountability_partners_partner_id ON public.accountability_partners(partner_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accountability_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_completions ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- FOLLOWERS POLICIES
CREATE POLICY "Anyone can view followers" ON public.followers FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON public.followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.followers FOR DELETE USING (auth.uid() = follower_id);

-- GOALS POLICIES
CREATE POLICY "Users can view public goals" ON public.goals FOR SELECT USING (
  visibility = 'public' OR 
  user_id = auth.uid() OR
  id IN (SELECT goal_id FROM public.goal_members WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- ACTIVITIES POLICIES
CREATE POLICY "Users can view activities of accessible goals" ON public.activities FOR SELECT USING (
  goal_id IN (SELECT id FROM public.goals WHERE user_id = auth.uid() OR visibility = 'public')
);
CREATE POLICY "Users can manage activities of own goals" ON public.activities FOR ALL USING (
  goal_id IN (SELECT id FROM public.goals WHERE user_id = auth.uid())
);

-- GOAL MEMBERS POLICIES
CREATE POLICY "Users can view goal members" ON public.goal_members FOR SELECT USING (true);
CREATE POLICY "Goal owners can add members" ON public.goal_members FOR INSERT WITH CHECK (
  goal_id IN (SELECT id FROM public.goals WHERE user_id = auth.uid())
);
CREATE POLICY "Goal owners can remove members" ON public.goal_members FOR DELETE USING (
  goal_id IN (SELECT id FROM public.goals WHERE user_id = auth.uid())
);

-- ACCOUNTABILITY PARTNERS POLICIES
CREATE POLICY "Users can view their accountability relationships" ON public.accountability_partners FOR SELECT USING (
  requester_id = auth.uid() OR partner_id = auth.uid()
);
CREATE POLICY "Users can create accountability requests" ON public.accountability_partners FOR INSERT WITH CHECK (
  auth.uid() = requester_id
);
CREATE POLICY "Partners can update request status" ON public.accountability_partners FOR UPDATE USING (
  auth.uid() = partner_id
);

-- STREAKS POLICIES
CREATE POLICY "Users can view streaks of accessible goals" ON public.streaks FOR SELECT USING (
  user_id = auth.uid() OR 
  goal_id IN (SELECT id FROM public.goals WHERE visibility = 'public')
);
CREATE POLICY "Users can manage own streaks" ON public.streaks FOR ALL USING (user_id = auth.uid());

-- MILESTONES POLICIES
CREATE POLICY "Users can view milestones of accessible goals" ON public.milestones FOR SELECT USING (
  user_id = auth.uid() OR 
  goal_id IN (SELECT id FROM public.goals WHERE visibility = 'public')
);
CREATE POLICY "Users can create own milestones" ON public.milestones FOR INSERT WITH CHECK (user_id = auth.uid());

-- NOTES POLICIES
CREATE POLICY "Users can view notes on accessible goals" ON public.notes FOR SELECT USING (
  goal_id IN (SELECT id FROM public.goals WHERE user_id = auth.uid() OR visibility = 'public')
);
CREATE POLICY "Users can create notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own notes" ON public.notes FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own notes" ON public.notes FOR DELETE USING (auth.uid() = author_id);

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- GOAL COMPLETIONS POLICIES
CREATE POLICY "Users can view completions of accessible goals" ON public.goal_completions FOR SELECT USING (
  user_id = auth.uid() OR 
  goal_id IN (SELECT id FROM public.goals WHERE visibility = 'public')
);
CREATE POLICY "Users can create own completions" ON public.goal_completions FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate goal progress
CREATE OR REPLACE FUNCTION calculate_goal_progress(goal_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_activities INTEGER;
  completed_activities INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_activities FROM public.activities WHERE goal_id = goal_uuid;
  
  IF total_activities = 0 THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*) INTO completed_activities FROM public.activities 
  WHERE goal_id = goal_uuid AND is_completed = true;
  
  RETURN (completed_activities::NUMERIC / total_activities::NUMERIC) * 100;
END;
$$ LANGUAGE plpgsql;

-- Function to update streak when goal is completed
CREATE OR REPLACE FUNCTION update_streak_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  streak_record RECORD;
  days_since_last DATE;
BEGIN
  -- Get existing streak record
  SELECT * INTO streak_record FROM public.streaks 
  WHERE goal_id = NEW.goal_id AND user_id = NEW.user_id;
  
  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO public.streaks (goal_id, user_id, current_streak, longest_streak, last_completed_date, total_completions)
    VALUES (NEW.goal_id, NEW.user_id, 1, 1, NEW.completion_date, 1);
  ELSE
    -- Update existing streak
    days_since_last := NEW.completion_date - streak_record.last_completed_date;
    
    IF days_since_last = 1 THEN
      -- Consecutive day - increment streak
      UPDATE public.streaks SET
        current_streak = streak_record.current_streak + 1,
        longest_streak = GREATEST(streak_record.longest_streak, streak_record.current_streak + 1),
        last_completed_date = NEW.completion_date,
        total_completions = streak_record.total_completions + 1,
        updated_at = NOW()
      WHERE goal_id = NEW.goal_id AND user_id = NEW.user_id;
    ELSIF days_since_last > 1 THEN
      -- Streak broken - reset to 1
      UPDATE public.streaks SET
        current_streak = 1,
        last_completed_date = NEW.completion_date,
        total_completions = streak_record.total_completions + 1,
        updated_at = NOW()
      WHERE goal_id = NEW.goal_id AND user_id = NEW.user_id;
    ELSE
      -- Same day completion - just increment total
      UPDATE public.streaks SET
        total_completions = streak_record.total_completions + 1,
        updated_at = NOW()
      WHERE goal_id = NEW.goal_id AND user_id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update streaks on goal completion
CREATE TRIGGER update_streak_trigger
AFTER INSERT ON public.goal_completions
FOR EACH ROW EXECUTE FUNCTION update_streak_on_completion();

-- Function to create notification for accountability partners
CREATE OR REPLACE FUNCTION notify_accountability_partners()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify partners when goal is completed
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    INSERT INTO public.notifications (user_id, title, message, notification_type, related_goal_id, related_user_id)
    SELECT 
      ap.partner_id,
      'Goal Completed!',
      (SELECT display_name FROM public.users WHERE id = NEW.user_id) || ' completed: ' || NEW.title,
      'partner_update',
      NEW.id,
      NEW.user_id
    FROM public.accountability_partners ap
    WHERE ap.goal_id = NEW.id AND ap.status = 'accepted';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to notify partners on goal completion
CREATE TRIGGER notify_partners_trigger
AFTER UPDATE ON public.goals
FOR EACH ROW EXECUTE FUNCTION notify_accountability_partners();

-- ============================================
-- STORAGE BUCKETS (for profile pictures)
-- ============================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
`;

  try {
    console.log('📦 Creating database schema...\n');
    
    const { error } = await supabase.rpc('exec_sql', { sql: schema }).catch(async () => {
      // If RPC doesn't exist, try direct query
      return await supabase.from('_sql').insert({ query: schema });
    }).catch(async () => {
      // Fallback: execute via REST API
      const response = await fetch(`${supabaseUrl.trim()}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey.trim(),
          'Authorization': `Bearer ${supabaseServiceKey.trim()}`
        },
        body: JSON.stringify({ sql: schema })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return { error: null };
    });

    if (error) {
      console.error('❌ Error creating schema:', error);
      console.log('\n⚠️  Please run the SQL manually in your Supabase SQL Editor.');
      console.log('The complete SQL schema has been saved to: supabase-schema.sql\n');
      
      const fs = require('fs');
      fs.writeFileSync('supabase-schema.sql', schema);
      
      rl.close();
      return;
    }

    console.log('✅ Database schema created successfully!\n');
    console.log('📋 Created tables:');
    console.log('   - users');
    console.log('   - followers');
    console.log('   - goals');
    console.log('   - activities');
    console.log('   - goal_members');
    console.log('   - accountability_partners');
    console.log('   - streaks');
    console.log('   - milestones');
    console.log('   - notes');
    console.log('   - notifications');
    console.log('   - goal_completions');
    console.log('\n🔒 Row Level Security policies applied');
    console.log('⚡ Functions and triggers created');
    console.log('📁 Storage bucket configured\n');

    // Create .env.local file
    const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl.trim()}
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey.trim()}
`;

    const fs = require('fs');
    fs.writeFileSync('.env.local', envContent);
    
    console.log('✅ Created .env.local file');
    console.log('⚠️  Remember to add your ANON KEY to .env.local\n');
    
    console.log('🎉 Setup complete! Your Commitly backend is ready.\n');
    console.log('Next steps:');
    console.log('1. Update NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    console.log('2. Run: bun run dev');
    console.log('3. Start building! 🚀\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n⚠️  Saving SQL schema to file for manual execution...');
    
    const fs = require('fs');
    fs.writeFileSync('supabase-schema.sql', schema);
    
    console.log('✅ SQL schema saved to: supabase-schema.sql');
    console.log('Please run this SQL in your Supabase SQL Editor.\n');
  }

  rl.close();
}

setupDatabase();
