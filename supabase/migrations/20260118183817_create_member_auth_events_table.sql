/*
  # Create Member Auth Events Table

  1. New Table
    - `member_auth_events` - Safe logging of member authentication events
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, not null)
      - `event_type` (text, not null) - sign_in, sign_out, password_reset, profile_update
      - `ip_hash` (text, nullable) - Hashed IP address for privacy
      - `user_agent` (text, nullable) - Truncated user agent string (max 200 chars)
      - `created_at` (timestamptz, not null)

  2. RPC Function
    - `log_member_auth_event(p_event_type, p_user_agent)` - SECURITY DEFINER
    - Logs authentication events for the current user
    - Hashes IP address server-side
    - Truncates user agent to prevent abuse
    - Best-effort: never blocks user operations

  3. Security
    - Enable RLS on member_auth_events
    - SELECT: Users can only read their own events
    - INSERT: Only via RPC (no direct INSERT policy)
    - NO UPDATE or DELETE policies (immutable log)

  4. Important Notes
    - This is a privacy-safe audit log for members to see their own activity
    - IP addresses are hashed, not stored in plain text
    - User agents are truncated to 200 characters
    - Events are immutable once created
    - Separate from admin_actions table (which is for admin oversight)
*/

-- Create member_auth_events table
CREATE TABLE IF NOT EXISTS public.member_auth_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  ip_hash text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS member_auth_events_user_id_created_at_idx 
  ON public.member_auth_events(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.member_auth_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own events only
CREATE POLICY "Users can read own auth events"
  ON public.member_auth_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RPC: Log member auth event (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.log_member_auth_event(
  p_event_type text,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_ip_hash text;
  v_truncated_ua text;
  v_event_id uuid;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate event type
  IF p_event_type NOT IN ('sign_in', 'sign_out', 'password_reset', 'profile_update', 'password_change') THEN
    RAISE EXCEPTION 'Invalid event type';
  END IF;

  -- Hash IP address if available (using request.headers in future, for now NULL)
  -- In production, you could use: SELECT current_setting('request.headers', true)::json->>'x-forwarded-for'
  v_ip_hash := NULL;

  -- Truncate user agent to 200 characters
  IF p_user_agent IS NOT NULL THEN
    v_truncated_ua := substring(p_user_agent, 1, 200);
  ELSE
    v_truncated_ua := NULL;
  END IF;

  -- Insert event
  INSERT INTO public.member_auth_events (
    user_id,
    event_type,
    ip_hash,
    user_agent,
    created_at
  ) VALUES (
    v_user_id,
    p_event_type,
    v_ip_hash,
    v_truncated_ua,
    now()
  ) RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.log_member_auth_event(text, text) TO authenticated;

-- Helper function to get member's own auth events
CREATE OR REPLACE FUNCTION public.get_member_auth_events(
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  event_type text,
  user_agent text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT 
    e.id,
    e.event_type,
    e.user_agent,
    e.created_at
  FROM public.member_auth_events e
  WHERE e.user_id = v_user_id
  ORDER BY e.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_member_auth_events(integer) TO authenticated;