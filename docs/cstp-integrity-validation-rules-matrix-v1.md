# CSTP Integrity Validation Rules Matrix v1

## 1. Purpose

This document defines the authoritative CSTP immutable report integrity validation matrix and rejection framework for immutable snapshot generation, persistence, supersession, and publication readiness.

This is systems-definition and implementation-planning documentation only. It does not modify migrations, modify `app.js`, modify APIs/routes, modify UI, implement services/functions, implement rendering, implement certifications, expose CSTP publicly, add automation, add Community Grow integration, add Source Directory integration, add breeder/source portals, or add RLS/public policies.

The rules in this document describe how future internal backend validation should decide whether a snapshot candidate may be generated, persisted, superseded, or prepared for internal publication.

## 2. Validation Philosophy

Immutable CSTP reports are evidence records.

Validation exists to protect historical trust. A snapshot should preserve what was known, which operational inputs were used, which metrics were calculated, when the evidence boundary was created, and how later corrections relate to it.

Core principles:

- validation must be deterministic
- reproducibility is required
- publication readiness requires strict validation
- supersession must preserve historical trust
- invalid candidates should be rejected before persistence
- persisted evidence should be retained and corrected through lineage, not destructive edits
- public exposure remains deferred

The same candidate, same operational inputs, same calculation version, and same validation mode must produce the same validation result.

## 3. Validation Severity Categories

| Severity | Meaning | Expected Behavior |
| --- | --- | --- |
| Blocking integrity failure | The candidate cannot safely become immutable evidence. | Reject generation or persistence. Roll back any partial writes. Record internal rejection context when available. |
| Publication-blocking validation | The candidate may exist internally but cannot become prepared or internally published. | Retain or create only according to future workflow rules, block publication readiness, require remediation or regeneration. |
| Warning/non-blocking validation | The candidate is structurally valid but has quality, completeness, or review concerns. | Allow internal persistence only if all blocking checks pass. Preserve warning context for admin review. |
| Audit-only informational validation | The check records traceability context without changing eligibility. | Do not block generation, persistence, or publication readiness. Attach audit or diagnostic context when available. |

Severity must be assigned before implementation for each validation rule. Future code must not silently downgrade a blocking failure to a warning.

## 4. Operational Data Validation Rules

### cstp_requests

| Rule | Severity | Expected Behavior |
| --- | --- | --- |
| Referenced request id is missing | Blocking integrity failure | Reject candidate when the report references the request. |
| Request belongs to a different CSTP test context than expected | Blocking integrity failure | Reject candidate and require operational remediation. |
| Request status is archived or declined | Publication-blocking validation | Allow internal evidence only with explicit review; block publication readiness. |
| Request metadata required for report context is missing | Warning/non-blocking validation | Allow persistence if metrics and required test/session data are valid; preserve missing-field warning. |
| Request internal notes exist | Audit-only informational validation | Treat notes as internal; do not copy to public-safe payload sections by default. |

### cstp_tests

| Rule | Severity | Expected Behavior |
| --- | --- | --- |
| Target CSTP test is missing | Blocking integrity failure | Reject generation and persistence. |
| Test status is incompatible with report preparation | Publication-blocking validation | Permit internal review only; block prepared or internally published state. |
| Test is archived before generation | Publication-blocking validation | Require admin review before regeneration or preparation. |
| Test source/request references conflict | Blocking integrity failure | Reject until operational references are reconciled. |
| Test started/completed timestamps are inconsistent | Blocking integrity failure | Reject if timing affects snapshot evidence. |

### cstp_test_sessions

| Rule | Severity | Expected Behavior |
| --- | --- | --- |
| No session links exist for a reportable snapshot | Blocking integrity failure | Reject unless a future methodology explicitly permits metadata-only snapshots. |
| Included session link references missing Grow session | Blocking integrity failure | Reject and require operational remediation. |
| Duplicate session link is detected for the same CSTP test and Grow session | Blocking integrity failure | Reject or require cleanup before persistence. |
| Included-in-report marker is false | Warning/non-blocking validation | Exclude from reportable metric aggregation but preserve relationship context when considered. |
| Relationship is archived | Warning/non-blocking validation | Preserve archived state and require review if included in metrics. |

