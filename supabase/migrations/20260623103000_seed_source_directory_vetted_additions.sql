-- Vetted Source Directory additions.
-- Idempotent: add names not already present by normalized_name and normalize vetted display casing.

insert into public.source_directory (
  name,
  aliases,
  source_type,
  country,
  verified,
  active
)
values
  ('Kid Frost', array[]::text[], 'breeder', null, true, true),
  ('Beleaf', array[]::text[], 'breeder', null, true, true),
  ('Wolfpack Selections', array[]::text[], 'breeder', null, true, true),
  ('Love In Her Eyes', array[]::text[], 'breeder', null, true, true),
  ('Terp Fi3nd', array[]::text[], 'breeder', null, true, true),
  ('Shwale', array[]::text[], 'breeder', null, true, true),
  ('Farmhouse Studio Genetics', array[]::text[], 'breeder', null, true, true),
  ('Rocbud Inc', array[]::text[], 'breeder', null, true, true),
  ('Cult Classic Seeds', array[]::text[], 'breeder', null, true, true),
  ('Elev8 Seeds', array[]::text[], 'breeder', null, true, true),
  ('SinCity Seeds', array[]::text[], 'breeder', null, true, true),
  ('OG Raskal Genetics', array[]::text[], 'breeder', null, true, true),
  ('808 Genetics', array[]::text[], 'breeder', null, true, true),
  ('Crickets and Cicada Seeds', array[]::text[], 'breeder', null, true, true),
  ('Hoku Seed Co.', array[]::text[], 'breeder', null, true, true),
  ('High & Lonesome Seeds', array[]::text[], 'breeder', null, true, true),
  ('Mendocino Preserve', array[]::text[], 'breeder', null, true, true),
  ('Sunken Treasure Seeds', array[]::text[], 'breeder', null, true, true),
  ('Purple Caper Seeds', array[]::text[], 'breeder', null, true, true),
  ('Heavyweight Seeds', array[]::text[], 'breeder', null, true, true),
  ('Colorado Seed Inc.', array[]::text[], 'breeder', null, true, true),
  ('Green Bodhi', array[]::text[], 'breeder', null, true, true),
  ('707 Seedbank', array[]::text[], 'seed_bank', null, true, true),
  ('Genehtik Seeds', array[]::text[], 'breeder', null, true, true),
  ('Medical Seeds Co.', array[]::text[], 'breeder', null, true, true),
  ('Black Tuna Seeds', array[]::text[], 'breeder', null, true, true),
  ('Positronics', array[]::text[], 'breeder', null, true, true),
  ('Kannabia', array[]::text[], 'breeder', null, true, true)
on conflict (normalized_name) do nothing;

update public.source_directory
set
  name = 'Lit Farms',
  aliases = (
    select coalesce(array_agg(alias_value order by alias_value), array[]::text[])
    from (
      select distinct btrim(alias_value) as alias_value
      from unnest(coalesce(public.source_directory.aliases, array[]::text[]) || array['LIT Farms']) as alias_values(alias_value)
      where btrim(alias_value) <> ''
        and lower(btrim(alias_value)) <> 'lit farms'
    ) deduped_aliases
  )
where normalized_name = 'lit farms';

notify pgrst, 'reload schema';
