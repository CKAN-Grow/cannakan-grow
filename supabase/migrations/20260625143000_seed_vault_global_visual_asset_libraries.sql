-- Add global visual asset fields for Seed Vault source and variety libraries.
-- User overrides remain on seed_vault_entries/local user maps; these directory values are the Grow Library defaults.

alter table public.source_directory
  add column if not exists source_logo_url text;

alter table public.variety_directory
  add column if not exists variety_image_url text;

comment on column public.source_directory.source_logo_url is
  'Grow Library source logo URL used as the global default when a user has not provided a Seed Vault source override.';

comment on column public.variety_directory.variety_image_url is
  'Grow Library variety image URL used as the global default when a user has not uploaded a Seed Vault entry image.';

update public.source_directory
set source_logo_url = source_assets.source_logo_url,
    updated_at = now()
from (
  values
    ('Seedsman', '/assets/images/sources/real/seedsman-logo.png'),
    ('Poppin Fire Genetics', '/assets/images/sources/real/poppin-fire-logo.svg'),
    ('Good Genetix', '/assets/images/sources/real/good-genetix-logo.svg'),
    ('Atlas Breeding Labs', '/assets/images/sources/real/atlas-breeding-labs-logo.svg'),
    ('Alpine Seed Works', '/assets/images/sources/real/alpine-seed-works-logo.svg')
) as source_assets(source_name, source_logo_url)
where public.source_directory.normalized_name = lower(regexp_replace(trim(source_assets.source_name), '\s+', ' ', 'g'));

insert into public.source_directory (
  name,
  aliases,
  source_type,
  country,
  verified,
  active,
  usage_count,
  source_logo_url
)
select
  source_assets.source_name,
  source_assets.aliases,
  source_assets.source_type,
  source_assets.country,
  true,
  true,
  0,
  source_assets.source_logo_url
from (
  values
    ('Atlas Breeding Labs', array['Atlas Breeding', 'Atlas Seeds']::text[], 'breeder', 'US', '/assets/images/sources/real/atlas-breeding-labs-logo.svg'),
    ('Alpine Seed Works', array['Alpine Seedworks', 'Alpine Seeds']::text[], 'breeder', 'US', '/assets/images/sources/real/alpine-seed-works-logo.svg')
) as source_assets(source_name, aliases, source_type, country, source_logo_url)
on conflict (normalized_name) do update
set
  aliases = (
    select array(
      select distinct alias_value
      from unnest(coalesce(public.source_directory.aliases, array[]::text[]) || coalesce(excluded.aliases, array[]::text[])) as alias_values(alias_value)
      where btrim(alias_value) <> ''
        and lower(btrim(alias_value)) <> public.source_directory.normalized_name
      order by alias_value
    )
  ),
  source_type = case
    when coalesce(public.source_directory.source_type, '') in ('', 'other') then excluded.source_type
    else public.source_directory.source_type
  end,
  country = coalesce(public.source_directory.country, excluded.country),
  verified = public.source_directory.verified or excluded.verified,
  active = public.source_directory.active,
  source_logo_url = coalesce(nullif(public.source_directory.source_logo_url, ''), excluded.source_logo_url),
  updated_at = now();

notify pgrst, 'reload schema';
