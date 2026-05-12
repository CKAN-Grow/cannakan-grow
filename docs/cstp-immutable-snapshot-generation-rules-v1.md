# CSTP Immutable Snapshot Generation Rules v1

## 1. Purpose

This document defines the authoritative v1 rules for generating immutable CSTP report snapshots from operational CSTP data.

This is a systems-definition document only. It does not modify migrations, implement snapshot generation, implement report rendering, implement certifications, expose CSTP publicly, modify APIs/routes, modify UI, add automation, add Source Directory integration, add Community Grow integration, add breeder/source portals, or add RLS/public policies.

The purpose of these rules is to make future snapshot generation deterministic, internally auditable, and historically trustworthy before any public CSTP surface exists.

## 2. Source-of-Truth Boundaries

### grow_sessions Remain Operational Truth

`grow_sessions` remain the canonical Grow session records.

Snapshot generation may read selected session evidence through CSTP test-session links, but it must not:

- mutate `grow_sessions`
- fork Grow sessions into CSTP-owned sessions
- replace Grow session lifecycle, timeline, stage, note, media, reminder, partition, ownership, visibility, or analytics behavior
- treat report session snapshot rows as live session records

### CSTP Operational Tables Remain Mutable Working Data

The operational CSTP tables remain the internal workflow source of truth:

- `cstp_requests`
- `cstp_tests`
- `cstp_test_sessions`
- `cstp_admin_events`

These records may continue to change according to internal admin workflow rules after a snapshot is generated.

Operational state changes after generation must not rewrite historical snapshot evidence.

### Immutable Snapshot Tables Preserve Historical Evidence

The immutable snapshot tables preserve report evidence at generation, preparation, and future publication boundaries:

- `cstp_reports`
- `cstp_report_snapshots`
- `cstp_report_metrics`
- `cstp_report_sessions`
- `cstp_report_audit_links`

Snapshot records are historical evidence records. They are not operational truth and must not drive live CSTP request/test/session workflow state.

### Reports Must Not Render Live Operational Values After Snapshot Generation

Once a report snapshot exists, any future report rendering must read reportable values from immutable snapshot records, not from live joins against `cstp_requests`, `cstp_tests`, `cstp_test_sessions`, or `grow_sessions`.

Operational tables may be used to generate a new snapshot version. They must not be used to silently alter an existing snapshot's reportable output.

## 3. Snapshot Generation Lifecycle

### Draft Report Preparation

A draft report root may be created for one CSTP test when internal staff begin report preparation.

The report root may coordinate internal workflow state, but it must not become the only place where frozen evidence lives. Frozen evidence belongs to snapshot and child evidence records.

Draft preparation may read current operational data to determine whether a snapshot can be generated.

### Snapshot Generation Event

A snapshot generation event creates a new `cstp_report_snapshots` row and associated frozen evidence rows.

Generation must:

- assign the next deterministic `snapshot_version` for the report
- record `generated_at`
- copy only approved frozen evidence into snapshot structures
- create metric rows for all reportable metrics available in v1
- create session rows for linked CSTP test sessions considered by the snapshot
- preserve audit linkage through `cstp_report_audit_links` when an admin event or actor is available

Generation should be treated as a historical boundary. A later code path may reject, archive, or supersede a snapshot, but it must not destructively rewrite generated evidence.

### Snapshot Versioning

Snapshot versions are scoped to a report root.

Rules:

- The first generated snapshot for a report uses version `1`.
- Each regeneration creates a new integer version.
- Versions must be monotonic within a report.
- Version numbers must not be reused after archival, rejection, or supersession.
- Version history must remain queryable.

### Supersession Flow

When a snapshot is replaced by a corrected or regenerated snapshot, the new snapshot must preserve lineage to the prior snapshot.

Expected lineage behavior:

- the new snapshot records `supersedes_snapshot_id`
- the prior snapshot records `superseded_by_snapshot_id` when workflow rules allow that update
- superseded snapshots remain retained
- supersession must not delete metrics, session references, or audit links from the prior snapshot

Supersession changes report interpretation. It must not erase history.

### Report Regeneration Rules

Report regeneration means creating a new snapshot version from current operational data.

Regeneration is appropriate when:

- operational CSTP data changed before publication preparation
- linked session selection changed
- metric calculation rules were corrected
- source/request/test metadata needs a newly frozen representation
- prior snapshot validation failed and a new evidence boundary is needed

Regeneration must not update frozen metric/session payloads in an existing snapshot in place.

### Publication Preparation

Publication preparation is an internal readiness state only in v1.

When a snapshot is prepared for future publication:

- `prepared_at` must reflect the preparation time
- prepared state must be audit-linked when possible
- the prepared snapshot must be the source for any later rendering or publication workflow
- report root state may point to the prepared snapshot, but frozen evidence remains on the snapshot and child rows

No public report, public route, public API, public visibility, certification, badge, PDF, or external verification behavior is defined by this document.

### Finalized Immutable State Behavior

A finalized snapshot is one that has reached a locked internal state, future published state, or superseded historical state.

Finalized snapshots must be treated as historical evidence:

- no destructive edits
- no metric recalculation in place
- no replacement of session references in place
- no timestamp rewriting
- no deletion to hide workflow history
- corrections proceed through new snapshot lineage

## 4. Frozen Data Requirements

Snapshot generation must freeze enough information to reproduce what the report evidence meant at generation time.

### Germination Metrics

Frozen germination metrics should include reportable values such as:

- total seeds tested
- successfully germinated count
- non-germinated count within the observation window
- observed germination rate
- numerator and denominator used for rate calculations
- reportability or completeness markers when represented as metric payload context

Each metric must include a stable `metric_key`, `metric_type`, `metric_value`, and calculation context when available.

### Timing Metrics

Frozen timing metrics should include:

- observation window start
- observation window end
- first germination observation time when available
- final observation time when available
- calculated timing intervals when future methodology requires them

Timing values must be recorded with explicit timestamps or structured JSON values. Future rendering must not infer timing output from mutable live session data after generation.

### Environmental Metadata

Environmental metadata may be frozen when available and relevant to the CSTP methodology version.

Examples include:

- controlled-condition summary
- observation cadence
- device or environment context that is safe for internal report evidence
- methodology-specific environmental notes

Environmental metadata is evidence context. It is not certification logic in v1.

### Session Summaries

Session summary payloads must preserve selected report-relevant session context without copying the full Grow session model.

Session summaries may include:

- KAN label at generation time
- inclusion state
- relationship archived state at generation time
- session timing summary
- reportable observation summary
- structured notes needed for reproducibility

Private notes and admin-only interpretation must not be copied into future public-safe payloads without a separate approved publication rule.

### Linked Grow Session References

Each included or considered session relationship must preserve:

- `cstp_test_session_id`
- `grow_session_id`
- `cstp_test_id`
- `snapshot_id`
- `report_id`
- `included_in_report`
- `relationship_archived_at_snapshot`

These references preserve evidence lineage. They do not make CSTP the owner of the Grow session.

### Source Metadata At Generation Time

When a source is associated with the CSTP test or request, snapshot generation should freeze the source identity needed to understand the snapshot later.

Source metadata may include:

- source id
- source name or canonical label at generation time
- breeder/source relationship context when already present in operational CSTP data
- public-safe source descriptors only when later approved by a public reporting layer

Source Directory exposure remains deferred.

### CSTP Request And Test Metadata

Snapshot generation should freeze selected request/test metadata needed for historical context:

- `cstp_request_id`
- `cstp_test_id`
- request status at generation time
- test status at generation time
- variety name
- seed type
- breeder name
- batch or lot
- requested seed count when relevant
- test started/completed timestamps when available
- archived state at generation time

This metadata explains the snapshot. It must not become a replacement request/test lifecycle.

### Audit References

Snapshot generation should preserve audit linkage using `cstp_report_audit_links`.

Audit linkage should identify:

- report creation
- snapshot generation
- snapshot preparation
- publication preparation
- supersession
- validation failure

Where an existing `cstp_admin_events` row exists, the audit link should reference it. Where only actor identity exists, the link should preserve the actor through `created_by` according to the schema.

Raw admin notes remain internal-only.

### Internal Notes Handling Rules

Internal notes require special handling.

Rules:

- private contact details must not be frozen into public-facing payload sections
- admin notes may be referenced internally for traceability but should not be copied into reportable output payloads by default
- future public rendering must use explicitly approved public-safe fields only
- any internal note included in a snapshot must be marked as internal context, not public report copy

## 5. Immutability Rules

### Immutable After Generation

Once a snapshot version and its child evidence rows are generated, they should be treated as immutable evidence.

If data is incomplete or incorrect, the preferred correction is a new snapshot version, not in-place mutation.

### Immutable After Publication

Published snapshots must never be changed in place.

Publication makes the evidence boundary stronger, but not conceptually different: the report output must remain traceable to the snapshot values that existed at publication time.

### No Destructive Edits

Future implementation must avoid destructive edits to:

- snapshot rows
- metric rows
- session reference rows
- audit links
- lineage references

Archive and supersession states should be used instead of deletion.

### Supersession Instead Of Mutation

