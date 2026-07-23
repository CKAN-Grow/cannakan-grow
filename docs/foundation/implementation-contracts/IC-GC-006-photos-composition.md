# IC-GC-006 — Photos Composition

**Status:** Draft — Requires Read-Only Implementation Contract Audit
**Capability:** Photos Composition
**Authority:** FN-GC-006 and CS-GC-006
**Scope:** First independently valuable production foundation for canonical Photos

## 1. Purpose

Authorize the first bounded production slice of the Photos capability established by FN-GC-006 and CS-GC-006.

This contract authorizes implementation only. It does not establish, reinterpret, extend, or replace architecture, and it does not authorize the complete Photos capability. Implementation establishes foundations before features.

## 2. Authoritative Context

Implementation must preserve and follow:

- [Grow Foundation](../grow-foundation.md);
- [FN-GC-006 — Photos Foundation](../foundation-notes/FN-GC-006-photos-foundation.md); and
- [CS-GC-006 — Photos Composition Specification](../../product/grow-sessions/photos-composition-specification.md).

Those documents remain authoritative. If implementation requires architectural interpretation rather than execution, execution must stop and report the ambiguity pending a separately approved architectural artifact.

## 3. Authorized Production Slice

One bounded implementation may establish:

- the canonical Photos domain model;
- canonical Photo identity;
- canonical Photo ownership;
- approved contextual composition participation;
- approved Workspace Composition participation; and
- approved Presentation Layer participation.

This is the minimum production foundation for later, separately authorized Photos slices. No other production capability is authorized.

## 4. Authorized Integrations

Implementation may integrate only through composition boundaries established by CS-GC-006.

It may not infer an additional capability relationship, introduce another composition mechanism, or grant composition any architectural authority.

## 5. Minimum Implementation Principle

Implementation must realize the smallest complete and independently valuable production slice satisfying Section 3. It must establish a stable foundation without speculative implementation for future slices.

It must not anticipate later Photos capabilities, add speculative extensibility, optimize beyond this slice, or implement a future production slice. Every capability not expressly authorized remains out of scope.

## 6. Explicitly Deferred Capabilities

This contract does not authorize:

- upload or camera capture;
- storage implementation;
- image processing, thumbnails, or derived renditions;
- galleries or editing;
- Community publication, social sharing, or moderation;
- AI or GEE behavior;
- Grow Companion behavior; or
- any future Photos capability.

Each requires a future production slice with independent architectural authorization.

## 7. Implementation Boundaries

Implementation must not introduce:

- a new architectural primitive, ownership model, authority model, or dependency direction;
- a new composition mechanism, contextual authority, or business semantic;
- new privacy, lifecycle, publication, or evidence authority; or
- a new media abstraction.

Implementation may not create duplicate Photo identity or authority, reverse a dependency, or make another capability responsible for Photo validity or meaning.

If implementation requires architectural expansion, execution must stop pending a separately approved architectural artifact.

## 8. Architectural Guarantees

Implementation must preserve:

- canonical Photo identity and ownership;
- approved contextual composition boundaries;
- chronology, privacy, and lifecycle boundaries;
- Workspace Composition participation;
- Presentation Layer independence;
- cross-capability independence; and
- the authority and dependency direction established by FN-GC-006 and CS-GC-006.

Implementation realizes these guarantees. It cannot weaken, reinterpret, duplicate, or bypass them.

## 9. Production Slice Completion

The completed slice must be independently valuable, establish a stable canonical production foundation, and require no speculative implementation for later slices.

Future production slices must extend this implementation without modifying its architectural foundation.

## 10. Verification Authorization

A bounded execution may verify only:

- conformity to FN-GC-006 and CS-GC-006;
- correctness of the production slice authorized by Section 3;
- preservation of canonical Photo identity, ownership, and architectural boundaries;
- absence of duplicate authority, composition mechanisms, or dependency paths; and
- repository integrity.

Verification cannot authorize architectural or capability expansion.

## 11. Implementation Acceptance Criteria

Implementation conforms only when:

1. canonical Photos retain one stable canonical identity and canonical ownership;
2. only composition participation approved by authoritative architecture is implemented;
3. Workspace Composition coordinates Photos without acquiring Photo authority;
4. Presentation remains replaceable and non-authoritative;
5. chronology, privacy, lifecycle, evidence, and business authority remain with their authoritative capabilities;
6. Photos and participating capabilities remain independently valid and useful;
7. no duplicate Photo, composition mechanism, authority, or reversed dependency is introduced;
8. the production foundation is independently valuable without a deferred feature; and
9. no excluded or future Photos capability is implemented.

## 12. Next Authorized Artifact

After this contract passes its read-only audit, completes its documentation Git step, and is formally closed, it authorizes only:

**ICE-GC-006-1 — Execute Photos Composition**

No implementation is authorized before those prerequisites are complete.
