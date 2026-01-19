# TPC SIGNUP TESTING INSTRUCTIONS

## 🎯 TESTING CRITERIA

### ✅ SUCCESS CRITERIA
- **No 500 error** from `/auth/v1/signup`
- **User created** in `auth.users` table
- **UI shows** "Check your email" success state
- **Console logs** show `[SIGNUP_API] Success`
- **Submit button** stops spinning (submitting = false)

### ❌ FAILURE CRITERIA
- **500 error** from `/auth/v1/signup`
- **AuthApiError: Database error saving new user`
- **UI shows** "Failed to create account. Please try again."
- **Infinite loading** or spinner doesn't stop

---

## 🔍 STEP 1: EXECUTE SQL FIX

### Run in Supabase SQL Editor:
```sql
-- Copy-paste entire COMPREHENSIVE-FIX-SQL.sql
-- Execute all sections in order
```

### Expected SQL Result:
1. **List of triggers** - Shows all custom triggers
2. **All triggers disabled** - Safe debugging mode
3. **Fail-open trigger created** - `tpc_handle_new_user_failopen()`
4. **Only fail-open enabled** - Single non-blocking trigger

---

## 🔍 STEP 2: TEST SIGNUP

### Test Data:
- **Email**: `test@example.com`
- **Password**: `Test123456!`
- **Full Name**: `Test User`
- **Username**: `testuser`
- **Referral**: `TPC-BOOT01`

### Expected Console Output:
```javascript
[SIGNUP] Validating referral code: TPC-BOOT01
[validateReferralCode] Starting validation for: TPC-BOOT01
[validateReferralCode] Request completed in 45ms
[validateReferralCode] Is valid: true
[SIGNUP] Validation result: true (45ms)
[SIGNUP] Starting signup process...
[SIGNUP_API] Starting signUpInviteOnly
[SIGNUP_API] Input: { email: "te***@example.com", referralCode: "TPC-BOOT01", ... }
[SIGNUP_API] Response: { data: { user: { id: "...", email: "test@example.com", ... } }, error: null }
[SIGNUP_API] Success: { checkEmail: true }
[SIGNUP] Setting done state: { checkEmail: true }
[SIGNUP] Setting submitting to false
```

### Expected UI Flow:
1. **Referral validation** → "Validating..." → "Referral code is valid" ✅
2. **Form submission** → "Creating account..." → "Check your email" ✅
3. **No error messages** → Clean success state ✅

---

## 🔍 STEP 3: VERIFY DATABASE

### Check User Creation:
```sql
-- Verify user created in auth.users
SELECT id, email, created_at, confirmed_at 
FROM auth.users 
WHERE email = 'test@example.com'
ORDER BY created_at DESC 
LIMIT 1;

-- Check profile creation (may or may not exist)
SELECT id, email, full_name, created_at 
FROM public.profiles 
WHERE id = 'USER_ID_FROM_ABOVE'
ORDER BY created_at DESC 
LIMIT 1;
```

---

## 🚀 STEP 4: DEPLOYMENT

### If Success:
```bash
# Build and deploy
npm run build
npm run preview
git add .
git commit -m "fix signup: comprehensive trigger fix + enhanced error handling"
git push origin main
```

### If Still Failing:
1. **Check console logs** for specific error details
2. **Run trigger analysis** to see what's still blocking
3. **Review NOT NULL constraints** in profiles table
4. **Check referral validation** still working

---

## 📊 TROUBLESHOOTING

### If 500 Still Occurs:
- **Check remaining triggers** - May be other blocking triggers
- **Verify NOT NULL columns** - Profiles table constraints
- **Review function logs** - Supabase logs for specific errors

### If UI Shows Raw Keys:
- **Check i18n path** - Verify `auth.signup.errorGeneric` exists
- **Verify translation loading** - Check language detection
- **Check useMemo dependencies** - Ensure proper caching

### If Referral Validation Fails:
- **Check RPC function** - `validate_referral_code_public`
- **Verify referral code** - Ensure `TPC-BOOT01` exists
- **Check network** - Supabase connection issues

---

## 🎯 FINAL VERIFICATION

### Complete Success When:
- ✅ **No 500 errors**
- ✅ **User in auth.users**
- ✅ **UI shows success**
- ✅ **Console logs success**
- ✅ **No raw i18n keys**
- ✅ **Ready for production**

---

**Execute SQL fix first, then test signup flow completely!**
