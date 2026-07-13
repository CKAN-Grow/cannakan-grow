# Grow Intelligence Engine

The Grow Intelligence Engine (GIE) is the canonical analytics layer for Grow. It is the only subsystem that may transform operational Grow data into analytics for product surfaces such as Seed Explorer, Source Explorer, Community summaries, rankings, reports, admin dashboards, recommendations, and future AI features.

## Architecture Overview

Operational systems own operational data. The GIE reads that data, validates it, normalizes it, classifies it, aggregates it, calculates analytics, versions the output, and exposes read-only analytics payloads.

The GIE does not mutate operational records. Session creation, completion, deletion, publication, snapshot management, Seed Vault records, and account settings remain owned by their existing domain flows.

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
- seed-tested counts
- germinated counts
- germination percentages
- confidence-ready sample fields

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
- `generated_at`

Behavior-changing analytics updates should increment the appropriate version rather than silently changing output semantics.

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
- Explorer Data Health
- Future recommendations and AI analytics

UI components render GIE output. They do not independently calculate aggregate analytics.

## Admin Data Health

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
