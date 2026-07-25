# CS-SC-001A — Initial Session Conditions Dimensions and Existing Truth

**Status:** Proposed
**Capability:** 2A — Session Conditions
**Layer:** Product Composition
**Foundation authority:** [FN-005 — Canonical Session Conditions](../../foundation/foundation-notes/FN-005-canonical-session-conditions.md)
**Composition authority:** [CS-SC-001 — Session Conditions Composition](./session-conditions-composition-specification.md)
**Existing authority:** [IC-GC-002C — Session Entry and Growing Foundation](../../foundation/implementation-contracts/IC-GC-002C-session-entry-and-growing-foundation.md)
**Related authority:** [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../../foundation/foundation-notes/FN-004-session-lifecycle-and-grow-companion.md)
**Next authorized artifact:** IC-SC-001 — Session Conditions Implementation Contract

## 1. Purpose

This supplemental Composition Specification resolves the bounded architectural
decision required before the first Session Conditions production slice can be
contracted.

It establishes:

- the two condition dimensions authorized for the first slice;
- their transition from existing Growing-owned truth to canonical Session
  Conditions;
- the applicability authorized for those dimensions;
- the architectural migration and compatibility boundary; and
- the authority available to IC-SC-001.

It defines Composition architecture only. It does not define implementation,
schema, migration mechanics, APIs, security mechanisms, workflows, interfaces,
or presentation.

## 2. Authoritative Context

This decision inherits:

- [Grow Platform Architecture](../../platform/grow-platform-architecture.md);
- [FN-005 — Canonical Session Conditions](../../foundation/foundation-notes/FN-005-canonical-session-conditions.md);
- [CS-SC-001 — Session Conditions Composition](./session-conditions-composition-specification.md);
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../../foundation/foundation-notes/FN-004-session-lifecycle-and-grow-companion.md);
- CS-001.2 — Session Orientation; and
- [IC-GC-002C — Session Entry and Growing Foundation](../../foundation/implementation-contracts/IC-GC-002C-session-entry-and-growing-foundation.md).

FN-005 remains authoritative for Session Conditions. FN-004 remains the sole
canonical authority for Session Context. CS-SC-001 continues to authorize only
Session-wide and period applicability and continues to prohibit record-level
applicability.

## 3. Repository Baseline

Before this decision:

- IC-GC-002C assigns Grow Method and Environment Type to the canonical Growing
  Phase record;
- the canonical Growing Phase representation persists those values;
- Growing normalization, validation, retrieval, and presentation consume that
  representation;
- no other canonical repository source owns equivalent Grow Method or
  Environment Type truth; and
- no prior supplemental Composition decision resolves their relationship to
  Session Conditions.

Tests, adapters, summaries, and presentation references are consumers of the
Growing Phase source. They do not establish additional authority.

## 4. Bounded Composition Decision

The first Session Conditions production slice authorizes exactly two
dimensions:

1. **Grow Method**
2. **Environment Type**

No additional dimension, unrestricted custom dimension, miscellaneous
condition key, or generic key-value model is authorized.

This decision is limited to these two dimensions. It establishes no general
condition taxonomy.

## 5. Canonical Ownership Transition

Grow Method and Environment Type are operational circumstances within the
meaning established by FN-005.

Their canonical ownership transitions from the Growing Phase representation to
canonical Session Conditions through the later authorized cutover.

The authority boundary is:

### Before cutover

The existing Growing Phase representation remains the sole canonical authority
for both values.

### At cutover

The authorized migration establishes equivalent canonical Session Conditions
without changing their meaning.

### After successful cutover

Canonical Session Conditions become the sole canonical authority for both
values. The Growing Phase, Grow Sessions product, Product Composition, and
Presentation consume them and own no competing authoritative copy.

This decision narrowly supersedes only the IC-GC-002C ownership placement of
Grow Method and Environment Type after successful cutover. All other
IC-GC-002C ownership, evidence, Growing, lifecycle, normalization, workspace,
and capability boundaries remain unchanged.

