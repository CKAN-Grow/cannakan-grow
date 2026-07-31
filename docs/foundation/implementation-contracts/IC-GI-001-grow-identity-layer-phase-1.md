# IC-GI-001 — Grow Identity Layer Phase 1 Implementation Contract

**Identifier:** IC-GI-001
**Title:** Grow Identity Layer Phase 1 Implementation Contract
**Status:** Approved — Architecture Audit Passed; Implementation Contract Governance Complete; Implementation Not Authorized
**Capability:** Grow Identity Layer Phase 1
**Layer:** Implementation Contract
**Authority boundary:** Proposed present-day conformance boundary for an already committed capability

## 1. Document Identity and Status

IC-GI-001 has passed its required strict read-only Architecture Audit and has received explicit founder governance approval. Implementation Contract governance for this contract is complete.

No present-day implementation conformance has been accepted.

This document does not authorize implementation, application correction, schema change, migration change, testing change, deployment, production activity, or production-data mutation.

## 2. Purpose

IC-GI-001 proposes the bounded present-day implementation contract for Grow Identity Layer Phase 1. Its purpose is to translate existing committed Platform, Foundation, and approved Product authority into enforceable obligations against which the already committed implementation may later be assessed.

The contract:

- identifies canonical Identity ownership and evidence;
- separates authenticated account ownership from canonical Identity;
- establishes owner-controlled and protected value boundaries;
- governs privacy, field visibility, viewer-aware reads, public projections, search, mutation, and canonical security;
- defines conservative normalization and evidence-preserving backfill requirements;
- preserves downstream Product replaceability; and
- inventories implementation evidence for a later bounded conformance recovery.

It does not accept the existing implementation merely because that implementation exists.

## 3. Governing Authority

This proposed contract derives its normative meaning from, in descending order:

1. [Grow Platform Architecture](../../platform/grow-platform-architecture.md);
2. [Grow Foundation](../grow-foundation.md);
3. [Grow Philosophy](../../philosophy/grow-philosophy.md);
4. [Grow Platform Milestones](../grow-platform-milestones.md), especially Platform Milestone 1 — Grow Identity Layer;
5. [PF-003 — Profiles, Relationships, and Access](../../product/profile-framework/PF-003-profiles-relationships-and-access.md);
6. [Profile Experience Framework](../../product/profile-experience-framework/profile-experience-framework.md);
7. [Profile Experience Visual Language](../../product/profile-experience-framework/visual-language.md); and
8. [Grow Architecture Governance](../../governance/grow-architecture-governance.md), including the approved Implementation Contract repository-integration model.

The directly relevant committed indexes provide discoverability but do not replace the authorities above:

- [Grow Foundation index](../README.md); and
- [Profile Experience Framework index](../../product/profile-experience-framework/README.md).

[Grow Identity Layer Phase 1](../../grow-identity-layer-phase1.md), migration SQL, application code, schema, tests, verification scripts, security fingerprints, and Git history are implementation or historical evidence only. They cannot independently establish canonical meaning, approval, historical authorization, implementation authority, or deployment authority.

No untracked Profile document is authority for IC-GI-001. CS-GP-001 is not a prerequisite for canonical Identity.

## 4. Authority Traceability

