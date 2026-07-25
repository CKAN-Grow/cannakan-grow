# IC-SC-001 — Session Conditions Implementation Contract

**Status:** Draft — Requires Read-Only Implementation Contract Audit
**Capability:** 2A — Session Conditions
**Authority:** FN-005, CS-SC-001, and CS-SC-001A
**Scope:** First bounded production slice for canonical Grow Method and Environment Type conditions

## 1. Purpose

Authorize the minimum complete production implementation of the Session
Conditions architecture established by:

- [Grow Platform Architecture](../../platform/grow-platform-architecture.md);
- [FN-005 — Canonical Session Conditions](../foundation-notes/FN-005-canonical-session-conditions.md);
- [CS-SC-001 — Session Conditions Composition](../../product/grow-sessions/session-conditions-composition-specification.md);
- [CS-SC-001A — Initial Session Conditions Dimensions and Existing Truth](../../product/grow-sessions/session-conditions-initial-dimensions-composition-specification.md);
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../foundation-notes/FN-004-session-lifecycle-and-grow-companion.md); and
- [IC-GC-002C — Session Entry & Growing Foundation](./IC-GC-002C-session-entry-and-growing-foundation.md).

Those documents remain authoritative. This contract implements their approved
architecture. It does not establish, reinterpret, extend, or replace it.

If implementation requires an architectural decision not resolved by those
authorities or this contract, implementation must stop pending separately
approved architectural authority.

## 2. Contract Authority

This contract authorizes exactly one production slice containing exactly two
canonical Session Conditions dimensions:

1. **Grow Method**
2. **Environment Type**

No additional dimension, unrestricted custom dimension, miscellaneous
condition key, or generic key-value condition system is authorized.

The implementation must reuse the existing vocabularies approved by
IC-GC-002C without adding, renaming, reordering, merging, or reinterpreting
values.

### 2.1 Environment Type values

- Indoor
- Outdoor
- Greenhouse
- Protected Outdoor
- Mixed
- Other

### 2.2 Grow Method values

- Soil
- Living Soil
- Coco
- Hydro
- DWC
- RDWC
- Rockwool
- NFT
- Aeroponic
- Raised Bed
- Container
- Other

`Other` retains the IC-GC-002C boundary: attributable user-authored Session
text may accompany the canonical `Other` value, but that text does not create
a new global vocabulary value.

New dimensions or vocabulary values require separate architectural
authorization.

## 3. Canonical Ownership and Containment

The canonical Session owns its Session Conditions. The Canonical Platform owns
their meaning, authority, applicability, provenance, normalization, chronology,
correction history, and deterministic projections.

Each canonical condition period must:

- have one stable, immutable canonical identifier;
- belong to exactly one canonical Session;
- identify exactly one of the two authorized dimensions;
- contain one normalized approved value and any permitted `Other` text;
- contain one period start and an optional period end;
- retain creation, authorship, source, and correction provenance;
- retain deterministic creation and update metadata; and
- participate in one correction-aware revision sequence without changing
  identity.

Session identity, condition identity, dimension, original authorship, and
original creation provenance are immutable. A condition cannot be reassigned
to another Session or another owner.

Conditions cannot exist as free-floating Session truth. Cross-Session
assignment and cross-owner mutation are prohibited. No second authoritative
condition store is permitted.

Before cutover, the existing Growing Phase fields remain authoritative. After
successful cutover, canonical Session Conditions are solely authoritative for
Grow Method and Environment Type. Growing, Product Composition, and
Presentation become consumers.

FN-004 remains the sole authority for Session Context. Session lifecycle
authority, Growing Phase identity, and Growing progression remain unchanged.

## 4. Canonical Representation and Normalization

The logical canonical record for one applicable period contains:

- stable condition-period identity;
- immutable parent Session identity;
- authorized dimension identifier;
- normalized approved value;
- normalized attributable `Other` text when the value is `Other`;
- inclusive applicability start;
- exclusive applicability end, or no end for the current open period;
- immutable original actor and creation timestamp;
- source provenance identifying owner declaration or legacy migration;
- current revision number and update timestamp; and
- correction provenance linked to immutable before-and-after revision facts.

The two authorized dimension identifiers are:

- `grow_method`;
- `environment_type`.

Canonical value normalization must preserve the existing IC-GC-002C behavior:

- surrounding whitespace is removed;
- approved labels are matched case-insensitively;
- the stored canonical value is the exact approved label;
- unsupported values are rejected;
- `Other` text uses the existing Growing text normalization boundary; and
- `Other` text is cleared for every non-`Other` value.

Normalization occurs once at the Canonical Platform write boundary. Products,
adapters, and Presentation may format values for delivery but may not
renormalize canonical truth.

The physical schema, table names, procedure names, and transport shapes remain
implementation choices. Every representation must enforce this logical model
without creating another authority.

## 5. Applicability and Chronology

Both authorized dimensions use period applicability only.

The first applicable period for each dimension begins at the canonical instant
when Growing begins for the Session:

- for a Grow Session, the canonical instant at which its included Growing
  phase begins; or
- for a Seed Session, the canonical lifecycle transition that makes Growing
  current.

The boundary must come from canonical Session lifecycle chronology. It must
not be supplied by Presentation, inferred from display order, or reconstructed
from legacy update timestamps.

Each period is half-open:

```text
[period_start, period_end)
```

The start is inclusive. A present end is exclusive. The currently applicable
period may remain open-ended.

For a given Session and dimension:

- a period start must not precede canonical Growing commencement;
- a closed period end must be later than its start;
- no two authoritative periods may overlap;
- at most one period may be open-ended;
- an operational-change boundary closes the preceding period and opens the
  succeeding period at the same instant;
- an exact boundary instant belongs to the succeeding period;
- equivalent valid chronology produces equivalent ordering and projection;
  and
- invalid, ambiguous, stale, or overlapping chronology is rejected rather
  than repaired by Product Composition or Presentation.

Deterministic historical ordering is:

1. applicability start ascending;
2. dimension order: Grow Method, then Environment Type;
3. stable condition-period identity.

Session-wide applicability is not authorized for these dimensions.
Record-level applicability is not authorized.

No direct canonical relationship may be created between a Session Condition
and a Task, Event, Note, Observation, Measurement, Evidence item, Outcome, or
Reflection. A product may request the condition applicable at another
record's canonical chronological point without creating such a relationship.

## 6. Initial Declaration

Initial declaration establishes the first canonical period for one authorized
dimension.

The canonical operation must:

1. authenticate the actor;
2. authorize ownership through the parent Session;
3. validate the immutable Session relationship;
4. validate the authorized dimension;
5. validate and canonically normalize the approved value;
6. validate the canonical Growing commencement boundary;
7. establish the first period at that boundary;
8. assign immutable identity and provenance;
9. reject an existing or overlapping first period;
10. persist all required truth atomically;
11. protect against duplicate submission; and
12. return the same canonical result for an idempotent retry.

A suggested, remembered, prefilled, selected, or displayed value remains
non-canonical until this operation succeeds.

Declaration is unavailable before Growing canonically begins. If no valid
declaration exists after Growing begins, the dimension remains absent. The
platform must not infer a value from a default, another Session, Presentation,
or a legacy field after cutover.

## 7. Operational Change

Operational change records a real change in Session circumstances.

For one Session and dimension, the canonical operation must atomically:

1. authenticate and authorize the owner;
2. validate the new approved value;
3. validate a boundary within canonical Session chronology;
4. require that boundary to follow the current period start;
5. close the currently applicable period at that boundary;
6. create a new stable condition period beginning at the same boundary;
7. preserve the earlier period as historically true;
8. prevent overlap, gaps introduced by the change operation, and multiple
   open periods;
