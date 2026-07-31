# ICE-SC-003 — Current Conditions Operations and Forward-Only Legacy Declaration

**Status:** Approved — Architecture Audit Passed; Implementation Contract Execution Governance Complete; Implementation Not Authorized
**Executes:** [IC-SC-001C — Current Conditions Operations and Forward-Only Legacy Declaration](../implementation-contracts/IC-SC-001C-current-conditions-operations-and-forward-only-legacy-declaration.md)
**Succeeds:** [ICE-SC-002 — Session Conditions First Canonical Production Slice](./ICE-SC-002-session-conditions-first-canonical-production-slice.md)
**Preserves:** [ICE-SC-001 — Session Conditions Implementation Contract Execution](./ICE-SC-001-session-conditions-implementation-contract-execution.md) and [ICE-SC-002 — Session Conditions First Canonical Production Slice](./ICE-SC-002-session-conditions-first-canonical-production-slice.md)

## 1. Purpose

ICE-SC-003 translates IC-SC-001C into one bounded, ordered, auditable
execution for Current Conditions operations and one forward-only declaration
for eligible unresolved legacy Sessions.

The execution has one inseparable implementation and Product-write authority
cutover boundary. Splitting persistence, operations, corrections, forward
declaration, projections, security, adapters, migration, verification, or
cutover into separate ICE artifacts would risk simultaneous write authority,
partial canonical behavior, incompatible evidence, incorrect history,
incomplete security, unsafe rollback, or fabricated truth.

This proposed artifact does not authorize implementation. It creates no
Foundation, Product Composition, lifecycle, schema, migration, RPC, adapter,
test, deployment, or production authority.

## 2. Governing Authority

Execution inherits, in order:

1. [Grow Platform Architecture](../../platform/grow-platform-architecture.md);
2. [Grow Foundation](../grow-foundation.md);
3. [Grow Philosophy](../../philosophy/grow-philosophy.md);
4. [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../foundation-notes/FN-004-session-lifecycle-and-grow-companion.md);
5. [FN-005 — Canonical Session Conditions](../foundation-notes/FN-005-canonical-session-conditions.md);
6. [FN-006 — Canonical Phase Commencement and Lifecycle Chronology](../foundation-notes/FN-006-canonical-phase-commencement-and-lifecycle-chronology.md);
7. [FN-007 — Intentional Transition from Germination to Growing](../foundation-notes/FN-007-intentional-transition-from-germination-to-growing.md);
8. [CS-GC-008 — Grow Companion Workspace Composition and Coordination](../../product/grow-sessions/grow-companion-workspace-composition-and-coordination-specification.md);
9. [CS-SC-001 — Session Conditions Composition](../../product/grow-sessions/session-conditions-composition-specification.md);
10. [CS-SC-001A — Initial Session Conditions Dimensions and Existing Truth](../../product/grow-sessions/session-conditions-initial-dimensions-composition-specification.md);
11. [CS-SC-001B — Canonical Growing Commencement and Legacy Chronology](../../product/grow-sessions/session-conditions-growing-commencement-and-legacy-chronology-composition-specification.md);
12. [CS-SC-001C — Current Conditions Operations and Forward-Only Legacy Declaration Composition Specification](../../product/grow-sessions/session-conditions-current-conditions-operations-and-forward-only-legacy-declaration-composition-specification.md);
13. [IC-SC-001 — Session Conditions Implementation Contract](../implementation-contracts/IC-SC-001-session-conditions.md);
14. [IC-SC-001B — Canonical Growing Commencement and Legacy Chronology](../implementation-contracts/IC-SC-001B-canonical-growing-commencement-and-legacy-chronology.md); and
15. [IC-SC-001C — Current Conditions Operations and Forward-Only Legacy Declaration](../implementation-contracts/IC-SC-001C-current-conditions-operations-and-forward-only-legacy-declaration.md).

Higher-order authority remains governing. Existing implementation is
lower-order evidence. Ambiguity, contradiction, insufficient authority, or an
inability to preserve canonical evidence must stop execution.

## 3. Relationship to IC-SC-001C

ICE-SC-003 executes IC-SC-001C only. It must realize:

- one complete Change Current Conditions operation over one or both supplied
  dimensions;
- canonical changed-set calculation and canonical no-change;
- one success-only effective boundary for all changed dimensions;
- complete-operation concurrency, revision, fingerprinting, and idempotency;
- prospective value-only correction with optional correction-note provenance;
- one atomic forward-only declaration for eligible unresolved legacy
  Sessions;
