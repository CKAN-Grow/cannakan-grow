# CSTP Architecture Master Index

## 1. Purpose

This document is the canonical CSTP architecture reference for Cannakan Grow. It consolidates terminology, object definitions, ownership boundaries, lifecycle vocabulary, naming standards, and source-of-truth references across the CSTP planning documents.

Future CSTP implementation should align with the terminology and structure defined here. The goal is long-term architecture consistency across schema planning, SQL migration work, backend behavior, admin workflows, reporting, Source Directory integration, Community Grow discovery, automation, and future breeder/source access.

This master index exists to prevent:

- Terminology drift
- Duplicated concepts
- Inconsistent implementation language
- Schema naming inconsistencies
- Frontend/backend vocabulary mismatch
- Architecture fragmentation during future implementation

This is an architecture governance document only. It does not implement SQL, migrations, schema changes, row-level security, APIs, app code, routes, UI, automation, or public rollout behavior.

Current-state note: since this index was first created, CSTP v1 internal implementation has progressed through the schema foundation, helper/service layers, execution boundary, admin authorization, admin mutation APIs, admin read APIs, internal admin UI, and admin workflow reconciliation. Reports, certifications, public CSTP exposure, Source Directory integration, Community Grow integration, automation, and breeder/source portals remain deferred.

## 2. High-Level CSTP Architecture Overview

CSTP extends the existing Cannakan Grow session system. It should not fork, duplicate, or replace normal session behavior.

The canonical CSTP architecture is:

- Sessions remain the source of truth for observed grow and test activity.
- CSTP Tests orchestrate one or more linked sessions.
- CSTP Test Sessions map CSTP Tests to normal session records.
- The v1 schema foundation is implemented for internal request intake, CSTP Tests, admin events, and CSTP Test Sessions.
- Internal helper/service layers, the execution boundary, admin authorization, admin mutation APIs, admin read APIs, and the internal admin UI are implemented for v1 operational workflows.
- Reports should be generated from linked session data in a future phase.
- Published reports should read from immutable report snapshots when reporting is implemented.
- Certifications should persist historically and must not be overwritten by renewal, expiration, revocation, or replacement when certification work begins.
- Source Directory remains shared and global.
- Tested-source badges and report links enhance existing source records rather than creating a separate source system.
- Admin workflow, reporting, publishing, automation, and breeder/source access should be phased in after foundational data behavior is stable.

## 2.1 Current Implementation State

Implemented internal CSTP layers:

- CSTP migration v1: `cstp_requests`, `cstp_tests`, `cstp_admin_events`, and `cstp_test_sessions`.
- Internal helper/service modules under `src/services/cstp/internal/`.
- Internal execution boundary for request, test, and session-link writes.
- CSTP admin authorization helper.
- Admin mutation APIs for request creation/status updates, test creation/status updates, and session-link creation/archival.
- Admin read APIs for request list/detail, test list/detail, and session-link list.
- Internal admin UI for request queue/detail, request status actions, test creation, test management, and session-link relationship management.
- Admin workflow reconciliation: the API-backed workflow is the canonical internal operational path; older static/admin-preview session and report routes are isolated back to the canonical admin workflow.
- Immutable reporting, report snapshot schema, publication workflow, and snapshot generation pipeline planning documents exist.

Still deferred:

- report schema migrations
- report generation
- report publication
- certifications
- public report APIs
- public report UI
- public CSTP badges
- Source Directory CSTP integration
- Community Grow CSTP integration
- automation
- breeder/source portals
- CSTP-specific RLS policies

## 3. Canonical Object Definitions

### Session

**Definition:** A normal Cannakan Grow session representing real grow or seed testing activity, including device use, partitions, observations, timeline/stage data, images, notes, metrics, and completion state.

**Ownership:** Core Cannakan Grow session system.

**Lifecycle Role:** Source-of-truth operational evidence. CSTP may link to sessions but should not redefine session behavior.

**Visibility Expectations:** Governed by normal session visibility and ownership rules. CSTP public reports should read from report snapshots, not mutable session records.

### CSTP Test

**Definition:** Parent CSTP orchestration object for a certification/testing event. It groups one or more linked sessions and tracks CSTP-specific testing lifecycle state.

**Ownership:** CSTP program layer.

**Lifecycle Role:** Durable container for intake context, source/variety/lot association, linked session grouping, review state, report preparation, certification outcome, and archival status.

**Visibility Expectations:** Private/admin by default. Public visibility should be exposed through approved report snapshots, certifications, and tested-source indicators.

### CSTP Test Session

**Definition:** Join relationship connecting a CSTP Test to an existing normal session.

**Ownership:** CSTP relationship layer. The underlying session remains owned by the core session system.

