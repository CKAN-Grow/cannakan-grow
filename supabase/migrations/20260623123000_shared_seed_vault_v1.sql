-- Shared Seed Vault V1.
-- Adds per-user vault sharing settings and a public-safe RPC that never exposes
-- raw seed_vault_entries rows or owner-private profile data.

create table if not exists public.seed_vault_share_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  visibility text not null default 'private',
  public_slug text unique,
  show_quantity boolean not null default false,
  show_storage_location boolean not null default false,
  show_storage_notes boolean not null default false,
  show_private_notes boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint seed_vault_share_settings_visibility_check
    check (visibility in ('private', 'public', 'link')),
  constraint seed_vault_share_settings_public_slug_check
    check (public_slug is null or public_slug ~ '^[a-z0-9][a-z0-9-]{2,63}$')
);

create unique index if not exists seed_vault_share_settings_public_slug_lower_idx
  on public.seed_vault_share_settings (lower(public_slug))
  where public_slug is not null;

create index if not exists seed_vault_share_settings_visibility_idx
  on public.seed_vault_share_settings (visibility, public_slug)
  where public_slug is not null;

create or replace function public.set_seed_vault_share_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists seed_vault_share_settings_set_updated_at on public.seed_vault_share_settings;
create trigger seed_vault_share_settings_set_updated_at
before update on public.seed_vault_share_settings
for each row
execute function public.set_seed_vault_share_settings_updated_at();

alter table public.seed_vault_share_settings enable row level security;

drop policy if exists "Vault share settings owners can read" on public.seed_vault_share_settings;
create policy "Vault share settings owners can read"
on public.seed_vault_share_settings
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Vault share settings owners can insert" on public.seed_vault_share_settings;
create policy "Vault share settings owners can insert"
on public.seed_vault_share_settings
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Vault share settings owners can update" on public.seed_vault_share_settings;
create policy "Vault share settings owners can update"
on public.seed_vault_share_settings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

revoke all on table public.seed_vault_share_settings from public;
grant select, insert, update on table public.seed_vault_share_settings to authenticated;

create or replace function public.normalize_seed_vault_share_slug(raw_slug text)
returns text
language sql
immutable
as $$
  select nullif(
    regexp_replace(
      regexp_replace(lower(btrim(coalesce(raw_slug, ''))), '[^a-z0-9]+', '-', 'g'),
      '(^-+|-+$)',
      '',
      'g'
    ),
    ''
  )
$$;

create or replace function public.generate_seed_vault_share_slug()
returns text
language sql
volatile
as $$
  select 'vault-' || lower(left(replace(gen_random_uuid()::text, '-', ''), 12))
$$;

create or replace function public.get_or_create_seed_vault_share_settings()
returns public.seed_vault_share_settings
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  requester uuid := auth.uid();
  settings_row public.seed_vault_share_settings;
begin
  if requester is null then
    raise exception 'Authentication required';
  end if;

  insert into public.seed_vault_share_settings (user_id)
  values (requester)
  on conflict (user_id) do nothing;

  select *
  into settings_row
  from public.seed_vault_share_settings
  where user_id = requester;

  return settings_row;
end;
$$;

grant execute on function public.get_or_create_seed_vault_share_settings() to authenticated;

create or replace function public.update_seed_vault_share_settings(
  next_visibility text,
  next_public_slug text default null,
  next_show_quantity boolean default false,
  next_show_storage_location boolean default false,
  next_show_storage_notes boolean default false,
  next_show_private_notes boolean default false
)
returns public.seed_vault_share_settings
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  requester uuid := auth.uid();
  cleaned_visibility text := lower(btrim(coalesce(next_visibility, 'private')));
  cleaned_slug text := public.normalize_seed_vault_share_slug(next_public_slug);
  settings_row public.seed_vault_share_settings;
begin
  if requester is null then
    raise exception 'Authentication required';
  end if;

  if cleaned_visibility not in ('private', 'public', 'link') then
    cleaned_visibility := 'private';
  end if;

  select *
  into settings_row
  from public.seed_vault_share_settings
  where user_id = requester;

  if cleaned_slug is null then
    cleaned_slug := settings_row.public_slug;
  end if;

  if cleaned_visibility in ('public', 'link') and cleaned_slug is null then
    cleaned_slug := public.generate_seed_vault_share_slug();
  end if;

  insert into public.seed_vault_share_settings (
    user_id,
    visibility,
    public_slug,
    show_quantity,
    show_storage_location,
    show_storage_notes,
    show_private_notes
  )
  values (
    requester,
    cleaned_visibility,
    cleaned_slug,
    coalesce(next_show_quantity, false),
    coalesce(next_show_storage_location, false),
    coalesce(next_show_storage_notes, false),
    coalesce(next_show_private_notes, false)
  )
  on conflict (user_id) do update
    set visibility = excluded.visibility,
        public_slug = excluded.public_slug,
        show_quantity = excluded.show_quantity,
        show_storage_location = excluded.show_storage_location,
        show_storage_notes = excluded.show_storage_notes,
        show_private_notes = excluded.show_private_notes,
        updated_at = timezone('utc', now())
  returning *
  into settings_row;

  return settings_row;
