# CS-GC-003 — Growing Workspace Composition Specification

**Status:** Draft — Requires Architecture Approval
**Product Area:** Grow Sessions
**Authority:** FN-001 / FN-003 / FN-004 / Grow Companion Composition Specification / IC-GC-002A / IC-GC-002B / IC-GC-002C
**Scope:** Architecture-only composition of operational capabilities beneath the closed Growing Foundation

## 1. Purpose

This specification defines how operational workspace capabilities compose beneath the Growing Summary and Plant Group surface.

It establishes capability ownership, evidence boundaries, time semantics, canonical context, lifecycle independence, privacy, derived surfaces, and implementation order. It does not implement capabilities, authorize schema changes, reopen the Growing Foundation, or create implementation contracts.

## 2. Fixed Architectural Position

This specification inherits:

- [FN-001 — Growing Conditions](../../foundation/foundation-notes/FN-001-growing-conditions.md)
- [FN-003 — Canonical Entities & Representation](../../foundation/foundation-notes/FN-003-canonical-entities-and-representation.md)
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../../foundation/foundation-notes/FN-004-session-lifecycle-and-grow-companion.md)
- [Grow Companion Composition Specification](./grow-companion-composition-specification.md)
- [IC-GC-002A — Session Context Foundation](../../foundation/implementation-contracts/IC-GC-002A-session-context-foundation.md)
- [IC-GC-002B — Grow Companion Structural Foundation](../../foundation/implementation-contracts/IC-GC-002B-grow-companion-structural-foundation.md)
- [IC-GC-002C — Session Entry and Growing Foundation](../../foundation/implementation-contracts/IC-GC-002C-session-entry-and-growing-foundation.md)
- [Grow Companion Capability 1 — Tasks, Events, and Activity](../../architecture/grow-companion-capability-1.md)

The closed Growing structure remains:

```text
Session
└── zero or one Growing Phase
    └── zero or more Plant Groups
```

The workspace composes beneath that structure. It may attach records to canonical Session, Growing Phase, or Plant Group identities, but it does not redefine their identity, lifecycle, persistence, or evidence.

The workspace is not one persisted object, a second Grow Companion, or a second evidence store.

## 3. Canonical Workspace Composition

The workspace has four bounded areas:

| Area | Capabilities | Canonical role |
|---|---|---|
| Work | Tasks, Events | Intention and recorded occurrence |
| Journal | Notes, Photos | Narrative and supporting visual media |
| References | Documents | Supporting reference material |
| Calendar | Dated Task and Event projection | Read-only navigation, grouping, and filtering |

Each capability remains independently ownable, evolvable, implementable, and testable. Layout may compose them together without merging their responsibilities or persistence.

Calendar owns no canonical record. Selected date, filters, and view mode are presentation state.

## 4. Capability Ownership

### 4.1 Tasks

Tasks own intended user work. A Task may own identity, title, optional description, `due_at`, completion state, `completed_at`, and optional canonical context.

A Task is intention, not proof that work occurred. Completing it must not create an Event or mutate Session lifecycle, Growing Phase evidence, Plant Group evidence, or Germination evidence.

Capability 1 remains the canonical owner of existing private Task records.

### 4.2 Events

Events own factual user-recorded occurrences. An Event may own identity, event type, `occurred_at`, optional description, and optional canonical context.

An Event records that something occurred. It must not silently advance lifecycle or alter structured Germination, Growing Phase, or Plant Group evidence.

Capability 1 remains the canonical owner of existing private Event records.

### 4.3 Calendar

Calendar projects dated Tasks and Events. It may navigate, group, and filter those records, but it owns no independent evidence, schedule record, or chronology.

Calendar state is interface state. A Calendar implementation reads Tasks and Events through their canonical capability contracts and does not own their mutation behavior.

### 4.4 Notes

Notes own user-authored narrative observations. A Note may have optional canonical context.

