/*
  # Fix infinite recursion in profiles RLS policies

  1. Problem
    - Current policies are causing infinite recursion when trying to access profiles table
    - The "Admins can read all profiles" policy tries to query profiles table to check if user is admin
    - This creates a circular dependency

  2. Solution
    - Remove all existing policies that cause recursion
    - Create simple, direct policies that don't reference the profiles table itself
    - Use auth.uid() directly for user identification
    - Remove admin-specific policies that cause circular references

  3. Security
    - Users can only access their own profile data
    - Simple and secure without recursion
*/

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Enable read access for own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);