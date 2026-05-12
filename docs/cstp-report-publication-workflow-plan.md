# CSTP Report Publication Workflow Plan

## 1. Purpose

This document defines the future immutable CSTP report publication workflow before report generation, certification, or public trust systems are implemented.

Publication is the point where an internal CSTP report may become public evidence. That boundary requires stricter rules than internal admin workflow because published reports must remain historically reproducible, audit-linked, and stable even if operational CSTP records or linked Grow sessions later change.

This is architecture and workflow planning only. It does not implement reports, certifications, public APIs, UI/routes, migrations, automation, breeder/source portals, Community Grow integration, or Source Directory integration.

## 2. Publication Workflow Concepts

The future publication workflow should separate internal preparation from public release.

Recommended conceptual flow:

```text
Completed CSTP Test
-> Report Draft Created
-> Snapshot Generated
-> Internal Review
-> Report Prepared
-> Report Published
-> Immutable Public Snapshot
-> Future Certification Eligibility
```

Each step should be auditable. No public report should exist until a reviewed snapshot is explicitly published.

## 3. Draft vs Published Concepts

### Draft

A draft report is internal and mutable.

Expected behavior:

- may be generated from linked CSTP test/session data
- may be regenerated during internal review
- may expose missing-data warnings to admins
- may include private validation notes
- must not be public
- must not drive certification badges

### Prepared

A prepared report is internally reviewed and ready for publication decision.

Expected behavior:

- has a generated snapshot candidate
- has validation results
- has reportability status
- has reviewed metrics and evidence references
- remains internal until publication

### Published

A published report is public-ready immutable evidence.

Expected behavior:

- points to one immutable report snapshot
- should not mutate after publication
- should preserve publication actor, timestamp, and version
- should be linked to publication audit history
- may later support certification eligibility

Published reports must read from frozen snapshot values, not live operational data.

## 4. Snapshot Generation Planning

Snapshot generation should occur before publication and should freeze the report values that may later become public.

Snapshot generation should capture:

- request metadata
- CSTP test metadata
- linked session relationship summaries
- selected session evidence references
- Total Seeds Tested
- Successfully Germinated
- Non-Germinated During Observation Window
- Observed Germination Rate
- First Germination Observation
- Observation Window
- timeline summaries
- media/evidence references
- methodology/version references
- generated/prepared timestamps

Snapshot generation should validate:

- reportable required fields exist
- linked sessions are selected intentionally
- metric calculations are complete
- media/evidence requirements are satisfied or explicitly optional
- private/admin-only data is excluded from public payloads

No public publication should occur from incomplete or unreviewed snapshot data.

## 5. Immutable Audit Linkage

Publication must create immutable audit linkage.

Future audit events should include:

- report draft created
- snapshot generated
- report prepared
- report published
- publication failed
- report superseded
- amendment prepared
- amendment published
- report archived

Publication audit records should preserve:

- actor/admin identity
- CSTP test id
- report id
- snapshot id
- snapshot version
- publication timestamp
- publication state
- safe operational notes

Audit failures must not be silently ignored. If publication writes the public report state but fails to persist audit linkage, the system should surface a blocked or review-required state rather than treating the report as cleanly published.

## 6. Superseded and Amended Report Lineage

Published reports should never be silently overwritten.

Future lineage concepts:

- original snapshot id
- published snapshot id
- supersedes snapshot id
- superseded by snapshot id
- amendment reason
- amendment prepared at
- amendment published at
- amendment actor/admin id
- publication audit event id

Recommended behavior:

- Corrections create a new snapshot version.
- Prior published snapshots remain queryable.
- Public UI may show only the current published report later, but historical records should remain internally traceable.
- Superseded reports should retain their original metrics, timestamps, evidence references, and publication metadata.
- Amendments should explain what changed without rewriting the older snapshot.

## 7. Certification Eligibility Planning

Certification remains deferred, but publication should prepare for future eligibility checks.

Future certification eligibility should be evaluated from immutable published snapshots, not live mutable session data.

Eligibility planning should consider:

- Gold Certified thresholds
- Silver Certified thresholds
- Tested-only outcomes
- Report Available status
- Report Unavailable status
- Previously Tested status
- Expired Certification status
- retest/revalidation relationships

Recommended future flow:

```text
Published report snapshot
-> certification eligibility evaluation
-> certification record
-> certification history
-> public badge/report availability later
```

Certification decisions should link back to the snapshot that justified the status. Renewals, expirations, revocations, and retests should create historical records rather than overwriting earlier certifications.

## 8. Frozen Media and Evidence Planning

Published reports may eventually include media/evidence that must remain historically stable.

Frozen evidence concepts:

- first germination image reference
- final observation image reference
- Multi-KAN observation images
- linked session snapshot references
- timeline evidence
- media capture timestamps
- media role labels
- evidence availability state

Publication rules:

- Media selected for publication should be captured in snapshot evidence metadata.
- Published report media references should not depend only on mutable gallery/session presentation state.
- Private/admin media and notes should be excluded from public evidence payloads.
- If evidence becomes unavailable later, the report should preserve metrics and show a safe evidence-unavailable state rather than changing historical report values.
- Evidence amendments should create traceable report lineage.

## 9. Public Exposure Boundaries

Public exposure remains deferred.

This workflow plan does not create:

- public report pages
- public report APIs
- public certification APIs
- public badges
- Source Directory CSTP exposure
- Community Grow CSTP exposure
- public trust scoring
- breeder/source portal access

Publication workflow must be implemented and validated internally before any public CSTP report or certification exposure is enabled.

## 10. Implementation Sequencing

Recommended future sequence:

1. Report/snapshot migration scope planning
2. Immutable snapshot schema implementation
3. Internal snapshot generation helper planning
4. Snapshot generation pipeline
5. Internal report validation workflow
6. Report preparation workflow
7. Immutable publication workflow
8. Publication audit linkage
9. Superseded/amended report lineage support
10. Certification eligibility planning
11. Certification layer implementation
12. Public read APIs later
13. Public UI later
14. Source Directory integration later
15. Community Grow integration later

Public trust systems should not precede immutable publication and audit linkage.

## 11. Safety Boundaries

Required safety boundaries:

- no mutable public reports
- no public reports from live mutable session data
- no `grow_sessions` mutation during publication
- no CSTP-owned session forks
- no duplicated lifecycle systems
- no duplicated germination truth source
- no frontend trust logic
- no certification status without immutable report linkage
- no public badge state without certification history
- no publication without audit linkage

## 12. Explicit Non-Goals

This document does not implement:

- reports
- report generation
- report publication
- report snapshots
- certifications
- migrations
- schema changes
- public APIs
- UI/routes
- public CSTP exposure
- automation
- breeder/source portals
- Source Directory integration
- Community Grow integration

## 13. Final Recommendation

CSTP should implement immutable report publication only after snapshot schema planning and internal snapshot generation are validated.

The first publication implementation should remain internal-only, audit-linked, and blocked from public exposure until report snapshots are stable, reproducible, and safe for future certification eligibility.
