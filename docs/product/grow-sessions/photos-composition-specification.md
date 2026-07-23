# CS-GC-006 — Photos Composition Specification

**Status:** Architecture Draft — Requires Read-Only Audit
**Product Area:** Photos
**Authority:** FN-GC-006 and approved Workspace architecture
**Scope:** Architecture-only composition of canonical Photos

## 1. Purpose

This specification defines the canonical composition architecture through which Photos participate in Grow while preserving their independent identity, ownership, chronology, privacy, lifecycle, and authority.

It defines composition only. It does not redefine Photos, authorize implementation, or define user interface behavior.

## 2. Authoritative Context

This specification inherits:

- [Grow Foundation](../../foundation/grow-foundation.md);
- [FN-GC-006 — Photos Foundation](../../foundation/foundation-notes/FN-GC-006-photos-foundation.md);
- [FN-GC-005 — Workspace Foundation](../../foundation/foundation-notes/FN-GC-005-workspace-foundation.md);
- [CS-GC-005 — Workspace Composition Specification](./workspace-composition-specification.md);
- [AR-GC-003-01 — Workspace Time, State, Correction & Retention Semantics](../../architecture/AR-GC-003-01-workspace-time-state-correction-and-retention-semantics.md);
- [IC-GC-003B — Growing Workspace Tasks](../../foundation/implementation-contracts/IC-GC-003B-growing-workspace-tasks.md);
- [IC-GC-003C — Growing Workspace Events](../../foundation/implementation-contracts/IC-GC-003C-growing-workspace-events.md);
- [IC-GC-003D — Growing Workspace Temporal Projections](../../foundation/implementation-contracts/IC-GC-003D-growing-workspace-temporal-projections.md); and
- [IC-GC-004 — Growing Workspace Notes](../../foundation/implementation-contracts/IC-GC-004-growing-workspace-notes.md).

Those documents remain authoritative for identity, ownership, chronology, privacy, authorization, lifecycle, retention, evidence, business semantics, Workspace coordination, and presentation.

## 3. Composition Philosophy

Photos remain independently authoritative.

Composition provides context and organizes collaboration without creating or transferring authority. It is additive: participation in a context does not transform the Photo or another participating capability.

One canonical Photo may participate in many approved contexts while remaining one canonical Photo. Architectural simplicity takes precedence over another identity, relationship, or composition abstraction.

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

Identity establishes authorized user context. Photo composition consumes that context without owning or reinterpreting identity, privacy, or authorization.

### 4.2 Canonical Capabilities

Canonical Capabilities establish domain authority. Photos retain Photo identity, ownership, content association, chronology, privacy state, lifecycle, and Photo-specific semantics.

Other participating capabilities retain their own authority. Composition does not merge capability identities or responsibilities.

### 4.3 Workspace Composition

Workspace Composition coordinates approved participation through stable references and access-safe canonical outputs.

It provides context without copying a Photo, changing Photo state, or acquiring Photo authority.

### 4.4 Presentation Layer

Presentation consumes coordinated canonical state. It remains replaceable and non-authoritative.

Authority remains local to the owning capability. It never flows upward, and dependencies never reverse.

## 5. Composition Ownership

Composition may:

- establish later-approved contextual relationships;
- organize authorized capability participation;
- coordinate visibility of already-authorized state;
- coordinate presentation; and
- preserve stable canonical references.

Composition cannot:

- transfer ownership or create authority;
- redefine identity, chronology, privacy, lifecycle, evidence, or business semantics;
- create a second canonical Photo;
- normalize or persist a duplicate Photo;
- publish, delete, correct, or reinterpret a Photo;
- mutate a participating capability; or
- replace capability-owned authorization.

Composition owns only coordination. Every domain decision remains with its canonical capability or other authoritative architecture.

## 6. Contextual Composition

Photos participate through approved contextual references.

A contextual relationship:

- provides architectural meaning;
- preserves stable canonical identity;
- preserves dependency direction;
- transfers no ownership, authority, lifecycle, privacy, or evidence meaning;
- does not make either participant dependent on the other for validity; and
- cannot silently reassign a Photo when context becomes unavailable.

One Photo may participate in multiple approved relationships without acquiring another identity or being copied into another canonical record.

This specification establishes the composition rule, not a final relationship set. The individual capabilities with which Photos may form contextual relationships, relationship validation, unavailable-context behavior, and mutation boundaries require later architectural authorization before implementation.

