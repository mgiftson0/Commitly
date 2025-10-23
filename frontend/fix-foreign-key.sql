-- CRITICAL FIX: Run this in Supabase SQL Editor

-- 1. Drop existing foreign key constraint
ALTER TABLE public.goals DROP CONSTRAINT IF EXISTS goals_user_id_fkey;

-- 2. Ensure goals.user_id references auth.users(id) directly
ALTER TABLE public.goals 
ADD CONSTRAINT goals_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Ensure profiles.id = auth.users.id (primary key)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

-- 4. Create trigger to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();