import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runLocalSql } from "./local-demo/db.mjs";
import { REPOSITORY_ROOT } from "./local-demo/config.mjs";

const require = createRequire(import.meta.url);
const clientContract = require(resolve(REPOSITORY_ROOT, "src/grow-identity-contract.js"));
const migration = readFileSync(resolve(REPOSITORY_ROOT, "supabase/migrations/20260718120000_grow_identity_layer_phase1.sql"), "utf8");
const architecture = readFileSync(resolve(REPOSITORY_ROOT, "docs/grow-identity-layer-phase1.md"), "utf8");

assert.match(migration, /create or replace function public\.get_grow_identity_v1\(owner_user_id uuid, read_context text default 'direct'\)/i);
assert.match(migration, /viewer_user_id uuid := auth\.uid\(\)/i);
assert.doesNotMatch(migration, /get_grow_identity_v1\([^)]*viewer_user_id/i);
assert.match(migration, /create or replace function public\.update_my_grow_identity_v1\(identity_input jsonb\)/i);
assert.doesNotMatch(migration, /update_my_grow_identity_v1\([^)]*owner_user_id/i);
assert.match(migration, /constraint grow_identity_field_visibility_key_check/i);
assert.match(migration, /revoke all privileges on table public\.grow_identity_field_visibility/i);
assert.doesNotMatch(migration, /service[_-]?role[^\n]*(?:key|secret)/i);
assert.match(architecture, /GIE is becoming \*\*GEE — Grow Evidence Engine\*\*/);
assert.match(architecture, /1,050 matching lines across 55 files/);

const databaseContract = JSON.parse(runLocalSql(
  "select public.get_grow_identity_contract_v1()::text;",
  { tuplesOnly: true, quiet: true },
));
assert.deepEqual(databaseContract.profile_visibility, clientContract.profileVisibility);
assert.deepEqual(databaseContract.field_visibility, clientContract.fieldVisibility);
assert.deepEqual(databaseContract.experience_levels, clientContract.experienceLevels);
assert.deepEqual(databaseContract.primary_roles, clientContract.primaryRoles);
assert.deepEqual(databaseContract.connection_request_permissions, clientContract.connectionRequestPermissions);
assert.deepEqual(databaseContract.identity_field_keys, clientContract.identityFieldKeys);
assert.deepEqual(databaseContract.invitation_preference_keys, clientContract.invitationPreferenceKeys);
assert.deepEqual(databaseContract.provenance_values, clientContract.provenanceValues);
assert.deepEqual(databaseContract.defaults, {
  profile_visibility: clientContract.defaults.profileVisibility,
  grow_network_discoverable: clientContract.defaults.growNetworkDiscoverable,
  connection_request_permission: clientContract.defaults.connectionRequestPermission,
  personalization_consent: clientContract.defaults.personalizationConsent,
  invitation_preferences: clientContract.defaults.invitationPreferences,
});

