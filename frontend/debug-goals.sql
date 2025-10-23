-- Debug goals table structure and data
SELECT 
  id,
  title,
  user_id,
  pg_typeof(id) as id_type,
  length(id::text) as id_length
FROM public.goals 
LIMIT 5;

-- Check if goals table has proper UUID primary key
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'goals' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Disable RLS completely, alter column, then re-enable
ALTER TABLE public.goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_activities DISABLE ROW LEVEL SECURITY;

-- Now alter the column type
ALTER TABLE public.goals ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE public.goals ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Re-enable RLS and recreate policies
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals" ON public.goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public goals" ON public.goals
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can manage activities of their goals" ON public.goal_activities
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.goals WHERE goals.id = goal_activities.goal_id AND goals.user_id = auth.uid()
  ));