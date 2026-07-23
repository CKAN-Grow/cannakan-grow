# IC-GC-002A — Grow Companion Capability 2A: Session Context Foundation

**Status:** Draft — Requires Architecture Approval
**Authority:** FN-004 — Session Context, Operational Intelligence & Evidence Readiness
**Scope:** Session Context Engine / Operational Intelligence / Evidence Readiness / Context Projections

## Foundation Authority

This contract inherits its authority from FN-004.

FN-004 establishes that:

- users create evidence through their actions, observations, decisions, and recorded outcomes
- Grow Companion captures, structures, organizes, preserves, and presents user-produced evidence
- the Session Context Engine derives deterministic operational context from canonical Session records
- Session Context never creates evidence or substitutes derived context for original evidence
- GEE remains the canonical evidence interpretation engine
- no capability may create a parallel Session, evidence, context, workflow, Reflection, or knowledge system

This contract may define implementation behavior, but it may not override FN-004 or introduce a parallel Session, evidence, context, task, event, scheduling, notification, Reflection, or knowledge system.

## Implementation Scope

Capability 2A may implement:

- deterministic evaluation of current operational Session state
- deterministic evaluation of workflow continuity
- deterministic evaluation of Evidence Completeness, Evidence Continuity, and Evidence Quality
- context projections for authorized platform consumers
- prioritization of relevant operational attention from canonical Session records
- preservation of provenance distinctions among user-produced evidence, canonical system records, derived context, and GEE interpretation

Capability 2A does not authorize changes to canonical evidence definitions, GEE interpretation, Reflection structure, Seed Vault knowledge rules, scheduling behavior, notification behavior, or Session lifecycle boundaries.

## Non-Goals

Capability 2A does not:

- create, invent, fabricate, or substitute evidence
- infer user observations
- perform biological diagnosis
- produce predictive cultivation advice
- perform GEE-level evidence interpretation
- distill or persist knowledge in the Seed Vault
- establish a new Task, Event, scheduling, notification, Reflection, reporting, or analytics system
- define phase-navigation layout or interaction behavior
- define release sequencing

## Inputs and Provenance

The Session Context Engine consumes canonical Session records.

Inputs must preserve attribution sufficient to distinguish:

- user-produced evidence
- canonical system records
- deterministically derived state
- existing GEE interpretation, where an authorized consumer may reference it

The exact input contract and compatibility mappings are:

**TBD — Requires Architecture Approval**

## Context Behavior

For the same eligible canonical inputs and governing architecture, the Session Context Engine must produce the same operational context.

Context behavior may:

- summarize
- prioritize
- classify
- organize
- evaluate operational Session state
- evaluate workflow continuity
- evaluate evidence readiness

Context behavior must not:

- mutate original evidence
- present a system record as a user observation
- present derived context as original evidence
- interpret evidence as trusted knowledge
- bypass GEE eligibility, lineage, confidence, or interpretation

The exact rules for selecting the highest-priority operational context are:

**TBD — Requires Architecture Approval**

## Evidence Readiness Behavior

Evidence Readiness must preserve the three FN-004 dimensions:

1. Evidence Completeness
2. Evidence Continuity
3. Evidence Quality

Capability 2A may expose deterministic readiness projections. It may not introduce a fourth readiness dimension or define Evidence Confidence as a measure of cultivation success, user credibility, source reputation, biological quality, or predicted outcomes.

The exact readiness rules, required inputs, and presentation contract are:

**TBD — Requires Architecture Approval**

No formula, score, weight, threshold, or algorithm is approved by this draft.

## Platform Context Projections

Authorized platform consumers may consume shared context projections instead of calculating competing Session context independently.

Potential consumers include Grow Companion, Home, Reflection, notifications, reports, future APIs, and future AI capabilities. This list is illustrative and does not make FN-004 dependent on a particular page or surface.

The projection transport, schema, freshness rules, caching behavior, and consumer-specific presentation are:

**TBD — Requires Architecture Approval**

## Compatibility Obligations

Capability 2A must preserve:

- one canonical Session
- canonical phase and Session status boundaries
- attribution and lineage of original records
- historical Session accessibility
- deterministic context behavior
- the separation between context and GEE interpretation

Compatibility mechanisms, legacy mappings, adapter design, and field-level handling are:

**TBD — Requires Architecture Approval**

## Security and Ownership Boundaries

Session Context must respect the ownership, privacy, and authorization boundaries of its canonical source records.

A context projection must not expose evidence, system records, derived state, or interpretation to a consumer that is not authorized to access the underlying information.

Capability 2A does not authorize new sharing or public-visibility behavior.

## Acceptance Criteria

An approved Capability 2A implementation must demonstrate that:

- context is deterministic for the same eligible canonical inputs
- user-produced evidence remains attributable to the user
- canonical system records remain distinguishable from user observations
- derived context is not represented as original evidence
- original evidence is not mutated by context evaluation
- all readiness output maps to Completeness, Continuity, or Quality
- Context does not perform GEE-level interpretation or knowledge distillation
- consumers do not create a parallel Session Context calculation
- ownership and privacy boundaries are preserved

Consumer-specific interface acceptance criteria are:

**TBD — Requires Architecture Approval**

## Regression Expectations

Capability 2A must not regress:

- canonical Session identity or ownership
- Session and phase status separation
- completed-phase history
- Task and Event domain separation
- Reflection's status as structured subjective evidence
- GEE eligibility, lineage, confidence, interpretation, or knowledge-distillation authority
- Seed Vault boundaries

The exact automated regression suite and fixtures are:

**TBD — Requires Architecture Approval**

## Deferred Decisions

The following decisions remain unapproved:

- exact canonical input contract
- highest-priority context selection rules
- readiness evaluation rules
- Evidence Confidence representation
- projection transport and schema
- projection freshness and caching behavior
- consumer-specific presentation
- compatibility and legacy mapping mechanisms
- interface acceptance criteria
- automated regression suite and fixtures

Each item is **TBD — Requires Architecture Approval**.