| Major contract area | Governing committed authority | Proposed obligation derived from that authority |
| --- | --- | --- |
| Canonical Identity ownership | Grow Platform Architecture; Grow Foundation; Grow Platform Milestone 1; PF-003 | Canonical Identity is one Platform-owned truth. Products compose and Presentation renders without replacing it. |
| Authenticated ownership relationship | Grow Foundation trust and member-control principles; Grow Platform Milestone 1 | A canonical member Identity is associated with its authenticated owner, while authentication/account authority remains distinct from Identity meaning. |
| Owner-controlled values | Grow Foundation member agency and consent; Grow Platform Milestone 1 | Members may control supported self-declared Identity values and independent privacy/preferences only through canonical validated operations. |
| System-controlled values | Grow Foundation separation of Identity, Recognition, and Evidence; Grow Platform Milestone 1 | Recognition, verification, trust, evidence, administrative state, and protected provenance cannot be assigned through an owner Identity update. |
| Privacy and visibility | Grow Foundation privacy and consent; Grow Platform Milestone 1; PF-003 | Profile and field visibility are canonical privacy inputs enforced before data reaches an unauthorized consumer. |
| Viewer-aware reads | Grow Platform Milestone 1; PF-003 | Reads derive viewer authority at the trusted server boundary and return only fields authorized for that viewer and context. |
| Public projections | Grow Foundation privacy; Grow Platform Milestone 1; PF-003; Profile Experience Framework | Public Profile consumers receive only explicitly public, privacy-approved Identity values through a safe projection. |
| Search and discovery | Grow Platform Milestone 1; PF-003 | Discovery remains independent of publication and relationship state and cannot override profile or field visibility. |
| Mutation authority | Grow Foundation member control; Grow Platform Milestone 1 | Owner mutation derives the owner from authentication, validates an explicit supported surface, normalizes values, and rejects protected fields. |
| RLS and access control | Grow Foundation trust and privacy; Grow Platform Milestone 1 | Canonical security is server-enforced with owner scope, RLS or equivalent controls, least privilege, and protected function boundaries; application hiding alone is insufficient. |
| Normalization and backfill | Grow Philosophy truthfulness; Grow Foundation evidence and privacy; Grow Platform Milestone 1 | Existing evidence is normalized deterministically and conservatively without fabrication, unsupported reassignment, or broader disclosure. |
| Provenance | Grow Foundation evidence separation; Grow Platform Milestone 1 | Provenance distinguishes self-declared, observed, suggested, user-confirmed, and system-verified meaning without treating them as interchangeable. |
| Downstream Product consumption | Grow Platform Architecture; PF-003; Profile Experience Framework; Profile Experience Visual Language | Products consume governed Identity interfaces and projections. Profile composition and Presentation do not own or redefine Identity. |
| Repository integration and later execution | Grow Architecture Governance | Proposed integration does not equal approval; audit, founder approval, status normalization, Git closure, and a separate execution artifact remain required. |

The exact physical schema, SQL object names, JSON shapes, helper algorithms, limits, indexes, triggers, grant statements, and compatibility adapters remain implementation evidence unless this contract traces their required outcome to the authorities above.

## 5. Historical-Truth Boundary

Grow Identity Layer Phase 1 implementation was committed before IC-GI-001.

The introduction commit is:

`f883a9d2520c6f0547b375eaa4e62dda010a00a0`

The relevant migration is:

`supabase/migrations/20260718120000_grow_identity_layer_phase1.sql`

IC-GI-001 proposes a present-day implementation boundary against which the existing implementation may later be assessed. It does not create retrospective implementation authorization and does not claim that IC-GI-001, an Implementation Contract Execution, an Architecture Audit, founder approval, or explicit implementation authorization existed when that implementation was committed.

The migration was not created, executed, or authorized under IC-GI-001. Repository chronology may establish what was committed and when; it does not establish missing governance retroactively.

Existing implementation may be assessed for present-day conformance only after IC-GI-001 is approved, status-normalized, and Git-closed. Deployment is separate and remains unauthorized.

## 6. Architectural Ownership

The required dependency direction is:

```text
Canonical Platform
        ↓
Products
        ↓
Presentation
```

Canonical Identity is Platform-owned truth. Authentication ownership and canonical Identity are related but distinct: authentication establishes the caller and account relationship; it does not transfer canonical Identity meaning to an authentication provider, private account record, Product, or Presentation surface.

Product Profiles consume Identity through governed operations and privacy-safe projections. They introduce and compose an identity experience but do not own the underlying data. Grow Profile composition cannot redefine Identity. Shared Profile Hero behavior cannot own canonical Identity. Presentation code cannot be the sole privacy or visibility enforcement boundary.

Relationship, Recognition, Session, Seed Vault, Grow Network, Community, and Learn domains retain their established ownership. Identity may consume a governed decision or expose a bounded attribution value without acquiring the source domain's authority. Downstream Products must remain replaceable without replacing canonical Identity.

## 7. Proposed Contract Scope

Subject to approval, IC-GI-001 would govern only:

