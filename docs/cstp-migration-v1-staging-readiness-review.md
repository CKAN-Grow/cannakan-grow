# CSTP Migration v1 Staging Readiness Review

## 1. Purpose

This document is the final staging-readiness validation before the CSTP migration v1 candidate is ever tested in staging. It reviews the executable-quality candidate in `supabase/migrations/drafts/cstp_migration_v1_candidate.sql` against the existing Cannakan Grow schema and CSTP architecture governance.

This review references:

- `supabase/migrations/drafts/cstp_migration_v1_candidate.sql`
- `docs/cstp-existing-schema-compatibility-audit.md`
- `docs/cstp-migration-v1-sql-review-checklist.md`
- `docs/cstp-architecture-master-index.md`
- `docs/cstp-entity-relationship-model-specification.md`
- `docs/cstp-backend-implementation-checklist.md`

Protecting the existing Grow session system remains the highest priority. CSTP v1 remains intentionally minimal and internal-only. Its purpose is to validate request intake, CSTP Test orchestration, admin events, and linked-session relationships before any public trust systems are introduced.

This is not implementation work. No SQL was executed, no migration was applied, no schema files were modified, and no app/backend/UI/routes, APIs, or RLS policies were changed.

## 2. Migration Scope Validation

The candidate includes only the approved v1 tables:

- `cstp_requests`
- `cstp_tests`
- `cstp_admin_events`
- `cstp_test_sessions`

The candidate excludes:

- Reports
- Report snapshots
- Report assets
- Certifications
- Certification history
- Public badges
- Public report visibility
- Source Directory public CSTP integration
- Community Grow CSTP filters
- Automation
- Breeder/source portals
- External APIs
- RLS policies

Assessment: Scope is valid for staging review. The candidate remains intentionally narrow and internal-only.

## 3. SQL Structure Review

### Table Creation Ordering

The candidate creates tables in dependency order:

1. `cstp_requests`
2. `cstp_tests`
3. `cstp_admin_events`
4. `cstp_test_sessions`

This order is structurally valid because `cstp_tests.request_id` depends on `cstp_requests`, and both child tables depend on `cstp_tests`.

### FK Ordering

Foreign keys reference existing tables or earlier-created CSTP tables:

- `public.sources(id)` exists before the candidate.
- `auth.users(id)` exists before the candidate.
- `public.grow_sessions(id)` exists before the candidate.
- `public.cstp_requests(id)` is created before `public.cstp_tests`.
- `public.cstp_tests(id)` is created before `public.cstp_admin_events` and `public.cstp_test_sessions`.

### Constraint Ordering

Primary keys, foreign keys, status checks, and unique link constraints are declared with table creation. This is acceptable for a first staging candidate.

### Index Ordering

Indexes are created after tables and constraints. This ordering is valid.

### Comment Clarity

The candidate includes table and column comments explaining:

- Internal-only v1 scope
- Session reuse
- No public publishing
- Reports/certifications deferred
- RLS deferred
- Archive-over-delete intent

### Draft Safety Markings

The file is clearly marked:

- Executable-quality candidate
- Drafts folder only
- Do not run until reviewed
- Do not move into active migrations until approved

Assessment: SQL structure appears safe for staging review. It should still be tested only in staging, not production.

## 4. Existing Schema Compatibility Review

### `public.grow_sessions(id uuid)`

The candidate references `public.grow_sessions(id)` from `cstp_test_sessions.session_id`. This matches the actual session table and UUID primary key.

Compatibility: Valid.

### `public.sources(id uuid)`

The candidate references `public.sources(id)` from `cstp_requests.source_id` and `cstp_tests.source_id`. This matches the actual source table and UUID primary key.

Compatibility: Valid.

### `auth.users`

The candidate references `auth.users(id)` for `cstp_tests.created_by` and `cstp_admin_events.admin_user_id`. The existing schema already uses `auth.users(id)` as the canonical user identity target across sessions, profiles, admin reports, notification records, and admin membership.

Compatibility: Structurally valid. Admin-only enforcement remains a future RLS concern.

### Timestamp Conventions

