# IC-GC-002C — Session Entry & Growing Foundation

**Status:** Draft — Requires Architecture Approval

**Scope:** Session Entry / Seed Session / Grow Session / Growing initialization / Growing evidence ownership / Growing Summary / Growing workspace

## 1. Purpose

This contract defines the canonical architecture for entering one user-owned Session and initializing its Growing phase.

It establishes two approved Session entry paths, the minimum structural responsibilities of Growing, the ownership boundary of Growing evidence, the Plant Group model, reference-versus-observed timing, the Growing Summary, and the Growing workspace.

This is an implementation contract only. It does not implement application behavior, approve a database representation, or authorize later lifecycle capabilities.

## 2. Foundation Authority

This contract derives authority from:

1. [FN-001 — Growing Conditions](../foundation-notes/FN-001-growing-conditions.md)
2. [FN-003 — Canonical Entities & Representation](../foundation-notes/FN-003-canonical-entities-and-representation.md)
3. [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../foundation-notes/FN-004-session-lifecycle-and-grow-companion.md)
4. [Grow Companion Composition Specification](../../product/grow-sessions/grow-companion-composition-specification.md)
5. [IC-GC-002A — Session Context Foundation](./IC-GC-002A-session-context-foundation.md)
6. [IC-GC-002B — Grow Companion Structural Foundation](./IC-GC-002B-grow-companion-structural-foundation.md)

If authorities conflict, precedence is:

```text
Foundation Notes
↓
Grow Companion Composition Specification
↓
Implementation Contract
↓
Implementation
```

Higher-level architecture always prevails. This contract must not silently resolve a decision that remains outside its approved scope.

FN-001 establishes Growing Conditions as optional Session-level context and does not by itself authorize a final taxonomy or schema. The approved resolution recorded in this contract establishes only the bounded Grow Context vocabularies in Section 6.1. FN-003 requires canonical ownership, durable provenance, and no parallel models. FN-004 establishes one continuous Session, Growing as a canonical phase, phase-owned evidence, and the boundary between user evidence, deterministic context, Reflection, GEE, and Seed Vault knowledge. The Composition Specification governs Grow Companion composition. IC-GC-002A retains ownership of deterministic Session Context and evidence-readiness projections. IC-GC-002B supplies the persistent shell, independent current/viewed/lifecycle states, historical review, and Germination regression lock inherited by this contract.

## 3. Repository Baseline

At contract creation:

- the canonical repository architecture recognizes Germination, Growing, and Reflection as phases of one Session;
- Germination is the protected reference composition;
- the persistent Grow Companion shell and phase-state foundation are governed by IC-GC-002B;
- the existing Growing workspace partially composes Capability 1 Tasks, Events, Upcoming Tasks, and Recent Activity;
- this contract resolves the bounded Growing initialization, Grow Context vocabularies, Plant Group evidence, phase-summary content, and workspace ownership required for the next implementation slice, while scheduling, notes, observations, images, hero content, and timeline behavior remain deferred; and
- the working tree contains pre-existing changes outside this deliverable.

Existing implementation is a compatibility baseline, not architecture authority. This documentation task authorizes no application, schema, migration, test, asset, or runtime change. A later ICE may implement only the bounded Session Entry and Growing foundation approved by this contract.

## 4. Scope

This contract defines only:

1. Session Entry;
2. Seed Session entry;
3. Grow Session entry;
4. Growing initialization;
5. Growing evidence ownership, canonical persistence, and the Plant Group model;
6. reference timing and observed timing boundaries;
7. the deterministic Growing Summary; and
8. the Growing operational workspace and its capability ownership boundaries.

The implementation must reuse one canonical Session, the IC-GC-002B Grow Companion shell and phase model, canonical information owners, and existing security and compatibility boundaries.

## 5. Canonical Session Entry Model

A Session begins through exactly one approved entry path selected deliberately by the user:

- **Seed Session** — begins with Germination;
- **Grow Session** — begins with Growing.

“Seed Session” and “Grow Session” describe Session entry paths. They do not create separate top-level Session systems, persistence authorities, ownership models, or incompatible Session objects. After entry, both remain one canonical user-owned Session governed by the same platform architecture.

The selected entry path determines the first included phase and initial canonical current phase. It does not change the meaning or ownership of any included phase.

A Session records only evidence generated or deliberately recorded within that Session. Grow must not fabricate, backfill, infer, rename, or synthesize evidence for a phase that the Session did not include.

