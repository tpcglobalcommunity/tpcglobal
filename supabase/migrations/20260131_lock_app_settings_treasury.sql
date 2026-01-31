-- LOCK app_settings with unique key + treasury address
-- This prevents duplicate treasury_address entries and ensures proper configuration

BEGIN;

-- Ensure unique key constraint exists (needed for safe upsert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'app_settings_key_unique'
      AND conrelid = 'public.app_settings'::regclass
  ) THEN
    ALTER TABLE public.app_settings
    ADD CONSTRAINT app_settings_key_unique UNIQUE (key);
  END IF;
END $$;

-- Remove duplicates for treasury_address if any (keep latest non-empty)
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

-- Upsert correct treasury address
INSERT INTO public.app_settings (key, value)
VALUES ('treasury_address', '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

COMMIT;
