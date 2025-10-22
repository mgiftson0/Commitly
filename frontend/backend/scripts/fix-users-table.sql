-- ============================================
-- FIX USERS TABLE - Quick Fix Script
-- Run this if you're getting "Database error saving new user"
-- ============================================

-- Step 1: Drop existing users table and related objects
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 2: Verify auth.users exists (critical check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    RAISE EXCEPTION 'CRITICAL ERROR: auth.users table does not exist. This is a Supabase core table and should exist automatically. Contact Supabase support.';
  END IF;
  RAISE NOTICE 'SUCCESS: auth.users table exists';
END $$;

-- Step 3: Recreate users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  phone_number TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Step 4: Add indexes
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_email ON public.users(email);

-- Step 5: Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing policies (if any)
DROP POLICY IF EXISTS "users_select_all" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_delete_own" ON public.users;

-- Step 7: Create RLS policies
CREATE POLICY "users_select_all"
  ON public.users
  FOR SELECT
  USING (true);

CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "users_delete_own"
  ON public.users
  FOR DELETE
  USING (auth.uid() = id);

-- Step 8: Recreate update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Grant necessary permissions
GRANT ALL ON public.users TO postgres;
GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- Step 10: Test insert capability
DO $$
DECLARE
  test_result TEXT;
BEGIN
  -- Check if policies exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
  ) THEN
    RAISE EXCEPTION 'ERROR: No RLS policies found on users table';
  END IF;

  -- Check RLS is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'ERROR: RLS is not enabled on users table';
  END IF;

  RAISE NOTICE 'SUCCESS: Users table is properly configured';
  RAISE NOTICE '✓ Table created with all constraints';
  RAISE NOTICE '✓ RLS enabled';
  RAISE NOTICE '✓ 4 policies created';
  RAISE NOTICE '✓ Indexes created';
  RAISE NOTICE '✓ Trigger created';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now try creating a user again!';
END $$;

-- Step 11: Show final configuration
SELECT
  'Users Table Configuration' as info,
  '' as details,
  '' as status
UNION ALL
SELECT
  'Table exists',
  'public.users',
  '✓'
UNION ALL
SELECT
  'RLS enabled',
  (SELECT CASE WHEN rowsecurity THEN 'YES' ELSE 'NO' END FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public'),
  CASE WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public') THEN '✓' ELSE '✗' END
UNION ALL
SELECT
  'Policies count',
  (SELECT COUNT(*)::text FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'),
  CASE WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public') >= 4 THEN '✓' ELSE '✗' END
UNION ALL
SELECT
  'Indexes count',
  (SELECT COUNT(*)::text FROM pg_indexes WHERE tablename = 'users' AND schemaname = 'public'),
  CASE WHEN (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'users' AND schemaname = 'public') >= 2 THEN '✓' ELSE '✗' END
UNION ALL
SELECT
  'Foreign key to auth.users',
  (SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'users' AND constraint_type = 'FOREIGN KEY' LIMIT 1),
  '✓';

-- If you still get errors, please run diagnose-simple.sql and share the output
