# CSTP Admin API Boundary Plan

## 1. Purpose

APIs are the next exposure boundary for CSTP. The current CSTP backend foundation remains internal-only: helper layers validate and prepare data, and the execution boundary can perform controlled internal writes, but nothing is exposed through routes, UI, public reads, reports, certifications, automation, or breeder/source workflows.

Future CSTP admin APIs must preserve:

- lifecycle integrity
- audit integrity
- session protection
- internal-only visibility

Admin routes should be treated as thin orchestration boundaries. They should not become a second implementation of CSTP business rules.

## 2. Current Backend State

Completed backend foundation:

- Lifecycle validation for CSTP request and test state transitions.
- Admin event helpers for append-only audit payload construction.
- Request helpers for validation, normalization, insert payload preparation, and status update preparation.
- Test helpers for validation, normalization, creation payloads, status updates, and archival preparation.
- Session-link helpers for CSTP test-to-grow-session relationship payloads.
- Internal execution boundary for request creation, test creation, test status updates, test archival, session-link creation, and session-link archival.
- Duplicate-link protection through supplied `existingLinks` or internal `cstp_test_sessions` lookup.
- Explicit audit failure handling that distinguishes primary mutation success from admin event failure.

No public CSTP surface currently depends on these helpers.

## 3. Admin API Boundary Principles

Future admin APIs should follow these principles:

- Admin-only access.
- No public CSTP reads.
- APIs remain thin orchestration layers.
- Canonical validation stays in `src/services/cstp/internal/`.
- APIs must call internal execution helpers rather than bypassing them.
- APIs must not call Supabase directly for CSTP mutations when an execution helper exists.
- APIs must not mutate `grow_sessions`.
- APIs must not change session stage, timeline, analytics, notes, reminders, media, partitions, ownership, visibility, or completion behavior.
- Audit failure states must be returned explicitly.
- Public report/certification language must not appear in admin workflow responses.

## 4. Recommended API Structure

Current `api/` structure was inspected.

Findings:

- `api/` currently uses flat CommonJS serverless route files.
- Existing route names are task-oriented, such as `push-send.js`, `grow-reminder-action.js`, and `grow-reminders-run.js`.
- Existing routes define local `module.exports = async function handler(...)` handlers.
- There is no shared admin route framework or route grouping mechanism yet.
- There is no reusable CSTP API module yet.

Recommended future CSTP admin route organization:

- Keep routes flat under `api/` to match the current project convention.
- Use explicit admin-scoped file names.
- Prefer narrow route files over one broad catch-all route until a shared router pattern exists.

Recommended future names:

- `api/cstp-admin-request-create.js`
- `api/cstp-admin-request-status.js`
- `api/cstp-admin-test-create.js`
- `api/cstp-admin-test-status.js`
- `api/cstp-admin-session-link-create.js`
- `api/cstp-admin-session-link-archive.js`

Internal module usage boundary:

- Routes may import from `src/services/cstp/internal/`.
- Routes should call execution functions only.
- Routes should not import lower-level helper modules unless the execution boundary explicitly requires a separate read/preview behavior later.
- Routes should not create report, certification, public badge, or Source Directory behavior.

No routes are implemented by this plan.

## 5. Recommended Initial Admin Endpoints

Future internal-only endpoints may include:

- Create CSTP request.
- Update CSTP request status.
- Create CSTP test.
- Update CSTP test status.
- Link Grow session to CSTP test.
- Archive CSTP session link.
- Query admin events later.

All endpoints remain deferred.

Suggested implementation sequence:

1. Create request API.
2. Create test API.
3. Update test status API.
4. Link session API.
5. Archive session link API.
6. Request status API.
7. Admin event query API later.

Admin event querying should wait until access-control, redaction, and internal audit display requirements are clear.

## 6. Authentication / Authorization Planning

Existing project patterns were inspected.

Observed patterns:

- User-facing action routes extract a bearer token from the `Authorization` header.
- Some routes validate the token through Supabase Auth using `/auth/v1/user`.
- Service-role Supabase keys are used server-side for privileged REST access.
- Cron-like runner routes use `CRON_SECRET` when configured, with local fallback behavior for local requests.
- No reusable admin role middleware was found.
- No clear shared admin role table or authorization helper was identified in the inspected API layer.

Future CSTP admin APIs should not ship until an admin authorization pattern is selected.

Recommended auth plan:

- Require bearer token authentication.
- Resolve the authenticated Supabase user server-side.
- Add a dedicated admin authorization check before CSTP execution helpers are called.
- Keep service-role mutation access server-side only.
- Do not rely on frontend/UI gating as the only admin control.
- Document whether admin role checks come from a profiles table, an admin allowlist, Supabase claims, or another approved source before implementation.

No auth implementation is included here.

## 7. Request Validation Strategy

API validation should remain lightweight.

API responsibilities:

- Enforce HTTP method.
- Parse request body.
- Extract bearer token.
- Resolve authenticated actor.
- Attach actor id as `adminUserId` or `createdBy`.
- Pass payload to the internal execution boundary.
- Return normalized execution result.

Canonical validation should remain in:

- `lifecycle.js`
- `admin-events.js`
- `requests.js`
- `tests.js`
- `session-links.js`
- `execution.js`

APIs should not duplicate lifecycle transition maps, duplicate session-link checks, or reimplement admin event construction.

## 8. Error Handling Strategy

Future APIs should expose normalized internal execution results.

Required behavior:

- Audit failures remain visible.
- Partial mutation states remain explicit.
- Primary mutation success and admin event success are reported separately.
- Internal error details should be normalized before leaving the API.
- Sensitive server configuration details should not be exposed.
- Admin-facing responses may include structured internal status codes.

Recommended response shape:

- `ok`
- `status`
- `operation`
- `transaction`
- relevant entity result
- `adminEvent`
- normalized `error` when present

Routes should preserve execution-layer status values rather than inventing unrelated response vocabulary.

## 9. Future Admin UI Integration

Future admin UI integration is planning-only and remains deferred.

Possible later UI surfaces:

- Internal CSTP request dashboard.
- Request review and status management.
- CSTP test creation and lifecycle management.
- Session-link management for multi-KAN testing.
- Admin event history display.
- Operational moderation/review flows.

The UI should call admin-only APIs after route auth, authorization, and error handling are implemented. The UI should not call CSTP service helpers directly from public client code.

## 10. Safety Boundaries

Future CSTP admin APIs must preserve these boundaries:

- No public reads.
- No public certifications.
- No public report access.
- No Community Grow integration.
- No Source Directory exposure.
- No breeder/source portal access.
- No automation.
- No `grow_sessions` mutation.
- No session lifecycle changes.
- No session analytics, timeline, notes, reminders, media, or partition mutations.

CSTP admin APIs should operate only on CSTP v1 tables through the internal execution boundary.

## 11. Recommended Next Step

Recommended next implementation task:

- Implement internal admin-only request APIs first.
- Start with request creation only.
- Keep UI deferred.
- Keep public exposure deferred.
- Keep RLS planning separate until the admin auth model is selected.

The first API route should prove the admin boundary, actor handling, execution-helper usage, and normalized error response pattern before additional routes are added.

## 12. Explicit Non-Goals

This document does not implement:

- API routes.
- UI.
- RLS.
- Public CSTP reads.
- Reports.
- Report snapshots.
- Certifications.
- Source Directory CSTP exposure.
- Community Grow CSTP exposure.
- Automation.
- Breeder/source portals.
- App-flow wiring.

This is an admin API boundary planning document only.
