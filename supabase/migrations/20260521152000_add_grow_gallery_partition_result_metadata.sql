-- Store compact partition-level result metadata for Community Grow snapshots.
-- This is additive and does not change approval, moderation, or session lifecycle behavior.
alter table public.grow_gallery_snapshots
  add column if not exists partition_results jsonb not null default '[]'::jsonb,
  add column if not exists result_summary jsonb not null default '{}'::jsonb;

comment on column public.grow_gallery_snapshots.partition_results is
  'Compact per-partition germination metadata captured at snapshot submission time.';

comment on column public.grow_gallery_snapshots.result_summary is
  'Overall and grouped snapshot result metadata for future Community Grow display surfaces.';
