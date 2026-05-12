# CSTP Entity Relationship Model Specification

## 1. Purpose

This document validates the Cannakan Seed Testing Program (CSTP) relational architecture before SQL schema implementation begins. It defines the canonical entity relationship model for CSTP inside Cannakan Grow, including entity ownership, cardinality, lifecycle behavior, mutable and immutable record boundaries, and public/private data boundaries.

This specification is informed by:

- `docs/cstp-session-architecture-alignment-specification.md`
- `docs/cstp-relational-data-planning-specification.md`
- `docs/cstp-supabase-schema-planning-specification.md`
- `docs/cstp-supabase-schema-definition-draft.md`
- `docs/cstp-implementation-roadmap-specification.md`
- `docs/cstp-sql-migration-planning.md`
- `docs/cstp-architecture-master-index.md`
- `docs/cstp-existing-system-reuse-audit.md`
- `docs/cstp-backend-implementation-checklist.md`

CSTP relationships must remain aligned with the existing Grow session system. Sessions remain the source of truth for observed test activity, while CSTP adds orchestration, reporting, certification, and publication layers around linked sessions.

Immutable reporting and historical certifications require carefully defined ownership models. Published report snapshots and certification history should remain stable even when active sessions, administrative workflow records, or source display states change later.

This is an architecture validation document only. It does not create SQL, migrations, schema edits, backend logic, APIs, RLS, UI, routes, or frontend integration.

## 2. Core Entity Definitions

### Source

**Purpose:** Shared Source Directory identity for a seed source, breeder, vendor, or related source entity.

**Ownership Role:** Owned by the Source Directory system. CSTP references sources but does not create a separate source identity model.

**Mutable vs Immutable Expectations:** Source profile fields may remain mutable according to Source Directory rules. Historical CSTP certification records connected to a source should not be rewritten when source profile details change.

**Visibility Expectations:** Public or private according to Source Directory visibility rules. CSTP status appears publicly only through approved certifications, report snapshots, and tested-source indicators.

### Session

**Purpose:** Existing Cannakan Grow session representing real grow or test activity, including device use, partitions, observations, images, metrics, notes, timeline data, and completion state.

**Ownership Role:** Owned by the core Grow session system.

**Mutable vs Immutable Expectations:** Sessions may be mutable according to normal session rules. Published CSTP report snapshots must not mutate automatically when linked sessions change later.

**Visibility Expectations:** Governed by normal session ownership and visibility rules. Raw session data is not automatically public because it is linked to CSTP.

### CSTP Test

**Purpose:** Parent CSTP orchestration entity for a testing/certification event. It groups linked sessions and tracks CSTP-specific lifecycle state.

**Ownership Role:** Owned by the CSTP program layer.

**Mutable vs Immutable Expectations:** Active CSTP Test records may be mutable during intake, testing, review, and preparation. Once outputs are published, historical report and certification records must preserve released values independently.

**Visibility Expectations:** Private/admin by default. Public exposure comes through approved reports, certifications, and tested-source indicators.

### CSTP Test Session

**Purpose:** Join entity mapping CSTP Tests to existing sessions.

**Ownership Role:** Owned by the CSTP relationship layer. The underlying session remains owned by the core session system.

**Mutable vs Immutable Expectations:** Link records may be adjusted during active workflow. Published report snapshots should preserve any values needed for public report stability even if links later change.

**Visibility Expectations:** Private/admin by default. Public surfaces should not expose raw linkage records.

### Observation

**Purpose:** Time-based session evidence, including germination observations, stage events, notes, and measurable session activity.

**Ownership Role:** Owned by the core session system.

**Mutable vs Immutable Expectations:** Operational observations may be corrected according to session rules. Report snapshots freeze approved observation summaries when prepared/published.

**Visibility Expectations:** Private unless shared through normal session/public snapshot rules or approved report snapshots.

### Snapshot/Image

**Purpose:** Visual evidence associated with sessions, observations, public snapshots, or report-approved media points.

**Ownership Role:** Raw image ownership remains with the session/media system. CSTP report asset selection belongs to the CSTP reporting layer.

**Mutable vs Immutable Expectations:** Raw assets may follow normal media lifecycle rules. Published report media references should remain stable or resolve to controlled unavailable states.

**Visibility Expectations:** Raw media may be private. Public report media must be explicitly approved.

### Metrics Record

