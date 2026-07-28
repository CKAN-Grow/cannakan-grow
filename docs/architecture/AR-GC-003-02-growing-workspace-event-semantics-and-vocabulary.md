# AR-GC-003-02 — Growing Workspace Event Semantics & Vocabulary

**Status:** Draft — Requires Architecture Approval
**Applies to:** Growing Workspace Events and their read-only projections

## 1. Purpose

Define what Grow treats as a user-recorded Event and provide the Event-specific
semantic authority required by the committed Event and temporal-projection
contracts.

An Event is a factual occurrence recorded within one canonical Session. This
resolution reconciles the Event authority expected by committed consumers. It
does not implement Events, Timeline, or Calendar and does not reopen approved
workspace, ownership, time, correction, deletion, privacy, evidence, Session
Conditions, or lifecycle architecture.

## 2. Decision Context

This resolution inherits, without redefining:

1. the [Grow Foundation](../foundation/grow-foundation.md), [Grow
   Philosophy](../philosophy/grow-philosophy.md), and [Grow Platform
   Architecture](../platform/grow-platform-architecture.md);
2. applicable canonical Foundation authority:
   - [FN-001 — Growing Conditions](../foundation/foundation-notes/FN-001-growing-conditions.md);
   - [FN-003 — Canonical Entities & Representation](../foundation/foundation-notes/FN-003-canonical-entities-and-representation.md);
   - [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../foundation/foundation-notes/FN-004-session-lifecycle-and-grow-companion.md);
   - [FN-005 — Canonical Session Conditions](../foundation/foundation-notes/FN-005-canonical-session-conditions.md);
   - [FN-006 — Canonical Phase Commencement and Lifecycle Chronology](../foundation/foundation-notes/FN-006-canonical-phase-commencement-and-lifecycle-chronology.md);
   - [FN-007 — Intentional Transition from Germination to Growing](../foundation/foundation-notes/FN-007-intentional-transition-from-germination-to-growing.md);
   - [FN-GC-004 — Growing Workspace Notes Foundation](../foundation/foundation-notes/FN-GC-004-growing-workspace-notes-foundation.md);
   - [FN-GC-005 — Workspace Foundation](../foundation/foundation-notes/FN-GC-005-workspace-foundation.md); and
   - [FN-GC-008 — Grow Companion Foundation](../foundation/foundation-notes/FN-GC-008-grow-companion-foundation.md);
3. applicable Product Composition authority:
   - [CS-GC-003 — Growing Workspace Composition Specification](../product/grow-sessions/growing-workspace-composition-specification.md);
   - [CS-GC-004 — Growing Workspace Notes Composition Specification](../product/grow-sessions/growing-workspace-notes-composition-specification.md);
   - [CS-GC-005 — Workspace Composition Specification](../product/grow-sessions/workspace-composition-specification.md);
   - [CS-SC-001 — Session Conditions Composition](../product/grow-sessions/session-conditions-composition-specification.md);
   - [CS-SC-001A — Initial Session Conditions Dimensions and Existing Truth](../product/grow-sessions/session-conditions-initial-dimensions-composition-specification.md); and
   - [CS-SC-001B — Canonical Growing Commencement and Legacy Chronology](../product/grow-sessions/session-conditions-growing-commencement-and-legacy-chronology-composition-specification.md); and
4. [AR-GC-003-01 — Workspace Time, State, Correction & Retention
   Semantics](./AR-GC-003-01-workspace-time-state-correction-and-retention-semantics.md),
   which remains authoritative for shared time, correction, deletion,
   retention, and provenance semantics.

[IC-GC-003B — Growing Workspace
Tasks](../foundation/implementation-contracts/IC-GC-003B-growing-workspace-tasks.md)
remains independently authoritative for Task identity, intention, due meaning,
state, and operations.

The following committed contracts are subordinate consumers of this resolution
and do not retroactively create Event architecture:

- [IC-GC-003C — Growing Workspace Events](../foundation/implementation-contracts/IC-GC-003C-growing-workspace-events.md);
- [IC-GC-003D — Growing Workspace Temporal Projections](../foundation/implementation-contracts/IC-GC-003D-growing-workspace-temporal-projections.md); and
- [IC-GC-004 — Growing Workspace Notes](../foundation/implementation-contracts/IC-GC-004-growing-workspace-notes.md).

The earlier [Grow Companion Composition
Specification](../product/grow-sessions/grow-companion-composition-specification.md)
is draft historical Product input. It does not supersede the later Foundation,
Product, Event, or temporal-projection authority listed above.

