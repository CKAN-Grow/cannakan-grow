# CSTP Report Lifecycle State Machine v1

## 1. Purpose

This document defines the authoritative internal CSTP report lifecycle state machine and governance rules for immutable CSTP reports and snapshots.

This is a systems-definition and implementation-planning document only. It does not modify migrations, modify `app.js`, modify APIs/routes, modify UI, implement services/functions, implement rendering, implement certifications, expose CSTP publicly, add automation, add Community Grow integration, add Source Directory integration, add breeder/source portals, or add RLS/public policies.

The lifecycle model governs how future backend code should move internal report roots and immutable snapshots through preparation, verification, publication readiness, supersession, and archival without mutating historical evidence.

## 2. Lifecycle Vocabulary And Storage Alignment

The authoritative governance vocabulary for v1 planning is:

- `draft`
- `preparing`
- `prepared`
- `integrity_failed`
- `published_internal`
- `superseded`
- `archived_internal`

The existing immutable snapshot migration stores a narrower internal database status vocabulary. In `cstp_reports`, the stored values are `draft`, `preparing`, `prepared`, `published`, `superseded`, and `archived`. In `cstp_report_snapshots`, the stored values are `draft`, `generated`, `prepared`, `published`, `superseded`, and `archived`.

Before implementation, engineering must either:

- map governance state `published_internal` to stored status `published`
- map governance state `archived_internal` to stored status `archived`
- represent `integrity_failed` through audit linkage and non-persistence of invalid candidates until a reviewed schema change supports a stored failure status

This document does not alter the migration. It defines the intended lifecycle governance rules future code must respect.

## 3. Authoritative Report Lifecycle States

### draft

`draft` means an internal report root exists or is being selected for a CSTP test, but no finalized snapshot evidence has been prepared.

Intent:

- allow internal staff or future services to begin report work
- permit operational data collection
- permit initial snapshot generation
- avoid public exposure

Draft records remain internal working records.

### preparing

`preparing` means the report is actively assembling or validating snapshot evidence.

Intent:

- signal that a snapshot generation attempt is underway
- prevent conflicting concurrent generation attempts
- allow integrity verification before a prepared state exists
- keep report root state mutable while frozen evidence is being assembled

Preparing state must not be treated as reportable output.

### prepared

`prepared` means a snapshot has passed internal integrity verification and is ready for a future internal publication step.

Intent:

- identify the snapshot that future rendering or publication workflows should use
- preserve `prepared_at`
- preserve audit linkage for preparation
- prevent casual regeneration from overwriting prepared evidence

Prepared is still internal-only. It does not expose a public report or certification.

### integrity_failed

`integrity_failed` means a snapshot candidate or generated internal snapshot failed required integrity checks.

Intent:

- record that assembly or verification rejected the candidate
- prevent invalid evidence from being treated as prepared
- preserve failure traceability through audit events where possible
- require remediation before regeneration

If failure occurs before persistence, no immutable snapshot should be written. If failure occurs after a generated snapshot exists, the snapshot should be retained as internal historical evidence and excluded from publication readiness.

### published_internal

`published_internal` means a snapshot is locked as the internally published evidence source for a report.

Intent:

- mark the chosen immutable snapshot as finalized for internal report truth
- require `published_at`
- require publication audit linkage when available
- prohibit in-place mutation of report evidence
- prepare for future public systems without exposing the report publicly

This state is internal-only. It is not public visibility.

### superseded

`superseded` means a report or snapshot has been replaced by a newer snapshot lineage.

Intent:

- preserve historical evidence
- show that a newer snapshot is the current internal evidence source
- link old and new snapshots through supersession fields
- prevent deleted or overwritten corrections

Superseded evidence remains queryable.

### archived_internal

`archived_internal` means a report or snapshot is retained but removed from normal active internal workflows.

Intent:

- preserve historical records without presenting them as active
- avoid destructive deletion
- keep audit and lineage traceability
- support future review of rejected, obsolete, or administrative records

Archive state does not imply public withdrawal because public visibility is deferred.

## 4. Valid Lifecycle Transitions

### Allowed Transitions

The authoritative allowed report-level transitions are:

```text
draft -> preparing
draft -> archived_internal
preparing -> prepared
preparing -> integrity_failed
preparing -> archived_internal
integrity_failed -> preparing
integrity_failed -> archived_internal
prepared -> preparing
prepared -> published_internal
prepared -> archived_internal
published_internal -> superseded
published_internal -> archived_internal
superseded -> archived_internal
archived_internal -> preparing
```

The `archived_internal -> preparing` transition is allowed only for internally archived draft or failed report roots where no published internal evidence would be rewritten.