### grow_sessions

| Rule | Severity | Expected Behavior |
| --- | --- | --- |
| Included Grow session row is missing | Blocking integrity failure | Reject candidate. |
| Grow session cannot provide required metric inputs | Publication-blocking validation | Persist only if future workflow allows incomplete internal evidence; block readiness. |
| Grow session timestamps are inconsistent | Blocking integrity failure | Reject when timestamps affect observation windows or metric calculation. |
| Grow session changed after prior snapshot | Audit-only informational validation | Do not mutate prior snapshot; use only for regeneration. |
| Grow session contains data outside report scope | Warning/non-blocking validation | Ignore unsupported data for v1 and preserve only approved summary context. |

### Source References

| Rule | Severity | Expected Behavior |
| --- | --- | --- |
| Referenced source id is missing | Blocking integrity failure | Reject when report or test requires that source reference. |
| Source differs between request and test | Publication-blocking validation | Require admin reconciliation before publication readiness. |
| Source metadata changed after prior snapshot | Audit-only informational validation | Do not update old snapshots; capture current metadata only in a new snapshot. |
| Source Directory exposure is implied by source linkage | Blocking integrity failure | Reject public-facing interpretation; source linkage remains internal context. |

### Admin References

| Rule | Severity | Expected Behavior |
| --- | --- | --- |
| Required actor context is missing for lifecycle-changing action | Publication-blocking validation | Block preparation or internal publication until actor/audit exception is recorded. |
| Admin user reference no longer exists | Warning/non-blocking validation | Preserve nullable actor context and rely on audit event linkage when available. |
| Actor attempts prohibited lifecycle transition | Blocking integrity failure | Reject transition. |

### Audit References

| Rule | Severity | Expected Behavior |
| --- | --- | --- |
| Audit event belongs to a different CSTP test | Blocking integrity failure | Reject audit linkage and candidate if required. |
| Required audit linkage is missing for internal publication | Publication-blocking validation | Block internal publication readiness unless an approved exception exists. |
| Validation failure has no audit event | Warning/non-blocking validation | Allow rejection without persistence; preserve structured rejection reason. |
| Raw admin notes would be copied into public-safe payload | Blocking integrity failure | Reject payload assembly. Raw notes remain internal. |

## 5. Snapshot Integrity Validation Rules

### Snapshot Payload Rules

| Rule | Severity | Expected Behavior |
| --- | --- | --- |
| Missing report-level frozen payload | Blocking integrity failure | Reject persistence. |
| Frozen payload is malformed or not structured JSON | Blocking integrity failure | Reject persistence. |
| Required payload version marker is missing | Publication-blocking validation | Persist only as internal candidate if allowed; block readiness. |
| Payload contains public certification outcome | Blocking integrity failure | Reject v1 payload. Certification is deferred. |
| Payload includes unapproved internal notes as report output | Blocking integrity failure | Reject payload assembly. |

### Lineage Rules

| Rule | Severity | Expected Behavior |
| --- | --- | --- |
| Duplicate snapshot version for one report | Blocking integrity failure | Reject persistence. |
| Snapshot points to report with mismatched CSTP test | Blocking integrity failure | Reject persistence. |
| Supersession target belongs to another report | Blocking integrity failure | Reject supersession. |
| Supersession chain creates a cycle | Blocking integrity failure | Reject supersession. |
| Multiple active prepared or internally published snapshots exist | Publication-blocking validation | Block publication readiness and require lineage resolution. |

### Orphan Rules

| Rule | Severity | Expected Behavior |
| --- | --- | --- |
| Snapshot has no valid report root | Blocking integrity failure | Reject or roll back persistence. |
| Metric row has no valid snapshot | Blocking integrity failure | Roll back persistence. |
| Session row has no valid snapshot | Blocking integrity failure | Roll back persistence. |
| Audit link has no valid report context | Blocking integrity failure | Reject audit link and candidate if required. |
| Child evidence points to mismatched report/test context | Blocking integrity failure | Reject persistence. |

### Timestamp And State Rules

