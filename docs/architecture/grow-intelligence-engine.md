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
        ├── Global Analytics Contract
        ├── Owner Analytics Contract
        └── Community Analytics Contract
                ↓
Canonical Versioned Analytics Payload
                ↓
Future Consumers
```

The lifecycle resolver determines whether a session participates. The GIE then
transforms eligible operational data into analytics and data-quality measures.
Consumers never calculate analytics independently, and UI components only
render canonical payload values. Community snapshots are public evidence, not
aggregate truth.

New analytics and new data-quality measures must be added to the GIE first,
versioned there, and only then exposed to consumers.

## Three-Contract Architecture (Phase 1)

There is exactly one Grow Intelligence Engine. Phase 1 exposes three stable,
privacy-scoped views over its lifecycle, normalization, aggregation,
confidence, ranking, and data-quality pipeline. These contracts are internal
APIs, not separate engines.

| Contract | RPC | Version | Purpose | Access |
| --- | --- | --- | --- | --- |
| Global Analytics | `public.get_gie_global_analytics()` | `gie-global.v1` | Anonymous platform-wide aggregates and global data quality | `anon`, `authenticated` |
| Owner Analytics | `public.get_gie_my_analytics()` | `gie-owner.v1` | Private analytics for the authenticated owner | `authenticated`; identity comes only from `auth.uid()` |
| Community Analytics | `public.get_gie_community_analytics()` | `gie-community.v1` | Approved and visible public social evidence | `anon`, `authenticated` |

All contracts expose `contract_name`, `contract_version`, `engine_version`,
`schema_version`, `data_quality_version`, and `generated_at`. Phase 1 uses
engine `gie.v1`, schema `2026-07-13.4`, and data quality `gie-dq.v1`.

### Shared canonical pipeline

`get_gie_scoped_result_rows_v1()` is the internal scope resolver and canonical
row normalizer. `get_gie_scoped_analytics_v1()` is the shared aggregation,
confidence, ranking, seed-age, and scoped quality layer.
`get_gie_contract_analytics_v1()` is the single internal engine dispatcher used
by all three contracts. None of these helpers is granted to browser roles.
Contract functions add only privacy-specific fields and authorization.

The Global contract preserves the already released anonymous GIE payload under
its `analytics` field. The compatibility RPC delegates to that field, keeping
Seed Explorer and Source Explorer stable. Owner and Community use the shared
scoped helpers. Future shared calculations must be added to those helpers, not
copied into a contract.

### Contract fields

Global `analytics` preserves the complete released GIE payload: completed
sessions, seeds tested/germinated, germination rate, varieties, sources,
methods, seed-age summaries, seed/source records, confidence, rankings,
attribution, and global data-quality score/breakdown. It never includes user or
profile identity, Grow ID, titles, private dates, notes, images, or links.

Owner `analytics` exposes completed and active session counts, seeds tested and
germinated, personal germination rate, varieties, sources, methods, seed-age
buckets, personal variety/source/method rankings, confidence, scoped source
quality, Seed Vault counts, and versioned placeholders for session history and
recommendations. The contract may return `owner_id` only inside its private
authorized response.

The normal Owner browser RPC is `get_gie_my_analytics()`. It has no parameters
and derives its owner exclusively from `auth.uid()`. Administrative cross-owner
access is a different contract boundary:
`get_gie_admin_owner_analytics(target_user_id uuid)`. That RPC requires the
existing `admin_users` authorization before delegating to the same canonical
Owner implementation.

Community `analytics` exposes approved public snapshot and contributor counts,
seeds tested and germinated in public evidence, germination rate, varieties,
sources, methods, seed-age buckets, public rankings, confidence, and scoped
source quality. Phase 1 intentionally returns no identity-bearing evidence
records.

### Privacy and security boundaries

- Global selects no identity-bearing fields and preserves anonymous aggregate
  behavior.
- Owner requires `auth.uid()`. Browser callers cannot supply a target UUID.
- Admin cross-owner access is available only through
  `get_gie_admin_owner_analytics(uuid)`, which validates `admin_users` before
  invoking the shared Owner pipeline.
- Community includes only `status = 'approved'`, `is_published = true`, and
  `analytics_excluded = false` snapshots. Hidden, pending, rejected, deleted,
  or unpublished evidence cannot participate.
- Deleting a Community snapshot changes only Community evidence. Global uses
  the completed session lifecycle and remains unchanged.
- Contract functions use explicit `search_path = public`; internal helpers have
  no browser-role grants. Owner analytics is not executable by `anon`.
- Browser configuration contains only the Supabase URL and anonymous key. A
  service-role or secret key is never permitted in browser code.

**Permanent security rule:** “Normal owner analytics must derive identity from
the authenticated session, never from a caller-supplied owner identifier.”

The Phase 1 UUID function `get_gie_owner_analytics(uuid)` is deprecated and
internal-only. `anon` and `authenticated` have no direct EXECUTE permission. It
is retained solely as the shared implementation used by the secured normal and
admin wrappers so Owner calculations are not duplicated.

### API stability

Released fields are never silently renamed or removed. A replacement is added,
the old field is marked deprecated, and the contract or schema version is
incremented. Compatibility wrappers remain delegating functions with no
calculation logic. Deprecated wrappers are documented before removal.

### Permanent analytics workflow

```text
Need analytics?
        ↓
