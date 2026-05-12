# CSTP Migration v1 SQL Review Checklist

## 1. Purpose

This checklist is the final validation layer before CSTP migration v1 SQL implementation begins. It must be reviewed before any real SQL is written, executed, or converted into a migration file.

This review checklist is informed by:

- `docs/cstp-architecture-master-index.md`
- `docs/cstp-entity-relationship-model-specification.md`
- `docs/cstp-initial-sql-migration-scope-definition.md`
- `docs/cstp-migration-v1-sql-design-draft.md`
- `docs/cstp-backend-implementation-checklist.md`
- `docs/cstp-sql-migration-planning.md`

Migration v1 must remain intentionally minimal and internal-only. Its purpose is to validate CSTP orchestration, session linkage, and internal workflow management without introducing public reports, certifications, badges, automation, breeder/source portals, or public APIs.

Preserving Grow session stability is the highest priority. CSTP must link to existing sessions without duplicating or changing session behavior.

This is not implementation work. It does not include SQL, migrations, schema file changes, backend code, app code, UI, routes, APIs, RLS, or public rollout.

## 2. Scope Validation Checklist

Approved v1 tables only:

- [ ] `cstp_requests`
- [ ] `cstp_tests`
- [ ] `cstp_admin_events`
- [ ] `cstp_test_sessions`

Validate exclusions:

- [ ] No `cstp_reports`.
- [ ] No `cstp_report_snapshots`.
- [ ] No `cstp_report_assets`.
- [ ] No `cstp_certifications`.
- [ ] No `source_certification_history`.
- [ ] No public report pages.
- [ ] No public certification badges.
- [ ] No Source Directory public CSTP integration.
- [ ] No Community Grow CSTP filters.
- [ ] No automation.
- [ ] No breeder/source portals.
- [ ] No external/public APIs.
- [ ] No RLS implementation in v1 SQL review scope.

Validation outcome:

- [ ] Migration v1 scope is intentionally narrow.
- [ ] Migration v1 does not include future public trust systems.

## 3. Session Alignment Checklist

Validate:

- [ ] Sessions remain the source of truth for observed grow and test activity.
- [ ] CSTP links to existing sessions instead of duplicating them.
- [ ] `cstp_test_sessions` is the only v1 CSTP/session join layer.
- [ ] No duplicate timeline logic is introduced.
- [ ] No duplicate observation system is introduced.
- [ ] No duplicate metrics ownership is introduced.
- [ ] Existing session behavior remains unchanged.
- [ ] Existing session ownership remains unchanged.
- [ ] Existing stage/timeline behavior remains unchanged.
- [ ] Existing partition behavior remains unchanged.
- [ ] Existing session image behavior remains unchanged.

Validation outcome:

- [ ] CSTP remains additive to the existing session architecture.
- [ ] CSTP does not become a parallel session system.

## 4. Relationship / FK Safety Checklist

Validate conceptual relationships:

- [ ] `sources` to `cstp_requests` relationship aligns with ERD guidance.
- [ ] `sources` to `cstp_tests` relationship aligns with ERD guidance.
- [ ] `cstp_requests` to `cstp_tests` relationship aligns with migration v1 scope.
- [ ] `cstp_tests` to `cstp_admin_events` relationship is clear.
- [ ] `cstp_tests` to `sessions` relationship occurs through `cstp_test_sessions`.
- [ ] `cstp_test_sessions` references existing sessions without owning them.

Validate safety:

- [ ] No unsafe cascading deletes are planned.
- [ ] Orphan prevention strategy is defined.
- [ ] Archive strategy is preferred over destructive deletion.
- [ ] Relationship ownership is clear.
- [ ] Linked sessions are not deleted by CSTP lifecycle changes.
- [ ] Admin events do not own or mutate session records.
- [ ] Future report/certification compatibility is not blocked by v1 relationships.

Validation outcome:

- [ ] FK strategy protects existing sessions.
- [ ] FK strategy does not endanger future historical records.

## 5. Naming Consistency Checklist

Validate:

- [ ] Table names use snake_case.
- [ ] CSTP-owned tables use the `cstp_` prefix.
- [ ] Shared tables retain existing names, such as `sessions` and `sources`.
- [ ] Relationship fields use consistent `*_id` naming.
- [ ] Timestamp fields use consistent `*_at` naming.
- [ ] Boolean archive fields are named consistently if used.
- [ ] Status terminology matches `docs/cstp-architecture-master-index.md`.
- [ ] Lifecycle terminology matches governance documents.
- [ ] Request status values describe intake only.
- [ ] Test status values describe orchestration only.
- [ ] Admin event types describe audit events only.

Validation outcome:

- [ ] Naming aligns with the master index.
- [ ] No schema naming drift is introduced.

## 6. Internal-Only Visibility Checklist

Validate:

- [ ] No public report visibility exists in v1.
- [ ] No public certification states exist in v1.
- [ ] No public Source Directory CSTP exposure exists in v1.
- [ ] No Community Grow CSTP filters exist in v1.
- [ ] No public APIs exist in v1.
- [ ] No public trust systems exist in v1.
- [ ] CSTP request records are internal/admin by default.
- [ ] CSTP Test records are internal/admin by default.
- [ ] CSTP Admin Event records are internal/admin by default.
- [ ] CSTP Test Session links are internal/admin by default.

