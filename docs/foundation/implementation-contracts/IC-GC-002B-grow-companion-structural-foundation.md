# IC-GC-002B — Grow Companion Structural Foundation

**Status:** Draft — Requires Architecture Approval

**Scope:** Germination regression lock / canonical phase state / phase navigation / historical review / persistent Grow Companion shell

## 1. Purpose

This contract defines the first bounded implementation slice for transforming Grow Companion from a Germination-centered workspace into the structural foundation of one multi-phase Session workspace.

The slice preserves the approved Germination experience, separates lifecycle state from presentation state, makes completed phases fully reviewable, and establishes one persistent Grow Companion shell whose phase composition area can change without creating another Session or evidence system.

This contract authorizes no application implementation until the Approval Gate in Section 17 is satisfied. It does not authorize Growing composition, Reflection, new evidence types, schema changes, or lifecycle redesign.

## 2. Foundation Authority

This contract derives authority from:

1. [FN-001 — Growing Conditions](../foundation-notes/FN-001-growing-conditions.md)
2. [FN-003 — Canonical Entities & Representation](../foundation-notes/FN-003-canonical-entities-and-representation.md)
3. [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../foundation-notes/FN-004-session-lifecycle-and-grow-companion.md)
4. [Grow Companion Composition Specification](../../product/grow-sessions/grow-companion-composition-specification.md)
5. [IC-GC-002A — Session Context Foundation](./IC-GC-002A-session-context-foundation.md)
6. [Grow Companion Capability 1 — Tasks, Events, and Activity](../../architecture/grow-companion-capability-1.md)

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

Higher-level architecture always prevails. This contract must not be read as approving a decision that its authorities leave unresolved.

FN-001 preserves Growing Conditions as future optional Session-level context; this slice does not implement it. FN-003 requires one canonical model, durable knowledge, clear ownership, and preserved provenance. FN-004 establishes one continuous user-owned Session, one permanent Grow Companion, durable phase records, evidence boundaries, and the Germination → Growing → Reflection lifecycle. The Composition Specification governs phase composition and navigation. IC-GC-002A governs deterministic Session Context and evidence-readiness projections. Capability 1 retains ownership of canonical private Tasks, Events, and the derived Recent Activity read model.

## 3. Repository Baseline

Repository inspection at contract creation found:

- Germination is the most complete phase composition and is the approved reference phase.
- Growing already composes portions of Capability 1; that existing behavior does not authorize additional Growing work in this slice.
- Reflection remains incomplete and is not part of this slice.
- the Session detail implementation contains a Grow Companion phase foundation, a three-phase navigator, a current-phase workspace, and completed-phase record presentation;
- existing end-to-end coverage exercises one Grow Companion across Germination, Growing, and Reflection labels, keyboard navigation, completed Germination expansion, full Germination module preservation, duplicate prevention, and responsive behavior;
- canonical Task and Event behavior is defined separately by Capability 1 and its shared browser contract;
- the working tree contains pre-existing modified, deleted, and untracked files outside this deliverable.

These observations describe the inspected repository; they do not elevate existing code or tests above the authorities in Section 2 and do not establish that every acceptance criterion is already satisfied.

The implementation baseline to preserve includes the current Session identity and overview, lifecycle orientation, Grow Companion workspace, phase navigator, Germination composition, and completed Germination review path. Implementation planning must begin with a baseline inventory that maps each protected Germination element in Section 7 to its renderer, state source, accessibility behavior, and regression coverage.

## 4. Scope

An implementation approved under this contract may only:

1. regression-lock the existing Germination composition as the canonical reference phase;
2. represent canonical current phase, viewed phase, and per-phase lifecycle state as independent concepts;
3. correct phase navigation so completed, current, upcoming, and viewed meanings remain distinct;
4. allow the complete preserved record of a completed phase to be reviewed without lifecycle mutation;
5. provide a clear return-to-current action when historical review differs from the canonical current phase;
6. establish or correct one persistent Grow Companion shell containing Session identity, navigator, operational-highlight location, and phase composition area;
7. make structural accessibility and responsive repairs required to support those behaviors; and
8. add or strengthen regression verification for this exact structural slice when a later approved implementation task expressly authorizes test changes.

The implementation must reuse the canonical Session, lifecycle, evidence, Task, Event, and ownership systems already defined by the governing architecture. It must not introduce a duplicate renderer, workflow, state authority, store, or persistence model.

## 5. Non-Goals

This contract does not authorize:

- Growing setup or Growing phase composition;
- Session Types, Seed Session, or Grow Session variants;
- Session entry selection, including choosing between Seed Session and Grow Session, changing the Session entry phase, creating Session entry types, or starting directly in Growing; these belong to a later implementation contract;
- Grow Context, Environment Type, Growing Environment, Grow Method, or Growing Method;
- a Growing chart, timeline changes, Growing hero, or phase summary;
- Reflection, Session Report, or guided Reflection;
- GEE eligibility, interpretation, confidence, or knowledge distillation;
- scheduling, calendar, reminders, recurrence, or notifications;
- new Tasks, Events, Recent Activity behavior, or a parallel activity system;
- schema changes, migrations, new persistence, or lifecycle-field redesign;
- changes to security, RLS, grants, ownership, privacy, or sharing;
- removal, simplification, flattening, consolidation, hiding, or redesign of Germination;
- unrelated application, asset, or test changes.

## 6. Canonical Invariants

The implementation must preserve all of the following:

- There is one canonical user-owned Session from Germination through Growing and Reflection.
- Grow Companion is one operational workspace inside that Session.
- Germination, Growing, and Reflection are phases of the same Session, not separate Sessions.
- Every phase owns its own evidence and complete phase record.
- Grow Companion navigates and presents phase records; it does not merge phase evidence.
- Users create evidence through their actions, observations, decisions, and recorded outcomes.
- Grow Companion captures, structures, organizes, preserves, and presents evidence.
- Session Context derives deterministic context and never creates original evidence.
- GEE alone governs evidence eligibility, normalization, lineage, confidence, interpretation, and knowledge distillation.
- Completed records remain durable, attributable, and accessible.
- Presentation state never mutates lifecycle state.
- No parallel or duplicate Session, phase, evidence, Task, Event, Notes, Images, context, timeline, Reflection, GEE, or knowledge system may be introduced.

## 7. Germination Regression Lock

The existing Germination composition is the canonical reference phase. It must remain structurally and behaviorally intact in both its current and completed historical forms.

The regression lock protects:

- Grow Companion hero and operational emphasis;
- method-specific presentation, imagery, instructions, timelines, layout, context, and components;
- Session identity, overview, status, current progress, and elapsed-time context;
- live and completed Germination timeline;
- supplies and method-support context where applicable;
- KAN Seed Chart and equivalent method-aware partition composition;
- seed counts, results, row-level evidence, seed-age context, and partition-level visibility;
- Progress, Germination Rate, Result Breakdown, and Fair View;
- source and variety breakdowns;
- notes, images, ownership, privacy, review behavior, and completed-history access;
- Community or sharing controls;
- Session update and Germination completion controls;
- completed-state presentation, complete historical record, existing data visibility, and approved editability.

An implementation must not remove approved sections, collapse rich sections into generic summaries, permanently truncate evidence, replace method-aware layouts with a generic template, relocate Germination into another workflow, or substitute a summary or report for the full record.

Permitted repairs are limited to responsive defects, accessibility defects, viewed-state clarity, current-state clarity, duplicate rendering, incorrect expansion behavior, broken controls, and visual hierarchy defects. A repair must preserve approved structure, content, evidence visibility, authorized behavior, and method specificity.

Before implementation, the protected inventory and representative fixtures must be documented and regression-testable across current and completed Germination states.

## 8. Phase Model

The structural model contains three independent concepts.

### 8.1 Canonical Current Phase

The canonical current phase is the actual active lifecycle phase of the Session. Only an authorized lifecycle transition may change it.

It receives primary operational emphasis, owns active phase actions, is the default viewed phase, and remains identifiable when another phase is reviewed.

### 8.2 Viewed Phase

The viewed phase is the phase record currently presented in the phase composition area. Selecting a phase changes presentation only.

Viewed-phase selection must not complete, reopen, reactivate, or advance a phase; change evidence status; grant active controls; or change the canonical current phase.

The default viewed phase is the canonical current phase. Persistence of viewed-phase selection across refresh, navigation, devices, or sign-in sessions remains unresolved and is not authorized by this contract.

### 8.3 Phase Lifecycle State

Each canonical phase is presented with exactly one lifecycle state:

- **Completed** — the phase has ended and its preserved record is historical;
- **Current** — the phase is active and owns authorized operational actions;
- **Upcoming** — the phase has not begun and owns no active-phase controls.

Lifecycle state is derived from the canonical Session lifecycle authority, not from navigator focus, selection, expansion, route state, or local presentation state.

### 8.4 Independence Rule

For every rendered phase, lifecycle state and viewed selection must be representable at the same time. For example:

```text
Canonical Current Phase: Growing
Viewed Phase: Germination
Germination Lifecycle State: Completed
Growing Lifecycle State: Current
Reflection Lifecycle State: Upcoming
```

No boolean or visual state may ambiguously mean both “current” and “viewed.”

## 9. Phase Navigation

The navigator communicates lifecycle status and viewed selection as separate dimensions.