- one canonical Platform-owned member Identity authority;
- association of canonical Identity with an authenticated owner;
- canonical Identity persistence and evidence;
- supported owner-controlled self-declared Identity values;
- protected and system-controlled values;
- identifier normalization, uniqueness, and conflict handling;
- conservative existing-record normalization;
- evidence-preserving backfill;
- profile visibility and field-level visibility;
- visibility defaults and provenance;
- owner-scoped mutation;
- viewer-aware reads;
- privacy-safe public projections;
- privacy-safe search and discovery;
- anonymous, authenticated, owner, cross-owner, administrator, and service boundaries;
- RLS, policies, grants, revocations, constraints, triggers, and canonical function boundaries required to enforce those outcomes;
- deterministic migration and interruption behavior; and
- compatibility with separately authorized downstream Profile consumers.

This scope introduces no new Identity field, visibility state, privacy vocabulary, ownership relationship, relationship type, Recognition meaning, lifecycle meaning, Profile module, or public-sharing authority.

## 8. Canonical Identity Evidence

Canonical Identity evidence consists of the supported member attributes, preferences, privacy choices, and provenance held by the one existing canonical member Identity record and its canonically associated field-visibility evidence.

The canonical owner association must use the authenticated member's stable account identity. A presentation handle, display name, URL slug, avatar, Product record identifier, or third-party identifier cannot replace that association.

The existing member profile architecture remains the canonical Identity foundation. Current repository evidence places the member-facing canonical row in `public_member_profiles` and authentication-adjacent private account state in `profiles`; the exact schema relationship must be verified later. The private account record does not become a second canonical member Identity.

Recognition assignments, trust state, verification state, activity evidence, grow records, and analytical outputs retain their own domain authority. Their authorized projection beside Identity does not convert them into self-declared Identity evidence or transfer their ownership.

Absent or ambiguous evidence remains absent or ambiguous. Canonical Identity must not manufacture a value merely to complete a Profile or satisfy a presentation preference.

## 9. Authentication and Ownership Relationship

Every owner read or mutation must derive the authenticated actor at the trusted boundary. The caller must not be able to claim another owner by supplying an owner or viewer identifier.

The canonical owner-to-record relationship must be stable, attributable, and enforced for reads and writes. Missing, conflicting, or ambiguous ownership must fail closed; it must not be repaired through a display identifier or optimistic match.

Authority differs by caller:

- the owner may receive the owner's complete canonical Identity and supported privacy/preferences, subject to protected-domain boundaries;
- an authenticated non-owner may receive only viewer-authorized fields for the applicable context;
- an anonymous viewer may receive only an explicitly authorized public-safe projection for an established public surface;
- a browser client has no service-role authority and may invoke only expressly granted operations; and
- a service or administrative context may act only under separately established least-privilege authority and must not be inferred from an owner-facing operation.

## 10. Owner-Controlled and System-Controlled Identity Values

The proposed owner-controlled surface is bounded to the currently supported member-controlled categories established by Platform Milestone 1:

- core self-declared identity, including display identity and supported member description;
- supported growing role, experience, language, environment, method, interest, goal, breeder, and source preferences;
- supported general location and timezone preference;
- profile and field visibility;
- Grow Network discoverability;
- connection-request and invitation preferences; and
- personalization consent.

The exact current field allowlist is implementation evidence and must be verified against approved authority before conformance acceptance. An implementation may not expand the allowlist merely because a column or client property exists.

Protected or system-controlled values include:

- authenticated owner identity;
- Recognition assignment and meaning;
- verification, trust, reserved identity, and administrative state;
- canonical evidence and evidence-derived state;
- provenance classifications not established by the owner operation; and
- any source-domain value whose governing capability has not delegated mutation to Identity.

An owner mutation may record permitted touched values as self-declared. It may not mark a value observed, suggested, user-confirmed, or system-verified without the separately governed operation and evidence required for that classification. Suggested values require member confirmation before they become owner Identity.

## 11. Identifier Normalization and Conflict Handling

A canonical member identifier must be normalized deterministically at the trusted boundary before validation or uniqueness evaluation. Equivalent normalized forms must not create duplicate canonical identifiers.

Normalization must preserve stable ownership and must not:

- replace the authenticated owner identifier with a presentation identifier;
- infer ownership from display name, handle, email-like presentation text, or another Product record;
- silently select one owner when normalized identifiers conflict;
- overwrite an existing canonical identifier to resolve a collision; or
- make a private identifier public.

