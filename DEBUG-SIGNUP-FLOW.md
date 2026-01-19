# DEBUG SIGNUP FLOW - TPC TROUBLESHOOTING GUIDE

## 🎯 CURRENT ISSUE
Error: "Failed to create account. Please try again."
Status: Signup sampai ke frontend tapi gagal

## 🔍 DEBUGGING STEPS

### Step 1: Check Console for Detailed Error
1. **Buka Developer Tools** (F12)
2. **Tab Console**
3. **Clear console** (Ctrl+L)
4. **Coba signup** dengan data valid
5. **Screenshot error** yang muncul

### Step 2: Look for Specific Error Messages
**Cari error dengan pattern:**
```javascript
[SIGNUP] Full error details: {
  error: {...},
  message: "Actual error message",
  status: 400/500/401,
  code: "auth_code"
}
```

### Step 3: Check Network Tab
1. **Tab Network**
2. **Filter: signup** atau **auth/v1/signup**
3. **Coba signup**
4. **Lihat request/response**:
   - Request status (200/400/500)
   - Response body
   - Response headers

## 🧪 TEST SCENARIOS

### Scenario A: Referral Validation Error
**Symptoms:**
- Referral validation gagal
- Console menunjukkan referral error
- Status 400

**Test:**
```javascript
// Test dengan referral yang pasti valid
Referral: TPC-BOOT01
```

### Scenario B: Form Validation Error
**Symptoms:**
- Client-side validation gagal
- Error sebelum API call
- Status tidak ada

**Test:**
```javascript
// Test dengan data yang pasti valid
Email: test@example.com
Password: Test123456! (8+ chars, uppercase, lowercase, number, special)
Full Name: Test User (2+ chars)
Username: testuser123 (3+ chars, alphanumeric)
Referral: TPC-BOOT01
```

### Scenario C: Network/Connection Error
**Symptoms:**
- Tidak ada response dari API
- Timeout error
- CORS error

**Test:**
```javascript
// Check network connection
// Test dengan browser yang berbeda
// Test dengan network yang berbeda
```

## 🔧 COMMON FIXES

### Fix 1: Referral Validation
```sql
-- Check referral code exists
SELECT referral_code, is_active, expires_at 
FROM referrals 
WHERE referral_code = 'TPC-BOOT01' 
AND is_active = true 
AND (expires_at IS NULL OR expires_at > NOW());
```

### Fix 2: Form Validation
```typescript
// Enhanced client-side validation
const validateForm = (data) => {
  const errors = {};
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  if (!data.password || data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  
  if (!data.fullName || data.fullName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }
  
  if (!data.username || !/^[a-zA-Z0-9_]{3,}$/.test(data.username)) {
    errors.username = 'Username must be at least 3 characters, alphanumeric only';
  }
  
  return errors;
};
```

### Fix 3: API Error Handling
```typescript
// Enhanced error handling
try {
  const result = await signUpInviteOnly({...});
  // Handle success
} catch (err) {
  console.error('[SIGNUP] API Error:', {
    message: err.message,
    status: err.status,
    code: err.code,
    isNetworkError: !err.status,
    isTimeoutError: err.message?.includes('timeout')
  });
  
  // Show specific error message
  if (err.status === 400) {
    setError('Invalid data provided');
  } else if (err.status === 500) {
    setError('Server error. Please try again later.');
  } else if (!err.status) {
    setError('Network error. Check your connection.');
  } else {
    setError(err.message || 'Unknown error occurred');
  }
}
```

## 📋 DEBUGGING CHECKLIST

### Pre-Test Checklist:
- [ ] Supabase environment variables correct
- [ ] Referral code exists and active
- [ ] Form data meets all requirements
- [ ] Network connection stable
- [ ] Browser console cleared

### During Test Checklist:
- [ ] Console error messages captured
- [ ] Network request/response captured
- [ ] Error screenshot taken
- [ ] Form data validated
- [ ] Referral validation checked

### Post-Test Analysis:
- [ ] Error type identified
- [ ] Root cause determined
- [ ] Fix implemented
- [ ] Fix tested
- [ ] Documentation updated

## 🚀 NEXT STEPS

### Immediate Actions:
1. **Test with enhanced logging** - Get detailed error info
2. **Check console output** - Find specific error message
3. **Analyze network request** - Check API response
4. **Identify error type** - Validation/API/Network
5. **Apply targeted fix** - Based on error type

### If Still Fails:
1. **Check Supabase logs** - Database-level errors
2. **Verify referral system** - RPC function working
3. **Test with different data** - Isolate variable
4. **Check CORS settings** - Cross-origin issues
5. **Monitor performance** - Timeout issues

## 📊 EXPECTED OUTCOMES

### Success Scenario:
```javascript
[SIGNUP] Validating referral code: TPC-BOOT01
[validateReferralCode] Is valid: true
[SIGNUP_API] Starting signUpInviteOnly
[SIGNUP_API] Response: { data: {...}, error: null }
[SIGNUP_API] Success: { checkEmail: true }
[SIGNUP] Setting done state: { checkEmail: true }
```

### Error Scenario:
```javascript
[SIGNUP] Full error details: {
  error: {...},
  message: "Specific error message",
  status: 400,
  code: "auth_code"
}
```

---

**Follow this guide to identify and fix the root cause!**
