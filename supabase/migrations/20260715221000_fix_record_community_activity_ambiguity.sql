-- Repair the historically broken Community activity upsert without changing its signature.
-- The original ON CONFLICT target collided with the activity_type PL/pgSQL argument and
-- no matching unique constraint exists in the canonical schema. Serialize by logical key,
-- then update-or-insert explicitly. This preserves the intended idempotent side effect.

create or replace function public.record_community_activity(
  activity_user_id uuid,
  activity_type text,
  activity_session_id text default '',
  activity_snapshot_id text default '',
  activity_title text default '',
  activity_summary text default '',
  activity_metadata jsonb default '{}'::jsonb,
  activity_visibility text default 'public'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_activity_type text := lower(coalesce(activity_type, ''));
  normalized_session_id text := btrim(coalesce(activity_session_id, ''));
  normalized_snapshot_id text := btrim(coalesce(activity_snapshot_id, ''));
  normalized_session_uuid uuid;
  normalized_snapshot_uuid uuid;
  normalized_visibility text := case
    when lower(coalesce(activity_visibility, 'public')) = 'public' then 'public'
    else 'private'
  end;
  resulting_id uuid;
begin
  if activity_user_id is null or normalized_activity_type = '' then
    return null;
  end if;

  if auth.uid() is null
    or (activity_user_id <> auth.uid() and not public.current_user_is_admin()) then
    raise exception 'You can only record Community activity for your own account.' using errcode = '42501';
  end if;

  if normalized_session_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    normalized_session_uuid := normalized_session_id::uuid;
  end if;
  if normalized_snapshot_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    normalized_snapshot_uuid := normalized_snapshot_id::uuid;
  end if;
  if normalized_session_uuid is not null
    and not public.is_grow_session_analytics_eligible(normalized_session_uuid) then
    return null;
  end if;
  if normalized_snapshot_uuid is not null and exists (
    select 1 from public.grow_gallery_snapshots
    where grow_gallery_snapshots.id = normalized_snapshot_uuid
      and coalesce(grow_gallery_snapshots.analytics_excluded, false) = true
  ) then
    return null;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(concat_ws(
    E'\x1f', activity_user_id::text, normalized_activity_type,
    normalized_session_id, normalized_snapshot_id
  ), 0));

  select community_activity.id
  into resulting_id
  from public.community_activity
  where community_activity.user_id = activity_user_id
    and community_activity.activity_type = normalized_activity_type
    and community_activity.session_id = normalized_session_id
    and community_activity.snapshot_id = normalized_snapshot_id
  order by community_activity.created_at, community_activity.id
  limit 1;

  if resulting_id is null then
    insert into public.community_activity (
      user_id, activity_type, session_id, snapshot_id, title, summary, metadata, visibility
    ) values (
      activity_user_id, normalized_activity_type, normalized_session_id, normalized_snapshot_id,
      coalesce(activity_title, ''), coalesce(activity_summary, ''),
      coalesce(activity_metadata, '{}'::jsonb), normalized_visibility
    ) returning id into resulting_id;
  else
    update public.community_activity
    set title = coalesce(activity_title, ''),
        summary = coalesce(activity_summary, ''),
        metadata = coalesce(activity_metadata, '{}'::jsonb),
        visibility = normalized_visibility
    where community_activity.id = resulting_id;
  end if;

  return resulting_id;
end;
$$;

revoke all on function public.record_community_activity(uuid,text,text,text,text,text,jsonb,text) from public, anon;
grant execute on function public.record_community_activity(uuid,text,text,text,text,text,jsonb,text) to authenticated;

comment on function public.record_community_activity(uuid,text,text,text,text,text,jsonb,text) is
  'Records owner Community activity using a serialized logical-key update-or-insert. Cross-user writes require admin authorization.';
