# CSTP Admin UI Architecture Plan

## 1. Purpose

The CSTP backend operational foundation is now complete enough to plan the next layer: an internal admin UI for controlled CSTP operations.

This document defines the architecture and operational structure for that future UI before any frontend dashboard work begins. The UI must preserve:

- lifecycle integrity
- audit integrity
- session compatibility protections
- internal-only CSTP boundaries
- separation between admin operations and future public trust systems

This is a planning document only. It does not implement UI, modify routes, add pages, expose CSTP publicly, add reports, add certifications, add automation, or create breeder/source portal behavior.

## 2. Current Backend Capabilities

Completed backend capabilities now available for future internal admin UI planning:

- Authorization: CSTP admin APIs use `authorizeCstpAdminRequest` and fail closed for missing, invalid, non-admin, or unresolved authorization states.
- Lifecycle validation: request and test status transitions are centralized in the internal lifecycle helper layer.
- Audit/event system: meaningful CSTP mutations prepare and write append-oriented admin events through internal helper/execution boundaries.
- Execution boundary: mutation execution is centralized in CSTP internal services rather than duplicated in route handlers.
- Mutation APIs: admin-only routes exist for request creation, request status updates, test creation, test status updates, session-link creation, and session-link archival.
- Read APIs: admin-only routes exist for request list/detail, test list/detail, and session-link list.
- Duplicate-link protection: CSTP session-link creation protects against linking the same Grow session to the same CSTP test more than once.
- Session compatibility protections: CSTP references `grow_sessions` externally and does not mutate Grow session lifecycle, analytics, media, reminders, notes, partitions, or ownership.

## 3. Admin UI Principles

The CSTP admin UI should follow these principles:

- Admin-only visibility: CSTP operations must remain behind the existing admin boundary.
- Operational/internal-only tooling: initial screens should support internal workflow management, not public discovery.
- Thin frontend behavior: UI should collect inputs, display API responses, and guide operators without becoming a second business-rule engine.
- APIs remain canonical: the admin APIs and internal helpers remain the source for validation, mutation, audit, and lifecycle behavior.
- No frontend lifecycle duplication: the UI may show allowed actions, but final validation must remain server-side.
- No frontend audit construction: audit events must be created through backend execution helpers, not assembled in browser code.
- No direct `grow_sessions` mutation: UI must never update Grow session stage, timeline, analytics, notes, reminders, media, partition, visibility, or ownership data through CSTP flows.
- No public CSTP expansion: admin UI work must not add CSTP to public navigation or public route discovery.

## 4. Recommended Admin UI Structure

Current app structure observations:

- The app uses a hash-route single-page structure in `app.js`.
- Existing admin tooling lives under the `#admin` dashboard route.
- Admin dashboard sections are rendered through reusable panel/collapsible section patterns.
- `renderAdminPage()` assembles ordered admin panels.
- `renderAdminCstpLabSectionMarkup()` already exists as a CSTP admin/lab concept, but it currently follows older local/static operational patterns.
- `bindAdminCstpLabSection()` handles CSTP lab UI interactions.
- Existing public Source Directory, Community Grow, and CSTP report surfaces must remain separate from this future internal admin UI.

Recommended future placement:

- Keep CSTP admin screens under the existing `#admin` admin dashboard hierarchy.
- Prefer evolving the existing CSTP Testing Lab admin panel into an API-backed internal operations workspace.
- Do not create a public CSTP route or a main-nav CSTP entry.
- Treat deeper operational screens as admin-only subviews under `#admin`, such as internal request/test detail states, if the current hash-route pattern remains the project convention.

Recommended navigation organization:

- Keep CSTP as an admin dashboard section, not a top-level public app section.
- Use the existing admin collapsible section model for the initial request queue and test management surfaces.
- If deep links are needed later, keep them under admin-only hash routes and ensure non-admin users fall back to the existing admin access handling.

Recommended section/component boundaries:

- Request Queue: list/filter CSTP requests and select a request for review.
- Request Detail: show request fields, status, notes, and allowed admin actions.
- Test Management: create/manage CSTP tests linked to accepted requests.
- Session-Link Management: attach/archive relationship rows between CSTP tests and existing Grow sessions.
- Archive View: expose archived requests/tests/session links for internal audit/recovery.
- Audit/Event Inspection: future screen for append-only admin event review.

Recommended data-fetch organization:

- Use admin API routes as the only data source for CSTP operational UI.
- Keep API request wrappers local to future admin CSTP UI code or a clearly named internal admin client helper.
- Normalize HTTP/UI loading, error, and empty states at the frontend edge.
- Keep lifecycle, duplicate-link, and audit rules server-side.

