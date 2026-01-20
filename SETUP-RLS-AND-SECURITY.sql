-- 1) Aktifkan RLS
alter table public.profiles enable row level security;

-- 2) Policy: user bisa baca profile sendiri
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = auth.uid());

-- 3) Policy: user boleh update profile sendiri
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- 4) Trigger: cegah user ubah field sensitif
create or replace function public.profiles_prevent_sensitive_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- kalau bukan admin, kunci field sensitif
  -- (asumsi admin ditandai di role='ADMIN' atau 'SUPER_ADMIN' di row profile mereka sendiri)
  if exists (
    select 1 from public.profiles me
    where me.id = auth.uid()
      and upper(me.role) in ('ADMIN','SUPER_ADMIN')
  ) then
    return new;
  end if;

  -- kunci field yang tidak boleh disentuh member
  new.role := old.role;
  new.status := old.status;
  new.is_verified := old.is_verified;
  new.can_invite := old.can_invite;
  new.referred_by := old.referred_by;
  new.referral_count := old.referral_count;
  new.referral_code := old.referral_code;

  -- auto timestamps
  new.updated_at := now();

  return new;
end;
$$;

drop trigger if exists trg_profiles_prevent_sensitive_update on public.profiles;
create trigger trg_profiles_prevent_sensitive_update
before update on public.profiles
for each row execute function public.profiles_prevent_sensitive_update();
