# IC-GC-004 — Growing Workspace Notes

**Status:** Implementation Ready — Bounded Notes ICE Authorized  
**Capability:** Growing Workspace Notes  
**Authority:** FN-GC-004 and CS-GC-004  
**Scope:** One canonical production Notes capability

## 1. Status

This implementation contract authorizes only the bounded production slices below. It does not implement Notes, create an ICE, or redefine approved architecture.

Implementation must preserve:

- [Grow Foundation](../grow-foundation.md);
- [CS-GC-003 — Growing Workspace Composition Specification](../../product/grow-sessions/growing-workspace-composition-specification.md);
- [IC-GC-003A — Growing Workspace Shell](./IC-GC-003A-growing-workspace-shell.md);
- [AR-GC-003-01 — Workspace Time, State, Correction & Retention Semantics](../../architecture/AR-GC-003-01-workspace-time-state-correction-and-retention-semantics.md);
- [IC-GC-003B — Growing Workspace Tasks](./IC-GC-003B-growing-workspace-tasks.md);
- [AR-GC-003-02 — Growing Workspace Event Semantics & Vocabulary](../../architecture/AR-GC-003-02-growing-workspace-event-semantics-and-vocabulary.md);
- [IC-GC-003C — Growing Workspace Events](./IC-GC-003C-growing-workspace-events.md);
- [IC-GC-003D — Growing Workspace Temporal Projections](./IC-GC-003D-growing-workspace-temporal-projections.md);
- [FN-GC-004 — Growing Workspace Notes Foundation](../foundation-notes/FN-GC-004-growing-workspace-notes-foundation.md); and
- [CS-GC-004 — Growing Workspace Notes Composition Specification](../../product/grow-sessions/growing-workspace-notes-composition-specification.md).

Those documents remain authoritative for ownership, composition, semantics, privacy, authorization, lifecycle, evidence, normalization, and projection boundaries.

## 2. Purpose

Authorize one bounded production implementation of canonical Growing Workspace Notes.

Nothing outside this contract is authorized. Implementation shall evolve or establish one canonical Note path without introducing another Note identity, model, store, lifecycle, or authority.

## 3. Authorized Production Capability

The implementation may provide one canonical Note capability supporting:

- stable canonical Note identity;
- authored narrative;
- authorized Workspace containment;
- authoritative author attribution;
- bounded contextual references;
- correction;
- ordinary availability and authoritative deletion;
- access-safe retrieval; and
- presentation through existing Workspace surfaces.

No additional capability family is authorized.

## 4. Authorized Production Slices

### 4.1 Canonical Note

Implement one stable identity, one canonical authored narrative, and attributable authorship. Corrections preserve identity and original authorship attribution.

### 4.2 Workspace Containment

Implement canonical Session containment and inheritance of the approved Workspace access boundary. Containment grants no broader authority and creates no separate Workspace ownership model.

### 4.3 Context References

Implement only bounded references approved by FN-GC-004 and CS-GC-004. References resolve through authorized canonical capabilities, provide context only, and transfer no ownership, lifecycle, authorization, mutation, normalization, or evidence authority.

### 4.4 Correction

Implement in-place Note narrative correction and contextual-reference correction under the approved shared semantics. Correction preserves canonical identity and authorship and cannot rewrite another capability.

### 4.5 Availability and Deletion

Implement ordinary active presentation. Deletion and retention behavior must inherit AR-GC-003-01 without introducing a Note-specific archive, recovery, retained-history, or replacement lifecycle.

### 4.6 Normalization

Implement one canonical raw-Note normalization path owned by the Note capability. Workspace presentations and other production consumers consume canonical Notes directly and do not re-normalize them.

### 4.7 Presentation

Render authorized canonical Notes through existing Workspace surfaces. Presentation owns no Note identity, narrative, persistence, authorization, lifecycle, or evidence.

## 5. Integration Boundaries

Existing authority remains with the Workspace, Sessions, Tasks, Events, Temporal Projections, Photos, Documents, Reports, Reflection, GEE, and future AI capabilities.

Implementation transfers no ownership, lifecycle, authorization, normalization, mutation, or evidence authority. A Note reference cannot complete a Task, schedule an Event, alter Session or phase state, modify structured evidence, or create a temporal projection.

Derived consumers remain derived and independently attributable. They cannot overwrite or silently replace canonical authored content.

## 6. Excluded Scope

This contract does not authorize Photos, Documents, attachments, binary storage, Timeline or Calendar integration, Activity or Search implementation, Reports, Reflection, GEE, AI behavior, reminders, notifications, recurrence, scheduling, collaboration, public sharing, offline capability, synchronization, editor frameworks, Markdown, rich text, autosave, schema redesign, or Workspace redesign.

It authorizes no arbitrary association model, miscellaneous reference JSON, cross-Session references, public publication, or new derived capability.

## 7. Architectural Guarantees

Implementation must preserve:

- one canonical Note capability and identity;
- one normalization, authorship, containment, and provenance model;
- stable identity through correction;
- access through approved containment;
- bounded contextual references without authority transfer;
- presentation and derived-consumer independence;
- no duplicate Note model, store, or projection;
- no lifecycle or evidence ownership; and
- no architectural expansion beyond this contract.

## 8. Testing Authorization

Focused regression may prove:

- one canonical Note creation, retrieval, correction, and deletion path;
- one production normalization path with no downstream re-normalization;
- canonical Session containment and access-safe retrieval;
- authoritative author attribution and preservation through correction;
- bounded contextual-reference validation without ownership transfer;
- authoritative deletion behavior defined by AR-GC-003-01;
- presentation independence and source non-mutation; and
- absence of unauthorized capability expansion.

Tests shall exercise production paths and architectural guarantees rather than prescribe detailed interface styling or interaction.

## 9. Authorized Execution

After this contract passes its read-only audit and is committed to Git, one bounded ICE may implement only Sections 3 and 4 and the proof authorized by Section 8.

The ICE may inspect and evolve existing repository conventions but cannot resolve or implement excluded architecture. Any capability outside this contract requires separate approval.

## 10. Consequences

Production Notes must remain one independently owned canonical narrative capability composed through the existing Workspace.

Implementation choices remain subordinate to FN-GC-004, CS-GC-004, and the referenced authorities. This contract grants no authority to begin Photos, Documents, derived consumers, projections, collaboration, or Workspace redesign.