**Lifecycle Role:** Enables multi-KAN and multi-session CSTP testing without duplicating session logic.

**Visibility Expectations:** Private/admin by default. Public surfaces should expose approved report or certification output, not raw linkage records.

### CSTP Report

**Definition:** Report workflow container for a CSTP Test. It tracks report preparation, review, publication, archival, withdrawal, or supersession state.

**Ownership:** CSTP reporting layer.

**Lifecycle Role:** Manages report lifecycle and points to one or more report snapshots.

**Visibility Expectations:** Draft and prepared reports are private/admin. Published reports become public only through approved snapshots.

### CSTP Report Snapshot

**Definition:** Frozen report representation generated from linked session data and CSTP review. It stores report-ready values at a specific point in time.

**Ownership:** CSTP reporting snapshot layer.

**Lifecycle Role:** Stable public/report-ready record. Once published, a snapshot should be treated as immutable.

**Visibility Expectations:** Draft snapshots are private. Published snapshots may be public when approved.

### CSTP Certification

**Definition:** Persistent CSTP outcome record such as Gold Certified, Silver Certified, CSTP Tested, Previously Tested, Expired Certification, Revoked, or Report Unavailable.

**Ownership:** CSTP certification lifecycle layer.

**Lifecycle Role:** Historical certification event connected to a CSTP Test, source, and optionally a report snapshot. Renewals or replacements should create continuity without overwriting prior records.

**Visibility Expectations:** Approved certification status may be public. Internal decision notes and administrative reasoning remain private.

### Source

**Definition:** Shared Source Directory identity for a seed source, breeder, vendor, or related source entity.

**Ownership:** Source Directory system.

**Lifecycle Role:** Global source identity used by normal sessions, CSTP Tests, certifications, reports, Community Grow references, and future analytics.

**Visibility Expectations:** Governed by Source Directory visibility rules. CSTP enhances source records only when approved public status exists.

### Tested Source

**Definition:** A Source Directory record with approved CSTP testing or certification context attached.

**Ownership:** CSTP and Source Directory integration layer.

**Lifecycle Role:** Public trust enhancement for existing source records. It may show tested, certified, previously tested, report available, or report unavailable states.

**Visibility Expectations:** Public only when backed by approved CSTP report/certification state. Failed, draft, invalid, internal, or private CSTP activity should not create tested-source display.

### Observation

**Definition:** Time-based session evidence such as germination observation, stage event, note, or measurable test/grow event.

**Ownership:** Core session system.

**Lifecycle Role:** Operational evidence used by session metrics and CSTP report generation.

**Visibility Expectations:** Private or public according to session/report publication rules. CSTP snapshots may include approved summarized observation data.

### Metrics

**Definition:** Calculated or stored values describing session outcomes, CSTP aggregate results, or frozen report metrics.

**Ownership:** Session metrics belong to sessions. CSTP aggregate metrics belong to CSTP Tests. Frozen public metrics belong to report snapshots.

**Lifecycle Role:** Session metrics are source-of-truth for observed outcomes. CSTP aggregates derive from linked sessions. Report metrics preserve published values.

**Visibility Expectations:** Public only when included in approved report snapshots or certification display.

### Snapshot/Image

**Definition:** Visual evidence associated with a session observation, stage, final state, or approved report media point.

**Ownership:** Session/media system for raw assets; CSTP reporting layer for approved report asset selections.

**Lifecycle Role:** Supports observational transparency and report evidence.

**Visibility Expectations:** Raw media may remain private. Public report media must be explicitly approved and preserved through report snapshot or report asset references.

### Admin Event

**Definition:** Internal CSTP audit record for workflow actions, decisions, status changes, report preparation, publication, withdrawal, renewal, expiration, or review events.

**Ownership:** CSTP administrative layer.

**Lifecycle Role:** Internal audit trail for CSTP governance and operational accountability.

**Visibility Expectations:** Private/admin. Public reports may include approved summaries, but raw admin events should not be public.

## 4. Shared vs CSTP-Specific Concepts

### Shared Concepts

The following belong to the existing Cannakan Grow architecture and should remain shared:

- Sessions
- Partitions
- Observations
- Metrics
- Timeline logic
- Stage logic
- Snapshots/images
- Source identities
- KAN/TRa device support
- Session completion logic
- Session-owned notes
- Analytics-friendly session data

### CSTP-Specific Concepts

The following belong to CSTP-specific extension layers:

- Certification lifecycle
- Report snapshots
- CSTP orchestration
- Admin workflows
- Qualification states
- Certification publishing
- Tested-source indicators
- Report visibility
- Report withdrawal/supersession
- Source certification history
- CSTP request intake

CSTP should add these concepts without duplicating shared session or source responsibilities.

## 5. Canonical Lifecycle Vocabulary

