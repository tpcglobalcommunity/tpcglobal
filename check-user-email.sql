-- Check for specific user registration
-- Query untuk mencari user dengan email ctgoldbtc@gmail.com

-- 1. Cek di auth.users table
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    CASE 
        WHEN raw_user_meta_data IS NOT NULL THEN 'Has metadata'
        ELSE 'No metadata'
    END as metadata_status,
    raw_user_meta_data::text as metadata_sample
FROM auth.users 
WHERE email = 'ctgoldbtc@gmail.com';

-- 2. Jika tidak ditemukan di auth.users, cek di profiles table
SELECT 
    p.id,
    p.full_name,
    p.username,
    p.referral_code,
    p.created_at,
    p.updated_at,
    u.email
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'ctgoldbtc@gmail.com';

-- 3. Tampilkan 5 user terakhir untuk comparison
SELECT 
    id,
    email,
    created_at,
    CASE 
        WHEN raw_user_meta_data IS NOT NULL THEN 'Has metadata'
        ELSE 'No metadata'
    END as metadata_status
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 3b. Cek email spesifik tpcglobal.io@gmail.com dan ctgold.io@gmail.com
SELECT id, email, created_at
FROM auth.users
WHERE email IN ('tpcglobal.io@gmail.com', 'ctgold.io@gmail.com')
ORDER BY created_at DESC;

-- 3c. Cek email spesifik ctgold.io@gmail.com
SELECT id, email, created_at
FROM auth.users
WHERE email = 'ctgold.io@gmail.com';

-- 4. Hitung jumlah member dengan domain email tpcglobal
SELECT 
    COUNT(*) as total_members,
    COUNT(CASE WHEN email LIKE '%@tpcglobal%' THEN 1 END) as tpcglobal_domain_count,
    COUNT(CASE WHEN email NOT LIKE '%@tpcglobal%' THEN 1 END) as other_domain_count,
    ROUND(
        (COUNT(CASE WHEN email LIKE '%@tpcglobal%' THEN 1 END) * 100.0 / COUNT(*)), 
        2
    ) as tpcglobal_percentage
FROM auth.users;

-- 5. Detail semua member dengan domain tpcglobal
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    CASE 
        WHEN raw_user_meta_data IS NOT NULL THEN 'Has metadata'
        ELSE 'No metadata'
    END as metadata_status
FROM auth.users 
WHERE email LIKE '%@tpcglobal%'
ORDER BY created_at DESC;

-- 6. Lihat semua data referrals
SELECT 
  r.referrer_id,
  referrer.username as referrer_username,
  referrer.full_name as referrer_name,
  r.referred_id,
  referred.username as referred_username,
  referred.full_name as referred_name,
  r.referral_code,
  r.created_at
FROM public.referrals r
LEFT JOIN public.profiles referrer ON r.referrer_id = referrer.id
LEFT JOIN public.profiles referred ON r.referred_id = referred.id
ORDER BY r.created_at DESC;

-- 7. Cek RPC function untuk validasi referral
SELECT 
    proname as function_name,
    pronargs as num_args,
    proargnames as arg_names,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname = 'validate_referral_code_public';

-- 8. Lihat semua referral codes yang valid
SELECT 
    p.id,
    p.username,
    p.full_name,
    p.referral_code,
    p.can_invite,
    p.verified,
    p.created_at
FROM public.profiles p
WHERE p.referral_code IS NOT NULL 
  AND p.referral_code != ''
  AND p.can_invite = true
ORDER BY p.created_at DESC;

-- 9. Test RPC function secara manual (ganti 'TEST-CODE' dengan kode referral yang ingin di-test)
SELECT validate_referral_code_public('TEST-CODE') as test_result;

-- 9b. Test referral code spesifik TPC-056A0E
SELECT public.validate_referral_code_public('TPC-056A0E') as test_result_specific;

-- 9c. Cek detail referral code TPC-056A0E
SELECT code, uses_count
FROM public.referral_codes
WHERE code = 'TPC-056A0E';

