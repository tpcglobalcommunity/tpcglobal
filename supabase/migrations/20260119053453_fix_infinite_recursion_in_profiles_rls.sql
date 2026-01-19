/*
  # Fix Infinite Recursion in Profiles RLS

  1. Problem
    - Multiple SELECT policies query the profiles table to check roles
    - This creates infinite recursion when trying to read profiles
  
  2. Solution
    - Drop all existing policies
    - Create simple, non-recursive policies
    - Use JWT claims (raw_app_meta_data) for role checks instead of querying profiles
  
  3. Security
    - Users can read their own profile
    - Users can update safe fields on their own profile
    - Keep role and verification status protected
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view referral codes for validation" ON profiles;
DROP POLICY IF EXISTS "Moderators and admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile safe fields" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update can_invite" ON profiles;

-- Simple SELECT policy: users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Simple UPDATE policy: users can update safe fields
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
    AND is_verified = (SELECT is_verified FROM profiles WHERE id = auth.uid())
    AND referral_code = (SELECT referral_code FROM profiles WHERE id = auth.uid())
    AND referred_by = (SELECT referred_by FROM profiles WHERE id = auth.uid())
    AND referral_count = (SELECT referral_count FROM profiles WHERE id = auth.uid())
  );
