-- Grow Profile Identity & Recognition v1.
-- User recognition is durable and separate from session-scoped Community Awards.

create extension if not exists pgcrypto;

create table if not exists public.recognition_definitions (
  id text primary key,
  title text not null,
  category text not null check (category in ('founding', 'participation', 'documentation', 'community', 'testing')),
  description text not null,
  unlock_description text not null,
  icon text not null default 'seal',
  rarity text not null default 'standard' check (rarity in ('standard', 'notable', 'rare', 'founding')),
  display_priority integer not null default 0,
  hidden boolean not null default false,
  manual_assignment boolean not null default false,
  repeatable boolean not null default false,
  featured_eligible boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_recognitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recognition_id text not null references public.recognition_definitions(id) on delete restrict,
  award_key text not null default 'once',
  earned_at timestamptz not null default timezone('utc', now()),
  assignment_source text not null default 'automatic' check (assignment_source in ('automatic', 'manual', 'reconciliation', 'community_award')),
  assigned_by uuid references auth.users(id) on delete set null,
  featured boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, recognition_id, award_key)
);

create unique index if not exists user_recognitions_one_featured_idx
  on public.user_recognitions (user_id)
  where featured and revoked_at is null;
create index if not exists user_recognitions_user_earned_idx
  on public.user_recognitions (user_id, earned_at desc)
  where revoked_at is null;

insert into public.recognition_definitions
  (id, title, category, description, unlock_description, icon, rarity, display_priority, hidden, manual_assignment)
values
  ('founding-grower', 'Founding Grower', 'founding', 'Helped launch Grow as part of the original founding community.', 'Reserved for manual assignment to the original founding community.', 'founding', 'founding', 1000, true, true),
  ('early-supporter', 'Early Supporter', 'founding', 'Joined Grow during the defined early-access period.', 'Join Grow during the early-access period ending July 13, 2026.', 'sprout', 'rare', 900, false, false),
  ('community-pioneer', 'Community Pioneer', 'community', 'Recognized among Grow’s earliest approved Community contributors.', 'Assigned to qualifying early Community Grow contributors.', 'community', 'rare', 880, true, true),
  ('product-tester', 'Product Tester', 'testing', 'Official participant in Grow product testing.', 'Assigned to official Grow testing participants.', 'testing', 'rare', 860, true, true),
  ('first-session', 'First Session', 'participation', 'Completed a first eligible Grow Session.', 'Complete your first eligible Grow Session.', 'session', 'standard', 500, false, false),
  ('session-builder', 'Session Builder', 'participation', 'Built a meaningful history of completed Grow Sessions.', 'Complete five eligible Grow Sessions.', 'session-stack', 'notable', 560, false, false),
  ('consistent-grower', 'Consistent Grower', 'participation', 'Established a consistent record across ten completed sessions.', 'Complete ten eligible Grow Sessions.', 'consistency', 'rare', 650, false, false),
  ('vault-builder', 'Vault Builder', 'participation', 'Built a Seed Vault containing at least ten varieties.', 'Add ten distinct varieties to My Seed Vault.', 'vault', 'notable', 580, false, false),
  ('collection-creator', 'Collection Creator', 'participation', 'Created a first Seed Vault Collection.', 'Create your first Seed Vault Collection.', 'collection', 'standard', 520, false, false),
  ('grow-planner', 'Grow Planner', 'participation', 'Used Seed Vault planning for a future Grow.', 'Mark a Seed Vault entry as planned for a future Grow.', 'planner', 'standard', 510, false, false),
  ('detailed-record', 'Detailed Record', 'documentation', 'Completed a Grow Session with notes and supporting images.', 'Complete an eligible session with notes and at least one image.', 'document', 'notable', 590, false, false),
  ('reliable-reporter', 'Reliable Reporter', 'documentation', 'Established a pattern of complete, well-documented Grow records.', 'Complete three eligible sessions with notes and supporting images.', 'reporter', 'rare', 670, false, false),
  ('source-tracker', 'Source Tracker', 'documentation', 'Consistently recorded breeder or source information in the Seed Vault.', 'Track source information across at least three active Vault entries.', 'source', 'notable', 570, false, false)
