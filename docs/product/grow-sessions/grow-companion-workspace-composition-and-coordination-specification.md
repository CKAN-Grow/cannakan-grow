# CS-GC-008 — Grow Companion Workspace Composition and Coordination

**Status:** Architecture Draft — Requires Architecture Review
**Layer:** Product Composition
**Scope:** One-Session Grow Companion workspace composition and coordination

## 1. Purpose

This specification defines how Grow Companion composes approved canonical
capabilities into one understandable working experience for one canonical
Session.

It establishes:

- the relationship among the canonical Session, Grow Companion, Workspace
  Composition, the Session Context Engine, GEE, and Presentation;
- the product read model for Session identity, lifecycle orientation, current
  and viewed phases, Session Conditions, workspace capabilities, temporal
  projections, and Reflection;
- composition-level navigation, action priority, continuity, and experience
  states;
- the boundaries that keep every participating capability authoritative for
  its own records and operations; and
- the bounded authority available to a future Implementation Contract.

This specification defines Product Composition only. It does not implement the
workspace, define persistence, create canonical truth, authorize a lifecycle
transition, or prescribe final visual design.

## 2. Governing Authority

This specification inherits the following governing authority without
redefining or superseding it.

**Highest-order and Platform authority**

- [Grow Foundation](../../foundation/grow-foundation.md);
- [Grow Philosophy](../../philosophy/grow-philosophy.md); and
- [Grow Platform Architecture](../../platform/grow-platform-architecture.md).

**Foundation authority**

- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../../foundation/foundation-notes/FN-004-session-lifecycle-and-grow-companion.md);
- [FN-005 — Canonical Session Conditions](../../foundation/foundation-notes/FN-005-canonical-session-conditions.md);
- [FN-006 — Canonical Phase Commencement and Lifecycle Chronology](../../foundation/foundation-notes/FN-006-canonical-phase-commencement-and-lifecycle-chronology.md);
- [FN-007 — Intentional Transition from Germination to Growing](../../foundation/foundation-notes/FN-007-intentional-transition-from-germination-to-growing.md);
- [FN-GC-004 — Growing Workspace Notes Foundation](../../foundation/foundation-notes/FN-GC-004-growing-workspace-notes-foundation.md);
- [FN-GC-005 — Workspace Foundation](../../foundation/foundation-notes/FN-GC-005-workspace-foundation.md);
- [FN-GC-006 — Photos Foundation](../../foundation/foundation-notes/FN-GC-006-photos-foundation.md);
- [FN-GC-007 — Documents Foundation](../../foundation/foundation-notes/FN-GC-007-documents-foundation.md); and
- [FN-GC-008 — Grow Companion Foundation](../../foundation/foundation-notes/FN-GC-008-grow-companion-foundation.md).

**Architecture-level semantic authority**

- [AR-GC-003-01 — Workspace Time, State, Correction & Retention Semantics](../../architecture/AR-GC-003-01-workspace-time-state-correction-and-retention-semantics.md);
- [AR-GC-003-02 — Growing Workspace Event Semantics & Vocabulary](../../architecture/AR-GC-003-02-growing-workspace-event-semantics-and-vocabulary.md);
- [AR-GC-006-01 — Initial Photos Context Contract](../../architecture/AR-GC-006-01-initial-photos-context-contract.md);
- [AR-GC-007-01 — Initial Documents Context Contract](../../architecture/AR-GC-007-01-initial-documents-context-contract.md); and
- [Grow Evidence Engine](../../architecture/grow-evidence-engine.md).

AR-GC-003-02 governs Event identity, occurrence, origin and provenance,
bounded vocabulary, Task/Event and Note/Event separation, Session Conditions
separation, lifecycle and chronology non-authority, evidence boundaries,
correction, deletion, retention, security, shared temporal-projection
participation, and the non-owning roles of Workspace Timeline, Calendar, Recent
Activity, and Presentation. CS-GC-008 composes Events only through that
authority and applicable Event contracts; it does not redefine or supersede
AR-GC-003-02.

**Product Composition authority**

- [CS-GC-003 — Growing Workspace Composition Specification](./growing-workspace-composition-specification.md);
- [CS-GC-004 — Growing Workspace Notes Composition Specification](./growing-workspace-notes-composition-specification.md);
- [CS-GC-005 — Workspace Composition Specification](./workspace-composition-specification.md);
- [CS-GC-006 — Photos Composition Specification](./photos-composition-specification.md);
- [CS-GC-007 — Documents Composition Specification](./documents-composition-specification.md);
- [CS-SC-001 — Session Conditions Composition](./session-conditions-composition-specification.md);
- [CS-SC-001A — Initial Session Conditions Dimensions and Existing Truth](./session-conditions-initial-dimensions-composition-specification.md); and
- [CS-SC-001B — Canonical Growing Commencement and Legacy Chronology](./session-conditions-growing-commencement-and-legacy-chronology-composition-specification.md).

**Subordinate capability contracts**