### 5.1 Seed Session

A Seed Session:

- includes Germination as its entry phase;
- begins with Germination as the canonical current phase;
- uses the complete protected Germination composition governed by IC-GC-002B;
- may continue into Growing within the same Session through an approved lifecycle transition; and
- preserves completed Germination in full when Growing becomes current.

Seed Session entry must not create a second Session when the lifecycle advances to Growing.

### 5.2 Grow Session

A Grow Session:

- includes Growing as its entry phase;
- begins with Growing as the canonical current phase;
- does not fabricate a Germination phase record, result, duration, completion event, or Germination evidence;
- does not represent Germination as completed when Germination was not included; and
- initializes only the Growing evidence and workspace authorized by this contract.

For a Grow Session, Germination is omitted. The phase navigator may present Germination as **Not included**, and Germination navigation is disabled. Omitted is distinct from completed. An omitted Germination phase cannot become current or viewed, cannot be activated or completed, and cannot create records, evidence, timestamps, milestones, results, summaries, or workspace content. This omitted-phase presentation is a deterministic projection of the Session entry path, not an evidence record.

### 5.3 Entry Selection Boundary

One neutral Session Entry decision must appear once, before phase-specific setup:

- **Seed Session** — Begin this Session with Germination.
- **Grow Session** — Begin this Session with Growing.

Neither option is recommended or visually preferred. No option is selected by default. The user must deliberately choose one entry path, and the Seed/Grow choice must not be repeated inside the phase-specific setup form.

After selection, Seed Session continues into the existing Germination Method selection flow. Grow Session routes directly into the Growing phase shell.

Before the first successful canonical Session creation, the user may change the selected entry path. After creation, Session Entry is immutable: Seed Session cannot become Grow Session, Grow Session cannot become Seed Session, and editing an existing Session must not expose or persist an entry-path change. An entry-path change must never clear, replace, reinterpret, or fabricate phase evidence. Any future conversion or correction workflow requires a separate architecture contract.

Entry selection establishes the Session's starting phase only. It must not:

- choose a future Reflection path;
- create evidence;
- infer earlier-phase outcomes;
- select Growing environment or method values;
- pre-populate observed timing as fact;
- bypass owner authorization, Preview Studio restrictions, or demo safeguards; or
- create a parallel Session-entry persistence system.

### 5.4 Entry Persistence, Legacy Compatibility, and Route State

Session Entry is persisted on the canonical Session as one nullable discriminator:

- `seed` — the Session begins with Germination;
- `grow` — the Session begins with Growing;
- `null` — the legacy Session was created before Session Entry metadata existed.

The discriminator is not a second lifecycle authority. Entry path, canonical current phase, viewed phase, and phase lifecycle state remain independent.

A legacy Session with `null` entry metadata retains its existing historical behavior and is not rewritten, backfilled, or semantically labeled as a Seed Session. Compatibility logic may preserve its existing Germination-first experience only through an explicit legacy compatibility boundary; it must not normalize `null` to `seed` or assert Germination entry as a new architectural fact.

A direct internal route may carry the selected entry path into Session creation as presentation state only. Route state cannot create a Session by itself, bypass canonical validation or authorization, or change an existing Session's entry path. Malformed or absent route state must fail safely. Exact URL naming is an implementation detail.

## 6. Growing Initialization

Growing is an independent operational phase within the same Session and persistent Grow Companion.

Growing begins with one Growing-owned setup step followed by one editable Growing evidence chart. The same setup applies when:

- a Grow Session begins directly in Growing; or
- a Seed Session enters Growing after Germination.

Growing initialization must establish:

- the included Growing phase record;
- Growing as the canonical current phase when entered directly or activated through lifecycle transition;
- independent Growing timing, progress, and completion state;
- Grow Context owned by the Growing phase;
- an initially valid Growing evidence surface that does not fabricate evidence;
- the Growing Summary projection location above the chart; and
- the reserved Growing workspace location below the chart.

For a Seed Session, Growing initialization must preserve completed Germination in full and must not rename or copy Germination evidence into Growing. For a Grow Session, initialization must not create a placeholder Germination record.

Growing setup must never infer values from Germination. Initialization distinguishes user-entered or observed evidence from optional reference knowledge, plans, estimates, deterministic context, and system state. Missing Growing evidence remains missing; it must not be filled from Germination or Seed Vault reference values.

