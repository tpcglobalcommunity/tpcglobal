/*
  # Create Avatars Storage Bucket

  1. Storage Bucket
    - Create 'avatars' bucket for user profile pictures
    - Public read access for verified member page
    - Files organized by user ID: avatars/{user_id}/profile.{ext}

  2. Storage Policies
    - INSERT: Users can only upload to their own folder
    - UPDATE: Users can only update their own files
    - DELETE: Users can only delete their own files
    - SELECT: Public read access (allows avatars to show on verify page)

  3. Security
    - Path-based access control (user can only access their own folder)
    - File size limits enforced at application level (2MB max)
    - File type restrictions enforced at application level (images only)

  4. Important Notes
    - Avatars are public-readable for profile display
    - Each user can only modify their own avatar folder
    - Recommended path: avatars/{user_id}/profile.{ext}
*/

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Public read access for all avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');