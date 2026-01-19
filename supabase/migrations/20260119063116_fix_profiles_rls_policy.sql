/*
  # Fix Profiles RLS Policy

  1. Changes
    - Remove overly permissive anonymous SELECT policy
    - Keep only necessary policies for authenticated users
    - Use secure RPC function for referral validation instead

  2. Security
    - Restricts direct table access appropriately
    - Only allows users to see their own profile and public directory
    - Referral validation via secure function only
*/

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow anonymous referral code validation" ON profiles;

-- Ensure users can read their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Ensure users can see profiles in public directory
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Public directory profiles visible'
  ) THEN
    CREATE POLICY "Public directory profiles visible"
      ON profiles
      FOR SELECT
      TO authenticated, anon
      USING (show_in_directory = true);
  END IF;
END $$;
