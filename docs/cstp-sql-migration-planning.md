# CSTP SQL Migration Planning

## 1. Purpose

This document defines the safe SQL migration planning strategy for the Cannakan Seed Testing Program (CSTP) before any migrations are written or run. It bridges the CSTP schema definition planning work and future Supabase SQL implementation.

This migration planning document is informed by:

- `docs/cstp-standard-report-schema-reporting-framework.md`
- `docs/cstp-session-architecture-alignment-specification.md`
- `docs/cstp-relational-data-planning-specification.md`
- `docs/cstp-supabase-schema-planning-specification.md`
- `docs/cstp-supabase-schema-definition-draft.md`
- `docs/cstp-implementation-roadmap-specification.md`

Migration planning must happen before SQL because CSTP will touch durable certification history, report publication, Source Directory trust signals, and existing Grow App session evidence. A migration mistake in this area could affect normal session behavior, orphan report records, weaken certification history, or expose unfinished CSTP data publicly.

The primary migration constraint is protecting the existing Grow App session system. CSTP should link to sessions and sources through additive structures rather than changing how normal sessions work.

This is not an implementation document. It does not contain SQL, migrations, schema edits, RLS policies, app code, routes, UI changes, or backend integration.

## 2. Migration Principles

- Add CSTP tables before touching shared systems.
- Avoid breaking existing sessions, sources, observations, images, or metrics.
- Keep CSTP internal-only during early migration phases.
- Preserve report and certification history.
- Prefer additive migrations over destructive migrations.
- Avoid destructive changes to existing Grow App tables.
- Do not require a session migration for initial CSTP foundation work.
- Protect published reports from mutable live session data.
- Avoid cascading deletes that could destroy certification or report history.
- Delay public publishing and Source Directory exposure until table behavior is validated.
- Delay RLS enforcement until access patterns and public/private boundaries are reviewed.

## 3. Recommended Migration Order

### Phase 1 - Independent CSTP Foundation Tables

**Tables:**

- `cstp_requests`
- `cstp_tests`
- `cstp_admin_events`

**Purpose:**

Create the internal CSTP foundation first. These tables support intake, parent test records, and administrative audit events without requiring changes to existing sessions.

**Safety Notes:**

- Keep these records internal-only.
- Avoid public visibility by default.
- Reference sources where appropriate, but do not alter Source Directory behavior.
- Do not publish badges, reports, or certification states in this phase.

### Phase 2 - Session Linkage Tables

**Tables:**

- `cstp_test_sessions`
- Relationships to existing `sessions`

**Purpose:**

Add the join layer that links CSTP Tests to normal session records. This enables parent/child CSTP orchestration and multi-KAN grouping without duplicating session logic.

**Safety Notes:**

- Existing sessions should continue functioning unchanged.
- Linking a session to a CSTP Test should not alter normal session behavior.
- Avoid required backfills for existing sessions.
- Validate that removing or archiving a CSTP link does not delete the underlying session.

### Phase 3 - Report Tables

**Tables:**

- `cstp_reports`
- `cstp_report_snapshots`
- `cstp_report_assets`

**Purpose:**

Create the reporting layer that can prepare and preserve report data generated from linked sessions.

**Safety Notes:**

- Public pages should eventually read from snapshots, not live sessions.
- Draft reports should remain private.
- Published snapshots should be treated as immutable.
- Report assets should preserve approved media references without exposing raw private media by accident.

### Phase 4 - Certification Tables

**Tables:**

- `cstp_certifications`
- `source_certification_history`

**Purpose:**

Create durable certification and source-history records after report snapshot behavior is established.

**Safety Notes:**

- Certification renewals should not overwrite historical certifications.
- Expired, revoked, superseded, or replaced certifications should remain queryable.
- Source history should reference existing sources rather than duplicating source identity.
- Do not expose public badges until certification visibility behavior is validated.

### Phase 5 - Optional Source Enhancements

**Tables or Fields:**

- Optional source badge/status fields if needed
- Optional tested-source display helpers if needed

**Purpose:**

Add Source Directory optimization fields only after the public publishing model is stable.

**Safety Notes:**

- Source Directory remains shared and global.
- CSTP enhancements should derive from approved certification/report records.
- Avoid storing public source status in a way that can drift from certification history.
- Do not add source-facing badge fields until the canonical certification source is clear.

### Phase 6 - Future RLS / Policies

**Scope:**

- Planning only
- Future access policies for users, admins, public readers, and possible breeder/source representatives

**Purpose:**

RLS should come after table behavior and query needs are validated. Public/private boundaries should be stable before policies enforce them.

**Safety Notes:**

- Public readers should eventually access only approved published CSTP data.
- Admins should manage CSTP workflow data.
- Users should retain ownership of normal sessions.
- Breeder/source access should wait for a future portal model.

## 4. Dependency Graph

Recommended dependency flow:

```text
sources
└── cstp_tests
    ├── cstp_admin_events
    ├── cstp_test_sessions
    │   └── sessions
    ├── cstp_reports
    │   ├── cstp_report_snapshots
    │   └── cstp_report_assets
    └── cstp_certifications
        └── source_certification_history
```

Conceptual dependencies:

- `sources` may be referenced by CSTP requests, tests, certifications, and source history.
- `sessions` remain existing child evidence records and are linked through `cstp_test_sessions`.
- `cstp_tests` act as parent orchestration records.
- `cstp_test_sessions` depends on both `cstp_tests` and `sessions`.
- `cstp_reports` depends on `cstp_tests`.
- `cstp_report_snapshots` depends on `cstp_reports`.
- `cstp_report_assets` depends on report snapshots and may reference session/media assets.
- `cstp_certifications` depends on `cstp_tests` and may reference report snapshots.
- `source_certification_history` depends on sources, certifications, and optionally reports.

## 5. Existing Session Compatibility

Existing sessions should continue functioning unchanged throughout initial CSTP migration work. CSTP should link to sessions rather than altering session behavior.

Initial CSTP foundation work should not require:

- Session table rewrites
- Session data backfills
- Changes to session stage logic
- Changes to partition chart behavior
- Changes to observation storage
- Changes to image or snapshot handling
- Changes to session ownership or visibility rules

CSTP session linkage should be additive. A normal session should remain valid whether or not it is linked to a CSTP Test.

## 6. Foreign Key Strategy

Foreign key planning should prioritize data integrity without creating unsafe deletion behavior.

Recommended strategy:

- Start with safe relationships that preserve parent/child integrity.
- Avoid cascading deletes from sources, sessions, reports, or tests into published certification history.
- Prefer archive or soft-delete behavior where public trust history matters.
- Protect published reports from orphaned references.
- Allow administrative fallback states for unavailable, archived, superseded, withdrawn, or deleted upstream records.
- Avoid schema behavior that deletes report snapshots when a live session is removed.

Published report snapshots and certification history should remain durable even if linked operational records are later archived or hidden.

## 7. Rollback Considerations

Additive migrations are easier to roll back because they introduce isolated CSTP structures without rewriting existing Grow App data.

Rollback planning should assume:

- Public data should not be published until rollback risk is reduced.
- Internal-only CSTP tables can be tested first.
- Early CSTP records should be disposable or archiveable during staging validation.
- Destructive migrations should be avoided.
- Existing session tables should not be altered for initial CSTP foundation work.
- Irreversible data transformations should be delayed until the model is proven.

If a rollback is required during internal-only phases, the goal should be to remove or disable CSTP-specific structures without affecting existing sessions or Source Directory behavior.

## 8. Staging / Testing Strategy

Migrations should run in staging before production.

Staging validation should confirm:

- Existing sessions still load, save, update, and complete normally.
- Existing Source Directory behavior remains unchanged.
- CSTP Tests can be created as parent records.
- Sessions can be linked to CSTP Tests through the join layer.
- Multi-KAN grouping can be represented without duplicating sessions.
- Report snapshot immutability can be enforced conceptually and operationally.
- Certification history can persist across renewal, expiration, revocation, and replacement.
- Public/private visibility boundaries are respected.
- Failed, draft, internal, and unpublished CSTP data does not appear in public query paths.
- Archive behavior does not break linked sessions or published report references.

Testing should start with internal-only data and avoid public Source Directory or Community Grow exposure until later phases.

## 9. Production Deployment Sequence

Recommended production sequence:

1. Deploy CSTP tables first.
2. Keep CSTP hidden and internal.
3. Test admin-only data workflows.
4. Validate CSTP Test creation and session linkage.
5. Validate report snapshot generation and freezing behavior.
6. Validate certification records and history persistence.
7. Enable internal reporting workflows.
8. Enable limited public report publishing.
9. Enable Source Directory badge/report integration.
10. Enable Community Grow discovery only after public states are stable.

Public publishing should be last, not first. The production database can support CSTP internally before any user-facing behavior changes.

## 10. Risk Areas

### Breaking Existing Sessions

Changing session tables or session behavior too early could destabilize the Grow App. Initial CSTP work should avoid session mutations.

### Duplicate Session Logic

Creating CSTP-specific session data structures would fragment observations, device behavior, stages, partition metrics, and analytics.

### Orphaned Child Sessions

Unsafe relationship or delete behavior could leave CSTP Tests pointing to missing sessions or remove sessions that should remain valid.

### Mutable Public Reports

If public reports read live session data directly, published values could change unexpectedly after publication.

### Overwritten Certifications

Renewal, expiration, or revocation logic must not overwrite historical certification records.

### Unsafe Cascades

Cascading deletes could destroy report snapshots, certifications, or source history that should remain durable.

### Premature Public Exposure

Draft, failed, invalid, internal, or unpublished CSTP records should not appear in Source Directory, Community Grow, or public report routes.

### RLS Mistakes

Policies introduced before access patterns are stable could either expose private data or block legitimate admin workflow. RLS should be planned carefully after table behavior is validated.

## 11. Explicit Non-Goals

This document does not include or implement:

- SQL
- Migrations
- Schema edits
- App integration
- Backend changes
- UI changes
- Route changes
- Row-level security implementation
- Public rollout
- Automation
- Breeder/source portal functionality

This is a migration-planning document only.

## 12. Final Recommendation

Migration work should begin only after this plan is reviewed. The first actual CSTP implementation should be additive, internal-only, and isolated from public features.

The safest first step is to introduce CSTP-owned tables that do not change existing session behavior. Session linkage, report snapshots, certification history, Source Directory integration, RLS, automation, and public publishing should follow in controlled phases after staging validation.

The migration strategy should protect three things above all: the existing Grow App session system, immutable public report history, and durable certification records.

