-- Correct Community Grow reset authorization for current Supabase Secret Keys.
--
-- New Supabase Secret Keys (sb_secret_...) are not JWTs, so these reset RPCs
-- must not inspect auth.jwt(), auth.uid(), request.jwt.claim.role, or auth.role().
-- Access is restricted with PostgreSQL EXECUTE grants to service_role only.

create or replace function public.community_grow_reset_is_authorized()
returns boolean
language sql
security definer
set search_path = public
as $$
  select true;
$$;

revoke all on function public.community_grow_reset_is_authorized() from public, anon, authenticated;
grant execute on function public.community_grow_reset_is_authorized() to service_role;

create or replace function public.community_grow_reset_table_count(p_table_name text)
returns integer
language plpgsql
security definer
set search_path = public, auth, storage
as $$
declare
  table_count integer := null;
begin
  if to_regclass(p_table_name) is null then
    return null;
  end if;

  execute format('select count(*)::integer from %s', p_table_name)
    into table_count;
  return table_count;
end;
$$;

revoke all on function public.community_grow_reset_table_count(text) from public, anon, authenticated;
grant execute on function public.community_grow_reset_table_count(text) to service_role;

create or replace function public.admin_preview_community_grow_publication_reset()
returns jsonb
language plpgsql
security definer
set search_path = public, auth, storage
as $$
declare
  target_snapshot_ids uuid[] := '{}'::uuid[];
  target_snapshot_id_texts text[] := '{}'::text[];
  target_session_id_texts text[] := '{}'::text[];
  storage_candidate_paths text[] := '{}'::text[];
  publication_activity_types text[] := array[
    'snapshot_approved',
    'snapshot_posted',
    'snapshot_published',
    'submission_approved',
    'public_session_shared',
    'public_session_completed',
    'community_recognition',
    'featured_community_grow',
    'community_discovery_created'
  ];
  snapshot_count integer := 0;
  pending_count integer := 0;
  approved_count integer := 0;
  published_count integer := 0;
  hidden_removed_count integer := 0;
  like_count integer := 0;
  activity_count integer := 0;
  storage_candidate_count integer := 0;
  protected_counts jsonb;
