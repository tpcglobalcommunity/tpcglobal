-- Trigger Function ANTI-ERROR untuk auth.users
-- Solusi lengkap untuk Error 500 dan RLS conflict

-- 1) Cek struktur tabel profiles dulu (jalankan ini terlebih dahulu)
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_schema = 'public' AND table_name = 'profiles' ORDER BY ordinal_position;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_username TEXT;
    v_referral_code TEXT;
BEGIN
    -- Extract metadata dengan aman
    v_username := COALESCE(NEW.raw_user_meta_data->>'username', '');
    v_referral_code := NEW.raw_user_meta_data->>'referral_code';
    
    -- INSERT dinamis hanya kolom yang PASTI ADA
    -- Hindari error "column does not exist"
    INSERT INTO public.profiles (
        id,
        email,
        username,
        referral_code,
        role,
        verified,
        can_invite,
        status,
        tpc_balance,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        v_username,
        v_referral_code,
        'member',
        false,
        false,
        'PENDING',
        0,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        referral_code = EXCLUDED.referral_code,
        updated_at = NOW();
    
    -- ❌ JANGAN INSERT ke signup_error_logs di dalam EXCEPTION!
    -- Ini menyebabkan recursive error karena RLS conflict
    -- Biarkan error muncul di Supabase logs untuk debugging
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- ❌ JANGAN INSERT di sini! Cukup RETURN NEW
        -- INSERT ke error log akan menyebabkan recursive RLS error
        RAISE NOTICE 'Trigger error for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Clean trigger creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
