# IC-SC-001C — Current Conditions Operations and Forward-Only Legacy Declaration

**Status:** Approved — Architecture Audit Passed; Implementation Contract Governance Complete; Implementation Not Authorized
**Capability:** 2A — Session Conditions
**Layer:** Implementation Contract
**Implements:** [CS-SC-001C — Current Conditions Operations and Forward-Only Legacy Declaration Composition Specification](../../product/grow-sessions/session-conditions-current-conditions-operations-and-forward-only-legacy-declaration-composition-specification.md)
**Supplements:** [IC-SC-001 — Session Conditions Implementation Contract](./IC-SC-001-session-conditions.md)
**Preserves:** [IC-SC-001B — Canonical Growing Commencement and Legacy Chronology](./IC-SC-001B-canonical-growing-commencement-and-legacy-chronology.md)

## 1. Purpose

This bounded supplement translates the founder-approved Product meaning in
CS-SC-001C into precise implementation authority for Current Conditions
operations and one forward-only declaration for eligible unresolved legacy
Sessions.

It defines the canonical operation, persistence, transaction, concurrency,
idempotency, provenance, projection, security, migration, and cutover
requirements that a later bounded Implementation Contract Execution must
realize.

This contract supplements IC-SC-001. It preserves all unaffected IC-SC-001
authority, preserves IC-SC-001B in full, and boundedly supersedes only the
conflicting predecessor rules identified in Sections 5 and 37.

This document does not itself authorize implementation.

## 2. Governing Authority and Dependency Chain

This contract inherits, without redefining:

- [Grow Platform Architecture](../../platform/grow-platform-architecture.md);
- [Grow Foundation](../grow-foundation.md);
- [Grow Philosophy](../../philosophy/grow-philosophy.md);
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../foundation-notes/FN-004-session-lifecycle-and-grow-companion.md);
- [FN-005 — Canonical Session Conditions](../foundation-notes/FN-005-canonical-session-conditions.md);
- [FN-006 — Canonical Phase Commencement and Lifecycle Chronology](../foundation-notes/FN-006-canonical-phase-commencement-and-lifecycle-chronology.md);
- [FN-007 — Intentional Transition from Germination to Growing](../foundation-notes/FN-007-intentional-transition-from-germination-to-growing.md);
- [CS-GC-008 — Grow Companion Workspace Composition and Coordination](../../product/grow-sessions/grow-companion-workspace-composition-and-coordination-specification.md);
- [CS-SC-001 — Session Conditions Composition](../../product/grow-sessions/session-conditions-composition-specification.md);
- [CS-SC-001A — Initial Session Conditions Dimensions and Existing Truth](../../product/grow-sessions/session-conditions-initial-dimensions-composition-specification.md);
- [CS-SC-001B — Canonical Growing Commencement and Legacy Chronology](../../product/grow-sessions/session-conditions-growing-commencement-and-legacy-chronology-composition-specification.md);
- [CS-SC-001C — Current Conditions Operations and Forward-Only Legacy Declaration Composition Specification](../../product/grow-sessions/session-conditions-current-conditions-operations-and-forward-only-legacy-declaration-composition-specification.md);
- [IC-SC-001 — Session Conditions Implementation Contract](./IC-SC-001-session-conditions.md); and
- [IC-SC-001B — Canonical Growing Commencement and Legacy Chronology](./IC-SC-001B-canonical-growing-commencement-and-legacy-chronology.md).

The dependency direction remains:

```text
Canonical Platform
        ↓
Product Composition
        ↓
Presentation
```

Implementation precedent is lower-order evidence, not architectural
authority. Ambiguity that cannot be resolved by this hierarchy must stop later
execution.

## 3. Relationship to IC-SC-001 and IC-SC-001B

This contract:

- implements CS-SC-001C Product meaning;
- supplements IC-SC-001 and preserves its unaffected authority;
- preserves IC-SC-001B commencement and unresolved-legacy chronology
  authority;
- preserves FN-005 canonical Session Conditions ownership;
- preserves FN-006 lifecycle commencement and chronology ownership;
- preserves FN-007 Begin Growing authority;
- creates no additional condition dimension;
- creates no separately persisted Current Conditions record;
- does not establish, infer, alter, replace, repair, or backfill canonical
  Growing commencement; and
- does not authorize implementation by its creation.

IC-SC-001 continues to govern condition identity, Session containment,
approved vocabularies, normalization ownership, half-open periods,
deterministic ordering, owner scope, access-safe retrieval, historical
preservation, and all unaffected integrity rules.

IC-SC-001B continues to govern future lifecycle commencement recording,
authoritative-or-unresolved commencement retrieval, Begin Growing and
direct-Growing chronology, and the prohibition on manufactured legacy
commencement.

## 4. Scope

This supplement governs only:

1. the owner-authorized **Change Current Conditions** operation;
2. canonical changed-set and no-change authority;
3. one-or-two-dimension atomic change;
4. success-only effective boundaries;
5. the owner-authorized **Correct a Condition Record** operation;
6. prospective effective-boundary immutability for correction;
7. optional correction-note provenance;
8. the owner-authorized **Set Current Conditions for an Unresolved Legacy
   Session** operation;
9. forward-only applicability and earlier legacy unavailability;
10. Current Conditions and Condition History projection requirements;
11. concurrency, idempotency, revision, transaction, security, and outcome
    rules for those operations; and
