# CSTP Report Snapshot Schema Plan

## 1. Purpose

Immutable report snapshots are the next required trust layer for CSTP. Internal CSTP operations now support request intake, test orchestration, admin lifecycle handling, and session-link management, but public reporting requires a stronger boundary than live operational records.

Reports must preserve historical CSTP state: the request context, test context, linked session selection, observed metrics, evidence references, timestamps, and publication metadata used at the time the report was prepared or published.

Schema planning must occur before implementation so future migrations can protect historical reproducibility, avoid mutating operational CSTP entities, and keep `grow_sessions` as canonical operational records. This document is architecture and schema planning only. It does not implement schema, create migrations, generate reports, implement certifications, expose CSTP publicly, modify UI/routes, add automation, add breeder/source portals, or integrate with Community Grow or Source Directory.

## 2. Snapshot Entity Concepts

The following names are conceptual only. They describe likely future schema responsibilities and should be validated in a later migration design document before SQL is written.

### cstp_reports

Conceptual responsibility:

- parent report record for a CSTP test
- coordinates report preparation, publication, visibility, and lifecycle state
- links report history back to one `cstp_tests` record
- owns one or more immutable snapshots

Likely relationships:

- references `cstp_tests`
- may reference the currently published `cstp_report_snapshots` record
- may be referenced by future certification and public read layers

Lifecycle expectation:

- mutable while internal and unpublished
- publication state changes should be audited
- should not store the frozen report payload directly if versioned snapshots exist

### cstp_report_snapshots

Conceptual responsibility:

- immutable frozen representation of report content at a specific generation/publication moment
- preserves reportable values and public-safe metadata
- protects published report output from live operational changes

Likely relationships:

- references `cstp_reports`
- references `cstp_tests` for traceability
- may reference `sources` for source context
- may be referenced by future `cstp_certifications`

Lifecycle expectation:

- may be regenerated while report is internal/prepared
- must become immutable once published
- superseded/corrected snapshots should remain queryable

### cstp_report_sessions

Conceptual responsibility:

- freezes which `cstp_test_sessions` and `grow_sessions` were included in a report snapshot
- preserves relationship metadata used for reporting
- prevents future link archival or relabeling from changing historical report evidence

Likely relationships:

- references `cstp_report_snapshots`
- references `cstp_test_sessions`
- references `grow_sessions`

Lifecycle expectation:

- created from selected CSTP session-link records during snapshot generation
- immutable after publication
- should not duplicate full Grow session records

### cstp_report_metrics

Conceptual responsibility:

- freezes reportable metric values using the CSTP Standard Report Schema & Reporting Framework
- preserves calculations used for public report output
- separates published metrics from live recalculation

Likely frozen values:

- Total Seeds Tested
- Successfully Germinated
- Non-Germinated During Observation Window
- Observed Germination Rate
- First Germination Observation
- Observation Window
- Multi-KAN consistency summary
- delayed/extended observation notes when reportable

Lifecycle expectation:

- generated from linked session evidence during report preparation
- immutable after publication
- should include methodology/report schema version references

### cstp_report_media

Conceptual responsibility:

- freezes media/evidence references used in the report
- preserves publication-safe image/timeline evidence identity
- separates public report media references from mutable session/gallery display state

Likely relationships:

- references `cstp_report_snapshots`
- may reference existing snapshot/image/media records when stable identifiers exist
- may store frozen media metadata required for public report rendering

Lifecycle expectation:

- selected during report preparation
- immutable after publication
- should degrade gracefully if media is unavailable later without mutating report metrics

### cstp_certifications

Conceptual responsibility:

- future certification records linked to immutable report snapshots
- stores Gold/Silver/Tested-only/Expired/Previously Tested outcomes when certification work begins
- preserves certification history without overwriting prior certifications

Lifecycle expectation:

- deferred until immutable report snapshots exist
- should reference the snapshot that supports the certification decision
- renewals and expirations should create queryable history

## 3. Immutable Snapshot Requirements

