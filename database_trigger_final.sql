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
    v_username := NULLIF(NEW.raw_user_meta_data->>'username', '');
    v_referral_code := NULLIF(NEW.raw_user_meta_data->>'referral_code', '');

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
        username = COALESCE(EXCLUDED.username, public.profiles.username),
        referral_code = COALESCE(EXCLUDED.referral_code, public.profiles.referral_code),
        updated_at = NOW();

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'handle_new_user error % %', SQLSTATE, SQLERRM;
        RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
