# Foundation Note FN-GC-005 — Workspace Foundation

**Status:** Foundational Architecture
**Captured:** July 23, 2026
**Related areas:** Workspace, Coordination, Canonical Capabilities, Composition

## 1. Status

This note establishes the Workspace as Grow's canonical coordination capability following completion of the Growing Workspace Shell, Tasks, Events, Temporal Projections, and Notes.

It authorizes only a follow-on Workspace Composition Specification, not implementation.

## 2. Purpose

A Workspace is the platform's canonical coordination capability through which independently authoritative capabilities collaborate within shared user context.

The Workspace coordinates Canonical Capabilities without becoming authoritative for their domains. This distinction prevents future Workspace growth from creating a monolith or duplicate authority.

## 3. Foundational Decision

Canonical Capabilities own domain authority. The Workspace coordinates their approved collaboration.

The Workspace is canonical for coordination only. It never replaces, absorbs, or becomes the domain authority for another capability.

Canonical Capabilities remain independently authoritative and useful inside and outside the Workspace.

This decision extends, without redefining, the approved architecture in:

- [Grow Foundation](../grow-foundation.md);
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](./FN-004-session-lifecycle-and-grow-companion.md);
- [Growing Workspace Composition Specification](../../product/grow-sessions/growing-workspace-composition-specification.md);
- [IC-GC-003A — Growing Workspace Shell](../implementation-contracts/IC-GC-003A-growing-workspace-shell.md);
- [AR-GC-003-01 — Workspace Time, State, Correction & Retention Semantics](../../architecture/AR-GC-003-01-workspace-time-state-correction-and-retention-semantics.md);
- [IC-GC-003B — Growing Workspace Tasks](../implementation-contracts/IC-GC-003B-growing-workspace-tasks.md);
- [AR-GC-003-02 — Growing Workspace Event Semantics & Vocabulary](../../architecture/AR-GC-003-02-growing-workspace-event-semantics-and-vocabulary.md);
- [IC-GC-003C — Growing Workspace Events](../implementation-contracts/IC-GC-003C-growing-workspace-events.md);
- [IC-GC-003D — Growing Workspace Temporal Projections](../implementation-contracts/IC-GC-003D-growing-workspace-temporal-projections.md);
- [FN-GC-004 — Growing Workspace Notes Foundation](./FN-GC-004-growing-workspace-notes-foundation.md); and
- [Grow Sessions documentation](../../product/grow-sessions/README.md).

## 4. Canonical Coordination Capability

The Workspace provides a durable coordination boundary without becoming a canonical domain or data capability.

A Workspace is:

- bounded;
- contextual;
- compositional;
- coordinating;
- presentation-independent; and
- non-authoritative.

The Workspace enables collaboration among capabilities without becoming their authority. Its boundary makes approved composition explicit without implying shared identity, storage, or lifecycle.

## 5. Coordination Properties

The Workspace provides:

- context;
- coordination;
- composition; and
- interaction boundaries.

The Workspace provides no:

- canonical domain identity;
- lifecycle;
- persistence;
- normalization;
- authorization;
- evidence authority; or
- business authority.

Those responsibilities remain with the applicable Canonical Capabilities. The Workspace cannot convert presentation, route, browser, or composition state into canonical authority.

## 6. Canonical Capability Collaboration

Canonical Capabilities collaborate through:

- stable references;
- access-safe reads; and
- approved composition contracts.

They do not exchange:

- ownership;
- lifecycle;
- normalization;
- persistence;
- authorization; or
- evidence authority.

The Workspace coordinates these collaborations without reinterpreting records or duplicating responsibilities. Availability within a Workspace grants no authority to create, mutate, delete, publish, or reinterpret canonical records.

## 7. Dependency Direction

The canonical dependency direction is:

```text
Identity
    ↓
Canonical Capabilities
    ↓
Workspace Coordination
    ↓
Presentation
```

Canonical Capabilities do not depend on the Workspace for identity, validity, ownership, lifecycle, persistence, or meaning. Presentation may depend on the Workspace to coordinate access.

Removing a Workspace must never invalidate a Canonical Capability. Removing a Canonical Capability may reduce available composition without invalidating Workspace architecture.

No presentation layer may reverse this dependency direction by becoming a source of domain authority.

## 8. Workspace Invariants

- Each capability retains one canonical owner of its domain responsibility.
- Each capability retains one canonical identity model.
- Each capability retains one normalization path.
- Grow maintains one Workspace coordination layer.
- Composition introduces no duplicate records or authority.
- Context transfers no ownership.
- Workspace coordination owns no persistence.
- Presentation remains independently replaceable.
- The Workspace owns no duplicate lifecycle.
- The Workspace owns no duplicate authorization.
- Presentation contains no hidden business authority.
- Capability removal cannot corrupt remaining canonical records.
- Workspace evolution cannot require capability redefinition.

The Workspace coordinates. Canonical Capabilities remain authoritative.

## 9. Non-Goals

The Workspace is not:

- a dashboard;
- a page;
- a layout;
- a screen;
- a navigation system;
- a renderer;
- a persistence model; or
- a canonical domain capability.

This note does not authorize implementation, UI, layout, navigation, dashboards, cards, Timeline redesign, Calendar redesign, Photos, Documents, Knowledge, GEE, AI, reminders, notifications, scheduling, collaboration, public sharing, schema, migrations, storage, or runtime behavior.

Those concerns require separately approved capabilities or later Workspace architecture phases.

## 10. Consequences

The Workspace becomes the stable coordination capability through which future Canonical Capabilities integrate by composition rather than architectural redesign.

It remains durable as capabilities evolve independently and does not change their identity, ownership, persistence, lifecycle, or evidence semantics.

## 11. Follow-On Architecture

The next authorized artifact is **CS-GC-005 — Workspace Composition Specification**.

That specification may define how the Workspace composes independently authoritative capabilities through the boundaries established here.

It must not authorize implementation or redefine approved capability architecture.

The required next step is a read-only audit of this Foundation Note. Do not begin the Composition Specification until the audit and Foundation Note Git step are complete.
