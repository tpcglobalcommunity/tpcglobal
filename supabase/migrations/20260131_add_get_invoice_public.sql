-- Add missing get_invoice_public RPC function for invoice detail page
-- This provides safe public access to invoice data without exposing private information

BEGIN;

CREATE OR REPLACE FUNCTION public.get_invoice_public(p_invoice_no text)
RETURNS TABLE (
  invoice_no text,
  status text,
  stage text,
  tpc_amount numeric,
  unit_price_usd numeric,
  total_usd numeric,
  usd_idr_rate numeric,
  total_idr numeric,
  treasury_address text,
  created_at timestamptz,
  expires_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    i.invoice_no,
    i.status,
    i.stage,
    i.tpc_amount,
    i.unit_price_usd,
    i.total_usd,
    i.usd_idr_rate,
    i.total_idr,
    i.treasury_address,
    i.created_at,
    i.expires_at
  FROM public.tpc_invoices i
  WHERE i.invoice_no = p_invoice_no
  LIMIT 1;
$$;

-- Grants for public access
REVOKE ALL ON FUNCTION public.get_invoice_public(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invoice_public(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_invoice_public(text) TO authenticated;

COMMIT;
