# CSTP Snapshot Assembly Pipeline v1

## 1. Purpose

This document defines the internal implementation plan for assembling immutable CSTP report snapshots from operational CSTP data.

This is implementation-planning documentation only. It does not modify migrations, modify `app.js`, modify APIs/routes, modify UI, implement services/functions, implement rendering, implement certifications, expose CSTP publicly, add automation, add Community Grow integration, add Source Directory integration, add breeder/source portals, or add RLS/public policies.

The pipeline described here converts mutable internal CSTP working data into frozen report evidence records. It defines the intended sequence, inputs, validation gates, payload assembly rules, and failure expectations for a future implementation.

## 2. Pipeline Boundaries

Snapshot assembly is an internal backend workflow.

The pipeline may read operational CSTP and Grow data. It may write immutable CSTP report snapshot records when future implementation exists. It must not mutate operational Grow sessions or redefine operational CSTP workflow state.

The pipeline produces internal evidence records for:

- `cstp_reports`
- `cstp_report_snapshots`
- `cstp_report_metrics`
- `cstp_report_sessions`
- `cstp_report_audit_links`

The pipeline does not produce public reports, certification records, badge states, public verification responses, PDFs, or UI output.

## 3. Authoritative Operational Inputs

### cstp_requests

`cstp_requests` is the authoritative input for intake context.

Snapshot assembly may read:

- request id
- source id
- variety name
- seed type
- breeder name
- batch or lot
- requested seed count
- request status
- created and updated timestamps
- archive state

Private contact details and internal notes require explicit handling. They must not be copied into future public-facing payload sections by default.

### cstp_tests

`cstp_tests` is the authoritative input for CSTP test orchestration context.

Snapshot assembly may read:

- CSTP test id
- source id
- request id
- test status
- internal state when needed for internal reproducibility
- created by admin reference
- archive state
- started and completed timestamps
- created and updated timestamps

The test record remains mutable operational data. Snapshot assembly freezes selected values; it does not replace the test lifecycle.

### cstp_test_sessions

`cstp_test_sessions` is the authoritative CSTP-to-Grow session relationship input.

Snapshot assembly may read:

- CSTP test session id
- CSTP test id
- Grow session id through `session_id`
- KAN label
- included-in-report marker
- relationship archive state
- relationship created timestamp

The relationship row determines which Grow sessions are considered for report evidence. It does not make CSTP the owner of those Grow sessions.

### grow_sessions

`grow_sessions` remains the canonical Grow session input.

Snapshot assembly may read selected report-relevant session evidence, but it must not:

- update Grow session fields
- create CSTP-owned session forks
- rewrite session stage, timeline, media, notes, reminders, partition behavior, ownership, visibility, or analytics
- depend on future live session changes to alter an existing snapshot

### cstp_admin_events

`cstp_admin_events` is the append-oriented CSTP admin audit input.

Snapshot assembly may link to admin events for:

- report creation
- snapshot generation
- validation failure
- snapshot preparation
- publication preparation
- supersession
- archival

Raw admin notes remain internal-only.

### sources

`sources` is the shared source identity input.

Snapshot assembly may read source identity needed to preserve generation-time context. Source Directory public exposure remains deferred and must not be implied by source linkage.

### Auth And Admin References

`auth.users` references may identify the admin or service actor that created, prepared, published, or linked a snapshot action.

Admin references are internal accountability data. They are not public certification, public trust, or public report identity fields in v1.

## 4. Pipeline Stages

### Stage 1: Report Preparation

The pipeline begins with a report preparation request for a single CSTP test.

Preparation must determine:

- the target `cstp_test_id`
- whether a `cstp_reports` root exists
- whether the report root is eligible for a new snapshot
- the intended actor or admin reference
- the current report status
- whether a previous snapshot may need supersession

Report preparation may create or select a report root in future implementation, but this document does not implement that behavior.

### Stage 2: Operational Data Collection

The pipeline collects a bounded operational data set for one CSTP test.