**Purpose:** Calculated or stored measurement data, including session metrics, CSTP aggregate metrics, and frozen report metrics.

**Ownership Role:** Session metrics are owned by sessions. CSTP aggregate metrics are owned by CSTP Tests. Frozen report metrics are owned by report snapshots.

**Mutable vs Immutable Expectations:** Active session and aggregate metrics may recalculate while work is in progress. Frozen report metrics are immutable once published.

**Visibility Expectations:** Public only when included in approved report snapshots or approved certification displays.

### CSTP Report

**Purpose:** Report workflow container for a CSTP Test, tracking report preparation, review, publication, withdrawal, supersession, and archival state.

**Ownership Role:** Owned by the CSTP reporting layer.

**Mutable vs Immutable Expectations:** Report workflow state may change. Published report content should live in immutable report snapshots.

**Visibility Expectations:** Draft/prepared reports are private/admin. Public reports expose approved snapshots.

### CSTP Report Snapshot

**Purpose:** Frozen report-ready representation generated from linked session data and CSTP review.

**Ownership Role:** Owned by the CSTP reporting snapshot layer.

**Mutable vs Immutable Expectations:** Draft snapshots may be regenerated. Published snapshots are immutable in normal operation.

**Visibility Expectations:** Private until approved and published. Public report pages should read from published snapshots.

### CSTP Certification

**Purpose:** Persistent CSTP outcome record, such as Gold Certified, Silver Certified, CSTP Tested, Previously Tested, Expired Certification, Revoked, or Report Unavailable.

**Ownership Role:** Owned by the CSTP certification lifecycle layer.

**Mutable vs Immutable Expectations:** Active display status may change through lifecycle fields, but historical certification events should not be overwritten.

**Visibility Expectations:** Public only when approved. Internal decision notes remain private.

### Certification History

**Purpose:** Source-facing historical record of CSTP certifications, renewals, expirations, revocations, report links, and public tested-source status over time.

**Ownership Role:** Owned by the CSTP/Source Directory integration layer.

**Mutable vs Immutable Expectations:** Historical records should be append-oriented or revision-safe. They should not be destructively overwritten by renewals.

**Visibility Expectations:** Public only for approved historical public certification states. Internal or failed outcomes remain private.

### CSTP Admin Event

**Purpose:** Internal audit record for CSTP workflow actions, decisions, status changes, report publication, withdrawal, renewal, expiration, and review events.

**Ownership Role:** Owned by the CSTP administrative layer.

**Mutable vs Immutable Expectations:** Admin events should be append-only in principle.

**Visibility Expectations:** Private/admin. Raw admin events should not be public report content.

### CSTP Request

**Purpose:** Intake entity for CSTP participation or testing requests before a CSTP Test is accepted or created.

**Ownership Role:** Owned by the CSTP intake layer.

**Mutable vs Immutable Expectations:** Mutable during request review. Accepted requests may link to CSTP Tests; rejected/archived requests should remain private.

**Visibility Expectations:** Private/admin by default. A request does not imply public certification or report publication.

## 3. Relationship Cardinality

Canonical relationship cardinality:

- Source to CSTP Tests = 1:N
- Source to Sessions = 1:N where sessions reference a source
- Source to CSTP Certifications = 1:N
- Source to Certification History = 1:N
- CSTP Request to CSTP Test = 0:1 or 1:1 after acceptance
- CSTP Test to CSTP Test Sessions = 1:N
- CSTP Test to Sessions = N:N through `cstp_test_sessions`
- Session to CSTP Tests = 0:N through `cstp_test_sessions`
- Session to Observations = 1:N
- Session to Snapshots/Images = 1:N
- Session to Session Metrics = 1:N or 1:1 depending on existing metric storage
- CSTP Test to CSTP Reports = 1:N
- CSTP Report to CSTP Report Snapshots = 1:1 for simple published reports or versioned 1:N for revisions
- CSTP Report Snapshot to CSTP Report Assets = 1:N if report asset records are used
- CSTP Test to CSTP Certifications = 1:N historically
- CSTP Certification to Certification History = 1:N or 1:1 depending on public history recording rules
- CSTP Test to CSTP Admin Events = 1:N

Sessions remain independently reusable outside CSTP. A session can exist with no CSTP relationship, and linking a session to CSTP must not alter its normal ownership, lifecycle, or reuse.

## 4. Ownership Direction

Canonical ownership hierarchy:

- Source owns source identity context.
- CSTP Request owns intake context before acceptance.
- CSTP Test orchestrates linked sessions and CSTP workflow state.
- CSTP Test Session owns the relationship between a CSTP Test and a Session.
- Sessions own observations, images, notes, partition data, timeline data, and session metrics.
- CSTP Reports own report workflow containers.
- CSTP Report Snapshots own immutable published report values.
- CSTP Certifications own historical certification status records.
- Certification History owns source-facing historical status lookup.
- CSTP Admin Events own internal audit trail entries.

Ownership should not be inverted. Reports should not own sessions. Certifications should not own sources. Source Directory should not own report snapshot data. CSTP should not own core session internals.

## 5. Mutable vs Immutable Entity Rules

### Mutable Entities

Mutable during normal workflow:

- CSTP requests
- CSTP Test workflow states
- Internal admin notes
- CSTP Admin Events as append-only additions
- Active test records
- Draft reports
- Draft report snapshots
- Session records according to normal session rules
- CSTP Test Session links before publication

### Immutable or History-Protected Entities

Immutable or history-protected after publication/issuance:

- Published report snapshots
- Historical certifications
- Frozen report metrics
- Historical certification states
- Published report asset references
- Report ID/version references
- Issued certification effective/expiration context

If a public report or certification requires correction, future implementation should prefer revision, supersession, withdrawal, or replacement records over silent mutation.

## 6. Public vs Private Entity Boundaries

### Private/Admin Entities and Data

Private/admin by default:

- CSTP intake requests
- Internal workflow states
- Admin events
- Internal notes
- Request discussions
- Unpublished reports
- Draft report snapshots
- Failed tests
- Invalidated tests
- Internal tests
- Non-public media
- Moderation/internal observations

### Public Entities and Data

Public only when approved:

- Approved report snapshots
- Approved certifications
- Tested-source indicators
- Historical public certification records
- Approved report assets
- Approved certification metrics
- Report Available / Report Unavailable public states

Participation in CSTP is not public certification. A CSTP Test does not become public unless approved report/certification visibility records expose it.

## 7. Session Reuse Relationship Mapping

CSTP extends existing sessions. Sessions are not duplicated.

Canonical mapping:

```text
CSTP Test
|-- CSTP Test Session
|   `-- Existing Session
|       |-- Observations
|       |-- Snapshots/Images
|       `-- Session Metrics
```

The CSTP Test provides orchestration. The CSTP Test Session provides linkage. The existing Session provides evidence. Report snapshots preserve the public representation of selected evidence.

Session architecture remains the source of truth for:

- Stage/timeline data
- Partition mechanics
- KAN/TRa device context
- Observations
- Images
- Notes
- Session metrics
- Completion state
- Session ownership

## 8. Certification History Flow

Certification lifecycle should be history-preserving.

Canonical flow:

```text
CSTP Test
|-- CSTP Report
|   `-- Published Report Snapshot
`-- CSTP Certification
    |-- Certification History Entry
    `-- Renewal/Replaced-By Link (optional)
```

Renewals create linked historical records rather than overwriting prior certifications. Expired certifications remain queryable. Revoked certifications preserve history and decision context. Reports remain attached to historical certifications so public trust records can be audited later.

Example certification chain:

```text
Certification A: silver_certified, issued_at 2026-06-01, expires_at 2027-06-01
`-- renewed by Certification B

Certification B: gold_certified, issued_at 2027-06-05, expires_at 2028-06-05
`-- current public certification
```

The previous certification remains historically available even if a later certification becomes current.

## 9. Archive/Delete Relationship Guidance

Archive behavior should be preferred over destructive deletion where trust history matters.

Guidance:

- Archiving a CSTP Test should not delete linked sessions.
- Archiving a report should not delete published report snapshots.
- Archiving or hiding a source should not erase historical certifications.
- Deleting or hiding a session should not destroy published report history.
- Published reports should never become orphaned.
- Certification history must remain intact across expiration, renewal, revocation, withdrawal, or source changes.
- Linked session references should remain stable or resolve to controlled unavailable states.
- Cascading deletes should not remove public report snapshots, certifications, or source certification history.

Public references should resolve to one of these safe states:

- Active published report
- Superseded report
- Withdrawn report
- Report unavailable
- Source archived
- Source Directory fallback

## 10. Future Query Path Guidance

Future schema and API work should support these query paths:

- Source to active certifications
- Source to certification history
- Source to public report snapshots
- Source to tested-source indicator state
- CSTP Test to linked sessions
- CSTP Test to reports
- CSTP Test to certifications
- Session to CSTP Test relationships
- Report to current published snapshot
- Report to prior snapshots or superseded versions
- Certification to supporting report snapshot
- Community Grow to CSTP tested/certified filters
- Source Directory to certification history and report links
- Admin workflow to requests, tests, reports, certifications, and admin events

These query paths should avoid reading mutable live session data for public report output.

## 11. ASCII Relationship Diagrams

### Core CSTP Relationship Model

```text
Source
`-- CSTP Tests
    |-- CSTP Test Sessions
    |   `-- Sessions
    |       |-- Observations
    |       |-- Snapshots/Images
    |       `-- Metrics
    |
    |-- Reports
    |   `-- Report Snapshots
    |
    `-- Certifications
        `-- Certification History
