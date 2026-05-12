# CSTP Migration v1 SQL Design Draft

## 1. Purpose

This document is the first implementation-oriented SQL design layer for CSTP migration v1. It translates the CSTP architecture and migration scope planning into a minimal, safe, database-structure draft before any SQL is written or executed.

This design draft is informed by:

- `docs/cstp-supabase-schema-definition-draft.md`
- `docs/cstp-sql-migration-planning.md`
- `docs/cstp-backend-implementation-checklist.md`
- `docs/cstp-entity-relationship-model-specification.md`
- `docs/cstp-initial-sql-migration-scope-definition.md`
- `docs/cstp-architecture-master-index.md`

Migration v1 intentionally remains minimal and internal-only. It is focused only on CSTP orchestration, session linkage, and internal workflow management.

Protecting the existing Grow session system remains the highest priority. CSTP v1 should add internal CSTP-owned tables around existing sessions without changing session behavior, session ownership, stage/timeline logic, partition mechanics, observations, images, metrics, or public Source Directory behavior.

This is not implementation work. It does not include executable SQL, migrations, schema edits, backend code, app code, UI changes, route changes, APIs, or RLS.

## 2. Migration v1 Scope

Migration v1 should include only these tables:

- `cstp_requests`
- `cstp_tests`
- `cstp_admin_events`
- `cstp_test_sessions`

These tables provide the smallest useful internal CSTP foundation:

- Intake can be captured.
- A CSTP Test can exist as a parent orchestration record.
- Admin workflow events can be tracked.
- Existing sessions can be linked as child test-run records.

The following systems remain intentionally excluded from v1:

- Reports
- Report snapshots
- Certifications
- Certification history
- Public report pages
- Public Source Directory CSTP badges
- Public tested-source indicators
- Community Grow CSTP filters
- Automation
- Breeder/source portals
- External APIs
- Public visibility workflows

## 3. Shared Existing Dependencies

Migration v1 reuses existing Cannakan Grow entities and ownership concepts.

### sessions

Existing sessions remain the source of truth for observed grow and test activity. CSTP links to sessions through `cstp_test_sessions` rather than duplicating session records or changing session behavior.

### sources

Existing Source Directory records remain the shared source identity system. CSTP v1 may reference sources for intake and test context, but it should not create a separate CSTP source system.

### users/admin ownership concepts

Existing user and admin ownership concepts should inform future access control and workflow ownership. Migration v1 should support internal/admin workflow records without implementing RLS or public access behavior in this design draft.

## 4. cstp_requests Table Design Draft

### Table Purpose

`cstp_requests` captures internal CSTP intake before a formal CSTP Test is accepted, created, or scheduled.

### Ownership Expectations

Owned by the CSTP intake layer. Request records are internal/admin by default and should not imply public testing, certification, or report availability.

### Likely Fields

| Field | Required | Nullable | Purpose |
|---|---:|---:|---|
| `id` | Yes | No | Primary request identity. |
| `source_id` | No | Yes | Optional reference to an existing Source Directory record. |
| `contact_name` | No | Yes | Intake contact name. |
| `contact_email` | No | Yes | Intake contact email. |
| `website` | No | Yes | Source or breeder website supplied during intake. |
| `variety_name` | No | Yes | Variety associated with the request. |
| `seed_type` | No | Yes | Seed type descriptor supplied during intake. |
| `breeder_name` | No | Yes | Breeder/source name if distinct from source record. |
| `batch_lot` | No | Yes | Batch or lot identifier when available. |
| `requested_seed_count` | No | Yes | Requested or supplied seed count. |
| `request_message` | No | Yes | Submitter-provided intake message. |
| `status` | Yes | No | Internal request lifecycle status. |
| `internal_notes` | No | Yes | Private admin notes. |
| `archived` | Yes | No | Internal archive flag. |
| `created_at` | Yes | No | Creation timestamp. |
| `updated_at` | Yes | No | Last update timestamp. |

### Status Handling

Request status should describe intake lifecycle only. It should not imply test completion, certification, report publication, or public visibility.

Expected conceptual statuses:

- `received`
- `accepted`
- `awaiting_seeds`
- `declined`
- `archived`

### Timestamp Expectations

`created_at` and `updated_at` should follow existing Cannakan Grow timestamp conventions. Future implementation may use the same update-trigger pattern used by existing Supabase tables.

### Archive Expectations

Archived requests should remain queryable for internal history. Archiving should not delete linked CSTP Tests if a request has already been accepted.

### Conceptual Indexes

Likely fields for future indexing:

- `source_id`
- `status`
- `archived`
- `created_at`
- `contact_email`
- `batch_lot`

### Likely Query Paths

- List active intake requests.
- Filter requests by status.
- Find requests for a source.
- Find accepted requests that created CSTP Tests.
- Review archived or declined requests internally.

## 5. cstp_tests Table Design Draft

### Orchestration Role

`cstp_tests` is the parent CSTP orchestration table. It represents an internal CSTP testing event and coordinates session linkage, admin workflow, and future report/certification outputs.