Collection must read:

- the CSTP test row
- the linked CSTP request row when present
- the linked source row when present
- all relevant CSTP test-session rows
- the corresponding Grow session rows
- relevant admin event rows

The collected data must be scoped to the target CSTP test. The pipeline must not assemble a snapshot from cross-test data unless a future approved workflow explicitly defines that behavior.

### Stage 3: Session Aggregation

Session aggregation normalizes the linked CSTP test-session rows into a stable internal collection.

Aggregation must:

- preserve every considered `cstp_test_sessions.id`
- preserve every linked `grow_sessions.id`
- preserve KAN labels at assembly time
- preserve inclusion flags at assembly time
- preserve relationship archive state at assembly time
- use a deterministic ordering for session processing

Recommended ordering for future implementation is by relationship creation timestamp, then `cstp_test_sessions.id`, unless a more specific CSTP methodology requires another stable order.

### Stage 4: Metric Normalization

Metric normalization converts collected session evidence into reportable metric values.

Normalization must:

- use deterministic calculation rules
- use stable metric keys
- preserve numerator and denominator values when relevant
- preserve observation window timestamps
- preserve calculation version
- distinguish missing data from zero values
- distinguish excluded sessions from included sessions

Metric normalization produces structured metric candidates before persistence.

### Stage 5: Frozen Payload Generation

Frozen payload generation converts normalized data into snapshot-ready JSON structures and child-row values.

Payload generation must produce:

- a report-level frozen payload for `cstp_report_snapshots.frozen_report_payload`
- session summary payloads for `cstp_report_sessions.frozen_session_summary`
- metric values and context payloads for `cstp_report_metrics`
- audit linkage candidates for `cstp_report_audit_links`

Payloads must include enough context to explain the snapshot later without reading mutable live operational state for reportable values.

### Stage 6: Integrity Verification

Integrity verification checks the assembled snapshot candidate before persistence.

Verification must confirm:

- required operational rows exist
- all included session links point to existing Grow sessions
- timestamps are valid and ordered
- metric values are internally consistent
- the next snapshot version is valid
- supersession references are valid
- duplicate snapshot creation is not occurring
- audit linkage is present when required by future workflow rules

No immutable rows should be persisted if integrity verification fails.

### Stage 7: Snapshot Persistence

Snapshot persistence writes the report snapshot and child evidence records as one logical unit.

Future implementation should persist:

- one `cstp_report_snapshots` row
- one or more `cstp_report_metrics` rows
- one or more `cstp_report_sessions` rows
- zero or more `cstp_report_audit_links` rows depending on available audit context
- report root updates needed to reference the current snapshot

Persistence should be transactional. Partial snapshots should not remain after a failed assembly.

### Stage 8: Lineage Linking

Lineage linking connects a new snapshot to prior snapshot history.

When regenerating or correcting a snapshot:

- the new snapshot should set `supersedes_snapshot_id`
- the prior snapshot should record `superseded_by_snapshot_id` when future workflow rules permit that update
- the report root may point to the newest current snapshot
- audit linkage should record the supersession action

Lineage must preserve history. It must not erase old snapshots.

### Stage 9: Publication Preparation

Publication preparation is an internal state transition for a snapshot that has passed integrity checks.

Preparation may:

- set `prepared_at`
- mark snapshot status as prepared
- set report root status to prepared
- link a preparation audit event
- identify the prepared snapshot as the future rendering source

This stage does not publish anything publicly. It does not create public visibility, certifications, badges, PDF output, public APIs, or UI.

## 5. Snapshot Payload Assembly Rules

### Report Summary Payload

The report summary payload should preserve high-level snapshot context.

It should include:

- report id
- snapshot id after persistence, or a candidate id before persistence
- CSTP test id
- CSTP request id when available
- source id when available
- snapshot version
- report schema version
- methodology version
- generated timestamp
- source/request/test summary fields frozen at generation time
- session count summary
- metric count summary
- validation summary

