# IC-GC-003D — Growing Workspace Temporal Projections

**Status:** Implementation Ready — Bounded Temporal Projection ICE Authorized

This implementation contract authorizes only the bounded projection slice below. It does not implement code, schema, migrations, persistence, or interface assets.

## 1. Purpose

Implement one Growing Workspace Temporal Projection layer that presents authorized canonical records through time.

The layer provides multiple temporal views over the same canonical Task and Event records. It owns presentation logic only: no domain record, persistence, identity, lifecycle, evidence, or chronology store.

## 2. Dependencies

Implementation must preserve:

- [FN-001 — Growing Conditions](../foundation-notes/FN-001-growing-conditions.md);
- [FN-003 — Canonical Entities & Representation](../foundation-notes/FN-003-canonical-entities-and-representation.md);
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../foundation-notes/FN-004-session-lifecycle-and-grow-companion.md);
- [Grow Companion Composition Specification](../../product/grow-sessions/grow-companion-composition-specification.md);
- [IC-GC-002C — Session Entry & Growing Foundation](./IC-GC-002C-session-entry-and-growing-foundation.md);
- [CS-GC-003 — Growing Workspace Composition Specification](../../product/grow-sessions/growing-workspace-composition-specification.md);
- [IC-GC-003A — Growing Workspace Shell](./IC-GC-003A-growing-workspace-shell.md);
- [AR-GC-003-01 — Workspace Time, State, Correction & Retention Semantics](../../architecture/AR-GC-003-01-workspace-time-state-correction-and-retention-semantics.md);
- [AR-GC-003-02 — Growing Workspace Event Semantics & Vocabulary](../../architecture/AR-GC-003-02-growing-workspace-event-semantics-and-vocabulary.md);
- [IC-GC-003B — Growing Workspace Tasks](./IC-GC-003B-growing-workspace-tasks.md); and
- [IC-GC-003C — Growing Workspace Events](./IC-GC-003C-growing-workspace-events.md).

Those documents remain authoritative for Task and Event identity, ownership, context, time, compatibility, privacy, authorization, and mutation. This contract does not redefine them.

Repository inspection identifies existing Task projections and Recent Activity composition as projection logic to evolve or reuse. Existing Session lifecycle and setup timelines remain independently owned and must not be replaced or reinterpreted as workspace-record projections.

## 3. Scope

This contract implements only:

- one shared temporal projection of authorized canonical Tasks and Events;
- Timeline and Calendar views over that projection;
- deterministic temporal organization under the source records' approved semantics;
- presentation-only temporal navigation;
- presentation-only filtering; and
- focused proof of projection, ownership, and non-mutation boundaries.

Desktop and mobile use the same source records and projection rules. Responsive presentation creates no separate model.

## 4. Canonical Responsibility

The Temporal Projection layer presents canonical records through time.

It owns:

- zero domain records;
- zero persistence;
- zero identity;
- zero lifecycle;
- zero evidence; and
- zero independent authorization.

Timeline and Calendar are independent presentations of one shared projection. Neither view creates, copies, corrects, deletes, completes, or otherwise mutates a source record.

The workspace Timeline is not the Session lifecycle Timeline, phase navigation, setup progress, or another canonical chronology. It may show only projected workspace records authorized by this contract.

## 5. Projection Sources

First-version sources are exclusively:

- canonical Tasks governed by IC-GC-003B; and
- canonical Events governed by IC-GC-003C.

The projection preserves each source record's canonical identity and source capability. It creates no projection identity and stores no projection copy.

Notes, Photos, Documents, Germination evidence, Growing evidence, lifecycle records, Reports, Reflection, GEE, Seed Vault knowledge, technical activity, demo controls, and QA or scenario metadata are not projection sources in this slice.

## 6. Projection Rules

Tasks project only through their approved due semantics. Events project only through their approved occurrence semantics.

The shared projection must:

- use production Task and Event mapping and classification rather than duplicate them;
- preserve Task-versus-Event meaning;
- preserve source identity, canonical Session ownership, and authorized narrower context;
- apply AR-GC-003-01 chronology and local-display semantics;
- keep date-only values on their stored calendar date;
- order canonical instants by their resolved UTC instant while preserving approved local display meaning;
- retain deterministic approved compatibility behavior;
- exclude invalid temporal compatibility data from dated placement; and
- update immediately when an authorized source record is corrected or deleted, without persisting projection state.

