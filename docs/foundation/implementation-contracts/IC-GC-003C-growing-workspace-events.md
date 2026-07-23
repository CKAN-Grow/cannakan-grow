# IC-GC-003C — Growing Workspace Events

**Status:** Implementation Ready — Bounded Event ICE Authorized

This document is the implementation contract for the bounded canonical Event capability. It does not implement code, schema, migrations, persistence changes, or interface assets.

## 1. Purpose

Define the implementation obligations for evolving the existing private Growing Workspace Event capability under AR-GC-003-02.

An Event records one factual occurrence entered by the Session owner. This contract does not redefine Event architecture, the Growing Workspace, Session lifecycle, structured evidence, or shared platform semantics.

## 2. Dependencies

Implementation must preserve:

- [FN-001 — Growing Conditions](../foundation-notes/FN-001-growing-conditions.md);
- [FN-003 — Canonical Entities & Representation](../foundation-notes/FN-003-canonical-entities-and-representation.md);
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../foundation-notes/FN-004-session-lifecycle-and-grow-companion.md);
- [Grow Companion Composition Specification](../../product/grow-sessions/grow-companion-composition-specification.md);
- [IC-GC-002C — Session Entry & Growing Foundation](./IC-GC-002C-session-entry-and-growing-foundation.md);
- [CS-GC-003 — Growing Workspace Composition Specification](../../product/grow-sessions/growing-workspace-composition-specification.md);
- [IC-GC-003A — Growing Workspace Shell](./IC-GC-003A-growing-workspace-shell.md);
- [AR-GC-003-01 — Workspace Time, State, Correction & Retention Semantics](../../architecture/AR-GC-003-01-workspace-time-state-correction-and-retention-semantics.md); and
- [AR-GC-003-02 — Growing Workspace Event Semantics & Vocabulary](../../architecture/AR-GC-003-02-growing-workspace-event-semantics-and-vocabulary.md).

AR-GC-003-01 is authoritative for time, correction, deletion, retention, and provenance. AR-GC-003-02 is authoritative for Event responsibility, origin, vocabulary, evidence boundaries, ownership, compatibility direction, and projection boundaries.

## 3. Scope

This contract implements only:

- stable canonical Event identity;
- canonical Session ownership;
- optional same-Session Growing Phase and Plant Group context;
- the smallest canonical Event record;
- canonical type validation;
- date-only and canonical-instant occurrence validation;
- existing Event compatibility;
- dedicated persistence;
- owner-authorized creation, correction, review, and hard deletion; and
- focused implementation proof.

It evolves the existing `grow_session_events` capability. It creates no second Event capability or workspace-wide generic record system.

## 4. Canonical Responsibility

An Event represents one factual occurrence recorded by the owner.

An Event never represents:

- intended work or Task state;
- Session or phase lifecycle;
- structured Germination, Growing Phase, or Plant Group evidence;
- Calendar or Timeline persistence;
- technical or audit activity; or
- derived, reported, reflected, or GEE knowledge.

Creating, correcting, or deleting an Event changes only that Event. It must not complete a Task, mutate lifecycle, change structured evidence, or manufacture another capability record.

First-version canonical Events are user-created only. New `system`, `testing_program`, imported, inferred, or automatically generated Events are prohibited.

## 5. Identity and Ownership

Every Event has one stable canonical identity and belongs to exactly one canonical Session.

An Event may optionally reference:

- that Session's canonical Growing Phase; or
- one Plant Group belonging to that Growing Phase and Session.

Session ownership remains authoritative. Optional context is association, not ownership. Cross-Session phase or Plant Group context must be rejected.

Creation, correction, time correction, type correction, context correction, and deletion operate on the same canonical identity. Desktop and mobile use the same identity, ownership, context, occurrence, vocabulary, and persistence model.

Context must use explicit canonical relationships. Arbitrary association JSON, duplicate Session or phase identity, and string-based polymorphic references are prohibited.

## 6. Canonical Event Record

The smallest canonical Event record contains:

- stable Event identity;
- canonical Session relationship and owner authority derived through it;
- optional canonical Growing Phase context;
- optional canonical Plant Group context;
- one canonical Event type;
- one occurred form: date only or canonical instant;
- optional title;
- optional description;
- immutable `created_at`; and
- current `updated_at`.

An `other` Event requires enough title or description to identify what occurred. Its text remains Session-specific content and never creates a new canonical type.

