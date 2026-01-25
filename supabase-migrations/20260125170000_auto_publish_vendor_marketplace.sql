-- =====================================================
-- AUTO-PUBLISH VENDOR APPROVED TO MARKETPLACE
-- =====================================================
-- This script creates trigger and function to automatically
-- publish approved vendors to the public marketplace
-- =====================================================

-- 1. CREATE vendors_public TABLE (if not exists)
-- =====================================================

-- Create vendors_public table for marketplace display
CREATE TABLE IF NOT EXISTS public.vendors_public (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_application_id UUID UNIQUE NOT NULL REFERENCES public.vendor_applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    description_en TEXT,
    description_id TEXT,
    category TEXT NOT NULL,
    website_url TEXT,
    contact_telegram TEXT,
    contact_email TEXT,
    is_active BOOLEAN DEFAULT true,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.profiles(id),
    deactivated_at TIMESTAMPTZ,
    deactivated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on vendors_public
ALTER TABLE public.vendors_public ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vendors_public
CREATE POLICY "Anyone can view active vendors" ON public.vendors_public
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view vendors (with active status visible)" ON public.vendors_public
    FOR SELECT USING (true);

-- Admins can manage vendors_public
CREATE POLICY "Admins can manage vendors_public" ON public.vendors_public
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 2. CREATE TRIGGER FUNCTION: handle_vendor_status_change
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_vendor_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_old_status TEXT;
    v_new_status TEXT;
    v_existing_vendor UUID;
    v_admin_id UUID;
BEGIN
    -- Get old and new status
    v_old_status := OLD.status;
    v_new_status := NEW.status;
    
    -- Get admin ID from reviewed_by (if available)
    v_admin_id := COALESCE(NEW.reviewed_by, OLD.reviewed_by);
    
    -- CASE 1: Status changed TO 'approved' - publish to marketplace
    IF v_old_status != 'approved' AND v_new_status = 'approved' THEN
        -- Check if vendor already exists in vendors_public
        SELECT id INTO v_existing_vendor
        FROM public.vendors_public
        WHERE vendor_application_id = NEW.id;
        
        IF v_existing_vendor IS NOT NULL THEN
            -- Update existing record (reactivate if was deactivated)
            UPDATE public.vendors_public
            SET 
                brand_name = NEW.brand_name,
                description_en = NEW.description,
                description_id = NEW.description,
                category = NEW.category,
                website_url = NEW.website,
                contact_telegram = NEW.contact_whatsapp,
                contact_email = NEW.contact_email,
                is_active = true,
                approved_at = NEW.reviewed_at,
                approved_by = v_admin_id,
                deactivated_at = NULL,
                deactivated_by = NULL,
                updated_at = now()
            WHERE vendor_application_id = NEW.id;
        ELSE
            -- Insert new record for approved vendor
            INSERT INTO public.vendors_public (
                vendor_application_id,
                user_id,
                brand_name,
                description_en,
                description_id,
                category,
                website_url,
                contact_telegram,
                contact_email,
                is_active,
                approved_at,
                approved_by,
                created_at,
                updated_at
            ) VALUES (
                NEW.id,
                NEW.user_id,
                NEW.brand_name,
                NEW.description,
                NEW.description,
                NEW.category,
                NEW.website,
                NEW.contact_whatsapp,
                NEW.contact_email,
                true,
                NEW.reviewed_at,
                v_admin_id,
                now(),
                now()
            );
        END IF;
        
        -- Log the auto-publish action
        BEGIN
            INSERT INTO public.admin_actions (
                admin_id,
                action_type,
                target_user_id,
                details,
                created_at
            ) VALUES (
                v_admin_id,
                'vendor_auto_published',
                NEW.user_id,
                jsonb_build_object(
                    'vendor_application_id', NEW.id,
                    'brand_name', NEW.brand_name,
                    'category', NEW.category,
                    'auto_published_at', now()
                ),
                now()
            );
        EXCEPTION
            WHEN undefined_table THEN
                -- admin_actions table doesn't exist, ignore logging
                NULL;
        END;
        
    -- CASE 2: Status changed TO 'rejected' - deactivate from marketplace
    ELSIF v_old_status != 'rejected' AND v_new_status = 'rejected' THEN
        -- Deactivate vendor from marketplace
        UPDATE public.vendors_public
        SET 
            is_active = false,
            deactivated_at = NEW.reviewed_at,
            deactivated_by = v_admin_id,
            updated_at = now()
        WHERE vendor_application_id = NEW.id;
        
        -- Log the auto-deactivate action
        BEGIN
            INSERT INTO public.admin_actions (
                admin_id,
                action_type,
                target_user_id,
                details,
                created_at
            ) VALUES (
                v_admin_id,
                'vendor_auto_deactivated',
                NEW.user_id,
                jsonb_build_object(
                    'vendor_application_id', NEW.id,
                    'brand_name', NEW.brand_name,
                    'category', NEW.category,
                    'auto_deactivated_at', now()
                ),
                now()
            );
        EXCEPTION
            WHEN undefined_table THEN
                -- admin_actions table doesn't exist, ignore logging
                NULL;
        END;
        
    -- CASE 3: Status changed FROM 'approved' to something else (e.g., back to pending)
    ELSIF v_old_status = 'approved' AND v_new_status != 'approved' THEN
        -- Deactivate vendor from marketplace
        UPDATE public.vendors_public
        SET 
            is_active = false,
            deactivated_at = NEW.reviewed_at,
            deactivated_by = v_admin_id,
            updated_at = now()
        WHERE vendor_application_id = NEW.id;
        
        -- Log the status change
        BEGIN
            INSERT INTO public.admin_actions (
                admin_id,
                action_type,
                target_user_id,
                details,
                created_at
            ) VALUES (
                v_admin_id,
                'vendor_status_changed',
                NEW.user_id,
                jsonb_build_object(
                    'vendor_application_id', NEW.id,
                    'brand_name', NEW.brand_name,
                    'old_status', v_old_status,
                    'new_status', v_new_status,
                    'deactivated_at', now()
                ),
                now()
            );
        EXCEPTION
            WHEN undefined_table THEN
                -- admin_actions table doesn't exist, ignore logging
                NULL;
        END;
    END IF;
    
    -- Return the modified record
    RETURN NEW;
END;
$$;

-- 3. CREATE TRIGGER: vendor_status_change_trigger
-- =====================================================

-- Create trigger that fires on UPDATE of vendor_applications
DROP TRIGGER IF EXISTS vendor_status_change_trigger ON public.vendor_applications;
CREATE TRIGGER vendor_status_change_trigger
    AFTER UPDATE ON public.vendor_applications
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status) -- Only fire when status actually changes
    EXECUTE FUNCTION public.handle_vendor_status_change();

