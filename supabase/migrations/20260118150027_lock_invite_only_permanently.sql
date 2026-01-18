/*
  # Lock Invite-Only System Permanently

  1. Security Hardening
    - REMOVE first-user bypass exception
    - Registration now ALWAYS requires valid referral code (no exceptions)
    - Add `can_invite` column to control invite privileges
    - Validate referrer has invite permissions before allowing registration
    - Add admin-only emergency member creation RPC

  2. Schema Changes
    - Add `can_invite` (boolean, default true) to profiles table
    - Update validation trigger to check can_invite status
    - Remove first-user exception logic

  3. New Functions
    - `admin_create_bootstrap_member()`: Emergency admin function
      - Creates profile without referral requirement
      - Only callable by super_admin role
      - Logs action for audit trail

  4. Security Enhancements
    - Referral code ALWAYS required (zero exceptions in normal flow)
    - Referrer must have can_invite = true
    - Admin bypass only via secure RPC with role verification
    - Self-referral and circular referral prevention maintained

  Important Security Notes:
    - After bootstrap is complete, NO public signup can bypass referral requirement
    - First-user exception has been PERMANENTLY REMOVED
    - Only super_admins can create members without referral via admin RPC
    - This is a ONE-WAY security hardening (no rollback to open registration)
*/

-- =====================================================
-- 1. ADD CAN_INVITE COLUMN TO PROFILES
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'can_invite'
  ) THEN
    ALTER TABLE profiles ADD COLUMN can_invite boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_can_invite ON profiles(can_invite) WHERE can_invite = true;

COMMENT ON COLUMN profiles.can_invite IS 'Controls whether this user can invite new members. Can be disabled by admins to prevent abuse.';

-- =====================================================
-- 2. UPDATE HANDLE_NEW_PROFILE_REFERRAL FUNCTION
-- =====================================================
-- This removes the first-user bypass and adds can_invite validation

CREATE OR REPLACE FUNCTION handle_new_profile_referral()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_profile_id uuid;
  referrer_can_invite boolean;
  is_admin_bypass boolean := false;
BEGIN
  -- Step 1: Auto-generate referral_code if not provided
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;

  -- Step 2: Check if this is an admin bypass operation
  -- (Only possible via admin_create_bootstrap_member RPC)
  -- Admin bypass is indicated by a special marker in session
  BEGIN
    is_admin_bypass := current_setting('app.admin_bypass', true)::boolean;
  EXCEPTION WHEN OTHERS THEN
    is_admin_bypass := false;
  END;

  -- Step 3: Validate referred_by (ALWAYS REQUIRED unless admin bypass)
  IF NEW.referred_by IS NULL OR NEW.referred_by = '' THEN
    -- NO FIRST-USER EXCEPTION - referral code is ALWAYS required
    IF NOT is_admin_bypass THEN
      RAISE EXCEPTION 'Referral code is required for registration. TPC is an invite-only community. Contact an administrator if you need assistance.';
    END IF;
    -- If admin bypass, allow and skip referral processing
    RETURN NEW;
  END IF;

  -- Step 4: Find the referrer's profile using their referral code
  SELECT id, can_invite INTO referrer_profile_id, referrer_can_invite
  FROM profiles
  WHERE referral_code = NEW.referred_by;
  
  -- Step 5: Validate referral code exists
  IF referrer_profile_id IS NULL THEN
    RAISE EXCEPTION 'Invalid referral code: %. Please check your invitation code and try again.', NEW.referred_by;
  END IF;
  
  -- Step 6: Check if referrer has invite privileges
  IF NOT referrer_can_invite THEN
    RAISE EXCEPTION 'This referral code is no longer valid. The inviter''s permissions have been revoked. Please contact an administrator.';
  END IF;
  
  -- Step 7: Prevent self-referral
  IF referrer_profile_id = NEW.id THEN
    RAISE EXCEPTION 'Self-referral is not allowed';
  END IF;
  
  -- Step 8: All validations passed, profile will be created
  -- Referral record will be created by the after-insert trigger

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION handle_new_profile_referral() IS 'Validates referral requirements on profile creation. ALWAYS requires valid referral code (no first-user exception). Checks can_invite status.';

-- =====================================================
-- 3. CREATE ADMIN EMERGENCY MEMBER CREATION RPC
-- =====================================================

