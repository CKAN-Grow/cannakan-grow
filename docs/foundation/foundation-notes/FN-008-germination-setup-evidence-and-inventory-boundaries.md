# Foundation Note FN-008 — Germination Setup Evidence and Inventory Boundaries

**Status:** Foundational Architecture
**Capability:** Germination Setup Evidence and Inventory Coordination
**Layer:** Canonical Platform
**Governing documents:** [Grow Foundation](../grow-foundation.md), [Grow Philosophy](../../philosophy/grow-philosophy.md), and [Grow Platform Architecture](../../platform/grow-platform-architecture.md)
**Related foundation:** [FN-003 — Canonical Entities & Representation](./FN-003-canonical-entities-and-representation.md) and [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](./FN-004-session-lifecycle-and-grow-companion.md)
**Next authorized artifact after approval:** A bounded Product Composition Specification for Germination Setup and the Germination phase experience

## Purpose

This Foundation Note establishes the canonical evidence and inventory
boundaries required when independently authoritative capabilities collaborate
during Germination Setup.

It governs only:

- Germination evidence owned by the canonical Grow Session;
- Seed Vault references, copied evidence, and inventory participation;
- user consumable-supply inventory participation;
- the integrity of coordinated canonical operations;
- downstream Grow Evidence Engine interpretation; and
- the non-owning roles of Grow Companion, Products, and Presentation.

It does not create a combined Germination inventory owner. It does not define
Product composition, interaction design, implementation, persistence, or
analytics formulas.

## Authoritative Context

The Grow Foundation and Grow Philosophy require recorded or deterministically
derived truth, explicit provenance, and honest Unknown or unresolved states.

FN-003 requires canonical ownership, durable evidence, preserved provenance,
and no parallel identity or evidence model.

FN-004 establishes:

- one continuous canonical Session;
- Grow Session ownership of Session-specific evidence;
- Seed Vault ownership of inventory, genetics, ownership, and acquisition
  information;
- GEE ownership of downstream evidence interpretation;
- Grow Companion as the capability that captures, structures, organizes,
  preserves, and presents Session evidence without becoming its owner; and
- intentional, lineage-preserving movement from operational evidence toward
  durable knowledge.

This note is subordinate to those authorities. It supplies only the previously
undefined evidence and inventory relationship required for Germination Setup.

If this note conflicts with a higher-order authority, the higher-order
authority governs and the conflicting behavior remains unauthorized.

## Architectural Decision

Germination Setup is a bounded coordination context, not a new canonical
domain.

It may coordinate authorized operations belonging to:

1. the canonical Grow Session;
2. the Seed Vault;
3. user consumable-supply inventory;
4. GEE; and
5. Grow Companion Product composition.

Participation in one setup experience never transfers ownership among those
capabilities.

Within that coordination:

- the Session may consume an authorized Vault reference or inventory operation
  without becoming the Vault owner;
- a Product may coordinate an authorized supply operation without becoming the
  supply owner;
- GEE may interpret eligible Session evidence without becoming an operational
  writer; and
- Grow Companion may compose the resulting authorized context without owning
  any participating truth.

These relationships do not imply shared storage, automatic synchronization, or
transferred ownership.

## Independent Canonical Owners

### Grow Session

The Grow Session owns:

- the Germination Setup evidence accepted for that Session;
- the seed groups and quantities assigned to that Session;
- the relationship between those seed groups and the Session's authorized
  Germination method positions or partitions;
- the evidence snapshot preserved from a referenced Vault record;
- Session-specific seed-age evidence;
- attributable setup corrections; and
- the durable historical evidence required to understand the Session later.

Session evidence does not become Seed Vault truth merely because it originated
from a Vault reference.

### Seed Vault

The Seed Vault owns:

- Vault-entry identity;
- seed inventory quantity;
- genetics and canonical Vault metadata;
- ownership and acquisition information;
- Vault-specific corrections and inventory history; and
- intentionally preserved knowledge authorized through its own capability.

A Session may reference a Vault entry and preserve copied evidence. It does not
become an alternate writer of the Vault record.

### User Consumable-Supply Inventory

