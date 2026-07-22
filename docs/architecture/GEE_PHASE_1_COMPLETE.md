# Grow Evidence Engine (GEE) — Phase 1 Complete

| Milestone | Value |
| --- | --- |
| **Completed** | July 13, 2026 |
| **Git tag** | `gie-phase-1-complete` |
| **Status** | **COMPLETE — Architecture Frozen** |

> [!IMPORTANT]
> The Grow Evidence Engine is the single canonical analytics platform for
> Grow. Future analytics must extend a versioned GEE contract before they are
> consumed by application code.

---

## Executive Summary

Phase 1 established the Grow Evidence Engine (GEE) as the application's
single authoritative analytics platform. It centralized the rules that decide
which Grow sessions participate, how cultivation data is normalized, how
metrics and rankings are calculated, how confidence is assigned, and how data
quality is measured.

GEE now exposes three stable, privacy-scoped contracts:

1. **Global Analytics** for anonymous platform-wide intelligence.
2. **Owner Analytics** for the authenticated owner's private intelligence.
3. **Community Analytics** for approved public social evidence.

This milestone fundamentally changes how analytics are built in Grow. Product
surfaces no longer define their own meanings for totals, percentages,
rankings, confidence, or data quality. They request the correct GEE contract
and render its canonical output. Operational workflows continue to own and
mutate operational records; GEE remains a read-only analytical layer over that
data.

Phase 1 freezes the architecture and contract boundaries. Phase 2 migrates the
remaining consumers onto them without redesigning the engine.

---

## Architecture Overview

```text
Operational Data
        │
        ▼
Grow Session Lifecycle Resolver
        │
        ▼
Grow Evidence Engine (GEE)
        │
        ├── Global Analytics Contract
        ├── Owner Analytics Contract
        └── Community Analytics Contract
                │
                ▼
Consumers
        ├── Seed Explorer
        ├── Source Explorer
        ├── Community
        ├── Reports
        ├── Rankings
        ├── AI
        ├── Admin
        └── Future Features
```

The contracts are not separate engines. They are versioned, privacy-scoped
views over one canonical lifecycle, normalization, aggregation, confidence,
ranking, and data-quality architecture.

| Layer | Responsibility |
| --- | --- |
| Operational data | Stores sessions, results, snapshots, Seed Vault entries, profiles, and workflow state. |
| Lifecycle resolver | Determines participation and provides one canonical exclusion reason. |
| GEE | Normalizes eligible evidence and calculates canonical analytics. |
| Contracts | Enforce privacy scope, authorization, versioning, and stable payloads. |
| Consumers | Request and render canonical values without recalculating them. |

---

## Core Principles

### Single Analytics Engine

There is exactly one Grow Evidence Engine. Global, Owner, and Community are
contracts over that engine—not independent analytics implementations. Shared
logic belongs in GEE helpers so formulas cannot drift between product areas.

### Read-only Analytics Layer

GEE reads operational data and returns analytics. It does not create, edit,
publish, archive, or delete sessions, snapshots, profiles, or Seed Vault
records. Operational workflows remain responsible for state changes.

### Separation of Concerns

Operational code answers, “What happened and what may the user change?” The
lifecycle resolver answers, “Should this session participate?” GEE answers,
“What intelligence follows from eligible data?” UI code answers only, “How
should the canonical value be presented?”

### Canonical Lifecycle

Every session-based GEE calculation uses the canonical Grow Session Lifecycle
Resolver. Consumers never recreate completion, deletion, archive, mock/test,
timeline, or analytics-exclusion rules.

### Versioned Analytics

Engine behavior, payload schemas, data-quality formulas, and individual
contracts carry explicit versions. Released fields are not silently renamed,
removed, or reinterpreted.

### No Analytics Without GEE

Every derived total, percentage, ranking, confidence label, recommendation, or
data-quality measure must originate in the correct GEE contract. UI components
render analytics; they do not invent them.

---

## Contracts

Every contract exposes the following metadata:

```text
contract_name
contract_version
engine_version
schema_version
data_quality_version
generated_at
authorization_status
payload_validation_status
analytics
```

### Global Analytics Contract

| Property | Definition |
| --- | --- |
| **RPC** | `public.get_gie_global_analytics()` |
| **Contract** | `global_analytics` |
| **Version** | `gie-global.v1` |
| **Purpose** | Anonymous, platform-wide analytics and global data quality. |
| **Access** | Public-safe; executable by `anon` and `authenticated`. |
| **Current consumers** | Seed Explorer, Source Explorer, Variety Reports, Grow Intelligence Health, and compatibility wrappers. |

The Global contract may expose completed sessions, seeds tested and
germinated, germination rate, varieties, sources, methods, seed-age buckets,
confidence, rankings, source attribution, and data-quality metrics.

