# CS-GC-005 — Workspace Composition Specification

**Status:** Architecture Draft — Requires Read-Only Audit
**Product Area:** Workspace
**Authority:** Grow Foundation / FN-GC-005 / approved Workspace capability architecture
**Scope:** Architecture-only composition of independently authoritative capabilities

## 1. Purpose

This specification defines the canonical composition architecture through which Grow coordinates independently authoritative capabilities into coherent platform behavior.

It governs composition only. It does not redefine capability ownership, authorize implementation, or define user interface behavior.

## 2. Authoritative Context

This specification inherits:

- [Grow Foundation](../../foundation/grow-foundation.md);
- [FN-GC-005 — Workspace Foundation](../../foundation/foundation-notes/FN-GC-005-workspace-foundation.md);
- [CS-GC-003 — Growing Workspace Composition Specification](./growing-workspace-composition-specification.md);
- [IC-GC-003A — Growing Workspace Shell](../../foundation/implementation-contracts/IC-GC-003A-growing-workspace-shell.md);
- [AR-GC-003-01 — Workspace Time, State, Correction & Retention Semantics](../../architecture/AR-GC-003-01-workspace-time-state-correction-and-retention-semantics.md);
- [IC-GC-003B — Growing Workspace Tasks](../../foundation/implementation-contracts/IC-GC-003B-growing-workspace-tasks.md);
- [AR-GC-003-02 — Growing Workspace Event Semantics & Vocabulary](../../architecture/AR-GC-003-02-growing-workspace-event-semantics-and-vocabulary.md);
- [IC-GC-003C — Growing Workspace Events](../../foundation/implementation-contracts/IC-GC-003C-growing-workspace-events.md);
- [IC-GC-003D — Growing Workspace Temporal Projections](../../foundation/implementation-contracts/IC-GC-003D-growing-workspace-temporal-projections.md); and
- [IC-GC-004 — Growing Workspace Notes](../../foundation/implementation-contracts/IC-GC-004-growing-workspace-notes.md).

Those documents remain authoritative for identity, ownership, persistence, lifecycle, normalization, authorization, evidence, business semantics, and capability-specific behavior.

## 3. Composition Philosophy

The Workspace coordinates independently authoritative capabilities.

Composition enables collaboration without transferring ownership. It organizes existing authority; it does not redistribute or create authority.

Each Canonical Capability remains authoritative for its domain and independently useful inside and outside the Workspace. Architectural simplicity takes precedence over additional abstraction.

## 4. Canonical Composition Model

The canonical dependency direction is:

```text
Identity
    ↓
Canonical Capabilities
    ↓
Workspace Composition
    ↓
Presentation Layer
```

### 4.1 Identity

Identity establishes user context. Workspace Composition consumes that context but does not own, replace, or reinterpret identity or authorization.

### 4.2 Canonical Capabilities

Canonical Capabilities establish domain authority. Each capability retains its canonical identity, ownership, normalization, persistence, lifecycle, evidence, authorization, and business semantics as applicable.

### 4.3 Workspace Composition

Workspace Composition coordinates approved collaboration among Canonical Capabilities. It assembles access-safe capability state through stable composition boundaries without copying records or acquiring domain authority.

### 4.4 Presentation Layer

The Presentation Layer renders coordinated state. Multiple presentation experiences may coexist, but presentation remains replaceable and non-authoritative.

Authority never flows upward through these layers. Presentation cannot become a source of canonical state, and dependencies cannot reverse.

## 5. Capability Composition Requirements

Every participating capability must:

- remain independently authoritative;
- preserve its own ownership and domain boundaries;
- expose stable, approved composition interfaces;
- participate through access-safe composition;
- remain independently useful outside the Workspace;
- preserve canonical dependency direction; and
- avoid duplicate records, normalization, or business semantics.

Tasks, Events, Temporal Projections, and Notes already participate under these requirements. This specification does not redefine them.

Future capabilities must satisfy the same requirements without requiring Workspace or existing capability redesign.

## 6. Coordination Model

Workspace Composition coordinates:

- shared authorized user context;
- approved cross-capability collaboration;
- temporal coordination through the authoritative projection capability;
- capability composition; and
- presentation assembly.

Workspace Composition owns no:

- identity;
- canonical domain record;
- persistence;
- lifecycle;
- normalization;
- authorization;
- evidence;
- business semantics; or
- capability ownership.

Coordination cannot create, mutate, delete, publish, normalize, or reinterpret canonical records unless the owning capability separately authorizes that behavior.

## 7. Presentation Architecture

The Presentation Layer consumes coordinated Workspace state through approved composition boundaries.

Presentation may organize, filter, navigate, or render authorized state, but it owns no canonical identity, persistence, lifecycle, authorization, evidence, normalization, or business semantics.

Workspace Composition remains independent of any page, screen, layout, navigation model, component system, or device-specific experience. Desktop and mobile presentations consume the same canonical capabilities and composition rules.

## 8. Architectural Invariants

- Identity establishes context.
- Canonical Capabilities establish domain authority.
- Workspace establishes coordination.
- Presentation establishes interaction.
- Coordination never creates authority.
- Composition never transfers ownership.
- Authority never flows upward.
- Dependencies never reverse.
- Coordination never duplicates records or semantics.
- Presentation never becomes authoritative.
- Capabilities remain independently useful.
- Stable references transfer context, not ownership.
- Capability removal cannot corrupt remaining canonical records.
- Future capabilities compose without architectural redesign.

## 9. Future Composition

A future capability may join Workspace Composition only through an approved, stable composition boundary.

It must remain independently authoritative, preserve its ownership and dependency direction, and inherit this specification's composition invariants. Its addition cannot require existing capabilities to surrender authority or adopt duplicate identities, persistence, normalization, or business semantics.

The Workspace may coordinate additional capabilities as Grow evolves, but that expansion requires the capability's own approved architecture. This specification does not define or authorize any future capability.

## 10. Out of Scope

This specification does not define or authorize:

- implementation or runtime behavior;
- user interface behavior, navigation, layouts, or presentation implementation;
- persistence, database design, schema, migrations, APIs, or storage;
- capability-specific identity, lifecycle, normalization, authorization, evidence, or business rules;
- changes to Tasks, Events, Temporal Projections, Notes, or the Workspace Shell;
- future capability behavior; or
- AI, automation, reminders, notifications, scheduling, collaboration, or public sharing.

## 11. Acceptance Principles

Workspace composition is architecturally conformant only when:

1. one canonical coordination layer composes independently authoritative capabilities;
2. each participating capability retains its existing authority and independent usefulness;
3. composition uses stable, access-safe boundaries without duplicate authority or persistence;
4. dependency direction remains Identity → Canonical Capabilities → Workspace Composition → Presentation;
5. presentation remains replaceable and non-authoritative;
6. removing a presentation or composition surface does not invalidate canonical capability records;
7. future capabilities can participate without redefining Workspace or existing capabilities; and
8. no implementation authority is inferred from this specification.

## 12. Next Authorized Artifact

After this specification passes its read-only architecture audit and completes its documentation Git step, the only authorized next artifact is:

**IC-GC-005 — Workspace Composition**

That implementation contract may authorize a bounded Workspace composition implementation. It must inherit this specification and the referenced authorities without redefining them.

No implementation is authorized by this specification.
