# CS-GS-001 — Germination Setup and Phase Experience Composition

**Status:** Proposed Product Composition — Requires Read-Only Architecture Review and Owner Approval
**Layer:** Product Composition
**Product area:** Grow Sessions
**Scope:** Session Setup, active Germination, completed Germination, and the intentional post-Germination decision within one Grow Companion

## 1. Purpose

This specification defines the Product composition for the complete Germination
experience inside one canonical Session and the shared Grow Companion workspace.

It translates established canonical authority into an understandable,
method-aware experience for:

- choosing Seed Session or direct Grow Session entry;
- establishing Germination Setup evidence;
- operating and reviewing active Germination;
- preserving completed Germination history;
- completing Germination without automatically entering Growing;
- choosing whether to complete the Session or begin Growing; and
- composing independently authoritative capabilities without taking ownership
  of their truth or operations.

The governing Product standard is:

> Preserve proven value. Improve hierarchy and usability. Relocate where
> appropriate. Retire only obsolete or unauthorized behavior.

This specification does not freeze the legacy layout. It governs Product
meaning, hierarchy, participation, and state. Presentation remains free to
produce a substantially improved responsive experience within those
boundaries.

This specification authorizes no application implementation.

## 2. Governing Authority

CS-GS-001 inherits the following committed authority without redefining or
superseding it.

### 2.1 Highest-order and Platform authority

- [Grow Foundation](../../foundation/grow-foundation.md);
- [Grow Philosophy](../../philosophy/grow-philosophy.md); and
- [Grow Platform Architecture](../../platform/grow-platform-architecture.md).

### 2.2 Foundation authority

- [FN-003 — Canonical Entities & Representation](../../foundation/foundation-notes/FN-003-canonical-entities-and-representation.md);
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../../foundation/foundation-notes/FN-004-session-lifecycle-and-grow-companion.md);
- [FN-005 — Canonical Session Conditions](../../foundation/foundation-notes/FN-005-canonical-session-conditions.md);
- [FN-006 — Canonical Phase Commencement and Lifecycle Chronology](../../foundation/foundation-notes/FN-006-canonical-phase-commencement-and-lifecycle-chronology.md);
- [FN-007 — Intentional Transition from Germination to Growing](../../foundation/foundation-notes/FN-007-intentional-transition-from-germination-to-growing.md);
- [FN-008 — Germination Setup Evidence and Inventory Boundaries](../../foundation/foundation-notes/FN-008-germination-setup-evidence-and-inventory-boundaries.md);
- [FN-GC-004 — Growing Workspace Notes Foundation](../../foundation/foundation-notes/FN-GC-004-growing-workspace-notes-foundation.md);
- [FN-GC-005 — Workspace Foundation](../../foundation/foundation-notes/FN-GC-005-workspace-foundation.md);
- [FN-GC-006 — Photos Foundation](../../foundation/foundation-notes/FN-GC-006-photos-foundation.md);
- [FN-GC-007 — Documents Foundation](../../foundation/foundation-notes/FN-GC-007-documents-foundation.md); and
- [FN-GC-008 — Grow Companion Foundation](../../foundation/foundation-notes/FN-GC-008-grow-companion-foundation.md).

FN-008 is the controlling architecture-level authority for Session-specific
Germination evidence, seed-age evidence, the Session-to-Vault relationship,
Vault inventory participation, consumable-supply inventory participation,
coordinated-operation integrity, correction, reconciliation, legacy
uncertainty, and GEE independence. CS-GS-001 makes Product decisions within
those boundaries and does not amend them.

FN-007 narrowly supersedes the former FN-004 rule that Germination completion
automatically makes Growing current. Germination completion and Begin Growing
are separate canonical lifecycle operations. FN-007 controls that relationship;
all other compatible FN-004 authority remains governing.

### 2.3 Architecture-level semantic authority

- [AR-GC-003-01 — Workspace Time, State, Correction & Retention Semantics](../../architecture/AR-GC-003-01-workspace-time-state-correction-and-retention-semantics.md);
- [AR-GC-003-02 — Growing Workspace Event Semantics & Vocabulary](../../architecture/AR-GC-003-02-growing-workspace-event-semantics-and-vocabulary.md);
- [AR-GC-006-01 — Initial Photos Context Contract](../../architecture/AR-GC-006-01-initial-photos-context-contract.md);
- [AR-GC-007-01 — Initial Documents Context Contract](../../architecture/AR-GC-007-01-initial-documents-context-contract.md); and
- [Grow Evidence Engine](../../architecture/grow-evidence-engine.md).

### 2.4 Product Composition authority

- [CS-GC-008 — Grow Companion Workspace Composition and Coordination](./grow-companion-workspace-composition-and-coordination-specification.md);
- [CS-GC-004 — Growing Workspace Notes Composition Specification](./growing-workspace-notes-composition-specification.md);
- [CS-GC-005 — Workspace Composition Specification](./workspace-composition-specification.md);
- [CS-GC-006 — Photos Composition Specification](./photos-composition-specification.md);
- [CS-GC-007 — Documents Composition Specification](./documents-composition-specification.md);
- [CS-SC-001 — Session Conditions Composition](./session-conditions-composition-specification.md);
- [CS-SC-001A — Initial Session Conditions Dimensions and Existing Truth](./session-conditions-initial-dimensions-composition-specification.md); and
- [CS-SC-001B — Canonical Growing Commencement and Legacy Chronology](./session-conditions-growing-commencement-and-legacy-chronology-composition-specification.md).

CS-GC-008 governs the shared one-Session shell, canonical-current versus
viewed-phase distinction, local capability coordination, navigation, action
routing, one shared Task/Event temporal projection, and Presentation boundary.
CS-GS-001 specializes the Germination experience inside that composition. It
does not create a second Grow Companion or Workspace model.

### 2.5 Applicable capability contracts

The following committed contracts remain controlling for their bounded
capabilities and existing operations:

- [IC-GC-002B — Grow Companion Structural Foundation](../../foundation/implementation-contracts/IC-GC-002B-grow-companion-structural-foundation.md);
- [IC-GC-002C — Session Entry & Growing Foundation](../../foundation/implementation-contracts/IC-GC-002C-session-entry-and-growing-foundation.md);
- [IC-GC-003B — Growing Workspace Tasks](../../foundation/implementation-contracts/IC-GC-003B-growing-workspace-tasks.md);
- [IC-GC-003C — Growing Workspace Events](../../foundation/implementation-contracts/IC-GC-003C-growing-workspace-events.md);
- [IC-GC-003D — Growing Workspace Temporal Projections](../../foundation/implementation-contracts/IC-GC-003D-growing-workspace-temporal-projections.md);
- [IC-GC-004 — Growing Workspace Notes](../../foundation/implementation-contracts/IC-GC-004-growing-workspace-notes.md);
- [IC-GC-005 — Workspace Composition](../../foundation/implementation-contracts/IC-GC-005-workspace-composition.md);
- [IC-GC-006 — Photos Composition](../../foundation/implementation-contracts/IC-GC-006-photos-composition.md);
- [IC-GC-007 — Documents Composition](../../foundation/implementation-contracts/IC-GC-007-documents-composition.md);
- [IC-SC-001 — Session Conditions Implementation Contract](../../foundation/implementation-contracts/IC-SC-001-session-conditions.md); and
- [IC-SC-001B — Canonical Growing Commencement and Legacy Chronology](../../foundation/implementation-contracts/IC-SC-001B-canonical-growing-commencement-and-legacy-chronology.md).

IC-GC-002B and IC-GC-002C are committed subordinate implementation
authorities with stale internal Draft metadata. IC-GC-002B supplies the
protected Germination composition and completed-history regression boundary.
IC-GC-002C supplies the existing bounded Germination-only **Complete Session**
operation.

FN-004 remains higher Foundation authority. FN-007 governs the separation
between Germination completion and intentional **Begin Growing**. Complete
Session after Germination is permitted only through the existing
Germination-only Session completion path authorized by IC-GC-002C; that
subordinate contract does not broaden or supersede FN-004 or FN-007.

Their inclusion establishes consumption boundaries only. It does not authorize
CS-GS-001 implementation or expand any capability operation.

### 2.6 Historical and design evidence

The earlier [Grow Companion Composition
Specification](./grow-companion-composition-specification.md) is
non-authoritative historical design input under CS-GC-008. Existing
Germination implementation, preservation assessments, regression checks, and
scenario fixtures are evidence of proven user value. They do not create
canonical truth, fill missing authority, or freeze the current interface.

The approved Concept 02 establishes visual direction only. It does not govern
Product meaning, canonical ownership, lifecycle, evidence, operations, or
persistence.

Where historical behavior conflicts with the authority above, the governing
authority controls and the conflicting behavior is retired or withheld.

## 3. Scope and Product Model

### 3.1 Included experience

CS-GS-001 governs:

1. Seed Session versus direct Grow Session entry;
2. Germination Setup for a Seed Session;
3. active Germination orientation, workflow, evidence, and supporting
   capability participation;
4. completed Germination review;
5. Germination completion;
6. the post-Germination decision boundary;
7. entry into authorized Growing setup; and
8. Presentation meaning for responsive and exceptional states.

### 3.2 One Session and one Grow Companion

A Seed Session and a direct Grow Session are entry paths into one canonical
Session model, not different Session domains.

For the Seed Session path:

```text
Germination Setup
        ↓
Active Germination
        ↓
Completed Germination
        ↓
Explicit post-Germination decision
        ├── Complete Session through the bounded IC-GC-002C path, when eligible
        └── Begin Growing through the authorized transition
```

Germination Setup is a bounded coordination context, not a lifecycle phase or
canonical aggregate. The post-Germination decision boundary is the absence of
an authorized next-phase entry, not a fourth phase or generalized workflow
state.

### 3.3 Product experience states versus canonical states

Product may maintain non-canonical draft and viewed state needed to make the
experience coherent. Such state never becomes a substitute for canonical
Session, lifecycle, evidence, Vault, supply, capability, or GEE truth.

The Product model distinguishes:

- **setup draft** — unsaved Product input with no canonical Session outcome;
- **active Germination** — canonical Germination is current;
- **completed Germination** — Germination is complete and durable;
- **post-Germination decision pending** — no Growing entry has occurred;
- **Growing setup draft** — non-canonical preparation for Begin Growing; and
- **completed historical view** — non-reactivating review of Germination.

## 4. Ownership Boundaries

| Concern | Canonical owner | CS-GS-001 responsibility |
|---|---|---|
| Session identity and Session-specific Germination evidence | Grow Session | Compose authorized inputs, reads, review, and action routes |
| Phase state, completion, entry, transition, and commencement | Session Lifecycle | Present returned lifecycle truth and route authorized operations |
| Vault entry, current Vault metadata, and seed inventory | Seed Vault | Preview, assign, validate Product intent, and invoke owning operations |
| Copied evidence used by one Session | Grow Session | Make lineage, source precision, and Session-specific meaning understandable |
| Consumable-supply records and quantity | Consumable-supply inventory | Present applicability and Product thresholds; route owning operations |
| Session Conditions | Canonical Session Conditions | No Germination supply or workflow ownership; consume only where separately applicable |
| Tasks | Tasks | Provide the Tasks & Events destination and authorized routes |
| Events | Events | Provide the Tasks & Events destination and authorized routes |
| Timeline and Calendar adaptation | Shared Task/Event temporal projection | Present through Chronology without adding Germination workflow records |
| Notes | Notes | Present private authored narrative through the Notes destination |
| Photos | Photos | Present already-authorized Session-contained Photos without new mutation authority |
| Documents | Documents | Present already-authorized Session-referenced Documents without new mutation authority |
| Evidence interpretation and analytics | GEE | Render authorized outputs without calculating substitutes |
| Coordination and local navigation | Workspace and Grow Companion composition | Define Germination hierarchy, placement, progressive disclosure, and action priority |
| Visual expression and responsive realization | Presentation | Retain replaceable layout, component, imagery, typography, and motion choices |

Composition never transfers ownership. A Product route to an operation is not
the operation, and an operation result must be re-read from its canonical
owner.

## 5. Session Entry and Germination Setup Composition

### 5.1 Seed Session versus Grow Session

The entry decision must be explicit before phase-specific setup:

- **Seed Session** includes Germination and proceeds into the method-aware
  Germination Setup governed here.
- **Grow Session** uses the separately authorized direct-Growing entry path.
  It does not create a completed or skipped Germination record, and CS-GS-001
  does not define its Growing fields.

Changing the entry choice before canonical creation changes draft composition
only. A Product must not silently convert an existing canonical Session from
one entry path to another.

### 5.2 Progressive setup hierarchy

Germination Setup is progressively disclosed in this Product order:

