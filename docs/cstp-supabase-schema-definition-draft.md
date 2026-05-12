# CSTP Supabase Schema Definition Draft

## 1. Purpose

This document is the first formal implementation-planning draft for the Cannakan Seed Testing Program (CSTP) Supabase schema structure. It bridges the architecture and planning documents into a stable schema definition draft before SQL migrations are written.

This draft is informed by:

- `docs/cstp-standard-report-schema-reporting-framework.md`
- `docs/cstp-session-architecture-alignment-specification.md`
- `docs/cstp-relational-data-planning-specification.md`
- `docs/cstp-supabase-schema-planning-specification.md`

The goal is to define table responsibilities, field expectations, lifecycle boundaries, and relationships before implementation begins. CSTP must remain aligned with the existing Cannakan Grow session architecture. CSTP should extend the system through request, test, report, certification, and public trust records without forking sessions, duplicating source identity, or embedding mutable session data directly into public reports.

This is not a SQL document. It does not create migrations, define constraints, implement row-level security, or modify application behavior.

## 2. Existing Shared Tables

CSTP should reuse existing Cannakan Grow data ownership wherever possible. The schema should treat these shared concepts as foundational records rather than CSTP-specific duplicates.

### sessions

Normal grow sessions remain first-class records. CSTP test runs should be normal sessions linked to CSTP through a mapping table. The session system remains responsible for device support, partition charts, stage/timeline logic, observations, images, notes, completion state, and session-level metrics.

CSTP should not create a parallel session table for certification work.

### sources

Source Directory remains the shared source identity system. CSTP should reference existing source records for intake, tests, certifications, report snapshots, and tested-source display states.

CSTP should not create duplicate source records for certified or tested sources.

### observations

Observations remain session-owned records. CSTP may aggregate or summarize observation data for reports, but the source evidence should remain connected to sessions.

CSTP should not duplicate the full observation stream in report records.

### snapshots/images

Snapshots and images remain session/media-owned records unless a future media model defines a separate asset layer. CSTP report assets should select approved images or media references for public report display.

Report snapshots may preserve selected image metadata or approved public asset references so published reports remain stable.

### metrics-related session data

Session-level metrics remain the source of truth for observed session outcomes such as germination percentage, time to germination, partition-level performance, and completion-related values.

CSTP may derive aggregate and certification metrics from linked sessions. Public reports should preserve frozen report metrics once prepared or published.

## 3. Proposed CSTP Table Definitions

### A. cstp_requests

**Purpose:** Captures CSTP intake before a test is accepted, scheduled, or converted into a formal CSTP Test.

**Ownership:** CSTP program intake layer.

**Key Fields:**

- `id`
- `source_id`
- `contact_name`
- `contact_email`
- `website`
- `variety_name`
- `seed_type`
- `breeder_name`
- `batch_lot`
- `requested_seed_count`
- `request_message`
- `status`
- `internal_notes`
- `created_at`
- `updated_at`

**Important Relationships:**

- May reference an existing `sources` record through `source_id`.
- May become associated with one `cstp_tests` record after acceptance.
- May later support breeder/source portal identity, but that relationship is outside this draft.

**Lifecycle Role:**

Requests begin as private intake records. They may be reviewed, accepted, rejected, archived, or converted into CSTP Tests. A request does not imply certification, report publication, or public tested-source status.

### B. cstp_tests

**Purpose:** Parent orchestration record for a CSTP evaluation. A CSTP Test groups one or more normal session records and tracks program-level testing state.

**Ownership:** CSTP testing and certification program layer.

**Key Fields:**

- `id`
- `source_id`
- `request_id`
- `status`
- `certification_status`
- `started_at`
- `completed_at`
- `report_prepared_at`
- `published_at`
- `created_by`
- `archived`
- `created_at`
- `updated_at`

**Important Relationships:**

- References `sources` through `source_id`.
- May reference `cstp_requests` through `request_id`.
- Has many linked sessions through `cstp_test_sessions`.
- May have reports through `cstp_reports`.
- May have certifications through `cstp_certifications`.
- May have administrative events through `cstp_admin_events`.

**Lifecycle Role:**

`cstp_tests` is the durable parent for the certification event. It does not store raw session evidence directly. It coordinates intake context, linked sessions, report preparation, certification state, and archival status.

### C. cstp_test_sessions

**Purpose:** Join table linking CSTP Tests to existing normal session records.

**Ownership:** CSTP relationship layer. The underlying session remains owned by the core session system.