## 6. Existing Vocabularies

The first slice reuses the existing approved Grow Method and Environment Type
vocabularies governed by IC-GC-002C.

This specification does not restate, redefine, reorder, expand, merge, or
reinterpret those vocabularies. User-authored `Other` text retains the meaning
and boundary established by IC-GC-002C and does not create a new global
canonical term.

IC-SC-001 may encode and validate the approved values. It may not add or infer
values without separate architectural authorization.

## 7. Applicability Decision

Both initial dimensions use **period applicability** within canonical Session
chronology.

For each dimension:

- the first applicable period begins when Growing canonically begins;
- before that period exists, the condition remains absent and must not be
  inferred;
- a real operational change begins a new applicable period at its canonical
  chronological boundary;
- the preceding applicable period remains historically true;
- correction remains distinct from operational change; and
- Current Conditions remain a Canonical Platform-derived projection.

Session-wide applicability remains available in CS-SC-001 architecture but is
not authorized for Grow Method or Environment Type in this first slice.

Record-level applicability remains unauthorized.

Products may compose the condition applicable at a Task, Event, Note,
Observation, Measurement, Evidence item, Outcome, or Reflection's canonical
chronological point. That composition creates no direct canonical relationship
between the record and the condition.

## 8. Existing Data and Cutover Boundary

Existing Growing Phase Grow Method and Environment Type values are:

- the authoritative legacy source before cutover;
- the source used to establish equivalent canonical Session Conditions during
  the authorized migration; and
- temporary compatibility data only after successful cutover.

IC-SC-001 must define a deterministic migration and cutover that preserves:

- all existing truth;
- unchanged value meaning;
- exactly one canonical authority before and after cutover;
- atomic success or rollback;
- deterministic retry behavior;
- no conflicting state after failure; and
- no indefinite dual-write behavior.

After cutover, legacy Growing Phase fields must not override canonical Session
Conditions. IC-SC-001 may determine whether those fields are removed or
temporarily retained for compatibility, but retained fields must remain
non-authoritative.

This specification authorizes the ownership transition and migration boundary.
It does not define migration mechanics, schema operations, deployment order, or
rollback implementation.

## 9. Product Composition

Grow Sessions and Growing workspace composition may:

- consume canonical Grow Method and Environment Type conditions;
- organize current and historical values;
- compose them into Session Orientation; and
- use chronologically applicable values while presenting related Session
  records.

Products may not:

- own or independently normalize the values;
- derive separate Current Conditions;
- maintain independent condition history;
- create direct record-level applicability; or
- persist authoritative copies.

Growing remains a consumer after cutover. Product Composition and Presentation
remain replaceable and non-authoritative.

## 10. Preserved Authority

This decision does not alter:

- FN-004 Session Context authority;
- Session lifecycle authority;
- Growing Phase identity or progression;
- Session Orientation ownership boundaries;
- historical truth requirements;
- correction-versus-operational-change semantics;
- Growing evidence other than the narrow ownership placement of Grow Method
  and Environment Type after cutover; or
- the Canonical Platform → Product Composition → Presentation dependency.

It grants Session Conditions no workflow-continuity, evidence-readiness,
operational-attention, lifecycle, evidence, recommendation, or interpretation
authority.

## 11. Architectural Invariants

### INV-CS-SC-001A-01 — Exactly two initial dimensions

Only Grow Method and Environment Type are authorized.

### INV-CS-SC-001A-02 — Session Conditions ownership after cutover

Canonical Session Conditions are the sole canonical authority for both
dimensions after successful cutover.

### INV-CS-SC-001A-03 — Existing vocabularies are reused

The IC-GC-002C vocabularies remain unchanged.

### INV-CS-SC-001A-04 — Period applicability only

Both dimensions use period applicability beginning no earlier than canonical
Growing commencement.

### INV-CS-SC-001A-05 — No record-level applicability

No direct condition-to-record canonical relationship is authorized.

### INV-CS-SC-001A-06 — No generic taxonomy

