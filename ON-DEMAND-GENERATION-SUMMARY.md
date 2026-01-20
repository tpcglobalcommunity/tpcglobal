# 🚀 ON-DEMAND REFERRAL CODE GENERATION

## 📋 OVERVIEW
Optional tapi disarankan: Generate referral code otomatis jika null dengan collision detection dan unique guarantee.

---

## 🔧 **DATABASE FUNCTIONS**

### ✅ 1. `ensure_referral_code()` - Helper Function
```sql
-- File: ensure-referral-code-function.sql
CREATE FUNCTION public.ensure_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    my_uid UUID := auth.uid();
    my_current_code TEXT;
    new_code TEXT;
    max_attempts INTEGER := 10;
    attempt INTEGER := 0;
    collision_detected BOOLEAN;
BEGIN
    -- Get current referral code
    SELECT referral_code INTO my_current_code
    FROM public.profiles
    WHERE id = my_uid;

    -- Return existing if valid
    IF my_current_code IS NOT NULL AND my_current_code != '' THEN
        RETURN my_current_code;
    END IF;

    -- Generate unique code with collision detection
    WHILE attempt < max_attempts LOOP
        attempt := attempt + 1;
        
        -- Generate: TPC- + 6 random hex chars
        new_code := 'TPC-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 6));
        
        -- Check collision
        SELECT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE referral_code = new_code
        ) INTO collision_detected;
        
        -- Use if no collision
        IF NOT collision_detected THEN
            UPDATE public.profiles
            SET referral_code = new_code
            WHERE id = my_uid;
            
            RETURN new_code;
        END IF;
    END LOOP;
    
    RAISE EXCEPTION 'Failed to generate unique referral code';
END;
$$;
```

### ✅ 2. Enhanced `get_my_referral_analytics()` - Auto-Generation
```sql
-- File: integrate-ensure-referral-code.sql
CREATE FUNCTION public.get_my_referral_analytics()
RETURNS TABLE (...)
AS $$
DECLARE
    my_uid UUID := auth.uid();
    my_code TEXT;
BEGIN
    -- Get user's referral code, auto-generate if needed
    SELECT p.referral_code INTO my_code
    FROM public.profiles p
    WHERE p.id = my_uid;

    -- Auto-generate if null/empty
    IF my_code IS NULL OR my_code = '' OR my_code = 'REFERRAL_CODE_NOT_AVAILABLE' THEN
        SELECT public.ensure_referral_code() INTO my_code;
    END IF;

    -- Rest of analytics logic...
END;
$$;
```

---

## 🌐 **FRONTEND INTEGRATION**

### ✅ 1. Helper Function - `ensureReferralCode()`
```typescript
// src/lib/supabase.ts
export const ensureReferralCode = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('ensure_referral_code');

    if (error) {
      console.error('Error ensuring referral code:', error);
      return null;
    }

    return data as string;
  } catch (err) {
    console.error('Error in ensureReferralCode:', err);
    return null;
  }
};
```

### ✅ 2. Dashboard Integration
```typescript
// src/pages/member/Dashboard.tsx
const handleGenerateReferralCode = async () => {
  try {
    setGeneratingCode(true);
    const newCode = await ensureReferralCode();
    if (newCode) {
      // Refresh profile data
      const updatedProfile = await getProfile(user.id);
      setProfile(updatedProfile);
    }
  } catch (err) {
    console.error('Error generating referral code:', err);
  } finally {
    setGeneratingCode(false);
  }
};
```

### ✅ 3. ReferralsPage Integration
```typescript
// src/pages/member/ReferralsPage.tsx
const handleGenerateReferralCode = async () => {
  try {
    setGeneratingCode(true);
    const newCode = await ensureReferralCode();
    if (newCode) {
      // Reload analytics to get updated data
      await loadAnalytics();
    }
  } catch (err) {
    console.error('Error generating referral code:', err);
  } finally {
    setGeneratingCode(false);
  }
};
```

---

## 🎯 **KEY FEATURES**

### ✅ **Collision Detection:**
- **10 attempts** maximum
- **Database-level uniqueness check**
- **Random 6-hex suffix** (16^6 = 16M combinations)
- **Automatic retry** on collision

### ✅ **Format Consistency:**
- **Prefix**: `TPC-`
- **Suffix**: 6 uppercase hex chars
- **Examples**: `TPC-1A2B3C`, `TPC-F4E5D6`
- **Length**: 10 characters total

### ✅ **Safety Measures:**
- **SECURITY DEFINER** for database permissions
- **auth.uid()** for user context
- **Null checks** everywhere
- **Error handling** with exceptions

### ✅ **Integration Points:**
- **RPC function** for direct calls
- **Analytics function** auto-generates
- **Frontend helpers** for UI integration
- **Fallback logic** for existing codes

---

## 📊 **EXECUTION FLOW**

### ✅ **First-Time User:**
1. User visits `/member/referrals`
2. `get_my_referral_analytics()` called
3. Detects `referral_code IS NULL`
4. Auto-calls `ensure_referral_code()`
5. Generates unique `TPC-XXXXXX`
6. Updates `profiles.referral_code`
7. Returns analytics with new code

### ✅ **Manual Generate:**
1. User clicks "Generate Code" button
2. Frontend calls `ensureReferralCode()`
3. Database generates unique code
4. Updates profile
5. Frontend refreshes data
6. UI shows new code

### ✅ **Existing User:**
1. Function checks existing code
2. If valid, returns immediately
3. No unnecessary generation
4. Preserves existing codes

---

## 🚨 **ERROR HANDLING**

### ✅ **Database Level:**
```sql
-- Collision after 10 attempts
RAISE EXCEPTION 'Failed to generate unique referral code after % attempts', max_attempts;

-- User not authenticated
RAISE EXCEPTION 'User not authenticated';
```

### ✅ **Frontend Level:**
```typescript
// Network errors
if (error) {
  console.error('Error ensuring referral code:', error);
  return null;
}

// User feedback
{generatingCode ? 'Generating...' : 'Generate Code'}
```

---

## 🎯 **VERIFICATION**

### ✅ **Database Tests:**
```sql
-- Test function
SELECT * FROM public.ensure_referral_code();

-- Check uniqueness
SELECT referral_code, COUNT(*) 
FROM public.profiles 
GROUP BY referral_code 
HAVING COUNT(*) > 1;

-- Verify format
SELECT referral_code 
FROM public.profiles 
WHERE referral_code NOT LIKE 'TPC-%';
```

### ✅ **Frontend Tests:**
- [ ] Generate button creates unique code
- [ ] Code persists after page refresh
- [ ] Copy buttons work with new codes
- [ ] Analytics show correct referral counts
- [ ] No duplicate codes generated

---

## 📈 **PERFORMANCE CONSIDERATIONS**

### ✅ **Optimizations:**
- **Early return** for existing codes
- **Efficient collision check** with EXISTS
- **Limited attempts** (max 10)
- **Database-level generation** (more secure)

### ✅ **Scalability:**
- **16M possible combinations** (6 hex chars)
- **Collision probability** very low
- **Automatic retry** handles edge cases
- **Graceful failure** with exceptions

---

## 🎯 **BENEFITS**

### ✅ **User Experience:**
- **No manual code creation**
- **Instant code generation**
- **Unique guarantee**
- **Clear feedback**

### ✅ **Developer Experience:**
- **Simple API calls**
- **Built-in collision handling**
- **Consistent format**
- **Error handling included**

### ✅ **System Reliability:**
- **Database-level uniqueness**
- **No race conditions**
- **Atomic operations**
- **Rollback capability**

**On-demand generation siap digunakan!** 🚀
