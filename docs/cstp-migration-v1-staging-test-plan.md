# CSTP Migration v1 Staging Test Plan

## 1. Purpose

This document defines the exact staging validation process for the CSTP migration v1 candidate before any production usage or backend integration occurs.

This is the final validation layer before any real migration execution. Staging exists to validate schema behavior safely in an isolated environment before the migration candidate is promoted, integrated, or considered for production.

This test plan references:

- `supabase/migrations/drafts/cstp_migration_v1_candidate.sql`
- `docs/cstp-migration-v1-staging-readiness-review.md`
- `docs/cstp-migration-v1-sql-review-checklist.md`
- `docs/cstp-backend-implementation-checklist.md`
- `docs/cstp-entity-relationship-model-specification.md`

This plan defines database-level validation only. It does not include app integration, API work, RLS implementation, frontend work, admin tooling, production rollout, public reports, or public certifications.

## 2. Staging Environment Assumptions

Staging validation should use:

- An isolated staging environment only.
- A copy of the existing Grow schema, preferably representative of production schema structure.
- No production data exposure.
- No public CSTP systems enabled.
- No frontend dependencies.
- No app/backend integration.
- No RLS/public policy assumptions for CSTP v1.
- No public Source Directory CSTP display.
- No Community Grow CSTP filters.

If production-like data is needed, it should be sanitized before use. CSTP v1 validation should not require real production user data.

## 3. Migration Apply Validation

### Tests

- [ ] Apply the candidate migration in staging only.
- [ ] Confirm the migration executes cleanly.
- [ ] Confirm all four CSTP v1 tables create successfully.
- [ ] Confirm all indexes create successfully.
- [ ] Confirm all check constraints apply correctly.
- [ ] Confirm foreign keys apply in the expected order.
- [ ] Confirm no ordering failures occur.

### Validation

- [ ] No existing tables are modified.
- [ ] No existing indexes are removed or changed.
- [ ] No existing policies are changed.
- [ ] No existing functions are changed.
- [ ] No existing triggers are changed.
- [ ] No existing data is modified.
- [ ] No unintended schema modifications occur.

## 4. Table Structure Validation

Validate existence and structure of:

- [ ] `public.cstp_requests`
- [ ] `public.cstp_tests`
- [ ] `public.cstp_admin_events`
- [ ] `public.cstp_test_sessions`

Review for each table:

- [ ] Primary key exists.
- [ ] Primary key uses UUID.
- [ ] Defaults apply correctly.
- [ ] FK relationships are present where expected.
- [ ] Nullable fields match the candidate design.
- [ ] Required fields reject missing values.
- [ ] Timestamp fields exist.
- [ ] Archive flags exist where planned.
- [ ] Status defaults exist where planned.
- [ ] Comments exist and document internal-only v1 scope.

## 5. FK Integrity Tests

### Source References

- [ ] Insert `cstp_requests` with a valid `source_id`.
- [ ] Insert `cstp_tests` with a valid `source_id`.
- [ ] Confirm invalid `source_id` inserts fail.
- [ ] Confirm nullable `source_id` inserts work.
- [ ] Confirm deleting a referenced source sets nullable CSTP `source_id` fields to null in staging test data.

### Session References

- [ ] Insert `cstp_test_sessions` with a valid `session_id` from `public.grow_sessions`.
- [ ] Confirm invalid `session_id` inserts fail.
- [ ] Confirm nullable session references are not allowed.
- [ ] Confirm linked sessions remain unchanged after link creation.

### CSTP Parent References

- [ ] Insert `cstp_tests` with a valid `request_id`.
- [ ] Confirm invalid `request_id` inserts fail.
- [ ] Insert `cstp_admin_events` with a valid `cstp_test_id`.
- [ ] Confirm invalid `cstp_test_id` inserts fail.
- [ ] Insert `cstp_test_sessions` with a valid `cstp_test_id`.
- [ ] Confirm invalid `cstp_test_id` inserts fail.

### Delete Behavior

- [ ] Validate `ON DELETE RESTRICT` blocks deletion of a CSTP Test with admin events.
- [ ] Validate `ON DELETE RESTRICT` blocks deletion of a CSTP Test with linked sessions.
- [ ] Validate `ON DELETE RESTRICT` blocks deletion of a linked Grow session while the link exists.
- [ ] Validate `ON DELETE SET NULL` behavior for optional `source_id`.
- [ ] Validate `ON DELETE SET NULL` behavior for optional `request_id`.
- [ ] Validate `ON DELETE SET NULL` behavior for optional actor references where test data permits.

