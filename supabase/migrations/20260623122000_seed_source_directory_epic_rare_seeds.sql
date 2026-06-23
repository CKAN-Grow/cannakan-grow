-- Additional garden seed Source Directory additions.
-- Seed-only migration: preserves existing source rows and autocomplete behavior.

insert into public.source_directory (
  name,
  aliases,
  source_type,
  country,
  verified,
  active
)
values
  ('Baker Creek Heirloom Seeds', array['Rare Seeds', 'Baker Creek', 'Baker Creek Rare Seeds']::text[], 'garden_seed_company', 'US', true, true),
  ('Epic Gardening', array['Epic Gardening Seeds', 'Botanical Interests by Epic Gardening']::text[], 'garden_seed_company', 'US', true, true)
on conflict (normalized_name) do update
set
  aliases = (
    select coalesce(array_agg(alias_value order by alias_value), array[]::text[])
    from (
      select distinct btrim(alias_value) as alias_value
      from unnest(coalesce(public.source_directory.aliases, array[]::text[]) || coalesce(excluded.aliases, array[]::text[])) as alias_values(alias_value)
      where btrim(alias_value) <> ''
        and lower(btrim(alias_value)) <> public.source_directory.normalized_name
    ) deduped_aliases
  ),
  source_type = case
    when coalesce(public.source_directory.source_type, '') in ('', 'other') then excluded.source_type
    else public.source_directory.source_type
  end,
  country = coalesce(public.source_directory.country, excluded.country),
  verified = public.source_directory.verified or excluded.verified,
  active = public.source_directory.active,
  updated_at = now();

notify pgrst, 'reload schema';