-- 10. Test dengan beberapa referral codes yang ada
SELECT 
    p.referral_code,
    validate_referral_code_public(p.referral_code) as is_valid
FROM public.profiles p
WHERE p.referral_code IS NOT NULL 
  AND p.referral_code != ''
  AND p.can_invite = true
LIMIT 5;

-- 11. Lihat data referrals sederhana
SELECT id, referrer_id, referred_id, referral_code, created_at
FROM public.referrals
ORDER BY created_at DESC;

-- 12. Cek trigger yang memproses signup data
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_condition,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
  AND event_object_schema = 'auth';

-- 12b. Cek trigger di auth.users (sederhana)
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

-- 13. Test signup metadata structure (simulasi data dari frontend)
DO $$
DECLARE
    test_metadata jsonb := '{
        "referral_code": "TPC-TEST123",
        "username": "testuser", 
        "full_name": "Test User"
    }'::jsonb;
BEGIN
    RAISE NOTICE 'Referral Code: %', test_metadata->>'referral_code';
    RAISE NOTICE 'Username: %', test_metadata->>'username';
    RAISE NOTICE 'Full Name: %', test_metadata->>'full_name';
    RAISE NOTICE 'All required fields present: %', 
        (test_metadata ? 'referral_code' AND test_metadata ? 'username' AND test_metadata ? 'full_name');
END $$;

-- 14. Cek struktur tabel yang digunakan trigger
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'referral_codes', 'referrals') 
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 15. Cek apakah trigger function exists
SELECT 
    proname as function_name,
    pronargs as num_args,
    prorettype::regtype as return_type,
    prosrc as source_code_preview
FROM pg_proc 
WHERE proname = 'handle_new_user_and_referral';

-- 15b. Cek sederhana function handle_new_user_and_referral
SELECT proname
FROM pg_proc
WHERE proname = 'handle_new_user_and_referral';

-- 16. Cek apakah trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_condition
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 16b. Drop dan recreate trigger on_auth_user_created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 16c. Buat function handle_new_user_and_referral terlebih dahulu
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
BEGIN
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

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_and_referral();

-- 17. Cek constraint yang sudah ada di referrals table
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.referrals'::regclass
ORDER BY conname;

-- 18. Lihat detail referral dengan email
SELECT
  r.created_at,
  r.referral_code,
  p1.email as referrer_email,
  p2.email as referred_email
FROM public.referrals r
LEFT JOIN public.profiles p1 ON p1.id = r.referrer_id
LEFT JOIN public.profiles p2 ON p2.id = r.referred_id
ORDER BY r.created_at DESC;

-- 18b. Lihat 20 referral terakhir dengan email
SELECT
  r.created_at,
  r.referral_code,
  p1.email as referrer_email,
  p2.email as referred_email
FROM public.referrals r
LEFT JOIN public.profiles p1 ON p1.id = r.referrer_id
LEFT JOIN public.profiles p2 ON p2.id = r.referred_id
ORDER BY r.created_at DESC
LIMIT 20;

-- 18c. Buat view v_referrals_expanded
CREATE OR REPLACE VIEW public.v_referrals_expanded AS
SELECT
  r.id,
  r.created_at,
  r.referral_code,
  r.referrer_id,
  p1.email as referrer_email,
  p1.full_name as referrer_name,
  r.referred_id,
  p2.email as referred_email,
  p2.full_name as referred_name
FROM public.referrals r
LEFT JOIN public.profiles p1 ON p1.id = r.referrer_id
LEFT JOIN public.profiles p2 ON p2.id = r.referred_id;

