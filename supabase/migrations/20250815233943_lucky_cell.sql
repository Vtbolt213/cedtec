/*
  # Fix user profile creation trigger

  1. Database Functions
    - Recreate `handle_new_user` function to properly create user profiles
    - Handle metadata extraction from auth.users
    - Ensure proper error handling

  2. Triggers
    - Recreate trigger on auth.users table
    - Execute after user insertion

  3. Security
    - Ensure profiles table has proper constraints
    - Handle missing or invalid metadata gracefully
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'professor')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure profiles table has proper constraints
ALTER TABLE public.profiles 
  ALTER COLUMN username SET DEFAULT '',
  ALTER COLUMN full_name SET DEFAULT '',
  ALTER COLUMN role SET DEFAULT 'professor';

-- Make sure the profiles table allows empty strings for required fields
UPDATE public.profiles 
SET 
  username = COALESCE(username, ''),
  full_name = COALESCE(full_name, '')
WHERE username IS NULL OR full_name IS NULL;