12. non-destructive migration and Product-write cutover from existing
    behavior.

## 5. Predecessor-Clause Reconciliation

| IC-SC-001 section or invariant | Existing meaning | IC-SC-001C treatment | Classification | Resulting governing meaning |
| --- | --- | --- | --- | --- |
| Section 5, Applicability and Chronology | The first applicable period for each dimension begins at canonical Growing commencement, and that boundary comes from canonical Session lifecycle chronology. | For Sessions with authoritative canonical Growing commencement, this rule remains unchanged. Only for an eligible unresolved legacy Session using Set Current Conditions for an Unresolved Legacy Session, both first periods begin together at the operation's successful forward-declaration boundary while commencement remains unresolved. | Boundedly superseded | For Sessions with authoritative canonical Growing commencement, the predecessor commencement-anchored first-period rule remains authoritative. For an eligible unresolved legacy Session, IC-SC-001C supersedes that rule only to allow the first Grow Method and Environment Type applicability periods to begin together at the successful forward-declaration boundary. Earlier applicability remains unavailable, and canonical Growing commencement remains unresolved and unchanged. |
| Section 6, Initial Declaration | One dimension may be declared at canonical Growing commencement. | Normal commenced-Session initial declaration remains governed by IC-SC-001. The new legacy operation is not that declaration and requires both dimensions from a later successful boundary. | Clarified | Commencement-based declaration remains normal authority; eligible unresolved legacy Sessions use only the distinct forward-only operation. |
| Section 7, Operational Change, opening sentence and steps 1–12 | One Session-and-dimension operation accepts a validated chronological boundary, closes one period, and opens one period. | For Product writes after IC-SC-001C cutover, one operation accepts one or both supplied dimensions, canonically computes the changed set, selects its own successful boundary, and commits all changed dimensions atomically. Existing valid one-dimension periods remain historical truth. | Replaced within IC-SC-001C scope | One confirmation produces one operation, one transaction, one shared success boundary, one revision outcome, and one or two independently attributable evidence results. |
| Section 7, boundary validation | The operation validates a supplied boundary after the current start and within canonical chronology. | Caller-selected boundaries are prohibited for new Product changes. The owning operation establishes the boundary only on successful commitment. | Boundedly superseded | New Product changes cannot be backdated, future-scheduled, or assigned an arbitrary caller time. Existing recorded boundaries are not rewritten. |
| Section 8, “A correction may amend only” | Correction may amend value/`Other` text, period start, or period end. | For corrections performed after cutover through the CS-SC-001C surface, only the assertion value and permitted `Other` text may be corrected. `effective_start` and `effective_end` are immutable. | Boundedly superseded | New corrections cannot move applicability boundaries. Historical boundary corrections remain recorded and require evidence-led assessment. |
| Section 8, correction steps 5–8 | Correction revalidates a complete timeline, preserves commencement anchoring, and recalculates projections. | Timeline integrity is still validated, but the correction cannot change a boundary or create a period. Projection changes only when the corrected target governs the applicable result. | Clarified | Correction remains one-assertion evidence repair, never an operational transition or boundary mutation. |
| Section 9, Canonical Current Conditions | Current Conditions use commencement, periods, clock, and authorization; unresolved inputs fail closed. | The projection also recognizes authoritative forward-only legacy declaration evidence without treating its boundary as commencement. Earlier applicability remains unavailable. | Boundedly superseded | Normal Sessions remain commencement-anchored; declared unresolved legacy Sessions project only from declaration forward; undeclared unresolved legacy Sessions remain unavailable. |
| Sections 6–8 and 12, canonical operations | Declaration, one-dimension change, and correction are atomic canonical mutations. | IC-SC-001C defines three distinct semantic operations and forbids combining them into one ambiguous mutation or transaction. | Clarified | Each operation has its own identity, fingerprint, protected state, transaction, success time, provenance, revision, and deterministic outcome. |
| Section 12, expected revision or equivalent guard | Every mutation uses an operation identity and concurrency guard. | The guard must cover the complete supplied changed set or correction/declaration authority, reject stale mixed snapshots, and prevent partial writes. | Clarified | Complete-operation stale-state protection is mandatory; a Session-wide revision may invalidate either dimension after any dimension changes. |
| Section 12, duplicate submission | Identical retry returns the same result; conflicting identity reuse fails. | Fingerprinting covers the complete normalized request, including operation type and supplied set; no-change retry evidence may be minimal and is not condition history. | Clarified | Retry is deterministic for success and no-change, with no duplicate period, correction, declaration, replay, or revision. |
| Section 11, Migration, Cutover, and Compatibility | Eligible legacy values migrate to commencement and authority switches atomically. | Existing valid evidence is preserved. Unresolved legacy conditions are never backfilled; a later owner declaration establishes only present-and-forward truth. Product writes cut over atomically from sequential adapters to composite operations. | Boundedly superseded | Migration cannot invent truth or group history. After cutover, old sequential Product writes are prohibited. |
| INV-IC-SC-001-05, Period applicability only | Both dimensions use period applicability beginning at canonical Growing commencement. | For Sessions with authoritative canonical Growing commencement, this invariant remains unchanged. Only for an eligible unresolved legacy Session using Set Current Conditions for an Unresolved Legacy Session, both first periods begin together at the operation's successful forward-declaration boundary while commencement remains unresolved. | Boundedly superseded | For Sessions with authoritative canonical Growing commencement, the predecessor commencement-anchored first-period rule remains authoritative. For an eligible unresolved legacy Session, IC-SC-001C supersedes that rule only to allow the first Grow Method and Environment Type applicability periods to begin together at the successful forward-declaration boundary. Earlier applicability remains unavailable, and canonical Growing commencement remains unresolved and unchanged. |
| Invariants 09–12 and 14–21 | Deterministic Current Conditions, preserved history, distinct correction, atomic authority, no duplicate truth, and non-authoritative adapters. | Preserved, with the bounded unresolved-legacy applicability rule and prospective correction immutability added. | Clarified | Existing invariants govern unless Sections 5 and 37 state the exact bounded replacement. |
| IC-SC-001 matters outside this supplement | Identity, containment, vocabularies, normalization, ordering, retrieval safety, deletion boundary, and unrelated exclusions. | No change. | Preserved unchanged | IC-SC-001 remains governing authority. |
| IC-SC-001 Session-wide and record-level applicability discussion | These initial dimensions use period applicability and no record-level relationship. | No additional applicability scope is introduced. | Preserved unchanged | Both dimensions remain whole-Session circumstances with independent period histories. |
| IC-SC-001 implementation gate | A later authorized execution is required. | This proposed supplement creates no execution authority. | Not applicable to this supplement | A separate execution remains mandatory after audit and governance completion. |