## 6. Constraint Validation Tests

### Status Constraints

- [ ] Confirm `cstp_requests.status` accepts `received`.
- [ ] Confirm `cstp_requests.status` accepts `accepted`.
- [ ] Confirm `cstp_requests.status` accepts `awaiting_seeds`.
- [ ] Confirm `cstp_requests.status` accepts `declined`.
- [ ] Confirm `cstp_requests.status` accepts `archived`.
- [ ] Confirm `cstp_requests.status` rejects invalid values.

- [ ] Confirm `cstp_tests.status` accepts `pending`.
- [ ] Confirm `cstp_tests.status` accepts `active`.
- [ ] Confirm `cstp_tests.status` accepts `completed`.
- [ ] Confirm `cstp_tests.status` accepts `archived`.
- [ ] Confirm `cstp_tests.status` rejects invalid values.

### Unique Constraint

- [ ] Confirm `unique(cstp_test_id, session_id)` blocks duplicate links.
- [ ] Confirm one CSTP Test can link multiple different sessions.
- [ ] Confirm one session can link to multiple CSTP Tests only if the intended workflow permits it and the schema allows it.

### Nullability

- [ ] Confirm required fields reject null values.
- [ ] Confirm optional fields allow null values.
- [ ] Confirm defaults populate when optional values are omitted.

## 7. Insert / Lifecycle Simulation Tests

Simulate the internal v1 lifecycle:

1. [ ] Create an intake request.
2. [ ] Accept or update request status.
3. [ ] Create a CSTP Test linked to the request.
4. [ ] Link one existing Grow session to the CSTP Test.
5. [ ] Link additional sessions to simulate multi-KAN grouping.
6. [ ] Add admin events for request acceptance, test creation, session linkage, and status changes.
7. [ ] Update CSTP Test status from `pending` to `active`.
8. [ ] Update CSTP Test status from `active` to `completed`.
9. [ ] Archive a request or test using the archive flag/status.
10. [ ] Query the CSTP Test with its linked sessions and admin events.

Validate:

- [ ] Orchestration lifecycle behaves as expected.
- [ ] Session linkage remains stable.
- [ ] Admin event logging is append-friendly.
- [ ] Multi-KAN grouping can be represented.
- [ ] Archive flags do not destroy history.

## 8. Session Compatibility Validation

Validate:

- [ ] Existing `public.grow_sessions` rows remain untouched.
- [ ] Session ownership remains unchanged.
- [ ] Session status/timeline fields remain unchanged.
- [ ] Session partition data remains unchanged.
- [ ] Session images remain unchanged.
- [ ] Session metrics-related fields remain unchanged.
- [ ] No new session columns are introduced.
- [ ] No session triggers are modified.
- [ ] No session RLS policies are modified.

Confirm:

- [ ] Sessions remain reusable outside CSTP.
- [ ] Linking a session to CSTP does not change normal session behavior.
- [ ] CSTP v1 does not create a duplicate timeline, observation, image, or metrics system.

## 9. Timestamp / Trigger Validation

Validate:

- [ ] `created_at` defaults populate with UTC-compatible timestamp values.
- [ ] `updated_at` defaults populate with UTC-compatible timestamp values.
- [ ] Timestamp defaults align with existing `timezone('utc', now())` convention.
- [ ] No conflicting trigger assumptions are introduced.

If updated-at triggers remain deferred:

- [ ] Document that `updated_at` will not auto-update on row updates in this candidate.
- [ ] Decide whether staging should test without triggers or add CSTP-specific triggers before active migration review.
- [ ] Document expected future implementation path for `set_cstp_requests_updated_at` and `set_cstp_tests_updated_at`, or an approved shared trigger function.

## 10. Rollback Validation

Test conceptually and, if approved in staging, operationally:

- [ ] Confirm migration is additive-only.
- [ ] Confirm rollback can remove only CSTP v1 tables/indexes/comments.
- [ ] Confirm rollback does not affect existing Grow tables.
- [ ] Confirm rollback does not require future migrations.
- [ ] Confirm rollback does not alter existing sessions, sources, profiles, gallery snapshots, notifications, or admin tables.
- [ ] Confirm rollback does not depend on app code changes.

