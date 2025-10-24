-- Create goal_partner_requests table for managing accountability partner requests on specific goals
CREATE TABLE IF NOT EXISTS public.goal_partner_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure unique pending requests per goal-requester-partner combination
  UNIQUE(goal_id, requester_id, partner_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_goal_partner_requests_goal_id ON public.goal_partner_requests(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_partner_requests_partner_id ON public.goal_partner_requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_goal_partner_requests_status ON public.goal_partner_requests(status);

-- Create goal_partners table for accepted partnerships on goals
CREATE TABLE IF NOT EXISTS public.goal_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'partner' CHECK (role IN ('owner', 'partner')),
  can_edit BOOLEAN DEFAULT FALSE,
  can_view_activities BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique partnerships
  UNIQUE(goal_id, user_id, partner_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_goal_partners_goal_id ON public.goal_partners(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_partners_user_id ON public.goal_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_partners_partner_id ON public.goal_partners(partner_id);

-- Enable RLS
ALTER TABLE public.goal_partner_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_partners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goal_partner_requests
CREATE POLICY "Users can view their own partner requests" ON public.goal_partner_requests
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = partner_id);

CREATE POLICY "Users can create partner requests" ON public.goal_partner_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Partners can update their requests" ON public.goal_partner_requests
  FOR UPDATE USING (auth.uid() = partner_id);

CREATE POLICY "Requesters can delete their requests" ON public.goal_partner_requests
  FOR DELETE USING (auth.uid() = requester_id);

-- RLS Policies for goal_partners
CREATE POLICY "Users can view goal partners" ON public.goal_partners
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = partner_id OR 
    EXISTS (
      SELECT 1 FROM public.goals 
      WHERE id = goal_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Goal owners can add partners" ON public.goal_partners
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.goals 
      WHERE id = goal_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove themselves as partners" ON public.goal_partners
  FOR DELETE USING (auth.uid() = partner_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_goal_partner_requests_updated_at BEFORE UPDATE ON public.goal_partner_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
