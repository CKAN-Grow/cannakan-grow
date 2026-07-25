# CS-SC-001 — Session Conditions Composition

**Status:** Proposed
**Capability:** 2A — Session Conditions
**Layer:** Product Composition
**Foundation authority:** [FN-005 — Canonical Session Conditions](../../foundation/foundation-notes/FN-005-canonical-session-conditions.md)
**Related authority:** [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../../foundation/foundation-notes/FN-004-session-lifecycle-and-grow-companion.md)
**Related composition:** CS-001.2 — Session Orientation
**Next authorized artifact:** Session Conditions Implementation Contract

## 1. Purpose

This Composition Specification defines how Grow products compose canonical
Session Conditions into understandable Session experiences.

It establishes:

- the product responsibilities for organizing Session Conditions;
- the canonical inputs required by that composition;
- the required current, historical, and unresolved condition understandings;
- the relationship between Session Conditions and Session Orientation; and
- the boundaries between canonical truth, product composition, and
  presentation.

This document defines product composition only.

It does not define canonical ownership, persistence, schemas, APIs, migrations,
workflows, interface structures, or implementation mechanisms.

## 2. Composition Decision

Grow products may compose canonical Session Conditions into understandable
views of the circumstances under which a Session operates.

The authorized dependency is:

```text
Canonical Session Conditions
        ↓
Product Composition
        ↓
Presentation
```

Products may organize and explain canonical conditions.

They may not own, redefine, duplicate, or independently persist them.

## 3. Product Responsibility

The Session Conditions composition must help a person understand:

1. which conditions apply to the Session;
2. which conditions apply currently;
3. whether conditions changed over time;
4. which conditions are relevant to the part of the Session being viewed;
5. whether a value is canonical, proposed, missing, unresolved, or
   unavailable; and
6. whether a recorded difference represents an operational change or a
   correction.

These are product responsibilities.

They do not authorize a specific interface.

## 4. Canonical Inputs

The composition consumes authoritative canonical inputs, including where
applicable:

- Session identity;
- Session Conditions;
- condition applicability;
- Session chronology;
- condition provenance;
- correction state;
- Session lifecycle state; and
- viewer authorization.

The composition must not treat the following as canonical inputs:

- navigation state;
- presentation state;
- selected tabs;
- filters;
- visual defaults;
- local form state;
- cached display labels; or
- product-owned copies of condition data.

## 5. Condition Organization

Products may organize related Session Conditions into understandable groups.

Such groupings may help explain operational areas such as:

- method;
- environment;
- physical setting; and
- operational arrangement.

These examples are illustrative.

A product grouping is composition, not canonical classification, unless
separately authorized by the Canonical Platform.

Presentation headings and visual categories must not become new sources of
truth.

## 6. Composition Scope

The product must support condition understanding at the level established by
canonical applicability.

This may include:

### 6.1 Session-wide understanding

Conditions that apply broadly across the Session.

### 6.2 Period-relevant understanding

Conditions that apply during a bounded phase or period.

### 6.3 Record-relevant understanding

Conditions required to interpret a particular task, event, note, observation,
measurement, evidence item, outcome, or reflection.

The composition must not invent a narrower or broader scope than canonical
truth establishes.

## 7. Current Conditions

The product may compose **Current Conditions**.

Current Conditions are a deterministic product understanding of the canonical
conditions applicable at a defined point in Session chronology.

They are not a separately owned record.

The composition may:

- organize currently applicable conditions;
- distinguish broad and narrower applicability;
- communicate missing or unresolved conditions; and
- provide canonical inputs to Session Orientation.

It may not:

- select current conditions from retrieval order alone;
- treat the most recently displayed value as current;
- infer current conditions from presentation state; or
- maintain a competing current-condition store.

Equivalent canonical inputs must produce equivalent Current Conditions.

## 8. Historical Conditions

The product must preserve an understandable representation of condition
history when canonical conditions changed.

Historical composition must preserve:

- which condition applied previously;
- the period in which it applied, when canonically known;
- which later condition replaced or qualified it; and
- whether the difference represents an operational change or a correction.

Later conditions must not be presented as though they applied to earlier
Session records.

Historical simplification is permitted only when canonical meaning remains
intact.

## 9. Operational Change and Correction

The product must preserve the canonical distinction between:

### Operational change

The real circumstances of the Session changed.

The earlier condition remains historically true.

### Correction

A recorded condition was inaccurate and was corrected.

The product must not:

- present correction as a real operational transition;
- present a real transition as invalidation of earlier truth; or
- silently decide which meaning applies.