1. entry path;
2. Session identity and proposed start context;
3. Germination method selection;
4. method guidance, capacity, estimated timing, and unit context;
5. applicable supply readiness;
6. Track Seed Age;
7. Add from My Seed Vault;
8. KAN Seed Chart or method-equivalent evidence setup;
9. review of evidence, provenance, quantities, and warnings; and
10. one authorized **Save Session** action.

The Product may keep already-entered draft values while the grower compares
methods, but incompatible values must be identified before Save. A method
change must not silently reinterpret one position model as another.

### 5.3 Setup fields and Product meaning

| Input or context | Product decision |
|---|---|
| Session name | Required, user-authored identity aid within existing Session naming authority |
| Start date and time | Captured as proposed lifecycle input; Presentation does not declare it canonical commencement |
| Germination method | Required for Seed Session and controls method-specific composition |
| Method imagery | Contextual guidance, not evidence or method authority |
| Method guidance | Clearly distinguish instruction from recorded outcome |
| Capacity | Describe the selected method-position model; do not imply inventory |
| Estimated timing | Label as sourced method guidance or an authorized deterministic estimate, never an observed fact |
| Unit designation | Optional physical-unit context where applicable; not a new canonical Session identity |
| Seed evidence | At least one valid seed group or physical position is required |
| Source and breeder | Preserve separately when each is supplied and authorized; do not collapse one into the other |
| Variety, type, and sex | Structured Session evidence; Unknown or not applicable remains explicit |
| Quantity | Positive whole-seed quantity, subject to method and Vault validation |
| Acquisition evidence | Preserve source kind, precision, and provenance when supplied |
| Supply readiness | Required review for applicable methods; remains independent inventory truth |
| Help and tutorials | Contextual and dismissible; never a save prerequisite |

The start value shown after Save must be the canonical Germination commencement
returned by Session Lifecycle. If the lifecycle operation cannot establish
canonical commencement, the Product presents the outcome as unresolved or
failed rather than substituting setup time, record time, or local draft time.

### 5.4 Method-aware position models

The initial Product method set preserves the proven method-specific workflows:

| Method | Product position model | Product composition |
|---|---|---|
| KAN | Eight fixed partitions | KAN imagery and guidance, optional KAN Unit designation, eight identifiable partitions, KAN Seed Chart, method roadmap, and applicable filter-paper review |
| TRā | Sixteen fixed partitions | TRā imagery and guidance, optional TRā Unit designation, sixteen identifiable partitions, TRā Seed Chart, and method roadmap |
| Paper Towel Only | One or more attributable towel groups | Paper-towel guidance, group quantities, towel-group evidence, and paper-towel roadmap |
| Soak + Paper Towel | One or more attributable towel groups across the combined method | Soak and transfer guidance remain distinct milestones within one method workflow |
| Rockwool | Repeatable physical cube positions | One seed and one final result per physical position; media-preparation readiness participates |
| Starter Plug | Repeatable physical plug positions | One seed and one final result per physical position; plug-preparation readiness participates |
| Water Glass | One or more attributable glass groups | Glass-group evidence and water-soak roadmap |
| Direct Soil | Repeatable physical planting positions | One seed and one final result per physical position |
| Other | Explicit user-labeled seed groups or positions | No standardized capacity, roadmap, timing, or supply applicability may be inferred |

KAN and TRā partitions may each hold an attributable seed group and quantity;
they are not Vault or supply inventory units. Rockwool, Starter Plug, and
Direct Soil use one-seed physical positions so final results remain `0` or `1`
per position. Group-based methods preserve group quantity and result bounds.

Presentation may use tables, cards, diagrams, steppers, or other replaceable
forms. It must not reduce all methods to one generic form.

### 5.5 One Save Session action

Germination Setup exposes one final Product action: **Save Session**.

Before enabling that action, Product validation must confirm:

- Seed Session remains the selected entry path;
- Session name, method, and proposed start context are supplied;
- the method-position model is valid;
- at least one seed group or position has valid structured evidence;
- quantities are whole, positive, and within method and Vault constraints;
- required single-seed positions contain no quantity greater than one;
- overwrite decisions are resolved;
- applicable depleted supply is resolved;
- any known Vault assignment has sufficient authoritative quantity; and
- no required canonical truth is being replaced with a default.

Save Session requests one stable logical setup operation. Its approved Product
meaning includes the required canonical Session creation and Germination entry,
accepted Session evidence, required Vault deductions for Vault-assisted
assignments, and required supply consumption for applicable tracked supply.
The canonical owners retain every write.

The Product may present success only when every required canonical outcome is
confirmed. A partial or uncertain outcome becomes **reconciliation required**;
it must not be retried as a new logical operation or represented as a complete
Session.

This section defines the Product outcome, not transactions, APIs, persistence
ordering, idempotency storage, retry technology, or compensation technology.

## 6. Track Seed Age Composition

### 6.1 Eligibility and placement

Track Seed Age is eligible for every Seed Session Germination method that
accepts attributable seed groups or physical seed positions. It is not
applicable to direct Grow Session entry or a Session that does not include
Germination.

Track Seed Age appears after method selection and before or beside Add from My
Seed Vault and the method evidence editor. This makes age policy visible before
Vault autofill and position review while keeping age attached to the seed
evidence it qualifies.

### 6.2 Explicit enable and disable behavior

Track Seed Age is opt-in. Disabled means no qualified age statement has been
accepted for the setup; it does not mean `0–1 yr`, `0.5`, current-year age, or
young seed.

Enabling Track Seed Age requires a choice between:

- **Same** — one qualified source fact and provenance applies to every
  participating seed group or position; or
- **Mixed** — qualified evidence is assigned independently by seed group or
  method position.

Same and Mixed describe assignment scope, not a weaker evidence type.

Disabling an unsaved setup choice may retain reversible draft input only as
non-canonical Product state. Save omits that disabled draft. Disabling or
changing already-canonical age evidence requires an authorized attributable
Session correction; Presentation must not silently erase it.

### 6.3 Qualified structured evidence

Track Seed Age collects one of the FN-008 reference kinds:

- production, harvest, or comparable origin date;
- acquisition date;
- acquisition year;
- attributable age statement as of a recorded date or instant; or
- Unknown.

The experience preserves:

- reference kind;
- source value;
- source precision;
- provenance;
- evaluation point; and
- any authorized deterministic derivation.

Acquisition evidence remains time-since-acquisition context and is not relabeled
as biological seed age. A year-only source remains year precision. An
approximate user statement remains approximate. Unrestricted text may
supplement provenance or correction reason but cannot replace the structured
fact.

