# Foundation Note FN-006 — Canonical Phase Commencement and Lifecycle Chronology

**Status:** Foundational Architecture
**Capability:** Session Lifecycle Chronology
**Layer:** Canonical Platform
**Governing authority:** [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](./FN-004-session-lifecycle-and-grow-companion.md)
**Related foundation:** [FN-005 — Canonical Session Conditions](./FN-005-canonical-session-conditions.md)
**Next authorized artifact:** CS-SC-001B — Canonical Growing Commencement and Legacy Chronology

## Purpose

This Foundation Note supplies the bounded chronological rule previously
undefined by FN-004:

> The commencement of a canonical lifecycle phase is a durable canonical
> chronological fact owned by Session Lifecycle.

It defines only the meaning, ownership, integrity, durability, and historical
truth boundary of canonical phase commencement.

It does not redefine the Session lifecycle, phase ordering, phase meaning,
transition authorization, Grow Companion responsibility, Session Context, or
evidence ownership. It does not authorize implementation, migration,
persistence, product behavior, or presentation.

## Authoritative Context

FN-004 remains the governing Session Lifecycle architecture.

FN-004 establishes:

- one continuous canonical Session;
- Germination, Growing, and Reflection as canonical lifecycle phases;
- canonical phase states;
- one canonical current phase;
- authorized lifecycle transitions; and
- durable completed-phase history.

This note is subordinate to FN-004 and supplies only the missing chronological
dimension of those lifecycle transitions and entries.

If this note conflicts with FN-004, FN-004 prevails. No statement in this note
may be interpreted to change the authority or meaning established by FN-004.

## Canonical Phase Commencement

Canonical phase commencement is the chronological instant at which an
authorized lifecycle entry or transition successfully makes a phase
canonically current.

It is a durable canonical lifecycle fact.

The architecture distinguishes:

- **lifecycle phase** — a canonical stage of the Session lifecycle;
- **lifecycle state** — whether that phase is future, current, or complete;
- **authorized lifecycle entry or transition** — the canonical action that
  establishes a permitted lifecycle-state change;
- **canonical phase-commencement instant** — when that authorized entry or
  transition successfully made the phase current;
- **phase evidence** — attributable activity, observations, decisions, and
  records authored or recorded within the phase;
- **presentation chronology** — how a Product or Presentation communicates
  canonical chronology; and
- **derived or inferred chronology** — non-authoritative chronology computed
  or guessed from other facts.

A phase being current and the instant at which it became current are related
canonical lifecycle facts. They are not interchangeable. Current state does
not by itself disclose historical commencement chronology.

## Canonical Ownership

Canonical Session Lifecycle owns:

- whether an authorized phase entry or transition occurred;
- the resulting canonical phase state;
- the canonical instant at which the phase became current;
- the relationship between that instant and the authorized lifecycle action;
- the durability of that chronology; and
- the truth-preservation boundary for later correction.

Session Conditions may consume canonical phase commencement as an
applicability boundary. They do not own, derive, rewrite, or redefine it.

The following do not own canonical phase commencement:

- Grow Companion or its presentation;
- Session Conditions;
- Growing Phase evidence;
- Timeline;
- Calendar;
- Tasks;
- Events;
- Notes;
- Photos;
- Documents;
- analytics;
- reports;
- first evidence creation; or
- any derived projection.

No consumer acquires lifecycle authority by referencing canonical phase
commencement.

## Seed-to-Growing Commencement

For a Seed Session that explicitly continues from Germination into Growing,
Growing canonically commences at the chronological instant when the authorized
Germination-to-Growing lifecycle transition successfully becomes canonical.

Germination completion and Growing commencement are separate facts.
Germination may complete before the grower authorizes continuation into
Growing.

Growing commencement is not:

- opening or viewing the Growing workspace;
- the first Growing save;
- creation of a Growing Phase evidence record;
- creation of a Plant Group;
- creation of a Task, Event, Note, Photo, or Document;
- the first observation, measurement, or other evidence item; or
- later presentation of the transition.

Those later activities may occur after Growing commences and cannot redefine
its commencement.

## Direct-Growing Commencement

For a Session intentionally authorized to begin directly in Growing, canonical
Session creation and direct Growing lifecycle entry are one domain action.