- honest earlier legacy unavailability;
- deterministic Current Conditions and Condition History;
- owner-scoped security; and
- evidence-preserving migration, adapter replacement, verification, rollback,
  interruption handling, and final authority cutover.

This artifact does not reinterpret IC-SC-001C, select final physical schema or
API shapes, or expand its authority.

## 4. Relationship to ICE-SC-001 and ICE-SC-002

ICE-SC-003 succeeds ICE-SC-002 in the Session Conditions execution sequence.
It does not reopen, replace, invalidate, or erase ICE-SC-001 or ICE-SC-002.

ICE-SC-001 remains the completed execution authority for canonical Growing
commencement and unresolved lifecycle chronology. ICE-SC-003 consumes that
authority read-only and cannot establish, alter, infer, repair, or backfill
commencement.

ICE-SC-002 remains the completed first canonical Session Conditions slice.
Valid periods, corrections, operations, provenance, revisions, security
outcomes, migration evidence, and implementation evidence remain valid.
ICE-SC-003 boundedly replaces only runtime behavior superseded by IC-SC-001C:
sequential Product changes, caller-selected change boundaries, canonical
equal-value mutation, prospective boundary-changing correction, and
unconditional unresolved-commencement refusal where forward declaration is
eligible.

Historical evidence created under prior authority remains attributable to
that authority and is not retroactively reclassified.

## 5. Execution Scope

One bounded ICE-SC-003 execution governs:

1. repository and existing-data preflight;
2. additive persistence evolution;
3. complete-operation identity, fingerprinting, outcomes, and revision;
4. canonical one-or-two-dimension Change Current Conditions;
5. canonical changed-set and no-change enforcement;
6. success-only canonical operation time;
7. complete-operation concurrency and deterministic retry;
8. prospective value-only correction;
9. optional correction-note provenance;
10. forward-only unresolved-legacy declaration;
11. Current Conditions and Condition History compatibility;
12. owner-scoped security and least privilege;
13. historical-evidence assessment and preservation;
14. migration and application-adapter replacement;
15. executable verification;
16. rollback and interruption handling;
17. one final Product-write authority cutover;
18. retirement of old sequential and caller-timed Product writes; and
19. post-cutover verification and production evidence.

The later authorized execution must produce:

- one canonical operation changing Grow Method, Environment Type, or both;
- canonical changed-set calculation;
- exact `No changes to save` meaning with no mutation or revision;
- one shared success boundary and atomic two-dimension changes;
- no caller-selected boundary, backdating, or future scheduling;
- complete-operation concurrency and idempotency;
- prospective value-only correction with preserved historical boundary
  corrections;
- optional correction-note provenance and derived `Corrected` meaning;
- atomic two-dimension forward declaration for eligible unresolved legacy
  Sessions;
- declaration-forward applicability with earlier conditions unavailable;
- no new Growing commencement or lifecycle chronology;
- derived Current Conditions;
- history that distinguishes initial evidence, changes, corrections, forward
  declarations, and earlier unavailability; and
- preserved owner security and lifecycle boundaries.

## 6. Explicit Exclusions

ICE-SC-003 authorizes no:

- new Foundation or Product Composition authority;
- change to IC-SC-001C meaning;
- dimension beyond Grow Method and Environment Type;
- per-entry, per-position, per-plant, partition, or arbitrary-record
  conditions;
- lifecycle, Germination, population, progress, completion, or Reflection
  authority;
- separately persisted Current Conditions record;
- Task, Event, Note, Photo, Document, notification, Recent Activity, shared
  Chronology, analytics, recommendation, or automation behavior;
- implementation during creation or governance of this artifact;
- staging, commit, push, deployment, or production execution; or
- unrelated cleanup, refactoring, dependency, asset, index, ledger, or
  governance repair.

## 7. Repository and Data Preflight

Before implementation, the later explicitly authorized task must record:

- repository root, branch, HEAD, and staged paths;
- exact attributable path boundary;
- schema and schema-snapshot identity;
- applied migration state;
- relevant tables, constraints, functions, policies, grants, and revocations;
- current Session Conditions read and mutation adapters;
- verification baseline and available test infrastructure;
- production-data access status; and
- production execution status.

The preflight must determine, without assuming presence or absence, whether
existing evidence may contain:

- sequential Grow Method and Environment Type writes;
- partial sequential success;
- equal-value mutations;
- caller-selected past boundaries;
- caller-selected future boundaries;
- corrections that changed `effective_start`;
- corrections that changed `effective_end`;
- incomplete composite provenance; and
- unresolved legacy Sessions.

When a category cannot be assessed safely, execution must fail closed before
authority cutover, preserve all existing evidence, record interruption, and
stop.

## 8. Existing Implementation Baseline

Lower-order repository evidence includes:

- [canonical Growing commencement migration](../../../supabase/migrations/20260727120000_canonical_growing_commencement.sql);
- [first canonical Session Conditions migration](../../../supabase/migrations/20260728120000_session_conditions_first_canonical_slice.sql);
- [schema snapshot](../../../supabase-schema.sql);
- [Growing and Session Conditions adapter](../../../src/growing-foundation.js);
- [Session Conditions regression verification](../../../scripts/session-conditions-canonical-slice-regression-check.mjs); and
- [Growing commencement regression verification](../../../scripts/session-conditions-growing-commencement-regression-check.mjs).

That evidence provides stable Sessions, two constrained dimensions,
independent half-open periods, one open period per dimension, correction
history, operation identities, fingerprints, aggregate revision,
owner-scoped retrieval, RLS, deterministic Current Conditions, and normal
commencement consumption.

It also proves the bounded replacement need:

- Product saves may call one dimension and then the other;
- each existing change accepts a caller-selected effective boundary;
- equality is authoritative only in the client;
- the canonical boundary may accept an equal normalized value;
- correction may change applicability boundaries;
- no correction-note persistence exists;
- no forward-declaration authority or provenance exists;
- unresolved commencement currently prevents condition establishment; and
- projections and history do not classify forward declaration or earlier
  legacy unavailability.

## 9. Authorized Implementation Path Envelope

A later separately authorized implementation task may need to modify only
paths proven necessary within these bounded areas:

- one or more new Supabase migrations, with identities selected by that later
  task rather than this artifact;
- `supabase-schema.sql`;
- `src/growing-foundation.js`;
- directly relevant Session Conditions application integration;
- Session Conditions regression and verification scripts;
- directly relevant Playwright tests;
- this ICE's status when separately authorized governance or completion work
  requires it;
- the canonical execution index when separately required; and
- Production Ledger or interruption evidence required by the execution.

The later implementation prompt must identify exact attributable paths before
editing. Unrelated paths remain unauthorized.

## 10. Ordered Execution Model

Execution consists of exactly these ordered phases:

1. Phase 0 — Repository and Data Preflight
2. Phase 1 — Additive Persistence Support
3. Phase 2 — Canonical Operations and Transactions
4. Phase 3 — Projection and History Compatibility
5. Phase 4 — Security Installation
6. Phase 5 — Existing-Evidence Assessment and Preservation
7. Phase 6 — Adapter Preparation
8. Phase 7 — Pre-Cutover Verification
9. Phase 8 — Final Authority Cutover
10. Phase 9 — Post-Cutover Verification or Interruption

No phase independently authorizes implementation. No later phase may begin
until the preceding phase's exit conditions are satisfied and recorded.

## 11. Phase 0 — Repository and Data Preflight

### Entry Conditions

- ICE-SC-003 has passed its required Architecture Audit.
- Founder governance approval and separate implementation authorization exist.
- Repository root, branch, HEAD, staged state, and attributable paths are
  recorded.

### Authorized Work

- Inspect repository, schema snapshot, applied migrations, deployed objects,
  adapter paths, verification tooling, production-data access, and execution
  status.
- Classify the nine historical categories required by Section 7.

### Required Evidence

- Exact repository and environment baseline.
- Schema, migration, function, policy, adapter, and test inventory.
- Per-category assessment method and result.
- Proof that no unrelated path entered the attributable set.

### Exit Conditions

- Every baseline fact is recorded.
- Each historical category is classified or has an explicit fail-closed
  branch.
- The planned attributable path set is exact.

### Stop Conditions

- Repository or schema state differs unexpectedly.
- Applied migrations or production execution status cannot be determined.
- A category cannot be assessed or preserved safely.
- Unrelated work cannot be isolated.

### Interruption Outcome

Preserve repository and production state, record the unresolved fact and
completed preflight evidence, identify safe restart conditions, and stop
before persistence or authority change.

## 12. Phase 1 — Additive Persistence Support

### Entry Conditions

