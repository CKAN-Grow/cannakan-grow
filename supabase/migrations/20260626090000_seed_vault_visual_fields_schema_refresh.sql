-- Refresh the Seed Vault visual-field REST contract.
-- These columns are optional user override fields only; the app also sanitizes writes
-- so resolved Grow Library logos/images are not required for favorite/archive updates.

alter table public.seed_vault_entries
  add column if not exists source_logo_url text,
  add column if not exists variety_image_url text,
  add column if not exists thumbnail_url text;

comment on column public.seed_vault_entries.source_logo_url is
  'Optional user-uploaded source logo override for this owner''s Seed Vault display.';

comment on column public.seed_vault_entries.variety_image_url is
  'Optional user-uploaded variety image override for a Seed Vault entry.';

comment on column public.seed_vault_entries.thumbnail_url is
  'Optional legacy/user-selected thumbnail override for a Seed Vault entry.';

notify pgrst, 'reload schema';
