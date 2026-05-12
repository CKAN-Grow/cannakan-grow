# CSTP Admin Service Layer Plan

## 1. Purpose

This document defines the internal CSTP admin service layer that will sit on top of the CSTP migration v1 tables.

It bridges the new CSTP schema foundation and future admin workflows. It remains internal-only and should protect alignment with the existing Cannakan Grow session system.

This plan references:

- `supabase/migrations/20260511222737_cstp_migration_v1.sql`
- `docs/cstp-backend-implementation-checklist.md`
- `docs/cstp-architecture-master-index.md`
- `docs/cstp-existing-system-reuse-audit.md`

The service layer should provide a controlled internal boundary for CSTP request intake, test orchestration, session linkage, and admin event logging. It should not expose public CSTP data or create report/certification behavior.

This is planning only. It does not modify app/backend/UI/routes, create APIs, implement RLS, add public CSTP features, add reports, add snapshots, add certifications, add automation, or add breeder/source portals.

## 2. Service Layer Responsibilities

### Create CSTP Requests

Provide a helper that creates internal `cstp_requests` records.

Responsibilities:

- Accept source/contact/sample intake fields.
- Allow nullable `source_id` for early intake.
- Default status to `received`.
- Keep `internal_notes` private/admin.
- Create an admin event when request creation is part of an admin workflow.

### Update CSTP Request Status

Provide a helper that changes `cstp_requests.status` through allowed lifecycle transitions.

Responsibilities:

- Validate requested status transition.
- Update status only when valid.
- Preserve archived request history.
- Log an admin event for meaningful changes.

### Create CSTP Tests

Provide a helper that creates parent `cstp_tests` records.

Responsibilities:

- Optionally link a request through `request_id`.
- Optionally link a source through `source_id`.
- Set `created_by` from the authenticated/admin actor.
- Default status to `pending`.
- Keep `internal_state` private.
- Log a `test_created` admin event.

### Update CSTP Test Status

Provide a helper that changes `cstp_tests.status`.

Responsibilities:

- Validate test lifecycle transition.
- Set `started_at` when moving into active state if appropriate.
- Set `completed_at` when moving into completed state if appropriate.
- Preserve archived tests as internal history.
- Log status changes as admin events.

### Link Grow Sessions to CSTP Tests

Provide a helper that inserts into `cstp_test_sessions`.

Responsibilities:

- Confirm the CSTP Test exists.
- Confirm the Grow session exists.
- Use the existing `public.grow_sessions` record as source-of-truth.
- Assign optional `kan_label`.
- Respect unique `(cstp_test_id, session_id)` protection.
- Avoid mutating the linked Grow session.
- Log a `session_linked` admin event.

### Unlink or Archive Linked Sessions

Provide a helper that archives a `cstp_test_sessions` relationship rather than deleting the linked session.

Responsibilities:

- Mark the CSTP/session relationship as archived.
- Leave `public.grow_sessions` untouched.
- Preserve history where possible.
- Log a `session_unlinked` or `session_link_archived` admin event.

### Log CSTP Admin Events

Provide a single internal helper for `cstp_admin_events`.

Responsibilities:

- Insert append-only event records.
- Require `cstp_test_id`.
- Attach `admin_user_id` when available.
- Standardize event type naming.
- Keep event notes private/admin.

### Validate Lifecycle Transitions

Provide shared validation helpers for request and test statuses.

Responsibilities:

- Keep status vocabulary aligned with the migration constraints.
- Prevent impossible state changes.
- Return clear internal validation errors.
- Avoid embedding status logic directly in UI components.

## 3. Existing Data Dependencies

The service layer depends on:

- `public.sources`
- `public.grow_sessions`
- `auth.users`
- `public.cstp_requests`
- `public.cstp_tests`
- `public.cstp_admin_events`
- `public.cstp_test_sessions`

Dependency rules:

- `public.sources` remains the shared Source Directory identity.
- `public.grow_sessions` remains the source-of-truth for session evidence.
- `auth.users` identifies the actor for `created_by` and `admin_user_id`.
- CSTP v1 tables provide internal request, orchestration, event, and linkage state only.

## 4. Admin Event Logging Rules

Every meaningful CSTP lifecycle action should create an admin event.

Events should be logged for:

- request creation
- request status changes
- CSTP Test creation
- CSTP Test status changes
- session linkage
- session link archival
- admin note additions
- test archival

Admin event rules:

