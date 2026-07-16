-- Additive Community GIE contract extension for public Source Report coverage,
-- canonical recent activity, and chart-ready germination distribution. Eligibility, ranking, confidence, evidence
-- exclusions, and public/private boundaries are inherited unchanged.

create or replace function public.get_gie_normalize_public_country_v1(
  p_country_code text,
  p_region text
)
returns table (country_code text, country_label text, map_x numeric, map_y numeric)
language sql
immutable
set search_path = public
as $$
  with normalized as (
    select upper(regexp_replace(btrim(coalesce(p_country_code, '')), '[^A-Za-z]', '', 'g')) as code,
      lower(regexp_replace(btrim(coalesce(p_region, '')), '[^a-zA-Z]+', ' ', 'g')) as region
  ), resolved as (
    select case
      when code in ('US', 'USA') or region in ('america', 'usa', 'us', 'united states', 'united states of america') then 'US'
      when code in ('CA', 'CAN') or region = 'canada' then 'CA'
      when code in ('DE', 'DEU') or region in ('germany', 'deutschland') then 'DE'
      when code in ('AT', 'AUT') or region in ('austria', 'osterreich') then 'AT'
      when code in ('CH', 'CHE') or region = 'switzerland' then 'CH'
      when code in ('GB', 'GBR', 'UK') or region in ('united kingdom', 'great britain', 'england', 'scotland', 'wales') then 'GB'
      when code in ('IE', 'IRL') or region = 'ireland' then 'IE'
      when code in ('FR', 'FRA') or region = 'france' then 'FR'
      when code in ('ES', 'ESP') or region = 'spain' then 'ES'
      when code in ('IT', 'ITA') or region = 'italy' then 'IT'
      when code in ('NL', 'NLD') or region in ('netherlands', 'holland') then 'NL'
      when code in ('BE', 'BEL') or region = 'belgium' then 'BE'
      when code in ('AU', 'AUS') or region = 'australia' then 'AU'
      when code in ('NZ', 'NZL') or region = 'new zealand' then 'NZ'
      when code in ('MX', 'MEX') or region = 'mexico' then 'MX'
      when code in ('BR', 'BRA') or region = 'brazil' then 'BR'
      when code in ('CO', 'COL') or region = 'colombia' then 'CO'
      else null
    end as code from normalized
  )
  select resolved.code,
    case resolved.code
      when 'US' then 'United States' when 'CA' then 'Canada' when 'DE' then 'Germany'
      when 'AT' then 'Austria' when 'CH' then 'Switzerland' when 'GB' then 'United Kingdom'
      when 'IE' then 'Ireland' when 'FR' then 'France' when 'ES' then 'Spain'
      when 'IT' then 'Italy' when 'NL' then 'Netherlands' when 'BE' then 'Belgium'
      when 'AU' then 'Australia' when 'NZ' then 'New Zealand' when 'MX' then 'Mexico'
      when 'BR' then 'Brazil' when 'CO' then 'Colombia' end,
    case resolved.code
      when 'US' then 23 when 'CA' then 21 when 'DE' then 52 when 'AT' then 53
      when 'CH' then 51 when 'GB' then 48 when 'IE' then 46 when 'FR' then 49
      when 'ES' then 47 when 'IT' then 52 when 'NL' then 50 when 'BE' then 50
      when 'AU' then 84 when 'NZ' then 94 when 'MX' then 21 when 'BR' then 36
      when 'CO' then 29 end::numeric,
    case resolved.code
      when 'US' then 38 when 'CA' then 28 when 'DE' then 31 when 'AT' then 33
      when 'CH' then 33 when 'GB' then 29 when 'IE' then 29 when 'FR' then 33
      when 'ES' then 37 when 'IT' then 36 when 'NL' then 30 when 'BE' then 31
      when 'AU' then 72 when 'NZ' then 79 when 'MX' then 48 when 'BR' then 65
      when 'CO' then 57 end::numeric
  from resolved where resolved.code is not null;
$$;