Growing canonically commences at the chronological instant when that
authorized direct-Growing Session creation succeeds and Growing becomes its
initial canonical current phase.

This rule applies only to the approved direct-Growing entry path. It does not
establish that generic Session creation time is always a phase-commencement
instant.

Opening the Growing workspace, creating Growing evidence, or performing a
later save cannot establish or replace the direct-Growing commencement fact.

## State-and-Chronology Integrity

An authorized lifecycle entry or transition that makes a phase current must
establish one indivisible canonical lifecycle outcome:

1. the resulting canonical lifecycle state; and
2. the corresponding canonical phase-commencement instant.

Therefore:

- a lifecycle phase must not become canonically current without its required
  commencement chronology;
- a commencement instant must not exist without the corresponding authorized
  lifecycle entry or transition;
- consumers must not observe a successful canonical state change whose
  required commencement chronology is absent; and
- state and commencement chronology must identify the same canonical Session
  and lifecycle phase.

This is a domain-integrity rule. It does not prescribe a transaction,
procedure, schema, service, API, or implementation sequence.

## Chronology Durability

Once established, canonical phase commencement remains stable through:

- viewing or navigation;
- product and presentation changes;
- ordinary Session or phase editing;
- evidence creation, correction, or deletion;
- phase completion;
- later lifecycle transitions; and
- historical review.

Ordinary product interaction cannot rewrite phase commencement.

A change to inaccurate canonical commencement is a lifecycle correction, not
an ordinary edit and not a new operational transition. Such correction
requires separately authorized lifecycle-correction architecture and
implementation.

When later authority permits correction:

- correction must remain distinguishable from silent historical replacement;
- prior recorded chronology and correction provenance must be preserved; and
- consumers must be able to distinguish corrected chronology from an actual
  lifecycle transition.

This note does not authorize a correction operation, interface, permission
model, administrative tool, persistence history, or recovery mechanism.

## Legacy Sessions Without Authoritative Chronology

A legacy Session may lack an authoritative canonical phase-commencement
instant even when existing state indicates that Growing became current.

Absence of authoritative chronology is not permission to manufacture it.

When no Foundation-authoritative source proves the exact commencement instant:

- canonical commencement remains unresolved;
- no exact timestamp may be asserted;
- circumstantial timestamps remain non-authoritative;
- current lifecycle state must not be rewritten merely to conceal the missing
  chronology; and
- later Products may represent or consume the unresolved state only under
  separately approved Composition authority.

Unresolved chronology preserves honest uncertainty. It is distinct from an
approximate timestamp presented with false canonical precision.

This note does not authorize migration, cutover, fallback selection,
backdating, estimation, administrator judgment, or a chronology-recovery
capability.

## Non-Authoritative Substitutes

None of the following proves canonical phase commencement merely because it
exists:

- Growing Phase `created_at`;
- Growing Phase `updated_at`;
- Germination completion time;
- Session creation time, except for the direct-Growing domain action defined
  by this note;
- first Growing evidence time;
- first Task time;
- first Event time;
- first Note time;
- first Photo time;
- first Document time;
- a persisted lifecycle decision without its canonical transition instant;
- derived chronology;
- inferred chronology;
- approximate chronology; or
- an administrator-selected time.

These facts may retain their own canonical meaning. That meaning does not
transfer lifecycle chronology authority to them.

## Non-Retroactive Invention

When Foundation-authoritative phase-commencement chronology does not exist,
none of the following may manufacture it:

- Product Composition;
- an Implementation Contract;
- migration code;
- persistence adapters;
- user-interface behavior;
- Timeline or Calendar projection;
- analytics;
- reports;
- evidence timestamps;
- administrator discretion; or
- implementation precedent.

A later Foundation-authorized recovery model may establish bounded behavior
for unresolved chronology. No such recovery is authorized by this note.

## Relationship to Session Conditions

Session Conditions may consume canonical Growing commencement as the
applicability boundary for separately authorized condition dimensions.

Session Conditions do not:

- own Growing commencement;
- decide whether Growing became current;
- establish lifecycle state;
- correct lifecycle chronology;
- infer missing commencement; or
- turn an unresolved legacy timestamp into canonical truth.