User consumable-supply inventory is an independent canonical capability. It
owns:

- the identity of a tracked consumable supply;
- the owner's recorded available quantity;
- attributable increases, decreases, and corrections;
- the provenance and chronology of those inventory changes; and
- the authoritative current quantity and its relationship to those canonical
  inventory changes.

Filter papers may participate as a consumable supply where later Product
authority establishes applicability. This note does not limit the capability
to filter papers or authorize filter-paper participation for a particular
method.

### Grow Evidence Engine

GEE owns eligible evidence interpretation and derived analytics.

GEE does not own, create, correct, allocate, deduct, restore, or reconcile
Session evidence, Vault inventory, or supply inventory.

### Grow Companion

Grow Companion maintains one continuous working context and composes
already-authorized capability participation.

Grow Companion owns no seed evidence, Vault record, inventory quantity, supply
record, provenance, correction, allocation, deduction, or analytical meaning.

## Germination Setup Evidence

Germination Setup evidence is attributable evidence accepted for one canonical
Session before or while Germination becomes operationally established.

It may include, where supplied and authorized:

- seed-group identity;
- source, breeder, variety, type, and sex context;
- quantity assigned to the Session;
- acquisition evidence;
- seed-age evidence;
- method-position or partition assignment;
- a stable Vault reference;
- copied Vault evidence;
- user-authored evidence; and
- provenance describing where each value originated.

This list establishes evidence categories, not required interface fields,
storage columns, or a universal required-data policy.

Missing evidence remains missing. A setup experience must not replace absence
with a default source, variety, age, quantity, Vault relationship, or method
assignment.

## Seed Groups, Method Positions, and Partitions

A seed group is the bounded set of seeds treated as one attributable setup
unit within the Session.

A method position or partition is a Session-owned assignment context supplied
by an authorized Germination method. It is not a separate inventory owner or
evidence domain.

The Session owns the relationship among:

- the seed group;
- the assigned quantity;
- the authorized method position or partition; and
- any referenced Vault evidence.

Assigning seeds to a method position does not itself mutate Vault or supply
inventory. Inventory mutation occurs only through a separately authorized
owning operation.

The exact methods that expose seed groups, positions, or partitions and the
Product rules for duplicate or mixed assignments are deferred to Product
Composition.

## Canonical Seed-Age Evidence

Seed age must never be represented as an unqualified number whose meaning,
reference point, or precision is unknown.

Seed age is distinct from:

- overall Session age;
- canonical lifecycle-phase age;
- Germination elapsed time or ordinal Germination day; and
- plant age.

Canonical seed-age evidence consists of:

- the age-related source fact;
- the kind of reference represented by that fact;
- the precision of the source fact;
- its provenance;
- the instant or bounded period at which an age statement applies; and
- any deterministic derivation performed from those facts.

### Reference kinds

An age-related source fact may be:

- a recorded production, harvest, or comparable origin date;
- a recorded acquisition date;
- a recorded acquisition year;
- an attributable user statement of age as of a recorded date or instant; or
- Unknown.

A production or harvest reference may support chronological biological-age
context only to the precision of that source.

Acquisition information supports time-since-acquisition context. It must not be
silently represented as the biological age of the seed.

An attributable user statement remains a user statement. It must not be
promoted to a more precise system-derived fact.

### Evaluation point

When age is presented relative to the beginning of Germination, the canonical
evaluation point is canonical Germination commencement.

If canonical Germination commencement is unresolved, a derived age-at-
Germination value is also unresolved. Setup creation time, record creation
time, update time, Session creation time, or another fallback timestamp must
not replace the missing commencement fact.

### Precision

Derived age precision must not exceed source precision.

Examples of this invariant include:

- a complete authoritative date may support date-relative elapsed context;
- a year-only acquisition fact remains year-precision acquisition context and
  may support only a precision-preserving acquisition-age range or year-based
  context, not an exact age;
- an approximate user statement remains approximate; and
- an unknown origin remains Unknown.

