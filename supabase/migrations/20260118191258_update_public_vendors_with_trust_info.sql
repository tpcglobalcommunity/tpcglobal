/*
  # Update Public Vendors RPC with Trust Badge Info

  1. Updates
    - Update `get_public_vendors()` to include role and is_verified
    - Add trust badge information for marketplace display

  2. Security
    - Still SECURITY DEFINER and public-safe
    - No sensitive data exposed
    - Only approved vendors returned

  3. Important Notes
    - Enables trust badges on marketplace cards
    - Consistent with trust badge system
    - Server-enforced trust information
*/

-- Drop and recreate get_public_vendors with trust info
DROP FUNCTION IF EXISTS get_public_vendors(text);

CREATE OR REPLACE FUNCTION get_public_vendors(p_category text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  brand_name text,
  description_en text,
  description_id text,
  category text,
  website_url text,
  contact_telegram text,
  created_at timestamptz,
  role text,
  is_verified boolean
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
    va.created_at,
    p.role,
    p.is_verified
  FROM vendor_applications va
  JOIN profiles p ON p.id = va.user_id
  WHERE va.status = 'approved'
    AND (p_category IS NULL OR va.category = p_category)
  ORDER BY va.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_public_vendors(text) TO anon, authenticated;