- [IC-GC-003B — Growing Workspace Tasks](../../foundation/implementation-contracts/IC-GC-003B-growing-workspace-tasks.md);
- [IC-GC-003C — Growing Workspace Events](../../foundation/implementation-contracts/IC-GC-003C-growing-workspace-events.md);
- [IC-GC-003D — Growing Workspace Temporal Projections](../../foundation/implementation-contracts/IC-GC-003D-growing-workspace-temporal-projections.md);
- [IC-GC-004 — Growing Workspace Notes](../../foundation/implementation-contracts/IC-GC-004-growing-workspace-notes.md);
- [IC-GC-005 — Workspace Composition](../../foundation/implementation-contracts/IC-GC-005-workspace-composition.md);
- [IC-GC-006 — Photos Composition](../../foundation/implementation-contracts/IC-GC-006-photos-composition.md);
- [IC-GC-007 — Documents Composition](../../foundation/implementation-contracts/IC-GC-007-documents-composition.md);
- [IC-SC-001 — Session Conditions Implementation Contract](../../foundation/implementation-contracts/IC-SC-001-session-conditions.md); and
- [IC-SC-001B — Canonical Growing Commencement and Legacy Chronology](../../foundation/implementation-contracts/IC-SC-001B-canonical-growing-commencement-and-legacy-chronology.md).

These contracts remain controlling for their bounded capability operations and
production behavior. They do not transfer domain ownership to Grow Companion
or authorize CS-GC-008 implementation.

The earlier [Grow Companion Composition
Specification](./grow-companion-composition-specification.md) is
non-authoritative historical design input. It is not governing or independently
binding and supplies no unresolved requirement, gate, timeline rule, or
implementation prerequisite. A compatible concept is authoritative here only
where CS-GC-008 restates it under the current governing authority above.

[Grow Architecture
Governance](../../governance/grow-architecture-governance.md) is proposed
procedural guidance and is not governance-complete. It is not Product,
Platform, Foundation, or architecture authority for CS-GC-008 and supplies no
ownership, lifecycle, chronology, persistence, capability, dependency, or
Presentation boundary.

Existing implementation, migrations, schemas, tests, interface behavior, and
other repository precedent are non-authoritative implementation evidence. They
cannot create, amend, or replace the authority above.

Where FN-007 narrowly supersedes the former FN-004 rule that Germination
completion automatically makes Growing current, FN-007 controls. All other
compatible FN-004 authority remains governing.

The dependency direction is:

```text
Canonical Platform
        ↓
Products
        ↓
Presentation
```

Canonical capabilities own truth. Products organize approved truth into
understandable, useful, and actionable experiences. Presentation renders those
experiences and owns neither truth nor Product meaning.

Session Lifecycle retains phase state and transitions. FN-006 retains phase
commencement and canonical chronology. Current phase remains canonical
lifecycle truth; viewed phase remains non-canonical navigation state. Session
Conditions, every participating capability, Workspace coordination, and the
one shared Task/Event temporal projection retain their established owners and
boundaries. Presentation remains replaceable. No implementation is authorized
without later bounded contractual authority.
## 3. Composition Responsibilities

### 3.1 Grow Companion

One Grow Companion corresponds to exactly one canonical Session. Grow Companion
owns only the continuous working context and active user context needed to keep
that Session experience coherent.

For Product Composition, Grow Companion:

- preserves the identity of the Session being worked in;
- keeps canonical current phase and non-canonical viewed phase distinguishable;
- maintains continuity while the user moves among authorized capabilities;
- organizes Session-wide, phase-aware, historical, and operational context;
- orders already-authorized actions by current relevance; and
- routes each action to the capability that owns the operation.

Grow Companion owns no Session record, lifecycle fact, condition, Task, Event,
Note, Photo, Document, Reflection, temporal record, evidence interpretation,
analytics, authorization rule, or persistence.

### 3.2 Workspace Composition

Workspace is the canonical coordination capability. Within Grow Companion it
coordinates access-safe outputs and owning operations from independently
authoritative capabilities.

Grow Companion uses Workspace Composition; it does not become Workspace.
Workspace supplies coordination; Grow Companion supplies the continuous
one-Session working context. Neither acquires the records, identity,
normalization, lifecycle, authorization, or business semantics of a
participating capability.

Removing Grow Companion or its Presentation must not invalidate Workspace or
any canonical capability. Removing or making one capability unavailable may
reduce the available composition but must not invalidate the Session or the
remaining workspace.

### 3.3 Session Context Engine

The Session Context Engine remains the deterministic Platform service for
summaries, operational classifications, workflow continuity, evidence
readiness, and relevant operational attention derived from canonical Session
records.

Grow Companion consumes that approved context. It does not calculate a
competing context model, infer missing facts, or persist a parallel
experience-owned state model. Product action priority may organize authorized
context output, but it must preserve the meaning, uncertainty, and provenance
of that output.

### 3.4 GEE

GEE remains the canonical evidence interpretation and analytics authority
established by committed architecture. It may supply already-authorized,
read-only, versioned outputs to an approved Product consumer. Such output must
remain distinguishable from original evidence, deterministic Session Context,
user-authored Reflection, and canonical operational records.

Committed GEE authority does not assign the following responsibilities to GEE
in this composition:

| Proposed responsibility | Authority-safe composition |
|---|---|
| Session orientation | Session truth, Session Context, and Grow Companion composition |
| Phase-aware contextualization | Session lifecycle plus Grow Companion composition |
| Action prioritization | Deterministic Session Context consumed and ordered by Product Composition |
| Lifecycle continuity | Grow Companion continuous working context |
| Surfacing canonical capabilities | Workspace and Grow Companion composition |
| Maintaining understandable workspace state | Product Composition over canonical capability reads |
| Directing users to owning operations | Grow Companion composition and Presentation routing |

Consequently, CS-GC-008 creates no new GEE workspace coordinator. GEE does not
own workspace state, action priority, navigation, lifecycle, conditions, or
capability routing. If no separately authorized GEE output applies, Grow
Companion presents no substitute interpretation and does not calculate a local
fallback.

GEE must not:

- create or own original Session evidence;
- rewrite, renormalize, or silently correct canonical records;
- infer missing lifecycle, chronology, conditions, or user observations;
- perform or trigger lifecycle transitions;
- become an Attention Engine, Workspace, Session Context Engine, or new
  architectural layer; or
- persist a parallel experience-owned truth model.

## 4. One-Session Workspace Model

Grow Companion composes one workspace around one canonical Session.

The persistent composition contains these conceptual regions:

1. **Session identity and orientation** — canonical Session identity,
   owner-authorized status, canonical current phase, and applicable canonical
   Session context.
2. **Lifecycle orientation** — Germination, Growing, and Reflection with their
   canonical lifecycle states and durable phase history.
3. **Viewed-phase context** — the phase currently selected for presentation,
   clearly distinguished from canonical current phase.
4. **Current understanding** — access-safe Session Context and canonical Current
   Conditions, including explicit unresolved or unavailable meanings.
5. **Primary action** — the highest-priority authorized operation for the
   current Session context.
6. **Supporting actions** — other authorized operations, each routed to its
   owning capability.
7. **Workspace capabilities** — Tasks, Events, Notes, Timeline, Calendar,
   Photos, and Documents through Workspace Composition.
8. **Historical continuity** — completed phases, condition periods, authorized
   source records, and cross-phase review without duplicated authority.
9. **Reflection** — the existing canonical Reflection phase and its
   owner-authorized operations when available.

These are information and coordination regions, not required pages, components,
containers, panels, routes, or visual layouts.

The workspace must remain understandable when a capability is empty,
unavailable, unresolved, or experiencing an operational error. A missing
capability result must not be replaced with invented data or another
capability's state.

## 5. Lifecycle and Phase Composition

### 5.1 Canonical lifecycle

The canonical phases remain:

1. Germination;
2. Growing; and
3. Reflection.

Session Lifecycle owns phase identity, phase state, authorized transitions, and
canonical commencement chronology. Grow Companion consumes those facts
read-only.

Germination completion concludes Germination and preserves it as durable
completed history. It does not make Growing current. Growing becomes current
after Germination only through the authorized Begin Growing transition.

The separately authorized direct-Growing path remains unchanged. In that path,
the bounded Session creation and direct Growing entry form one canonical domain
action. Generic Session creation is not universally authoritative for Growing
commencement.

Growing completion and Reflection continue under existing lifecycle authority.
Reflection is the existing intentional review phase and is not recreated as a
workspace record, report substitute, or GEE output.

### 5.2 Current phase and viewed phase

The **canonical current phase** is the lifecycle phase that is currently active.
Only an authorized lifecycle operation may change it.

The **viewed phase** is non-canonical Product or Presentation state identifying
the phase currently displayed.

Changing the viewed phase:

- changes presentation only;
- does not change current phase;
- does not reactivate, reopen, complete, or advance a phase;
- does not create or alter commencement chronology;
- does not change condition applicability;
- does not grant current-phase operations to completed or future phases; and
- does not change evidence or GEE eligibility.

The current phase remains identifiable while another phase is viewed. A
completed phase remains clearly historical and fully reviewable through its
authorized records. A future phase may be identified for orientation, but this
specification does not make future-phase operational controls available before
an authorized transition.

### 5.3 Phase composition

**Germination** composes its canonical current or completed records under
existing Germination authority. Historical review preserves the complete
record; a summary does not replace it.

**Growing** composes the authorized Workspace capabilities, canonical Current
Conditions, and Growing-specific context without making Workspace or Grow
Companion the owner of Growing, condition, or capability truth.

**Reflection** composes the existing canonical structured subjective review
under FN-004. Reflection output remains user-authored and distinct from GEE
interpretation and intentionally distilled knowledge.

Phase-specific composition may differ. Consistency comes from one Session
identity, one Grow Companion context, one lifecycle model, stable capability
boundaries, and a clear return to canonical current phase—not from forcing
every phase to expose identical capabilities.

### 5.4 Cross-phase history

Cross-phase history is an organized review of canonical records that retain
their original owners and meanings. It is not a new history store.

Completed phase records remain within the same Session. Phase completion,
navigation, reload, and later lifecycle transitions must not silently delete,
move, rewrite, reclassify, or reactivate them.

