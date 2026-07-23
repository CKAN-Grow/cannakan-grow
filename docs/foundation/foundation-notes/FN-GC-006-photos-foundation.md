# Foundation Note FN-GC-006 — Photos Foundation

**Status:** Foundational Architecture
**Captured:** July 23, 2026
**Related areas:** Photos, Identity, Privacy, Chronology, Workspace, Evidence

## 1. Status

This note establishes Photos as Grow's canonical capability for user-controlled still-image records.

It follows closure of GC-005 — Workspace Composition. It authorizes only CS-GC-006 — Photos Composition Specification. It does not define composition or authorize implementation.

## 2. Purpose

A canonical Photo is a stable, user-controlled still-image record within Grow.

The Photos capability establishes Photo identity, ownership, authority, chronology, privacy and lifecycle boundaries, contextual independence, evidence boundaries, and independence from Workspace and presentation.

Photos are not a general Media capability. Video, audio, Documents, and other media types remain separate unless later approved architecture establishes otherwise.

## 3. Foundational Decision

Grow shall maintain one canonical Photo capability for user-controlled still-image records.

A Photo associates:

- stable canonical Photo identity;
- canonical ownership;
- user-supplied visual content;
- Photo-specific chronology;
- privacy and lifecycle state governed by authoritative Grow architecture; and
- approved contextual references.

A Photo may describe, document, or depict another canonical subject without becoming authoritative for that subject. Photos own photographic records, not the People, Sessions, plants, Plant Groups, Tasks, Events, Notes, Entities, conditions, or outcomes they depict or reference.

This decision inherits without redefining:

- [Grow Foundation](../grow-foundation.md);
- [FN-003 — Canonical Entities & Representation](./FN-003-canonical-entities-and-representation.md);
- [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](./FN-004-session-lifecycle-and-grow-companion.md);
- [FN-GC-005 — Workspace Foundation](./FN-GC-005-workspace-foundation.md);
- [CS-GC-005 — Workspace Composition Specification](../../product/grow-sessions/workspace-composition-specification.md);
- [AR-GC-003-01 — Workspace Time, State, Correction & Retention Semantics](../../architecture/AR-GC-003-01-workspace-time-state-correction-and-retention-semantics.md); and
- [Community Product Specification](../../product/community/README.md).

Those documents remain authoritative for identity, authorization, privacy, Session ownership, correction, deletion, retention, publication, evidence, Workspace coordination, and presentation boundaries.

## 4. Canonical Photo Identity

One canonical Photo model owns stable Photo identity and its authoritative association with user-controlled still-image content.

Photo identity remains independent of:

- file name;
- storage location;
- display dimensions;
- thumbnail or rendition;
- crop;
- compression;
- presentation surface; and
- publication destination.

A rendered, transformed, or derived representation does not become another canonical Photo merely because its technical or visual form differs.

This foundation defines responsibility, not storage or representation. It prescribes no file format, storage architecture, rendition generation, image-processing pipeline, schema, migration, or database representation.

## 5. Ownership and Authority

The Photos capability owns:

- canonical Photo identity;
- Photo ownership;
- the authoritative association with user-controlled still-image content;
- Photo-specific metadata;
- Photo-specific chronology;
- Photo privacy state under authoritative privacy architecture;
- the Photo's own lifecycle under authoritative lifecycle and retention architecture; and
- approved contextual references.

Photos own no:

- canonical user identity;
- Session or Plant Group identity or lifecycle;
- Task, Event, or Note identity or lifecycle;
- referenced-subject meaning;
- authorization architecture;
- Community moderation or publication architecture;
- evidence conclusion;
- Workspace coordination; or
- presentation behavior.

Ownership, authorship, containment, visibility, publication, and depicted-subject identity remain distinct. A relationship between capabilities transfers no authority in either direction.

## 6. Contextual Independence

A Photo may carry approved references that explain where, when, or why it is relevant.

Context:

- uses stable canonical identity;
- preserves dependency direction;
- transfers no ownership or lifecycle authority;
- does not make the Photo authoritative for its subject;
- does not make the subject authoritative for the Photo; and
- does not make Workspace the owner of either record.

A missing or unavailable contextual subject cannot silently reassign the Photo to another subject or context.

CS-GC-006 must define which capabilities may compose with Photos and how unavailable or deleted context is represented. This Foundation Note does not approve those individual relationships.

## 7. Temporal Meaning

Photo record chronology and capture chronology are distinct.

Record chronology describes when the canonical Photo record entered Grow and when it was corrected. Capture chronology describes when the image was created or when the depicted condition existed.

An imported Photo must not be assumed to have been captured when it entered Grow. Capture chronology, where later approved, must inherit the canonical time model in AR-GC-003-01.

