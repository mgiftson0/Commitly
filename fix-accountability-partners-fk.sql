-- Fix accountability_partners foreign key constraint
-- The issue is that user_id should reference profiles.id, not auth.users.id

-- 1. Drop the existing foreign key constraint
ALTER TABLE public.accountability_partners 
DROP CONSTRAINT IF EXISTS accountability_partners_user_id_fkey;

ALTER TABLE public.accountability_partners 
DROP CONSTRAINT IF EXISTS accountability_partners_partner_id_fkey;

-- 2. Add correct foreign key constraints referencing profiles table
ALTER TABLE public.accountability_partners 
ADD CONSTRAINT accountability_partners_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.accountability_partners 
ADD CONSTRAINT accountability_partners_partner_id_fkey 
FOREIGN KEY (partner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Verify the constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'accountability_partners';

