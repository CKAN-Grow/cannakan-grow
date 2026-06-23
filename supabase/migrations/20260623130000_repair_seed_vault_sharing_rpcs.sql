-- Repair Shared Seed Vault RPC availability and PostgREST schema-cache matching.
-- Public/share-by-link behavior is unchanged; this only refreshes exact RPC
-- signatures used by the frontend.

drop function if exists public.search_seed_vault_share_users(text);

create or replace function public.search_seed_vault_share_users(search_query text)
returns table (
  user_id uuid,
  display_name text,
  public_handle text,
  avatar_url text,
  country_code text
)
language sql
security definer
set search_path = public, auth
as $$
  with normalized_query as (
    select
      btrim(coalesce(search_query, '')) as raw_query,
      lower(btrim(coalesce(search_query, ''))) as lowered_query,
      lower(regexp_replace(btrim(coalesce(search_query, '')), '^@+', '')) as handle_query
  ),
  visible_profiles as (
    select
      safe_public_member_profiles.user_id,
      safe_public_member_profiles.display_name,
      safe_public_member_profiles.public_handle,
      safe_public_member_profiles.avatar_url,
      safe_public_member_profiles.country_code
    from public.safe_public_member_profiles
    cross join normalized_query
    left join auth.users auth_users
      on auth_users.id = safe_public_member_profiles.user_id
    where auth.uid() is not null
      and safe_public_member_profiles.user_id <> auth.uid()
      and length(normalized_query.raw_query) >= 2
      and (
        lower(safe_public_member_profiles.display_name) like '%' || normalized_query.lowered_query || '%'
        or lower(coalesce(safe_public_member_profiles.public_handle, '')) like '%' || normalized_query.handle_query || '%'
        or (
          normalized_query.raw_query like '%@%'
          and lower(coalesce(auth_users.email, '')) = normalized_query.lowered_query
        )
      )
  )
  select
    visible_profiles.user_id,
    visible_profiles.display_name,
    visible_profiles.public_handle,
    visible_profiles.avatar_url,
    visible_profiles.country_code
  from visible_profiles
  cross join normalized_query
  order by
    case
      when lower(coalesce(visible_profiles.public_handle, '')) = normalized_query.handle_query then 0
      when lower(visible_profiles.display_name) = normalized_query.lowered_query then 1
      when lower(coalesce(visible_profiles.public_handle, '')) like normalized_query.handle_query || '%' then 2
      when lower(visible_profiles.display_name) like normalized_query.lowered_query || '%' then 3
      else 4
    end,
    lower(visible_profiles.display_name)
  limit 10;
$$;

grant execute on function public.search_seed_vault_share_users(text) to authenticated;

comment on function public.search_seed_vault_share_users(text) is
  'Authenticated direct Seed Vault sharing user search. Supports display name, public handle, and exact email lookup while returning only share-safe public profile fields.';

drop function if exists public.update_seed_vault_share_settings(text, text, boolean, boolean, boolean, boolean);

create or replace function public.update_seed_vault_share_settings(
  next_public_slug text default null,
  next_show_private_notes boolean default false,
  next_show_quantity boolean default false,
  next_show_storage_location boolean default false,
  next_show_storage_notes boolean default false,
  next_visibility text default 'private'
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

grant execute on function public.update_seed_vault_share_settings(text, boolean, boolean, boolean, boolean, text) to authenticated;

comment on function public.update_seed_vault_share_settings(text, boolean, boolean, boolean, boolean, text) is
  'Updates per-user Shared Seed Vault visibility and field toggles. Signature matches frontend named arguments for PostgREST schema-cache compatibility.';

notify pgrst, 'reload schema';
