-- COMPLETE DATABASE FIX - Run this in Supabase SQL Editor

-- 1. Fix foreign key constraints
ALTER TABLE public.goals DROP CONSTRAINT IF EXISTS goals_user_id_fkey;
ALTER TABLE public.goals ADD CONSTRAINT goals_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

-- 2. Create auto-profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Enable RLS and create policies for goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own goals" ON public.goals;
CREATE POLICY "Users can manage own goals" ON public.goals
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view public goals" ON public.goals;
CREATE POLICY "Anyone can view public goals" ON public.goals
  FOR SELECT USING (visibility = 'public');

DROP POLICY IF EXISTS "Partners can view restricted goals" ON public.goals;
CREATE POLICY "Partners can view restricted goals" ON public.goals
  FOR SELECT USING (visibility = 'restricted' AND EXISTS (
    SELECT 1 FROM public.accountability_partners 
    WHERE ((user_id = auth.uid() AND partner_id = goals.user_id) 
    OR (partner_id = auth.uid() AND user_id = goals.user_id))
    AND status = 'accepted'
  ));

-- 4. Fix goal activities policies
ALTER TABLE public.goal_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage activities of their goals" ON public.goal_activities;
CREATE POLICY "Users can manage activities of their goals" ON public.goal_activities
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.goals WHERE goals.id = goal_activities.goal_id AND goals.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can view activities of accessible goals" ON public.goal_activities;
CREATE POLICY "Users can view activities of accessible goals" ON public.goal_activities
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.goals WHERE goals.id = goal_activities.goal_id 
    AND (goals.user_id = auth.uid() OR goals.visibility = 'public')
  ));

-- 5. Ensure achievements and user_achievements tables exist
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- 6. RLS for achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Add unique constraint and insert sample achievements
ALTER TABLE public.achievements ADD CONSTRAINT achievements_name_unique UNIQUE (name);

INSERT INTO public.achievements (name, description, icon, category, points) VALUES
('First Goal', 'Created your first goal', 'target', 'getting_started', 10),
('Goal Achiever', 'Completed your first goal', 'trophy', 'completion', 25),
('Consistency Champion', 'Maintained a 7-day streak', 'flame', 'consistency', 50),
('Goal Master', 'Completed 10 goals', 'award', 'completion', 100),
('Social Butterfly', 'Added your first accountability partner', 'users', 'social', 30),
('Encourager', 'Sent your first encouragement', 'heart', 'social', 15),
('Motivator', 'Sent 10 encouragements', 'megaphone', 'social', 40)
ON CONFLICT (name) DO NOTHING;

-- 8. Ensure notifications table has proper structure
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'general';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS data JSONB;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;