Session lifecycle history, Session Conditions periods, and the Workspace
temporal projection remain distinct models. Product Composition may present
them together for understanding but must not merge them into one canonical
chronology or infer missing relationships.

## 6. Capability Coordination Rules

Every included capability participates through an access-safe canonical read
and, where already authorized, a route to an owning operation.

Common rules apply:

- Session identity and authorization constrain every read and action.
- Session-wide scope and phase-specific context remain explicit.
- A phase filter never reassigns a record or creates phase applicability.
- Empty means an authorized read succeeded with no qualifying records.
- Unresolved means authoritative truth is absent or explicitly unresolved.
- Unavailable means the capability or required context cannot be provided under
  its governing contract, including authorization-safe absence.
- Operational error means a read or owning operation failed. It does not change
  canonical truth and is not presented as empty, unresolved, or successful.
- An action entry is navigation to or invocation of an already-authorized
  owning operation. CS-GC-008 creates no operation.
- GEE receives no ownership through composition. Any separately authorized GEE
  consumption remains downstream, read-only, and provenance-preserving.

### 6.1 Session identity and orientation

- **Canonical owner:** The canonical Session owns identity, ownership, privacy,
  status, and full lifecycle relationship.
- **Scope:** Session-wide.
- **Product read model:** Stable Session identity, owner-authorized Session
  state, canonical current phase, completed-phase availability, and approved
  deterministic Session Context.
- **Authorized action entry:** Existing Session-owned operations only. Grow
  Companion may route to them but cannot mutate Session truth itself.
- **Lifecycle relationship:** Orientation reflects lifecycle state and never
  substitutes for it.
- **Unresolved or unavailable:** Missing canonical context remains unresolved;
  inaccessible or unretrievable Session context is unavailable without
  exposing restricted data.
- **Operational error:** Preserve the last confirmed state only when clearly
  identified as previously confirmed; do not represent it as current truth.
- **GEE responsibility:** None for Session orientation. GEE eligibility and
  analytics remain separate downstream concerns.
- **Prohibited Grow Companion ownership or derivation:** Session identity,
  ownership, privacy, status, lifecycle, or an independent Session summary
  algorithm.

### 6.2 Lifecycle phase

- **Canonical owner:** Session Lifecycle.
- **Scope:** Session-wide lifecycle with phase-specific current, complete, or
  future state.
- **Product read model:** Germination, Growing, Reflection, canonical current
  phase, durable completed phases, and authoritative or unresolved
  commencement where applicable.
- **Authorized action entry:** Only existing authorized lifecycle operations,
  including Begin Growing when eligible. Direct-Growing remains its bounded
  creation-and-entry operation and is not recreated inside the workspace.
- **Lifecycle relationship:** This is the lifecycle source; navigation and
  capability actions remain consumers.
- **Unresolved or unavailable:** Unresolved legacy commencement remains
  explicitly unresolved. It is not reconstructed from another timestamp.
- **Operational error:** A failed transition remains failed or non-canonical;
  the workspace must not optimistically claim a lifecycle result.
- **GEE responsibility:** GEE consumes lifecycle eligibility through its
  canonical resolver and does not determine or mutate phase state.
- **Prohibited Grow Companion ownership or derivation:** Phase state,
  commencement, transition eligibility, transition outcome, or lifecycle
  chronology.

### 6.3 Session Conditions

- **Canonical owner:** The Session owns its Session Conditions; the Canonical
  Platform owns their meaning, normalization, applicability, provenance,
  history, and Current Conditions derivation.
- **Scope:** The first production slice contains exactly Grow Method and
  Environment Type with period applicability beginning at canonical Growing
  commencement. Session-wide and record-level applicability are not authorized
  for these dimensions.
- **Product read model:** Canonical Current Conditions and authorized historical
  periods, preserving exact canonical values, applicability, chronology,
  provenance, and correction-versus-operational-change meaning.
- **Authorized action entry:** Existing authorized declaration, operational
  change, and correction operations through Session Conditions.
- **Lifecycle relationship:** Conditions consume canonical Growing
  commencement read-only. They do not own, derive, repair, or change it.
- **Unresolved or unavailable:** Absent or unresolved canonical condition truth
  remains distinct from a retrieval or authorization failure.
- **Operational error:** A failed read or operation does not establish,
  replace, close, or correct a period.
- **GEE responsibility:** None for Current Conditions or condition history.
- **Prohibited Grow Companion ownership or derivation:** Condition values,
  normalization, applicability, periods, Current Conditions, provenance,
  correction semantics, or a competing condition store.

### 6.4 Tasks

- **Canonical owner:** Tasks.
- **Scope:** Canonical Session-owned records with only the narrower context
  authorized by the Task contract.
- **Product read model:** Authorized Task identity, intention, due semantics,
  completion state, provenance, and valid canonical context.
- **Authorized action entry:** Existing create, correct, complete, reopen, and
  delete operations owned by Tasks.
- **Lifecycle relationship:** Task operations do not activate or complete a
  phase or Session. Historical review does not reactivate a Task.
