# 🚀 FINAL RPC FIX - EXECUTION INSTRUCTIONS

## 📋 OVERVIEW
Ini adalah SQL script final yang aman untuk memperbaiki `get_my_referral_analytics()` function dengan:
- ✅ Drop function lama (fix return type conflict)
- ✅ Create function baru dengan return structure FIX
- ✅ Handle multiple column types (uuid/text)
- ✅ Auto-generate referral codes
- ✅ Proper permissions dan schema cache reload

---

## 🔍 **LANGKAH B1: SCHEMA INSPECTION (WAJIB DULUAN)**

### 1. Buka Supabase Dashboard:
- Login: https://supabase.com/dashboard
- Pilih project: **tpcglobal**
- Klik: **SQL Editor** → **New query**

### 2. Copy-paste script B1:
```sql
-- Copy dari file: check-referral-schema.sql
```

### 3. Klik **RUN** dan perhatikan hasilnya:

**Expected Output:**
```sql
-- 1. Functions (seharusnya kosong atau ada function lama)
function_name | arguments | return_type
--------------|-----------|------------

-- 2. Tables (seharusnya ada 'profiles')
schemaname | tablename
-----------|----------
public     | profiles

-- 3. Profile columns (penting!)
column_name       | data_type | is_nullable
------------------|-----------|------------
id                | uuid      | NO
referral_code     | text      | YES
referred_by_code  | text      | YES
referred_by       | uuid      | YES
can_invite        | boolean   | YES

-- 4. Hasil akhir
has_can_invite_column = true
```

**Catat hasil penting:**
- Apakah ada `referred_by` (uuid) atau `referred_by_code` (text)?
- Apakah `can_invite` column ada?
- Apakah ada function lama yang harus di-drop?

---

## 🔧 **LANGKAH B2: RPC FIX FINAL**

### 1. Di SQL Editor yang sama, copy-paste script B2:
```sql
-- Copy dari file: fix-referral-rpc-final.sql
```

### 2. Klik **RUN** dan tunggu hasilnya:

**Expected Success Output:**
```sql
COMMIT
Function created successfully

function_name           | arguments | return_type
-----------------------|-----------|------------
get_my_referral_analytics | (none)    | table

total_users | users_with_code | users_without_code | users_with_tpc_code
------------|----------------|-------------------|------------------
100         | 100            | 0                 | 100

Testing function (may return empty if no auth context)
```

---

## 🎯 **VERIFICATION CHECKLIST**

### ✅ Database Level:
- [ ] Function `get_my_referral_analytics()` terdaftar dengan return type `table`
- [ ] Tidak ada error "cannot change return type"
- [ ] Tidak ada error "uuid = text"
- [ ] Schema cache ter-reload
- [ ] Semua user punya referral code `TPC-XXXXXXXX`

### ✅ Frontend Level:
- [ ] Dashboard: `/member/dashboard` → referral code tampil
- [ ] Referrals: `/member/referrals` → analytics tampil
- [ ] Network: `POST /rpc/get_my_referral_analytics → 200 OK`
- [ ] Console: Tidak ada PGRST202, tidak ada schema cache error

---

## 🚨 **TROUBLESHOOTING**

### Jika "function not found":
```sql
-- Cek lagi function registration
SELECT proname FROM pg_proc WHERE proname = 'get_my_referral_analytics';
```

### Jika "uuid = text error":
```sql
-- Pastikan script B2 dijalankan lengkap
-- Check explicit cast sudah benar
WHERE referred_by_code = my_code::TEXT
```

### Jika "cannot change return type":
```sql
-- Pastikan DROP FUNCTION dijalankan sebelum CREATE
DROP FUNCTION IF EXISTS public.get_my_referral_analytics() CASCADE;
```

### Jika referral code masih kosong:
```sql
-- Generate manual
UPDATE public.profiles
SET referral_code = 'TPC-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 8))
WHERE referral_code IS NULL;
```

---

## 📊 **EXPECTED FRONTEND RESULTS**

### Dashboard (`/member/dashboard`):
```
Your Referral Code: TPC-1A2B3C4D
[Copy Code] [Copy Link] [Copy Verify Link]
```

### Referrals Page (`/member/referrals`):
```
Total Referrals: 5
Last 7 Days: 2
Last 30 Days: 5
Invite Status: ACTIVE

Your Referral Code: TPC-1A2B3C4D
[Copy] [Copy Signup Link] [Copy Verify Link]
```

### Network Tab:
```
POST /rpc/get_my_referral_analytics
Status: 200 OK
Response: {
  referral_code: "TPC-1A2B3C4D",
  total_referrals: 5,
  last_7_days: 2,
  last_30_days: 5,
  invite_status: "ACTIVE"
}
```

---

## 🎯 **FINAL COMMIT MESSAGE**
```
fix: rebuild get_my_referral_analytics with proper return types and schema inspection
```

**Execute B1 dulu, lalu B2. Semua error akan hilang!** 🚀