The candidate uses `timezone('utc', now())`, matching the dominant existing schema convention.

Compatibility: Valid.

### Naming Conventions

The candidate uses:

- snake_case table and field names
- `cstp_` prefix for CSTP-owned tables
- `*_id` relationship fields
- `*_at` timestamp fields
- table-prefixed index names

Compatibility: Valid.

### Ownership Patterns

The candidate preserves existing ownership:

- Sessions remain owned by `public.grow_sessions`.
- Sources remain owned by `public.sources`.
- CSTP owns only intake, orchestration, admin events, and join records.

Compatibility: Valid.

## 5. FK / Relationship Safety Review

### `ON DELETE RESTRICT`

The candidate uses `ON DELETE RESTRICT` for:

- `cstp_admin_events.cstp_test_id`
- `cstp_test_sessions.cstp_test_id`
- `cstp_test_sessions.session_id`

This protects internal CSTP history and prevents silent deletion of linked session evidence or orchestration history.

Assessment: Valid for staging review. Operational implications should be accepted before production activation.

### Nullable `ON DELETE SET NULL`

The candidate uses `ON DELETE SET NULL` for:

- `cstp_requests.source_id`
- `cstp_tests.source_id`
- `cstp_tests.request_id`
- `cstp_tests.created_by`
- `cstp_admin_events.admin_user_id`

This is appropriate for optional context and actor references where deleting the referenced row should not destroy CSTP history.

### Cascading Deletes

The candidate introduces no cascading deletes.

Assessment: Valid and conservative.

### Orphan Prevention

Required parent relationships are enforced for:

- admin events to CSTP Tests
- CSTP Test Session links to CSTP Tests
- CSTP Test Session links to Grow sessions

Optional relationships use nullable fields and `SET NULL`.

Assessment: Valid.

### Unique Link Safeguard

The candidate includes:

- `constraint cstp_test_sessions_test_session_key unique (cstp_test_id, session_id)`

This prevents duplicate linkage of the same session to the same CSTP Test.

Assessment: Valid.

## 6. Session Compatibility Review

The candidate does not modify `public.grow_sessions`.

It does not introduce:

- session table changes
- session ownership changes
- timeline/stage changes
- partition changes
- observation tables
- metrics tables
- image/snapshot ownership changes
- duplicate session records

`cstp_test_sessions` links to existing sessions while preserving session ownership and behavior.

Assessment: Session compatibility is preserved. Sessions remain the source of truth.

## 7. Timestamp / Trigger Compatibility Review

### Timestamp Defaults

The candidate uses `timezone('utc', now())` for all new `created_at` and `updated_at` defaults, aligning with existing schema conventions.

Assessment: Valid.

### updated_at Handling

The existing schema uses table-specific updated-at trigger functions, such as:

- `public.set_grow_sessions_updated_at()`
- `public.set_sources_updated_at()`

The candidate does not invent a new generic trigger function. It includes a comment noting that `updated_at` trigger handling for `public.cstp_requests` and `public.cstp_tests` should be aligned before activation.

Assessment: Safe for staging review, with one required pre-activation decision. If the candidate is tested exactly as written, `updated_at` defaults will exist but will not auto-update on row updates.

## 8. Status Constraint Review

The candidate uses conservative `CHECK` constraints rather than enums.

### Request Statuses

Allowed values:

- `received`
- `accepted`
- `awaiting_seeds`
- `declined`
- `archived`

### Test Statuses

Allowed values:

- `pending`
- `active`
- `completed`
- `archived`

Assessment: Valid. This avoids premature enum complexity while preventing uncontrolled status drift.

## 9. Index Strategy Review

The candidate indexes:

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

These support likely v1 query paths:

- intake queues
- source-specific CSTP review
- test list/detail loading
- request-to-test lookup
- admin event history
- linked-session retrieval
- archive/status filtering

Assessment: Valid for staging. The candidate avoids premature composite indexing. Composite indexes can be added later once real query patterns are measured.

## 10. Internal-Only Visibility Review

The candidate includes no:

- public report visibility paths
- public report tables
- certification tables
- public badge fields
- Source Directory public CSTP fields
- Community Grow CSTP filters
- public APIs
- RLS public read policies

The candidate comments clearly state RLS is deferred and future policies should restrict CSTP management to admins.

Assessment: Internal-only boundary is preserved. No public CSTP exposure is introduced by the candidate itself.

## 11. Rollback / Migration Safety Review

The candidate is additive-only:

- It creates new CSTP-owned tables.
- It creates new indexes on CSTP-owned tables.
- It adds comments to CSTP-owned tables/columns.
- It does not alter existing tables.
- It does not update existing data.
- It does not delete existing data.
- It does not add public policies.

Rollback feasibility is strong for staging because no existing schema objects are mutated. In staging, cleanup would primarily involve dropping the new CSTP-owned tables and indexes if needed.

Assessment: Safe for staging-only migration testing, assuming no production execution and no public dependencies.

## 12. Future Compatibility Review

The candidate remains compatible with future:

- reports
- immutable report snapshots
- report assets
- certifications
- source certification history
- public badges
- Source Directory integration
- Community Grow filters
- automation
- breeder/source portals
- external APIs
- future RLS policies

The key compatibility path is preserved:

```text
cstp_tests
-> cstp_test_sessions
-> grow_sessions
```

Future reports, snapshots, and certifications can attach to `cstp_tests` without changing session ownership.

Assessment: Future compatibility is preserved.

## 13. Risk Review

### Auth Ownership Assumptions

The candidate uses `auth.users(id)` for `created_by` and `admin_user_id`. This is structurally consistent with existing schema, but admin-only enforcement is not implemented in this candidate.

Risk level: Low for staging, medium before production activation without RLS.

### Future RLS Alignment

RLS is intentionally deferred. Because existing schema enables RLS broadly, any active production migration will eventually need clear policies before app integration.

Risk level: Low for isolated staging review, high for production exposure if left unaddressed.

### Future Archive Strategy Refinement

The candidate uses `archived boolean`. Existing schema has mixed lifecycle conventions. This is acceptable for v1, but `archived_at` may be useful later for auditability.

Risk level: Low for v1.

### Future Certification Relationship Complexity

Certifications are intentionally deferred. The candidate does not block them, but future certification records must preserve historical integrity and avoid deriving public status from v1 workflow state alone.

Risk level: Low for v1, important for future phases.

### Migration Ordering Dependencies

The candidate depends on `public.sources`, `public.grow_sessions`, and `auth.users` already existing. They do exist in the current schema.

Risk level: Low.

### updated_at Trigger Gap

The candidate defines `updated_at` fields but does not add triggers.

Risk level: Low for staging validation, should be resolved before activation if automatic `updated_at` behavior is required.

## 14. Final Readiness Assessment

The CSTP migration v1 candidate appears safe for staging-only testing review.

Validated:

- Approved v1 scope is preserved.
- Existing Grow session system is untouched.
- CSTP links to sessions instead of duplicating them.
- Existing schema compatibility is preserved.
- FK relationships are conservative.
- No public systems are introduced.
- No RLS assumptions are implemented.
- The migration is additive-only.
- Architecture alignment is preserved.

Clarifications before executable staging test:

- Decide whether to test the candidate exactly as written without updated-at triggers, or add CSTP-specific updated-at trigger handling before staging.
- Confirm the team accepts `auth.users(id)` as the actor FK target for `created_by` and `admin_user_id`.
- Confirm the team accepts `ON DELETE RESTRICT` for CSTP Test/session/history protection.

Assessment: Ready for staging-only review/testing after the above points are acknowledged. Not ready for production activation or app integration.

## 15. Explicit Non-Goals

This review does not include or perform:

- Migration execution
- Production rollout
- Schema activation
- Schema file modification
- App/backend/UI/route changes
- API implementation
- RLS implementation
- Public systems
- Reports
- Report snapshots
- Certifications
- Public badges
- Source Directory public CSTP integration
- Community Grow CSTP integration
- Automation
- Breeder/source portal work

This is an implementation-validation review only.

