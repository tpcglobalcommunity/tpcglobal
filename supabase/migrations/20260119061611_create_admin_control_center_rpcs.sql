/*
  # Admin Control Center RPC Functions

  1. New Functions
    - `admin_list_users` - Safely fetch users list with filters and pagination for admin
    - `admin_set_user_role` - Change user role with audit logging
    - `admin_set_user_verified` - Toggle user verified status with audit logging

  2. Security
    - All functions use SECURITY DEFINER
    - Require caller to be admin or super_admin
    - Only super_admin can assign super_admin role
    - All actions logged to admin_actions table

  3. Notes
    - Returns total_count for pagination
    - Validates role values
    - Prevents last super_admin from being demoted
*/

-- Function to list users with filters (admin only)
CREATE OR REPLACE FUNCTION admin_list_users(
  p_query text DEFAULT NULL,
  p_role text DEFAULT NULL,
  p_verified boolean DEFAULT NULL,
  p_can_invite boolean DEFAULT NULL,
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  username text,
  role text,
  is_verified boolean,
  can_invite boolean,
  referral_code text,
  referral_count int,
  created_at timestamptz,
  show_in_directory boolean,
  vendor_status text,
  country text,
  total_count bigint
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_caller_role text;
BEGIN
  -- Check if caller is admin or super_admin
  SELECT profiles.role INTO v_caller_role
  FROM profiles
  WHERE profiles.id = auth.uid();

  IF v_caller_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Return filtered users with total count
  RETURN QUERY
  SELECT
    p.id,
    COALESCE(au.email, '') as email,
    p.full_name,
    p.username,
    p.role,
    p.is_verified,
    p.can_invite,
    p.referral_code,
    p.referral_count,
    p.created_at,
    p.show_in_directory,
    p.vendor_status,
    p.country,
    COUNT(*) OVER() as total_count
  FROM profiles p
  LEFT JOIN auth.users au ON au.id = p.id
  WHERE
    (p_query IS NULL OR
     p.username ILIKE '%' || p_query || '%' OR
     p.full_name ILIKE '%' || p_query || '%' OR
     p.referral_code ILIKE '%' || p_query || '%')
    AND (p_role IS NULL OR p.role = p_role)
    AND (p_verified IS NULL OR p.is_verified = p_verified)
    AND (p_can_invite IS NULL OR p.can_invite = p_can_invite)
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function to set user role (admin only)
CREATE OR REPLACE FUNCTION admin_set_user_role(
  p_target_user_id uuid,
  p_new_role text,
  p_reason text DEFAULT ''
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_caller_id uuid;
  v_caller_role text;
  v_old_role text;
  v_super_admin_count int;
BEGIN
  v_caller_id := auth.uid();

  -- Check if caller is admin or super_admin
  SELECT profiles.role INTO v_caller_role
  FROM profiles
  WHERE profiles.id = v_caller_id;

  IF v_caller_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Validate new role
  IF p_new_role NOT IN ('member', 'moderator', 'admin', 'super_admin') THEN
    RAISE EXCEPTION 'Invalid role: %', p_new_role;
  END IF;

  -- Only super_admin can assign super_admin role
  IF p_new_role = 'super_admin' AND v_caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super_admin can assign super_admin role';
  END IF;

  -- Get old role
  SELECT role INTO v_old_role
  FROM profiles
  WHERE id = p_target_user_id;

  IF v_old_role IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Prevent demoting last super_admin
  IF v_old_role = 'super_admin' AND p_new_role != 'super_admin' THEN
    SELECT COUNT(*) INTO v_super_admin_count
    FROM profiles
    WHERE role = 'super_admin';

    IF v_super_admin_count <= 1 THEN
      RAISE EXCEPTION 'Cannot demote the last super_admin';
    END IF;
  END IF;

  -- Update role
  UPDATE profiles
  SET role = p_new_role,
      updated_at = now()
  WHERE id = p_target_user_id;

  -- Log action
  INSERT INTO admin_actions (
    admin_id,
    action_type,
    target_user_id,
    details
  ) VALUES (
    v_caller_id,
    'role_change',
    p_target_user_id,
    jsonb_build_object(
      'old_role', v_old_role,
      'new_role', p_new_role,
      'reason', p_reason
    )
  );

  RETURN json_build_object(
    'success', true,
    'old_role', v_old_role,
    'new_role', p_new_role
  );
END;
$$;

-- Function to set user verified status (admin only)
CREATE OR REPLACE FUNCTION admin_set_user_verified(
  p_target_user_id uuid,
  p_new_verified boolean,
  p_reason text DEFAULT ''
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_caller_id uuid;
  v_caller_role text;
  v_old_verified boolean;
BEGIN
  v_caller_id := auth.uid();

  -- Check if caller is admin or super_admin
  SELECT profiles.role INTO v_caller_role
  FROM profiles
  WHERE profiles.id = v_caller_id;

  IF v_caller_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Get old verified status
  SELECT is_verified INTO v_old_verified
  FROM profiles
  WHERE id = p_target_user_id;

  IF v_old_verified IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Update verified status
  UPDATE profiles
  SET is_verified = p_new_verified,
      updated_at = now()
  WHERE id = p_target_user_id;

  -- Log action
  INSERT INTO admin_actions (
    admin_id,
    action_type,
    target_user_id,
    details
  ) VALUES (
    v_caller_id,
    'verified_change',
    p_target_user_id,
    jsonb_build_object(
      'old_verified', v_old_verified,
      'new_verified', p_new_verified,
      'reason', p_reason
    )
  );

  RETURN json_build_object(
    'success', true,
    'old_verified', v_old_verified,
    'new_verified', p_new_verified
  );
END;
$$;