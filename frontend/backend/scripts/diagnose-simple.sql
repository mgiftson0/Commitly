-- ============================================
-- COMMITLY DATABASE DIAGNOSTICS (Supabase Compatible)
-- Run this in Supabase SQL Editor to check your setup
-- ============================================

-- 1. Check if all required tables exist
SELECT 'TABLES CHECK' as check_type, '' as detail, '' as status
UNION ALL
SELECT '', table_name,
  CASE
    WHEN table_name IN ('users', 'goals', 'activities', 'goal_members',
                        'accountability_partners', 'streaks', 'milestones',
                        'notes', 'notifications', 'goal_completions', 'followers')
    THEN '✓ OK'
    ELSE '✗ UNEXPECTED'
  END
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY check_type DESC, detail;

-- 2. Count tables (should be 11)
SELECT 'TABLE COUNT' as metric, COUNT(*)::text as value, '11 expected' as expected
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- 3. Check RLS is enabled on all tables
SELECT 'RLS STATUS' as check_type, '' as table_name, '' as status
UNION ALL
SELECT '', tablename,
  CASE WHEN rowsecurity THEN '✓ ENABLED' ELSE '✗ DISABLED (PROBLEM!)' END
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY check_type DESC, table_name;

-- 4. Check users table structure
SELECT 'USERS TABLE COLUMNS' as check_type, '' as column_info, '' as detail
UNION ALL
SELECT '',
  column_name || ' (' || data_type || ')',
  CASE WHEN is_nullable = 'NO' THEN 'NOT NULL' ELSE 'nullable' END
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY check_type DESC, column_info;

-- 5. Check users table foreign key to auth.users
SELECT 'USERS FOREIGN KEY' as check_type, '' as detail, '' as status
UNION ALL
SELECT '',
  tc.constraint_name || ' → ' || ccu.table_schema || '.' || ccu.table_name,
  '✓ EXISTS'
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'users'
ORDER BY check_type DESC;

-- 6. Check if auth.users table exists
SELECT 'AUTH SCHEMA CHECK' as check_type,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users')
    THEN '✓ auth.users exists'
    ELSE '✗ auth.users NOT FOUND (CRITICAL!)'
  END as status,
  '' as detail;

-- 7. Check RLS policies on users table
SELECT 'USERS TABLE POLICIES' as check_type, '' as policy_name, '' as command
UNION ALL
SELECT '', policyname, cmd::text
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY check_type DESC, policy_name;

-- 8. Count all policies (should be 30+)
SELECT 'POLICY COUNT' as metric, COUNT(*)::text as value, '30+ expected' as expected
FROM pg_policies
WHERE schemaname = 'public';

-- 9. Check database functions
SELECT 'FUNCTIONS' as check_type, '' as function_name, '' as return_type
UNION ALL
SELECT '', routine_name, data_type
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
ORDER BY check_type DESC, function_name;

-- 10. Count functions (should be 3)
SELECT 'FUNCTION COUNT' as metric, COUNT(*)::text as value, '3 expected' as expected
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';

-- 11. Check triggers
SELECT 'TRIGGERS' as check_type, '' as trigger_info, '' as detail
UNION ALL
SELECT '', trigger_name || ' on ' || event_object_table, action_timing || ' ' || event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY check_type DESC, trigger_info;

-- 12. Count triggers (should be 7)
SELECT 'TRIGGER COUNT' as metric, COUNT(*)::text as value, '7 expected' as expected
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- 13. Check PostgreSQL extensions
SELECT 'EXTENSIONS' as check_type, '' as extension_name, '' as status
UNION ALL
SELECT '', extname, '✓ ' || extversion
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto')
ORDER BY check_type DESC, extension_name;

-- 14. Check storage bucket
SELECT 'STORAGE BUCKET' as check_type,
  COALESCE(
    (SELECT '✓ avatars bucket exists (public: ' || public::text || ')' FROM storage.buckets WHERE id = 'avatars' LIMIT 1),
    '✗ avatars bucket NOT FOUND'
  ) as status,
  '' as detail;

-- 15. Final summary
SELECT '==================' as line, '==================' as status, '==================' as result
UNION ALL
SELECT 'SUMMARY', '', ''
UNION ALL
SELECT 'Tables', (SELECT COUNT(*)::text FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'), '11 expected'
UNION ALL
SELECT 'RLS Policies', (SELECT COUNT(*)::text FROM pg_policies WHERE schemaname = 'public'), '30+ expected'
UNION ALL
SELECT 'Functions', (SELECT COUNT(*)::text FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'), '3 expected'
UNION ALL
SELECT 'Triggers', (SELECT COUNT(*)::text FROM information_schema.triggers WHERE trigger_schema = 'public'), '7 expected'
UNION ALL
SELECT '==================', '==================', '==================';

-- 16. Check if we can insert into users (this will show the actual error if there is one)
-- IMPORTANT: This is just a validation query, not an actual insert
SELECT 'INSERT TEST' as test_type,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_privileges
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND privilege_type = 'INSERT'
    )
    THEN '✓ INSERT privilege exists'
    ELSE '✗ INSERT privilege missing'
  END as result,
  '' as detail;

-- If all checks pass, your schema is correctly installed!
-- If you see issues, re-run scripts/schema.sql in the SQL Editor