**Key Fields:**

- `id`
- `cstp_test_id`
- `session_id`
- `kan_label`
- `included_in_report`
- `created_at`

**Important Relationships:**

- References `cstp_tests` through `cstp_test_id`.
- References existing `sessions` through `session_id`.

**Lifecycle Role:**

This table enables multi-KAN testing without duplicating session logic. A CSTP Test can group multiple sessions, and each session remains a real Cannakan Grow session.

### D. cstp_reports

**Purpose:** Report workflow container for a CSTP Test. Tracks report preparation, publication, archival state, and public visibility at the report level.

**Ownership:** CSTP reporting layer.

**Key Fields:**

- `id`
- `cstp_test_id`
- `snapshot_version`
- `report_status`
- `prepared_by`
- `prepared_at`
- `published_at`
- `public_visibility`
- `archived`
- `created_at`

**Important Relationships:**

- References `cstp_tests` through `cstp_test_id`.
- Has one or more associated `cstp_report_snapshots`.
- May be referenced by `source_certification_history`.

**Lifecycle Role:**

Reports manage the workflow around report preparation and publication. The report container may evolve, but published values should be read from snapshots.

### E. cstp_report_snapshots

**Purpose:** Stores frozen report data generated from linked session evidence and CSTP review. This is the public/report-ready representation of a CSTP report at a specific point in time.

**Ownership:** CSTP reporting snapshot layer.

**Key Fields:**

- `id`
- `report_id`
- `frozen_metrics`
- `frozen_summary`
- `frozen_stage_data`
- `frozen_source_data`
- `frozen_certification_data`
- `generated_at`

**Important Relationships:**

- References `cstp_reports` through `report_id`.
- May be referenced by `cstp_certifications` or `source_certification_history` when the snapshot supports a public certification.

**Lifecycle Role:**

Report snapshots are mutable only while draft or preparation rules allow changes. Once published, a snapshot should be treated as immutable. Public report pages should read from published snapshots instead of live mutable session data.

### F. cstp_certifications

**Purpose:** Persistent certification outcome records for CSTP Tests and sources.

**Ownership:** CSTP certification lifecycle layer.

**Key Fields:**

- `id`
- `cstp_test_id`
- `source_id`
- `certification_level`
- `certification_status`
- `issued_at`
- `expires_at`
- `renewal_of_certification_id`
- `revoked`
- `public_visibility`
- `created_at`

**Important Relationships:**

- References `cstp_tests` through `cstp_test_id`.
- References `sources` through `source_id`.
- May reference a prior certification through `renewal_of_certification_id`.
- May be referenced by `source_certification_history`.

**Lifecycle Role:**

Certifications preserve program outcomes over time. Renewals should create new certification records linked to prior records rather than overwriting historical certifications.

### G. source_certification_history

**Purpose:** Query-friendly history of source-level CSTP certification and public tested-source status.

**Ownership:** CSTP and Source Directory integration layer.

**Key Fields:**

- `id`
- `source_id`
- `certification_id`
- `report_id`
- `historical_status`
- `recorded_at`

**Important Relationships:**

- References `sources` through `source_id`.
- References `cstp_certifications` through `certification_id`.
- References `cstp_reports` through `report_id`.

**Lifecycle Role:**

This table supports Source Directory badges, active/past certification display, and historical lookup without duplicating source records. It should preserve the sequence of certification events and public status changes.

### H. cstp_admin_events

**Purpose:** Administrative event log for CSTP workflow decisions and state changes.

**Ownership:** CSTP administrative layer.

**Key Fields:**

- `id`
- `cstp_test_id`
- `admin_user_id`
- `event_type`
- `event_notes`
- `created_at`

**Important Relationships:**

- References `cstp_tests` through `cstp_test_id`.
- May reference an administrative user through `admin_user_id`.

**Lifecycle Role:**

Admin events provide auditability for CSTP workflow changes. They should remain private/admin and should not be used as public report content unless summarized into an approved report snapshot.

## 4. Status/Enum Planning

The following conceptual enum values are expected. They are planning values only and should not be treated as implemented database enums.

### Request Status

- `draft`
- `submitted`
- `under_review`
- `accepted`
- `rejected`
- `archived`

### Test Status

- `planned`
- `in_progress`
- `completed`
- `under_review`
- `report_prepared`
- `published`
- `archived`
- `invalidated`

### Certification Status

- `not_certified`
- `tested_only`
- `gold_certified`
- `silver_certified`
- `previously_tested`
- `expired`
- `revoked`
- `report_unavailable`

