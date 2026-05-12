# CSTP v1 Immutable Snapshot Schema Implementation Plan

## 1. Purpose

This document defines the first narrow implementation-planning slice for immutable CSTP reporting.

The goal is to move from immutable reporting architecture into a practical schema implementation strategy without creating migrations, writing SQL, implementing report generation, implementing certifications, exposing CSTP publicly, or changing operational APIs/UI.

The v1 immutable snapshot schema should establish a controlled internal foundation for freezing CSTP report evidence. It must remain additive to the existing CSTP operational system and preserve the core rule that `grow_sessions` remain canonical.

## 2. Planning Context

Current CSTP operational foundations are complete enough to provide future report inputs:

- CSTP requests
- CSTP tests
- CSTP admin events
- CSTP test-to-grow-session links
- internal lifecycle validation
- admin-only APIs
- internal admin UI
- smoke-test coverage
- local route/API operational validation

Immutable reporting is the next trust boundary. The first implementation slice should not attempt to build the full reporting product. It should only introduce the minimum internal schema concepts required to persist frozen report snapshots safely later.

## 3. Narrowest Safe First Slice

The first immutable snapshot implementation slice should focus only on internal, frozen report evidence records.

### In Scope

- immutable report root records
- immutable report snapshot records
- frozen metric snapshot records
- frozen linked-session snapshot records
- frozen media/evidence reference records
- immutable audit linkage concepts
- internal-only visibility fields
- snapshot status and versioning fields
- publication lock markers
- supersession lineage fields
- append-only history compatibility

### Out Of Scope

- public report pages
- public report APIs
- public certification APIs
- public badges
- public trust scoring
- certifications
- Source Directory integration
- Community Grow integration
- automation
- breeder/source portals
- browser/public trust UX
- frontend report rendering
- report PDF/export generation
- RLS/public policy implementation
- operational workflow redesign

The first slice should make immutable reporting possible later. It should not publish or certify anything.

## 4. Proposed v1 Snapshot Entities

The following entities are conceptual only. They define implementation strategy before migrations are drafted.

### Immutable Report Root Entity

Conceptual role:

- parent record for a CSTP report lifecycle
- links report work back to one CSTP test
- coordinates report state, versioning, and publication readiness
- identifies the current prepared or published snapshot when applicable

Likely relationships:

- references `cstp_tests`
- may reference `sources`
- may reference a current immutable snapshot
- may be referenced by future certification records

Mutable/immutable expectation:

- root record may remain mutable while internal and unpublished
- publication state changes must be audit-linked
- published evidence must live in immutable snapshot records, not mutable root fields

Lifecycle role:

- internal report container
- report preparation coordinator
- future publication state anchor

Visibility expectation:

- internal-only in v1
- no public reads

### Immutable Snapshot Entity

Conceptual role:

- frozen representation of a report version
- stores version, generated timestamp, prepared timestamp, published timestamp, and immutable payload references
- preserves the report state used for review or publication

Likely relationships:

- references immutable report root
- references `cstp_tests`
- may reference `sources`
- owns metric/session/media snapshot records
- may reference prior/superseded snapshot ids

Mutable/immutable expectation:

- draft/prepared snapshots may be replaced by a new version
- published snapshots never mutate
- superseded snapshots remain historically accessible

Lifecycle role:

- evidence boundary between mutable CSTP operations and historical reporting

Visibility expectation:

- internal-only in v1
- future public exposure can only read published immutable snapshots after a later public layer is approved

### Immutable Metric Snapshot Entity

Conceptual role:

- freezes reportable metric values used by a snapshot
- prevents published metrics from being recalculated from live operational data
- stores enough calculation context to support reproducibility

Likely metric groups:

- Total Seeds Tested
- Successfully Germinated
- Non-Germinated During Observation Window
- Observed Germination Rate
- numerator and denominator used in rate calculation
- observation window start/end
- first germination observation
- final observation timestamp
- method/report schema version

Mutable/immutable expectation:

- metric snapshot records tied to a published snapshot never mutate
- amended metrics require a new snapshot version

Lifecycle role:

- frozen calculation layer
- future certification eligibility input

Visibility expectation:

- internal-only in v1
- public-safe shape should be planned, but not exposed

### Immutable Session Snapshot Entity

Conceptual role:

- freezes which CSTP test-session links and Grow sessions were included in a report snapshot
- preserves relationship context without duplicating full Grow session ownership
- records KAN labels and included/excluded state at snapshot time

Likely relationships:

- references immutable snapshot
- references `cstp_test_sessions`
- references `grow_sessions`

Mutable/immutable expectation:

- records tied to a published snapshot never mutate
- future link archival or session edits do not alter published snapshot session records

Lifecycle role:

- historical session relationship evidence
- input context for metric and evidence reproducibility

Visibility expectation:

- internal-only in v1
- no Grow session expansion for public output yet

### Immutable Media/Evidence Reference Entity

Conceptual role:

- freezes evidence/media references selected for a report snapshot
- preserves publication-safe evidence identity and role labels
- avoids depending solely on mutable session/gallery presentation state

Likely evidence concepts:

- first germination image reference
- final observation image reference
- Multi-KAN observation evidence
- media role
- media source reference
- capture timestamp
- evidence availability state
- public-safe label/description later

Mutable/immutable expectation:

- evidence records tied to a published snapshot never mutate
- unavailable evidence should not rewrite metrics
- evidence corrections require a new snapshot version or amendment record later

Lifecycle role:

- future report evidence layer
- future public report media support

Visibility expectation:

- internal-only in v1
- public-safe metadata planning only

### Immutable Audit Linkage Concepts

Conceptual role:

- connect report roots, snapshots, publication actions, and future amendments to admin actor history
- extend the existing `cstp_admin_events` philosophy
- ensure snapshot generation and publication can be traced

Potential concepts:

- snapshot generated event
- snapshot validation failed event
- report prepared event
- report published event
- report superseded event
- amendment prepared event
- amendment published event

Mutable/immutable expectation:

- audit lineage should remain append-only
- published snapshot audit linkage must not be silently replaced

Lifecycle role:

- operational accountability
- publication trust history
- future certification traceability

Visibility expectation:

- internal-only in v1
- public reports may later expose limited safe publication metadata, not raw admin notes

## 5. Required Immutability Rules

The v1 schema implementation strategy must preserve these rules:

- published snapshots never mutate
- superseded snapshots remain historically accessible
- corrections or amendments create new historical versions
- report root state must not overwrite published snapshot evidence
- frozen metrics must not be recalculated for published output from live sessions
- `grow_sessions` remain canonical operational entities
- CSTP must not create CSTP-owned session forks
- CSTP report snapshots must not mutate `grow_sessions`
- session stage, timeline, analytics, notes, reminders, media, partitions, ownership, and visibility remain outside reporting mutation scope
- audit lineage remains append-only
- public exposure must not exist until immutable snapshots and publication rules are stable

## 6. First Slice Implementation Strategy

The first schema implementation should be additive and internal-only.

Recommended properties:

- create only new CSTP reporting tables
- do not modify `grow_sessions`
- do not modify existing CSTP v1 operational tables unless a reviewed FK is required later
- avoid destructive delete behavior
- prefer archive/supersession states where history matters
- include publication lock fields before public reads exist
- include versioning fields from the start
- keep certification references nullable or deferred
- keep public visibility disabled by default

The first slice should be reviewed as a migration plan before any SQL is written.

## 7. Recommended Implementation Sequencing

Recommended order:

1. Minimal immutable schema
2. Snapshot assembly helper planning
3. Frozen metric extraction planning
4. Immutable session summary extraction planning
5. Media/evidence reference planning
6. Immutable publication locking design
7. Immutable audit linkage design
8. Internal schema validation
9. Internal snapshot generation helpers
10. Report generation later
11. Certification eligibility later
12. Certifications later
13. Public read APIs later
14. Public UI later
15. Source Directory and Community Grow integration last

This sequencing keeps public trust systems downstream of immutable internal evidence.

## 8. Implementation Risks to Avoid

### Mutable Published Records

Published report snapshots must not be editable in place. Any correction should create a new versioned snapshot or amendment path.

### Duplicated Lifecycle Systems

Reporting should consume CSTP test status and snapshot publication state. It should not create a parallel CSTP test lifecycle engine.

### Frontend Trust Logic

The frontend must not determine report truth, certification eligibility, publication validity, or public trust state.

### Public Exposure Before Snapshot Stability

No public reports, public certifications, public badges, or public read APIs should exist before snapshot persistence, audit linkage, and publication locking are validated.

### Direct Operational/Report Coupling

Published reports should not be live projections of mutable operational records. Operational records can change; snapshots preserve the report evidence used at a point in time.

### Grow Session Mutation

Snapshot generation must not mutate `grow_sessions`. It should consume session evidence through CSTP relationships and freeze selected values into CSTP-owned snapshot records.

### Certification Shortcuts

Certification work should not begin until immutable report snapshots can support eligibility decisions historically.

### Unsafe Deletes

Deletes should not orphan published report snapshots, metric records, session snapshot records, evidence records, or certification history later.

## 9. Deferred Areas

Deferred until after v1 immutable snapshot schema stability:

- report generation implementation
- snapshot generation pipeline implementation
- publication workflow implementation
- report rendering
- public report APIs
- public report UI
- certification eligibility logic
- certification records/history
- Source Directory CSTP exposure
- Community Grow CSTP filters
- automation/notifications
- breeder/source portal access
- RLS/public policy design

## 10. Validation Expectations Before SQL

Before any migration is written, the next planning step should validate:

- exact table names
- exact field names
- FK targets and delete behavior
- versioning model
- publication lock model
- snapshot immutability enforcement strategy
- report audit event strategy
- whether report snapshots should use JSON payload sections, normalized child tables, or both
- how metric extraction will map to existing Grow session data
- how media/evidence references will map to current image/snapshot systems

## 11. Final Recommendation

The first immutable reporting implementation slice should be narrow, internal-only, additive, and schema-first.

It should establish report roots, immutable snapshots, frozen metrics, frozen session references, frozen evidence references, and audit linkage planning before any report generation, certification, public API, public UI, Source Directory exposure, or Community Grow integration begins.

