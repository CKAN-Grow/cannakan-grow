# CSTP Migration v1 Dry-Run Validation Report

## Summary

This report documents a local, isolated dry-run validation of:

- `supabase/migrations/drafts/cstp_migration_v1_candidate.sql`

The validation was performed before any staging execution and without connecting to production. No SQL was executed against any database.

Overall result: **Pass for static/local dry-run review.**

The migration candidate appears internally consistent, additive-only, scoped to CSTP v1, and aligned with the existing Cannakan Grow schema assumptions. It is suitable for staging-only validation review, with documented limitations and follow-up checks before any active migration or production use.

## Validation Method Used

Validation used local static inspection only:

- Read and inspected the candidate SQL file.
- Compared referenced existing tables against `supabase-schema.sql`.
- Ran a local Node-based static validator that stripped SQL comments and inspected executable SQL structure.
- Checked table scope, FK targets, status constraints, unique constraints, index definitions, out-of-scope table names, RLS statements, and delete behavior.

Local PostgreSQL parse validation was not available because `psql` is not installed in the local environment. No production or remote database connection was attempted.

## Candidate SQL Inspection

### Structure

Pass:

- File is clearly marked as an executable-quality candidate in the drafts folder.
- File warns not to run or move into active migrations until reviewed.
- Table creation order is valid:
  1. `cstp_requests`
  2. `cstp_tests`
  3. `cstp_admin_events`
  4. `cstp_test_sessions`
- FK ordering is valid because parent CSTP tables are created before child references.
- Constraints are declared with the relevant table definitions.
- Indexes are created after tables.
- Comments clearly describe internal-only v1 scope, session reuse, deferred reports/certifications, and deferred RLS.

### Out-of-Scope SQL

Pass:

Static validation found no executable references to:

- `cstp_reports`
- `cstp_report_snapshots`
- `cstp_report_assets`
- `cstp_certifications`
- `source_certification_history`
- `create policy`
- `enable row level security`

## Existing Schema Compatibility

### `public.grow_sessions`

Pass:

- `supabase-schema.sql` defines `public.grow_sessions`.
- `public.grow_sessions.id` is `uuid primary key default gen_random_uuid()`.
- `cstp_test_sessions.session_id uuid references public.grow_sessions(id)` is datatype-compatible.

### `public.sources`

Pass:

- `supabase-schema.sql` defines `public.sources`.
- `public.sources.id` is `uuid primary key default gen_random_uuid()`.
- `cstp_requests.source_id` and `cstp_tests.source_id` are datatype-compatible.

### `auth.users`

Pass with staging validation note:

- Existing schema already references `auth.users(id)` across user-owned tables.
- Candidate uses `auth.users(id)` for `cstp_tests.created_by` and `cstp_admin_events.admin_user_id`.
- This is structurally aligned with the existing schema, but final behavior should still be validated in Supabase staging because `auth.users` is provided by Supabase runtime.

## Migration v1 Scope Validation

Pass:

The static validator found only these CSTP tables:

- `cstp_requests`
- `cstp_tests`
- `cstp_admin_events`
- `cstp_test_sessions`

Confirmed excluded:

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

## Constraint Validation

### Status Check Constraints

Pass:

`cstp_requests.status` is constrained to:

- `received`
- `accepted`
- `awaiting_seeds`
- `declined`
- `archived`

`cstp_tests.status` is constrained to:

- `pending`
- `active`
- `completed`
- `archived`

No database enums are created.

### Unique Constraint

Pass:

`cstp_test_sessions` includes:

- `constraint cstp_test_sessions_test_session_key unique (cstp_test_id, session_id)`

This blocks duplicate linking of the same session to the same CSTP Test.

### Nullability / Required Fields

Pass by static review:

- Required IDs and workflow fields are marked `not null` where expected.
- Optional intake/source/contact fields are nullable.
- `source_id`, `request_id`, `created_by`, and `admin_user_id` are nullable where `ON DELETE SET NULL` is used.
- Archive flags are `boolean not null default false`.
- Timestamp defaults are present.

## FK Safety Validation

