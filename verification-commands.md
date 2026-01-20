# 🧪 VERIFICATION COMMANDS

## 📋 QUICK VERIFICATION SCRIPTS

### **1. DATABASE VERIFICATION**
```sql
-- Copy-paste di Supabase SQL Editor
SELECT '=== DATABASE VERIFICATION ===' AS info;

-- Check functions exist
SELECT 
    proname AS function_name,
    pg_get_function_identity_arguments(oid) AS args,
    pg_get_function_result(oid) AS return_type
FROM pg_proc 
WHERE proname IN ('get_my_referral_analytics', 'ensure_referral_code')
ORDER BY proname;

-- Check referral codes distribution
SELECT 
    COUNT(*) AS total_users,
    COUNT(referral_code) AS users_with_code,
    COUNT(*) - COUNT(referral_code) AS users_without_code,
    COUNT(CASE WHEN referral_code LIKE 'TPC-%' THEN 1 END) AS users_with_tpc_code
FROM public.profiles;

-- Test RPC function (authenticated context)
SELECT 'Testing get_my_referral_analytics:' AS test_info;
SELECT * FROM public.get_my_referral_analytics() LIMIT 1;

-- Test ensure function
SELECT 'Testing ensure_referral_code:' AS test_info;
SELECT * FROM public.ensure_referral_code() LIMIT 1;

-- Check column types (prevent uuid=text errors)
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND (column_name LIKE '%referral%' OR column_name = 'id')
ORDER BY column_name;
```

### **2. FRONTEND VERIFICATION**

#### **A. Dashboard Test**
```javascript
// Buka: localhost:5173/en/member/dashboard
// Buka Console (F12) dan paste:

console.log('=== DASHBOARD VERIFICATION ===');

// Check profile data
console.log('Profile data:', window.profile);

// Check referral code
const referralCode = window.profile?.referral_code;
console.log('Referral code:', referralCode);
console.log('Referral code type:', typeof referralCode);
console.log('Is valid TPC code:', /^TPC-[A-F0-9]{6,8}$/i.test(referralCode || ''));

// Test copy function
if (referralCode) {
  console.log('✅ Referral code exists and is valid');
} else {
  console.log('⚠️ Referral code missing - check generate button');
}

// Check for errors
console.log('Dashboard errors:', window.errors?.filter?.(e => e?.message?.includes?.('referral')));
```

#### **B. Referrals Page Test**
```javascript
// Buka: localhost:5173/en/member/referrals
// Buka Console (F12) dan paste:

console.log('=== REFERRALS PAGE VERIFICATION ===');

// Check analytics data
console.log('Analytics data:', window.analytics);

// Test RPC call manually
(async () => {
  try {
    const { data, error } = await supabase.rpc('get_my_referral_analytics');
    console.log('RPC Result:', { data, error });
    
    if (error) {
      console.error('❌ RPC Error:', error);
    } else {
      console.log('✅ RPC Success:', data);
    }
  } catch (err) {
    console.error('❌ RPC Exception:', err);
  }
})();

// Check for error messages
const errorElements = document.querySelectorAll('[class*="error"], [class*="failed"]');
console.log('Error elements on page:', errorElements.length);

// Check stats display
const statsElements = document.querySelectorAll('.text-3xl');
console.log('Stats values:', Array.from(statsElements).map(el => el.textContent));
```

