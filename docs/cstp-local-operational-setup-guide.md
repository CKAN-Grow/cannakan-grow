# CSTP Local Operational Setup Guide

## 1. Purpose

This guide documents the safest local operational setup process for running real internal CSTP validation workflows before immutable reporting implementation begins.

It is documentation and setup guidance only. It does not add CSTP features, modify architecture, implement reports, implement certifications, expose CSTP publicly, add automation, add breeder/source portals, integrate Community Grow, integrate Source Directory, or mutate `grow_sessions`.

## 2. Recommended Validation Environment

Use only a local or isolated staging environment for CSTP operational validation.

Recommended environment:

- local Supabase through Docker Desktop and Supabase CLI
- local app runtime pointed at local Supabase
- local auth users only
- local `public.admin_users` membership for approved admin testers
- disposable CSTP request/test/session-link records
- non-production Grow session records for session-link validation

Do not validate first against production.

## 3. Local Supabase and Runtime Expectations

Before manual CSTP validation:

- Supabase local services should be running.
- The active CSTP v1 migration should be applied locally.
- Existing shared tables should be present, including:
  - `public.grow_sessions`
  - `public.sources`
  - `auth.users`
  - `public.admin_users`
- CSTP v1 tables should be present:
  - `public.cstp_requests`
  - `public.cstp_tests`
  - `public.cstp_admin_events`
  - `public.cstp_test_sessions`

The app runtime must have Supabase configuration available through the project’s existing runtime config pattern. If runtime config values are missing, the app may show setup/config messaging instead of enabling operational admin flows.

For browser-based CSTP admin validation, the local app runtime must also serve the protected `/api/cstp-admin-*` routes. The `local-server.ps1` helper is useful for static shell checks, but it does not execute API route modules and is not sufficient for full CSTP admin workflow QA.

## 4. Admin Account Setup Expectations

CSTP admin APIs require an authenticated admin actor.

Local validation should include:

- one valid Supabase auth user for admin testing
- one non-admin Supabase auth user for access-denial testing
- a matching `public.admin_users` row for the admin user
- no `public.admin_users` row for the non-admin user

The admin user id should match the authenticated Supabase `auth.users.id` value.

## 5. `public.admin_users` Expectations

CSTP authorization checks depend on admin membership being resolvable.

Expected behavior:

- authenticated admin user with `public.admin_users` membership may call internal CSTP admin APIs
- authenticated non-admin user without membership is rejected
- missing/expired auth is rejected
- ambiguous or missing admin identity fails closed

Admin identity must be real because CSTP audit events depend on reliable actor context.

## 6. Bearer Token and Admin Session Expectations

The internal CSTP admin UI calls CSTP admin APIs with the current auth bearer token.

Validation expectations:

- admin is signed in through the normal local app auth flow
- API requests include `Authorization: Bearer <token>`
- CSTP admin routes authorize before reading or mutating CSTP records
- failed auth does not expose CSTP data
- no route uses anonymous or fake admin actor identity

If local auth is not configured, route-level CSTP validation should stop at authorization failure until auth is fixed.

## 7. Safe Local/Staging-Only Testing Guidance

Use disposable internal CSTP records.

Safe test data guidance:

- use local-only request records
- use local-only CSTP test records
- use local/non-production Grow sessions for relationship-link checks
- verify session-link actions do not edit `grow_sessions`
- keep reports, snapshots, certifications, Source Directory exposure, and Community Grow exposure out of scope

Do not use production breeder/source data for first operational validation.

## 8. Recommended Operational Validation Flow

Use this flow before immutable reporting implementation:

1. Start local Supabase and local app runtime.
2. Confirm runtime Supabase config is available.
3. Run:

```bash
node scripts/cstp-smoke-tests.js
```

4. Launch the local app.
5. Sign in as a validated admin user.
6. Open the internal admin CSTP Testing Lab.
7. Validate request workflows:
   - create request or seed local request data
   - accept request
   - decline a separate request
   - move accepted request to awaiting seeds
   - archive request
   - verify invalid transitions fail
8. Validate test workflows:
   - create test from eligible request
   - activate test
   - complete test
   - archive test
   - verify invalid transitions fail