begin
  if to_regclass('public.grow_gallery_snapshots') is not null then
    select coalesce(array_agg(id order by created_at), '{}'::uuid[])
    into target_snapshot_ids
    from public.grow_gallery_snapshots
    where coalesce(is_mock, false) = false;

    select coalesce(array_agg(id::text order by created_at), '{}'::text[])
    into target_snapshot_id_texts
    from public.grow_gallery_snapshots
    where coalesce(is_mock, false) = false;

    select coalesce(array_agg(distinct session_id::text), '{}'::text[])
    into target_session_id_texts
    from public.grow_gallery_snapshots
    where coalesce(is_mock, false) = false
      and session_id is not null;

    select coalesce(array_agg(distinct snapshot_image_path), '{}'::text[])
    into storage_candidate_paths
    from public.grow_gallery_snapshots target_snapshots
    where coalesce(target_snapshots.is_mock, false) = false
      and coalesce(nullif(btrim(target_snapshots.snapshot_image_path), ''), '') <> ''
      and not exists (
        select 1
        from public.grow_gallery_snapshots other_snapshots
        where other_snapshots.id <> target_snapshots.id
          and other_snapshots.snapshot_image_path = target_snapshots.snapshot_image_path
          and coalesce(other_snapshots.is_mock, false) = true
      );

    select count(*)::integer
    into snapshot_count
    from public.grow_gallery_snapshots
    where coalesce(is_mock, false) = false;

    select count(*)::integer
    into pending_count
    from public.grow_gallery_snapshots
    where coalesce(is_mock, false) = false
      and lower(coalesce(status, '')) = 'pending_review';

    select count(*)::integer
    into approved_count
    from public.grow_gallery_snapshots
    where coalesce(is_mock, false) = false
      and lower(coalesce(status, '')) = 'approved';

    select count(*)::integer
    into published_count
    from public.grow_gallery_snapshots
    where coalesce(is_mock, false) = false
      and coalesce(is_published, false) = true;

    select count(*)::integer
    into hidden_removed_count
    from public.grow_gallery_snapshots
    where coalesce(is_mock, false) = false
      and lower(coalesce(status, '')) in ('hidden', 'removed', 'rejected');
  end if;

  if to_regclass('public.grow_gallery_snapshot_likes') is not null then
    select count(*)::integer
    into like_count
    from public.grow_gallery_snapshot_likes
    where snapshot_id = any(target_snapshot_ids);
  end if;

  if to_regclass('public.community_activity') is not null then
    select count(*)::integer
    into activity_count
    from public.community_activity
    where coalesce(is_mock, false) = false
      and (
        snapshot_id = any(target_snapshot_id_texts)
        or (
          session_id = any(target_session_id_texts)
          and lower(coalesce(activity_type, '')) = any(publication_activity_types)
        )
      );
  end if;

  if to_regclass('storage.objects') is not null then
    select count(*)::integer
    into storage_candidate_count
    from storage.objects
    where bucket_id = 'grow-gallery'
      and name = any(storage_candidate_paths);
  end if;

  protected_counts := jsonb_build_object(
    'auth.users', public.community_grow_reset_table_count('auth.users'),
    'public.profiles', public.community_grow_reset_table_count('public.profiles'),
    'public.public_member_profiles', public.community_grow_reset_table_count('public.public_member_profiles'),
    'public.user_notification_preferences', public.community_grow_reset_table_count('public.user_notification_preferences'),
    'public.grow_sessions', public.community_grow_reset_table_count('public.grow_sessions'),
    'public.seed_vault_entries', public.community_grow_reset_table_count('public.seed_vault_entries')
  );

  return jsonb_build_object(
    'mode', 'dry-run',
    'dependencyMap', jsonb_build_object(
      'communitySubmissions', 'public.grow_gallery_snapshots where is_mock=false',
      'publishedSnapshots', 'public.grow_gallery_snapshots status=approved and/or is_published=true',
      'pendingReviewItems', 'public.grow_gallery_snapshots status=pending_review',
      'removedHiddenSnapshots', 'public.grow_gallery_snapshots status in hidden/removed/rejected',
      'likes', 'public.grow_gallery_snapshot_likes linked by snapshot_id',
      'communityActivity', 'public.community_activity linked by snapshot_id or publication activity_type/session_id',
      'communityReports', 'derived from approved public grow_gallery_snapshots',
      'communityCards', 'derived from approved public grow_gallery_snapshots',
      'communityDiscoveries', 'derived from approved snapshots, leaderboard rows, and community activity',
      'recognition', 'derived in application UI from approved snapshots/activity; no standalone recognition table found in current schema',
      'publicSnapshotImages', 'storage bucket grow-gallery, paths from grow_gallery_snapshots.snapshot_image_path',
      'developerPreviewData', 'excluded by is_mock=true'
    ),
    'protectedCounts', protected_counts,
    'targetSessionIds', to_jsonb(target_session_id_texts),
    'targetSnapshotIds', to_jsonb(target_snapshot_id_texts),
    'publicationOnlyStoragePaths', to_jsonb(storage_candidate_paths),
    'counts', jsonb_build_object(
      'grow_gallery_snapshots', snapshot_count,
      'pending_review', pending_count,
      'approved', approved_count,
      'published', published_count,
      'hidden_removed_rejected', hidden_removed_count,
      'grow_gallery_snapshot_likes', like_count,
      'community_activity', activity_count,
      'publication_storage_candidates', storage_candidate_count,
      'recognition_records', 0,
      'discovery_records', 0
    ),
    'safety', jsonb_build_object(
      'willDeleteGrowSessions', false,
      'willDeleteUsers', false,
      'willDeleteSeedVaultEntries', false,
      'willDeletePrivateSessionImages', false,
      'willDeletePrivateReports', false,
      'willDeleteDeveloperPreviewData', false
    )
  );
end;
$$;

revoke all on function public.admin_preview_community_grow_publication_reset() from public, anon, authenticated;
grant execute on function public.admin_preview_community_grow_publication_reset() to service_role;

create or replace function public.admin_execute_community_grow_publication_reset()
returns jsonb
language plpgsql
security definer
set search_path = public, auth, storage
as $$
declare
  preview_before jsonb;
  protected_before jsonb;
  protected_after jsonb;
  target_snapshot_ids uuid[] := '{}'::uuid[];
  target_snapshot_id_texts text[] := '{}'::text[];
  target_session_id_texts text[] := '{}'::text[];
  publication_activity_types text[] := array[
    'snapshot_approved',
    'snapshot_posted',
    'snapshot_published',
    'submission_approved',
    'public_session_shared',
    'public_session_completed',
    'community_recognition',
    'featured_community_grow',
    'community_discovery_created'
  ];
  deleted_likes integer := 0;
  deleted_activity integer := 0;
  deleted_snapshots integer := 0;
  remaining_snapshots integer := 0;
  remaining_pending integer := 0;
  remaining_published integer := 0;