No minimum age, midpoint, half-year value, or default age bucket becomes
canonical merely because it is convenient for Presentation or analytics. A
current-year subtraction from a year-only fact must not be presented as an
exact age; any authorized deterministic derivation must preserve the source's
year precision and acquisition-based meaning.

### Session freezing

Seed-age evidence accepted into a Session is preserved as a Session-owned
evidence snapshot with its reference kind, precision, provenance, and capture
context.

Later edits to a Vault entry do not silently rewrite historical Session
seed-age evidence. Later Session corrections do not silently mutate the Vault.

An authorized correction must preserve the distinction between:

- the value originally accepted into the Session;
- the corrected Session evidence;
- the reason and attribution for the correction; and
- the independently current Vault record.

## Session-to-Vault Relationship

Adding seed evidence from a Vault entry creates two distinct relationships:

1. a stable reference to the source Vault entry where that relationship is
   available; and
2. a Session-owned evidence snapshot sufficient to preserve what the Session
   relied upon at the time.

The stable reference preserves lineage. The copied evidence preserves
historical meaning.

Neither is a substitute for the other.

The Session snapshot must preserve the supplied Vault facts actually used to
establish Session evidence, together with:

- source record identity where available;
- capture context;
- source precision;
- provenance; and
- explicit absence for facts that were not available.

This Foundation Note does not prescribe a field list or schema. A later Product
Composition Specification must identify which authorized evidence categories
participate, and a later Implementation Contract must preserve them losslessly.

Later Vault editing, correction, archival, deletion, aliasing, or merging must
not silently change the copied historical Session evidence. A reference may
resolve to updated current Vault context while the Session snapshot remains
the evidence originally accepted, unless an attributable Session correction
is separately authorized.

Session-specific edits never mutate the Vault automatically.

## Vault Inventory Participation

Vault quantity and Session seed quantity are related but distinct canonical
facts:

- Vault quantity describes owner-recorded inventory controlled by the Seed
  Vault capability.
- Session quantity describes seeds assigned to the Germination Session.

Selecting or previewing a Vault entry does not by itself allocate or deduct
inventory.

Where later Product authority includes Vault inventory participation, it must
select an authorized Vault operation whose canonical meaning is explicit.

### Allocation and deduction meaning

A committed Vault deduction means that a specified quantity of seeds has been
committed from the owner's available Vault inventory to one identified
canonical Session operation.

A deduction:

- belongs to the Seed Vault inventory history;
- identifies the related Session operation;
- occurs no more than once for that operation;
- cannot reduce authoritative available quantity below its permitted canonical
  boundary;
- must remain distinguishable from a manual correction, loss, disposal, gift,
  or another inventory change; and
- does not make the Vault the owner of Session evidence.

This note does not create a reservation capability. If a future Product
requires reservation before commitment, that meaning requires separately
approved Foundation authority.

### Restoration

Session cancellation, deletion, abandonment, completion, or failure does not
prove that assigned seeds returned to available inventory.

Inventory must not be restored automatically from lifecycle state alone.

A restoration requires an authorized Vault inventory operation with
attributable evidence that the quantity is again available, or an authorized
reversal of an operation that never became canonically committed.

## Consumable-Supply Participation

A consumable-supply quantity is not a Session Condition, Germination result,
Task, Event, recommendation, or analytical conclusion.

It remains inventory owned by the consumable-supply capability.

Canonical supply inventory changes distinguish:

- **receipt or addition** — attributable inventory newly recorded as
  available;
- **consumption** — an attributable decrease linked to an authorized use;
- **correction** — repair of an incorrect canonical inventory statement while
  preserving correction provenance; and
- **reversal** — cancellation of an inventory operation that did not become
  canonically effective.

Ordering or opening a retail destination does not prove receipt and does not
change canonical inventory.

Recording replacement inventory requires an attributable supply-inventory
operation. Merely returning from a reorder destination does not replenish the
count.

Where Product authority makes a consumable relevant to Germination Setup, it
may request an authorized consumption operation from the supply capability.
The Product does not become the inventory writer.

This note does not define:

- relevant Germination methods;
- required quantities;
- warning thresholds;
- severity labels;
- setup-blocking policy;
- automatic versus user-confirmed consumption;
- reorder destinations; or
- Product actions.

