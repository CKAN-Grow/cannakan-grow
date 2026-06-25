-- Repair the Seed Vault visual field REST contract.
-- All fields are nullable so existing Vault entries remain untouched and older clients keep working.

alter table public.seed_vault_entries
  add column if not exists source_logo_url text,
  add column if not exists variety_image_url text,
  add column if not exists thumbnail_url text;

comment on column public.seed_vault_entries.source_logo_url is
  'Optional source logo URL/data URL resolved from known source branding or a user custom source logo for Seed Vault display.';

comment on column public.seed_vault_entries.variety_image_url is
  'Optional user-selected image URL/data URL used as the primary variety photo for a single Seed Vault entry.';

comment on column public.seed_vault_entries.thumbnail_url is
  'Optional legacy/user-selected image URL/data URL used as the visual thumbnail for a single Seed Vault entry.';

notify pgrst, 'reload schema';