begin
  preview_before := public.admin_preview_community_grow_publication_reset();
  protected_before := preview_before->'protectedCounts';

  if to_regclass('public.grow_gallery_snapshots') is not null then
    select coalesce(array_agg(id), '{}'::uuid[])
    into target_snapshot_ids
    from public.grow_gallery_snapshots
    where coalesce(is_mock, false) = false;

    select coalesce(array_agg(id::text), '{}'::text[])
    into target_snapshot_id_texts
    from public.grow_gallery_snapshots
    where coalesce(is_mock, false) = false;

    select coalesce(array_agg(distinct session_id::text), '{}'::text[])
    into target_session_id_texts
    from public.grow_gallery_snapshots
    where coalesce(is_mock, false) = false
      and session_id is not null;
  end if;

  if to_regclass('public.grow_gallery_snapshot_likes') is not null then
    delete from public.grow_gallery_snapshot_likes
    where snapshot_id = any(target_snapshot_ids);
    get diagnostics deleted_likes = row_count;
  end if;

  if to_regclass('public.community_activity') is not null then
    delete from public.community_activity
    where coalesce(is_mock, false) = false
      and (
        snapshot_id = any(target_snapshot_id_texts)
        or (
          session_id = any(target_session_id_texts)
          and lower(coalesce(activity_type, '')) = any(publication_activity_types)
        )
      );
    get diagnostics deleted_activity = row_count;
  end if;

  if to_regclass('public.grow_gallery_snapshots') is not null then
    delete from public.grow_gallery_snapshots
    where coalesce(is_mock, false) = false;
    get diagnostics deleted_snapshots = row_count;
  end if;

  protected_after := jsonb_build_object(
    'auth.users', public.community_grow_reset_table_count('auth.users'),
    'public.profiles', public.community_grow_reset_table_count('public.profiles'),
    'public.public_member_profiles', public.community_grow_reset_table_count('public.public_member_profiles'),
    'public.user_notification_preferences', public.community_grow_reset_table_count('public.user_notification_preferences'),
    'public.grow_sessions', public.community_grow_reset_table_count('public.grow_sessions'),
    'public.seed_vault_entries', public.community_grow_reset_table_count('public.seed_vault_entries')
  );

  if protected_before <> protected_after then
    raise exception 'Protected data counts changed during Community Grow reset. Rolling back.'
      using errcode = 'P0001',
      detail = jsonb_build_object(
        'before', protected_before,
        'after', protected_after
      )::text;
  end if;

  if to_regclass('public.grow_gallery_snapshots') is not null then
    select count(*)::integer
    into remaining_snapshots
    from public.grow_gallery_snapshots
    where coalesce(is_mock, false) = false;

    select count(*)::integer
    into remaining_pending
    from public.grow_gallery_snapshots
    where coalesce(is_mock, false) = false
      and lower(coalesce(status, '')) = 'pending_review';

    select count(*)::integer
    into remaining_published
    from public.grow_gallery_snapshots
    where coalesce(is_mock, false) = false
      and coalesce(is_published, false) = true;
  end if;

  return jsonb_build_object(
    'mode', 'executed',
    'dryRunBeforeExecution', preview_before,
    'deleted', jsonb_build_object(
      'grow_gallery_snapshot_likes', deleted_likes,
      'community_activity', deleted_activity,
      'grow_gallery_snapshots', deleted_snapshots,
      'recognition_records', 0,
      'discovery_records', 0
    ),
    'protectedCountsBefore', protected_before,
    'protectedCountsAfter', protected_after,
    'remaining', jsonb_build_object(
      'grow_gallery_snapshots', remaining_snapshots,
      'pending_review', remaining_pending,
      'published', remaining_published
    ),
    'resubmissionEligibility', jsonb_build_object(
      'uniqueSessionPublicationRowsRemoved', true,
      'sessionsRemainCompleted', true,
      'snapshotBlockingRowsRemaining', remaining_snapshots
    )
  );
end;
$$;

revoke all on function public.admin_execute_community_grow_publication_reset() from public, anon, authenticated;
grant execute on function public.admin_execute_community_grow_publication_reset() to service_role;