#### **C. Network Verification**
```javascript
// Buka Network tab di DevTools
// Refresh halaman /member/referrals
// Cari request: POST /rpc/get_my_referral_analytics

// Atau test programmatically:
fetch('/rpc/get_my_referral_analytics', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabase.auth.session()?.access_token}`
  }
}).then(res => {
  console.log('Network test status:', res.status);
  return res.json();
}).then(data => {
  console.log('Network test response:', data);
}).catch(err => {
  console.error('Network test error:', err);
});
```

### **3. COMPREHENSIVE BROWSER TEST**

#### **Full Test Script**
```javascript
// Paste di console di halaman mana saja
(async () => {
  console.log('=== COMPREHENSIVE REFERRAL TEST ===');
  
  // Test 1: Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log('1. Auth check:', { user: user?.id, authError });
  
  // Test 2: Profile check
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('referral_code, can_invite')
    .eq('id', user?.id)
    .single();
  console.log('2. Profile check:', { profile, profileError });
  
  // Test 3: RPC check
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_my_referral_analytics');
  console.log('3. RPC check:', { rpcData, rpcError });
  
  // Test 4: Ensure function check
  const { data: ensuredCode, error: ensureError } = await supabase.rpc('ensure_referral_code');
  console.log('4. Ensure check:', { ensuredCode, ensureError });
  
  // Test 5: Summary
  const tests = [
    { name: 'Auth', passed: !!user && !authError },
    { name: 'Profile', passed: !!profile && !profileError },
    { name: 'RPC', passed: !!rpcData && !rpcError },
    { name: 'Ensure', passed: !!ensuredCode && !ensureError }
  ];
  
  console.log('5. Test Summary:');
  tests.forEach(test => {
    console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
  });
  
  const allPassed = tests.every(t => t.passed);
  console.log(`\n🎯 Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return { user, profile, rpcData, ensuredCode, tests };
})();
```

### **4. VISUAL VERIFICATION CHECKLIST**

#### **Dashboard Checklist**
```bash
# Buka: localhost:5173/en/member/dashboard
# Check these visual elements:

□ Referral code visible (TPC-XXXXXXXX atau "No code yet")
□ Copy button enabled/disabled correctly
□ Generate button appears if no code
□ No "REFERRAL_CODE_NOT_AVAILABLE" text
□ No error messages visible
□ CTA notice clear if missing code
```

#### **Referrals Page Checklist**
```bash
# Buka: localhost:5173/en/member/referrals
# Check these visual elements:

□ Stats cards show numbers (0 jika kosong)
□ No "Failed to load referral data" message
□ Referral code section visible
□ Copy buttons work correctly
□ Generate button appears if needed
□ No error states or crash screens
□ Analytics data loads successfully
```

### **5. PERFORMANCE CHECK**

```javascript
// Test response times
(async () => {
  console.log('=== PERFORMANCE CHECK ===');
  
  const start = performance.now();
  const { data, error } = await supabase.rpc('get_my_referral_analytics');
  const end = performance.now();
  
  console.log(`RPC Response Time: ${(end - start).toFixed(2)}ms`);
  console.log(`RPC Status: ${error ? 'ERROR' : 'SUCCESS'}`);
  console.log(`Data Size: ${JSON.stringify(data).length} characters`);
  
  // Check if under 500ms (good performance)
  if (end - start < 500) {
    console.log('✅ Performance acceptable');
  } else {
    console.log('⚠️ Performance could be improved');
  }
})();
```

---

## 🎯 **SUCCESS CRITERIA AUTOMATION**

### **Auto-Test Script**
```javascript
// Run this for automatic verification
(async () => {
  const results = {
    dashboard: false,
    referrals: false,
    network: false,
    console: false
  };
  
  // Test dashboard
  try {
    const profile = await supabase.from('profiles').select('referral_code').single();
    results.dashboard = !profile.error;
  } catch (e) {
    results.dashboard = false;
  }
  
  // Test referrals RPC
  try {
    const rpc = await supabase.rpc('get_my_referral_analytics');
    results.referrals = !rpc.error;
  } catch (e) {
    results.referrals = false;
  }
  
  // Test network
  try {
    const response = await fetch('/rpc/get_my_referral_analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    results.network = response.ok;
  } catch (e) {
    results.network = false;
  }
  
  // Test console (check for errors)
  results.console = !console.error?.toString?.().includes('referral');
  
  const allPassed = Object.values(results).every(v => v);
  
  console.log('🎯 AUTOMATED TEST RESULTS:');
  Object.entries(results).forEach(([key, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${key.toUpperCase()}`);
  });
  
  console.log(`\n🏆 FINAL STATUS: ${allPassed ? '✅ IMPLEMENTATION DONE' : '❌ NEEDS FIXES'}`);
  
  return results;
})();
```

**Run verification scripts untuk memastikan implementation DONE!** 🚀
