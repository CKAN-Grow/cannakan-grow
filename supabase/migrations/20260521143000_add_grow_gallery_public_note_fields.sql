-- Add explicit public Community Grow note fields without touching private session notes.
alter table public.grow_gallery_snapshots
  add column if not exists include_public_grow_note boolean not null default false,
  add column if not exists public_grow_note text;

comment on column public.grow_gallery_snapshots.include_public_grow_note is
  'Controls whether the public Community Grow note should be shown with a snapshot.';

comment on column public.grow_gallery_snapshots.public_grow_note is
  'Optional public note for Community Grow snapshots. Private session notes remain on grow_sessions.session_notes.';
