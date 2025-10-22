-- ============================================
-- COMMITLY DATABASE DIAGNOSTICS
-- Run this to troubleshoot setup issues
-- ============================================

\echo '=========================================='
\echo 'COMMITLY DATABASE DIAGNOSTICS'
\echo '=========================================='
\echo ''

-- ============================================
-- 1. CHECK IF TABLES EXIST
-- ============================================

\echo '1. Checking if tables exist...'
\echo ''

SELECT
  table_name,
  CASE
    WHEN table_name IN ('users', 'goals', 'activities', 'goal_members',
                        'accountability_partners', 'streaks', 'milestones',
                        'notes', 'notifications', 'goal_completions', 'followers')
    THEN '✓ EXISTS'
    ELSE '✗ UNEXPECTED'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

\echo ''
\echo 'Expected: 11 tables'
SELECT COUNT(*) as actual_table_count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

\echo ''

-- ============================================
-- 2. CHECK USERS TABLE STRUCTURE
-- ============================================

\echo '2. Checking users table structure...'
\echo ''

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

\echo ''

-- ============================================
-- 3. CHECK RLS (ROW LEVEL SECURITY)
-- ============================================

\echo '3. Checking Row Level Security (RLS)...'
\echo ''

SELECT
  tablename,
  CASE
    WHEN rowsecurity THEN '✓ ENABLED'
    ELSE '✗ DISABLED (PROBLEM!)'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

\echo ''
\echo 'Expected: All tables should have RLS ENABLED'
\echo ''

-- ============================================
-- 4. CHECK RLS POLICIES
-- ============================================

\echo '4. Checking RLS Policies...'
\echo ''

SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  CASE
    WHEN permissive = 'PERMISSIVE' THEN '✓ PERMISSIVE'
    ELSE 'RESTRICTIVE'
  END as policy_type
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

\echo ''
\echo 'Counting policies per table...'

SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

\echo ''
\echo 'Expected policy counts:'
\echo '  users: 4'
\echo '  goals: 7+'
\echo '  activities: 5+'
\echo '  (others should have multiple policies)'
\echo ''

-- ============================================
-- 5. CHECK FUNCTIONS
-- ============================================

\echo '5. Checking database functions...'
\echo ''

SELECT
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

\echo ''
\echo 'Expected functions:'
\echo '  - update_updated_at_column'
\echo '  - update_streak'
\echo '  - notify_accountability_partners'
\echo ''

-- ============================================
-- 6. CHECK TRIGGERS
-- ============================================

\echo '6. Checking triggers...'
\echo ''

SELECT
  trigger_name,
  event_object_table as table_name,
  event_manipulation as event_type,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

\echo ''
\echo 'Expected: 7 triggers'
SELECT COUNT(*) as actual_trigger_count
FROM information_schema.triggers
WHERE trigger_schema = 'public';

\echo ''

-- ============================================
-- 7. CHECK STORAGE BUCKETS
-- ============================================

\echo '7. Checking storage buckets...'
\echo ''

SELECT
  id,
  name,
  CASE WHEN public THEN '✓ PUBLIC' ELSE '✗ PRIVATE' END as access,
  created_at
FROM storage.buckets
WHERE id = 'avatars';

\echo ''
\echo 'Expected: 1 bucket named "avatars" (public)'
\echo ''

-- ============================================
-- 8. CHECK INDEXES
-- ============================================

\echo '8. Checking indexes...'
\echo ''

SELECT
  schemaname,
  tablename,
  COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

\echo ''
\echo 'Expected: 50+ total indexes across all tables'
SELECT COUNT(*) as total_indexes
FROM pg_indexes
WHERE schemaname = 'public';

\echo ''

-- ============================================
-- 9. CHECK CONSTRAINTS
-- ============================================

\echo '9. Checking constraints on users table...'
\echo ''

SELECT
  con.conname as constraint_name,
  con.contype as constraint_type,
  CASE con.contype
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'u' THEN 'UNIQUE'
    WHEN 'c' THEN 'CHECK'
    WHEN 'f' THEN 'FOREIGN KEY'
    ELSE con.contype::text
  END as type_description
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'users'
ORDER BY con.conname;

\echo ''

-- ============================================
-- 10. TEST USER INSERT (DRY RUN)
-- ============================================

\echo '10. Testing user table insert permissions...'
\echo ''

\echo 'Checking if auth schema exists...'
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth')
    THEN '✓ auth schema exists'
    ELSE '✗ auth schema NOT FOUND (PROBLEM!)'
  END as auth_schema_status;

\echo ''

