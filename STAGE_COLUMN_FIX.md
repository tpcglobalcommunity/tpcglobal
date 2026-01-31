# Fix Supabase RPC 400 Error: Missing "stage" Column

## Problem
```
POST .../rpc/create_invoice 400
error code 42703
message: column "stage" of relation "tpc_invoices" does not exist
```

## Root Cause
The `create_invoice` RPC function was trying to insert a `stage` column into `tpc_invoices` table, but the column didn't exist in the database schema.

## Solution Applied

### 1. Database Migration
Created migration: `supabase/migrations/20260131_120000_fix_tpc_invoices_stage.sql`

**What it does:**
- Adds `stage` column to `tpc_invoices` table
- Adds check constraint for valid values: `stage1`, `stage2`, `dex`, `unknown`
- Backfills existing rows with `active_stage` from app_settings or defaults to `stage1`
- Sets column as NOT NULL with default `stage1`

### 2. Emergency SQL Script
Created: `fix_stage_column.sql`

**Use this if you need immediate fix:**
Run this SQL directly in Supabase SQL Editor to apply the fix immediately.

### 3. RPC Function Status
✅ **Already Fixed** - The `create_invoice` RPC function in `20250131_030000_fix_create_invoice_final.sql` already includes the `stage` column in its INSERT statement.

### 4. Client-Side Status
✅ **Already Ready** - TypeScript types in `src/integrations/supabase/types.ts` already include the `stage` field.

## How to Apply the Fix

### Option A: Apply Migration (Recommended)
```bash
# If you have Supabase CLI setup
supabase db push
```

### Option B: Apply SQL Directly (Emergency)
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste contents of `fix_stage_column.sql`
4. Run the SQL

## Verification

After applying the fix, run these verification queries:

```sql
-- Check column exists
SELECT column_name, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema='public' 
  AND table_name='tpc_invoices' 
  AND column_name='stage';

-- Check backfill results
SELECT stage, count(*) as count 
FROM public.tpc_invoices 
GROUP BY stage 
ORDER BY stage;
```

## Test the Fix

1. Go to `/en/buytpc` or `/id/buytpc`
2. Fill out the form and create an invoice
3. Should work without 400 error
4. Check that invoice has `stage` field populated

## Files Changed

1. `supabase/migrations/20260131_120000_fix_tpc_invoices_stage.sql` - Migration
2. `fix_stage_column.sql` - Emergency SQL script
3. `STAGE_COLUMN_FIX.md` - This documentation

## Status

- ✅ Migration created
- ✅ Build passes
- ✅ Types already aligned
- ✅ RPC function ready
- 🔄 **Waiting for database migration to be applied**

## Next Steps

1. Apply the migration to your Supabase database
2. Test invoice creation in the UI
3. Verify the `stage` column is populated correctly
