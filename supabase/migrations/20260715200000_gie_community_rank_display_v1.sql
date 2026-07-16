-- Additive Community GIE contract extension for canonical rank presentation.
-- Ranking, eligibility, tie handling, confidence, and evidence scope are unchanged.
-- The full eligible population is resolved inside GIE; clients only format the result.

create or replace function public.get_gie_rank_display_v1(
  p_rank integer,
  p_eligible_population integer,
  p_entity_label text,
  p_population_label text
)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select case
    when coalesce(p_rank, 0) <= 0 then null
    when p_rank <= 3 then jsonb_build_object(
      'kind', 'podium',
      'rank', p_rank,
      'label', '#' || p_rank::text,
      'entity_label', p_entity_label,
      'eligible_population', greatest(0, coalesce(p_eligible_population, 0)),
      'population_label', p_population_label,
      'percentile', null
    )
    when coalesce(p_eligible_population, 0) > 0 then jsonb_build_object(
      'kind', 'percentile',
      'rank', p_rank,
      'label', 'Top ' || least(100, greatest(1, ceil(p_rank::numeric * 100 / p_eligible_population)::integer))::text || '%',
      'entity_label', p_entity_label,
      'eligible_population', p_eligible_population,
      'population_label', p_population_label,
      'percentile', least(100, greatest(1, ceil(p_rank::numeric * 100 / p_eligible_population)::integer))
    )
    else null
  end;
$$;

create or replace function public.get_gie_apply_rank_display_v1(
  p_rows jsonb,
  p_rank_key text,
  p_eligible_population integer,
  p_entity_label text,
  p_population_label text
)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select case
    when jsonb_typeof(coalesce(p_rows, '[]'::jsonb)) <> 'array' then '[]'::jsonb
    else coalesce((
      select jsonb_agg(
        ranked.row_value || jsonb_build_object(
          'rank_display', public.get_gie_rank_display_v1(
            ranked.canonical_rank,
            p_eligible_population,
            p_entity_label,
            p_population_label
          )
        )
        order by ranked.ordinality
      )
      from (
        select
          input.row_value,
          input.ordinality,
          public.get_gie_canonical_nonnegative_integer_v1(
            input.row_value,
            array[p_rank_key]
          ) as canonical_rank
        from jsonb_array_elements(coalesce(p_rows, '[]'::jsonb)) with ordinality as input(row_value, ordinality)
      ) ranked
    ), '[]'::jsonb)
  end;
$$;

revoke all on function public.get_gie_rank_display_v1(integer, integer, text, text) from public, anon, authenticated;
revoke all on function public.get_gie_apply_rank_display_v1(jsonb, text, integer, text, text) from public, anon, authenticated;

do $$
begin
  if public.get_gie_rank_display_v1(1, 50, 'Source Rank', 'of eligible Community sources') ->> 'kind' <> 'podium'
    or public.get_gie_rank_display_v1(1, 50, 'Source Rank', 'of eligible Community sources') ->> 'label' <> '#1'
    then raise exception 'GIE rank display: first-place podium contract';
  end if;
  if public.get_gie_rank_display_v1(2, 50, 'Source Rank', 'of eligible Community sources') ->> 'label' <> '#2'
    then raise exception 'GIE rank display: second-place podium contract';
  end if;
  if public.get_gie_rank_display_v1(3, 50, 'Source Rank', 'of eligible Community sources') ->> 'label' <> '#3'
    then raise exception 'GIE rank display: third-place podium contract';
  end if;
  if public.get_gie_rank_display_v1(4, 50, 'Source Rank', 'of eligible Community sources') ->> 'label' <> 'Top 8%'
    then raise exception 'GIE rank display: canonical percentile contract';
  end if;
end;
$$;

-- Recompose the existing public wrapper and enrich every canonical ranking view
-- without changing array order, row membership, numeric rank, or any metric.
create or replace function public.get_gie_community_analytics_rank_display_v1()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  base jsonb := public.get_gie_community_analytics_phase2b_v1();
  analytics jsonb;
  rankings jsonb;
  leaderboards jsonb;
  evidence_count integer := 0;
  contributor_count integer := 0;
  source_population integer := 0;
  variety_population integer := 0;
