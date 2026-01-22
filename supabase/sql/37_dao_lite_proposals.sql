-- =====================================================
-- AG2) DAO-LITE: proposals + votes (simple, safe)
-- =====================================================

create table if not exists public.dao_proposals (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  created_by uuid,
  title text not null,
  body text not null,
  status text not null default 'DRAFT', -- DRAFT / ACTIVE / ENDED
  start_at timestamptz,
  end_at timestamptz,
  choices jsonb not null default '["YES","NO","ABSTAIN"]'::jsonb
);

create index if not exists dao_proposals_status_idx
on public.dao_proposals (status);

create index if not exists dao_proposals_created_at_idx
on public.dao_proposals (created_at desc);

create table if not exists public.dao_votes (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  proposal_id bigint not null references public.dao_proposals(id) on delete cascade,
  user_id uuid not null,
  choice text not null,
  unique (proposal_id, user_id)
);

create index if not exists dao_votes_proposal_idx
on public.dao_votes (proposal_id);

-- RLS
alter table public.dao_proposals enable row level security;
alter table public.dao_votes enable row level security;

-- Public read proposals
drop policy if exists "dao_proposals_read_all" on public.dao_proposals;
create policy "dao_proposals_read_all"
on public.dao_proposals
for select
to anon, authenticated
using (true);

-- No direct writes to proposals from client
drop policy if exists "dao_proposals_no_write" on public.dao_proposals;
create policy "dao_proposals_no_write"
on public.dao_proposals
for all
to anon, authenticated
using (false)
with check (false);

-- Votes: user can read own votes, and read counts via RPC (not table)
drop policy if exists "dao_votes_read_own" on public.dao_votes;
create policy "dao_votes_read_own"
on public.dao_votes
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "dao_votes_no_direct_write" on public.dao_votes;
create policy "dao_votes_no_direct_write"
on public.dao_votes
for all
to authenticated
using (false)
with check (false);

-- RPC: create proposal (super_admin only)
create or replace function public.admin_create_proposal(
  p_title text,
  p_body text,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_choices jsonb default '["YES","NO","ABSTAIN"]'::jsonb
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  insert into public.dao_proposals(created_by, title, body, status, start_at, end_at, choices)
  values (auth.uid(), p_title, p_body, 'DRAFT', p_start_at, p_end_at, coalesce(p_choices, '["YES","NO","ABSTAIN"]'::jsonb))
  returning id into v_id;

  perform public.log_admin_action(
    'ADMIN_CREATE_PROPOSAL',
    auth.uid(),
    jsonb_build_object('proposal_id', v_id, 'title', p_title)
  );

  return v_id;
end;
$$;

grant execute on function public.admin_create_proposal(text, text, timestamptz, timestamptz, jsonb) to authenticated;

-- RPC: publish proposal (super_admin only)
create or replace function public.admin_publish_proposal(p_proposal_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  p record;
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  select * into p from public.dao_proposals where id = p_proposal_id;
  if not found then raise exception 'proposal not found'; end if;

  update public.dao_proposals
  set status = 'ACTIVE'
  where id = p_proposal_id;

  perform public.log_admin_action(
    'ADMIN_PUBLISH_PROPOSAL',
    auth.uid(),
    jsonb_build_object('proposal_id', p_proposal_id)
  );
end;
$$;

grant execute on function public.admin_publish_proposal(bigint) to authenticated;

-- RPC: cast vote (member only, 1 user 1 vote, must be within window)
create or replace function public.cast_vote(
  p_proposal_id bigint,
  p_choice text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  p record;
begin
  if auth.uid() is null then
    raise exception 'not authorized';
  end if;

  -- optional: only verified ACTIVE members can vote
  if not exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid() and pr.status = 'ACTIVE' and pr.verified = true
  ) then
    raise exception 'member not eligible';
  end if;

  select * into p from public.dao_proposals where id = p_proposal_id;
  if not found then raise exception 'proposal not found'; end if;

  if p.status <> 'ACTIVE' then raise exception 'voting not active'; end if;
  if p.start_at is not null and now() < p.start_at then raise exception 'voting not started'; end if;
  if p.end_at is not null and now() > p.end_at then raise exception 'voting ended'; end if;

  -- validate choice exists in choices array
  if not exists (
    select 1
    from jsonb_array_elements_text(p.choices) c
    where c = p_choice
  ) then
    raise exception 'invalid choice';
  end if;

  insert into public.dao_votes(proposal_id, user_id, choice)
  values (p_proposal_id, auth.uid(), p_choice)
  on conflict (proposal_id, user_id)
  do update set choice = excluded.choice;

  -- notify user (optional)
  perform public.push_notification(
    auth.uid(),
    'DAO_VOTE_CAST',
    'Vote submitted',
    'Your vote has been recorded.',
    jsonb_build_object('proposal_id', p_proposal_id, 'choice', p_choice)
  );
end;
$$;

grant execute on function public.cast_vote(bigint, text) to authenticated;

-- RPC: proposal results (public read) - aggregated counts
create or replace function public.get_proposal_results(p_proposal_id bigint)
returns table(choice text, votes bigint)
language sql
stable
security definer
set search_path = public
as $$
  select v.choice, count(*)::bigint as votes
  from public.dao_votes v
  where v.proposal_id = p_proposal_id
  group by v.choice
  order by votes desc, choice asc;
$$;

grant execute on function public.get_proposal_results(bigint) to anon, authenticated;