Every supersession above applies only to future operations through the
CS-SC-001C surface and to Sessions eligible for those operations after the
later cutover. Existing recorded evidence is not silently changed. All
unidentified IC-SC-001 authority remains unchanged.

## 6. Explicit Exclusions

This contract authorizes no:

- new Foundation authority, Platform capability, or lifecycle authority;
- additional condition dimension or separately persisted Current Conditions
  model;
- physical schema, SQL, migration, RPC, database function, or adapter
  implementation;
- UI implementation, styling, test, fixture, deployment, or production
  execution;
- Implementation Contract Execution creation;
- audit execution, implementation-readiness determination, or approval claim;
- Production Ledger change, ICE index repair, or unrelated governance-debt
  repair; or
- Git commit, staging, or push.

It adds no population, progress, stage, completion, Reflection,
recommendation, notification, automation, Task, Event, Recent Activity,
Session Note, shared Chronology, Photo, or Document behavior.

## 7. Canonical Ownership Boundary

The canonical Session owns its Session Conditions. The Canonical Platform owns
their meaning, normalization, applicability, provenance, correction history,
operation outcomes, and deterministic projections.

Product Composition may route and organize approved operations. Presentation
may collect proposals and render results. Neither may establish condition
truth, choose canonical actor or time, compute authoritative equality, persist
Current Conditions, mutate lifecycle chronology, or create a parallel
condition model.

Each authorized operation remains contained by one stable Session and produces
no cross-capability side effect.

## 8. Authorized Dimensions and Applicability

Exactly two dimensions remain authorized:

1. `grow_method`
2. `environment_type`

They:

- belong to the Session;
- use the existing governed vocabularies;
- have period applicability;
- may change over time;
- retain independent evidence identities and histories; and
- are not per entry, partition, position, plant, Task, Event, Note, Photo,
  Document, or arbitrary record.

No additional dimension or generic condition-key model is authorized.

## 9. Canonical Operation Model

The three distinct owner-authorized canonical operations are:

1. **Change Current Conditions**
2. **Correct a Condition Record**
3. **Set Current Conditions for an Unresolved Legacy Session**

These are semantic contract names and do not prescribe an RPC, function,
class, endpoint, or API name.

Every operation must have:

- one stable operation identity;
- authenticated owner authority and stable Session identity;
- an explicit operation type;
- bounded required and optional inputs;
- canonical normalization and authoritative validation;
- complete-operation concurrency authority;
- a deterministic normalized-request fingerprint;
- idempotent retry behavior;
- deterministic owner, Session, operation, time, authority, and evidence
  provenance;
- canonical success and failure outcomes;
- an authoritative successful-operation time established by the owning
  boundary;
- exactly one canonical revision outcome on mutation success;
- its own atomic transaction boundary; and
- no cross-capability side effect.

The three operation types must not be combined into one transaction, generic
mutation, or ambiguous operation classification.

## 10. Change Current Conditions

Change Current Conditions may propose Grow Method only, Environment Type only,
or both.

Required inputs are:

- stable Session identity;
- authenticated owner context;
- proposed Grow Method when supplied;
- proposed Environment Type when supplied;
- expected canonical Session Conditions revision or equivalent deterministic
  stale-state authority; and
- stable operation identity.

Permitted dimension-specific `Other` text follows the existing governed
vocabulary boundary.

The caller must not supply:

- historical or future effective time;
- arbitrary success time;
- canonical actor identity;
- correction provenance;
- lifecycle commencement;
- canonical revision result; or
- canonical authority classification.

Success returns one operation identity, one successful effective instant, one
new canonical revision, the genuinely changed set, and one or two
independently attributable evidence results. Failure or no-change returns its
deterministic outcome without partial truth.

## 11. Changed-Set and No-Change Authority

Under one protected operation context, the canonical mutation boundary must:

1. read authoritative Current values for every supplied dimension;
2. read additional Session Conditions state required by the concurrency
   model;
