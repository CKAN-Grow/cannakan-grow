# CSTP Admin UI Integration Audit

## 1. Purpose

This document audits the completed internal CSTP admin UI workflow before operational polish, reporting, certification, or public CSTP work begins.

The audit verifies that the CSTP admin UI remains:

- admin-only
- API-driven
- aligned with the CSTP admin API layer
- consistent with lifecycle and audit boundaries
- protective of the existing `grow_sessions` system
- free of new public CSTP exposure

This audit does not add new CSTP features, reports, certifications, automation, breeder/source portals, public routing, Community Grow integration, Source Directory integration, or Grow session mutation behavior.

## 2. Scope Reviewed

Reviewed implementation surface:

- `app.js` CSTP admin request queue
- `app.js` CSTP admin request detail panel
- `app.js` CSTP request status management actions
- `app.js` CSTP test creation action from request detail
- `app.js` CSTP test management list and detail shell
- `app.js` CSTP test status management actions
- `app.js` CSTP session-link management shell
- `app.js` CSTP admin binding and refresh behavior
- `styles.css` admin-scoped CSTP styling selectors

Referenced planning and audit documents:

- `docs/cstp-admin-ui-architecture-plan.md`
- `docs/cstp-admin-api-integration-audit.md`
- `docs/cstp-session-compatibility-rules.md`

## 3. Completed UI Capabilities

The internal CSTP admin UI now includes these operational capabilities inside the existing admin dashboard area:

| Capability | Status | Notes |
|---|---:|---|
| Request queue | Complete | Lists CSTP requests with status filtering, refresh behavior, pagination affordances, loading state, empty state, and error state. |
| Request detail | Complete | Loads one request by id through the admin request detail API and supports back-to-queue behavior. |
| Request status management | Complete | Shows controlled request status actions for received, accepted, awaiting seeds, declined, and archive flows. |
| Test creation | Complete | Allows eligible accepted or awaiting-seeds requests to create an internal CSTP test through the admin test creation API. |
| Test list | Complete | Lists CSTP tests with status filtering, refresh behavior, loading state, empty state, and error state. |
| Test detail | Complete | Loads one CSTP test by id through the admin test detail API and supports back-to-list behavior. |
| Test status management | Complete | Shows controlled actions for pending, active, completed, and archived test states. |
| Session-link management | Complete | Lists, creates, refreshes, and archives CSTP test-to-grow-session relationship rows. |

The UI includes user-facing loading, saving, success, error, empty, and not-found handling across the request, test, and session-link workflows.

## 4. API Integrations Used

The admin UI uses the completed CSTP admin API layer rather than direct Supabase access.

| UI Area | API |
|---|---|
| Request queue | `GET /api/cstp-admin-requests-list` |
| Request detail | `GET /api/cstp-admin-request-detail` |
| Request status update | `POST /api/cstp-admin-request-status-update` |
| Test creation | `POST /api/cstp-admin-test-create` |
| Test list | `GET /api/cstp-admin-tests-list` |
| Test detail | `GET /api/cstp-admin-test-detail` |
| Test status update | `POST /api/cstp-admin-test-status-update` |
| Session-link list | `GET /api/cstp-admin-session-links-list` |
| Session-link creation | `POST /api/cstp-admin-session-link-create` |
| Session-link archival | `POST /api/cstp-admin-session-link-archive` |

The UI attaches the current auth bearer token to API requests and lets the API layer enforce admin authorization. No CSTP admin UI helper directly queries Supabase tables.

## 5. Workflow Coverage

Request workflow coverage:

- Request queue defaults to active operational records.
- Request status filtering supports all active statuses plus archived visibility.
- Request details show canonical internal request fields only.
- Request status actions are presented as admin affordances while backend lifecycle validation remains canonical.
- Request status updates refresh both the detail panel and queue.

Test workflow coverage:

- Test creation is available only from eligible request detail states in the UI.
- Test creation calls the admin API and refreshes request/test surfaces after success.
- Test list supports status filtering and selection into detail view.
- Test detail shows canonical internal test fields only.
- Test status actions are presented as admin affordances while backend lifecycle validation remains canonical.

