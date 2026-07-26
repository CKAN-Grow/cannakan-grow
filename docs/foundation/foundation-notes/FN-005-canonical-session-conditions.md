# Foundation Note FN-005 — Canonical Session Conditions

**Status:** Foundational Architecture
**Capability:** Capability 2A — Session Conditions Foundation
**Layer:** Canonical Platform
**Governing document:** [Grow Platform Architecture](../../platform/grow-platform-architecture.md)
**Related composition:** CS-001.2 — Session Orientation
**Next document:** Capability 2A — Session Conditions Composition Specification

## Purpose

This Foundation Note establishes Session Conditions as the canonical platform
concern describing the factual operational circumstances under which a Session
occurs.

It establishes canonical ownership, architectural boundaries, platform
responsibilities, historical truth, and deterministic behavior. It does not
define interfaces, workflows, forms, fields, schemas, APIs, persistence, or
implementation mechanisms.

## Architectural Decision

The Session owns its canonical Session Conditions.

The Canonical Platform owns their meaning, authority, applicability,
provenance, normalization, and historical preservation. Products compose
Session Conditions into understandable experiences. Presentation delivers
those experiences.

The dependency direction is:

```text
Canonical Session
    owns
Canonical Session Conditions
    composed by
Products
    delivered through
Presentation
```

Products and Presentation may consume Session Conditions. Neither may become
an authoritative source of them.

## Definition

Session Conditions are canonical facts describing the operational
circumstances under which a Session, or a bounded part of a Session, occurs.

A condition describes circumstances. It is not itself an activity,
observation, measurement, outcome, reflection, or item of evidence.

The condition taxonomy, required conditions, and supported applicability
scopes are deferred to later authorized architecture.

## Relationship to Session Context

[FN-004 — Session Context, Operational Intelligence & Evidence
Readiness](./FN-004-session-lifecycle-and-grow-companion.md) remains unchanged
and remains the sole canonical owner of Session Context.

Session Conditions do not replace, partition, redefine, or supersede Session
Context. Any future interaction between Session Conditions and Session Context
requires separate architectural authorization.

## Canonical Ownership and Responsibilities

Every canonical Session Condition belongs to one canonical Session. Conditions
belonging to one Session do not automatically apply to another.

The Canonical Platform owns:

- the canonical meaning and authoritative value of each condition;
- the Session to which it belongs;
- where and when it applies;
- its provenance;
- its authoritative normalization;
- its correction boundaries; and
- its historical preservation.

Products may organize, explain, and compose canonical conditions. They may not
define a parallel conditions model, maintain a second source of Current
Conditions, or overwrite historical truth for product convenience.

Presentation may display conditions and collect input through authorized
product behavior. It may not determine canonical truth, applicability,
provenance, or historical meaning.

## Relationship to Session Lifecycle

Session Conditions may legitimately change during a Session. They do not own,
advance, complete, reopen, or reactivate the Session lifecycle.

Lifecycle authority remains with the existing canonical lifecycle
architecture. Any future lifecycle interaction requires separate
architectural authorization.

## Relationship to Session Orientation

Session Orientation remains product composition. Session Conditions remain
canonical truth.

Orientation may consume Session Conditions through later authorized
composition. It may never own, normalize, or redefine them.

## Separation of Concerns

Session Conditions remain distinct from:

- Session Context;
- Session Lifecycle;
- Session Identity;
- Tasks;
- Events;
- Notes;
- Evidence;
- Measurements;
- Outcomes;
- Reflections;
- product state; and
- presentation state.

These capabilities and concerns retain their existing ownership and authority.
Contextual association transfers no ownership, lifecycle, authorization,
evidence, or business authority.

## Conditions Over Time

Conditions may change as operational circumstances change. A condition that
was true during an earlier period remains historically true for that period.
Later conditions must not retroactively replace it.

The architecture distinguishes:

- **operational change**, where earlier circumstances were true and different
  circumstances later became true; and
- **correction**, where recorded information was inaccurate.

The mechanisms for change and correction are deferred.

## Current Conditions

