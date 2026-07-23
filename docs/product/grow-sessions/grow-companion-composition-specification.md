# Grow Companion Composition Specification

**Status:** Draft — Requires Architecture Approval
**Product Area:** Grow Sessions
**Authority:** FN-004 / IC-GC-002A / Grow Companion Capability 1
**Scope:** Canonical composition of Germination, Growing, and Reflection within one Grow Companion

## 1. Purpose

This specification defines the canonical product composition of Grow Companion across the complete Session lifecycle:

```text
Germination
↓
Growing
↓
Reflection
```

Grow Companion is one persistent operational workspace inside one continuous, user-owned Session.

This specification establishes what must remain true across phases. It does not implement Growing or Reflection, authorize database changes, prescribe exact CSS, or replace the approved Germination composition.

Its objectives are to:

- protect Germination as the approved reference phase
- separate the canonical current phase from the phase currently being viewed
- preserve complete historical phase records
- establish a rich Growing composition built to the standard of Germination
- establish Reflection as a report-first structured-evidence experience
- define one evolving Session timeline across the lifecycle
- keep phase-specific modules inside one recognizable Grow Companion system
- preserve the evidence, Session Context, GEE, and Seed Vault boundaries established by the Foundation

## 2. Foundation Authority

This specification inherits authority from:

- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../../foundation/foundation-notes/FN-004-session-lifecycle-and-grow-companion.md)
- [IC-GC-002A — Grow Companion Capability 2A: Session Context Foundation](../../foundation/implementation-contracts/IC-GC-002A-session-context-foundation.md)
- [Grow Companion Capability 1 — Tasks, Events, and Activity](../../architecture/grow-companion-capability-1.md)
- [Grow Sessions Product Specification](./README.md)

FN-004 establishes:

- one canonical Session
- Germination, Growing, and Reflection as canonical phases
- Grow Companion as the permanent operational hub
- completed phases as preserved historical records
- users as the creators of evidence
- Session Context as deterministic operational and evidence-readiness infrastructure
- GEE as the canonical evidence interpretation engine
- Seed Vault as inventory and intentionally distilled knowledge, not Session history

IC-GC-002A governs deterministic Session Context behavior and projections. Capability 1 owns implemented Task, Event, and Recent Activity behavior.

This specification may define product composition and interaction behavior, but it may not override Foundation authority or introduce a parallel Session, phase, timeline, task, event, scheduling, notification, Reflection, evidence, context, GEE, or knowledge system.

## 3. Current Implementation Snapshot

At the time of this specification, Germination is the most complete reference phase, Growing partially composes Capability 1, and Reflection remains incomplete. These implementation conditions do not redefine the canonical architecture.

## 4. Canonical Decisions

### 4.1 One Session

A Session is one continuous user-owned workflow from Germination through Growing and Reflection.

Phase progression must not create separate Session records, duplicate phase pages, or parallel workflows.

### 4.2 One Grow Companion

Grow Companion is the single operational workspace inside the Session.

It is not a collection of unrelated pages. Its shared shell, hierarchy, design language, lifecycle context, and evidence boundaries persist while phase-specific content evolves.

### 4.3 Germination Is the Reference Phase

The existing Germination Session composition is approved and structurally protected.

Growing and Reflection must rise to its level of quality, evidence visibility, method awareness, historical depth, and responsive integrity. They must not force Germination into a smaller generic template.

### 4.4 Phase Composition Is Specialized

Consistency comes from the shared workspace, hierarchy, design language, lifecycle, and evidence rules—not from forcing every phase to contain identical modules.

Every phase may own specialized modules, but every phase module belongs within the single Grow Companion workspace.

### 4.5 Nothing Disappears

Completed phase records remain available in full.

A summary may provide entry into a preserved record. It may not replace that record.

### 4.6 Current and Viewed State Are Separate

Lifecycle progression controls the canonical current phase. User review controls the viewed phase.

Reviewing history never changes lifecycle state.

## 5. Persistent Grow Companion Shell

The Grow Companion shell remains recognizable across Germination, Growing, Reflection, and completed Session review.

Its structural hierarchy is:

1. **Session identity and overview** — identifies the canonical Session, owner-visible status, method or setup context, and applicable Session-level actions.
2. **Lifecycle orientation** — communicates canonical current phase, completed phases, upcoming phases, and overall Session progress.
3. **Grow Companion identity** — establishes one persistent operational system rather than unrelated phase pages.
4. **Viewed-phase context** — identifies which phase is being displayed and whether it is current, completed history, or an upcoming preview.
5. **Operational hero** — highlights the selected phase's most relevant operational or historical context.
6. **Phase-specific modules** — presents the capabilities owned by the viewed phase.
7. **Historical records and return path** — preserves completed phases and provides an obvious route back to the canonical current phase.
8. **Next-phase readiness** — communicates eligible transitions without exposing future-phase controls prematurely.

This hierarchy does not prescribe DOM structure, CSS layout, pixel measurements, or a fixed desktop arrangement.

The shell may adapt responsively, but it must preserve meaning, phase identity, evidence visibility, and access to historical records.

## 6. Current Phase and Viewed Phase

### 6.1 Canonical Current Phase

The canonical current phase is the actual active phase of the Session.

Only an authorized lifecycle transition changes it.

The current phase:

- receives primary operational emphasis
- owns active phase actions
- is the default viewed phase
- remains visibly identifiable even when the user reviews another phase
- must not be changed by navigation, expansion, filtering, or historical review

### 6.2 Viewed Phase

The viewed phase is the phase record or preview currently displayed to the user.

Changing the viewed phase:

- changes presentation only
- does not reactivate a completed phase
- does not complete, reopen, or advance lifecycle state
- does not grant active controls to a completed or upcoming phase
- does not alter evidence status

Example:

```text
Canonical Current Phase: Growing
Viewed Phase: Germination
```

In this state:

- Growing remains marked current.
- Germination is marked completed and selected for historical review.
- Germination's complete record is displayed.
- Growing actions remain unavailable inside the Germination record.
- A clear action returns the viewed phase to Growing.

### 6.3 Default and Persistence

The default viewed phase is the canonical current phase.

Whether viewed-phase selection persists across navigation, refresh, devices, or sessions is:

**TBD — Requires Architecture Approval**

## 7. Phase Navigator

The navigator represents two separate dimensions:

- lifecycle status: completed, current, or upcoming
- viewed selection: the phase presently displayed

Lifecycle status and viewed selection must not be expressed as one ambiguous state.

Active-view clarity must not depend on color alone.

### 7.1 Completed Phase

A completed phase:

- is clearly marked completed
- is selectable for complete historical review
- retains its recorded details
- does not become current when selected
- does not expose current-phase controls
- may expose limited correction controls only where an approved editing policy permits
- clearly communicates that the user is viewing history

### 7.2 Current Phase

The current phase:

- is clearly marked current
- receives primary operational emphasis
- exposes authorized active tools and actions
- is selected by default
- remains identifiable as current when another phase is viewed

### 7.3 Upcoming Phase

An upcoming phase:

- is clearly marked upcoming
- never appears current
- does not expose active-phase controls
- may present explanation, readiness, or a non-operational preview
- may offer a deliberate transition action only when lifecycle eligibility is satisfied

Whether an upcoming phase may become the viewed phase before eligibility, and the limits of that preview, are:

**TBD — Requires Architecture Approval**

### 7.4 Navigation Accessibility

The navigator must:

- expose lifecycle status and viewed selection programmatically
- support keyboard operation
- maintain visible focus
- announce disabled or unavailable states
- preserve a logical focus destination after phase selection
- avoid treating expanded state as the sole indication of viewed selection


## 8. Germination Reference Composition

### 8.1 Protected Reference

The existing Germination composition is the approved reference implementation.

The following current components and behaviors are protected:

- Grow Companion hero and operational emphasis
- method-specific presentation, imagery, instructions, timelines, and components
- Session identity, overview, and status
- live and completed Germination timeline
- method layout and method-specific context
- current progress and elapsed-time context
- supplies or method-support context where applicable
- KAN Seed Chart and equivalent method-aware partition composition
- seed counts, Germination results, and row-level evidence
- seed-age context where applicable
- Progress section
- Germination Rate section
- Result Breakdown and Fair View
- source and variety breakdowns
- partition-level result visibility
- notes and their privacy behavior
- image capability and evidence visibility
- image ownership and privacy
- image review behavior and completed-history access
- existing recorded images
- approved responsive image behavior
- Community or sharing controls
- Session update and Germination completion controls
- completed-state presentation
- complete historical record
- existing data visibility
- existing editability and review behavior

This list protects the current composition without freezing defects or preventing additive improvements.