It never exposes user or profile identity, Grow ID, session titles, exact
private dates, notes, images, private report links, or private account data.
Its analytics are anonymous aggregate truth derived from eligible completed
sessions.

### Owner Analytics Contract

| Property | Definition |
| --- | --- |
| **Normal RPC** | `public.get_gie_my_analytics()` |
| **Admin RPC** | `public.get_gie_admin_owner_analytics(target_user_id uuid)` |
| **Contract** | `owner_analytics` |
| **Version** | `gie-owner.v1` |
| **Purpose** | Private analytics for the authenticated owner. |
| **Normal access** | `authenticated` only; identity derives exclusively from `auth.uid()`. |
| **Admin access** | Separate cross-owner RPC guarded by the existing `admin_users` authorization model. |
| **Future consumers** | Home, My Sessions, Session Analytics, Profile, Seed Vault, personal recommendations, and private AI summaries. |

The Owner contract may expose active and completed sessions, seeds tested and
germinated, personal germination rate, method performance, variety and source
performance, seed-age trends, Seed Vault planning summaries, session history,
and private recommendations.

Normal owner identity is **always** derived from `auth.uid()`. It is never
accepted from a caller-supplied UUID. Browser clients call
`get_gie_my_analytics()` without parameters. Authorized administrative access
uses only `get_gie_admin_owner_analytics(uuid)`.

The former UUID-based `get_gie_owner_analytics(uuid)` function is deprecated,
has no `anon` or `authenticated` EXECUTE grant, and remains only as a shared
internal implementation. This preserves one Owner calculation pipeline without
exposing a browser-controlled identity selector.

### Community Analytics Contract

| Property | Definition |
| --- | --- |
| **RPC** | `public.get_gie_community_analytics()` |
| **Contract** | `community_analytics` |
| **Version** | `gie-community.v1` |
| **Purpose** | Public social-evidence analytics. |
| **Access** | Public-safe; executable by `anon` and `authenticated`. |
| **Evidence requirement** | Approved, visible, published, and analytics-eligible Community snapshots only. |
| **Future consumers** | Community, public reports, rankings, leaderboards, Community Confidence, and public recommendations. |

Community snapshots are public evidence. They may support public rankings,
confidence, report summaries, and evidence counts. They are **not** the source
of anonymous Global aggregate truth.

The Community contract excludes private sessions, unpublished or rejected
reports, hidden or deleted snapshots, private notes and images, private
profiles, and hidden identities. Removing a Community snapshot removes that
public evidence from Community analytics but does not remove the underlying
eligible completed session from Global analytics.

---

## Session Lifecycle Relationship

The lifecycle resolver and GEE answer different questions:

```text
Lifecycle Resolver
“Should this session participate?”

                 ↓ eligible evidence

Grow Evidence Engine
“What analytics should be produced?”
```

The lifecycle resolver owns completion, deletion, archive, cancellation,
failure, mock/test, analytics-exclusion, and timeline-validity decisions. GEE
consumes that decision and never duplicates lifecycle logic.

The canonical relationship protects several important invariants:

- Account deletion can remove identity without erasing valid anonymous Global
  analytics.
- Community publication is optional and does not determine Global eligibility.
- Community snapshot deletion affects public evidence, not the underlying
  completed-session aggregate.
- A new exclusion rule is added to the lifecycle resolver once, not copied into
  every analytics consumer.

---

## Versioning

| Version | Current value | Changes when |
| --- | --- | --- |
| **Engine Version** | `gie.v1` | Canonical analytics behavior or engine generation changes. |
| **Schema Version** | `2026-07-13.4` | A payload contract adds, replaces, deprecates, or changes a field. |
| **Data Quality Version** | `gie-dq.v1` | Quality categories, weights, deductions, or thresholds change. |
| **Contract Versions** | `gie-global.v1`, `gie-owner.v1`, `gie-community.v1` | A contract's stable API requires a versioned evolution. |

Future releases must follow these rules:

1. Do not silently rename, remove, or reinterpret a released field.
2. Add a replacement field and mark the prior field deprecated.
3. Increment the schema or contract version when the payload changes.
4. Increment the engine version when canonical calculation behavior changes.
5. Increment the data-quality version when scoring semantics change.
6. Preserve compatibility wrappers where practical and document their removal
   path.

---

## Current Canonical Metrics

The following values record the Phase 1 production verification:

| Metric | Verified value |
| --- | ---: |
| Completed Sessions | 4 |
| Seeds Tested | 262 |
| Seeds Germinated | 242 |
| Varieties | 28 |
| Sources | 9 |
| Seeds With Source | 234 |
| Seeds Missing Source | 28 |
| Source Attribution | 89% |
| Data Quality Score | 88 — Needs Attention |

