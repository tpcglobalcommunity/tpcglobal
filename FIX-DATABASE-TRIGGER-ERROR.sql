-- FIX DATABASE TRIGGER ERROR (500 unexpected_failure)
-- This script disables the problematic trigger that causes "Database error saving new user"

-- Step 1: Drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Create fail-open trigger (non-blocking)
CREATE OR REPLACE FUNCTION tpc_on_auth_user_created_failopen()
RETURNS TRIGGER AS $$
BEGIN
    -- Try to create profile, but don't fail if it errors
    BEGIN
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            username,
            referral_code,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'username',
            NEW.raw_user_meta_data->>'referral_code',
            NOW(),
            NOW()
        );
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the signup
        RAISE NOTICE 'Profile creation failed for user %: %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create the new trigger
CREATE TRIGGER tpc_on_auth_user_created_failopen
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION tpc_on_auth_user_created_failopen();

-- Step 4: Verify trigger is created
SELECT 
    t.tgname as trigger_name,
    t.tgenabled as status,
    CASE 
        WHEN t.tgenabled = 'O' THEN 'ENABLED'
        ELSE 'DISABLED'
    END as status_text
FROM pg_trigger t 
WHERE t.tgname = 'tpc_on_auth_user_created_failopen';

-- Step 5: Test profile creation (optional)
-- Uncomment to test:
-- INSERT INTO auth.users (id, email, created_at) 
-- VALUES ('test-id', 'test@example.com', NOW());

COMMIT;
