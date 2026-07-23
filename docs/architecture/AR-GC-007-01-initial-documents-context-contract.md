# AR-GC-007-01 — Initial Documents Context Contract

**Status:** Accepted
**Applies to:** First canonical Documents production slice

## 1. Purpose

Resolve the single contextual decision that blocked ICE-GC-007-1 by establishing the minimum relationship required for canonical Documents to participate through the existing Workspace Composition mechanism.

This record does not modify FN-GC-007, CS-GC-007, or IC-GC-007, authorize implementation, or approve another Documents capability.

## 2. Decision Context

This decision inherits:

- [Grow Foundation](../foundation/grow-foundation.md);
- [FN-GC-007 — Documents Foundation](../foundation/foundation-notes/FN-GC-007-documents-foundation.md);
- [CS-GC-007 — Documents Composition Specification](../product/grow-sessions/documents-composition-specification.md);
- [IC-GC-007 — Documents Composition](../foundation/implementation-contracts/IC-GC-007-documents-composition.md);
- [FN-GC-005 — Workspace Foundation](../foundation/foundation-notes/FN-GC-005-workspace-foundation.md);
- [CS-GC-005 — Workspace Composition Specification](../product/grow-sessions/workspace-composition-specification.md); and
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../foundation/foundation-notes/FN-004-session-lifecycle-and-grow-companion.md).

Those documents remain authoritative for Document identity, ownership, structured meaning, Session authority, Workspace coordination, privacy, authorization, lifecycle, evidence, and presentation.

## 3. Architectural Gap

The existing Workspace Composition mechanism coordinates canonical capability outputs within one canonical Session.

FN-GC-007 and CS-GC-007 require separately approved contextual relationships, while IC-GC-007 prohibits implementation from selecting one. Without an approved Session relationship, the first Documents production slice cannot participate through Workspace Composition without inventing architecture.

This record resolves only that missing contextual authority.

## 4. Accepted Decision

The first Documents production slice uses exactly one contextual relationship:

**Every first-slice canonical Document references exactly one canonical Session for Workspace participation.**

The Session reference provides canonical Workspace context only. It is not Document ownership or containment, and it transfers no Session identity, lifecycle, retention, evidence, authorization, or business authority to Documents.

The Document remains independently owned, authoritative, and valid outside Workspace and when the referenced Session is unavailable.

No Task, Event, Note, Photo, Plant Group, phase, Community, profile, report, or other contextual relationship is approved by this record.

## 5. Validation Authority

Existing canonical Session retrieval and application authorization paths validate that:

- the referenced Session identity is canonical;
- the Session is available to the acting user under existing authorization; and
- the relationship identifies exactly one Session.

Documents and Workspace Composition consume already-authorized context. They create no independent authorization decision, weaker access boundary, or alternate Session identity.

An invalid, inaccessible, or cross-owner Session reference cannot be established or substituted.

## 6. Unavailable Context

When the referenced Session is unavailable to a viewer, the Document is excluded from that Session's Workspace composition.

The Document remains canonical under its own ownership, privacy, lifecycle, and retention authority. Context unavailability cannot:

- delete or invalidate the Document;
- reassign it to another Session;
- rewrite its structured meaning;
- expose it through the unavailable Session; or
- grant Documents, Workspace, or presentation authority over the Session.

Temporary retrieval failure changes neither record nor their lifecycle state. Session deletion cannot be blocked by the contextual Document reference and cannot delete the Document through that reference.

## 7. Mutation Boundaries

The canonical Session reference is fixed when the first-slice Document is established.

Document correction preserves canonical Document identity and may change only Document-owned values authorized by the governing contract. It cannot:

- move the Document to another Session;
- mutate or restore the referenced Session;
- alter Session or another capability's ownership, lifecycle, evidence, or meaning;
- create another contextual relationship; or
- grant Workspace or presentation mutation authority.

Context loss or deletion is not Document correction and cannot silently replace or clear the canonical reference.

## 8. Persistence Boundary

The canonical Document record preserves one stable reference to the contextual canonical Session.

That reference is the sole contextual persistence authorized for the first slice. It does not authorize Session containment, a relationship table, miscellaneous association JSON, polymorphic context storage, duplicate Session identity, parallel Document identity, or presentation-owned state.

This decision defines the contextual persistence boundary only. It defines no schema, migration, database representation, storage provider, upload path, technical representation, API, or implementation mechanism.

## 9. Architectural Preservation

- One canonical Document retains one canonical identity and structured meaning.
- Every first-slice Document has exactly one canonical Session reference for Workspace participation.
- The reference is context, not ownership or containment.
- Context transfers no ownership, lifecycle, retention, authorization, evidence, or business authority.
- Session and Document authority remain canonical and independent.
- Documents own no authorization or cross-capability lifecycle.
- Workspace coordinates already-authorized participation and owns no Document record.
- Presentation remains replaceable and non-authoritative.
- Unavailable context causes no deletion, reassignment, or reinterpretation.
- No additional contextual relationship is approved.

## 10. Decision Scope

This decision applies only to the first production slice authorized by IC-GC-007.

It is not precedent for a future Documents capability, production slice, contextual relationship, or Workspace capability. Storage, upload, representations, rendering, extraction, search, publication, collaboration, AI, GEE, Reports, Reflection, and all other Documents relationships remain deferred.

## 11. Contract Impact

This decision restores the contextual authority required by the production slice already authorized by IC-GC-007. It does not add production scope or change that contract's boundaries.

IC-GC-007 requires no revision because it already authorizes only composition participation approved by authoritative architecture and prohibits unapproved relationships.

After this Architecture Record passes its read-only audit, completes its Git step, and is formally closed, the next authorized artifact is:

**ICE-GC-007-1 — Execute Documents Composition**

This record does not itself authorize implementation.