The report summary must not become a public report renderer. It is internal frozen context.

### Session Summary Payloads

Session summary payloads should preserve relationship-level context for each considered CSTP test-session link.

Each session summary should include:

- CSTP test session id
- Grow session id
- KAN label
- included-in-report flag
- relationship archived state
- session timing summary when available
- reportable observation summary when available
- missing-data markers when relevant

Session summaries must not duplicate the full Grow session model.

### Metric Snapshot Payloads

Metric snapshot payloads should preserve the metric value and calculation context.

Each metric should include:

- metric key
- metric type
- metric value
- metric unit when applicable
- numerator when applicable
- denominator when applicable
- calculated timestamp
- calculation version
- observation window start and end when applicable
- structured calculation notes when needed for reproducibility

Metric payloads must not include certification qualification outcomes in v1.

### Environmental Metadata Payloads

Environmental metadata should be included only when available and relevant to the methodology version.

Payloads may include:

- controlled-condition summary
- observation cadence summary
- device or environment context
- internal environmental notes needed for reproducibility

Environmental metadata must remain evidence context. It must not create public trust claims or certification logic.

### Germination Statistics Payloads

Germination statistics should be represented through normalized metrics.

Expected metric families include:

- total seeds tested
- successfully germinated count
- non-germinated count within the observation window
- observed germination rate
- first germination observation timestamp
- final observation timestamp
- observation window duration

Future implementation must choose stable metric keys before code is written.

### Audit Linkage References

Audit linkage references should connect the assembly action to CSTP admin history.

Expected audit roles include:

- `report_created`
- `snapshot_generated`
- `snapshot_prepared`
- `report_prepared`
- `snapshot_superseded`
- `report_superseded`
- `validation_failed`

Audit linkage must remain internal-only.

## 6. Deterministic Calculation Expectations

### Reproducible Metric Calculations

The same operational inputs and same calculation version must produce the same metric outputs.

Future implementation must define:

- exact input selection rules
- exact included/excluded session rules
- exact observation window rules
- exact germination event interpretation
- exact missing-data behavior
- exact metric key vocabulary

### Timestamp Normalization

Timestamps should be normalized consistently before persistence.

Expectations:

- store lifecycle timestamps as `timestamptz`
- preserve source timestamps from operational records when they are part of evidence
- normalize generated/calculated/prepared timestamps to the database time standard already used by migrations
- never use display-local formatting as stored evidence

### Prohibited Live Recalculation Behavior

After a snapshot is generated, future report output must not recalculate existing snapshot metrics from live operational tables.

Live operational data may be used only to generate a new snapshot version.

### Rounding And Precision

Rounding and precision rules must be explicit before implementation.

Expectations:

- counts remain integer-like values
- rates preserve enough numeric precision for reproducibility
- display rounding belongs to future rendering, not frozen raw metric storage
- any rounded metric should preserve numerator and denominator when possible

### Consistency Across Regenerated Reports

Regenerated reports must be consistent in structure even when values change.

Expectations:

- stable metric keys across versions
- stable payload field names across versions within the same schema version
- explicit report schema version changes when payload shape changes
- explicit calculation version changes when metric logic changes

## 7. Integrity Verification Requirements

### Required Operational Data Presence

Assembly should reject candidates missing required data.

Required data includes:

- target CSTP test row
- report root or ability to create/select one in future implementation
- at least one relevant CSTP test-session relationship when a reportable snapshot requires sessions
- Grow session rows for included relationships
- actor or audit context when required by workflow rules

### Orphan Detection

The pipeline must detect orphaned relationships before persistence.

Examples:

- CSTP test session references a missing Grow session
- report root references a missing CSTP test
- requested supersession target belongs to another report
- audit event belongs to a different CSTP test

Orphaned candidates should be rejected or routed to internal remediation before immutable persistence.

### Missing Session Handling

Missing sessions must not be silently ignored.

Expected handling:

- included relationship with missing Grow session: reject assembly
- excluded relationship with missing Grow session: flag for review unless future rules permit omission
- archived relationship: preserve archived state when considered
- no linked sessions: reject reportable snapshot unless future methodology allows metadata-only snapshots

### Invalid Timestamp Handling

Invalid timestamps should reject assembly when they affect report evidence.

Examples:

- completed timestamp before started timestamp
- observation window end before observation window start
- prepared timestamp before generated timestamp
- published timestamp before prepared timestamp
- calculated timestamp outside expected assembly boundary without explanation

### Supersession Consistency

Supersession must be internally consistent.

Verification should confirm:

- superseded snapshot exists
- superseded snapshot belongs to the same report
- new version is greater than the superseded version
- a snapshot does not supersede itself
- supersession does not create cycles
- prior snapshot child evidence remains intact

### Duplicate Snapshot Prevention

The pipeline must prevent accidental duplicate versions.

Checks should include:

- unique version per report
- single in-flight generation path for the same report when future execution supports concurrency
- no reuse of archived or superseded version numbers
- no duplicate metric keys within one snapshot
- no duplicate CSTP test-session references within one snapshot

### Report Lineage Validation

Report lineage validation should confirm:

- report root points to the correct CSTP test
- snapshot points to the same CSTP test as the report root
- request/source references are consistent with the test where available
- current snapshot pointer updates do not hide prior history
- audit links align with report and snapshot ids

## 8. Failure-State Expectations

### Partial Assembly Failure Handling

Partial assembly must not leave durable snapshot evidence.

Future implementation should use transactional persistence so that if any required snapshot, metric, session, lineage, or audit write fails, the whole assembly is rolled back.

### Rollback Expectations

Rollback should preserve the previous stable report state.

Expected rollback behavior:

- no half-created snapshot rows
- no orphan metric rows
- no orphan session rows
- no orphan audit links
- no current snapshot pointer update without a valid snapshot
- no supersession pointer update without the successor snapshot

### Invalid Operational Data Handling

Invalid operational data should stop assembly before immutable persistence.

Examples:

- missing required CSTP test
- invalid session relationship
- inconsistent source/request/test relationship
- invalid timestamps
- metric inputs that cannot be interpreted deterministically
- unauthorized or missing actor context when required

### Integrity Rejection Scenarios

Integrity rejection should be explicit and auditable in future workflow design.

Potential rejection scenarios:

- missing required session evidence
- duplicate session links
- duplicate metric keys
- impossible timestamp ordering
- invalid supersession target
- unsupported methodology version
- calculation produced non-reproducible output

When an admin event is created for rejection, `cstp_report_audit_links` should link the rejection to the report or candidate snapshot context when possible.

### Immutable Snapshot Rejection Rules

If a candidate fails before persistence, no immutable snapshot should be created.

If a generated snapshot later fails validation, it should be retained as historical internal evidence and marked through status/audit workflow rather than destructively edited.

Rejected or archived snapshots must not be used as public report evidence by future systems.

## 9. Future Deferred Integration Placeholders

The following systems may later consume prepared or published immutable snapshots, but they are not designed here:

- public rendering
- PDF generation
- certification publishing
- verification endpoints
- public CSTP explorer integration
- Community Grow linking
- Source Directory display
- badge systems

Future integrations must read frozen snapshot evidence rather than live operational CSTP or Grow values for report output.

## 10. Explicit Implementation Boundaries

This document does not implement or define:

- APIs
- routes
- background jobs
- cron systems
- queue workers
- rendering engine
- PDF/export engine
- certifications
- certification qualification logic
- UI
- public access
- public read policies
- RLS policies
- automation
- moderation
- breeder/source accounts
- Community Grow integration
- Source Directory integration
- service functions
- database migrations

## 11. Final Assembly Principle

The CSTP snapshot assembly pipeline must convert mutable operational data into frozen historical evidence in one deterministic, auditable pass.

If the evidence changes, the pipeline creates a new snapshot version. It does not rewrite old evidence to make history look current.