### 6.1 Grow Context

Growing owns two distinct context fields:

- **Environment Type** — where the plants are grown;
- **Grow Method** — the cultivation medium or system.

Both fields remain independent from Germination Method and must not reuse or rename Germination evidence.

The initial approved Environment Type vocabulary is:

- Indoor;
- Outdoor;
- Greenhouse;
- Protected Outdoor;
- Mixed;
- Other.

The initial approved Grow Method vocabulary is:

- Soil;
- Living Soil;
- Coco;
- Hydro;
- DWC;
- RDWC;
- Rockwool;
- NFT;
- Aeroponic;
- Raised Bed;
- Container;
- Other.

For either vocabulary, **Other** may retain attributable user-authored Session text. User-authored text must not automatically create a new global canonical term.

## 7. Growing Evidence Model

Growing owns evidence produced through Growing activity. Its evidence remains part of the canonical Session and retains authorship, timestamps, provenance, privacy, correction history where approved, and relationships to canonical People, Entities, and knowledge references.

Growing evidence must never be inferred from Germination. Germination source, variety, result, timing, partition, or method data may be displayed as preserved prior-phase context only where authorized; it must not silently become Growing evidence.

Growing maintains its own:

- evidence records;
- observed timing;
- progress state;
- completion state; and
- complete historical phase record.

No later phase may infer, rename, overwrite, or recalculate Growing evidence. Deterministic projections may be recalculated from canonical evidence without mutating that evidence.

### 7.1 Canonical Growing Persistence

Approved Growing evidence uses one canonical relationship:

```text
Canonical Session
→ zero or one Growing Phase Record
→ zero or more Plant Group Records
```

A Growing Phase Record:

- belongs to exactly one canonical Session and is unique per Session;
- owns the approved Grow Context;
- contains no Germination evidence; and
- contains no deferred timing, harvest-event, workspace, Reflection, or GEE data.

Opening, activating, or viewing Growing must not create a Growing Phase Record or Plant Group automatically. The Growing Phase Record is created only after the owner intentionally saves valid Growing evidence.

Each Plant Group Record:

- belongs to exactly one Growing Phase Record;
- owns one approved Plant Group;
- uses one immutable internal identifier independent from its editable label and display order; and
- contains only the Plant Group evidence approved by this contract.

Editing a label or reordering rows must not replace Plant Group identity. Deleting one Plant Group must not alter another Plant Group's identity.

Growing evidence must not be stored in Germination Partitions, snapshot state, Session notes, Session images, Tasks, Events, Seed Vault records, an unrelated or miscellaneous Session field, or a local-only evidence store.

Local, demo, scenario, and cloud representations must map losslessly to this same logical model, ownership, stable identity, and validation boundary. Their technical representation may differ, but no separate local evidence contract is authorized.

## 8. Editable Growing Chart and Plant Groups

Growing owns one editable chart as the canonical evidence surface for the phase. Opening or activating Growing must not fabricate chart rows.

The chart follows the established flexible-row interaction principles of Germination Other Method:

- rows are directly editable by the owner;
- rows may be added;
- rows may be removed; and
- totals are deterministic projections of eligible row evidence.

This inheritance governs interaction principles only. The Growing chart must not reuse, rename, or mutate Germination records, Germination Partitions, or Germination-specific evidence semantics. No duplicate Growing evidence-entry surface is authorized.

Each Growing chart row represents one **Plant Group**, not a Germination Partition. A Plant Group represents one or more plants within the Session that share the recorded characteristics of the group at that time. Grouping organizes attributable Growing evidence; it does not assert that the plants are biologically identical.

### 8.1 Plant Group Fields

The approved user-facing chart fields are:

- **Plant**;
- **Source**;
- **Variety**;
- **Type**;
- **Sex**;
- **Number of Plants**;
- **Harvested**.

#### Plant

**Plant** is the user-facing row or group label. The permanent internal Plant Group identifier must remain stable and independent from that editable label. The identifier's representation and persistence remain deferred.

#### Source

Source must use the existing canonical Source identity system. The chart must not automatically create duplicate canonical Source records. Unknown or unresolved values may follow existing repository identity conventions while retaining attribution and without being promoted automatically into a global canonical term.

#### Variety

Variety must use the existing canonical Variety and Seed Vault identity systems. The chart must not automatically create duplicate canonical Variety records. Unknown or unresolved values may follow existing repository identity conventions while retaining attribution and without being promoted automatically into a global canonical term.