### 6.4 Vault-assisted activation

Selecting a Vault entry may offer to enable Track Seed Age when that entry
supplies qualified age-related evidence. The Product must show the source kind,
precision, and provenance before acceptance.

Vault selection never silently enables tracking. If accepted Vault evidence is
identical across all assigned groups, Product may offer Same mode. Different
qualified facts require Mixed mode unless the grower deliberately replaces them
with one separately qualified Session-wide fact.

Unknown Vault evidence remains Unknown and cannot activate a fabricated age.

### 6.5 Review, correction, and later participation

During setup, age review appears with the affected groups or positions and in
the overall evidence review.

During active Germination:

- the Overview may show a compact qualified summary;
- full evidence and provenance remain available in the method evidence detail;
- editing routes to an authorized Germination evidence update or correction;
  and
- changing Session evidence never changes the Vault automatically.

During completed Germination:

- accepted and corrected age evidence remains historical;
- original and corrected meaning remain distinguishable where supplied;
- Fair View, Snapshot, and GEE may consume only eligible qualified evidence;
  and
- Unknown or disabled tracking remains explicit.

GEE eligibility, buckets, formulas, confidence, and analytical labels remain
owned by GEE. CS-GS-001 authorizes no default age or Product calculation.

## 7. Add from My Seed Vault Composition

### 7.1 Eligibility and progressive access

Add from My Seed Vault is eligible for every Seed Session Germination method
with an established seed-group or method-position model. It is not available
inside direct Grow Session setup.

The capability becomes progressively available after:

1. a Germination method is selected;
2. its position model is established; and
3. at least one assignable group or position exists.

The general Seed Vault editor is never embedded in Germination Setup. A route
to an owning Vault operation may be offered when a current entry requires
correction or replenishment.

### 7.2 Selection and preview

The picker consumes an access-safe Vault read and presents:

- stable Vault-entry identity;
- current owner-visible quantity and quantity status;
- source and breeder where each is authorized;
- variety, type, and sex;
- acquisition evidence;
- qualified age-related evidence;
- provenance and source precision;
- the selected destination group or position; and
- facts that are absent or Unknown.

The preview distinguishes current Vault truth from the Session evidence that
will be copied on Save.

### 7.3 Assignment and autofill

A selected Vault entry may autofill only fields actually supplied by the
authorized Vault read. Empty source fields remain empty; Product must not
invent source, breeder, variety, type, sex, acquisition, age, or quantity.

Autofill:

- targets one identified group or method position;
- retains the stable Vault reference;
- marks each populated field with its Vault provenance;
- prepares a Session-owned evidence snapshot;
- does not mutate or reserve Vault inventory; and
- remains provisional until Save succeeds.

If a destination already contains a non-empty value, the Product shows a
field-level overwrite review. The grower may keep the Session value, accept
the Vault value, or cancel assignment. No overwrite is silent.

### 7.4 Clearing, replacing, duplicates, and mixed groups

Before Save:

- clearing an assignment removes the provisional reference and copied draft
  values that have not been separately retained by the grower;
- replacing an assignment runs the same overwrite and provenance review;
- the same Vault entry may be assigned to more than one position;
- different Vault entries may be mixed across positions; and
- provisional selection performs no reservation, deduction, or restoration.

Duplicate use aggregates the assigned quantities for validation. Save cannot
deduct more than the authoritative available quantity, and concurrent or stale
displayed quantity never authorizes over-allocation.

### 7.5 Quantity policy

For a Vault-assisted assignment:

- assigned quantity is a positive whole number;
- aggregate quantity across all uses of one Vault entry is validated;
- authoritative available quantity must be known and sufficient at commit;
- insufficient quantity blocks Save for that assignment;
- Unknown quantity cannot be treated as sufficient; and
- the grower may resolve the Vault through its owning capability or clear the
  Vault assignment and enter independent Session evidence.

Clearing the assignment is not a Vault correction and does not preserve a
stable Vault reference. Product must explain that consequence before Save.

### 7.6 Saved and historical meaning

After Save, active Germination presents:

- the stable Vault reference where available;
- the copied Session evidence and capture context;
- the provenance of each accepted field; and
- current Vault context only when separately requested and clearly labeled as
  current.

The default active view is read-only provenance. Session-specific editing
routes to an authorized Session evidence operation; Vault editing routes to
the Seed Vault. Neither route silently updates the other.

Completed Germination preserves the copied Session evidence even if the Vault
entry later changes, becomes unavailable, is archived, or is deleted. Missing
legacy references and snapshots remain missing or unresolved.

## 8. Filter-Paper and Supply Composition

### 8.1 Initial applicability

The first Product scope makes tracked filter-paper supply applicable only to
the KAN method, preserving the proven bounded workflow. TRā, Paper Towel Only,
Soak + Paper Towel, Rockwool, Starter Plug, Water Glass, Direct Soil, and Other
are **not applicable** to this specific tracked supply until separately
approved Product authority establishes their consumable and usage meaning.

The name of a Germination method does not itself authorize use of this
inventory capability.

### 8.2 Product-owned thresholds

For the initial KAN policy, one started Session requires one filter paper. The
Product classification is:

| State | Authoritative available count | Severity and setup policy |
|---|---:|---|
| Unset | No authoritative count has been established | Informational setup warning; explicit continuation without tracked supply is permitted and performs no supply mutation |
| Ready | 3 or more | No blocking warning |
| Low | 2 | Advisory warning and optional reminder |
| Critical | 1 | High-prominence warning; Save may proceed and the confirmed consumption leaves Depleted |
| Depleted | 0 | Blocking for KAN Save until Update Count confirms available supply or another method is selected |

A negative, malformed, inaccessible, or failed quantity is not another Product
threshold. It is an operational error, unavailable state, or reconciliation
state as supplied by the owner.

These thresholds are Product policy. The supply capability remains the
canonical owner of count and inventory changes.

### 8.3 Setup and active participation

After KAN selection, setup presents:

- current filter-paper state and count;
- the one-paper usage meaning;
- warning severity;
- reminder preference status where available;
- **Reorder Filter Papers**; and
- **Update Count** through the owning supply operation.

The supply warning may appear in the first active-Germination viewport only
when it is actionable. Ready supply remains available in supporting detail and
does not compete with the method workflow.

Supply inventory must not appear as Session Conditions, Today, Recent
Activity, a Task, an Event, or Task/Event Chronology.

### 8.4 Reminder policy