runLocalSql(String.raw`
begin;

insert into auth.users (id) values
  ('a1100000-0000-4000-8000-000000000001'),
  ('a1100000-0000-4000-8000-000000000002'),
  ('a1100000-0000-4000-8000-000000000003'),
  ('a1100000-0000-4000-8000-000000000004'),
  ('a1100000-0000-4000-8000-000000000005'),
  ('a1100000-0000-4000-8000-000000000006');

insert into public.profiles (id, username, email, account_status) values
  ('a1100000-0000-4000-8000-000000000001', 'identity-owner', 'identity-owner@example.test', 'active'),
  ('a1100000-0000-4000-8000-000000000002', 'identity-connection', 'identity-connection@example.test', 'active'),
  ('a1100000-0000-4000-8000-000000000003', 'identity-member', 'identity-member@example.test', 'active'),
  ('a1100000-0000-4000-8000-000000000004', 'identity-personal', 'identity-personal@example.test', 'active'),
  ('a1100000-0000-4000-8000-000000000005', 'identity-country', 'identity-country@example.test', 'active'),
  ('a1100000-0000-4000-8000-000000000006', 'identity-admin', 'identity-admin@example.test', 'active')
on conflict (id) do update set account_status = excluded.account_status;

insert into public.public_member_profiles (
  id, user_id, display_name, public_handle, username, bio, cover_image_url,
  primary_role, experience_level, years_growing, languages,
  growing_environments, favorite_germination_methods, grow_interests,
  city, state_province, country, country_code, timezone,
  profile_visibility, grow_network_discoverable, connection_request_permission,
  show_profile_in_community_grow, allow_followers
) values
  ('b1100000-0000-4000-8000-000000000001', 'a1100000-0000-4000-8000-000000000001', 'Identity Owner', 'identity-owner', 'identity-owner', 'Connection biography', 'https://example.test/owner-cover.jpg', 'grower', 'experienced', 12, array['English'], array['Indoor'], array['KAN'], array['Breeding'], 'Boston', 'Massachusetts', 'United States', 'US', 'America/New_York', 'connections', true, 'anyone', true, true),
  ('a1100000-0000-4000-8000-000000000002', 'a1100000-0000-4000-8000-000000000002', 'Identity Connection', 'identity-connection', 'identity-connection', 'Connection profile', '', 'grower', 'intermediate', 4, array['English'], array['Outdoor'], array['Paper Towel'], array['Community'], 'Worcester', 'Massachusetts', 'United States', 'US', 'America/New_York', 'public', true, 'anyone', true, true),
  ('a1100000-0000-4000-8000-000000000003', 'a1100000-0000-4000-8000-000000000003', 'Identity Member', 'identity-member', 'identity-member', 'Member profile', '', 'grower', 'beginner', 1, array['English'], array['Indoor'], array['Direct Sow'], array['Learning'], 'Denver', 'Colorado', 'United States', 'US', 'America/Denver', 'public', true, 'anyone', true, true),
  ('a1100000-0000-4000-8000-000000000004', 'a1100000-0000-4000-8000-000000000004', 'Identity Personal', 'identity-personal', 'identity-personal', 'Private biography', '', 'grower', 'expert', 20, array['English'], array['Greenhouse'], array['Other'], array['Private'], 'Portland', 'Oregon', 'United States', 'US', 'America/Los_Angeles', 'personal', false, 'nobody', false, false),
  ('a1100000-0000-4000-8000-000000000005', 'a1100000-0000-4000-8000-000000000005', 'Country Fallback', 'identity-country', 'identity-country', 'Public country profile', '', 'educator', 'experienced', 8, array['French'], array['Outdoor'], array['Water Soak'], array['Teaching'], 'Montréal', null, 'Canada', 'CA', 'America/Toronto', 'public', false, 'anyone', true, true),
  ('a1100000-0000-4000-8000-000000000006', 'a1100000-0000-4000-8000-000000000006', 'Identity Admin', 'identity-admin', 'identity-admin', 'Admin profile', '', 'grower', 'experienced', 9, array['English'], array['Indoor'], array['KAN'], array['Moderation'], null, 'New York', 'United States', 'US', 'America/New_York', 'public', false, 'anyone', true, true)
on conflict (user_id) do update set display_name = excluded.display_name;

update public.grow_identity_field_visibility
set visibility = case
  when field_key = 'city' then 'only_me'
  when field_key in ('state_province', 'country', 'display_name', 'username', 'profile_image', 'recognitions') then 'public'
  else 'connections'
end
where user_id = 'a1100000-0000-4000-8000-000000000001';

insert into public.grow_follows (follower_id, following_id) values
  ('a1100000-0000-4000-8000-000000000001', 'a1100000-0000-4000-8000-000000000002'),
  ('a1100000-0000-4000-8000-000000000002', 'a1100000-0000-4000-8000-000000000001'),
  ('a1100000-0000-4000-8000-000000000003', 'a1100000-0000-4000-8000-000000000002'),
  ('a1100000-0000-4000-8000-000000000002', 'a1100000-0000-4000-8000-000000000003')
on conflict do nothing;

insert into public.user_recognitions (user_id, recognition_id, assignment_source)
values ('a1100000-0000-4000-8000-000000000001', 'first-session', 'automatic')
on conflict do nothing;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a1100000-0000-4000-8000-000000000001","email":"identity-owner@example.test","role":"authenticated"}', true);

do $$
declare identity jsonb; updated_identity jsonb; rejected boolean;
begin
  identity := public.get_my_grow_identity();
  if identity #>> '{viewer_relationship}' <> 'owner' then raise exception 'Owner relationship was not derived'; end if;
  if identity #>> '{fields,location,city}' <> 'Boston' then raise exception 'Owner could not read stored city'; end if;
  if identity #>> '{preferences,timezone}' <> 'America/New_York' then raise exception 'Owner preferences were not returned'; end if;
  if identity #>> '{field_visibility,city}' <> 'only_me' then raise exception 'Owner field visibility was not returned'; end if;

  updated_identity := public.update_my_grow_identity_v1(jsonb_build_object(
    'experience_level', 'expert',
    'languages', jsonb_build_array(' English ', 'english', 'Spanish'),
    'grow_interests', jsonb_build_array('Breeding', 'breeding', 'Community'),
    'field_visibility', jsonb_build_object('bio', 'connections', 'city', 'only_me')
  ));
  if updated_identity #>> '{fields,experience_level}' <> 'expert' then raise exception 'Owner update did not persist'; end if;
  if (select languages from public.public_member_profiles where user_id = auth.uid()) <> array['English','Spanish'] then raise exception 'Identity arrays were not case-insensitively deduplicated'; end if;
  if (select identity_provenance #>> '{experience_level,source}' from public.public_member_profiles where user_id = auth.uid()) <> 'self_declared' then raise exception 'Self-declared provenance was not recorded'; end if;
  if (select count(*) from public.user_recognitions where user_id = auth.uid() and revoked_at is null) <> 1 then raise exception 'Recognition data changed during identity update'; end if;
  if (select id from public.public_member_profiles where user_id = auth.uid()) <> 'b1100000-0000-4000-8000-000000000001'::uuid then raise exception 'Legacy distinct profile row id was rewritten'; end if;

  update public.public_member_profiles set show_profile_in_community_grow = false where user_id = auth.uid();
  if (select profile_visibility from public.public_member_profiles where user_id = auth.uid()) <> 'personal' then raise exception 'Legacy Profile private toggle did not map to personal'; end if;
  update public.public_member_profiles set show_profile_in_community_grow = true where user_id = auth.uid();
  if (select profile_visibility from public.public_member_profiles where user_id = auth.uid()) <> 'public' then raise exception 'Legacy Profile visible toggle did not remain functional'; end if;
  perform public.update_my_grow_identity_v1('{"profile_visibility":"connections"}'::jsonb);
  if (select profile_visibility from public.public_member_profiles where user_id = auth.uid()) <> 'connections' then raise exception 'Canonical visibility update was overridden by a legacy boolean'; end if;

  rejected := false;
  begin perform public.update_my_grow_identity_v1('{"is_verified":true}'::jsonb); exception when invalid_parameter_value then rejected := true; end;
  if not rejected then raise exception 'Recognition/trust mass assignment was accepted'; end if;
  rejected := false;
  begin perform public.update_my_grow_identity_v1('{"field_visibility":{"arbitrary_private_key":"public"}}'::jsonb); exception when invalid_parameter_value then rejected := true; end;
  if not rejected then raise exception 'Unsupported visibility key was accepted'; end if;
  rejected := false;
  begin perform public.update_my_grow_identity_v1('{"profile_visibility":"everyone"}'::jsonb); exception when invalid_parameter_value then rejected := true; end;
  if not rejected then raise exception 'Invalid profile visibility was accepted'; end if;
  rejected := false;
  begin update public.public_member_profiles set is_verified = not is_verified where user_id = auth.uid(); exception when insufficient_privilege then rejected := true; end;
  if not rejected then raise exception 'Member directly changed verified state'; end if;
  rejected := false;
  begin update public.public_member_profiles set identity_provenance = '{"experience_level":{"source":"system_verified"}}'::jsonb where user_id = auth.uid(); exception when insufficient_privilege then rejected := true; end;
  if not rejected then raise exception 'Member directly spoofed system provenance'; end if;
  rejected := false;
  begin update public.public_member_profiles set profile_visibility = 'everyone' where user_id = auth.uid(); exception when invalid_parameter_value or check_violation then rejected := true; end;
  if not rejected then raise exception 'Direct invalid visibility was silently normalized'; end if;
end
$$;

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a1100000-0000-4000-8000-000000000002","email":"identity-connection@example.test","role":"authenticated"}', true);

do $$
declare identity jsonb;
begin
  identity := public.get_grow_identity_v1('a1100000-0000-4000-8000-000000000001', 'direct');
  if identity #>> '{viewer_relationship}' <> 'connection' then raise exception 'Accepted connection was not derived from reciprocal follows'; end if;
  if identity #>> '{fields,bio}' <> 'Connection biography' then raise exception 'Connection-visible field was withheld'; end if;
  if (identity #> '{fields,location}') ? 'city' then raise exception 'Hidden city leaked to connection'; end if;
  if identity #>> '{fields,location,display}' <> 'Massachusetts, United States' then raise exception 'Safe state/country display was not returned'; end if;
end
$$;

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a1100000-0000-4000-8000-000000000003","email":"identity-member@example.test","role":"authenticated"}', true);

do $$
declare identity jsonb; search_rows jsonb; fallback_identity jsonb; affected integer; rejected boolean;
begin
  if public.get_grow_identity_v1('a1100000-0000-4000-8000-000000000001', 'direct') is not null then raise exception 'Connections-only profile leaked through direct unrelated access'; end if;
  identity := public.get_grow_identity_v1('a1100000-0000-4000-8000-000000000001', 'network_search');
  if identity #>> '{fields,display_name}' <> 'Identity Owner' then raise exception 'Discoverable limited preview was not returned'; end if;
  if (identity #> '{fields}') ? 'bio' or (identity #> '{fields,location}') ? 'city' then raise exception 'Discoverability overrode field visibility'; end if;
  if position('Boston' in identity::text) > 0 then raise exception 'Hidden city leaked in search payload'; end if;
  if public.get_grow_identity_v1('a1100000-0000-4000-8000-000000000004', 'network_search') is not null then raise exception 'Personal profile leaked through search'; end if;
  search_rows := public.search_grow_identities_v1('Identity', 20);
  if search_rows::text like '%Identity Personal%' or search_rows::text like '%Country Fallback%' then raise exception 'Personal or undiscoverable profile appeared in Network search'; end if;

  fallback_identity := public.get_grow_identity_v1('a1100000-0000-4000-8000-000000000005', 'direct');
  if fallback_identity #>> '{fields,location,display}' <> 'Canada' then raise exception 'Country-only location fallback failed'; end if;
  if (fallback_identity #> '{fields,location}') ? 'city' or position('Montréal' in fallback_identity::text) > 0 then raise exception 'Country fallback leaked hidden city'; end if;

  update public.public_member_profiles set display_name = 'Cross-user write' where user_id = 'a1100000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'RLS allowed a cross-user profile update'; end if;
  rejected := false;
  begin update public.grow_identity_field_visibility set visibility = 'public' where user_id = auth.uid(); exception when insufficient_privilege then rejected := true; end;
  if not rejected then raise exception 'Browser role directly mutated field visibility'; end if;
end
$$;

reset role;
insert into public.seed_vault_share_users (owner_user_id, shared_with_user_id, can_view_quantity)
values ('a1100000-0000-4000-8000-000000000001', 'a1100000-0000-4000-8000-000000000003', true)
on conflict (owner_user_id, shared_with_user_id) do update set can_view_quantity = excluded.can_view_quantity;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a1100000-0000-4000-8000-000000000003","email":"identity-member@example.test","role":"authenticated"}', true);

do $$
declare identity jsonb;
begin
  identity := public.get_grow_identity_v1('a1100000-0000-4000-8000-000000000001', 'vault_share');
  if identity #>> '{viewer_relationship}' <> 'shared_vault' then raise exception 'Existing direct Vault share was not honored'; end if;
  if (identity #> '{fields}') ? 'bio' or position('Boston' in identity::text) > 0 then raise exception 'Vault share escalated identity visibility'; end if;
end
$$;

reset role;
update public.public_member_profiles set connection_request_permission = 'mutual_connections', allow_followers = true
where user_id = 'a1100000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a1100000-0000-4000-8000-000000000003","email":"identity-member@example.test","role":"authenticated"}', true);
do $$
begin
  if not public.can_request_grow_connection_v1('a1100000-0000-4000-8000-000000000001') then raise exception 'Mutual connection permission rejected a valid mutual connection'; end if;
end
$$;
reset role;
delete from public.grow_follows where follower_id = 'a1100000-0000-4000-8000-000000000003' and following_id = 'a1100000-0000-4000-8000-000000000002';
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a1100000-0000-4000-8000-000000000003","email":"identity-member@example.test","role":"authenticated"}', true);
do $$
begin
  if public.can_request_grow_connection_v1('a1100000-0000-4000-8000-000000000001') then raise exception 'Mutual connection permission was bypassed'; end if;
end
$$;

reset role;
insert into public.admin_users (user_id, email)
values ('a1100000-0000-4000-8000-000000000006', 'identity-admin@example.test')
on conflict on constraint admin_users_user_id_key do update set email = excluded.email;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"a1100000-0000-4000-8000-000000000006","email":"identity-admin@example.test","role":"authenticated"}', true);
do $$
declare identity jsonb;
begin
  identity := public.get_grow_identity_v1('a1100000-0000-4000-8000-000000000004', 'direct');
  if identity #>> '{viewer_relationship}' <> 'administrator' or identity #>> '{fields,location,city}' <> 'Portland' then raise exception 'Explicit admin read behavior failed'; end if;
end
$$;

reset role;
do $$
begin
  if has_function_privilege('anon', 'public.get_grow_identity_v1(uuid,text)', 'execute')
    or has_function_privilege('anon', 'public.get_my_grow_identity()', 'execute')
    or has_function_privilege('anon', 'public.search_grow_identities_v1(text,integer)', 'execute')
    or has_function_privilege('anon', 'public.update_my_grow_identity_v1(jsonb)', 'execute')
    or not has_function_privilege('authenticated', 'public.get_grow_identity_v1(uuid,text)', 'execute')
    or not has_function_privilege('authenticated', 'public.update_my_grow_identity_v1(jsonb)', 'execute') then
    raise exception 'Grow Identity RPC EXECUTE boundary is incorrect';
  end if;
  if has_table_privilege('anon', 'public.grow_identity_field_visibility', 'select')
    or has_table_privilege('authenticated', 'public.grow_identity_field_visibility', 'insert')
    or has_table_privilege('authenticated', 'public.grow_identity_field_visibility', 'update')
    or has_table_privilege('authenticated', 'public.grow_identity_field_visibility', 'delete') then
    raise exception 'Grow Identity visibility table grants are too broad';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.grow_identity_field_visibility'::regclass) then
    raise exception 'Grow Identity field visibility RLS is disabled';
  end if;
end
$$;

rollback;
`, { quiet: true });

console.log("Grow Identity Phase 1 regression passed: constants, privacy, location filtering, owner updates, provenance, RLS, relationship scopes, discoverability, and compatibility verified.");
