-- Staging and controlled import for the January 2021 Indian Coal Mines CSV.
-- Upload the transformed CSV into public.coal_mines_import before running
-- public.import_coal_mines().

create table if not exists public.coal_mines_import (
  source_row integer primary key,
  mine_name text not null,
  state text not null,
  district text,
  production_mt numeric,
  owner_code text,
  owner_name text,
  commodity text,
  ownership_code text,
  mine_type text,
  latitude double precision,
  longitude double precision,
  source_url text,
  coordinate_accuracy text,
  imported_at timestamptz not null default now()
);

alter table public.mines
  add column if not exists district text,
  add column if not exists owner_name text,
  add column if not exists production_mt_2019_2020 numeric,
  add column if not exists commodity text,
  add column if not exists ownership_code text,
  add column if not exists coordinate_accuracy text,
  add column if not exists source_url text,
  add column if not exists source_dataset text,
  add column if not exists source_row integer,
  add column if not exists imported_at timestamptz;

create or replace function public.import_coal_mines()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  imported_count integer;
begin
  if auth.uid() is null or public.current_profile_role() <> 'GOVT' then
    raise exception 'Only an authenticated government user can import mines';
  end if;

  if exists (
    select 1
    from public.coal_mines_import
    where latitude not between -90 and 90
       or longitude not between -180 and 180
       or latitude is null
       or longitude is null
       or trim(mine_name) = ''
  ) then
    raise exception 'Staging data contains invalid mine names or coordinates';
  end if;

  insert into public.mines (
    id, name, code, subsidiary, state, latitude, longitude, type,
    compliance_score, status, district, owner_name, production_mt_2019_2020,
    commodity, ownership_code, coordinate_accuracy, source_url,
    source_dataset, source_row, imported_at
  )
  select
    'KAGGLE-COAL-' || source_row::text,
    trim(mine_name),
    'KAGGLE-COAL-' || source_row::text,
    coalesce(nullif(trim(owner_code), ''), 'UNKNOWN'),
    case when lower(trim(state)) = 'orissa' then 'Odisha' else trim(state) end,
    latitude,
    longitude,
    case
      when upper(trim(mine_type)) = 'UG' then 'UNDERGROUND'
      when upper(trim(mine_type)) = 'MIXED' then 'MIXED'
      else 'OPENCAST'
    end,
    0,
    'MONITOR',
    nullif(trim(district), ''),
    nullif(trim(owner_name), ''),
    production_mt,
    nullif(trim(commodity), ''),
    nullif(trim(ownership_code), ''),
    nullif(trim(coordinate_accuracy), ''),
    nullif(trim(source_url), ''),
    'Kaggle Indian Coal Mines Dataset (January 2021)',
    source_row,
    now()
  from public.coal_mines_import
  on conflict (id) do update set
    name = excluded.name,
    code = excluded.code,
    subsidiary = excluded.subsidiary,
    state = excluded.state,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    type = excluded.type,
    district = excluded.district,
    owner_name = excluded.owner_name,
    production_mt_2019_2020 = excluded.production_mt_2019_2020,
    commodity = excluded.commodity,
    ownership_code = excluded.ownership_code,
    coordinate_accuracy = excluded.coordinate_accuracy,
    source_url = excluded.source_url,
    source_dataset = excluded.source_dataset,
    source_row = excluded.source_row,
    imported_at = excluded.imported_at;

  get diagnostics imported_count = row_count;
  return imported_count;
end;
$$;

revoke all on function public.import_coal_mines() from public;
grant execute on function public.import_coal_mines() to authenticated;

alter table public.coal_mines_import enable row level security;

drop policy if exists "Government can read mine import staging" on public.coal_mines_import;
create policy "Government can read mine import staging"
  on public.coal_mines_import for select to authenticated
  using (public.current_profile_role() = 'GOVT');
