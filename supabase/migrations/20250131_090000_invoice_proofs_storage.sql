-- Invoice Proofs Storage Bucket
-- Creates bucket for payment proof uploads

-- Create storage bucket for invoice proofs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'invoice-proofs',
    'invoice-proofs',
    false,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for invoice-proofs bucket
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload invoice proofs" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'invoice-proofs' AND 
    auth.role() = 'authenticated'
);

-- Allow users to view their own uploads (if needed)
CREATE POLICY "Users can view own invoice proofs" ON storage.objects
FOR SELECT USING (
    bucket_id = 'invoice-proofs' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all proofs
CREATE POLICY "Admins can view all invoice proofs" ON storage.objects
FOR SELECT USING (
    bucket_id = 'invoice-proofs' AND 
    public.is_admin_uuid(auth.uid())
);

-- Allow anon uploads via RPC (if needed for email link confirmations)
-- This would require a separate RPC to generate signed URLs

-- Verification
DO $$
BEGIN
  RAISE NOTICE '=== Invoice Proofs Storage Created ===';
  RAISE NOTICE 'Bucket: invoice-proofs (private, 10MB limit)';
  RAISE NOTICE 'Allowed formats: JPEG, PNG, PDF';
  RAISE NOTICE 'Policies: Authenticated upload, admin view all';
END $$;
