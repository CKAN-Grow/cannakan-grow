# Grow Intelligence Engine

The Grow Intelligence Engine (GIE) is the canonical analytics layer for Grow. It is the only subsystem that may transform operational Grow data into analytics for product surfaces such as Seed Explorer, Source Explorer, Community summaries, rankings, reports, admin dashboards, recommendations, and future AI features.

## Architecture Overview

Operational systems own operational data. The GIE reads that data, validates it, normalizes it, classifies it, aggregates it, calculates analytics, versions the output, and exposes read-only analytics payloads.

The GIE does not mutate operational records. Session creation, completion, deletion, publication, snapshot management, Seed Vault records, and account settings remain owned by their existing domain flows.

## Permanent Data Flow

```text
Raw Operational Data
        ↓
Canonical Grow Session Lifecycle Resolver
        ↓
Grow Intelligence Engine
        ↓
Canonical Versioned Analytics Payload
        ↓
Consumers
        ↓
UI
```

The lifecycle resolver determines whether a session participates. The GIE then
transforms eligible operational data into analytics and data-quality measures.
Consumers never calculate analytics independently, and UI components only
render canonical payload values. Community snapshots are public evidence, not
aggregate truth.

New analytics and new data-quality measures must be added to the GIE first,
versioned there, and only then exposed to consumers.

## Lifecycle Relationship

The GIE sits on top of the canonical Grow Session lifecycle resolver.

Lifecycle answers:

```text
Should this session participate?
```

The GIE answers:

```text
What analytics should be produced from eligible sessions?
```

The canonical session flow is:

```text
Created
  -> Active
  -> Completed
  -> Published optional
  -> Community Snapshot optional
```

Terminal or excluded states include:

- Deleted by user
- Deleted by Founder Cleanup
- Deleted by admin/system
- Archived
- Canceled
- Failed
- Abandoned
- Analytics disabled
- Mock/test/developer-preview
- Timeline invalid
- Incomplete

Account deletion removes identity but does not remove otherwise valid anonymous completed-session analytics. Community snapshot deletion removes public evidence only and does not affect anonymous aggregate eligibility.

## Eligibility

All eligibility must resolve through the lifecycle resolver:

- Database: `public.resolve_grow_session_lifecycle(uuid)`
- Database reason helper: `public.get_grow_session_lifecycle_exclusion_reason(uuid)`
- Database boolean helper: `public.is_community_intelligence_session_eligible(uuid)`
- Local fallback: `resolveGrowSessionLifecycle(session, options)`

Consumers must not duplicate these rules. If a future feature needs a new eligibility distinction, extend the lifecycle resolver first.

## Aggregate Pipeline

The canonical database analytics entry point is:

```sql
public.get_grow_intelligence_engine_analytics()
```

The payload includes:

- `engine_version`
- `schema_version`
- `generated_at`
- seed records
- source records
- completed-session totals
- variety totals
- source totals
- `total_seeds_tested`
- `total_seeds_germinated`
- `overall_germination_rate`
- `total_seeds_with_source`
- `total_seeds_without_source`
- `source_attribution_rate`
- `source_attribution_status`
- `source_attribution_thresholds`
- `varieties_missing_source`
- `duplicate_sources`
- `unknown_sources`
- `unknown_varieties`
- `invalid_result_rows`
- `duplicate_varieties`
- `duplicate_result_rows`
- `orphaned_aggregate_records`
- `missing_required_result_fields`
- `data_quality_score`
- `data_quality_status`
- `data_quality_breakdown`
- `data_quality_thresholds`
- `data_quality_version`
- canonical Community Confidence values

`total_seeds_tested` is the headline seed total everywhere. Source-attributed
seed counts are data-quality metrics and must never replace that headline.

Source attribution alert thresholds are stored in
`public.grow_intelligence_engine_config`. The defaults are 95% Healthy, 90%
Warning, and 80% Needs Attention. Changing these thresholds changes the GIE
status output; consumers never classify attribution independently.

The legacy Explorer RPC remains only as a compatibility wrapper:

```sql
public.get_explorer_completed_session_aggregates()
```

It must return the same GIE payload and should not become a second analytics source.

## Data Lineage

The GIE may read from:

- `grow_sessions`
- canonical lifecycle resolver output
- saved partition/result rows
- canonical source and variety identifiers when present
- source/breeder text fallbacks
- account existence only for anonymous retention diagnostics

Community Grow snapshots are public evidence. They are not aggregate truth. Snapshot deletion must never remove anonymous completed-session analytics.

