\set ON_ERROR_STOP on

begin;

insert into auth.users (id) values
  ('10000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000005');

insert into public.profiles (id, username, email, account_status) values
  ('10000000-0000-0000-0000-000000000001', 'coverage-ma', 'coverage-ma@example.test', 'active'),
  ('10000000-0000-0000-0000-000000000002', 'coverage-ca', 'coverage-ca@example.test', 'active'),
  ('10000000-0000-0000-0000-000000000003', 'coverage-de', 'coverage-de@example.test', 'active'),
  ('10000000-0000-0000-0000-000000000004', 'coverage-hidden', 'coverage-hidden@example.test', 'active'),
  ('10000000-0000-0000-0000-000000000005', 'coverage-unknown', 'coverage-unknown@example.test', 'active')
on conflict (id) do update set account_status = excluded.account_status;

insert into public.public_member_profiles (
  id, user_id, display_name, country_code, location_region,
  show_profile_in_community_grow, profile_visibility
) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Massachusetts Grower', 'US', 'MA', true, 'public'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'California Grower', 'US', 'California', true, 'public'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'German Grower', 'DE', 'Germany', true, 'public'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Hidden Grower', 'CA', 'Canada', false, 'private'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Unknown Location Grower', null, 'A private free-form place', true, 'public');

insert into public.sources (id, name) values
  ('30000000-0000-0000-0000-000000000001', 'Coverage Source'),
  ('30000000-0000-0000-0000-000000000002', 'Unknown Location Source');

