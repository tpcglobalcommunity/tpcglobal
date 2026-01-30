-- Create Public Presale Settings (Safe & Simple)
-- Creates minimal app_settings table and public RPC

-- Create app_settings table if not exists
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings
CREATE POLICY "Public read access to app_settings" ON public.app_settings
  FOR SELECT USING (true);

-- Insert default settings
INSERT INTO public.app_settings (key, value) VALUES
('active_stage', 'stage1'),
('stage1_price_usd', '0.001'),
('stage2_price_usd', '0.002'),
('usd_idr_rate', '17000'),
('treasury_address', '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw')
ON CONFLICT (key) DO NOTHING;

-- Create public RPC for presale settings
CREATE OR REPLACE FUNCTION public.get_presale_settings_public()
RETURNS TABLE (
  active_stage text,
  stage1_price_usd numeric,
  stage2_price_usd numeric,
  usd_idr_rate numeric,
  treasury_address text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT value FROM public.app_settings WHERE key='active_stage') as active_stage,
    (SELECT value::numeric FROM public.app_settings WHERE key='stage1_price_usd') as stage1_price_usd,
    (SELECT value::numeric FROM public.app_settings WHERE key='stage2_price_usd') as stage2_price_usd,
    (SELECT value::numeric FROM public.app_settings WHERE key='usd_idr_rate') as usd_idr_rate,
    (SELECT value FROM public.app_settings WHERE key='treasury_address') as treasury_address;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_presale_settings_public() TO anon;
GRANT EXECUTE ON FUNCTION public.get_presale_settings_public() TO authenticated;

-- Verification
DO $$
BEGIN
  RAISE NOTICE '=== Public Presale Settings Created ===';
  RAISE NOTICE 'Table: app_settings';
  RAISE NOTICE 'Function: get_presale_settings_public()';
  RAISE NOTICE 'Permissions: Granted to anon and authenticated';
END $$;
