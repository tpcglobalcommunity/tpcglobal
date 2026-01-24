-- Unified RPC for public marketplace vendors
-- Works with either schema: public.vendors OR public.vendor_applications

create or replace function public.get_public_vendors(p_category text default null)
returns table (
  id uuid,
  name text,
  category text,
  description text,
  website text,
  contact text,
  logo_url text,
  is_verified boolean,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- Prefer newer/cleaner table if exists
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'vendors'
  ) then
    return query
    select
      v.id,
      v.name,
      v.category,
      v.description,
      v.website,
      v.contact,
      v.logo_url,
      coalesce(v.is_verified, false) as is_verified,
      v.created_at
    from public.vendors v
    where coalesce(v.status, 'pending') = 'approved'
      and (p_category is null or p_category = '' or v.category = p_category)
    order by v.created_at desc;

  elsif exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'vendor_applications'
  ) then
    -- Fallback to vendor_applications schema
    -- Adjusted with defensive COALESCE for common column patterns
    return query
    select
      va.id,
      coalesce(va.vendor_name, va.name, 'Vendor')::text as name,
      coalesce(va.category, va.vendor_category, '')::text as category,
      coalesce(va.description, va.vendor_description, '')::text as description,
      coalesce(va.website, va.vendor_website, '')::text as website,
      coalesce(va.contact, va.vendor_contact, va.email, '')::text as contact,
      coalesce(va.logo_url, va.vendor_logo_url, '')::text as logo_url,
      coalesce(va.is_verified, false) as is_verified,
      coalesce(va.created_at, now()) as created_at
    from public.vendor_applications va
    where
      -- support multiple approval flags
      (
        coalesce(va.status, '') = 'approved'
        or coalesce(va.approval_status, '') = 'approved'
        or coalesce(va.is_approved, false) = true
        or coalesce(va.approved, false) = true
      )
      and (
        p_category is null or p_category = '' or
        coalesce(va.category, va.vendor_category, '') = p_category
      )
    order by coalesce(va.created_at, now()) desc;

  else
    -- No vendor tables found → return empty set but keep RPC alive (no 404)
    return query
    select
      null::uuid,
      ''::text,
      ''::text,
      ''::text,
      ''::text,
      ''::text,
      ''::text,
      false::boolean,
      now()::timestamptz
    where false;
  end if;
end;
$$;

revoke all on function public.get_public_vendors(text) from public;
grant execute on function public.get_public_vendors(text) to anon, authenticated;