- Phase 0 exit conditions are satisfied.
- Additive changes cannot activate new Product-write authority.
- Existing canonical identities and evidence are protected.

### Authorized Work

- Add support for complete-operation identity, complete-request fingerprinting,
  composite outcomes, optional correction-note provenance, distinct
  forward-declaration authority and provenance, shared operation boundaries,
  one revision result, and deterministic history classification.
- Extend integrity controls only as required by IC-SC-001C.

### Required Evidence

- Migration and schema-snapshot parity.
- Existing period, correction, operation, and commencement identities remain
  unchanged.
- No separate Current Conditions store exists.
- New write authority remains dormant.

### Exit Conditions

- Additive support is present and inaccessible outside internal preparation.
- Existing reads and writes remain deterministic.
- Existing evidence is unchanged.

### Stop Conditions

- A destructive rewrite or reidentification is required.
- Unresolved chronology would become commencement.
- Additive objects expose reachable new mutation authority.

### Interruption Outcome

Roll back safely or leave additions dormant and inaccessible, preserve
existing authority and evidence, record incomplete work, and define safe
restart conditions.

## 13. Phase 2 — Canonical Operations and Transactions

### Entry Conditions

- Phase 1 persistence support is complete and verified.
- Required security can protect all new operation paths.
- New operations remain unavailable to Product callers.

### Authorized Work

Implement three distinct operations:

1. Change Current Conditions
2. Correct a Condition Record
3. Set Current Conditions for an Unresolved Legacy Session

Each requires its own atomic transaction, stable operation identity, normalized
request fingerprint, authenticated owner authority, stable Session identity,
validation, complete-operation concurrency, deterministic outcomes,
success-only canonical time, one revision result, idempotent retry, and no
cross-capability side effects.

Change must compute the changed set, return `No changes to save` without
mutation when empty, and commit one or two dimensions at one boundary.
Correction must target one assertion, preserve effective boundaries, and
persist optional note provenance. Forward declaration must verify eligibility,
require both dimensions, establish both forward from one boundary, and create
no earlier period or commencement.

### Required Evidence

- Atomic success and failure outcomes for all operations.
- Complete fingerprints and deterministic retries.
- One revision on success and none on no-change or failure.
- No partial evidence or projection.
- Success-only time selected by the owning boundary.

### Exit Conditions

- All three dormant operations conform to IC-SC-001C.
- Partial canonical success is impossible.
- Old Product mutation paths remain authoritative until cutover.

### Stop Conditions

- Atomicity or complete-operation concurrency cannot be proven.
- Caller-selected time remains authoritative.
- No-change creates evidence or revision.
- An operation crosses a capability boundary.

### Interruption Outcome

Keep new operations unreachable, preserve old authority, leave incomplete
objects safely dormant or remove them, record failure evidence, and stop.

## 14. Phase 3 — Projection and History Compatibility

### Entry Conditions

- Phase 2 outcome and evidence shapes are stable.
- Existing projection behavior is baselined.
- Compatibility can be added without switching mutation authority.

### Authorized Work

- Extend Current Conditions, Condition History, correction evidence,
  forward-declaration evidence, earlier legacy unavailability, and evidence
  classification.
- Support normal commenced, forward-declared unresolved legacy, and undeclared
  unresolved legacy Sessions.
- Keep effective, declaration, and correction time distinct.

### Required Evidence

- Deterministic results for all three Session categories.
- Existing normal-session projections remain equivalent.
- Earlier legacy intervals remain unavailable without synthetic periods.
- History distinguishes all five evidence meanings.
- No separate Current Conditions persistence exists.

### Exit Conditions

- Compatible reads are deterministic for old and new evidence.
- Existing consumers remain safe during additive phases.
- Retrieval failure remains distinct from unresolved truth.

### Stop Conditions

- Existing reads change meaning unexpectedly.
- A projection infers commencement or unavailable earlier truth.
- History merges correction, transition, or declaration meaning.
- Duplicate canonical persistence is required.

### Interruption Outcome

Retain the last verified projection, keep new mutations unreachable, preserve
evidence, record incompatibility and restart conditions, and stop.

## 15. Phase 4 — Security Installation

### Entry Conditions

- New tables, operations, projections, and provenance paths are known.
- New mutation authority remains unreachable.
- Existing owner-scoped controls are baselined.

### Authorized Work

- Install owner checks, parent-Session ownership verification, RLS or
  equivalent policies, grants, revocations, function security, execution
  privileges, projection access, correction-note and declaration-provenance
  access, anti-enumeration-compatible outcomes, browser service-role
  prohibition, and least privilege.