Where canonical uniqueness is required, the persistence boundary must enforce it under concurrency. Conflicting or duplicate evidence must produce a deterministic conflict for later reconciliation. The exact username grammar, case-folding expression, fallback order, and database index are observed implementation choices requiring conformance review unless approved authority independently fixes them.

## 12. Existing-Record Normalization and Backfill

Existing-record treatment must be deterministic, conservative, privacy-preserving, and evidence-preserving.

It must:

- retain stable owner association and existing intentional publication evidence;
- preserve explicit private or disabled intent without broadening it;
- retain a supported existing value when its meaning is unambiguous;
- map ambiguous privacy state to no broader access than committed authority supports;
- normalize only values supported by attributable evidence;
- preserve provenance or mark its absence honestly;
- avoid destructive rewrites; and
- produce deterministic outcomes across safe rerun or interruption.

It must not:

- fabricate Identity evidence;
- assign unsupported missing values;
- optimistically interpret ambiguous values;
- reassign ownership;
- substitute a presentation identifier for the canonical owner;
- silently disclose previously private information;
- discard or falsify provenance;
- introduce a duplicate canonical identifier; or
- rewrite evidence to match a Product or Presentation preference.

Committed migration behavior may demonstrate one implementation approach, but its exact fallback values, default selections, array caps, legacy-boolean mappings, location fallbacks, and field-visibility seeding remain subject to later conformance review. No implementation behavior is historically authorized by this section.

## 13. Privacy and Field-Level Visibility

Canonical Identity values, owner control, protected state, field-visibility preferences, projection eligibility, viewer authorization, and downstream presentation are separate concerns.

Profile visibility uses exactly:

- `personal`;
- `connections`; and
- `public`.

Supported field visibility uses exactly:

- `only_me`;
- `connections`; and
- `public`.

Field visibility is authoritative within the permitted profile scope; a broad profile scope cannot override a narrower field choice. Discoverability, connection permissions, invitation preferences, and personalization consent remain independent settings and cannot be collapsed into publication.

Defaults for existing or new records must be privacy-preserving and must never broaden unclear legacy intent. Visibility provenance must remain attributable. The exact per-field seed matrix currently present in SQL is implementation evidence requiring review; its existence alone does not make each default governing.

Owner access to the owner's Identity is preserved. Every other viewer receives least-privilege data. Hidden values must not be sent to an unauthorized client and merely concealed in Presentation.

## 14. Viewer-Aware Reads and Public Projections

Viewer-aware Identity reads must:

1. derive the authenticated viewer at the server boundary;
2. establish the target's active and accessible Identity;
3. resolve the authorized relationship and read context without accepting a caller-supplied viewer identity;
4. apply profile visibility;
5. apply field-level visibility independently;
6. include only authorized values in the result; and
7. omit protected preferences and provenance from non-owner results unless separately authorized.

An access relationship cannot grant more Identity disclosure than its own authority. A direct Vault relationship, Community attribution need, or Network context cannot become general Profile access.

Anonymous projection is limited to explicitly public Profiles and explicitly public fields required by an already authorized public surface. Public projection eligibility is limited to supported member display identity, description, growing-preference, and general-location values that are approved as public-capable and whose canonical field visibility is `public`. Protected owner preferences—including timezone, connection-request preferences, invitation preferences, personalization consent, field-visibility configuration, and provenance—are not public Identity projection values. Recognition or verification may appear only through its owning domain's separately authorized privacy-safe projection; Identity does not make it public. Public projection must exclude every ineligible or private field before serialization.

Every `connections` field and every value requested outside an established anonymous public projection requires viewer-aware evaluation. An authenticated viewer-aware projection and an anonymous public projection may have different surfaces, but neither may bypass canonical privacy.

Exact function names, parameters, JSON response shape, relationship labels, read-context labels, and compatibility wrappers are implementation evidence until later conformance assessment.

## 15. Identity Search and Discovery Safety

Identity discovery must be independently authorized by the member's discoverability preference and bounded by profile and field visibility.

Search must:

- derive the authenticated viewer for ordinary Grow Network discovery;
- omit identities not eligible for discovery;
- return only fields allowed in the discovery context;
- apply bounded input normalization and result limits;
- avoid leaking hidden values through matching, sorting, errors, counts, or payload construction; and
- leave relationship creation and connection meaning to Grow Network.

