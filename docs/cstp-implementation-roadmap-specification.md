# CSTP Implementation Roadmap Specification

## 1. Purpose

This document defines the recommended phased implementation sequence for the Cannakan Seed Testing Program (CSTP) inside Cannakan Grow. It converts the existing CSTP architecture, reporting, relational planning, schema planning, and schema definition draft work into a safe engineering roadmap.

This roadmap is informed by:

- `docs/cstp-standard-report-schema-reporting-framework.md`
- `docs/cstp-session-architecture-alignment-specification.md`
- `docs/cstp-relational-data-planning-specification.md`
- `docs/cstp-supabase-schema-planning-specification.md`
- `docs/cstp-supabase-schema-definition-draft.md`

Phased implementation is critical because CSTP touches core session evidence, Source Directory trust signals, public reports, certification history, administrative workflow, and future breeder/source communications. Building all of these at the same time would increase the risk of duplicated session logic, unstable report values, public-facing inconsistencies, and difficult migrations.

CSTP must protect the stability of the existing Grow App session system. Normal sessions remain the source of truth for observations, KAN/TRa device behavior, partition logic, stage/timeline data, images, notes, and session-level metrics. CSTP should extend that system through parent test records, report snapshots, certifications, and public trust indicators.

Backend structure, report generation, administrative workflow, public publishing, automation, and breeder/source access should not be built simultaneously. Each layer depends on the previous layer being stable enough to support credible public certification.

## 2. Guiding Principles

- The session system remains the source of truth for observed grow and test activity.
- CSTP extends the existing Cannakan Grow architecture instead of forking it.
- Public trust requires immutable report snapshots.
- Administrative workflows should stabilize before public exposure.
- Certifications require historical integrity across renewals, expiration, revocation, and replacement.
- Source Directory remains global and shared, with CSTP as an enhancement layer.
- Failed, draft, invalid, or internal tests should not become public trust signals by accident.
- Automation should come later, after workflow states and public/private boundaries are stable.
- Breeder/source portal access should come after internal administrative controls are proven.

## 3. Recommended Phase Order

### Phase 1 - Supabase Schema Foundation

**Scope:**

- Core CSTP tables
- Relationships between CSTP Tests, sessions, reports, certifications, and sources
- Status fields and conceptual enum mapping
- Migration planning
- Internal-only data structures
- Public/private visibility fields
- Audit-friendly timestamps and lifecycle markers

**Explicitly Exclude:**

- UI
- Automation
- Public publishing
- Breeder/source portal features
- Public Source Directory changes

**Purpose:**

Establish the relational foundation without exposing CSTP publicly. This phase should confirm that CSTP can store requests, tests, session links, report containers, snapshots, certifications, and admin events without duplicating session logic.

### Phase 2 - Internal Admin Workflow Foundation

**Scope:**

- Request intake
- Admin CSTP management
- Workflow states
- Internal-only test lifecycle
- Internal notes/events
- Administrative status changes
- Basic review and archival handling

**Exclude:**

- Public reports
- Public certifications
- Breeder portal
- Automation
- Source Directory publishing

**Purpose:**

Build the administrative workflow privately before any public trust signals are exposed. Admin users should be able to create, review, manage, and archive CSTP records without affecting public Source Directory or Community Grow surfaces.

### Phase 3 - Session Linkage System

**Scope:**

- Linking sessions to CSTP Tests
- Parent/child orchestration
- Multi-KAN grouping
- Inclusion/exclusion of sessions in reports
- Metrics aggregation planning
- Internal validation that CSTP sessions remain normal sessions

**Exclude:**

- Public publishing
- Report rendering
- Certification publishing
- Breeder portal access

**Purpose:**

Connect CSTP Tests to existing session records through a controlled join layer. This phase should prove that each KAN/TRa test run remains a normal session while CSTP provides orchestration across one or more linked sessions.

### Phase 4 - Report Snapshot Generation

**Scope:**

- Immutable report snapshots
- Snapshot freezing logic
- Report preparation lifecycle
- Historical consistency protection
- Frozen metrics, summary, source data, stage data, and certification data
- Draft vs published snapshot behavior

**Exclude:**

- Public breeder access
- Automation
- Public certification badges until snapshot rules are stable

**Purpose:**

Generate report snapshots from linked session data and freeze prepared or published values. This phase is the trust boundary between mutable operational records and stable public reports.

### Phase 5 - Certification Publishing Layer

**Scope:**

- Gold and Silver certification states
- CSTP Tested and Previously Tested states
- Public certification visibility
- Certification lifecycle handling
- Expiration, renewal, revocation, and replacement relationships
- Tested source indicators backed by approved certification state

**Exclude:**

- Breeder portal
- Automated renewals
- Public workflow automation

**Purpose:**

Publish certification outcomes only after report snapshot behavior is stable. Certification records should preserve history and should not overwrite prior outcomes during renewal or expiration.

### Phase 6 - Source Directory Integration

**Scope:**

- CSTP badges
- Report links
- Certification history display
- Tested-source enhancements
- Source Directory filters for tested/certified states
- Graceful unavailable or expired report handling

**Clarification:**

Source Directory remains shared and global. CSTP badges and report links enhance existing source records; they do not create a separate source system.

**Purpose:**

Make approved CSTP outcomes discoverable in the source ecosystem without exposing unfinished workflows or private tests.

### Phase 7 - Community Grow Integration

**Scope:**

- CSTP-tested filters
- Approved report discoverability
- Community trust indicators
- Read-only references to public approved certification/report states

**Exclude:**

- Failed tests
- Internal tests
- Draft reports
- Private administrative workflow states

**Purpose:**

Allow Community Grow to surface approved CSTP trust context after Source Directory integration is stable. Community Grow should never expose failed, internal, invalid, draft, or private CSTP activity.

