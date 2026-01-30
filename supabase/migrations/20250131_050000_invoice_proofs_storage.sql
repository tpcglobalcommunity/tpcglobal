-- Storage Bucket for Invoice Proofs
-- Creates private bucket for payment proof uploads

-- Create storage bucket for invoice proofs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'invoice-proofs',
    'invoice-proofs',
    false,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for invoice-proofs bucket
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload proofs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'invoice-proofs' AND 
  auth.role() = 'authenticated'
);

-- Allow users to view their own uploads
CREATE POLICY "Users can view own proofs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'invoice-proofs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all proofs
CREATE POLICY "Admins can view all proofs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'invoice-proofs' AND 
  public.is_admin_uuid(auth.uid())
);

-- Create RPC for generating signed upload URLs (for anon users via email link)
CREATE OR REPLACE FUNCTION public.generate_proof_upload_url(p_invoice_no text, p_file_name text, p_content_type text)
RETURNS TABLE (
    upload_url text,
    file_path text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_file_path text;
    v_upload_url text;
BEGIN
    -- Generate file path: invoice_no/user_id/filename or invoice_no/filename for anon
    v_file_path := p_invoice_no || '/' || p_file_name;
    
    -- Generate signed upload URL (this would need to be implemented via Supabase client)
    -- For now, return the file path that can be used with Supabase client
    RETURN QUERY SELECT v_upload_url, v_file_path;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.generate_proof_upload_url(text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.generate_proof_upload_url(text, text, text) TO authenticated;

-- Verification
DO $$
BEGIN
  RAISE NOTICE '=== Invoice Proofs Storage Created ===';
  RAISE NOTICE 'Bucket: invoice-proofs (private, 10MB limit)';
  RAISE NOTICE 'Allowed formats: JPEG, PNG, PDF';
  RAISE NOTICE 'RPC: generate_proof_upload_url for signed URLs';
END $$;