The existing private `grow_session_events` capability is the canonical Event
capability to evolve. This resolution creates no second Event identity, table,
chronology, or persistence path.

## 3. Canonical Event Responsibility

A Growing Workspace Event is an owner-recorded factual occurrence that happened
within the context of one Session.

An Event may narrate what occurred. Event title and description remain content
of that Event; they are not a canonical Note. A dated Note is not automatically
an Event, and narrative inside an Event does not transfer identity, authorship,
correction, deletion, or visibility authority to Notes.

An Event is not intended work, a Task, reminder, notification, lifecycle state,
phase commencement, Session Condition, condition period, structured
Germination or Growing evidence, Plant Group evidence, Calendar or Timeline
record, Recent Activity entry, technical activity log, audit record, or
GEE-derived knowledge.

Recording or correcting an Event changes only that Event. It never silently
mutates lifecycle, structured evidence, another workspace capability, or
reference knowledge.

## 4. Event Origin

First-version canonical Events are **user-created only**.

Edits, Task transitions, application logs, security logs, synchronization
activity, imports, projections, and audit records do not create Events.
Automatic system Events require separate architecture.

Existing records whose stored origin is `system` or `testing_program` remain
compatibility data. They are not relabelled as user Events, deleted, or used to
authorize new non-user creation. Demo and QA fixtures remain governed by their
existing non-production boundaries.

Existing absent or null origin remains legacy origin-unknown compatibility
data. User origin is not inferred. Any other unknown non-null origin remains
invalid compatibility data. Compatibility reads preserve the stored origin
value and classification without relabelling, normalization, backfill, or
rewrite. This resolution authorizes no origin-correction operation. Any future
origin correction requires separate governing authority and must not authorize
new non-user Event creation.

## 5. Minimum Event Record

The minimum canonical Event record owns:

- one stable Event identity;
- one canonical Session relationship, from which owner authority is derived;
- optional canonical Growing Phase context from that Session;
- optional canonical Plant Group context resolving through that Growing Phase and Session;
- one canonical Event type;
- one occurred value using an approved time form;
- optional title;
- optional description;
- immutable `created_at`; and
- current `updated_at`.

An `other` Event requires enough Session-specific title or description to identify what occurred. That text remains content of the Event and never becomes a global type.

No arbitrary metadata JSON, duplicate owner identity, generic association field, state field, schedule field, attachment field, or speculative domain field is authorized.

## 6. Canonical Event Vocabulary

The first-version canonical values are:

| Canonical value | Qualifies | Does not qualify | Boundary |
|---|---|---|---|
| `observation` | A factual condition, change, or result the owner noticed | A diagnosis, intended inspection, or automatic sensor reading | Owner-recorded narrative occurrence only; future structured observation capabilities may supersede specific uses |
| `maintenance` | Completed routine physical care or upkeep | Planned work, reminders, nutrient recipes, or equipment telemetry | Owner-recorded narrative occurrence only; a future structured maintenance capability may supersede specific uses |
| `environment` | A factual environmental occurrence or owner-recorded environmental change | Continuous sensor data, target settings, Growing-context configuration, or a canonical Session Condition operation | Owner-recorded narrative occurrence only; it does not establish or alter Session Conditions |
| `treatment` | A treatment or intervention that actually occurred | Diagnosis, recommendation, schedule, or nutrient taxonomy | Owner-recorded narrative occurrence only; future treatment records may supersede specific uses |
| `transplant` | A plant or Plant Group was physically transplanted | A plan to transplant or an automatic phase transition | Owner-recorded narrative occurrence only; future structured transplant evidence may supersede it |
| `harvest` | A harvest-related occurrence happened | Canonical harvest state, count, yield, partial-harvest allocation, or Session completion | Owner-recorded narrative occurrence only; future structured harvest evidence may supersede it |
| `issue` | A problem or adverse occurrence was observed | A diagnosis, inferred cause, recommendation, or GEE conclusion | Owner-recorded narrative occurrence only; future issue or diagnosis capabilities may supersede specific uses |
| `other` | A factual occurrence outside the approved types | A reusable custom taxonomy or global canonical term | Session-specific narrative only; a future approved type may replace it only through owner correction |

Vocabulary extension requires explicit architecture. Labels and presentation
wording may vary without changing these stored values.

Existing `observation`, `transplant`, `environment`, and `harvest` values retain
their canonical meaning. Existing `plant-health`, `nutrition`, null, and
unknown non-null values are compatibility values: they remain preserved and
distinguishable, are not silently mapped, and require explicit owner correction
before becoming a new canonical type.

