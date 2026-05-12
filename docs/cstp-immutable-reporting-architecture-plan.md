# CSTP Immutable Reporting Architecture Plan

## 1. Purpose

The CSTP operational workflow is now complete internally enough to support request intake, test orchestration, test lifecycle management, admin events, and CSTP test-to-grow-session relationship management.

Reporting is the next major trust boundary. Unlike internal admin workflow records, CSTP reports may eventually become public-facing evidence. That means report data must be stable, reproducible, and protected from accidental mutation after publication.

Immutable reporting is required before certifications, public reports, Source Directory trust indicators, Community Grow discovery, or other public CSTP systems are implemented. A report should preserve the exact operational state and observed results at the time it was prepared or published. Public trust depends on the ability to distinguish live operational data from historical report evidence.

This document is architecture and planning only. It does not implement reports, certifications, public CSTP features, UI changes, routes, automation, breeder/source portals, Community Grow integration, or Source Directory integration.

## 2. Immutable Reporting Principles

Future CSTP reporting should follow these principles:

- Reports must become historical snapshots, not live projections of mutable operational records.
- Published reports must not mutate after publication.
- `grow_sessions` remain canonical historical references for the original grow session data.
- CSTP reports preserve the exact CSTP operational state, linked session relationship state, observed metrics, metadata, timestamps, and publication context captured at publication time.
- Public report values should be read from immutable snapshots, not recalculated from live sessions on every page load.
- Report snapshots should be versioned when a prepared report is regenerated before publication.
- Published report revisions, if ever permitted, must create a new traceable snapshot rather than overwriting the prior public snapshot.
- Public trust depends on immutability, auditability, and clear separation between internal workflow state and published evidence.

Immutable reporting should not imply that source data becomes frozen. Grow sessions may continue to exist as normal Grow records, but a published CSTP report should preserve what was used for the public report at the time of publication.

## 3. Recommended Snapshot Architecture

The future reporting layer should introduce explicit report snapshot concepts before public publishing.

### Report Snapshot Entity

A report snapshot is the frozen evidence record for a prepared or published CSTP report.

Expected responsibilities:

- preserve reportable values used by the public report
- preserve report structure and terminology version
- preserve snapshot generation timestamp
- preserve publication timestamp when applicable
- preserve actor/admin context through audit linkage
- prevent later live session edits from changing published report values

Recommended conceptual fields:

- report id
- CSTP test id
- snapshot version
- snapshot status
- generated at
- prepared at
- published at
- methodology/version reference
- publication marker
- report visibility marker
- immutable/frozen payload sections

No schema is implemented by this plan.

### Frozen Test Summary

The report snapshot should freeze the CSTP test context used for report generation:

- CSTP test id
- request id, if associated
- source id, if associated
- internal test status at snapshot time
- test started timestamp
- test completed timestamp
- linked session count
- KAN/multi-KAN grouping summary
- archive state at snapshot time

This summary records the test context used for reporting without replacing the `cstp_tests` record.

### Frozen Session Relationship Summary

Reports should freeze the CSTP-to-session relationship state used at publication:

- linked `grow_sessions.id` values
- link ids from `cstp_test_sessions`
- KAN labels
- `included_in_report` state
- link archive state at snapshot time
- linked session timestamps relevant to reporting
- relationship selection rationale where appropriate

This preserves which sessions were included in the report, even if CSTP links are later archived, relabeled, or excluded from future report preparation.

### Frozen Germination Metrics

Report snapshots should freeze reportable metric values using CSTP reporting terminology:

- Total Seeds Tested
- Successfully Germinated
- Non-Germinated During Observation Window
- Observed Germination Rate
- First Germination Observation
- Observation Window
- final observation timestamp
- delayed/extended observation notes, if applicable
- Multi-KAN consistency summary, if applicable

The frozen metrics should be derived from linked Grow session evidence during report preparation, then stored as snapshot values. Published reports should not recalculate these metrics from live session state.

### Frozen Metadata

Snapshots should preserve public-safe metadata needed for transparency:

- source name at snapshot time
- variety name
- breeder/source identity where appropriate
- seed type
- batch or lot identifier when available
- requested seed count if reportable
- CSTP methodology reference
- report schema/framework version
- report generated by/admin role context where public-safe
- internal-only admin notes excluded from public report payloads

Metadata should distinguish public report fields from private/admin fields.

### Frozen Timestamps

Report snapshots should freeze timestamp values used in reporting:

- request received timestamp
- test started timestamp
- test completed timestamp
- observation window start
- observation window end
- first germination observation timestamp
- final observation timestamp
- report generated timestamp
- report prepared timestamp
- report published timestamp
- report expiration timestamp, if future certification rules require it

Timestamps should be stored consistently and rendered with clear public context.

### Publication and Version Markers

Future report records should include clear publication/version concepts:

- draft/prepared snapshot version
- published snapshot version
- superseded snapshot marker
- published at
- published by
- publication audit event id
- report visibility state
- methodology version
- report schema version