Validation outcome:

- [ ] Migration v1 cannot accidentally publish CSTP status.
- [ ] Public CSTP trust signals remain deferred.

## 7. Migration Safety Checklist

Validate:

- [ ] Migration strategy is additive only.
- [ ] Existing session tables are untouched.
- [ ] Existing source tables are not structurally changed.
- [ ] Existing gallery/community tables are untouched.
- [ ] Existing notification tables are untouched.
- [ ] No destructive schema changes are included.
- [ ] No required session backfills are included.
- [ ] Rollback planning has been reviewed.
- [ ] Staging-first rollout is planned.
- [ ] Production rollout keeps CSTP hidden/internal.

Validation outcome:

- [ ] Migration v1 can be tested without public exposure.
- [ ] Rollback risk is low because v1 is internal and additive.

## 8. Archive / Historical Integrity Checklist

Validate:

- [ ] Archive is preferred over deletion.
- [ ] CSTP requests can remain queryable after archival.
- [ ] CSTP Tests can remain queryable after archival.
- [ ] CSTP Test Session links can remain queryable after archival.
- [ ] Admin Events are append-only in principle.
- [ ] Future certification history compatibility is preserved.
- [ ] Future immutable report compatibility is preserved.
- [ ] Relationships remain historically queryable.
- [ ] v1 does not introduce deletion behavior that would later break public report or certification history.

Validation outcome:

- [ ] v1 supports future history-preserving CSTP behavior.
- [ ] v1 does not require destructive cleanup patterns.

## 9. Index / Query Planning Checklist

Validate likely indexed fields:

- [ ] `source_id`
- [ ] `request_id`
- [ ] `cstp_test_id`
- [ ] `session_id`
- [ ] `status`
- [ ] `archived`
- [ ] `created_at`

Validate likely lookup/query paths:

- [ ] List CSTP requests by status.
- [ ] Find CSTP requests by source.
- [ ] List active CSTP Tests.
- [ ] Find CSTP Tests by source.
- [ ] Find CSTP Tests by request.
- [ ] Load admin event history for a CSTP Test.
- [ ] Load sessions linked to a CSTP Test.
- [ ] Find CSTP Tests linked to a session.
- [ ] Review archived CSTP records internally.

Validation outcome:

- [ ] v1 supports internal admin workflow queries.
- [ ] v1 supports session linkage validation queries.

## 10. Future Compatibility Checklist

Validate migration v1 remains compatible with future:

- [ ] Reports.
- [ ] Report snapshots.
- [ ] Report assets.
- [ ] Certifications.
- [ ] Certification history.
- [ ] Source Directory enhancements.
- [ ] Community Grow integration.
- [ ] Automation.
- [ ] Breeder/source portals.
- [ ] External APIs.
- [ ] Public report visibility.
- [ ] Future RLS policies.

Validation outcome:

- [ ] v1 does not block future public trust systems.
- [ ] v1 does not force future schema rewrites for reports or certifications.

## 11. Risk Area Checklist

Review risks:

- [ ] Duplicated session ownership.
- [ ] Orphaned linked sessions.
- [ ] Mutable historical systems.
- [ ] Schema drift.
- [ ] Premature public exposure.
- [ ] Unsafe FK cascades.
- [ ] Rollback instability.
- [ ] Duplicated workflow state meaning.
- [ ] Public/private boundary confusion.
- [ ] Future report/certification incompatibility.

Validation outcome:

- [ ] Each risk has an explicit mitigation before SQL drafting begins.

## 12. Pre-SQL Approval Criteria

SQL drafting should not begin until all of the following are true:

- [ ] Architecture alignment is verified.
- [ ] ERD alignment is verified.
- [ ] Migration scope is verified.
- [ ] Naming consistency is verified.
- [ ] Internal-only boundaries are verified.
- [ ] Rollback strategy is reviewed.
- [ ] Relationship integrity is verified.
- [ ] Session-system compatibility is verified.
- [ ] Archive/history strategy is verified.
- [ ] Future compatibility is verified.

Approval outcome:

- [ ] Migration v1 is approved for SQL drafting.
- [ ] Migration v1 is not approved for SQL drafting until unresolved checklist items are closed.

## 13. Explicit Non-Goals

This document does not include or implement:

- SQL
- Migrations
- Schema edits
- Backend implementation
- App implementation
- UI changes
- Route changes
- APIs
- Row-level security
- Public rollout
- Certifications
- Reports
- Report snapshots
- Public badges
- Source Directory CSTP public integration
- Community Grow CSTP filters
- Automation
- Breeder/source portal functionality

This is a final pre-implementation review checklist only.

## 14. Final Recommendation

SQL implementation should begin only after all checklist sections are validated. Migration v1 should prioritize orchestration stability, session alignment, internal workflow safety, and rollback confidence over feature expansion.

The first CSTP migration should prove that Cannakan Grow can support CSTP intake, parent tests, admin events, and linked existing sessions without destabilizing the session system or exposing unfinished public trust signals.

