# CSTP Smoke Test Coverage

## Purpose

This document defines the initial CSTP operational smoke-test and QA framework for Cannakan Grow. The coverage is intentionally lightweight and internal-only so CSTP can be stabilized before immutable reporting, certifications, public exposure, automation, or breeder/source portal work begins.

The current smoke coverage validates the CSTP v1 operational path without touching production data, adding public routes, mutating `grow_sessions`, or introducing a new test framework.

## Test Location and Pattern

The smoke runner lives at:

- `scripts/cstp-smoke-tests.js`

The project does not currently define a formal test framework or `npm test` script. To avoid adding heavy tooling, CSTP smoke coverage uses a plain Node.js script with:

- built-in `assert/strict`
- real CSTP admin API route modules
- real internal CSTP helper/execution modules
- an in-memory Supabase/PostgREST-style mock
- no database connection
- no UI/browser automation
- no public CSTP surface

Run command:

```bash
node scripts/cstp-smoke-tests.js
```

## Coverage Implemented

The initial smoke runner validates:

- Admin authorization enforcement:
  - missing auth is rejected
  - authenticated non-admin users are rejected
  - authorized admin actor context is accepted

- CSTP request create flow:
  - admin-only route execution
  - internal execution boundary handoff
  - request insert payload execution through mocked Supabase
  - audit visibility, including deferred audit state when request-only event linkage cannot yet attach to a CSTP test

- CSTP request status update flow:
  - accepted lifecycle transition from `received` to `accepted`
  - invalid lifecycle transition rejection

- CSTP test create flow:
  - request-linked test creation
  - internal test execution boundary handoff
  - admin audit event insertion path

- CSTP test status update flow:
  - accepted lifecycle transition from `pending` to `active`
  - invalid lifecycle transition rejection

- CSTP session-link create/archive flow:
  - relationship-only link creation
  - duplicate-link rejection
  - relationship archival
  - confirmation that `grow_sessions` is not mutated

- Internal CSTP read APIs:
  - request list
  - request detail
  - test list
  - test detail
  - session-link list

## Operational QA Expectations

This smoke suite should be run before deeper CSTP implementation work, especially before:

- immutable report schema implementation
- snapshot generation pipeline work
- report publication workflows
- certification lifecycle implementation
- public read APIs
- public UI exposure

The smoke runner is not a replacement for staging validation. It is a fast local guardrail that confirms the current internal CSTP route/helper workflow still composes correctly.

## Remaining Untested Areas

The following areas remain intentionally outside this smoke-test layer:

- real Supabase network execution
- real database transactions
- real RLS behavior
- browser/admin UI interaction testing
- production/staging migration application
- immutable report generation
- report snapshot persistence
- certification issuance/history
- public CSTP APIs
- Source Directory integration
- Community Grow integration
- breeder/source portals
- automation and notifications

## Future Testing Layers

Recommended future CSTP validation layers:

1. Local database integration tests against the Supabase stack.
2. Staging migration and rollback validation.
3. Admin API integration tests with real auth fixtures.
4. Admin UI browser smoke tests for request/test/session-link workflows.
5. Immutable report snapshot generation tests.
6. Certification history and public-read boundary tests.
7. RLS policy tests once RLS is implemented.

## Boundaries Confirmed

The current smoke framework confirms:

- CSTP remains internal-only.
- Admin APIs remain authorization-gated.
- Routes remain thin and API-driven.
- Lifecycle validation remains centralized.
- Session links remain external overlays.
- `grow_sessions` is not mutated.
- Reports, snapshots, certifications, public badges, public reads, automation, breeder/source portals, Source Directory integration, and Community Grow integration remain deferred.
