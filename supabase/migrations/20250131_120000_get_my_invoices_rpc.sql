-- Create RPC function for users to get their own invoices
-- SECURITY DEFINER with auth.uid() check for RLS compliance

CREATE OR REPLACE FUNCTION public.get_my_invoices()
RETURNS TABLE (
    invoice_no TEXT,
    status TEXT,
    tpc_amount NUMERIC,
    price_usd NUMERIC,
    total_usd NUMERIC,
    total_idr NUMERIC,
    usd_idr_rate NUMERIC,
    treasury_address TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    admin_note TEXT,
    tx_hash TEXT,
    payment_method TEXT,
    buyer_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Return only invoices belonging to the authenticated user
    RETURN QUERY
    SELECT 
        i.invoice_no,
        i.status,
        i.tpc_amount,
        i.price_usd,
        i.total_usd,
        i.total_idr,
        i.usd_idr_rate,
        i.treasury_address,
        i.expires_at,
        i.created_at,
        i.updated_at,
        i.paid_at,
        i.confirmed_at,
        i.approved_at,
        i.admin_note,
        i.tx_hash,
        i.payment_method,
        i.buyer_email
    FROM public.tpc_invoices i
    WHERE i.user_id = auth.uid()
    ORDER BY i.created_at DESC;
    
    RETURN;
END;
$$;

-- Create RPC function for users to get a specific invoice
CREATE OR REPLACE FUNCTION public.get_my_invoice(p_invoice_no TEXT)
RETURNS TABLE (
    invoice_no TEXT,
    status TEXT,
    tpc_amount NUMERIC,
    price_usd NUMERIC,
    total_usd NUMERIC,
    total_idr NUMERIC,
    usd_idr_rate NUMERIC,
    treasury_address TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    admin_note TEXT,
    tx_hash TEXT,
    payment_method TEXT,
    buyer_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Return only the specific invoice belonging to the authenticated user
    RETURN QUERY
    SELECT 
        i.invoice_no,
        i.status,
        i.tpc_amount,
        i.price_usd,
        i.total_usd,
        i.total_idr,
        i.usd_idr_rate,
        i.treasury_address,
        i.expires_at,
        i.created_at,
        i.updated_at,
        i.paid_at,
        i.confirmed_at,
        i.approved_at,
        i.admin_note,
        i.tx_hash,
        i.payment_method,
        i.buyer_email
    FROM public.tpc_invoices i
    WHERE i.user_id = auth.uid()
      AND i.invoice_no = p_invoice_no;
    
    RETURN;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_invoices() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_invoice(TEXT) TO authenticated;
-- Revoke from anon for security
REVOKE EXECUTE ON FUNCTION public.get_my_invoices() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_my_invoice(TEXT) FROM anon;
