# CSTP Relational Data Planning Specification

## 1. Purpose

The Cannakan Seed Testing Program (CSTP) needs relational data planning before Supabase schema implementation so the certification system is built around clear ownership, durable history, and stable public reports. CSTP will depend on existing Cannakan Grow session evidence, Source Directory identity, observations, images, metrics, and report publication rules. Those relationships should be defined before tables, constraints, policies, or application code are added.

Relational planning prevents fragmented data ownership. Without a clear model, CSTP could accidentally duplicate source records, embed session data inside reports, store conflicting metric values in multiple places, or overwrite historical certification state during renewals. Those patterns would weaken analytics, complicate migrations, and make public reports harder to trust.

The central architectural requirement is that CSTP reports and certifications remain stable over time. A published report should continue to represent the reviewed evidence and methodology at the time it was prepared or published. A certification history should remain queryable even after a later test, renewal, expiration, or administrative correction.

## 2. Core System Objects

### Session

**Responsibility:** Represents a normal Cannakan Grow session, including device use, partitions, stage/timeline behavior, observations, germination outcomes, notes, images, and completion state.

**Ownership:** Owned by the core session system. CSTP may link to sessions but should not redefine session internals.

**Visibility:** May be private, shared, or public depending on normal session visibility rules and future publication settings.

**Persistence Expectations:** Sessions remain first-class records. Session data may be corrected according to normal app rules, but changes should not automatically mutate published CSTP report snapshots.

### CSTP Test

**Responsibility:** Acts as the parent orchestration object for a CSTP evaluation. It groups one or more linked session records, tracks intake context, source/variety/lot identity, testing purpose, administrative state, and report preparation status.

**Ownership:** Owned by the CSTP program layer.

**Visibility:** Primarily private/admin while in progress. Public visibility should come through approved report snapshots, certification records, and tested source enhancements.

**Persistence Expectations:** CSTP Tests should persist as the durable container for the certification event, even if individual child sessions are archived or marked unavailable.

### CSTP Test Session

**Responsibility:** Represents the relationship between a CSTP Test and a normal session used as part of that test. It identifies which sessions belong to a CSTP test and may store relationship-level role or ordering metadata.

**Ownership:** Owned by the CSTP program layer as a linking relationship; the underlying session remains owned by the core session system.

**Visibility:** Private/admin by default. Public report visibility should be mediated through report snapshots, not direct exposure of all linked session data.

**Persistence Expectations:** Links should be durable and auditable. Removing or archiving a link should not destroy the underlying session unless a separate session lifecycle rule requires it.

### CSTP Report Snapshot

**Responsibility:** Stores the frozen, report-ready representation of a CSTP Test at the time the report is prepared or published. It preserves approved metrics, narrative sections, methodology references, media selections, report ID, and publication state.

**Ownership:** Owned by the CSTP reporting layer.

**Visibility:** Private while draft or unpublished; public only after approval and publication.

**Persistence Expectations:** Published snapshots should be immutable in normal operation. Corrections should create controlled revisions or replacement snapshots rather than silently mutating public report history.

### CSTP Certification

**Responsibility:** Represents the certification outcome and lifecycle associated with a CSTP Test, such as Gold Certified, Silver Certified, CSTP Tested, Previously Tested, Expired Certification, or Report Unavailable.

**Ownership:** Owned by the CSTP certification layer.

**Visibility:** Public only when approved for display. Administrative decision history may remain private.

**Persistence Expectations:** Certifications are independent persistent records. They should survive report regeneration and remain queryable as historical certification events.

### Source

**Responsibility:** Represents a source in the global Cannakan Grow Source Directory ecosystem.

**Ownership:** Owned by the shared Source Directory system.

**Visibility:** Governed by Source Directory visibility rules.

**Persistence Expectations:** Sources are not duplicated for CSTP. A source can participate in normal sessions, CSTP tests, certifications, community snapshots, and future analytics through shared identity.

### Tested Source Enhancement

**Responsibility:** Adds CSTP public trust context to an existing Source Directory record, such as tested status, badge level, report availability, or previous testing state.

**Ownership:** Owned by the CSTP/Source Directory integration layer.

**Visibility:** Public only when the source has approved CSTP status appropriate for display.

**Persistence Expectations:** Enhancements should reference existing source and certification/report records. They should not become a separate source identity.

### Observation

