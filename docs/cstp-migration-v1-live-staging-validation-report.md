# CSTP Migration v1 Live/Staging Validation Report

## Summary

Requested validation:

- Candidate: `supabase/migrations/drafts/cstp_migration_v1_candidate.sql`
- Goal: real PostgreSQL parse/application validation in an isolated local or staging environment

Result: **Blocked before live PostgreSQL execution.**

No isolated PostgreSQL environment was available in the local workspace, and no staging database connection details were provided. The migration candidate was not executed, not applied, and not moved into active migrations.

Production was not touched. No public CSTP systems were exposed.

## Environment Used

Environment attempted:

- Local Windows workspace: `D:\Projects\Cannakan Grow App`

Available PostgreSQL execution tools:

- `psql`: not found
- `postgres`: not found
- `initdb`: not found
- Docker: not found
- Supabase CLI: not found
- WSL PostgreSQL path: unavailable because WSL is not installed
- Local cached `psql.exe`: not found in checked workspace/cache paths

Production status:

- No production connection was attempted.
- No production SQL was executed.
- No remote database was contacted.

## Validation Method

Because no real PostgreSQL runtime was available, live parse/application validation could not be performed.

Completed validation steps:

- Confirmed the local environment lacks PostgreSQL execution tooling.
- Confirmed WSL is unavailable.
- Confirmed Docker and Supabase CLI are unavailable.
- Confirmed no staging connection details are present.
- Preserved the candidate in `supabase/migrations/drafts/`.
- Did not modify `supabase-schema.sql`.
- Did not apply any migration.

Prior local static validation remains documented in:

- `docs/cstp-migration-v1-dry-run-validation-report.md`

## Existing Schema Load Result

Required step:

- Load or validate `supabase-schema.sql` in an isolated PostgreSQL database before applying the CSTP candidate.

Result:

- Not executed because no isolated PostgreSQL runtime was available.

Known from prior static inspection:

- `public.grow_sessions` exists in `supabase-schema.sql`.
- `public.grow_sessions(id)` is UUID.
- `public.sources` exists in `supabase-schema.sql`.
- `public.sources(id)` is UUID.
- Existing schema references `auth.users(id)`.

Runtime validation still required:

- Confirm `auth.users(id)` resolves correctly in the selected local/staging Supabase/PostgreSQL environment.

## Candidate Apply Result

Required step:

- Apply `supabase/migrations/drafts/cstp_migration_v1_candidate.sql` to isolated local/staging PostgreSQL.

Result:

- Not executed.

Not validated live:

- SQL parse acceptance
- table creation
- constraint creation
- FK creation
- index creation
- comment execution
- runtime object ordering

## v1 Scope Validation

Live validation result:

- Not executed.

Prior static validation found only these CSTP tables in executable SQL:

- `cstp_requests`
- `cstp_tests`
- `cstp_admin_events`
- `cstp_test_sessions`

Prior static validation found no executable creation of:

- reports
- report snapshots
- certifications
- public badges
- public report visibility
- Source Directory public CSTP integration
- Community Grow CSTP filters
- automation
- breeder/source portals
- RLS policies

Live confirmation is still required in staging.

## Constraint Test Result

Required tests:

- valid request statuses accepted
- invalid request statuses rejected
- valid test statuses accepted
- invalid test statuses rejected
- `unique(cstp_test_id, session_id)` blocks duplicate linkage

Result:

- Not executed.

Status:

- Still required in isolated PostgreSQL staging/local environment.

## FK Behavior Test Result

Required tests:

- valid `source_id` references accepted
- invalid `source_id` references rejected
- valid `grow_sessions` references accepted
- invalid `grow_sessions` references rejected
- `ON DELETE RESTRICT` protects linked CSTP history
- `ON DELETE SET NULL` works where used

Result:

- Not executed.

Status:

- Still required in isolated PostgreSQL staging/local environment.

## Rollback Result

Required rollback validation:

- Drop only CSTP v1 objects in reverse dependency order.
- Confirm existing Grow schema remains intact.
- Confirm no existing tables are modified or dropped.

Result:

- Not executed.

Status:

- Still required after successful isolated apply validation.

## Session Compatibility Result

Required validation:

- `grow_sessions` remains unchanged.
- no triggers or policies changed on `grow_sessions`.
- no existing session behavior altered.

Result:

- Not executed against a database.

Static file status:

- The candidate SQL does not contain `alter table public.grow_sessions`.
- The candidate SQL does not create triggers or policies on `public.grow_sessions`.

Live confirmation is still required after isolated apply/rollback testing.

## Warnings / Limitations

1. No real PostgreSQL parse occurred.
   - The local environment has no PostgreSQL client/server tools available.

2. No staging database was available.
   - No staging connection string, credentials, or Supabase project reference was provided.

3. Supabase-specific `auth.users` behavior was not runtime-validated.
   - Existing schema references `auth.users(id)`, but the candidate still needs runtime validation inside a Supabase-compatible environment.

4. Constraint, FK, and rollback behavior remain untested live.
   - These require an isolated PostgreSQL/Supabase database.

## Required Adjustments Before Staging

No SQL adjustments were identified during this blocked live-validation attempt.

Required environment/action before live validation can proceed:

- Provide an isolated staging database connection, or
- Install/provide a local PostgreSQL/Supabase runtime with `psql` access, or
- Provide an approved Docker/Supabase local environment for isolated migration testing.

Required validation steps once an environment exists:

- Load `supabase-schema.sql`.
- Apply `supabase/migrations/drafts/cstp_migration_v1_candidate.sql`.
- Run constraint tests.
- Run FK behavior tests.
- Run rollback test.
- Confirm existing Grow schema remains intact.

## Final Recommendation

The CSTP migration v1 candidate should **not** be promoted to active migration or production based on this report alone.

The candidate previously passed static dry-run validation, but real PostgreSQL/Supabase validation is still required. Proceed only after an isolated local or staging PostgreSQL environment is available.

Public reports, snapshots, certifications, badges, Source Directory public CSTP integration, Community Grow filters, automation, breeder/source portals, APIs, and RLS remain deferred.

