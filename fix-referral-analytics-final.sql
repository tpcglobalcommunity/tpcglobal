BEGIN;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_code text;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referred_by_code text;

-- Drop function lama agar bisa ganti return type
DROP FUNCTION IF EXISTS public.get_my_referral_analytics();

CREATE FUNCTION public.get_my_referral_analytics()
RETURNS TABLE (
  referral_code text,
  total_referrals bigint,
  last_7_days bigint,
  last_30_days bigint,
  invite_status boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_uid uuid := auth.uid();
  my_code text;
  has_can_invite boolean := false;
BEGIN
  SELECT p.referral_code
    INTO my_code
  FROM public.profiles p
  WHERE p.id = my_uid;

  -- cek kolom can_invite ada atau tidak (biar kompatibel)
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name='profiles'
      AND column_name='can_invite'
  ) INTO has_can_invite;

  referral_code := my_code;

  SELECT COUNT(*)
    INTO total_referrals
  FROM public.profiles
  WHERE referred_by_code = my_code;

  SELECT COUNT(*)
    INTO last_7_days
  FROM public.profiles
  WHERE referred_by_code = my_code
    AND created_at >= now() - interval '7 days';

  SELECT COUNT(*)
    INTO last_30_days
  FROM public.profiles
  WHERE referred_by_code = my_code
    AND created_at >= now() - interval '30 days';

  IF has_can_invite THEN
    SELECT COALESCE(can_invite, true)
      INTO invite_status
    FROM public.profiles
    WHERE id = my_uid;
  ELSE
    invite_status := true;
  END IF;

  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_referral_analytics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_referral_analytics() TO authenticated;

SELECT pg_notify('pgrst', 'reload schema');

COMMIT;