3. normalize proposals through governed vocabularies;
4. compare each supplied value and permitted `Other` text with authoritative
   Current meaning;
5. determine the genuinely changed set;
6. exclude unchanged dimensions from mutation; and
7. return deterministic no-change when the changed set is empty.

An equal value is not a change. An omitted dimension is not a change.
Presentation comparison is not authoritative.

The no-change outcome corresponds to:

> No changes to save

It creates no condition period, closure, condition-history evidence,
correction, revision advancement, Current Conditions change, or
cross-capability side effect.

Minimum operation-outcome evidence may be retained only when necessary for
safe retry. It is not condition evidence, history, successful mutation, or
revision advancement.

## 12. One-or-Two-Dimension Atomicity

For a one-dimension changed set:

- only that dimension receives new applicability evidence;
- the other dimension continues uninterrupted;
- the unchanged dimension receives no replacement period or history; and
- the operation produces one revision outcome.

For a two-dimension changed set:

- both changes share one successful effective boundary;
- each retains an independent evidence identity and attribution;
- both commit in the same atomic transaction;
- both become established or neither does;
- no partial success or mixed intermediate projection is permitted; and
- the operation produces one revision outcome.

One grower confirmation therefore produces one canonical operation, one
transaction, one atomic revision outcome, one shared boundary, and one or two
evidence results.

## 13. Success-Only Effective Time

The owning canonical operation establishes the effective boundary only during
successful canonical commitment after authentication, ownership,
normalization, validation, changed-set calculation, concurrency checks, and
integrity checks succeed.

The caller cannot choose the boundary. Backdating, future scheduling,
client-captured effective authority, pre-confirmation time, Session
`created_at`, Session `updated_at`, Germination completion, setup selection,
`post_germination_decision`, inferred time, or unrelated record time is
prohibited.

Opening, selecting, reviewing, attempting, failing, abandoning, or retrying an
unfinished proposal establishes no condition truth or effective boundary.

## 14. Period Behavior

For every genuinely changed dimension:

- the current period closes at the shared successful boundary;
- the new period begins at the same boundary;
- applicability remains half-open;
- no overlap or gap is introduced;
- stable evidence identity is retained for each period; and
- deterministic ordering is retained.

An unchanged dimension remains open, receives no replacement period or
condition-change evidence, and retains its existing boundary.

## 15. Concurrency

Change Current Conditions must protect the complete operation, including:

- authoritative reads under one protected context;
- stale-state authority covering every supplied dimension;
- canonical revision or equivalent deterministic protection;
- stale-proposal rejection before any write;
- no lost update, duplicate period, partial write, or mixed-snapshot success;
  and
- deterministic retry.

The canonical Product-facing model uses a Session-wide Session Conditions
revision unless a later execution proves an equivalent dimension-scoped model.
Under the Session-wide model, a change to either dimension may invalidate a
stale request even when that changed dimension was omitted. Omitted dimensions
need no value comparison merely because the aggregate revision is checked.

Any dimension-scoped implementation must prove that mixed-snapshot and
partial-operation outcomes remain impossible. This contract does not
prescribe physical locking.

## 16. Idempotency

Every confirmation uses one stable operation identity and a deterministic
fingerprint of the complete normalized request, including Session, operation
type, supplied dimension set, normalized values, permitted `Other` text, and
expected concurrency authority.

The implementation must guarantee:

- safe retry after interruption;
- identical retry returning the original success or no-change outcome;
- rejection of conflicting operation-identity reuse;
- no duplicate period, correction, or legacy declaration;
- no partial replay; and
- no second revision outcome for an identical successful retry.

## 17. Correct a Condition Record

Correct a Condition Record remains distinct from real-world change.

The operation must:

- target exactly one stable assertion;
- require authenticated ownership of its Session;
- correct only the assertion value and permitted `Other` text authorized by
  this surface;
- retain target identity;
- retain immutable before-and-after provenance;
- retain authenticated actor identity;
- retain stable operation identity;
- establish a separate correction time;
- optionally retain a correction note;
- advance canonical correction or Session Conditions revision authority
  exactly once; and
- expose deterministic correction evidence.

Required inputs are Session identity, target assertion identity, corrected
value meaning, expected revision or equivalent stale-state authority, and
operation identity. The optional input is a correction note.

The caller must not supply correction time, canonical actor identity,
effective boundaries, canonical revision result, or authority classification.

Success returns the target identity, immutable before-and-after facts,
correction time, optional note when present, operation identity, and one new
revision. Invalid, stale, unauthorized, no-op, or failed correction produces
no corrected result or revision advancement.

## 18. Effective-Time Immutability

For corrections performed after this contract's later cutover, correction
must not modify:

- `effective_start`;
- `effective_end`;
- canonical Growing commencement;
- Session origin; or
- lifecycle chronology.

Correction must not move, replace, or recreate a boundary; turn correction
time into effective time; create a period; invoke Change Current Conditions;
or fabricate a real-world transition.

This rule boundedly supersedes IC-SC-001 Section 8's exact predecessor clause:

> A correction may amend only: the normalized value and permitted `Other`
> text; the period start; or the period end.

Within future CS-SC-001C correction operations, the replacement is:

> A correction may amend only the target assertion's normalized value and
> permitted `Other` text. Its effective boundaries are immutable.

IC-SC-001 correction identity, owner scope, attribution, revision history,
atomicity, stale-write rejection, projection recalculation, integrity
validation, and historical preservation remain unchanged.

