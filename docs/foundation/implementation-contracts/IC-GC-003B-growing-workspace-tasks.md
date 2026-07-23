# IC-GC-003B — Growing Workspace Tasks

**Status:** Architecture Blocked — Implementation ICE Not Authorized

This document is an implementation contract for the bounded canonical Task capability. It does not implement code, schema, migrations, persistence changes, or interface assets.

## 1. Purpose

Define the canonical responsibility, identity, ownership, context, persistence boundary, and proof obligations for Tasks in the Growing Workspace.

A Task represents intended user work. This contract does not redefine the Growing Workspace, Session lifecycle, Growing evidence, or shared platform architecture.

Implementation is blocked until the shared time and completed-record mutation decisions identified in Section 13 receive architecture approval.

## 2. Dependencies and Architecture Gate

This contract must preserve:

- [FN-001 — Growing Conditions](../foundation-notes/FN-001-growing-conditions.md);
- [FN-003 — Canonical Entities & Representation](../foundation-notes/FN-003-canonical-entities-and-representation.md);
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../foundation-notes/FN-004-session-lifecycle-and-grow-companion.md);
- [Grow Companion Composition Specification](../../product/grow-sessions/grow-companion-composition-specification.md);
- [IC-GC-002C — Session Entry & Growing Foundation](./IC-GC-002C-session-entry-and-growing-foundation.md);
- [CS-GC-003 — Growing Workspace Composition Specification](../../product/grow-sessions/growing-workspace-composition-specification.md);
- [IC-GC-003A — Growing Workspace Shell](./IC-GC-003A-growing-workspace-shell.md); and
- the existing canonical private Task capability described by [Grow Companion Capability 1 — Tasks, Events, and Activity](../../architecture/grow-companion-capability-1.md).

CS-GC-003 leaves two Task prerequisites unresolved:

- instant, time-zone, and local-civil-time rules for Task due semantics; and
- completed-phase and completed-Session correction, deletion, retention, and visible-provenance policy.

No later repository document inspected for this contract approves those shared semantics. They must not be inferred from existing implementation behavior. Until both decisions are approved, this contract defines the stable Task foundation but does not authorize an implementation ICE.

## 3. Scope

This contract defines only:

- Task identity;
- canonical Session ownership;
- optional Growing Phase and Plant Group context;
- the smallest architecture-approved Task-owned record;
- Task state boundaries;
- dedicated persistence boundaries;
- read-only derived Task projections;
- privacy and authorization requirements; and
- implementation acceptance criteria and architecture gates.

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

Creating or changing a Task must not silently create an Event, manufacture evidence, or mutate structured evidence or lifecycle state. Any future conversion or evidence relationship requires separately approved architecture and explicit owner action.

The existing private Task capability remains canonical. This contract must evolve it rather than create a parallel Task system.

## 5. Identity and Ownership

Each Task has one stable canonical identity and belongs to exactly one canonical Session.

A Task may optionally reference:

- that Session's canonical Growing Phase; or
- one Plant Group belonging to that Growing Phase and Session.

Session ownership remains authoritative. Narrower context does not replace it. A phase or Plant Group reference is valid only when its canonical ownership chain resolves to the Task's Session. Cross-Session references must be rejected.

Editing a Task must preserve its identity. Desktop and mobile use the same identity, ownership, and context model.

Context must use explicit canonical relationships. Miscellaneous polymorphic JSON, arbitrary metadata, string-based entity references, and duplicate Session, phase, or Plant Group identities are prohibited.

## 6. Task-Owned Data

The smallest architecture-approved Task record contains:

- stable Task identity;
- canonical Session ownership;
- optional canonical Growing Phase context;
- optional canonical Plant Group context;
- title;
- optional description;
- created provenance; and
- updated provenance.

The exact physical schema, identifier representation, timestamp generation mechanism, and API shape are implementation details to be proposed only after the architecture gate closes. The existing canonical Task store must not be replaced or duplicated.

The following candidate Task-owned data is not yet authorized:

- `due_at` or any date-only/due-time variant, pending shared time semantics;
- completion state and `completed_at`, pending correction, retention, and visible-provenance semantics;
- reopening, deletion, soft deletion, archival, or completion history; and
- deterministic manual ordering, because no approved first surface requires owner-defined ordering.

Recurrence, priority systems, dependencies, assignments, reminders, notifications, automation, Event conversion, attachments, tags, and arbitrary metadata JSON are excluded.

## 7. State Boundaries

Task state is independent from:

- Session lifecycle;
- Germination lifecycle;
- Growing Phase lifecycle; and
- Plant Group state.

No Task operation may automatically activate, complete, reopen, or reinterpret a Session or phase, or change Plant Group state.

The minimum mutable Task state model is architecture-blocked. This contract does not silently approve completion, reopening, correction, deletion, retention, or history behavior. Existing Sessions and existing Task records retain their current compatibility behavior until an approved resolution and later execution explicitly govern change.