### Prohibited Transitions

The following transitions are prohibited:

- `published_internal -> draft`
- `published_internal -> preparing` on the same snapshot
- `superseded -> published_internal` on the same snapshot
- `archived_internal -> published_internal` without renewed preparation and verification
- `integrity_failed -> published_internal`
- `draft -> published_internal`
- `preparing -> published_internal`

Any shortcut that bypasses integrity verification is prohibited.

### Rollback Expectations

Rollback is allowed only before immutable evidence is persisted or before a state transition is committed.

Expected rollback behavior:

- failed assembly rolls back to the previous stable report state
- partial snapshot persistence rolls back entirely
- current snapshot pointers are not updated without a valid snapshot
- supersession pointers are not updated without a valid successor
- audit links do not claim success for rolled-back work

Rollback must not be used to erase persisted historical evidence.

### Supersession Flow Behavior

Supersession replaces the current internal evidence source with a newer snapshot version.

Required flow:

1. start from `published_internal` or `prepared`
2. enter `preparing` for the successor snapshot
3. generate a new snapshot version
4. verify integrity
5. move successor to `prepared` or `published_internal`
6. mark the prior snapshot as `superseded`
7. preserve `supersedes_snapshot_id` and `superseded_by_snapshot_id`
8. preserve audit linkage for the supersession

Supersession must never delete prior metrics, session references, or audit links.

### Regeneration Flow Behavior

Regeneration creates a new snapshot version from current operational data.

Regeneration is allowed from:

- `draft`
- `preparing`
- `integrity_failed`
- `prepared`
- `archived_internal` only when no internally published evidence would be rewritten

Regeneration is not allowed by mutating an existing snapshot in place.

### Publication Readiness Requirements

A report may move to `published_internal` only when:

- a prepared snapshot exists
- the snapshot passed integrity verification
- the snapshot has a valid version number
- the snapshot belongs to the report root
- lifecycle timestamps are valid
- required operational references exist
- audit linkage exists or a documented internal exception is recorded
- no unresolved integrity failure applies to the prepared snapshot

Publication readiness is internal-only. It does not create public access.

## 5. Immutable State Protections

### States That Become Immutable

Snapshot evidence becomes immutable once generated. The protection becomes stricter in these states:

- `prepared`
- `published_internal`
- `superseded`
- `archived_internal`

The report root may coordinate state, but frozen evidence belongs to the snapshot and child rows.

### Prohibited Mutations After Publication

After `published_internal`, future implementation must not:

- update frozen metric values
- update frozen session summaries
- replace linked session references
- rewrite generated/prepared/published timestamps
- change calculation versions in place
- remove audit links
- delete prior evidence
- recalculate report output from live operational data

Corrections must create new snapshot lineage.

### Supersession-Only Correction Philosophy

Corrections, amendments, methodology fixes, operational data corrections, and metric recalculations must create a new snapshot version.

The old snapshot remains retained. The new snapshot explains what changed and what it replaces.

### Lineage Preservation Requirements

Lineage must preserve:

- report id
- CSTP test id
- request and source references where available
- snapshot id
- snapshot version
- superseded and superseding snapshot ids
- generated/prepared/published timestamps
- audit links
- metric and session child records

Lineage must remain queryable across all lifecycle states.

### Historical Evidence Retention Rules

Historical evidence must be retained for:

- prepared snapshots
- internally published snapshots
- superseded snapshots
- archived internal snapshots
- generated snapshots that later fail verification

Deletion should not be used as normal lifecycle handling.

## 6. Snapshot Lifecycle Governance

### Snapshot Version Increment Rules

Snapshot versions are scoped to one report root.

Rules:

- version `1` is the first generated snapshot for a report
- each new generation increments the version
- versions are never reused
- superseded and archived versions still count as used
- failed persisted snapshots still count as used

### Single-Active-Lineage Expectations

Each report should have one active current lineage.

Expectations:

- only one snapshot should be the current prepared or internally published evidence source
- superseded snapshots remain historical
- archived snapshots are inactive
- failed snapshots are inactive
- report root current snapshot pointers should not hide lineage

### Duplicate Snapshot Prevention

Future implementation must prevent:

- duplicate snapshot versions for one report
- duplicate metric keys within one snapshot
- duplicate CSTP test-session references within one snapshot
- concurrent preparation paths that produce competing active snapshots
- repeated publication of the same report root without explicit lineage handling

### Regeneration Expectations

Regeneration is a new generation event, not an update event.

Regeneration must:

- read current operational data
- calculate deterministic metrics
- create a new snapshot version
- preserve prior snapshot evidence
- link supersession when replacing a prepared or internally published snapshot
- record audit linkage when available