Discoverability does not publish the complete Identity, create a relationship, delete an existing relationship, or override `personal` or field-level privacy. An anonymous public Profile URL is not general anonymous Identity search authority.

## 16. Canonical Mutation Authority

The canonical owner mutation boundary must:

- require authentication;
- derive the owner from the authenticated context;
- accept only a bounded allowlist of supported owner-controlled inputs;
- reject arbitrary keys and protected or system-controlled values;
- validate supported vocabularies and value shapes;
- normalize at the trusted boundary;
- enforce identifier conflicts canonically;
- update only the authenticated owner's Identity;
- apply field-visibility changes through the canonical boundary;
- record attributable self-declared provenance for eligible touched values; and
- return a viewer-safe owner result.

Direct table writes must not provide a broader mutation surface than the canonical operation. Compatibility writes, if retained, must enforce the same owner, normalization, privacy, and protected-field outcomes. Product and Presentation adapters are not mutation authority.

## 17. Security, RLS, Grants, and Function Boundaries

Canonical security must be enforced below Presentation and include:

- authenticated owner-to-record enforcement;
- RLS enabled on every owner-scoped Identity table exposed through the database API, with explicit policies for each permitted operation;
- owner-select and owner-update boundaries;
- anonymous denial for owner, search, and mutation operations except for a separately authorized public-safe projection;
- cross-owner denial;
- direct-table-write restriction;
- least-privilege grants and explicit revocations;
- protected provenance and system-state enforcement;
- constrained `security definer` use;
- controlled function `search_path`;
- no browser service-role credential or authority;
- privileged migration/backfill execution only within a separately authorized execution; and
- verification of every callable and table boundary.

Security-definer functions must derive authentication in the trusted context, expose no caller-controlled privilege switch, use fixed object resolution, and return no data beyond the caller's authority. RLS, policies, grants, constraints, triggers, and canonical functions must work together; no single client check may substitute for the canonical boundary.

The exact current grant matrix and helper execution privileges remain implementation evidence requiring later assessment.

## 18. Downstream Product Consumption

Downstream Products may consume only governed Identity operations and privacy-safe projections appropriate to their context.

Product Profiles retain composition, module selection, routing, and approved experience behavior. Presentation retains layout, visual hierarchy, formatting, and rendering. Neither may:

- create a competing Identity authority;
- write protected Identity truth;
- receive hidden Identity values for client-side filtering;
- cache a fuller private payload into public Product records;
- reinterpret self-declared values as Recognition or evidence; or
- make canonical privacy depend on a particular Profile implementation.

Grow Network retains relationship and discovery-product behavior. Seed Vault retains Vault ownership and share authority. Community retains publication. Recognition retains assignment and meaning. Sessions, Learn, and other Products retain their established domains.

Compatibility with an authorized Profile consumer requires stable privacy-safe meaning, not preservation of every current adapter, SQL object, or presentation shape.

## 19. Current Implementation Relationship

The principal committed implementation evidence is:

- introduction commit `f883a9d2520c6f0547b375eaa4e62dda010a00a0`;
- migration `supabase/migrations/20260718120000_grow_identity_layer_phase1.sql`;
- implementation description `docs/grow-identity-layer-phase1.md`;
- client contract `src/grow-identity-contract.js`;
- application consumer `app.js`;
- focused regression `scripts/grow-identity-phase1-regression-check.mjs`;
- security regression `scripts/security-access-regression-check.mjs`;
- function audit `scripts/security/function-access-audit.mjs`;
- approved security snapshot `scripts/security/approved-security-fingerprint.json`;
- security runner `scripts/security/run-security-verification.mjs`;
- committed function-access record `docs/grow-function-access-audit-2026-07-15.md`;
- Community/Profile compatibility regression `scripts/community-grow-profile-integration-regression-check.js`;
- package verification entry points in `package.json`;
- Profile Hero compatibility regression `scripts/profile-hero-catalog-regression-check.js`; and
- downstream safe-projection migration `supabase/migrations/20260719140000_profile_hero_catalog_safe_projection.sql`.

The later completion commit `bcdac866963dc57c8fd979c9fb8ec9439367f323` also records directly related documentation, package-script, regression, security-audit, and client-contract changes.

