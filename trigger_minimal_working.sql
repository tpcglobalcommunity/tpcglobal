-- Trigger Function MINIMAL untuk auth.users
-- Hanya menggunakan kolom yang PASTI ADA untuk menghindari error

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
    v_username := COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8));
    v_referral_code := NEW.raw_user_meta_data->>'referral_code';
    
    -- Insert HANYA kolom yang PASTI ADA
    -- Hindari error "column does not exist"
    INSERT INTO public.profiles (
        id,
        email,
        username,
        referral_code,
        role,
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
        'PENDING',
        0,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        referral_code = EXCLUDED.referral_code,
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- JANGAN INSERT ke signup_error_logs di sini untuk hindari RLS conflict
        -- Cukup RETURN NEW agar user tetap terdaftar
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