### Required Evidence

- Owner access succeeds.
- Anonymous, cross-owner, cross-Session, direct-table, Presentation-owned, and
  browser service-role mutation fail.
- Inaccessible provenance is not exposed.
- Authorization and mutation are atomic.

### Exit Conditions

- All new persistence and operations are protected before exposure.
- Existing security remains intact.
- No broader grant or bypass exists.

### Stop Conditions

- Owner scope cannot be enforced.
- A new mutation is reachable before security.
- Direct or privileged browser mutation remains possible.
- Outcomes leak inaccessible truth.

### Interruption Outcome

Revoke or keep new paths inaccessible, preserve existing security and
authority, record the failed control, and stop.

## 16. Phase 5 — Existing-Evidence Assessment and Preservation

### Entry Conditions

- Phase 0 classification is executable against authoritative evidence.
- Additive support, dormant operations, reads, and security are verified.
- No final cutover has occurred.

### Authorized Work

- Detect sequential writes, partial success, equal-value mutations,
  caller-selected boundaries, boundary corrections, incomplete composite
  provenance, and unresolved legacy Sessions.
- Preserve recorded meaning without unsupported grouping, fabricated partner
  operations or timestamps, silent retiming, erased corrections, or
  destructive conversion.

### Required Evidence

- Deterministic detection checks and access-status-aware results.
- Evidence-preservation proof.
- Explicit unresolved or interruption classifications where needed.

### Exit Conditions

- Every detected category has a non-destructive treatment.
- Sequential writes remain separate absent authoritative shared identity.
- Prospective rules can begin without rewriting history.

### Stop Conditions

- A category cannot be detected safely.
- Conversion would invent identity, time, value, or authority.
- Existing provenance would be erased.
- Destructive reconciliation lacks evidence.

### Interruption Outcome

Preserve all evidence and old authority, record the blocked category and
detection evidence, identify any separately required authority, and stop.

## 17. Phase 6 — Adapter Preparation

### Entry Conditions

- New operations, projections, security, and preservation rules are stable.
- Old Product mutation authority remains active.
- Prepared adapters can remain non-authoritative until cutover.

### Authorized Work

- Prepare replacement or retirement of sequential writes, client-captured
  time, client-only equality, per-dimension pending identity,
  boundary-changing correction calls, and unconditional unresolved refusal
  where forward declaration is eligible.
- Prepare one complete request and retry identity per operation.

### Required Evidence

- Adapter request and response compatibility.
- Unknown-outcome retry behavior.
- No Product-owned canonical derivation or persistence.
- No second active mutation path.

### Exit Conditions

- New adapters are ready for one final switch.
- Old and new adapters cannot both be authoritative after cutover.
- Existing reads remain deterministic.

### Stop Conditions

- Prepared adapters write early.
- Mixed old/new confirmation is possible.
- Client time or equality remains canonical.
- Retry can duplicate evidence.

### Interruption Outcome

Keep prepared adapters disabled, preserve existing Product authority, record
compatibility failure and completed work, and stop.

## 18. Phase 7 — Pre-Cutover Verification

### Entry Conditions

- Phases 0 through 6 satisfy their exit conditions.
- New authority remains dormant.
- A production-equivalent verification environment exists.

### Authorized Work

Run executable verification for operations, transactions, changed-set,
no-change, time, concurrency, idempotency, correction, declaration,
projections, history, security, preservation, adapters, migration, rollback,
and interruption.

### Required Evidence

At minimum, prove one- and two-dimension changes, unchanged continuity,
no-change and no revision, stale and mixed-snapshot rejection, retry,
conflicting identity, success-only time, no backdating or scheduling,
correction immutability and note validation, current and historical
correction, legacy eligibility and atomic declaration, earlier unavailability,
three projection states, history classification, owner security and RLS,
migration preservation, adapter compatibility, rollback, and interruption.

### Exit Conditions

- Every required verification passes through canonical boundaries.
- Schema and snapshot parity pass.
- Final cutover and fallback boundaries are recorded.

### Stop Conditions

- Any required verification fails or is missing.
- Governed behavior is not demonstrated.
- Rollback or interruption cannot preserve evidence.
- Dual authority cannot be prevented.

### Interruption Outcome

Do not cut over. Preserve existing authority, keep new paths dormant, record
all results and failed requirements, define safe restart conditions, and stop.