create or replace function public.get_gie_normalize_public_us_region_v1(p_region text)
returns table (region_code text, region_label text, map_x numeric, map_y numeric)
language sql
immutable
set search_path = public
as $$
  with normalized as (
    select upper(regexp_replace(btrim(coalesce(p_region, '')), '[^A-Za-z]', '', 'g')) as compact
  ), regions(code, label, x, y) as (values
    ('AL','Alabama',25,42),('AK','Alaska',10,31),('AZ','Arizona',20,43),('AR','Arkansas',24,41),
    ('CA','California',18,40),('CO','Colorado',22,38),('CT','Connecticut',29,34),('DE','Delaware',28,37),
    ('FL','Florida',27,47),('GA','Georgia',27,43),('HI','Hawaii',13,51),('ID','Idaho',20,34),
    ('IL','Illinois',25,36),('IN','Indiana',26,36),('IA','Iowa',24,35),('KS','Kansas',23,38),
    ('KY','Kentucky',26,39),('LA','Louisiana',24,45),('ME','Maine',30,30),('MD','Maryland',28,37),
    ('MA','Massachusetts',29,33),('MI','Michigan',26,32),('MN','Minnesota',24,31),('MS','Mississippi',25,43),
    ('MO','Missouri',24,38),('MT','Montana',21,30),('NE','Nebraska',23,36),('NV','Nevada',19,38),
    ('NH','New Hampshire',29,32),('NJ','New Jersey',29,36),('NM','New Mexico',21,43),('NY','New York',28,33),
    ('NC','North Carolina',28,40),('ND','North Dakota',23,30),('OH','Ohio',27,35),('OK','Oklahoma',23,41),
    ('OR','Oregon',18,33),('PA','Pennsylvania',28,35),('RI','Rhode Island',29,34),('SC','South Carolina',28,42),
    ('SD','South Dakota',23,33),('TN','Tennessee',26,40),('TX','Texas',22,45),('UT','Utah',20,39),
    ('VT','Vermont',29,31),('VA','Virginia',28,39),('WA','Washington',18,30),('WV','West Virginia',27,38),
    ('WI','Wisconsin',25,33),('WY','Wyoming',21,35)
  )
  select regions.code, regions.label, regions.x::numeric, regions.y::numeric
  from regions cross join normalized
  where normalized.compact = regions.code
    or normalized.compact = upper(regexp_replace(regions.label, '[^A-Za-z]', '', 'g'));
$$;

create or replace function public.get_gie_community_source_evidence_rows_v1()
returns table (
  evidence_id text, contributor_id uuid, published_at timestamptz,
  source_key text, source_name text, variety_name text,
  seed_count integer, germinated_count integer
)
language sql
stable
security definer
set search_path = public
as $$
  with evidence as (
    select item.id::text as evidence_id, item.user_id as contributor_id,
      coalesce(item.published_at, item.created_at) as published_at,
      case
        when jsonb_typeof(coalesce(item.partition_results, '[]'::jsonb)) = 'array'
          and jsonb_array_length(coalesce(item.partition_results, '[]'::jsonb)) > 0
          then item.partition_results
        else jsonb_build_array(jsonb_build_object(
          'seedCount', greatest(0, coalesce(item.total_seeds, 0)),
          'germinatedCount', least(greatest(0, coalesce(item.total_seeds, 0)), greatest(0, round(greatest(0, coalesce(item.total_seeds, 0))::numeric * greatest(0, least(100, coalesce(item.success_percent, 0))) / 100)::integer)),
          'seedVariety', coalesce(item.seed_variety_name, ''),
          'sourceCanonicalId', coalesce(item.source_id::text, ''),
          'sourceName', coalesce(item.source_name, '')
        )) end as result_rows
    from public.get_gie_community_evidence_v1() item
  ), parsed as (
    select evidence.*, row_data.*
    from evidence
    cross join lateral jsonb_array_elements(evidence.result_rows) result_row
    cross join lateral public.get_gie_canonical_result_row_v1(result_row) row_data
  )
  select parsed.evidence_id, parsed.contributor_id, parsed.published_at,
    coalesce(parsed.source_canonical_id, nullif(trim(regexp_replace(lower(coalesce(parsed.source_name, '')), '[^a-z0-9]+', ' ', 'g')), '')),
    parsed.source_name, parsed.variety_name,
    coalesce(parsed.seed_count, 0), least(coalesce(parsed.seed_count, 0), coalesce(parsed.germinated_count, 0))
  from parsed
  where coalesce(parsed.seed_count, 0) > 0
    and coalesce(parsed.germinated_count, 0) between 0 and parsed.seed_count
    and coalesce(parsed.source_canonical_id, nullif(trim(regexp_replace(lower(coalesce(parsed.source_name, '')), '[^a-z0-9]+', ' ', 'g')), '')) is not null;
$$;