Supply reminders are optional and preference-respecting. Product may request a
deduplicated reminder when authoritative inventory crosses into Low, Critical,
or Depleted. A reminder:

- communicates the current owner-supplied state;
- routes to Update Count or Reorder;
- is not a canonical Task or Event;
- creates no Session evidence; and
- does not prove inventory consumption or replenishment.

Dismissal changes reminder presentation only.

### 8.5 Commerce versus inventory mutation

**Reorder Filter Papers** opens the applicable commerce destination. Opening,
ordering, paying, returning, or closing that destination does not change
inventory.

**Update Count** enters the owning supply-inventory operation. Only a confirmed
receipt, addition, consumption, correction, or reversal from that capability
may change canonical quantity.

After returning from either route, the Product re-reads inventory. A commerce
return never optimistically changes the state. Confirmed replenishment
reclassifies the display from the newly read count.

### 8.6 Failure and reconciliation

If required KAN supply consumption becomes partial, uncertain, or inconsistent
with the coupled Save outcome, the Session experience presents
**reconciliation required**. It does not guess whether the paper was consumed,
restore quantity from lifecycle state, or submit a second logical Save.

Resolution routes to authorized owner operations and preserves the original
logical-operation relationship.

## 9. Active Germination Overview

### 9.1 First practical viewport

The first practical viewport follows this Product priority:

1. shared Grow Companion Session shell;
2. active Session status;
3. Germination as canonical current and viewed phase;
4. elapsed Germination hours and ordinal phase day;
5. method identity and KAN or TRā Unit where applicable;
6. current method-specific workflow state;
7. authorized next operational action;
8. estimated method timing with source and estimate meaning;
9. germinated-versus-total count;
10. overall Germination rate;
11. compact partition or method-position progress;
12. actionable supply warning where applicable; and
13. one contextual Session update action.

This is an information-priority contract, not a component tree. Presentation
may combine or reflow concepts while preserving their order, meaning, and
availability.

### 9.2 Operational action policy

The primary action is the highest-priority currently authorized
method-specific Germination operation supplied by canonical workflow state.
Examples of Product roles include recording an authorized milestone, updating
position results, or reviewing a required unresolved result. This
specification does not create those operations or their eligibility.

If no authorized method action is supplied, Product shows no invented
substitute. In particular, `Review open tasks` does not become the primary
Germination action merely because Tasks exist.

The contextual Session update action enters the authorized Germination
evidence update experience. It remains distinct from Germination completion.

### 9.3 Not a generic Today dashboard

Overview is the method-aware operational surface for Germination. Tasks,
Events, Recent Activity, and Task/Event Chronology may provide supporting
context through their existing authority, but they do not replace:

- the Germination roadmap;
- current method milestone;
- seed-group or position evidence;
- elapsed Germination context;
- result progress; or
- the next Germination operation.

## 10. Workflow, Metrics, and Widget Participation

Every metric or visualization consumes an authorized read model. Product and
Presentation do not calculate competing analytics or increase evidence
precision.

| Experience element | User question | Product role and priority | Placement | Replaceable Presentation form |
|---|---|---|---|---|
| Elapsed Germination time | How long has Germination been active? | Primary orientation from canonical commencement | First viewport | Duration, compact timer, or labeled metric |
| Ordinal Germination day | Which phase day is this? | Human-readable companion to elapsed hours | First viewport | Day label or compact metric |
| Method roadmap | What is the method workflow? | Method-specific operational orientation, distinct from lifecycle | Current milestone first; full roadmap below fold or detail | Roadmap, steps, annotated illustration, or progress path |
| Estimated timing window | What timing is typical or currently estimated? | Sourced guidance or authorized deterministic estimate, never fact | First viewport when available | Range, interval, or contextual annotation |
| Current workflow milestone | Where am I in this method? | Highest-priority method state | First viewport | Status, highlighted step, or illustrated state |
| Next operational action | What can I do now? | One authorized owning operation | First viewport | Primary action or equivalent accessible control |
| Partition or position progress | Which groups are resolved? | Compact operational progress with route to full evidence | Compact first viewport; full detail destination | Grid, progress map, list, or diagram |
| Germinated versus total | How many seeds have germinated? | Primary factual result count | First viewport | Paired count or progress metric |
| Overall Germination rate | What proportion has germinated? | Authorized derived result | First viewport when supplied | Percentage, ratio, or progress visualization |
| Fair View | How do supported results compare without hiding provenance or Unknown evidence? | Secondary evidence interpretation from authorized GEE or result projection | Below fold or detail | Replaceable comparison visualization; not necessarily a graph |
| Source breakdown | How are results distributed by source? | Secondary authorized breakdown | Detail destination | Chart, table, or grouped list |
| Variety breakdown | How are results distributed by variety? | Secondary authorized breakdown | Detail destination | Chart, table, or grouped list |
| Seed-age evidence | What qualified age context applies? | Compact provenance-aware summary with full detail | Compact first viewport when material; full evidence detail | Label, range, structured summary, or grouped view |
| Completed summary | What was the final Germination outcome? | Historical orientation, never a replacement for the record | Completed first viewport | Summary metrics and route into full history |
| Supply status | Is applicable supply ready? | Actionable independent-inventory context | First viewport only when warning is actionable; otherwise supporting detail | Status, count, or warning callout |

The Germination roadmap is not a canonical lifecycle model, Task/Event
Chronology, or Session Conditions history. Fair View, rates, breakdowns,
confidence, and eligibility must come from an authorized owner. Missing output
is unavailable, not permission for Product calculation.

## 11. Local Destinations and Supporting Content

The Germination phase preserves the Grow Companion local destinations:

| Destination | Germination participation |
|---|---|
| Overview | Method workflow, primary action, compact evidence and progress, actionable supply, completion entry, and supporting detail routes |
| Tasks & Events | Existing private Task and Event reads and authorized owning operations; no Germination workflow substitution |
| Notes | Private Session Notes through the canonical Notes capability |
| Chronology | Timeline and Calendar adaptations of the one shared Task/Event temporal projection only |
| Photos | Already-authorized Session-contained Photos and access-safe review |
| Documents | Already-authorized Session-referenced Documents and access-safe review |

The following supporting content is reachable from Overview without requiring
another primary local destination:

- full KAN Seed Chart;
- TRā Seed Chart;
- method-equivalent evidence editor or historical evidence view;
- detailed workflow roadmap;
- full partition or position progress;
- Fair View;
- source and variety breakdowns;
- full seed-age and Vault provenance;
- completed Germination summary;
- Snapshot and sharing;
- contextual help and tutorials; and
- quiet Session-management actions.