## Coordinated Operation Integrity

Session evidence, Vault inventory, and supply inventory remain separate
canonical records even when one Product experience coordinates their owning
operations.

When later Product and contractual authority define a coupled Germination
Setup operation, the following invariants apply.

### One logical operation

The coordination has one stable logical operation identity.

Every participating owner retains its own record and mutation authority, but
all participating results identify the same logical operation where a
cross-capability relationship is required.

### Atomic canonical outcome

A coupled operation may be represented as successfully complete only when all
canonical outcomes required by its approved Product meaning have succeeded.

Implementation technology may use a database transaction, service
coordination, or another authorized mechanism. This note prescribes the
canonical integrity outcome, not the technical mechanism.

A partially applied operation must not be presented as fully successful,
silently abandoned, or converted into invented canonical truth.

### Idempotency

Repeating the same logical operation must not:

- create a second Session evidence result;
- deduct the same Vault quantity twice;
- consume the same supply quantity twice; or
- create duplicate correction or reconciliation history.

### Concurrency

Concurrent operations must preserve each owner's canonical quantity and must
not permit over-allocation or an invalid negative result.

A stale displayed count is not authorization to commit an unavailable
quantity.

### Failure and recovery

Failure in one required participating operation leaves the overall coupled
outcome unsuccessful or explicitly unresolved until an authorized recovery or
reconciliation operation establishes a canonical result.

Presentation must not guess whether missing inventory was consumed, restored,
or never committed.

The exact retry, compensation, transaction, and recovery mechanism is deferred
to an Implementation Contract after Product Composition is approved.

## Correction and Reconciliation

Correction repairs an incorrect canonical statement. It does not rewrite
history as though the earlier statement never existed.

Reconciliation resolves a detected mismatch among independently authoritative
capabilities. It does not transfer ownership or allow one capability to rewrite
another directly.

An authorized correction or reconciliation must preserve:

- affected canonical owner;
- original operation or record where available;
- prior canonical statement;
- corrected or reconciled result;
- attribution;
- reason;
- chronology; and
- cross-capability relationship where applicable.

The existence of a mismatch does not authorize Presentation, Grow Companion,
GEE, or a client-side fallback to select a preferred truth.

## Legacy and Unresolved Evidence

Existing Sessions, Vault records, and supply records remain valid within their
established authority.

This note does not authorize automatic backfill, reconstruction, deduction,
restoration, or migration.

For legacy records:

- a missing stable Vault reference remains missing;
- a missing Session snapshot remains missing;
- missing seed-age provenance remains unresolved;
- missing inventory-operation history remains unresolved;
- current Vault or supply quantity does not reconstruct an earlier quantity;
- Session creation, update, or lifecycle timestamps do not reconstruct an
  inventory operation; and
- current implementation behavior does not become retroactive canonical
  evidence.

A later Product Composition Specification must define honest presentation of
these states. A later Implementation Contract must stop rather than invent a
migration rule when authoritative reconstruction is impossible.

## GEE Participation

GEE may consume eligible canonical Session evidence and its preserved
provenance under separately approved analytical authority.

GEE may:

- derive authorized seed-age analyses from eligible qualified evidence;
- distinguish evidence by reference kind and precision;
- exclude or classify Unknown evidence according to approved GEE contracts; and
- preserve lineage to the canonical Session evidence consumed.

GEE may not:

- infer a missing age reference;
- increase evidence precision;
- replace Session or Vault evidence;
- allocate or mutate inventory;
- repair cross-capability mismatches; or
- turn implementation defaults into canonical evidence.

This note does not define formulas, buckets, scoring, eligibility thresholds,
confidence rules, or Fair View presentation.

## Product and Presentation Boundaries

After this note passes Architecture Audit, receives owner approval, and enters
repository history, one bounded Product Composition Specification may define:

- how Session Setup composes the authorized evidence and inventory
  capabilities;
