# FIX REFERRAL_CODE_NOT_AVAILABLE - End-to-End Solution

## Problem
- Dashboard menampilkan: `REFERRAL_CODE_NOT_AVAILABLE`
- Artinya: `profiles.referral_code` = NULL/kosong
- Goal: Setiap user punya referral code unik

## 🔧 Step-by-Step Execution

### 1. Buka Supabase SQL Editor
- Login ke [Supabase Dashboard](https://supabase.com/dashboard)
- Pilih project "tpcglobal"
- Klik **SQL Editor** → **New query**

### 2. Step 1: Tambah Kolom referral_code
```sql
alter table public.profiles
add column if not exists referral_code text unique;
```
**Klik "Run"**

### 3. Step 2: Cek Current State
```sql
select 
  count(*) as total_users,
  count(referral_code) as users_with_code,
  count(*) - count(referral_code) as users_without_code
from public.profiles;
```
**Expected Result:**
```
total_users | users_with_code | users_without_code
-----------+----------------+------------------
         5 |              0 |                5
```
- `users_without_code` > 0 = perlu backfill

### 4. Step 3: Buat Generator Function
```sql
create or replace function public.generate_referral_code()
returns text
language plpgsql
as $$
declare
  code text;
begin
  loop
    code := 'TPC-' || upper(substr(replace(gen_random_uuid()::text,'-',''), 1, 8));
    exit when not exists (
      select 1 from public.profiles where referral_code = code
    );
  end loop;
  return code;
end;
$$;
```
**Klik "Run"**

### 5. Step 4: Trigger Auto-Generate
```sql
create or replace function public.set_referral_code_on_insert()
returns trigger
language plpgsql
as $$
begin
  if new.referral_code is null or new.referral_code = '' then
    new.referral_code := public.generate_referral_code();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_referral_code_on_insert on public.profiles;

create trigger trg_set_referral_code_on_insert
before insert on public.profiles
for each row
execute function public.set_referral_code_on_insert();
```
**Klik "Run"**

### 6. Step 5: Backfill User Lama
```sql
update public.profiles
set referral_code = public.generate_referral_code()
where referral_code is null or referral_code = '';
```
**Klik "Run"**
**Expected Result:** `UPDATE X` (X = jumlah user yang di-backfill)

### 7. Step 6: Verifikasi Hasil
```sql
select 
  id,
  email,
  full_name,
  referral_code,
  updated_at
from public.profiles
order by updated_at desc
limit 10;
```
**Expected Result:**
```
id | email | full_name | referral_code | updated_at
---+-------+-----------+---------------+------------
xxx | xxx   | xxx       | TPC-1A2B3C4D  | 2024-01-...
```

### 8. Step 7: Reload Schema Cache
```sql
select pg_notify('pgrst', 'reload schema');
```
**Klik "Run"**

### 9. Test Frontend
- **Hard refresh**: Ctrl+Shift+R
- **Buka**: http://localhost:5174/en/member/dashboard
- **Lihat**: "Your Referral Code" harus tampil `TPC-XXXXXXXX`
- **Test**: "Copy Code" button harus berfungsi

## 🎯 Expected Results

### Database (Step 6):
```
id | email | full_name | referral_code | updated_at
---+-------+-----------+---------------+------------
xxx | xxx   | xxx       | TPC-1A2B3C4D  | 2024-01-...
```

### Frontend (Step 9):
- ✅ **Referral code tampil**: `TPC-XXXXXXXX` (bukan placeholder)
- ✅ **Copy button aktif**: Bisa salin kode
- ✅ **Console log**: `[Dashboard] referral_code loaded: TPC-XXXXXXXX`

## 🚨 Troubleshooting

### Error: "duplicate key value violates unique constraint"
**Artinya:** Function generate clash dengan kode yang ada.
**Solution:** Function sudah handle dengan loop, coba ulangi Step 5.

### Error: "column referral_code does not exist"
**Solution:** Pastikan Step 1 berhasil, cek dengan:
```sql
select column_name from information_schema.columns 
where table_schema='public' and table_name='profiles' and column_name='referral_code';
```

### Masih REFERRAL_CODE_NOT_AVAILABLE
**Cek:**
```sql
select id, email, referral_code from public.profiles where email is not null;
```
- Jika masih NULL, ulangi Step 5 (backfill)

### Copy button tidak berfungsi
**Cek console:** Pastikan tidak ada error JavaScript

## 🔄 Verification Checklist

### Database Setup:
- [ ] Kolom `referral_code` ada (Step 1)
- [ ] Generator function ada (Step 3)
- [ ] Trigger auto-generate ada (Step 4)
- [ ] User lama di-backfill (Step 5)
- [ ] Schema cache di-reload (Step 7)

### Frontend Test:
- [ ] Dashboard menampilkan kode asli
- [ ] Copy button berfungsi
- [ ] Console log menunjukkan kode
- [ ] Tidak ada REFERRAL_CODE_NOT_AVAILABLE

## 📝 Notes

### Referral Code Format:
- **Prefix**: `TPC-`
- **Length**: 8 karakter alphanumeric
- **Example**: `TPC-1A2B3C4D`
- **Unique**: Tidak ada duplikat

### Auto-Generation:
- **New users**: Otomatis via trigger
- **Existing users**: Backfill via UPDATE
- **Safe**: Handle duplicate dengan loop

### Frontend Integration:
- **Dashboard**: `profile.referral_code`
- **Copy**: `navigator.clipboard.writeText()`
- **Fallback**: UI aman jika kosong

**Execute semua steps! REFERRAL_CODE_NOT_AVAILABLE akan hilang.** 🚀