### Relationship to Requests

A CSTP Test may originate from a `cstp_requests` record. Not every CSTP Test must require a request if internal/admin-created tests are allowed later.

### Relationship to Sources

A CSTP Test may reference an existing `sources` record. This preserves Source Directory as the shared source identity system.

### Internal Workflow Role

`cstp_tests` tracks internal test lifecycle state. It should not publish certification status or public report state in v1.

### Likely Fields

| Field | Required | Nullable | Purpose |
|---|---:|---:|---|
| `id` | Yes | No | Primary CSTP Test identity. |
| `source_id` | No | Yes | Reference to existing source identity. |
| `request_id` | No | Yes | Optional source intake request. |
| `status` | Yes | No | Core internal test status. |
| `internal_state` | No | Yes | Additional private workflow detail. |
| `created_by` | No | Yes | Admin/user who created the test. |
| `archived` | Yes | No | Internal archive flag. |
| `started_at` | No | Yes | Test start timestamp. |
| `completed_at` | No | Yes | Test completion timestamp. |
| `created_at` | Yes | No | Creation timestamp. |
| `updated_at` | Yes | No | Last update timestamp. |

### Conceptual FK Relationships

- `source_id` references existing `sources`.
- `request_id` references `cstp_requests`.
- `created_by` may reference the relevant user/admin identity model in future implementation.

### Archive/Delete Expectations

Archiving a CSTP Test should not delete linked sessions. Destructive deletion should be avoided once linked sessions or admin events exist.

### Query/Index Expectations

Likely indexed fields:

- `source_id`
- `request_id`
- `status`
- `archived`
- `created_by`
- `started_at`
- `completed_at`
- `created_at`

Likely query paths:

- List active CSTP Tests.
- Find tests by source.
- Find tests created from a request.
- Find archived tests.
- Load a CSTP Test with linked sessions and admin events.

## 6. cstp_admin_events Table Design Draft

### Audit/Event Tracking Role

`cstp_admin_events` records internal workflow events for CSTP Tests. It supports auditability before public reports or certification decisions exist.

### Internal-Only Visibility

Admin events are private/internal. They should not become public report content unless a future report snapshot explicitly includes an approved summary.

### Likely Fields

| Field | Required | Nullable | Purpose |
|---|---:|---:|---|
| `id` | Yes | No | Primary event identity. |
| `cstp_test_id` | Yes | No | Parent CSTP Test. |
| `admin_user_id` | No | Yes | Admin/user who created the event. |
| `event_type` | Yes | No | Internal event category. |
| `event_notes` | No | Yes | Private event details. |
| `created_at` | Yes | No | Event timestamp. |

### Event Lifecycle Expectations

Admin events should be append-only in principle. Future implementation should avoid editing historical event meaning except through additional corrective events.

### Relationship Ownership

Admin events belong to CSTP Tests. They do not own sessions, requests, reports, or certifications.

### Conceptual Indexes

Likely indexed fields:

- `cstp_test_id`
- `admin_user_id`
- `event_type`
- `created_at`

### Likely Query Paths

- Load event history for a CSTP Test.
- Filter events by type.
- Review admin activity by test.
- Audit status changes or internal notes.

## 7. cstp_test_sessions Table Design Draft

### Parent/Child Orchestration Role

`cstp_test_sessions` is the join table connecting parent CSTP Tests to existing child sessions. It is the core v1 validation point for CSTP architecture.

### Linkage to Existing Sessions

The linked `session_id` references an existing session. The session remains independently owned and reusable outside CSTP.

### Multi-KAN Grouping Support

Multiple `cstp_test_sessions` records may connect one CSTP Test to multiple sessions. `kan_label` can identify runs such as KAN A, KAN B, KAN C, or another internal device/run label.

### Likely Fields

| Field | Required | Nullable | Purpose |
|---|---:|---:|---|
| `id` | Yes | No | Primary join record identity. |
| `cstp_test_id` | Yes | No | Parent CSTP Test. |
| `session_id` | Yes | No | Existing linked session. |
| `kan_label` | No | Yes | Internal KAN/run label. |
| `included_in_report` | Yes | No | Future report inclusion planning flag. |
| `archived` | Yes | No | Internal archive flag for the relationship. |
| `created_at` | Yes | No | Link creation timestamp. |

### Conceptual Unique Constraints

Future implementation should consider preventing duplicate active links for the same `cstp_test_id` and `session_id` pair.

If archived links are retained, uniqueness planning should account for whether historical archived duplicates are allowed. The preferred model is one durable relationship per CSTP Test and session, with archive state tracked on the relationship.

### Relationship Expectations

- A CSTP Test may link to many sessions.
- A session may be linked to zero or more CSTP Tests, depending on future workflow rules.
- Linking must not change the session lifecycle.
- Archiving the relationship must not delete the session.

### Orphan Prevention Guidance

Future migration design should prevent join records from pointing to missing CSTP Tests or missing sessions. It should also avoid cascading behavior that destroys session evidence or public history in later phases.

