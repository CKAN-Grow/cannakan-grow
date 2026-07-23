# Grow Companion Composition Implementation Considerations

**Status:** Non-Canonical Implementation Working Material
**Source:** Grow Companion Composition Specification architecture audit
**Product Area:** Grow Sessions

## Authority Boundary

This document preserves implementation-oriented material removed from the canonical Grow Companion Composition Specification.

It does not establish architecture, does not authorize implementation, does not override the composition specification, and does not resolve any decision marked TBD.

Its contents require later conversion into approved Implementation Contracts, tracked corrective tasks, or an approved implementation plan before implementation.

## Current Implementation Snapshot

At the time this material was extracted, repository inspection showed:

- one Session detail shell containing Session identity, overview, editing, status, method-aware Germination content, evidence, images, sharing, and lifecycle controls
- a Grow Companion surface composed into that Session shell
- phase definitions for Germination, Growing, and Reflection
- computed future, current, and complete lifecycle states
- a phase navigator and current-phase workspace
- expandable completed-phase records
- full Germination content moved into its completed-phase record when Germination becomes complete
- a Germination completion summary that opens the preserved record
- a Growing workspace with private Tasks, Events, Upcoming Tasks, and Recent Activity inherited from Capability 1
- a completed Growing placeholder describing preserved activity rather than a complete historical composition
- a non-persistent Reflection placeholder showing Overall Experience, Would Grow Again, and Final Thoughts
- method-specific Germination timelines and operational hero behavior

The implementation did not yet provide:

- a separate viewed-phase state
- clear selected-view treatment when completed Germination was being reviewed
- a deliberate Growing setup experience
- a rich Growing composition comparable to Germination
- one cross-phase Session timeline projection
- a deterministic, report-first Reflection workspace
- implemented GEE interpretation or knowledge-distillation areas

These observations describe implementation state only. They do not redefine the canonical composition.

## Current Renderer and Expansion Limitation

The implementation used expansion state to control whether a completed phase record was open.

Expansion was not a distinct viewed-phase identity and could not serve as its long-term replacement.

The implementation also moved existing Germination content between the current-phase workspace and its completed-phase record. This preserves content in the inspected implementation, but the mechanism is not canonical architecture.

Future implementation must follow the canonical specification regardless of renderer or state-management strategy.

## Named Phase-Navigation Defect

Completed Germination could be expanded for review without looking selected in the phase navigator.

The corrective task must preserve these canonical requirements:

- viewed state is visibly and semantically clear
- canonical current phase remains identifiable while history is viewed
- completed phase selection does not imply reactivation
- expansion state is not the sole indicator of viewed selection

The exact correction mechanism belongs in an approved implementation contract or tracked corrective task.

**Status:** TBD — Requires Architecture Approval

## Advisory Implementation Sequence

The extracted advisory sequence was:

1. Correct phase-navigation state and separate canonical current phase from viewed phase.
2. Preserve and regression-lock the existing Germination composition.
3. Stabilize the persistent Grow Companion shell.
4. Define and implement Growing setup after taxonomy approval.
5. Build the Growing operational hero and approved phase modules.
6. Introduce the live cross-phase Session timeline projection.
7. Build the deterministic Reflection Session Report.
8. Build Guided Reflection.
9. Add downstream GEE and intentional knowledge-distillation integrations after their contracts are approved.
10. Complete responsive, accessibility, historical-integrity, and regression verification.

This sequence is non-canonical, advisory, and subject to architecture approval. It does not authorize implementation or establish release timing.

## Unresolved Implementation Dependencies

The canonical specification preserves the authoritative architecture dependencies. Implementation planning still depends on:

- a documented Germination regression baseline
- separate canonical-current-phase and viewed-phase behavior
- approved Grow Context architecture before final Growing setup
- approved Reflection schema before Guided Reflection
- a separate approved GEE integration contract
- a separate approved knowledge-distillation contract
- approved owners for remaining Grow Companion composition work
- approved editability and historical-correction policies
- approved timeline projection and revisability behavior

Each dependency remains:

**TBD — Requires Architecture Approval**

## Required Future Destination

Before implementation begins, each applicable item must move into one or more approved artifacts:

- a phase-navigation Implementation Contract or corrective task
- a Germination regression-protection contract
- a Growing setup and composition contract
- a cross-phase timeline projection contract
- a Reflection implementation contract
- a GEE integration contract
- a knowledge-distillation contract
- an approved implementation plan

This working note must not be treated as approval for any of those artifacts.