No custom dimension system, unrestricted key, or generic condition taxonomy is
authorized.

### INV-CS-SC-001A-07 — No duplicate authority

Exactly one source is canonical before cutover and exactly one source is
canonical after cutover.

### INV-CS-SC-001A-08 — No indefinite dual write

Compatibility cannot preserve two writable authoritative sources.

### INV-CS-SC-001A-09 — Legacy fields become non-authoritative

Retained Growing Phase compatibility fields cannot override canonical Session
Conditions after cutover.

### INV-CS-SC-001A-10 — Historical truth is preserved

Migration, operational change, and correction must preserve applicable
historical meaning.

### INV-CS-SC-001A-11 — Current Conditions remain canonical

The Canonical Platform exclusively derives Current Conditions.

### INV-CS-SC-001A-12 — Growing and Products remain consumers

Growing, Product Composition, and Presentation acquire no Session Conditions
authority.

### INV-CS-SC-001A-13 — FN-004 remains authoritative

Session Context remains governed exclusively by FN-004.

### INV-CS-SC-001A-14 — Lifecycle authority remains unchanged

Neither condition dimension may advance, complete, reopen, or reactivate
lifecycle state.

### INV-CS-SC-001A-15 — Product replaceability

A Product may be replaced without migrating or redefining canonical Session
Conditions.

### INV-CS-SC-001A-16 — Presentation replaceability

Presentation may be replaced without changing canonical or product meaning.

## 12. IC-SC-001 Authorization Boundary

After this specification passes architecture audit, IC-SC-001 may define:

- the canonical representation of Grow Method and Environment Type
  conditions;
- period chronology, boundary, and overlap rules;
- declaration, operational-change, and correction operations;
- deterministic Current Conditions derivation at the Canonical Platform
  boundary;
- deterministic migration and cutover from existing Growing Phase values;
- compatibility behavior for legacy fields;
- validation using the existing approved vocabularies;
- retrieval, ownership, security, atomicity, rollback, and duplicate-submission
  behavior; and
- canonical-to-product adapters.

IC-SC-001 may not:

- add condition dimensions;
- expand or reinterpret the approved vocabularies;
- authorize Session-wide applicability for these dimensions;
- introduce record-level applicability;
- create direct canonical relationships to Session records;
- preserve dual canonical authority or indefinite dual writes;
- alter Session Context, lifecycle, Growing identity, or Growing progression
  authority; or
- create product-owned authoritative persistence.

IC-SC-001 implements this architecture. It does not choose or expand it.

## 13. Explicit Exclusions

This specification does not authorize:

- additional or custom Session Conditions dimensions;
- unrestricted condition keys or values;
- record-level applicability;
- new Grow Method or Environment Type values;
- interface, workflow, component, navigation, or presentation design;
- recommendations or notifications;
- automation or artificial-intelligence inference;
- sensor integration;
- Session Context behavior;
- lifecycle progression authority;
- application code, tests, schema, migrations, APIs, or security changes; or
- implementation of any kind.

## 14. Acceptance Conditions

This supplemental Composition Specification is architecturally complete only
when:

1. exactly two initial dimensions are authorized;
2. existing approved vocabularies are reused without expansion;
3. both dimensions use period applicability beginning with Growing;
4. record-level applicability remains prohibited;
5. ownership transitions without duplicate canonical authority;
6. legacy fields become non-authoritative after cutover;
7. historical meaning survives migration and later change;
8. Current Conditions remain Canonical Platform-derived;
9. Growing and Products remain consumers;
10. FN-004 and lifecycle authority remain unchanged;
11. Product and Presentation remain replaceable; and
12. no implementation authority is inferred from this document.

## 15. Next Authorized Artifact

After this specification passes its read-only architecture audit, completes its
documentation Git step, and is formally closed, the next authorized artifact
is:

**IC-SC-001 — Session Conditions Implementation Contract**

That contract may implement only the bounded architecture established by
FN-005, CS-SC-001, and this supplemental Composition Specification.

No implementation is authorized by this specification.
