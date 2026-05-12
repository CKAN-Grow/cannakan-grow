# CSTP Operational Validation Pass 01

## 1. Purpose

This document records the first real local CSTP operational validation pass using the internal admin API and service system. The goal was to validate the current internal workflow before immutable reporting, certification, public exposure, automation, breeder portals, Source Directory integration, or Community Grow integration begins.

This pass was limited to local operational QA. It did not add new feature categories, reports, certifications, public CSTP surfaces, automation, breeder/source portals, or public integrations.

## 2. Validation Environment

Validation used the local Supabase Docker environment only.

Observed local services:

- Local Supabase API gateway: `http://127.0.0.1:54321`
- Local database container: `supabase_db_Cannakan_Grow_App`
- Local Studio container was present through Docker Desktop
- Production was not touched

The Supabase CLI was not available on `PATH`, so validation used Docker and direct local Supabase HTTP/API access.

The local database initially did not contain the application schema. For isolated validation, the existing project schema and active CSTP migration were loaded into the local Supabase database:

- `supabase-schema.sql`
- `supabase/migrations/20260511222737_cstp_migration_v1.sql`

The PostgREST schema cache was reloaded after schema setup.

## 3. Local Runtime and Admin Setup

Admin authentication was validated against local Supabase Auth.

The validation pass created local-only QA users through Supabase Auth:

- One admin QA user
- One non-admin QA user

Admin membership was inserted into `public.admin_users` using the actual schema shape:

- `user_id`
- `email`

The table does not include a `role` column in the current schema. This was captured as a setup friction item because generic setup assumptions could easily drift from the real schema.

The local app runtime configuration file remained unchanged. The tracked `supabase-config.js` still contains empty runtime values, so browser-based admin UI validation could not be completed through the normal static local server without additional local configuration.

## 4. Workflow Validation Method

Operational workflows were validated by invoking the actual CSTP admin API route modules against the local Supabase environment with real local Auth tokens.

Routes validated:

- `api/cstp-admin-request-create.js`
- `api/cstp-admin-request-status-update.js`
- `api/cstp-admin-requests-list.js`
- `api/cstp-admin-request-detail.js`
- `api/cstp-admin-test-create.js`
- `api/cstp-admin-test-status-update.js`
- `api/cstp-admin-tests-list.js`
- `api/cstp-admin-test-detail.js`
- `api/cstp-admin-session-link-create.js`
- `api/cstp-admin-session-link-archive.js`
- `api/cstp-admin-session-links-list.js`

The validation used real local database writes for CSTP operational records and a local grow session fixture. `grow_sessions` was checked before and after CSTP session-link operations to confirm the relationship workflow did not mutate the grow session row.

## 5. Workflows Tested

### Authorization Workflow

Validated:

- Missing auth is rejected
- Non-admin auth is rejected
- Admin auth can access internal CSTP admin routes

Observed results:

- Missing auth: `401`
- Non-admin auth: `403`
- Admin request list: `200`

### Request Workflow

Validated:

- Create request
- List requests
- Request detail lookup
- `received -> accepted`
- `accepted -> awaiting_seeds`
- `awaiting_seeds -> accepted`
- `received -> declined`
- Invalid request transition rejection
- Request archive
- Request detail not-found behavior

Observed results:

- Create request: `200`
- Accept request: `200`
- Move to awaiting seeds: `200`
- Return to accepted: `200`
- Decline request: `200`
- Invalid transition: `400`
- Archive request: `200`
- Not found: `404`

### Test Workflow

Validated:

- Create CSTP test from request
- List tests
- Test detail lookup
- `pending -> active`
- `active -> completed`
- Invalid test transition rejection
- Test archive

Observed results:

- Create test: `200`
- Activate test: `200`
- Complete test: `200`
- Invalid transition: `400`
- Archive test: `200`

### Session-Link Workflow

Validated:

- Attach grow session to CSTP test
- List CSTP session links
- Duplicate link rejection
- Archive CSTP session relationship
- Confirm `grow_sessions` row remained unchanged

Observed results:

- Create session link: `200`
- Duplicate session link rejection: `500`
- List session links: `200`
- Archive session link: `200`
- Grow session unchanged: confirmed