No miscellaneous association model, arbitrary relationship graph, or parallel contextual identity is authorized.

## 7. Cross-Capability Independence

Photos remain independently useful without Workspace, Sessions, Tasks, Events, or Notes.

Workspace, Sessions, Tasks, Events, Notes, and Temporal Projections remain independently useful without Photos.

Composition permits collaboration without making:

- Photos responsible for another capability's validity or meaning;
- another capability responsible for Photo validity or meaning;
- context responsible for ownership;
- presentation responsible for persistence; or
- Workspace responsible for domain authority.

Capability removal may reduce available context but cannot corrupt or reinterpret the remaining canonical records.

## 8. Workspace Participation

Workspace coordinates Photos only through the approved Workspace Composition architecture.

Workspace acquires no Photo:

- identity;
- ownership;
- content authority;
- chronology;
- privacy or authorization;
- lifecycle or retention authority;
- normalization;
- evidence meaning; or
- business semantics.

Photos must join the existing Workspace Composition mechanism through later authorized integration. No parallel Photo composition layer, Workspace-owned Photo model, or separate presentation authority is permitted.

## 9. Presentation Composition

Presentation consumes canonical Photo state through approved composition.

A gallery, Session surface, profile, Community surface, report, mobile experience, or future presentation may render an authorized Photo without owning it or creating a second Photo.

Presentation cannot redefine Photo identity, ownership, chronology, privacy, contextual meaning, lifecycle, evidence meaning, or business semantics.

Multiple presentation experiences may coexist and consume the same canonical Photo. Their replacement or removal cannot invalidate the Photo.

This specification defines no layout, navigation, controls, styling, gallery behavior, or presentation implementation.

## 10. Architectural Invariants

- Photos own canonical Photos.
- Composition provides context.
- Context never becomes ownership or authority.
- Composition is additive and never transforms a capability.
- Authority remains local to the owning capability.
- Identity and dependencies never reverse.
- Workspace coordinates but does not own Photos.
- Presentation renders but does not own Photos.
- One canonical Photo may participate in many approved contexts.
- Multiple contexts and presentations create no duplicate Photo authority.
- Capabilities remain independently useful.
- Future consumers may consume Photos but cannot redefine them.
- No parallel Photo, relationship, composition, normalization, authorization, or presentation authority may be introduced.

## 11. Extensibility

Future capabilities may consume Photos only through separately approved composition boundaries.

They must preserve canonical Photo identity and authority, remain independently authoritative, and avoid requiring Photos or Workspace redesign.

The composition architecture remains stable as Grow evolves. New contextual relationships extend approved participation; they do not alter the Photos capability or this dependency direction.

## 12. Out of Scope

This specification does not define or authorize:

- implementation, runtime behavior, APIs, schema, migrations, or database design;
- a final contextual relationship set or relationship persistence;
- upload, camera, storage, security, processing, format, rendition, editing, or deletion mechanics;
- capture-time provenance or metadata extraction;
- galleries, presentation implementation, navigation, layouts, or controls;
- Community, sharing, publication, moderation, or social workflows;
- Timeline or Calendar participation;
- AI, recognition, classification, diagnosis, GEE, Grow Companion interpretation, or evidence classification;
- video, audio, Documents, or general Media architecture; or
- changes to Sessions, Tasks, Events, Notes, Temporal Projections, or Workspace.

## 13. Acceptance Principles

Photo composition is architecturally conformant only when:

1. one canonical Photo retains identity and authority across every approved context;
2. composition provides context without transferring ownership or authority;
3. participating capabilities remain independently useful and valid;
4. Workspace uses the existing canonical composition mechanism;
5. presentation remains replaceable and non-authoritative;
6. unavailable context cannot silently reassign or reinterpret a Photo;
7. no duplicate Photo, relationship, persistence, normalization, authorization, or evidence authority is created;
8. future capabilities can consume Photos without redefining Photos or Workspace; and
9. no implementation authority is inferred from this specification.

## 14. Next Authorized Artifact

After this specification passes its read-only architecture audit, completes its documentation Git step, and is formally closed, the only authorized next artifact is:

**IC-GC-006 — Photos Composition**

That implementation contract may authorize only bounded implementation already established by FN-GC-006 and this specification.

No implementation is authorized by this specification.
