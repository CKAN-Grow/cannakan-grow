-- Align My Seed Vault records with the session partition chart identity fields.
-- Additive only: preserves existing seed_name/seed_type data and does not touch
-- sessions, CSTP, Community Grow, timing, delete, or analytics tables.

alter table public.seed_vault_entries
  add column if not exists seed_variety text,
  add column if not exists seed_sex text;

update public.seed_vault_entries
set seed_variety = seed_name
where (seed_variety is null or btrim(seed_variety) = '')
  and seed_name is not null
  and btrim(seed_name) <> '';

comment on column public.seed_vault_entries.seed_variety is
  'Seed Variety alias for seed_name, aligned with session partition chart fields.';

comment on column public.seed_vault_entries.seed_sex is
  'Seed sex selection aligned with session partition chart values such as feminized, regular, or not-applicable.';

notify pgrst, 'reload schema';
