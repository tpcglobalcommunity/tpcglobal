-- Seed Super Admin Referral Code TPC000001
-- Creates referral system and seeds super admin referral

-- Phase 1: Create referral tracking table (primary table)
CREATE TABLE IF NOT EXISTS public.referral_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    user_id UUID,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for referral codes
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON public.referral_codes(is_active);

-- Phase 2: Add referral_code to invoices table (if table exists)
DO $$
BEGIN
    -- Check if invoices table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema='public' AND table_name='invoices'
    ) THEN
        -- Check if referral_code column exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='invoices' AND column_name='referral_code'
        ) THEN
            ALTER TABLE public.invoices ADD COLUMN referral_code TEXT;
            
            -- Add index for performance
            CREATE INDEX idx_invoices_referral_code ON public.invoices(referral_code);
        END IF;
    END IF;
END $$;

-- Phase 3: Seed Super Admin Referral Code
INSERT INTO public.referral_codes (code, user_id, is_active)
VALUES ('TPC000001', '518694f6-bb50-4724-b4a5-77ad30152e0e', true)
ON CONFLICT (code)
DO UPDATE SET 
    user_id = EXCLUDED.user_id,
    is_active = EXCLUDED.is_active;

-- Phase 4: Create function to validate referral code
CREATE OR REPLACE FUNCTION public.validate_referral_code(p_referral_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    -- Normalize referral code (UPPER + TRIM)
    p_referral_code := UPPER(TRIM(p_referral_code));
    
    -- Check if referral code exists and is active
    SELECT EXISTS(
        SELECT 1 FROM referral_codes 
        WHERE code = p_referral_code AND is_active = true
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$$;

-- Grant execute permissions
REVOKE ALL ON FUNCTION public.validate_referral_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_referral_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_referral_code(TEXT) TO authenticated;

-- Phase 5: Create update_updated_at_column function (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Phase 6: Update trigger for updated_at
CREATE TRIGGER update_referral_codes_updated_at 
BEFORE UPDATE ON public.referral_codes 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Verification Notice
DO $$
BEGIN
    RAISE NOTICE '=== Super Admin Referral Code Seeded ===';
    RAISE NOTICE 'Referral Code: TPC000001';
    RAISE NOTICE 'User ID: 518694f6-bb50-4724-b4a5-77ad30152e0e';
    RAISE NOTICE 'Created referral_codes tracking table';
    RAISE NOTICE 'Added referral_code column to invoices table (if exists)';
    RAISE NOTICE 'Created validate_referral_code function';
    RAISE NOTICE 'Created update_updated_at_column function';
END $$;
