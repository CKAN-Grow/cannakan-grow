# CSTP Backend Implementation Checklist

## 1. Purpose

This document is the canonical backend engineering checklist for implementing the Cannakan Seed Testing Program (CSTP) inside Cannakan Grow. It bridges the completed CSTP architecture and planning work into actionable implementation tasks and validation checkpoints for future engineering work.

This checklist is informed by:

- `docs/cstp-session-architecture-alignment-specification.md`
- `docs/cstp-relational-data-planning-specification.md`
- `docs/cstp-supabase-schema-planning-specification.md`
- `docs/cstp-supabase-schema-definition-draft.md`
- `docs/cstp-implementation-roadmap-specification.md`
- `docs/cstp-sql-migration-planning.md`
- `docs/cstp-architecture-master-index.md`
- `docs/cstp-existing-system-reuse-audit.md`

Implementation should remain phased, conservative, and internal-first. CSTP touches session evidence, report history, certification status, Source Directory trust signals, and future administrative workflow. The existing Grow session architecture must remain stable throughout implementation.

This is not implementation work. It does not create SQL, migrations, schema edits, APIs, RLS, backend code, frontend code, routes, UI, or admin pages.

## 2. Backend Implementation Principles

- Sessions remain the source of truth for observed grow and test activity.
- CSTP extends existing Cannakan Grow systems instead of replacing them.
- Initial implementation should be additive only.
- Core CSTP tables should be internal-only before public publishing.
- Public trust requires immutable report snapshots.
- Certification history must persist across renewal, expiration, revocation, and replacement.
- Source Directory remains shared and global.
- Internal workflows must stabilize before public rollout.
- Failed, invalid, draft, or internal CSTP records must remain private.
- Automation and breeder/source portal features should be deferred until the backend lifecycle is proven.

## 3. Phase 1 - Schema Preparation Checklist

### Checklist

- [ ] Verify final CSTP table concepts.
- [ ] Verify relationship planning between sources, CSTP Tests, sessions, reports, snapshots, certifications, and history records.
- [ ] Verify naming standards from the architecture master index.
- [ ] Verify lifecycle terminology for requests, tests, reports, certifications, and visibility.
- [ ] Verify report snapshot immutability strategy.
- [ ] Verify certification history persistence strategy.
- [ ] Verify archive/delete expectations.
- [ ] Verify public/private data boundaries.
- [ ] Verify Source Directory remains shared and is not duplicated.
- [ ] Verify existing sessions remain first-class records.

### Validation Checkpoints

- [ ] No duplicated session logic is introduced.
- [ ] No conflicting ownership models are introduced.
- [ ] CSTP-specific records are clearly separated from shared session/source records.
- [ ] Public report values are planned to come from report snapshots, not live sessions.

## 4. Phase 2 - Migration Preparation Checklist

### Checklist

- [ ] Review migration ordering.
- [ ] Validate dependency graph.
- [ ] Review rollback strategy.
- [ ] Plan staging migration sequence.
- [ ] Review foreign key safety.
- [ ] Review archive/soft-delete expectations.
- [ ] Confirm public publishing is excluded from early migrations.
- [ ] Confirm no initial migration requires rewriting existing session records.

### Validation Checkpoints

- [ ] Existing sessions remain unaffected.
- [ ] Additive-only migration strategy is confirmed.
- [ ] Rollback risk is minimized before public data exists.
- [ ] No destructive session, source, or gallery changes are required.

## 5. Phase 3 - Core CSTP Table Implementation Checklist

### Checklist

- [ ] Implement `cstp_requests`.
- [ ] Implement `cstp_tests`.
- [ ] Implement `cstp_admin_events`.
- [ ] Implement `cstp_test_sessions`.
- [ ] Implement `cstp_reports`.
- [ ] Implement `cstp_report_snapshots`.
- [ ] Implement `cstp_certifications`.
- [ ] Implement `source_certification_history`.
- [ ] Confirm table names and field names follow canonical naming standards.
- [ ] Confirm timestamps use consistent `*_at` naming.
- [ ] Confirm relationship fields use consistent `*_id` naming.

### Validation Checkpoints

- [ ] Relationships are valid.
- [ ] No orphaned references are created during normal internal workflows.
- [ ] Archive behavior is defined.
- [ ] Published report and certification history records are protected from unsafe deletes.
- [ ] Tables remain internal-only until public visibility behavior is ready.

## 6. Phase 4 - Session Linkage Checklist

### Checklist

- [ ] Link parent CSTP Test records to child session records.
- [ ] Validate `cstp_test_sessions` as the only CSTP/session join layer.
- [ ] Support multi-KAN orchestration through linked sessions.
- [ ] Define included/excluded session behavior for report preparation.
- [ ] Plan metrics aggregation from linked sessions.
- [ ] Validate report snapshot source data from linked sessions.
- [ ] Confirm session ownership remains unchanged.
- [ ] Confirm sessions can exist independently of CSTP.

### Validation Checkpoints

- [ ] Sessions remain reusable outside CSTP.
- [ ] CSTP does not mutate session logic.
- [ ] Linking a session to CSTP does not change normal session lifecycle behavior.
- [ ] Removing or archiving a CSTP link does not delete the session.

## 7. Phase 5 - Immutable Report Snapshot Checklist

### Checklist

- [ ] Create report snapshot generation workflow.
- [ ] Define frozen metrics handling.
- [ ] Define frozen source data handling.
- [ ] Define frozen stage/timeline data handling.
- [ ] Define frozen certification state handling.
- [ ] Define published snapshot immutability behavior.
- [ ] Define report revision/supersession behavior.
- [ ] Define report unavailable/withdrawn fallback behavior.

