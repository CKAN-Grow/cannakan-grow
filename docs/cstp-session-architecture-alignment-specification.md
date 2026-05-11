# CSTP Session Architecture Alignment Specification

## 1. Purpose

The Cannakan Seed Testing Program (CSTP) must align with the existing Cannakan Grow session architecture before any backend, schema, report, or administrative implementation begins. CSTP depends on the same core evidence model already used by normal grow sessions: seeds are placed into KAN/TRa devices, observations are recorded over time, germination outcomes are measured, images are captured, sources are associated, and results are interpreted through a timeline.

If CSTP is implemented as a separate system, Cannakan Grow would carry two parallel definitions of the same operational events. That would create duplicated session logic, conflicting stage and timeline behavior, schema bloat, inconsistent report calculations, and avoidable migration pain. It would also make CSTP reports harder to trust, because public report values could drift from the underlying session evidence that produced them.

This specification defines CSTP as an architecture bridge: CSTP adds certification, reporting, and public trust layers to the existing session system without replacing or forking the core session model.

## 2. Core Architecture Recommendation

CSTP should be implemented as a specialized testing workflow built on top of the existing Cannakan Grow session system.

CSTP should not fork the session system. A CSTP test run should remain a real grow session wherever the user, device, observation, partition, timeline, image, metric, source, and completion concepts are already sufficient.

The recommended architecture is:

- Normal session records continue to represent actual KAN/TRa test activity.
- CSTP parent records group one or more session records into a certification test.
- CSTP extensions store certification-specific state, approval, lifecycle, report visibility, and public outcome data.
- CSTP reports are generated from linked session data, then snapshotted when prepared or published.

This keeps CSTP close to the evidence model users already understand while preserving room for controlled certification logic.

## 3. Shared Session Logic

The following session concepts should remain shared between normal Cannakan Grow sessions and CSTP test run sessions.

### Session Identity

Each CSTP test run should have a normal session identity. The session remains addressable, auditable, and compatible with existing session references.

### Partition Chart Logic

Partition placement, partition-level outcomes, and chart logic should remain shared. CSTP should not create a second partition model for certification tests.

### KAN/TRa Device Support

CSTP should reuse the existing KAN/TRa device model. Device type, device capacity, and device-related session behavior should not be redefined in CSTP tables unless a CSTP-specific validation rule requires metadata beyond the normal session model.

### Stage and Timeline Logic

Stage transitions and timeline events should remain part of the core session system. CSTP may add stricter interpretation rules, but it should not define a separate timeline engine.

### Observations

Daily or staged observations should be stored as normal session observations. CSTP reports should aggregate and interpret those observations rather than storing a duplicate observation stream.

### Germination Metrics

Core germination metrics should be shared:

- Total seeds tested
- Successfully germinated
- Non-germinated during observation window
- Observed germination rate
- First germination observation
- Time to germination

CSTP may apply qualification thresholds to these metrics, but the base calculations should remain consistent with the broader application.

### Snapshots and Images

Images, snapshots, and visual evidence should remain connected to session observations wherever possible. CSTP can define which images are reportable, but it should not create a second media pipeline for the same observed event.

### Notes

Session notes should remain available to CSTP test runs. CSTP may distinguish private administrative notes from public report notes, but basic note capture should not be duplicated.

### Sources

Source references should remain connected to the existing Source Directory model. CSTP should enhance source trust context without creating a separate source identity system.

### Seed Type, Sex, and Age Fields

Seed type, seed sex, seed age, and related fields should remain part of the shared session data model so CSTP outcomes can contribute to long-term analytics.

### Completion Logic

Session completion should remain a shared concept. CSTP can require additional review or approval before certification, but the underlying test run should still use normal session completion rules.

### Analytics-Friendly Data

CSTP test run data should remain compatible with global analytics. Certification-specific fields should extend the analytics model rather than isolating CSTP results from normal germination, source, seed age, seed type, and partition-level analysis.

## 4. CSTP-Specific Extensions

CSTP adds program, certification, reporting, and public trust concepts that do not belong in every normal session. These should be modeled as CSTP-specific extensions linked to normal sessions.

Recommended CSTP-specific extensions include:

- CSTP request intake
- Certification states
- Multi-KAN test grouping
- Breeder/source identity for certification purposes
- Batch and lot tracking
- Administrative approval workflow
- Certification lifecycle
- Gold and Silver qualification
- Report generation
- Report visibility
- Historical certification records
- Published tested-source status

These extensions should describe the certification program around the test. They should not duplicate the actual grow-session evidence captured by the session system.

## 5. Multi-KAN Testing Model

CSTP multi-KAN tests should be modeled as a parent CSTP test record that groups multiple child session records.

Recommended model:

- CSTP Test = parent object
- Test Run Sessions = normal session records linked to the CSTP test
- Each KAN test run remains a real session
- Reports aggregate data from the linked sessions

In this model, the parent CSTP test record represents the certification event: source, variety, lot, intake, qualification target, lifecycle state, report status, and administrative decision history. The child sessions represent the actual evidence-producing test runs.

This avoids duplicating partition, timeline, observation, media, and analytics logic. It also allows CSTP to scale from a single KAN test to a multi-KAN consistency test without introducing a second session model. Each child session can still be inspected, completed, and analyzed as a normal Cannakan Grow session, while the parent CSTP test can evaluate the combined result.

## 6. Report Data Strategy

CSTP reporting should distinguish between live session data and locked report snapshot data.

### Live Session Data

Live session data is the editable operational record used while a CSTP test is in progress. It includes observations, images, stage changes, germination outcomes, notes, source associations, and completion state.

Live session data is appropriate for internal work, quality review, and report preparation. It should remain correctable while the test is active or under administrative review.

### Locked Report Snapshot Data

Locked report snapshot data is the public or report-ready representation of a CSTP test at the time a report is prepared or published.

Reports should be generated from linked session data. Once a report is prepared or published, the displayed report values should be snapshotted and locked. Public reports should not change automatically if the underlying session records are later edited, corrected, or annotated.

This preserves public trust. A published report should represent what was reviewed and released at a specific point in time, with a stable report ID and methodology reference.

Administrative notes can remain private and continue to evolve after publication. Public report snapshots should expose only report-approved fields and media.

## 7. Global vs CSTP-Only Metrics

CSTP should contribute to shared analytics while keeping certification-only logic separate.

### Global Metrics

The following metrics should remain part of the global Cannakan Grow analytics model:

- Germination percentage
- Time to germination
- Source performance
- Seed type performance
- Seed age analytics
- Partition-level performance

These metrics are useful beyond CSTP and should stay compatible with normal sessions, Source Directory insights, Community Grow discovery, and future analytics surfaces.

### CSTP-Only Metrics

The following metrics and decisions should remain CSTP-specific:

- Qualification thresholds
- Badge level
- Test validity
- Batch/lot certification
- Certification expiration and renewal
- Administrative decision history
- Public certification status

These values describe CSTP interpretation and program status. They should not be treated as normal session fields because they depend on CSTP methodology, review, and lifecycle rules.

## 8. Source Directory Alignment

CSTP-tested sources should appear inside Source Directory as enhanced source records, not as a replacement source system.

Source Directory remains the public source ecosystem. CSTP badges and report links should add trust context to existing source cards when a source has reportable CSTP status. The source identity, listing structure, and directory browsing model should remain intact.

Recommended Source Directory behavior:

- Non-CSTP sources show no CSTP treatment.
- CSTP tested-only sources may show a quiet tested state without certification wording.
- Gold Certified and Silver Certified sources may show controlled badge treatment and a report link when a public report is available.
- Previously Tested or expired sources should avoid active certification wording.
- Report unavailable states should not expose fake or empty reports.

CSTP should enhance source credibility through observed evidence and report visibility, not create a separate parallel directory.

## 9. Community Grow Alignment

CSTP-tested results may become discoverable through Community Grow filters when they are public, reportable, and appropriate for community visibility. Community Grow can use CSTP status as a trust or filtering signal, but it should not become an administrative certification surface.

Failed, invalid, private, unfinished, or non-certified CSTP tests should not be publicly listed as CSTP results in Community Grow. A source may have internal CSTP activity without public exposure.

Recommended Community Grow posture:

- Public certified or reportable tested results may be discoverable through filters.
- Non-certified or failed CSTP tests remain internal unless intentionally published with safe wording.
- Community-facing wording should stay observational and avoid implying guarantees.
- CSTP filters should support discovery, not replace the normal Community Grow session model.

## 10. Implementation Boundaries

This document is a planning and architecture alignment specification only.

It does not define or implement:

- Database schema changes
- Supabase row-level security policies
- UI changes
- Route changes
- Report builder implementation
- Backend services
- Authentication or administrative systems
- Public submission workflows

This specification defines the architecture bridge between CSTP and the existing Cannakan Grow session system. Implementation details should be planned after this alignment is accepted.

## 11. Future Implementation Order

Recommended next implementation sequence:

1. Supabase schema planning
2. CSTP parent/child session relationship
3. Report snapshot model
4. Certification lifecycle
5. Administrative workflow
6. Tested source publishing
7. Breeder/source portal later

The first implementation phase should focus on modeling relationships without duplicating existing session concepts. The parent CSTP test, linked child sessions, and locked report snapshot model should be established before public workflows, dashboards, or portals are introduced.