insert into public.grow_gallery_snapshots (
  id, user_id, snapshot_title, snapshot_image_url, status, is_published,
  published_at, total_seeds, total_planted, success_percent, source_id,
  source_name, seed_variety_name, is_mock, analytics_excluded, partition_results
) values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Historical MA', 'https://example.test/1.jpg', 'approved', true, '2025-01-01T12:00:00Z', 10, 9, 90, '30000000-0000-0000-0000-000000000001', 'Coverage Source', 'Variety A', false, false, '[{"seedCount":10,"germinatedCount":9,"sourceCanonicalId":"30000000-0000-0000-0000-000000000001","sourceName":"Coverage Source","seedVariety":"Variety A"}]'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Recent MA', 'https://example.test/2.jpg', 'approved', true, '2026-07-10T12:00:00Z', 20, 18, 90, '30000000-0000-0000-0000-000000000001', 'Coverage Source', 'Variety A', false, false, '[{"seedCount":20,"germinatedCount":18,"sourceCanonicalId":"30000000-0000-0000-0000-000000000001","sourceName":"Coverage Source","seedVariety":"Variety A"}]'),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'California', 'https://example.test/3.jpg', 'approved', true, '2026-07-11T12:00:00Z', 30, 27, 90, '30000000-0000-0000-0000-000000000001', 'Coverage Source', 'Variety B', false, false, '[{"seedCount":30,"germinatedCount":27,"sourceCanonicalId":"30000000-0000-0000-0000-000000000001","sourceName":"Coverage Source","seedVariety":"Variety B"}]'),
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'Germany', 'https://example.test/4.jpg', 'approved', true, '2026-07-12T12:00:00Z', 40, 36, 90, '30000000-0000-0000-0000-000000000001', 'Coverage Source', 'Variety C', false, false, '[{"seedCount":40,"germinatedCount":36,"sourceCanonicalId":"30000000-0000-0000-0000-000000000001","sourceName":"Coverage Source","seedVariety":"Variety C"}]'),
  ('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', 'Private Profile', 'https://example.test/5.jpg', 'approved', true, '2026-07-13T12:00:00Z', 50, 45, 90, '30000000-0000-0000-0000-000000000001', 'Coverage Source', 'Variety D', false, false, '[{"seedCount":50,"germinatedCount":45,"sourceCanonicalId":"30000000-0000-0000-0000-000000000001","sourceName":"Coverage Source","seedVariety":"Variety D"}]'),
  ('40000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000005', 'Unknown Location', 'https://example.test/6.jpg', 'approved', true, '2026-07-14T12:00:00Z', 12, 11, 92, '30000000-0000-0000-0000-000000000002', 'Unknown Location Source', 'Variety E', false, false, '[{"seedCount":12,"germinatedCount":11,"sourceCanonicalId":"30000000-0000-0000-0000-000000000002","sourceName":"Unknown Location Source","seedVariety":"Variety E"}]'),
  ('40000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'Excluded', 'https://example.test/7.jpg', 'approved', true, '2026-07-15T12:00:00Z', 60, 54, 90, '30000000-0000-0000-0000-000000000001', 'Coverage Source', 'Excluded Variety', false, true, '[{"seedCount":60,"germinatedCount":54,"sourceCanonicalId":"30000000-0000-0000-0000-000000000001","sourceName":"Coverage Source","seedVariety":"Excluded Variety"}]');

do $$
declare
  coverage jsonb := public.get_gie_community_source_coverage_v1();
  activity jsonb := public.get_gie_community_source_activity_v1();
  distribution jsonb := public.get_gie_community_source_distribution_v1();
  contract jsonb := public.get_gie_community_analytics();
  source_coverage jsonb;
  unknown_report jsonb;
begin
  select item into source_coverage from jsonb_array_elements(coverage) item
    where item ->> 'source_key' = '30000000-0000-0000-0000-000000000001';

  if source_coverage ->> 'state' <> 'mature' then raise exception 'Expected mature multi-region coverage: %', source_coverage; end if;
  if (source_coverage ->> 'session_count')::integer <> 4 then raise exception 'Coverage must count four located canonical sessions: %', source_coverage; end if;
  if (source_coverage ->> 'seeds_tested')::integer <> 100 then raise exception 'Coverage seeds must exclude hidden and analytics-excluded evidence: %', source_coverage; end if;
  if (source_coverage ->> 'country_count')::integer <> 2 then raise exception 'Expected US and Germany only: %', source_coverage; end if;
  if jsonb_path_query_array(source_coverage, '$.regions[*] ? (@.region_code == "MA")') = '[]'::jsonb then raise exception 'MA alias was not normalized'; end if;
  if jsonb_path_query_array(source_coverage, '$.regions[*] ? (@.region_code == "CA")') = '[]'::jsonb then raise exception 'California alias was not normalized'; end if;
  if source_coverage::text ilike '%Hidden Grower%' or source_coverage::text ilike '%private free-form%' then raise exception 'Coverage leaked profile identity or arbitrary location text'; end if;
  if exists (select 1 from jsonb_array_elements(coverage) item where item ->> 'source_key' = '30000000-0000-0000-0000-000000000002') then raise exception 'Unknown location must not be inferred'; end if;

  if jsonb_array_length((select item -> 'events' from jsonb_array_elements(activity) item where item ->> 'source_key' = '30000000-0000-0000-0000-000000000001')) <> 5 then raise exception 'Activity must include all eligible canonical events, including historical evidence'; end if;
  if activity::text ilike '%Excluded Variety%' then raise exception 'Analytics-excluded evidence entered canonical activity'; end if;

  if (select (item ->> 'total_seeds')::integer from jsonb_array_elements(distribution) item where item ->> 'source_key' = '30000000-0000-0000-0000-000000000001') <> 150 then raise exception 'Distribution must include all 150 eligible source seeds'; end if;
  if (select (bucket ->> 'share_percent')::numeric from jsonb_array_elements(distribution) item cross join lateral jsonb_array_elements(item -> 'buckets') bucket where item ->> 'source_key' = '30000000-0000-0000-0000-000000000001' and bucket ->> 'key' = '86_90') <> 100 then raise exception 'Mature 90%% fixture must populate only the 86–90%% bucket'; end if;
  if (select (bucket ->> 'share_percent')::numeric from jsonb_array_elements(distribution) item cross join lateral jsonb_array_elements(item -> 'buckets') bucket where item ->> 'source_key' = '30000000-0000-0000-0000-000000000002' and bucket ->> 'key' = '91_95') <> 100 then raise exception 'Sparse 92%% fixture must populate only the 91–95%% bucket'; end if;

  if contract ->> 'contract_version' <> 'gie-community.v1.2' or contract ->> 'schema_version' <> '2026-07-15.2' then raise exception 'Unexpected Community contract version: %', contract; end if;
  select report into unknown_report from jsonb_array_elements(contract #> '{analytics,source_reports}') report
    where report ->> 'key' = '30000000-0000-0000-0000-000000000002';
  if unknown_report #>> '{regional_coverage,state}' <> 'empty' then raise exception 'Unknown-location source report must receive the explicit empty state: %', unknown_report; end if;
  if unknown_report #>> '{germination_distribution,buckets,1,share_percent}' <> '100.0' then raise exception 'Contract must attach canonical sparse distribution to the report: %', unknown_report; end if;
end;
$$;

select 'Source Report regional coverage SQL regression checks passed.' as result;

rollback;
