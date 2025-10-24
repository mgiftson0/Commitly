-- =====================================================
-- FIX: Replace CHECK constraint with TRIGGER
-- PostgreSQL doesn't allow subqueries in CHECK constraints
-- =====================================================

-- 1. Remove the problematic CHECK constraint
ALTER TABLE public.goal_partner_requests 
  DROP CONSTRAINT IF EXISTS check_mutual_accountability;

-- 2. Create trigger function to validate mutual partnership
CREATE OR REPLACE FUNCTION validate_mutual_partnership()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip validation if same user (shouldn't happen but safe)
  IF NEW.requester_id = NEW.partner_id THEN
    RETURN NEW;
  END IF;
  
  -- Check if users are mutual accountability partners
  IF NOT EXISTS (
    SELECT 1 FROM public.accountability_partners
    WHERE user_id = NEW.requester_id 
    AND partner_id = NEW.partner_id 
    AND status = 'accepted'
  ) OR NOT EXISTS (
    SELECT 1 FROM public.accountability_partners
    WHERE user_id = NEW.partner_id 
    AND partner_id = NEW.requester_id 
    AND status = 'accepted'
  ) THEN
    RAISE EXCEPTION 'Users must be mutual accountability partners to share goals'
      USING ERRCODE = '23514'; -- check_violation error code
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS trigger_validate_mutual_partnership ON public.goal_partner_requests;

-- Create trigger on INSERT
CREATE TRIGGER trigger_validate_mutual_partnership
  BEFORE INSERT ON public.goal_partner_requests
  FOR EACH ROW
  EXECUTE FUNCTION validate_mutual_partnership();

-- 4. Also update the streaks system constraint the same way
ALTER TABLE public.goal_partner_requests 
  DROP CONSTRAINT IF EXISTS check_mutual_accountability CASCADE;

-- Verify triggers are created
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'public.goal_partner_requests'::regclass;