The duplicate-link rejection is functionally correct, but the `500` response is operationally noisy for an expected validation conflict. A future polish pass should consider returning a client-visible conflict status such as `409` while preserving backend duplicate protection.

## 6. Smoke Test Result

The formal CSTP smoke test suite was rerun after local operational validation:

```text
CSTP smoke tests passed.
```

## 7. What Worked Correctly

- Local Supabase accepted the existing Grow schema and active CSTP v1 migration.
- Admin authorization correctly separated missing auth, non-admin auth, and admin auth.
- CSTP request creation, listing, detail lookup, lifecycle updates, decline handling, archive handling, and invalid transition rejection worked.
- CSTP test creation, listing, detail lookup, lifecycle updates, archive handling, and invalid transition rejection worked.
- CSTP session-link creation, listing, duplicate-link rejection, and relationship archival worked.
- The CSTP session-link workflow did not mutate the linked `grow_sessions` row.
- Read APIs remained admin-only.
- No reports, certifications, public badges, public reads, Source Directory CSTP exposure, Community Grow CSTP exposure, automation, or breeder/source portal behavior was introduced.

## 8. Issues and Operational Friction

### Local Runtime Configuration

The tracked `supabase-config.js` file remains empty. This is appropriate for not committing local credentials, but it means the browser app cannot authenticate against local Supabase without a local runtime config strategy.

Recommendation:

- Document or create a local-only runtime config injection path that does not modify tracked config.

### Static Local Server Limitation

`local-server.ps1` is a static file server only. The CSTP admin UI calls `/api/cstp-admin-*` routes, so the static server is not sufficient for full browser-based CSTP workflow validation.

Recommendation:

- Use an API-capable local runtime for manual CSTP UI QA, or document the expected local route-hosting command if one exists outside the current `npm` scripts.

### Supabase CLI Availability

The Supabase Docker environment was running, but the `supabase` CLI was not available on `PATH`.

Recommendation:

- Add setup guidance for either installing the Supabase CLI or using the Docker-based local validation fallback.

### Fixture Schema Drift

Initial validation fixtures assumed fields that do not exist in the current schema:

- `public.admin_users.role`
- `public.sources.website`
- `public.grow_sessions.current_stage`

The final validation used the actual schema fields:

- `admin_users.user_id`
- `admin_users.email`
- `sources.name`
- `sources.status`
- `grow_sessions.session_status`

Recommendation:

- Keep future QA fixtures schema-led and align local setup docs with the actual table shape.

### Duplicate-Link Response Status

Duplicate session-link creation is rejected correctly, but the route currently returns `500` for this expected conflict path.

Recommendation:

- Consider normalizing duplicate-link rejection to `409 Conflict` or `400 Bad Request` in a future API polish pass.

### Session-Link Archive Payload Shape

The archive route requires relationship identity fields beyond the link id:

- `id`
- `cstpTestId`
- `sessionId`

Recommendation:

- Ensure the admin UI always sends the full relationship context and document this route contract for future QA scripts.

## 9. Browser UI Validation Status

Full browser-based CSTP admin UI validation was not completed in this pass because the local static server does not host API routes and the tracked Supabase runtime config is intentionally empty.

The API-backed operational path was validated directly against the actual route modules and local Supabase. The remaining browser QA work should be performed once an API-capable local app runtime and safe local runtime configuration path are confirmed.

## 10. Blockers

No backend/API blocker was found for the internal CSTP operational workflow.

The main blocker to complete manual browser UI validation is local runtime setup:

- API-capable local app server not identified in current `npm` scripts
- Local Supabase frontend runtime config not populated through a safe local-only mechanism

## 11. Readiness Assessment

The CSTP internal backend/API operational path is ready for continued internal stabilization.

Before immutable reporting implementation begins, the recommended next stabilization step is a browser/UI validation pass using a confirmed API-capable local runtime. That pass should validate the existing admin UI against the same local Supabase workflows covered here.

Immutable reporting, certifications, public exposure, Source Directory integration, Community Grow integration, automation, and breeder/source portals remain deferred.