on conflict (id) do update set
  title = excluded.title, category = excluded.category, description = excluded.description,
  unlock_description = excluded.unlock_description, icon = excluded.icon, rarity = excluded.rarity,
  display_priority = excluded.display_priority, hidden = excluded.hidden,
  manual_assignment = excluded.manual_assignment, updated_at = timezone('utc', now());

alter table public.recognition_definitions enable row level security;
alter table public.user_recognitions enable row level security;

drop policy if exists "Authenticated users can read recognition catalog" on public.recognition_definitions;
create policy "Authenticated users can read recognition catalog"
  on public.recognition_definitions for select to authenticated using (
    active and (
      not hidden
      or public.current_user_is_admin()
    )
  );
drop policy if exists "Users can read their own recognitions" on public.user_recognitions;
create policy "Users can read their own recognitions"
  on public.user_recognitions for select to authenticated using (auth.uid() = user_id);

grant select on public.recognition_definitions to authenticated;
grant select on public.user_recognitions to authenticated;

create or replace function public.get_recognition_qualification_candidates_v1(p_user_id uuid)
returns table (recognition_id text, earned_at timestamptz, assignment_source text, evidence jsonb)
language sql stable security definer set search_path = public
as $$
  with session_rows as (
    select grow_sessions.*,
      nullif(trim(coalesce(grow_sessions.session_notes, '')), '') is not null
        and jsonb_typeof(coalesce(grow_sessions.session_images, '[]'::jsonb)) = 'array'
        and jsonb_array_length(coalesce(grow_sessions.session_images, '[]'::jsonb)) > 0 as documented
    from public.grow_sessions
    where grow_sessions.user_id = p_user_id
      and public.is_community_intelligence_session_eligible(grow_sessions.id)
  ), stats as (
    select
      (select count(*) from session_rows)::integer as completed_sessions,
      (select count(*) from session_rows where documented)::integer as documented_sessions,
      (select min(coalesce(completed_at, created_at)) from session_rows) as first_session_at,
      (select coalesce(completed_at, created_at) from session_rows order by coalesce(completed_at, created_at), id offset 4 limit 1) as fifth_session_at,
      (select coalesce(completed_at, created_at) from session_rows order by coalesce(completed_at, created_at), id offset 9 limit 1) as tenth_session_at,
      (select coalesce(completed_at, created_at) from session_rows where documented order by coalesce(completed_at, created_at), id limit 1) as first_documented_at,
      (select coalesce(completed_at, created_at) from session_rows where documented order by coalesce(completed_at, created_at), id offset 2 limit 1) as third_documented_at,
      (select count(distinct lower(trim(coalesce(seed_variety, seed_name, '')))) from public.seed_vault_entries
        where user_id = p_user_id and coalesce(is_mock, false) = false and coalesce(dev_mode_only, false) = false
          and coalesce(is_deleted, false) = false and coalesce(is_archived, false) = false
          and trim(coalesce(seed_variety, seed_name, '')) <> '')::integer as vault_varieties,
      (select count(*) from public.seed_vault_entries
        where user_id = p_user_id and coalesce(is_mock, false) = false and coalesce(dev_mode_only, false) = false
          and coalesce(is_deleted, false) = false and coalesce(is_archived, false) = false
          and trim(coalesce(source, '')) <> '')::integer as sourced_vault_entries,
      (select count(*) from public.seed_vault_collections where user_id = p_user_id)::integer as collections,
      (select count(*) from public.seed_vault_entries
        where user_id = p_user_id and coalesce(is_mock, false) = false and coalesce(dev_mode_only, false) = false
          and coalesce(is_deleted, false) = false and lower(coalesce(planning_status, 'inventory')) = 'planned')::integer as planned_entries,
      (select created_at from public.profiles where id = p_user_id) as joined_at
  )
  select
    candidates.recognition_id,
    candidates.earned_at,
    candidates.assignment_source,
    candidates.evidence
  from stats cross join lateral (
    values
      ('early-supporter', stats.joined_at, 'automatic', jsonb_build_object('joined_at', stats.joined_at), stats.joined_at <= '2026-07-13 23:59:59+00'::timestamptz),
      ('first-session', stats.first_session_at, 'automatic', jsonb_build_object('completed_sessions', stats.completed_sessions), stats.completed_sessions >= 1),
      ('session-builder', stats.fifth_session_at, 'automatic', jsonb_build_object('completed_sessions', stats.completed_sessions), stats.completed_sessions >= 5),
      ('consistent-grower', stats.tenth_session_at, 'automatic', jsonb_build_object('completed_sessions', stats.completed_sessions), stats.completed_sessions >= 10),
      ('vault-builder', timezone('utc', now()), 'automatic', jsonb_build_object('vault_varieties', stats.vault_varieties), stats.vault_varieties >= 10),
      ('collection-creator', timezone('utc', now()), 'automatic', jsonb_build_object('collections', stats.collections), stats.collections >= 1),
      ('grow-planner', timezone('utc', now()), 'automatic', jsonb_build_object('planned_entries', stats.planned_entries), stats.planned_entries >= 1),
      ('detailed-record', stats.first_documented_at, 'automatic', jsonb_build_object('documented_sessions', stats.documented_sessions), stats.documented_sessions >= 1),
      ('reliable-reporter', stats.third_documented_at, 'automatic', jsonb_build_object('documented_sessions', stats.documented_sessions), stats.documented_sessions >= 3),
      ('source-tracker', timezone('utc', now()), 'automatic', jsonb_build_object('sourced_vault_entries', stats.sourced_vault_entries), stats.sourced_vault_entries >= 3)
  ) candidates(recognition_id, earned_at, assignment_source, evidence, qualifies)
  where candidates.qualifies;