## 8. Persistence Boundaries

Tasks require dedicated canonical Task persistence through the existing Task capability. Task records must not be stored in:

- the Workspace shell;
- Session snapshot or route state;
- Growing Phase or Plant Group fields;
- Germination partitions;
- Notes or Events;
- Calendar state;
- Seed Vault records;
- miscellaneous JSON; or
- browser-only storage as the production authority.

Calendar, summaries, and other derived surfaces must read canonical Task records rather than copy or persist them.

This contract authorizes no schema or migration. Any future persistence change must preserve stable Task identity, Session ownership, owner isolation, existing Task compatibility, and the no-parallel-system rule, and must remain within a later authorized ICE.

## 9. Derived Surfaces

Task surfaces are read-only projections over canonical Tasks, never separate persistence or evidence systems.

The architecture-approved projections are:

- Tasks associated with a Session;
- Tasks associated with a valid Growing Phase context; and
- Plant Group Tasks associated with a valid Plant Group context.

Open Tasks and Completed Tasks depend on an approved Task state model. Due Tasks, Today, and Upcoming additionally depend on approved due and local-time semantics. Those projections are architecture-blocked and must not be implemented under this contract as currently gated.

When authorized, projections must be deterministic for the same canonical records and approved time context. This contract prescribes no visual design, component structure, control behavior, or CSS.

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
- authorization of every optional phase or Plant Group context through the owning Session.

Neither shell registration nor a derived surface may broaden Task access. Existing RLS, grants, credentials, ownership, and publication architecture remain authoritative; this contract invents none.

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
- structured Germination or Growing evidence mutation;
- Workspace-shell persistence; or
- the architecture-blocked time and mutation behavior in Section 13.

## 12. Implementation Acceptance Criteria

After the Section 13 architecture gate is closed and an implementation ICE is separately authorized, implementation must prove:

1. Every Task retains one stable identity through approved edits and state changes.
2. Every Task belongs to exactly one canonical Session.
3. Optional phase and Plant Group context is canonical, same-Session, and validated; cross-Session context is rejected.
4. Canonical Tasks use the existing dedicated Task capability and are not duplicated in the shell, projections, or another persistence system.
5. Approved create, edit, state-change, correction, reopening, and removal behavior persists and survives reopen without weakening validation.
6. Task operations create no Event and mutate no Session, phase, Plant Group, Germination, or structured Growing evidence.
7. Approved projections are deterministic and persist no duplicate records.
8. Owner isolation, anonymous denial, and same-Session authorization hold for direct records and derived surfaces.
9. Preview Studio blocks writes and remains non-persistent.
10. Demo, QA, scenario, and production contexts remain isolated.
11. Desktop and mobile use the same canonical Task, ownership, state, and persistence model.
12. Existing Sessions and canonical Task records remain compatible without silent normalization or reinterpretation.

Focused non-Docker regressions must cover identity, mapping, context validation, projections, lifecycle/evidence non-mutation, Preview Studio blocking, model parity, and compatibility where these can be exercised without a live database.

Live database verification must separately prove canonical persistence, constraints, owner isolation, RLS, grants, cross-owner denial, and reopen behavior. Docker or Supabase unavailability may be documented as blocked verification; static or test-double coverage must not be represented as live RLS proof.

These criteria are proof obligations, not implementation or test-design prescriptions.

## 13. Architecture-Blocked Decisions

Before an implementation ICE may be authorized, an approved architecture resolution must define:

1. **Task due and time semantics**
   - whether the first Task slice supports date-only, instant, local civil time, or an approved combination;
   - the authoritative time-zone context and daylight-saving behavior;
   - parsing, comparison, display, and Today/Upcoming boundary semantics; and
   - compatibility rules for existing Task due values.

2. **Task completion, correction, deletion, retention, and provenance**
   - the minimum Task state vocabulary and valid transitions;
   - completion and `completed_at` semantics;
   - whether and how completed Tasks may be corrected or reopened;
   - deletion, soft-deletion, archival, and retention rules before and after phase or Session completion;
   - required visible history or provenance for corrections and state changes; and
   - compatibility rules for existing Task states and records.

These decisions must remain consistent with Task lifecycle independence, owner privacy, historical review, and existing canonical Task compatibility. This contract does not resolve them.

## 14. Recommended Execution Slice

No implementation ICE is authorized while Section 13 remains unresolved.

The next artifact should be a focused architecture resolution for shared Workspace time semantics and completed-record correction, deletion, retention, and visible provenance. After approval, IC-GC-003B must be updated only as necessary to incorporate those decisions and authorize one bounded Task ICE.

That later ICE should evolve the existing canonical private Task capability, add only the smallest approved Task record and behavior, validate optional canonical context, preserve all security and compatibility boundaries, and implement only the projections enabled by the approved time and state semantics.
