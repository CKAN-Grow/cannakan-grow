# IC-GC-003A — Growing Workspace Shell

**Status:** Draft — Requires Architecture Approval

This document is an implementation contract. It authorizes only the bounded implementation slice defined below and does not itself implement code, schema, migrations, persistence, or interface assets.

## 1. Purpose

Establish one canonical Growing Workspace shell beneath the approved Growing Foundation.

The shell is a reusable composition framework through which later, separately approved workspace capabilities may be presented. It owns composition only. It does not own domain evidence, operational records, lifecycle state, or persistence.

This contract must not reopen or redefine the Growing Foundation or the capability architecture established by CS-GC-003.

## 2. Dependencies

Implementation under this contract must preserve and follow:

- [FN-001 — Growing Conditions](../foundation-notes/FN-001-growing-conditions.md);
- [FN-003 — Canonical Entities & Representation](../foundation-notes/FN-003-canonical-entities-and-representation.md);
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../foundation-notes/FN-004-session-lifecycle-and-grow-companion.md);
- [Grow Companion Composition Specification](../../product/grow-sessions/grow-companion-composition-specification.md);
- [IC-GC-002C — Session Entry & Growing Foundation](./IC-GC-002C-session-entry-and-growing-foundation.md), as the approved Growing Foundation implementation contract; and
- [CS-GC-003 — Growing Workspace Composition Specification](../../product/grow-sessions/growing-workspace-composition-specification.md).

Those documents remain authoritative for canonical Session, phase, Plant Group, evidence, lifecycle, ownership, privacy, security, Preview Studio, demo, compatibility, and responsive-composition boundaries. This contract introduces no alternative identity, ownership, evidence, lifecycle, or persistence model.

## 3. Scope

This contract authorizes only:

- one Growing Workspace shell;
- the shared ownership boundary inherited by future workspace capabilities;
- stable capability-registration boundaries;
- a reusable empty-state framework; and
- a responsive composition framework shared by desktop and mobile.

The shell exists only within the canonical Growing Workspace of the canonical Session and Growing Phase context already established by the authoritative dependencies.

This slice introduces no domain capability, domain record, operational evidence, workspace persistence, schema, migration, lifecycle transition, or structured Growing evidence mutation.

## 4. Implemented Responsibilities

### 4.1 Workspace Shell

The implementation shall provide one stable composition surface beneath the Growing Foundation.

The shell:

- owns layout composition only;
- remains structurally independent from any one future capability;
- does not duplicate the Grow Companion shell or create another Session or phase surface;
- does not own domain evidence, lifecycle state, operational records, or persistence; and
- does not create, infer, replace, recalculate, or mutate Growing Phase or Plant Group evidence.

The shell must remain usable as capabilities are added through later implementation contracts without requiring an architectural redesign.

### 4.2 Shared Ownership Boundary

Every future workspace capability shall inherit the canonical Session ownership and authorization boundary established by the authoritative dependencies and CS-GC-003.

Optional Growing Phase or Plant Group context remains narrower canonical context within that same Session. The shell must not create duplicate Session, phase, or Plant Group identity, and it must not weaken validation that referenced context belongs to the owning Session.

The shell stores no operational records. It introduces no shared workspace record, miscellaneous polymorphic association, generic evidence container, or alternate ownership system.

Existing owner authorization, privacy, RLS, Preview Studio write blocking, demo and scenario isolation, and production-data boundaries remain unchanged. Capability registration and presentation state cannot bypass those controls.

### 4.3 Capability Registration

The shell shall provide stable composition boundaries through which future, separately approved capabilities can register their presentation surfaces.

Registration:

- identifies where an approved capability participates in workspace composition;
- does not transfer capability ownership to the shell;
- does not couple one capability's availability or evidence to another capability;
- does not create a generic capability data store or canonical operational record;
- does not authorize capability-specific actions, fields, workflows, validation, or persistence; and
- must permit later capabilities to attach without changing the shell's ownership or evidence responsibilities.

The exact implementation mechanism, component API, registry representation, ordering controls, and capability-specific presentation remain implementation choices bounded by this contract and later capability contracts. This contract does not prescribe them.

### 4.4 Empty-State Framework

The shell shall remain present when no workspace records exist.

Its empty-state framework may communicate which separately approved capabilities are available or not yet populated. It must not:

- create placeholder, sample, inferred, or synthetic records;
- persist empty-state or capability content as domain evidence;
- imply that an unavailable or empty capability has completed work;
- mutate lifecycle or structured Growing evidence; or
- expose actions for a capability before the contract implementing that capability authorizes them.

Empty-state presentation is derived interface state only.

### 4.5 Responsive Composition Framework

Desktop and mobile shall use the same shell, capability ownership, canonical context, evidence boundaries, authorization, and capability model.

Responsive behavior may change presentation, ordering, density, navigation affordances, and disclosure of the same registered capability surfaces. It must not create mobile-specific records, persistence, ownership, evidence semantics, lifecycle behavior, or reduced security boundaries.

This contract does not prescribe exact breakpoints, components, styling, control placement, or CSS.

## 5. Explicit Non-Responsibilities

This contract does not implement or authorize:

- Tasks;
- Events;
- Calendar;
- Notes;
- Photos;
- Documents;
- capability-specific fields, actions, validation, workflows, or persistence;
- reminders or notifications;
- recurring work or automation;
- AI or GEE interpretation;
- sharing, Community publication, public publication, or social behavior;
- reports or Session Reports;
- Reflection;
- reference, expected, observed, or phase timing;
- harvest or yield behavior; or
- any other capability deferred by CS-GC-003.

Calendar projection is not implemented in this slice. No workspace capability may be simulated inside the shell to anticipate a later contract.

This contract also does not change Session Entry, Germination, Growing initialization, Grow Context, Plant Groups, Growing Summary, phase navigation, historical review, completion behavior, or existing compatibility.

## 6. Acceptance Principles

Implementation satisfies this contract only when all of the following are true:

1. Exactly one canonical Growing Workspace shell composes beneath the existing Growing Foundation.
2. The shell contains no workspace domain persistence and creates no operational records.
3. The shell owns no workspace evidence and cannot fabricate evidence through registration or empty states.
4. The shell owns no lifecycle state and cannot activate, complete, reopen, or reinterpret a phase or Session.
5. Future capabilities retain independent ownership and can attach through stable registration boundaries without architectural redesign.
6. No capability depends on another capability merely to register with or appear within the shell.
7. Empty states remain visible without creating placeholder records, evidence, or persistence.
8. Desktop and mobile preserve one capability, ownership, evidence, authorization, and persistence model.
9. Canonical Session ownership and any validated Growing Phase or Plant Group context remain unchanged and unduplicated.
10. Existing authorization, privacy, RLS, Preview Studio, demo, scenario, compatibility, and production-data safeguards remain unchanged.
11. No Task, Event, Calendar, Note, Photo, Document, or other deferred capability behavior is implemented by this slice.
12. No schema, migration, generic record system, miscellaneous association store, or parallel Session, phase, Plant Group, evidence, or lifecycle system is introduced.

The next implementation contract should be the Tasks contract identified by CS-GC-003. It must evolve the existing canonical Task capability without transferring Task ownership or persistence to the Workspace shell.