Presentation may use in-page sections, focused detail routes, dialogs, drawers,
or other accessible forms. It must preserve Session and viewed-phase context
and provide an understandable return path.

Quiet Session-management actions must not compete with the current
method-specific action or Germination completion.

## 12. Notes, Photos, Documents, Snapshot, and Sharing

### 12.1 Notes

Private Session Notes remain intentionally authored narrative owned by Notes.
They are available through Notes and may be contextually previewed only when
authorized.

Notes:

- do not become Events or Chronology inputs;
- do not change Germination workflow or lifecycle state;
- are excluded from Snapshot and public content by default; and
- require a separate explicit public-content choice if later sharing authority
  permits any excerpt.

A private Note is never silently copied into a caption, Snapshot, Community
submission, social share, GEE input, or public profile.

### 12.2 Photos

The Product preserves access to existing Session images and the proven bounded
three-image Germination experience where already supplied. That ceiling is a
non-expansive Product participation constraint; it does not authorize upload,
capture, replacement, editing, deletion, storage, processing, a new viewer, or
a new gallery.

Photos remain canonical Photos. Their existing Session containment, identity,
privacy, lifecycle, and chronology remain controlling. If an authorized Photo
read is unavailable, Product does not recover images from Snapshot or public
copies.

Any future Photo mutation or expansion beyond the established bounded
participation requires separate Photo authority.

### 12.3 Documents

Documents may participate through their existing Session reference and the
Documents destination. CS-GS-001 defines no upload, attachment, editing,
deletion, storage, conversion, preview, viewer, or extraction operation.

### 12.4 Optional Snapshot generation

Grow Snapshot is an optional derived presentation of authorized Germination
evidence. It is not:

- a canonical Session record replacement;
- a lifecycle operation;
- a completion prerequisite;
- proof of publication;
- a Photo owner;
- GEE truth; or
- a source for reconstructing missing private evidence.

Snapshot generation may be offered during active Germination when enough
authorized content exists and after Germination completion. It must never
block evidence update, Germination completion, Complete Session, or Begin
Growing.

The grower deliberately selects authorized existing images and public-safe
fields. Private Notes are excluded by default. Any public grow caption is a
separate intentionally public value, not an implicit copy of private Notes.

### 12.5 Destination choices

The optional sharing step preserves three explicit choices:

1. **Social + Community Grow** — prepare an external-share result and submit a
   separately authorized Community contribution;
2. **Community Grow only** — submit only to the authorized Community moderation
   flow; and
3. **Social only** — generate a downloadable or externally shareable artifact
   without claiming a Community submission.

No destination is preselected. Generation alone shares nothing.

Community participation requires:

- explicit content review;
- privacy review;
- explicit consent;
- an explicit profile-attribution choice;
- moderation-safe pending, approved, rejected, and unavailable states; and
- confirmation from the Community owner before publication is represented as
  successful.

Profile attribution includes only the separately authorized public profile
identity. Missing consent or missing authorization never opts the grower in.

External sharing and download expose the generated artifact to the grower.
Opening a system share target does not prove that an external post succeeded.
For Social + Community Grow, the two outcomes remain independently
understandable; success or failure of one does not manufacture the other.

This specification defines Product placement and intent. Publication,
moderation, removal, consent persistence, external-platform integration, and
Snapshot persistence require their owning authority and future contract.

## 13. Completed Germination Composition

Completed Germination remains a full, durable historical record in the same
Session.

### 13.1 Completed first viewport

The completed first viewport prioritizes:

1. shared Session shell and current-phase orientation;
2. Germination identified as completed viewed history;
3. canonical commencement and completion chronology;
4. method and Unit context;
5. final germinated-versus-total count;
6. final authorized Germination rate;
7. compact position or group results;
8. qualified seed-age and Vault provenance summary;
9. completion confirmation and post-Germination decision status; and
10. routes to the complete evidence record.

If Growing is current, that fact remains visible while Germination is viewed.
Historical review never reactivates Germination or exposes active-only
operations.

### 13.2 Full historical record

The complete record preserves, where supplied and authorized:

- setup evidence;
- method and unit context;
- canonical Germination chronology;
- method workflow milestones;
- every seed group or method position;
- original and corrected result evidence;
- source, breeder, variety, type, sex, quantity, and acquisition evidence;
- stable Vault references and copied Session evidence;
- qualified seed-age evidence and provenance;
- final counts and authorized derived outputs;
- Fair View, source, and variety breakdowns when available;
- private Notes through Notes;
- existing Photos through Photos;
- existing Documents through Documents; and
- optional Snapshot and sharing status through their owners.

A completed summary or Snapshot may orient the grower but cannot replace this
record.

Current supply inventory is not historical Germination evidence. If shown
while reviewing completed Germination, it must be labeled as current
independent inventory and must not imply the count that existed at completion.

### 13.3 Correction

Completed history is read-only by default. Where an owning capability supplies
an authorized correction operation, Product may route to it while preserving:

- original evidence;
- corrected evidence;
- attribution;
- reason;
- chronology; and
- downstream recalculation or reconciliation status.

Viewing or correcting evidence does not reopen Germination, change current
phase, restore Vault inventory, or restore supply inventory.

## 14. Germination Completion and Growing Transition

### 14.1 Separate Product operations

The experience keeps these operations separate:

1. **Update Germination** — save authorized active evidence without completing
   the phase.
2. **Validate final results** — review method positions and identify missing,
   invalid, or inconsistent outcomes.
3. **Complete Germination** — invoke the authorized lifecycle completion
   operation.
4. **Confirm completion** — present the confirmed completed record and the
   explicit next decision.
5. **Complete Session** — invoke only the existing bounded Germination-only
   Session completion operation authorized by IC-GC-002C.
6. **Begin Growing** — enter and complete the separately authorized transition
   into Growing.

The legacy label **Complete Session** is retired wherever the operation merely
means completing Germination. That action is labeled and understood as
**Complete Germination**.

### 14.2 Final-result validation

Before Complete Germination becomes available:

- every participating group or physical position has a final result;
- result quantities are whole and non-negative;
- germinated quantity does not exceed started quantity;
- single-seed physical positions resolve to `0` or `1`;
- aggregate counts reconcile with position evidence;
- required owner operations are not pending or failed; and
- unresolved final truth is identified rather than defaulted.

Validation does not calculate GEE analytics or make the phase complete.