The exact physical schema, identifier representation, timestamp-generation mechanism, and API shape are implementation details. Only technical metadata already required by repository persistence conventions may be retained.

No workflow state, due field, schedule field, attachment field, arbitrary metadata JSON, global custom vocabulary, duplicate owner field as authority, or speculative domain field is authorized.

## 7. Occurrence Semantics

An Event supports exactly one occurred form under AR-GC-003-01:

1. **Date only** — one calendar date with no time of day and no time-zone conversion.
2. **Canonical instant** — one factual moment preserving the resolved UTC instant, entered local civil date and time, IANA zone, and resolved offset.

Canonical instant fields must describe the same moment. Daylight-saving gaps are invalid. Repeated local times require an explicit occurrence or offset selection before persistence.

Canonical instant chronology uses UTC. Historical display preserves entered local civil time and its recorded zone. Date-only values always retain their stored calendar date.

Events own no due time, scheduled time, expected time, recurrence, reminder, or workflow state.

Corrections resolve occurrence data again and update the same Event. They preserve `created_at`, advance `updated_at`, and create no revision record. Owner deletion hard-deletes the Event and leaves no archive, tombstone, or replacement identity.

## 8. Vocabulary

New and owner-corrected canonical Events support exactly:

- `observation`;
- `maintenance`;
- `environment`;
- `treatment`;
- `transplant`;
- `harvest`;
- `issue`; and
- `other`.

Validation must use these stored domain values, not presentation labels. Implementations may present human-readable labels without changing canonical values.

The type boundaries defined by AR-GC-003-02 remain authoritative. This contract does not introduce nutrient, diagnosis, sensor, yield, method-specific, strain-specific, or structured-harvest taxonomies.

Vocabulary extension requires separate architecture approval.

## 9. Persistence Boundaries

Events use one dedicated canonical persistence model by evolving `grow_session_events`.

Event records must not be persisted through:

- Calendar or Timeline;
- the Workspace shell;
- route or Session snapshot state;
- Growing Phase, Plant Group, or Germination evidence;
- Tasks, Notes, Photos, or Documents;
- Seed Vault;
- generic activity or miscellaneous JSON; or
- browser-only storage as production authority.

The bounded ICE may make only the minimum forward-compatible persistence changes required by Sections 5–8 and 10. It must preserve valid identity, Session ownership, owner isolation, raw compatibility values, and the existing no-parallel-system boundary.

Calendar, Timeline, Recent Activity, and Plant Group Activity may read authorized Events only as projections. This contract does not implement or redesign Calendar, Timeline, or their persistence.

## 10. Existing Compatibility

Existing `grow_session_events` records remain in the canonical capability. Reading compatibility data performs no rewrite, normalization, backfill, identity replacement, or parallel-record creation.

### 10.1 Identity, ownership, and context

- Valid existing Event identities and canonical Session relationships are preserved.
- Missing or malformed identity fails safely through existing unavailable-state conventions and is not replaced during read.
- Existing owner authority remains derived through the canonical Session.
- Missing newer Growing Phase or Plant Group context remains valid Session-scoped compatibility data and is not inferred.
- Invalid or cross-Session newer context is rejected and never substitutes for Session ownership.

### 10.2 Origins

- Existing `user` remains the canonical first-version origin.
- Existing `system` and `testing_program` remain distinguishable compatibility values; they are not relabelled as user-created and do not authorize new records with those origins.
- Absent or null origin remains legacy origin-unknown data; user origin is not inferred.
- Any other non-null origin remains invalid compatibility data.
- Compatibility records remain owner-reviewable through authorized Event surfaces without changing their stored origin.

### 10.3 Types

- Existing `observation`, `transplant`, `environment`, and `harvest` retain their canonical values.
- Existing `plant-health` and `nutrition` remain legacy compatibility values.
- Null, absent, or unknown non-null type remains compatibility data and is not mapped to `other`.
- Raw legacy and invalid values are preserved until explicit authorized owner correction.
- New or corrected canonical Events must select one value from Section 8.

### 10.4 Occurrence values

- A valid existing `occurred_date` without `occurred_time` maps to date only.
- A valid date plus time without stored zone and offset remains a legacy local timed occurrence, not a canonical instant.
- Legacy local timed values retain their stored date and time for owner review and deterministic legacy ordering.
- Missing or malformed non-null occurrence data remains invalid compatibility data.
- No date, time, UTC instant, local civil time, zone, or offset is inferred or fabricated.
- Correcting legacy or invalid occurrence data requires an explicit date-only or canonical-instant choice.

