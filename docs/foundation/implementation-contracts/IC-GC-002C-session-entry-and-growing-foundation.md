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

FN-001 establishes Growing Conditions as optional Session-level context and does not authorize a final taxonomy or schema. FN-003 requires canonical ownership, durable provenance, and no parallel models. FN-004 establishes one continuous Session, Growing as a canonical phase, phase-owned evidence, and the boundary between user evidence, deterministic context, Reflection, GEE, and Seed Vault knowledge. The Composition Specification governs Grow Companion composition. IC-GC-002A retains ownership of deterministic Session Context and evidence-readiness projections. IC-GC-002B supplies the persistent shell, independent current/viewed/lifecycle states, historical review, and Germination regression lock inherited by this contract.

## 3. Repository Baseline

At contract creation:

- the canonical repository architecture recognizes Germination, Growing, and Reflection as phases of one Session;
- Germination is the protected reference composition;
- the persistent Grow Companion shell and phase-state foundation are governed by IC-GC-002B;
- the existing Growing workspace partially composes Capability 1 Tasks, Events, Upcoming Tasks, and Recent Activity;
- Growing activation and setup timing, Growing taxonomies, optional context, phase-summary content, scheduling, notes, observations, images, hero content, and timeline behavior remain unresolved in the Composition Specification; and
- the working tree contains pre-existing changes outside this deliverable.

Existing implementation is a compatibility baseline, not architecture authority. This contract does not authorize application, schema, migration, test, asset, or runtime changes.

## 4. Scope

This contract defines only:

1. Session Entry;
2. Seed Session entry;
3. Grow Session entry;
4. Growing initialization;
5. Growing evidence ownership and the Plant Group model;
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

The phase navigator and historical composition must distinguish a phase that was not included from a phase that was included and completed. Exact language and presentation for a non-included phase are **TBD — Requires Architecture Approval**.

### 5.3 Entry Selection Boundary

Entry selection establishes the Session's starting phase only. It must not:

- choose a future Reflection path;
- create evidence;
- infer earlier-phase outcomes;
- select Growing environment or method values;
- pre-populate observed timing as fact;
- bypass owner authorization, Preview Studio restrictions, or demo safeguards; or
- create a parallel Session-entry persistence system.

The exact entry-selection interaction, default choice, reversibility before the first evidence write, and behavior after evidence exists are **TBD — Requires Architecture Approval**.

## 6. Growing Initialization

Growing is an independent operational phase within the same Session and persistent Grow Companion.

Growing initialization must establish:

- the included Growing phase record;
- Growing as the canonical current phase when entered directly or activated through lifecycle transition;
- independent Growing timing, progress, and completion state;
- an initially valid Growing evidence surface that does not fabricate evidence;
- the Growing Summary projection location; and
- the Growing workspace location.

For a Seed Session, Growing initialization must preserve completed Germination in full and must not rename or copy Germination evidence into Growing. For a Grow Session, initialization must not create a placeholder Germination record.

Initialization distinguishes user-entered or observed evidence from optional reference knowledge, plans, estimates, deterministic context, and system state. Missing Growing evidence remains missing; it must not be filled from Germination or Seed Vault reference values.

Whether Growing setup occurs before activation, during activation, or through a resumable transition remains **TBD — Requires Architecture Approval**.

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

## 8. Editable Growing Chart and Plant Groups

Growing begins with an editable chart as the canonical evidence surface for the phase.

The chart follows the established interaction model of the Germination flexible chart: it supports a variable collection of clearly identified groups, direct owner editing, preserved row-level detail, deterministic totals, accessible interaction, responsive composition, and review of the complete record. This inheritance governs interaction principles only; Growing must not reuse Germination Partitions as Growing evidence or force Growing into Germination-specific semantics.

The Growing chart defines **Plant Groups**, not Germination Partitions.

A Plant Group represents one or more plants within the Session that share the same recorded characteristics at the time represented by the record. Grouping is an evidence-organization mechanism, not an inference that plants are biologically identical.

### 8.1 Plant Group Ownership Fields

Each Plant Group owns the following canonical field responsibilities:

- **Identity** — the stable identity of the Plant Group within the Session;
- **Source** — the recorded canonical source reference or attributable user-entered source state for the group;
- **Variety** — the recorded canonical variety reference or attributable user-entered variety state for the group;
- **Type** — the recorded plant-type classification for the group;
- **Sex** — the recorded sex state for the group;
- **Plant count** — the observed count of plants represented by the group;
- **Harvest state** — the recorded state needed to describe whether the group has reached a harvest-related state, without defining a Harvest workflow.

This contract establishes ownership and semantic separation only. It does not approve field names, data types, controlled vocabularies, required/optional status, validation rules, identifiers, normalization, persistence, APIs, schema, migration, or exact controls.

Source and variety references must preserve canonical Entity and knowledge relationships where available without converting a representative, label, alias, or free-text value into an unapproved canonical Entity.

Type and sex vocabularies, unknown and mixed-state handling, Plant Group split/merge behavior, count correction rules, and harvest-state vocabulary are **TBD — Requires Architecture Approval**.

Harvest state must not implement harvest planning, harvesting actions, yield capture, post-harvest processing, or a Harvest workflow.

## 9. Reference Timing and Observed Timing

Growing distinguishes:

- **Reference timing** — non-observed knowledge presented for orientation and potentially sourced from canonical Seed Vault knowledge;
- **Observed timing** — attributable Session evidence recording what actually occurred during Growing.

Reference timing:

- remains owned by its canonical knowledge source;
- is not Session evidence merely because it is displayed in Growing;
- must retain source and provenance;
- must be labeled so it cannot be mistaken for an observation, outcome, or deterministic fact; and
- must not initialize observed dates or durations automatically.

Reference knowledge must never initialize, replace, correct, or overwrite observed Session evidence automatically.

Observed timing:

- is owned by the Growing phase record;
- is created through attributable Session activity;
- remains distinct from estimates, plans, and reference values; and
- may inform deterministic summaries without being overwritten by them.

Observed evidence must never overwrite or silently update Seed Vault knowledge. Any future owner-confirmed knowledge update or synchronization requires a separate approved contract.

Reference-source eligibility, timing vocabulary, comparison behavior, conflict handling, and exact calculations are **TBD — Requires Architecture Approval**.

## 10. Growing Summary

Growing owns a phase summary derived deterministically from canonical Growing evidence.

The Growing Summary:

- presents only attributable Growing evidence and approved deterministic calculations;
- introduces no duplicate data entry or separate evidence store;
- remains a projection rather than the authoritative evidence record;
- must not replace the editable chart, workspace, or complete Growing record;
- must distinguish missing evidence from zero, failure, or a negative outcome;
- must not import Germination evidence as Growing evidence;
- must not perform GEE interpretation, diagnosis, prediction, recommendation, or knowledge distillation; and
- must remain reproducible from the same eligible canonical inputs and approved rules.

Session-level identity, overview, ownership, lifecycle, and other Session-wide information remain outside the Grow Companion phase composition and must not be duplicated into the Growing Summary as a second authority.

The summary's exact fields, eligibility, calculations, empty states, and presentation are **TBD — Requires Architecture Approval**.

## 11. Growing Workspace

Growing owns its operational workspace inside the persistent Grow Companion shell.

The workspace is the phase composition location for Growing operational evidence and capabilities, including potential composition of:

- Tasks;
- Events;
- Calendar;
- Notes;
- Photos;
- Documents.

This contract establishes phase-composition ownership only. It does not define, implement, or authorize new versions of those capabilities.

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
- Seed Vault owns reference knowledge presented to the Session.
- Reflection owns future structured subjective final-review evidence, not automatic trusted knowledge.
- GEE owns evidence interpretation and knowledge-distillation authority.
- Each capability retains one canonical information owner.
- No capability may duplicate or replace another capability's responsibility.
- Evidence belonging to one phase must never be inferred, renamed, overwritten, or recalculated as evidence by another phase.
- Deterministic summaries and context may recalculate projections from canonical evidence but must not mutate the evidence.
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
- legacy compatibility must preserve Session identity, owner, privacy, phase evidence, routes, and current behavior; and
- compatibility must not create a duplicate Session, phase record, chart, evidence store, or workspace.

