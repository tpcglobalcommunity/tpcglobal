-- Fix trigger function to be non-blocking - UNBLOCK SIGNUP
-- This prevents 500 errors during signup when profile insert fails

-- STEP 1: Find trigger name and function
SELECT
  tgname AS trigger_name,
  pg_get_triggerdef(t.oid) AS trigger_def
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname='auth'
  AND c.relname='users'
  AND NOT t.tgisinternal;

-- STEP 2: Patch function to be fail-open
-- Replace FUNCTION_NAME with actual function name from query above
CREATE OR REPLACE FUNCTION public.FUNCTION_NAME()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  BEGIN
    -- Insert only essential fields that are guaranteed to be available
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO NOTHING;

  EXCEPTION WHEN OTHERS THEN
    -- IMPORTANT: Don't fail the signup! Just log the error.
    RAISE NOTICE 'handle_new_user profile insert failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- STEP 3: Verify the fix
-- Check if trigger still exists and uses the patched function
SELECT
  tgname AS trigger_name,
  pg_get_triggerdef(t.oid) AS trigger_def
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname='auth'
  AND c.relname='users'
  AND NOT t.tgisinternal;