For a completed phase, navigation must:

- mark it completed;
- allow selection for complete historical review;
- retain its recorded details;
- keep it non-current;
- withhold current-phase controls; and
- identify the view as preserved history.

For the current phase, navigation must:

- mark it current with primary operational emphasis;
- expose only its authorized active tools;
- select it by default; and
- continue to identify it as current while another phase is viewed.

For an upcoming phase, navigation must:

- mark it upcoming and never current;
- expose no active-phase controls; and
- expose disabled or unavailable meaning accessibly.

Whether an upcoming phase may be viewed as a preview, what that preview contains, and when a lifecycle transition becomes eligible remain outside this slice.

When a completed phase is viewed while another phase is current, an obvious return-to-current action must set only the viewed phase back to the canonical current phase.

The navigator must remain responsive and keyboard operable, preserve visible focus, expose lifecycle state and viewed selection programmatically, communicate unavailable state without relying on color, and move focus predictably after selection. Expanded or collapsed state must not be the sole indication of viewed selection.

## 10. Historical Review

Nothing disappears.

Selecting a completed phase must display its complete preserved phase record inside the same Grow Companion. A summary may orient the user or open the record, but it must never replace the record.

Historical review must communicate:

- which phase is being viewed;
- that the phase is completed;
- which later phase remains current, or that the Session is complete;
- that the user is reviewing preserved history; and
- how to return to the canonical current phase when one exists.

Review must not reactivate the phase, expose controls owned by the current phase, mutate lifecycle or evidence state, relocate evidence, or create a historical copy. Completed Germination review must retain every protected component in Section 7.

Completed-phase correction policy is not established here. Existing authorized editability must not be removed, and no new correction behavior may be introduced without architecture approval.

## 11. Persistent Grow Companion Shell

There is one persistent Grow Companion shell per Session detail workspace. The shell remains recognizable while the viewed phase changes.

The shell owns:

- Session identity and overview location;
- lifecycle and phase navigator;
- Grow Companion identity;
- viewed-phase context;
- operational-highlight location;
- phase composition area;
- historical-review orientation and return path.

The shell does not own phase evidence, a separate chronology, a duplicate lifecycle, or phase-specific domain records. Phase evidence remains owned by its canonical Session phase and information owner.

Changing the viewed phase must update the appropriate shell context and phase composition without creating a second Grow Companion, duplicating protected modules, changing canonical Session identity, or moving evidence between phase records.

The shell may adapt across mobile, tablet, desktop, zoomed, and assistive-technology contexts, but it must preserve hierarchy, phase identity, current-phase orientation, viewed-phase clarity, evidence access, focus order, and usable touch targets.

## 12. Security and Ownership

This slice changes no security or ownership boundary.

- The Session remains user-owned under existing authorization.
- Phase records retain the authorization, privacy, authorship, and attribution of their canonical source records.
- Historical review grants no additional read or write access.
- Viewed-phase state must not bypass authorization or expose evidence from another Session or owner.
- The shell must not copy private evidence into a less-protected store or public projection.
- Capability 1 Tasks and Events remain authenticated-owner-only private workflow records and are not GEE evidence.
- Preview Studio continues blocking writes, and phase navigation or historical review must not create backend mutations in Preview Studio.
- Demo and scenario state remains non-persistent unless already governed by an approved local-only fixture system.
- Demo, QA, and scenario contexts must not spill into production or public data.
- Structural navigation must not bypass owner authorization, RLS, write restrictions, or existing preview safeguards.
- Viewed-phase state must not introduce a new write path.
- No RLS policy, grant, service credential, sharing rule, or public visibility behavior is authorized.

Any implementation proposal that requires a security, ownership, privacy, or sharing change requires a separate approved contract.

## 13. Backward Compatibility

Existing Sessions must remain compatible without destructive conversion or loss of evidence.

An approved implementation must:

- continue to resolve the canonical Session identity and existing lifecycle status;
- preserve all existing Germination data, method-specific behavior, images, notes, results, and history;
- preserve current Session ownership, privacy, routes, and authorized actions;
- default the viewed phase deterministically from the canonical current phase when no approved presentation state exists;
- tolerate legacy Sessions that lack future phase-specific data without fabricating evidence;
- preserve Capability 1 Task, Event, and Recent Activity boundaries;
- avoid requiring Growing setup, Grow Context, Reflection, or new schema fields; and
- avoid creating duplicate phase or Session records as a compatibility mechanism.

Exact legacy mappings or adapters, if any are found to be necessary, require architecture approval before implementation. This contract does not authorize a migration.

## 14. Acceptance Criteria

The structural implementation succeeds only when:

- Germination remains structurally and behaviorally unchanged except for permitted repairs;
- current and completed Germination retain the protected modules and full evidence visibility;
- completed Germination remains fully reviewable inside the same Session and Grow Companion;
- canonical current phase, viewed phase, and phase lifecycle state are independently represented;
- selecting or expanding a completed phase never reactivates it;
- viewing Germination while Growing is current leaves Growing current;
- the navigator clearly and accessibly identifies current, viewed, completed, and upcoming meanings;
- a return-to-current action exists whenever viewed and current phases differ;
- the current phase remains visually and programmatically obvious during historical review;
- upcoming phases expose no active controls;
- the Grow Companion shell persists while the phase composition changes;
- exactly one canonical Session, one Grow Companion shell, one canonical record per included phase, and no duplicate evidence source remain;
- existing Sessions remain compatible;
- security, privacy, ownership, authorship, and evidence attribution remain unchanged;
- no Growing setup, Reflection, GEE, scheduling, calendar, notification, or other non-goal is implemented; and
- no duplicate systems or unrelated behavior changes are introduced.

## 15. Verification Requirements

Before approval of an implementation, verification must demonstrate:

### Repository and change-scope verification

- `git diff --check` passes;
- the change inventory contains only files authorized by the approved implementation task;
- no unauthorized application code, schema, migration, test, runtime, or asset change exists;
- no pre-existing unrelated working-tree change was modified;
- no file was staged or committed unless a later task expressly authorizes it.

For this documentation-only contract task specifically, verification must confirm that only this contract was created by the task and that application code, schema, migrations, tests, runtime behavior, assets, and Germination were untouched.

### Structural regression verification

- representative Germination methods retain every applicable protected component;
- active Germination and completed Germination produce one copy of each protected module;
- completed Germination can be repeatedly opened, closed, and revisited without state corruption or duplication;
- full historical evidence remains present and no summary substitutes for it;
- current, viewed, and lifecycle states remain independent across all supported phase combinations;
- navigation and expansion produce no lifecycle or backend mutation;
- return-to-current changes presentation only;
- existing Sessions and Capability 1 records remain readable and correctly owned.

### Responsive and accessibility verification

- keyboard navigation, activation, focus visibility, and focus destination work;
- lifecycle status, viewed selection, unavailable state, and expansion state are programmatically distinguishable;
- state is not communicated by color alone;
- navigator and canonical content remain reachable without page-level horizontal overflow at representative mobile, tablet, and desktop widths;
- zoom and assistive-technology use do not remove evidence or controls.

The exact automated regression suite and complete fixture matrix remain subject to implementation planning, but they must cover the invariants above and must not narrow the Germination protection baseline.

## 16. Architecture Gaps

The following decisions remain unresolved and are not authorized by this contract:

- viewed-phase persistence across route changes, refresh, devices, or sign-in sessions — **TBD — Requires Architecture Approval**;
- upcoming-phase preview eligibility and preview limits — **TBD — Requires Architecture Approval**;
- lifecycle-transition eligibility and control ownership beyond existing behavior — **TBD — Requires Architecture Approval**;
- completed-phase editing and correction policy by record type — **TBD — Requires Architecture Approval**;
- correction auditability and user-visible provenance — **TBD — Requires Architecture Approval**;
- exact state transport and routing contract for viewed phase — **TBD — Requires Architecture Approval**;
- authoritative legacy compatibility mappings if current Session fields cannot express the canonical three-phase model — **TBD — Requires Architecture Approval**;
- final automated fixture matrix for all Germination methods and lifecycle combinations — **TBD — Requires Architecture Approval**.

The following broader composition decisions remain explicitly outside this slice: Growing entry and setup, Grow Context taxonomies, Growing and Reflection heroes, timeline evolution, phase summaries, Reflection composition, GEE integration, knowledge distillation, scheduling, calendar, and notifications.

An implementation must stop at the structural boundary rather than infer any unresolved rule.

## 17. Approval Gate

Implementation may begin only after architecture review confirms:

- this contract is approved;
- its interpretation remains consistent with FN-001, FN-003, FN-004, the Composition Specification, IC-GC-002A, and Capability 1;
- the protected Germination inventory and representative fixtures are documented and regression-testable;
- canonical current phase, viewed phase, and phase lifecycle state have separate authoritative definitions;
- the existing Session lifecycle source can support this slice without an unauthorized schema or migration;
- navigation behavior for completed, current, and upcoming phases is approved;
- historical review and return-to-current behavior are approved;
- the one-shell ownership boundary is approved;
- backward compatibility and security require no unapproved changes; and
- every architecture gap required by the proposed implementation approach is resolved.

Approval of IC-GC-002B authorizes only the structural implementation slice defined in Section 4. It does not implicitly approve any item in Section 5 or Section 16.