The authorized commands and correction mechanics belong to the Implementation
Contract.

## 10. Declaring and Changing Conditions

Products may guide users through authorized declaration and change behavior.

The composition must distinguish between:

- proposed values;
- prefilled values;
- unconfirmed selections;
- canonically established values; and
- unresolved or rejected values.

A value becomes canonical only through an authorized canonical operation.

The following must not establish truth by themselves:

- viewing a default;
- opening a workflow;
- selecting a visual option;
- navigating between surfaces;
- completing a presentation step; or
- leaving temporary input in local state.

When changing an established condition, the product must distinguish between:

- recording a real operational change; and
- correcting inaccurate information.

The product must not silently choose between them.

## 11. Missing and Unresolved Conditions

The composition must represent incomplete condition truth honestly.

Where established by canonical truth, it must preserve distinctions such as:

- unknown;
- not supplied;
- not applicable;
- unavailable; and
- unresolved.

Products may translate these states into understandable language.

They may not replace them with:

- defaults;
- assumptions;
- remembered values;
- recommendations; or
- inferred facts.

Absence of canonical truth must remain absence or uncertainty.

## 12. Defaults and Suggestions

Products may provide defaults, suggestions, or remembered values to reduce user
effort.

These remain product behavior.

They do not become canonical Session Conditions until accepted through an
authorized canonical action.

A default must not be presented as an already established fact.

A value from another Session may be suggested, but it must not be treated as
inherited truth unless separately authorized.

## 13. Provenance

Products may compose provenance when it improves understanding.

The composition may communicate that a condition originated through:

- direct declaration;
- an authorized Session action;
- an authorized import;
- an authorized deterministic derivation; or
- correction.

Provenance explains how a record entered the platform.

It does not establish scientific, operational, or biological correctness.

## 14. Relationship to Session Context

FN-004 remains the sole canonical authority for **Session Context**.

This specification does not:

- redefine Session Context;
- partition its authority;
- supersede FN-004;
- authorize Session Conditions to control operational attention; or
- authorize Session Conditions to determine workflow continuity or evidence
  readiness.

Any future dependency between Session Conditions and Session Context requires
separate architectural authorization.

## 15. Relationship to Session Lifecycle

Session Conditions may be composed differently according to lifecycle
position.

Lifecycle may affect:

- which conditions are relevant;
- whether current or historical understanding is appropriate; and
- whether an authorized condition action is available.

Session Conditions do not own lifecycle authority.

Condition composition must not independently:

- advance a Session;
- complete a phase;
- reopen a phase;
- reactivate a completed phase; or
- alter lifecycle state.

## 16. Relationship to Session Orientation

Session Orientation may consume canonical Session Conditions to improve
Session understanding.

It may use them to explain relevant operational circumstances.

Session Orientation remains product composition.

It does not own, redefine, or persist Session Conditions.

The Session Conditions composition must provide Orientation with deterministic
canonical meaning rather than presentation-derived assumptions.

## 17. Relationship to Activities and Evidence

Session Conditions may be composed alongside:

- tasks;
- events;
- notes;
- observations;
- measurements;
- evidence;
- outcomes; and
- reflections.

The product must preserve their distinct canonical meanings.

A condition describes circumstances.

It is not itself an activity, observation, measurement, evidence item, outcome,
or reflection.

No related record may silently redefine Session Conditions.

## 18. Cross-Product Use

Multiple products may consume the same canonical Session Conditions.

Each product may compose them according to its own responsibility.

All products must use the same canonical truth.

A product must not:

- copy conditions into product-owned authoritative persistence;
- create an independent condition history;
- maintain a separate current-condition model;
- require another product's presentation state; or
- redefine canonical condition meaning.

Replacing one product must not require migrating canonical Session Conditions.

## 19. Presentation Boundary

Presentation may determine:

- layout;
- ordering;
- interaction pattern;
- responsive behavior;
- disclosure; and
- explanatory language.

Presentation may not determine:

- which condition is canonical;
- which condition currently applies;
- whether a difference is a correction or operational change;
- whether a proposed value became truth;
- whether missing truth should be inferred; or
- whether historical conditions may be replaced.

Presentation must remain replaceable without changing product or canonical
meaning.

## 20. Deterministic Composition

Given the same:

- Session;
- canonical Session Conditions;
- applicability;
- chronology;
- lifecycle state; and
- viewer authorization;

the product must produce the same condition meaning.

Composition must not depend on:

- render order;
- request order;
- navigation history;
- component lifecycle;
- cache ordering;
- stale labels; or
- the first product surface visited.

