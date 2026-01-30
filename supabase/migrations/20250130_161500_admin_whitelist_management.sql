-- Admin Whitelist Management with Audit Logging
-- Creates safe RPCs for admin management with audit trail

-- ============================================================================
-- PHASE A — DB STRUCTURE
-- ============================================================================

-- Create audit table for whitelist actions
CREATE TABLE IF NOT EXISTS public.admin_whitelist_audit (
  id bigserial PRIMARY KEY,
  action text NOT NULL CHECK (action IN ('ADD', 'REMOVE')),
  target_user_id uuid NOT NULL,
  note text,
  actor_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.admin_whitelist_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read audit logs
CREATE POLICY "Admins can read audit logs" ON public.admin_whitelist_audit
  FOR SELECT USING (public.is_admin_uuid(auth.uid()));

-- Policy: Only service role can insert audit logs (via RPC)
CREATE POLICY "Service role can insert audit logs" ON public.admin_whitelist_audit
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- PHASE A — RPC FUNCTIONS (SECURITY DEFINER)
-- ============================================================================

-- Function to list current admin whitelist
CREATE OR REPLACE FUNCTION public.admin_whitelist_list()
RETURNS TABLE (
  user_id uuid,
  note text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Enforce admin check
  IF NOT public.is_admin_uuid(auth.uid()) THEN
    RAISE EXCEPTION 'Permission denied: Admin access required';
  END IF;
  
  -- Return whitelist entries
  RETURN QUERY
  SELECT 
    aw.user_id,
    aw.note,
    aw.created_at
  FROM public.admin_whitelist aw
  ORDER BY aw.created_at DESC;
END;
$$;

-- Function to add user to admin whitelist
CREATE OR REPLACE FUNCTION public.admin_whitelist_add(p_user_id uuid, p_note text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text := 'ADD';
BEGIN
  -- Enforce admin check
  IF NOT public.is_admin_uuid(auth.uid()) THEN
    RAISE EXCEPTION 'Permission denied: Admin access required';
  END IF;
  
  -- Prevent adding self (optional safety guard)
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot add yourself to admin whitelist';
  END IF;
  
  -- Upsert into whitelist
  INSERT INTO public.admin_whitelist (user_id, note)
  VALUES (p_user_id, p_note)
  ON CONFLICT (user_id) DO UPDATE SET 
    note = EXCLUDED.note;
  
  -- Insert audit log
  INSERT INTO public.admin_whitelist_audit (
    action, 
    target_user_id, 
    note, 
    actor_user_id
  ) VALUES (
    v_action,
    p_user_id,
    p_note,
    auth.uid()
  );
END;
$$;

-- Function to remove user from admin whitelist
CREATE OR REPLACE FUNCTION public.admin_whitelist_remove(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text := 'REMOVE';
  v_existing_note text;
BEGIN
  -- Enforce admin check
  IF NOT public.is_admin_uuid(auth.uid()) THEN
    RAISE EXCEPTION 'Permission denied: Admin access required';
  END IF;
  
  -- Prevent removing self (safety guard)
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot remove yourself from admin whitelist';
  END IF;
  
  -- Get existing note for audit
  SELECT note INTO v_existing_note
  FROM public.admin_whitelist
  WHERE user_id = p_user_id;
  
  -- Remove from whitelist
  DELETE FROM public.admin_whitelist
  WHERE user_id = p_user_id;
  
  -- Insert audit log (only if user existed)
  IF FOUND THEN
    INSERT INTO public.admin_whitelist_audit (
      action, 
      target_user_id, 
      note, 
      actor_user_id
    ) VALUES (
      v_action,
      p_user_id,
      v_existing_note,
      auth.uid()
    );
  END IF;
END;
$$;

-- ============================================================================
-- PHASE A — PERMISSIONS
-- ============================================================================

-- Grant execute permissions to authenticated users only
GRANT EXECUTE ON FUNCTION public.admin_whitelist_list() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_whitelist_add(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_whitelist_remove(uuid) TO authenticated;

-- Revoke from anon for security
REVOKE EXECUTE ON FUNCTION public.admin_whitelist_list() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_whitelist_add(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_whitelist_remove(uuid) FROM anon;

-- ============================================================================
-- PHASE A — ENSURE RLS POLICIES
-- ============================================================================

-- Ensure admin_whitelist remains hidden (no SELECT policies for regular users)
DO $$
BEGIN
  -- Remove any policies that allow regular users to read admin_whitelist
  DROP POLICY IF EXISTS "Users can read own admin status" ON public.admin_whitelist;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES (for manual testing)
-- ============================================================================

-- Test queries (commented out, uncomment for testing)
/*
-- Test 1: As admin - should work
SELECT * FROM public.admin_whitelist_list();

-- Test 2: As admin - add user
SELECT public.admin_whitelist_add('12345678-1234-1234-1234-123456789012', 'Test admin');

-- Test 3: As admin - remove user
SELECT public.admin_whitelist_remove('12345678-1234-1234-1234-123456789012');

-- Test 4: Check audit logs
SELECT * FROM public.admin_whitelist_audit ORDER BY created_at DESC;

-- Test 5: As non-admin - should fail
SELECT public.admin_whitelist_list(); -- Should raise exception

-- Test 6: Check current whitelist
SELECT * FROM public.admin_whitelist ORDER BY created_at DESC;
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Admin whitelist management RPCs created successfully';
  RAISE NOTICE 'Features:';
  RAISE NOTICE '- admin_whitelist_list(): List current admins';
  RAISE NOTICE '- admin_whitelist_add(): Add/update admin';
  RAISE NOTICE '- admin_whitelist_remove(): Remove admin';
  RAISE NOTICE '- Audit logging enabled for all actions';
  RAISE NOTICE '- Self-modification protection enabled';
END $$;