Future report snapshot schema should enforce these requirements:

- Snapshot data becomes frozen after publication.
- Published report data must remain reproducible.
- Reports must not mutate operational CSTP entities such as `cstp_requests`, `cstp_tests`, `cstp_test_sessions`, or `cstp_admin_events`.
- Published metrics must remain historically accurate even if linked sessions are later edited, archived, or unavailable.
- Timestamps used in public report output must remain frozen.
- Public report output should read from report snapshots, not live operational joins.
- Corrections or amendments must create new historical versions, not overwrite published snapshot content.
- Internal-only admin notes must not leak into public snapshot payloads.

Immutable does not mean the original operational records become locked. It means the published report has its own frozen evidence boundary.

## 4. Snapshot Content Planning

Future report snapshots should preserve the following content groups.

### Request Metadata

Frozen request metadata may include:

- request id
- request received timestamp
- accepted/awaiting seeds status at report preparation time
- source id, if associated
- contact/source identity fields that are public-safe
- breeder name
- variety name
- seed type
- batch/lot
- requested seed count

Private contact details and internal request notes should remain private unless explicitly approved for public reporting.

### Test Metadata

Frozen test metadata may include:

- CSTP test id
- test status at snapshot time
- internal state at snapshot time, if needed internally
- started timestamp
- completed timestamp
- source id
- request id
- archived state at snapshot time
- linked session count
- generated/prepared/published by actor context through audit linkage

### Linked Session Summaries

Frozen session relationship summaries may include:

- `grow_sessions.id`
- `cstp_test_sessions.id`
- KAN label
- included-in-report flag
- relationship archived flag at snapshot time
- session start/completion timestamps used for reporting
- partition/KAN summary when reportable

These summaries should preserve relationship context, not duplicate the full session model.

### Germination Metrics

Frozen germination metrics should align with approved CSTP terminology:

- Total Seeds Tested
- Successfully Germinated
- Non-Germinated During Observation Window
- Observed Germination Rate
- First Germination Observation
- Observation Window
- final observation timestamp
- delayed germination handling
- incomplete data/reportability outcome

Metrics should include enough context to reproduce how public values were derived.

### Timeline Summaries

Frozen timeline summaries may include:

- observation window start
- observation window end
- first observed germination marker
- key observation timestamps
- final observation timestamp
- stage/timeline labels at snapshot time
- extended observation note when applicable

Timeline summaries should not become a separate CSTP timeline engine.

### Environmental Metadata

Future environmental metadata may include:

- KAN/TRa device context when public-safe
- controlled-condition summary
- observation cadence
- method/version reference
- environmental telemetry placeholders

Environmental metadata remains optional unless future SOP versions require it.

### Evidence/Media References

Frozen evidence references may include:

- first germination image reference
- final observation image reference
- Multi-KAN observation image references
- linked snapshot/image ids
- media capture timestamps
- media role labels
- publication-safe alt/context text

Evidence references should preserve what supported the report at publication time.

### Publication Metadata

Publication metadata may include:

- report id
- snapshot id
- snapshot version
- report schema version
- CSTP methodology version
- generated at
- prepared at
- published at
- published by
- publication audit event id
- public visibility state
- superseded/correction markers

## 5. Session Compatibility Requirements

The report snapshot schema must preserve the existing session architecture:

- `grow_sessions` remain canonical operational entities.
- Report snapshots capture historical references only.
- CSTP must not create CSTP-owned session forks.
- Report publication must not mutate `grow_sessions`.
- Report generation must not mutate session stage, timeline, analytics, notes, media, reminders, partitions, ownership, visibility, or completion logic.
- Published report snapshots should freeze selected values derived from linked sessions.
- Live session edits after publication must not alter published report values.

Recommended conceptual flow:

```text
cstp_tests
-> cstp_test_sessions
-> grow_sessions
-> snapshot generation
-> cstp_report_snapshots
-> public report output later
```

## 6. Report Versioning Planning

