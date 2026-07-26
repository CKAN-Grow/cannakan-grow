# Foundation Note FN-007 — Intentional Transition from Germination to Growing

**Status:** Foundational Architecture
**Capability:** Session Lifecycle Transition
**Layer:** Canonical Platform
**Governing authority:** [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](./FN-004-session-lifecycle-and-grow-companion.md)
**Corrects:** The bounded FN-004 rule that Germination completion automatically makes Growing current
**Related foundation:** [FN-006 — Canonical Phase Commencement and Lifecycle Chronology](./FN-006-canonical-phase-commencement-and-lifecycle-chronology.md)

## Purpose

This Foundation Note establishes the intentional lifecycle transition from
completed Germination into Growing.

It corrects one bounded FN-004 rule:

> Germination completion does not automatically make Growing current.

Growing becomes current only when a distinct authorized Begin Growing
transition successfully becomes canonical.

This is a narrow correction to FN-004. It does not replace or redesign the
Session lifecycle.

## Authority and Correction Scope

The Grow Platform Architecture remains authoritative. Canonical Session
Lifecycle owns phase completion, phase entry, current-phase state, and
lifecycle-transition meaning.

This note supersedes only the FN-004 Germination Completion statement:

> Current phase becomes Growing.

That statement is replaced by the following bounded rule:

> Germination completion preserves Germination as complete. Growing becomes
> current only through a separately authorized Begin Growing transition.

All compatible FN-004 authority remains unchanged, including:

- one canonical Session across its lifecycle;
- Germination, Growing, and Reflection as the canonical phases;
- phase ordering;
- completed-phase durability;
- current-phase and viewed-phase separation;
- Grow Companion responsibility;
- Reflection behavior; and
- Session containment.

## Germination Completion

Canonical Germination completion:

- concludes the Germination phase;
- makes Germination complete;
- preserves its canonical record as durable history;
- does not commence Growing;
- does not make Growing current; and
- does not establish an intention to continue into Growing.

Germination completion and Growing commencement are separate canonical
lifecycle facts.

Completing Germination does not reactivate, rename, relocate, summarize away,
or otherwise weaken the completed Germination record.

## Post-Germination Decision Boundary

A Session may remain valid after Germination completes while an authorized
continuation decision remains pending.

During this bounded condition:

- Germination is complete;
- completed Germination remains reviewable;
- Growing has not commenced;
- Growing is not current;
- no canonical Growing commencement chronology exists; and
- no Growing-phase authority is implied.

This condition is the absence of an authorized next-phase entry. It is not a
new phase, a new lifecycle state, a generalized workflow state, or a separate
Session.

This note does not create a new termination, abandonment, or recovery path.
Deferral or another outcome remains available only where separately authorized
by existing lifecycle authority.

## Intentional Continuation

Entering Growing from completed Germination requires a distinct authorized
lifecycle decision and Begin Growing transition.

The grower may review completed Germination before authorizing continuation.
Review does not alter the completed record and does not itself enter Growing.

Completed Germination remains canonical whether Growing begins immediately,
begins later, or does not begin where another outcome is separately
authorized.

## Begin Growing Transition

For the Seed-to-Growing path, Growing becomes the canonical current phase only
when the authorized Begin Growing transition successfully becomes canonical.

The Begin Growing transition is distinct from:

- Germination completion;
- review of completed Germination;
- opening Grow Companion;
- viewing the Growing workspace;
- opening or presenting Growing setup;
- entering draft or incomplete Growing setup information;
- creating a Growing Phase evidence record;
- creating or saving a Task, Event, Note, Photo, or Document;
- generic Session editing; and
- presenting Growing-related information.

None of those actions independently establishes that Growing became current.

## Growing Setup Relationship

Growing setup may collect information required for an authorized Begin Growing
transition.

Draft or incomplete setup does not make Growing current. Presenting or opening
setup does not commence Growing. The canonical lifecycle transition—not a
Product, interface, form, or evidence record—owns the change in current phase.

This note does not determine whether setup is completed before, during, or as
part of an implementation operation. It defines no setup fields, interface,
workflow, or sequencing.

## Transition Outcome Integrity

At the domain boundary, a successful authorized Begin Growing transition
establishes one coherent canonical lifecycle outcome:

1. the authorized decision to continue is established;
2. Growing becomes the canonical current phase;
3. canonical Growing commencement is established under FN-006;
4. completed Germination remains durable; and
5. the lifecycle relationship between completed Germination and current
   Growing remains coherent.

A failed or incomplete attempt must not be treated as a successful canonical
transition.

This is a domain-integrity rule. It does not prescribe transactions, database
writes, RPCs, schemas, fields, migrations, persistence ordering, application
sequencing, or interface sequencing.

## No Implicit Growing Transition

No Product behavior, evidence record, timestamp, projection, migration, or
implementation precedent may infer that Growing became current solely because
Germination completed.

The following do not independently create or prove Growing entry:

