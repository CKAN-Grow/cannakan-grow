-- Expose Profile Hero cover URLs through the existing privacy-aware public
-- projection. Storage paths remain private and are never projected.

create or replace view public.safe_public_member_profiles as
select
  profiles.id,
  profiles.user_id,
  case when coalesce(field_visibility.values ->> 'display_name', 'public') = 'public' then profiles.display_name else null end as display_name,
  case when coalesce(field_visibility.values ->> 'profile_image', 'public') = 'public' then profiles.avatar_url else '' end as avatar_url,
  case when coalesce(field_visibility.values ->> 'bio', 'connections') = 'public' then profiles.bio else '' end as bio,
  case when coalesce(field_visibility.values ->> 'username', 'public') = 'public' then profiles.public_handle else null end as public_handle,
  coalesce(
    case when coalesce(field_visibility.values ->> 'state_province', 'public') = 'public' then profiles.state_province else null end,
    case when coalesce(field_visibility.values ->> 'country', 'public') = 'public' then coalesce(profiles.country, profiles.country_code) else null end,
    ''
  ) as location_region,
  case when coalesce(field_visibility.values ->> 'country', 'public') = 'public' then profiles.country_code else null end as country_code,
  profiles.profile_visibility,
  profiles.vault_theme,
  profiles.joined_at,
  profiles.show_profile_in_community_grow,
  case when coalesce(field_visibility.values ->> 'activity_summary', 'connections') = 'public' then profiles.show_grow_stats_publicly else false end as show_grow_stats_publicly,
  profiles.created_at,
  profiles.updated_at,
  profiles.account_type,
  profiles.profile_type,
  profiles.is_verified,
  profiles.reserved_grow_id,
  profiles.username,
  profiles.grow_network_discoverable,
  case when coalesce(field_visibility.values ->> 'cover_image', 'connections') = 'public' then profiles.cover_image_url else '' end as cover_image_url
from public.public_member_profiles profiles
left join lateral (
  select coalesce(jsonb_object_agg(visibility.field_key, visibility.visibility), '{}'::jsonb) as values
  from public.grow_identity_field_visibility visibility
  where visibility.user_id = profiles.user_id
) field_visibility on true
where profiles.show_profile_in_community_grow
  and profiles.profile_visibility = 'public'
  and coalesce(field_visibility.values ->> 'display_name', 'public') = 'public'
  and nullif(btrim(coalesce(profiles.display_name, '')), '') is not null
  and exists (
    select 1 from public.profiles private_profile
    where private_profile.id = profiles.user_id
      and coalesce(private_profile.account_status, 'active') = 'active'
      and coalesce(private_profile.deletion_status, '') <> 'deleted'
  );

comment on view public.safe_public_member_profiles is
  'Legacy public profile projection. Profile Hero URLs follow cover_image visibility; storage paths are never exposed.';

revoke all privileges on table public.safe_public_member_profiles from public, anon, authenticated, service_role;
grant select on table public.safe_public_member_profiles to anon, authenticated;

notify pgrst, 'reload schema';