-- ============================================
-- 11. SPECIFIC USERS TABLE CHECKS
-- ============================================

\echo '11. Detailed users table analysis...'
\echo ''

\echo 'Checking users table foreign key to auth.users...'
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
  AND tc.table_schema = 'public'
  AND tc.table_name = 'users';

\echo ''

-- ============================================
-- 12. CHECK FOR COMMON ISSUES
-- ============================================

\echo '12. Checking for common issues...'
\echo ''

\echo 'Checking if auth.users table exists...'
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'auth' AND table_name = 'users'
    )
    THEN '✓ auth.users table exists'
    ELSE '✗ auth.users table NOT FOUND (CRITICAL PROBLEM!)'
  END as auth_users_status;

\echo ''

\echo 'Checking RLS on storage.objects...'
SELECT
  tablename,
  CASE
    WHEN rowsecurity THEN '✓ RLS ENABLED'
    ELSE '✗ RLS DISABLED'
  END as storage_rls_status
FROM pg_tables
WHERE schemaname = 'storage' AND tablename = 'objects';

\echo ''

-- ============================================
-- 13. POLICY DETAILS FOR USERS TABLE
-- ============================================

\echo '13. Detailed policy check for users table...'
\echo ''

SELECT
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users'
ORDER BY policyname;

\echo ''

-- ============================================
-- 14. CHECK EXTENSIONS
-- ============================================

\echo '14. Checking required PostgreSQL extensions...'
\echo ''

SELECT
  extname as extension_name,
  extversion as version,
  '✓ INSTALLED' as status
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto')
ORDER BY extname;

\echo ''
\echo 'Expected: uuid-ossp and pgcrypto'
\echo ''

-- ============================================
-- 15. SUMMARY
-- ============================================

\echo '=========================================='
\echo 'DIAGNOSTICS SUMMARY'
\echo '=========================================='
\echo ''

SELECT
  'Tables' as component,
  COUNT(*)::text as count,
  '11 expected' as expected
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT
  'RLS Policies' as component,
  COUNT(*)::text as count,
  '30+ expected' as expected
FROM pg_policies
WHERE schemaname = 'public'

UNION ALL

SELECT
  'Functions' as component,
  COUNT(*)::text as count,
  '3 expected' as expected
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'

UNION ALL

SELECT
  'Triggers' as component,
  COUNT(*)::text as count,
  '7 expected' as expected
FROM information_schema.triggers
WHERE trigger_schema = 'public'

UNION ALL

SELECT
  'Indexes' as component,
  COUNT(*)::text as count,
  '50+ expected' as expected
FROM pg_indexes
WHERE schemaname = 'public'

UNION ALL

SELECT
  'Storage Buckets' as component,
  COUNT(*)::text as count,
  '1 expected' as expected
FROM storage.buckets
WHERE id = 'avatars';

\echo ''
\echo '=========================================='
\echo 'If you see missing components above,'
\echo 'the schema may not have run completely.'
\echo 'Try running schema.sql again.'
\echo '=========================================='
\echo ''

-- ============================================
-- 16. ACTIONABLE RECOMMENDATIONS
-- ============================================

\echo 'RECOMMENDATIONS:'
\echo ''

DO $$
DECLARE
  table_count INTEGER;
  policy_count INTEGER;
  function_count INTEGER;
  trigger_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
  SELECT COUNT(*) INTO function_count FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
  SELECT COUNT(*) INTO trigger_count FROM information_schema.triggers WHERE trigger_schema = 'public';

  IF table_count < 11 THEN
    RAISE NOTICE '✗ PROBLEM: Only % tables found (expected 11). Re-run schema.sql', table_count;
  ELSE
    RAISE NOTICE '✓ All tables present';
  END IF;

  IF policy_count < 30 THEN
    RAISE NOTICE '✗ PROBLEM: Only % RLS policies found (expected 30+). Re-run schema.sql', policy_count;
  ELSE
    RAISE NOTICE '✓ RLS policies present';
  END IF;

  IF function_count < 3 THEN
    RAISE NOTICE '✗ PROBLEM: Only % functions found (expected 3). Re-run schema.sql', function_count;
  ELSE
    RAISE NOTICE '✓ Functions present';
  END IF;

  IF trigger_count < 7 THEN
    RAISE NOTICE '✗ PROBLEM: Only % triggers found (expected 7). Re-run schema.sql', trigger_count;
  ELSE
    RAISE NOTICE '✓ Triggers present';
  END IF;
END $$;

\echo ''
\echo '=========================================='
\echo 'END OF DIAGNOSTICS'
\echo '=========================================='
