# IC-GC-005 — Workspace Composition

**Status:** Draft — Requires Read-Only Implementation Contract Audit
**Capability:** Workspace Composition
**Authority:** FN-GC-005 and CS-GC-005
**Scope:** One bounded production Workspace Composition implementation

## 1. Purpose

Authorize one bounded production implementation of the Workspace Composition architecture established by FN-GC-005 and CS-GC-005.

This contract authorizes implementation only. It does not establish, reinterpret, extend, or replace architecture.

## 2. Authoritative Context

Implementation must preserve and follow:

- [Grow Foundation](../grow-foundation.md);
- [FN-GC-005 — Workspace Foundation](../foundation-notes/FN-GC-005-workspace-foundation.md); and
- [CS-GC-005 — Workspace Composition Specification](../../product/grow-sessions/workspace-composition-specification.md).

Those documents remain authoritative. Where implementation ambiguity exists, implementation must stop rather than infer new architecture.

## 3. Authorized Implementation

One bounded implementation may realize:

- the canonical Workspace Composition layer;
- the approved composition model;
- the approved coordination responsibilities;
- approved Presentation Layer integration;
- the approved capability composition model; and
- the approved composition boundaries.

Implementation must use the authority, dependency direction, and composition rules already established by FN-GC-005 and CS-GC-005. No additional implementation responsibility is authorized.

## 4. Authorized Integrations

The implementation may integrate only these approved Canonical Capabilities:

- Tasks;
- Events;
- Temporal Projections; and
- Notes.

Each integration must use its existing canonical production path and the composition boundaries established by CS-GC-005.

Integration cannot create another capability identity, owner, persistence path, lifecycle, normalization path, authorization boundary, evidence source, or business-semantic authority.

No additional capability integration is authorized.

## 5. Implementation Boundaries

The implementation must not introduce:

- a new architectural primitive;
- a new ownership or authority model;
- a new dependency direction;
- a new capability relationship or composition rule;
- new business semantics;
- normalization, persistence, lifecycle, authorization, or evidence authority;
- duplicate canonical records or capability logic;
- Workspace-owned domain state;
- presentation-owned authority; or
- implementation of a capability not listed in Section 4.

Workspace Composition may coordinate authorized capability state and Presentation Layer integration. It cannot create, mutate, normalize, delete, publish, or reinterpret canonical records except through behavior already authorized and owned by the applicable capability.

If implementation requires architectural expansion, execution must stop pending separately approved architecture.

## 6. Architectural Guarantees

Implementation must preserve:

- capability independence and ownership;
- canonical capability identity and normalization;
- existing persistence, lifecycle, authorization, evidence, and business authority;
- the approved dependency direction;
- composition and coordination boundaries;
- Presentation Layer independence;
- capability usefulness outside Workspace; and
- future composition without Workspace or capability redesign.

Implementation realizes these guarantees; it does not redefine them.

## 7. Excluded Scope

This contract does not authorize:

- architecture changes or new architectural documents;
- new domain capabilities or capability-specific behavior;
- changes to Task, Event, Temporal Projection, or Note semantics;
- persistence redesign, schema, migrations, or storage authority;
- new APIs or generic record systems;
- lifecycle, evidence, ownership, normalization, or authorization changes;
- Photos, Documents, Reports, Reflection, GEE, or AI;
- reminders, notifications, recurrence, scheduling, automation, collaboration, or public sharing;
- detailed visual design or Workspace redesign; or
- any implementation responsibility not expressly listed in Section 3.

## 8. Verification Authorization

A bounded execution may verify only:

- conformity to FN-GC-005 and CS-GC-005;
- one canonical composition path for the four authorized integrations;
- preservation of capability ownership and independent authority;
- preservation of dependency direction and Presentation Layer independence;
- absence of duplicate authority, persistence, normalization, lifecycle, evidence, or business semantics;
- access-safe coordination through existing authorization boundaries;
- repository integrity; and
- implementation correctness within this contract.

Verification must exercise production composition paths where applicable. It cannot authorize architecture or capability expansion.

## 9. Implementation Acceptance Criteria

Implementation conforms only when:

1. one canonical Workspace Composition layer coordinates the authorized capabilities;
2. Tasks, Events, Temporal Projections, and Notes retain their canonical production paths and independent authority;
3. Workspace Composition owns no domain records, persistence, lifecycle, normalization, authorization, evidence, or business semantics;
4. presentation consumes coordinated state without becoming authoritative;
5. authority never flows upward and dependencies never reverse;
6. no capability becomes dependent on Workspace for validity or meaning;
7. no duplicate capability logic, record, normalization path, or authority is introduced;
8. existing capability behavior remains independently usable outside Workspace; and
9. no excluded capability or architectural expansion is implemented.

## 10. Next Authorized Artifact

After this contract passes its read-only audit, completes its documentation Git step, and is formally closed, it authorizes only:

**ICE-GC-005-1 — Execute Workspace Composition**

No implementation is authorized before those prerequisites are complete.