- Germination completion time;
- opening Grow Companion;
- viewing Growing;
- a Growing setup draft;
- a Growing Phase record;
- first Growing evidence;
- Tasks;
- Events;
- Notes;
- Photos;
- Documents;
- Timeline;
- Calendar;
- analytics;
- reports;
- migration logic; or
- administrator interpretation.

These records and behaviors may retain their own canonical meaning. That
meaning does not transfer lifecycle-transition authority to them.

## Direct-Growing Path

This correction preserves the separately authorized direct-Growing entry path.

The two paths remain distinct:

### Seed-to-Growing

- Germination completes.
- A separate authorized Begin Growing transition occurs.
- Growing then becomes current.

### Direct-Growing

- The Session begins directly in Growing through its separately authorized
  lifecycle-entry action.

This note does not require Germination for every Session, redesign direct
Growing entry, merge the two paths, or make generic Session creation
universally equivalent to Growing commencement.

## Completed-Phase Durability

Separating Germination completion from Growing entry does not weaken completed
history.

Completed Germination remains:

- canonical;
- durable;
- reviewable;
- non-reactivated;
- distinct from current-phase state; and
- preserved whether Growing begins immediately, later, or not at all where
  another outcome is separately authorized.

Later lifecycle activity must not rewrite completed Germination into an active
phase or remove its canonical record.

## Relationship to FN-004

FN-004 remains the governing Session Lifecycle and Session Context authority.

This note narrowly supersedes only FN-004's automatic-transition rule under
Germination Completion. It does not supersede FN-004's phase model, phase
ordering, completed history, Grow Companion responsibilities, current-versus-
viewed distinction, Reflection behavior, or Session containment.

Where this note addresses whether Germination completion automatically makes
Growing current, this note governs. For every other FN-004 decision, FN-004
continues to govern.

## Relationship to FN-006

This note supplies the governing Seed-to-Growing transition semantics required
by FN-006.

It does not modify FN-006 and does not declare FN-006 approved, audited, or
unblocked. A later read-only architecture audit must determine whether FN-006
is conformant after this correction.

## Lower-Order Authority

IC-GC-002C did not independently amend Foundation authority.

Its intentional post-Germination continuation behavior becomes architecturally
conformant only through this higher-order Foundation decision. Contract text,
implementation, fixtures, tests, Product behavior, and implementation
precedent do not retroactively establish Foundation truth.

Composition and Implementation authority must inherit this decision without
reinterpretation.

## Architectural Invariants

### INV-IGT-001 — Separate lifecycle facts

Germination completion and Growing commencement are separate canonical facts.

### INV-IGT-002 — Intentional entry

Completed Germination enters Growing only through an authorized Begin Growing
transition.

### INV-IGT-003 — No automatic current phase

Germination completion alone does not make Growing current.

### INV-IGT-004 — No new phase

The post-Germination decision boundary is not a canonical phase or generalized
lifecycle state.

### INV-IGT-005 — Transition integrity

The authorized decision, current-phase change, Growing commencement, preserved
Germination, and lifecycle relationship form one coherent domain outcome.

### INV-IGT-006 — Interface non-authority

Growing setup may collect required information but does not own lifecycle
transition authority.

### INV-IGT-007 — Completed history

Completed Germination remains durable, reviewable, and non-reactivated.

### INV-IGT-008 — Direct entry remains distinct

Direct-Growing entry remains separately authorized and does not make generic
Session creation a universal commencement rule.

### INV-IGT-009 — No inferred transition

Evidence, timestamps, Products, Presentation, migration, administrators, and
implementation precedent cannot manufacture Growing entry.

### INV-IGT-010 — Bounded supersession

Only FN-004's automatic Germination-to-Growing transition rule is superseded.

## Explicit Exclusions

This note does not authorize or define:

- database fields, schemas, migrations, APIs, RPCs, triggers, or adapters;
- lifecycle commands or implementation contracts;
- implementation execution;
- persistence, chronology storage, or operation ordering;
- interfaces, modals, forms, controls, button labels, or workflows;
- Session Conditions behavior, migration eligibility, or per-Session cutover;
- legacy timestamp recovery or fallback chronology;
- correction or recovery operations;
- notifications, Timeline, Calendar, analytics, or reports;
- artificial intelligence or sensor behavior;
- a generalized workflow engine or lifecycle-event system;
- a new canonical lifecycle phase or architectural layer; or
- a new termination or abandonment model.

## Foundational Decision

Canonical Germination completion concludes Germination and preserves it as a
durable completed phase. It does not automatically commence Growing or make
Growing current.

For a Seed Session, Growing begins only when a distinct authorized Begin
Growing transition successfully becomes canonical. That transition establishes
the intentional continuation, current Growing phase, canonical commencement,
preserved Germination history, and coherent lifecycle relationship as one
domain outcome.

The post-Germination decision boundary creates no new phase. Direct-Growing
entry remains a separate authorized path. No Product, interface, evidence
record, timestamp, migration, administrator, or implementation precedent may
manufacture Growing entry.
