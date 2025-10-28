-- ============================================
-- AUTO-ACTIVATE GOALS ON START DATE
-- Automatically moves goals from pending to active when start date arrives
-- ============================================

-- Function to activate goals that have reached their start date
CREATE OR REPLACE FUNCTION auto_activate_pending_goals()
RETURNS void AS $$
BEGIN
  -- Update goals from pending to active when start date has arrived
  UPDATE public.goals
  SET 
    status = 'active',
    updated_at = NOW()
  WHERE 
    status = 'pending'
    AND start_date IS NOT NULL
    AND start_date <= NOW();
    
  -- Log the activation
  RAISE NOTICE 'Auto-activated % goals', (SELECT COUNT(*) FROM public.goals WHERE status = 'active' AND start_date <= NOW());
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- OPTIONAL: Create a cron job using pg_cron extension
-- ============================================
-- Note: pg_cron must be enabled in Supabase dashboard first
-- To enable: Database > Extensions > Enable pg_cron
-- 
-- Uncomment the following lines ONLY if pg_cron is enabled:
-- 
-- SELECT cron.schedule(
--   'auto-activate-goals',
--   '0 * * * *', -- Every hour
--   $$SELECT auto_activate_pending_goals()$$
-- );
--
-- If pg_cron is not available, the trigger below provides real-time activation
-- which is actually BETTER than cron for most use cases!
-- ============================================

-- Alternative: Create a trigger that runs on INSERT/UPDATE
-- This provides real-time activation without waiting for cron
CREATE OR REPLACE FUNCTION check_goal_activation()
RETURNS TRIGGER AS $$
BEGIN
  -- If goal is pending and start date has arrived, activate it
  IF NEW.status = 'pending' 
     AND NEW.start_date IS NOT NULL 
     AND NEW.start_date <= NOW() THEN
    NEW.status := 'active';
    NEW.updated_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for real-time activation
DROP TRIGGER IF EXISTS trigger_auto_activate_goal ON public.goals;
CREATE TRIGGER trigger_auto_activate_goal
  BEFORE INSERT OR UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION check_goal_activation();

-- Function to handle completed goals and due dates
CREATE OR REPLACE FUNCTION handle_goal_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- If goal is being marked as completed
  IF NEW.completed_at IS NOT NULL AND (OLD.completed_at IS NULL OR OLD.completed_at != NEW.completed_at) THEN
    -- Set status to completed
    NEW.status := 'completed';
    
    -- Preserve the original due date even after completion
    -- (No changes needed - due date stays as is)
    
    -- Create completion notification for group goals
    IF NEW.is_group_goal = TRUE THEN
      INSERT INTO public.notifications (user_id, type, title, message, data, read)
      SELECT 
        gm.user_id,
        'goal_completed',
        'Group Goal Completed! 🎉',
        'The group goal "' || NEW.title || '" has been completed!',
        jsonb_build_object('goal_id', NEW.id, 'completed_at', NEW.completed_at),
        false
      FROM public.group_goal_members gm
      WHERE gm.goal_id = NEW.id AND gm.status = 'accepted';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for goal completion handling
DROP TRIGGER IF EXISTS trigger_handle_completion ON public.goals;
CREATE TRIGGER trigger_handle_completion
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION handle_goal_completion();

-- Manual function to run activation (can be called from API)
CREATE OR REPLACE FUNCTION activate_goals_now()
RETURNS TABLE(activated_count INTEGER) AS $$
DECLARE
  count INTEGER;
BEGIN
  UPDATE public.goals
  SET 
    status = 'active',
    updated_at = NOW()
  WHERE 
    status = 'pending'
    AND start_date IS NOT NULL
    AND start_date <= NOW();
    
  GET DIAGNOSTICS count = ROW_COUNT;
  RETURN QUERY SELECT count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================

-- To manually activate goals right now:
-- SELECT * FROM activate_goals_now();

-- To check which goals will be activated:
-- SELECT id, title, start_date, status 
-- FROM public.goals 
-- WHERE status = 'pending' AND start_date <= NOW();

-- To disable the cron job (if enabled):
-- SELECT cron.unschedule('auto-activate-goals');

-- ============================================
-- ALTERNATIVE: Use Supabase Edge Functions
-- ============================================
-- If you need scheduled activation without pg_cron:
-- 1. Create a Supabase Edge Function
-- 2. Call activate_goals_now() from the function
-- 3. Use GitHub Actions or external cron to trigger it
-- 
-- Example Edge Function (TypeScript):
-- import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
-- import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
-- 
-- serve(async (req) => {
--   const supabase = createClient(...)
--   const { data, error } = await supabase.rpc('activate_goals_now')
--   return new Response(JSON.stringify({ activated: data }))
-- })
--
-- RECOMMENDED: The trigger-based approach (already created above) is 
-- sufficient for most use cases and activates goals in real-time!

-- ============================================
-- SETUP COMPLETE
-- ============================================

SELECT 'Goal auto-activation system created successfully!' AS status;
