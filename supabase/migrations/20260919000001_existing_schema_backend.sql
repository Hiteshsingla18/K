-- Incremental migration for the existing CoalGuard schema.
-- This intentionally does not recreate profiles, mines, or violations.

alter table public.violations
  add column if not exists notice_issued_at timestamptz;

create table if not exists public.mine_members (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  mine_id text not null references public.mines(id) on delete cascade,
  role text not null check (role in ('gov', 'operator', 'officer', 'labour', 'citizen')),
  created_at timestamptz not null default now(),
  primary key (profile_id, mine_id)
);

create table if not exists public.operator_responses (
  id uuid primary key default gen_random_uuid(),
  violation_id text not null references public.violations(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id),
  details text not null check (length(trim(details)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists mine_members_mine_id_idx
  on public.mine_members(mine_id);
create index if not exists operator_responses_violation_id_idx
  on public.operator_responses(violation_id);

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.create_mine(p_mine jsonb)
returns public.mines
language plpgsql
security definer
set search_path = public
as $$
declare
  created_mine public.mines;
begin
  if auth.uid() is null or public.current_profile_role() <> 'GOVT' then
    raise exception 'Only an authenticated government user can create a mine';
  end if;

  insert into public.mines (
    id, name, code, subsidiary, state, latitude, longitude,
    type, compliance_score, status
  )
  values (
    nullif(trim(p_mine ->> 'id'), ''),
    nullif(trim(p_mine ->> 'name'), ''),
    coalesce(nullif(trim(p_mine ->> 'code'), ''), nullif(trim(p_mine ->> 'id'), '')),
    nullif(trim(p_mine ->> 'subsidiary'), ''),
    nullif(trim(p_mine ->> 'state'), ''),
    (p_mine ->> 'latitude')::double precision,
    (p_mine ->> 'longitude')::double precision,
    coalesce(nullif(trim(p_mine ->> 'type'), ''), 'OPENCAST'),
    coalesce((p_mine ->> 'compliance_score')::integer, 0),
    coalesce(nullif(trim(p_mine ->> 'status'), ''), 'MONITOR')
  )
  returning * into created_mine;

  return created_mine;
end;
$$;

create or replace function public.submit_operator_response(
  p_violation_id text,
  p_details text
)
returns public.violations
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_violation public.violations;
begin
  if auth.uid() is null or public.current_profile_role() not in ('OPERATOR', 'MINE_OFFICER') then
    raise exception 'Only an authenticated operator or officer can submit a response';
  end if;

  if length(trim(coalesce(p_details, ''))) = 0 then
    raise exception 'Response details cannot be empty';
  end if;

  insert into public.operator_responses (violation_id, submitted_by, details)
  values (p_violation_id, auth.uid(), trim(p_details));

  update public.violations
  set status = 'RESPONSE_SUBMITTED_AWAITING_VERIFICATION'
  where id = p_violation_id
  returning * into updated_violation;

  if not found then
    raise exception 'Violation % was not found', p_violation_id;
  end if;

  return updated_violation;
end;
$$;

revoke all on function public.create_mine(jsonb) from public;
grant execute on function public.create_mine(jsonb) to authenticated;
revoke all on function public.submit_operator_response(text, text) from public;
grant execute on function public.submit_operator_response(text, text) to authenticated;

alter table public.mine_members enable row level security;
alter table public.operator_responses enable row level security;

drop policy if exists "Users can read their mine memberships" on public.mine_members;
create policy "Users can read their mine memberships"
  on public.mine_members for select to authenticated
  using (profile_id = auth.uid() or public.current_profile_role() = 'gov');

drop policy if exists "Users can read response records" on public.operator_responses;
create policy "Users can read response records"
  on public.operator_responses for select to authenticated
  using (
    submitted_by = auth.uid()
    or public.current_profile_role() in ('GOVT', 'OPERATOR', 'MINE_OFFICER')
  );