-- 19. Buat function get_my_downline
CREATE OR REPLACE FUNCTION public.get_my_downline()
RETURNS TABLE (
  referred_id UUID,
  referred_email TEXT,
  referred_full_name TEXT,
  created_at TIMESTAMPTZ,
  referral_code TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.referred_id,
    p.email,
    p.full_name,
    r.created_at,
    r.referral_code
  FROM public.referrals r
  JOIN public.profiles p ON p.id = r.referred_id
  WHERE r.referrer_id = auth.uid()
GRANT EXECUTE ON FUNCTION public.get_my_downline() TO authenticated;

-- 20. Setup RLS policies-- Enable RLS for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- Policy: Admin users can view all profiles
DROP POLICY IF EXISTS "profiles_admin_read" ON public.profiles;
CREATE POLICY "profiles_admin_read" ON public.profiles
FOR SELECT
USING (id IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- Policy: Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE
USING (id = auth.uid());

-- Policy: Admin users can update any profile
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update" ON public.profiles
FOR UPDATE
USING (id IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- Policy: Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT
WITH CHECK (id = auth.uid());

-- Policy: Admin users can insert any profile
DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;
CREATE POLICY "profiles_admin_insert" ON public.profiles
FOR INSERT
WITH CHECK (id IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- Policy: Users can view referral codes they created
DROP POLICY IF EXISTS "referral_codes_select_own" ON public.referral_codes;
CREATE POLICY "referral_codes_select_own" ON public.referral_codes
FOR SELECT
USING (created_by = auth.uid());

-- Policy: Admin users can view all referral codes
DROP POLICY IF EXISTS "referral_codes_admin_read" ON public.referral_codes;
CREATE POLICY "referral_codes_admin_read" ON public.referral_codes
FOR SELECT
USING (created_by IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- Policy: Users can view referrals they made or received
DROP POLICY IF EXISTS "referrals_select_own" ON public.referrals;
CREATE POLICY "referrals_select_own" ON public.referrals
FOR SELECT
USING (referrer_id = auth.uid() OR referred_id = auth.uid());

-- Policy: Admin users can view all referrals
DROP POLICY IF EXISTS "referrals_admin_read" ON public.referrals;
CREATE POLICY "referrals_admin_read" ON public.referrals
FOR SELECT
USING (referrer_id IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')) 
     OR referred_id IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- Policy: Users can view referral audit logs they created
DROP POLICY IF EXISTS "referral_audit_logs_select_own" ON public.referral_audit_logs;
CREATE POLICY "referral_audit_logs_select_own" ON public.referral_audit_logs
FOR SELECT
USING (actor_user_id = auth.uid());

-- Policy: Admin users can view all referral audit logs
DROP POLICY IF EXISTS "referral_audit_logs_admin_read" ON public.referral_audit_logs;
CREATE POLICY "referral_audit_logs_admin_read" ON public.referral_audit_logs
FOR SELECT
USING (actor_user_id IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- Policy: Users can update referral audit logs they created
DROP POLICY IF EXISTS "referral_audit_logs_update_own" ON public.referral_audit_logs;
CREATE POLICY "referral_audit_logs_update_own" ON public.referral_audit_logs
FOR UPDATE
USING (actor_user_id = auth.uid());

-- Policy: Admin users can update any referral audit logs
DROP POLICY IF EXISTS "referral_audit_logs_admin_update" ON public.referral_audit_logs;
CREATE POLICY "referral_audit_logs_admin_update" ON public.referral_audit_logs
FOR UPDATE
USING (actor_user_id IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- Policy: Users can insert referral audit logs
DROP POLICY IF EXISTS "referral_audit_logs_insert_own" ON public.referral_audit_logs;
CREATE POLICY "referral_audit_logs_insert_own" ON public.referral_audit_logs
FOR INSERT
WITH CHECK (actor_user_id = auth.uid());

-- Policy: Admin users can insert any referral audit logs
DROP POLICY IF EXISTS "referral_audit_logs_admin_insert" ON public.referral_audit_logs;
CREATE POLICY "referral_audit_logs_admin_insert" ON public.referral_audit_logs
FOR INSERT
WITH CHECK (actor_user_id IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- Policy: Users can view vendor applications they submitted
DROP POLICY IF EXISTS "vendor_applications_select_own" ON public.vendor_applications;
CREATE POLICY "vendor_applications_select_own" ON public.vendor_applications
FOR SELECT
USING (submitted_by = auth.uid());

-- Policy: Admin users can view all vendor applications
DROP POLICY IF EXISTS "vendor_applications_admin_read" ON public.vendor_applications;
CREATE POLICY "vendor_applications_admin_read" ON public.vendor_applications
FOR SELECT
USING (submitted_by IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- Policy: Users can update vendor applications they submitted
DROP POLICY IF EXISTS "vendor_applications_update_own" ON public.vendor_applications;
CREATE POLICY "vendor_applications_update_own" ON public.vendor_applications
FOR UPDATE
USING (submitted_by = auth.uid());

-- Policy: Admin users can update any vendor applications
DROP POLICY IF EXISTS "vendor_applications_admin_update" ON public.vendor_applications;
CREATE POLICY "vendor_applications_admin_update" ON public.vendor_applications
FOR UPDATE
USING (submitted_by IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- Policy: Users can insert vendor applications
DROP POLICY IF EXISTS "vendor_applications_insert_own" ON public.vendor_applications;
CREATE POLICY "vendor_applications_insert_own" ON public.vendor_applications
FOR INSERT
WITH CHECK (submitted_by = auth.uid());

-- Policy: Admin users can insert any vendor applications
DROP POLICY IF EXISTS "vendor_applications_admin_insert" ON public.vendor_applications;
CREATE POLICY "vendor_applications_admin_insert" ON public.vendor_applications
FOR INSERT
WITH CHECK (submitted_by IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- Member hanya boleh SELECT data yang referrer_id = dirinya atau referred_id = dirinya
DROP POLICY IF EXISTS "referrals_select_self" ON public.referrals;

CREATE POLICY "referrals_select_self"
ON public.referrals
FOR SELECT
TO authenticated
USING (
  referrer_id = auth.uid()
  OR referred_id = auth.uid()
);

-- Insert/Update/Delete sebaiknya hanya lewat trigger/function (bukan dari user)
DROP POLICY IF EXISTS "referrals_no_write" ON public.referrals;

CREATE POLICY "referrals_no_write"
ON public.referrals
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- 21. Buat function is_admin() untuk admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','super_admin')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 22. Buat function admin_list_referrals untuk admin dashboard
CREATE OR REPLACE FUNCTION public.admin_list_referrals(
  q TEXT DEFAULT NULL,
  limit_count INT DEFAULT 200,
  offset_count INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  referral_code TEXT,
  referrer_id UUID,
  referrer_email TEXT,
  referrer_full_name TEXT,
  referred_id UUID,
  referred_email TEXT,
  referred_full_name TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id,
    r.created_at,
    r.referral_code,
    r.referrer_id,
    p1.email AS referrer_email,
    p1.full_name AS referrer_full_name,
    r.referred_id,
    p2.email AS referred_email,
    p2.full_name AS referred_full_name
  FROM public.referrals r
  LEFT JOIN public.profiles p1 ON p1.id = r.referrer_id
  LEFT JOIN public.profiles p2 ON p2.id = r.referred_id
  WHERE public.is_admin()
    AND (
      q IS NULL
      OR q = ''
      OR p1.email ILIKE '%'||q||'%'
      OR p2.email ILIKE '%'||q||'%'
      OR p1.full_name ILIKE '%'||q||'%'
      OR p2.full_name ILIKE '%'||q||'%'
      OR r.referral_code ILIKE '%'||q||'%'
    )
  ORDER BY r.created_at DESC
  LIMIT GREATEST(limit_count, 1)
  OFFSET GREATEST(offset_count, 0);
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_referrals(TEXT,INT,INT) TO authenticated;

-- 23. Cek admin users
SELECT id, email, role 
FROM public.profiles 
WHERE role IN ('admin', 'super_admin');

-- 24. Buat function admin_update_referral_code
CREATE OR REPLACE FUNCTION public.admin_update_referral_code(
  code_in TEXT,
  is_active_in BOOLEAN DEFAULT NULL,
  can_invite_in BOOLEAN DEFAULT NULL,
  max_uses_in INT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'admin only';
  END IF;

  UPDATE public.referral_codes
  SET
    is_active = COALESCE(is_active_in, is_active),
    can_invite = COALESCE(can_invite_in, can_invite),
    max_uses = max_uses_in
  WHERE code = UPPER(TRIM(code_in));
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_referral_code(TEXT,BOOLEAN,BOOLEAN,INT) TO authenticated;

-- 25. Buat function admin_reset_referral_code_usage
CREATE OR REPLACE FUNCTION public.admin_reset_referral_code_usage(code_in TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'admin only';
  END IF;

  UPDATE public.referral_codes
  SET uses_count = 0
  WHERE code = UPPER(TRIM(code_in));
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_reset_referral_code_usage(TEXT) TO authenticated;

-- 26. Buat function handle_new_user_profile_only (tanpa referral logic)
CREATE OR REPLACE FUNCTION public.handle_new_user_profile_only()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email,'@',1))
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;

  RETURN NEW;
END;
$$;

-- 26b. Update trigger untuk menggunakan function yang lebih sederhana
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_profile_only();

-- 27. Buat function handle_user_confirmed_referral
CREATE OR REPLACE FUNCTION public.handle_user_confirmed_referral()
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
BEGIN
  IF OLD.confirmed_at IS NOT NULL OR NEW.confirmed_at IS NULL THEN
    RETURN NEW;
  END IF;

  v_code := UPPER(TRIM(COALESCE(NEW.raw_user_meta_data->>'referral_code', '')));
  IF v_code = '' THEN
    INSERT INTO public.referral_audit_logs(action, actor_user_id, target_user_id, meta)
    VALUES ('CONFIRM_NO_CODE', NULL, NEW.id, JSONB_BUILD_OBJECT('email', NEW.email));
    RETURN NEW;
  END IF;

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
    INSERT INTO public.referral_audit_logs(action, referral_code, target_user_id, meta)
    VALUES ('CONFIRM_INVALID_CODE', v_code, NEW.id, JSONB_BUILD_OBJECT('email', NEW.email));
    RETURN NEW;
  END IF;

  IF COALESCE(v_is_active,FALSE) = FALSE THEN
    INSERT INTO public.referral_audit_logs(action, referral_code, target_user_id, meta)
    VALUES ('CONFIRM_CODE_INACTIVE', v_code, NEW.id, JSONB_BUILD_OBJECT('email', NEW.email));
    RETURN NEW;
  END IF;

  IF COALESCE(v_can_invite,TRUE) = FALSE THEN
    INSERT INTO public.referral_audit_logs(action, referral_code, target_user_id, meta)
    VALUES ('CONFIRM_CODE_NO_INVITE', v_code, NEW.id, JSONB_BUILD_OBJECT('email', NEW.email));
    RETURN NEW;
  END IF;

  IF v_max_uses IS NOT NULL AND COALESCE(v_uses_count,0) >= v_max_uses THEN
    INSERT INTO public.referral_audit_logs(action, referral_code, target_user_id, meta)
    VALUES ('CONFIRM_CODE_QUOTA', v_code, NEW.id, JSONB_BUILD_OBJECT('email', NEW.email));
    RETURN NEW;
  END IF;

  IF v_referrer = NEW.id THEN
    INSERT INTO public.referral_audit_logs(action, referral_code, target_user_id)
    VALUES ('CONFIRM_SELF_REFERRAL_BLOCK', v_code, NEW.id);
    RETURN NEW;
  END IF;

  INSERT INTO public.referrals (referrer_id, referred_id, referral_code)
  VALUES (v_referrer, NEW.id, v_code)
  ON CONFLICT (referred_id) DO NOTHING;

  IF FOUND THEN
    UPDATE public.referral_codes
    SET uses_count = COALESCE(uses_count,0) + 1
    WHERE code = v_code;

    INSERT INTO public.referral_audit_logs(action, referral_code, actor_user_id, target_user_id, meta)
    VALUES ('CONFIRM_REFERRAL_RECORDED', v_code, v_referrer, NEW.id, JSONB_BUILD_OBJECT('email', NEW.email));
  ELSE
    INSERT INTO public.referral_audit_logs(action, referral_code, actor_user_id, target_user_id, meta)
    VALUES ('CONFIRM_DUPLICATE_IGNORED', v_code, v_referrer, NEW.id, JSONB_BUILD_OBJECT('email', NEW.email));
  END IF;

  RETURN NEW;
END;
$$;

-- 27b. Buat trigger on_auth_user_confirmed
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

CREATE TRIGGER on_auth_user_confirmed
AFTER UPDATE OF confirmed_at ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_confirmed_referral();

-- 28. Buat referral_audit_logs table
CREATE TABLE IF NOT EXISTS public.referral_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  referral_code TEXT,
  actor_user_id UUID,
  target_user_id UUID,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.referral_audit_logs ENABLE ROW LEVEL SECURITY;

-- 28b. Setup RLS policy untuk audit logs
DROP POLICY IF EXISTS "audit_admin_read" ON public.referral_audit_logs;

CREATE POLICY "audit_admin_read"
ON public.referral_audit_logs
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 29. Buat function admin_top_referrers (updated version)
CREATE OR REPLACE FUNCTION public.admin_top_referrers(limit_count INT DEFAULT 10)
RETURNS TABLE (
  referrer_id UUID,
  referrer_email TEXT,
  referrer_full_name TEXT,
  total_downline BIGINT,
  last_join_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.referrer_id,
    p.email AS referrer_email,
    p.full_name AS referrer_full_name,
    COUNT(*) AS total_downline,
    MAX(r.created_at) AS last_join_at
  FROM public.referrals r
  LEFT JOIN public.profiles p ON p.id = r.referrer_id
  WHERE public.is_admin()
  GROUP BY r.referrer_id, p.email, p.full_name
  ORDER BY total_downline DESC, last_join_at DESC
  LIMIT GREATEST(limit_count, 1);
$$;

GRANT EXECUTE ON FUNCTION public.admin_top_referrers(INT) TO authenticated;

-- 30. Buat view v_referral_audit_logs dengan email details
CREATE OR REPLACE VIEW public.v_referral_audit_logs AS
SELECT
  l.id,
  l.created_at,
  l.action,
  l.referral_code,
  l.actor_user_id,
  pa.email AS actor_email,
  l.target_user_id,
  pt.email AS target_email,
  l.meta
FROM public.referral_audit_logs l
LEFT JOIN public.profiles pa ON pa.id = l.actor_user_id
LEFT JOIN public.profiles pt ON pt.id = l.target_user_id
ORDER BY l.created_at DESC;

-- 31. Buat function admin_list_referral_audit_logs dengan search
CREATE OR REPLACE FUNCTION public.admin_list_referral_audit_logs(
  q TEXT DEFAULT NULL,
  limit_count INT DEFAULT 200,
  offset_count INT DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,
  created_at TIMESTAMPTZ,
  action TEXT,
  referral_code TEXT,
  actor_user_id UUID,
  actor_email TEXT,
  target_user_id UUID,
  target_email TEXT,
  meta JSONB
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    l.id,
    l.created_at,
    l.action,
    l.referral_code,
    l.actor_user_id,
    pa.email AS actor_email,
    l.target_user_id,
    pt.email AS target_email,
    l.meta
  FROM public.referral_audit_logs l
  LEFT JOIN public.profiles pa ON pa.id = l.actor_user_id
  LEFT JOIN public.profiles pt ON pt.id = l.target_user_id
  WHERE public.is_admin()
    AND (
      q IS NULL OR q = ''
      OR l.action ILIKE '%'||q||'%'
      OR l.referral_code ILIKE '%'||q||'%'
      OR pa.email ILIKE '%'||q||'%'
      OR pt.email ILIKE '%'||q||'%'
      OR CAST(l.meta AS TEXT) ILIKE '%'||q||'%'
    )
  ORDER BY l.created_at DESC
  LIMIT GREATEST(limit_count, 1)
  OFFSET GREATEST(offset_count, 0);
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_referral_audit_logs(TEXT,INT,INT) TO authenticated;
