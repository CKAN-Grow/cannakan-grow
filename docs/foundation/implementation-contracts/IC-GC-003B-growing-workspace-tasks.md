# IC-GC-003B — Growing Workspace Tasks

**Status:** Implementation Ready — Bounded Task ICE Authorized

This document is an implementation contract for the bounded canonical Task capability. It does not implement code, schema, migrations, persistence changes, or interface assets.

## 1. Purpose

Define the canonical responsibility, identity, ownership, context, persistence boundary, due semantics, state semantics, compatibility, and proof obligations for Tasks in the Growing Workspace.

A Task represents intended user work. This contract does not redefine the Growing Workspace, Session lifecycle, Growing evidence, or shared platform architecture.

This revision applies AR-GC-003-01 and resolves the remaining Task-specific due, state, and compatibility decisions.

## 2. Dependencies and Architecture Gate

This contract must preserve:

- [FN-001 — Growing Conditions](../foundation-notes/FN-001-growing-conditions.md);
- [FN-003 — Canonical Entities & Representation](../foundation-notes/FN-003-canonical-entities-and-representation.md);
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../foundation-notes/FN-004-session-lifecycle-and-grow-companion.md);
- [Grow Companion Composition Specification](../../product/grow-sessions/grow-companion-composition-specification.md);
- [IC-GC-002C — Session Entry & Growing Foundation](./IC-GC-002C-session-entry-and-growing-foundation.md);
- [CS-GC-003 — Growing Workspace Composition Specification](../../product/grow-sessions/growing-workspace-composition-specification.md);
- [IC-GC-003A — Growing Workspace Shell](./IC-GC-003A-growing-workspace-shell.md);
- [AR-GC-003-01 — Workspace Time, State, Correction & Retention Semantics](../../architecture/AR-GC-003-01-workspace-time-state-correction-and-retention-semantics.md); and
- the existing canonical private Task capability described by [Grow Companion Capability 1 — Tasks, Events, and Activity](../../architecture/grow-companion-capability-1.md).

AR-GC-003-01 is authoritative for shared time, state-transition, correction, hard-deletion, retention, and provenance semantics. This contract applies those rules to Tasks and closes the Task-specific architecture gate.

## 3. Scope

This contract defines only:

- Task identity and canonical Session ownership;
- optional Growing Phase and Plant Group context;
- the smallest canonical Task record;
- Task due and state semantics;
- dedicated persistence boundaries;
- read-only derived Task projections;
- existing Task compatibility;
- privacy and authorization; and
- implementation acceptance criteria.

It does not authorize unrelated workspace capabilities or changes to the Workspace shell.

## 4. Canonical Task Responsibility

A Task owns intended work: something the Session owner plans or needs to do.

A Task is not:

- proof that an activity occurred;
- an Event;
- Germination, Growing Phase, or Plant Group evidence;
- a Calendar record;
- a reminder or notification; or
- lifecycle state.

Creating or changing a Task must not silently create an Event, manufacture evidence, or mutate structured evidence or lifecycle state.

The existing private Task capability remains canonical. This contract evolves it rather than creating a parallel Task system.

## 5. Identity and Ownership

Each Task has one stable canonical identity and belongs to exactly one canonical Session.

A Task may optionally reference:

- that Session's canonical Growing Phase; or
- one Plant Group belonging to that Growing Phase and Session.

Session ownership remains authoritative. Narrower context never replaces it. Cross-Session phase or Plant Group references must be rejected.

Editing, correcting, completing, or reopening a Task preserves its identity. Desktop and mobile use the same identity, ownership, context, due, state, and persistence model.

Context uses explicit canonical relationships. Miscellaneous polymorphic JSON, arbitrary metadata, string-based entity references, and duplicate Session, phase, or Plant Group identities are prohibited.

## 6. Task-Owned Data

The smallest canonical Task record contains:

- stable Task identity;
- canonical Session ownership;
- optional canonical Growing Phase context;
- optional canonical Plant Group context;
- title;
- optional description;
- one due form: none, date only, or instant;
- state: `open` or `completed`;
- `completed_at` when a newly completed Task has a known completion instant;
- immutable created provenance; and
- current updated provenance.

The exact physical schema, identifier representation, timestamp-generation mechanism, and API shape remain implementation details. The existing canonical Task store must be evolved rather than replaced or duplicated.

### 6.1 Canonical Due Model

A Task supports exactly one due form:

1. **No due value** — the owner intends the work but assigns no calendar commitment. It appears in Open Tasks while open and in no Due, Today, Upcoming, or overdue projection.
2. **Date-only due value** — the Task is due on the stored calendar date without a time of day or time-zone conversion. It requires no local civil time, IANA zone, or offset. An open Task appears in Today when its date equals the current calendar date in the owner's active display zone, in Upcoming when later, and in the overdue projection when earlier.
3. **Instant-based due value** — the Task is due at a specific moment. Under AR-GC-003-01 it preserves the UTC instant, entered local civil date and time, IANA zone, and resolved offset. Today and Upcoming use the due instant's calendar date in its recorded IANA zone; chronological ordering uses the UTC instant. Changing the owner's current zone never rewrites or reclassifies the recorded local date.

Today, Upcoming, and overdue contain open Tasks only. Completed Tasks are excluded. Stable Task identity is the final deterministic ordering key when approved projection keys are otherwise equal.

### 6.2 Excluded Data

Recurrence, priorities, dependencies, assignments, reminders, notifications, automation, Event conversion, attachments, tags, arbitrary metadata JSON, and owner-authored manual ordering are excluded.

## 7. State Boundaries

The canonical Task state vocabulary is:

- `open` — intended work not currently recorded as completed;
- `completed` — intended work explicitly marked complete by the owner.

Permitted transitions are:

- creation into `open`;
- `open` to `completed`; and
- `completed` to `open`.

Completing an open Task preserves identity, sets `completed_at` to the authoritative UTC instant of that explicit owner transition, and advances `updated_at`. Repeating completion against an already completed Task is not a new transition and must not replace its existing completion instant.

Reopening is an explicit reverse state transition, not a correction. It preserves identity, changes state to `open`, clears the current `completed_at`, and advances `updated_at`. It does not undo or reinterpret Session or phase lifecycle.

Correcting title, description, due data, valid context, or a known completion instant while state remains unchanged is an in-place correction under AR-GC-003-01. It preserves `created_at`, advances `updated_at`, and creates no replacement identity or revision chain.

Hard deletion follows AR-GC-003-01 and is not a Task state.

Task state remains independent from Session, Germination, Growing Phase, and Plant Group lifecycle. No Task operation may activate, complete, reopen, or reinterpret those entities or change structured evidence.

Open Tasks project `open` records. Completed Tasks project `completed` records. No other value participates in either canonical state projection.

## 8. Persistence Boundaries

Tasks use dedicated canonical persistence through the existing Task capability. Task records must not be stored in:

- the Workspace shell;
- Session snapshot or route state;
- Growing Phase or Plant Group fields;
- Germination partitions;
- Notes or Events;
- Calendar state;
- Seed Vault records;
- miscellaneous JSON; or
- browser-only storage as production authority.

Calendar, summaries, and derived surfaces read canonical Task records rather than copying or persisting them.

This contract does not prescribe schema or migration design. A bounded ICE may make only the minimum persistence changes required by these semantics while preserving identity, Session ownership, owner isolation, compatibility, and the no-parallel-system rule.

## 9. Derived Surfaces

Task surfaces are read-only projections over canonical Tasks, never separate persistence or evidence systems.

Approved projections are:

- Open Tasks;
- Completed Tasks;
- Due Tasks;
- Today;
- Upcoming;
- overdue Tasks;
- Session Tasks;
- Growing Phase Tasks; and
- Plant Group Tasks.

State projections follow Section 7. Date-derived projections follow Section 6.1. No-due Tasks and invalid compatibility due values are excluded from date-derived projections.

Projections must be deterministic for the same canonical records, approved clock, and time-zone context. This contract prescribes no visual design, component structure, controls, or CSS.

## 10. Privacy and Authorization

Tasks are owner-private by default.

Implementation must preserve:

- access through canonical Session ownership;
- authenticated owner-only writes;
- no anonymous access;
- no automatic Community, public, profile, network, or social publication;
- no sharing behavior;
- Preview Studio non-persistence and write blocking;
- demo, QA, scenario, and production-data isolation; and
- authorization of optional phase or Plant Group context through the owning Session.

Neither shell registration nor projections may broaden Task access. Existing RLS, grants, credentials, ownership, and publication architecture remain authoritative.

## 11. Explicit Non-Responsibilities

This contract does not implement or authorize:

- Events or Event conversion;
- Calendar persistence;
- Notes, Photos, or Documents;
- reminders, notifications, recurrence, or automation;
- dependencies, assignments, attachments, tags, or priorities;
- AI, GEE, interpretation, or recommendations;
- sharing or public publication;
- Session Reports or Reflection;
- Session, phase, or Plant Group lifecycle mutation;
- structured Germination or Growing evidence mutation; or
- Workspace-shell persistence.

## 12. Implementation Acceptance Criteria

The authorized bounded Task ICE must prove:

1. Every Task retains one stable identity through edits, corrections, completion, and reopening.
2. Every Task belongs to exactly one canonical Session.
3. Optional phase and Plant Group context is canonical, same-Session, and validated; cross-Session context is rejected.
4. Tasks evolve the existing dedicated capability and are not duplicated in the shell, projections, or another store.
5. None, date-only, and instant due forms follow Section 6.1 and survive reopen.
6. `open` and `completed` transitions, `completed_at`, correction, reopening, and hard deletion follow Section 7 and survive reopen.
7. Compatibility behavior follows Section 13 without read-time rewriting or fabricated data.
8. Task operations create no Event and mutate no lifecycle or structured evidence.
9. Projections are deterministic and persist no duplicate records.
10. Owner isolation, anonymous denial, and same-Session authorization hold for direct records and projections.
11. Preview Studio blocks writes and remains non-persistent.
12. Demo, QA, scenario, and production contexts remain isolated.
13. Desktop and mobile use the same canonical Task model.
14. Existing Sessions and valid existing Task identities remain compatible.

Focused non-Docker regressions must cover canonical mapping, context validation, due forms, state transitions, compatibility classification, projections, non-mutation, Preview Studio blocking, model parity, and reopen behavior where they can run without a live database.

Live database verification must separately prove persistence, constraints, owner isolation, RLS, grants, cross-owner denial, and reopen behavior. Static or test-double coverage must not be represented as live RLS proof.

These criteria are proof obligations, not implementation or test-design prescriptions.

## 13. Existing Task Compatibility

The existing `grow_session_tasks` capability remains canonical. Compatibility distinguishes legacy absence from malformed non-null data and never rewrites stored values merely by reading them.

### 13.1 Identity, Ownership, and Context

- A valid existing Task identity is preserved through adoption and later edits.
- A missing or malformed identity is not replaced during read. The record fails safely through existing unavailable-state conventions until deliberately repaired through an authorized path.
- Existing canonical Session and owner relationships remain authoritative.
- Records without newer Growing Phase or Plant Group references remain valid Session-scoped Tasks. Missing narrower context is not inferred.
- Invalid or cross-Session newer context is rejected and never substitutes for Session ownership.

### 13.2 Existing State Values

- Existing `upcoming` maps to canonical `open`.
- Existing `open` remains canonical `open`.
- Existing `completed` maps to canonical `completed`.
- A completed record with valid `completed_at` preserves it.
- A completed record with absent or null `completed_at` remains completed with completion time unknown. No timestamp is fabricated; its next explicit transition follows canonical rules.
- An absent or null state follows the legacy default `open` without implying prior completion.
- Any other non-null state is invalid. It is preserved, enters neither Open nor Completed projections, and requires explicit owner correction before canonical state mutation.
- A completion timestamp attached to an open, absent-state, or invalid-state record does not independently prove completion. It is preserved for safe correction but does not control state.

### 13.3 Existing Due Values

- A valid `due_date` with no `due_time` maps to canonical date-only due.
- A valid `due_date` with valid `due_time` remains a legacy local timed due. Because no IANA zone or resolved offset was recorded, it must not be represented as a canonical instant.
- A legacy local timed due uses its stored date for Today, Upcoming, and overdue grouping and its stored time for within-date ordering.
- On the next owner correction to a legacy local timed due, the owner must explicitly choose date-only, canonical instant with zone resolution, or no due value.
- An absent or null legacy due date maps to no due value. No date or time is inferred.
- A due time without a valid due date, or any malformed non-null due value, is invalid compatibility data. The raw value is preserved, excluded from date-derived projections, and requires explicit owner correction.

### 13.4 Privacy and Non-Reinterpretation

Existing authenticated-owner access, RLS, grants, Preview Studio blocking, and demo, QA, scenario, and production isolation remain unchanged.

Compatibility creates no parallel Task, Event, evidence, or projection record; fabricates no completion history or due instant; and performs no automatic data rewrite. New and owner-corrected Tasks must satisfy Sections 6 and 7.

## 14. Recommended Execution Slice

No Task-specific architecture blocker remains. One bounded implementation ICE is authorized.

The ICE must evolve the existing canonical private Task capability in place and implement only:

- the smallest canonical Task record in Section 6;
- the due forms and projections in Sections 6.1 and 9;
- the state, completion, reopening, correction, and hard-deletion rules in Section 7;
- optional validated same-Session Growing Phase and Plant Group context;
- the compatibility rules in Section 13; and
- existing privacy, authorization, Preview Studio, isolation, lifecycle, evidence, and responsive-model boundaries.

It must not implement Events, Calendar persistence, reminders, notifications, recurrence, automation, or any other deferred workspace capability.