These paths show a canonical member-row extension, Identity constants, normalization, visibility persistence, viewer-aware reads, an owner update operation, a public-safe view, RLS, grants and revocations, protected fields, provenance handling, security fingerprinting, application consumption, and focused regression coverage.

The implementation predates an IC, ICE, read-only Architecture Audit, founder approval, and explicit implementation authorization for this capability. That is a documentary and execution-governance gap, not evidence of retrospective authority.

The completed reconciliation assessment identified no known application or migration correction. That finding is not formal conformance acceptance, does not make every implementation choice governing, and does not eliminate the required later assessment. Final present-day conformance acceptance remains pending.

## 20. Observed Implementation Evidence Requiring Conformance Review

The classifications below inventory evidence; they do not make the final conformance determination.

### 20.1 AUTHORITY-GROUNDED IMPLEMENTATION EVIDENCE

| Observed behavior | Authority-grounded outcome | Remaining review |
| --- | --- | --- |
| `public_member_profiles` is extended as the member-facing canonical Identity row while `profiles` retains authentication-adjacent private state. | One existing canonical member Identity foundation; distinct authentication relationship. | Verify schema identity, ownership, and absence of a competing authority. |
| Profile visibility and per-field visibility are enforced by server-side reads. | Privacy-safe, viewer-aware delivery using the approved vocabularies. | Verify every field, context, fallback, and payload path. |
| Owner operations derive `auth.uid()` and reject caller-selected owner identity. | Authenticated owner association and cross-owner isolation. | Verify all write paths, policies, grants, and adapters. |
| Owner updates reject Recognition, verification, trust/evidence-adjacent, administrative, and protected provenance state. | Protected/system-owned values remain outside owner mutation. | Verify no alternate mass-assignment or direct-write path exists. |
| Legacy private intent is mapped conservatively and unclear visibility is not broadened. | Privacy-preserving existing-record treatment. | Verify every backfill category and production-risk assumption. |
| Public-safe projections filter rows and fields before delivery. | Public projection may expose only explicitly eligible values. | Verify every anonymous and authenticated consumer. |
| Visibility support uses RLS, grants, revocations, policies, constraints, triggers, and canonical functions. | Security must be canonical and least-privilege, not client-only. | Verify the complete effective privilege graph and function context. |
| Touched owner values receive self-declared provenance. | Provenance must preserve the distinction between self-declared and system-owned meaning. | Verify completeness, immutability, and non-forgeability. |

### 20.2 IMPLEMENTATION EVIDENCE REQUIRING CONFORMANCE REVIEW

The following observed choices are relevant but are not independently authoritative:

- exact SQL function names, signatures, response JSON, version strings, relationship labels, and read-context labels;
- the complete client/database field allowlists and their parity;
- the exact username grammar, normalization expression, fallback order, and unique partial index;
- case-insensitive array deduplication, first-occurrence ordering, 25-item default cap, and 100-item helper ceiling;
- exact defaults for primary role, experience, discoverability, connection-request permission, invitation preferences, personalization consent, and each field's visibility;
- reciprocal `grow_follows` rows as the exact implementation of a Connection;
- direct Seed Vault share access as an Identity read context;
- exact administrator bypass behavior;
- legacy `show_profile_in_community_grow` and `allow_followers` synchronization;
- location fallback and display construction;
- the trigger model for owner identifiers, legacy writes, protected values, timestamps, defaults, and visibility seeding;
- public Recognition-wrapper behavior and the exact anonymous grant;
- the precise grants available to `anon`, `authenticated`, and `service_role`;
- the public-safe view's exact column set;
- search substring matching, sorting, and result caps; and
- migration idempotence, rerun, interruption, and applied-ledger assumptions.

Each item remains non-authoritative until assessed against approved IC-GI-001. Unsupported details must not be promoted to a normative requirement merely to preserve current code.

### 20.3 OUTSIDE IC-GI-001 SCOPE

The following evidence is outside this contract except for verifying that it does not acquire Identity authority:

- Profile Hero catalog ownership, cover-image catalog selection, visual hierarchy, and Profile composition;
- the downstream Profile Hero safe-projection feature beyond its consumption of privacy-safe Identity values;
- Grow Network relationship creation, acceptance, follow semantics, and connection lifecycle;
- Seed Vault sharing substance and permissions;
- Recognition definition, assignment, revocation, ranking, or evidence;
- Community publication and moderation;
- Session, lifecycle, Current Conditions, Tasks, Events, Notes, Photos, and Documents behavior;
- Learn, recommendation, invitation-system, Testing Program, Grow Along, GPE, GCE, GRE, GTE, and analytical Product behavior; and
- Developer Scenario fixtures as production authority.