### Integrity Failure Handling

Integrity failures must prevent publication readiness.

Failure handling should:

- stop persistence when failure occurs before snapshot creation
- preserve generated evidence when failure is discovered after creation
- link a validation failure audit event when available
- require remediation and regeneration before preparation

### Orphan Snapshot Prevention

Snapshots must not exist without a valid report root and CSTP test relationship.

Future implementation must reject or remediate:

- snapshot report id mismatch
- snapshot CSTP test id mismatch
- missing Grow session for included session evidence
- session reference belonging to another CSTP test
- supersession target belonging to another report
- audit link belonging to unrelated report/test context

## 7. Administrative Governance Expectations

### Admin Accountability

Lifecycle-changing actions should preserve an actor or admin event when available.

Expected accountable actions:

- report creation
- snapshot generation
- integrity failure
- preparation
- internal publication
- supersession
- archival

Admin accountability remains internal-only.

### Audit Linkage

Report lifecycle actions should link to `cstp_admin_events` through `cstp_report_audit_links` when an event exists.

Audit links should identify:

- event role
- report id
- snapshot id when applicable
- CSTP admin event id when available
- actor reference when direct actor context is used
- creation timestamp

Raw admin notes must remain internal.

### Timestamp Recording

Lifecycle timestamps must be recorded explicitly.

Expected timestamps:

- `generated_at` for snapshot evidence capture
- `prepared_at` for internal readiness
- `published_at` for internal publication lock
- `created_at` for row creation
- `updated_at` only for mutable report-root coordination

Timestamps must not be rewritten to conceal lifecycle history.

### Operational Traceability Philosophy

Reports and snapshots must trace back to operational CSTP data without becoming operational truth.

Traceability should preserve:

- request id when available
- CSTP test id
- CSTP test-session ids
- Grow session ids
- source id when available
- admin event ids where available

Operational records may change after a snapshot. Snapshot evidence remains unchanged.

### Internal-Only Access Expectations

All lifecycle states are internal-only in v1.

No state in this document grants:

- public report visibility
- public certification status
- badge status
- Source Directory display
- Community Grow display
- breeder/source portal access
- public verification endpoint access

## 8. Integrity Enforcement Expectations

### Invalid State Rejection

Future implementation must reject:

- unknown lifecycle states
- prohibited transitions
- transition attempts without required snapshot context
- publication attempts from failed or draft states
- supersession attempts without a successor snapshot

### Invalid Timestamp Ordering

Future implementation must reject or remediate:

- `prepared_at` before `generated_at`
- `published_at` before `prepared_at`
- lifecycle timestamps missing for their corresponding state
- report root publication timestamps that do not align with the selected snapshot

### Prohibited Publication Scenarios

Publication readiness must be rejected when:

- no prepared snapshot exists
- integrity verification failed
- required operational references are missing
- the snapshot belongs to another report
- the snapshot belongs to another CSTP test
- duplicate active snapshots exist
- supersession lineage is inconsistent
- required audit accountability is missing without approved internal exception

### Required Operational Data Presence

Lifecycle advancement must verify required operational data:

- report root exists
- CSTP test exists
- linked request exists when the report references one
- linked source exists when the report references one
- included CSTP test-session rows exist
- included Grow session rows exist
- admin event or actor context exists when workflow requires it

### Supersession Validation

Supersession must validate:

- prior snapshot exists
- successor snapshot exists
- both snapshots belong to the same report
- successor version is greater than prior version
- snapshot does not supersede itself
- lineage does not create cycles
- prior child evidence remains retained
- successor passed integrity verification

## 9. Future Deferred Placeholders

The following systems are deferred and are not designed here:

- public report visibility
- certification publishing
- badge issuance
- verification endpoints
- public CSTP explorer
- breeder/source access portals
- Source Directory CSTP display
- Community Grow CSTP linking

Future public or certification systems must consume immutable snapshot evidence and respect this lifecycle governance.

## 10. Explicit Non-Goals

This document does not implement or define:

- APIs
- routes
- jobs/workers
- cron systems
- queue systems
- rendering
- PDF/export generation
- UI
- automation
- public access
- public read policies
- RLS policies
- certification qualification logic
- certification schema
- moderation systems
- breeder/source accounts
- Community Grow integration
- Source Directory integration
- service functions
- database migrations

## 11. Final Governance Rule

CSTP report lifecycle state exists to protect immutable historical evidence.

Reports may advance, fail integrity checks, publish internally, become superseded, or be archived internally. They must not rewrite generated evidence to make history appear current. Corrections create lineage; governance preserves trust.