- which methods and method positions participate;
- Track Seed Age participation and modes;
- Add from My Seed Vault participation;
- filter-paper applicability and Product policy;
- setup, Active Germination, and completed-Germination composition;
- action hierarchy;
- empty, unavailable, unresolved, access-denied, loading, and recoverable-error
  meanings; and
- responsive Product behavior.

That Product specification must consume the canonical boundaries in this note
without redefining them.

Presentation may render supplied Product meaning and collect input for
authorized owning operations. It may not:

- own or calculate canonical inventory;
- infer seed age or provenance;
- mutate a Vault or supply record directly;
- decide atomicity, idempotency, concurrency, correction, or reconciliation;
- treat a missing record as unavailable, not applicable, or empty without
  owning authority; or
- convert a failed or partial operation into success.

## Explicit Non-Goals

This Foundation Note does not:

- create one aggregate Germination inventory capability;
- redefine Session Lifecycle, phase commencement, Germination completion, or
  Growing transition;
- define Product layout, hierarchy, navigation, controls, or visual design;
- define filter-paper thresholds, warnings, severity, retail destinations, or
  replenishment interface;
- define method eligibility;
- define required Session Setup fields;
- define Task, Event, Note, Photo, Document, Timeline, Calendar, or Reflection
  behavior;
- prescribe database tables, columns, constraints, RPCs, APIs, transactions,
  queues, locks, or storage technology;
- define GEE calculations or Fair View behavior;
- authorize data migration or legacy reconstruction;
- authorize implementation;
- authorize public sharing or knowledge distillation; or
- modify existing application behavior.

## Canonical Invariants

1. Germination Setup is a coordination context, not a canonical aggregate
   owner.
2. The Grow Session owns Session-specific Germination evidence.
3. The Seed Vault owns Vault records and inventory.
4. User consumable-supply inventory owns its supply records and quantities.
5. GEE owns interpretation only.
6. Grow Companion and Presentation own no participating canonical truth.
7. Session quantity, Vault quantity, and supply quantity remain distinct facts.
8. A Vault reference and copied Session evidence serve different purposes and
   neither replaces the other.
9. Session evidence accepted from a Vault remains historically stable unless
   corrected through an authorized Session operation.
10. Seed-age evidence retains reference kind, precision, provenance, and
    evaluation context.
11. Unknown or unresolved evidence is never replaced by a default or fallback.
12. Selecting, viewing, or previewing inventory does not mutate it.
13. Every inventory mutation belongs to its owning capability and has explicit
    canonical meaning.
14. A logical operation cannot deduct or consume the same quantity more than
    once.
15. Concurrent operations cannot authorize over-allocation.
16. A coupled operation is successful only when all required canonical
    outcomes succeed.
17. Partial failure is not silent success.
18. Correction and reconciliation preserve attribution and history.
19. Lifecycle state alone never proves inventory restoration.
20. Existing implementation behavior cannot create retroactive authority.

## Acceptance Criteria

This Foundation Note is complete only if later Architecture Audit confirms
that:

1. every participating capability retains an independent canonical owner;
2. no aggregate Germination inventory domain is created;
3. Session evidence and Vault truth remain distinct and related through
   explicit lineage;
4. seed-age meaning cannot be implemented without its reference, precision,
   provenance, and Unknown handling;
5. Vault and supply mutations have owner-preserving canonical meanings;
6. atomicity, idempotency, concurrency, failure, correction, and reconciliation
   are established as integrity invariants without prescribing technology;
7. GEE remains downstream and non-mutating;
8. Product Composition has a bounded authorized next step;
9. Presentation cannot fill any unresolved canonical decision; and
10. no implementation, migration, schema, visual design, or Product policy is
    authorized by this note.

## Decision History

- July 28, 2026 — Proposed as the bounded Foundation prerequisite identified by
  the approved Germination Setup, Seed Evidence & Supply Integrity Authority
  Assessment and its corrected authority-status re-evaluation.
- July 28, 2026 — Architecture Audit verdict: **PASS WITH NON-BLOCKING
  CLARIFICATIONS**. Founder approval recorded. Approval authorizes repository
  closure only. Product Composition, Implementation Contract, implementation,
  migration, and visual-design authority remain separately gated.