**Responsibility:** Records time-based session evidence, including germination observations, stage changes, notes, and measurable events.

**Ownership:** Owned by the core session system.

**Visibility:** Private or public according to session/report publication rules.

**Persistence Expectations:** Observations remain linked to sessions. CSTP reports may select, summarize, or snapshot observation-derived values, but should not duplicate the full observation stream as the report source of truth.

### Snapshot/Image

**Responsibility:** Provides visual evidence associated with a session observation, final state, or report-approved media point.

**Ownership:** Owned by the session/media system, with CSTP report snapshots selecting approved public media references or frozen media metadata.

**Visibility:** Raw images may be private. Public report images must be explicitly approved for report display.

**Persistence Expectations:** Media used in a published report should remain available or be archived in a way that does not break public report references.

### Metrics Record

**Responsibility:** Represents calculated or stored metrics at a specific ownership boundary: session-level metrics, CSTP aggregated metrics, or frozen report metrics.

**Ownership:** Depends on metric type. Session metrics belong to sessions, CSTP aggregate metrics belong to CSTP tests, and frozen report metrics belong to report snapshots.

**Visibility:** Session metrics may be private or shared. CSTP aggregate metrics may be private until approved. Frozen report metrics become public only through published report snapshots.

**Persistence Expectations:** Metrics should not be duplicated without a clear boundary. Derived values should preserve their source relationship and calculation context.

## 3. Session Relationship Model

Normal grow sessions remain first-class objects in Cannakan Grow. CSTP sessions are still real sessions. CSTP must not duplicate session logic, observation handling, device support, partition charts, media capture, stage/timeline behavior, or completion rules.

The CSTP Test acts as an orchestration layer around one or more real sessions:

```text
CSTP Test
-> linked child session records
-> aggregated metrics
-> report snapshot generation
-> certification lifecycle
```

This model keeps the evidence-producing workflow inside the existing session system while allowing CSTP to add program-level meaning. The CSTP Test can define intake, grouping, review, status, reportability, and certification outcome without becoming a replacement for sessions.

## 4. Parent / Child Structure

Recommended hierarchy:

```text
Source
└── CSTP Tests
    └── Sessions
        ├── Observations
        ├── Images
        └── Metrics

CSTP Test
├── Report Snapshot
└── Certification State
```

The Source owns the shared identity. The CSTP Test owns the certification event and groups child session records. Sessions own their observations, images, and session-level metrics. Report snapshots own frozen public report values. Certification records own lifecycle and outcome state.

Sessions should not be embedded directly into reports. Reports are public or report-ready artifacts, while sessions are operational evidence records that may contain private notes, draft observations, internal corrections, and non-public media. Embedding sessions into reports would blur public/private boundaries and make report stability difficult to preserve.

## 5. Report Snapshot Strategy

CSTP reports should be generated from linked session data, then locked as report snapshots when prepared or published.

Published reports must remain stable even if underlying sessions later change. A session correction, note edit, media update, or administrative annotation should not silently alter a public report. If a public correction is necessary, the reporting system should create a controlled revision path rather than mutating the original published snapshot.

Source historical certifications must also remain historically accurate. A later renewal, expiration, or retest should not overwrite the factual record of an earlier certification.

### Editable Data

Editable data includes:

- Active session observations
- Draft session notes
- Draft CSTP administrative states
- Unpublished report drafts
- Unapproved media selections
- Pre-publication aggregate calculations

### Locked Data

Locked data includes:

- Published report metrics
- Published report media selections
- Report ID and version references
- Published certification status for that report
- Published methodology reference
- Public report narrative and summary language

### Archival Expectations

Published report snapshots and historical certifications should be retained in a way that preserves public references. If records are deprecated, corrected, or superseded, they should remain traceable through status and revision metadata rather than being overwritten or orphaned.

## 6. Certification Persistence Rules

Certifications should be independent persistent records, not temporary labels stored only on a source card or report view.

Certification records should:

- Survive report regeneration
- Remain queryable as historical certification events
- Link to their CSTP Test and published report snapshot when available
- Preserve original outcome, effective date, expiration date, and renewal relationship
- Avoid overwriting prior certifications during renewal or retesting

Expiration and renewal should create lifecycle continuity, not destructive mutation. A renewed certification may become the active public status, but prior certification records should remain historically available for audits, trend analysis, and trust context.

## 7. Public vs Private Data Boundaries

