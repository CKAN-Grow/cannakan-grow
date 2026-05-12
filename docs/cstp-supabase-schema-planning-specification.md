# CSTP Supabase Schema Planning Specification

## 1. Purpose

This document defines the planned Supabase database structure for the Cannakan Seed Testing Program (CSTP) before SQL migrations are written. It translates the CSTP Standard Report Schema and Reporting Framework, the CSTP Session Architecture Alignment Specification, and the CSTP Relational Data Planning Specification into database-ready planning.

Schema planning comes after relational planning because the object ownership model must be clear before tables, constraints, indexes, or row-level security policies are introduced. CSTP depends on existing Cannakan Grow sessions, sources, observations, images, and metrics. Those relationships should be preserved in the database design instead of duplicated through a parallel certification system.

Schema planning comes before SQL implementation so the future migration work can follow intentional boundaries:

- Sessions remain first-class records.
- CSTP Tests orchestrate certification activity without replacing sessions.
- Reports are generated from linked session data and locked as snapshots.
- Certifications persist historically.
- Source Directory remains shared, with CSTP as an enhancement layer.
- Public data is separated from administrative and private workflow data.

This is a planning document only. It does not define SQL, migrations, policies, app code, routes, UI behavior, or backend implementation.

## 2. Core Table Concepts

### sessions

**Purpose:** Existing Cannakan Grow session records. Sessions represent actual grow or test activity, including device use, partitions, observations, images, metrics, notes, source references, and completion state.

**Ownership:** Core Cannakan Grow session system.

**Likely Key Fields:** `id`, `user_id`, `source_id`, `device_type`, `seed_type`, `seed_sex`, `seed_age`, `status`, `started_at`, `completed_at`, `visibility`.

**Relationship to Other Tables:** Linked to CSTP through `cstp_test_sessions`. May relate to observations, images, metrics, and sources through existing or future session-owned tables.

**Public/Private Visibility:** User-owned by default. Public visibility depends on normal session publication rules or approved CSTP report snapshot usage.

**Lifecycle Expectations:** Sessions remain mutable according to normal app rules. Published CSTP report snapshots should not read directly from live session values.

### sources

**Purpose:** Existing Source Directory records representing seed sources, breeders, or vendors in the shared Cannakan Grow ecosystem.

**Ownership:** Shared Source Directory system.

**Likely Key Fields:** `id`, `name`, `slug`, `type`, `location`, `visibility`, `status`, `created_at`, `updated_at`.

**Relationship to Other Tables:** Referenced by sessions, CSTP requests, CSTP tests, certifications, report snapshots, and source certification history.

**Public/Private Visibility:** Governed by Source Directory visibility rules. CSTP status may enhance public display only when approved.

**Lifecycle Expectations:** Sources should not be duplicated for CSTP. A single source may accumulate normal sessions, CSTP tests, certifications, report links, community snapshots, and analytics.

### cstp_requests

**Purpose:** Intake records for CSTP participation or testing requests before a CSTP Test is fully created or accepted.

**Ownership:** CSTP program layer.

**Likely Key Fields:** `id`, `source_id`, `requested_by_user_id`, `request_status`, `variety_name`, `batch_lot`, `submitted_at`, `reviewed_at`, `admin_notes`, `visibility`.

**Relationship to Other Tables:** May create or link to a `cstp_tests` record after review. May reference `sources` and future breeder/source portal identities.

**Public/Private Visibility:** Private/admin by default. Request intake should not be public unless explicitly exposed in a future workflow.

**Lifecycle Expectations:** Requests may be accepted, rejected, archived, or converted into CSTP Tests. Rejected or failed intake should not create public CSTP status.

### cstp_tests

**Purpose:** Parent CSTP orchestration records. A CSTP Test represents the certification event and groups one or more child session records.

**Ownership:** CSTP program layer.

**Likely Key Fields:** `id`, `source_id`, `request_id`, `variety_name`, `batch_lot`, `test_status`, `qualification_target`, `methodology_version`, `started_at`, `completed_at`, `archived_at`, `visibility`.

**Relationship to Other Tables:** Parent to `cstp_test_sessions`, `cstp_reports`, `cstp_report_snapshots`, `cstp_certifications`, and `cstp_admin_events`. References `sources` and optionally `cstp_requests`.

**Public/Private Visibility:** Private/admin while active or under review. Public status should be exposed through approved reports, certifications, and tested source enhancements.

**Lifecycle Expectations:** CSTP Tests persist as the durable container for a testing event. Archiving a test should not destroy published reports or historical certification records.

### cstp_test_sessions

**Purpose:** Join/mapping layer between `cstp_tests` and existing `sessions`.

**Ownership:** CSTP program layer for the relationship; core session system owns the session record.

**Likely Key Fields:** `id`, `cstp_test_id`, `session_id`, `run_label`, `device_label`, `sequence_order`, `included_in_report`, `created_at`.

**Relationship to Other Tables:** Links each CSTP Test to one or more child sessions. Enables multi-KAN testing while preserving session ownership.

**Public/Private Visibility:** Private/admin by default. Public reports should expose approved summarized values from snapshots, not raw join records.