## Versioning

The GIE payload exposes:

- `engine_version`
- `schema_version`
- `data_quality_version`
- `generated_at`

Behavior-changing analytics updates should increment the appropriate version rather than silently changing output semantics.

`schema_version` changes when the payload contract changes. `engine_version`
changes when the overall analytics engine behavior requires a new compatibility
generation. `data_quality_version` changes whenever scoring categories,
weights, deductions, or status thresholds change. A score-formula change must
never ship under an existing `data_quality_version`.

## Data-Quality Score (`gie-dq.v1`)

The canonical score is deterministic and calculated only by
`public.get_grow_intelligence_engine_analytics()`:

```text
data_quality_score = round(100 - sum(category deductions))
```

The result is clamped to 0–100. Configuration lives in
`public.grow_intelligence_engine_config`.

| Category | Weight | Deduction model |
| --- | ---: | --- |
| Source attribution completeness | 70 | Missing attribution percentage, capped at 70 |
| Varieties missing source | 5 | Audited separately; charged once through source attribution |
| Unknown sources | 5 | Audited separately; charged once through source attribution |
| Unknown varieties | 4 | Weighted share of audited result rows |
| Duplicate sources | 3 | Weighted share of canonical sources |
| Duplicate varieties | 3 | Weighted share of canonical varieties |
| Invalid or missing seed counts | 3 | Weighted share of audited result rows |
| Germinated count bounds | 2 | Weighted share of audited result rows |
| Orphaned aggregate records | 2 | One point per orphan, capped at the weight |
| Duplicate result rows | 1 | Weighted share of audited result rows |
| Missing required result fields | 2 | Weighted share of audited result rows |

Missing-source categories remain visible in the breakdown but are not charged a
second time. This prevents one attribution defect from producing multiple
opaque deductions.

Canonical status thresholds are configurable and default to:

- 95–100: Excellent
- 90–94: Good
- 80–89: Needs Attention
- Below 80: Poor

Every breakdown item includes its category, weight, measured value, deduction,
status, and concise reason. Consumers must not reinterpret the score or status.

## Consumer Architecture

Current and future consumers must read GIE output or lifecycle resolver output:

- Seed Explorer
- Source Explorer
- Home Explorer previews
- Variety reports
- Source reports
- Community summaries
- Rankings
- Leaderboards
- Confidence calculations
- Admin dashboards
- Grow Intelligence Health
- Future recommendations and AI analytics

UI components render GIE output. They do not independently calculate aggregate analytics.

Canonical analytics terminology is: Completed Sessions, Seeds Tested, Seeds
Germinated, Overall Germination %, Varieties, Sources, and Community Confidence.
Canonical data-quality terminology is: Seeds With Source, Seeds Missing Source,
Source Attribution %, Unknown Sources, and Unknown Varieties.

## Grow Intelligence Health

The previous `#admin/data-health`, `#admin/explorer-data-health`, and
`#admin/gie` hashes remain aliases for `#admin/grow-intelligence-health`. They
all open the same admin-only, read-only health surface.

System Health and Data Quality remain separate. System Health describes RPC
availability, engine/schema compatibility, consumer synchronization, response
freshness, and integrity diagnostics. Data Quality describes attribution,
completeness, duplicates, invalid fields, and aggregate cleanliness. A healthy
engine may legitimately report a data-quality warning.

The admin diagnostic entry point is:

```sql
public.get_grow_intelligence_engine_diagnostics()
```

It is admin/service-role only and includes:

- health status
- engine version
- schema version
- generated timestamp
- integrity score
- session audit
- lifecycle state
- eligibility state
- eligibility reason
- deletion source
- included/excluded state
- result-row counts
- seeds tested
- seeds germinated
- seeds with and without source attribution
- source attribution rate and status
- varieties missing source
- duplicate sources
- unknown sources and varieties
- canonical data-quality score, status, version, and explainable breakdown
- invalid, duplicate, missing-field, and orphaned-record counts

The diagnostic may expose session identifiers and names to admins for audit. Public GIE analytics must remain anonymous.

## Extension Guidelines

When adding analytics:

1. Add or update lifecycle resolver rules if participation changes.
2. Extend `get_grow_intelligence_engine_analytics()`.
3. Version the payload when behavior changes.
4. Update admin diagnostics.
5. Point consumers at the GIE output.
6. Add regression checks proving no page-specific duplicate analytics were introduced.

Do not create a second analytics engine.