Notes must not substitute for structured lifecycle, Germination, Growing Phase, Plant Group, Task, or Event fields.

### 4.5 Photos

Photos own uploaded or captured visual media and required media metadata. A Photo may have optional canonical context.

Photos are supporting media. They are not automatically interpreted, classified, or extracted into structured evidence.

### 4.6 Documents

Documents own attached reference material and required file metadata. A Document may have optional canonical context.

Documents are supporting references, not a general-purpose file system and not canonical Growing evidence.

## 5. Evidence Boundaries

The fixed distinctions are:

| Capability | Meaning |
|---|---|
| Task | Intended work |
| Event | Recorded occurrence |
| Note | Narrative context |
| Photo | Supporting visual media |
| Document | Supporting reference material |
| Calendar | Projection |

No workspace capability may automatically create, change, complete, publish, or replace:

- Session or phase lifecycle;
- Germination, Growing Phase, or Plant Group evidence;
- Seed Vault records;
- Reflection or Session Reports;
- GEE evidence, interpretation, or knowledge;
- Community or public content.

Workspace records are user-produced Session records, but that does not make every record eligible GEE evidence. GEE retains eligibility, lineage, confidence, interpretation, and knowledge-distillation authority.

Any future conversion from workspace content into canonical structured evidence requires explicit user action and a separate approved implementation contract. The source record and provenance must remain intact.

## 6. Time Semantics

Time fields have capability-specific meanings:

| Field | Meaning |
|---|---|
| `due_at` | When a Task is due |
| `completed_at` | When a Task was completed |
| `occurred_at` | When an Event occurred |
| `captured_at` | When a Photo was captured, when known |
| `created_at` | When a record entered Grow |
| `updated_at` | When a record was last changed |

No generic date field may change meaning by capability.

This specification does not define expected vegetative or flowering timing, milestones, reminders, notifications, recurrence, or recommendations.

## 7. Context and Ownership Model

Every workspace record is owned through exactly one canonical Session boundary.

A record may additionally reference:

- the Session only;
- the Session and its Growing Phase; or
- the Session, its Growing Phase, and one Plant Group.

Narrower context never replaces Session ownership. Every referenced Growing Phase and Plant Group must belong to the same Session; a Plant Group context must resolve through its canonical parent Growing Phase.

Context relationships use canonical identities and explicit validated relationships. They must not use miscellaneous polymorphic JSON, string-based entity references, or duplicated Session, phase, or Plant Group identities.

This specification does not authorize Task-to-Task dependencies, Event-to-Event dependencies, arbitrary cross-capability graphs, or Task- or Event-specific attachments.

## 8. Lifecycle Independence

- Creating workspace content does not activate Growing.
- Completing a Task does not complete Growing or the Session.
- Recording an Event does not advance lifecycle.
- Deleting workspace content does not delete or rewrite canonical Germination, Growing Phase, or Plant Group evidence.
- Workspace records remain reviewable after phase or Session completion.
- Completed phases remain visible under the existing historical-review contract.
- Lifecycle changes do not silently delete, hide, relocate, or reinterpret workspace records.
- Historical review does not reactivate workspace records or grant new write authority.

## 9. Privacy and Access

Workspace records are owner-private by default. Read and write access derives from canonical Session ownership and must preserve existing authorization, RLS, Preview Studio, demo, QA, scenario, and production-data boundaries.

- No workspace record is automatically published to Community or public surfaces.
- No automatic social sharing is authorized.
- Preview Studio remains non-persistent and blocks writes.
- Photos and Documents inherit the same Session ownership boundary as Tasks, Events, and Notes.
- Derived surfaces may expose only records the consumer is authorized to read.
- Future sharing requires separate architecture and explicit owner action.

This specification does not design sharing behavior or authorize new grants, policies, roles, credentials, or public visibility.

## 10. Derived Surfaces

Derived surfaces are read-only projections over canonical workspace records:

| Surface | Contributing records |
|---|---|
| Today | Incomplete Tasks due today; Events occurring today |
| Upcoming | Incomplete Tasks due after today |
| Open Tasks | Incomplete Tasks |
| Recent Activity | Completed Tasks and Events, preserving their distinct meanings |
| Calendar | Dated Tasks and Events |
| Plant Group activity | Context-associated Tasks, Events, Notes, Photos, and Documents |

These surfaces may group, sort, filter, and navigate. They must not persist duplicate records or become new evidence, activity, calendar, or timeline systems.

## 11. Responsive Composition

On desktop, the Growing Summary and Plant Groups remain primary. Workspace areas may coexist through tabs, panels, or grouped surfaces, but layout never transfers capability ownership.

On mobile, one primary workspace surface may be presented at a time using progressive disclosure and compact creation actions.

All layouts preserve the same canonical records, evidence contract, access boundary, and capability availability. No separate mobile data model or reduced evidence contract is permitted.

This specification does not prescribe components, breakpoints, styling, or exact control placement.

## 12. Deferred Capabilities

The following remain outside this specification:

- reminders and notifications;
- recurring Tasks and automation;
- Task dependencies;
- Task- or Event-specific attachments;
- arbitrary cross-capability relationships;
- AI interpretation or classification;
- GEE recommendations;
- environmental sensor ingestion;
- nutrient programs and issue diagnosis;
- expected phase timing and milestones;
- partial harvest and yield;
- Reflection and Session Reports;
- knowledge distillation and Seed Vault write-back;
- public sharing and social publishing;
- general file management.

## 13. Recommended Contract Sequence

1. **Workspace Shell and Shared Ownership Contract** — composition boundary, common owner authorization, canonical context validation, historical review, and shared regression invariants; no monolithic workspace persistence.
2. **Tasks Contract** — evolve the existing Capability 1 Task model without replacing it.
3. **Events and Calendar Projection Contract** — evolve canonical Events, then project dated Tasks and Events without Calendar persistence.
4. **Notes Contract** — private narrative records and canonical context.
5. **Photos Contract** — private media, metadata, storage security, and canonical context.
6. **Documents Contract** — private reference files, metadata, storage security, and canonical context.

Events and Calendar belong in one contract because Calendar has no responsibility independent from the dated Task and Event records it projects. The remaining capabilities can be implemented and audited independently.

## 14. Acceptance Principles

Future contracts and implementations must demonstrate:

- no workspace monolith;
- no duplicate lifecycle, evidence, identity, chronology, or Calendar persistence;
- no miscellaneous association JSON or string-based canonical references;
- no silent structured-evidence mutation;
- no public exposure by default;
- no disappearance after phase or Session completion;
- no premature automation, recommendation, or intelligence architecture;
- preserved Task/Event domain separation and Capability 1 compatibility;
- validated Session ownership for every narrower context;
- independent implementation and auditability for every capability.

## 15. Genuine Unresolved Decisions

Only decisions that block a future capability contract remain unresolved:

- instant, time-zone, and local-civil-time rules for `due_at`, `occurred_at`, and `captured_at` — **TBD — Requires Architecture Approval before the Tasks, Events, or Photos contract**;
- Event type vocabulary, custom-type policy, and compatibility mapping for existing neutral categories — **TBD — Requires Architecture Approval before the Events contract**;
- completed-phase and completed-Session correction, deletion, retention, and visible-provenance policy for each workspace record type — **TBD — Requires Architecture Approval before capability-specific mutation contracts**;
- Photo `captured_at` provenance and precedence among device metadata, upload metadata, and explicit owner correction — **TBD — Requires Architecture Approval before the Photos contract**;
- Photo and Document file-type, size, storage, malware-scanning, retention, and download-security requirements — **TBD — Requires Architecture and Security Approval before their contracts**.

Implementation details such as exact UI composition, pagination, empty-state copy, storage representation, and API shape belong in future implementation contracts and are not architecture gaps here.