- **Unresolved or unavailable:** Missing narrower context is not inferred;
  malformed or unavailable canonical data follows Task compatibility and
  unavailable-state rules.
- **Operational error:** A failed Task operation leaves the previously
  confirmed Task and lifecycle state unchanged.
- **GEE responsibility:** No Task becomes eligible evidence merely by being
  present or completed; GEE retains its separate eligibility authority.
- **Prohibited Grow Companion ownership or derivation:** Task identity,
  intention, due meaning, state transitions, normalization, persistence, or
  authorization.

### 6.5 Events

- **Canonical owner:** Events.
- **Scope:** Canonical Session-owned factual occurrences with only the narrower
  context authorized by the Event contract.
- **Product read model:** Authorized Event identity, occurrence meaning and
  time, approved vocabulary, provenance, and valid canonical context.
- **Authorized action entry:** Existing create, correct, review, and delete
  operations owned by Events.
- **Lifecycle relationship:** Recording, correcting, or deleting an Event does
  not advance lifecycle or complete a Task.
- **Unresolved or unavailable:** Invalid or unavailable occurrence data is not
  assigned a fabricated time, type, context, or lifecycle meaning.
- **Operational error:** A failed Event operation does not create an occurrence
  or another capability record.
- **GEE responsibility:** Event presence does not establish evidence
  eligibility; GEE evaluates eligible evidence separately.
- **Prohibited Grow Companion ownership or derivation:** Event identity,
  occurrence, vocabulary, normalization, persistence, authorization, or
  evidence classification.

### 6.6 Notes

- **Canonical owner:** Notes.
- **Scope:** Canonical authored narrative contained by the authorized Session
  Workspace boundary, with only approved bounded references.
- **Product read model:** Note identity, authored narrative, authorship,
  provenance, correction state, availability, and authorized context.
- **Authorized action entry:** Existing create, retrieve, correct, and delete
  operations owned by Notes.
- **Lifecycle relationship:** Notes do not mutate Session, phase, Task, Event,
  Plant Group, or evidence lifecycle.
- **Unresolved or unavailable:** Missing references do not rewrite the Note or
  infer replacement context. Unavailable context is distinguished from an
  empty Notes result.
- **Operational error:** A failed Note operation preserves the canonical Note
  and cannot be treated as a successful correction.
- **GEE responsibility:** Notes are not verified evidence by default. Any GEE
  consumption requires its own approved evidence boundary.
- **Prohibited Grow Companion ownership or derivation:** Note identity,
  narrative, authorship, references, normalization, correction, persistence,
  or evidence meaning.

### 6.7 Timeline

- **Canonical owner:** Tasks and Events own source records. The Temporal
  Projection capability owns only the shared read-projection semantics and
  owns no domain record, identity, persistence, lifecycle, or evidence.
- **Scope:** Authorized Task and Event records for the canonical Session whose
  due or occurrence semantics qualify for temporal projection.
- **Product read model:** One deterministic temporal projection preserving
  source identity, Task-versus-Event meaning, canonical Session ownership,
  authorized context, and approved time semantics.
- **Authorized action entry:** Temporal navigation, presentation-only
  filtering, and opening the owning Task or Event operation.
- **Lifecycle relationship:** The Workspace Timeline is not Session lifecycle
  chronology, phase navigation, setup progress, or a lifecycle transition.
- **Unresolved or unavailable:** Records without an eligible temporal value
  receive no fabricated dated placement. Source unavailability remains source
  unavailability.
- **Operational error:** Projection failure does not mutate, duplicate, or
  reinterpret source records.
- **GEE responsibility:** None. GEE records and outputs are not sources for this
  temporal projection.
- **Prohibited Grow Companion ownership or derivation:** Timeline records,
  chronology, source mutation, stored filters, projection persistence, or
  independent temporal classification.

### 6.8 Calendar

- **Canonical owner:** Tasks and Events own source records. Calendar is a
  presentation of the shared Temporal Projection and owns no canonical record
  or chronology.
- **Scope:** The same authorized, temporally eligible Task and Event projection
  used by Timeline.
- **Product read model:** Calendar adaptation of the shared projection,
  preserving source identity, meaning, date-only values, canonical instants,
  and deterministic compatibility behavior.
- **Authorized action entry:** Temporal navigation, presentation-only
  filtering, and opening the owning Task or Event operation.
- **Lifecycle relationship:** Calendar navigation and selection do not change
  phase state, viewed-phase authority, or lifecycle chronology.
- **Unresolved or unavailable:** Undated or invalid temporal data is not placed
  on a guessed date. Unavailable sources are not represented as an empty
  calendar fact.
- **Operational error:** Calendar failure creates no fallback store, source
  write, or altered chronology.
- **GEE responsibility:** None.
- **Prohibited Grow Companion ownership or derivation:** Calendar records,
  separate chronology, schedules, reminders, source mutation, or a parallel
  projection model.

### 6.9 Reflection

- **Canonical owner:** The canonical Session's Reflection capability owns the
  structured subjective evidence produced through intentional final review.
- **Scope:** Reflection-phase specific, with durable review after completion.
- **Product read model:** Authorized Reflection state and structured answers,
  preserved as user-authored evidence and distinct from GEE interpretation.
