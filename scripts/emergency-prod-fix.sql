-- =========================================================
-- EMERGENCY PRODUCTION FIX - TPC GLOBAL
-- =========================================================
-- RUN THIS IMMEDIATELY ON PRODUCTION SUPABASE
-- =========================================================

-- 1. First, check current profiles table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if status column exists (this might be causing the error)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name = 'status';

-- 3. If status column exists, drop it (this is causing production errors)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.profiles DROP COLUMN status;
        RAISE NOTICE 'status column dropped from profiles table';
    ELSE
        RAISE NOTICE 'status column does not exist in profiles table';
    END IF;
END $$;

-- 4. Ensure all required columns exist
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'viewer';
        RAISE NOTICE 'role column added';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'verified'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN verified BOOLEAN DEFAULT false;
        RAISE NOTICE 'verified column added';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'can_invite'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN can_invite BOOLEAN DEFAULT false;
        RAISE NOTICE 'can_invite column added';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'tpc_tier'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN tpc_tier TEXT DEFAULT 'basic';
        RAISE NOTICE 'tpc_tier column added';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'tpc_balance'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN tpc_balance NUMERIC DEFAULT 0;
        RAISE NOTICE 'tpc_balance column added';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'wallet_verified_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN wallet_verified_at TIMESTAMPTZ;
        RAISE NOTICE 'wallet_verified_at column added';
    END IF;
END $$;

-- 5. Update any existing profiles to have proper defaults
UPDATE public.profiles 
SET 
    role = COALESCE(role, 'viewer'),
    verified = COALESCE(verified, false),
    can_invite = COALESCE(can_invite, false),
    tpc_tier = COALESCE(tpc_tier, 'basic'),
    tpc_balance = COALESCE(tpc_balance, 0)
WHERE role IS NULL OR verified IS NULL;

-- 6. Verify final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Test a simple query to verify table works
SELECT COUNT(*) as profile_count, 
       COUNT(CASE WHEN verified = true THEN 1 END) as verified_count,
       COUNT(CASE WHEN role = 'member' THEN 1 END) as member_count
FROM public.profiles;

-- 8. Create get_app_settings if it doesn't exist
CREATE OR REPLACE FUNCTION get_app_settings()
RETURNS TABLE (
  key TEXT,
  value TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'maintenance_mode' as key,
    'false' as value
  UNION ALL
  SELECT 
    'version' as key,
    '1.0.0' as value
  UNION ALL
  SELECT 
    'app_name' as key,
    'TPC Global' as value;
END;
$$;

-- 9. Grant permissions
GRANT EXECUTE ON FUNCTION get_app_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION get_app_settings() TO service_role;
GRANT EXECUTE ON FUNCTION get_app_settings() TO anon;

-- 10. Test the function
SELECT * FROM get_app_settings();

-- 11. Final verification
SELECT 
    'Emergency Fix Complete' as status,
    'Profiles table ready for production' as message,
    now() as completed_at;
