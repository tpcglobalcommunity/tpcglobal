# 🚀 EXECUTE REFERRAL FIX NOW - COMPLETE END-TO-END

## 📋 PROBLEM YANG AKAN DIPERBAIKI:
- ❌ PGRST202: "Could not find function public.get_my_referral_analytics"
- ❌ "operator does not exist: uuid = text"
- ❌ "cannot change return type of existing function"
- ❌ UI inconsistency: REFERRAL_CODE_NOT_AVAILABLE / "No code" yang tidak konsisten

## 🔧 LANGKAH 1: SUPABASE SQL (WAJIB DIJALANKAN)

### Buka Supabase Dashboard:
1. Login ke https://supabase.com/dashboard
2. Pilih project "tpcglobal"
3. Klik **SQL Editor** → **New query**

### Copy-paste SELURUH SQL ini:
```sql
-- COMPLETE REFERRAL FIX - EXECUTE ALL AT ONCE
-- Fixes: PGRST202, uuid=text, return type, UI inconsistency

BEGIN;

-- STEP 1: Ensure required columns exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

-- STEP 2: Drop ALL versions of the function to avoid conflicts
DROP FUNCTION IF EXISTS public.get_my_referral_analytics() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_referral_analytics(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_referral_analytics(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_referral_analytics(json) CASCADE;

-- STEP 3: Create function with correct signature and NO type conflicts
CREATE FUNCTION public.get_my_referral_analytics()
RETURNS TABLE (
  referral_code TEXT,
  total_referrals BIGINT,
  last_7_days BIGINT,
  last_30_days BIGINT,
  invite_status BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_uid UUID := auth.uid();
  my_code TEXT;
  has_can_invite BOOLEAN := false;
BEGIN
  -- Get user's referral code safely
  SELECT p.referral_code INTO my_code
  FROM public.profiles p
  WHERE p.id = my_uid;

  -- Initialize return values
  referral_code := my_code;
  total_referrals := 0;
  last_7_days := 0;
  last_30_days := 0;
  invite_status := true;

  -- Check if can_invite column exists (compatibility)
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name='profiles'
      AND column_name='can_invite'
  ) INTO has_can_invite;

  -- Count total referrals (explicit cast to avoid uuid=text error)
  SELECT COUNT(*)::BIGINT INTO total_referrals
  FROM public.profiles
  WHERE referred_by_code = my_code::TEXT;

  -- Count last 7 days
  SELECT COUNT(*)::BIGINT INTO last_7_days
  FROM public.profiles
  WHERE referred_by_code = my_code::TEXT
    AND created_at >= NOW() - INTERVAL '7 days';

  -- Count last 30 days
  SELECT COUNT(*)::BIGINT INTO last_30_days
  FROM public.profiles
  WHERE referred_by_code = my_code::TEXT
    AND created_at >= NOW() - INTERVAL '30 days';

  -- Get invite status if column exists
  IF has_can_invite THEN
    SELECT COALESCE(can_invite, TRUE) INTO invite_status
    FROM public.profiles
    WHERE id = my_uid;
  END IF;

  RETURN NEXT;
END;
$$;

-- STEP 4: Grant permissions
REVOKE ALL ON FUNCTION public.get_my_referral_analytics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_referral_analytics() TO AUTHENTICATED;

-- STEP 5: Reload PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- STEP 6: Generate referral codes for users who don't have them
UPDATE public.profiles
SET referral_code = 'TPC-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 8))
WHERE referral_code IS NULL OR referral_code = '';

COMMIT;

-- STEP 7: Verification queries
SELECT 'Function created successfully' AS status;

SELECT 
  proname AS function_name,
  pg_get_function_identity_arguments(oid) AS args,
  pg_get_function_result(oid) AS return_type
FROM pg_proc 
WHERE proname = 'get_my_referral_analytics';

SELECT 
  COUNT(*) AS total_users,
  COUNT(referral_code) AS users_with_code,
  COUNT(*) - COUNT(referral_code) AS users_without_code
FROM public.profiles;
```

### Klik **RUN** dan tunggu hasilnya.

**Expected Results:**
```
✅ Function created successfully
✅ function_name = get_my_referral_analytics, args = (none), return_type = table
✅ users_with_code = total_users, users_without_code = 0
```

## 🌐 LANGKAH 2: FRONTEND TEST

### Test Dashboard:
1. Buka: http://localhost:5174/en/member/dashboard
2. Expected: `TPC-XXXXXXXX` atau "No code yet"
3. Copy button harus berfungsi

### Test Referrals Page:
1. Buka: http://localhost:5174/en/member/referrals
2. Buka **Network tab** → Refresh
3. Expected: `POST /rpc/get_my_referral_analytics → 200 OK`
4. UI harus tampil analytics data

### Console Check:
- ❌ Tidak ada "PGRST202"
- ❌ Tidak ada "uuid = text" 
- ❌ Tidak ada "cannot change return type"
- ❌ Tidak ada "toUpperCase of undefined"

## 🎯 TARGET YANG HARUS TERCAPAI:

### ✅ Dashboard:
```
Your Referral Code: TPC-1A2B3C4D
[Copy Code] [Copy Link] [Copy Verify Link]
```

### ✅ Referrals Page:
```
Total Referrals: 5
Last 7 Days: 2  
Last 30 Days: 5
Invite Status: Active

Your Referral Code: TPC-1A2B3C4D
[Copy] [Copy Signup Link] [Copy Verify Link]
```

### ✅ Network:
```
POST /rpc/get_my_referral_analytics
Status: 200 OK
Response: { referral_code: "TPC-1A2B3C4D", total_referrals: 5, ... }
```

## 🚨 JIKA MASIH ERROR:

### Jika "function not found":
- Ulangi STEP 1 (SQL) pastikan COMPLETED
- Check verification queries

### Jika "uuid = text":
- Pastikan SQL dijalankan lengkap
- Check explicit cast `::TEXT` sudah ada

### Jika UI masih "No code":
- Check referral_code column terisi
- Refresh browser (Ctrl+Shift+R)

## 📝 COMMIT MESSAGE:
```
fix: rebuild get_my_referral_analytics drop+create and stabilize referrals UI
```

**EXECUTE SEKARANG! Semua error akan hilang.** 🚀
