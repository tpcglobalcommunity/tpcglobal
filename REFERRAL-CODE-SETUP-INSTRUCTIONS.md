# Referral Code Setup Instructions

## Cara Eksekusi SQL di Supabase Dashboard

### 1. Buka Supabase SQL Editor
- Login ke [Supabase Dashboard](https://supabase.com/dashboard)
- Pilih project TPC Global
- Klik menu "SQL Editor" di sidebar
- Klik "New query" untuk buat query baru

### 2. Eksekusi Langkah A (Cek Schema)
```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema='public' and table_name='profiles'
order by ordinal_position;
```
- Klik "Run" 
- **Lihat hasil**: Apakah ada kolom `referral_code`?

### 3. Jika Belum Ada → Eksekusi Langkah B
```sql
alter table public.profiles
add column if not exists referral_code text;

create unique index if not exists profiles_referral_code_unique
on public.profiles (referral_code)
where referral_code is not null;
```

### 4. Eksekusi Langkah C (Function Generator)
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

### 5. Eksekusi Langkah D (Trigger Auto-Generate)
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

### 6. Eksekusi Langkah E (Backfill User Lama)
```sql
update public.profiles
set referral_code = public.generate_referral_code()
where referral_code is null or referral_code = '';
```

### 7. Eksekusi Langkah F (Reload Schema Cache)
```sql
select pg_notify('pgrst', 'reload schema');
```

### 8. Eksekusi Langkah G (Test Hasil)
```sql
select id, email, full_name, referral_code, updated_at
from public.profiles
order by updated_at desc
limit 10;
```

### 9. Verifikasi di Frontend
- Buka dashboard: http://localhost:5174/en/member/dashboard
- Hard refresh (Ctrl+Shift+R)
- **Harus melihat**: Referral code format "TPC-XXXXXXXX"
- **Test tombol**: "Copy Code" harus berfungsi

## Expected Results

### Setelah Langkah G:
```
id | email | full_name | referral_code | updated_at
----+-------+-----------+---------------+------------
xxx | xxx   | xxx       | TPC-1A2B3C4D  | 2024-01-...
```

### Setelah Test Frontend:
- ✅ Referral code tampil (bukan "REFERRAL_CODE_NOT_AVAILABLE")
- ✅ Console log: `[Dashboard] referral_code loaded: TPC-XXXXXXXX`
- ✅ Copy button aktif dan berfungsi

## Troubleshooting

### Jika Error di Langkah C/D:
- Pastikan role postgres (bukan anon/web)
- Cek apakah extension `pgcrypto` sudah diinstall:
  ```sql
  select * from pg_extension where extname = 'pgcrypto';
  ```

### Jika Masih Kosong Setelah Backfill:
- Cek jumlah affected rows di Langkah E
- Jalankan ulang Langkah E jika perlu

### Jika Copy Button Tidak Berfungsi:
- Pastikan referral_code tidak null/empty
- Cek console untuk error

## Format Referral Code
- **Prefix**: `TPC-`
- **Length**: 8 karakter alphanumeric
- **Example**: `TPC-1A2B3C4D`
- **Unique**: Tidak ada duplikat di database
