create extension if not exists pgcrypto;

create type public.app_role as enum ('gov', 'operator', 'officer', 'labour', 'citizen');
create type public.violation_status as enum (
  'pending_review',
  'awaiting_mine_response',
  'response_submitted_awaiting_verification',
  'resolved'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'citizen',
  display_name text not null,
  agency text,
  mine_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mines (
  id text primary key,
  name text not null,
  region text not null default 'Unknown Region',
  state text not null,
  subsidiary text not null,
  basin text not null default 'Unknown Basin',
  status text not null default 'monitor' check (status in ('critical', 'monitor', 'compliant')),
  compliance_score numeric(5, 2) not null default 0 check (compliance_score between 0 and 100),
  operator text not null,
  last_inspection text,
  permit_exp text,
  active_reports integer not null default 0 check (active_reports >= 0),
  unauthorized_area_ha numeric(12, 2),
  coalfield text not null default 'Unknown Coalfield',
  production_capacity_mtpa numeric(12, 2) not null default 0,
  latitude numeric(9, 6) not null check (latitude between -90 and 90),
  longitude numeric(9, 6) not null check (longitude between -180 and 180),
  active_workforce integer not null default 0 check (active_workforce >= 0),
  workforce_split jsonb not null default '{"permanent": 0, "contractual": 0, "total": 0}'::jsonb,
  flags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mine_members (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  mine_id text not null references public.mines(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  primary key (profile_id, mine_id)
);

create table public.violations (
  id text primary key,
  mine_id text not null references public.mines(id) on update cascade,
  title text not null,
  details text not null default '',
  status public.violation_status not null default 'pending_review',
  notice_issued_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.operator_responses (
  id uuid primary key default gen_random_uuid(),
  violation_id text not null references public.violations(id) on delete cascade,
  submitted_by uuid references auth.users(id),
  details text not null check (length(trim(details)) > 0),
  created_at timestamptz not null default now()
);

create index violations_mine_id_idx on public.violations(mine_id);
create index violations_status_idx on public.violations(status);
create index operator_responses_violation_id_idx on public.operator_responses(violation_id);
create index mine_members_mine_id_idx on public.mine_members(mine_id);

create or replace function public.current_profile_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

alter table public.profiles enable row level security;
alter table public.mines enable row level security;
alter table public.mine_members enable row level security;
alter table public.violations enable row level security;
alter table public.operator_responses enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "Authenticated users can read mines"
  on public.mines for select to authenticated
  using (true);

create policy "Users can read their mine memberships"
  on public.mine_members for select to authenticated
  using (profile_id = auth.uid() or public.current_profile_role() = 'gov');

create policy "Regulators can manage mines"
  on public.mines for all to authenticated
  using (public.current_profile_role() = 'gov')
  with check (public.current_profile_role() = 'gov');

create policy "Authenticated users can read violations"
  on public.violations for select to authenticated
  using (true);

create policy "Regulators can issue notices"
  on public.violations for update to authenticated
  using (public.current_profile_role() = 'gov')
  with check (public.current_profile_role() = 'gov');

create policy "Operators can read responses for their mine"
  on public.operator_responses for select to authenticated
  using (
    submitted_by = auth.uid()
    or public.current_profile_role() in ('gov', 'operator', 'officer')
  );

create policy "Operators can submit responses"
  on public.operator_responses for insert to authenticated
  with check (
    submitted_by = auth.uid()
    and public.current_profile_role() in ('operator', 'officer')
  );

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger mines_updated_at before update on public.mines
for each row execute function public.set_updated_at();
create trigger violations_updated_at before update on public.violations
for each row execute function public.set_updated_at();

create or replace function public.create_mine(p_mine jsonb)
returns public.mines
language plpgsql
security definer
set search_path = public
as $$
declare
  created_mine public.mines;
begin
  if auth.uid() is null or public.current_profile_role() <> 'gov' then
    raise exception 'Only an authenticated government user can create a mine';
  end if;

  insert into public.mines (
    id, name, region, state, subsidiary, basin, status, compliance_score,
    operator, coalfield, production_capacity_mtpa, latitude, longitude,
    active_workforce, workforce_split, flags
  )
  values (
    nullif(trim(p_mine ->> 'id'), ''),
    nullif(trim(p_mine ->> 'name'), ''),
    coalesce(nullif(trim(p_mine ->> 'region'), ''), 'Unknown Region'),
    nullif(trim(p_mine ->> 'state'), ''),
    nullif(trim(p_mine ->> 'subsidiary'), ''),
    coalesce(nullif(trim(p_mine ->> 'basin'), ''), 'Unknown Basin'),
    coalesce(nullif(trim(p_mine ->> 'status'), ''), 'monitor'),
    coalesce((p_mine ->> 'compliance_score')::numeric, 0),
    nullif(trim(p_mine ->> 'operator'), ''),
    coalesce(nullif(trim(p_mine ->> 'coalfield'), ''), 'Unknown Coalfield'),
    coalesce((p_mine ->> 'production_capacity_mtpa')::numeric, 0),
    (p_mine ->> 'latitude')::numeric,
    (p_mine ->> 'longitude')::numeric,
    coalesce((p_mine ->> 'active_workforce')::integer, 0),
    coalesce(p_mine -> 'workforce_split', '{"permanent": 0, "contractual": 0, "total": 0}'::jsonb),
    coalesce(p_mine -> 'flags', '[]'::jsonb)
  )
  returning * into created_mine;

  return created_mine;
end;
$$;

revoke all on function public.create_mine(jsonb) from public;
grant execute on function public.create_mine(jsonb) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      nullif(split_part(coalesce(new.email, new.phone, ''), '@', 1), ''),
      'User'
    ),
    case new.raw_user_meta_data ->> 'role'
      when 'gov' then 'gov'::public.app_role
      when 'operator' then 'operator'::public.app_role
      when 'officer' then 'officer'::public.app_role
      when 'labour' then 'labour'::public.app_role
      else 'citizen'::public.app_role
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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
  if auth.uid() is null or public.current_profile_role() not in ('operator', 'officer') then
    raise exception 'Only an authenticated operator or officer can submit a response';
  end if;

  if length(trim(coalesce(p_details, ''))) = 0 then
    raise exception 'Response details cannot be empty';
  end if;

  insert into public.operator_responses (violation_id, submitted_by, details)
  values (p_violation_id, auth.uid(), trim(p_details));

  update public.violations
  set status = 'response_submitted_awaiting_verification'
  where id = p_violation_id
  returning * into updated_violation;

  if not found then
    raise exception 'Violation % was not found', p_violation_id;
  end if;

  return updated_violation;
end;
$$;

revoke all on function public.submit_operator_response(text, text) from public;
grant execute on function public.submit_operator_response(text, text) to authenticated;
