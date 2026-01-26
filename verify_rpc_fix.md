# RPC Fix Verification Checklist

## ✅ Files Created:
1. `supabase/migrations/9999_public_rpc_fix.sql` - RPC functions
2. Updated `src/components/TrustBadge.tsx` - Handle JSON response

## 🔧 Functions Created:
- `public.get_public_metrics()` - Returns JSON with counts
- `public.get_public_batches(p_limit)` - Returns table rows
- `public._table_exists()` - Helper function

## 🚀 Deployment Steps:

### 1. Run SQL Migration
```sql
-- Copy entire content of supabase/migrations/9999_public_rpc_fix.sql
-- Run in Supabase SQL Editor
```

### 2. Verify Functions Exist
```sql
-- Check functions exist:
SELECT proname FROM pg_proc WHERE proname LIKE 'get_public%';

-- Test functions:
SELECT * FROM public.get_public_metrics();
SELECT * FROM public.get_public_batches(5);
```

### 3. Test Frontend
```bash
npm run dev
# Visit /id/transparency page
# Check Network tab for RPC calls
# Should see 200 status (not 404)
```

## 📊 Expected Results:

### Before Fix:
- ❌ `POST /rest/v1/rpc/get_public_metrics` → 404
- ❌ `POST /rest/v1/rpc/get_public_batches` → 404
- ❌ UI crashes with errors

### After Fix:
- ✅ `POST /rest/v1/rpc/get_public_metrics` → 200
- ✅ `POST /rest/v1/rpc/get_public_batches` → 200
- ✅ UI shows empty state gracefully
- ✅ TrustBadge shows "initializing" status

## 🔍 Debug Commands:

### Check Supabase Connection:
```javascript
// In browser console:
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 10) + '...');
```

### Test RPC Calls:
```javascript
// In browser console:
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(URL, ANON_KEY);

supabase.rpc('get_public_metrics').then(console.log);
supabase.rpc('get_public_batches', {p_limit: 5}).then(console.log);
```

## 🎯 Success Criteria:
- [ ] SQL migration executed successfully
- [ ] Functions exist in PostgreSQL
- [ ] RPC calls return 200 status
- [ ] No 404 errors in console
- [ ] Transparency page loads without crashing
- [ ] TrustBadge shows correct status

## 🚨 If Still Getting 404:
1. Check `.env` file has correct Supabase URL
2. Verify SQL was run in correct project
3. Check anon key matches project
4. Try refreshing browser cache