## 19. Correction Provenance and Optional Note

Correction time is established by the owning operation only on successful
commitment. It remains separate from original effective time, is not
caller-selected, and does not alter applicability.

A correction may accept:

> Add a correction note — optional

The note:

- is optional and belongs only to correction provenance;
- commits atomically with the correction;
- is absent, not an empty canonical value, when omitted or whitespace-only;
- preserves owner-authored wording and internal line breaks;
- normalizes CRLF or CR line endings to LF and trims surrounding whitespace;
- is limited to 2,000 Unicode characters;
- rejects Unicode C0 controls U+0000–U+001F except LF (U+000A) and horizontal
  tab (U+0009), and rejects DELETE (U+007F); rejection occurs at the canonical
  boundary rather than silently removing those characters;
- does not participate in canonical equality of the corrected condition value;
  and
- creates or modifies no Session Note.

The 2,000-character bound reuses the repository's existing concise
description convention for canonical Task and Event details. The adjacent
authored Session Note convention is 10,000 characters, but a correction note
is bounded provenance rather than a narrative record. The reviewed repository
contains no applicable canonical control-character convention; the explicit
control rule is therefore required to preserve deterministic, transport-safe
provenance without collapsing owner meaning.

The note creates no Task, Event, notification, Recent Activity, shared
Chronology, Photo, Document, or lifecycle behavior.

## 20. Corrected Derivation

`Corrected` remains derived from successful correction provenance. It is not a
condition value, applicability state, lifecycle state, or separately persisted
presentation marker when derivation is sufficient.

Read authority must expose enough canonical evidence to determine:

- whether correction succeeded;
- correction time;
- corrected value;
- optional correction note; and
- permitted actor and provenance details.

Before success, no canonical corrected result exists.

Correction of the assertion governing Current Conditions may affect the
Current projection. Correction of a non-governing historical assertion does
not. Correction never changes applicability merely because it occurred later,
and correction history remains attributable to its target.

## 21. Legacy-Declaration Eligibility

Set Current Conditions for an Unresolved Legacy Session is allowed only when:

- the authenticated owner owns the Session;
- the Session is deterministically eligible as an unresolved legacy Session;
- canonical Growing commencement is unavailable and remains unresolved;
- earlier conditions cannot be established authoritatively;
- no successful forward-only declaration already governs the Session; and
- no established condition history makes declaration invalid or ambiguous.

Generic Session timestamps, Growing Phase timestamps, Germination completion,
setup state, `post_germination_decision`, evidence, migration order, or
deployment time are not eligibility or chronology evidence.

An eligibility conflict fails without partial write or revision advancement.

## 22. Legacy-Declaration Atomicity and Provenance

The operation requires both Grow Method and Environment Type. Partial
declaration is prohibited.

Both values must:

- pass governed vocabulary validation;
- be established in one transaction;
- share one successful declaration boundary;
- retain independent evidence identities; and
- become Current together or not at all.

The operation requires stable Session and operation identities, owner context,
both values and permitted `Other` text, and expected revision or equivalent
stale-state authority.

The caller must not supply declaration time, canonical actor identity,
effective boundaries, canonical revision result, authority classification, or
canonical Growing commencement.

Success returns one declaration identity, one successful declaration instant,
one revision outcome, and two independently attributable evidence results.
Failure returns its deterministic outcome without partial truth.

It must retain provenance sufficient for owner, Session, stable operation
identity, operation type, both values, successful declaration time, distinct
forward-only declaration authority source, one canonical revision, and both
independently attributable evidence results.

The authority classification must not imply `future_growing_entry`, legacy
migration, Begin Growing, conditions at commencement, or historical
correction. Physical enum, table, and column names remain implementation
choices.

## 23. Earlier Legacy Unavailability

The declaration boundary is established only after authentication,
eligibility, validation, concurrency, and integrity checks succeed.

The declaration:

- establishes both values only from that boundary forward;
- leaves all earlier conditions unavailable;
- creates no synthetic, null-valued, inferred, or commencement-anchored
  earlier period;
- creates no historical backfill or legacy-migration fiction; and
- does not establish, alter, infer, replace, or backfill canonical Growing
  commencement, Session origin, lifecycle chronology, Germination history,
  Growing elapsed time, or completed-phase history.

The declaration boundary is not canonical Growing commencement.

## 24. Post-Declaration Behavior

After success:

- both declared values govern Current Conditions;
- earlier applicability remains unavailable;
- later changes use Change Current Conditions;
- later corrections use Correct a Condition Record;
- Growing commencement remains unresolved;
- Growing elapsed time remains unavailable unless lifecycle authority
  independently supplies commencement; and
- Condition History distinguishes declaration from commencement-based initial
  evidence.

The declaration must not be labeled:

> Established when Growing began

It must support Product meaning equivalent to:

- `Current Conditions set`;
- `Set from this point forward`; and
- `Earlier conditions unavailable`.

## 25. Current Conditions Projection

Current Conditions remain independently derived for both dimensions. No
separately persisted Current Conditions record is authorized.

The deterministic owner-scoped, revision-aware, concurrency-consistent
projection must support:

1. **Normal commenced Sessions:** initial applicability begins at canonical
   Growing commencement; later changes follow governed period behavior.