#### Type

Type describes how the plants entered the Growing phase. Its initial approved vocabulary is:

- Seed;
- Seedling;
- Clone;
- Cutting;
- Established Plant;
- Other.

Type must not fabricate or imply Germination evidence.

#### Sex

The initial approved Sex vocabulary is:

- Unknown;
- Feminized;
- Female;
- Male;
- Regular;
- Other.

Unknown remains a valid state. Sex must not be inferred automatically.

#### Number of Plants

Number of Plants is a positive whole-number count owned by the Plant Group and explicitly entered or confirmed as Growing evidence. It must never be inferred from seeds started, germinated seeds, Germination Partitions, or Germination completion totals.

For a Seed Session entering Growing, Germination counts may be presented only as orientation; the user must explicitly enter or confirm the plants entering Growing. For a Grow Session, the chart begins without Germination evidence.

#### Harvested

Harvested is a checkbox representing full harvest of the entire current Plant Group row. It must not silently represent partial harvest or define a Harvest workflow.

Partial-harvest interaction, Plant Group splitting or merging, lineage presentation, count-correction behavior, harvest dates, harvest events, yield capture, and post-harvest processing remain deferred. A future data model must not prevent partial-harvest lineage, but this contract does not define its implementation.

## 9. Reference Timing and Observed Timing

Growing distinguishes:

- **Reference timing** — non-observed knowledge presented for orientation and potentially sourced from canonical Seed Vault knowledge;
- **Observed timing** — attributable Session evidence recording what actually occurred during Growing.

Growing may own Session reference fields for:

- **Expected Vegetative Time**;
- **Expected Flowering Time**.

When a selected Variety is linked to a Seed Vault entry containing either value, Grow may initialize the corresponding Session reference field from that entry. Missing values remain empty, and Grow must not fabricate timing estimates.

Reference timing:

- remains owned by Seed Vault as the canonical knowledge source;
- retains source and provenance when represented on the Session;
- may be adjusted by the owner for that Session without altering the Seed Vault source;
- is not observed Session evidence;
- must be distinguishable from user-authored plans, deterministic estimates, observations, and outcomes; and
- must not initialize observed dates or durations automatically.

Reference knowledge must never initialize, replace, correct, or overwrite observed Session evidence automatically. Session reference changes must never overwrite or silently update Seed Vault knowledge.

Observed timing:

- is owned by the Growing phase record;
- is created through attributable Session activity;
- remains distinct from estimates, plans, and reference values; and
- may inform deterministic summaries without being overwritten by them.

Observed evidence must never overwrite or silently update Seed Vault knowledge. Any future owner-confirmed knowledge update or synchronization requires a separate approved contract.

Exact storage, units, range representation, and normalization for expected timing remain implementation-blocking when no approved repository convention exists. An implementation must report that gap rather than invent a permanent timing contract. Actual vegetative and flowering duration calculations, timing comparisons, conflict handling, observed-timing fields, and correction policy remain deferred.

## 10. Growing Summary

Growing owns a phase summary located above the Growing chart within Grow Companion and derived deterministically from canonical Growing evidence.

The Growing Summary:

- presents only attributable Growing evidence and approved deterministic calculations;
- introduces no duplicate data entry or separate evidence store;
- remains a projection rather than an evidence-entry surface or authoritative record;
- must not replace the editable chart, workspace, or complete Growing record;
- must distinguish missing evidence from zero, failure, or a negative outcome;
- must not import Germination evidence as Growing evidence;
- must not perform GEE interpretation, diagnosis, prediction, recommendation, or knowledge distillation; and
- must remain reproducible from the same eligible canonical inputs and approved rules.

The next bounded implementation slice may display only values supported by implemented evidence:

- Environment Type;
- Grow Method;
- Plant Count;
- Harvested Count;
- available expected timing.

It must not create a Growing Success percentage, fabricated actual timing, or unsupported estimates. Advanced summary fields, eligibility, calculations, empty states, and presentation remain deferred.

Session-level identity, overview, ownership, lifecycle, and other Session-wide information remain outside the Grow Companion phase composition and must not be duplicated into the Growing Summary as a second authority.

## 11. Growing Workspace

The composition area below the Growing chart is the reserved phase location for future Growing operational capabilities:

- Tasks;
- Events;
- Calendar;
- Notes;
- Photos;
- Documents.

This contract establishes location and phase-composition ownership only. The next bounded implementation slice must not implement or redefine these capabilities.

- Tasks and Events must reuse the canonical private records governed by Capability 1.
- Calendar must be a future projection of canonical scheduling information and must not become a parallel calendar, Task, or Event system.
- Notes must reuse or extend the canonical Session evidence model under a separately approved contract.
- Photos must preserve canonical image ownership, privacy, attribution, and evidence boundaries under a separately approved contract.
- Documents require a separately approved evidence, ownership, privacy, and security contract before implementation.

The workspace must not become a collection of unrelated utilities, a second Grow Companion, or an evidence store. Each composed module retains one canonical information owner.

Capability-specific forms, storage, scheduling behavior, calendar behavior, reminders, attachments, document handling, limits, sharing, and notifications remain outside this contract.

## 12. Reflection and Downstream Boundary

Reflection is outside this contract.

For purposes of responsibility separation, Reflection owns the future structured subjective evidence produced during intentional final Session review. It does not automatically own trusted or canonical knowledge and must not rewrite Growing evidence.

This contract does not define or authorize:

- Reflection composition or fields;
- Session Reports;
- GEE eligibility, confidence, interpretation, or output;
- knowledge distillation;
- Seed Vault synchronization or automatic updates;
- final knowledge-writing behavior; or
- AI interpretation.

Any future movement from observed Session evidence toward interpreted or preserved knowledge must retain lineage and proceed through separately approved GEE, Reflection, knowledge-distillation, and Seed Vault boundaries.

## 13. Canonical Rules

- Growing owns Growing evidence.
- Germination owns Germination evidence.
- A Plant Group is a Growing evidence record and must not be implemented as, renamed from, or inferred from a Germination Partition.
- Seed Vault owns reference knowledge presented to the Session.
- Sessions own observed evidence.
- Reflection owns future structured subjective final-review evidence, not automatic trusted knowledge.
- GEE owns evidence interpretation and knowledge-distillation authority.
- Each capability retains one canonical information owner.
- No capability may duplicate or replace another capability's responsibility.
- No parallel Session, phase, chart, Source, Variety, or evidence system is authorized.
- Evidence belonging to one phase must never be inferred, renamed, overwritten, or recalculated as evidence by another phase.
- Growing evidence has dedicated canonical persistence: each Session has at most one Growing Phase Record, and Plant Groups are its child evidence records.
- Plant Group identity is stable and independent from its label, display order, and the identity of every other Plant Group.
- Opening or viewing Growing does not create evidence.
- Local and cloud behavior represent the same canonical Growing model without a parallel evidence contract.
- Deterministic summaries are projections from canonical evidence and must not mutate, replace, or become a second entry surface for that evidence.
- A phase omitted by the selected Session entry path has no fabricated evidence or completed phase record.
- One Session and one Grow Companion persist across all included phases.

## 14. Security, Privacy, and Compatibility

This contract changes no existing authorization, ownership, RLS, privacy, sharing, Preview Studio, demo, QA, scenario, or production-data boundary.

- Session Entry and Growing remain owner-authorized.
- Entry selection and viewed-phase state introduce no new write path outside approved Session operations.
- Preview Studio continues blocking writes.
- Demo and scenario state remains non-persistent unless governed by an approved local-only fixture system.
- Demo, QA, and scenario contexts must not spill into production or public data.
- Structural or workspace navigation must not create unauthorized backend mutations.
- Plant Group, timing, summary, and workspace information must not expose another owner's private evidence.
- Existing Tasks and Events retain Capability 1 ownership and authenticated-owner-only access.
- No public visibility, sharing, grant, RLS, service-credential, or anonymous-access change is authorized.

Existing Sessions remain compatible:

- existing Seed-origin Sessions retain their complete Germination records and lifecycle history;
- existing Sessions must not be relabeled destructively or assigned fabricated entry evidence;
- absent entry metadata must not be guessed from incomplete evidence;
- a legacy Session with absent entry metadata retains its existing behavior through an explicit compatibility boundary and remains unclassified;
- legacy compatibility must preserve Session identity, owner, privacy, phase evidence, routes, and current behavior; and
- compatibility must not create a duplicate Session, phase record, chart, evidence store, or workspace.