9. reject stale or conflicting mutations;
10. preserve deterministic Current Conditions;
11. protect against duplicate submission; and
12. commit or roll back the entire change.

An operational change creates a new condition-period identity. It must not
rewrite the earlier period's value as though the new circumstance had always
been true.

## 8. Correction

Correction repairs inaccurate recorded truth. It does not represent a real
change in Session circumstances and must not fabricate an operational
transition.

A correction may amend only:

- the normalized value and permitted `Other` text;
- the period start; or
- the period end.

Session identity, condition-period identity, dimension, original actor,
original creation timestamp, and prior correction provenance are immutable.

Each correction must:

1. authenticate and authorize the owner;
2. identify the stable condition period being corrected;
3. retain immutable before-and-after facts, correcting actor, correction
   timestamp, and operation identity;
4. increment the period's correction-aware revision;
5. revalidate the complete timeline for that Session and dimension;
6. reject chronology that overlaps, inverts, or precedes canonical Growing
   commencement;
7. require the first applicable period to remain anchored exactly at canonical
   Growing commencement;
8. recalculate affected canonical projections;
9. reject stale or conflicting revisions;
10. protect against duplicate submission; and
11. commit the correction, history, and affected canonical state atomically.

Correction history remains attributable and retrievable. The latest valid
corrected revision supplies authoritative period facts, while earlier
recorded revisions remain recoverable as correction history.

A correction must not:

- delete or obscure its own prior revision facts;
- change ownership, containment, or dimension;
- convert a correction into a new operational period;
- convert a real operational change into an unexplained overwrite;
- erase an unaffected historical period; or
- use destructive replacement to conceal inaccurate prior recording.

Independent deletion of condition periods or correction history is not
authorized by this production slice. Session-owned history follows the
authoritative parent Session's deletion boundary and must not survive in a way
that leaks inaccessible Session truth or prevent an authorized Session
deletion.

## 9. Canonical Current Conditions

Current Conditions are a deterministic canonical projection derived
exclusively at the Canonical Platform boundary.

For each authorized dimension, the projection consumes:

- the canonical Session and its lifecycle chronology;
- canonical Growing commencement;
- the correction-aware authoritative condition periods;
- the defined applicability point;
- the half-open period rules; and
- the viewer's authorization context.

At a defined chronological point, the applicable period is the single record
whose start is less than or equal to the point and whose end is absent or
greater than the point.

The canonical Current Conditions projection uses the authoritative platform
clock as its defined point. A historical projection uses the explicit
authorized canonical chronological point supplied to retrieval.

Projection results distinguish:

- **known** — exactly one valid canonical period and approved value applies;
- **not applicable** — Growing is not included, has not canonically begun, or
  the requested point precedes canonical Growing commencement;
- **absent** — Growing applies, but no canonical period is established at the
  point;
- **unknown** — an authorized canonical source explicitly records unknown
  truth; this state is not a vocabulary value and this contract authorizes no
  inferred unknown value; and
- **unresolved** — canonical inputs cannot safely determine one result.

Integrity conflicts must fail closed as unresolved and must not be resolved by
retrieval order, most-recent update time, Product Composition, or
Presentation.

Open and closed periods use the same applicability rule. Corrections are
resolved before applicability is evaluated. Equivalent canonical inputs
produce equivalent results and deterministic dimension ordering.

Product Composition may consume, organize, and explain this projection.
Products and Presentation must not independently derive, persist, override,
or renormalize Current Conditions.

## 10. Retrieval

The Canonical Platform must provide deterministic, access-safe retrieval for:

- all canonical Session Conditions belonging to one Session;
- conditions applicable at an authorized chronological point;
- canonical Current Conditions;
- historical operational changes; and
- correction-aware history.

Retrieval must:

- authenticate the viewer and enforce access through the parent Session;
- return no inaccessible Session truth;
- use the canonical corrected state for current and historical applicability;
- distinguish operational periods from correction revisions;
- preserve stable identities and provenance;
- use the deterministic ordering in Section 5;
- return explicit absence, unknown, unresolved, and not-applicable states
  without guessing; and
