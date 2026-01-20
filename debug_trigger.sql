-- DEBUG: Cek apakah trigger ada dan error
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name,
  tgenabled as is_enabled
FROM pg_trigger 
WHERE tgrelid = 'public.profiles'::regclass;

-- DEBUG: Cek function trigger
SELECT 
  proname as function_name,
  prosrc as source_code
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- DEBUG: Test trigger secara manual (jalankan ini untuk test)
-- Buat user test dummy untuk melihat error detail
DO $$
DECLARE
  test_user_id uuid := gen_random_uuid();
BEGIN
  -- Simulasi insert ke auth.users
  INSERT INTO auth.users (id, email, raw_user_meta_data)
  VALUES (
    test_user_id,
    'test@example.com',
    '{"username": "testuser", "referral_code": "TEST123"}'::jsonb
  );
  
  -- Cek apakah trigger jalan
  PERFORM pg_sleep(1);
  
  -- Cleanup test
  DELETE FROM auth.users WHERE id = test_user_id;
  DELETE FROM public.profiles WHERE id = test_user_id;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error: %', SQLERRM;
  -- Cleanup test
  DELETE FROM auth.users WHERE id = test_user_id;
  DELETE FROM public.profiles WHERE id = test_user_id;
END $$;