Exact legacy entry classification and compatibility mappings are **TBD — Requires Architecture Approval**. This contract does not authorize schema changes or migrations.

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
- Growing environment or Grow Method taxonomies;
- a Growing hero;
- grow-stage inference or a canonical grow-stage model;
- public sharing or Community projection;
- new Task, Event, Notes, Photos, Documents, Calendar, or attachment systems;
- database schemas, migrations, storage models, APIs, or exact UI controls.

## 16. Acceptance Criteria

An approved implementation satisfies this contract only when:

- every Session begins through one deliberate approved entry path;
- Seed Session begins with Germination and preserves the IC-GC-002B Germination regression lock;
- Grow Session begins with Growing without fabricating Germination evidence or a completed Germination record;
- both entry paths produce one canonical user-owned Session rather than separate Session systems;
- Growing initializes independent timing, progress, completion state, evidence, summary, and workspace locations;
- the editable Growing chart is the canonical Growing evidence surface;
- Plant Groups replace Germination Partitions semantically and own identity, source, variety, type, sex, plant count, and harvest-state responsibilities;
- Growing evidence is never inferred from Germination;
- reference timing remains distinguishable from observed Session evidence;
- observed timing never overwrites Seed Vault knowledge automatically;
- the Growing Summary is deterministic, introduces no duplicate entry, and does not replace the full record;
- the Growing workspace owns phase composition without implementing or duplicating its future capabilities;
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
- Preview Studio, demo, QA, scenario, authorization, RLS, privacy, and production-data protections remain intact;
- existing Sessions remain compatible without fabricated classification or evidence; and
- no pre-existing unrelated working-tree change was modified.

For this documentation-only task, verification must confirm that only this contract was created by the task and that application code, schema, migrations, tests, assets, runtime behavior, and unrelated working-tree changes were untouched.

## 18. Architecture Gaps

The following decisions remain unresolved:

- exact Session Entry interaction and default — **TBD — Requires Architecture Approval**;
- entry-selection reversibility and evidence-lock boundary — **TBD — Requires Architecture Approval**;
- non-included phase navigator language and presentation — **TBD — Requires Architecture Approval**;
- Growing activation and setup timing — **TBD — Requires Architecture Approval**;
- Plant Group identifiers, field names, data types, required status, and validation — **TBD — Requires Architecture Approval**;
- canonical Type vocabulary — **TBD — Requires Architecture Approval**;
- canonical Sex vocabulary and unknown or mixed states — **TBD — Requires Architecture Approval**;
- Plant Group split, merge, and count-correction behavior — **TBD — Requires Architecture Approval**;
- harvest-state vocabulary without Harvest workflow — **TBD — Requires Architecture Approval**;
- Partial-harvest representation, Plant Group splitting, count effects, and evidence history — **TBD — Requires Architecture Approval**;
- reference-timing sources, eligibility, vocabulary, comparison, and conflicts — **TBD — Requires Architecture Approval**;
- Expected/reference timing semantics, ownership, and distinction from user-authored plans and deterministic estimates — **TBD — Requires Architecture Approval**;
- observed-timing field contract and correction policy — **TBD — Requires Architecture Approval**;
- Growing Summary fields, eligibility, calculations, empty states, and presentation — **TBD — Requires Architecture Approval**;
- Growing Notes, Photos, and Documents evidence composition — **TBD — Requires Architecture Approval**;
- legacy Session entry classification and compatibility mappings — **TBD — Requires Architecture Approval**;
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
- reference and observed timing boundaries are approved;
- the intended Growing Summary fields and deterministic rules are approved;
- every workspace capability included in an implementation has a separately approved canonical owner and behavior contract;
- compatibility requires no destructive relabeling or fabricated legacy evidence;
- security and Preview Studio boundaries require no unapproved change; and
- every Architecture Gap required by the proposed implementation slice is resolved.

Approval of IC-GC-002C authorizes only the Session Entry and Growing foundation defined in Section 4. It does not implicitly approve any later capability or unresolved implementation detail.
