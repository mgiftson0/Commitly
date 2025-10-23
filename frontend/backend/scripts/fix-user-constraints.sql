-- Fix user deletion and constraints
-- Run this in Supabase SQL Editor

-- 1. Add CASCADE delete to profiles table
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- 2. Ensure unique constraints
ALTER TABLE profiles 
ADD CONSTRAINT profiles_username_unique UNIQUE (username);

ALTER TABLE profiles 
ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- 3. Add check constraints for data validation
ALTER TABLE profiles 
ADD CONSTRAINT profiles_username_format 
CHECK (username ~ '^[a-z0-9_]{3,20}$');

ALTER TABLE profiles 
ADD CONSTRAINT profiles_email_format 
CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');

ALTER TABLE profiles 
ADD CONSTRAINT profiles_phone_format 
CHECK (phone_number ~ '^[\+]?[0-9\s\-\(\)]{10,15}$');

-- 4. Create function to properly delete users
CREATE OR REPLACE FUNCTION delete_user_completely(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete profile first
  DELETE FROM profiles WHERE id = user_id;
  
  -- Delete from auth.users (this will cascade to other auth tables)
  DELETE FROM auth.users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant execute permission to authenticated users (for self-deletion)
GRANT EXECUTE ON FUNCTION delete_user_completely(UUID) TO authenticated;

-- 6. Create RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Public can read profiles (for username checking, etc.)
CREATE POLICY "Public can read profiles" ON profiles
  FOR SELECT USING (true);