Future architecture-approved changes may expand image limits or presentation without removing existing evidence or weakening historical access.

### 8.2 Prohibited Simplification

Future work must not:

- remove approved Germination sections
- combine rich sections into generic summary cards
- hide detailed evidence behind permanent truncation
- replace method-specific content with one generic layout
- reduce Germination merely to simplify Growing implementation
- move Germination into a separate workflow
- reduce completed Germination to a small header summary
- replace the full record with a report
- remove existing evidence visibility, editability, or authorized review behavior without architecture approval

### 8.3 Permitted Repair

Future implementation may repair:

- responsive overflow
- viewed-phase and current-phase clarity
- duplicate rendering
- incorrect expansion behavior
- visual hierarchy defects
- broken, missing, or inaccessible controls
- focus and keyboard defects

Repairs must preserve the approved structure, elements, evidence, and method-specific behavior.

## 9. Growing Entry and Composition

### 9.1 Growing Entry

Growing extends the same Session. It never creates a new workflow or duplicate Session.

When Growing becomes eligible, the user completes a deliberate Growing setup experience before or during activation.

The transition must:

- preserve completed Germination in full
- establish Growing context within the same Session
- distinguish setup from evidence already recorded
- avoid presenting optional plans or estimates as facts
- avoid unnecessary complexity
- support later evidence interpretation without embedding GEE behavior

Whether setup occurs before activation, as part of activation, or through a resumable transition state is:

**TBD — Requires Architecture Approval**

### 9.2 Growing Environment

Candidate environment categories include:

- Indoor
- Greenhouse
- Outdoor
- Other

The final taxonomy, definitions, required status, and extensibility model are:

**TBD — Requires Architecture Approval**

### 9.3 Growing Method or System

Candidate categories include:

- Living Soil
- Soil
- Coco
- Hydroponic
- DWC
- RDWC
- Rockwool
- NFT
- Aeroponic
- Other

The final taxonomy, hierarchy, aliases, multi-system rules, and required status are:

**TBD — Requires Architecture Approval**

### 9.4 Optional Context

Potential optional context includes:

- location, room, tent, bed, or area
- medium
- irrigation system
- light strategy
- nutrient strategy
- planned vegetative duration
- expected flowering duration
- environmental targets

The approved field list, required status, ownership, and product controls are:

**TBD — Requires Architecture Approval**

This specification does not authorize a database representation or final input controls.

### 9.5 Growing Composition

Growing is a rich phase workspace built to the same structural and visual standard as Germination.

It must not ship as a shallow placeholder card or a collection of unrelated utilities.

| Growing module | Classification | Composition decision |
|---|---|---|
| Persistent Grow Companion shell | Already implemented foundation | Inherited and stabilized; must remain the same Session workspace |
| Phase navigator | Already implemented foundation; requires correction | Separate canonical current phase from viewed phase |
| Grow Companion phase hero | Future Grow Companion composition capability — TBD | Required rich phase-level operational highlight; exact content priority is TBD |
| Live phase and Session timeline | Future Grow Companion composition capability — TBD | Must present one projection of the Session's canonical chronology; stage model is TBD |
| Current growing stage | Grow-stage model ownership: TBD — Requires Architecture Approval | Must remain broader than cannabis-only terminology; environmental evidence may contribute context but does not own the stage model |
| Tasks | Already implemented; inherited from Capability 1 | Reuse canonical private Task records |
| Events | Already implemented; inherited from Capability 1 | Reuse canonical private Event records |
| Upcoming Tasks | Already implemented; inherited from Capability 1 | Existing Overdue, Today, and Upcoming projection |
| Recent Activity | Already implemented; inherited from Capability 1 | Existing deterministic projection of completed Tasks and Events |
| Calendar and schedule projection | Future scheduling responsibility | Must reuse canonical Tasks and Events; no parallel calendar system |
| Reminders | Future scheduling responsibility | Not authorized by this specification |
| Notes and observations | TBD | Must reuse or extend the canonical Session evidence model |
| Images | TBD | Must preserve canonical ownership, privacy, and evidence attribution |
| Environment | Future environmental evidence responsibility | Taxonomy and evidence model require architecture approval |
| Growing method and setup | Future Grow Companion composition capability — TBD | Same-Session transition; final taxonomy is TBD |
| Completed work | Inherited from Capability 1 and future scheduling | Must remain historical and attributable |
| Upcoming work | Inherited from Capability 1 and future scheduling | Must distinguish plans from recorded outcomes |
| Evidence readiness | Capability 2A responsibility | Deterministic Completeness, Continuity, and Quality projection |
| Phase transition readiness | Capability 2A context plus Session Lifecycle approval | Readiness may inform but must not silently advance the phase |
| Phase summary | Future Grow Companion composition capability — TBD | Must not replace the complete Growing record |

