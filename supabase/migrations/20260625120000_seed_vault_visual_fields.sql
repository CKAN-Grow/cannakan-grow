-- Add optional visual fields for the premium Seed Vault collection layout.
-- These fields are nullable so existing Add/Edit flows and older clients keep working.

alter table public.seed_vault_entries
  add column if not exists thumbnail_url text,
  add column if not exists source_logo_url text;

comment on column public.seed_vault_entries.thumbnail_url is
  'Optional user-selected or curated image URL/data URL used as the visual thumbnail for a single Seed Vault entry.';

comment on column public.seed_vault_entries.source_logo_url is
  'Optional source logo URL/data URL resolved from known source branding or a user custom source logo for Seed Vault display.';