### Report Status

- `draft`
- `prepared`
- `published`
- `superseded`
- `withdrawn`
- `archived`

### Visibility State

- `private`
- `admin_only`
- `source_visible`
- `public`
- `withdrawn`

## 5. Snapshot Immutability Rules

Report snapshots become immutable when published. Before publication, a report snapshot may be regenerated as part of preparation and review. After publication, public report values should not mutate retroactively.

Published snapshots should preserve:

- Frozen metrics
- Frozen summary language
- Frozen stage data
- Frozen source data
- Frozen certification data
- Generation timestamp
- Report version context

Certifications should preserve historical integrity. Renewals, expirations, or revocations should not overwrite the original certification event. New certification records or status relationships should represent lifecycle changes.

If a report must be corrected after publication, the preferred future pattern is a new snapshot version or superseding report status rather than silent mutation of the published snapshot.

## 6. Relationship Definitions

The conceptual foreign key relationships are:

- Source to tests: one `sources` record may have many `cstp_tests`.
- Test to sessions: one `cstp_tests` record may have many linked `sessions` through `cstp_test_sessions`.
- Test to reports: one `cstp_tests` record may have one or more `cstp_reports`.
- Report to snapshots: one `cstp_reports` record may have one or more `cstp_report_snapshots`.
- Test to certifications: one `cstp_tests` record may have one or more `cstp_certifications`.
- Source to certifications: one `sources` record may have many `cstp_certifications`.
- Source to history: one `sources` record may have many `source_certification_history` entries.
- Test to admin events: one `cstp_tests` record may have many `cstp_admin_events`.

These relationships keep CSTP data normalized while preserving the existing session model as the evidence source.

## 7. Archive/Delete Expectations

Archiving and deleting should be treated differently.

Archived records are retained but removed from active workflow views. Deleted records are removed or made inaccessible according to future policy. For CSTP, archival should be preferred for tests, reports, certifications, and admin events because historical traceability matters.

Expected behavior:

- Archiving a CSTP Test should not delete linked sessions.
- Archiving a CSTP Test should not destroy published reports.
- Archiving a report should preserve its snapshot history.
- Expired, revoked, or renewed certifications should remain historically queryable.
- Public report references should resolve to published, superseded, withdrawn, or unavailable states rather than broken records.
- Deleting or hiding a source/session should not erase published certification history.

Future schema work should prevent orphaned report records by preserving parent references or providing controlled fallback states.

## 8. Future RLS Expectations

This document does not implement row-level security. Future RLS should be planned around the following expectations:

- Users retain ownership of normal sessions.
- CSTP administrators manage CSTP requests, tests, reports, snapshots, certifications, and admin events.
- Public users can read only approved published CSTP data.
- Public users should not read internal notes, admin events, failed tests, draft reports, or unpublished workflow state.
- Future breeder/source portal users may view their own CSTP records through explicit source ownership or representative relationships.
- Source Directory public badges should derive from approved public certification or history records, not private admin state.

RLS should reinforce the separation between mutable internal work and stable public trust artifacts.

## 9. Query/Performance Considerations

Future schema work should support the following lookup paths:

- Source Directory listing with CSTP badge status.
- Source Directory listing filtered by tested source, Gold Certified, Silver Certified, or report availability.
- Current certification lookup by source.
- Certification history lookup by source.
- Report retrieval by report ID or source-linked route.
- Report snapshot retrieval for public report pages.
- CSTP Test retrieval with linked sessions for admin review.
- Aggregation of linked sessions into report preparation data.
- Community Grow filters for CSTP Tested or approved certification status.
- Administrative queues by request status, test status, report status, and certification status.
- Expiration and renewal review by `expires_at`.

Likely performance-sensitive fields include:

- `source_id`
- `cstp_test_id`
- `session_id`
- `request_id`
- `report_id`
- `certification_id`
- `status`
- `certification_status`
- `certification_level`
- `report_status`
- `public_visibility`
- `published_at`
- `expires_at`
- `batch_lot`

The future schema should preserve queryability without duplicating mutable session data into multiple active tables.

## 10. Explicit Non-Goals

This document does not include or implement:

- SQL
- Migrations
- Supabase schema implementation
- Row-level security implementation
- API layer
- Frontend integration
- Route changes
- UI changes
- Backend logic
- Report renderer implementation
- Automation
- Breeder portal implementation

This is an implementation-planning schema definition draft only. It should be reviewed before any migration or application work begins.

