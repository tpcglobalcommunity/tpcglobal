# Referral Analytics RPC Setup Instructions

## Problem
- Frontend calls: `supabase.rpc("get_my_referral_analytics")`
- Error: 404 "function not found"
- Solution: Create RPC function that matches frontend call

## Step-by-Step Execution

### 1. Buka Supabase SQL Editor
- Login ke [Supabase Dashboard](https://supabase.com/dashboard)
- Pilih project TPC Global
- Klik **SQL Editor** → **New query**

### 2. Step A: Check Available Columns
```sql
select column_name
from information_schema.columns
where table_schema='public' and table_name='profiles'
order by column_name;
```
**Lihat hasil:**
- ✅ Apakah ada `referral_code`?
- ❓ Apakah ada `referred_by` (atau nama lain)?

### 3. Step B: Create RPC Function
Copy-paste SQL dari `setup-referral-analytics.sql`:

```sql
create or replace function public.get_my_referral_analytics()
returns table (
  my_referral_code text,
  total_invited integer,
  total_verified integer,
  total_pending integer,
  latest_invites jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  my_code text;
begin
  -- ambil referral_code milik user login
  select p.referral_code
  into my_code
  from public.profiles p
  where p.id = auth.uid();

  -- kalau belum ada kode, return nol semua (frontend tetap aman)
  if my_code is null or my_code = '' then
    my_referral_code := null;
    total_invited := 0;
    total_verified := 0;
    total_pending := 0;
    latest_invites := '[]'::jsonb;
    return next;
    return;
  end if;

  -- HITUNG TOTAL INVITED berdasarkan kolom referred_by
  select
    count(*)::int,
    count(*) filter (where coalesce(p.verified,false) = true)::int,
    count(*) filter (where coalesce(p.verified,false) = false)::int
  into
    total_invited,
    total_verified,
    total_pending
  from public.profiles p
  where p.referred_by = my_code;

  -- LIST INVITE TERBARU (maks 10)
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

  my_referral_code := my_code;
  return next;
end;
$$;
```

### 4. Step D: Grant Permissions
```sql
revoke all on function public.get_my_referral_analytics() from public;
grant execute on function public.get_my_referral_analytics() to authenticated;
```

### 5. Step E: Reload Schema Cache
```sql
select pg_notify('pgrst', 'reload schema');
```

### 6. Step F: Test (Optional)
```sql
-- Cek referral_code kamu:
select id, email, referral_code from public.profiles where email is not null order by updated_at desc limit 5;

-- Test function:
select * from public.get_my_referral_analytics();
```

## Troubleshooting

### Error: "column referred_by does not exist"
**Artinya:** Kolom referral relation beda nama.

**Cari nama kolom yang benar:**
```sql
select column_name
from information_schema.columns
where table_schema='public' and table_name='profiles'
and column_name like '%referral%' or column_name like '%refer%' or column_name like '%invite%';
```

**Kemungkinan nama kolom:**
- `referred_by_code`
- `referrer_code` 
- `invite_code_used`
- `ref_code_used`

**Fix: Ganti semua `referred_by` dengan nama kolom yang benar:**
```sql
-- Contoh: jika kolom namanya `referred_by_code`
where p.referred_by_code = my_code;
```

### Error: "permission denied for function"
**Solution:** Pastikan Step D (permissions) sudah dijalankan.

### Error: 404 masih muncul
**Solution:** Pastikan Step E (reload cache) sudah dijalankan.

## Expected Results

### Function Return Structure:
```json
{
  "my_referral_code": "TPC-1A2B3C4D",
  "total_invited": 5,
  "total_verified": 3, 
  "total_pending": 2,
  "latest_invites": [
    {
      "id": "uuid-1",
      "full_name": "John Doe",
      "email": "john@example.com",
      "verified": true,
      "created_at": "2024-01-20T10:00:00Z"
    }
  ]
}
```

### Frontend Test:
1. Buka: http://localhost:5174/en/member/referrals
2. **Network tab**: `get_my_referral_analytics` harus 200
3. **UI**: Tampilkan referral code + analytics
4. **Console**: Tidak ada error 404

## Frontend Integration

Function ini sudah compatible dengan frontend yang memanggil:
```javascript
const { data, error } = await supabase.rpc("get_my_referral_analytics");
```

No parameters needed - otomatis pakai auth.uid() dari user login.