Current Conditions are a deterministic projection of canonical Session
Conditions and their applicability. They are not an independently owned source
of truth.

Products may present Current Conditions. They may not persist a competing
authoritative model that can disagree with canonical Session Conditions.

## Defaults and Missing Conditions

A suggested, prefilled, remembered, selected, or displayed value is not a
canonical condition unless established through an authorized canonical action.

Unknown, absent, and not-applicable conditions must remain distinguishable.
Products and Presentation must not convert them silently into canonical facts.

## Normalization

Session Conditions are validated and normalized at one authoritative canonical
boundary:

```text
Authorized condition input
        ↓
Canonical validation and normalization
        ↓
Canonical Session Conditions
        ↓
Product composition
        ↓
Presentation
```

Products and Presentation may adapt canonical conditions for delivery. They
may not perform a second canonical normalization.

## Determinism

Given the same canonical Session, canonical conditions, applicability rules,
point in Session chronology, and authorization context, the Canonical Platform
must determine the same applicable Current Conditions.

Canonical results must not depend on screen order, navigation history,
rendering order, component state, duplicated product records, or presentation
defaults. Insufficient canonical truth remains unknown or unresolved rather
than being guessed.

## Architectural Invariants

### INV-SCN-001 — Session ownership

Canonical Session Conditions belong to one canonical Session.

### INV-SCN-002 — Canonical Platform ownership

The Canonical Platform owns the meaning, authority, applicability, provenance,
normalization, and history of Session Conditions.

### INV-SCN-003 — FN-004 authority

FN-004 remains the sole canonical owner of Session Context.

### INV-SCN-004 — No duplicate truth

Products and Presentation maintain no competing authoritative Session
Conditions.

### INV-SCN-005 — Conditions are not Context

Session Conditions neither replace nor redefine Session Context.

### INV-SCN-006 — Conditions are not Lifecycle

Session Conditions own no lifecycle authority.

### INV-SCN-007 — Conditions are not Orientation

Session Orientation may consume conditions but does not own them.

### INV-SCN-008 — Conditions are not Activities

Conditions remain distinct from Tasks, Events, Notes, observations,
measurements, outcomes, reflections, and evidence.

### INV-SCN-009 — Conditions are not presentation state

Navigation, component, form, and display state are not canonical Session
Conditions.

### INV-SCN-010 — Historical truth is preserved

Later conditions do not retroactively overwrite conditions that previously
applied.

### INV-SCN-011 — Correction is not operational change

Correcting inaccurate information remains distinct from a real change in
operational circumstances.

### INV-SCN-012 — Current Conditions are derived

Current Conditions are a deterministic projection, not a second source of
truth.

### INV-SCN-013 — Defaults are not facts

Product and presentation defaults do not become canonical conditions without
an authorized canonical action.

### INV-SCN-014 — Canonical normalization occurs once

Authoritative normalization belongs to one canonical boundary.

### INV-SCN-015 — Product replaceability is preserved

A Product may be replaced without migrating or redefining Session Conditions.

### INV-SCN-016 — Presentation replaceability is preserved

Presentation may be replaced without changing canonical Session Conditions.

## Deferred Decisions

This Foundation Note does not determine:

- condition taxonomy;
- required or optional conditions;
- inheritance;
- external relationships;
- lifecycle interactions;
- correction mechanics;
- deletion or availability;
- persistence;
- APIs or schemas;
- interfaces or workflows;
- automation; or
- artificial-intelligence behavior.

Each requires later, explicit architectural authorization.

## Next Architectural Step

This Foundation Note authorizes only:

**Capability 2A — Session Conditions Composition Specification**

That specification must define how Products compose canonical Session
Conditions without redefining their ownership or authority. It is not authored
by this note.

## Foundational Decision

Session Conditions are canonical facts describing the operational
circumstances under which a Session occurs. The Session owns them, and the
Canonical Platform preserves their authority, applicability, provenance,
normalization, and historical truth.

Products compose Session Conditions. Presentation delivers those
compositions. Neither becomes authoritative.

FN-004 remains unchanged and remains the sole canonical owner of Session
Context.