This note does not define metadata extraction, capture-time source precedence, time-zone implementation, inference, ordering, or presentation chronology. Photos do not redefine Session, Task, Event, or Temporal Projection semantics.

## 8. Privacy, Visibility, and Publication

Photos are private by default unless authoritative Grow privacy architecture establishes another state through explicit authorized action or approved platform behavior.

Ownership and visibility remain distinct. Visibility or publication cannot silently change canonical Photo identity, ownership, chronology, contextual references, or lifecycle authority.

Displaying the same canonical Photo in an approved context creates no second Photo and transfers no ownership.

Sharing and publication must inherit existing privacy, authorization, attribution, and moderation architecture. This note defines no publication workflow, Community behavior, social-sharing behavior, moderation rule, audience control, public metadata policy, grant, role, policy, or interface control.

## 9. Lifecycle, Correction, Deletion, and Retention

Photos own only their own lifecycle. They have no cross-capability lifecycle authority.

Photo correction preserves canonical identity under AR-GC-003-01. Correction cannot silently:

- transfer ownership;
- replace contextual identity;
- rewrite capture chronology;
- create evidence authority;
- establish publication; or
- change another capability's authority.

Deletion and retention inherit AR-GC-003-01 and existing Session-deletion authority. This note introduces no archive, soft delete, restoration, replacement history, retention period, or storage-disposal mechanism.

Deleting a Photo cannot delete or alter a referenced canonical subject. Deleting a referenced subject cannot grant Photos authority over that subject or silently reassign the Photo.

## 10. Evidence and Interpretation Boundary

A Photo is user-controlled visual content. It is not verified evidence by default.

The Photos capability does not determine:

- truth, diagnosis, or causation;
- depicted variety, entity, or plant identity;
- plant condition;
- source quality;
- successful outcome;
- recommendation; or
- evidence weight.

Image analysis, recognition, classification, extraction, diagnosis, AI, GEE interpretation, and Grow Companion interpretation require separately approved architecture.

A future consumer's interpretation remains distinguishable from the canonical Photo and cannot change Photo ownership, identity, chronology, or authority.

## 11. Workspace and Presentation Independence

Photos remain independently authoritative and useful without Workspace.

Workspace may coordinate Photos only through the existing Workspace Composition architecture. Workspace owns no Photo identity, content, ownership, privacy, lifecycle, normalization, authorization, evidence, or business semantics.

Photos must join the existing composition mechanism through later approved architecture rather than create a parallel composition path.

Presentation consumes canonical Photo state and remains replaceable and non-authoritative. A gallery, Timeline, Calendar, Session view, profile, Community surface, report, or mobile experience does not own the Photo it displays.

Multiple presentations may consume one canonical Photo without duplicating identity or authority. This note defines no presentation behavior or implementation.

## 12. Architectural Invariants

- Photos own canonical user-controlled still-image records.
- Canonical Photo identity is stable and independent of technical representation.
- Depicted and referenced subjects retain authority over their domains.
- Context provides meaning without transferring authority.
- Ownership, visibility, publication, and authorship remain distinguishable.
- Visibility and publication do not transfer canonical ownership.
- Record chronology and capture chronology remain distinct.
- Photos own no cross-capability lifecycle authority.
- Photos are not verified evidence by default.
- Workspace coordinates Photos but never owns them.
- Presentation renders Photos but never becomes authoritative.
- Future interpretation requires separately approved architecture.
- No parallel Photo, storage, composition, authorization, or publication authority may be introduced.

## 13. Non-Goals

This note does not define or authorize:

- implementation, schema, migrations, persistence, APIs, or database representation;
- composition relationships;
- storage providers, buckets, storage security, or asset disposal;
- upload mechanics or direct camera capture;
- formats, limits, compression, thumbnails, renditions, processing, or editing;
- albums, galleries, UI, navigation, or presentation implementation;
- sharing, publication, Community, social, moderation, or audience-control workflows;
- notifications;
- video, audio, Documents, or general Media architecture;
- image analysis, recognition, diagnosis, AI, GEE, or Grow Companion behavior; or
- evidence classification.

Capture-time provenance and source precedence, Photo storage and security requirements, and detailed contextual relationships remain unresolved for CS-GC-006 or separately approved architecture.

## 14. Consequences and Follow-On Architecture

Future Photos architecture must evolve one canonical still-image capability without duplicating identity, storage authority, composition, authorization, publication, or evidence meaning.

The only authorized next artifact is:

**CS-GC-006 — Photos Composition Specification**

That specification may define approved composition relationships and close the unresolved architecture required before an implementation contract. It must not authorize implementation or redefine this Foundation.

The required next step is a read-only audit of this Foundation Note. No implementation is authorized.