2. **Forward-declared unresolved legacy Sessions:** both dimensions are
   unavailable before successful declaration and apply from the declaration
   boundary forward.
3. **Unresolved legacy Sessions without declaration:** Current Conditions
   remain unavailable.

Projection uses only canonical evidence and cannot infer unavailable earlier
truth. A forward declaration does not convert unresolved commencement into
authoritative commencement.

## 26. Condition History

Condition History must distinguish:

- commencement-based initial evidence;
- normal real-world changes;
- corrected assertions;
- forward-only legacy declaration; and
- earlier legacy unavailability.

History exposes canonical instants for effective time, declaration time, and
correction time. Effective and correction time remain separate. Relative-only
time is not authoritative.

Display-timezone conversion remains Presentation behavior consuming an
externally governed preference. Session Conditions does not own timezone
truth. When authoritative timezone input is unavailable, canonical instants
remain intact and Presentation must not fabricate local-time certainty. No
timezone library is prescribed.

## 27. Security and Ownership

Existing owner-scoped security is preserved and must enforce:

- authenticated owner access;
- parent Session ownership verification;
- no anonymous mutation;
- no cross-owner read or write;
- no browser service-role authority;
- no Presentation-owned mutation authority;
- no bypass of Row Level Security or equivalent canonical controls;
- least-privilege access to operation, period, correction, and declaration
  provenance; and
- security-consistent error disclosure.

Unauthorized and not-found outcomes need not be distinguishable where
existing anti-enumeration conventions require equivalent disclosure.
IC-SC-001 security is not weakened.

## 28. Per-Operation Transactions

Each canonical operation has its own transaction boundary.

**Change Current Conditions** atomically includes authoritative state read,
changed-set calculation, concurrency verification, required closures, required
period creation, operation provenance, one revision advancement, success-time
capture, and final outcome.

**Correct a Condition Record** atomically includes target validation,
concurrency verification, value correction, immutable before-and-after
provenance, optional note, correction-time capture, one revision advancement,
and final outcome.

**Set Current Conditions for an Unresolved Legacy Session** atomically includes
eligibility verification, both value validations, concurrency verification,
both period creations, declaration authority and provenance, shared
declaration-time capture, one revision advancement, and final outcome.

Partial canonical success is prohibited. SQL and transaction syntax remain
implementation choices.

## 29. Revision Model

Revision behavior is:

| Outcome | Canonical Session Conditions revision |
| --- | --- |
| One-dimension change succeeds | Advances exactly once |
| Two-dimension change succeeds | Advances exactly once |
| No change | Does not advance |
| Correction succeeds | Advances exactly once |
| Forward-only legacy declaration succeeds | Advances exactly once |
| Identical idempotent retry | Returns original revision outcome; does not advance again |
| Stale rejection | Does not advance |
| Integrity failure | Does not advance |
| Unauthorized, not found/security-equivalent, or invalid request | Does not advance |
| Canonical failure | Does not advance |

A two-dimension change has one confirmation, one operation, one atomic
revision result, and two independently attributable evidence results.

## 30. Error and Outcome Model

Canonical outcomes must deterministically distinguish:

- success;
- no change;
- invalid dimension value;
- missing required legacy dimension;
- ineligible legacy Session;
- legacy declaration already established;
- missing Current Conditions authority;
- stale revision or stale Current Conditions;
- unauthorized;
- not found or security-equivalent non-disclosure;
- invalid correction target;
- conflicting operation-identity reuse;
- integrity conflict; and
- canonical failure with no partial write.

Only approved Product phrases in CS-SC-001C are prescribed. Transport codes,
exception types, and grower-facing copy remain later implementation and
Presentation choices, provided outcomes retain distinct canonical meaning and
do not leak inaccessible truth.

## 31. Existing Canonical-Data Assessment

This assessment uses committed repository evidence only. No production
database was queried.

The committed first-slice schema and adapters prove:

- correction currently accepts and persists `effective_start` and
  `effective_end` changes with before-and-after provenance, so historical
  boundary corrections may exist;
- Product saves call one dimension and then the other, each with a separately
  captured client time and operation identity, so sequential two-dimension
  writes, different boundaries, and partial success may exist;
- equality is short-circuited in the client, while the canonical
  one-dimension change operation does not reject an equal normalized value, so
  canonical equal-value changes may exist;
- the canonical change operation accepts caller-supplied time, validates it
  against commencement and current start but not against the operation clock,
  so caller-selected past or future boundaries may exist;
- existing period, correction, operation, actor, source, and revision
  provenance is attributable per operation, but there is no authoritative
  composite confirmation identity for sequential pairs and no correction-note
  provenance;
- the existing projection is derived and owner-scoped;
- existing canonical mutation uses revisions and per-operation idempotency,
  but not complete one-or-two-dimension operation protection; and
- existing unresolved legacy Sessions without commencement are refused
  condition establishment, and no forward-only declaration authority exists.

Repository evidence does not prove that any permitted problematic category is
absent from production. Later execution must therefore assess it
deterministically.

Existing evidence must not be silently rewritten. Historical operations must
not be grouped into composite operations without authoritative evidence.
Existing boundary corrections must not be erased, reinterpreted, or rewritten
without authoritative evidence.

When repository evidence proves a category cannot exist, a later execution
may record that proof and omit its reconciliation branch. When a category may
exist, execution must detect it deterministically, preserve recorded meaning,
avoid fabricated replacement evidence, represent unresolved ambiguity
honestly, and block destructive conversion when authoritative reconciliation
is unavailable.