- **Authorized action entry:** Only an existing authorized Reflection
  operation. CS-GC-008 does not create a new Reflection workflow or operation.
- **Lifecycle relationship:** Reflection is the canonical final phase.
  Reflection completion may complete the Session only through existing
  lifecycle authority.
- **Unresolved or unavailable:** If an authorized Reflection operation or
  record is not available, the workspace presents it as unavailable or not yet
  eligible rather than fabricating Reflection content.
- **Operational error:** A failed Reflection operation does not complete
  Reflection or the Session.
- **GEE responsibility:** Eligible Reflection may be consumed downstream under
  GEE authority; GEE output remains distinct and cannot overwrite the
  grower's Reflection.
- **Prohibited Grow Companion ownership or derivation:** Reflection answers,
  completion, evidence meaning, trusted knowledge, or GEE interpretation.

### 6.10 Photos

- **Canonical owner:** Photos.
- **Scope:** The first production slice gives every Photo exactly one canonical
  Session containment relationship. No phase, Task, Event, Note, Plant Group,
  Timeline, Calendar, or public relationship is authorized by that slice.
- **Product read model:** Authorized Photo identity, content association,
  Photo-specific metadata and chronology, privacy and lifecycle state, and its
  validated containing Session.
- **Authorized action entry:** Existing Photo-owned operations only.
- **Lifecycle relationship:** Photos own only their own lifecycle and cannot
  change Session or phase lifecycle.
- **Unresolved or unavailable:** An unavailable containing Session makes the
  Photo unavailable through that Session workspace without silent
  reassignment. Temporary retrieval failure changes neither record.
- **Operational error:** A failed Photo operation does not move the Photo,
  create another relationship, or alter Session state.
- **GEE responsibility:** Photos are not verified evidence by default. Image
  interpretation, classification, diagnosis, or GEE use requires separate
  authority.
- **Prohibited Grow Companion ownership or derivation:** Photo identity,
  content, metadata, chronology, privacy, lifecycle, context, classification,
  persistence, or public visibility.

### 6.11 Documents

- **Canonical owner:** Documents.
- **Scope:** Every first-slice Document has exactly one canonical Session
  reference for Workspace participation. That reference is context, not
  ownership or containment, and no phase or other relationship is authorized.
- **Product read model:** Authorized Document identity, structured meaning,
  chronology, privacy and lifecycle state, representations, and validated
  Session context.
- **Authorized action entry:** Existing Document-owned operations only.
- **Lifecycle relationship:** Documents own only their own lifecycle and cannot
  change Session or phase lifecycle.
- **Unresolved or unavailable:** An unavailable referenced Session excludes the
  Document from that Session workspace but does not invalidate, delete, or
  reassign the Document.
- **Operational error:** A failed Document operation does not change canonical
  meaning, context, Session state, or another capability.
- **GEE responsibility:** Documents are not verified evidence by default.
  Extraction, interpretation, validation as evidence, or GEE use requires
  separate authority.
- **Prohibited Grow Companion ownership or derivation:** Document identity,
  structured meaning, representations, chronology, privacy, lifecycle,
  context, persistence, extraction, or evidence meaning.

## 7. Temporal Composition

Grow Companion composes one shared temporal projection for Timeline and
Calendar.

The first-version projection sources remain exclusively:

- canonical Tasks through approved due semantics; and
- canonical Events through approved occurrence semantics.

Timeline and Calendar adapt the same projection. They do not maintain separate
source sets, ordering rules, identities, chronology, caches as authority, or
persistence.

The shared projection must:

- preserve canonical source identity and Task-versus-Event meaning;
- preserve canonical Session ownership and authorized narrower context;
- keep date-only values on their stored calendar date;
- order canonical instants by their resolved UTC instant while preserving
  approved local display meaning;
- apply the existing deterministic compatibility rules;
- reflect source correction and deletion by recomputation;
- exclude invalid temporal data from dated placement; and
- never assign a fabricated date or instant to an undated record.

Undated or temporally invalid source records remain available, when authorized,
through their owning capabilities. Their absence from dated placement does not
mean the source record is absent.

Phase filtering, temporal range selection, source-type filtering, and switching
between Timeline and Calendar change presentation only. They do not:

- change source records or their canonical context;
- create record-level condition applicability;
- create phase relationships;
- change lifecycle, viewed-phase authority, or evidence;
- persist a projection or filter record; or
- duplicate or reinterpret canonical Events.

The Workspace temporal projection remains distinct from Session lifecycle
chronology, phase commencement, Session Conditions periods, setup timelines,
and GEE chronology.

## 8. Session Conditions Composition

Grow Companion consumes canonical Session Conditions through the completed
Platform and Product authority.

For the first production slice:

- the only dimensions are **Grow Method** and **Environment Type**;
- the existing canonical vocabularies and user-authored `Other` boundaries
  remain unchanged;
- both dimensions use period applicability only;
- the first period begins at canonical Growing commencement;
- operational changes preserve earlier periods as historically true;
- corrections remain distinct from operational changes; and
- the Canonical Platform derives Current Conditions deterministically.