Identify Global, Owner, or Community scope
        ↓
Extend the correct GIE contract
        ↓
Version the contract
        ↓
Consume the contract
        ↓
Never calculate analytics locally
```

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

The released compatibility entry point is:

```sql
public.get_grow_intelligence_engine_analytics()
```

It now contains no analytics logic and delegates to
`get_gie_global_analytics() -> 'analytics'`. New consumers must choose one of
the three contract RPCs instead of adopting the compatibility wrapper.

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

The older Explorer RPC also remains only as a compatibility wrapper:

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

Contract-level health is exposed separately by the admin/service-role-only:

```sql
public.get_gie_contract_diagnostics()
```

For Global, Owner, and Community it reports availability, contract version,
engine version, schema version, data-quality version, generated timestamp,
authorization status, and payload-validation status. Grow Intelligence Health
renders those values without calculating or reclassifying them.

Owner diagnostics additionally report canonical RPC
`get_gie_my_analytics()`, admin RPC
`get_gie_admin_owner_analytics(uuid)`, caller-supplied owner ID `Disabled`,
cross-owner protection `Enforced`, and the current admin authorization status.

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

## GIE Adoption Status

Audit date: 2026-07-13. Strict adoption is **4 of 20 audited consumer groups
(20%)**. Compatibility consumers use at least one GIE surface but still contain
another local analytics path. The architecture is therefore not ready to be
declared frozen as fully adopted.

| Consumer | Status | Audit result |
| --- | --- | --- |
| Home | ⚠ Compatibility Wrapper | Seed/Source previews consume GIE; Community rankings still use snapshot rollups. |
| Sessions | ❌ Legacy | Owner session totals and lifecycle-filtered counts are calculated in browser helpers. |
| Session Analytics | ❌ Legacy | Rates, totals, category rollups, and chart rankings are calculated from loaded sessions. |
| Community | ❌ Legacy | `buildCommunityInsightsState()` aggregates approved snapshots client-side. |
| Community Reports | ❌ Legacy | Public snapshot totals, rates, sources, and varieties are calculated outside GIE. |
| Seed Explorer | ✅ Uses GIE | Reads the cached canonical GIE payload; the local completed-session aggregate fallback was removed. |
| Source Explorer | ✅ Uses GIE | Headlines and source records read the same cached canonical GIE payload. |
| Variety Reports | ✅ Uses GIE | Aggregate variety performance comes from GIE; snapshots remain supporting public evidence. |
| Source Reports | ❌ Legacy | Source trust/confidence scoring and some report summaries are calculated client-side. |
| Profile | ❌ Legacy | Owner and public profile analytics are independently aggregated. |
| Grow Network | ❌ Legacy | Member scores, averages, and achievements use profile/session calculations. |
| Seed Vault summaries | ❌ Legacy | Inventory, linked-session performance, age buckets, and rollups are calculated locally. |
| Admin | ❌ Legacy | Visitor analytics are operational, but Seed Age and other Grow analytics still calculate locally. |
| Grow Intelligence Health | ✅ Uses GIE | Renders GIE engine, schema, data-quality version, score, status, and breakdown without reinterpretation. |
| Rankings | ❌ Legacy | Home and Community ranking order is derived from snapshot/member rollups. |
| Leaderboards | ❌ Legacy | Community leaderboard metrics and ordering are not in the GIE payload. |
| Community Confidence | ⚠ Compatibility Wrapper | Explorer confidence is canonical GIE output; legacy public-directory confidence remains local. |
| Recommendations | ❌ Legacy | Private dashboard and session companion recommendations use locally derived metrics. |
| AI integration hooks | ⚠ Compatibility Wrapper | No live AI analytics consumer exists; placeholder hooks still expose locally built private rollups. |
| Cached aggregate / RPC compatibility | ⚠ Compatibility Wrapper | The cache contains normalized GIE output; the legacy Explorer RPC remains a GIE-delegating compatibility wrapper. |

### Permanent development rule

**No analytics without GIE.** A new analytics requirement must extend and
version the GIE before any consumer renders it. New UI code must not introduce
totals, percentages, confidence, ranking, or eligibility calculations.

The three contracts now provide the Phase 1 migration boundary. The remaining
legacy consumers are intentionally not redirected in this phase. Their Phase 2
migrations must map each local calculation to an already documented contract
field or version and extend the correct contract before removing local logic.

### Phase 1 consumer migration inventory

This inventory is a migration plan, not authorization to migrate consumers in
Phase 1. “Duplicate” identifies derived calculations that must be deleted when
the listed contract is adopted.

| Consumer | Current source / privacy | Duplicate calculations | Contract and required fields | Complexity / security | Phase 2 group |
| --- | --- | --- | --- | --- | --- |
| Home | GIE previews plus owner sessions and public snapshots / mixed | Owner totals; gallery rankings | Owner: active/completed, totals, trends; Community: rankings | High; keep owner and public caches separate | A, then B |
| Sessions | Loaded owner sessions / private | Status counts, totals | Owner: active/completed, seeds, history | Medium; owner-only | A |
| Session Analytics | Loaded owner sessions / private | Rates, categories, charts | Owner: totals, methods, varieties, sources, age buckets | High; no cross-owner cache | A |
| Community | Approved snapshots / public | Totals, rates, rankings | Community: snapshot totals, rankings, confidence | Medium; approved visible evidence only | B |
| Community Reports | Snapshot/report rows / public | Totals, rate, source and variety summaries | Community: evidence summaries and rankings | High; never expose unpublished reports | B |
| Seed Explorer | Global GIE compatibility RPC / anonymous | None after audit cleanup | Global: released seed records and totals | Low; preserve anonymous response | Existing |
| Source Explorer | Global GIE compatibility RPC / anonymous | None after audit cleanup | Global: released source records and attribution | Low; preserve headline parity | Existing |
| Variety Reports | Global GIE plus public snapshots / anonymous/public | Supporting evidence filters | Global: variety aggregate; Community: public evidence | Medium; separate truth from evidence | B |
| Source Reports | Local source/session/snapshot rollups / public | Trust, rate, evidence summary | Community: source rankings/evidence; Global aggregate where anonymous | High; confidence must be canonical | B |
| Profile | Owner sessions or approved snapshots / private/public | Totals, rates, favorites | Owner for self; Community for public profile evidence | High; never expose private owner metrics | A, then B |
| Grow Network | Profiles, follows, snapshots / public/social | Scores, averages, achievements | Community: contributor summaries and public rankings | High; visibility and hidden identity rules | C |
| Seed Vault summaries | Vault entries plus owner sessions / private | Inventory, age, performance, planning | Owner: seed_vault, age buckets, linked performance | High; owner-only inventory | A |
| Admin analytics | Operational admin rows plus local Grow rollups / admin | Grow totals and quality summaries | Scope-specific contracts plus admin diagnostics | High; existing admin authorization only | C |
| Grow Intelligence Health | GIE and contract diagnostics / admin | None | All metadata and diagnostic status | Low; read-only admin page | Existing |
| Rankings | Snapshots/members / public | Ordering, rate, evidence thresholds | Community: rankings and confidence | High; anti-leak and tie stability | B |
| Leaderboards | Snapshots/members / public | Totals, ordering, badges | Community: versioned leaderboard fields | High; approved evidence only | B |
| Community Confidence | GIE plus local public scoring / anonymous/public | Directory confidence | Global or Community confidence by evidence scope | Medium; never mix scopes | B |
| Recommendations | Owner/session local rollups / private | Performance comparisons, suggestions | Owner: recommendations and supporting metrics | High; owner-only inference inputs | C after A |
| AI hooks | Placeholder private/public rollups / mixed | Prompt analytics context | Correct scoped contract fields only | High; redact identity and private context | C |
| Cached aggregates / wrappers | Normalized GIE cache and delegating RPCs / anonymous | No calculations in canonical wrappers | Global now; separate keyed caches for Owner/Community later | Medium; scope cache keys and invalidation | Foundation |

### Phase 2 migration roadmap

**Group A — owner-private (high priority, high privacy risk).** Extend
`gie-owner.v1` only where a listed field is still a placeholder, then migrate
Home owner cards, Sessions summaries, Session Analytics, Profile self view, and
Seed Vault summaries in that order. Likely files are `app.js` and owner-focused
regression scripts. Required coverage: unauthenticated denial, cross-owner
denial, authorized-owner parity, admin authorization, cache isolation, and no
local totals/rates. Risk: high.

**Group B — Community/public evidence (second, high evidence risk).** Migrate
Community, Community Reports, Variety/Source report evidence, Rankings,
Leaderboards, and Community Confidence after adding any required evidence and
tie-break fields to `gie-community.v1`. Likely files are `app.js`, Community and
report regressions, and contract SQL. Required coverage: approved/published
only, hide/delete invalidation, identity visibility, deterministic ranking,
snapshot deletion independence from Global, and no local confidence. Risk:
high.

**Group C — extended intelligence (last, dependent on A/B).** Migrate Admin
Grow analytics, Grow Network, Recommendations, and AI hooks only after their
underlying Owner or Community fields are stable. Likely files are `app.js`,
server API handlers when AI is introduced, and admin/network/private-dashboard
regressions. Required coverage: scoped authorization, prompt redaction,
diagnostic read-only behavior, and canonical recommendation provenance. Risk:
high.

Within each group: add/version fields, validate SQL privacy, add parity tests,
switch one consumer, remove its local calculations, and only then continue to
the next consumer.

### Localhost status

Browser initialization reads only `window.CANNAKAN_SUPABASE_CONFIG.url` and
`anonKey`. The checked-in generated configuration currently has empty values,
which explains the prior localhost `0 / 0 / 0` display: no Supabase client and
therefore no GIE RPC response. Configure `CANNAKAN_SUPABASE_URL` and
`CANNAKAN_SUPABASE_ANON_KEY`, run `npm.cmd run build`, and serve the app. The
browser then calls `public.get_grow_intelligence_engine_analytics()` exactly as
production does. Service-role and secret keys are restricted to server-side API
handlers and are not emitted into browser configuration.

Safe local setup from PowerShell:

```powershell
$env:CANNAKAN_SUPABASE_URL='https://YOUR_PROJECT.supabase.co'
$env:CANNAKAN_SUPABASE_ANON_KEY='YOUR_ANON_KEY'
npm.cmd run build
npx.cmd serve .
```

After applying `20260713190000_gie_multi_contract_phase1.sql` and
`20260713200000_gie_owner_contract_auth_hardening.sql`, localhost may
call the same Global, Owner, and Community RPCs as production. Owner calls use
the signed-in browser session JWT and call `get_gie_my_analytics()` without a
user-ID argument. Do not set `SUPABASE_SECRET_KEY`, a
service-role key, or an admin secret in browser configuration. Do not commit the
generated values.

Explorer no longer reconstructs platform aggregates from locally loaded
sessions when the RPC is unavailable. It renders an unavailable/empty canonical
state until GIE configuration is valid.

### Performance findings

- GIE loads once during signed-in or signed-out hydration and refreshes after
  analytics-relevant session mutations. No GIE polling loop exists.
- The legacy Explorer RPC adds one fallback request only when the canonical RPC
  is missing; it delegates to GIE and may be removed after migration adoption is
  universal.
- Normalized GIE payloads are marked and reused so Explorer renders do not
  repeatedly normalize the same cache entry.
- `buildCommunityInsightsState()`, profile analytics, private dashboard
  rollups, and Seed Vault analytics repeatedly traverse the same local records.
  Their eventual GIE contracts should return presentation-ready rollups and use
  one versioned cache per scope.
- Rapid consecutive session mutations can initiate multiple refresh requests.
  A future non-semantic optimization may coalesce in-flight GIE refreshes.

### Production parity target

The canonical production payload is expected to report 4 completed sessions,
262 seeds tested, 242 seeds germinated, 28 varieties, 9 sources, 234 seeds with
source, 28 seeds missing source, and Data Quality 88 / Needs Attention. These
figures are verification targets only and are not hardcoded into application
logic.

Verify the deployed payload directly:

```sql
select
  payload ->> 'engine_version' as engine_version,
  payload ->> 'schema_version' as schema_version,
  payload ->> 'data_quality_version' as data_quality_version,
  payload ->> 'total_completed_sessions' as completed_sessions,
  payload ->> 'total_seeds_tested' as seeds_tested,
  payload ->> 'total_seeds_germinated' as seeds_germinated,
  payload ->> 'total_varieties_logged' as varieties,
  payload ->> 'total_breeders_logged' as sources,
  payload ->> 'total_seeds_with_source' as seeds_with_source,
  payload ->> 'total_seeds_without_source' as seeds_missing_source,
  payload ->> 'data_quality_score' as data_quality_score,
  payload ->> 'data_quality_status' as data_quality_status