## 21. Verification Obligations

A later approved conformance recovery must verify, without treating this authoring task as that audit:

1. migration identity, committed bytes, introduction chronology, and immutability;
2. canonical schema, owner association, constraints, indexes, and absence of a competing Identity authority;
3. identifier and multi-value normalization outcomes;
4. every legacy normalization and backfill category;
5. uniqueness and deterministic conflict behavior;
6. evidence and provenance preservation;
7. privacy-preserving defaults and absence of broadened ambiguous state;
8. profile and field-visibility behavior;
9. authenticated owner reads;
10. owner updates and rejection of unsupported/protected inputs;
11. authorized non-owner viewer reads;
12. public projection safety;
13. search and discovery safety, including non-payload leakage;
14. anonymous denial for non-public operations;
15. cross-owner read and write denial;
16. direct-write denial or equivalently constrained compatibility paths;
17. RLS enablement and effective policy behavior;
18. table, view, sequence, and function grants and revocations;
19. each security-definer function's authentication derivation, object resolution, controlled `search_path`, and output filtering;
20. browser service-role prohibition and absence of service credentials;
21. protected provenance and protected/system-state non-forgeability;
22. compatibility with separately authorized Profile consumers;
23. deterministic safe rerun, interruption, rollback, and partial-failure behavior;
24. local schema-snapshot parity and migration-ledger expectations without changing a ledger;
25. client/database contract parity where that compatibility remains required;
26. focused Identity regression evidence;
27. security access regression and function-audit evidence; and
28. the classification and disposition of every item in Section 20.

Any eventual deployment assessment must additionally prove target identity, migration plan, backup/recovery boundary, effective database privileges, post-migration verification, and production-safe interruption handling. These are future verification requirements only; they do not authorize deployment or connection to a remote environment.

## 22. Numbered Contract Invariants

1. There is exactly one canonical Platform-owned Identity authority.
2. Canonical Identity is associated with its authenticated owner.
3. Authentication authority and canonical Identity meaning remain distinct.
4. No Product owns a replacement Identity authority.
5. No Presentation surface owns a replacement Identity authority.
6. Unsupported Identity evidence is never fabricated.
7. Unsupported ownership reassignment is prohibited.
8. Ambiguous existing evidence is treated conservatively.
9. Privacy defaults do not broaden unclear existing intent.
10. Profile visibility uses only `personal`, `connections`, and `public`.
11. Field visibility uses only `only_me`, `connections`, and `public`.
12. Field-level visibility is enforced within profile visibility.
13. Viewer-aware projections contain only authorized values.
14. Owner access does not create cross-owner access.
15. Anonymous access is limited to separately authorized public-safe projections.
16. Discoverability does not override profile or field visibility.
17. Search does not leak hidden values through matching, sorting, metadata, or payloads.
18. Direct writes cannot bypass the canonical mutation boundary.
19. Grants remain least privilege.
20. Security-definer behavior is constrained to the required canonical operation.
21. Canonical functions use controlled object resolution and search paths.
22. Browser clients receive no service-role authority.
23. Normalization is deterministic.
24. Backfill preserves evidence and privacy.
25. Provenance is preserved and protected from unsupported assignment.
26. Duplicate canonical identifiers are prevented where canonical uniqueness is required.
27. Identifier conflict does not silently overwrite or reassign truth.
28. Protected and system-controlled values remain protected or system-controlled.
29. Self-declared Identity is not Recognition, verification, trust, or evidence.
30. Suggested values do not become Identity without member confirmation.
31. Downstream Profile consumers cannot mutate protected Identity truth outside canonical operations.
32. Profile composition does not redefine Identity.
33. Presentation-only privacy is insufficient.
34. Relationship and Recognition authority remain separate from Identity.
35. Session, Seed Vault, Grow Network, Community, and Learn ownership remain separate.
36. A source-domain relationship grants no broader Identity disclosure than its established purpose.
37. Existing implementation evidence does not become authority by inclusion in this contract.
38. Existing implementation is not accepted merely because no correction is currently known.
39. IC-GI-001 creates no retrospective authorization.
40. IC-GI-001 authorizes no implementation.
41. IC-GI-001 authorizes no migration or schema change.
42. IC-GI-001 authorizes no deployment or production activity.
43. Later conformance must distinguish authority-grounded outcomes from ungrounded implementation choices.
44. Migration and backfill must have deterministic interruption and rerun behavior before any separately authorized execution.
45. Downstream Products remain replaceable without replacing canonical Identity.
46. Public Profile compatibility cannot justify disclosure beyond canonical privacy.
47. Missing evidence remains missing rather than being completed for Presentation.
48. No capability outside Section 7 gains implementation authority from this contract.