The following lifecycle terms should remain consistent across future schema, admin UI, reporting, APIs, automation, and documentation.

### Request Received

A CSTP request has been submitted or captured, but has not yet been accepted into an active CSTP Test.

### Accepted

A CSTP request has been reviewed and approved to proceed into testing or administrative preparation.

### Seeds Received

The physical sample or seed lot associated with a CSTP Test has been received and is ready for test preparation.

### Active Test

One or more linked sessions are in progress as part of a CSTP Test.

### Completed

The operational testing window or linked sessions have completed. Completion does not automatically mean certification or report publication.

### Report Prepared

A report has been generated or assembled for review. Report values may be frozen for preparation, but public publication has not necessarily occurred.

### Published

An approved report snapshot, certification, or tested-source indicator is publicly visible.

### Archived

A record is retained for history but removed from active workflows. Archived does not mean deleted.

### Expired

A certification or tested-source status is no longer active because its validity window has ended.

### Revoked

A certification has been withdrawn or invalidated by CSTP administrative decision. Revocation should not delete historical records.

### Renewed

A later certification continues or replaces a prior certification through a new certification event. Renewal should preserve historical continuity.

## 6. Canonical Status Guidance

These status categories are conceptual terminology guidance only. They do not implement database enums.

### Requests

Implemented v1 request status terminology:

- `received`
- `accepted`
- `awaiting_seeds`
- `declined`
- `archived`

Future intake states such as `draft`, `submitted`, or `under_review` may be revisited only if public/source-submitted intake workflows are implemented later.

### Tests

Implemented v1 test status terminology:

- `pending`
- `active`
- `completed`
- `archived`

Future report-review states such as `under_review`, `report_prepared`, `published`, or `invalidated` belong to later report/publication layers, not the v1 `cstp_tests.status` field.

### Reports

Approved report status terminology:

- `draft`
- `prepared`
- `published`
- `superseded`
- `withdrawn`
- `archived`

### Certifications

Approved certification status terminology:

- `not_certified`
- `tested_only`
- `gold_certified`
- `silver_certified`
- `previously_tested`
- `expired`
- `revoked`
- `report_unavailable`

### Visibility

Approved visibility terminology:

- `private`
- `admin_only`
- `source_visible`
- `public`
- `withdrawn`

## 7. Naming Standards

Future implementation should use consistent naming across database, backend, APIs, admin UI, and frontend display logic.

### Tables

- Use snake_case database table names.
- Prefix CSTP-owned tables with `cstp_`.
- Use shared table names without CSTP prefixes when they belong to the existing system, such as `sessions` and `sources`.
- Use join table names that describe both sides of the relationship, such as `cstp_test_sessions`.

### Fields

- Use snake_case field names.
- Use `*_id` for relationship fields.
- Use `*_at` for timestamps.
- Use boolean flags sparingly and only where a status field is not more expressive.
- Use status fields for lifecycle state, not display text.

### Relationships

- Use explicit relationship names such as `source_id`, `cstp_test_id`, `session_id`, `report_id`, and `certification_id`.
- Avoid ambiguous fields such as `item_id`, `parent_id`, or `record_id` unless the relationship is intentionally polymorphic.

### Reports

- Use `cstp_reports` for report workflow containers.
- Use `cstp_report_snapshots` for frozen report data.
- Use `cstp_report_assets` for approved report media references when needed.

### Snapshots

- Use snapshot terminology only for frozen or report-ready records.
- Do not use snapshot terminology for mutable live session data.

### Certification Records

- Use `cstp_certifications` for persistent certification lifecycle records.
- Use `source_certification_history` for source-facing historical lookup and display support.
- Do not store certification history only as a mutable source badge field.

### Timestamps

Use consistent timestamp names:

- `created_at`
- `updated_at`
- `started_at`
- `completed_at`
- `prepared_at`
- `published_at`
- `issued_at`
- `expires_at`
- `archived_at`
- `revoked_at`
- `superseded_at`

### Visibility Fields

- Use `visibility` or `public_visibility` consistently for public/private exposure rules.
- Do not infer public visibility only from certification status.
- Do not infer public visibility only from report status.

### Archive Flags

- Prefer lifecycle timestamps such as `archived_at` where history matters.
- Boolean `archived` may be used for simple implementation drafts, but future schema should consider whether `archived_at` gives better auditability.

## 8. Source-of-Truth Mapping

The CSTP documents govern the following areas:

- `docs/cstp-standard-report-schema-reporting-framework.md`: report purpose, report structure, required report fields, public terminology, germination result logic, certification outcome language, media standards, verification standards, and future report expansion.
- `docs/cstp-session-architecture-alignment-specification.md`: session relationship model, CSTP as an extension of normal sessions, shared session logic, multi-KAN parent/child model, report data strategy, and Source Directory/Community Grow alignment.
- `docs/cstp-relational-data-planning-specification.md`: system entities, object ownership, parent/child relationships, persistence expectations, snapshot boundaries, public/private data boundaries, metrics ownership, and deletion/archive expectations.
- `docs/cstp-supabase-schema-planning-specification.md`: planned table architecture, relationship concepts, public/admin data separation, RLS planning notes, query patterns, indexing planning, and archive/delete strategy.
- `docs/cstp-supabase-schema-definition-draft.md`: implementation-oriented table definitions, expected fields, conceptual statuses, relationship definitions, archive/delete expectations, future RLS expectations, and query/performance considerations.
- `docs/cstp-implementation-roadmap-specification.md`: phased rollout sequencing, implementation dependencies, risk areas, testing strategy, and public rollout guidance.
- `docs/cstp-sql-migration-planning.md`: safe migration order, migration principles, dependency graph, session compatibility expectations, foreign key strategy, rollback considerations, staging/testing, and production deployment sequence.
- `supabase/migrations/20260511222737_cstp_migration_v1.sql`: implemented internal-only CSTP v1 schema foundation.
- `docs/cstp-admin-api-integration-audit.md`: completed admin API surface, authorization behavior, mutation/read API boundaries, and session compatibility checks.
- `docs/cstp-admin-ui-architecture-plan.md`: admin UI architecture principles and initial UI structure.
- `docs/cstp-admin-ui-integration-audit.md`: completed internal admin UI capabilities, API integrations, workflow coverage, and public exposure boundaries.
- `docs/cstp-admin-workflow-reconciliation-audit.md`: reconciliation of older static/admin-preview flows with the canonical API-backed workflow.
- `docs/cstp-loose-ends-stabilization-audit.md`: stabilization findings, loose ends, and recommended next implementation order.
- `docs/cstp-immutable-reporting-architecture-plan.md`: immutable reporting principles, snapshot architecture concepts, audit requirements, certification relationship planning, and public exposure boundaries.
- `docs/cstp-report-snapshot-schema-plan.md`: conceptual future report snapshot schema entities and frozen content planning.
- `docs/cstp-report-publication-workflow-plan.md`: draft/prepared/published workflow planning, immutable audit linkage, and superseded/amended lineage.
- `docs/cstp-snapshot-generation-pipeline-plan.md`: future snapshot extraction, metric freezing, media/evidence capture, failure handling, and implementation sequencing.

When documents overlap, this master index should be used for canonical terminology and architecture vocabulary. The area-specific documents remain authoritative for their respective implementation planning domains.

## 9. Implementation Boundaries

The following still do not exist as implemented CSTP production systems:

- Report/snapshot SQL migrations
- Certification SQL migrations
- Supabase row-level security policies for CSTP
- Report renderer
- Breeder/source portal
- CSTP automation
- Public CSTP rollout
- Public submission workflow
- Live certification workflow
- Live report publishing workflow
- Public CSTP report APIs
- Public CSTP report UI
- Source Directory CSTP integration
- Community Grow CSTP integration

Implemented internal systems currently remain admin-only and v1-scoped. The active implemented layer covers CSTP request/test/session-link operations only; public reporting, certifications, and integrations remain future phases.

## 10. Future Implementation Sequence Summary

Recommended future sequence:

1. Stabilize the implemented internal admin workflow.
2. Update governance/current-state documentation as implementation phases complete.
3. Add targeted CSTP helper/API/admin UI smoke tests.
4. Plan and implement report snapshot schema.
5. Build snapshot generation helpers and validation.
6. Implement internal report preparation and immutable publication workflow.
7. Add immutable audit linkage for report publication.
8. Implement certification eligibility and certification history.
9. Add public read APIs only after immutable report/certification records are stable.
10. Add public report UI.
11. Add Source Directory integration.
12. Add Community Grow integration.
13. Add automation.
14. Add breeder/source portal.

Implementation should begin with additive, internal-only CSTP structures. Public features should wait until session linkage, report snapshots, certification lifecycle, and visibility boundaries are stable.

## 11. Final Governance Guidance

Future CSTP implementation should preserve session-system alignment. Sessions are the evidence source. CSTP Tests orchestrate linked sessions. Report snapshots preserve public report output. Certifications preserve historical outcomes. Source Directory remains the shared public source system.

Immutable reports and historical certifications are foundational trust systems for CSTP. They should be treated as durable public records, not mutable UI state.

CSTP should remain additive to Cannakan Grow, not a parallel platform. Every future migration, API, admin workflow, report surface, Source Directory enhancement, Community Grow filter, automation, and breeder/source feature should be evaluated against that principle.
