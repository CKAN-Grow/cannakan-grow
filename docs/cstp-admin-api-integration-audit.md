# CSTP Admin API Integration Audit

## 1. Purpose

This document audits the completed internal CSTP admin API layer before any admin UI work begins.

The audit verifies that the CSTP admin routes are:

- consistent
- authorization-first
- internal-only
- thin at the route boundary
- aligned with CSTP session compatibility rules
- free of public CSTP exposure
- ready for admin UI planning

This is an audit document only. It does not add UI, public features, reports, certifications, automation, breeder/source portals, public reads, or Grow session mutations.

## 2. Routes Reviewed

Reviewed CSTP admin API routes:

- `api/cstp-admin-request-create.js`
- `api/cstp-admin-request-status-update.js`
- `api/cstp-admin-request-detail.js`
- `api/cstp-admin-requests-list.js`
- `api/cstp-admin-test-create.js`
- `api/cstp-admin-test-status-update.js`
- `api/cstp-admin-test-detail.js`
- `api/cstp-admin-tests-list.js`
- `api/cstp-admin-session-link-create.js`
- `api/cstp-admin-session-link-archive.js`
- `api/cstp-admin-session-links-list.js`

## 3. Completed Admin Mutation APIs

Completed internal mutation routes:

| Route | Purpose | Execution Boundary |
|---|---|---|
| `api/cstp-admin-request-create.js` | Create internal CSTP request records | `executeCstpRequestCreation` |
| `api/cstp-admin-request-status-update.js` | Update CSTP request status | `executeCstpRequestStatusUpdate` |
| `api/cstp-admin-test-create.js` | Create internal CSTP test records | `executeCstpTestCreation` |
| `api/cstp-admin-test-status-update.js` | Update CSTP test status | `executeCstpTestStatusUpdate` |
| `api/cstp-admin-session-link-create.js` | Link CSTP tests to Grow sessions through `cstp_test_sessions` | `executeCstpSessionLinkCreation` |
| `api/cstp-admin-session-link-archive.js` | Archive CSTP session-link relationship rows | `executeCstpSessionLinkArchive` |

Mutation API findings:

- Routes enforce method boundaries before authorization.
- Routes authorize before parsing or executing mutations.
- Routes pass `authorization.actor.userId` into execution helpers for audit identity.
- Routes do not build admin events directly.
- Routes do not duplicate lifecycle transition maps.
- Routes do not directly mutate Supabase CSTP tables.
- Session-link routes do not mutate `grow_sessions`.
- Audit failures remain explicit in execution-layer responses.

## 4. Completed Admin Read APIs

Completed internal read routes:

| Route | Purpose | Data Surface |
|---|---|---|
| `api/cstp-admin-request-detail.js` | Load one internal CSTP request | `cstp_requests` |
| `api/cstp-admin-requests-list.js` | List internal CSTP requests | `cstp_requests` |
| `api/cstp-admin-test-detail.js` | Load one internal CSTP test | `cstp_tests` |
| `api/cstp-admin-tests-list.js` | List internal CSTP tests | `cstp_tests` |
| `api/cstp-admin-session-links-list.js` | List internal CSTP session-link relationship rows | `cstp_test_sessions` |

Read API findings:

- Routes enforce `GET` with `OPTIONS` support.
- Routes authorize before query parameter validation or read execution.
- Detail routes validate UUID identifiers before querying.
- List routes use allowlisted filters and bounded pagination.
- Request and test list routes support archive visibility controls.
- Session-link list route reads relationship rows only and does not expand Grow session data.
- Read routes do not mutate records.
- Read routes do not expose report, certification, Source Directory, Community Grow, or public trust concepts.

## 5. Authorization Model

All reviewed routes use `authorizeCstpAdminRequest`.

Observed behavior:

- Missing/invalid bearer auth returns normalized `401`.
- Authenticated non-admin users return normalized `403`.
- Authorization/config infrastructure failures are returned through the authorization helper as normalized `501` or `500` responses as appropriate.
- Verified admins receive a normalized actor context.
- Routes use the actor context for mutation execution where audit identity is required.

Authorization remains centralized in `src/services/cstp/internal/auth.js`. No route implements its own admin role check.

## 6. Execution Boundary Usage

Mutation routes call the CSTP execution boundary rather than directly mutating tables.

Execution boundary protections:

- lifecycle validation stays in internal helpers
- audit event preparation stays in internal helpers
- database writes stay in the internal execution layer
- partial audit failures remain visible
- session-link duplicate protection stays in execution/helpers
- session-link execution explicitly preserves `mutatesGrowSession: false`

Read routes currently contain local read helper functions for the first admin read slices. They are still route-scoped, authorization-first, allowlisted, and internal-only. A future cleanup may centralize read helpers into `src/services/cstp/internal/reads.js` if admin read behavior expands.

## 7. Audit Behavior

Audit behavior is centralized for mutation flows:

- request creation
- request status updates
- test creation
- test status updates
- session-link creation
- session-link archival

Routes do not construct `cstp_admin_events` payloads directly. Admin event payload creation and persistence behavior remains inside the internal helper/execution layers.

Audit events are append-oriented and internal-only. Audit data is not exposed through public routes. Audit read APIs remain deferred.

## 8. Session Compatibility Protections

Session compatibility findings:

- CSTP session links remain external overlays through `cstp_test_sessions`.
- No route mutates `grow_sessions`.
- No route deletes Grow sessions.
- No route changes Grow session stage, timeline, analytics, notes, reminders, media, partitions, ownership, visibility, or completion behavior.
- Session-link creation uses centralized duplicate-link protection.
- Session-link archival affects only relationship rows.
- Session-link list reads relationship-layer data only and does not expand Grow session evidence.

`grow_sessions` remain canonical.

## 9. Consistency Findings

Consistent patterns confirmed:

- all CSTP admin routes use CommonJS route exports
- all routes use a local `json(response, status, payload)` helper
- all routes handle `OPTIONS`
- all mutation routes use `POST` or `POST/PATCH`
- all read routes use `GET`
- all routes call `authorizeCstpAdminRequest`
- all routes return normalized `ok` flags
- route-local validation is limited to HTTP/body/query boundary concerns
- CSTP lifecycle, audit, and duplicate-link rules remain outside route files

No blocking consistency issues were found during this pass.

## 10. Remaining Deferred Items

Still intentionally deferred:

- admin UI
- public CSTP pages
- public CSTP reads
- RLS implementation for CSTP tables
- report generation
- report snapshots
- certifications
- Source Directory CSTP public exposure
- Community Grow CSTP filters
- breeder/source portals
- automation and notifications
- audit event read APIs
- centralized CSTP read/repository helper extraction

## 11. Readiness for Admin UI Planning

The internal CSTP admin API layer is ready for admin UI planning with these constraints:

- UI should call admin-only API routes, not import internal helpers directly into client code.
- UI must treat CSTP as internal-only.
- UI should not introduce public navigation or public CSTP surfaces.
- UI should preserve existing authorization boundaries.
- UI should not mutate Grow sessions directly.
- UI should present report/certification/public trust systems as unavailable until those future layers are implemented.

## 12. Final Audit Verdict

The CSTP admin API layer is consistent enough for controlled admin UI planning.

The route set preserves:

- admin-only authorization
- internal-only API boundaries
- centralized mutation execution
- centralized lifecycle/audit behavior
- session compatibility
- no public CSTP exposure

No code changes were required during this audit beyond creating this document.
