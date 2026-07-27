# IC-SC-001B — Canonical Growing Commencement and Legacy Chronology

**Status:** Draft — Requires Read-Only Architecture Audit
**Capability:** 2A — Session Conditions
**Layer:** Implementation Contract
**Supplements:** [IC-SC-001 — Session Conditions Implementation Contract](./IC-SC-001-session-conditions.md)
**Foundation authority:** [FN-006 — Canonical Phase Commencement and Lifecycle Chronology](../foundation-notes/FN-006-canonical-phase-commencement-and-lifecycle-chronology.md)
**Transition authority:** [FN-007 — Intentional Transition from Germination to Growing](../foundation-notes/FN-007-intentional-transition-from-germination-to-growing.md)
**Product authority:** [CS-SC-001B — Canonical Growing Commencement and Legacy Chronology](../../product/grow-sessions/session-conditions-growing-commencement-and-legacy-chronology-composition-specification.md)

## 1. Purpose

This contract authorizes the bounded implementation obligations required to
realize committed canonical Growing commencement and unresolved legacy
chronology authority.

It supplements IC-SC-001. It does not replace, reinterpret, or weaken that
contract.

This contract authorizes implementation behavior only. It creates no
Foundation truth, Product Composition, lifecycle authority, chronology
classification, or implementation design.

## 2. Governing Authority

Implementation inherits:

- [Grow Platform Architecture](../../platform/grow-platform-architecture.md);
- [Grow Architecture Governance](../../governance/grow-architecture-governance.md);
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../foundation-notes/FN-004-session-lifecycle-and-grow-companion.md);
- [FN-005 — Canonical Session Conditions](../foundation-notes/FN-005-canonical-session-conditions.md);
- [FN-006 — Canonical Phase Commencement and Lifecycle Chronology](../foundation-notes/FN-006-canonical-phase-commencement-and-lifecycle-chronology.md);
- [FN-007 — Intentional Transition from Germination to Growing](../foundation-notes/FN-007-intentional-transition-from-germination-to-growing.md);
- [CS-SC-001 — Session Conditions Composition](../../product/grow-sessions/session-conditions-composition-specification.md);
- [CS-SC-001A — Initial Session Conditions Dimensions and Existing Truth](../../product/grow-sessions/session-conditions-initial-dimensions-composition-specification.md);
- [CS-SC-001B — Canonical Growing Commencement and Legacy Chronology](../../product/grow-sessions/session-conditions-growing-commencement-and-legacy-chronology-composition-specification.md);
- [IC-GC-002B — Grow Companion Structural Foundation](./IC-GC-002B-grow-companion-structural-foundation.md);
- [IC-GC-002C — Session Entry and Growing Foundation](./IC-GC-002C-session-entry-and-growing-foundation.md); and
- [IC-SC-001 — Session Conditions Implementation Contract](./IC-SC-001-session-conditions.md).

All implementation authority derives from this committed hierarchy.
Architectural ambiguity must stop implementation rather than be resolved by
implementation precedent.

## 3. Contract Authority

This contract authorizes one bounded implementation slice:

1. canonical recording of Growing commencement for future authorized lifecycle
   entries;
2. atomic preservation of transition, lifecycle state, and commencement;
3. deterministic, access-safe retrieval of commencement;
4. deterministic unresolved representation for legacy Sessions without
   authoritative commencement; and
5. read-only consumption by Session Conditions and other authorized Product
   consumers.

Nothing outside this slice is authorized.

IC-SC-001 continues to govern Session Conditions identity, periods,
normalization, operations, Current Conditions, retrieval, security, and its
separately approved cutover boundary. This supplement does not independently
execute, broaden, or replace IC-SC-001 migration authority.

## 4. One Canonical Commencement Path

Implementation must provide one canonical Session Lifecycle boundary through
which Growing commencement is established, preserved, and retrieved.

Both authorized Growing-entry operations use that boundary. They do not create
separate chronology authorities.

Growing commencement remains owned exclusively by Session Lifecycle.
Consumers remain read-only and may not create, derive, repair, normalize,
correct, replace, or persist a competing commencement fact.

No implementation-owned or Product-owned chronology source is authorized.

## 5. Future Lifecycle Recording

Every successful authorized lifecycle entry that makes Growing current after
this slice becomes operative must durably establish canonical Growing
commencement.

### 5.1 Seed-to-Growing

For the Seed-to-Growing path, implementation must preserve one canonical
outcome containing:

- the authorized Begin Growing transition;
- Growing as the resulting canonical current phase;
- canonical Growing commencement at the instant that transition becomes
  canonical; and
- completed Germination as durable canonical history.

Germination completion alone must not create commencement or make Growing
current.

### 5.2 Direct-Growing

For the direct-Growing path, implementation must preserve one canonical
outcome containing:

- the authorized direct-Growing Session creation and lifecycle entry;
- Growing as the initial canonical current phase; and
- canonical Growing commencement at the instant that domain action succeeds.

Generic Session creation outside this bounded domain action must not establish
Growing commencement.

## 6. Atomic Lifecycle Integrity

The authorized lifecycle action, resulting lifecycle state, and canonical
commencement must become observable as one indivisible canonical outcome.

Consumers must never observe:

- Growing current without its required canonical commencement;
- canonical commencement without the corresponding authorized lifecycle
  action;
- commencement assigned to another Session or phase;
- a partially completed transition; or
- conflicting state and chronology.

A failed or interrupted operation must expose none of its attempted canonical
outcome. It must roll back completely or remain non-canonical and
non-observable.

Internal transaction, service, schema, and deployment mechanisms remain
implementation choices. Atomic observable behavior is mandatory.

## 7. Canonical Retrieval

Implementation must provide deterministic, access-safe retrieval of canonical
Growing commencement for one authorized Session.

Commencement retrieval exposes exactly one of two meanings:

1. **authoritative commencement** — Session Lifecycle supplies the durable
   canonical commencement fact; or
2. **unresolved commencement** — no Foundation-authoritative commencement fact
   exists for that Session.

No additional commencement classification is authorized.

This two-outcome commencement contract does not redefine the separate Current
Conditions result meanings governed by IC-SC-001.

Retrieval must not select a result from record order, update time, Product
state, Presentation state, cached labels, or another consumer's output.
Equivalent authoritative inputs must produce equivalent results.

## 8. Required Observable Behavior

Regardless of internal implementation strategy:

- a successful authorized Growing entry exposes matching state and
  commencement;
- a failed entry exposes neither;
- future authorized entries expose authoritative commencement;
- legacy Sessions without authoritative chronology expose unresolved
  commencement;
- repeated retrieval exposes the same canonical meaning for unchanged inputs;
- unauthorized consumers receive no inaccessible Session chronology; and
- Product consumers cannot alter the retrieved meaning.

Implementation details must not change externally observable canonical
behavior.

## 9. Legacy Representation

A legacy Session without Foundation-authoritative Growing commencement must
remain unresolved.

Implementation must not manufacture chronology from:

- Session `created_at` or generic creation time;
- Session or Growing `updated_at`;
- Growing Phase creation time;
- Germination completion time;
- first Growing evidence;
- Tasks, Events, Notes, Photos, or Documents;
- Timeline, Calendar, analytics, or reporting data;
- migration order or deployment time;
- administrator judgment; or
- an inferred, estimated, reconstructed, or approximate timestamp.

Unresolved commencement is not a lifecycle phase, lifecycle state, Session
status, correction, or approximate date.

## 10. Legacy Eligibility

Eligibility is determined independently for each canonical Session from
Foundation-authoritative lifecycle truth.

A Session is eligible for authoritative commencement retrieval only when its
canonical lifecycle outcome includes authoritative Growing commencement.

A legacy Session whose state indicates Growing but lacks that authoritative
fact remains unresolved. An implementation release, schema change, or new
retrieval path must not automatically make it eligible.

This contract authorizes no legacy migration execution, chronology recovery,
backfill, administrator selection, estimation, or inferred eligibility.

A later recovery or migration operation requires separate authority. This
supplement must not be treated as permission to execute IC-SC-001 migration for
a Session whose required commencement remains unresolved.

## 11. Session Conditions Contract

Session Conditions may consume canonical commencement only through the
authoritative Session Lifecycle boundary.

Session Conditions must never:

- own commencement;
- derive or repair commencement;
- redefine commencement meaning;
- substitute another timestamp;
- convert unresolved chronology into authoritative chronology; or
- persist a competing lifecycle fact.

When commencement is authoritative, IC-SC-001 may consume it within its
separately approved period-applicability rules.

When commencement is unresolved, implementation must expose deterministic
unresolved behavior and must not manufacture a period boundary or Current
Conditions result.

No Presentation behavior is authorized.

## 12. Integrity Requirements

Implementation must guarantee:

- deterministic behavior for equivalent canonical inputs;
- complete rollback of failed or incomplete lifecycle entries;
- idempotent duplicate-submission protection;
- stale and conflicting mutation rejection;
- one canonical commencement per authorized Growing entry;
- no partial canonical state;
- no partial canonical chronology;
- no duplicate or parallel chronology authority;
- access-safe retrieval; and
- durable preservation after later lifecycle activity.

Repeating the same completed lifecycle operation must return the same canonical
outcome without creating duplicate chronology. Reusing an operation identity
with different input must fail.

## 13. Security Contract

Canonical commencement inherits access through its parent canonical Session.

Implementation must enforce:

- authenticated, owner-authorized lifecycle action;
- parent Session ownership validation;
- immutable Session and phase attribution;
- unauthorized mutation denial;
- cross-owner and cross-Session mutation denial;
- anonymous mutation denial;
- access-safe retrieval;
- least-privilege access;
- authoritative enforcement that cannot be replaced by client checks; and
- no browser service-role or equivalent privileged write path.

Clients may request an authorized lifecycle action. They may not author,
select, override, or correct the canonical commencement instant directly.

This contract changes no existing Session ownership, privacy, sharing,
publication, authorization, RLS, Preview Studio, demo, QA, scenario, or service
credential boundary.

## 14. Explicit Prohibitions

Implementation must not:

- infer or approximate commencement;
- duplicate chronology;
- create consumer-owned or Product-owned chronology;
- create a parallel chronology authority;
- substitute generic Session creation;
- substitute Germination completion;
- substitute Growing evidence;
- substitute Tasks, Events, Notes, Photos, or Documents;
- introduce administrator chronology overrides;
- introduce chronology correction workflows;
- execute chronology migration or backfill;
- introduce migration heuristics;
- create a new lifecycle phase or state; or
- create a new commencement classification.

Each prohibited capability requires separate authority.

## 15. Implementation Freedom

Implementation teams may choose internal mechanisms that preserve every
contractual obligation in this document.

Implementation choices may include:

- schema organization;
- transaction implementation;
- RPC organization;
- service boundaries;
- indexes;
- deployment sequencing;
- concurrency mechanisms;
- query optimization; and
- internal adapter structure.

These choices must not alter canonical authority, observable behavior,
atomicity, security, or unresolved legacy meaning.

Implementation freedom is not authority to add Product behavior or
architecture.

## 16. Non-Goals

This contract does not authorize:

- Foundation truth or Product Composition;
- lifecycle redesign;
- chronology recovery or correction;
- migration or backfill execution;
- administrator chronology editing;
- user-interface behavior;
- Timeline or Calendar rendering;
- analytics or reporting behavior;
- notification behavior;
- implementation optimization as an independent production slice;
- new Session Conditions dimensions or applicability scopes; or
- changes to Grow Companion responsibilities.

## 17. Contract Invariants

### INV-IC-SC-001B-01 — Supplemental authority

This contract supplements and does not replace IC-SC-001.

### INV-IC-SC-001B-02 — Lifecycle ownership

Session Lifecycle exclusively owns canonical Growing commencement.

### INV-IC-SC-001B-03 — One canonical boundary

Both authorized lifecycle paths establish and retrieve commencement through
one canonical lifecycle boundary.

### INV-IC-SC-001B-04 — Atomic outcome

Authorized transition, resulting lifecycle state, and commencement are one
indivisible observable outcome.

### INV-IC-SC-001B-05 — Two retrieval meanings

Commencement retrieval yields authoritative or unresolved meaning only.

### INV-IC-SC-001B-06 — Honest legacy uncertainty

Missing authoritative legacy chronology remains unresolved.

### INV-IC-SC-001B-07 — No migration authority

This supplement authorizes no migration, backfill, recovery, or approximation.

### INV-IC-SC-001B-08 — Consumer non-authority

Session Conditions and other consumers remain read-only.

### INV-IC-SC-001B-09 — No duplicate chronology

No implementation or consumer owns a competing commencement fact.

### INV-IC-SC-001B-10 — Access-safe chronology

Retrieval and mutation preserve parent Session ownership and authorization.

### INV-IC-SC-001B-11 — Implementation freedom

Internal mechanisms may vary; canonical observable behavior may not.

## 18. Verification Requirements

A later implementation must provide executable proof that:

- both authorized Growing-entry paths establish commencement;
- Germination completion alone does not establish commencement;
- generic Session creation does not establish commencement;
- state, transition, and commencement become observable atomically;
- failed operations expose no partial state or chronology;
- duplicate submission creates no duplicate chronology;
- stale or conflicting mutation fails;
- authoritative commencement retrieval is deterministic;
- legacy Sessions without authoritative chronology remain unresolved;
- no prohibited fallback timestamp becomes canonical;
- Session Conditions consume but cannot mutate commencement;
- owner-authorized lifecycle actions succeed;
- anonymous, cross-owner, and cross-Session mutations fail;
- inaccessible chronology is excluded from retrieval;
- existing IC-SC-001 behavior remains intact; and
- unrelated lifecycle, Session Context, Grow Companion, Product, and
  Presentation behavior remains unchanged.

Verification evidence cannot create architecture or expand implementation
scope.

## 19. Implementation Gate

Implementation may begin only after:

1. this contract passes a read-only Architecture Audit;
2. its documentation Git step completes;
3. the contract phase is formally closed; and
4. a separately authorized Implementation Execution applies only this bounded
   slice.

Creation of this document authorizes no application code, test, schema,
migration, API, security, configuration, or Presentation change by itself.