create or replace function public.get_gie_community_source_coverage_v1()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with located as (
    select rows.*, country.country_code, country.country_label,
      region.region_code, region.region_label,
      coalesce(region.map_x, country.map_x) as map_x,
      coalesce(region.map_y, country.map_y) as map_y
    from public.get_gie_community_source_evidence_rows_v1() rows
    inner join public.safe_public_member_profiles profile on profile.user_id = rows.contributor_id
    cross join lateral public.get_gie_normalize_public_country_v1(profile.country_code, profile.location_region) country
    left join lateral public.get_gie_normalize_public_us_region_v1(profile.location_region) region
      on country.country_code = 'US'
  ), regional as (
    select source_key, country_code, country_label, region_code, region_label, map_x, map_y,
      count(distinct evidence_id)::integer as session_count,
      sum(seed_count)::integer as seeds_tested,
      count(distinct contributor_id)::integer as contributor_count
    from located
    group by source_key, country_code, country_label, region_code, region_label, map_x, map_y
  ), source_totals as (
    select source_key, count(*)::integer as region_count,
      sum(session_count)::integer as session_count,
      sum(seeds_tested)::integer as seeds_tested,
      count(distinct country_code)::integer as country_count
    from regional group by source_key
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'source_key', totals.source_key,
    'state', case when totals.region_count = 1 then 'sparse' else 'mature' end,
    'session_count', totals.session_count,
    'seeds_tested', totals.seeds_tested,
    'country_count', totals.country_count,
    'regions', coalesce((select jsonb_agg(jsonb_build_object(
      'country_code', item.country_code, 'country_label', item.country_label,
      'region_code', item.region_code, 'region_label', item.region_label,
      'session_count', item.session_count, 'seeds_tested', item.seeds_tested,
      'contributor_count', item.contributor_count, 'map_x', item.map_x, 'map_y', item.map_y
    ) order by item.session_count desc, item.country_label, item.region_label nulls last)
      from regional item where item.source_key = totals.source_key), '[]'::jsonb)
  ) order by totals.source_key), '[]'::jsonb)
  from source_totals totals;
$$;

create or replace function public.get_gie_community_source_activity_v1()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with events as (
    select source_key, evidence_id, max(published_at) as published_at,
      sum(seed_count)::integer as seeds_tested,
      sum(germinated_count)::integer as seeds_germinated,
      array_remove(array_agg(distinct nullif(btrim(variety_name), '')), null) as varieties
    from public.get_gie_community_source_evidence_rows_v1()
    group by source_key, evidence_id
  ), sources as (select distinct source_key from events)
  select coalesce(jsonb_agg(jsonb_build_object(
    'source_key', sources.source_key,
    'events', coalesce((select jsonb_agg(jsonb_build_object(
      'evidence_id', item.evidence_id, 'published_at', item.published_at,
      'seeds_tested', item.seeds_tested, 'seeds_germinated', item.seeds_germinated,
      'germination_rate', case when item.seeds_tested > 0 then round(item.seeds_germinated::numeric * 100 / item.seeds_tested)::integer else null end,
      'variety_label', case when cardinality(item.varieties) = 1 then item.varieties[1] else null end
    ) order by item.published_at desc, item.evidence_id)
      from events item where item.source_key = sources.source_key), '[]'::jsonb)
  ) order by sources.source_key), '[]'::jsonb) from sources;
$$;

create or replace function public.get_gie_community_source_distribution_v1()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with events as (
    select source_key, evidence_id,
      sum(seed_count)::integer as seeds_tested,
      sum(germinated_count)::integer as seeds_germinated
    from public.get_gie_community_source_evidence_rows_v1()
    group by source_key, evidence_id
  ), classified as (
    select events.*,
      case
        when round(seeds_germinated::numeric * 100 / nullif(seeds_tested, 0)) >= 96 then '96_100'
        when round(seeds_germinated::numeric * 100 / nullif(seeds_tested, 0)) >= 91 then '91_95'
        when round(seeds_germinated::numeric * 100 / nullif(seeds_tested, 0)) >= 86 then '86_90'
        else 'below_85'
      end as bucket_key
    from events where seeds_tested > 0
  ), definitions(ordinality, bucket_key, label) as (values
    (1, '96_100', '96–100%'),
    (2, '91_95', '91–95%'),
    (3, '86_90', '86–90%'),
    (4, 'below_85', 'Below 85%')
  ), sources as (
    select distinct source_key from classified
  ), bucket_totals as (
    select sources.source_key, definitions.ordinality, definitions.bucket_key, definitions.label,
      count(distinct classified.evidence_id)::integer as session_count,
      coalesce(sum(classified.seeds_tested), 0)::integer as seeds_tested
    from sources cross join definitions
    left join classified on classified.source_key = sources.source_key
      and classified.bucket_key = definitions.bucket_key
    group by sources.source_key, definitions.ordinality, definitions.bucket_key, definitions.label
  ), chart_rows as (
    select bucket_totals.*,
      sum(seeds_tested) over (partition by source_key)::integer as total_seeds,
      case when sum(seeds_tested) over (partition by source_key) > 0
        then round(seeds_tested::numeric * 100 / sum(seeds_tested) over (partition by source_key), 1)
        else 0 end as share_percent,
      case when sum(seeds_tested) over (partition by source_key) > 0
        then round(coalesce(sum(seeds_tested) over (partition by source_key order by ordinality rows between unbounded preceding and 1 preceding), 0)::numeric * 100 / sum(seeds_tested) over (partition by source_key), 4)
        else 0 end as start_percent,
      case when sum(seeds_tested) over (partition by source_key) > 0
        then round(sum(seeds_tested) over (partition by source_key order by ordinality rows between unbounded preceding and current row)::numeric * 100 / sum(seeds_tested) over (partition by source_key), 4)
        else 0 end as end_percent
    from bucket_totals
  ), source_distributions as (
    select source_key, max(total_seeds)::integer as total_seeds,
      jsonb_agg(jsonb_build_object(
      'key', bucket_key, 'label', label, 'session_count', session_count,
      'seeds_tested', seeds_tested, 'share_percent', share_percent,
      'start_percent', start_percent, 'end_percent', end_percent
      ) order by ordinality) as buckets
    from chart_rows group by source_key
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'source_key', source_key, 'total_seeds', total_seeds, 'buckets', buckets
  ) order by source_key), '[]'::jsonb)
  from source_distributions;
