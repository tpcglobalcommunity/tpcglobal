-- Admin Review RPC
-- Security DEFINER RPC for admin approval/rejection

CREATE OR REPLACE FUNCTION public.admin_review_invoice(
    p_invoice_no text,
    p_action text,
    p_note text DEFAULT NULL
)
RETURNS TABLE (
    invoice_no text,
    old_status text,
    new_status text,
    reviewed_by uuid,
    reviewed_at timestamptz,
    review_note text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invoice_exists boolean;
    v_current_status text;
    v_user_id uuid;
    v_new_status text;
BEGIN
    -- Verify caller is admin
    v_user_id := auth.uid();
    IF v_user_id IS NULL OR NOT public.is_admin_uuid(v_user_id) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    -- Validate action
    IF p_action NOT IN ('APPROVE', 'REJECT') THEN
        RAISE EXCEPTION 'Invalid action: %. Must be APPROVE or REJECT', p_action;
    END IF;
    
    -- Check if invoice exists
    SELECT EXISTS(
        SELECT 1 FROM public.tpc_invoices 
        WHERE invoice_no = p_invoice_no
    ) INTO v_invoice_exists;
    
    IF NOT v_invoice_exists THEN
        RAISE EXCEPTION 'Invoice not found: %', p_invoice_no;
    END IF;
    
    -- Get current status
    SELECT status INTO v_current_status
    FROM public.tpc_invoices
    WHERE invoice_no = p_invoice_no;
    
    -- Only allow review of PENDING_REVIEW invoices
    IF v_current_status != 'PENDING_REVIEW' THEN
        RAISE EXCEPTION 'Invoice cannot be reviewed. Current status: %', v_current_status;
    END IF;
    
    -- Determine new status
    v_new_status := CASE p_action
        WHEN 'APPROVE' THEN 'PAID'
        WHEN 'REJECT' THEN 'REJECTED'
    END;
    
    -- Update invoice with review decision
    UPDATE public.tpc_invoices
    SET 
        status = v_new_status,
        reviewed_by = v_user_id,
        reviewed_at = now(),
        review_note = p_note,
        updated_at = now()
    WHERE invoice_no = p_invoice_no;
    
    -- Return review result
    RETURN QUERY
    SELECT 
        i.invoice_no,
        v_current_status as old_status,
        v_new_status as new_status,
        i.reviewed_by,
        i.reviewed_at,
        i.review_note
    FROM public.tpc_invoices i
    WHERE i.invoice_no = p_invoice_no;
END;
$$;

-- Grant permissions (admin only)
GRANT EXECUTE ON FUNCTION public.admin_review_invoice(text, text, text) TO authenticated;

-- Create RPC for admin to list invoices for review
CREATE OR REPLACE FUNCTION public.admin_list_invoices(
    p_status text DEFAULT NULL,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    invoice_no text,
    stage text,
    tpc_amount numeric,
    total_usd numeric,
    total_idr numeric,
    status text,
    payment_method text,
    payer_name text,
    payer_ref text,
    proof_url text,
    created_at timestamptz,
    reviewed_at timestamptz,
    reviewed_by uuid,
    review_note text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Verify caller is admin
    v_user_id := auth.uid();
    IF v_user_id IS NULL OR NOT public.is_admin_uuid(v_user_id) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    -- Return invoices with optional status filter
    RETURN QUERY
    SELECT 
        i.invoice_no,
        i.stage,
        i.tpc_amount,
        i.total_usd,
        i.total_idr,
        i.status,
        i.payment_method,
        i.payer_name,
        i.payer_ref,
        i.proof_url,
        i.created_at,
        i.reviewed_at,
        i.reviewed_by,
        i.review_note
    FROM public.tpc_invoices i
    WHERE (p_status IS NULL OR i.status = p_status)
    ORDER BY i.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Grant permissions (admin only)
GRANT EXECUTE ON FUNCTION public.admin_list_invoices(text, integer, integer) TO authenticated;

-- Verification
DO $$
BEGIN
  RAISE NOTICE '=== Admin Review RPC Created ===';
  RAISE NOTICE 'Functions: admin_review_invoice, admin_list_invoices';
  RAISE NOTICE 'Security: Admin-only with is_admin_uuid verification';
  RAISE NOTICE 'Actions: APPROVE -> PAID, REJECT -> REJECTED';
  RAISE NOTICE 'Audit: reviewed_by, reviewed_at, review_note recorded';
END $$;