## 19. Phase 8 — Final Authority Cutover

### Entry Conditions

- Every Phase 7 verification passes.
- The exact cutover boundary, actor, environment, paths, and rollback limits
  are recorded.
- Operations, projections, security, and adapters are ready together.

### Authorized Work

Perform one recorded cutover that activates the new canonical operations,
compatible projections, required security, and Product adapters; retires
sequential writes, caller-selected boundaries, and new boundary-changing
correction; prevents dual mutation authority; and preserves reads and history.

### Required Evidence

- One exact cutover boundary.
- Old mutation paths are inaccessible after the switch.
- New paths are owner-scoped.
- No partial adapter, operation, projection, or security state is observable.

### Exit Conditions

- Exactly one Product-write authority exists.
- New operations govern all future in-scope Product writes.
- Historical evidence and reads remain intact.

### Stop Conditions

- A cutover gate fails.
- Old and new mutation authority can coexist.
- Security or projections are incomplete.
- Partial authority is observable.

### Interruption Outcome

If no new evidence exists, preserve or restore existing authority without
exposing dormant paths. If new evidence exists, preserve it, prohibit
incompatible old authority, use only a contract-compatible recovery path,
record interruption, and stop.

## 20. Phase 9 — Post-Cutover Verification or Interruption

### Entry Conditions

- Phase 8 recorded one cutover attempt.
- The resulting authority and evidence state is known.
- Verification can run without unrelated mutation.

### Authorized Work

- Verify operations, reads, history, security, adapters, retired paths,
  migration preservation, and absence of conflicting authority.
- Record success or interruption.
- Satisfy Production Ledger and execution-record obligations.

### Required Evidence

- All canonical outcomes pass after cutover.
- Retired paths remain retired.
- Existing and new evidence remain attributable and secure.
- Ledger status and evidence references are complete.

### Exit Conditions

- All Section 26 success criteria are satisfied and recorded; or
- an interruption record identifies completed and incomplete phases,
  preserved evidence, active authority, and safe restart conditions.

### Stop Conditions

- Post-cutover verification fails.
- Evidence, security, projection, or authority is ambiguous.
- A retired incompatible path is reachable.
- Ledger or execution evidence cannot be accurate.

### Interruption Outcome

Preserve canonical evidence, prohibit unsafe reactivation, use only a
contract-compatible recovery path, record the active authority and exact
interruption, define restart conditions, and stop.

## 21. Existing Implementation Treatment Matrix

| Existing behavior | Current repository location | Contract requirement | Execution treatment | Historical-data treatment | Cutover requirement |
| --- | --- | --- | --- | --- | --- |
| Valid existing one-dimension periods | Session Conditions migration and period table | Preserve valid evidence | Preserve | Retain identity, boundaries, provenance, and meaning | Remain valid and readable |
| Sequential Product writes | `src/growing-foundation.js` | One complete operation | Retire at cutover | Keep operations separate | Old calls inaccessible |
| Partial sequential success | Per-dimension adapters and operations | No future partial success | Assess and preserve | Represent asymmetric truth honestly | No fabricated partner |
| Client-only equality | Product adapter | Canonical changed set | Replace | No historical rewrite | Canonical boundary authoritative |
| Canonical equal-value acceptance | Existing change function | Canonical no-change | Prohibit after cutover | Preserve existing evidence | No new evidence or revision |
| Caller-supplied effective boundaries | Existing change function | Success-only time | Retire at cutover | Preserve recorded boundary | Caller time removed |
| Possible past boundaries | Period and operation evidence | No backdating | Assess and preserve | No silent retiming | New past boundary rejected |
| Possible future boundaries | Period and operation evidence | No future scheduling | Assess and preserve | No silent retiming | New future boundary rejected |
| `effective_start` correction | Existing correction function | Boundary immutability | Prohibit after cutover | Preserve provenance | New correction cannot alter it |
| `effective_end` correction | Existing correction function | Boundary immutability | Prohibit after cutover | Preserve provenance | New correction cannot alter it |
| Existing correction provenance | Correction table and history | Durable history | Preserve | Retain all facts | Remain readable |
| Missing correction-note persistence | Correction persistence | Optional provenance note | Extend | Existing corrections remain note-absent | New notes validated atomically |
| Unresolved-commencement refusal | Projection and mutations | Eligible forward declaration | Replace | Preserve unresolved chronology | Normal refusal retained |
| Missing forward declaration | Authority and operation model | Atomic two-dimension declaration | Extend | No historical declaration invented | Distinct authority activated |
| Current projection | Projection functions and adapters | Three deterministic states | Extend | Preserve normal projection | Compatible projection active |
| Current concurrency | Revision and locks | Complete-operation protection | Extend | Preserve prior outcomes | Complete set protected |
| Current idempotency | Operations and fingerprints | Full request identity | Extend | Preserve stored outcomes | New retries deterministic |
| Old client adapters | Growing integration | One operation per confirmation | Replace | No historical change | Old adapters retired |
| Canonical Growing commencement | ICE-SC-001 implementation | Preserve lifecycle authority | Outside execution scope | Retain exactly | Read-only consumption |

