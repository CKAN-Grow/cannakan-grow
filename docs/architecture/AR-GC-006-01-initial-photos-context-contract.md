# AR-GC-006-01 — Initial Photos Context Contract

**Status:** Accepted
**Applies to:** First canonical Photos production slice

## 1. Purpose

Resolve the single contextual decision blocking ICE-GC-006-1 by establishing the minimum relationship required for canonical Photos to participate in Grow.

This record does not modify FN-GC-006 or CS-GC-006, authorize implementation, or approve another Photos capability.

## 2. Decision Context

This decision inherits:

- [Grow Foundation](../foundation/grow-foundation.md);
- [FN-GC-006 — Photos Foundation](../foundation/foundation-notes/FN-GC-006-photos-foundation.md);
- [CS-GC-006 — Photos Composition Specification](../product/grow-sessions/photos-composition-specification.md);
- [IC-GC-006 — Photos Composition](../foundation/implementation-contracts/IC-GC-006-photos-composition.md);
- [FN-GC-005 — Workspace Foundation](../foundation/foundation-notes/FN-GC-005-workspace-foundation.md);
- [CS-GC-005 — Workspace Composition Specification](../product/grow-sessions/workspace-composition-specification.md);
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../foundation/foundation-notes/FN-004-session-lifecycle-and-grow-companion.md); and
- [CS-GC-004 — Growing Workspace Notes Composition Specification](../product/grow-sessions/growing-workspace-notes-composition-specification.md).

Those documents remain authoritative for Photo identity and ownership, Session authority, Workspace coordination, privacy, authorization, lifecycle, evidence, and presentation.

## 3. Accepted Decision

The first Photos production slice uses exactly one contextual relationship:

**Every canonical Photo belongs to exactly one canonical Session.**

The Session relationship is canonical containment. It establishes the Photo's Workspace and owner-access context without transferring Session identity, lifecycle, evidence, or business authority to Photos.

No Task, Event, Note, Plant Group, phase, Community, profile, report, or other contextual relationship is approved by this record.

## 4. Validation Authority

The authoritative Session and application authorization paths validate that:

- the referenced canonical Session exists;
- the Session is available to the acting user under existing authorization;
- the Photo owner is derived through that Session under existing ownership architecture; and
- the relationship identifies exactly one Session.

Photos and Workspace Composition consume that validated context. They create no independent authorization decision or weaker access boundary.

## 5. Unavailable Context

When the containing Session is unavailable to a viewer, the Photo is unavailable through Session and Workspace composition surfaces. Presentation must not expose, reassign, or infer replacement context.

Canonical Session deletion continues to govern deletion of Session-owned records under existing architecture. No orphan context, fallback Session, retained contextual copy, or silent reassignment is introduced.

Temporary retrieval failure does not change the Photo, its Session relationship, or either record's lifecycle state.

## 6. Mutation Boundaries

The canonical Session relationship is fixed when the canonical Photo is established.

Correction may change only Photo-owned values authorized by later contracts. It cannot:

- move the Photo to another Session;
- replace Session ownership;
- mutate the Session or another capability;
- alter Session, phase, Task, Event, Note, or evidence lifecycle;
- create another contextual relationship; or
- give Workspace or presentation mutation authority.

Context loss or deletion cannot be treated as correction and cannot silently reparent the Photo.

## 7. Persistence Boundary

The canonical Photo record preserves one stable reference to its containing canonical Session.

That reference is the sole contextual persistence authorized for the first slice. It does not authorize a relationship table, miscellaneous association JSON, polymorphic context system, duplicate Session identity, parallel Photo record, or presentation-owned copy.

This decision defines the persistence boundary only. It defines no schema, migration, storage provider, image storage, upload path, API, or implementation mechanism.

## 8. Architectural Invariants

- One canonical Photo retains one canonical identity.
- Every first-slice Photo has exactly one canonical Session context.
- Context never transfers ownership or domain authority.
- Session authority and authorization remain canonical and unchanged.
- Photos own no authorization or cross-capability lifecycle.
- Workspace coordinates already-authorized Photo participation and owns no Photo record.
- Presentation remains replaceable and non-authoritative.
- No unavailable context may cause silent reassignment.
- No additional contextual relationship is approved.

## 9. Deferred Decisions

All other Photo relationships and capabilities remain deferred, including Task, Event, Note, Plant Group, phase, Community, profile, Timeline, Calendar, report, and public contexts.

Storage, upload, capture, processing, renditions, galleries, editing, publication, sharing, moderation, capture-time provenance, AI, GEE, and Grow Companion behavior remain outside this decision.

## 10. Contract Impact

This decision resolves the contextual ambiguity blocking ICE-GC-006-1 without changing the production slice authorized by IC-GC-006.

IC-GC-006 already limits execution to architecturally approved composition participation, so it requires no scope revision. ICE-GC-006-1 may proceed only after this Architecture Record passes audit, completes its Git step, and is treated as authoritative during execution.
