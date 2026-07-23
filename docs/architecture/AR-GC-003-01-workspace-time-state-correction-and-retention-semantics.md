# AR-GC-003-01 — Workspace Time, State, Correction & Retention Semantics

**Status:** Draft — Requires Architecture Approval
**Applies to:** Growing Workspace Tasks, Events, Notes, Photos, and Documents

## 1. Purpose

Establish one shared semantic foundation for time, mutable state, correction, deletion, retention, and provenance across Growing Workspace records.

Calendar remains a read-only projection of dated Tasks and Events and owns none of these records or rules.

This resolution closes shared architecture gaps only. It does not implement capabilities or reopen canonical ownership, evidence, privacy, lifecycle, or workspace-composition decisions.

## 2. Decision Context

This resolution is governed by:

- [FN-001 — Growing Conditions](../foundation/foundation-notes/FN-001-growing-conditions.md);
- [FN-003 — Canonical Entities & Representation](../foundation/foundation-notes/FN-003-canonical-entities-and-representation.md);
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../foundation/foundation-notes/FN-004-session-lifecycle-and-grow-companion.md);
- [Grow Companion Composition Specification](../product/grow-sessions/grow-companion-composition-specification.md);
- [IC-GC-002C — Session Entry & Growing Foundation](../foundation/implementation-contracts/IC-GC-002C-session-entry-and-growing-foundation.md);
- [CS-GC-003 — Growing Workspace Composition Specification](../product/grow-sessions/growing-workspace-composition-specification.md);
- [IC-GC-003A — Growing Workspace Shell](../foundation/implementation-contracts/IC-GC-003A-growing-workspace-shell.md); and
- [IC-GC-003B — Growing Workspace Tasks](../foundation/implementation-contracts/IC-GC-003B-growing-workspace-tasks.md).

Every workspace record remains owned through exactly one canonical Session. Optional Growing Phase and Plant Group context remains explicit, canonical, same-Session, and validated. Workspace records remain owner-private, lifecycle-independent, and reviewable after Session completion.

Calendar and all other derived surfaces project canonical capability records. They do not duplicate persistence or become chronology, evidence, or lifecycle systems.

## 3. Canonical Time Model

### 3.1 Time kinds

Workspace records use two distinct time kinds:

1. **Instant** — a specific moment on the global timeline.
2. **Date only** — a calendar date with no time of day or time-zone conversion.

A field must declare one kind. A date-only value must never be converted to UTC midnight or shifted because of location.

### 3.2 User-entered local time

When a user enters a local date and time that represents an instant, the canonical record preserves:

- the resolved UTC instant;
- the entered local civil date and time;
- the IANA time-zone identifier used for resolution; and
- the resolved UTC offset.

The UTC instant is authoritative for chronological comparison. The preserved local value and zone are authoritative for explaining the user's original intent and historical display.

An offset alone is insufficient because it cannot represent daylight-saving rules. A browser or device offset must not silently replace an available IANA zone.

### 3.3 Daylight-saving resolution

Local input that falls in a daylight-saving gap is invalid until the user supplies a valid local time. Ambiguous repeated local time requires an explicit choice of occurrence or offset before persistence.

The resolution occurs at record creation or correction. Later time-zone database changes must not silently rewrite the stored UTC instant, original local value, zone, or offset.

### 3.4 Display and time-zone changes

The primary historical representation of user-entered local time uses the preserved local civil value and recorded zone. A surface may additionally derive the equivalent time in the viewer's current zone, but that conversion is presentation only and must be distinguishable from the recorded local value.

Changing the owner's account, device, or current time zone does not alter an existing record. Future corrections resolve against the zone explicitly used for that correction.

Date-only values always display as the stored calendar date.

### 3.5 System timestamps

`created_at` and `updated_at` are system-generated UTC instants:

- `created_at` records when the canonical record first entered Grow and never changes.
- `updated_at` records the most recent persisted correction or state transition.

System timestamps do not carry user-entered local intent. Their local display is a reversible presentation derived from the UTC instant and the viewer's current zone.

Capability-specific completion, occurrence, or capture time follows the instant or date-only contract declared by that capability. No field may mix the two kinds.

This resolution does not authorize reminders, recurrence, scheduling, notifications, or automation.

## 4. Shared State Semantics

The canonical record evolves under one stable identity. A state change updates that record; it does not replace it, create a successor record, or create an Event.

Only a capability with an explicitly approved domain state may mutate state. Within the current composition:

- Tasks may own mutable completion state.
- Events, Notes, Photos, and Documents own no shared workflow state.
- Calendar owns no state.

Each capability contract must define its smallest vocabulary and valid transitions without changing these shared rules. Every transition must:

- result from an explicit authorized owner action;
- validate the current record and requested transition;
- preserve record identity, Session ownership, and canonical context;
- advance `updated_at`;
- leave Session, phase, Germination, Growing evidence, and Plant Group state unchanged; and
- create no implicit record in another capability.

Reopening, where a capability contract permits it, is an explicit reverse state transition. It is not a correction and does not restore or reinterpret lifecycle state.

## 5. Correction Model

A correction is an authorized edit to the current canonical record because its recorded content is incomplete or inaccurate. It preserves identity, ownership, and valid canonical context.

Correction updates the existing record in place:

- `created_at` remains unchanged;
- `updated_at` advances;
- corrected capability-specific time is resolved again under Section 3; and
- projections reflect the corrected canonical value.

Correction does not create a replacement record, Event, evidence record, revision chain, or immutable history entry. The shared minimum visible provenance is the unchanged creation time and the latest update time; a surface may label a record as edited when those instants differ.