- avoid reconstruction from product-owned data or legacy Growing fields after
  cutover.

Product adapters may not select a different applicable period or reconstruct a
second history from response order.

## 11. Migration, Cutover, and Compatibility

### 11.1 Before cutover

The existing `grow_method`, `grow_method_other`, `environment_type`, and
`environment_other` Growing Phase fields remain the sole canonical authority
for their approved meaning.

### 11.2 Deterministic migration inputs

For each canonical Session with an authoritative Growing Phase record, the
migration reads only:

- canonical Session identity and owner;
- canonical Growing commencement;
- the existing normalized Grow Method and permitted `Other` text; and
- the existing normalized Environment Type and permitted `Other` text.

Each valid legacy dimension establishes one equivalent open canonical
condition period beginning at canonical Growing commencement. Migration
preserves the exact approved value meaning and attributable `Other` text.

A Session without a canonical Growing commencement or without authoritative
legacy truth must not receive fabricated condition truth. Invalid or
unresolvable legacy truth blocks that Session's migration and blocks the
authority switch rather than being guessed.

### 11.3 Atomic cutover

Before authority changes, implementation must verify:

- complete source-to-target coverage;
- Session ownership and containment;
- approved-value parity;
- canonical Growing commencement for every migrated period;
- no duplicates or overlaps;
- projection parity for both dimensions;
- security enforcement; and
- deterministic retry behavior.

Migration and the authority switch must behave as one cutover gate:

- before successful validation, Growing Phase fields remain authoritative;
- consumers must not switch to Session Conditions early;
- after successful validation and authority switch, Session Conditions become
  solely authoritative; and
- a failure before the switch rolls back target writes or leaves them
  inaccessible and non-authoritative while Growing Phase authority remains
  unchanged.

No state may expose two canonical authorities or no canonical authority.

After the switch, a deployment rollback must not automatically reactivate
legacy authority. Any reverse transition must first preserve all
post-cutover canonical Session Conditions and pass an equivalent atomic
authority transition.

### 11.4 Temporary compatibility

Legacy Growing fields may be temporarily retained only as non-authoritative
compatibility data. They:

- receive no canonical writes after cutover;
- cannot override or correct Session Conditions;
- cannot supply Current Conditions;
- cannot be used by canonical-to-product adapters as truth; and
- cannot regain authority through fallback behavior.

If a legacy-shaped response remains temporarily necessary, it must be derived
read-only from canonical Session Conditions rather than from retained legacy
fields.

Compatibility ends when repository inspection and focused verification prove
that all production Growing and Product Composition consumers read canonical
Session Conditions. At that point, the compatibility adapter must be removed.
Retained legacy fields may then be removed by the implementation migration
authorized by this contract.

Indefinite dual writing and permanent dual authority are prohibited.

## 12. Persistence and Integrity

The authorized canonical persistence consists only of:

- correction-aware Session Condition period records for the two authorized
  dimensions;
- immutable correction-history records required by Section 8; and
- operation identities required for idempotent mutation.

Persistence must enforce:

- one parent Session per condition period;
- immutable Session containment and dimension;
- approved dimension and value constraints;
- existing canonical normalization;
- valid half-open chronology;
- no overlap per Session and dimension;
- at most one open period per Session and dimension;
- uniqueness of a period start per Session and dimension;
- immutable correction provenance;
- owner-scoped access;
- idempotent duplicate-submission behavior; and
- deterministic ordering.

Every declaration, operational change, correction, migration unit, and
authority transition must be atomic. Failed operations must leave no partial
period, partial correction, ambiguous Current Conditions, or conflicting
authority.

Mutations must use an operation identity and an expected canonical revision or
equivalent concurrency guard. Repeating the same completed operation returns
the same canonical result without duplicate truth. Reusing an operation
identity with different input, or submitting a stale conflicting revision,
must be rejected.