## 7. Time Semantics

An Event occurrence supports exactly two first-version forms under
AR-GC-003-01:

1. **Date only** — the occurrence is known to have happened on a calendar date,
   without a time of day or time-zone conversion.
2. **Canonical instant** — the occurrence happened at a specific moment and
   preserves UTC instant, entered local civil time, IANA zone, and resolved
   offset.

Date-only Events and instant Events may be projected by their recorded date
semantics. Chronological ordering of canonical instants uses UTC.

Approximate and undated values are not first-version canonical occurrence
forms. An absent occurrence remains missing compatibility data, receives no
guessed date, and enters no dated projection. `created_at`, `updated_at`,
import time, synchronization time, projection time, and display time never
substitute for Event occurrence.

Compatibility for existing values is deterministic:

- valid `occurred_date` with no `occurred_time` is date only;
- valid date plus time without a recorded zone and offset is a legacy local
  timed occurrence, not a canonical instant;
- missing or malformed non-null occurrence data remains invalid compatibility
  data;
- no missing zone, offset, date, time, or instant is inferred; and
- read compatibility never rewrites stored values.

On correction of legacy or invalid occurrence time, the owner must explicitly
choose date only or a resolved canonical instant.

Scheduled, due, expected, recurring, reminder, and notification time remain
outside this resolution.

## 8. Correction and Deletion

AR-GC-003-01 applies without alteration:

- correction updates the same Event identity in place;
- `created_at` remains immutable;
- `updated_at` advances;
- correction creates no revision chain, replacement identity, or audit Event;
- owner deletion hard-deletes the Event;
- no tombstone, archive, or hidden retention record is introduced; and
- derived projections immediately reflect correction or deletion.

Events own no workflow state and cannot be reopened or completed.

## 9. Evidence and Capability Boundaries

An Event is an owner-recorded occurrence with attributable provenance. Its
existence does not automatically establish verification, causation, success or
failure, diagnosis, scientific validity, recommendation, condition
applicability, lifecycle truth, or GEE eligibility.

An Event may describe an occurrence but cannot automatically:

- complete, reopen, create, or edit a Task;
- create, absorb, correct, delete, or change the authorship or visibility of a
  Note;
- create or alter Germination evidence;
- create, commence, complete, reopen, reverse, or make current a Session
  lifecycle phase;
- establish, substitute for, or reconstruct canonical phase commencement or
  lifecycle chronology;
- create, correct, close, normalize, or derive a Session Condition, condition
  period, applicability boundary, provenance value, or Current Conditions
  projection;
- change Growing Phase context or lifecycle;
- change Plant Group count, type, sex, identity, or harvested state;
- complete or reinterpret a Session;
- write Seed Vault knowledge;
- create a report or Reflection; or
- create GEE evidence, interpretation, or knowledge.

Any future conversion from narrative Event content into a Note, Session
Condition, structured evidence, or another canonical capability requires
separate architecture, explicit owner confirmation, and preservation of both
capabilities' ownership boundaries.

GEE remains the independent downstream evidence-interpretation authority. It
may consume an Event only through separately approved eligibility and
provenance-preserving authority. Presentation beside another canonical record
creates no relationship, conversion, or evidence elevation.

## 10. Ownership and Privacy

Every Event belongs to exactly one canonical Session. Session ownership is authoritative.

Optional Growing Phase and Plant Group context is association, not ownership. The phase must belong to the Event's Session; a Plant Group must resolve through that phase and Session. Cross-Session context is invalid.

Events are owner-private by default. No Event is automatically published to Community, public, or social surfaces. Preview Studio remains non-persistent, and demo, QA, scenario, and production data retain their existing isolation. Desktop and mobile use one Event model.

## 11. Derived Surfaces

The following read-only surfaces may project authorized canonical Events:

- **Calendar** — date navigation, grouping, and filtering alongside dated Tasks;
- **Recent Activity** — a derived presentation of authorized Events and
  completed Tasks, not a canonical activity record or store;
- **Plant Group Activity** — Events explicitly associated with that Plant Group;
  and
- **Workspace Timeline** — chronological review through the same shared
  Task-and-Event temporal projection consumed by Calendar.

Timeline and Calendar consume the same authorized projection and preserve
source identity, Task-versus-Event meaning, Event occurrence semantics, and
source authorization. Deterministic ordering is projection behavior. Neither
surface creates a second Event store, source set, chronology, cache as
authority, or persistence.

