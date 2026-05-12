# CSTP Migration v1 Local Validation Report

## Summary

Real PostgreSQL validation was performed against the local Supabase Docker database for:

- `supabase/migrations/drafts/cstp_migration_v1_candidate.sql`

Result: **Pass for isolated local validation.**

The candidate SQL parsed and applied successfully inside the local PostgreSQL/Supabase database when validated against the existing Grow schema. Table creation, FK creation, check constraints, unique constraints, indexes, valid inserts, invalid insert rejections, delete behavior, and rollback safety all passed in the isolated local workflow.

Production was not touched. No public CSTP systems were exposed.

## Environment Used

Environment:

- Local Docker Desktop Supabase stack
- Database container: `supabase_db_Cannakan_Grow_App`
- Database: `postgres`
- User: `postgres`

Safety notes:

- No production connection was attempted.
- No production SQL was executed.
- The candidate remained in `supabase/migrations/drafts/`.
- The candidate was not moved into active migrations.
- `supabase-schema.sql` was not modified.
- App/backend/UI/routes were not modified.
- RLS, APIs, reports, snapshots, certifications, and public CSTP systems were not implemented.

Local schema note:

- The local base database had Supabase `auth.users` available.
- The app's `public.grow_sessions` and `public.sources` were not persisted in the local database before validation.
- To validate correctly against the existing Grow schema, `supabase-schema.sql` was loaded inside the same transaction before applying the CSTP candidate.
- The full validation transaction was rolled back, leaving no CSTP v1 tables behind.

## Validation Method

Validation was run through `docker exec` into the local Supabase DB container using `psql`.

The validation SQL workflow was:

1. `BEGIN`
2. Load `supabase-schema.sql`
3. Apply `supabase/migrations/drafts/cstp_migration_v1_candidate.sql`
4. Run schema, constraint, FK, insert, delete-behavior, and rollback-simulation assertions
5. Drop CSTP v1 objects in reverse dependency order as rollback simulation
6. Verify existing Grow schema objects still existed inside the transaction
7. Emit `CSTP_VALIDATION_PASS`
8. `ROLLBACK`

Post-run sanity check confirmed no persistent `public.cstp_%` tables remained.

## Migration Apply Result

Pass.

Confirmed during local execution:

- `supabase-schema.sql` loaded successfully inside the transaction.
- Candidate SQL parsed successfully.
- `public.cstp_requests` created successfully.
- `public.cstp_tests` created successfully.
- `public.cstp_admin_events` created successfully.
- `public.cstp_test_sessions` created successfully.
- Candidate comments executed successfully.
- Index creation completed successfully.
- No ordering failures occurred.

The validation output included:

- `CSTP_VALIDATION_BEGIN`
- `CSTP_VALIDATION_PASS`
- final `ROLLBACK`

## Existing Schema Compatibility

Pass.

Validated inside the transaction:

- `public.grow_sessions` exists after `supabase-schema.sql` load.
- `public.grow_sessions(id)` is `uuid`.
- `public.sources` exists after `supabase-schema.sql` load.
- `public.sources(id)` is `uuid`.
- `auth.users` exists in the local Supabase runtime.
- `auth.users(id)` is `uuid`.

The candidate's FK targets are compatible with the loaded Grow schema:

- `public.sources(id)`
- `public.grow_sessions(id)`
- `auth.users(id)`

## v1 Scope Validation

Pass.

The validation asserted that only these CSTP v1 tables existed:

- `cstp_requests`
- `cstp_tests`
- `cstp_admin_events`
- `cstp_test_sessions`

No out-of-scope CSTP tables were created:

- no reports
- no report snapshots
- no report assets
- no certifications
- no source certification history
- no public badges
- no public report visibility structures
- no Source Directory public CSTP integration
- no Community Grow CSTP filters
- no automation tables
- no breeder/source portal tables

## Constraint Test Results

Pass.

Validated:

- valid `cstp_requests.status` values were accepted
- invalid `cstp_requests.status` values were rejected by `cstp_requests_status_check`
- valid `cstp_tests.status` values were accepted
- invalid `cstp_tests.status` values were rejected by `cstp_tests_status_check`
- `unique(cstp_test_id, session_id)` rejected duplicate session linkage
- required fields enforced `not null` behavior during tested inserts
- nullable fields allowed expected null behavior
- archive flags defaulted as expected
- timestamp defaults populated as expected

