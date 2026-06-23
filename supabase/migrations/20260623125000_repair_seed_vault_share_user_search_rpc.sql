-- Repair Shared Seed Vault direct-user search RPC availability.
-- Keeps email private: email can be used for exact authenticated lookup only,
-- but the function returns public/share-safe profile fields.

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

notify pgrst, 'reload schema';
