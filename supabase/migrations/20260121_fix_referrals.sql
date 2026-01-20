-- Migration: Fix Referrals End-to-End
-- Date: 2024-01-21
-- Purpose: 
-- 1. Ensure referral_code column exists
-- 2. Create referral code generator function
-- 3. Create auto-generate trigger
-- 4. Backfill existing users
-- 5. Create referral analytics RPC function
-- 6. Grant permissions and reload schema cache

-- STEP 1: Ensure referral_code column exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- STEP 2: Create referral code generator function
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
BEGIN
  LOOP
    code := 'TPC-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 8));
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE referral_code = code
    );
  END LOOP;
  RETURN code;
END;
$$;

-- STEP 3: Create auto-generate trigger function
CREATE OR REPLACE FUNCTION public.set_referral_code_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := public.generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

-- STEP 4: Create trigger for auto-generation
DROP TRIGGER IF EXISTS trg_set_referral_code_on_insert ON public.profiles;

CREATE TRIGGER trg_set_referral_code_on_insert
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_referral_code_on_insert();

-- STEP 5: Backfill existing users without referral codes
UPDATE public.profiles
SET referral_code = public.generate_referral_code()
WHERE referral_code IS NULL OR referral_code = '';

-- STEP 6: Create referral analytics RPC function
CREATE OR REPLACE FUNCTION public.get_my_referral_analytics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID;
  my_code TEXT;
  total_count INTEGER;
  recent_count INTEGER;
  ref_list JSONB;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT referral_code INTO my_code
  FROM public.profiles
  WHERE id = uid;

  IF my_code IS NULL OR my_code = '' THEN
    RETURN JSONB_BUILD_OBJECT(
      'my_referral_code', NULL,
      'total_referrals', 0,
      'recent_referrals', 0,
      'referrals', '[]'::JSONB
    );
  END IF;

  SELECT COUNT(*) INTO total_count
  FROM public.profiles
  WHERE referred_by = my_code;

  SELECT COUNT(*) INTO recent_count
  FROM public.profiles
  WHERE referred_by = my_code
    AND created_at >= NOW() - INTERVAL '7 days';

  SELECT COALESCE(
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'id', id,
        'full_name', full_name,
        'email', email,
        'created_at', created_at
      )
      ORDER BY created_at DESC
    ),
    '[]'::JSONB
  )
  INTO ref_list
  FROM public.profiles
  WHERE referred_by = my_code;

  RETURN JSONB_BUILD_OBJECT(
    'my_referral_code', my_code,
    'total_referrals', total_count,
    'recent_referrals', recent_count,
    'referrals', ref_list
  );
END;
$$;

-- STEP 7: Grant permissions
REVOKE ALL ON FUNCTION public.get_my_referral_analytics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_referral_analytics() TO AUTHENTICATED;

-- STEP 8: Reload PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- STEP 9: Verification queries
-- Check referral codes
SELECT 
  COUNT(*) AS total_profiles,
  COUNT(referral_code) AS profiles_with_code,
  COUNT(*) - COUNT(referral_code) AS profiles_without_code
FROM public.profiles;

-- Check RPC function registration
SELECT 
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS args,
  pg_get_function_result(p.oid) AS return_type
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'get_my_referral_analytics';