## 23. Stop Conditions

Contract preparation, audit, or later conformance recovery must stop when:

- a proposed normative requirement lacks committed Platform, Foundation, or approved Product authority;
- canonical Identity ownership is ambiguous;
- implementation evidence conflicts with approved authority;
- privacy or visibility behavior cannot be classified safely;
- owner association or provenance cannot be established;
- a security boundary depends only on application or Presentation behavior;
- a required correction exceeds the approved IC-GI-001 boundary;
- resolving an implementation choice would create new architecture;
- deployment evidence is required while deployment remains unauthorized;
- repository attribution cannot be isolated safely;
- an untracked or unapproved Profile document would be required as authority; or
- historical truth could be preserved only by asserting authorization that did not exist.

The stop outcome must identify the exact ambiguity, conflict, or missing authority. It must not be bypassed by adopting current implementation as architecture.

## 24. Explicit Exclusions

IC-GI-001 excludes:

- Grow Profile composition;
- preparation or adoption of CS-GP-001;
- Profile module selection;
- Profile visual hierarchy;
- shared Profile Hero catalog ownership;
- cover-image catalog selection;
- relationship or connection authority;
- Recognition assignment;
- Session ownership;
- Seed Vault ownership;
- Community publication;
- Grow Network behavior;
- lifecycle progression;
- Current Conditions;
- Tasks;
- Events;
- Notes;
- application or implementation changes during this authoring task;
- application correction;
- migration correction;
- schema changes;
- test or verification-script changes;
- production deployment;
- remote-environment access;
- migration-ledger repair;
- production-data mutation;
- creation of ICE-GI-001-1; and
- restart of ICE-SC-003.

## 25. Next Governed Artifact

The next bounded artifact is:

**ICE-GI-001-1 — Grow Identity Layer Phase 1 Present-Day Conformance Recovery**

Proposed path:

`docs/foundation/implementation-contract-executions/ICE-GI-001-1-grow-identity-layer-phase-1-present-day-conformance.md`

ICE-GI-001-1 may be prepared only after:

1. IC-GI-001 passes a strict read-only Architecture Audit;
2. founder governance approval is recorded;
3. IC-GI-001 status and closure language are normalized; and
4. IC-GI-001 and its central-registry entry are committed together.

That later execution must:

- assess existing implementation against approved IC-GI-001;
- preserve historical truth and avoid claims of original implementation authorization;
- distinguish authority-grounded behavior from ungrounded implementation evidence;
- determine present-day conformance;
- identify newly discovered correction requirements, if any;
- record implementation and verification evidence; and
- leave deployment separately unauthorized.

This contract does not create or authorize ICE-GI-001-1.

## 26. Governance Status and Next Stage

IC-GI-001 has passed its required strict read-only Architecture Audit and has received explicit founder governance approval. The audit returned PASS. It identified no blocking architecture defects, no non-blocking clarifications, and no editorial observations requiring correction. Implementation Contract governance for this contract is complete.

Founder approval authorized only approval-state normalization, matching normalization of the single central-registry entry, and bounded documentation closure. Repository integration is limited to one bounded commit of this contract and its single central-registry entry. That closure does not authorize implementation.

No implementation conformance has been accepted. No implementation, migration, schema change, application correction, deployment, production activity, creation or execution of ICE-GI-001-1, or restart of ICE-SC-003 is authorized.

The next separately governed stage after the bounded commit is:

**ICE-GI-001-1 — Grow Identity Layer Phase 1 Present-Day Conformance Recovery**

That stage remains separately governed and is not created, authorized, or begun by this contract.
