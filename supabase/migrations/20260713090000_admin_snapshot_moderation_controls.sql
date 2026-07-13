-- Admin-only moderation controls for published Community Grow snapshots.
-- These functions only affect the snapshot/community publication records. They
-- intentionally do not update grow_sessions, session result data, vault records,
-- notes, or user profile data.

create or replace function public.admin_moderate_grow_gallery_snapshot(
  p_snapshot_id uuid,
  p_moderation_action text
)
returns public.grow_gallery_snapshots
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_action text := lower(trim(coalesce(p_moderation_action, '')));
  updated_snapshot public.grow_gallery_snapshots%rowtype;
begin
  if not exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  ) then
    raise exception 'Admin access required'
      using errcode = '42501';
  end if;

  if normalized_action not in ('hide', 'restore') then
    raise exception 'Invalid moderation action'
      using errcode = '22023';
  end if;

  if normalized_action = 'hide' then
    update public.grow_gallery_snapshots
    set
      status = 'hidden',
      is_published = false,
      updated_at = timezone('utc'::text, now())
    where id = p_snapshot_id
    returning * into updated_snapshot;

    if not found then
      raise exception 'Snapshot not found'
        using errcode = 'P0002';
    end if;

    if to_regclass('public.community_activity') is not null then
      delete from public.community_activity
      where snapshot_id = p_snapshot_id::text;
    end if;
  else
    update public.grow_gallery_snapshots
    set
      status = 'approved',
      is_published = true,
      published_at = coalesce(published_at, timezone('utc'::text, now())),
      updated_at = timezone('utc'::text, now())
    where id = p_snapshot_id
    returning * into updated_snapshot;

    if not found then
      raise exception 'Snapshot not found'
        using errcode = 'P0002';
    end if;
  end if;

  return updated_snapshot;
end;
$$;

revoke all on function public.admin_moderate_grow_gallery_snapshot(uuid, text) from public;
grant execute on function public.admin_moderate_grow_gallery_snapshot(uuid, text) to authenticated;

create or replace function public.admin_delete_grow_gallery_snapshot(
  p_snapshot_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_snapshot public.grow_gallery_snapshots%rowtype;
begin
  if not exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  ) then
    raise exception 'Admin access required'
      using errcode = '42501';
  end if;

  if to_regclass('public.grow_gallery_snapshot_likes') is not null then
    delete from public.grow_gallery_snapshot_likes
    where snapshot_id = p_snapshot_id;
  end if;

  if to_regclass('public.community_activity') is not null then
    delete from public.community_activity
    where snapshot_id = p_snapshot_id::text;
  end if;

  delete from public.grow_gallery_snapshots
  where id = p_snapshot_id
  returning * into deleted_snapshot;

  if not found then
    raise exception 'Snapshot not found'
      using errcode = 'P0002';
  end if;

  return jsonb_build_object(
    'deleted_snapshot_id', deleted_snapshot.id,
    'session_id', deleted_snapshot.session_id,
    'image_path', coalesce(deleted_snapshot.snapshot_image_path, ''),
    'status', deleted_snapshot.status
  );
end;
$$;

revoke all on function public.admin_delete_grow_gallery_snapshot(uuid) from public;
grant execute on function public.admin_delete_grow_gallery_snapshot(uuid) to authenticated;