Recommended modal/detail patterns:

- Use detail panels for request/test records where possible to match the existing admin dashboard feel.
- Use confirmation dialogs/modals only for state-changing actions such as archive, decline, or status transitions with operational consequences.
- Keep session-link selection separate from Grow session editing; it should choose/link an existing session, not modify one.

## 5. Recommended Initial Admin Screens

Implementation remains deferred, but the recommended screens are:

1. CSTP Request Queue

   Displays internal CSTP requests with status, source, variety, created date, archive state, and pagination/filtering.

2. Request Detail View

   Displays one CSTP request and offers allowed admin actions such as accept, decline, mark awaiting seeds, and archive through the admin APIs.

3. CSTP Test Management

   Supports creating CSTP tests from accepted requests and managing test lifecycle states through the admin test APIs.

4. Session-Link Management

   Supports linking existing Grow sessions to CSTP tests and archiving CSTP relationship rows without mutating `grow_sessions`.

5. Archived Records View

   Allows admins to review archived requests, tests, and session-link relationships without treating them as active workflow items.

6. Audit/Event Inspection

   Future internal view for reviewing append-only CSTP admin events once audit read APIs are introduced.

## 6. Workflow UX Considerations

Lifecycle transition UX:

- The UI may show likely next actions based on current status.
- Server-side lifecycle validation remains mandatory.
- Invalid transitions should display the normalized API error clearly and non-destructively.

Invalid-transition handling:

- Do not hide server validation failures behind generic messages.
- Preserve the status/action context so admins can understand why a transition was rejected.
- Refresh the affected record after rejected transitions when stale UI state is possible.

Audit visibility expectations:

- Mutation responses should preserve audit failure visibility.
- UI should distinguish primary mutation success from audit persistence failure if the API returns partial execution details.
- Full audit inspection remains deferred until audit read APIs exist.

Duplicate-link rejection UX:

- Session-link creation should surface duplicate-link rejections as relationship conflicts, not as Grow session errors.
- The UI should make clear that linking does not transfer ownership or alter the linked Grow session.

Archived visibility handling:

- Archive filters should default to active records.
- Archived records should be available to admins through explicit filters/views.
- Archive actions should be framed as internal workflow archival, not deletion of Grow sessions or public records.

## 7. Session Compatibility Requirements

The admin UI must preserve these session rules:

- `grow_sessions` remain canonical.
- CSTP overlays relationships through CSTP session-link records only.
- The UI must not create CSTP-specific session forks.
- The UI must not mutate Grow session stage, timeline, analytics, notes, reminders, media, partition data, ownership, visibility, or completion logic.
- Session-link screens should show relationship metadata only until a future, explicitly approved session-selection/read strategy exists.
- Any future Grow session selector must be read-only with respect to Grow session data.

## 8. Future Reporting/Public Boundaries

The admin UI must not introduce:

- public CSTP UI
- public CSTP routes
- public certifications
- public source pages beyond existing soft-release behavior
- public reports
- Community Grow CSTP integration
- Source Directory public CSTP expansion
- report snapshot generation
- breeder/source portals
- automation/reminder workflows

Future reporting and certification systems require separate architecture, schema, backend, and UI planning before exposure.

## 9. Recommended UI Implementation Order

Recommended future implementation order:

1. Request queue
2. Request detail
3. Test management
4. Session-link management
5. Archive views
6. Audit/event inspection
7. Immutable reporting later
8. Public trust systems later

This order keeps the UI aligned with existing backend maturity: requests and tests first, relationship management second, audit visibility later, and public trust systems only after immutable report/certification layers exist.

## 10. Safety Boundaries

Future CSTP admin UI work must preserve these boundaries:

- admin-only access
- no public exposure
- no public nav entry
- no direct `grow_sessions` mutation
- no duplicated lifecycle logic
- no duplicated audit logic
- no direct database writes from frontend code
- no report/certification/public trust behavior
- APIs and internal helpers remain canonical

## 11. Explicit Non-Goals

This document does not implement:

- UI
- routes
- pages
- admin dashboard components
- RLS
- reports
- certifications
- public CSTP exposure
- automation
- breeder/source portals
- public Source Directory expansion
- Community Grow CSTP integration

## 12. Final Recommendation

The future CSTP admin UI should begin as a small internal operations layer inside the existing admin dashboard structure.

The first UI work should focus on the request queue and request detail surfaces, using the completed admin APIs directly and preserving server-side lifecycle, audit, authorization, and session compatibility boundaries. CSTP public trust systems should remain deferred until immutable reports and certification history are implemented.
