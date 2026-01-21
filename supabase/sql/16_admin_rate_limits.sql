-- =====================================================
-- ADMIN ACTION RATE LIMITING SYSTEM
-- =====================================================

-- Rate limiting table for admin actions
create table if not exists public.admin_action_rate_limits (
  actor_id uuid not null,
  action text not null,
  window_start timestamptz not null,
  count int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (actor_id, action, window_start)
);

-- Index for cleanup queries
create index if not exists admin_action_rate_limits_updated_idx
  on public.admin_action_rate_limits (updated_at desc);

-- Enable RLS
alter table public.admin_action_rate_limits enable row level security;

-- Nobody accesses directly from client
drop policy if exists "admin_action_rate_limits_no_access" on public.admin_action_rate_limits;
create policy "admin_action_rate_limits_no_access"
on public.admin_action_rate_limits
for all
to anon, authenticated
using (false)
with check (false);

-- =====================================================
-- RATE LIMITING HELPER FUNCTION
-- =====================================================

-- Enforce rate limit per action per time window
create or replace function public.enforce_admin_rate_limit(
  p_action text,
  p_limit int,
  p_window_seconds int
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_count int;
begin
  -- Check if user is authenticated
  if v_actor is null then
    raise exception 'not authorized';
  end if;

  -- Only apply to admin-level users (viewer and above)
  if not public.is_viewer_level(v_actor) then
    raise exception 'not authorized';
  end if;

  -- Compute fixed window bucket (e.g., 60-second windows)
  v_window_start :=
    to_timestamp(floor(extract(epoch from v_now) / greatest(1, p_window_seconds)) * greatest(1, p_window_seconds));

  -- Insert or update rate limit counter
  insert into public.admin_action_rate_limits(actor_id, action, window_start, count, updated_at)
  values (v_actor, p_action, v_window_start, 1, v_now)
  on conflict (actor_id, action, window_start)
  do update set
    count = public.admin_action_rate_limits.count + 1,
    updated_at = excluded.updated_at
  returning count into v_count;

  -- Check if limit exceeded
  if v_count > p_limit then
    raise exception 'rate limit exceeded for % (limit % per %s)', p_action, p_limit, p_window_seconds
      using errcode = '42900';
  end if;
end;
$$;

grant execute on function public.enforce_admin_rate_limit(text, int, int) to authenticated;

-- =====================================================
-- RATE LIMIT CHECKING FUNCTION (NON-ENFORCING)
-- =====================================================

-- Check current rate limit status without enforcing
create or replace function public.check_admin_rate_limit(
  p_action text,
  p_window_seconds int default 60
) returns table (
  current_count int,
  limit_exceeded boolean,
  window_start timestamptz,
  window_end timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select 
    coalesce(l.count, 0) as current_count,
    coalesce(l.count, 0) > 10 as limit_exceeded, -- Default limit of 10 per window
    l.window_start,
    l.window_start + (p_window_seconds || ' seconds')::interval as window_end
  from public.admin_action_rate_limits l
  where l.actor_id = auth.uid()
    and l.action = p_action
    and l.window_start = to_timestamp(floor(extract(epoch from now()) / greatest(1, p_window_seconds)) * greatest(1, p_window_seconds))
  limit 1;
$$;

grant execute on function public.check_admin_rate_limit(text, int) to authenticated;

-- =====================================================
-- CLEANUP FUNCTION FOR OLD RATE LIMIT RECORDS
-- =====================================================

-- Clean up old rate limit records (keep last 24 hours)
create or replace function public.cleanup_admin_rate_limits()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted int;
begin
  delete from public.admin_action_rate_limits
  where updated_at < now() - interval '24 hours';
  
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

grant execute on function public.cleanup_admin_rate_limits() to authenticated;