### 14.3 Completion outcome

A confirmed Complete Germination result:

- concludes Germination;
- makes Germination complete;
- preserves its record as durable history;
- does not make Growing current;
- does not establish Growing commencement;
- does not preselect the next decision; and
- does not require Snapshot generation.

A failed completion attempt leaves Germination active unless the lifecycle
owner supplies another canonical result. An uncertain outcome becomes
reconciliation required and must not be resubmitted under a new logical
identity.

### 14.4 Post-Germination decision

After completion, Product presents no preselected outcome.

**Complete Session** appears only when canonical lifecycle authority supplies
the existing eligible Germination-only Session completion operation authorized
by IC-GC-002C. FN-004 remains higher Foundation authority, and FN-007 continues
to govern the separation between Germination completion and intentional
**Begin Growing**.

This bounded Complete Session path means overall completion of a
Germination-only Session. It is not generalized Session termination,
abandonment, a Reflection bypass for another Session path, automatic Growing
activation, or a substitute for Begin Growing.

**Begin Growing** is an intentional continuation choice. Selecting it may open
authorized Growing setup, but opening, viewing, or partially completing setup
does not make Growing current.

The final authorized Begin Growing operation must establish one coherent
lifecycle outcome under FN-006 and FN-007:

- intentional continuation is confirmed;
- Growing becomes canonical current phase;
- canonical Growing commencement is established;
- completed Germination remains durable; and
- the lifecycle relationship remains coherent.

CS-GS-001 does not define Growing setup fields, Session Conditions declaration,
transition technology, or Growing implementation.

## 15. Experience States

The Germination Product preserves these distinct meanings:

| State | Product meaning |
|---|---|
| Loading | Required authorized reads or operation status are pending; no unconfirmed value or action eligibility is asserted |
| Empty | An authorized read succeeded with no qualifying records |
| Unavailable | A capability or required context cannot currently be supplied |
| Not applicable | Canonical applicability excludes the capability for this entry path, method, phase, or state |
| Unresolved | Required canonical truth does not exist or cannot be authoritatively reconstructed |
| Access-safe unavailable | Product withholds restricted existence or detail and presents only the safe unavailable result |
| Operational error | An owning read or operation failed; empty, unresolved, or success is not claimed |
| Reconciliation required | A coordinated canonical outcome is partial, inconsistent, or uncertain and requires owner-authorized resolution |
| Completed historical state | Germination is durable history, remains reviewable, and exposes no active-only authority |

### 15.1 State rules

- Empty Seed Vault results do not mean the Vault is unavailable.
- Unavailable Vault or supply reads do not mean zero inventory.
- Not-applicable supply does not mean supply count is zero.
- Unknown seed age does not mean Track Seed Age is disabled.
- Disabled Track Seed Age does not create a young-seed fact.
- A failed update does not complete Germination.
- A failed Snapshot does not fail Germination completion.
- Missing scenario fixtures create no Product state or authority.
- Previously confirmed values may be shown only when clearly labeled as
  previously confirmed and not current.
- One unavailable supporting capability does not invalidate the Session or
  unrelated authorized destinations.

## 16. Product and Presentation Boundary

### 16.1 Product authority established here

CS-GS-001 may govern:

- information hierarchy;
- phase-aware capability participation;
- method-aware setup and workflow meaning;
- progressive disclosure;
- Product thresholds and warning severity;
- placement of reads and authorized action routes;
- first-viewport priority;
- completed-history meaning;
- responsive information priority;
- experience-state distinctions; and
- the separation of active, historical, and transition contexts.

### 16.2 Presentation freedom

Presentation retains authority over:

- exact page and component anatomy;
- pixel layout and responsive breakpoints;
- typography values;
- color, elevation, and visual styling;
- imagery and illustration treatment;
- motion and animation;
- controls and gesture realization;
- accessible responsive reflow;
- DOM structure;
- framework components; and
- final image assets.

The approved Concept 02 shell and visual direction remain the design reference.
Presentation may improve hierarchy, density, readability, discoverability, and
polish without changing Product meaning.

Desktop, tablet, mobile, zoomed, and assistive-technology experiences consume
the same canonical and Product model. Responsive adaptation must not:

- remove evidence or an authorized operation solely because of viewport size;
- make a historical phase appear current;
- hide warning or provenance meaning behind color alone;
- flatten method-specific workflow into a generic dashboard;
- create a device-specific truth model; or
- make a summary replace the full record.

## 17. Explicit Non-Goals

CS-GS-001 does not define or authorize:

- database schema, SQL, fields, constraints, triggers, or migrations;
- API, RPC, event, message, or storage payloads;
- transaction, retry, compensation, locking, or concurrency technology;
- idempotency storage;
- implementation sequencing;
- test code or fixtures;
- deployment behavior;
- final visual design;
- CSS, DOM, framework, or component implementation;
- GEE formulas, buckets, thresholds, confidence, or eligibility;
- automatic legacy backfill or reconstruction;
- a new Session, phase, lifecycle, or chronology model;
- a global contextual-action prioritization algorithm;
- a generic Today dashboard for Germination;
- a second Task/Event projection;
- supply inventory inside Session Conditions, Today, Recent Activity, Tasks,
  Events, Timeline, or Calendar;
- general Seed Vault editing inside the Session;
- a reservation capability;
- automatic Vault or supply restoration from lifecycle state;
- Photo upload, capture, replacement, editing, deletion, storage, viewer, or
  gallery behavior;
- Document upload, editing, deletion, storage, conversion, viewer, or
  attachment behavior;
- new Reflection eligibility, start, editing, or completion operations;
- automatic Snapshot generation or sharing;
- automatic public inclusion of private Notes;
- publication without consent and moderation;
- Growing setup fields or Growing implementation; or
- implementation of any behavior described by this Product composition.

CS-GS-001 does not redefine FN-008, CS-GC-008, Session Lifecycle, phase
commencement, Session Conditions, Seed Vault ownership, supply inventory
ownership, GEE ownership, or any existing capability authority.

## 18. Dependencies and Deferred Authority

### 18.1 Governing dependencies

Any future implementation must preserve:

- FN-008 evidence, inventory, coordinated-operation, and reconciliation
  invariants;
- CS-GC-008 one-Session shell and capability coordination;
- FN-006 commencement chronology;
- FN-007 intentional Growing transition;
- AR-GC-003-02 Event independence;
- one shared Task/Event temporal projection;
- Notes independence and privacy;
- Photo and Document context limits;
- GEE ownership of analytics; and
- Presentation replaceability.