| Rule | Severity | Expected Behavior |
| --- | --- | --- |
| `prepared_at` precedes `generated_at` | Blocking integrity failure | Reject state transition or persistence. |
| `published_at` precedes `prepared_at` | Blocking integrity failure | Reject internal publication readiness. |
| Published/internal locked state lacks publication timestamp | Blocking integrity failure | Reject internal publication. |
| Snapshot status conflicts with lifecycle governance state | Publication-blocking validation | Block readiness until mapped or corrected. |
| Archived snapshot is selected as active current snapshot | Publication-blocking validation | Block readiness and require lineage resolution. |

## 6. Deterministic Metric Validation Rules

### Reproducible Calculation Rules

| Rule | Severity | Expected Behavior |
| --- | --- | --- |
| Calculation version is missing when required | Publication-blocking validation | Block readiness until version is recorded. |
| Same inputs produce different metric outputs | Blocking integrity failure | Reject candidate and investigate calculation determinism. |
| Metric key is missing or blank | Blocking integrity failure | Reject metric persistence. |
| Duplicate metric key within one snapshot | Blocking integrity failure | Reject persistence. |
| Missing-data value is indistinguishable from zero | Publication-blocking validation | Block readiness until represented explicitly. |

### Metric Consistency Rules

| Rule | Severity | Expected Behavior |
| --- | --- | --- |
| Denominator is negative | Blocking integrity failure | Reject metric. |
| Rate numerator exceeds denominator without methodology explanation | Blocking integrity failure | Reject metric. |
| Count metric is stored as an ambiguous free-text value | Publication-blocking validation | Block readiness until normalized. |
| Metric unit conflicts with metric type | Warning/non-blocking validation | Allow internal persistence only if value is interpretable; require review. |
| Metric value lacks calculation context | Warning/non-blocking validation | Allow persistence but preserve warning. |

### Live Recalculation Prohibition Rules

| Rule | Severity | Expected Behavior |
| --- | --- | --- |
| Existing snapshot metric would be recalculated from live data | Blocking integrity failure | Reject mutation; require new snapshot version. |
| Report output would join live operational tables after snapshot generation | Blocking integrity failure | Reject future rendering design. |
| Methodology changed and old metrics are being overwritten | Blocking integrity failure | Reject destructive update; require supersession. |
| Display rounding is being stored as raw evidence | Publication-blocking validation | Block readiness until raw metric precision is preserved. |

### Timestamp And Aggregation Rules

| Rule | Severity | Expected Behavior |
| --- | --- | --- |
| Observation window end precedes start | Blocking integrity failure | Reject metric set. |
| Session aggregation order is unstable | Publication-blocking validation | Block readiness until deterministic ordering is defined. |
| Included/excluded session handling is inconsistent across regeneration | Blocking integrity failure | Reject regenerated candidate. |
| Environmental metadata conflicts with methodology version | Warning/non-blocking validation | Preserve warning and require review if reportable. |
| Environmental metadata is used as certification logic | Blocking integrity failure | Reject v1 payload or metric interpretation. |

## 7. Publication Readiness Validation Rules

Publication readiness is stricter than internal persistence. A candidate may be stored for internal evidence while still failing publication readiness.

| Requirement | Severity | Expected Behavior |
| --- | --- | --- |
| Report root exists and matches snapshot | Blocking integrity failure | Reject readiness. |
| Prepared snapshot exists | Blocking integrity failure | Reject readiness. |
| Required operational references exist | Blocking integrity failure | Reject readiness. |
| Frozen report payload is complete and valid | Blocking integrity failure | Reject readiness. |
| Required metric rows exist | Blocking integrity failure | Reject readiness. |
| Required session rows exist | Blocking integrity failure | Reject readiness. |
| Lineage has no duplicate active current snapshots | Blocking integrity failure | Reject readiness. |
| Audit linkage exists or approved exception is recorded | Publication-blocking validation | Block readiness until resolved. |
| Lifecycle timestamps are valid | Blocking integrity failure | Reject readiness. |
| Snapshot is archived, failed, or superseded | Blocking integrity failure | Reject readiness unless a successor is selected. |
| Snapshot includes certification, badge, or public visibility claims | Blocking integrity failure | Reject v1 readiness. |

Prohibited publication scenarios:

- publishing directly from `draft`
- publishing from `integrity_failed`
- publishing a snapshot with missing child evidence
- publishing a snapshot with inconsistent lineage
- publishing a snapshot that depends on live recalculation
- publishing a snapshot with unapproved public-facing private notes
- publishing without a prepared timestamp

Publication readiness remains internal-only and does not create public access.

## 8. Supersession Validation Rules

| Rule | Severity | Expected Behavior |
| --- | --- | --- |
| Supersession target is missing | Blocking integrity failure | Reject supersession. |
| Successor snapshot is missing or invalid | Blocking integrity failure | Reject supersession. |
| Target and successor belong to different reports | Blocking integrity failure | Reject supersession. |
| Target and successor reference different CSTP tests | Blocking integrity failure | Reject supersession. |
| Successor version is not greater than target version | Blocking integrity failure | Reject supersession. |
| Snapshot attempts to supersede itself | Blocking integrity failure | Reject supersession. |
| Prior snapshot child evidence would be deleted | Blocking integrity failure | Reject destructive replacement. |
| Prior audit links would be removed | Blocking integrity failure | Reject destructive replacement. |
| Regeneration uses inconsistent calculation version without explanation | Publication-blocking validation | Block readiness until calculation context is explicit. |
| Duplicate successor for the same predecessor exists | Publication-blocking validation | Require lineage resolution before readiness. |

Supersession must preserve:

- predecessor snapshot
- successor snapshot
- version history
- metric rows
- session rows
- audit links
- generated/prepared/published timestamps
- report and CSTP test traceability

## 9. Rejection And Rollback Expectations

### Hard Rejection Scenarios

Hard rejection means the candidate must not be persisted or promoted.

Hard rejection scenarios include:

- missing CSTP test
- missing report root when persistence requires one
- missing included Grow session
- malformed frozen payload
- duplicate snapshot version
- invalid supersession target
- impossible timestamp ordering
- duplicate metric key
- orphan child evidence
- attempted mutation of prior immutable evidence
- public/certification claims inside v1 payloads

### Rollback Expectations

Rollback must preserve the previous stable state.

Expected rollback behavior:

- no half-created snapshot rows
- no orphan metric rows
- no orphan session rows
- no orphan audit links
- no current snapshot pointer update without valid snapshot evidence
- no supersession pointer update without a valid successor
- no lifecycle status advancement without passing validation

### Transactional Integrity Expectations

Snapshot persistence should be treated as one atomic operation.

The transaction boundary should include:

- snapshot row
- metric rows
- session rows
- audit links
- report root current snapshot updates
- supersession lineage updates
- lifecycle status changes attached to the same persistence event

### Orphan Prevention Behavior

The validation layer must reject or roll back any write that creates:

- snapshot without report root
- metric without snapshot
- session evidence without snapshot
- audit link without report context
- session evidence referencing another CSTP test
- supersession link across unrelated reports

### Persistence Rejection Boundaries

Persistence must not begin until blocking integrity checks pass.

If a failure is discovered after persistence begins, the persistence manager must roll back the whole attempt. If failure is discovered after a generated snapshot is already committed by a future workflow, that snapshot should be retained as internal historical evidence and excluded from publication readiness through lifecycle/audit handling.

## 10. Future Deferred Placeholders

The following validation areas are deferred and are not designed here:

- certification qualification validation
- public verification APIs
- public report rendering validation
- badge issuance validation
- Source Directory public integrity indicators
- Community Grow public integrity indicators
- breeder/source portal validation

Future public systems must consume immutable snapshot evidence and must not weaken these internal validation requirements.

## 11. Explicit Non-Goals

This document does not implement or define:

- APIs
- routes
- services/functions
- UI
- rendering
- PDF/export generation
- automation
- workers/jobs
- public systems
- public read policies
- RLS policies
- certification qualification logic
- certification schema
- moderation systems
- Source Directory integration
- Community Grow integration
- breeder/source accounts
- database migrations

## 12. Final Validation Rule

Integrity validation is the gate between mutable operational CSTP data and immutable historical evidence.

When validation is strict, snapshots remain reproducible. When validation fails, the system should reject, roll back, or preserve failure context internally. It must not repair history by mutating old evidence.
