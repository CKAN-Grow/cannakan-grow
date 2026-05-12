# CSTP Admin Authorization Strategy

## 1. Purpose

CSTP admin APIs must remain closed until admin authorization is defined and implemented. CSTP now has an internal execution boundary capable of writing to the v1 CSTP tables, which makes authorization the next critical safety boundary before any route is allowed to execute mutations.

No CSTP route should call mutation helpers unless the request has passed a verified admin check. Frontend gating, route naming, service-role availability, or knowledge of a hidden endpoint is not sufficient authorization.

This strategy defines the canonical authorization expectations for future CSTP admin APIs. It does not implement authorization, enable routes, add RLS, expose UI, or create any public CSTP surface.

## 2. Current State

`api/cstp-admin-request-create.js` exists as the first CSTP admin route boundary.

Current behavior:

- The route is closed by default.
- It returns `501` with status `cstp_admin_authorization_deferred`.
- It does not call `executeCstpRequestCreation` during normal handler execution.
- It does not execute CSTP mutations.
- It does not expose public CSTP reads.
- It does not modify `grow_sessions`.

This is the correct temporary state. The route should remain closed until a reusable admin authorization helper is implemented and validated.

## 3. Existing Auth Pattern Audit

The current `api/` routes were inspected for authorization patterns.

Observed route structure:

- API routes are flat CommonJS serverless handlers under `api/`.
- Routes generally define local request parsing, JSON response helpers, and Supabase REST helpers rather than sharing a central middleware layer.
- CSTP should continue using thin route files until a broader API framework exists.

Observed bearer-token user auth:

- `api/push-send.js` and `api/grow-reminder-action.js` extract a bearer token from the `Authorization` header.
- Those routes validate the token through Supabase Auth by calling `/auth/v1/user`.
- The server uses the Supabase service-role key for the auth verification request.
- The authenticated user id is then used to scope user-owned actions.

Observed Supabase privileged access:

- Existing routes use server-side Supabase REST calls with a service-role key.
- Environment variables include `CANNAKAN_SUPABASE_URL`, `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `CANNAKAN_SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SERVICE_KEY`, and `SUPABASE_SECRET_KEY`.
- The CSTP execution boundary follows the same service-role REST convention for internal writes.

Observed cron/internal runner auth:

- `api/grow-reminders-run.js` supports `CRON_SECRET` bearer authorization.
- It allows local requests when a cron secret is not configured.
- This pattern is appropriate for scheduled internal jobs, not human CSTP admin routes.

Observed admin-role schema pattern:

- `supabase-schema.sql` defines `public.admin_users` with `user_id uuid not null unique references auth.users(id) on delete cascade`.
- Existing RLS policies commonly treat a user as admin when either:
  - the user exists in `public.admin_users`, or
  - the authenticated JWT email matches a small hard-coded admin email allowlist used in policies.
- `public.admin_users` has an RLS policy allowing users to view their own admin membership.
- `admin_reports`, `profiles`, `grow_sessions`, and other policies already reference `public.admin_users` for admin access.

Observed gap:

- No reusable API-level admin authorization helper currently exists.
- No CSTP-specific admin authorization helper exists.
- No route should directly reproduce admin checks independently once CSTP route execution is enabled.

## 4. CSTP Authorization Requirements

CSTP admin APIs must satisfy these requirements before calling any execution helper:

- Only approved admins may call CSTP admin APIs.
- The route must verify the bearer token server-side through Supabase Auth.
- The route must resolve a reliable authenticated user id.
- The route must verify admin membership before mutation execution.
- The verified admin id must be passed to CSTP execution helpers as `adminUserId`.
- Audit events must never use anonymous, blank, placeholder, or fake actor identities.
- Failed authorization must not leak CSTP table data, request details, test records, session-link details, or audit history.
- Public users must never access CSTP admin mutations.
- Service-role keys must remain server-only and must not become a client-side authorization substitute.

Authorization must happen before:

- request body mutation execution
- CSTP request creation
- CSTP test creation
- CSTP test status updates
- CSTP session-link creation or archival
- any future admin event querying

## 5. Recommended Admin Check Options

### Option A: Existing `public.admin_users` Membership

Use bearer-token authentication, resolve the Supabase user, then query `public.admin_users` for the authenticated `user.id`.

Advantages:

- Aligns with existing schema.
- Aligns with existing RLS policy language.
- Avoids hard-coding admin emails in route code.
- Produces a reliable `adminUserId` for audit events.
- Supports future admin membership management.

Risks and requirements:

- Must use service-role access server-side or a carefully designed internal lookup.
- Must normalize failure responses so missing membership returns `403`, not a data leak.
- Must not expose the admin_users table publicly beyond existing policy behavior.

Recommendation:

- This should be the primary CSTP admin authorization strategy.

### Option B: Existing Admin Email Allowlist

Use bearer-token authentication, resolve the Supabase user, and compare the authenticated email against the current admin email allowlist pattern.

Advantages:

- Mirrors existing RLS policy fallback behavior.
- Can be useful as a transitional compatibility layer.

Risks:

- Hard-coded route allowlists can drift from schema policies.
- Email-based authorization is easier to fragment across code paths.
- Audit identity should still use the user id, not only email.

Recommendation:

- Use only as a temporary secondary compatibility check if the project intentionally preserves the existing email allowlist behavior.
- Do not make it the only long-term CSTP admin authorization model.

### Option C: Supabase Profile/Admin Role Check

Use a profile role field or claims-based role if one is already active in the project.

Advantages:

- Can be clean if a role system already exists.

Risks:

- The inspected schema shows admin membership through `public.admin_users`, not a clear profile role field.
- Adding new role fields before CSTP auth is reviewed could create schema drift.

Recommendation:

- Do not choose this unless an existing role field or claims system is confirmed and already used by production code.

### Option D: Environment-Based Admin Allowlist

Use an environment variable such as `CSTP_ADMIN_EMAIL_ALLOWLIST` or `CANNAKAN_ADMIN_EMAIL_ALLOWLIST` after bearer-token user resolution.

Advantages:

- Easy to deploy.
- Avoids exposing admin membership queries from the route.

Risks:

- Can drift from `public.admin_users`.
- Operational updates require environment changes.
- Less queryable/auditable than table-backed membership.

Recommendation:

- Acceptable only as a transitional fallback or emergency lock.
- Prefer table-backed admin membership for the canonical path.

### Option E: Service-Role-Only Internal Route Guard

Require a server-side secret or service-role bearer token to call CSTP admin routes.

Advantages:

- Useful for machine-to-machine jobs.

Risks:

- Does not identify the human admin actor.
- Cannot reliably populate `admin_user_id`.
- Poor fit for audit history and admin UI actions.

Recommendation:

- Do not use as the primary human admin API guard.
- Reserve for future automation or internal jobs, with separate event actor semantics.

### Recommended Hybrid

The safest strategy is:

1. Require `Authorization: Bearer <Supabase access token>`.
2. Verify the token through Supabase Auth server-side.
3. Resolve `user.id` and normalized email.
4. Check `public.admin_users.user_id = user.id`.
5. Optionally allow the existing trusted email allowlist only if intentionally preserved.
6. Return a normalized admin actor object.
7. Pass `actor.userId` into execution helpers as `adminUserId`.

This keeps CSTP aligned with existing Grow admin concepts while avoiding a route-specific authorization fork.

## 6. Audit Identity Requirements

Every CSTP admin mutation must have a reliable actor identity.

Required actor fields:

- `userId`: authenticated Supabase `auth.users.id`
- `email`: authenticated user email when safely available
- `authorizationSource`: for example `admin_users`, `trusted_email_allowlist`, or future approved source

Rules:

- `admin_user_id` should be the authenticated user id.
- Actor email may be included in internal metadata if safely available.
- Audit events must not use anonymous, blank, generated, or placeholder admin ids.
- If actor identity cannot be resolved, execution must be blocked.
- If admin membership cannot be verified, execution must be blocked.
- Deferred actor identity is not acceptable for mutation execution.

This requirement protects future report and certification integrity by ensuring lifecycle decisions remain attributable.

## 7. Route Behavior Requirements

Future CSTP admin route behavior should be standardized.

Response expectations:

- Missing bearer token: `401`.
- Invalid or expired bearer token: `401`.
- Authenticated but not admin: `403`.
- Admin authorization model not configured: `501` with `cstp_admin_authorization_deferred`.
- Valid admin: route may call the appropriate execution helper.
- Unsupported method: `405`.
- Invalid JSON body: `400`.

Route responsibilities:

- Enforce HTTP method.
- Parse JSON.
- Extract bearer token.
- Call the reusable CSTP admin authorization helper.
- Attach verified actor data to the execution payload.
- Call the internal execution helper.
- Return normalized JSON.

Route non-responsibilities:

- Do not duplicate lifecycle transition logic.
- Do not build admin event records directly.
- Do not call Supabase directly for CSTP mutations when execution helpers exist.
- Do not mutate `grow_sessions`.
- Do not expose public reads.

## 8. Safety Boundaries

Authorization work must preserve these boundaries:

- No public reads.
- No public CSTP data.
- No UI exposure.
- No report access.
- No certification access.
- No Source Directory CSTP exposure.
- No Community Grow CSTP exposure.
- No breeder/source portal access.
- No automation.
- No `grow_sessions` mutation.
- No session stage, analytics, timeline, notes, reminders, media, or partition changes.

CSTP admin authorization only controls internal mutation routes. It does not make CSTP public.

## 9. Recommended Next Step

Recommended next implementation task:

1. Create a reusable internal CSTP admin authorization helper.
2. Base it on bearer-token Supabase Auth verification.
3. Use `public.admin_users` as the canonical admin membership check.
4. Preserve optional compatibility with the existing trusted email allowlist only if explicitly approved.
5. Return a normalized admin actor object.
6. Enable only `api/cstp-admin-request-create.js` after the helper is validated.
7. Keep all other CSTP admin APIs deferred.

The first route enabled should remain request creation only. That route should prove authorization, actor identity, execution-helper usage, and audit behavior before broader API exposure.

## 10. Explicit Non-Goals

This document does not implement:

- authorization
- route enablement
- additional APIs or routes
- UI
- RLS
- reports
- report snapshots
- certifications
- public CSTP reads
- public CSTP workflows
- Source Directory CSTP exposure
- Community Grow CSTP exposure
- automation
- breeder/source portals

This is a planning document only.