CSTP must maintain clear boundaries between private administrative evidence and public trust artifacts.

### Private/Admin

Private or administrative data includes:

- Internal notes
- Admin workflow states
- Request discussions
- Unpublished reports
- Failed tests
- Moderation/internal observations
- Non-public media
- Draft aggregate calculations

### Public

Public data includes only approved and intentionally published artifacts:

- Approved certifications
- Public report snapshots
- Approved metrics
- Tested source indicators
- Certification badge status
- Public report availability state

Private CSTP activity should not imply public certification. Participation in CSTP does not automatically create a public report, badge, or Source Directory enhancement.

## 8. Source Relationship Rules

Source Directory remains global and shared. CSTP enhances existing source records and should not duplicate sources for certification purposes.

A single source may have:

- Normal grow sessions
- CSTP tests
- Certifications
- Community snapshots
- Source Directory profile data
- Future analytics or reputation indicators

CSTP should reference the existing source identity when associating a test, certification, or report with a source. Tested Source Enhancements should be derived from approved CSTP state and displayed as trust context on the source, not stored as a separate source record.

## 9. Metrics Ownership Rules

Metric ownership should be based on the layer that creates or freezes the metric.

### Session-Originated Metrics

Session metrics remain the source of truth for observed session outcomes. These include germination percentage, time to germination, partition-level performance, observation timing, and session completion metrics.

### CSTP Aggregated Metrics

CSTP aggregate metrics are derived from linked child sessions. These may include multi-KAN consistency, combined observed germination rate, qualification threshold evaluation, and batch/lot-level assessment.

### Report Snapshot Metrics

Report snapshot metrics are frozen certification metrics captured at the time a report is prepared or published. These values preserve what was reviewed, approved, and presented publicly.

Session metrics should remain source-of-truth. CSTP aggregates should remain derived. Reports should preserve frozen certification metrics for public stability.

## 10. Deletion / Archive Strategy

This section defines conceptual lifecycle expectations only. It does not implement deletion behavior.

### Deleting a Session

If a session is deleted or made unavailable, CSTP must avoid broken public references. If the session contributed to a published report, the report snapshot should remain intact because it owns the frozen public values. Administrative views should indicate that the source session is deleted, archived, or unavailable.

### Archiving a CSTP Test

Archiving a CSTP Test should remove it from active administrative workflows without destroying historical certification or published report records. Linked sessions may remain accessible according to their own lifecycle rules.

### Preserving Historical Certifications

Historical certifications should be preserved even after expiration, renewal, failed retesting, or source profile changes. Historical certification records support trust, auditability, and long-term source performance analysis.

### Preserving Published Reports

Published report snapshots should remain available or redirect through controlled status handling. If a report is withdrawn, corrected, or superseded, the public reference should show a clear status rather than a broken or empty page.

### Preventing Broken Public References

Public routes and Source Directory links should resolve to one of the following states:

- Active public report
- Superseded report with replacement reference
- Withdrawn/unavailable report explanation
- Source Directory fallback

Public references should not depend directly on mutable session availability.

## 11. Future Schema Planning Guidance

Future Supabase work should use a normalized relational structure that preserves ownership boundaries and queryability.

Guidance for future schema planning:

- Keep sessions as first-class records.
- Model CSTP Tests as parent records linked to existing sessions.
- Use linking records for CSTP Test Session relationships.
- Store published report values in report snapshots.
- Keep certification records persistent and historically queryable.
- Avoid duplicated metrics storage unless the duplicate is a deliberate frozen snapshot.
- Avoid denormalized report mutation where report data silently changes with session edits.
- Preserve analytics paths from sessions, sources, observations, and metrics.
- Preserve historical certification integrity through lifecycle records rather than overwrites.
- Keep public visibility explicit and separate from administrative workflow state.

The schema should support both operational work and historical trust. It should be easy to ask which sessions produced a report, which certification was active at a point in time, what source was tested, and which public values were published.

## 12. Explicit Non-Goals

This document does not create or define implementation details for:

- SQL
- Supabase tables
- Supabase row-level security
- Automations
- Breeder portal workflows
- Report renderer implementation
- Application routes
- UI changes
- Backend services
- Authentication or administration code

This is a relational planning specification only. It defines object responsibilities, ownership relationships, persistence expectations, snapshot boundaries, visibility boundaries, and lifecycle relationships before schema implementation begins.