### 18.2 Intentionally deferred authority

The following remain outside CS-GS-001:

- physical transaction and recovery mechanisms;
- data representation and migration;
- exact lifecycle command contracts;
- missing Photo or Document mutations;
- Community publication, moderation, and removal contracts not already
  authorized;
- external social-platform integration;
- new Snapshot persistence;
- new GEE outputs or Fair View formulas;
- new method taxonomies beyond the initial preserved set;
- new supply types or method applicability;
- Growing setup composition; and
- implementation and visual design.

An implementation contract must stop and request the required higher-order or
capability authority if any of these is necessary for its bounded slice.

## 19. Future Implementation Contract Boundary

After CS-GS-001:

1. passes a formal read-only Architecture Review;
2. receives owner approval;
3. completes repository-safety verification; and
4. enters committed repository history,

one bounded Implementation Contract is required to define the obligations needed
to realize the approved Germination Product composition. No production
implementation governed by CS-GS-001 may begin before that contract is
governance-complete and committed.

For every implementing slice in its scope, that future contract must govern:

- the authorized canonical owner reads and operations, including their
  eligibility, requested outcomes, and confirmed results;
- the logical domain-transaction boundary and the physical implementation
  transaction or coordination boundary;
- one stable logical-operation identity across every required owner;
- idempotency for the original logical operation;
- concurrency behavior and authoritative revalidation at commitment;
- Seed Vault deduction through the authorized Vault owner operation;
- consumable-supply consumption through the authorized supply owner operation;
- authorized reversal and restoration, including their attributable canonical
  meaning;
- the prohibition on inferring or performing restoration from Session
  lifecycle state alone;
- retry under the original logical-operation identity rather than a new
  logical Save;
- partial failure, uncertain completion, and reconciliation behavior;
- compatibility for current and legacy Sessions, Vault references, copied
  evidence, quantities, supply records, and operation history;
- representation decisions required by the bounded implementation;
- an authorized migration decision or an explicit no-migration decision;
- an explicit stop rule when prerequisite authority, authoritative
  reconstruction, or safe compatibility is absent;
- security, authorization, privacy, and access-safe behavior; and
- verification obligations for successful, failed, repeated, concurrent,
  partial, uncertain, legacy, unauthorized, and access-safe outcomes.

CS-GS-001 continues to define only:

- required Product outcomes;
- canonical responsibility boundaries;
- Product-to-owner delegation boundaries; and
- mandatory obligations for the future contract.

It does not prescribe schema, SQL, API shapes, transaction technology,
compensation technology, idempotency storage, concurrency mechanisms, migration
mechanics, test code, or implementation sequencing.

The future contract must preserve method-aware setup and active/historical
composition, Vault reference plus copied Session evidence, qualified seed-age
evidence, the approved KAN filter-paper Product policy, completion and Begin
Growing separation, and testable Presentation inputs with visual-design
freedom.

It may not create missing Foundation, Product, lifecycle, capability, sharing,
analytics, migration, mutation, or restoration authority. It may not authorize
work outside the Germination boundary.

CS-GS-001 itself is not implementation-ready authority.

## 20. Product Invariants

1. One Germination experience belongs to one canonical Session and one Grow
   Companion.
2. Germination Setup is coordination, not a canonical aggregate owner.
3. Seed Session and direct Grow Session entry remain distinct entry paths.
4. Method-specific workflows are preserved and not flattened into a generic
   form or Today dashboard.
5. Save Session is one Product action with one logical coordinated outcome.
6. Session, Vault, supply, lifecycle, capabilities, and GEE retain independent
   ownership.
7. Vault reference and copied Session evidence remain simultaneously visible
   and semantically distinct.
8. Provisional Vault assignment is neither reservation nor deduction.
9. Duplicate Vault use is validated in aggregate and cannot over-allocate.
10. Track Seed Age never invents a fallback age.
11. Same and Mixed modes preserve structured reference, precision, provenance,
    and Unknown meaning.
12. Filter-paper inventory is initially applicable only to KAN.
13. Reorder never means replenished.
14. Depleted applicable inventory blocks KAN Save until canonical quantity is
    resolved.
15. Tasks, Events, Notes, Photos, Documents, Chronology, and Session Conditions
    remain independent.
16. The Germination workflow roadmap is not lifecycle chronology or Task/Event
    Chronology.
17. The primary Germination action is never invented from generic workspace
    content.
18. Completed Germination remains complete, durable, and fully reviewable.
19. Complete Germination does not complete the Session or begin Growing.
20. Begin Growing is intentional, separate, and lifecycle-owned.
21. Snapshot and sharing are optional and never block lifecycle operations.
22. Private Notes never become public by default.
23. Empty, unavailable, not applicable, unresolved, operational error, and
    reconciliation required remain distinct.
24. Product owns no canonical persistence or analytical formula.
25. Presentation remains replaceable and retains meaningful design freedom.

## 21. Review Acceptance Criteria

A formal Architecture Review may return PASS only if it confirms that:

1. the complete Germination experience is bounded within one Product
   Composition artifact;
2. FN-008 and CS-GC-008 remain unmodified and governing;
3. every canonical owner retains its truth and operations;
4. method-aware setup, active operation, completed history, completion, and
   transition are compositionally complete;
5. Track Seed Age preserves qualified evidence, Unknown, precision, and
   provenance;
6. Add from My Seed Vault preserves reference, copied evidence, quantity
   integrity, and Session/Vault independence;
7. filter-paper policy is explicit without transferring inventory ownership;
8. the active first viewport preserves Germination workflow priority;
9. local destinations preserve capability independence and one temporal
   projection;
10. Notes, Photos, Documents, Snapshot, privacy, and sharing do not acquire
    unsupported mutation or publication authority;
11. Germination completion and Begin Growing remain separate;
12. all required experience states remain distinguishable;
13. no implementation, migration, formula, schema, or final visual design is
    authorized; and
14. no unresolved Product decision is delegated silently to Presentation or
    implementation.

## 22. Decision History

- July 28, 2026 — Proposed as the bounded Product Composition Specification
  authorized after FN-008 completed Foundation governance and repository
  closure. The artifact preserves proven Germination value while establishing
  method-aware hierarchy, explicit evidence and inventory participation,
  active and completed composition, intentional completion and transition, and
  Presentation freedom. Formal read-only Architecture Review and owner
  approval remain required. No implementation, migration, contract execution,
  or visual-design execution is authorized.