**Lifecycle Expectations:** Links should remain auditable. Removing a link should not delete the session. Published reports should remain stable even if links are later archived.

### cstp_reports

**Purpose:** Report container records representing report preparation, review, and publication workflow for a CSTP Test.

**Ownership:** CSTP reporting layer.

**Likely Key Fields:** `id`, `cstp_test_id`, `report_status`, `report_id`, `methodology_version`, `prepared_at`, `published_at`, `withdrawn_at`, `visibility`.

**Relationship to Other Tables:** References `cstp_tests`. May have one or more `cstp_report_snapshots` for draft, published, corrected, or superseded versions.

**Public/Private Visibility:** Private while draft or under review. Public only when an approved snapshot is published.

**Lifecycle Expectations:** A report container can track lifecycle and revisions while snapshots preserve locked public content.

### cstp_report_snapshots

**Purpose:** Immutable or locked report-ready values captured at preparation or publication time.

**Ownership:** CSTP reporting layer.

**Likely Key Fields:** `id`, `cstp_report_id`, `cstp_test_id`, `source_id`, `snapshot_status`, `report_version`, `observed_germination_rate`, `total_seeds_tested`, `successfully_germinated`, `non_germinated_during_window`, `first_germination_observation`, `observation_window`, `certification_status`, `methodology_version`, `published_at`, `superseded_at`.

**Relationship to Other Tables:** References `cstp_reports`, `cstp_tests`, `sources`, and may be referenced by `cstp_certifications` and `source_certification_history`.

**Public/Private Visibility:** Draft snapshots are private. Published snapshots are public when approved.

**Lifecycle Expectations:** Published snapshots should not mutate silently. Corrections or updates should create controlled replacement or superseding snapshots.

### cstp_certifications

**Purpose:** Persistent certification lifecycle records for CSTP outcomes, including Gold Certified, Silver Certified, CSTP Tested, Previously Tested, Expired Certification, Report Available, or Report Unavailable states.

**Ownership:** CSTP certification layer.

**Likely Key Fields:** `id`, `source_id`, `cstp_test_id`, `cstp_report_snapshot_id`, `certification_status`, `badge_level`, `effective_at`, `expires_at`, `replaced_by_certification_id`, `is_current`, `visibility`, `decision_notes`.

**Relationship to Other Tables:** References `sources`, `cstp_tests`, and optionally a published `cstp_report_snapshots` record.

**Public/Private Visibility:** Approved certification status may be public. Internal decision notes remain private.

**Lifecycle Expectations:** Certifications persist historically. Renewal or expiration should create or update lifecycle relationships without overwriting prior certification records.

### cstp_report_assets

**Purpose:** Report-approved media references used in CSTP report snapshots, such as first germination images, final observation images, multi-KAN images, or future video/replay references.

**Ownership:** CSTP reporting layer for report selection; underlying media remains owned by the session/media system.

**Likely Key Fields:** `id`, `cstp_report_snapshot_id`, `session_id`, `asset_type`, `source_asset_id`, `caption`, `observed_at`, `display_order`, `public_url`, `visibility`.

**Relationship to Other Tables:** References `cstp_report_snapshots` and may reference `sessions` or existing media assets.

**Public/Private Visibility:** Only approved report assets should be public. Raw or internal media should remain private.

**Lifecycle Expectations:** Assets used in published reports should remain available or resolve to controlled unavailable states so public reports do not break.

### source_certification_history

**Purpose:** Query-friendly source-level history of CSTP certification events and tested-source status over time.

**Ownership:** CSTP/Source Directory integration layer.

**Likely Key Fields:** `id`, `source_id`, `cstp_certification_id`, `cstp_report_snapshot_id`, `status`, `badge_level`, `effective_at`, `expires_at`, `published_at`, `is_current`, `visibility`.

**Relationship to Other Tables:** References `sources`, `cstp_certifications`, and optionally `cstp_report_snapshots`.

**Public/Private Visibility:** Public only for approved source-facing certification history. Private or internal outcomes should not appear.

**Lifecycle Expectations:** Supports Source Directory badges, active certification lookup, and historical certification queries without duplicating source identity.

### cstp_admin_events

**Purpose:** Administrative audit trail for CSTP workflow actions, decisions, status changes, report preparation, publication, withdrawal, renewal, expiration, and review events.

**Ownership:** CSTP administrative layer.

**Likely Key Fields:** `id`, `cstp_test_id`, `cstp_report_id`, `cstp_certification_id`, `actor_user_id`, `event_type`, `event_summary`, `event_metadata`, `created_at`, `visibility`.

**Relationship to Other Tables:** May reference CSTP Tests, reports, certifications, requests, and admin users.

**Public/Private Visibility:** Private/admin. Public reports should not expose raw administrative events unless an approved public summary is intentionally included in a snapshot.

**Lifecycle Expectations:** Admin events should be append-only in principle and retained for auditability.

## 3. Parent/Child Relationships

CSTP should use `cstp_tests` as parent orchestration records. Existing `sessions` remain child evidence records connected through `cstp_test_sessions`.