Rollback confidence should be established before the candidate is considered for active migration review.

## 11. Internal-Only Boundary Validation

Validate:

- [ ] No public tables/views are introduced.
- [ ] No report systems exist.
- [ ] No report snapshot systems exist.
- [ ] No certification systems exist.
- [ ] No public badge systems exist.
- [ ] No public APIs are assumed.
- [ ] No Source Directory public CSTP exposure exists.
- [ ] No Community Grow CSTP exposure exists.
- [ ] No RLS/public policy assumptions are implemented.
- [ ] All CSTP v1 data remains internal/admin by design.

## 12. Index / Query Validation

Review:

- [ ] FK lookup support.
- [ ] Status lookup support.
- [ ] Archive lookup support.
- [ ] Internal intake queue query paths.
- [ ] CSTP Test list/detail query paths.
- [ ] Admin event history query paths.
- [ ] Linked session query paths.
- [ ] Multi-KAN grouping query paths.

Validate:

- [ ] No obviously missing foundational indexes.
- [ ] No premature over-indexing.
- [ ] Index names align with existing table-prefixed convention.

## 13. Risk Validation Review

Review remaining risks:

### Auth Users Ownership Assumptions

- [ ] Confirm `auth.users(id)` is acceptable for `created_by`.
- [ ] Confirm `auth.users(id)` is acceptable for `admin_user_id`.
- [ ] Confirm admin-only behavior will be enforced later through RLS/app workflow.

### Future RLS Integration

- [ ] Confirm no CSTP public policies exist in v1.
- [ ] Confirm future RLS must restrict CSTP management to admins.
- [ ] Confirm public read policies remain deferred until public reports/certifications exist.

### Archive Strategy Refinement

- [ ] Confirm `archived boolean` is acceptable for v1.
- [ ] Decide whether future phases need `archived_at`.

### Future Report / Certification Expansion

- [ ] Confirm v1 does not block future reports.
- [ ] Confirm v1 does not block future immutable snapshots.
- [ ] Confirm v1 does not block future certifications.
- [ ] Confirm v1 does not derive public trust state from internal workflow state.

### Future Migration Ordering

- [ ] Confirm future report/snapshot/certification migrations can attach to `cstp_tests`.
- [ ] Confirm Source Directory public integration remains deferred.
- [ ] Confirm Community Grow integration remains deferred.

## 14. Staging Exit Criteria

Before the migration can move toward active review:

- [ ] Migration applies cleanly in staging.
- [ ] Rollback confidence is established.
- [ ] Relationship integrity is validated.
- [ ] Session compatibility is validated.
- [ ] No unintended schema impact is observed.
- [ ] Internal-only boundaries are preserved.
- [ ] FK behavior is validated.
- [ ] Status constraints are validated.
- [ ] Unique session-link safeguard is validated.
- [ ] Timestamp behavior is documented.
- [ ] Remaining risks are acknowledged.

Before backend integration begins:

- [ ] Staging validation results are reviewed.
- [ ] RLS/admin access plan is defined.
- [ ] Updated-at trigger decision is resolved.
- [ ] Admin actor ownership assumptions are confirmed.
- [ ] No session regressions are observed.

Before admin tooling work begins:

- [ ] Internal CSTP lifecycle is confirmed.
- [ ] Query paths for requests, tests, links, and admin events are validated.
- [ ] Archive behavior is accepted.
- [ ] Public systems remain explicitly deferred.

## 15. Explicit Non-Goals

This staging test plan does not include:

- Production rollout
- Public exposure
- Reports
- Report snapshots
- Certifications
- Public badges
- Automation
- Breeder/source portals
- External APIs
- Frontend integration
- Backend integration
- RLS implementation
- Source Directory public CSTP integration
- Community Grow CSTP integration

This is a database-level staging validation plan only.

## 16. Final Recommendation

Staging validation should remain conservative and isolated. The migration candidate should be tested only against a staging environment that mirrors the existing Grow schema and does not expose production data.

Public trust systems should remain deferred until backend stability is proven. Reports, immutable snapshots, certifications, badges, Source Directory public integration, Community Grow discovery, automation, and breeder/source portal access should not be introduced during migration v1 staging validation.

CSTP architecture alignment with Grow sessions remains foundational. The staging test should prove that CSTP can orchestrate existing sessions internally without mutating or duplicating the session system.