Session-link workflow coverage:

- Session links are displayed as CSTP relationship rows.
- Session-link creation accepts an existing `grow_sessions.id`.
- Session-link archival affects the CSTP relationship row only.
- The UI refreshes session-link relationships after create/archive operations.
- Duplicate-link enforcement remains backend-owned.

## 6. Architecture Consistency Findings

Confirmed:

- CSTP admin UI is placed inside the existing `#admin` CSTP Testing Lab section.
- No new public route, public navigation item, Source Directory entry, or Community Grow entry was added by the admin UI work.
- The frontend remains thin and API-driven.
- Lifecycle maps remain in backend/internal helpers and APIs; the frontend only presents obvious allowed actions.
- Audit events are not constructed directly in the frontend.
- Mutation responses preserve audit warning visibility where the API returns partial audit results.
- Session-link UI does not edit Grow sessions.
- No direct Supabase table access was found in the CSTP admin request/test/session-link UI helpers.
- No reporting, certification, public badge, public trust scoring, automation, or breeder/source portal UI was added.

The existing admin CSTP Testing Lab still includes an older local/static lab preview below the new API-backed request and test workflow. That older panel was not changed in this pass. It should be reconciled during operational polish so admins have a cleaner single workflow before wider internal use.

## 7. Session Compatibility Protections

The current admin UI preserves the session compatibility rules:

- `grow_sessions` remain canonical.
- CSTP links are external relationship overlays through CSTP session-link records.
- Session-link creation requires only a Grow session id; it does not edit session content.
- Session-link archival does not delete or modify Grow sessions.
- The UI does not expand or mutate Grow session stage, timeline, analytics, media, reminders, notes, partitions, ownership, visibility, or completion behavior.
- The UI does not create CSTP-specific session forks.

## 8. Public Exposure Boundaries

Public exposure remains deferred.

Confirmed boundaries:

- No main navigation CSTP admin entry was added.
- No public CSTP admin route was added.
- No public report, certification, badge, or source-facing CSTP surface was added.
- No Community Grow integration was added.
- No Source Directory integration was added.
- No public read API was introduced by this UI work.

Search notes:

- `index.html` and `public/` did not show CSTP admin UI exposure matches during this audit.
- `styles.css` contains admin-scoped CSTP selectors used to style the admin dashboard surfaces; these are styling hooks only, not public content or route exposure.

## 9. Small Consistency Cleanup

No code cleanup was required during this audit pass.

The observed UI and binding patterns were consistent enough for this checkpoint:

- admin-only binding guards
- API route constants
- bearer-token API calls
- loading/error/empty state handling
- refresh behavior after mutations
- relationship-only session-link handling

## 10. Remaining Operational Polish Items

Recommended polish before reporting or public CSTP work:

- Reconcile the older local/static CSTP lab preview with the newer API-backed workflow so admins have one clear operational path.
- Add more refined admin copy for stale state, audit warning, and authorization/config failure cases.
- Consider extracting repeated admin CSTP API fetch patterns into a local admin UI utility if the UI grows.
- Add an audit/event inspection view only after an internal audit read API is planned and implemented.
- Add safer session selection tooling later, while keeping Grow session data read-only and relationship-only.
- Add deeper manual QA against a configured local/admin Supabase environment.
- Add focused browser-based checks for admin UI layout once a local test admin session is available.

## 11. Recommended Next Phase

The next phase should be operational polish and QA for the internal admin workflow:

1. Cleanly reconcile the older static admin lab preview with the API-backed workflow.
2. Improve admin copy and layout density inside the CSTP Testing Lab.
3. Validate the workflow manually with real local admin auth and local CSTP tables.
4. Plan audit-event read APIs and audit inspection UI.

Reports, immutable report snapshots, certifications, public trust surfaces, Source Directory integration, Community Grow integration, automation, and breeder/source portals should remain deferred.

## 12. Final Readiness Verdict

The internal CSTP admin UI workflow is ready for operational polish.

It is not a public CSTP feature set, not a reporting system, and not a certification system. The implementation remains admin-only, API-driven, and protective of the existing Grow session architecture.