Grow Companion may:

- present Current Conditions read-only;
- organize exact canonical values for Session orientation;
- present authorized historical periods without rewriting them;
- distinguish missing, unresolved, unavailable, and operational-error states;
  and
- route declaration, operational-change, or correction actions to the
  canonical Session Conditions operations.

Grow Companion must not:

- derive Current Conditions independently;
- choose a value from retrieval order, display recency, local cache, default,
  or viewed phase;
- normalize or renormalize a condition value;
- infer a missing condition or Growing commencement;
- persist an altered or competing condition model;
- create Session-wide or record-level applicability for these dimensions;
- rewrite period boundaries;
- treat retrieval failure as unresolved canonical truth; or
- treat unresolved canonical truth as an operational failure.

Canonical Growing commencement remains owned exclusively by Session Lifecycle.
Legacy Sessions without authoritative commencement remain unresolved.
Presentation of a Task, Event, Note, Photo, Document, or Reflection beside a
condition creates no direct condition relationship to that record.

## 9. Navigation and Action Composition

### 9.1 Default entry

Default entry resolves the authorized canonical Session, reconstructs its
canonical lifecycle and context, and lands on the canonical current phase.
Default entry does not depend on a remembered phase, stale route, or local
condition value to determine lifecycle truth.

For a direct-Growing Session, the workspace consumes the already-canonical
Growing state and commencement. It does not repeat or simulate direct entry.

### 9.2 Viewing completed phases

A user may select a completed phase for historical review. The workspace:

- preserves the canonical current-phase indicator;
- identifies the viewed phase as completed history;
- exposes its authorized records without reactivation;
- withholds current-phase operations that do not apply to history; and
- offers an understandable route back to canonical current phase.

### 9.3 Return and reload continuity

Navigation to an owning capability preserves the canonical Session context.
Returning restores the same Session workspace and a still-valid viewed-phase
context when that context is available.

Reload reconstructs Session identity, authorization, lifecycle, Current
Conditions, capability reads, and deterministic Session Context from their
authoritative sources. A remembered viewed phase may be restored only as
non-canonical presentation state for the same Session and only while it remains
valid and authorized. Otherwise, the deterministic fallback is canonical
current phase.

No navigation or reload state may substitute for canonical truth. A stale
route, inaccessible capability, or invalid viewed phase falls back safely
without changing the Session.

### 9.4 Opening coordinated capabilities

Opening a capability preserves canonical Session identity and passes only
authorized canonical context. It does not copy the target record or reconstruct
its domain state in Grow Companion.

Creating, editing, correcting, completing, reopening, or deleting occurs only
through the owning capability's authorized operation. On return, the workspace
re-reads canonical results. It does not assume an operation succeeded from
navigation or local intent.

### 9.5 Action priority

Product Composition may order actions into:

1. one primary next useful action;
2. supporting current-phase actions;
3. Session-wide capability actions; and
4. historical or informational routes.

Priority must be based only on authorized canonical state and approved
deterministic Session Context. It may not:

- create a new eligibility rule;
- convert a recommendation into a lifecycle transition;
- infer missing truth;
- silently perform an owning operation;
- hide unresolved or unavailable state behind a guessed action; or
- grant an action the user is not authorized to perform.

An action label, placement, prominence, or route is Product and Presentation
behavior. The action's meaning, validation, mutation, security, and outcome
remain owned by its canonical capability.

## 10. Experience States

The workspace composes the following states without converting one into
another:

### 10.1 Loading

Canonical reads are pending. Loading asserts no canonical value that has not
been confirmed and exposes no mutation whose authorization or context is not
yet established.

### 10.2 Empty

An authorized capability read succeeded and returned no qualifying canonical
records. Empty does not mean unavailable, unresolved, unauthorized, or failed.
It may route to an already-authorized creation operation.

### 10.3 Unavailable

A capability, context, or operation cannot be supplied under its governing
contract. Unavailable state does not expose restricted data, silently substitute
another capability, or infer replacement context.

### 10.4 Unresolved

Authoritative architecture explicitly cannot supply a canonical fact, such as
legacy Growing commencement without authoritative chronology. Unresolved truth
remains honest and is not filled with an approximate, evidence-derived,
administrator-selected, or presentation-selected value.

### 10.5 Operational error

A read or owning operation failed. The workspace identifies failure without
claiming an empty, unresolved, or successful canonical outcome. Retry routes
back through the same owning operation and does not create an alternate write
path.

### 10.6 Partial capability availability

One capability may be empty, unavailable, unresolved, or failed while other
authorized capabilities remain usable. Grow Companion preserves one coherent
Session context without making a failing capability authoritative for the
whole workspace or masking its state with another capability's data.

## 11. Product and Presentation Boundary

CS-GC-008 may define:

- information hierarchy;
- conceptual workspace regions;
- experience-state meaning;
- action priority;
- responsive composition intent;
- navigation relationships;
- continuity rules;
- capability coordination; and
- GEE participation within existing GEE authority.

Responsive experiences must consume the same Session, lifecycle, condition,
capability, context, and temporal read models. Device-specific presentation
must not create another workspace model or authority.