No product-owned authoritative copy, local-only canonical model, duplicate
condition history, or independently persisted Current Conditions is
authorized.

## 13. Access and Security

Session Conditions inherit access from their parent canonical Session.

Implementation must enforce:

- authenticated owner-scoped read and write access;
- parent Session ownership validation on every mutation;
- cross-owner writes denied;
- cross-Session writes and reassignment denied;
- anonymous reads and writes denied unless existing Session architecture
  separately authorizes a read;
- inaccessible Session truth excluded from retrieval and projections;
- Row Level Security or an equivalent authoritative database boundary;
- least-privilege grants;
- correction-history protection equivalent to condition-period protection;
- no browser service-role credential or service-role write path; and
- parent Session deletion behavior without orphaned or access-leaking
  condition truth.

Application checks may improve feedback but cannot replace authoritative
database enforcement.

This contract changes no Session ownership, privacy, sharing, publication,
Preview Studio, demo, QA, scenario, service credential, or unrelated security
boundary. Existing security-verification requirements remain mandatory.

## 14. Canonical-to-Product Boundary

Authorized adapters may:

- consume normalized canonical Session Conditions;
- consume canonical Current Conditions;
- retrieve current, historical, and correction-aware meaning;
- expose stable identity, Session attribution, chronology, provenance, and
  explicit missing-state semantics; and
- organize canonical meaning for Product Composition without changing it.

Adapters may not:

- derive canonical applicability or Current Conditions;
- create independent condition history;
- renormalize canonical values;
- infer missing truth;
- create Session-wide or record-level applicability;
- persist authoritative product copies;
- create a parallel condition model; or
- read retained legacy fields as authoritative after cutover.

Presentation may collect input and display composed results through authorized
product behavior. It must not:

- create truth without a successful canonical operation;
- derive or persist Current Conditions;
- decide whether a mutation is a correction or operational change;
- infer missing conditions;
- alter chronology;
- bypass ownership, validation, or security; or
- create a parallel condition model.

This contract defines no layout, control, navigation, styling, interaction, or
workflow design.

## 15. Explicit Exclusions

This contract does not authorize:

- additional Session Conditions dimensions;
- new Grow Method or Environment Type vocabulary values;
- unrestricted custom dimensions or generic key-value conditions;
- Session-wide applicability for these dimensions;
- record-level applicability;
- direct condition-to-record relationships;
- permanent dual writes or dual canonical authority;
- lifecycle progression authority;
- Session Context authority;
- workflow-continuity authority;
- operational-attention authority;
- evidence-readiness authority;
- product-owned authoritative persistence;
- presentation-owned truth;
- independent condition deletion or history erasure;
- recommendations;
- notifications;
- automation;
- artificial-intelligence inference;
- sensor integration; or
- user-interface implementation.

## 16. Contract Invariants

### INV-IC-SC-001-01 — Exactly two dimensions

Only Grow Method and Environment Type are authorized.

### INV-IC-SC-001-02 — Approved vocabularies are reused

The existing IC-GC-002C vocabularies remain unchanged.

### INV-IC-SC-001-03 — Session containment

Every condition period belongs to exactly one canonical Session.

### INV-IC-SC-001-04 — Owner-scoped authority

Authority is enforced through the parent Session and cannot transfer.

### INV-IC-SC-001-05 — Period applicability only

Both dimensions use period applicability beginning at canonical Growing
commencement.

### INV-IC-SC-001-06 — No Session-wide applicability

Session-wide applicability is not authorized for these dimensions.

### INV-IC-SC-001-07 — No record-level applicability

No direct condition-to-record relationship is authorized.

### INV-IC-SC-001-08 — No overlapping authority

Authoritative periods for one Session and dimension never overlap.

### INV-IC-SC-001-09 — Canonical Current Conditions

The Canonical Platform exclusively derives Current Conditions.

### INV-IC-SC-001-10 — Deterministic chronology