Future schema should support explicit report versioning.

Conceptual publication states:

- draft
- prepared
- published
- superseded
- archived
- correction_prepared

Versioning expectations:

- Draft/prepared report snapshots may be regenerated before publication.
- Published snapshots must remain immutable.
- A superseded report remains queryable for history.
- Amendments or corrections create a new snapshot version.
- Historical version lineage should identify the prior snapshot/report that was replaced or corrected.
- Publication markers should identify when a report became public and which snapshot version was public.

Recommended lineage fields may include:

- snapshot version
- previous snapshot id
- supersedes snapshot id
- corrected by snapshot id
- published snapshot id
- publication audit event id

No enum or schema implementation is included here.

## 7. Certification Relationship Planning

Certification implementation remains deferred.

Future certification schema should link certification outcomes to immutable report snapshots:

- certification record references report snapshot
- certification record references CSTP test
- certification record references source
- certification level derives from frozen report metrics and SOP thresholds
- certification status history remains queryable
- expiration, renewal, revocation, and retest records do not overwrite prior certifications

Future certification concepts:

- Gold Certified
- Silver Certified
- CSTP Tested
- Tested-only
- Previously Tested
- Expired Certification
- Report Available
- Report Unavailable

Certification eligibility should not be evaluated directly from mutable live session data once public trust systems exist. It should be evaluated from immutable snapshots and recorded as historical certification state.

## 8. Media/Evidence Planning

Future report media/evidence schema should support publication-safe evidence retention.

Concepts to plan:

- frozen evidence images
- snapshot media references
- first germination image
- final observation image
- Multi-KAN evidence sets
- timeline evidence
- media capture timestamps
- media role labels
- evidence retention status
- public-safe media visibility

Media rules:

- Report media records should reference stable media identities where possible.
- Public report media should not depend solely on live mutable gallery display state.
- Media references should be immutable after publication.
- If media becomes unavailable, the report should preserve metrics and show a graceful evidence-unavailable state rather than rewriting historical report data.
- Private/admin-only media and notes should not be exposed through public report media.

## 9. Public Exposure Boundaries

Public exposure remains out of scope.

Current boundaries:

- no public reports yet
- no public certifications yet
- no public report APIs yet
- no public certification APIs yet
- no Source Directory exposure yet
- no Community Grow exposure yet
- no public trust scoring yet
- no public report UI yet

Report snapshot schema should be designed before public exposure, but schema planning does not authorize public CSTP surfaces.

## 10. Recommended Future Implementation Order

Recommended sequence:

1. Snapshot schema implementation planning
2. Migration design for report/snapshot tables
3. Snapshot generation pipeline
4. Internal report preparation workflow
5. Immutable publication workflow
6. Audit linkage
7. Report validation and staging testing
8. Certification layer
9. Public read APIs later
10. Public UI later
11. Source Directory integration later
12. Community Grow integration later

Public trust systems should remain downstream of immutable publication and audit linkage.

## 11. Safety Boundaries

Required safety boundaries:

- immutable snapshots only for published report values
- no mutable public reports
- no duplicated lifecycle systems
- no duplicated germination truth sources
- no `grow_sessions` mutation
- no CSTP-owned session forks
- no frontend trust logic
- no certification decisions in frontend code
- no public badge/report state without immutable report history
- no public report publication without audit linkage

Future frontend and public API layers should consume report state. They should not define report truth.

## 12. Explicit Non-Goals

This document does not implement:

- schema
- migrations
- report generation
- report publication
- certifications
- public CSTP exposure
- public APIs
- UI or route changes
- Source Directory integration
- Community Grow integration
- automation
- breeder/source portals
- RLS policies

## 13. Final Recommendation

The next CSTP implementation-planning step should turn these snapshot concepts into a focused migration scope document. That later document should define the smallest safe report/snapshot schema slice without adding certifications, public APIs, or public UI.

Until immutable snapshots and audit linkage exist, CSTP should not expose public reports, certification badges, or trust scoring.