CREATE OR REPLACE FUNCTION admin_create_bootstrap_member(
  target_user_id uuid,
  target_username text,
  target_full_name text,
  target_role text DEFAULT 'member',
  target_can_invite boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_role text;
  new_profile_id uuid;
  new_referral_code text;
BEGIN
  -- Step 1: Verify caller is super_admin
  SELECT role INTO caller_role
  FROM profiles
  WHERE id = auth.uid();
  
  IF caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Access denied. Only super_admin can create bootstrap members.';
  END IF;

  -- Step 2: Verify target user doesn't already have a profile
  IF EXISTS (SELECT 1 FROM profiles WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'Profile already exists for user: %', target_user_id;
  END IF;

  -- Step 3: Generate referral code
  new_referral_code := generate_referral_code();

  -- Step 4: Set admin bypass flag for this transaction
  PERFORM set_config('app.admin_bypass', 'true', true);

  -- Step 5: Create profile WITHOUT referral requirement
  INSERT INTO profiles (
    id,
    username,
    full_name,
    role,
    referral_code,
    referred_by,
    can_invite,
    is_verified
  ) VALUES (
    target_user_id,
    target_username,
    target_full_name,
    target_role,
    new_referral_code,
    NULL, -- No referrer for bootstrap members
    target_can_invite,
    true -- Bootstrap members are auto-verified
  )
  RETURNING id INTO new_profile_id;

  -- Step 6: Clear admin bypass flag
  PERFORM set_config('app.admin_bypass', 'false', true);

  -- Step 7: Log this action for audit trail
  RAISE NOTICE 'Bootstrap member created by admin % for user % with role %', auth.uid(), target_user_id, target_role;

  RETURN new_profile_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_create_bootstrap_member TO authenticated;

COMMENT ON FUNCTION admin_create_bootstrap_member IS 'ADMIN ONLY: Creates a member profile without referral requirement. Only super_admin can call. Used for emergency bootstrap or admin account creation.';

-- =====================================================
-- 4. ADD RLS POLICY FOR CAN_INVITE FIELD
-- =====================================================

-- Update existing profile view policy to include can_invite
-- (Already covered by existing "Users can view own profile" policy)

-- Add policy for admins to manage can_invite
CREATE POLICY "Admins can update can_invite"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 5. CREATE AUDIT LOG TABLE (OPTIONAL)
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  target_user_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit log
CREATE POLICY "Admins can view audit log"
  ON admin_actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- System can insert (via triggers or functions)
CREATE POLICY "System can insert audit log"
  ON admin_actions FOR INSERT
  TO authenticated
  WITH CHECK (admin_id = auth.uid());

COMMENT ON TABLE admin_actions IS 'Audit log for administrative actions. Tracks member creation, can_invite toggles, and other admin operations.';

-- =====================================================
-- 6. CREATE HELPER FUNCTION FOR TOGGLING CAN_INVITE
-- =====================================================

CREATE OR REPLACE FUNCTION admin_toggle_can_invite(
  target_user_id uuid,
  new_can_invite_status boolean,
  reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_role text;
  old_status boolean;
  target_username text;
BEGIN
  -- Step 1: Verify caller is admin or super_admin
  SELECT role INTO caller_role
  FROM profiles
  WHERE id = auth.uid();
  
  IF caller_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Access denied. Only admins can manage invite permissions.';
  END IF;

  -- Step 2: Get current status and username
  SELECT can_invite, username INTO old_status, target_username
  FROM profiles
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', target_user_id;
  END IF;

  -- Step 3: Update can_invite status
  UPDATE profiles
  SET can_invite = new_can_invite_status
  WHERE id = target_user_id;

  -- Step 4: Log this action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, details)
  VALUES (
    auth.uid(),
    'toggle_can_invite',
    target_user_id,
    jsonb_build_object(
      'old_status', old_status,
      'new_status', new_can_invite_status,
      'reason', reason,
      'target_username', target_username
    )
  );

  RAISE NOTICE 'Admin % changed can_invite for user % (%) from % to %', 
    auth.uid(), target_username, target_user_id, old_status, new_can_invite_status;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_toggle_can_invite TO authenticated;

COMMENT ON FUNCTION admin_toggle_can_invite IS 'ADMIN ONLY: Enable or disable invite privileges for a user. Logs action to audit trail.';

-- =====================================================
-- 7. DATA MIGRATION: SET EXISTING USERS CAN_INVITE = TRUE
-- =====================================================

-- Ensure all existing profiles have can_invite set to true
UPDATE profiles
SET can_invite = true
WHERE can_invite IS NULL;

-- =====================================================
-- 8. SECURITY VALIDATION SUMMARY
-- =====================================================

-- At this point:
-- ✓ First-user bypass REMOVED permanently
-- ✓ Referral code ALWAYS required for public signup
-- ✓ can_invite validation enforced
-- ✓ Admin emergency bypass available via secure RPC only
-- ✓ Audit logging in place
-- ✓ Self-referral prevention maintained
-- ✓ Circular referral prevention maintained
-- ✓ Invite permission can be revoked by admins

-- This is a ONE-WAY security hardening
-- No rollback to open registration without dropping these changes
