-- FIX: Configure treasury_address in app_settings
-- This prevents "Treasury address not configured" error in create_invoice

BEGIN;

-- Remove duplicates if any (keep latest non-empty, else will set fresh)
WITH ranked AS (
  SELECT ctid, key, value,
         ROW_NUMBER() OVER (
           PARTITION BY key
           ORDER BY (NULLIF(trim(value), '') IS NULL) ASC, updated_at DESC NULLS LAST
         ) AS rn
  FROM public.app_settings
  WHERE key='treasury_address'
)
DELETE FROM public.app_settings a
USING ranked r
WHERE a.ctid=r.ctid AND r.rn > 1;

-- Upsert the correct treasury address (create if missing, update if empty)
INSERT INTO public.app_settings (key, value)
VALUES ('treasury_address', '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value;

-- Add unique constraint if missing (prevents future duplicates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'app_settings_key_unique'
  ) THEN
    ALTER TABLE public.app_settings 
    ADD CONSTRAINT app_settings_key_unique UNIQUE (key);
  END IF;
END $$;

COMMIT;

-- Verification
SELECT 'Treasury address setting verification:' as info;
SELECT key, value, length(value) as value_length
FROM public.app_settings 
WHERE key='treasury_address';