## FK Test Results

Pass.

Validated:

- valid `source_id` references were accepted
- invalid `source_id` references were rejected
- valid `grow_sessions` references were accepted
- invalid `grow_sessions` references were rejected
- valid `cstp_test_id` references were accepted
- invalid `cstp_test_id` references were rejected
- valid `auth.users` actor references were accepted

## ON DELETE Behavior Results

Pass.

Validated:

- `ON DELETE RESTRICT` blocked deletion of a linked `public.grow_sessions` row.
- `ON DELETE RESTRICT` blocked deletion of a linked `public.cstp_tests` row.
- `ON DELETE SET NULL` cleared nullable `source_id` references on `cstp_requests`.
- `ON DELETE SET NULL` cleared nullable `source_id` references on `cstp_tests`.

These behaviors match the v1 history-protection strategy.

## Index Validation Result

Pass.

Validated expected indexes existed:

- `cstp_requests_source_id_idx`
- `cstp_requests_status_idx`
- `cstp_requests_archived_idx`
- `cstp_tests_source_id_idx`
- `cstp_tests_request_id_idx`
- `cstp_tests_status_idx`
- `cstp_tests_archived_idx`
- `cstp_admin_events_cstp_test_id_idx`
- `cstp_admin_events_event_type_idx`
- `cstp_test_sessions_cstp_test_id_idx`
- `cstp_test_sessions_session_id_idx`
- `cstp_test_sessions_archived_idx`

No missing foundational v1 indexes were detected.

## RLS / Public Exposure Validation

Pass.

Validated:

- No CSTP v1 tables had RLS enabled by the candidate.
- No CSTP public read policies were created.
- No report/certification/public visibility objects were created.

This matches the requirement that RLS and public CSTP exposure remain deferred.

## Session Compatibility Result

Pass.

The candidate did not:

- alter `public.grow_sessions`
- add columns to `public.grow_sessions`
- modify `public.grow_sessions` triggers
- modify `public.grow_sessions` policies
- create duplicate session tables
- create duplicate timeline logic
- create duplicate observation tables
- create duplicate metrics tables

Within the validation transaction, linked `grow_sessions` records remained normal Grow session records and were protected from deletion while linked through `cstp_test_sessions`.

## Rollback Result

Pass.

Rollback was validated in two ways:

1. Reverse dependency drop simulation inside the transaction:
   - dropped `public.cstp_test_sessions`
   - dropped `public.cstp_admin_events`
   - dropped `public.cstp_tests`
   - dropped `public.cstp_requests`
   - confirmed `public.grow_sessions`, `public.sources`, and `auth.users` still existed inside the transaction

2. Outer transaction rollback:
   - final `ROLLBACK` completed successfully
   - post-run sanity check showed zero persistent `public.cstp_%` tables

Existing local Supabase auth schema remained intact.

## Warnings / Issues

No blocking SQL issues were found.

Non-blocking notes:

- The candidate intentionally does not add `updated_at` triggers for `cstp_requests` or `cstp_tests`.
- The candidate intentionally does not enable RLS for CSTP tables.
- The local base database did not have the app's public Grow schema persisted before validation, so `supabase-schema.sql` was loaded transactionally for the test.
- The validation confirms SQL behavior locally, but an eventual staging environment that mirrors production data should still be used before production rollout.

## Required Adjustments

No required SQL adjustments were identified from this local validation.

Optional future adjustments before active migration review:

- Add CSTP-specific `updated_at` trigger functions/triggers if automatic `updated_at` updates are required before backend integration.
- Keep RLS deferred until the admin/backend access model is ready, but define RLS before any non-admin app integration.
- Consider composite indexes later if admin query patterns require them.

## Final Recommendation

The CSTP migration v1 candidate passed real isolated local PostgreSQL validation.

It is reasonable to move this candidate toward formal staging review, while keeping it out of active migrations and production until reviewed. Public reports, snapshots, certifications, public badges, Source Directory public CSTP integration, Community Grow CSTP filters, automation, breeder/source portals, APIs, and RLS remain deferred.

