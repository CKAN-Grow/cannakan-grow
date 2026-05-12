# CSTP Supabase Execution Boundary Plan

## 1. Purpose

Database execution is the next major risk boundary for CSTP. The internal helper layer currently validates inputs, applies lifecycle rules, prepares mutation payloads, and prepares admin audit events, but it does not write to Supabase.

Future Supabase writes must be centralized and controlled. CSTP should not scatter direct database calls across request, test, session-link, API, or UI code. A single internal execution boundary is required to preserve lifecycle consistency, audit consistency, and Grow session compatibility.

## 2. Current State

Current internal CSTP helper layers:

- Lifecycle validation exists in `src/services/cstp/internal/lifecycle.js`.
- Admin event preparation exists in `src/services/cstp/internal/admin-events.js`.
- Request payload helpers exist in `src/services/cstp/internal/requests.js`.
- Test payload helpers exist in `src/services/cstp/internal/tests.js`.
- Session link payload helpers exist in `src/services/cstp/internal/session-links.js`.
- Shared constants and errors exist in `src/services/cstp/internal/constants.js` and `src/services/cstp/internal/errors.js`.

Database writes are intentionally deferred. The helpers return validated, schema-aligned payloads with `dbExecution: "deferred"` where future writes are expected.

## 3. Execution Boundary Principles

Future execution must follow these principles:

- Do not place direct Supabase calls inside every helper layer.
- Use one internal CSTP execution boundary for database writes.
- All writes must pass lifecycle and payload validation before execution.
- Meaningful mutations must prepare matching admin event payloads.
- Admin event creation must not be silently skipped.
- `grow_sessions` must not be mutated by CSTP execution helpers.
- Public reads remain prohibited.
- CSTP execution remains internal-only until admin API, RLS, and ownership boundaries are explicitly reviewed.

The execution boundary should consume prepared helper outputs rather than reimplementing business rules.

## 4. Internal Client Pattern Audit

Existing project patterns were inspected in `api/`.

Findings:

- Supabase usage is currently route-local, not centralized in a shared server client module.
- Existing API files use CommonJS.
- Existing serverless routes define local `getRuntimeConfig()` helpers.
- Existing route-local config uses environment fallback patterns:
  - `CANNAKAN_SUPABASE_URL`
  - `SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `CANNAKAN_SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_SERVICE_KEY`
  - `SUPABASE_SECRET_KEY`
- Existing Supabase REST helpers use `fetch` against `${supabaseUrl}/rest/v1/...`.
- Existing service-role calls set both `apikey` and `Authorization` headers from the service role key.
- Existing mutation patterns use Supabase REST with method-specific options and `Prefer` headers.

No code was modified during this audit.

## 5. Recommended Execution Architecture

Recommended future location:

- `src/services/cstp/internal/execution.js`

Alternative name:

- `src/services/cstp/internal/repository.js`

Recommendation: use `execution.js` first because the next concern is controlled execution of already-prepared helper payloads. If the layer grows into query composition and persistence abstractions, a later `repository.js` split can be considered.

Future execution code should:

- Remain under `src/services/cstp/internal/`.
- Use CommonJS to match current backend/serverless style.
- Consume prepared payloads from `requests.js`, `tests.js`, and `session-links.js`.
- Provide a small internal Supabase REST execution adapter.
- Keep APIs and UI outside this layer.
- Avoid public reads and public route exposure.

A shared Supabase server client helper could be created later if multiple backend domains need the same behavior, but CSTP should not wait on a broad refactor.

## 6. Transaction / Sequencing Requirements

Required write sequence:

1. Validate input.
2. Validate lifecycle transition when status changes.
3. Prepare the primary mutation payload.
4. Prepare the admin event payload or explicit deferred event intent.
5. Execute the primary mutation.
6. Execute the admin event insert.
7. Return a normalized internal result.

True database transactions are not available through the current route-local REST pattern. If future execution uses REST calls, atomicity across primary mutation and admin event insert will be limited unless a database function/RPC or server-side transaction layer is introduced later.

Until true transaction support exists, failure behavior must be explicit:

- If primary mutation fails, do not attempt admin event insert.
- If primary mutation succeeds and admin event insert fails, return a failure state that clearly identifies audit-write failure.
- Do not silently treat an audit failure as success.
- Consider whether compensating archive/retry behavior is needed before production admin usage.

## 7. Audit Event Requirements

Lifecycle-changing writes must create admin events.

Required audit behavior:

- Request creation prepares `request_created`.
- Request status updates prepare `request_status_changed`, `request_archived`, or `seeds_received`.
- Test creation prepares `test_created`.
- Test status updates prepare `test_status_changed` or `test_archived`.
- Session link creation prepares `session_linked`.
- Session link archival prepares `session_link_archived`.

Admin event failures must not be ignored. If the execution layer cannot persist an admin event, the returned result must clearly report that the primary mutation and audit mutation are out of sync.

If atomicity is not available, the execution layer must document that limitation in code comments and result metadata.

## 8. Safety Boundaries

The execution boundary must preserve these limits:

- No public reads.
- No UI access.
- No route access yet.
- No Source Directory exposure.
- No Community Grow exposure.
- No certification exposure.
- No report exposure.
- No automation.
- No breeder/source portal access.
- No `grow_sessions` mutation.

CSTP may reference `grow_sessions` through `cstp_test_sessions`, but it must not alter session lifecycle, analytics, timeline, notes, reminders, media, ownership, visibility, or partition behavior.

## 9. Implementation Readiness Checklist

Before implementation begins, confirm:

- [ ] Supabase client or REST execution pattern is selected.
- [ ] Environment variable names are confirmed.
- [ ] CSTP table names come from `CSTP_TABLES`.
- [ ] Request/test/session-link helpers remain the only source of prepared mutations.
- [ ] Lifecycle validation happens before status writes.
- [ ] Admin event insert sequencing is defined.
- [ ] Error handling and normalized result shape are defined.
- [ ] Rollback or partial-failure behavior is documented.
- [ ] No public access path exists.
- [ ] No `grow_sessions` mutation path exists.
- [ ] Local Supabase validation is planned before any API wiring.

## 10. Recommended Next Step

Recommended next implementation task:

- Create a non-public internal execution helper at `src/services/cstp/internal/execution.js`.
- Start with create-request execution only.
- Consume the existing request helper output rather than duplicating validation logic.
- Keep APIs, UI, RLS, reports, certifications, automation, and public features deferred.

This narrow first execution slice should validate the internal write pattern before test execution, session linkage execution, or admin API work is attempted.

## 11. Explicit Non-Goals

This document does not implement:

- Database writes.
- APIs.
- UI.
- Routes.
- RLS.
- Public exposure.
- Reports.
- Report snapshots.
- Certifications.
- Source Directory CSTP exposure.
- Community Grow CSTP exposure.
- Automation.
- Breeder/source portals.

This is a planning document only.
