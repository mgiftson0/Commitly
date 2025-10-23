-- Create missing tables for Commitly

-- Achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- Update profiles table structure
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_completed_kyc BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Update goals table structure
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES auth.users(id);
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private';
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS goal_type TEXT DEFAULT 'single';
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Update notifications table structure
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'general';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS data JSONB;

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true) ON CONFLICT DO NOTHING;

-- RLS policies for new tables
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Achievements policies (public read)
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage policies for profile pictures
CREATE POLICY "Users can upload own profile pictures" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view profile pictures" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can update own profile pictures" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own profile pictures" ON storage.objects
  FOR DELETE USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Goal activities table for multi-activity goals
CREATE TABLE IF NOT EXISTS public.goal_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Encouragements table
CREATE TABLE IF NOT EXISTS public.encouragements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('cheer', 'milestone', 'streak', 'comeback', 'general')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS policies for goals (CRITICAL FIX)
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public goals" ON public.goals
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can view partner goals" ON public.goals
  FOR SELECT USING (visibility = 'restricted' AND EXISTS (
    SELECT 1 FROM public.accountability_partners 
    WHERE (user_id = auth.uid() AND partner_id = goals.user_id) 
    OR (partner_id = auth.uid() AND user_id = goals.user_id)
    AND status = 'accepted'
  ));

CREATE POLICY "Users can insert own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for goal activities
ALTER TABLE public.goal_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities of accessible goals" ON public.goal_activities
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.goals WHERE goals.id = goal_activities.goal_id 
    AND (goals.user_id = auth.uid() OR goals.visibility = 'public')
  ));
  
CREATE POLICY "Users can update activities of their goals" ON public.goal_activities
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.goals WHERE goals.id = goal_activities.goal_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert activities for their goals" ON public.goal_activities
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.goals WHERE goals.id = goal_activities.goal_id AND goals.user_id = auth.uid()
  ));

-- RLS policies for encouragements
ALTER TABLE public.encouragements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view encouragements they sent or received" ON public.encouragements
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
  
CREATE POLICY "Users can send encouragements" ON public.encouragements
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, category, points) VALUES
('First Goal', 'Created your first goal', 'target', 'getting_started', 10),
('Goal Achiever', 'Completed your first goal', 'trophy', 'completion', 25),
('Consistency Champion', 'Maintained a 7-day streak', 'flame', 'consistency', 50),
('Goal Master', 'Completed 10 goals', 'award', 'completion', 100),
('Social Butterfly', 'Added your first accountability partner', 'users', 'social', 30),
('Encourager', 'Sent your first encouragement', 'heart', 'social', 15),
('Motivator', 'Sent 10 encouragements', 'megaphone', 'social', 40)
ON CONFLICT DO NOTHING;