The Workspace Timeline is not the Session lifecycle Timeline, phase
navigation, setup progress, canonical phase commencement, or another lifecycle
chronology. An Event's presence, absence, ordering, or placement in any derived
surface cannot create, prove, reverse, or reconstruct lifecycle truth.

These surfaces own no Event identity, persistence, mutation, evidence,
authorization, or lifecycle behavior. Removing a surface or removing an Event
from a projection does not delete or invalidate the source Event. Presentation
cannot manufacture Event meaning, occurrence, origin, vocabulary, ownership,
or provenance. This resolution does not implement or redesign any surface.

Reports, Reflection, and GEE consumption remain unauthorized. Future contracts
may permit them to read approved Events without transferring Event ownership.

## 12. Existing-Capability Compatibility

Repository inspection identifies:

- `grow_session_events` as an existing owner-private canonical Event store;
- existing Event create, read, update, and delete behavior as the capability to
  evolve;
- Recent Activity as a derived projection of Events and completed Tasks;
- Workspace Timeline and Calendar as presentations of the committed shared
  Task-and-Event temporal projection, not Event stores;
- lifecycle and Session lifecycle Timeline structures as independently owned
  canonical chronology surfaces; and
- technical, demo, QA, and scenario activity as non-canonical or
  boundary-governed data.

The Events contract must evolve `grow_session_events`, its canonical mapping,
and its owner-authorized mutation path. It must preserve existing Event
identities and raw compatibility values, add no parallel Event model, and close
schema-snapshot parity as part of its implementation scope.

Compatibility reads preserve raw identity, Session relationship, narrower
context, origin, type, occurrence, title, and description values without
normalization, backfill, or source mutation. Compatibility classification does
not itself make an invalid or legacy value canonical.

## 13. Deferred Decisions

The following remain deferred:

- Calendar interface design;
- reminders, notifications, recurrence, and scheduling;
- Task-to-Event conversion;
- automatic or system-created Events;
- sensor ingestion and telemetry;
- nutrient schedules and taxonomies;
- issue diagnosis;
- structured harvest, partial harvest, and yield evidence;
- attachments, Event-to-Note conversion, and Photos;
- Reports, Reflection, and GEE;
- public sharing; and
- future Event vocabulary extensions.

None changes the authority of the committed bounded Event contract or the
separate shared temporal-projection contract. Each deferred capability requires
its own governing authority before it may expand Event or projection behavior.

## 14. Contract Reconciliation

The committed [IC-GC-003C — Growing Workspace
Events](../foundation/implementation-contracts/IC-GC-003C-growing-workspace-events.md)
is the bounded Event consumer of this resolution. It governs evolution of the
existing canonical Event capability, compatibility mapping, optional
same-Session context, the two occurred-time forms, owner mutation, security,
and implementation proof.

The committed [IC-GC-003D — Growing Workspace Temporal
Projections](../foundation/implementation-contracts/IC-GC-003D-growing-workspace-temporal-projections.md)
is the separate projection consumer. It governs the one shared read-only
Task-and-Event projection and its Workspace Timeline and Calendar
presentations. It owns no Event behavior or persistence.

Approval of this resolution reconciles the missing architecture dependency
named by those committed contracts. It does not amend, expand, duplicate, or
reauthorize either contract, authorize another implementation slice, or
retroactively convert implementation precedent into architecture.

This resolution authorizes no implementation. After approval it must complete
repository-safety verification and its own attributable Git closure before it
may be treated as governing authority.

## 15. Acceptance Principles

Downstream contracts and implementations must preserve:

1. one stable canonical Event identity and one canonical Session owner;
2. user-recorded factual occurrence semantics;
3. the approved minimal vocabulary and explicit compatibility boundaries;
4. date-only and canonical-instant occurrence semantics under AR-GC-003-01;
5. optional validated same-Session phase and Plant Group context;
6. in-place correction and owner hard deletion;
7. owner privacy and identical desktop/mobile semantics;
8. no Event state, activity-log masquerading, or automatic system Events;
9. complete origin compatibility without inference or read-time rewrite;
10. no silent Task, Note, Session Conditions, lifecycle, structured-evidence,
    Seed Vault, Reflection, report, or GEE mutation;
11. lifecycle commencement and chronology remain independently authoritative;
12. one shared read-only temporal projection with no Timeline, Calendar, or
    Recent Activity persistence;
13. evolution of the existing canonical capability without duplicate
    persistence;
14. Presentation creates no Event meaning or authority; and
15. explicit architecture approval for future vocabulary extension.