Recommended relationship flow:

```text
sources
-> cstp_tests
-> cstp_test_sessions
-> sessions
-> session observations, images, and metrics
-> cstp_reports
-> cstp_report_snapshots
-> cstp_certifications
-> source_certification_history
```

The join layer is required because a CSTP Test may include multiple KAN/TRa test runs, and each run should remain a normal session. Reports and certifications are persistent outputs of the CSTP Test; they should not replace the underlying sessions or duplicate session logic.

## 4. Snapshot Strategy

CSTP reports should be generated from linked sessions. During report preparation, the reporting layer can aggregate session observations, session metrics, selected images, source information, lot/batch context, and methodology references.

When a report is prepared or published, the values shown in the report should be written into `cstp_report_snapshots`. Public report pages should read from published snapshots, not live mutable session data.

This preserves report stability:

- Session data can still be corrected or annotated through normal workflows.
- Published report values remain stable.
- Corrections can be handled through revised or superseding snapshots.
- Public report references do not break when underlying sessions change visibility or archive state.

## 5. Certification History

Certification records should persist historically. A certification is not just a display badge; it is a dated program outcome connected to a CSTP Test and, when available, a report snapshot.

Renewals should create new certification history instead of overwriting old records. Expired, replaced, withdrawn, or superseded certifications should remain queryable for auditability, Source Directory history, and long-term trust context.

Recommended certification lifecycle behavior:

- A new certification record is created for each approved certification event.
- `is_current` or equivalent status can identify the active public certification.
- `expires_at` records expected expiration.
- `replaced_by_certification_id` can link renewal or replacement chains.
- Historical certifications remain visible or private according to approved visibility rules.

## 6. Public vs Admin Data

CSTP database planning should separate private administrative workflow data from approved public trust data.

### Admin/Private

Admin or private data includes:

- Request intake
- Internal notes
- Failed tests
- Unpublished reports
- Workflow states
- Admin events
- Request discussions
- Moderation/internal observations
- Draft report values
- Non-public media selections

### Public

Public data includes only approved and intentionally published records:

- Approved report snapshots
- Active and past approved certifications
- Tested source badge status
- Approved certification metrics
- Public report asset selections
- Public report availability state

Participation in CSTP should not automatically create public data. Public exposure should be driven by explicit report, certification, and Source Directory visibility fields.

## 7. RLS Planning Notes

This document does not implement row-level security. Future RLS planning should follow these expectations:

- Users own and manage their normal sessions according to existing session rules.
- CSTP administrators manage CSTP requests, tests, reports, snapshots, certifications, and admin events.
- Public users can read only approved published CSTP data.
- Draft reports, failed tests, internal notes, admin events, and unpublished CSTP workflow states remain private.
- Breeders or source representatives may later view their own CSTP records through a controlled role or ownership relationship.
- Public Source Directory CSTP badges should derive from approved public certification or tested-source records, not private admin workflow data.

RLS should reinforce the public/private boundaries defined in this planning document.

## 8. Query Pattern Planning

Future schema work should support these query patterns:

- Show tested sources in Source Directory.
- Show active Gold Certified and Silver Certified sources.
- Show certification history for a source.
- Generate a report from sessions linked to a CSTP Test.
- Filter Community Grow by CSTP Tested or approved certified status.
- Show Source Directory badge and report links.
- Resolve a report route to a published snapshot or a controlled unavailable state.
- Find all sessions linked to a CSTP Test.
- Find all reports and certifications produced by a CSTP Test.
- Identify certifications expiring soon.
- List admin workflow items by request, test, report, or certification status.

These queries should be possible without duplicating sources or embedding mutable session data directly into public reports.

## 9. Indexing Planning

Future indexing should be planned around relationship traversal, public filtering, certification status, and publication state.

Likely indexed fields include:

- `source_id`
- `cstp_test_id`
- `session_id`
- `status`
- `certification_status`
- `published_at`
- `expires_at`
- `batch_lot`
- `visibility`
- `is_current`
- `report_id`
- `methodology_version`

Indexes should support Source Directory discovery, report resolution, certification history, administrative queues, and analytics queries without encouraging duplicated storage.

## 10. Archive/Delete Strategy

Published CSTP reports should not break when operational data changes. Report snapshots should preserve public report values even if linked sessions are later edited, archived, or made unavailable.

Certifications should remain historically available. Expiration, renewal, withdrawal, or replacement should not destroy the old record. Public visibility can change, but historical integrity should remain.

Failed or internal tests may be archived and kept private. They should not appear as public Source Directory badges, public Community Grow results, or public report links unless intentionally published with safe wording.

Deleting or archiving source/session records should not destroy published certification history. Future schema design should support controlled fallback states, such as report unavailable, withdrawn, superseded, or source archived, instead of creating broken public references.

## 11. Explicit Non-Goals

This document does not include:

- SQL
- Migrations
- Supabase schema edits
- RLS implementation
- App code changes
- Route changes
- UI changes
- Report renderer implementation
- Automation
- Breeder portal implementation
- Backend service implementation

This is a schema planning specification only. It is intended to guide future SQL work after architecture review.