end;
$$;

grant execute on function public.update_seed_vault_share_settings(text, text, boolean, boolean, boolean, boolean) to authenticated;

create or replace function public.get_shared_seed_vault(vault_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cleaned_slug text := public.normalize_seed_vault_share_slug(vault_slug);
  settings_row public.seed_vault_share_settings;
  owner_name text := 'CannaKAN Grower';
  entries_payload jsonb := '[]'::jsonb;
  entry_count integer := 0;
begin
  if cleaned_slug is null then
    return jsonb_build_object('found', false, 'entries', '[]'::jsonb);
  end if;

  select *
  into settings_row
  from public.seed_vault_share_settings
  where public_slug = cleaned_slug
    and visibility in ('public', 'link')
  limit 1;

  if settings_row.user_id is null then
    return jsonb_build_object('found', false, 'entries', '[]'::jsonb);
  end if;

  select coalesce((
    select nullif(btrim(public_member_profiles.display_name), '')
    from public.public_member_profiles
    inner join public.profiles
      on profiles.id = public_member_profiles.user_id
    where public_member_profiles.user_id = settings_row.user_id
      and coalesce(profiles.account_status, 'active') = 'active'
      and coalesce(profiles.deletion_status, '') <> 'deleted'
    limit 1
  ), 'CannaKAN Grower')
  into owner_name;

  with visible_entries as (
    select
      coalesce(nullif(btrim(source), ''), 'Unknown Source') as source,
      coalesce(nullif(btrim(seed_variety), ''), nullif(btrim(seed_name), ''), 'Unknown Variety') as variety,
      nullif(btrim(seed_type), '') as seed_type,
      coalesce(nullif(btrim(seed_sex), ''), nullif(btrim(sex), '')) as seed_sex,
      nullif(year_acquired, 0) as year_acquired,
      seed_age_years,
      coalesce(remaining_count, quantity, seed_count) as quantity_remaining,
      nullif(btrim(storage_location), '') as storage_location,
      nullif(btrim(storage_notes), '') as storage_notes,
      nullif(btrim(notes), '') as notes,
      created_at
    from public.seed_vault_entries
    where user_id = settings_row.user_id
      and coalesce(is_archived, false) = false
      and coalesce(is_deleted, false) = false
      and coalesce(is_mock, false) = false
      and coalesce(dev_mode_only, false) = false
  )
  select
    coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
      'source', source,
      'variety', variety,
      'seed_type', seed_type,
      'seed_sex', seed_sex,
      'year_acquired', year_acquired,
      'seed_age_years', seed_age_years,
      'quantity_remaining', case when settings_row.show_quantity then quantity_remaining else null end,
      'storage_location', case when settings_row.show_storage_location then storage_location else null end,
      'storage_notes', case when settings_row.show_storage_notes then storage_notes else null end,
      'notes', case when settings_row.show_private_notes then notes else null end
    )) order by lower(source), lower(variety), created_at desc), '[]'::jsonb),
    count(*)::integer
  into entries_payload, entry_count
  from visible_entries;

  return jsonb_build_object(
    'found', true,
    'visibility', settings_row.visibility,
    'owner_display_name', owner_name,
    'total_visible_entries', entry_count,
    'settings', jsonb_build_object(
      'show_quantity', settings_row.show_quantity,
      'show_storage_location', settings_row.show_storage_location,
      'show_storage_notes', settings_row.show_storage_notes,
      'show_private_notes', settings_row.show_private_notes
    ),
    'entries', entries_payload
  );
end;
$$;

grant execute on function public.get_shared_seed_vault(text) to anon, authenticated;

comment on table public.seed_vault_share_settings is
  'Per-user Seed Vault sharing preferences. Raw Seed Vault entries remain owner-only; public access uses get_shared_seed_vault().';

comment on function public.get_shared_seed_vault(text) is
  'Returns a public-safe, read-only Seed Vault payload for public/link shares without exposing owner ids, emails, raw entry ids, or private profile fields.';

notify pgrst, 'reload schema';