$$;

revoke all on function public.get_recognition_qualification_candidates_v1(uuid) from public, anon, authenticated;

create or replace function public.reconcile_user_recognitions_v1(
  p_user_id uuid,
  p_dry_run boolean default true,
  p_assignment_source text default 'reconciliation'
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare candidate_ids text[]; awarded_ids text[] := '{}'::text[];
begin
  if p_assignment_source not in ('automatic', 'reconciliation') then
    raise exception 'Unsupported recognition assignment source' using errcode = '22023';
  end if;
  select coalesce(array_agg(candidates.recognition_id order by candidates.recognition_id), '{}'::text[])
  into candidate_ids from public.get_recognition_qualification_candidates_v1(p_user_id) candidates;
  if not p_dry_run then
    with inserted as (
      insert into public.user_recognitions (user_id, recognition_id, earned_at, assignment_source, metadata)
      select p_user_id, candidates.recognition_id, coalesce(candidates.earned_at, timezone('utc', now())),
        p_assignment_source, candidates.evidence
      from public.get_recognition_qualification_candidates_v1(p_user_id) candidates
      on conflict (user_id, recognition_id, award_key) do nothing
      returning recognition_id
    ) select coalesce(array_agg(recognition_id order by recognition_id), '{}'::text[]) into awarded_ids from inserted;
  end if;
  return jsonb_build_object('user_id', p_user_id, 'dry_run', p_dry_run,
    'qualified', to_jsonb(candidate_ids), 'awarded', to_jsonb(awarded_ids));
end;
$$;

revoke all on function public.reconcile_user_recognitions_v1(uuid, boolean, text) from public, anon, authenticated;

create or replace function public.reconcile_my_recognitions(p_dry_run boolean default false)
returns jsonb language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  return public.reconcile_user_recognitions_v1(auth.uid(), p_dry_run, 'reconciliation');
end;
$$;
revoke all on function public.reconcile_my_recognitions(boolean) from public, anon;
grant execute on function public.reconcile_my_recognitions(boolean) to authenticated;

create or replace function public.get_identity_and_recognition_v1(
  p_user_id uuid,
  p_include_locked boolean default false,
  p_include_hidden boolean default false
)
returns jsonb language plpgsql stable security definer set search_path = public
as $$
declare identity_label text := 'Grower'; profile_row jsonb; rows jsonb; featured_id text;
begin
  select to_jsonb(profiles) into profile_row from public.profiles where id = p_user_id;
  if exists (select 1 from public.admin_users where user_id = p_user_id) then identity_label := 'Administrator';
  elsif exists (select 1 from public.user_recognitions where user_id = p_user_id and recognition_id = 'product-tester' and revoked_at is null) then identity_label := 'Product Tester';
  elsif lower(coalesce(profile_row ->> 'profile_type', profile_row ->> 'account_type', '')) = 'source' then identity_label := 'Source';
  elsif lower(coalesce(profile_row ->> 'profile_type', profile_row ->> 'account_type', '')) = 'breeder' then identity_label := 'Breeder';
  elsif exists (select 1 from public.grow_gallery_snapshots where user_id = p_user_id and lower(coalesce(status, '')) = 'approved' and coalesce(is_published, false) and coalesce(analytics_excluded, false) = false and coalesce(is_mock, false) = false) then identity_label := 'Community Contributor';
  end if;

  select user_recognitions.recognition_id into featured_id
  from public.user_recognitions join public.recognition_definitions on recognition_definitions.id = user_recognitions.recognition_id
  where user_recognitions.user_id = p_user_id and user_recognitions.revoked_at is null
  order by user_recognitions.featured desc, recognition_definitions.display_priority desc, user_recognitions.earned_at desc limit 1;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', definitions.id, 'title', definitions.title, 'category', definitions.category,
    'description', definitions.description, 'unlock_description', definitions.unlock_description,
    'icon', definitions.icon, 'rarity', definitions.rarity, 'display_priority', definitions.display_priority,
    'hidden', definitions.hidden, 'manual_assignment', definitions.manual_assignment,
    'featured_eligible', definitions.featured_eligible, 'earned', records.id is not null,
    'earned_at', records.earned_at, 'assignment_source', records.assignment_source,
    'featured', coalesce(records.featured, false)
  ) order by (records.id is not null) desc, definitions.display_priority desc, records.earned_at desc nulls last), '[]'::jsonb)
  into rows
  from public.recognition_definitions definitions
  left join public.user_recognitions records on records.recognition_id = definitions.id
    and records.user_id = p_user_id and records.revoked_at is null
  where definitions.active
    and (records.id is not null or (p_include_locked and (not definitions.hidden or p_include_hidden)));

  return jsonb_build_object('version', 'recognition.v1', 'user_id', p_user_id,
    'identity', jsonb_build_object('label', identity_label), 'featured_recognition_id', featured_id,
    'recognitions', rows, 'generated_at', timezone('utc', now()));