- Admin events are append-only in principle.
- Admin events are internal-only.
- Admin events should not become public report content.
- Admin events should use predictable `event_type` values.
- Admin event notes should avoid public-facing language assumptions.

Suggested event types:

- `request_created`
- `request_status_changed`
- `test_created`
- `test_status_changed`
- `session_linked`
- `session_link_archived`
- `note_added`
- `test_archived`

## 5. Status Transition Rules

### Request Transitions

Allowed conceptual transitions:

- `received` -> `accepted`
- `received` -> `declined`
- `accepted` -> `awaiting_seeds`
- `awaiting_seeds` -> `accepted`
- any active state -> `archived`

Active request states:

- `received`
- `accepted`
- `awaiting_seeds`
- `declined`

Implementation guidance:

- `archived` should be terminal unless an explicit admin restore workflow is later defined.
- `declined` should not move to active testing without an explicit admin reopen rule.

### Test Transitions

Allowed conceptual transitions:

- `pending` -> `active`
- `active` -> `completed`
- `pending` -> `archived`
- `active` -> `archived`
- `completed` -> `archived`

Implementation guidance:

- `completed` should not imply report preparation or certification.
- `archived` should not delete linked sessions.
- test status should remain internal/admin until public report/certification systems exist.

## 6. Session Linkage Rules

Linked sessions remain normal Grow sessions.

Rules:

- CSTP service helpers must not mutate `public.grow_sessions` records.
- CSTP service helpers must not change session ownership.
- CSTP service helpers must not change session timeline, partition, observation, image, or metrics fields.
- One session should not be linked twice to the same CSTP Test.
- Link archival should affect only `cstp_test_sessions`.
- Multi-KAN grouping should be represented through multiple linked sessions and optional `kan_label` values.
- Session compatibility must remain protected before any report/certification work begins.

The service layer should treat linked sessions as read-only evidence references for CSTP v1.

## 7. Internal-Only Boundary

CSTP admin service helpers are internal-only.

Out of scope:

- no public reads
- no public reports
- no public certifications
- no public badges
- no Source Directory exposure
- no Community Grow exposure
- no breeder/source portal access
- no external APIs

The service layer should not return public-ready CSTP data. Public report, certification, badge, and Source Directory visibility logic belongs to later phases.

## 8. Suggested File / Code Organization

Current project structure observations:

- The app is primarily a large single-file frontend in `app.js`.
- Existing CSTP admin/lab surfaces are currently local/static in `app.js`.
- Serverless backend helpers currently live in `api/`, including push/reminder/admin-report utilities.
- There is not yet a dedicated shared backend service directory.

Recommended future organization:

1. Keep first implementation small and avoid touching public UI routes.
2. If CSTP service helpers are initially client-side Supabase helpers for admin-only use, place them near existing Supabase helper patterns in `app.js` only as a temporary bridge and clearly isolate the functions with a `CSTP Admin Service` section.
3. Prefer extracting durable CSTP persistence logic into a dedicated module before the surface grows, for example:
   - `src/services/cstp-admin-service.js`, or
   - `src/lib/cstp-admin-service.js`
4. If admin actions require privileged server-side behavior, place serverless handlers under `api/` with narrow files such as:
   - `api/cstp-request-create.js`
   - `api/cstp-test-update.js`
   - `api/cstp-session-link.js`
5. Do not build public APIs in this phase. Any `api/` usage should remain admin/internal and should wait for RLS/access-control planning.

Recommended first step before code:

- Decide whether CSTP v1 admin helpers will be direct Supabase client calls behind existing admin UI gates, or server-side API handlers with service-role validation. That decision should happen before implementation because it affects RLS timing and actor logging.

## 9. Validation Checklist

Before implementation, confirm:

- [ ] CSTP migration v1 exists.
- [ ] Local validation passed.
- [ ] Helper boundaries are clear.
- [ ] Admin event requirements are clear.
- [ ] Request status transitions are defined.
- [ ] Test status transitions are defined.
- [ ] Session linkage rules are defined.
- [ ] No public dependency exists.
- [ ] No report/certification dependency exists.
- [ ] RLS/admin access plan is understood before non-local persistence work begins.
- [ ] Existing Grow session behavior remains protected.

## 10. Explicit Non-Goals

This document does not include or implement:

- code changes
- UI changes
- routes
- APIs
- RLS
- public reads
- reports
- report snapshots
- certifications
- public badges
- Source Directory public CSTP integration
- Community Grow CSTP integration
- automation
- breeder/source portal functionality

This is an internal backend service-layer planning document only.

