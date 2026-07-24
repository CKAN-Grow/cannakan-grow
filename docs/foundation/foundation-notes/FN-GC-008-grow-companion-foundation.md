# Foundation Note FN-GC-008 — Grow Companion Foundation

**Status:** Foundational Architecture
**Captured:** July 24, 2026
**Related areas:** Grow Companion, Sessions, Continuous Working Context

## 1. Status

This note establishes the Grow Companion as Grow's canonical capability for maintaining the grower's continuous working context throughout one canonical Session.

It defines the capability only. It does not define composition, implementation, persistence, presentation, intelligence, recommendations, or user-interface behavior. It authorizes only CS-GC-008 — Grow Companion Composition Specification.

## 2. Purpose

Answer one foundational question:

**What is the Grow Companion?**

The Grow Companion maintains coherent working context as a grower moves through a Session. It preserves awareness of where the grower is within that Session and continuity as the Session progresses.

This note does not define how the Grow Companion participates, how it is presented, what intelligence it may later consume, or how it relates to Workspace or other capabilities.

## 3. Authoritative Context

This decision inherits without redefining:

- [Grow Foundation](../grow-foundation.md);
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](./FN-004-session-lifecycle-and-grow-companion.md);
- [Grow Companion Composition Specification](../../product/grow-sessions/grow-companion-composition-specification.md);
- [IC-GC-002B — Grow Companion Structural Foundation](../implementation-contracts/IC-GC-002B-grow-companion-structural-foundation.md);
- [FN-GC-005 — Workspace Foundation](./FN-GC-005-workspace-foundation.md); and
- the approved canonical capability architecture completed through GC-007.

Those authorities remain controlling for canonical Session identity, Session lifecycle, phase state, ownership, privacy, evidence, canonical capabilities, and existing architectural boundaries.

## 4. Canonical Definition

The Grow Companion is the canonical capability responsible for maintaining the grower's continuous working context throughout one canonical Session.

Continuous working context means:

- awareness of the grower's current place within the authoritative Session;
- continuity as that Session progresses; and
- one coherent working context across the Session lifecycle.

The Grow Companion maintains context about the Session. It does not become the Session or acquire authority over Session identity, lifecycle, phases, chronology, or evidence.

## 5. Canonical Authority

The Grow Companion owns only:

- continuous working context;
- active user context within that continuous working context; and
- contextual coordination necessary to keep that working context coherent.

This authority is contextual, not domain authority. It creates no authority over the canonical capabilities or records encountered through the working context.

The Grow Companion owns no:

- canonical record;
- Session, phase, or lifecycle authority;
- chronology;
- Workspace capability;
- analytics;
- recommendation;
- intelligence or AI;
- evidence;
- authorization model;
- presentation behavior; or
- business semantic.

## 6. Session Relationship

One Grow Companion corresponds to exactly one canonical Session.

The canonical Session remains authoritative for its identity, ownership, lifecycle, phases, chronology, and evidence. The Grow Companion derives its Session awareness from that authority and cannot replace, reinterpret, duplicate, or weaken it.

The Grow Companion is not a parallel Session and cannot make another Session record, lifecycle, phase model, or evidence system necessary for continuity.

## 7. Capability Boundaries

The Grow Companion is:

- not a second Session;
- not a Workspace capability;
- not an intelligence engine;
- not an analytics or recommendation capability;
- not an evidence capability; and
- not a presentation layer.

Canonical capabilities remain independently authoritative. The Grow Companion's continuous working context cannot make another capability dependent upon it for identity, validity, ownership, or meaning.

This note establishes no relationship between the Grow Companion and any other capability beyond its one-to-one correspondence with the authoritative Session.

## 8. Foundational Invariants

- One Grow Companion corresponds to one canonical Session.
- One Grow Companion maintains one continuous working context for that Session.
- The canonical Session remains authoritative.
- Continuous working context is not a canonical domain record.
- The Grow Companion owns no canonical record.
- The Grow Companion creates no duplicate authority.
- The Grow Companion creates no parallel Session.
- The Grow Companion owns no lifecycle, chronology, evidence, analytics, recommendation, intelligence, authorization, presentation, or business authority.
- Canonical capabilities remain independently authoritative.
- Composition, implementation, and presentation cannot expand this Foundation by precedent.

## 9. Outside This Foundation

This note does not define or authorize:

- Workspace, Timeline, Calendar, Guidance, GEE, or Presentation relationships;
- Tasks, Events, Notes, Photos, Documents, Sources, Breeders, Varieties, or Seed Vault relationships;
- recommendations, intelligence, AI, analytics, notifications, or automation;
- navigation, interface, layout, controls, responsive behavior, or other presentation;
- implementation, runtime behavior, front-end behavior, persistence, schema, migrations, APIs, or storage; or
- a composition mechanism or capability integration.

Those matters require their proper later architectural artifacts.

## 10. Consequences and Next Workflow

Future Grow Companion architecture must preserve one canonical continuous working context without creating another Session, canonical record system, Workspace capability, intelligence engine, evidence authority, or presentation authority.

After this Foundation Note passes its read-only audit, completes its documentation Git step, and is formally closed, the only authorized next artifact is:

**CS-GC-008 — Grow Companion Composition Specification**

That specification may define approved participation with Session, Workspace, Timeline, Guidance, GEE, Presentation, and existing platform capabilities. It cannot reinterpret or expand this Foundation.

No composition or implementation is authorized by this note.