Equivalent canonical inputs produce equivalent applicability and ordering.

### INV-IC-SC-001-11 — Historical truth

Operational change preserves earlier applicable truth.

### INV-IC-SC-001-12 — Correction remains distinct

Correction repairs inaccurate recording without fabricating an operational
transition.

### INV-IC-SC-001-13 — One normalization boundary

Canonical values are normalized once by the Canonical Platform.

### INV-IC-SC-001-14 — Atomic cutover

Authority changes only after complete migration and validation.

### INV-IC-SC-001-15 — No dual canonical authority

Exactly one source is authoritative before and after cutover.

### INV-IC-SC-001-16 — No indefinite dual write

Compatibility never permits two writable canonical sources.

### INV-IC-SC-001-17 — Legacy data is non-authoritative

Retained Growing fields cannot override Session Conditions after cutover.

### INV-IC-SC-001-18 — No duplicate persistence

No Product or Presentation owns authoritative conditions or Current
Conditions.

### INV-IC-SC-001-19 — Access-safe retrieval

Retrieval exposes only Session truth authorized for the viewer.

### INV-IC-SC-001-20 — Adapter non-authority

Adapters transport and organize canonical meaning without deriving it.

### INV-IC-SC-001-21 — Presentation non-authority

Presentation neither creates nor independently derives canonical truth.

### INV-IC-SC-001-22 — FN-004 authority is unchanged

FN-004 remains the sole authority for Session Context.

### INV-IC-SC-001-23 — Lifecycle authority is unchanged

Session Conditions do not advance, complete, reopen, or reactivate lifecycle
state.

### INV-IC-SC-001-24 — Product replaceability

Replacing a Product does not migrate or redefine Session Conditions.

### INV-IC-SC-001-25 — Presentation replaceability

Replacing Presentation does not change canonical or product meaning.

## 17. Implementation Verification Requirements

A later implementation must provide executable proof that:

- owner declaration succeeds;
- non-owner declaration fails;
- anonymous declaration fails;
- cross-Session mutation fails;
- unsupported dimensions fail;
- unsupported values fail;
- invalid chronology fails;
- period applicability works at starts, ends, and exact boundaries;
- Session-wide applicability for these dimensions is impossible;
- record-level applicability is impossible;
- operational change preserves prior history;
- correction does not fabricate a transition;
- correction history remains attributable and retrievable;
- overlapping periods are prevented;
- Current Conditions are deterministic and correction-aware;
- chronological retrieval is deterministic;
- missing truth remains missing;
- not-applicable, absent, unknown, and unresolved results are not conflated;
- duplicate submission creates no duplicate truth;
- stale conflicting mutation fails;
- failed writes roll back completely;
- migration preserves existing Grow Method and Environment Type truth and
  `Other` text;
- failed cutover does not create dual authority;
- legacy fields cannot override canonical Session Conditions after cutover;
- indefinite dual write is absent;
- Product Composition cannot bypass canonical derivation;
- Presentation cannot persist Current Conditions;
- owner-scoped Row Level Security or equivalent enforcement passes;
- anonymous, cross-owner, and browser service-role write paths remain blocked;
- unrelated Session, Growing, lifecycle, and Session Context behavior remains
  unchanged; and
- existing repository security verification remains intact.

Verification must include schema and migration integrity, migration-to-snapshot
parity where the repository maintains a schema snapshot, canonical owner CRUD,
RLS enforcement, chronology and overlap enforcement, correction behavior,
cutover failure behavior, adapter boundaries, focused product regression, and
repository integrity.

Verification evidence cannot authorize architecture or capability expansion.

## 18. Implementation Gate

Implementation may begin only after:

1. this contract passes a read-only Implementation Contract audit;
2. its documentation Git step completes;
3. the contract phase is formally closed; and
4. a separately authorized Implementation Execution applies only this bounded
   production slice.

No application code, test, schema, migration, API, security, configuration, or
interface change is authorized by the creation of this document alone.
