import { DEMO_REFERENCE_TIME } from "../config.mjs";
import { ids } from "../ids.mjs";
import { contributors, sources, varieties, completedSessions, activeSessions, vaultEntries, collections, tags, LOCAL_DEMO_PASSWORD_HASH } from "./proof-data.mjs";
import { sqlArray, sqlJson, sqlLiteral } from "../db.mjs";

const uuidArray = (values) => `array[${values.map(sqlLiteral).join(",")}]::uuid[]`;
const byKey = (rows) => Object.fromEntries(rows.map((row) => [row.key, row]));
const sourceByKey = byKey(sources);
const varietyByKey = byKey(varieties);
const contributorByKey = byKey(contributors);
const collectionByKey = byKey(collections);
const tagByKey = byKey(tags);

function partitionFor(session) {
  const source = sourceByKey[session.source];
  const variety = varietyByKey[session.variety];
  return {
    id: `${session.id}-partition`, seedCount: session.seeds,
    plantedCount: session.germinated ?? 0, germinatedCount: session.germinated ?? 0,
    sourceCanonicalId: source.id, sourceCanonicalName: source.name, sourceName: source.name,
    seedVarietyCanonicalId: variety.id, seedVarietyCanonicalName: variety.name, seedVariety: variety.name,
    seedType: variety.type, seedAgeYears: session.age ?? 0.5,
  };
}

const values = (rows) => rows.join(",\n");

