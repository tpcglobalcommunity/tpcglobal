# FIX 404 get_my_referral_analytics - Step by Step

## Problem
- Frontend: `get_my_referral_analytics` → 404 "function not found"
- PGRST202: "Could not find the function public.get_my_referral_analytics without parameters"
- Solution: Buat function dengan signature EXACT yang dibutuhkan PostgREST

## 🔧 Step-by-Step Execution

### 1. Pastikan Project Benar
- Login ke [Supabase Dashboard](https://supabase.com/dashboard)
- Pilih project **"tpcglobal"** (sama dengan URL browser)
- Klik **SQL Editor** → **New query**

### 2. Hapus Function yang Mungkin Bentrok
Copy-paste SQL dari `fix-referral-analytics-404.sql`:

```sql
drop function if exists public.get_my_referral_analytics();
drop function if exists public.get_my_referral_analytics(json);
drop function if exists public.get_my_referral_analytics(uuid);
drop function if exists public.get_my_referral_analytics(text);
```
**Klik "Run"**

### 3. Buat Function dengan Signature Exact
```sql
create or replace function public.get_my_referral_analytics()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  my_code text;
  total_invited int := 0;
  total_verified int := 0;
  total_pending int := 0;
  latest_invites jsonb := '[]'::jsonb;
begin
  select p.referral_code
  into my_code
  from public.profiles p
  where p.id = auth.uid();

  if my_code is null or my_code = '' then
    return json_build_object(
      'my_referral_code', null,
      'total_invited', 0,
      'total_verified', 0,
      'total_pending', 0,
      'latest_invites', jsonb_build_array()
    );
  end if;

  -- IMPORTANT:
  -- Jika kolom "referred_by" tidak ada, GANTI "referred_by" di bawah sesuai nama kolom yang menyimpan kode inviter.
  select
    count(*)::int,
    count(*) filter (where coalesce(p.verified,false) = true)::int,
    count(*) filter (where coalesce(p.verified,false) = false)::int
  into total_invited, total_verified, total_pending
  from public.profiles p
  where p.referred_by = my_code;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'full_name', p.full_name,
        'email', p.email,
        'verified', coalesce(p.verified,false),
        'created_at', p.created_at
      )
      order by p.created_at desc
    ),
    '[]'::jsonb
  )
  into latest_invites
  from (
    select *
    from public.profiles
    where referred_by = my_code
    order by created_at desc
    limit 10
  ) p;

  return json_build_object(
    'my_referral_code', my_code,
    'total_invited', total_invited,
    'total_verified', total_verified,
    'total_pending', total_pending,
    'latest_invites', latest_invites
  );
end;
$$;
```
**Klik "Run"**

### 4. Grant Permissions
```sql
revoke all on function public.get_my_referral_analytics() from public;
grant execute on function public.get_my_referral_analytics() to authenticated;
```
**Klik "Run"**

### 5. Reload Schema Cache (CRITICAL)
```sql
select pg_notify('pgrst', 'reload schema');
```
**Klik "Run"**

### 6. Verifikasi Function Terdaftar
```sql
select
  n.nspname as schema,
  p.proname as name,
  pg_get_function_identity_arguments(p.oid) as args,
  pg_get_function_result(p.oid) as returns
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname='public' and p.proname='get_my_referral_analytics';
```
**Expected Result:**
```
schema | name                    | args | returns
-------+-------------------------+------+--------
public | get_my_referral_analytics |      | json
```

### 7. Test Frontend
- **Hard refresh**: Ctrl+Shift+R
- **Buka**: http://localhost:5174/en/member/referrals
- **Network tab**: `get_my_referral_analytics` harus **200** (bukan 404)

## 🚨 Troubleshooting

### Error: "column referred_by does not exist"
**Artinya:** Kolom referral relation beda nama.

**Cari nama kolom yang benar:**
```sql
select column_name
from information_schema.columns
where table_schema='public' and table_name='profiles'
order by column_name;
```

**Kemungkinan nama kolom:**
- `referred_by_code`
- `referrer_code` 
- `invite_code_used`
- `ref_code_used`
- `used_referral_code`

**Fix Function:**
1. **Copy function** dari Step 3
2. **Find & replace** semua `referred_by` dengan nama kolom yang benar
3. **Re-run** Step 3, 4, 5

### Error: "permission denied for function"
**Solution:** Pastikan Step 4 (permissions) sudah dijalankan.

### Error: 404 masih muncul
**Solution:** Pastikan Step 5 (reload cache) sudah dijalankan.

### Function tidak muncul di Step 6
**Solution:** Re-run Step 3 (create function).

## ✅ Expected Results

### Step 6 Output:
```
schema | name                    | args | returns
-------+-------------------------+------+--------
public | get_my_referral_analytics |      | json
```

### Frontend Network:
- **URL**: `/rpc/get_my_referral_analytics`
- **Method**: POST
- **Status**: 200 OK
- **Response**: JSON dengan analytics data

### Frontend UI:
- **Referral code**: Tampil `TPC-XXXXXXXX`
- **Analytics**: Total invited/verified/pending
- **Latest invites**: List user yang daftar pakai kode

## 📝 Notes

### Function Signature:
- **Name**: `public.get_my_referral_analytics`
- **Parameters**: TANPA parameter `()`
- **Returns**: `json`
- **Security**: `security definer`
- **Auth**: Otomatis pakai `auth.uid()`

### Frontend Call:
```javascript
const { data, error } = await supabase.rpc("get_my_referral_analytics");
// No parameters needed!
```

**Execute sekarang! 404 error akan hilang setelah Step 6 berhasil.** 🚀