Pass:

The candidate uses `ON DELETE SET NULL` for nullable contextual relationships:

- `cstp_requests.source_id`
- `cstp_tests.source_id`
- `cstp_tests.request_id`
- `cstp_tests.created_by`
- `cstp_admin_events.admin_user_id`

The candidate uses `ON DELETE RESTRICT` for history-protection relationships:

- `cstp_admin_events.cstp_test_id`
- `cstp_test_sessions.cstp_test_id`
- `cstp_test_sessions.session_id`

Static validation found no executable `ON DELETE CASCADE`.

## Index Validation

Pass:

The candidate includes indexes for:

- `cstp_requests(source_id)`
- `cstp_requests(status)`
- `cstp_requests(archived)`
- `cstp_tests(source_id)`
- `cstp_tests(request_id)`
- `cstp_tests(status)`
- `cstp_tests(archived)`
- `cstp_admin_events(cstp_test_id)`
- `cstp_admin_events(event_type)`
- `cstp_test_sessions(cstp_test_id)`
- `cstp_test_sessions(session_id)`
- `cstp_test_sessions(archived)`

Created-at indexes are not included in the candidate. This is acceptable for the initial internal-only v1 candidate because foundational FK/status/archive lookups are covered and real admin query patterns are not implemented yet. Future staging or admin workflow work may justify composite indexes such as `(status, created_at desc)` or `(archived, created_at desc)`.

## updated_at Handling

Pass with documented limitation:

- Candidate uses `timezone('utc', now())` timestamp defaults, matching existing schema style.
- Candidate does not create updated-at trigger functions or triggers.
- Existing schema uses table-specific updated-at trigger functions, not a generic reusable trigger.
- Candidate explicitly documents that updated-at trigger handling should be aligned before activation.

Required staging note:

- If staging validation tests update behavior, `updated_at` will not auto-change unless CSTP-specific triggers are added before testing.

## Confirmed Compatibility

Confirmed by static validation:

- The candidate is additive-only.
- Existing session and source tables are not modified.
- Existing app/backend/UI/routes are not affected.
- No RLS or public read policies are introduced.
- UUID relationship assumptions match existing schema.
- Naming conventions align with existing snake_case and table-prefixed index patterns.
- CSTP session linkage uses `public.grow_sessions(id)`.
- Source references use `public.sources(id)`.
- Actor references use `auth.users(id)`, matching existing user-reference patterns.

## Warnings / Limitations

1. No local PostgreSQL parser was available.
   - `psql` is not installed locally.
   - This report is a static dry-run, not a database parse.

2. `auth.users(id)` requires Supabase runtime validation.
   - Existing schema already relies on `auth.users`.
   - Staging should confirm the candidate applies cleanly in the Supabase environment.

3. updated-at triggers are deferred.
   - This is explicitly documented in the candidate.
   - Decide whether to add triggers before staging or accept static default behavior for first staging validation.

4. Created-at indexes are not included.
   - Not blocking for v1.
   - Revisit after actual admin query patterns exist.

5. `ON DELETE RESTRICT` is intentionally conservative.
   - Staging should validate expected operational behavior before production consideration.

## Required Adjustments Before Staging

No blocking SQL adjustments were found during static validation.

Recommended acknowledgements before staging:

- Confirm whether to test without `updated_at` triggers or add CSTP-specific trigger handling first.
- Confirm `auth.users(id)` remains the accepted actor FK target for `created_by` and `admin_user_id`.
- Confirm `ON DELETE RESTRICT` remains the desired safety behavior for CSTP history-protection relationships.

## Final Recommendation

The CSTP migration v1 candidate passes local static dry-run validation and is ready for isolated staging review/testing, not production.

Staging should validate actual PostgreSQL/Supabase execution, FK behavior, check constraints, unique constraints, rollback feasibility, and no impact to existing `public.grow_sessions` behavior.

Do not move the candidate into active migrations, production, app integration, RLS work, public reports, certifications, Source Directory public CSTP integration, Community Grow filters, automation, or breeder/source portals until staging validation is complete and reviewed.

