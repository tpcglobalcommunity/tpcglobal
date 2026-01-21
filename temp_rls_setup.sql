ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_self" ON public.profiles;
CREATE POLICY "profiles_select_self"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
CREATE POLICY "profiles_update_self"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin read all
DROP POLICY IF EXISTS "profiles_admin_read" ON public.profiles;
CREATE POLICY "profiles_admin_read"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Setup RLS for referral_codes table
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Block direct select for authenticated (pakai RPC admin_list_referral_codes)
DROP POLICY IF EXISTS "referral_codes_no_select" ON public.referral_codes;
CREATE POLICY "referral_codes_no_select"
ON public.referral_codes
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Setup RLS for referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referrals_select_self" ON public.referrals;
CREATE POLICY "referrals_select_self"
ON public.referrals
FOR SELECT
TO authenticated
USING (referrer_id = auth.uid() OR referred_id = auth.uid());

DROP POLICY IF EXISTS "referrals_no_write" ON public.referrals;
CREATE POLICY "referrals_no_write"
ON public.referrals
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Setup RLS for referral_audit_logs table
ALTER TABLE public.referral_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_admin_read" ON public.referral_audit_logs;
CREATE POLICY "audit_admin_read"
ON public.referral_audit_logs
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "audit_no_write" ON public.referral_audit_logs;
CREATE POLICY "audit_no_write"
ON public.referral_audit_logs
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Create audit_logs table for general auditing
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  actor_id uuid,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Update trigger function to include audit logging and rate limiting
CREATE OR REPLACE FUNCTION public.handle_new_user_and_referral()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_referrer UUID;
  v_is_active BOOLEAN;
  v_can_invite BOOLEAN;
  v_max_uses INT;
  v_uses_count INT;
  v_attempts INT;
BEGIN
  -- Rate limiting check: count recent signup attempts from same IP/email
  SELECT COUNT(*) INTO v_attempts
  FROM auth.users 
  WHERE email = NEW.email 
    AND created_at > NOW() - INTERVAL '1 hour';
    
  IF v_attempts > 5 THEN
    -- Log the rate limit violation
    INSERT INTO public.audit_logs(event, actor_id, target_id, metadata)
    VALUES (
      'signup_rate_limit_exceeded',
      NEW.id,
      NULL,
      jsonb_build_object('email', NEW.email, 'attempts', v_attempts)
    );
    
    -- Throw error to prevent signup
    RAISE EXCEPTION 'Too many attempts, please wait';
  END IF;

  -- A) Create profile row
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email,'@',1))
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;

  -- B) Referral code from metadata
  v_code := UPPER(TRIM(COALESCE(NEW.raw_user_meta_data->>'referral_code', '')));

  IF v_code = '' THEN
    RETURN NEW;
  END IF;

  -- C) Validate referral code
  SELECT
    rc.created_by,
    rc.is_active,
    rc.can_invite,
    rc.max_uses,
    rc.uses_count
  INTO
    v_referrer,
    v_is_active,
    v_can_invite,
    v_max_uses,
    v_uses_count
  FROM public.referral_codes rc
  WHERE rc.code = v_code
  LIMIT 1;

  IF v_referrer IS NULL THEN
    RETURN NEW; -- code tidak ada
  END IF;

  IF COALESCE(v_is_active, FALSE) = FALSE THEN
    RETURN NEW; -- tidak aktif
  END IF;

  IF COALESCE(v_can_invite, TRUE) = FALSE THEN
    RETURN NEW; -- inviter tidak boleh invite
  END IF;

  IF v_max_uses IS NOT NULL AND COALESCE(v_uses_count,0) >= v_max_uses THEN
    RETURN NEW; -- quota habis
  END IF;

  -- D) Insert referrals row (anti double)
  INSERT INTO public.referrals (referrer_id, referred_id, referral_code)
  VALUES (v_referrer, NEW.id, v_code)
  ON CONFLICT DO NOTHING;

  -- E) Increment uses_count
  UPDATE public.referral_codes
  SET uses_count = COALESCE(uses_count,0) + 1
  WHERE code = v_code;

  -- F) Audit logging
  INSERT INTO public.audit_logs(event, actor_id, target_id, metadata)
  VALUES (
    'signup_with_referral',
    NEW.id,
    v_referrer,
    jsonb_build_object('ref_code', v_code)
  );

  RETURN NEW;
END;
$$;

-- Create trigger for updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_and_referral();

-- View latest 10 users
SELECT email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- View latest 10 referrals
SELECT
  r.created_at,
  p1.email as referrer,
  p2.email as referred
FROM public.referrals r
JOIN public.profiles p1 ON p1.id = r.referrer_id
JOIN public.profiles p2 ON p2.id = r.referred_id
ORDER BY r.created_at DESC
LIMIT 10;

-- View latest 20 audit logs
SELECT *
FROM public.audit_logs
ORDER BY created_at DESC
LIMIT 20;

-- Health check function
CREATE OR REPLACE FUNCTION public.health_check()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'db', 'ok',
    'time', now()
  );
$$;

GRANT EXECUTE ON FUNCTION public.health_check()
TO anon, authenticated;