export function buildSeedSql() {
  const authRows = contributors.map((row) => `(${sqlLiteral(row.id)}, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', ${sqlLiteral(row.email)}, ${sqlLiteral(LOCAL_DEMO_PASSWORD_HASH)}, ${sqlLiteral(DEMO_REFERENCE_TIME)}, ${sqlJson({ provider: "email", providers: ["email"] })}, ${sqlJson({ name: row.displayName, full_name: row.displayName })}, ${sqlLiteral(DEMO_REFERENCE_TIME)}, ${sqlLiteral(DEMO_REFERENCE_TIME)}, '', '', '', '', '', null, '', '', '', false, false)`);
  const identityRows = contributors.map((row) => `(${sqlLiteral(row.identityId)}, ${sqlLiteral(row.email)}, ${sqlLiteral(row.id)}, ${sqlJson({ sub: row.id, email: row.email, email_verified: true, phone_verified: false })}, 'email', ${sqlLiteral(DEMO_REFERENCE_TIME)}, ${sqlLiteral(DEMO_REFERENCE_TIME)}, ${sqlLiteral(DEMO_REFERENCE_TIME)})`);
  const profileRows = contributors.map((row) => `(${sqlLiteral(row.id)}, ${sqlLiteral(row.username)}, ${sqlLiteral(row.email)}, 'active', true, ${sqlLiteral(DEMO_REFERENCE_TIME)}, ${sqlLiteral(DEMO_REFERENCE_TIME)}, ${sqlLiteral(DEMO_REFERENCE_TIME)})`);
  const publicProfileRows = contributors.map((row) => `(${sqlLiteral(row.publicProfileId)}, ${sqlLiteral(row.id)}, ${sqlLiteral(row.displayName)}, ${sqlLiteral(row.bio)}, ${sqlLiteral(row.handle)}, ${sqlLiteral(row.region)}, ${sqlLiteral(row.country)}, 'public', true, true, 'grower', 'grower', ${sqlLiteral(DEMO_REFERENCE_TIME)}, ${sqlLiteral(DEMO_REFERENCE_TIME)}, ${sqlLiteral(DEMO_REFERENCE_TIME)})`);
  const sourceRows = sources.map((row) => `(${sqlLiteral(row.id)}, ${sqlLiteral(row.name)}, ${sqlLiteral(row.description)}, 'active', false, ${sqlLiteral(DEMO_REFERENCE_TIME)}, ${sqlLiteral(DEMO_REFERENCE_TIME)})`);
  const varietyRows = varieties.map((row) => {
    const source = sourceByKey[row.sourceKey];
    return `(${sqlLiteral(row.id)}, ${sqlLiteral(row.name)}, ${sqlLiteral(source.name)}, ${sqlLiteral(row.type)}, true, true, false, ${sqlLiteral(DEMO_REFERENCE_TIME)}, ${sqlLiteral(DEMO_REFERENCE_TIME)})`;
  });
  const completedRows = completedSessions.map((row) => {
    const partition = partitionFor(row);
    return `(${sqlLiteral(row.id)}, ${sqlLiteral(contributorByKey[row.contributor].id)}, ${sqlLiteral(row.started.slice(0, 10))}, '12:00', ${sqlLiteral(row.method)}, 'DEMO-1', ${sqlLiteral(`${sourceByKey[row.source].name} · ${varietyByKey[row.variety].name}`)}, 'completed', ${sqlLiteral(row.started)}, ${sqlLiteral(row.started)}, ${sqlLiteral(row.completed)}, ${sqlLiteral(row.completed)}, true, 'session', ${row.age}, false, false, false, false, 'active', ${sqlJson([partition])}, ${sqlLiteral(row.started)}, ${sqlLiteral(row.completed)})`;
  });
  const activeRows = activeSessions.map((row) => {
    const partition = partitionFor({ ...row, germinated: 0, age: 0.5 });
    return `(${sqlLiteral(row.id)}, ${sqlLiteral(ids.users.owner)}, ${sqlLiteral(row.started.slice(0, 10))}, '12:00', ${sqlLiteral(row.method)}, 'DEMO-ACTIVE', ${sqlLiteral(row.name)}, 'active', ${sqlLiteral(row.started)}, ${sqlLiteral(row.started)}, null, null, false, null, null, false, false, false, false, 'active', ${sqlJson([partition])}, ${sqlLiteral(row.started)}, ${sqlLiteral(DEMO_REFERENCE_TIME)})`;
  });
  const snapshotRows = completedSessions.map((row) => {
    const contributor = contributorByKey[row.contributor];
    const source = sourceByKey[row.source];
    const variety = varietyByKey[row.variety];
    const percent = Math.round((row.germinated / row.seeds) * 100);
    const partition = partitionFor(row);
    return `(${sqlLiteral(row.snapshotId)}, ${sqlLiteral(contributor.id)}, ${sqlLiteral(row.id)}, ${sqlLiteral(`${variety.name} proof result`)}, '/assets/images/seed-report-hero-bg.png', '', ${sqlLiteral(row.completed.slice(0, 10))}, ${sqlLiteral(row.method)}, ${percent}, true, 'session', ${row.age}, ${sqlLiteral(contributor.displayName)}, true, ${sqlLiteral(contributor.displayName)}, true, 'approved', true, ${sqlLiteral(row.completed)}, ${sqlLiteral(row.completed)}, ${sqlLiteral(row.completed)}, 'DEMO-1', ${row.seeds}, ${row.germinated}, ${sqlLiteral(source.id)}, ${sqlLiteral(source.name)}, ${sqlLiteral(variety.name)}, false, false, false, ${sqlJson([partition])}, ${sqlJson({ totalSeeds: row.seeds, germinatedSeeds: row.germinated, germinationRate: percent })})`;
  });
  const collectionRows = collections.map((row) => `(${sqlLiteral(row.id)}, ${sqlLiteral(ids.users.owner)}, ${sqlLiteral(row.name)}, ${sqlLiteral(row.name.toLowerCase())}, ${sqlLiteral(DEMO_REFERENCE_TIME)}, ${sqlLiteral(DEMO_REFERENCE_TIME)})`);
  const tagRows = tags.map((row) => `(${sqlLiteral(row.id)}, ${sqlLiteral(ids.users.owner)}, ${sqlLiteral(row.name)}, ${sqlLiteral(row.name.toLowerCase())}, ${sqlLiteral(DEMO_REFERENCE_TIME)})`);
  const vaultRows = vaultEntries.map((row, index) => {
    const variety = varietyByKey[row.variety];
    const source = sourceByKey[variety.sourceKey];
    const tagNames = row.tags.map((key) => tagByKey[key].name);
    const collectionNames = row.collections.map((key) => collectionByKey[key].name);
    return `(${sqlLiteral(row.id)}, ${sqlLiteral(ids.users.owner)}, ${sqlLiteral(variety.name)}, ${sqlLiteral(variety.type)}, ${sqlLiteral(source.name)}, ${row.quantity}, ${Number(row.acquired.slice(0, 4))}, ${row.age}, 'Demo Vault', ${sqlLiteral(`Deterministic Phase 1 inventory record ${index + 1}.`)}, ${sqlLiteral(variety.name)}, ${row.quantity}, ${row.quantity}, false, false, null, 'private', ${sqlLiteral(row.acquired)}, ${sqlLiteral(`Local demo source notes for ${source.name}.`)}, ${sqlLiteral("Fictional local-only inventory; safe to remove with demo:clear.")}, ${sqlJson([])}, ${sqlArray(collectionNames)}, ${sqlArray(tagNames)}, ${sqlLiteral(row.planning)}, ${sqlLiteral(source.name)}, ${sqlLiteral(row.acquired)}, ${sqlLiteral(`DEMO-${String(index + 1).padStart(3, "0")}`)}, ${(12.5 + index * 3).toFixed(2)}, ${sqlLiteral(row.breeder)}, ${sqlLiteral(DEMO_REFERENCE_TIME)}, ${sqlLiteral(DEMO_REFERENCE_TIME)})`;
  });
  const collectionLinkRows = vaultEntries.flatMap((entry) => entry.collections.map((collectionKey) => `(${sqlLiteral(entry.id)}, ${sqlLiteral(collectionByKey[collectionKey].id)}, ${sqlLiteral(ids.users.owner)}, ${sqlLiteral(DEMO_REFERENCE_TIME)})`));
  const tagLinkRows = vaultEntries.flatMap((entry) => entry.tags.map((tagKey) => `(${sqlLiteral(entry.id)}, ${sqlLiteral(tagByKey[tagKey].id)}, ${sqlLiteral(ids.users.owner)}, ${sqlLiteral(DEMO_REFERENCE_TIME)})`));
  const noteRows = [
    `(${sqlLiteral(ids.growNotes.banana)}, ${sqlLiteral(ids.users.owner)}, ${sqlLiteral(ids.vaultEntries.bananaJealousy)}, ${sqlLiteral(ids.completedSessions.seedsman1)}, 'Strong deterministic proof run; retain for Phase 2 comparison.', ${sqlLiteral(DEMO_REFERENCE_TIME)}, ${sqlLiteral(DEMO_REFERENCE_TIME)})`,
    `(${sqlLiteral(ids.growNotes.reserve)}, ${sqlLiteral(ids.users.owner)}, ${sqlLiteral(ids.vaultEntries.vaultReserve)}, null, 'Empty-evidence Vault fixture reserved for a future planned run.', ${sqlLiteral(DEMO_REFERENCE_TIME)}, ${sqlLiteral(DEMO_REFERENCE_TIME)})`,
  ];
  const activityRows = contributors.map((row, index) => {
    const session = completedSessions.find((item) => item.contributor === row.key);
    return `(${sqlLiteral(ids.activities[row.key])}, ${sqlLiteral(row.id)}, 'shared-session', ${sqlLiteral(session?.id || "")}, ${sqlLiteral(session?.snapshotId || "")}, ${sqlLiteral(`${row.displayName} shared approved evidence`)}, 'Deterministic local-only profile activity.', ${sqlJson({ localDemo: true })}, 'public', ${sqlLiteral(session?.completed || DEMO_REFERENCE_TIME)}, false)`;
  });

  return `\\set ON_ERROR_STOP on
begin;
delete from public.seed_vault_grow_notes where id = any(${uuidArray(Object.values(ids.growNotes))});
delete from public.community_activity where id = any(${uuidArray(Object.values(ids.activities))});
delete from public.grow_gallery_snapshots where id = any(${uuidArray(Object.values(ids.snapshots))});
delete from public.grow_sessions where id = any(${uuidArray([...Object.values(ids.completedSessions), ...Object.values(ids.activeSessions)])});
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token, is_sso_user, is_anonymous) values
${values(authRows)} on conflict (id) do update set instance_id=excluded.instance_id,email=excluded.email, encrypted_password=excluded.encrypted_password, email_confirmed_at=excluded.email_confirmed_at, raw_app_meta_data=excluded.raw_app_meta_data, raw_user_meta_data=excluded.raw_user_meta_data, confirmation_token='', recovery_token='', email_change_token_new='', email_change='', email_change_token_current='', phone=null, phone_change='', phone_change_token='', reauthentication_token='', updated_at=excluded.updated_at;
insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at) values
${values(identityRows)} on conflict (id) do update set provider_id=excluded.provider_id, user_id=excluded.user_id, identity_data=excluded.identity_data, updated_at=excluded.updated_at;
insert into public.profiles (id, username, email, account_status, profile_setup_complete, last_active_at, created_at, updated_at) values
${values(profileRows)} on conflict (id) do update set username=excluded.username, email=excluded.email, account_status='active', profile_setup_complete=true, last_active_at=excluded.last_active_at, updated_at=excluded.updated_at;
insert into public.public_member_profiles (id,user_id,display_name,bio,public_handle,location_region,country_code,profile_visibility,show_profile_in_community_grow,show_grow_stats_publicly,profile_type,account_type,joined_at,created_at,updated_at) values
${values(publicProfileRows)} on conflict (id) do update set display_name=excluded.display_name,bio=excluded.bio,public_handle=excluded.public_handle,location_region=excluded.location_region,country_code=excluded.country_code,profile_visibility='public',show_profile_in_community_grow=true,show_grow_stats_publicly=true,profile_type='grower',account_type='grower',updated_at=excluded.updated_at;
insert into public.sources (id,name,description,status,is_mock,created_at,updated_at) values
${values(sourceRows)} on conflict (id) do update set name=excluded.name,description=excluded.description,status='active',is_mock=false,updated_at=excluded.updated_at;
insert into public.variety_directory (id,name,source_name,variety_type,verified,active,needs_admin_review,created_at,updated_at) values
${values(varietyRows)} on conflict (id) do update set name=excluded.name,source_id=null,source_name=excluded.source_name,variety_type=excluded.variety_type,active=true,updated_at=excluded.updated_at;
insert into public.grow_sessions (id,user_id,date,time,system_type,unit_id,session_name,session_status,session_started_at,germination_started_at,completed_at,timer_start_at,seed_age_tracking_enabled,seed_age_mode,session_seed_age_years,is_mock,is_test,excluded_from_analytics,is_deleted,visibility_status,partitions,created_at,updated_at) values
${values([...completedRows, ...activeRows])} on conflict (id) do update set user_id=excluded.user_id,date=excluded.date,time=excluded.time,system_type=excluded.system_type,unit_id=excluded.unit_id,session_name=excluded.session_name,session_status=excluded.session_status,session_started_at=excluded.session_started_at,germination_started_at=excluded.germination_started_at,completed_at=excluded.completed_at,timer_start_at=excluded.timer_start_at,seed_age_tracking_enabled=excluded.seed_age_tracking_enabled,seed_age_mode=excluded.seed_age_mode,session_seed_age_years=excluded.session_seed_age_years,is_mock=false,is_test=false,excluded_from_analytics=false,is_deleted=false,visibility_status='active',partitions=excluded.partitions,updated_at=excluded.updated_at;
insert into public.grow_gallery_snapshots (id,user_id,session_id,snapshot_title,snapshot_image_url,snapshot_image_path,session_date,system_type,success_percent,seed_age_tracking_enabled,seed_age_mode,session_seed_age_years,submitted_by,include_profile_in_gallery,submitted_profile_name,usage_consent,status,is_published,published_at,created_at,updated_at,unit_id,total_seeds,total_planted,source_id,source_name,seed_variety_name,is_mock,analytics_excluded,status_is_mock,partition_results,result_summary) values
${values(snapshotRows)} on conflict (id) do update set user_id=excluded.user_id,session_id=excluded.session_id,snapshot_title=excluded.snapshot_title,snapshot_image_url=excluded.snapshot_image_url,session_date=excluded.session_date,system_type=excluded.system_type,success_percent=excluded.success_percent,submitted_by=excluded.submitted_by,include_profile_in_gallery=true,submitted_profile_name=excluded.submitted_profile_name,usage_consent=true,status='approved',is_published=true,published_at=excluded.published_at,total_seeds=excluded.total_seeds,total_planted=excluded.total_planted,source_id=excluded.source_id,source_name=excluded.source_name,seed_variety_name=excluded.seed_variety_name,is_mock=false,analytics_excluded=false,status_is_mock=false,partition_results=excluded.partition_results,result_summary=excluded.result_summary,updated_at=excluded.updated_at;
insert into public.seed_vault_collections (id,user_id,name,normalized_name,created_at,updated_at) values
${values(collectionRows)} on conflict (id) do update set name=excluded.name,normalized_name=excluded.normalized_name,updated_at=excluded.updated_at;
insert into public.seed_vault_tags (id,user_id,name,normalized_name,created_at) values
${values(tagRows)} on conflict (id) do update set name=excluded.name,normalized_name=excluded.normalized_name;
insert into public.seed_vault_entries (id,user_id,seed_name,seed_type,source,quantity,year_acquired,seed_age_years,storage_location,notes,seed_variety,seed_count,remaining_count,is_mock,dev_mode_only,mock_source,visibility,acquired_at,source_notes,personal_notes,grow_notes,collections,tags,planning_status,acquired_from,acquisition_date,order_number,price,breeder,created_at,updated_at) values
${values(vaultRows)} on conflict (id) do update set seed_name=excluded.seed_name,seed_type=excluded.seed_type,source=excluded.source,quantity=excluded.quantity,year_acquired=excluded.year_acquired,seed_age_years=excluded.seed_age_years,storage_location=excluded.storage_location,notes=excluded.notes,seed_variety=excluded.seed_variety,seed_count=excluded.seed_count,remaining_count=excluded.remaining_count,is_mock=false,dev_mode_only=false,mock_source=null,visibility='private',acquired_at=excluded.acquired_at,source_notes=excluded.source_notes,personal_notes=excluded.personal_notes,grow_notes=excluded.grow_notes,collections=excluded.collections,tags=excluded.tags,planning_status=excluded.planning_status,acquired_from=excluded.acquired_from,acquisition_date=excluded.acquisition_date,order_number=excluded.order_number,price=excluded.price,breeder=excluded.breeder,updated_at=excluded.updated_at;
delete from public.seed_vault_entry_collections where seed_vault_entry_id = any(${uuidArray(Object.values(ids.vaultEntries))});
insert into public.seed_vault_entry_collections (seed_vault_entry_id,collection_id,user_id,created_at) values ${values(collectionLinkRows)};
delete from public.seed_vault_entry_tags where seed_vault_entry_id = any(${uuidArray(Object.values(ids.vaultEntries))});
insert into public.seed_vault_entry_tags (seed_vault_entry_id,tag_id,user_id,created_at) values ${values(tagLinkRows)};
insert into public.seed_vault_grow_notes (id,user_id,seed_vault_entry_id,session_id,note_text,created_at,updated_at) values
${values(noteRows)} on conflict (id) do update set session_id=excluded.session_id,note_text=excluded.note_text,updated_at=excluded.updated_at;
insert into public.community_activity (id,user_id,activity_type,session_id,snapshot_id,title,summary,metadata,visibility,created_at,is_mock) values
${values(activityRows)} on conflict (id) do update set activity_type=excluded.activity_type,session_id=excluded.session_id,snapshot_id=excluded.snapshot_id,title=excluded.title,summary=excluded.summary,metadata=excluded.metadata,visibility='public',created_at=excluded.created_at,is_mock=false;
commit;
`;
}

