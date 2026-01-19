-- FINAL FIX: Non-blocking trigger function - UNBLOCK SIGNUP IMMEDIATELY
-- This prevents 500 errors during signup when profile insert fails

-- STEP 1: Find trigger and function name (copy-paste result ke Bang Eko)
SELECT
  tgname AS trigger_name,
  pg_get_triggerdef(t.oid) AS trigger_def
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname='auth'
  AND c.relname='users'
  AND NOT t.tgisinternal;

-- STEP 2: Replace FUNCTION_NAME with actual function name from query above
-- This is the fail-open version that won't break signup
CREATE OR REPLACE FUNCTION public.FUNCTION_NAME()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  BEGIN
    -- Insert only essential fields that are guaranteed to be available
    -- Skip fields that might be NOT NULL to avoid constraint violations
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO NOTHING;

  EXCEPTION WHEN OTHERS THEN
    -- CRITICAL: Don't fail the signup! Just log and continue.
    RAISE NOTICE 'handle_new_user profile insert failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- STEP 3: Verify the fix
SELECT
  tgname AS trigger_name,
  pg_get_triggerdef(t.oid) AS trigger_def
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname='auth'
  AND c.relname='users'
  AND NOT t.tgisinternal;

-- STEP 4: Test immediately
-- Try signup again. Expected result:
-- No 500 error
-- [SIGNUP_API] Success
-- UI shows "Check your email"
