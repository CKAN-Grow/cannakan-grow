create or replace view public.public_member_profiles as
select
  profiles.id,
  nullif(btrim(profiles.username), '') as display_name,
  coalesce(profiles.avatar_url, '') as avatar_url,
  profiles.created_at as joined_at
from public.profiles
where coalesce(profiles.account_status, 'active') = 'active'
  and coalesce(profiles.deletion_status, '') <> 'deleted'
  and nullif(btrim(profiles.username), '') is not null;

revoke all on table public.public_member_profiles from public;
grant select on table public.public_member_profiles to anon;
grant select on table public.public_member_profiles to authenticated;