Corrections, amendments, recalculations, and regenerated reports must create new snapshot lineage.

The old snapshot remains part of the historical record. The new snapshot explains what replaced it.

### Lineage Preservation Requirements

Lineage must preserve:

- report id
- snapshot id
- snapshot version
- supersedes snapshot id
- superseded by snapshot id
- generated/prepared/published timestamps
- audit links for generation, preparation, publication, validation failure, and supersession where available

Historical lineage must remain queryable even if operational records later change.

### Historical Reproducibility Expectations

A future reviewer should be able to answer:

- what data was included in the snapshot
- which sessions were considered
- which metrics were frozen
- which calculation version was used
- when the snapshot was generated
- who or what process initiated the snapshot action when audit data exists
- whether a later snapshot superseded it

## 6. Snapshot Integrity Protections

### Timestamp Consistency

Snapshot timestamps must be internally consistent:

- `generated_at` is the evidence capture boundary
- `prepared_at` must not precede `generated_at`
- `published_at` must not precede `prepared_at`
- `created_at` records row creation and should not be used as a substitute for lifecycle timestamps

Future code must not rewrite lifecycle timestamps to make history appear cleaner.

### Deterministic Metric Calculations

Metric generation must be deterministic for a given set of operational inputs and calculation version.

Future implementation should define:

- stable input selection order
- stable inclusion/exclusion rules
- stable rounding rules
- stable null and missing-data handling
- stable observation window boundaries
- stable calculation version labels

If calculation rules change, new snapshots should record the new calculation version.

### Prohibited Recalculation Scenarios

Existing snapshot metrics must not be recalculated in place because:

- a linked Grow session was edited
- a CSTP test-session link was archived
- request or source metadata changed
- a new methodology version was introduced
- a report renderer changed
- a future certification rule changed
- a public display surface needs different formatting

Those scenarios require a new snapshot, a rendering-only change that reads the existing snapshot, or a future supersession workflow.

### Evidence Retention Philosophy

Snapshot evidence should be retained even when it becomes stale, superseded, archived, or no longer public-eligible in a future workflow.

Evidence retention favors:

- historical explainability
- internal auditability
- reproducibility
- safe correction history

It does not imply public exposure.

### Orphan Prevention Expectations

Snapshot records should retain FK relationships to operational records where possible, and deletion of operational records should not destroy snapshot evidence.

Future workflows should prefer:

- archiving operational records instead of deleting them
- restricting deletes where historical evidence depends on a row
- using nullable references only where early intake or source matching requires it
- preserving snapshot child rows with their parent snapshot

### Handling Deleted Or Changed Operational Records After Generation

If operational records change after snapshot generation, the snapshot remains unchanged.

Expected behavior:

- changed `grow_sessions` do not alter frozen session summaries
- changed CSTP test-session links do not alter `cstp_report_sessions`
- changed source/request/test metadata does not alter frozen snapshot payloads
- archived operational records remain historically referenced where FKs allow
- deleted operational records should be avoided when snapshot history depends on them

If a change materially affects report evidence, future code should generate a new snapshot version and preserve lineage.

## 7. Future Compatibility Placeholders

The following systems are deferred. They may later consume immutable snapshots, but this document does not design or implement them:

- public certification rendering
- PDF/export rendering
- public report visibility
- Source Directory integration
- Community Grow integration
- badge systems
- public verification endpoints
- public report APIs
- public report UI
- report media rendering

Future systems must read from immutable snapshots rather than from live operational CSTP/Grow joins when presenting report evidence.

## 8. Explicit Non-Goals

This document does not define:

- UI
- APIs
- routes
- rendering engine
- PDF/export engine
- automation
- moderation
- public visibility
- public read policies
- RLS policies
- certification qualification logic
- certification schema
- badge eligibility
- breeder/source accounts
- Source Directory behavior
- Community Grow behavior
- snapshot generation code
- database migrations

## 9. Implementation Guardrails For Future Work

Future implementation should treat this document as a behavioral contract.

Before writing snapshot generation code, engineering should define:

- exact operational read query boundaries
- exact metric calculation formulas
- exact metric keys
- exact frozen payload shapes
- exact audit event creation/linkage behavior
- exact allowed state transitions
- exact validation failures that prevent generation
- exact supersession workflow

Those future implementation details must remain internal-only until public reporting and certification systems are separately approved.

## 10. Final Rule

Immutable CSTP snapshots are generated evidence boundaries.

They may be superseded, archived, or used by future rendering systems, but they must not be silently rewritten to follow mutable operational data. Historical trust comes from preserving what was generated, when it was generated, what inputs it used, and how later corrections relate to it.