Effective-boundary immutability applies prospectively after cutover unless
authoritative evidence supports a separately bounded existing-record
reconciliation. Existing valid one-dimension changes remain valid as recorded.

## 32. Migration and Cutover Authority

A later bounded execution must:

- preserve existing periods, provenance, canonical Growing commencement rows,
  unresolved legacy chronology, and valid one-dimension operations;
- avoid retroactive grouping without authoritative evidence;
- detect and safely handle historical boundary corrections;
- avoid backfilling unknown legacy conditions or using `created_at`,
  `updated_at`, Germination completion, or `post_germination_decision` as a
  substitute;
- avoid fabricated declaration times and history rewrites;
- introduce atomic one-or-two-dimension changes;
- introduce canonical changed-set and no-change enforcement;
- introduce prospective effective-time immutability for correction;
- introduce correction-note provenance;
- introduce forward-only legacy declaration and its distinct authority;
- cut over all Product writes atomically;
- prohibit old sequential Product writes after cutover;
- preserve deterministic reads during cutover; and
- define interruption and rollback behavior in that later execution.

All future Product writes after cutover use this canonical operation model.
This contract creates no migration or execution artifact.

## 33. Existing Implementation Reconciliation

| Existing implementation behavior or data | Classification | Required treatment |
| --- | --- | --- |
| Valid existing one-dimension periods | Preserved | Retain identity, boundaries, provenance, and historical meaning. |
| Sequential two-dimension writes | Superseded after cutover | Preserve recorded operations; future Product confirmation uses one composite operation. |
| Possible partial success between sequential writes | Requires legacy-data assessment | Detect and represent honestly; do not fabricate the missing partner or grouping. |
| Client-only equality short-circuit | Requires adapter replacement | Canonical boundary becomes authoritative for changed-set calculation. |
| Canonical equal-value acceptance | Prohibited after cutover | Detect existing evidence without rewriting; future equal values produce no-change. |
| Caller-supplied effective boundaries | Prohibited after cutover | Owning operation captures success-only boundary. |
| Possible past caller boundaries | Requires legacy-data assessment | Preserve recorded meaning unless authoritative reconciliation exists. |
| Possible future caller boundaries | Requires legacy-data assessment | Detect and block unsupported conversion; do not silently retime. |
| Correction of `effective_start` | Prohibited after cutover | Existing corrections remain attributable; new corrections cannot change it. |
| Correction of `effective_end` | Prohibited after cutover | Existing corrections remain attributable; new corrections cannot change it. |
| Existing correction provenance | Preserved | Retain before/after facts, actor, time, identity, and revision. |
| Absence of correction-note persistence | Requires migration | Add bounded provenance support without creating Session Notes. |
| Absence of forward-only declaration | Requires migration | Add distinct authority, eligibility, atomic operation, periods, and projection behavior. |
| Current refusal without commencement | Superseded after cutover | Preserve refusal for normal commencement-based declaration; eligible unresolved legacy Sessions gain only the bounded forward declaration. |
| Existing derived Current Conditions projection | Requires adapter replacement | Extend canonical derivation for declaration authority and earlier unavailability; never persist a separate Current record. |
| Existing concurrency and idempotency | Requires migration | Preserve stable retry semantics while expanding protection and fingerprinting to the complete operation. |
| Old client mutation adapters | Requires adapter replacement | Remove sequential Product writes and client-selected effective time after atomic cutover. |
| Canonical Growing commencement implementation | Preserved | No change to lifecycle ownership, rows, retrieval, or unresolved meaning. |
| Tasks, Events, Notes, Photos, Documents, Recent Activity, shared Chronology | Outside this contract | No participation or side effect. |

## 34. Required Invariants

1. Exactly Grow Method and Environment Type are authorized.
2. Both dimensions are Session-contained and period-applicable.
3. Each dimension retains independent evidence identity and history.
4. Current Conditions are derived only.
5. No separate Current Conditions store is authorized.
6. One change operation may change one or both dimensions.
7. The canonical boundary calculates the changed set.
8. Equal values create no mutation.
9. Unchanged dimensions receive no evidence.
10. Two-dimension changes are all-or-nothing.
11. All changed dimensions share one effective boundary.
12. No proposal is canonical before success.
13. Failed operations establish no truth.
14. Backdating is prohibited for new changes.
15. Future scheduling is prohibited for new changes.
16. The caller selects no effective boundary.
17. Correction targets exactly one assertion.
18. Correction creates no real-world transition.
19. Effective boundaries are immutable for new corrections after cutover.
20. Correction time remains separate from effective time.
21. Correction notes belong only to correction provenance.
22. `Corrected` is derived and post-success only.
23. Legacy declaration requires both dimensions.
24. Legacy declaration is atomic.
25. Legacy applicability begins only after success.
26. Earlier legacy conditions remain unavailable.
27. Legacy declaration creates no Growing commencement.
28. Lifecycle reconstruction is prohibited.
29. Historical-condition reconstruction is prohibited.
30. Normal Sessions remain commencement-anchored.
31. Growing elapsed time remains lifecycle-owned.
32. Session origin remains unchanged.
33. Completed Germination remains durable.
34. Direct-origin Sessions receive no fabricated Germination truth.
35. No per-entry, position, plant, partition, or arbitrary-record conditions
    are authorized.
