create extension if not exists "pgcrypto";

-- 1) marketplace_items
create table if not exists public.marketplace_items (
  id uuid primary key default gen_random_uuid(),
  vendor_application_id uuid not null unique references public.vendor_applications(id) on delete cascade,
  vendor_user_id uuid not null references auth.users(id) on delete cascade,

  title text not null,
  category text not null,
  description text,
  website text,
  contact_email text,

  status text not null default 'published' check (status in ('draft','published','archived')),
  published boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_marketplace_items_published on public.marketplace_items(published);
create index if not exists idx_marketplace_items_vendor_user on public.marketplace_items(vendor_user_id);
create index if not exists idx_marketplace_items_category on public.marketplace_items(category);

-- 2) updated_at trigger (reuse existing public.set_updated_at)
drop trigger if exists trg_marketplace_items_updated_at on public.marketplace_items;
create trigger trg_marketplace_items_updated_at
before update on public.marketplace_items
for each row execute function public.set_updated_at();

-- 3) RLS
alter table public.marketplace_items enable row level security;

-- SELECT policies
drop policy if exists "marketplace_select_public_published" on public.marketplace_items;
create policy "marketplace_select_public_published"
on public.marketplace_items
for select
to anon
using (published = true);

drop policy if exists "marketplace_select_auth_published" on public.marketplace_items;
create policy "marketplace_select_auth_published"
on public.marketplace_items
for select
to authenticated
using (published = true);

drop policy if exists "marketplace_select_owner" on public.marketplace_items;
create policy "marketplace_select_owner"
on public.marketplace_items
for select
to authenticated
using (vendor_user_id = auth.uid());

drop policy if exists "marketplace_select_admin" on public.marketplace_items;
create policy "marketplace_select_admin"
on public.marketplace_items
for select
to authenticated
using (public.is_admin());

-- WRITE policies (admin only)
drop policy if exists "marketplace_write_admin" on public.marketplace_items;
create policy "marketplace_write_admin"
on public.marketplace_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 4) Replace RPC: admin_set_vendor_application_status (ADD UPSERT marketplace)
create or replace function public.admin_set_vendor_application_status(
  application_id uuid,
  new_status text,
  admin_note text default null
)
returns public.vendor_applications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.vendor_applications;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  if new_status not in ('approved','rejected') then
    raise exception 'invalid_status';
  end if;

  update public.vendor_applications
  set
    status = new_status,
    admin_note = admin_note,
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    updated_at = now()
  where id = application_id
  returning * into v_row;

  if not found then
    raise exception 'not_found';
  end if;

  -- Marketplace autopublish / unpublish (atomic)
  if new_status = 'approved' then
    insert into public.marketplace_items (
      vendor_application_id,
      vendor_user_id,
      title,
      category,
      description,
      website,
      contact_email,
      status,
      published
    ) values (
      v_row.id,
      v_row.user_id,
      coalesce(v_row.brand_name, 'Vendor'),
      coalesce(v_row.category, 'other'),
      v_row.description,
      v_row.website,
      v_row.contact_email,
      'published',
      true
    )
    on conflict (vendor_application_id) do update set
      vendor_user_id = excluded.vendor_user_id,
      title = excluded.title,
      category = excluded.category,
      description = excluded.description,
      website = excluded.website,
      contact_email = excluded.contact_email,
      status = 'published',
      published = true,
      updated_at = now();
  else
    update public.marketplace_items
    set
      status = 'archived',
      published = false,
      updated_at = now()
    where vendor_application_id = v_row.id;
  end if;

  insert into public.vendor_application_events(application_id, actor_id, action, meta)
  values (
    application_id,
    auth.uid(),
    new_status,
    jsonb_build_object('note', admin_note)
  );

  return v_row;
end;
$$;

revoke all on function public.admin_set_vendor_application_status(uuid, text, text) from public;
grant execute on function public.admin_set_vendor_application_status(uuid, text, text) to authenticated;

notify pgrst, 'reload schema';
