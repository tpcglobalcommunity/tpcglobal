# TPC Invoice PROD-LOCK Audit Report - LOCALHOST

## 📍 Lingkungan
- **Environment**: LOCALHOST
- **Database**: PostgreSQL (Supabase Local)
- **Validation Date**: 2026-01-29
- **Status**: IN PROGRESS - Menunggu hasil query

## 📋 Query Results

### Query #4: RPC Signatures (must be ONLY text)
```sql
-- Output akan ditambahkan setelah menjalankan query di localhost
SELECT p.oid::regprocedure AS signature,
       p.prosecdef AS security_definer,
       pg_get_function_arguments(p.oid) AS args,
       n.nspname AS schema_name
FROM pg_proc p
JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE p.proname='get_invoice_public' AND n.nspname='public'
ORDER BY p.oid;
```

### Query #5: RPC Grants (anon + authenticated)
```sql
-- Output akan ditambahkan setelah menjalankan query di localhost
SELECT grantee, privilege_type, grantor
FROM information_schema.role_routine_grants
WHERE routine_schema='public' AND routine_name='get_invoice_public'
ORDER BY grantee, privilege_type;
```

### Query #7: 3 Invoice Terbaru
```sql
-- Output akan ditambahkan setelah menjalankan query di localhost
SELECT invoice_no, tpc_amount, total_usd, total_idr, stage, status, created_at
FROM public.tpc_invoices
ORDER BY created_at DESC
LIMIT 3;
```

### Query #8: RPC Test Verdict (harus ✅ OK)
```sql
-- Output akan ditambahkan setelah menjalankan query di localhost
-- Ganti <REAL_INVOICE_NO> dengan invoice_no dari query #7
SELECT invoice_no, tpc_amount, total_usd, total_idr, stage, status,
CASE
  WHEN total_usd > 0 AND tpc_amount = 0 THEN '❌ FAIL: mismatch tpc_amount'
  WHEN total_usd > 0 AND tpc_amount > 0 THEN '✅ OK'
  WHEN total_usd = 0 AND tpc_amount = 0 THEN 'ℹ️ zero invoice'
  ELSE '⚠️ review'
END AS verdict
FROM public.get_invoice_public('<REAL_INVOICE_NO>');
```

## 📊 Validation Checklist

### Canonical Fields
- [ ] `stage` field exists (NOT stage_key)
- [ ] `tpc_amount` field exists (canonical)
- [ ] `invoice_no` field exists (unique)

### RPC Functions
- [ ] `get_invoice_public(text)` only accepts text parameter
- [ ] Proper grants configured (anon, authenticated)
- [ ] No sensitive data exposure

### Data Integrity
- [ ] No mismatch: total_usd > 0 tapi tpc_amount = 0
- [ ] Real invoice test passes (✅ OK)

### Security
- [ ] RLS enabled on tpc_invoices
- [ ] Proper policies configured
- [ ] Admin access controlled

## 🏁 Kesimpulan

**Status**: [PENDING - Menunggu hasil query localhost]

## 📝 Notes

- SQLite version archived as: `supabase/sql/locks/invoice-prod-lock-validate.sqlite.sql`
- PostgreSQL version for Supabase: `supabase/sql/locks/invoice-prod-lock-validate.sql`
- PROD GATE aktif di guardrails untuk mencegah eksekusi production

## 🔄 Next Steps

1. Jalankan query validation di localhost Supabase
2. Paste hasil query ke section yang sesuai
3. Update kesimpulan PASS/FAIL
4. Jika FAIL, buat rekomendasi patch minimal

---

*Generated: 2026-01-29*
*Environment: LOCALHOST*
*Auditor: TPC Presale System*
