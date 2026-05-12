# CSTP Browser QA Readiness Audit

## 1. Purpose

This audit summarizes the local runtime and browser QA readiness status for internal CSTP admin workflows before immutable reporting implementation begins.

This is stabilization/setup guidance only. It does not add CSTP features, implement reports, implement certifications, expose CSTP publicly, add automation, add breeder/source portals, integrate Community Grow, integrate the Source Directory, or mutate `grow_sessions`.

## 2. Current Readiness Status

The backend and route-level CSTP operational workflow has been validated locally through the internal admin APIs. The browser UI is present inside the internal admin surface, but full browser-based CSTP workflow QA still requires a local runtime that can serve both:

- the app shell
- protected `/api/cstp-admin-*` route modules

The current static local helper can serve the app shell, but it cannot execute API routes. That means it is useful for setup-screen checks and general UI load checks, but not sufficient for full CSTP request, test, and session-link browser workflow validation.

## 3. Setup Friction Improvements Made

### Local Setup Screen Messaging

The local setup helper now clarifies that Dev QA Bypass is only for app-shell/session-style local testing and does not validate protected CSTP admin APIs.

The helper now explicitly calls out that CSTP admin browser QA requires:

- real local Supabase auth
- `public.admin_users` membership
- an API-capable local runtime

### Static Server API Messaging

`local-server.ps1` now detects `/api/` requests and returns a clear `501 Not Implemented` explanation instead of a generic static-file miss.

This makes local browser QA failures easier to diagnose when the admin UI attempts to call CSTP API routes through the static helper.

### Local Setup Guide Clarification

The local CSTP operational setup guide now documents that:

- `local-server.ps1` is static-only
- browser CSTP admin QA requires an API-capable runtime
- Dev QA Bypass does not replace real admin authorization for CSTP admin APIs

## 4. Remaining Browser QA Blockers

Full browser QA is still blocked until the project has, or the operator uses, a confirmed local runtime that can execute the existing API route modules.

Remaining blockers:

- `supabase-config.js` is intentionally empty in the tracked workspace.
- A safe local-only config injection process is still needed for browser auth against local Supabase.
- `local-server.ps1` does not execute API routes.
- No `npm` script currently identifies an API-capable local dev server for the app and API routes.
- Browser QA needs a real admin auth session and matching `public.admin_users` membership.

These are setup/runtime blockers, not CSTP workflow logic blockers.

## 5. Recommended Next Stabilization Steps

Recommended next steps before immutable reporting work:

1. Define the canonical API-capable local app runtime for Cannakan Grow.
2. Document or add a local-only runtime config injection workflow that does not commit local Supabase credentials.
3. Re-run the CSTP operational validation checklist through the browser UI.
4. Confirm admin sign-in, CSTP request management, CSTP test management, and session-link management work from the UI against local Supabase.
5. Capture browser-only friction such as button state, error visibility, layout issues, and auth expiry behavior.
6. Re-run `node scripts/cstp-smoke-tests.js` after any UI/runtime polish.

## 6. Safety Boundaries

The CSTP admin system remains internal-only.

Still deferred:

- immutable reports
- report snapshots
- certifications
- public CSTP APIs
- public CSTP UI
- public badges
- Source Directory CSTP exposure
- Community Grow CSTP filters
- automation
- breeder/source portals

Browser QA readiness work must not introduce public CSTP exposure or mutate `grow_sessions` outside existing CSTP relationship behavior.

## 7. Readiness Assessment

CSTP is ready for another local operational QA pass at the API level.

For full browser-based operational QA, the system is partially ready: messaging is clearer, static-server limitations are explicit, and admin setup expectations are documented. The remaining requirement is an API-capable local runtime with safe local Supabase runtime configuration.

Immutable reporting implementation should remain deferred until at least one successful browser-based internal admin workflow pass confirms request, test, and session-link operations from the UI.

