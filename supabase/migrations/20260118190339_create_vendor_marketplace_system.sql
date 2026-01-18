/*
  # Create Vendor Marketplace System - Compliance-Safe Foundation

  1. New Tables
    - `vendor_applications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) - Applicant
      - `brand_name` (text) - Vendor brand name
      - `description_en` (text) - English description
      - `description_id` (text) - Indonesian description
      - `category` (text) - Vendor category
      - `website_url` (text, nullable) - Optional website
      - `contact_telegram` (text, nullable) - Optional Telegram
      - `contact_email` (text, nullable) - Optional email
      - `status` (text) - pending, approved, rejected
      - `reviewed_by` (uuid, nullable) - Admin who reviewed
      - `reviewed_at` (timestamptz, nullable) - Review timestamp
      - `created_at` (timestamptz) - Application submission
      - `updated_at` (timestamptz) - Last update

  2. Helper Functions
    - `is_admin()` - Check if user is admin or super_admin
    - `get_public_vendors()` - Get approved vendors for public marketplace

  3. Security
    - Enable RLS on vendor_applications
    - Users can only insert their own applications
    - Users can only view their own applications
    - Only admins can update status
    - Only super_admins can delete
    - Public RPC returns ONLY approved vendors with safe fields

  4. Important Notes
    - Marketplace is INFO + CONTACT only (NO payment, NO guarantees)
    - Status changes auto-set reviewed_at timestamp
    - Public access through secure RPC only
    - No user_id exposed in public view
    - Compliance-safe: no financial claims or promises
*/

-- Create vendor_applications table
CREATE TABLE IF NOT EXISTS vendor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name text NOT NULL CHECK (length(brand_name) >= 3),
  description_en text NOT NULL CHECK (length(description_en) >= 20),
  description_id text NOT NULL CHECK (length(description_id) >= 20),
  category text NOT NULL,
  website_url text,
  contact_telegram text,
  contact_email text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_applications_status ON vendor_applications(status);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_category ON vendor_applications(category);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_created_at ON vendor_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_user_id ON vendor_applications(user_id);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_vendor_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vendor_applications_updated_at ON vendor_applications;
CREATE TRIGGER vendor_applications_updated_at
  BEFORE UPDATE ON vendor_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_applications_updated_at();

-- Create trigger to auto-set reviewed_at when status changes
CREATE OR REPLACE FUNCTION set_vendor_reviewed_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    NEW.reviewed_at = NOW();
    NEW.reviewed_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vendor_status_change ON vendor_applications;
CREATE TRIGGER vendor_status_change
  BEFORE UPDATE ON vendor_applications
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION set_vendor_reviewed_timestamp();

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = uid;
  
  RETURN user_role IN ('admin', 'super_admin');
END;
$$;

-- Enable RLS
ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can insert their own applications
CREATE POLICY "Users can insert own vendor application"
  ON vendor_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can view their own applications
CREATE POLICY "Users can view own vendor application"
  ON vendor_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Admins can view all applications
CREATE POLICY "Admins can view all vendor applications"
  ON vendor_applications
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policy: Admins can update applications
CREATE POLICY "Admins can update vendor applications"
  ON vendor_applications
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- RLS Policy: Super admins can delete applications
CREATE POLICY "Super admins can delete vendor applications"
  ON vendor_applications
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Create RPC to get public vendors (approved only, safe fields)
CREATE OR REPLACE FUNCTION get_public_vendors(p_category text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  brand_name text,
  description_en text,
  description_id text,
  category text,
  website_url text,
  contact_telegram text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    va.id,
    va.brand_name,
    va.description_en,
    va.description_id,
    va.category,
    va.website_url,
    va.contact_telegram,
    va.created_at
  FROM vendor_applications va
  WHERE va.status = 'approved'
    AND (p_category IS NULL OR va.category = p_category)
  ORDER BY va.created_at DESC;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION get_public_vendors(text) TO anon, authenticated;

-- Create RPC to submit vendor application
CREATE OR REPLACE FUNCTION submit_vendor_application(
  p_brand_name text,
  p_description_en text,
  p_description_id text,
  p_category text,
  p_website_url text DEFAULT NULL,
  p_contact_telegram text DEFAULT NULL,
  p_contact_email text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_existing_pending int;
  v_application_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check for existing pending application
  SELECT COUNT(*) INTO v_existing_pending
  FROM vendor_applications
  WHERE user_id = v_user_id AND status = 'pending';

  IF v_existing_pending > 0 THEN
    RAISE EXCEPTION 'You already have a pending vendor application';
  END IF;

  -- Insert application
  INSERT INTO vendor_applications (
    user_id,
    brand_name,
    description_en,
    description_id,
    category,
    website_url,
    contact_telegram,
    contact_email
  ) VALUES (
    v_user_id,
    TRIM(p_brand_name),
    TRIM(p_description_en),
    TRIM(p_description_id),
    p_category,
    NULLIF(TRIM(p_website_url), ''),
    NULLIF(TRIM(p_contact_telegram), ''),
    NULLIF(TRIM(p_contact_email), '')
  )
  RETURNING id INTO v_application_id;

  RETURN v_application_id;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_vendor_application(text, text, text, text, text, text, text) TO authenticated;

-- Create RPC to get vendor applications with user info (admin only)
CREATE OR REPLACE FUNCTION get_vendor_applications_admin(p_status text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  username text,
  brand_name text,
  description_en text,
  description_id text,
  category text,
  website_url text,
  contact_telegram text,
  contact_email text,
  status text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    va.id,
    va.user_id,
    p.username,
    va.brand_name,
    va.description_en,
    va.description_id,
    va.category,
    va.website_url,
    va.contact_telegram,
    va.contact_email,
    va.status,
    va.reviewed_by,
    va.reviewed_at,
    va.created_at,
    va.updated_at
  FROM vendor_applications va
  JOIN profiles p ON p.id = va.user_id
  WHERE p_status IS NULL OR va.status = p_status
  ORDER BY 
    CASE va.status
      WHEN 'pending' THEN 1
      WHEN 'approved' THEN 2
      WHEN 'rejected' THEN 3
    END,
    va.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_vendor_applications_admin(text) TO authenticated;

-- Create RPC to update vendor application status (admin only)
CREATE OR REPLACE FUNCTION update_vendor_application_status(
  p_application_id uuid,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Validate status
  IF p_status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE vendor_applications
  SET status = p_status
  WHERE id = p_application_id;
END;
$$;

GRANT EXECUTE ON FUNCTION update_vendor_application_status(uuid, text) TO authenticated;