begin
  select count(*)::integer, count(distinct evidence.user_id)::integer
  into evidence_count, contributor_count
  from public.get_gie_community_evidence_v1() evidence;

  analytics := (base -> 'analytics')
    || public.get_gie_phase2c_community_enrichment_v1()
    || jsonb_build_object(
      'approved_public_snapshots', evidence_count,
      'public_contributors', contributor_count,
      'evidence_records', '[]'::jsonb
    );

  source_population := greatest(
    jsonb_array_length(coalesce(analytics -> 'source_reports', '[]'::jsonb)),
    jsonb_array_length(coalesce(analytics -> 'source_rows', '[]'::jsonb))
  );
  variety_population := greatest(
    jsonb_array_length(coalesce(analytics -> 'variety_reports', '[]'::jsonb)),
    jsonb_array_length(coalesce(analytics -> 'variety_rows', '[]'::jsonb))
  );

  analytics := jsonb_set(analytics, '{source_rows}', public.get_gie_apply_rank_display_v1(
    analytics -> 'source_rows', 'performance_rank', source_population, 'Source Rank', 'of eligible Community sources'
  ));
  analytics := jsonb_set(analytics, '{source_reports}', public.get_gie_apply_rank_display_v1(
    analytics -> 'source_reports', 'rank', source_population, 'Source Rank', 'of eligible Community sources'
  ));
  analytics := jsonb_set(analytics, '{variety_rows}', public.get_gie_apply_rank_display_v1(
    analytics -> 'variety_rows', 'performance_rank', variety_population, 'Variety Rank', 'of eligible Community varieties'
  ));
  analytics := jsonb_set(analytics, '{variety_reports}', public.get_gie_apply_rank_display_v1(
    analytics -> 'variety_reports', 'rank', variety_population, 'Variety Rank', 'of eligible Community varieties'
  ));

  rankings := coalesce(analytics -> 'rankings', '{}'::jsonb);
  rankings := jsonb_set(rankings, '{top_sources}', public.get_gie_apply_rank_display_v1(rankings -> 'top_sources', 'performance_rank', source_population, 'Source Rank', 'of eligible Community sources'));
  rankings := jsonb_set(rankings, '{most_tested_sources}', public.get_gie_apply_rank_display_v1(rankings -> 'most_tested_sources', 'performance_rank', source_population, 'Source Rank', 'of eligible Community sources'));
  rankings := jsonb_set(rankings, '{most_active_sources}', public.get_gie_apply_rank_display_v1(rankings -> 'most_active_sources', 'performance_rank', source_population, 'Source Rank', 'of eligible Community sources'));
  rankings := jsonb_set(rankings, '{top_varieties}', public.get_gie_apply_rank_display_v1(rankings -> 'top_varieties', 'performance_rank', variety_population, 'Variety Rank', 'of eligible Community varieties'));
  rankings := jsonb_set(rankings, '{most_tested_varieties}', public.get_gie_apply_rank_display_v1(rankings -> 'most_tested_varieties', 'performance_rank', variety_population, 'Variety Rank', 'of eligible Community varieties'));
  rankings := jsonb_set(rankings, '{repeat_tested_varieties}', public.get_gie_apply_rank_display_v1(rankings -> 'repeat_tested_varieties', 'performance_rank', variety_population, 'Variety Rank', 'of eligible Community varieties'));
  analytics := jsonb_set(analytics, '{rankings}', rankings);

  leaderboards := coalesce(analytics -> 'leaderboards', '{}'::jsonb);
  leaderboards := jsonb_set(leaderboards, '{sources}', public.get_gie_apply_rank_display_v1(leaderboards -> 'sources', 'performance_rank', source_population, 'Source Rank', 'of eligible Community sources'));
  leaderboards := jsonb_set(leaderboards, '{varieties}', public.get_gie_apply_rank_display_v1(leaderboards -> 'varieties', 'performance_rank', variety_population, 'Variety Rank', 'of eligible Community varieties'));
  analytics := jsonb_set(analytics, '{leaderboards}', leaderboards);
  analytics := analytics || jsonb_build_object(
    'rank_populations', jsonb_build_object('sources', source_population, 'varieties', variety_population)
  );

  return base || jsonb_build_object(
    'contract_version', 'gie-community.v1.1',
    'schema_version', '2026-07-15.1',
    'analytics', analytics
  );
end;
$$;

revoke all on function public.get_gie_community_analytics_rank_display_v1() from public, anon, authenticated;

create or replace function public.get_gie_community_analytics()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$ select public.get_gie_community_analytics_rank_display_v1(); $$;

revoke all on function public.get_gie_community_analytics() from public;
grant execute on function public.get_gie_community_analytics() to anon, authenticated;

comment on function public.get_gie_rank_display_v1(integer, integer, text, text) is
  'Canonical presentation metadata for a pre-existing Community rank. Percentiles use the full eligible GIE population.';
comment on function public.get_gie_community_analytics() is
  'Canonical gie-community.v1.1 contract; adds rank_display and rank_populations without changing ranking logic or evidence scope.';

notify pgrst, 'reload schema';