> [!NOTE]
> These are deployment verification values, not hardcoded application
> constants. Production values are expected to evolve as eligible evidence is
> added or corrected. Consumers must always read the live GEE payload.

---

## Security

### Global boundary

The Global contract is deliberately anonymous and public-safe. Its SECURITY
DEFINER boundary uses an explicit safe `search_path`, selects no private
identity fields, and exposes only aggregate analytics.

### Owner boundary

`get_gie_my_analytics()` accepts no owner identifier. The authenticated
Supabase JWT establishes the caller, and `auth.uid()` is the sole source of
normal owner identity. Unauthenticated calls fail. Because there is no target
parameter, a normal owner cannot request another owner's analytics.

Cross-owner administrative access is isolated in
`get_gie_admin_owner_analytics(uuid)`. It rejects anonymous and non-admin
callers and validates the existing `admin_users` model before invoking the same
canonical Owner pipeline.

### Community boundary

The Community contract selects only approved, published, visible,
analytics-eligible evidence. Its payload does not expose private notes, private
images, unpublished reports, or hidden identities.

### Browser boundary

Browser code may use only:

```text
CANNAKAN_SUPABASE_URL
CANNAKAN_SUPABASE_ANON_KEY
Authenticated user session JWT
```

A service-role key, Supabase secret key, database password, or admin secret
never belongs in browser code, generated frontend configuration, localStorage,
or a client request. Service-role credentials bypass Row Level Security and are
restricted to trusted server-side execution environments.

---

## Data Quality

Data quality is canonical analytics, not a presentation-layer opinion. GEE
calculates and versions every quality metric.

| Measure | Meaning |
| --- | --- |
| **Source Attribution** | Percentage of tested seeds assigned to a recognized source. |
| **Seeds Missing Source** | Tested seeds without canonical source attribution. |
| **Duplicate Detection** | Source, variety, or result identities that collapse to the same normalized key. |
| **Unknown Sources** | Eligible result rows that cannot be assigned a recognized source. |
| **Unknown Varieties** | Result rows that cannot be assigned a recognized variety. |
| **Data Quality Score** | Deterministic 0–100 score based on versioned categories, weights, observations, and deductions. |

GEE also audits invalid seed counts, germinated-count bounds, orphaned
aggregates, duplicate result rows, missing required fields, and related
normalization issues. Grow Intelligence Health renders the canonical score,
status, breakdown, versions, and contract diagnostics without recalculating or
reclassifying them.

---

## Permanent Development Rules

> [!CAUTION]
> ### Rule #1 — No analytics without GEE
>
> A feature must not calculate derived analytics from operational tables,
> locally loaded records, or UI state.

```text
Need analytics?
        ↓
Determine the contract:
Global, Owner, or Community
        ↓
Extend GEE
        ↓
Version if required
        ↓
Consume the contract
        ↓
Render the canonical value
```

Permanent prohibitions:

- Never calculate analytics inside UI components.
- Never query operational tables directly for derived statistics.
- Never duplicate lifecycle logic.
- Never duplicate totals, percentages, or rates.
- Never duplicate rankings or tie-breaking rules.
- Never duplicate confidence calculations.
- Never duplicate data-quality logic or status thresholds.
- Never trust a caller-supplied owner identifier for normal Owner analytics.
- Never use service-role or secret credentials in browser code.

Operational table access remains valid for operational workflows such as
opening, editing, or saving a session; adding a Seed Vault entry; publishing a
Community report; and managing account settings. The prohibition applies to
derived analytics.

---

## Phase 2

Phase 2 is consumer migration. It builds on the frozen Phase 1 architecture
rather than redesigning it.

| Group | Consumers | Primary contract | Migration intent |
| --- | --- | --- | --- |
| **Group A — Owner-private** | Home, Sessions, Profile, Seed Vault | Owner | Replace local private totals, performance summaries, age buckets, and trends. |
| **Group B — Public evidence** | Community, Reports, Rankings, Leaderboards | Community, with Global where aggregate truth is required | Replace snapshot rollups, public confidence, evidence summaries, and ranking logic. |
| **Group C — Extended intelligence** | Recommendations, AI, Grow Network, advanced Admin analytics | Owner, Community, or Global according to scope | Consume stable contract data for higher-level intelligence without creating new analytics paths. |

Each migration follows the same sequence:

1. Identify the consumer's privacy and evidence scope.
2. Confirm the required fields exist in the correct contract.
3. Extend and version GEE first when fields are missing.
4. Add privacy, parity, and regression coverage.
5. Switch one consumer to canonical output.
6. Remove its duplicate local calculations.
7. Continue only after verification passes.

---

## Status

```text
Grow Evidence Engine

Phase 1

Status

COMPLETE

Architecture Frozen

Future analytics must extend and consume GEE.
```

**Milestone tag:** `gie-phase-1-complete`
