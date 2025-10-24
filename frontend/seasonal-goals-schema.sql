-- Enhanced schema for seasonal goals
-- Add new columns to goals table
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS duration_type VARCHAR(20) DEFAULT 'standard';
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS seasonal_year INTEGER;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS seasonal_quarter INTEGER;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS seasonal_period VARCHAR(20); -- 'H1', 'H2' for biannual
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT false;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS seasonal_theme VARCHAR(100);

-- Create seasonal_goal_templates table
CREATE TABLE IF NOT EXISTS public.seasonal_goal_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  duration_type VARCHAR(20) NOT NULL, -- 'annual', 'quarterly', 'biannual'
  suggested_activities JSONB,
  difficulty_level VARCHAR(20) DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  popularity_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seasonal_cohorts table for group challenges
CREATE TABLE IF NOT EXISTS public.seasonal_cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_type VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  quarter INTEGER, -- for quarterly cohorts
  period VARCHAR(10), -- 'H1', 'H2' for biannual
  max_members INTEGER DEFAULT 100,
  current_members INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seasonal_cohort_members table
CREATE TABLE IF NOT EXISTS public.seasonal_cohort_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID REFERENCES public.seasonal_cohorts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cohort_id, user_id)
);

-- Create seasonal_milestones table
CREATE TABLE IF NOT EXISTS public.seasonal_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_goals_seasonal ON public.goals(is_seasonal, duration_type, seasonal_year);
CREATE INDEX IF NOT EXISTS idx_seasonal_cohorts_period ON public.seasonal_cohorts(duration_type, year, quarter);