Existing Sessions without Growing evidence remain valid, receive no backfill or rewrite, are not treated as containing recorded zero values, and create no Growing Phase Record or Plant Group automatically. Seed Session, Grow Session, and legacy compatibility behavior remain unchanged.

No destructive legacy classification or backfill is authorized. A later approved ICE may add only the minimum schema and migration needed for the nullable canonical Session entry discriminator in Section 5.4 and the dedicated Growing persistence model in Section 7.1. Growing evidence inherits ownership through its canonical Session and remains private. Required constraints and ownership-preserving security may be added for these records, but unrelated RLS, grants, policies, ownership, publication behavior, or credentials must not change.

## 15. Non-Goals

This contract does not define or authorize:

- Reflection;
- Session Reports;
- GEE behavior;
- knowledge distillation;
- Seed Vault synchronization or automatic knowledge updates;
- Harvest workflows;
- timeline behavior or a new timeline;
- notifications;
- scheduling or Calendar behavior;
- reminders;
- AI interpretation;
- a Growing hero;
- grow-stage inference or a canonical grow-stage model;
- public sharing or Community projection;
- new Task, Event, Notes, Photos, Documents, Calendar, or attachment systems;
- database schemas, migrations, storage models, APIs, or exact UI controls beyond the nullable canonical Session entry discriminator, the minimum dedicated Growing persistence authorized by Section 7.1, and the interaction boundaries approved by this contract.

## 16. Acceptance Criteria

An approved implementation satisfies this contract only when:

- every Session begins through one deliberate approved entry path;
- Session Entry is one neutral required choice with no default or duplicate selector;
- Seed Session begins with Germination and preserves the IC-GC-002B Germination regression lock;
- Grow Session begins with Growing without fabricating Germination evidence or a completed Germination record;
- both entry paths produce one canonical user-owned Session rather than separate Session systems;
- Session Entry is immutable after canonical Session creation;
- omitted Germination is presented as not included, remains non-navigable, and never becomes phase evidence or completion;
- the nullable entry discriminator preserves legacy Sessions without normalizing absent metadata to Seed entry;
- Growing initializes through a Growing-owned setup before one canonical editable Plant Group chart, for both direct Grow entry and Seed Sessions advancing from Germination;
- Grow Context records one Environment Type and one Grow Method using the Section 6.1 vocabularies, with user-entered `Other` text remaining Session evidence rather than creating global canonical values;
- the one editable Growing chart is the canonical Growing evidence surface, supports adding, editing, and removing rows with deterministic totals, and creates no fabricated Plant Groups;
- each Plant Group records Plant, Source, Variety, Type, Sex, Number of Plants, and Harvested according to Section 8, while Plant labels remain distinct from stable internal identity;
- Source and Variety reuse their canonical systems without duplication;
- Number of Plants is an explicit positive whole number and is never inferred from Germination counts;
- Harvested means the entire current Plant Group is harvested and does not implement partial-harvest behavior;
- Growing evidence is never inferred from Germination;
- eligible expected Vegetative and Flowering timing may initialize from linked Seed Vault reference knowledge with provenance, remains editable Session context, never becomes observed evidence, and never writes back automatically;
- reference knowledge never initializes, replaces, corrects, or overwrites observed Session evidence automatically, and observed evidence never overwrites Seed Vault knowledge automatically;
- intentional save of valid Growing evidence creates at most one canonical Growing Phase Record for the Session and zero or more stable child Plant Group Records;
- opening, activating, viewing, or reviewing Growing creates no Growing evidence automatically;
- Growing evidence is never stored in Germination Partitions, snapshot state, Session notes, Session images, Tasks, Events, Seed Vault records, miscellaneous Session fields, or a local-only evidence store;
- local, demo, scenario, and cloud representations map losslessly to the same canonical Growing model;
- the Growing Summary appears above the chart and deterministically projects only Environment Type, Grow Method, Plant Count, Harvested Count, and available expected timing without duplicate entry or unsupported conclusions;
- the Growing workspace is reserved below the chart as the ownership location for future Tasks, Events, Calendar, Notes, Photos, and Documents without implementing or duplicating those capabilities;
- Reflection and all downstream interpretation and knowledge-writing behavior remain outside scope;
- existing security, privacy, ownership, Preview Studio, demo, and compatibility boundaries remain unchanged; and
- no future capability or unresolved taxonomy, persistence, workflow, or calculation rule is silently implemented.

## 17. Verification Requirements