This specification does not define:

- final visual styling or design tokens;
- page, route, component, DOM, control, gesture, or CSS structures;
- exact labels, dimensions, breakpoints, or placements;
- frontend state-management or caching mechanisms;
- database tables, columns, constraints, indexes, triggers, migrations, RPCs,
  APIs, storage, or security implementation;
- test implementation;
- a presentation-owned truth model; or
- an implementation-specific composition mechanism.

Presentation may render, navigate, filter, and invoke authorized action routes.
It cannot own canonical truth, Product understanding, Workspace coordination,
or Grow Companion continuous working context.

## 12. Prohibited Composition

CS-GC-008 explicitly prohibits:

- Grow Companion ownership of canonical truth;
- a second Session, phase, lifecycle, commencement, or Session Context model;
- duplicate Session Conditions authority or Product-derived Current Conditions;
- parallel Task, Event, Note, Photo, Document, Timeline, Calendar, or Reflection
  records or stores;
- Product-derived canonical chronology;
- Timeline or Calendar persistence or divergent projection models;
- navigation-triggered lifecycle mutation;
- reactivation of completed phases through viewing;
- condition applicability inferred from presentation or record proximity;
- capability logic, normalization, authorization, or persistence duplicated in
  Grow Companion;
- unsupported public sharing, publication, collaboration, or cross-owner
  aggregation;
- GEE-owned workspace state, lifecycle, conditions, action routing, or
  operational context;
- an ungoverned Attention Engine, intelligence engine, or new architectural
  layer;
- UI implementation or visual redesign;
- schema, migration, RPC, storage, security, dependency, or test work;
- unrelated capability expansion;
- governance changes; and
- repository-organization changes.

## 13. Architectural Invariants

1. One Grow Companion corresponds to one canonical Session.
2. Grow Companion owns continuous working context only.
3. Workspace owns coordination only.
4. Canonical capabilities retain their identities, truth, operations, and
   authority.
5. The Session Context Engine remains the deterministic owner of operational
   context derivation.
6. GEE remains the canonical evidence interpretation and analytics authority
   and receives no workspace-coordination authority.
7. Canonical current phase and non-canonical viewed phase remain distinct.
8. Navigation never mutates lifecycle, chronology, conditions, or evidence.
9. Completed phases remain durable and reviewable without reactivation.
10. Direct-Growing and Begin Growing retain their existing lifecycle meanings.
11. Current Conditions remain a read-only Canonical Platform projection.
12. One shared Task-and-Event temporal projection supports Timeline and
    Calendar.
13. Undated or invalid temporal data receives no fabricated dated placement.
14. Every action routes through an authorized owning capability.
15. Empty, unavailable, unresolved, and operational-error states remain
    distinct.
16. Product Composition owns no canonical record or parallel truth model.
17. Presentation remains replaceable and non-authoritative.

## 14. Acceptance Criteria

CS-GC-008 is compositionally complete only when:

1. one coherent workspace is organized around one canonical Session;
2. one Grow Companion maintains one continuous working context;
3. Workspace coordinates every included capability without acquiring its
   authority;
4. every included capability has a committed canonical owner or an explicitly
   non-authoritative projection role;
5. current phase and viewed phase remain distinct in every state;
6. Germination, Growing, Reflection, completed history, direct-Growing, and
   intentional Begin Growing preserve existing lifecycle authority;
7. GEE responsibilities are explicit, downstream, and limited to committed GEE
   authority;
8. Session Context supplies deterministic operational context without a
   competing Product derivation;
9. exactly one temporal projection supplies Timeline and Calendar from
   canonical Tasks and Events;
10. phase and cross-phase composition create no duplicate records, chronology,
    or authority;
11. exact canonical Current Conditions and their period boundaries are consumed
    read-only;
12. Session identity and authorized context survive navigation and are
    reconstructed from canonical sources on reload;
13. every action enters an already-authorized owning operation;
14. empty, unavailable, unresolved, and operational-error meanings remain
    distinguishable;
15. no Product- or Presentation-owned canonical truth exists;
16. no unsupported capability, sharing behavior, or architectural layer is
    introduced; and
17. no unresolved architecture decision is delegated to implementation.

## 15. Future Implementation Contract Boundary

After this specification passes Architecture Review, receives owner approval,
and enters repository history, one bounded Implementation Contract may define
implementation obligations for:

- one-Session Grow Companion workspace composition;
- access-safe assembly of approved capability read models;
- canonical-current and viewed-phase separation;
- navigation and reload continuity;
- experience-state handling;
- action routing through existing owning operations;
- one shared Timeline and Calendar projection adapter;
- read-only Session Conditions composition; and
- read-only GEE participation only where an existing GEE contract already
  authorizes the consumed output.

That Implementation Contract must preserve implementation freedom. It may not
create or modify canonical capability behavior, persistence, lifecycle,
chronology, conditions, GEE analytics, authorization, public sharing, or
Presentation-owned truth.

This specification does not authorize implementation. No implementation work
may begin until the future Implementation Contract completes the repository
governance progression.
