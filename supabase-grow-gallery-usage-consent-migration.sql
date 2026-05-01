-- Snapshot promotional-use consent for Community Grow submissions.
-- Apply this migration in Supabase before relying on stored snapshot usage consent.

alter table public.grow_gallery_snapshots
  add column if not exists usage_consent boolean not null default false;
