# CSTP Snapshot Generation Pipeline Plan

## 1. Purpose

Immutable snapshot generation is the core bridge between operational CSTP data and historical trust records.

Current CSTP operational workflows can create and manage requests, tests, admin events, and CSTP test-to-grow-session relationships. Future reports must transform that mutable operational state into frozen snapshot records before publication, certification, or public trust systems are introduced.

Snapshot generation must preserve reproducibility and audit integrity. It must capture the exact reportable state used for review or publication while remaining isolated from live operational mutation. Operational entities may continue to evolve internally, but snapshot outputs must remain stable once prepared for publication and immutable once published.

This document is architecture and pipeline planning only. It does not implement schema, migrations, reports, certifications, public CSTP exposure, UI/routes, automation, breeder/source portals, Community Grow integration, or Source Directory integration.

## 2. Snapshot Pipeline Concepts

The future conceptual pipeline should follow this order:

```text
Operational CSTP Entities
↓
Snapshot Preparation
↓
Frozen Metric Extraction
↓
Frozen Session Summary Extraction
↓
Frozen Media/Evidence Reference Capture
↓
Immutable Snapshot Assembly
↓
Draft Report Layer
↓
Immutable Publication Workflow
```

Each stage should have a defined responsibility:

- Operational CSTP Entities: mutable internal records such as requests, tests, test-session links, linked Grow sessions, and admin events.
- Snapshot Preparation: select a CSTP test, validate readiness, identify included session links, and collect required source/request context.
- Frozen Metric Extraction: derive reportable germination and observation values from linked session evidence.
- Frozen Session Summary Extraction: capture relationship summaries without duplicating or mutating full Grow session records.
- Frozen Media/Evidence Reference Capture: collect publication-safe evidence references and media metadata.
- Immutable Snapshot Assembly: combine frozen values into a reproducible report snapshot payload.
- Draft Report Layer: allow internal review of the assembled snapshot before publication.
- Immutable Publication Workflow: publish a reviewed snapshot with audit linkage and version markers.

## 3. Snapshot Input Planning

Future snapshot generation should consume operational inputs from existing CSTP and Grow systems.

### CSTP Request State

Potential request inputs:

- request id
- source id
- request status at snapshot time
- received/accepted/awaiting-seeds timestamps where available
- breeder/source identity
- variety name
- seed type
- batch/lot
- requested seed count
- public-safe request metadata

Request records remain operational and mutable internally. The snapshot captures only the request state needed for report reproducibility.

### CSTP Test State

Potential test inputs:

- CSTP test id
- request id
- source id
- test status at snapshot time
- internal state where relevant internally
- started timestamp
- completed timestamp
- archived flag at snapshot time
- created/admin context where report-safe

The test remains the orchestration record. The snapshot records the report context used at generation time.

### Linked Session Relationships

Potential relationship inputs:

- `cstp_test_sessions.id`
- `cstp_test_id`
- `grow_sessions.id`
- KAN label
- included-in-report flag
- link archived flag at snapshot time
- link creation timestamp

Only intentionally selected relationships should feed the snapshot. Archived or excluded links should be handled explicitly.

### Germination Metrics

Potential metric inputs:

- total seeds tested
- successfully germinated
- non-germinated during observation window
- observed germination rate
- first germination observation
- final observation timestamp
- observation window boundaries
- delayed/extended observation notes
- Multi-KAN consistency summary

Metrics should be derived consistently and frozen into snapshot output.

### Timeline and Environmental Metadata

Potential metadata inputs:

- observation cadence
- session/timeline stage labels at snapshot time
- observation window start/end
- KAN/TRa context when available and public-safe
- environmental telemetry placeholders
- CSTP methodology reference
- report schema/framework version

Environmental metadata remains optional until future SOP/reporting requirements make it required.

### Evidence/Media References

Potential evidence inputs:

- first germination image reference
- final observation image reference
- Multi-KAN observation images
- linked snapshot/image ids
- media capture timestamps
- evidence role labels
- publication-safe media availability

Evidence references should be captured as stable identifiers or frozen metadata where possible.

### Audit/Event References

Potential audit inputs:

- relevant admin event ids
- report generation actor
- snapshot generation event
- prepared/published events later
- audit notes safe for internal traceability

Snapshot generation should create new audit linkage rather than silently relying on untracked operational state.

## 4. Frozen Metric Generation Planning

Frozen metric generation should convert linked session evidence into reproducible report values.

### Germination Rate Freezing

The pipeline should freeze:

- Total Seeds Tested
- Successfully Germinated
- Non-Germinated During Observation Window
- Observed Germination Rate
- numerator and denominator used in the calculation
- rounding/display rules used at generation time
- CSTP methodology version

Published metrics must remain historically reproducible. Later edits to Grow sessions should not alter the published report output.

### Completion State Freezing

The pipeline should freeze:

- CSTP test status at snapshot time
- linked session completion indicators used for report readiness
- final observation state
- reportability status
- incomplete-data warnings

Completion state in the report snapshot should describe what was true at generation time, not create a separate lifecycle engine.

### Timestamp Freezing

The pipeline should freeze:

- observation window start
- observation window end
- first germination observation
- final observation
- test started at
- test completed at
- snapshot generated at
- report prepared at
- report published at later

Frozen timestamps should use consistent timezone conventions and should not be recalculated for published reports.

### Environment Snapshotting

The pipeline may freeze:

- KAN/TRa device context
- partition/KAN grouping summary
- observation cadence
- controlled-condition summary
- environmental telemetry references later

Environmental data should be included only when reliable, report-safe, and methodologically defined.

