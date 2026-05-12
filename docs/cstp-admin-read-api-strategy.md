# CSTP Admin Read API Strategy

## 1. Purpose

CSTP now has internal admin mutation APIs for the v1 operational workflow. Those mutation routes allow approved admins to create requests, move request and test status forward, create tests, link Grow sessions to CSTP tests, and archive session-link relationships.

Operational admin UI will eventually need safe read/query APIs before it can show dashboards, queues, detail views, session-link management, or audit history. Those read APIs are the next exposure boundary and must preserve the same internal-only rules as the mutation APIs.

Read APIs must not become a shortcut around CSTP authorization, audit integrity, session compatibility rules, or future public trust boundaries. They should provide admin workflow visibility only; they should not create public CSTP data surfaces.

This document is planning only. It does not implement routes, UI, RLS, reports, certifications, automation, breeder/source portals, or public reads.

## 2. Current CSTP API Surface

Existing internal admin mutation APIs:

- `api/cstp-admin-request-create.js`
- `api/cstp-admin-request-status-update.js`
- `api/cstp-admin-test-create.js`
- `api/cstp-admin-test-status-update.js`
- `api/cstp-admin-session-link-create.js`
- `api/cstp-admin-session-link-archive.js`

Current behavior:

- Routes are admin-only.
- Routes authorize first with the internal CSTP authorization helper.
- Routes call internal execution helpers rather than mutating tables directly.
- Routes preserve explicit audit failure visibility.
- Session-link routes preserve `grow_sessions` compatibility and do not mutate Grow sessions.

No public CSTP APIs exist. There are no public CSTP reads, reports, certifications, public badges, Source Directory public CSTP integrations, Community Grow CSTP filters, automation endpoints, or breeder/source portal APIs.

## 3. Admin Read API Principles

Future CSTP read APIs should follow these principles:

- Admin-only access.
- No public exposure.
- No anonymous or unauthenticated CSTP reads.
- No bypassing `authorizeCstpAdminRequest`.
- Routes remain thin.
- Query execution should be centralized in internal CSTP read/repository helpers.
- Canonical data shaping should live in shared internal helper modules, not route files.
- Read APIs should not duplicate lifecycle logic.
- Read APIs should not infer certification/report states.
- `grow_sessions` remain canonical session entities.
- CSTP session relationships remain external overlays through `cstp_test_sessions`.
- Read APIs must not mutate `grow_sessions`.
- Read APIs must not change session stage, timeline, analytics, notes, reminders, media, partitions, ownership, visibility, or completion behavior.

Read APIs may include linked session identifiers and limited internal relationship context for admin operations, but they should not become public evidence/report APIs.

## 4. Recommended Initial Read APIs

Future internal-only endpoints may include the following.

### List CSTP Requests

Purpose:

- Show the internal request intake and review queue.
- Support admin filtering by status, archive state, source, and date.

Suggested future route:

- `api/cstp-admin-requests-list.js`

Implementation remains deferred.

### CSTP Request Detail

Purpose:

- Show one request and its operational context.
- Include related CSTP tests if needed for admin workflow.

Suggested future route:

- `api/cstp-admin-request-detail.js`

Implementation remains deferred.

### List CSTP Tests

Purpose:

- Show test orchestration records for internal workflow management.
- Support status and archive filtering.

Suggested future route:

- `api/cstp-admin-tests-list.js`

Implementation remains deferred.

### CSTP Test Detail

Purpose:

- Show one CSTP test, source/request context, and linked session relationship rows.
- Keep linked Grow sessions as referenced canonical entities rather than CSTP-owned data.

Suggested future route:

- `api/cstp-admin-test-detail.js`

Implementation remains deferred.

### List Session Links

Purpose:

- Show `cstp_test_sessions` relationships for a CSTP test.
- Support admin review of multi-KAN grouping and relationship archive state.

Suggested future route:

- `api/cstp-admin-session-links-list.js`

Implementation remains deferred.

### Audit Event Query APIs Later

Purpose:

- Show append-only CSTP admin events for request/test/session-link review.

Suggested future route:

- `api/cstp-admin-events-list.js`

Implementation should remain later than basic request/test reads. Audit event reads need careful access, filtering, and redaction rules.

## 5. Filtering / Query Requirements

Expected admin query needs:

- request status filters
- test status filters
- source filters
- request id filters
- CSTP test id filters
- linked session id filters
- date range filters
- created-at sorting
- updated-at sorting where available
- archive visibility handling
- pagination
- stable page size limits
- explicit sort direction

Default query behavior should be conservative:

- Exclude archived records unless `includeArchived` is explicitly requested.
- Use bounded page sizes.
- Use deterministic ordering, usually newest first for admin queues.
- Return normalized empty lists rather than treating no results as errors.
- Avoid broad unbounded table scans from API routes.

Future query helpers should define allowed filter keys so route query strings cannot become arbitrary Supabase filters.

## 6. Audit / Event Read Considerations

Audit logs are internal-only.

Future audit reads should preserve:

- append-only semantics
- actor identity visibility for admins
- event type consistency
- request/test/session-link relationship context
- historical ordering
- no public exposure

Audit event reads may need additional restrictions later:

- not every admin UI user may need full event history
- internal notes may need redaction rules
- event metadata may include operational details that should never become public report content

Audit event query APIs should not be implemented until basic admin read APIs and redaction expectations are clear.

## 7. Session Compatibility Requirements

Future CSTP read APIs must preserve Grow session compatibility.

Rules:

- Read APIs must not mutate `grow_sessions`.
- Read APIs must not delete Grow sessions.
- Read APIs must not change session visibility.
- Read APIs must not alter session stage, timeline, analytics, media, reminders, notes, partitions, ownership, or completion state.
- CSTP relationships remain external overlays through `cstp_test_sessions`.
- Grow session truth remains canonical.
- Future report reads must use report snapshots after those systems exist, not live mutable session data.

Admin read APIs may reference linked Grow session ids for operational review, but CSTP should not duplicate session records into CSTP-owned response models.

## 8. Future Admin UI Considerations

Future admin UI needs may include:

- request management dashboard
- request intake detail view
- request status action controls
- test management dashboard
- CSTP test detail view
- session-link management
- multi-KAN relationship review
- archived relationship visibility
- moderation/review tooling
- audit inspection tooling

UI remains deferred. When introduced, it should consume admin-only read APIs rather than importing CSTP internal service helpers directly into public client code.

## 9. Safety Boundaries

Future admin read APIs must preserve these boundaries:

- no public reads
- no public CSTP data
- no public certification or public trust exposure
- no public reports
- no report snapshots
- no Source Directory CSTP exposure
- no Community Grow integration
- no breeder/source portal access
- no automation
- no `grow_sessions` mutation
- no session lifecycle changes
- no session analytics, timeline, notes, reminders, media, or partition mutations

Internal admin reads should support operational review only.

## 10. Recommended Next Step

Recommended next implementation task:

1. Create an internal CSTP read/query helper layer.
2. Start with request-list query preparation and execution.
3. Implement `api/cstp-admin-requests-list.js` first.
4. Keep the route admin-only and thin.
5. Keep UI deferred.
6. Keep public exposure deferred.

The request-list API should prove authorization, pagination, filter allowlisting, archived handling, and normalized list responses before test/detail/audit read APIs are added.

## 11. Explicit Non-Goals

This document does not implement:

- APIs or routes
- UI
- RLS
- public reads
- reports
- report snapshots
- certifications
- public badges
- Source Directory CSTP exposure
- Community Grow CSTP exposure
- automation
- breeder/source portals
- app-flow wiring

This is a CSTP admin read API strategy document only.