Before approval of an implementation, verification must demonstrate:

- `git diff --check` passes;
- only files authorized by a later approved implementation task changed;
- no unauthorized application code, schema, migration, test, runtime, or asset change exists;
- Seed Session and Grow Session use the same canonical Session authority;
- Grow Session creates no Germination evidence or false Germination completion;
- Seed Session retains complete Germination behavior and history;
- Growing timing, progress, completion, and evidence remain independent;
- Plant Group evidence remains attributable and does not mutate Germination or Seed Vault records;
- summary values reproduce deterministically from canonical Growing evidence;
- workspace composition reuses canonical capability owners and creates no parallel systems;
- dedicated Growing persistence maintains at most one Growing Phase Record per Session and stable child Plant Group identity;
- existing Sessions without Growing evidence remain valid without backfill, fabricated zeros, or automatically created records;
- local, demo, scenario, and cloud representations preserve the same logical Growing evidence and validation boundaries;
- Preview Studio, demo, QA, scenario, authorization, RLS, privacy, and production-data protections remain intact;
- existing Sessions remain compatible without fabricated classification or evidence; and
- no pre-existing unrelated working-tree change was modified.

For this documentation-only task, verification must confirm that only this contract was changed by the task and that application code, schema, migrations, tests, assets, runtime behavior, and unrelated working-tree changes were untouched.

## 18. Architecture Gaps

The following decisions remain unresolved:

- additional Plant Group required-field and validation rules beyond the approved vocabularies and positive-whole-number count rule — **TBD — Requires Architecture Approval**;
- mixed-sex Plant Group representation — **TBD — Requires Architecture Approval**;
- Plant Group split, merge, and count-correction behavior — **TBD — Requires Architecture Approval**;
- Partial-harvest representation, Plant Group splitting, count effects, and evidence history — **TBD — Requires Architecture Approval**;
- harvest dates, harvest events, and Harvest workflows — **TBD — Requires Architecture Approval**;
- expected-timing storage, units, permitted ranges, and normalization — **TBD — Requires Architecture Approval**;
- reference-timing comparison, conflict, and correction behavior — **TBD — Requires Architecture Approval**;
- observed-timing field contract and correction policy — **TBD — Requires Architecture Approval**;
- actual Vegetative and Flowering timing, milestones, and timeline behavior — **TBD — Requires Architecture Approval**;
- advanced Growing Summary fields, calculations, empty states, and presentation beyond Section 10 — **TBD — Requires Architecture Approval**;
- Plant Group lineage and historical split or merge representation — **TBD — Requires Architecture Approval**;
- implementation and composition of Tasks, Events, Calendar, Notes, Photos, and Documents in the Growing workspace — **TBD — Requires Architecture Approval**;
- Growing Notes, Photos, and Documents evidence composition — **TBD — Requires Architecture Approval**;
- exact automated regression fixtures — **TBD — Requires Architecture Approval**.

Scheduling, Calendar behavior, reminders, notifications, timeline behavior, Growing hero content, grow-stage models, Harvest workflows, Reflection, Session Reports, GEE, knowledge distillation, Seed Vault synchronization, and AI interpretation require later implementation contracts.

## 19. Approval Gate

Implementation may begin only after architecture review confirms:

- this contract is approved;
- FN-001, FN-003, FN-004, the Composition Specification, IC-GC-002A, and IC-GC-002B remain authoritative and consistent;
- Seed Session and Grow Session are approved entry paths into the same canonical Session;
- omitted-phase behavior is approved without fabricated evidence;
- Growing initialization and independent phase-state ownership are approved;
- Plant Group ownership fields and every implementation-required vocabulary are approved;
- reference and observed timing boundaries are approved, and an implementation that includes expected timing uses an already approved storage, unit, range, and normalization convention;
- the intended Growing Summary fields and deterministic rules are approved;
- every workspace capability included in an implementation has a separately approved canonical owner and behavior contract;
- the dedicated Growing Phase Record and Plant Group child-record persistence model is approved without assigning evidence to another information owner;
- compatibility requires no destructive relabeling or fabricated legacy evidence;
- security and Preview Studio boundaries require no unapproved change; and
- every Architecture Gap required by the proposed implementation slice is resolved.

Approval of IC-GC-002C authorizes only the Session Entry and Growing foundation defined in Section 4. It does not implicitly approve any later capability or unresolved implementation detail.