Correction remains available after phase or Session completion when authorized through the owning Session. It must not reopen or reinterpret the phase or Session.

A state transition changes domain state. A correction changes record content. If an owner corrects data while performing a state transition, both occur on the same canonical record and produce one new `updated_at`; neither operation creates a second identity.

## 6. Deletion & Retention

Owner-requested deletion is a hard deletion of the canonical workspace record. The shared model does not create soft-deleted records, tombstones, archive state, recovery state, or hidden owner history.

Before deletion, the record remains visible to its authorized owner, including during historical review after phase or Session completion. Workspace records are retained until:

- the owner explicitly deletes them; or
- their owning Session is deleted under the existing canonical Session-deletion policy.

Deletion must be explicit, authorized, and scoped to the selected canonical record. It must not delete or mutate the Session, phase, Germination evidence, Growing evidence, Plant Group, or another capability record.

After successful deletion, all projections omit the record because the canonical source no longer exists. A projection must not retain a duplicate or cached authoritative copy.

This resolution defines no administrator recovery, grace period, legal hold, legal archive, backup restoration, or storage-provider deletion procedure.

## 7. Shared Provenance

Every workspace record owns only this shared minimum provenance:

- stable canonical identity;
- owner derived through its canonical Session;
- immutable `created_at`;
- current `updated_at`; and
- capability-specific completion, occurrence, or capture time where that capability owns such a time.

Optional phase and Plant Group context is canonical association, not provenance or ownership.

The shared model introduces no event sourcing, revision table, immutable history chain, miscellaneous history JSON, generic audit record, or duplicate chronology. Infrastructure security logs may continue under existing platform policy but are not user-facing workspace evidence or canonical record history.

## 8. Capability Impact

| Capability | Shared rules that apply |
|---|---|
| Tasks | Stable identity and Session ownership; optional validated context; user-entered due time uses the declared instant or date-only kind; mutable completion state uses explicit transitions; corrections update in place; reopening is a state transition if its contract permits it; hard deletion; shared provenance |
| Events | Stable identity and Session ownership; optional validated context; occurrence time uses the capability-declared time kind; no shared workflow state; corrections update in place; hard deletion; shared provenance |
| Notes | Stable identity and Session ownership; optional validated context; no shared domain time beyond system timestamps and no shared workflow state; corrections update in place; hard deletion; shared provenance |
| Photos | Stable identity and Session ownership; optional validated context; capture time uses the capability-declared time kind; no shared workflow state; corrections update in place; hard deletion of the canonical record; shared provenance |
| Documents | Stable identity and Session ownership; optional validated context; no shared domain time beyond system timestamps and no shared workflow state; corrections update in place; hard deletion of the canonical record; shared provenance |
| Calendar | Applies these rules to no record of its own; projects authorized dated Tasks and Events only |

This section assigns shared semantics only. It does not define capability-specific fields, vocabularies, validation, file behavior, or interface design.

## 9. Deferred Decisions

The following remain outside this shared resolution:

- Event type vocabulary and compatibility mapping;
- Task-specific state labels and capability-specific field validation;
- Photo capture-time source precedence among device metadata, upload metadata, and explicit owner correction;
- Photo and Document file-type, size, storage-security, malware-scanning, and download-security requirements;
- storage-provider selection and implementation;
- reminders and notifications;
- recurrence and scheduling;
- AI, GEE, recommendations, and automation;
- public or social sharing;
- Reflection and Session Reports; and
- administrator recovery and legal archive systems.

The first four items remain gates for their affected capability contracts. The remaining items do not block a bounded Task contract and remain deferred until separately authorized.

## 10. Acceptance Principles

This resolution is satisfied only when downstream contracts and implementations preserve:

1. one time model distinguishing UTC-backed instants from date-only values;
2. preserved local civil time, IANA zone, and offset for user-entered instants;
3. stable historical meaning across device, account-zone, daylight-saving, and time-zone database changes;
4. immutable creation time and current last-update time;
5. one stable record identity across corrections and state transitions;
6. explicit owner-authorized state transitions owned only by the applicable capability;
7. in-place correction without replacement identities or revision-history infrastructure;
8. explicit hard deletion without tombstone or duplicate authoritative retention;
9. immediate projection from current canonical records, including omission after deletion;
10. canonical Session ownership and same-Session validation for narrower context;
11. owner privacy, lifecycle independence, post-completion reviewability, and no silent evidence mutation;
12. identical semantics across desktop and mobile; and
13. no Calendar persistence, miscellaneous association JSON, duplicate persistence, event sourcing, or history JSON.

## 11. Contract Impact

This resolution closes the shared time, state-transition, correction, reopening classification, deletion, retention, and minimum-provenance gaps identified by CS-GC-003 and IC-GC-003B.

IC-GC-003B may now be revised to:

- declare the Task-specific due kind or supported due kinds;
- define the minimum Task state labels using the shared transition rules;
- apply hard deletion and in-place correction;
- define compatibility mapping for existing due values and Task states; and
- authorize a bounded implementation ICE after those Task-specific decisions are approved.

IC-GC-003B is therefore unblocked for final contract resolution, but its current status still does not authorize implementation. An ICE may begin only after IC-GC-003B incorporates the remaining Task-specific decisions and changes its approval gate.

Events remain blocked by Event vocabulary and compatibility mapping. Photos remain blocked by capture-time source precedence and media security requirements. Documents remain blocked by file and storage-security requirements. Notes have no remaining shared semantic blocker, but still require their own implementation contract.