### 10.5 Existing content and projections

- Existing title and description remain on the same identity.
- Optional title does not permit an `other` Event with no identifying narrative.
- Compatibility Events may remain visible to their owner with their compatibility status distinguishable.
- Invalid occurrence values enter no date-derived projection.
- Projections persist no compatibility copy and never reinterpret technical, lifecycle, demo, QA, scenario, or timeline records as Events.

## 11. Privacy and Authorization

Events are owner-private by default.

Implementation must preserve:

- access through canonical Session ownership;
- authenticated owner-only writes;
- no anonymous access;
- no automatic Community, public, profile, network, or social publication;
- no sharing behavior;
- Preview Studio non-persistence and write blocking;
- demo, QA, scenario, and production isolation;
- same-Session authorization for optional phase and Plant Group context; and
- existing RLS, grants, credentials, ownership, and publication boundaries.

Registration in the shell and consumption by projections grant no storage, mutation, or access authority.

## 12. Implementation Boundary

This contract does not implement or authorize:

- Calendar or Timeline behavior or persistence;
- Tasks, Task completion, or Task-to-Event conversion;
- Notes, Photos, Documents, or attachments;
- reminders, notifications, recurrence, or scheduling;
- automatic or system-created Events;
- sensor ingestion or telemetry;
- nutrient schedules or taxonomies;
- diagnosis;
- structured harvest, partial harvest, or yield evidence;
- Session, phase, or Plant Group lifecycle mutation;
- structured Germination or Growing evidence mutation;
- Reports, Reflection, GEE, or Seed Vault writes; or
- sharing or public publication.

## 13. Implementation Acceptance Criteria

The authorized bounded Event ICE must prove:

1. Every Event retains one stable identity through creation, correction, review, and deletion.
2. Every Event belongs to exactly one canonical Session, and owner authority derives through it.
3. Optional phase and Plant Group context is canonical and same-Session; cross-Session context is rejected.
4. The existing `grow_session_events` capability is evolved without duplicate Event persistence.
5. New and corrected types accept exactly Section 8 values, including the narrative requirement for `other`.
6. Date-only and canonical-instant occurrences follow Section 7, including daylight-saving resolution and cross-field instant integrity.
7. Compatibility follows Section 10 without read-time rewriting, fabricated values, or silent normalization.
8. Correction preserves identity and `created_at`, advances `updated_at`, and creates no revision record.
9. Owner deletion hard-deletes only the selected Event.
10. Event operations mutate no Task, lifecycle, structured evidence, Seed Vault knowledge, Report, Reflection, or GEE record.
11. Event read models are deterministic and persist no projection record.
12. Owner isolation, anonymous denial, and same-Session authorization apply to records and projections.
13. Preview Studio blocks writes and remains non-persistent.
14. Demo, QA, scenario, and production contexts remain isolated.
15. Desktop and mobile use one canonical Event model.
16. Valid existing Event identities and raw compatibility values survive migration and reopen.

Focused non-Docker regression must execute production mapping and validation paths for identity, context, vocabulary, occurrence forms, DST behavior, compatibility classification, correction, hard deletion, non-mutation, deterministic reads, Preview Studio blocking, and responsive-model parity.

Live database verification must separately prove forward migration, persistence, constraints, context integrity, owner isolation, RLS, grants, cross-owner denial, deletion, and reload behavior. Test doubles and static inspection must not be represented as live database or RLS proof.

These are proof obligations, not detailed test or interface prescriptions.

## 14. Recommended Execution Slice

No Event-specific architecture blocker remains. One bounded Event implementation ICE is authorized.

The ICE must evolve the existing private `grow_session_events` capability in place and implement only:

- the canonical record in Section 6;
- the occurrence rules in Section 7;
- the exact vocabulary in Section 8;
- the persistence boundary in Section 9;
- the compatibility rules in Section 10;
- owner-authorized create, correct, review, and hard-delete behavior;
- existing privacy, authorization, Preview Studio, isolation, lifecycle, evidence, and responsive-model boundaries; and
- focused proof under Section 13.

It must not implement Calendar, Timeline, reminders, notifications, recurrence, Task conversion, system Events, structured harvest, Reports, Reflection, GEE, sharing, or another workspace capability.