-- 4. CREATE HELPER FUNCTION: sync_existing_approved_vendors
-- =====================================================

-- Function to sync existing approved vendors to marketplace
CREATE OR REPLACE FUNCTION public.sync_existing_approved_vendors()
RETURNS TABLE (
    synced_count INTEGER,
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_synced_count INTEGER := 0;
    v_error_message TEXT;
    v_admin_role TEXT;
BEGIN
    -- Check if current user is admin
    SELECT role INTO v_admin_role
    FROM public.profiles
    WHERE id = auth.uid();
    
    IF v_admin_role NOT IN ('admin', 'super_admin') THEN
        RAISE EXCEPTION 'forbidden: admin privileges required';
    END IF;
    
    -- Sync existing approved vendors
    BEGIN
        INSERT INTO public.vendors_public (
            vendor_application_id,
            user_id,
            brand_name,
            description_en,
            description_id,
            category,
            website_url,
            contact_telegram,
            contact_email,
            is_active,
            approved_at,
            approved_by,
            created_at,
            updated_at
        )
        SELECT 
            va.id,
            va.user_id,
            va.brand_name,
            va.description,
            va.description,
            va.category,
            va.website,
            va.contact_whatsapp,
            va.contact_email,
            true,
            va.reviewed_at,
            va.reviewed_by,
            va.created_at,
            now()
        FROM public.vendor_applications va
        WHERE va.status = 'approved'
        AND NOT EXISTS (
            SELECT 1 FROM public.vendors_public vp 
            WHERE vp.vendor_application_id = va.id
        );
        
        GET DIAGNOSTICS v_synced_count = ROW_COUNT;
        
    EXCEPTION
        WHEN OTHERS THEN
            v_error_message := SQLERRM;
    END;
    
    RETURN QUERY SELECT v_synced_count, v_error_message;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.sync_existing_approved_vendors() TO authenticated;

-- 5. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Create indexes for vendors_public table
CREATE INDEX IF NOT EXISTS idx_vendors_public_vendor_application_id ON public.vendors_public(vendor_application_id);
CREATE INDEX IF NOT EXISTS idx_vendors_public_user_id ON public.vendors_public(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_public_is_active ON public.vendors_public(is_active);
CREATE INDEX IF NOT EXISTS idx_vendors_public_category ON public.vendors_public(category);
CREATE INDEX IF NOT EXISTS idx_vendors_public_brand_name ON public.vendors_public(brand_name);
CREATE INDEX IF NOT EXISTS idx_vendors_public_created_at ON public.vendors_public(created_at DESC);

-- 6. CREATE VIEW FOR PUBLIC MARKETPLACE
-- =====================================================

-- Create view for easy marketplace queries
CREATE OR REPLACE VIEW public.marketplace_vendors AS
SELECT 
    vp.id,
    vp.vendor_application_id,
    vp.user_id,
    vp.brand_name,
    vp.description_en,
    vp.description_id,
    vp.category,
    vp.website_url,
    vp.contact_telegram,
    vp.contact_email,
    vp.is_active,
    vp.approved_at,
    vp.approved_by,
    vp.created_at,
    vp.updated_at,
    -- Include user profile info
    p.username,
    p.email as user_email,
    p.verified as user_verified
FROM public.vendors_public vp
LEFT JOIN public.profiles p ON vp.user_id = p.id
WHERE vp.is_active = true;

-- 7. VERIFICATION QUERIES
-- =====================================================

-- Test the trigger and functions (run these manually to verify)

-- 1. Check existing approved vendors
-- SELECT * FROM public.vendor_applications WHERE status = 'approved';

-- 2. Sync existing approved vendors to marketplace
-- SELECT * FROM public.sync_existing_approved_vendors();

-- 3. Check marketplace vendors
-- SELECT * FROM public.marketplace_vendors;

-- 4. Test trigger by updating a vendor status
-- UPDATE public.vendor_applications 
-- SET status = 'approved', reviewed_by = 'your-admin-uuid', reviewed_at = now()
-- WHERE id = 'test-vendor-application-id';

-- 5. Verify the vendor was published
-- SELECT * FROM public.vendors_public WHERE vendor_application_id = 'test-vendor-application-id';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- The auto-publish vendor system is now implemented with:
-- ✅ Automatic trigger on status changes
-- ✅ Approved vendors published to marketplace
-- ✅ Rejected vendors deactivated from marketplace
-- ✅ Audit logging for all changes
-- ✅ Performance indexes
-- ✅ Public marketplace view
-- ✅ Sync function for existing approved vendors
-- =====================================================
