-- Garden seed company Source Directory additions.
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
  ('MIgardener', array['MI Gardener', 'MIgardener Seeds']::text[], 'garden_seed_company', 'US', true, true),
  ('Baker Creek Heirloom Seeds', array['Baker Creek', 'Rare Seeds']::text[], 'garden_seed_company', 'US', true, true),
  ('Johnny''s Selected Seeds', array['Johnnys Selected Seeds', 'Johnny''s Seeds', 'Johnnys Seeds']::text[], 'garden_seed_company', 'US', true, true),
  ('Burpee', array['W. Atlee Burpee', 'Burpee Seeds']::text[], 'garden_seed_company', 'US', true, true),
  ('Seed Savers Exchange', array['Seed Savers']::text[], 'garden_seed_company', 'US', true, true),
  ('Botanical Interests', array['Botanical Interests Seeds']::text[], 'garden_seed_company', 'US', true, true),
  ('Territorial Seed Company', array['Territorial Seed', 'Territorial Seeds']::text[], 'garden_seed_company', 'US', true, true),
  ('High Mowing Organic Seeds', array['High Mowing Seeds', 'High Mowing']::text[], 'garden_seed_company', 'US', true, true),
  ('Southern Exposure Seed Exchange', array['Southern Exposure Seeds', 'SESE']::text[], 'garden_seed_company', 'US', true, true),
  ('Park Seed', array['Park Seeds']::text[], 'garden_seed_company', 'US', true, true),
  ('Ferry-Morse', array['Ferry Morse', 'Ferry-Morse Seeds', 'Ferry Morse Seeds']::text[], 'garden_seed_company', 'US', true, true),
  ('Eden Brothers', array['Eden Brothers Seeds']::text[], 'garden_seed_company', 'US', true, true),
  ('Renee''s Garden', array['Renees Garden', 'Renee''s Garden Seeds', 'Renees Garden Seeds']::text[], 'garden_seed_company', 'US', true, true),
  ('True Leaf Market', array['True Leaf Seeds']::text[], 'garden_seed_company', 'US', true, true),
  ('Victory Seeds', array['Victory Seed Company']::text[], 'garden_seed_company', 'US', true, true),
  ('Kitazawa Seed Company', array['Kitazawa Seeds', 'Kitazawa']::text[], 'garden_seed_company', 'US', true, true),
  ('Adaptive Seeds', array['Adaptive Seed']::text[], 'garden_seed_company', 'US', true, true),
  ('Fedco Seeds', array['Fedco']::text[], 'garden_seed_company', 'US', true, true)
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
  country = coalesce(public.source_directory.country, excluded.country),
  verified = public.source_directory.verified or excluded.verified,
  active = public.source_directory.active,
  updated_at = now();

notify pgrst, 'reload schema';