### Phase 8 - Automation & Notifications

**Scope:**

- Report notifications
- Breeder/source communications
- Workflow reminders
- Status notifications
- Expiration and renewal reminders
- Internal administrative notification rules

**Clarification:**

Automation depends on stable workflows first. Notification and reminder logic should not be introduced until request, test, report, certification, and visibility states are reliable.

**Purpose:**

Add operational support after the lifecycle model is proven. Automation should reinforce stable workflow states rather than compensate for unclear process design.

### Phase 9 - Breeder / Source Portal

**Scope:**

- Source dashboards
- Certification access
- Report access
- Future source submissions
- Source-side request visibility
- Controlled breeder/source communication surfaces

**Clarification:**

The breeder/source portal should only happen after internal workflows stabilize and public report/certification visibility is proven.

**Purpose:**

Expose controlled CSTP access to source representatives only after the internal administrative process, report snapshots, certification lifecycle, and public/private boundaries are mature.

## 4. Dependency Mapping

Phase dependencies should be treated as sequential gates:

- Phase 2 depends on Phase 1 because admin workflow needs stable CSTP records and status fields.
- Phase 3 depends on Phase 1 because CSTP Tests and join records must exist before session linkage can be validated.
- Phase 4 depends on Phase 3 because report snapshots must be generated from linked session data.
- Phase 5 depends on Phase 4 because public certification should rely on immutable report output.
- Phase 6 depends on Phase 5 because Source Directory badges and report links require approved certification state.
- Phase 7 depends on Phase 6 because Community Grow should use public CSTP trust signals already proven in Source Directory.
- Phase 8 depends on stable Phases 2 through 5 because automation requires reliable lifecycle states.
- Phase 9 depends on stable Phases 2 through 8 because breeder/source access requires mature permissions, workflow, reporting, and communication behavior.

Systems that must stabilize before public exposure:

- Session linkage
- Report snapshot immutability
- Certification lifecycle
- Public/private visibility boundaries
- Source Directory fallback states
- Archive and withdrawal behavior

Systems that require immutable snapshot logic first:

- Public reports
- Certification badges tied to report evidence
- Source Directory report links
- Community Grow CSTP filters
- Certification history display

## 5. High-Risk Areas

### Duplicated Session Logic

Creating CSTP-specific session behavior would fragment observations, stage logic, partition behavior, metrics, and media handling. CSTP should link to normal sessions instead.

### Mutable Report Data

Public reports that read directly from live session data could change unexpectedly after publication. Report snapshots must preserve public values.

### Broken Certification History

Renewals, expirations, or revocations must not overwrite historical certification records. Certification lifecycle changes should remain traceable.

### Orphaned Linked Sessions

CSTP Tests should handle archived, deleted, hidden, or unavailable sessions without breaking published reports or internal audit history.

### Premature Public Exposure

Source Directory, Community Grow, and public report routes should not expose draft, failed, internal, invalid, or private CSTP activity.

### Unstable Admin Workflows

Admin workflow states should be proven internally before automation, public badges, certification publication, or breeder/source access is introduced.

## 6. Recommended Testing Strategy

### Internal-Only Testing First

Early testing should happen with internal records only. Test data should verify request handling, CSTP Test creation, session linkage, report preparation, certification state changes, and archival behavior without public exposure.

### Staged Rollout

Rollout should progress from internal admin workflows to controlled report snapshots, then certification publication, then Source Directory display, then Community Grow discovery, then automation and portal access.

### Report Validation

Report testing should confirm that generated snapshots contain the correct frozen metrics, source data, stage summaries, certification data, report version context, and public visibility state.

### Certification Consistency Validation

Certification testing should verify Gold, Silver, CSTP Tested, Previously Tested, Expired Certification, Revoked, and Report Unavailable states. Renewals should create historical continuity rather than overwriting prior records.

### Migration Safety Validation

Migration testing should verify that existing sessions, sources, observations, images, and metrics are not disrupted. CSTP schema changes should not require destructive changes to the normal Grow App session system.

## 7. Public Rollout Guidance

CSTP should begin as internal-only infrastructure. Public exposure should happen only after session linkage, report snapshots, certification lifecycle, and visibility rules are stable.

Limited public exposure should start with a small number of approved report snapshots and certification records. Source Directory badges and report links should be introduced only for approved public states.

Public trust considerations:

- Reports should use standardized terminology from the CSTP reporting framework.
- Public pages should make clear that results are observed under CSTP conditions and are not guarantees.
- Certifications should not be implied for tested-only or expired states.
- Report unavailable states should be graceful and transparent.
- Public badges should be subtle, evidence-backed, and tied to durable records.

Certification credibility depends on restraint. CSTP should avoid public claims before the underlying workflow can support them consistently.

## 8. Explicit Non-Goals

This document does not implement or create:

- SQL
- Migrations
- Schema file changes
- UI work
- App route changes
- Backend logic
- API layer
- Row-level security
- Automation implementation
- Breeder/source portal implementation
- Production rollout

This is an execution-planning roadmap only.

## 9. Final Recommendation

The CSTP architecture is now stable enough to guide phased engineering because the core boundaries are defined: sessions remain the evidence source, CSTP Tests orchestrate certification activity, report snapshots preserve public output, certifications persist historically, and Source Directory remains shared.

Future implementation should protect those boundaries. The most important engineering constraint is maintaining alignment with the existing Grow App session system. CSTP should gain program-specific structure without duplicating session logic or weakening analytics.

The second critical constraint is immutable report history. Public CSTP trust depends on stable, reviewable, historically accurate reports and certifications. Engineering work should therefore proceed in phases, with internal workflow and snapshot integrity proven before public publishing, automation, or breeder/source access begins.

