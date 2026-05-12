# CSTP Initial SQL Migration Scope Definition

## 1. Purpose

This document defines the exact scope of the first CSTP SQL migration phase before any SQL is written. It bridges CSTP planning architecture and the first real implementation slice.

The first migration scope must remain intentionally small. CSTP should validate internal orchestration, session linkage, administrative lifecycle tracking, and compatibility with the existing Grow session system before introducing public trust systems such as certifications, immutable public reports, public badges, breeder portals, automation, or advanced analytics.

This document is informed by:

- `docs/cstp-supabase-schema-definition-draft.md`
- `docs/cstp-implementation-roadmap-specification.md`
- `docs/cstp-sql-migration-planning.md`
- `docs/cstp-backend-implementation-checklist.md`
- `docs/cstp-entity-relationship-model-specification.md`
- `docs/cstp-existing-system-reuse-audit.md`

Protecting the existing Grow session system is the highest priority. The first migration should add CSTP-owned structures around existing sessions without changing normal session behavior.

This is not implementation work. It does not write SQL, create migrations, modify schema files, modify app/backend/UI/routes, implement APIs, or implement RLS.

## 2. Guiding Principles

- The first CSTP implementation should be additive only.
- All v1 CSTP records should be internal-only.
- No public publishing should exist in v1.
- Sessions remain the source of truth for observed test activity.
- CSTP should validate orchestration before certifications and reports.
- CSTP should link to existing sessions rather than duplicating them.
- Migration risk should be minimized.
- Public trust systems should wait until internal workflow and relationships are proven.
- Rollback should remain practical because no public data depends on v1 records.

## 3. Recommended Migration v1 Scope

The first migration should include only the foundational internal CSTP tables needed to validate orchestration and session linkage.

Recommended included tables:

- `cstp_requests`
- `cstp_tests`
- `cstp_admin_events`
- `cstp_test_sessions`

### cstp_requests

**Purpose:** Captures internal CSTP intake before a test is accepted or created.

**Why It Belongs in v1:** Intake is the earliest administrative object in the CSTP workflow. It allows the team to validate request capture, internal review status, and conversion into a CSTP Test without creating public claims.

**Dependencies:** May reference existing `sources` if a source is already known. It should not require public Source Directory changes.

**Relationship Role:** Optional upstream record for `cstp_tests`. A request may lead to a CSTP Test after internal acceptance.

### cstp_tests

**Purpose:** Parent CSTP orchestration record for an internal testing event.

**Why It Belongs in v1:** CSTP Tests are the central parent entity. They validate the core architecture: CSTP orchestrates linked normal sessions rather than replacing them.

**Dependencies:** May reference existing `sources` and optionally `cstp_requests`.

**Relationship Role:** Parent record for linked sessions and admin events. Future phases may attach reports and certifications to this entity.

### cstp_admin_events

**Purpose:** Internal audit trail for CSTP workflow actions, status changes, notes, and administrative decisions.

**Why It Belongs in v1:** Admin workflow needs traceability before public publishing or certification decisions exist. Event history helps validate internal lifecycle behavior safely.

**Dependencies:** References `cstp_tests`. May later reference admin users depending on implementation details.

**Relationship Role:** Child event log for CSTP Tests. Records internal actions without exposing them publicly.

### cstp_test_sessions

**Purpose:** Join table linking CSTP Tests to existing normal session records.

**Why It Belongs in v1:** Session linkage is the core architectural validation point. CSTP must prove it can group child sessions through a parent CSTP Test without duplicating or mutating session behavior.

**Dependencies:** References `cstp_tests` and existing `sessions`.

**Relationship Role:** Parent/child mapping layer. Enables multi-KAN orchestration and future report aggregation from linked sessions.

## 4. Existing Shared Dependencies

The v1 migration should rely on existing Cannakan Grow systems:

- `sessions` already exist.
- `sources` already exist.
- Session observations, images, partition data, timeline fields, notes, and metrics already exist.

v1 should reuse these existing systems rather than duplicate them. It should not introduce parallel session, source, observation, image, or metrics ownership.

The first migration should not require:

- Existing session table rewrites
- Session data backfills
- Source Directory structural changes
- Public Source Directory CSTP display fields
- Community Grow CSTP filter changes
- Report or certification tables

## 5. v1 Capabilities

Migration v1 should support:

- Intake workflow
- Internal CSTP test creation
- Linking sessions to CSTP Tests
- Internal admin lifecycle tracking
- Multi-KAN orchestration validation
- Basic archive/status handling for internal CSTP records
- Relationship validation between CSTP Tests and existing sessions

v1 should not support public publishing. Public reports, certification badges, Source Directory public CSTP integration, Community Grow CSTP filters, breeder/source access, and automation should remain unavailable.

