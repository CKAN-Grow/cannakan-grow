# CSTP v1 Immutable Snapshot Migration Specification

## 1. Purpose

This document defines the intended implementation specification for the first immutable CSTP snapshot migration before any migration SQL is generated.

This is implementation specification planning only. It does not create migrations, modify live schema, implement reports, implement certifications, expose CSTP publicly, modify operational APIs/UI, add automation, add breeder/source portals, integrate Community Grow, or integrate the Source Directory.

The migration should establish internal immutable snapshot infrastructure only.

## 2. V1 Migration Objective

The v1 immutable snapshot migration should create the first internal database foundation for historical CSTP report evidence.

The migration should enable future internal code to:

- create a report root for a CSTP test
- create versioned immutable snapshot records
- freeze reportable metric values
- freeze linked session references
- preserve audit linkage references
- support publication locking later
- support superseded/amended lineage later

It should not generate reports, publish reports, certify sources, or expose public data.

## 3. Included In V1

V1 includes internal immutable snapshot infrastructure only:

- immutable report root entity
- immutable snapshot entity
- frozen metric entity
- immutable session snapshot reference entity
- immutable audit linkage reference entity
- internal status/version fields
- timestamps for generation/preparation/publication lifecycle planning
- archive/supersession lineage fields
- FK-ready relationships to existing CSTP operational records

## 4. Not Included In V1

V1 explicitly does not include:

- certifications
- certification history
- public visibility rollout
- public report APIs
- public report UI
- report rendering
- report publication UI
- media storage implementation
- new upload systems
- Source Directory integration
- Community Grow integration
- public badges
- public trust scoring
- frontend trust systems
- automation
- notification workflows
- breeder/source portals
- RLS/public policy work
- operational API/UI changes
- report generation helpers

## 5. Entity Responsibilities

### Immutable Report Roots

Responsibility:

- act as the internal parent record for CSTP report preparation
- anchor one report lifecycle to one CSTP test
- provide a stable target for snapshot versions
- coordinate future publication state without storing mutable published evidence

Expected relationships:

- references `cstp_tests`
- may reference `sources`
- may reference a current/prepared/published snapshot record later

Expected conceptual fields:

- `id`
- `cstp_test_id`
- `source_id`
- `current_snapshot_id`
- `status`
- `archived`
- `created_at`
- `updated_at`

Mutable/immutable behavior:

- report root can be mutable while internal
- report root should not overwrite frozen snapshot evidence
- publication state changes must be audit-linked later

### Immutable Snapshot Records

Responsibility:

- preserve one frozen report snapshot version
- hold immutable historical reporting context
- separate future report evidence from mutable CSTP operational data
- support publication locking, supersession, and version lineage

Expected relationships:

- references report root
- references `cstp_tests`
- may reference `sources`
- may reference prior/superseded snapshot records

Expected conceptual fields:

- `id`
- `report_id`
- `cstp_test_id`
- `source_id`
- `snapshot_version`
- `status`
- `locked`
- `generated_at`
- `prepared_at`
- `published_at`
- `supersedes_snapshot_id`
- `superseded_by_snapshot_id`
- `report_schema_version`
- `methodology_version`
- `created_at`

Mutable/immutable behavior:

- unpublished internal snapshot candidates may be superseded by new versions
- published snapshots never mutate
- superseded snapshots remain accessible

### Frozen Metric Records

Responsibility:

- freeze reportable metric values for one snapshot
- preserve calculation context for reproducibility
- prevent public report values from being recalculated from live operational session data

Expected relationships:

- references snapshot
- references report root
- references `cstp_tests`

Expected conceptual fields:

- `id`
- `snapshot_id`
- `report_id`
- `cstp_test_id`
- `metric_key`
- `metric_value`
- `metric_unit`
- `metric_type`
- `numerator`
- `denominator`
- `calculated_at`
- `observation_window_start`
- `observation_window_end`
- `calculation_version`
- `created_at`

Mutable/immutable behavior:

- metric records tied to published snapshots never mutate
- metric correction requires new snapshot lineage later
- certification thresholds are not part of v1

### Immutable Session Snapshot References

Responsibility:

- freeze which CSTP test-session links and Grow sessions were included in a snapshot
- preserve relationship context at generation/publication time
- support reproducible reporting without copying or owning full Grow sessions

Expected relationships:

- references snapshot
- references report root
- references `cstp_tests`
- references `cstp_test_sessions`
- references `grow_sessions`

Expected conceptual fields:

- `id`
- `snapshot_id`
- `report_id`
- `cstp_test_id`
- `cstp_test_session_id`
- `grow_session_id`
- `kan_label`
- `included_in_report`
- `relationship_archived_at_snapshot`
- `session_summary`
- `created_at`

Mutable/immutable behavior:

- session snapshot references tied to published snapshots never mutate
- `grow_sessions` remain canonical operational records
- these records do not create CSTP-owned session forks

### Immutable Audit Linkage References

Responsibility:

- connect report/snapshot records to append-only CSTP admin event history
- prepare for future publication accountability
- preserve traceability between snapshot actions and actor/admin identity

Expected relationships:

- references report root
- references snapshot
- may reference `cstp_admin_events`

Expected conceptual fields:

- `id`
- `report_id`
- `snapshot_id`
- `cstp_admin_event_id`
- `event_role`
- `created_at`

Mutable/immutable behavior:

- audit linkage should remain append-oriented
- report publication should not be considered complete later without audit linkage
- raw audit/admin notes remain internal-only

## 6. Intended Immutability Protections

The migration should support these protections:

- append-only publication lineage
- immutable published snapshot behavior
- superseded snapshot accessibility
- frozen generated/prepared/published timestamps
- frozen metric values
- frozen session relationship references
- no operational mutation coupling
- no public visibility by default
- no report truth stored only in mutable root fields
- no mutation of `grow_sessions`

Enforcement may be split between schema constraints, helper/service rules, and later publication workflow logic. The schema should include the fields necessary for enforcement before public exposure exists.

## 7. Relationship Boundaries

### Operational CSTP Entities Remain Operational

Operational CSTP tables continue to manage internal workflows:

- `cstp_requests`
- `cstp_tests`
- `cstp_test_sessions`
- `cstp_admin_events`

They remain mutable according to internal admin workflow rules.

### Immutable Snapshot Entities Remain Historical

Snapshot entities preserve historical evidence for future reports. They do not replace request, test, session-link, or admin-event operational records.

### Grow Sessions Remain Canonical

`grow_sessions` remain the canonical Grow session records.

Snapshot session references may point to `grow_sessions`, but they must not mutate them, fork them, or become a competing session source of truth.

### Snapshots Never Become Operational Truth Sources

Immutable snapshots preserve report evidence. They should not drive live CSTP test status, request status, session lifecycle, or Grow app session behavior.

## 8. Intended Migration Constraints

The eventual SQL migration should be designed around these conceptual constraints.

### UUID and FK Expectations

Expected ID strategy:

- UUID primary keys
- UUID FKs to existing CSTP/Grow entities
- no guessed FK targets
- confirm exact existing table names before SQL

Expected FK targets:

- `cstp_tests`
- `sources`
- `cstp_test_sessions`
- `grow_sessions`
- `cstp_admin_events`
- future report/snapshot tables introduced in the same migration

### Archive vs Immutable Distinction

Archival should not mean deletion.

Expected distinction:

- `archived` or equivalent internal lifecycle flag may hide records from operational views
- immutable published snapshots remain historically queryable
- archived reports/snapshots should not be removed if they support public or certification history later

### Supersession Linkage Expectations

Snapshot records should support lineage.

Expected concepts:

- version number
- supersedes snapshot reference
- superseded by snapshot reference
- published/current snapshot reference on report root later

### Publication Timestamp Expectations

Timestamp concepts should be explicit.

Expected timestamps:

- generated at
- prepared at
- published at
- created at
- updated at where mutable root records require it

Published snapshot timestamps should become historical evidence and should not be rewritten.

## 9. Implementation Hazards

### Mutable Published Records

Avoid schema or helper behavior that updates published snapshot evidence in place.

### Operational/Report Lifecycle Coupling

Avoid coupling report status so tightly to test status that reporting creates a second operational lifecycle or mutates the test lifecycle.

### Public Exposure Before Snapshot Validation

Avoid public APIs, public UI, badges, Source Directory indicators, or Community Grow filters before snapshot creation, locking, audit linkage, and validation are stable.

### Frontend Trust Authority

Avoid placing report truth, certification eligibility, publication validity, or public trust scoring in frontend code.

### Duplicated Operational Truth Systems

Avoid copying full operational CSTP or Grow session records into report tables and treating the copies as live operational truth.

### Premature Certification Schema

Avoid certification fields/tables until immutable snapshots are validated as historical evidence sources.

### Unsafe Cascading Deletes

Avoid delete behavior that could orphan or destroy snapshot history, metrics, session references, or audit linkage.

## 10. Migration Readiness Verdict

### Ready

- narrow immutable snapshot migration implementation planning
- internal report root schema design
- immutable snapshot schema design
- frozen metric schema design
- immutable session snapshot reference design
- immutable audit linkage reference design
- schema compatibility audit before SQL
- draft migration candidate after review

### Not Ready

- public reporting
- certifications
- public trust systems
- public APIs/UI
- Source Directory integration
- Community Grow integration
- report rendering
- media storage implementation
- automation
- breeder/source portals
- RLS/public policy work

## 11. Final Recommendation

The first immutable CSTP snapshot migration should be drafted only after this specification is reviewed.

The migration should remain internal-only, additive, and focused on immutable snapshot infrastructure. Public reports, certifications, public trust UX, Source Directory integration, Community Grow integration, automation, and breeder/source portals should remain deferred until snapshot persistence, audit linkage, and publication locking are validated.