9. Validate session-link workflows:
   - attach an existing local `grow_sessions.id`
   - verify duplicate-link rejection
   - archive the relationship
   - confirm `grow_sessions` remains unchanged
10. Validate authorization workflows:
   - missing auth
   - non-admin auth
   - admin auth
11. Capture friction or unclear behavior.
12. Make only small operational polish changes.
13. Rerun smoke tests after changes.

## 9. Troubleshooting

### Missing Runtime Config

Symptoms:

- app shows setup/config messaging
- CSTP admin API calls fail configuration checks
- build reports missing Supabase runtime config values
- the local setup helper offers Dev QA Bypass, but protected CSTP admin APIs remain unavailable

Checks:

- confirm local Supabase URL is configured
- confirm anon/service role keys are available where the project expects them
- rerun the project build/config generation step if needed
- confirm the app is running through an API-capable local runtime before browser-testing CSTP admin workflows

### Failed Admin Auth

Symptoms:

- CSTP admin APIs return unauthorized responses
- admin UI cannot load CSTP queues
- bearer token is missing or invalid

Checks:

- confirm the user is signed in locally
- confirm API requests include a bearer token
- confirm local auth session has not expired
- sign out and sign in again

### Missing `admin_users` Membership

Symptoms:

- signed-in user receives forbidden responses
- non-admin behavior appears even for the intended admin user

Checks:

- confirm `auth.users.id` for the local admin account
- confirm `public.admin_users.user_id` matches that id
- confirm the local Supabase database contains the expected admin row

### API Authorization Failures

Symptoms:

- 401/403 responses from CSTP admin APIs
- no CSTP records load in admin UI

Checks:

- 401 usually means missing/invalid auth
- 403 usually means authenticated but not admin-authorized
- 501/500 may indicate local auth/config infrastructure is incomplete
- verify the route is not being called before sign-in completes

### Local Build or Runtime Warnings

Known local warning:

```text
Supabase runtime config was generated without values. The app will show the setup screen until config values are provided.
```

This means the build ran, but local Supabase values were not available to the runtime config generator. Provide local values before browser-based operational validation.

Known static-server limitation:

```text
This local-server.ps1 helper serves static files only. CSTP admin browser QA requires an API-capable local runtime so protected /api/cstp-admin-* routes can authorize against local Supabase.
```

This means the app shell may load, but API-backed CSTP admin screens cannot complete real operational browser QA through the static helper alone.

### Smoke-Test Failures

If `node scripts/cstp-smoke-tests.js` fails:

- read the assertion failure location
- confirm CSTP route exports still load
- confirm lifecycle status names did not drift
- confirm admin authorization helper behavior did not change unexpectedly
- confirm duplicate-link rejection still occurs
- confirm `grow_sessions` mutation remains absent

Smoke tests use mocks and do not require a live Supabase instance.

## 10. Operational Safety Guidance

Keep CSTP operational validation conservative:

- use local or isolated staging first
- avoid production data
- avoid public exposure
- avoid direct `grow_sessions` mutation
- avoid implementing reporting before operational workflows stabilize
- avoid implementing certifications before immutable reporting exists
- avoid Source Directory and Community Grow exposure during v1 operational validation
- keep APIs admin-only
- keep UI inside the admin surface

## 11. What Is Intentionally Deferred

The following remain deferred:

- report generation
- report snapshots
- immutable reporting implementation
- report publication workflow implementation
- Gold/Silver certifications
- certification history
- public CSTP APIs
- public CSTP UI
- public badges
- Source Directory CSTP integration
- Community Grow CSTP filters
- breeder/source portals
- automation and notifications

These systems should begin only after internal CSTP request, test, session-link, authorization, and operational UX workflows are validated locally.

## 12. Readiness Before Immutable Reporting

Before moving into immutable reporting implementation:

- smoke tests pass
- local admin auth works
- request workflow validates
- test workflow validates
- session-link workflow validates
- duplicate-link rejection is confirmed
- invalid lifecycle transitions are rejected
- archived records remain internally discoverable
- `grow_sessions` remains unchanged
- public exposure remains absent
- operational friction is documented or resolved