The exact allocation of remaining Grow Companion composition work into approved capabilities is:

**TBD — Requires Architecture Approval**

## 10. Reflection Composition

Reflection is the final active phase of the same Session.

It begins with a deterministic Session Report before requesting structured subjective evidence from the grower.

```text
Session Report
↓
Guided Reflection
↓
GEE Interpretation
↓
Intentional Knowledge Distillation
```

Reflection does not automatically become trusted or canonical knowledge.

### 10.1 Session Report

The Session Report is a deterministic summary of canonical Session records produced without GEE-level biological interpretation.

It summarizes only canonical records and attributable deterministic projections.

It may summarize:

- Session identity
- recorded dates and durations
- phase transitions and milestones
- Tasks and Events
- notes and observations
- images
- methods and Grow Context
- recorded outcomes
- evidence-readiness dimensions
- phase records

The Session Report must not:

- diagnose
- recommend
- predict
- infer unsupported biological conclusions
- present GEE interpretation
- convert missing evidence into a negative outcome
- present subjective Reflection as an objective fact

Exact report fields, calculations, visual presentation, and completeness rules are:

**TBD — Requires Architecture Approval**

The report must not replace full phase records.

### 10.2 Guided Reflection

Reflection is structured subjective evidence produced by the grower.

FN-004 currently establishes:

- Overall Experience
- Would Grow Again?
- Final Thoughts

Potential future guided categories include:

- expectations
- outcome
- successes
- challenges
- surprises
- lessons
- what to repeat
- what to change
- confidence in conclusions

Any expansion beyond the canonical FN-004 structure is:

**TBD — Requires Architecture Approval**

### 10.3 GEE Interpretation

A downstream GEE area may communicate interpretation status or eligible results.

It must:

- remain visibly distinct from the grower's Reflection
- preserve original evidence and lineage
- avoid presenting unsupported conclusions
- avoid representing generated interpretation as a user statement

GEE output, eligibility, timing, and presentation are:

**TBD — Requires Architecture Approval**

### 10.4 Knowledge Distillation

Knowledge distillation is an intentional downstream step.

It may eventually enrich the Seed Vault or future Sessions, but it does not copy the complete Session history into the Seed Vault.

Eligibility, owner confirmation, write behavior, revision behavior, and destination projections are:

**TBD — Requires Architecture Approval**

This specification does not authorize knowledge-writing behavior.

## 11. Session Timeline

The Session owns the canonical chronology.

Grow Companion presents one live cross-phase timeline projection derived from the Session's canonical chronology. It may compose, project, present, filter, and navigate that chronology within the operational workspace.

The timeline projection is derived from canonical Session evidence and context. Grow Companion does not own a separate recorded chronology, evidence store, or parallel timeline system.

### 11.1 Cross-Phase Continuity

The timeline must:

- preserve Germination milestones
- continue through Growing
- include Reflection and Session completion
- remain reviewable after completion
- preserve chronology and source attribution
- support both phase-level and complete-Session understanding

### 11.2 Growing Stages

Growing may later support meaningful stages such as:

- establishment
- vegetative growth
- transition
- flowering
- finishing
- harvest or completion

The canonical broader grow-stage model, terminology, applicability rules, and user-defined extension model are:

**TBD — Requires Architecture Approval**

Cannabis-specific terminology must not become mandatory where a broader model is required.

### 11.3 Timeline Information Classes

The timeline must distinguish:

| Information class | Meaning |
|---|---|
| Actual milestone | An attributable event or outcome that occurred |
| Planned milestone | A user-authored intention or target |
| Deterministic estimate | A projection derived from canonical records and approved deterministic rules |
| GEE interpretation | A governed interpretation with evidence lineage and confidence |

An estimate must never be displayed as a recorded fact. A plan must never be displayed as an observed outcome. GEE interpretation must remain distinct from both.

Timeline inputs may eventually include actual dates, user plans, deterministic estimates, variety or seed metadata, environmental or method context, and GEE interpretation.

Source precedence, estimate eligibility, conflict handling, and stage-date derivation are:

**TBD — Requires Architecture Approval**

This specification does not define formulas or prediction algorithms.

### 11.4 Timeline Revisability

Planned, deterministic-estimate, and future GEE-interpreted timeline projections remain revisable when new canonical evidence is recorded.

- Recorded evidence remains historical fact subject to the approved correction policy.
- Planned milestones may be updated by the user.
- Deterministic estimates must be recalculated when relevant canonical inputs change.
- Future GEE interpretations must retain lineage and may change as eligible evidence changes.
- Revisions must not rewrite earlier recorded facts.
- The most current projection must remain distinguishable from prior recorded history.

This specification does not define recalculation formulas, event handlers, storage models, or caching behavior.

## 12. Operational Hero

The prominent Grow Companion hero is the phase-level operational highlight.

It remains part of one recognizable Grow Companion system while adapting to the viewed phase.

Its conceptual responsibilities may include:

- viewed phase identity
- canonical current, completed, or upcoming status
- elapsed time
- live or historical progress
- relevant next action
- key milestone context
- method-specific or phase-specific visual context

For a completed phase, the hero presents historical completion context without implying reactivation.

For the current phase, it presents live operational context.

For Reflection, it may present Session-report and Reflection progress.

The hero must preserve the distinction between lifecycle status and viewed selection.

The existing Germination hero is protected and must not be removed or flattened. Exact hero content priority for Growing and Reflection is:

**TBD — Requires Architecture Approval**

This specification does not prescribe layout measurements, styling, or exact responsive placement.

## 13. Completed Phase Review

Nothing disappears.

Selecting a completed phase displays its full preserved phase record.

Historical review must communicate:

- the viewed phase is complete
- the canonical Session is currently in a later phase, or the Session is complete
- the user is reviewing preserved history
- active controls belong to the canonical current phase
- a clear action returns to the current phase when one exists

For Germination, full review includes every protected component listed in this specification.

For Growing and Reflection, completed review must preserve the full phase composition and evidence available when those phases are implemented.

A completion summary may orient the user and open the record. It may not replace the complete record.

## 14. Phase-Specific Modules

Every module has one phase composition owner and one canonical information owner.

### Germination

The approved Germination modules remain intact under the detailed protection rules in Section 8.

### Growing

Growing may compose Tasks, Events, scheduling projections, notes, images, environment, method and setup, timeline, Recent Activity, evidence readiness, transition readiness, and phase summary according to the ownership table in this specification.

### Reflection

Reflection may compose Session report, guided Reflection, GEE interpretation status, knowledge-distillation status, final images, and privacy or sharing controls.

Exact final-image and Reflection-sharing behavior is:

**TBD — Requires Architecture Approval**

No phase may introduce a parallel Task, Event, note, image, scheduling, timeline, evidence, GEE, Reflection, or knowledge system.

## 15. Editability and Historical Integrity

### 15.1 Current Phase

The current phase may expose authorized editing and operational actions appropriate to that phase.

Every change remains attributable to the canonical Session owner or an explicitly authorized system actor.

### 15.2 Completed Phase

Completion makes the phase historical. Historical review does not reactivate it.

Limited corrections may remain possible where an approved policy permits them, but corrections must:

- preserve authorship and attribution
- preserve evidence lineage
- distinguish corrected data from derived context and interpretation
- avoid silently changing later-phase meaning
- avoid changing the canonical current phase

The exact completed-phase editing policy by record type is:

**TBD — Requires Architecture Approval**

The auditability, correction-history, and user-visible provenance requirements are:

**TBD — Requires Architecture Approval**

This specification does not define database columns, audit tables, or event-log mechanisms.

## 16. GEE and Evidence Boundaries

Users create evidence through their actions, observations, decisions, and recorded outcomes.

Grow Companion captures, structures, organizes, preserves, and presents that evidence.

Session Context derives deterministic operational awareness, workflow continuity, evidence readiness, and relevant operational attention from canonical Session records.

GEE governs and performs:

- evidence eligibility
- evidence normalization
- evidence lineage
- evidence confidence
- evidence interpretation
- knowledge distillation

Grow Companion composition must prepare high-quality evidence for GEE without:

- inventing evidence
- inferring user observations
- presenting estimates as facts
- embedding unsupported biological recommendations
- presenting predictive cultivation advice as operational state
- presenting GEE interpretation as user-authored Reflection
- writing knowledge automatically into the Seed Vault

