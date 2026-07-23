# Foundation Note FN-GC-004 — Growing Workspace Notes Foundation

**Status:** Foundational Architecture  
**Captured:** July 23, 2026  
**Related areas:** Grow Sessions, Growing Workspace, Notes, Authorship, Evidence

## 1. Status

This note establishes the durable foundation for the canonical Growing Workspace Notes capability.

It follows closure of the Growing Foundation, Workspace Shell, Tasks, Events, and Temporal Projections. It authorizes only a follow-on Growing Workspace Notes Composition Specification. It does not authorize implementation.

## 2. Purpose

Notes are the canonical user-authored narrative capability of the Growing Workspace.

A Note intentionally preserves narrative for later reference. That narrative may describe observations, decisions, explanations, context, reflections, problems, or reasoning. These examples are illustrative rather than a closed taxonomy.

Notes must remain useful across crops, methods, environments, and future authorized Workspace contexts.

## 3. Foundational Decision

Grow shall maintain one canonical Note capability for authored Workspace narrative.

A Note has stable identity and attributable provenance. Presentation beside another capability does not change that identity or transfer authority.

A Note is not a Task, Event, activity record, report, document, photo, notification, projection entry, or verified evidence by default.

The capability extends, rather than redefines, the approved architecture in:

- [Grow Foundation](../grow-foundation.md);
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](./FN-004-session-lifecycle-and-grow-companion.md);
- [Growing Workspace Composition Specification](../../product/grow-sessions/growing-workspace-composition-specification.md);
- [IC-GC-003A — Growing Workspace Shell](../implementation-contracts/IC-GC-003A-growing-workspace-shell.md);
- [AR-GC-003-01 — Workspace Time, State, Correction & Retention Semantics](../../architecture/AR-GC-003-01-workspace-time-state-correction-and-retention-semantics.md);
- [IC-GC-003B — Growing Workspace Tasks](../implementation-contracts/IC-GC-003B-growing-workspace-tasks.md);
- [AR-GC-003-02 — Growing Workspace Event Semantics & Vocabulary](../../architecture/AR-GC-003-02-growing-workspace-event-semantics-and-vocabulary.md);
- [IC-GC-003C — Growing Workspace Events](../implementation-contracts/IC-GC-003C-growing-workspace-events.md); and
- [IC-GC-003D — Growing Workspace Temporal Projections](../implementation-contracts/IC-GC-003D-growing-workspace-temporal-projections.md).

## 4. Canonical Note

The canonical Note concept preserves:

- stable Note identity;
- authorized Workspace or Session containment;
- authoritative author attribution;
- authored narrative content;
- canonical record chronology;
- correction provenance where applicable;
- availability and retention semantics; and
- optional bounded contextual references.

This concept defines responsibility, not physical storage. It prescribes no table, column, type, RPC, migration, index, renderer object, or client-persistence mechanism.

Canonical Note normalization occurs once. The Note capability owns normalization of raw Note persistence values. Workspace presentations, search, exports, reports, projections, analytics, and future derived layers consume canonical Note representations directly and do not re-normalize them.

## 5. Ownership

The Note capability owns:

- canonical Note identity;
- authored narrative content;
- Note authorship attribution;
- Note correction semantics; and
- Note availability and retention semantics.

It owns no Session lifecycle, Task lifecycle, Event occurrence, temporal projection, evidence conclusion, report finding, binary or image storage, reminder, schedule, automation, or GEE interpretation.

Correction or removal of a Note cannot rewrite Task, Event, Session, evidence, or lifecycle history.

## 6. Context, Authorship, and Authorization

A Note exists within an authorized Growing Workspace context, ordinarily a canonical Session.

Containment governs access. A Note may later reference a narrower approved context, such as a Plant Group, Task, Event, Photo, Document, or another authorized Workspace object. References provide context; they do not transfer identity, containment, or domain ownership. This note does not authorize arbitrary attachment to every platform entity.

Every Note preserves authoritative authorship and Workspace context. Authorship and Workspace ownership are distinct.

Future collaboration must not assume that every author owns the Session, every participant may edit every Note, Note authorship grants wider Workspace authority, or Workspace access permits authorship impersonation. Corrections cannot silently replace original authorship.

Notes inherit their accessible containment boundary from the canonical Session or another approved Workspace context and cannot create a weaker privacy boundary.