### Validation Checkpoints

- [ ] Published reports remain stable after source session changes.
- [ ] Report regeneration does not overwrite history.
- [ ] Draft snapshots remain private.
- [ ] Published snapshots are the public report source.
- [ ] Public reports do not read mutable session values directly.

## 8. Phase 6 - Certification Lifecycle Checklist

### Checklist

- [ ] Define certification issuance behavior.
- [ ] Implement Gold Certified state handling.
- [ ] Implement Silver Certified state handling.
- [ ] Implement CSTP Tested state handling.
- [ ] Plan expiration logic.
- [ ] Plan renewal relationship handling.
- [ ] Plan revocation handling.
- [ ] Preserve certification history records.
- [ ] Connect certifications to CSTP Tests and sources.
- [ ] Connect certifications to report snapshots when public report evidence exists.

### Validation Checkpoints

- [ ] Historical certifications remain queryable.
- [ ] Renewals do not overwrite prior certifications.
- [ ] Expiration does not delete prior certifications.
- [ ] Revocation preserves historical context.
- [ ] Source Directory badge state derives from approved certification/history records.

## 9. Phase 7 - Internal Admin Workflow Checklist

### Checklist

- [ ] Define intake workflow.
- [ ] Define CSTP Test lifecycle management.
- [ ] Define internal notes/events behavior.
- [ ] Define admin-only visibility.
- [ ] Define report preparation flow.
- [ ] Define failed/invalid test handling.
- [ ] Define archived test handling.
- [ ] Define admin event audit trail behavior.

### Validation Checkpoints

- [ ] Workflows are stable before public exposure.
- [ ] Failed/internal tests remain private.
- [ ] Draft reports remain private.
- [ ] Admin notes are not exposed in public report data.
- [ ] Admin events are audit records, not public content.

## 10. Phase 8 - Public Visibility Preparation Checklist

### Checklist

- [ ] Plan Source Directory enhancement behavior.
- [ ] Plan tested-source badge visibility.
- [ ] Plan Gold/Silver badge display data sources.
- [ ] Plan Report Available / Report Unavailable behavior.
- [ ] Plan report visibility rules.
- [ ] Plan Community Grow filter integration.
- [ ] Plan public unavailable/expired fallback states.
- [ ] Confirm public terminology aligns with CSTP reporting framework.

### Validation Checkpoints

- [ ] No premature public exposure occurs.
- [ ] Only approved certifications are visible publicly.
- [ ] Tested-only states do not imply certification.
- [ ] Expired states do not imply active certification.
- [ ] Report links resolve to published snapshots or safe fallback states.

## 11. Phase 9 - Safety & Validation Checklist

### Checklist

- [ ] Run staging validation.
- [ ] Test migration rollback behavior.
- [ ] Test certification persistence.
- [ ] Validate snapshot immutability.
- [ ] Check orphaned relationships.
- [ ] Check visibility boundaries.
- [ ] Validate existing sessions still load, save, update, and complete normally.
- [ ] Validate Source Directory remains unchanged until enhancement phase.
- [ ] Validate Community Grow does not expose internal CSTP data.
- [ ] Validate public queries return only approved published CSTP records.

### Validation Checkpoints

- [ ] Existing Grow sessions show no regression.
- [ ] CSTP Tests correctly group linked sessions.
- [ ] Report snapshots remain stable after linked session edits.
- [ ] Certification history survives renewal, expiration, and revocation.
- [ ] Public/private access boundaries are verified before rollout.

## 12. Deferred Systems Checklist

The following systems should be explicitly deferred until the core backend lifecycle is stable:

- [ ] Automation
- [ ] Breeder/source portal
- [ ] Public submissions
- [ ] Advanced analytics
- [ ] External APIs
- [ ] Notification systems
- [ ] Automated certification renewal
- [ ] Public report announcement workflows
- [ ] Source representative access controls

Deferred systems should not be used to compensate for unstable schema, workflow, visibility, or report snapshot behavior.

## 13. High-Risk Engineering Areas

### Duplicated Session Logic

CSTP must not create a parallel session system or separate timeline/partition mechanics for the same evidence.

### Mutable Reports

Published reports must not read directly from mutable session data or regenerate into different public values without revision handling.

### Overwritten Certifications

Renewal, expiration, or revocation must not overwrite historical certification records.

### Unsafe Foreign Keys

Cascading deletes must not destroy published reports, certification history, or source history.

### Broken Visibility Boundaries

Draft reports, failed tests, internal notes, admin events, and unpublished workflow states must remain private.

### Schema Drift

Table names, field names, lifecycle status values, and visibility terminology should remain aligned with the master index and schema definition draft.

### Orphaned Report References

Published report routes and Source Directory links must resolve to stable snapshots or controlled fallback states.

## 14. Completion Criteria

CSTP should not be considered backend-stable until all of the following are true:

- [ ] Schema is validated.
- [ ] Relationships are validated.
- [ ] Session linkage is validated.
- [ ] Reports are immutable after publication.
- [ ] Certifications persist historically.
- [ ] Internal workflows are stable.
- [ ] Public/private visibility boundaries are verified.
- [ ] Archive/delete behavior protects history.
- [ ] No regression occurs to existing Grow sessions.
- [ ] Source Directory remains shared and global.
- [ ] Public report and badge data derive from approved records.

## 15. Explicit Non-Goals

This document does not include or implement:

- SQL
- Migrations
- Schema edits
- Backend code
- App code
- UI work
- Admin pages
- API implementation
- Row-level security
- Automation
- Breeder/source portal functionality
- Public rollout

This is an engineering execution checklist only.