Original evidence remains traceable to its canonical source.

## 17. Responsive and Accessibility Principles

The composition must remain understandable and operable across mobile, tablet, desktop, zoomed, and assistive-technology contexts.

Required principles:

- no loss of Germination evidence or controls solely because of viewport size
- no horizontal overflow that makes canonical content unreachable
- phase status and viewed selection are not communicated by color alone
- the navigator is keyboard operable
- focus remains visible and moves predictably after phase selection
- completed-history controls expose expanded state and purpose
- upcoming controls expose disabled or unavailable state
- headings preserve a coherent Session, Grow Companion, phase, and module hierarchy
- live status and save feedback use appropriate announcements without excessive interruption
- touch targets remain usable
- dense evidence modules may reflow or scroll without flattening or deleting information

Exact breakpoints, layout measurements, and visual treatments remain implementation decisions subject to design review.

## 18. Non-Goals

This specification does not:

- implement the redesign
- modify runtime behavior
- simplify or remove Germination
- finalize Growing taxonomies
- define database schemas or migrations
- define GEE algorithms or recommendations
- define prediction formulas
- build Reflection
- authorize knowledge writes
- create a new Session or timeline system
- create parallel Tasks, Events, notes, scheduling, notifications, images, or evidence systems
- prescribe exact CSS, pixels, colors, or component code
- redesign unrelated application areas

## 19. Unresolved Decisions

This section is the canonical index of unresolved decisions. Every item remains unresolved until architecture approval:

- viewed-phase persistence scope — **TBD — Requires Architecture Approval**
- upcoming-phase preview eligibility and limits — **TBD — Requires Architecture Approval**
- Growing activation and setup timing — **TBD — Requires Architecture Approval**
- Growing environment taxonomy — **TBD — Requires Architecture Approval**
- Growing method or system taxonomy — **TBD — Requires Architecture Approval**
- optional Growing context fields and requirements — **TBD — Requires Architecture Approval**
- allocation of remaining Grow Companion composition work — **TBD — Requires Architecture Approval**
- canonical broad grow-stage model — **TBD — Requires Architecture Approval**
- timeline source precedence and conflict handling — **TBD — Requires Architecture Approval**
- deterministic estimate eligibility and stage-date derivation — **TBD — Requires Architecture Approval**
- Growing and Reflection hero content priority — **TBD — Requires Architecture Approval**
- phase-summary content and eligibility — **TBD — Requires Architecture Approval**
- scheduling and calendar ownership beyond Capability 1 — **TBD — Requires Architecture Approval**
- Growing notes, observations, and image composition — **TBD — Requires Architecture Approval**
- Reflection Session-report fields, calculations, visual presentation, and completeness rules — **TBD — Requires Architecture Approval**
- Guided Reflection expansion beyond FN-004 — **TBD — Requires Architecture Approval**
- GEE interpretation eligibility, timing, and presentation — **TBD — Requires Architecture Approval**
- knowledge-distillation eligibility, owner confirmation, write behavior, revision behavior, and destination projections — **TBD — Requires Architecture Approval**
- final-image and Reflection-sharing behavior — **TBD — Requires Architecture Approval**
- completed-phase editing policy — **TBD — Requires Architecture Approval**
- correction auditability and user-visible provenance — **TBD — Requires Architecture Approval**

## 20. Architectural Dependencies

Future implementation remains subject to these durable dependencies:

- Germination must be regression-protected before composition changes.
- Canonical current phase and viewed phase separation must precede richer phase-navigation behavior.
- Grow Context architecture must be approved before final Growing setup.
- Reflection schema must be approved before Guided Reflection implementation.
- GEE integration requires a separate approved contract.
- Knowledge distillation requires a separate approved contract.

These dependencies do not authorize or sequence implementation.

## 21. Architecture Approval Gate

Implementation may begin only after architecture review confirms:

- this specification is approved
- FN-004 and IC-GC-002A boundaries remain intact
- the Germination protection baseline is documented and regression-testable
- canonical current phase and viewed phase are separately defined
- the owner of each Growing module is approved
- applicable Growing taxonomies are approved
- cross-phase timeline ownership and information classes are approved
- Reflection report and evidence boundaries are approved
- editing and historical-integrity policies are approved
- unresolved decisions required for the intended implementation slice are resolved

Approval of one implementation slice does not implicitly approve later scheduling, environmental evidence, GEE interpretation, knowledge distillation, or sharing behavior.
