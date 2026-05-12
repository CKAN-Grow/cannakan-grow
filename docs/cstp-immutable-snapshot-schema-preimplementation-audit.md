# CSTP Immutable Snapshot Schema Preimplementation Audit

## 1. Purpose

This audit verifies that the planned v1 immutable CSTP snapshot schema slice is safe, minimal, isolated, and ready for future migration planning before any real report/snapshot schema implementation begins.

This is audit and planning only. It does not create migrations, implement schema, implement reports, implement certifications, expose CSTP publicly, modify operational APIs/UI, add automation, add breeder/source portals, integrate Community Grow, or integrate the Source Directory.

## 2. Audit Basis

This audit is based on the current CSTP operational foundation and immutable reporting planning documents:

- `docs/cstp-v1-immutable-snapshot-schema-implementation-plan.md`
- `docs/cstp-report-snapshot-schema-plan.md`
- `docs/cstp-report-publication-workflow-plan.md`
- `docs/cstp-snapshot-generation-pipeline-plan.md`
- `docs/cstp-immutable-reporting-readiness-audit.md`
- current CSTP operational schema and workflows

The current operational CSTP system remains internal/admin-only and supports requests, tests, admin events, and CSTP test-to-grow-session relationships. Immutable reporting should extend that foundation without turning operational records into public report truth.

## 3. Minimal Scope Audit

The proposed v1 snapshot schema slice remains appropriately narrow.

It focuses on internal immutable evidence structures rather than a full reporting product. The planned slice does not attempt to publish reports, certify sources, expose public APIs, render public UI, or integrate public discovery surfaces.

Minimum viable schema responsibilities:

- create report root concepts
- create immutable snapshot concepts
- freeze report metrics
- freeze session relationship summaries
- freeze timestamps and version markers
- plan media/evidence references
- preserve audit lineage
- keep all records internal-only

This is the correct first boundary because it allows CSTP to establish historical evidence storage before building report generation, publication, certifications, or public trust systems.

## 4. Isolation From Operational Workflows

The v1 slice is isolated from existing CSTP operational workflows.

Expected isolation rules:

- no changes to `cstp_requests` behavior
- no changes to `cstp_tests` lifecycle behavior
- no changes to `cstp_test_sessions` relationship behavior
- no changes to existing admin APIs
- no changes to existing admin UI
- no changes to `grow_sessions`
- no new public read path

Future immutable snapshot tables should consume operational CSTP state as input. They should not become the source of truth for request/test/session-link workflow state.

## 5. Immutability Enforcement Expectations

The planned v1 slice correctly treats immutability as a schema and lifecycle boundary.

Expected rules:

- published snapshots never mutate
- draft/prepared snapshots may be regenerated only by creating new versions or replacing unpublished candidates according to a reviewed workflow
- superseded snapshots remain historically accessible
- amendments create new historical records
- frozen metric values are not recalculated from live sessions for published output
- report roots may coordinate state, but frozen evidence belongs to snapshot records
- publication lock fields should exist before any public exposure is implemented

The migration design phase should explicitly decide which fields enforce publication lock, snapshot version, supersession, and archive behavior.

## 6. Append-Only Audit Compatibility

The planned slice is compatible with the existing CSTP append-oriented audit model.

Future report/snapshot audit linkage should support:

- snapshot generation requested
- snapshot generated
- snapshot validation failed
- report prepared
- report published
- report superseded
- amendment prepared
- amendment published

Audit compatibility expectations:

- lifecycle-changing reporting actions create admin events
- publication actions preserve actor/admin identity
- audit failures are visible and not silently ignored
- report publication is not treated as cleanly complete without audit linkage
- audit records remain internal-only in v1

The existing `cstp_admin_events` pattern is ready to extend, but report-specific event types and linkage should be designed before publication implementation.

## 7. Session Compatibility Protection

The v1 slice preserves Grow session compatibility.

Required protections:

- `grow_sessions` remain canonical operational entities
- CSTP snapshots reference session evidence but do not own sessions
- no CSTP-owned session forks
- no mutation of session stage, timeline, analytics, notes, reminders, media, partitions, visibility, or lifecycle fields
- session snapshot records freeze relationship context, not full session ownership
- linked session edits after publication do not change published snapshot evidence

This protects the existing Cannakan Grow session architecture while giving future reports stable historical evidence.

## 8. Reproducibility Expectations

The v1 slice supports reproducible reporting if it freezes enough context.

Required reproducibility concepts:

- report schema/version marker
- CSTP methodology/version marker
- snapshot generated timestamp
- report prepared/published timestamps later
- frozen metric values
- metric numerator/denominator where applicable
- linked session ids
- CSTP test-session link ids
- session inclusion state at snapshot time
- observation window timestamps
- evidence/media references where available
- audit event linkage

The future implementation should avoid snapshots that store only rendered report text without the underlying frozen evidence needed to explain the report.

## 9. Historical Lineage Expectations

The planned slice correctly anticipates report lineage.

Lineage concepts to preserve:

- snapshot version
- previous snapshot id
- supersedes snapshot id
- superseded by snapshot id
- publication audit event id
- amendment/correction reason later
- archived state for internal lifecycle tracking

Historical lineage is required before public trust systems because published reports, corrections, certifications, and source badges must remain traceable over time.

## 10. Future Certification Compatibility

The v1 slice is compatible with future certifications while keeping certifications deferred.

Certification compatibility expectations:

- future certification records should link to immutable report snapshots
- Gold/Silver/Tested-only status should derive from frozen snapshot metrics
- certification history should not overwrite prior outcomes
- retest/renewal/expiration behavior should preserve historical lineage
- no certification status should depend directly on live mutable session state

The v1 slice should avoid hard-coding certification assumptions too early, but it should preserve stable references that future certification tables can use.

## 11. Confirmed Scope

### In Scope

- immutable snapshot entities
- immutable report root concepts
- frozen metric concepts
- frozen timestamp concepts
- frozen linked-session snapshot concepts
- frozen media/evidence reference concepts
- immutable audit linkage concepts
- internal-only visibility planning
- versioning and supersession concepts
- schema implementation strategy before SQL

### Out Of Scope

- public reports
- certifications
- public APIs
- public UI
- public badges
- public trust scoring
- Source Directory integration
- Community Grow integration
- automation
- breeder/source portals
- frontend trust UX
- report generation implementation
- report rendering
- migration execution
- RLS/public policy implementation

The slice remains intentionally narrow.

## 12. Risks Prevented By Narrow Scope

### Mutable Public Reports

By implementing immutable snapshot storage before public report rendering, CSTP avoids public reports that change whenever operational data changes.

### Unstable Publication Workflow

By delaying publication implementation, CSTP can define snapshot records, versioning, locks, and audit linkage before any publish action exists.

### Premature Public Trust Exposure

By excluding public APIs/UI, certifications, Source Directory badges, and Community Grow filters, CSTP avoids public trust claims before historical evidence is stable.

### Duplicated Lifecycle Systems

By keeping report snapshots separate from operational lifecycle records, CSTP avoids creating a second request/test lifecycle engine.

### Operational/Report Coupling

By freezing report evidence into snapshot records, CSTP avoids public reports that are live projections of mutable operational tables.

### Grow Session Mutation

By treating `grow_sessions` as canonical references, CSTP avoids report generation that rewrites session truth or creates CSTP-owned session forks.

### Frontend Trust Logic

By keeping reporting truth in internal schema/helpers, CSTP avoids frontend code deciding publication validity, certification eligibility, or report trust status.

## 13. Implementation Readiness Verdict

### Ready

- narrow immutable snapshot schema implementation planning
- internal-only report root and snapshot schema design
- frozen metric schema design
- frozen linked-session snapshot design
- frozen timestamp and versioning design
- immutable audit linkage design
- internal-only snapshot generation helper planning later
- schema compatibility review before SQL

### Not Ready

- certifications
- public reporting
- public report APIs
- public report UI
- public trust scoring
- Source Directory CSTP exposure
- Community Grow CSTP exposure
- breeder/source portal access
- automation
- browser/public trust UX
- production publication workflow

## 14. Recommended Next Implementation Sequence

Recommended sequence:

1. Minimal snapshot schema migration planning
2. Draft executable-quality migration candidate in a drafts folder only
3. Existing schema compatibility audit
4. Local isolated migration validation
5. Internal snapshot assembly helper planning
6. Frozen metric extraction helper planning
7. Immutable session summary extraction helper planning
8. Media/evidence reference helper planning
9. Immutable publication locking design
10. Report-specific audit linkage design
11. Immutable report generation later
12. Certifications later
13. Public exposure later

The next step should be migration scope definition, not SQL execution and not report generation.

## 15. Final Assessment

The v1 immutable snapshot schema slice is safe to advance into a narrow migration-scope planning document.

It is minimal, internal-only, isolated from operational workflows, compatible with append-only audit lineage, protective of `grow_sessions`, and aligned with future certification needs without implementing certifications prematurely.

No public CSTP exposure, report rendering, certification logic, Source Directory integration, Community Grow integration, automation, or breeder/source portal work should begin from this audit.