Canonical Current Conditions remain a Canonical Platform projection governed
by their own architecture. Product Composition and Presentation remain
non-authoritative consumers.

## Relationship to Session Context

FN-004 remains the sole canonical authority for Session Context.

Canonical phase commencement is a Session Lifecycle fact. This note does not
grant Session Conditions, Product Composition, Presentation, or another
capability authority over Session Context, operational attention, workflow
continuity, or evidence readiness.

## Architectural Invariants

### INV-PCL-001 — Lifecycle ownership

Canonical Session Lifecycle owns phase-commencement chronology.

### INV-PCL-002 — One commencement per lifecycle entry

Each canonical entry into a phase establishes one corresponding canonical
commencement instant.

### INV-PCL-003 — Atomic state and chronology

Canonical current-phase state and its required commencement chronology are one
indivisible lifecycle outcome.

### INV-PCL-004 — Consumer non-authority

Session Conditions consume commencement but do not own or derive it.

### INV-PCL-005 — Both Growing-entry paths are governed

Seed-to-Growing transition and direct-Growing entry each establish Growing
commencement through their authorized canonical lifecycle action.

### INV-PCL-006 — Evidence is not commencement

Phase evidence and evidence timestamps do not establish lifecycle chronology.

### INV-PCL-007 — Chronology is durable

Ordinary interaction, evidence changes, completion, and historical review do
not rewrite canonical commencement.

### INV-PCL-008 — Correction requires separate authority

Lifecycle chronology correction must be separately authorized and preserve
historical truth.

### INV-PCL-009 — Legacy uncertainty remains honest

Missing authoritative commencement remains unresolved rather than estimated.

### INV-PCL-010 — No retroactive invention

Products, contracts, migrations, adapters, interfaces, projections, reports,
analytics, evidence timestamps, administrators, and implementation precedent
cannot manufacture missing canonical commencement.

### INV-PCL-011 — FN-004 remains authoritative

FN-004 continues to govern Session Lifecycle, Session Context, and their
existing boundaries.

### INV-PCL-012 — No lifecycle redesign

Phase order, phase meaning, transition authorization, and Grow Companion
responsibility remain unchanged.

### INV-PCL-013 — Current Conditions remain canonical

The Canonical Platform derives Current Conditions; Products and Presentation
remain non-authoritative.

### INV-PCL-014 — No implementation authority

This Foundation Note authorizes architecture only.

## Explicit Exclusions

This note does not authorize or define:

- database fields, tables, record shapes, schemas, or migrations;
- RPCs, triggers, constraints, services, APIs, or persistence adapters;
- implementation contracts or implementation execution;
- migration eligibility or per-Session cutover;
- fallback selection, timestamp derivation, or chronology approximation;
- manual backdating or administrator-selected chronology;
- lifecycle-correction operations, permissions, or tools;
- Session Conditions or Grow Companion interfaces;
- Timeline or Calendar behavior;
- reports or analytics;
- notifications, recommendations, or automation;
- artificial intelligence or sensors;
- evidence interpretation or biological interpretation; or
- a broader lifecycle event system.

## Next Architectural Step

After this Foundation Note passes read-only architecture audit, completes its
documentation Git step, and is formally closed, it authorizes only:

**CS-SC-001B — Canonical Growing Commencement and Legacy Chronology**

That Composition Specification may define how Products and Session Conditions
consume the lifecycle fact and represent unresolved legacy chronology. It may
not redefine Session Lifecycle or authorize implementation.

ICE-SC-001 remains blocked. IC-SC-001 remains unchanged and must receive
separately approved implementation authority before execution may resume.

## Foundational Decision

Canonical phase commencement is a durable chronological fact owned by Session
Lifecycle. It is established when an authorized lifecycle entry or transition
successfully makes a phase current.

For Seed-to-Growing transition, Growing commences when that transition becomes
canonical. For direct-Growing entry, canonical Session creation and Growing
entry are one domain action, and Growing commences when that action succeeds.

State and commencement chronology form one indivisible canonical lifecycle
outcome. Missing legacy chronology remains unresolved. No Product, contract,
migration, adapter, interface, projection, evidence timestamp, administrator,
or implementation precedent may manufacture canonical commencement.