When canonical truth is insufficient, the composition must remain unresolved
rather than guess.

## 21. Persistence Boundary

This composition owns no canonical persistence.

Products and presentation may hold temporary interaction state.

Temporary state must not become a competing source of condition truth.

The following are prohibited unless explicitly authorized by the
Implementation Contract as canonical platform records:

- product-owned Current Conditions;
- presentation-owned condition history;
- copied condition values treated as authoritative;
- independently normalized condition stores; or
- cached values that override newer canonical truth.

## 22. Composition Invariants

### INV-CS-SC-001 — Canonical inputs only

Composition consumes authoritative canonical Session Conditions and supporting
canonical truth.

### INV-CS-SC-002 — No product ownership

Products compose but do not own Session Conditions.

### INV-CS-SC-003 — No duplicate persistence

Products and presentation must not maintain competing authoritative condition
records.

### INV-CS-SC-004 — FN-004 authority remains intact

Session Context remains governed exclusively by FN-004.

### INV-CS-SC-005 — No lifecycle authority

Session Conditions cannot independently change lifecycle state.

### INV-CS-SC-006 — Orientation remains non-authoritative

Session Orientation may consume conditions but cannot own or redefine them.

### INV-CS-SC-007 — Current Conditions are deterministic

Current Conditions are derived from canonical applicability and chronology.

### INV-CS-SC-008 — Historical truth is preserved

Later conditions must not overwrite earlier applicable conditions.

### INV-CS-SC-009 — Correction and change remain distinct

Composition must preserve the difference between correction and operational
change.

### INV-CS-SC-010 — Defaults are not facts

Suggested, remembered, or prefilled values remain non-canonical until
authorized acceptance.

### INV-CS-SC-011 — Missing truth remains honest

Unknown and absent conditions must not be inferred.

### INV-CS-SC-012 — Conditions remain distinct

Conditions must remain separate from activities, evidence, measurements,
outcomes, and reflections.

### INV-CS-SC-013 — Composition is deterministic

Equivalent canonical inputs must produce equivalent product meaning.

### INV-CS-SC-014 — Product replaceability

Replacing a product must not affect canonical Session Conditions.

### INV-CS-SC-015 — Presentation replaceability

Replacing presentation must not alter product or canonical meaning.

## 23. Deferred Decisions

This specification intentionally defers:

- exact condition taxonomy;
- exact applicability model;
- required and optional condition values;
- canonical structures;
- declaration commands;
- change commands;
- correction mechanics;
- inheritance;
- copying;
- deletion;
- availability;
- storage;
- APIs;
- migrations;
- validation syntax;
- interface layout;
- navigation;
- components;
- notifications;
- recommendations;
- automation; and
- AI behavior.

These require the Session Conditions Implementation Contract or separate
architectural authorization.

## 24. Implementation Contract Requirements

The Session Conditions Implementation Contract must define:

1. the canonical condition structures;
2. the supported applicability model;
3. declaration operations;
4. operational-change operations;
5. correction operations;
6. provenance requirements;
7. validation and normalization boundaries;
8. Current Conditions derivation;
9. current and historical retrieval;
10. ownership and access enforcement;
11. failure and rollback behavior;
12. duplicate-submission protection;
13. canonical-to-product adapters;
14. presentation-state boundaries; and
15. safeguards preserving FN-004 authority.

The Implementation Contract must not redefine FN-005 or this Composition
Specification.

## 25. Acceptance Conditions

This Composition Specification may be approved when the following are
accepted:

- Products compose but do not own Session Conditions.
- Current Conditions are deterministic and non-authoritative as a separate
  record.
- Historical conditions remain interpretable.
- Corrections and operational changes remain distinct.
- Missing conditions remain honest.
- Defaults and suggestions remain non-canonical.
- FN-004 remains the sole authority for Session Context.
- Session lifecycle authority remains unchanged.
- Session Orientation remains product composition.
- Activities and evidence remain separate concerns.
- No duplicate persistence is authorized.
- No UI or implementation design has been prematurely established.

## 26. Result

This Composition Specification defines how Grow products organize canonical
Session Conditions into understandable Session experiences.

It preserves:

- canonical ownership;
- FN-004 authority;
- deterministic current and historical understanding;
- honest representation of missing truth;
- separation between conditions, lifecycle, activities, and evidence;
- product replaceability;
- presentation replaceability; and
- freedom from duplicate sources of truth.

Upon approval, the next authorized artifact is:

**Capability 2A — Session Conditions Implementation Contract.**