## 22. Transaction and Concurrency Requirements

Each operation has one independent atomic transaction. Complete-operation
protection must validate owner and Session, normalize the full request,
calculate and protect the complete changed set, reject stale or mixed
snapshots, guard conflicts, preserve one success boundary, persist evidence
and one revision atomically, replay identical outcomes, reject conflicting
identity reuse, prevent duplicates, and expose no partial projection.

Physical locks, isolation, functions, endpoints, and transports remain
implementation choices.

## 23. Migration and Cutover Requirements

Migration and cutover must preserve periods, corrections, operations,
provenance, revisions, commencement, and unresolved chronology; assess
historical categories; avoid grouping, retiming, backfill, or fabricated
declaration; keep new writes unreachable before security and verification;
switch adapters and mutation authority at one final boundary; retire old
paths; prevent dual or missing authority; and preserve post-cutover evidence.

No migration timestamp, physical name, signature, or deployment command is
selected here.

## 24. Rollback and Interruption Model

| Failure point | Required handling |
| --- | --- |
| Preflight failure | Modify nothing; record discrepancy and restart condition. |
| Additive-persistence failure | Roll back or leave additions dormant; preserve authority. |
| Dormant-operation failure | Keep operations unreachable; preserve old paths. |
| Projection failure | Retain last verified projection; expose no new authority. |
| Security failure | Revoke or keep new paths inaccessible. |
| Data-assessment failure | Preserve evidence; record unresolved category; stop. |
| Adapter-preparation failure | Keep new adapters disabled. |
| Pre-cutover verification failure | Do not cut over; record failures and completed phases. |
| Cutover failure | Preserve the last safe authority; preserve any new evidence. |
| Post-cutover verification failure | Preserve evidence, prohibit incompatible reactivation, interrupt. |

Every incomplete attempt must avoid hidden partial authority, identify
completed and incomplete phases, define restart conditions, record
interruption, and avoid blindly repeating irreversible work.

## 25. Verification Matrix

| Requirement | Governing IC-SC-001C section | Execution phase | Verification method | Required result | Blocking | Interruption outcome on failure |
| --- | --- | --- | --- | --- | --- | --- |
| Two dimensions only | 8 | 1–2 | Constraint and operation tests | Only approved dimensions | Yes | Keep authority dormant |
| One- or two-dimension change | 10–12 | 2, 7 | Transaction tests | Atomic complete changed set | Yes | No cutover |
| Canonical changed set | 11 | 2, 7 | Equality tests | Only differing dimensions | Yes | No cutover |
| Canonical no-change | 11, 29 | 2, 7 | Outcome assertions | No evidence or revision | Yes | No cutover |
| One success boundary | 12–14 | 2, 7 | Evidence comparison | Shared boundary | Yes | No cutover |
| No caller time | 10, 13 | 2, 7 | API tests | Caller cannot select time | Yes | No cutover |
| No backdating or scheduling | 13 | 2, 7 | Invalid-input tests | Rejected without mutation | Yes | No cutover |
| Complete concurrency | 15 | 2, 7 | Concurrent tests | No mixed or partial state | Yes | No cutover |
| Idempotent retry | 16 | 2, 7 | Replay tests | Same result, no duplicate | Yes | No cutover |
| Conflicting identity reuse | 16 | 2, 7 | Fingerprint conflict | Rejected | Yes | No cutover |
| Value-only correction | 17–18 | 2, 7 | Boundary tests | Boundaries immutable | Yes | No cutover |
| Optional correction note | 19 | 1–2, 7 | Validation tests | Provenance only | Yes | No cutover |
| Derived Corrected | 20 | 3, 7 | Projection tests | Post-success only | Yes | No cutover |
| Legacy eligibility | 21 | 0, 2, 7 | Eligibility matrix | Only eligible passes | Yes | Preserve unresolved |
| Atomic forward declaration | 22 | 2, 7 | Failure injection | Both or neither | Yes | No cutover |
| Earlier unavailability | 23–24 | 3, 7 | Historical projection | No earlier truth | Yes | No cutover |
| Three projection states | 25 | 3, 7 | Projection matrix | Deterministic results | Yes | Retain prior path |
| History classification | 26 | 3, 7 | History tests | Five meanings distinct | Yes | Retain prior path |
| Owner security and RLS | 27 | 4, 7 | Access tests | Least privilege | Yes | Revoke new access |
| Per-operation transactions | 28 | 2, 7 | Failure tests | No partial result | Yes | No cutover |
| Revision outcomes | 29 | 2, 7 | Outcome matrix | Exact advancement | Yes | No cutover |
| Existing evidence | 31–33 | 5, 7 | Before/after proof | No unsupported rewrite | Yes | Preserve and stop |
| Adapter cutover | 32–33 | 6–8 | Routing tests | One write authority | Yes | Preserve active authority |
| Rollback and interruption | 32, 35 | 7–9 | Failure simulation | Evidence preserved | Yes | Record interruption |
| Schema parity | 35–36 | 1, 7 | Replay and comparison | Exact parity | Yes | No cutover |
| Post-cutover conformance | 34–36 | 9 | Final verification | All criteria pass | Yes | Preserve and interrupt |

