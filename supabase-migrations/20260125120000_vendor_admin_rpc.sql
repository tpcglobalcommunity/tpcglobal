-- create admin RPC to approve/reject vendor applications atomically
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
