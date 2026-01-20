-- Trigger Function Lengkap untuk auth.users
-- Version final dengan semua kolom dan error handling

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
    -- Extract data dari metadata dengan aman
    v_username := COALESCE(NEW.raw_user_meta_data->>'username', '');
    v_referral_code := NEW.raw_user_meta_data->>'referral_code';
    
    -- Insert ke profiles dengan semua kolom
    INSERT INTO public.profiles (
        id,
        email,
        username,
        referral_code,
        role,
        verified,
        can_invite,
        status,
        full_name,
        telegram,
        phone,
        city,
        wallet_address,
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
        NULL,  -- full_name diisi setelah login
        NULL,  -- telegram diisi setelah login
        NULL,  -- phone diisi setelah login
        NULL,  -- city diisi setelah login
        NULL,  -- wallet_address diisi setelah login
        0,     -- tpc_balance default 0
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        referral_code = EXCLUDED.referral_code,
        updated_at = NOW();
    
    -- Log untuk debugging (opsional)
    INSERT INTO public.signup_error_logs (
        user_id,
        email,
        error_message,
        created_at
    ) VALUES (
        NEW.id,
        NEW.email,
        'User created successfully via trigger',
        NOW()
    ) ON CONFLICT DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error jika insert gagal
        INSERT INTO public.signup_error_logs (
            user_id,
            email,
            error_message,
            created_at
        ) VALUES (
            NEW.id,
            NEW.email,
            'Trigger error: ' || SQLERRM,
            NOW()
        ) ON CONFLICT DO NOTHING;
        
        -- Return NEW agar tidak blocking
        RETURN NEW;
END;
$$;

-- Trigger yang memanggil function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