If a report is regenerated before publication, earlier prepared snapshots may be retained internally. If a published report requires correction later, the correction should create a new versioned snapshot with explicit audit history.

## 4. Session Compatibility Requirements

Immutable CSTP reports must preserve the existing Grow session architecture.

Requirements:

- Reports must not mutate `grow_sessions`.
- Reports must not alter Grow session stage, timeline, analytics, notes, reminders, media, partitions, ownership, visibility, or completion logic.
- `grow_sessions` remain independently canonical.
- CSTP snapshots reference historical state only.
- CSTP must not create CSTP-owned session forks.
- Report generation should consume linked session data through `cstp_test_sessions`.
- Published report snapshots should preserve frozen values instead of using live session values as a public report source.

The relationship remains:

```text
cstp_tests
-> cstp_test_sessions
-> grow_sessions
-> observations / images / metrics
-> report snapshot generation
-> immutable report snapshot
```

## 5. Audit/Event Requirements

Reporting must extend the existing CSTP audit philosophy.

Future report events should be append-oriented and internal-first:

- report prepared
- report snapshot generated
- report published
- report publication failed
- report superseded
- report archived
- report correction prepared, if future policy permits corrections

Report publication should create immutable audit events. Those events should preserve:

- actor/admin identity
- report id
- snapshot id
- CSTP test id
- publication timestamp
- publication version
- relevant status transition
- safe operational notes

Report revisions must remain historically traceable. A published report should never be silently overwritten. Published reports must preserve actor identity and history so public trust can later be tied back to internal operational accountability.

## 6. Certification Relationship Planning

Certifications remain deferred, but immutable reporting should prepare for future certification linkage.

Future certification concepts may include:

- Gold Certified
- Silver Certified
- CSTP Tested
- Tested-only
- Previously Tested
- Expired Certification
- Report Available
- Report Unavailable

Certification eligibility should be evaluated against immutable report snapshots, not live mutable session data.

Recommended future relationship:

```text
immutable report snapshot
-> certification eligibility evaluation
-> certification record
-> certification history
-> public badge/report availability
```

Future certification records should link to the report snapshot that justified the certification. Renewal, expiration, revocation, and retest behavior should create historical records rather than overwriting prior certifications.

Certifications are intentionally not implemented by this plan.

## 7. Media/Evidence Planning

Future CSTP reports may include frozen media/evidence references.

Potential evidence concepts:

- first germination image
- final observation image
- Multi-KAN observation images
- linked session snapshot references
- timeline captures
- observation evidence summaries
- media capture timestamps
- media retention metadata
- future replay/video references

Evidence planning rules:

- Media used in a published report should be referenced through frozen report evidence metadata.
- Public report evidence should not depend on mutable gallery/session display state alone.
- Evidence references should preserve the exact image or media identity used at publication time.
- If media is removed, archived, or unavailable later, the report should degrade gracefully without changing reported metrics.
- Public evidence should exclude private/admin-only notes or unrelated session content.

No media/evidence implementation is included in this plan.

## 8. Public Exposure Boundaries

Public exposure remains explicitly deferred.

Current boundaries:

- no public CSTP report pages yet
- no public certification pages yet
- no public report read APIs yet
- no Source Directory CSTP exposure from this phase
- no Community Grow CSTP exposure from this phase
- no public trust scoring
- no public badges
- no breeder/source portal report access

The reporting architecture must be prepared internally before any public-facing reporting or certification behavior is exposed.

## 9. Recommended Implementation Order

Recommended sequence before public trust systems:

1. Immutable report schema planning
2. Snapshot generation pipeline planning
3. Internal report preparation workflow
4. Report snapshot persistence
5. Report publication workflow
6. Immutable audit linkage
7. Report validation and rollback testing
8. Certification eligibility planning
9. Certification layer implementation
10. Public read APIs
11. Public report UI
12. Source Directory integration
13. Community Grow integration

This sequence keeps public trust systems downstream of immutable report storage and auditability.

## 10. Safety Boundaries

Required safety boundaries:

- immutable snapshots only for published public report values
- no mutable public reports
- no public report reads from live mutable session data
- no `grow_sessions` mutation
- no duplicated session lifecycle system
- no duplicated germination truth source
- no frontend trust logic
- no certification decisions in UI code
- no public badge state without report/certification history
- no report publication without audit linkage

Frontend surfaces should eventually render report state. They should not decide report truth, certification eligibility, audit status, or public trust labels.

## 11. Explicit Non-Goals

This plan does not implement:

- reports
- report snapshots
- certifications
- public CSTP exposure
- public report routes
- public read APIs
- Source Directory integration
- Community Grow integration
- automation
- breeder/source portals
- UI changes
- route changes
- database migrations
- RLS policies

## 12. Final Recommendation

The next CSTP architecture step should be immutable report schema planning, not public report rendering or certification work.

CSTP should only move toward certifications and public trust surfaces after report snapshots can preserve observed test evidence, linked session context, publication metadata, and audit history without mutating `grow_sessions` or depending on live mutable session state.