## 26. Success Criteria

Execution succeeds only when all new canonical operations are active; old
sequential writes and caller-selected boundaries are retired; new corrections
cannot change boundaries; optional correction-note provenance and
forward-only declaration work; projections and history are deterministic;
security remains owner-scoped; historical evidence is preserved; all required
verification passes; no conflicting authority remains; and execution,
cutover, rollback, interruption, and Production Ledger evidence are complete.

Passing tests alone is insufficient when canonical behavior, attribution, or
authority cannot be proven.

## 27. Required Invariants

1. ICE-SC-003 executes IC-SC-001C only.
2. ICE-SC-003 does not change approved architecture.
3. Exactly two condition dimensions remain authorized.
4. Existing canonical evidence is preserved.
5. No history is fabricated.
6. Historical sequential writes are not grouped without evidence.
7. Existing boundary corrections are not silently rewritten.
8. New Product changes use one complete operation after cutover.
9. Two-dimension changes are atomic.
10. No-change creates no condition mutation or revision.
11. Successful operation time is canonical.
12. Caller-selected effective boundaries are retired.
13. New corrections cannot alter effective boundaries.
14. Correction-note provenance remains separate from Session Notes.
15. Forward declaration requires both dimensions.
16. Earlier legacy applicability remains unavailable.
17. Forward declaration creates no Growing commencement.
18. Current Conditions remains derived.
19. Old and new Product-write authority cannot coexist after cutover.
20. Security exists before new mutation authority is exposed.
21. Verification passes before cutover.
22. Pre-cutover failure leaves existing authority intact.
23. Post-cutover failure preserves new canonical evidence.
24. Retired authority is not reactivated incompatibly.
25. Every incomplete execution is recorded as an interruption.
26. This proposed ICE does not authorize implementation.

## 28. Production Evidence and Ledger Obligations

The later execution must record:

- execution baseline and implementation attempt;
- exact attributable paths;
- migration and schema identity;
- environment and deployment evidence;
- phase completion evidence;
- verification results;
- cutover boundary and post-cutover outcome;
- rollback or interruption outcome; and
- a [Grow Production Ledger](../../production/grow-production-ledger.md) entry
  under established rules.

Evidence must distinguish planned, attempted, completed, failed, rolled back,
and interrupted work, identify active authority, and define safe restart
conditions. This artifact-creation task modifies none of those records.

## 29. Governance Status and Next Stage

ICE-SC-003 has passed its required read-only Architecture Audit and has received founder governance approval. Implementation Contract Execution governance for this artifact is complete.

Repository integration is limited to a bounded commit of this ICE and its single execution-index entry. That repository integration does not authorize implementation.

The next stage is a separate explicit implementation-authorization task for ICE-SC-003.

Until that authorization is granted, schema changes, migrations, RPCs, database functions, transaction implementation, adapters, application or UI changes, tests, deployment, production execution, and execution-phase Production Ledger updates remain unauthorized.