36. Condition operations create no cross-capability side effects.
37. No population, progress, completion, or Reflection behavior is
    introduced.
38. Owner scope and canonical security remain mandatory.
39. Idempotent retry creates no duplicate evidence.
40. Stale operations create no partial write.
41. One confirmation produces one revision outcome.
42. Display formatting cannot alter canonical instants.
43. Migration cannot invent truth.
44. Historical evidence is not silently rewritten.
45. Historical sequential writes are not retroactively grouped without
    evidence.
46. Existing boundary corrections are not silently reinterpreted.
47. Old sequential Product writes are prohibited after cutover.
48. Each operation has its own transaction boundary.
49. No-change and rejected operations do not advance revision.
50. This contract does not authorize implementation.

## 35. Downstream Execution Requirements

A later bounded Implementation Contract Execution must govern and implement:

- schema evolution;
- canonical composite operations and per-operation transactions;
- operation identity and fingerprinting;
- concurrency and stale-state rejection;
- idempotent retry;
- no-change enforcement;
- successful-operation time capture;
- period closure and creation;
- correction-note persistence;
- prospective effective-time immutability;
- existing correction-data assessment;
- forward-only legacy declaration and authority source;
- Current Conditions and Condition History projections;
- security and Row Level Security;
- client-adapter cutover and removal of sequential Product writes;
- migration;
- interruption handling;
- rollback; and
- regression and verification coverage.

That execution must prove the required outcomes without expanding architecture.
It is not created or authorized by this document.

## 36. Persistence and Integrity Requirements

Later implementation may persist only the canonical evidence necessary to
realize this contract: condition periods, correction provenance including the
optional note, operation identity and outcome evidence, aggregate revision
authority, and distinct forward-only declaration authority and provenance.

Such persistence must:

- remain Session-contained and owner-scoped;
- preserve independent dimension evidence;
- enforce approved vocabularies and half-open non-overlap;
- preserve one open period per applicable dimension;
- prevent duplicate operations and evidence;
- make successful-operation, correction, and declaration instants
  authoritative and immutable;
- support deterministic retrieval and history;
- preserve existing evidence without unsupported reinterpretation; and
- avoid a separately persisted Current Conditions record.

Physical schema, object names, indexes, locks, procedures, and transport shapes
remain implementation choices.

## 37. Explicitly Superseded IC-SC-001 Authority

Exactly these IC-SC-001 rules are superseded within this supplement's scope:

1. **IC-SC-001 Section 7, one-Session-and-dimension operational change.**
   For future Product writes after cutover, it is replaced by one complete
   changed-set operation over one or both supplied dimensions. Existing
   one-dimension operations and periods remain valid; non-Product uses outside
   this surface receive no new authority.
2. **IC-SC-001 Section 7, caller-supplied operational-change boundary.**
   For future Product writes after cutover, it is replaced by the owning
   operation's success-only boundary. Existing recorded boundaries remain
   historical evidence.
3. **IC-SC-001 Section 8, permission to correct period start or end.**
   For future corrections after cutover through this surface, it is replaced
   by immutable effective boundaries and value-only correction. Existing
   attributable boundary corrections remain recorded and are not silently
   reinterpreted.
4. **IC-SC-001 Sections 9 and 11, requirement that all condition
   applicability depend on authoritative commencement.** For only an eligible
   unresolved legacy Session, it is replaced by distinct forward-only
   declaration evidence beginning at its own successful boundary. Normal
   Sessions remain commencement-anchored, and canonical Growing commencement
   remains unresolved and lifecycle-owned.

5. **IC-SC-001 Section 5 and INV-IC-SC-001-05, commencement-anchored
   first-period authority.** They are boundedly superseded only for an eligible
   unresolved legacy Session using **Set Current Conditions for an Unresolved
   Legacy Session**, and only so the first Grow Method and Environment Type
   applicability periods may begin together at that operation's successful
   declaration boundary. The declaration boundary is condition-applicability
   authority only; it is not lifecycle commencement, does not resolve missing
   Growing commencement, and creates no historical applicability. Earlier
   applicability remains unavailable and is not reconstructed, inferred,
   backdated, or fabricated. This supersession does not apply to Sessions with
   authoritative canonical Growing commencement, normal commencement-based
   initial declarations, Begin Growing, lifecycle chronology, Growing elapsed
   time, historical reconstruction, legacy migration, correction operations,
   or normal Change Current Conditions operations. FN-006 lifecycle
   commencement and chronology authority, FN-007 Begin Growing authority, and
   IC-SC-001B canonical Growing commencement and unresolved-legacy chronology
   authority remain preserved.
No other IC-SC-001 clause or invariant is superseded.

## 38. Governance Status and Next Stage

IC-SC-001C has passed its required read-only Architecture Audit and has received founder governance approval. Implementation Contract governance for this specification is complete.

Repository integration is limited to a bounded commit of this contract and its single Grow Sessions README entry. That repository integration does not authorize implementation.

The next governance stage after the bounded commit is a read-only Implementation Readiness Assessment of IC-SC-001C.

Until that readiness assessment returns PASS and a separate Implementation Contract Execution is created, audited, approved, and explicitly authorized, implementation readiness has not been established. Schema changes, migrations, RPCs, database functions, transaction implementation, adapters, UI implementation, tests, deployment, and production work remain unauthorized.
