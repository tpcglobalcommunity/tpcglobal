-- =========================================================
-- TPC REFERRAL SYSTEM (PRODUCTION SAFE)
-- Works with existing trigger: set_member_code on profiles
-- =========================================================

-- 1) referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMED', -- CONFIRMED, REWARDED, CANCELLED
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (referrer_id, referred_id),
  UNIQUE (referred_id) -- 1 user cuma boleh punya 1 upline
);

-- 2) profiles columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0;

-- 3) indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred  ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_member_code ON public.profiles(member_code);

-- 4) validate referral code (public-safe)
CREATE OR REPLACE FUNCTION public.validate_referral_code_public(p_referral_code TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  referrer_id UUID,
  referrer_username TEXT,
  referrer_member_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (p.id IS NOT NULL) AS is_valid,
    p.id AS referrer_id,
    p.username AS referrer_username,
    p.member_code AS referrer_member_code
  FROM public.profiles p
  WHERE p.member_code = UPPER(TRIM(p_referral_code))
    AND p.status = 'ACTIVE'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5) process referral after signup (safe RPC)
CREATE OR REPLACE FUNCTION public.process_referral_after_signup(
  p_new_user_id UUID,
  p_referral_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_referrer_id UUID;
  v_referral_exists BOOLEAN;
BEGIN
  -- Get referrer ID from validation
  SELECT referrer_id INTO v_referrer_id
  FROM public.validate_referral_code_public(p_referral_code)
  WHERE is_valid = TRUE
  LIMIT 1;
  
  -- Exit if invalid referral
  IF v_referrer_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if referral already processed
  SELECT EXISTS(
    SELECT 1 FROM public.referrals 
    WHERE referred_id = p_new_user_id
  ) INTO v_referral_exists;
  
  -- Exit if already exists
  IF v_referral_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Update new user profile with referrer
  UPDATE public.profiles
  SET referred_by = v_referrer_id
  WHERE id = p_new_user_id;
  
  -- Insert referral record
  INSERT INTO public.referrals (
    referrer_id,
    referred_id,
    referral_code,
    status
  ) VALUES (
    v_referrer_id,
    p_new_user_id,
    p_referral_code,
    'CONFIRMED'
  );
  
  -- Increment referrer count
  UPDATE public.profiles
  SET referral_count = referral_count + 1
  WHERE id = v_referrer_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6) Update existing trigger to use RPC
CREATE OR REPLACE FUNCTION public.set_member_code()
RETURNS TRIGGER AS $$
DECLARE
  v_member_code TEXT;
  v_referral_code TEXT;
  v_referrer_id UUID;
BEGIN
  -- Generate unique member code
  v_member_code := 'TPC-' || UPPER(substr(md5(NEW.id || random()::text), 1, 6));
  
  -- Get referral code from meta data
  v_referral_code := NEW.raw_user_meta_data->>'referral_code';
  
  -- Get referrer ID via RPC (safe)
  SELECT referrer_id INTO v_referrer_id
  FROM public.validate_referral_code_public(v_referral_code)
  WHERE is_valid = TRUE
  LIMIT 1;
  
  -- Insert/update profile
  INSERT INTO public.profiles (
    id,
    email,
    username,
    referral_code,
    member_code,
    referred_by,
    role,
    status,
    referral_count,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    v_referral_code,
    v_member_code,
    v_referrer_id,
    'member',
    'PENDING',
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    referral_code = EXCLUDED.referral_code,
    member_code = EXCLUDED.member_code,
    referred_by = EXCLUDED.referred_by,
    updated_at = NOW();
  
  -- Process referral tracking (async via RPC)
  PERFORM public.process_referral_after_signup(NEW.id, v_referral_code);
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in set_member_code trigger: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7) RLS policies for referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals
CREATE POLICY "Users view own referrals" ON public.referrals
  FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());

-- Service role can insert (via RPC)
CREATE POLICY "Service insert referrals" ON public.referrals
  FOR INSERT WITH CHECK (true);

-- 8) Grant permissions
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_referral_after_signup(UUID, TEXT) TO authenticated;
GRANT SELECT ON public.referrals TO authenticated;
GRANT SELECT ON public.referrals TO anon;

-- 9) Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_signup ON auth.users;
CREATE TRIGGER on_auth_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.set_member_code();

-- 10) Verification queries
SELECT 'TPC Referral System setup completed' as status;

-- Check trigger
SELECT tgname, pg_get_triggerdef(oid, true) as definition
FROM pg_trigger 
WHERE tgname = 'on_auth_user_signup';

-- Check functions
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname IN ('validate_referral_code_public', 'process_referral_after_signup', 'set_member_code')
ORDER BY proname;
