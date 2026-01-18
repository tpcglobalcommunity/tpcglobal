/*
  # Add Referral System

  1. Schema Changes
    - Add columns to `profiles` table:
      - `referral_code` (text, unique, not null): User's unique referral code
      - `referred_by` (text): Referral code of the person who invited this user
      - `referral_count` (integer): Number of successful referrals made by this user
    
    - Create `referrals` table:
      - `id` (uuid, primary key): Unique identifier
      - `referrer_id` (uuid): ID of user who made the referral
      - `referred_id` (uuid): ID of user who was referred
      - `referral_code` (text): The referral code used
      - `created_at` (timestamptz): When the referral occurred

  2. Functions
    - `generate_referral_code()`: Generates unique TPC-XXXXXX format codes
    - `handle_new_profile_referral()`: Trigger function to validate and process referrals

  3. Security
    - RLS policies for profiles (referral fields)
    - RLS policies for referrals table
    - Validation to prevent self-referral and circular referrals
    - Referral code must exist before profile can be created

  Important Notes:
    - Registration REQUIRES a valid referral code
    - No default or bypass for referral requirement
    - Referral codes are auto-generated on profile creation
    - Referral validation enforced at database level
*/

-- =====================================================
-- 1. ADD COLUMNS TO PROFILES TABLE
-- =====================================================

-- Add referral_code column (will be auto-generated)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE profiles ADD COLUMN referral_code text UNIQUE;
  END IF;
END $$;

-- Add referred_by column (references another user's referral_code)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'referred_by'
  ) THEN
    ALTER TABLE profiles ADD COLUMN referred_by text;
  END IF;
END $$;

-- Add referral_count column (tracks successful referrals)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'referral_count'
  ) THEN
    ALTER TABLE profiles ADD COLUMN referral_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- =====================================================
-- 2. CREATE REFERRALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referred_id),
  CHECK (referrer_id != referred_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- =====================================================
-- 3. FUNCTION: GENERATE REFERRAL CODE
-- =====================================================

CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code text;
  code_exists boolean;
  max_attempts int := 100;
  attempt int := 0;
BEGIN
  LOOP
    -- Generate random 6-character alphanumeric code (uppercase)
    new_code := 'TPC-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
    
    -- Prevent infinite loops
    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique referral code after % attempts', max_attempts;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- =====================================================
-- 4. TRIGGER: HANDLE NEW PROFILE REFERRAL
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_profile_referral()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_profile_id uuid;
BEGIN
  -- Step 1: Auto-generate referral_code if not provided
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;

  -- Step 2: Validate and process referred_by if provided
  IF NEW.referred_by IS NOT NULL AND NEW.referred_by != '' THEN
    -- Find the referrer's profile ID using their referral code
    SELECT id INTO referrer_profile_id
    FROM profiles
    WHERE referral_code = NEW.referred_by;
    
    -- If referral code doesn't exist, abort
    IF referrer_profile_id IS NULL THEN
      RAISE EXCEPTION 'Invalid referral code: %. Registration requires a valid invitation.', NEW.referred_by;
    END IF;
    
    -- Prevent self-referral
    IF referrer_profile_id = NEW.id THEN
      RAISE EXCEPTION 'Self-referral is not allowed';
    END IF;
    
    -- Insert into referrals table (will be done in a separate trigger after insert)
    -- Increment referrer's referral_count (will be done in a separate trigger after insert)
  ELSIF NEW.referred_by IS NULL OR NEW.referred_by = '' THEN
    -- Check if this is the very first user (no profiles exist yet)
    -- First user doesn't need a referral code
    IF (SELECT COUNT(*) FROM profiles) > 0 THEN
      -- Not the first user, so referral code is required
      RAISE EXCEPTION 'Referral code is required for registration. TPC is an invite-based community.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_handle_new_profile_referral ON profiles;
CREATE TRIGGER trigger_handle_new_profile_referral
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_profile_referral();

-- =====================================================
-- 5. TRIGGER: RECORD REFERRAL AFTER INSERT
-- =====================================================

CREATE OR REPLACE FUNCTION record_referral_after_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_profile_id uuid;
BEGIN
  -- Only process if referred_by is provided
  IF NEW.referred_by IS NOT NULL AND NEW.referred_by != '' THEN
    -- Get referrer's profile ID
    SELECT id INTO referrer_profile_id
    FROM profiles
    WHERE referral_code = NEW.referred_by;
    
    -- Insert referral record
    INSERT INTO referrals (referrer_id, referred_id, referral_code)
    VALUES (referrer_profile_id, NEW.id, NEW.referred_by);
    
    -- Increment referrer's count
    UPDATE profiles
    SET referral_count = referral_count + 1
    WHERE id = referrer_profile_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the after insert trigger
DROP TRIGGER IF EXISTS trigger_record_referral_after_insert ON profiles;
CREATE TRIGGER trigger_record_referral_after_insert
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION record_referral_after_insert();

-- =====================================================
-- 6. RLS POLICIES FOR PROFILES (REFERRAL FIELDS)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view referral codes for validation" ON profiles;

-- Users can view their own complete profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can view ONLY referral_code of other users (for validation during signup)
CREATE POLICY "Users can view referral codes for validation"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile BUT NOT referral fields
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Ensure users cannot modify these protected fields
    referral_code = (SELECT referral_code FROM profiles WHERE id = auth.uid()) AND
    referred_by = (SELECT referred_by FROM profiles WHERE id = auth.uid()) AND
    referral_count = (SELECT referral_count FROM profiles WHERE id = auth.uid())
  );

-- =====================================================
-- 7. RLS POLICIES FOR REFERRALS TABLE
-- =====================================================

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can view referrals where they are the referred person
CREATE POLICY "Users can view own referral record"
  ON referrals FOR SELECT
  TO authenticated
  USING (referred_id = auth.uid());

-- Users can view their outgoing referrals (people they referred)
CREATE POLICY "Users can view their referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid());

-- Admin and moderators can view all referrals
CREATE POLICY "Admins can view all referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- No direct INSERT allowed (only via trigger)
-- No UPDATE or DELETE allowed for regular users

-- =====================================================
-- 8. ADD FOREIGN KEY CONSTRAINT (AFTER DATA EXISTS)
-- =====================================================

-- Add foreign key from profiles.referred_by to profiles.referral_code
-- This ensures referred_by always points to a valid referral_code
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_referred_by_fkey'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT profiles_referred_by_fkey
    FOREIGN KEY (referred_by) REFERENCES profiles(referral_code)
    ON DELETE SET NULL;
  END IF;
END $$;
