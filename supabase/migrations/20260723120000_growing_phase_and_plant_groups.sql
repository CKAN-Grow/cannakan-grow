-- IC-GC-002C: canonical Growing phase and Plant Group persistence.

create extension if not exists pgcrypto;

alter table public.grow_sessions
  add column if not exists post_germination_decision text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.grow_sessions'::regclass
      and conname = 'grow_sessions_post_germination_decision_check'
  ) then
    alter table public.grow_sessions
      add constraint grow_sessions_post_germination_decision_check
      check (post_germination_decision is null or post_germination_decision in ('pending', 'complete', 'grow'));
  end if;
end
$$;

create table if not exists public.grow_session_growing_phases (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.grow_sessions(id) on delete cascade,
  environment_type text not null,
  environment_other text not null default '',
  grow_method text not null,
  grow_method_other text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_growing_phases_environment_check
    check (environment_type in ('Indoor', 'Outdoor', 'Greenhouse', 'Protected Outdoor', 'Mixed', 'Other')),
  constraint grow_session_growing_phases_method_check
    check (grow_method in ('Soil', 'Living Soil', 'Coco', 'Hydro', 'DWC', 'RDWC', 'Rockwool', 'NFT', 'Aeroponic', 'Raised Bed', 'Container', 'Other'))
);

create table if not exists public.grow_session_plant_groups (
  id uuid primary key default gen_random_uuid(),
  growing_phase_id uuid not null references public.grow_session_growing_phases(id) on delete cascade,
  display_order integer not null default 0 check (display_order >= 0),
  plant_label text not null default '',
  source_id uuid references public.source_directory(id) on delete set null,
  source_name text not null default '',
  variety_id uuid references public.variety_directory(id) on delete set null,
  variety_name text not null default '',
  plant_type text,
  sex text,
  plant_count integer not null check (plant_count > 0),
  harvested boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_plant_groups_type_check
    check (plant_type is null or plant_type in ('Seed', 'Seedling', 'Clone', 'Cutting', 'Established Plant', 'Other')),
  constraint grow_session_plant_groups_sex_check
    check (sex is null or sex in ('Unknown', 'Feminized', 'Female', 'Male', 'Regular', 'Other'))
);

create index if not exists grow_session_plant_groups_phase_order_idx
  on public.grow_session_plant_groups(growing_phase_id, display_order, id);

create or replace function public.set_growing_evidence_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists grow_session_growing_phases_set_updated_at on public.grow_session_growing_phases;
create trigger grow_session_growing_phases_set_updated_at
  before update on public.grow_session_growing_phases
  for each row execute function public.set_growing_evidence_updated_at();

drop trigger if exists grow_session_plant_groups_set_updated_at on public.grow_session_plant_groups;
create trigger grow_session_plant_groups_set_updated_at
  before update on public.grow_session_plant_groups
  for each row execute function public.set_growing_evidence_updated_at();

alter table public.grow_session_growing_phases enable row level security;
alter table public.grow_session_plant_groups enable row level security;

drop policy if exists "Owners can read Growing phase evidence" on public.grow_session_growing_phases;
create policy "Owners can read Growing phase evidence"
  on public.grow_session_growing_phases for select to authenticated
  using (exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = session_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can insert Growing phase evidence" on public.grow_session_growing_phases;
create policy "Owners can insert Growing phase evidence"
  on public.grow_session_growing_phases for insert to authenticated
  with check (exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = session_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can update Growing phase evidence" on public.grow_session_growing_phases;
create policy "Owners can update Growing phase evidence"
  on public.grow_session_growing_phases for update to authenticated
  using (exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = session_id and session_row.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = session_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can delete Growing phase evidence" on public.grow_session_growing_phases;
create policy "Owners can delete Growing phase evidence"
  on public.grow_session_growing_phases for delete to authenticated
  using (exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = session_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can read Plant Group evidence" on public.grow_session_plant_groups;
create policy "Owners can read Plant Group evidence"
  on public.grow_session_plant_groups for select to authenticated
  using (exists (
    select 1 from public.grow_session_growing_phases phase
    join public.grow_sessions session_row on session_row.id = phase.session_id
    where phase.id = growing_phase_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can insert Plant Group evidence" on public.grow_session_plant_groups;
create policy "Owners can insert Plant Group evidence"
  on public.grow_session_plant_groups for insert to authenticated
  with check (exists (
    select 1 from public.grow_session_growing_phases phase
    join public.grow_sessions session_row on session_row.id = phase.session_id
    where phase.id = growing_phase_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can update Plant Group evidence" on public.grow_session_plant_groups;
create policy "Owners can update Plant Group evidence"
  on public.grow_session_plant_groups for update to authenticated
  using (exists (
    select 1 from public.grow_session_growing_phases phase
    join public.grow_sessions session_row on session_row.id = phase.session_id
    where phase.id = growing_phase_id and session_row.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.grow_session_growing_phases phase
    join public.grow_sessions session_row on session_row.id = phase.session_id
    where phase.id = growing_phase_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can delete Plant Group evidence" on public.grow_session_plant_groups;
create policy "Owners can delete Plant Group evidence"
  on public.grow_session_plant_groups for delete to authenticated
  using (exists (
    select 1 from public.grow_session_growing_phases phase
    join public.grow_sessions session_row on session_row.id = phase.session_id
    where phase.id = growing_phase_id and session_row.user_id = auth.uid()
  ));

revoke all on public.grow_session_growing_phases from anon;
revoke all on public.grow_session_plant_groups from anon;
grant select, insert, update, delete on public.grow_session_growing_phases to authenticated;
grant select, insert, update, delete on public.grow_session_plant_groups to authenticated;

comment on table public.grow_session_growing_phases is 'One canonical Growing phase evidence record per Grow Session.';
comment on table public.grow_session_plant_groups is 'Canonical Plant Group evidence owned by a Growing phase record.';
comment on column public.grow_sessions.post_germination_decision is 'Explicit post-Germination lifecycle decision; null preserves legacy compatibility.';

notify pgrst, 'reload schema';