Records without an eligible temporal value are not assigned a fabricated date or instant. Projection reads perform no normalization, compatibility rewrite, backfill, or source mutation.

Recent Activity may share the canonical projection mapping, but this contract does not create another activity store or broaden its source set.

## 7. Navigation

Timeline and Calendar support movement through temporal ranges appropriate to their presentation.

Navigation:

- changes only the visible temporal range or focus;
- never changes source records, lifecycle, phase state, or evidence;
- creates no route-authoritative or backend state;
- requires no persistence; and
- remains deterministic for the same authorized source data and presentation state.

Exact controls, range sizes, labels, gestures, and layout are implementation details for the ICE.

## 8. Filtering

First-version filtering may change visibility by projected source capability and by the temporal range already represented by the view.

Filtering:

- operates only on the authorized read projection;
- preserves the complete canonical source set;
- performs no source correction, deletion, completion, or context change;
- creates no stored filter or projection record; and
- introduces no new domain vocabulary or authorization boundary.

Additional filters require no architectural redesign when they remain presentation-only and use already-authorized source fields. Persistent preferences or new semantic classifications require separate authority.

## 9. Privacy and Authorization

The layer may project only records already authorized for the current owner through their canonical Session.

It inherits source-record privacy and authorization completely. It introduces no independent owner field, RLS policy, grant, public read path, sharing behavior, or cross-Session aggregation authority.

Owner isolation, same-Session context validation, anonymous restrictions, Preview Studio write blocking and non-persistence, and demo, QA, scenario, and production isolation remain unchanged. Navigation and filtering cannot bypass those boundaries.

## 10. Implementation Boundary

This contract does not implement or authorize:

- Task or Event identity, persistence, validation, correction, completion, or deletion;
- Calendar records, Timeline records, projection snapshots, caches as production authority, schema, or migrations;
- Session or phase lifecycle presentation changes;
- source-record creation or mutation from Timeline or Calendar;
- reminders, notifications, recurrence, scheduling, automation, or AI;
- Notes, Photos, Documents, attachments, Reports, Reflection, GEE, or Seed Vault writes;
- public sharing, Community publication, or cross-owner aggregation; or
- exact visual design, components, styling, breakpoints, or control placement.

## 11. Implementation Acceptance Criteria

A bounded ICE must prove:

1. Timeline and Calendar consume one shared production projection of canonical Tasks and Events.
2. No projection record, identity, table, migration, miscellaneous JSON, browser authority, Calendar store, or Timeline store is created.
3. Task due forms and Event occurrence forms project according to their authoritative contracts.
4. Date-only, canonical-instant, approved legacy, missing, and invalid temporal values retain their approved deterministic treatment.
5. Invalid temporal records receive no dated placement.
6. Task and Event identities, meanings, Session ownership, and authorized context remain unchanged.
7. Corrections and deletions are reflected by recomputation from canonical sources, not projection mutation.
8. Timeline remains distinct from Session lifecycle and setup timelines.
9. Navigation and filtering change presentation only and issue no source or backend mutation.
10. Owner isolation and source authorization constrain every projected view.
11. Preview Studio remains non-persistent and navigation/filtering introduce no write path.
12. Desktop and mobile use the same source set and projection model.
13. Existing Task, Event, Recent Activity, lifecycle, Growing, and security regressions remain passing.

Focused non-Docker regression must execute production Task/Event mapping and projection paths. It must cover deterministic ordering and placement, compatibility and invalid-value boundaries, view consistency, source correction/deletion reflection, navigation/filter non-mutation, owner scoping, Preview Studio, and responsive-model parity.

Live database verification remains separate and must not be inferred from test doubles or static inspection.

## 12. Recommended Execution Slice

No unresolved architecture decision blocks this bounded slice.

One Temporal Projection ICE is authorized to implement:

- one shared read-only Task/Event temporal projection;
- Timeline and Calendar presentations of that projection;
- presentation-only navigation and filtering; and
- the focused proof required by Section 11.

The ICE must reuse the existing canonical Task, Event, Grow Companion, and workspace seams. It must not introduce persistence, redesign Session lifecycle Timeline behavior, or implement any deferred capability.
