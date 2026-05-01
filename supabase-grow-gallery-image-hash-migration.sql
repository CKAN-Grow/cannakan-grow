alter table public.grow_gallery_snapshots
  add column if not exists image_hash text;

create index if not exists grow_gallery_snapshots_image_hash_idx
  on public.grow_gallery_snapshots(image_hash);

create or replace function public.find_duplicate_grow_gallery_snapshot_by_hash(candidate_hash text, candidate_session_id uuid default null)
returns table (
  id uuid,
  status text,
  session_id uuid
)
language sql
security definer
set search_path = public
as $$
  select
    grow_gallery_snapshots.id,
    grow_gallery_snapshots.status,
    grow_gallery_snapshots.session_id
  from public.grow_gallery_snapshots
  where coalesce(candidate_hash, '') <> ''
    and grow_gallery_snapshots.image_hash = candidate_hash
    and grow_gallery_snapshots.status in ('pending_review', 'approved')
    and (
      candidate_session_id is null
      or grow_gallery_snapshots.session_id is distinct from candidate_session_id
    )
  order by grow_gallery_snapshots.created_at desc
  limit 1;
$$;

revoke all on function public.find_duplicate_grow_gallery_snapshot_by_hash(text, uuid) from public;
grant execute on function public.find_duplicate_grow_gallery_snapshot_by_hash(text, uuid) to authenticated;