```

### Admin Workflow Relationships

```text
CSTP Request
|-- accepted/rejected/archived workflow state
`-- CSTP Test (when accepted)
    |-- CSTP Admin Events
    |-- Internal Notes
    |-- Linked Sessions
    |-- Draft Reports
    `-- Certification Decisions
```

### Report Snapshot Ownership Flow

```text
Sessions
|-- Observations
|-- Snapshots/Images
`-- Session Metrics
    |
    v
CSTP Test Aggregation
    |
    v
CSTP Report
    |
    v
CSTP Report Snapshot
|-- Frozen Metrics
|-- Frozen Source Data
|-- Frozen Stage Data
|-- Frozen Certification Data
`-- Approved Report Assets
```

### Certification Historical Chain

```text
Source
`-- CSTP Certification A
    |-- status: silver_certified
    |-- report_snapshot: Report Snapshot A
    `-- renewed_by: CSTP Certification B

Source
`-- CSTP Certification B
    |-- status: gold_certified
    |-- report_snapshot: Report Snapshot B
    `-- current_public_status: true
```

### Public Visibility Boundary

```text
Private/Admin
|-- CSTP Requests
|-- Admin Events
|-- Internal Notes
|-- Draft Reports
|-- Failed/Internal Tests
`-- Draft Snapshots

Approved Public
|-- Published Report Snapshots
|-- Approved Certifications
|-- Tested-Source Indicators
`-- Public Certification History
```

## 12. Relationship Risk Areas

### Duplicate Session Ownership

Risk: CSTP creates its own session records or owns core session fields.

Control: CSTP should link to existing sessions through CSTP Test Session records.

### Mutable Report Data

Risk: Public reports read live session values and change after publication.

Control: Public reports should read from immutable report snapshots.

### Orphaned Certification History

Risk: Certification records lose references to sources, reports, or CSTP Tests.

Control: Preserve historical references and use safe unavailable/superseded states.

### Broken Public References

Risk: Source Directory links or report routes point to deleted or private data.

Control: Public references should resolve to published snapshots or controlled fallback states.

### Duplicated Metrics Storage

Risk: Session metrics, CSTP aggregate metrics, and report metrics drift.

Control: Session metrics are source-of-truth, CSTP aggregates are derived, report metrics are frozen.

### Unsafe Cascading Deletes

Risk: Deleting sessions, sources, or tests destroys public report/certification history.

Control: Prefer archive behavior and avoid cascades into published trust records.

## 13. Final Validation Guidance

CSTP entity relationships are stable enough for controlled SQL planning when future implementation preserves the following rules:

- Sessions remain the source-of-truth evidence records.
- CSTP Tests orchestrate linked sessions without owning session internals.
- Report snapshots preserve public report values.
- Certifications preserve historical program outcomes.
- Source Directory remains the shared source identity system.
- Private/admin workflow records stay separate from approved public trust records.
- Archive and fallback behavior protect public references.

Session-system alignment remains foundational. Immutable reporting and historical certification integrity are required trust systems for CSTP. Future SQL, API, admin workflow, and UI work should be validated against this ERD before implementation.

## 14. Explicit Non-Goals

This document does not include or implement:

- SQL
- Migrations
- Schema edits
- Backend code
- App code
- APIs
- Row-level security
- Frontend integration
- UI changes
- Route changes
- Report renderer implementation
- Automation
- Breeder/source portal functionality
- Public rollout

This is an entity relationship model specification only.