from (
  select public.get_grow_intelligence_engine_analytics() as payload
) canonical;
```

Verify all three contract identities and shared versions after applying the
Phase 1 migration:

```sql
select
  contract ->> 'contract_name' as contract_name,
  contract ->> 'contract_version' as contract_version,
  contract ->> 'engine_version' as engine_version,
  contract ->> 'schema_version' as schema_version,
  contract ->> 'data_quality_version' as data_quality_version,
  contract ->> 'authorization_status' as authorization_status,
  contract ->> 'payload_validation_status' as payload_validation_status
from (
  values
    (public.get_gie_global_analytics()),
    (public.get_gie_my_analytics()),
    (public.get_gie_community_analytics())
) contracts(contract);
```

Run the three-contract query as an authenticated owner. An anonymous call to
`get_gie_my_analytics()` must fail with SQLSTATE `42501`. Confirm the function
has no UUID overload. An authenticated non-admin call to
`get_gie_admin_owner_analytics(other_owner_uuid)` must also fail with `42501`.
As an admin, verify that same admin RPC returns the target's `gie-owner.v1`
payload and that
`public.get_gie_contract_diagnostics()` returns exactly three rows in its
`contracts` array. Hide or delete a test Community snapshot and confirm the
Community evidence count decreases while the Global completed-session and seed
totals do not change.

## Phase 1 Freeze Decision

The Phase 1 contract design is ready to freeze after
`20260713190000_gie_multi_contract_phase1.sql` and
`20260713200000_gie_owner_contract_auth_hardening.sql` are applied and the verification
queries above pass in the target environment. Freeze means field names,
versions, privacy boundaries, grants, and compatibility wrappers are stable;
it does not mean the Phase 2 consumer migration has occurred.

## Extension Guidelines

When adding analytics:

1. Add or update lifecycle resolver rules if participation changes.
2. Identify Global, Owner, or Community privacy scope.
3. Extend the shared GIE helper and the correct contract.
4. Version the contract/schema when behavior changes.
5. Update admin contract diagnostics.
6. Point consumers at the scoped GIE output.
7. Add regression checks proving no page-specific duplicate analytics were introduced.

Do not create a second analytics engine.