Note operations remain independently authorizable. Future architecture must distinguish authority to read, create, correct, archive or remove from normal presentation, restore where supported, and perform policy-governed administrative intervention. This note defines no roles, policies, RLS, RPCs, or permission matrix.

## 7. Time, Correction, and Retention

Record chronology and subject chronology are distinct.

A Note may preserve creation and correction time while describing a subject from another time. Record timestamps are not proof of when the described observation, decision, or condition occurred.

Notes are not automatically Timeline or Calendar inputs. Any future temporal projection requires separate approval.

The architecture distinguishes:

- correction of authored content;
- correction of contextual references;
- changes in ordinary availability;
- archival;
- removal from normal presentation; and
- retained integrity history where policy requires it.

Canonical identity remains stable through correction. Original authorship remains attributable. This note prescribes no revision model, event sourcing, retention period, hard-deletion policy, or physical archive mechanism.

## 8. Evidence and Derived-Use Boundaries

A Note may describe an observation, decision, or result, but authored narrative is not automatically verified evidence.

Future evidence systems may reference Notes while keeping authored narrative, source material, structured evidence, interpreted findings, and GEE output distinguishable. A Note's existence does not elevate its claims to verified truth.

Creating, correcting, archiving, restoring, or removing a Note may generate activity elsewhere. The Note is not an activity-log record. Activity references the canonical Note rather than duplicating its narrative as independent authority.

Derived summaries, reports, analytics, exports, or AI output must remain distinguishable from the author's canonical Note and cannot silently replace it.

## 9. Capability Boundaries

A Note may provide context for a Task or Event but cannot complete or reopen a Task, schedule or cancel an Event, change temporal placement or recurrence, or alter Session lifecycle.

Notes may later reference Photos or Documents. This note defines no upload, binary storage, attachment persistence, image processing, document versioning, or attachment permission behavior. A Note remains valid without Photos or Documents.

Reports, Reflection, exports, analytics, and GEE-assisted interpretation may later consume Notes only through separately approved architecture.

The canonical Note remains independent of cards, journals, timeline rows, calendar cells, editors, panels, feeds, search results, and reports. Presentation never becomes authority.

## 10. Architectural Invariants

- A Note is one canonical narrative record with stable identity.
- Notes own narrative and Note provenance, not Session, Task, Event, or evidence authority.
- Authorship remains attributable and distinct from Workspace ownership.
- Containment governs access; bounded references provide context.
- Workspace visibility does not imply authority for every Note operation.
- Canonical Note normalization occurs once; downstream consumers do not re-normalize Notes.
- Record chronology and subject chronology remain distinct.
- Notes are not automatically Temporal Projection inputs.
- Correction does not rewrite other capabilities.
- Removal from presentation does not automatically erase retained integrity history.
- Narrative is not automatically verified evidence.
- Notes remain valid without Photos or Documents.
- Presentation does not become authority.
- Derived or AI-generated content cannot silently replace original authored content.

## 11. Non-Goals

This note does not authorize implementation, schema, migrations, editor design, rich-text or Markdown selection, autosave, character limits, offline persistence, local-storage authority, comments, threaded discussion, mentions, reactions, reminders, notifications, recurrence, scheduling, automatic Timeline or Calendar placement, Photos, Documents, Reports, Reflection, GEE processing, AI rewriting or summarization, Community publishing, social sharing, or external integrations.

## 12. Consequences

Future Notes architecture must evolve one canonical capability without duplicating narrative identity, persistence, or authority.

Implementations and derived consumers must preserve authorship, containment, correction provenance, and the evidence boundary. Narrower context and richer presentation may be added only without changing those responsibilities.

Decisions about physical persistence, collaboration policy, retention mechanics, editing experience, attachments, projections, and derived use remain subject to their proper approval phases.

## 13. Follow-On Architecture

The next authorized artifact is the **Growing Workspace Notes Composition Specification**.

That specification may define composition among canonical Notes, Session containment, the Workspace Shell, access-safe reads, authorship, bounded Task, Event, or Plant Group references, activity presentation, and future Photo or Document boundaries.

It must not pre-authorize implementation, persistence, UI, attachments, public sharing, or AI behavior. The required next step before that specification is a read-only audit of this Foundation Note.