## 6. Explicitly Deferred Systems

### cstp_reports

Deferred because report workflow depends on stable CSTP Tests and session linkage. Reports should not be introduced until orchestration is validated.

### cstp_report_snapshots

Deferred because immutable snapshots require a proven report generation path and stable linked-session aggregation.

### cstp_certifications

Deferred because certification publishing depends on report/report-snapshot trust boundaries and validated lifecycle rules.

### source_certification_history

Deferred because source-facing history should be created only after certification records and public visibility states are stable.

### Public Report Pages

Deferred because public report pages require immutable snapshots, approved public visibility, and graceful unavailable-state handling.

### Public Badges

Deferred because badges must be backed by durable certification records and should not be derived from internal workflow state.

### Source Directory Public CSTP Integration

Deferred because Source Directory should only expose approved CSTP states after public report/certification foundations are stable.

### Community Grow CSTP Filters

Deferred because Community Grow should not expose draft, failed, internal, or unapproved CSTP activity.

### Automation

Deferred because automation depends on stable lifecycle states and validated workflows.

### Breeder/Source Portals

Deferred because external access requires mature ownership, visibility, notification, and permission models.

### External APIs

Deferred because API contracts should wait until table behavior, lifecycle states, and public/private boundaries are stable.

### Public Report Visibility

Deferred because public visibility depends on immutable snapshots, certification lifecycle, and approved publication controls.

## 7. Internal-Only Validation Goals

Engineering should validate the following before expanding CSTP beyond v1:

- Existing session compatibility
- Parent/child CSTP orchestration
- Session linkage integrity
- Multi-KAN grouping behavior
- Admin workflow stability
- Admin event traceability
- Archive behavior
- Orphan prevention
- Migration safety
- Rollback confidence
- No duplicate source/session/metrics ownership

## 8. Risk Reduction Strategy

Limiting the first migration scope reduces rollback risk. If v1 remains internal-only and additive, engineering can validate CSTP foundations without public dependencies or irreversible trust records.

Public trust systems require stable foundations first. Immutable reports, certifications, public badges, Source Directory integration, Community Grow filters, automation, and breeder/source access should come later because they depend on correct parent/child orchestration and reliable session linkage.

The v1 slice should answer one core question: can CSTP safely orchestrate existing sessions internally without disrupting the Grow App?

## 9. Migration Safety Guidance

Migration v1 should follow these safety rules:

- Use additive migrations only.
- Avoid touching existing session behavior.
- Avoid destructive changes.
- Avoid public exposure during validation.
- Avoid schema changes that require session backfills.
- Avoid cascading deletes that can remove session evidence.
- Prefer archive/status behavior for CSTP-owned records.
- Keep CSTP data private/admin until visibility rules are implemented later.
- Confirm Source Directory and Community Grow remain unchanged.

## 10. Future Migration Expansion Path

Future phases may later add:

- Reports
- Report snapshots
- Report assets
- Certifications
- Certification history
- Public visibility fields
- Source Directory tested-source enhancements
- Community Grow CSTP filters
- Automation
- Breeder/source access
- External APIs

These expansions should happen only after v1 stabilizes. The next migration phase should be selected based on validated internal workflow results, not public launch pressure.

## 11. Success Criteria for Migration v1

Migration v1 is successful only when:

- Existing sessions are unaffected.
- CSTP Test orchestration is stable.
- CSTP-to-session relationships are validated.
- Internal admin workflows are stable.
- Multi-KAN grouping can be represented.
- No duplicated session logic exists.
- No orphaned CSTP/session references are produced.
- Archive behavior is defined and safe.
- Rollback confidence is established.
- No public CSTP data is exposed.
- Source Directory remains shared and unchanged.
- Community Grow remains unchanged.

## 12. Explicit Non-Goals

Migration v1 does not include:

- SQL in this document
- Migrations in this document
- Implementation
- Public rollout
- Immutable reports
- Certifications
- Public badges
- Public report pages
- Source Directory public CSTP integration
- Community Grow CSTP filters
- Automation
- Breeder/source portals
- External APIs
- RLS implementation
- UI work
- Backend integration

This document defines scope only.

## 13. Final Recommendation

The first CSTP implementation should remain intentionally narrow. Internal orchestration stability matters more than public features.

Migration v1 should introduce only the minimum CSTP-owned foundation needed to validate intake, parent CSTP Tests, admin events, and links to existing sessions. Immutable reports and certifications should arrive only after foundational stability is proven.

This approach protects the Grow session system, reduces rollback risk, and gives CSTP a clean path toward public trust systems without prematurely exposing unfinished architecture.