### Metric Reproducibility Expectations

Future snapshot records should preserve enough information to answer:

- what was counted
- when it was observed
- which sessions were included
- which calculation rules were used
- which evidence supported the values
- which methodology version applied

If required inputs are missing, the snapshot should be marked incomplete or not reportable rather than creating public-facing inferred values.

## 5. Session Compatibility Requirements

Snapshot generation must preserve Grow session compatibility:

- `grow_sessions` remain canonical operational entities.
- Snapshot generation must not mutate `grow_sessions`.
- Snapshot generation must not alter session stage, timeline, analytics, notes, media, reminders, partitions, ownership, visibility, or completion logic.
- Snapshots capture historical references only.
- CSTP must not create CSTP-owned session forks.
- `cstp_test_sessions` remains the relationship layer between CSTP tests and Grow sessions.
- Frozen session summaries should not duplicate full session records.

The pipeline consumes session evidence and writes CSTP-owned snapshot output. It does not move session truth into CSTP workflow tables.

## 6. Media/Evidence Snapshot Planning

Media and evidence snapshotting should preserve what supported the report at generation time.

Future concepts:

- frozen evidence references
- publication-safe media
- evidence retention markers
- first germination image reference
- final observation image reference
- Multi-KAN evidence references
- timeline image preservation
- media role labels
- immutable evidence linkage

Evidence rules:

- Snapshot generation should capture stable identifiers for media when available.
- Evidence metadata should identify the role of each image or media item.
- Private/admin-only evidence should not enter public snapshot payloads.
- Missing optional evidence should be documented without blocking numeric reportability unless the SOP requires that media.
- Missing required evidence should block publication or mark the snapshot not reportable.
- If evidence becomes unavailable later, published metrics should remain unchanged.

## 7. Audit Snapshot Requirements

Snapshot generation should create immutable audit linkage.

Future audit behavior should include:

- snapshot generation requested
- snapshot generated
- snapshot validation failed
- snapshot prepared for report review
- snapshot regenerated
- snapshot published later

Audit records should preserve:

- actor/admin identity
- CSTP test id
- report id when available
- snapshot id when available
- snapshot version
- generation timestamp
- validation outcome
- safe operational notes

Append-only audit behavior remains required. Snapshot generation, regeneration, publication, amendment, and supersession should remain traceable.

Publication actor identity must remain preserved in the publication workflow. Snapshot lineage should connect generation, review, publication, and any later amendment or supersession.

## 8. Failure and Consistency Planning

Snapshot generation should fail safely and visibly.

### Partial Snapshot Failures

Future pipeline behavior should distinguish:

- source/request data missing
- test data missing
- linked session data missing
- metric extraction incomplete
- media/evidence incomplete
- audit linkage failure
- persistence failure

Partial failures should not silently produce publishable snapshots.

### Incomplete Evidence Handling

Incomplete evidence should be handled according to report requirements:

- missing required metrics should block reportability
- missing optional media may produce a warning
- missing required media should block publication if required by SOP
- unavailable private data should not be exposed as a workaround

### Validation Before Publication

Before publication, the pipeline should validate:

- required report fields
- metric completeness
- selected session relationships
- evidence/media requirements
- public-safe metadata
- methodology/version references
- audit linkage readiness

### Snapshot Integrity Verification

Future verification should confirm:

- snapshot payload matches selected CSTP inputs at generation time
- frozen metrics match calculation rules
- linked sessions are correctly referenced
- media references are stable enough for intended use
- timestamps are frozen
- public payload excludes private/admin data

### Reproducibility Checks Later

Future internal tooling may compare frozen snapshot values to source operational records for audit review. Differences after publication should not mutate the published snapshot; they should be recorded as review findings or amendments if needed.

## 9. Public Exposure Boundaries

Public exposure remains deferred.

This pipeline plan does not create:

- public reports
- public certifications
- public APIs
- public report UI
- Source Directory CSTP exposure
- Community Grow CSTP exposure
- public trust scoring
- breeder/source portal access

Snapshots must be generated and validated internally before any public reporting or certification exposure is considered.

## 10. Recommended Future Implementation Order

Recommended sequence:

1. Snapshot schema implementation planning
2. Snapshot extraction helper design
3. Metric freezing helper design
4. Session summary extraction helper design
5. Media/evidence snapshot helper design
6. Immutable snapshot assembly
7. Snapshot validation helpers
8. Draft report generation
9. Immutable publication workflow
10. Immutable audit linkage
11. Certification layer later
12. Public read APIs later
13. Public UI later
14. Source Directory integration later
15. Community Grow integration later

Implementation should remain internal-only until immutable snapshots, validation, and audit linkage are stable.

## 11. Safety Boundaries

Required safety boundaries:

- immutable snapshots only for published report values
- no mutable published records
- no duplicated lifecycle systems
- no duplicated germination truth source
- no `grow_sessions` mutation
- no CSTP-owned session forks
- no frontend trust logic
- no public publication from incomplete snapshots
- no certification status without immutable snapshot support
- no public read path before publication rules exist

## 12. Explicit Non-Goals

This document does not implement:

- schema
- migrations
- reports
- report generation
- report publication
- certifications
- public CSTP exposure
- public APIs
- UI/routes
- automation
- breeder/source portals
- Community Grow integration
- Source Directory integration
- RLS policies

## 13. Final Recommendation

The next CSTP reporting step should remain internal: define the smallest future snapshot schema and extraction helper scope before any report publication or certification work begins.

Snapshot generation should become the controlled point where mutable operational CSTP data is transformed into reproducible historical evidence without mutating Grow sessions or exposing public trust claims prematurely.