$$;

revoke all on function public.get_gie_normalize_public_country_v1(text, text) from public, anon, authenticated;
revoke all on function public.get_gie_normalize_public_us_region_v1(text) from public, anon, authenticated;
revoke all on function public.get_gie_community_source_evidence_rows_v1() from public, anon, authenticated;
revoke all on function public.get_gie_community_source_coverage_v1() from public, anon, authenticated;
revoke all on function public.get_gie_community_source_activity_v1() from public, anon, authenticated;
revoke all on function public.get_gie_community_source_distribution_v1() from public, anon, authenticated;

create or replace function public.get_gie_community_analytics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  base jsonb := public.get_gie_community_analytics_rank_display_v1();
  analytics jsonb := base -> 'analytics';
  coverage jsonb := public.get_gie_community_source_coverage_v1();
  activity jsonb := public.get_gie_community_source_activity_v1();
  distribution jsonb := public.get_gie_community_source_distribution_v1();
  reports jsonb;
begin
  select coalesce(jsonb_agg(report.value || jsonb_build_object(
    'regional_coverage', coalesce((select item from jsonb_array_elements(coverage) item where item ->> 'source_key' = report.value ->> 'key' limit 1),
      jsonb_build_object('source_key', report.value ->> 'key', 'state', 'empty', 'session_count', 0, 'seeds_tested', 0, 'country_count', 0, 'regions', '[]'::jsonb)),
    'recent_activity', coalesce((select item -> 'events' from jsonb_array_elements(activity) item where item ->> 'source_key' = report.value ->> 'key' limit 1), '[]'::jsonb),
    'germination_distribution', coalesce((select item from jsonb_array_elements(distribution) item where item ->> 'source_key' = report.value ->> 'key' limit 1),
      jsonb_build_object('source_key', report.value ->> 'key', 'total_seeds', 0, 'buckets', '[]'::jsonb))
  ) order by report.ordinality), '[]'::jsonb)
  into reports
  from jsonb_array_elements(coalesce(analytics -> 'source_reports', '[]'::jsonb)) with ordinality report(value, ordinality);

  analytics := jsonb_set(analytics, '{source_reports}', reports)
    || jsonb_build_object('source_regional_coverage', coverage);

  return base || jsonb_build_object(
    'contract_version', 'gie-community.v1.2',
    'schema_version', '2026-07-15.2',
    'analytics', analytics
  );
end;
$$;

revoke all on function public.get_gie_community_analytics() from public;
grant execute on function public.get_gie_community_analytics() to anon, authenticated;

do $$
begin
  if (select country_code from public.get_gie_normalize_public_country_v1('USA', '')) <> 'US' then raise exception 'GIE coverage country alias: USA'; end if;
  if (select country_label from public.get_gie_normalize_public_country_v1('DE', '')) <> 'Germany' then raise exception 'GIE coverage country alias: DE'; end if;
  if (select region_label from public.get_gie_normalize_public_us_region_v1('MA')) <> 'Massachusetts' then raise exception 'GIE coverage region alias: MA'; end if;
  if (select region_code from public.get_gie_normalize_public_us_region_v1('California')) <> 'CA' then raise exception 'GIE coverage region alias: California'; end if;
end;
$$;

comment on function public.get_gie_community_source_coverage_v1() is
  'Privacy-safe regional aggregates from canonical approved Community evidence joined to visible safe public profile country/region fields.';

comment on function public.get_gie_community_source_distribution_v1() is
  'Canonical source-level seed distribution across germination-rate buckets, derived from eligible approved Community evidence events.';
comment on function public.get_gie_community_analytics() is
  'Canonical gie-community.v1.2 contract; adds Source Report regional coverage and canonical recent activity without changing eligibility, ranking, or confidence.';

notify pgrst, 'reload schema';
