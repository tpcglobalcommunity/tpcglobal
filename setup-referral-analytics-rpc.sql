-- CREATE OR REPLACE FUNCTION public.get_my_referral_analytics()
CREATE OR REPLACE FUNCTION public.get_my_referral_analytics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
  my_code text;
  total_count int;
  recent_count int;
  ref_list jsonb;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT referral_code INTO my_code
  FROM public.profiles
  WHERE id = uid;

  IF my_code IS NULL OR my_code = '' THEN
    RETURN jsonb_build_object(
      'my_referral_code', NULL,
      'total_referrals', 0,
      'recent_referrals', 0,
      'referrals', '[]'::jsonb
    );
  END IF;

  SELECT count(*) INTO total_count
  FROM public.profiles
  WHERE referred_by = my_code;

  SELECT count(*) INTO recent_count
  FROM public.profiles
  WHERE referred_by = my_code
    AND created_at >= now() - interval '7 days';

  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'full_name', full_name,
        'email', email,
        'created_at', created_at
      )
      ORDER BY created_at DESC
    ),
    '[]'::jsonb
  )
  INTO ref_list
  FROM public.profiles
  WHERE referred_by = my_code;

  RETURN jsonb_build_object(
    'my_referral_code', my_code,
    'total_referrals', total_count,
    'recent_referrals', recent_count,
    'referrals', ref_list
  );
END;
$$;

-- Revoke default + grant:
REVOKE ALL ON FUNCTION public.get_my_referral_analytics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_referral_analytics() TO authenticated;

-- Refresh schema cache:
select pg_notify('pgrst', 'reload schema');