export function buildClearSql() {
  return `\\set ON_ERROR_STOP on
begin;
delete from public.seed_vault_grow_notes where id = any(${uuidArray(Object.values(ids.growNotes))});
delete from public.seed_vault_entry_tags where seed_vault_entry_id = any(${uuidArray(Object.values(ids.vaultEntries))});
delete from public.seed_vault_entry_collections where seed_vault_entry_id = any(${uuidArray(Object.values(ids.vaultEntries))});
delete from public.seed_vault_tags where id = any(${uuidArray(Object.values(ids.tags))});
delete from public.seed_vault_collections where id = any(${uuidArray(Object.values(ids.collections))});
delete from public.seed_vault_entries where id = any(${uuidArray(Object.values(ids.vaultEntries))});
delete from public.community_activity where id = any(${uuidArray(Object.values(ids.activities))});
delete from public.grow_gallery_snapshots where id = any(${uuidArray(Object.values(ids.snapshots))});
delete from public.grow_sessions where id = any(${uuidArray([...Object.values(ids.completedSessions), ...Object.values(ids.activeSessions)])});
delete from public.variety_directory where id = any(${uuidArray(Object.values(ids.varieties))});
delete from public.sources where id = any(${uuidArray(Object.values(ids.sources))});
delete from public.public_member_profiles where id = any(${uuidArray(Object.values(ids.publicProfiles))});
delete from public.profiles where id = any(${uuidArray(Object.values(ids.users))});
delete from auth.identities where id = any(${uuidArray(Object.values(ids.identities))});
delete from auth.users where id = any(${uuidArray(Object.values(ids.users))});
do $$
begin
  if exists (select 1 from auth.users where id = any(${uuidArray(Object.values(ids.users))}))
    or exists (select 1 from auth.identities where id = any(${uuidArray(Object.values(ids.identities))}))
    or exists (select 1 from public.profiles where id = any(${uuidArray(Object.values(ids.users))}))
    or exists (select 1 from public.public_member_profiles where id = any(${uuidArray(Object.values(ids.publicProfiles))}))
    or exists (select 1 from public.sources where id = any(${uuidArray(Object.values(ids.sources))}))
    or exists (select 1 from public.variety_directory where id = any(${uuidArray(Object.values(ids.varieties))}))
    or exists (select 1 from public.grow_sessions where id = any(${uuidArray([...Object.values(ids.completedSessions), ...Object.values(ids.activeSessions)])}))
    or exists (select 1 from public.grow_gallery_snapshots where id = any(${uuidArray(Object.values(ids.snapshots))}))
    or exists (select 1 from public.seed_vault_entries where id = any(${uuidArray(Object.values(ids.vaultEntries))}))
    or exists (select 1 from public.seed_vault_collections where id = any(${uuidArray(Object.values(ids.collections))}))
    or exists (select 1 from public.seed_vault_tags where id = any(${uuidArray(Object.values(ids.tags))}))
    or exists (select 1 from public.seed_vault_grow_notes where id = any(${uuidArray(Object.values(ids.growNotes))}))
    or exists (select 1 from public.community_activity where id = any(${uuidArray(Object.values(ids.activities))}))
  then raise exception 'manifest-owned demo records remain after cleanup'; end if;
end;
$$;
commit;
`;
}
