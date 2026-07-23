# Foundation Note FN-GC-007 — Documents Foundation

**Status:** Foundational Architecture
**Captured:** July 23, 2026
**Related areas:** Documents, Identity, Privacy, Chronology, Workspace, Representation

## 1. Status

This note establishes Documents as Grow's canonical capability for user-controlled structured records.

It follows completion of GC-006 — Photos Composition Production Slice 1. It authorizes only CS-GC-007 — Documents Composition Specification. It does not define composition or authorize implementation.

## 2. Purpose

A canonical Document is a stable, user-controlled structured record whose meaning remains identifiable independently of its technical representation.

The Documents capability establishes Document identity, ownership, authority, chronology, privacy and lifecycle boundaries, contextual independence, representation independence, and independence from Workspace and presentation.

Documents are not a general file, attachment, or Media capability. Notes, Photos, video, audio, and other records remain separate unless later approved architecture establishes otherwise.

## 3. Foundational Decision

Grow shall maintain one canonical Document capability for user-controlled structured records.

A Document associates:

- stable canonical Document identity;
- canonical ownership;
- user-controlled structured meaning;
- Document-specific chronology;
- privacy and lifecycle state governed by authoritative Grow architecture; and
- approved contextual references.

A Document may describe another canonical subject without becoming authoritative for that subject. Documents own structured records, not the People, Sessions, plants, Plant Groups, Tasks, Events, Notes, Photos, Entities, conditions, or outcomes they describe or reference.

This decision inherits without redefining:

- [Grow Foundation](../grow-foundation.md);
- [FN-003 — Canonical Entities & Representation](./FN-003-canonical-entities-and-representation.md);
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](./FN-004-session-lifecycle-and-grow-companion.md);
- [FN-GC-004 — Growing Workspace Notes Foundation](./FN-GC-004-growing-workspace-notes-foundation.md);
- [FN-GC-005 — Workspace Foundation](./FN-GC-005-workspace-foundation.md);
- [CS-GC-005 — Workspace Composition Specification](../../product/grow-sessions/workspace-composition-specification.md);
- [FN-GC-006 — Photos Foundation](./FN-GC-006-photos-foundation.md); and
- [AR-GC-003-01 — Workspace Time, State, Correction & Retention Semantics](../../architecture/AR-GC-003-01-workspace-time-state-correction-and-retention-semantics.md).

Those documents remain authoritative for canonical entities, identity, authorization, privacy, Session ownership, correction, deletion, retention, evidence, Workspace coordination, and presentation.

## 4. Canonical Document Identity

One canonical Document model owns stable Document identity and its authoritative association with structured meaning.

Document identity remains independent of:

- file name;
- storage location;
- file format;
- rendering;
- preview;
- extracted text;
- publication destination; and
- presentation surface.

A technical representation is not another canonical Document. Replacing or adding a representation does not replace the canonical identity or create another authoritative record.

This foundation defines responsibility, not implementation. It prescribes no schema, migration, storage architecture, upload path, file format, renderer, synchronization mechanism, API, or database representation.

## 5. Ownership and Authority

The Documents capability owns:

- canonical Document identity;
- Document ownership;
- canonical structured meaning;
- Document-specific chronology;
- Document privacy state under authoritative privacy architecture;
- the Document's own lifecycle under authoritative lifecycle and retention architecture; and
- approved contextual references.

Documents own no:

- canonical user identity;
- Session, phase, Plant Group, Task, Event, Note, or Photo identity or lifecycle;
- referenced-subject meaning;
- Workspace coordination;
- presentation behavior;
- authorization architecture; or
- evidence conclusion.

Ownership, authorship, containment, visibility, publication, representation, and referenced-subject identity remain distinct. A relationship between capabilities transfers no authority in either direction.

## 6. Structured Meaning Boundary

Structured meaning is the user-controlled organization and content that makes the canonical Document identifiable as one record. It remains distinct from any technical representation used to store, exchange, render, preview, or extract that meaning.

Documents preserve structured meaning. They do not determine:

- whether the represented claims are true;
- diagnosis or causation;
- recommendations;
- evidence eligibility or weight;
- the authority of a referenced subject; or
- the meaning owned by another canonical capability.

Interpretation, extraction, validation as evidence, AI, GEE, and Grow Companion behavior require separately approved architecture. Derived interpretation cannot silently replace canonical Document meaning.

## 7. Representation Independence

A canonical Document may have multiple technical representations.

Representations may differ without changing:

- canonical identity;
- ownership;
- Document chronology;
- privacy;
- lifecycle; or
- canonical structured meaning.

Representations are replaceable and non-authoritative. A preview, rendering, export, extracted text, or synchronized copy does not become another canonical Document or redefine its meaning.

This note defines no representation vocabulary, precedence rule, conversion behavior, equivalence test, storage relationship, synchronization rule, or conflict-resolution mechanism.

## 8. Contextual Independence

A Document may carry approved references that explain where, when, or why it is relevant.

Context:

- uses stable canonical identity;
- preserves dependency direction;
- transfers no ownership, lifecycle, privacy, evidence, or meaning authority;
- does not make the Document authoritative for its subject;
- does not make the subject authoritative for the Document; and
- does not make Workspace the owner of either record.

Missing or unavailable context cannot silently reassign the Document or rewrite its structured meaning. Individual contextual relationships require approval in their proper architecture phase.

## 9. Temporal Meaning

Document record chronology and subject chronology are distinct.

Record chronology describes when the canonical Document entered Grow and when it was corrected. Subject chronology describes time expressed or described by the Document.

A representation's creation, upload, modification, extraction, or rendering time is not automatically canonical Document chronology or proof of subject time.

Documents inherit the canonical time, correction, deletion, retention, and provenance rules in AR-GC-003-01. This note defines no representation timestamp precedence, inference, synchronization chronology, or presentation ordering.

## 10. Privacy, Lifecycle, and Retention

Documents inherit existing Grow privacy, authorization, lifecycle, correction, deletion, and retention architecture.

Visibility and publication remain distinct from ownership. A representation or presentation cannot silently change canonical Document identity, ownership, chronology, context, meaning, privacy, or lifecycle.

Document correction preserves canonical identity and cannot rewrite another capability. Deletion of a Document cannot delete or alter a referenced subject. Deletion or unavailability of a referenced subject cannot grant Documents authority or silently reassign context.

This note introduces no role, policy, RLS rule, archive, soft delete, restoration, retained-history state, retention period, storage-disposal process, or administrator recovery mechanism.

## 11. Workspace and Presentation Independence

Documents remain independently authoritative and useful without Workspace.

Workspace may coordinate Documents only through the existing Workspace Composition architecture. Workspace owns no Document identity, ownership, structured meaning, chronology, privacy, lifecycle, normalization, authorization, evidence, or business semantics.

Documents must join the existing composition mechanism through later approved architecture rather than create a parallel composition path.

Presentation consumes canonical Document state and remains replaceable and non-authoritative. Presentation cannot redefine canonical meaning or turn a rendering, preview, card, viewer, export, or search result into another Document.

## 12. Architectural Invariants

- Documents own canonical user-controlled structured records.
- One canonical Document retains one stable canonical identity.
- Canonical structured meaning survives representation changes.
- Representations are replaceable and non-authoritative.
- Ownership and authority remain local to their canonical capabilities.
- Context provides meaning without transferring authority.
- Record chronology and subject chronology remain distinct.
- Documents own no cross-capability lifecycle or authorization authority.
- Documents are not verified evidence by default.
- Workspace coordinates Documents but never owns them.
- Presentation renders Documents but never becomes authoritative.
- Future capabilities may consume Documents without redefining them.
- No parallel Document, representation, composition, authorization, or evidence authority may be introduced.

## 13. Non-Goals

This note does not define or authorize:

- implementation, schema, migrations, persistence, APIs, or database representation;
- composition relationships;
- upload, storage, synchronization, or offline behavior;
- formats, conversion, rendering, previews, exports, or extracted text;
- OCR, parsing, indexing, or search;
- attachments or general file management;
- Community, sharing, publication, moderation, or social workflows;
- AI, GEE, Grow Companion interpretation, or evidence classification;
- user interface, editor, viewer, navigation, or presentation implementation; or
- video, audio, Photos, Notes, or general Media architecture.

Storage and security requirements, representation semantics, synchronization, contextual relationships, and any derived-use behavior remain subject to separately approved architecture.

## 14. Consequences and Follow-On Architecture

Future Documents architecture must evolve one canonical structured-record capability without duplicating identity, structured meaning, representation authority, composition, authorization, or evidence meaning.

The only authorized next artifact is:

**CS-GC-007 — Documents Composition Specification**

That specification may define approved composition while preserving this Foundation. It must not authorize implementation, storage, upload, rendering, synchronization, or user-interface behavior.

The required next step is a read-only audit of this Foundation Note. No implementation is authorized.
