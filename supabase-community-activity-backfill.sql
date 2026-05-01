create or replace function public.backfill_community_activity_snapshot_posts()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer := 0;
begin
  insert into public.community_activity (
    user_id,
    activity_type,
    session_id,
    snapshot_id,
    title,
    summary,
    metadata,
    visibility,
    created_at
  )
  select
    grow_gallery_snapshots.user_id,
    'snapshot_posted',
    coalesce(grow_gallery_snapshots.session_id::text, ''),
    grow_gallery_snapshots.id::text,
    coalesce(nullif(btrim(grow_gallery_snapshots.snapshot_title), ''), 'Grow Snapshot'),
    'Approved public Community Grow snapshot.',
    jsonb_build_object(
      'activityTypeLabel', 'New approved Community Grow snapshot',
      'germinationRate', greatest(0, coalesce(grow_gallery_snapshots.success_percent, 0)),
      'germinationRateLabel', concat(greatest(0, coalesce(grow_gallery_snapshots.success_percent, 0))::text, '%'),
      'sourceLabel', coalesce(nullif(btrim(grow_gallery_snapshots.source_name), ''), 'Not shared'),
      'sessionDateLabel', coalesce(
        to_char(grow_gallery_snapshots.session_date::timestamp, 'Mon FMDD, YYYY'),
        to_char(coalesce(grow_gallery_snapshots.published_at, grow_gallery_snapshots.created_at), 'Mon FMDD, YYYY')
      ),
      'systemLabel', case
        when upper(coalesce(grow_gallery_snapshots.system_type, 'KAN')) = 'TRA' then 'TRā™'
        else 'KAN®'
      end
    ),
    'public',
    coalesce(grow_gallery_snapshots.published_at, grow_gallery_snapshots.created_at, timezone('utc', now()))
  from public.grow_gallery_snapshots
  where grow_gallery_snapshots.status = 'approved'
    and coalesce(grow_gallery_snapshots.is_published, false) = true
    and not exists (
      select 1
      from public.community_activity
      where community_activity.snapshot_id = grow_gallery_snapshots.id::text
        and lower(coalesce(community_activity.activity_type, '')) in ('snapshot_posted', 'snapshot_approved')
    );

  get diagnostics inserted_count = row_count;
  return coalesce(inserted_count, 0);
end;
$$;

revoke all on function public.backfill_community_activity_snapshot_posts() from public;

select public.backfill_community_activity_snapshot_posts();