end;
$$;
revoke all on function public.get_identity_and_recognition_v1(uuid, boolean, boolean) from public, anon, authenticated;

create or replace function public.get_my_identity_and_recognition()
returns jsonb language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  perform public.reconcile_user_recognitions_v1(auth.uid(), false, 'reconciliation');
  return public.get_identity_and_recognition_v1(auth.uid(), true, false);
end;
$$;
revoke all on function public.get_my_identity_and_recognition() from public, anon;
grant execute on function public.get_my_identity_and_recognition() to authenticated;

create or replace function public.get_public_identity_and_recognition(p_user_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public
as $$
declare profile_row jsonb; caller_is_admin boolean := false; profile_is_public boolean := true;
begin
  select to_jsonb(profiles) into profile_row from public.profiles where id = p_user_id;
  if profile_row is null then return null; end if;
  profile_is_public := coalesce(
    nullif(profile_row ->> 'show_profile_in_community_grow', '')::boolean,
    nullif(profile_row ->> 'is_public', '')::boolean,
    true
  );
  select public.current_user_is_admin() into caller_is_admin;
  if not profile_is_public and not caller_is_admin then return null; end if;
  return public.get_identity_and_recognition_v1(p_user_id, caller_is_admin, caller_is_admin);
end;
$$;
revoke all on function public.get_public_identity_and_recognition(uuid) from public;
grant execute on function public.get_public_identity_and_recognition(uuid) to anon, authenticated;

create or replace function public.set_my_featured_recognition(p_recognition_id text)
returns jsonb language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if not exists (select 1 from public.user_recognitions records join public.recognition_definitions definitions on definitions.id = records.recognition_id
    where records.user_id = auth.uid() and records.recognition_id = p_recognition_id and records.revoked_at is null and definitions.featured_eligible)
    then raise exception 'Recognition is not earned or cannot be featured' using errcode = '22023'; end if;
  update public.user_recognitions set featured = false, updated_at = timezone('utc', now()) where user_id = auth.uid() and featured;
  update public.user_recognitions set featured = true, updated_at = timezone('utc', now())
    where user_id = auth.uid() and recognition_id = p_recognition_id and revoked_at is null;
  return public.get_identity_and_recognition_v1(auth.uid(), true, false);
end;
$$;
revoke all on function public.set_my_featured_recognition(text) from public, anon;
grant execute on function public.set_my_featured_recognition(text) to authenticated;

create or replace function public.admin_manage_user_recognition(p_user_id uuid, p_recognition_id text, p_action text)
returns jsonb language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null or not public.current_user_is_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if not exists (select 1 from public.recognition_definitions where id = p_recognition_id and manual_assignment) then
    raise exception 'Recognition is not manually assignable' using errcode = '22023';
  end if;
  if lower(p_action) = 'assign' then
    insert into public.user_recognitions (user_id, recognition_id, assignment_source, assigned_by)
    values (p_user_id, p_recognition_id, 'manual', auth.uid())
    on conflict (user_id, recognition_id, award_key) do update set
      assignment_source = 'manual', assigned_by = auth.uid(), earned_at = timezone('utc', now()),
      revoked_at = null, revoked_by = null, updated_at = timezone('utc', now());
  elsif lower(p_action) = 'remove' then
    update public.user_recognitions set revoked_at = timezone('utc', now()), revoked_by = auth.uid(), featured = false,
      updated_at = timezone('utc', now()) where user_id = p_user_id and recognition_id = p_recognition_id and revoked_at is null;
  else raise exception 'Action must be assign or remove' using errcode = '22023';
  end if;
  return public.get_identity_and_recognition_v1(p_user_id, true, true);
end;
$$;
revoke all on function public.admin_manage_user_recognition(uuid, text, text) from public, anon;
grant execute on function public.admin_manage_user_recognition(uuid, text, text) to authenticated;

-- Reconcile durable recognition after qualifying owner activity. The reconciliation
-- function is idempotent, so repeated updates cannot duplicate awards.
create or replace function public.reconcile_recognition_after_owner_activity_v1()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  perform public.reconcile_user_recognitions_v1(new.user_id, false, 'automatic');
  return new;
end;
$$;
revoke all on function public.reconcile_recognition_after_owner_activity_v1() from public, anon, authenticated;

drop trigger if exists grow_sessions_reconcile_recognition_v1 on public.grow_sessions;
create trigger grow_sessions_reconcile_recognition_v1
  after insert or update of session_status, completed_at, session_notes, session_images on public.grow_sessions
  for each row execute function public.reconcile_recognition_after_owner_activity_v1();

drop trigger if exists seed_vault_entries_reconcile_recognition_v1 on public.seed_vault_entries;
create trigger seed_vault_entries_reconcile_recognition_v1
  after insert or update of seed_variety, seed_name, source, planning_status, is_deleted, is_archived, is_mock, dev_mode_only
  on public.seed_vault_entries for each row execute function public.reconcile_recognition_after_owner_activity_v1();

drop trigger if exists seed_vault_collections_reconcile_recognition_v1 on public.seed_vault_collections;
create trigger seed_vault_collections_reconcile_recognition_v1
  after insert on public.seed_vault_collections
  for each row execute function public.reconcile_recognition_after_owner_activity_v1();

comment on table public.user_recognitions is 'Durable user-level Recognition records. Community Awards remain session-scoped on Community Grow reports.';
notify pgrst, 'reload schema';
