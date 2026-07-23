# CS-GC-004 — Growing Workspace Notes Composition Specification

**Status:** Draft — Requires Architecture Approval  
**Product Area:** Grow Sessions  
**Authority:** FN-GC-004 and approved Growing Workspace architecture  
**Scope:** Composition of canonical Notes with existing Workspace capabilities

## 1. Status

This specification defines composition only. It does not implement Notes or authorize persistence, schema, migrations, interface behavior, or attachments.

It follows [FN-GC-004 — Growing Workspace Notes Foundation](../../foundation/foundation-notes/FN-GC-004-growing-workspace-notes-foundation.md) and authorizes only a follow-on implementation contract after this specification is audited and approved.

## 2. Purpose

Define how canonical Notes collaborate with existing Growing Workspace capabilities while preserving independent ownership.

Composition defines relationships. It does not redefine ownership, identity, lifecycle, authorization, normalization, or evidence authority.

This specification inherits:

- [Grow Foundation](../../foundation/grow-foundation.md);
- [CS-GC-003 — Growing Workspace Composition Specification](./growing-workspace-composition-specification.md);
- [IC-GC-003A — Growing Workspace Shell](../../foundation/implementation-contracts/IC-GC-003A-growing-workspace-shell.md);
- [AR-GC-003-01 — Workspace Time, State, Correction & Retention Semantics](../../architecture/AR-GC-003-01-workspace-time-state-correction-and-retention-semantics.md);
- [IC-GC-003B — Growing Workspace Tasks](../../foundation/implementation-contracts/IC-GC-003B-growing-workspace-tasks.md);
- [AR-GC-003-02 — Growing Workspace Event Semantics & Vocabulary](../../architecture/AR-GC-003-02-growing-workspace-event-semantics-and-vocabulary.md);
- [IC-GC-003C — Growing Workspace Events](../../foundation/implementation-contracts/IC-GC-003C-growing-workspace-events.md); and
- [IC-GC-003D — Growing Workspace Temporal Projections](../../foundation/implementation-contracts/IC-GC-003D-growing-workspace-temporal-projections.md).

## 3. Composition Principles

Canonical capabilities collaborate through stable references and access-safe reads. They do not exchange ownership, duplicate identity or lifecycle, duplicate authorization, reinterpret one another, or re-normalize one another.

Containment governs access. References provide context. Neither transfers ownership or authority.

Presentation renders canonical capabilities and never becomes authority. Derived capabilities consume canonical capabilities and never become canonical authority.

Each canonical capability owns normalization of its raw persistence representation. Composition consumes canonical records directly.

## 4. Narrative Layer

The Growing Workspace composes three independent canonical capability families:

| Capability | Narrative position | Canonical responsibility |
|---|---|---|
| Tasks | “I need to do this.” | Intended user work |
| Events | “This occurred.” | Factual user-recorded occurrence |
| Notes | “This is what I know.” | Intentionally preserved authored narrative |

These positions clarify collaboration without creating a shared model. Each capability remains independently authoritative for its identity, content, provenance, mutation, and applicable lifecycle.

A Note may describe work or an occurrence without becoming a Task or Event.

## 5. Workspace Containment

The authorized Growing Workspace contains Notes under the canonical Session boundary established by CS-GC-003 and FN-GC-004.

Containment governs access but does not transfer Note narrative ownership to the Workspace shell. The shell registers and presents the capability without storing or interpreting Note records.

Notes do not alter Workspace, Session, phase, Task, Event, Plant Group, or evidence lifecycle.

## 6. Canonical References

A Note may carry bounded references to an authorized canonical Session, Task, Event, or Plant Group. Future approved composition may permit references to Photos or Documents.

A reference:

- identifies canonical context;
- resolves through access-safe reads;
- remains within the authorized containment boundary; and
- preserves the referenced capability's canonical identity.

A reference never transfers ownership, lifecycle, authorization, normalization, mutation, or evidence authority. Referenced capabilities remain authoritative for their own behavior.

This specification does not authorize arbitrary associations, miscellaneous reference JSON, cross-Session references, attachments, or new reference targets.

## 7. Derived Consumers

Future Activity, Search, Reports, Reflection, Exports, Analytics, GEE, or AI capabilities may consume canonical Notes only under separately approved architecture.

Derived consumers may reference, summarize, analyze, or present Notes. They cannot overwrite, replace, correct, normalize, or become indistinguishable from the canonical authored Note.

Derived output remains independently identifiable and attributable. A derived consumer gains no Note mutation or broader Workspace authority merely by reading a Note.

## 8. Presentation

Presentation consumes access-safe canonical Notes and may render them as cards, journals, feeds, search results, side panels, reports, or Workspace surfaces.

These are presentation forms, not Note identities, stores, or authorization boundaries. Presentation never owns Notes, changes Note authority, or persists a competing representation.

Desktop and mobile presentations consume the same canonical Note and composition model.

## 9. Temporal Relationships

Notes remain independent of the Temporal Projection layer established by IC-GC-003D.

Notes are not automatically Timeline or Calendar inputs. Record creation or correction time is record chronology, not automatic proof of when the narrative subject occurred.

Any future Note temporal projection requires separately approved architecture and cannot be inferred from this specification.

## 10. Architectural Invariants

- One canonical Note identity, ownership model, provenance model, and normalization path remains authoritative.
- Notes, Tasks, and Events remain independent canonical capabilities.
- Containment governs access; references provide context.
- References transfer no ownership, lifecycle, authorization, or evidence authority.
- Composition consumes canonical records and does not re-normalize them.
- Derived consumers remain derived and independently attributable.
- Presentation renders canonical Notes and never becomes authority.
- Notes do not mutate Workspace or capability lifecycle.
- Notes are not automatic Temporal Projection inputs.
- Notes remain valid without Photos or Documents.

## 11. Non-Goals

This specification does not define implementation, schema, migrations, persistence, storage, editor behavior, UI, search or indexing implementation, attachments, Photos, Documents, Reports, Reflection, GEE, AI behavior, synchronization, Timeline integration, or Calendar integration.

It also does not authorize reminders, notifications, recurrence, scheduling, automation, public publishing, social sharing, or external integrations.

## 12. Consequences

Future Notes work must compose through stable canonical references and access-safe reads rather than duplicating another capability's data or authority.

Workspace and derived presentations may evolve independently without changing the canonical Note. Cross-capability collaboration remains bounded by containment, authorization, and source ownership.

Implementation and physical-design decisions remain deferred to their required approval phases.

## 13. Follow-On Architecture

After this specification passes its read-only composition audit and is committed to Git, the next authorized artifact is **IC-GC-004 — Growing Workspace Notes**.

That contract may define bounded implementation authority consistent with FN-GC-004 and this specification. This document does not authorize implementation.