### Conceptual Indexes

Likely indexed fields:

- `cstp_test_id`
- `session_id`
- `included_in_report`
- `archived`
- `created_at`

### Likely Query Paths

- Load sessions linked to a CSTP Test.
- Find CSTP Tests linked to a session.
- Validate multi-KAN session grouping.
- Filter report-included sessions for future report generation.
- Review archived or excluded session links internally.

## 8. Relationship Definitions

Conceptual relationships for migration v1:

- `sources` to `cstp_requests`: one source may have many CSTP requests.
- `sources` to `cstp_tests`: one source may have many CSTP Tests.
- `cstp_requests` to `cstp_tests`: one request may produce zero or one CSTP Test in the initial model.
- `cstp_tests` to `cstp_admin_events`: one CSTP Test may have many admin events.
- `cstp_tests` to `sessions`: many-to-many through `cstp_test_sessions`.
- `cstp_test_sessions` to `sessions`: each join record references one existing session.

Sessions remain independently reusable outside CSTP. A session does not become CSTP-owned when linked to a CSTP Test.

## 9. Status / Enum Planning

The following statuses are conceptual only. This document does not implement database enums.

### Request Statuses

- `received`
- `accepted`
- `awaiting_seeds`
- `declined`
- `archived`

### Test Statuses

- `pending`
- `active`
- `completed`
- `archived`

### Admin Event Types

Potential event types for future implementation planning:

- `request_received`
- `request_accepted`
- `seeds_received`
- `test_created`
- `session_linked`
- `session_unlinked`
- `status_changed`
- `note_added`
- `test_completed`
- `test_archived`

These values should remain internal and should not be treated as public certification or report states.

## 10. Archive/Delete Guidance

Archive behavior should be preferred over deletion in migration v1.

Guidance:

- Archive CSTP requests instead of deleting intake history.
- Archive CSTP Tests instead of deleting orchestration history.
- Keep admin events as append-only internal audit records.
- Archive CSTP Test Session links instead of deleting relationship history when possible.
- Avoid destructive cascades into sessions.
- Preserve relationship integrity.
- Prevent join records from becoming orphaned.

Because migration v1 has no public reports or certifications, rollback and cleanup risk is lower. Even so, v1 should establish conservative history-preserving behavior.

## 11. Indexing / Query Planning

Likely indexed fields for future SQL implementation:

- `source_id`
- `request_id`
- `cstp_test_id`
- `session_id`
- `status`
- `archived`
- `created_at`
- `updated_at`
- `admin_user_id`
- `event_type`
- `included_in_report`

Index planning should support:

- Internal intake queues
- CSTP Test list/detail loading
- Source-specific CSTP review
- Admin event history
- Linked session retrieval
- Multi-KAN grouping validation
- Archived record review

## 12. Internal-Only Visibility Guidance

Migration v1 remains fully internal.

It should not include:

- Public CSTP exposure
- Public certifications
- Public report visibility
- Source Directory public CSTP badges
- Community Grow CSTP filters
- Breeder/source portal access
- Public API access

Any future RLS or public-read policy planning should treat all v1 CSTP tables as private/admin until later public publishing phases are designed and reviewed.

## 13. Risk Areas

### Duplicate Session Ownership

Risk: CSTP v1 could accidentally treat linked sessions as CSTP-owned records.

Control: `cstp_test_sessions` links to existing sessions. Sessions remain owned by the Grow session system.

### Orphaned Linked Sessions

Risk: Join records may reference missing tests or sessions.

Control: Future SQL should enforce relationship integrity and safe archive behavior.

### Unsafe FK Cascades

Risk: Cascading deletes could remove session evidence or future public history.

Control: Avoid destructive cascades and prefer archive behavior.

### Duplicated Workflow States

Risk: Request status, test status, and admin event types may drift into overlapping meanings.

Control: Keep request statuses for intake, test statuses for orchestration, and admin event types for audit history.

### Schema Drift From Architecture Docs

Risk: Field names, status values, or table responsibilities diverge from CSTP architecture planning.

Control: Validate future SQL against the architecture master index, ERD specification, and migration v1 scope definition.

## 14. Explicit Non-Goals

This document does not include or implement:

- Executable SQL
- Migrations
- Schema file changes
- Reports
- Report snapshots
- Certifications
- Certification history
- Public APIs
- Public report pages
- Public badges
- Source Directory public CSTP integration
- Community Grow CSTP filters
- Automation
- Breeder/source portal
- UI implementation
- Backend integration
- Row-level security

This is a SQL-oriented design draft only.

## 15. Final Recommendation

Migration v1 should validate orchestration and linkage stability first. The first implementation slice should prove that CSTP can capture internal intake, create parent CSTP Tests, track admin events, and link existing sessions without disrupting the Grow App.

Public trust systems should only arrive after backend stability is proven. Reports, immutable snapshots, certifications, badges, Source Directory public integration, Community Grow discovery, automation, and breeder/source access should remain deferred until the v1 foundation is stable.

