# ICE-GI-001-1 — Grow Identity Layer Phase 1 Present-Day Conformance Recovery

**Identifier:** ICE-GI-001-1
**Title:** Grow Identity Layer Phase 1 Present-Day Conformance Recovery
**Status:** Approved — Architecture and Execution-Readiness Audit Passed; Founder Approved; Execution Not Authorized
**Executes:** [IC-GI-001 — Grow Identity Layer Phase 1 Implementation Contract](../implementation-contracts/IC-GI-001-grow-identity-layer-phase-1.md)
**Capability:** Grow Identity Layer Phase 1
**Layer:** Implementation Contract Execution
**Execution authority:** None; this proposed artifact is unapproved and non-executable

## 1. Purpose and Recovery Objective

ICE-GI-001-1 proposes a bounded present-day conformance recovery for the already
committed Grow Identity Layer Phase 1 implementation. It translates approved
IC-GI-001 obligations into an ordered assessment, correction, verification, and
closure model.

This artifact does not validate the implementation merely because it exists. It
preserves conforming behavior, identifies bounded correction obligations, keeps
unknown target state pending, and prohibits fabricated canonical truth.

Authoring this artifact does not authorize source-code or test modification,
schema or migration creation or modification, migration execution, data repair,
deployment, production or connected-environment access, ICE-GI-001-1 execution,
or restart of ICE-SC-003.

## 2. Governing Authority and Provenance

Authority applies in this order:

1. [Grow Platform Architecture](../../platform/grow-platform-architecture.md);
2. [Grow Foundation](../grow-foundation.md);
3. [Grow Philosophy](../../philosophy/grow-philosophy.md);
4. [Grow Platform Milestones](../grow-platform-milestones.md), especially
   Platform Milestone 1;
5. [PF-003 — Profiles, Relationships, and Access](../../product/profile-framework/PF-003-profiles-relationships-and-access.md);
6. [Profile Experience Framework](../../product/profile-experience-framework/profile-experience-framework.md);
7. [Profile Experience Visual Language](../../product/profile-experience-framework/visual-language.md);
8. [Grow Architecture Governance](../../governance/grow-architecture-governance.md);
9. approved [IC-GI-001](../implementation-contracts/IC-GI-001-grow-identity-layer-phase-1.md); and
10. approved predecessor execution governance where directly applicable,
    including [ICE-SC-003](./ICE-SC-003-current-conditions-operations-and-forward-only-legacy-declaration.md).

IC-GI-001 is the direct governing contract. Migration SQL, application code,
tests, snapshots, Git history, and the implementation description are evidence
only. They do not create architecture, approval, implementation authority, or
deployment authority.

## 3. Relationship to IC-GI-001

This ICE executes only IC-GI-001. It does not alter the contract, add Identity
fields or visibility states, transfer canonical ownership, or adopt an
implementation choice merely to preserve current code.

IC-GI-001 was approved and Git-closed at
`e62a8ba3ac5205419b9ada8fba94b52552ff567a`. The contract records that the
implementation and migration predate its governance. This ICE preserves that
historical truth: present-day recovery cannot create retrospective
authorization.

## 4. Relationship to ICE-SC-003 and Prerequisite Migration Order

ICE-SC-003 remains stopped at Phase 0; no Phase 0 work has begun. Its approved
artifact defines Phase 0 preflight but does not itself contain a completed
production result, because ICE-SC-003 implementation remains unauthorized.

The supplied recovery record states that an earlier connected-production
assessment found ten prerequisite migrations missing and that Grow Identity is
the first recovery branch. No connected environment is accessed or re-asserted
by this ICE authoring.

The local chronological migration tail contains exactly the following ten-file
dependency sequence:

1. [`20260718120000_grow_identity_layer_phase1.sql`](../../../supabase/migrations/20260718120000_grow_identity_layer_phase1.sql)
2. [`20260719140000_profile_hero_catalog_safe_projection.sql`](../../../supabase/migrations/20260719140000_profile_hero_catalog_safe_projection.sql)
3. [`20260721180000_grow_companion_phase1.sql`](../../../supabase/migrations/20260721180000_grow_companion_phase1.sql)
4. [`20260723100000_grow_session_entry_path.sql`](../../../supabase/migrations/20260723100000_grow_session_entry_path.sql)
5. [`20260723120000_growing_phase_and_plant_groups.sql`](../../../supabase/migrations/20260723120000_growing_phase_and_plant_groups.sql)
6. [`20260723150000_workspace_tasks_canonical_semantics.sql`](../../../supabase/migrations/20260723150000_workspace_tasks_canonical_semantics.sql)
7. [`20260723160000_workspace_events_canonical_semantics.sql`](../../../supabase/migrations/20260723160000_workspace_events_canonical_semantics.sql)
8. [`20260723170000_growing_workspace_notes.sql`](../../../supabase/migrations/20260723170000_growing_workspace_notes.sql)
9. [`20260727120000_canonical_growing_commencement.sql`](../../../supabase/migrations/20260727120000_canonical_growing_commencement.sql)
10. [`20260728120000_session_conditions_first_canonical_slice.sql`](../../../supabase/migrations/20260728120000_session_conditions_first_canonical_slice.sql)

The second migration explicitly depends on the first. Later capability recovery
must preserve timestamp and dependency order. This ICE governs only the first
Grow Identity branch and cannot replay, absorb, authorize, or reorder the other
nine migrations. The exact future target ledger must be reverified under
separate connected-environment authority; the earlier observation is not
treated as current production fact.

## 5. Execution Scope

Subject to every governance and authorization gate, this ICE may govern:

- reproducible local assessment of the committed Grow Identity migration,
  client contract, consumers, schema-facing behavior, and verification assets;
- preservation of behavior classified as conforming;
- bounded correction of confirmed privacy, search, mutation, protected-field,
  provenance, default, and backfill nonconformance;
- completion of local verification-pending obligations;
- creation or modification of only the minimum implementation, migration, and
  test paths justified by approved IC-GI-001 during a separately authorized
  execution;
- migration rehearsal, failure injection, rerun proof, and security
  verification in an isolated disposable local environment;
- preparation of target-specific preflight and production-verification
  evidence without accessing a target until separately authorized; and
- truthful closure or interruption evidence.

## 6. Explicit Exclusions

This ICE excludes:

- new Platform, Foundation, Product, or Presentation authority;
- a second Identity store or replacement of canonical Identity;
- new Identity fields, privacy vocabulary, visibility states, Recognition
  meaning, relationship meaning, or lifecycle meaning;
- Grow Profile composition and CS-GP-001;
- Profile Hero catalog ownership or presentation redesign;
- relationship creation, acceptance, or connection lifecycle;
- Recognition assignment or verification policy;
- Seed Vault sharing substance;
- Community publication or moderation;
- Session, Grow Companion, workspace, Current Conditions, task, event, note,
  photo, document, Learn, analytics, or intelligence implementation;
- speculative or destructive backfill;
- unsupported owner reassignment or identifier replacement;
- broad migration replay or migration-ledger repair;
- execution of the other nine prerequisite migrations;
- production data repair or deployment without separate target-specific
  authority; and
- restart or execution of ICE-SC-003.

## 7. Preconditions and Repository Preflight

Before any separately authorized ICE execution work:

1. the ICE must have passed a strict read-only Architecture and
   Execution-Readiness Audit;
2. explicit founder approval, status normalization, execution-index
   integration, and bounded Git closure must be complete;
3. a separate explicit ICE-GI-001-1 execution authorization must identify the
   allowed phases and path boundary;
4. the repository root, branch, HEAD, working tree, and staged boundary must be
   recorded;
5. approved IC-GI-001 identity, status, structure, invariant hash, and bytes
   must match their governed baseline;
6. the Grow Identity migration and its introduction chronology must be
   verified without rewriting the committed migration;
7. unrelated working-tree content must be isolated and preserved;
8. an isolated disposable local database target must be identified before any
   test or migration write;
9. no production or connected target may be contacted without a later explicit
   target-specific authorization; and
10. any mismatch in authority, attribution, identity ownership, privacy
    meaning, or executable path scope must stop work before mutation.

## 8. Present Repository Baseline and Evidence Catalog

The implementation was introduced by
`f883a9d2520c6f0547b375eaa4e62dda010a00a0`. The principal evidence is:

| Key | Exact repository evidence path | Evidentiary use |
| --- | --- | --- |
| A1 | [`docs/foundation/implementation-contracts/IC-GI-001-grow-identity-layer-phase-1.md`](../implementation-contracts/IC-GI-001-grow-identity-layer-phase-1.md) | Approved governing obligations and 48 invariants |
| E1 | [`supabase/migrations/20260718120000_grow_identity_layer_phase1.sql`](../../../supabase/migrations/20260718120000_grow_identity_layer_phase1.sql) | Canonical persistence, normalization, privacy, reads, writes, grants, and public projection |
| E2 | [`supabase/migrations/20260719140000_profile_hero_catalog_safe_projection.sql`](../../../supabase/migrations/20260719140000_profile_hero_catalog_safe_projection.sql) | Effective later definition of the public Profile projection |
| E3 | [`docs/grow-identity-layer-phase1.md`](../../grow-identity-layer-phase1.md) | Historical implementation description |
| E4 | [`src/grow-identity-contract.js`](../../../src/grow-identity-contract.js) | Client vocabulary and default contract evidence |
| E5 | [`app.js`](../../../app.js) | Current Identity consumer and write routing |
| E6 | [`scripts/grow-identity-phase1-regression-check.mjs`](../../../scripts/grow-identity-phase1-regression-check.mjs) | Focused local database regression coverage |
| E7 | [`scripts/security-access-regression-check.mjs`](../../../scripts/security-access-regression-check.mjs) | Effective access and anonymous-boundary checks |
| E8 | [`scripts/security/function-access-audit.mjs`](../../../scripts/security/function-access-audit.mjs) | Function privilege and search-path audit |
| E9 | [`scripts/security/approved-security-fingerprint.json`](../../../scripts/security/approved-security-fingerprint.json) | Reviewed security-state snapshot |
| E10 | [`scripts/security/run-security-verification.mjs`](../../../scripts/security/run-security-verification.mjs) | Security verification orchestration |
| E11 | [`docs/grow-function-access-audit-2026-07-15.md`](../../grow-function-access-audit-2026-07-15.md) | Committed function-access record |
| E12 | [`scripts/community-grow-profile-integration-regression-check.js`](../../../scripts/community-grow-profile-integration-regression-check.js) | Community/Profile compatibility coverage |
| E13 | [`scripts/profile-hero-catalog-regression-check.js`](../../../scripts/profile-hero-catalog-regression-check.js) | Downstream Profile Hero dependency coverage |
| E14 | [`package.json`](../../../package.json) | Verification entry points |
| E15 | [`ICE-SC-003-current-conditions-operations-and-forward-only-legacy-declaration.md`](./ICE-SC-003-current-conditions-operations-and-forward-only-legacy-declaration.md) | Predecessor execution gates and stop model |
| E16 | [`supabase/migrations/20260623124000_shared_seed_vault_direct_user_shares.sql`](../../../supabase/migrations/20260623124000_shared_seed_vault_direct_user_shares.sql) | Established direct-Vault sharing behavior and purpose-bounded owner attribution evidence |

Local evidence shows one canonical member-facing row, distinct private account
state, server-derived viewer operations, field visibility, owner mutation, a
public projection, RLS, grants, security-definer functions, client consumers,
and focused tests. It also affirmatively shows the defects recorded below.

No test, local database mutation, remote inspection, production inspection, or
connected-environment verification was performed while authoring this ICE.

## 9. Conformance Model and Evidence Limitations

Each IC-GI-001 invariant has exactly one primary row in Section 11 and one of
the contract-prescribed classifications. `Conforming` means affirmative
repository evidence supports present repository implementation conformance; it
does not claim that a connected or production environment has the same state.

`Verification pending` is used only where static evidence cannot prove the
deterministic interruption and rerun behavior required by invariant 44.
Remaining runtime, privilege, cross-domain, and target verification within a
`Nonconforming` row does not erase a confirmed local defect or create a second
primary classification.
`Not applicable to repository implementation` is limited to governance
invariants or a conditional feature absent from Phase 1. No invariant is
classified as unresolved because IC-GI-001 supplies enough authority to define
the recovery boundary.

## 10. Present-Day Conformance Summary

| Classification | Count |
| --- | ---: |
| Conforming | 20 |
| Partially conforming | 6 |
| Nonconforming | 12 |
| Verification pending | 1 |
| Not applicable to repository implementation | 9 |
| Unresolved because authoritative evidence is unavailable | 0 |
| **Total** | **48** |

The confirmed recovery is bounded to defects already evidenced in E1, E2, E5,
and E16:

- categorical defaults and backfill manufacture `grower`, `new`, or other
  fallback identity meaning without attributable evidence;
- absent field-visibility rows are treated as public for several public
  projection fields;
- the public-safe view exposes raw `username` and unfiltered system/profile
  columns outside field-level authorization;
- search matches and sorts on hidden `display_name` or identifier values before
  projection filtering;
- security-definer functions therefore already have confirmed authorization or
  output defects even though the remainder of the effective function graph
  still requires verification;
- authenticated legacy direct-column updates bypass the canonical RPC
  allowlist and self-declared provenance write, including the Profile client's
  construction and direct upsert of `profile_type` through that path;
- some owner-updatable direct columns are not approved as owner-controlled
  Identity values;
- generic Identity directly reads and serializes Recognition and verification
  state instead of consuming only an authorized privacy-safe Recognition-domain
  projection; and
- a direct Vault relationship can bypass normal profile-scope behavior and
  receive a generic Identity response broader than purpose-bounded Vault
  attribution.

## 11. IC-GI-001 Invariant Traceability Matrix

This is the sole primary invariant traceability table. Evidence keys resolve to
the exact paths in Section 8.

| No. | Concise governing requirement | Exact evidence path(s) | Classification | Recovery obligation | Required verification | Connected or production verification required | Resolvable before production migration execution | Dependency |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | One canonical Platform Identity authority | A1; E1; E3 | Conforming | Preserve `public_member_profiles` as the member-facing canonical row and `profiles` as distinct private account state; reject any duplicate authority. | Schema/consumer inventory and duplicate-authority search. | Yes — confirm target schema before and after migration. | Yes | None |
| 2 | Canonical Identity is tied to its authenticated owner | E1; E6 | Conforming | Preserve stable `user_id`, auth-derived owner scope, RLS, and trigger protection. | Owner, anonymous, and cross-owner read/write tests. | Yes — confirm target ownership and policies. | Yes | Authentication |
| 3 | Authentication and canonical Identity remain distinct | A1; E1; E3 | Conforming | Preserve separate private `profiles` and member-facing Identity meaning. | Schema and API payload inspection. | Yes — confirm no target drift. | Yes | Authentication |
| 4 | No Product owns replacement Identity | E1; E5; E12; E13 | Conforming | Preserve canonical RPC/projection consumption and prohibit Product-owned copies. | Consumer and persistence inventory. | Yes — post-migration smoke verification. | Yes | Profile, Community |
| 5 | No Presentation surface owns replacement Identity | E4; E5 | Conforming | Preserve Presentation as a consumer only. | Client flow and write-route review. | No | Yes | Presentation |
| 6 | Unsupported Identity evidence is never fabricated | E1 | Nonconforming | Replace evidence-free categorical defaults/backfill (`grower`, `new`, and comparable fallbacks) with truthful absent, legacy, or separately governed treatment without rewriting valid evidence. | Fixture matrix for null, invalid, legacy, and supported values; before/after evidence proof. | Yes — classify target rows before any write and verify after. | Yes | None |
| 7 | Ownership is never reassigned without authority | E1; E6 | Conforming | Preserve owner-ID trigger restoration, RLS, and conflict refusal. | Direct-write and concurrent owner-ID mutation tests. | Yes — verify target ownership anomalies before migration. | Yes | Authentication |
| 8 | Ambiguous existing evidence is conservative | E1 | Partially conforming | Preserve conservative privacy mapping; correct categorical fallback that converts ambiguity into asserted Identity. | Exhaustive legacy-category decision table and fixtures. | Yes — target category counts require later authorized inspection. | Yes | None |
| 9 | Privacy defaults never broaden unclear intent | E1; E2 | Partially conforming | Preserve `personal`/`connections` mappings; make missing visibility evidence fail closed instead of defaulting public in projections. | Missing-row, partial-row, null-legacy, and interrupted-seed tests. | Yes — verify target visibility completeness and effective reads. | Yes | None |
| 10 | Profile visibility vocabulary is exact | E1; E4; E6 | Conforming | Preserve the three-value constraint and RPC validation. | Constraint, client parity, and invalid-input tests. | Yes — confirm target constraint. | Yes | None |
| 11 | Field visibility vocabulary is exact | E1; E4; E6 | Conforming | Preserve the three-value constraint and allowlisted keys. | Constraint, RLS, parity, and invalid-input tests. | Yes — confirm target table and constraint. | Yes | None |
| 12 | Field visibility is enforced within profile visibility | E1; E2; E6 | Nonconforming | Remove or filter raw public-view columns that bypass field visibility; retain profile-scope gating. | Full field-by-scope projection matrix, including missing visibility rows. | Yes — anonymous and authenticated target probes after migration. | Yes | Profile |
| 13 | Viewer projections contain only authorized values | E1; E2; E6 | Nonconforming | Filter public `username`, system/profile state, timestamps, and other non-allowlisted values; review always-returned `system_identity`. | Payload-key allowlist tests for owner, connection, unrelated, Vault, search, and public viewers. | Yes — target RPC/view verification. | Yes | Profile, Recognition |
| 14 | Owner access creates no cross-owner access | E1; E6; E7 | Conforming | Preserve server-derived actor identity and owner RLS. | Cross-owner RPC, table, and direct-write denial tests. | Yes — verify effective target roles/policies. | Yes | Authentication |
| 15 | Anonymous access is only through authorized public-safe projections | E1; E2; E7 | Partially conforming | Preserve dedicated anonymous view/wrapper boundaries; repair their payload allowlists before treating them as public-safe. | Anonymous function/table inventory and response-key tests. | Yes — anonymous target probes required. | Yes | Profile, Recognition |
| 16 | Discoverability cannot override profile or field visibility | E1; E6 | Conforming | Preserve profile gate and per-field filtering in network search results. | Discoverable/personal/connections/public matrix. | Yes — post-migration target smoke test. | Yes | Grow Network |
| 17 | Search cannot leak hidden values through match, sort, metadata, or payload | E1; E6 | Nonconforming | Ensure matching and sorting use only viewer-authorized searchable values; add tests proving hidden terms do not affect inclusion or order. | Hidden display-name/username match and order side-channel tests plus payload tests. | Yes — target search verification after migration. | Yes | Grow Network |
| 18 | Direct writes cannot bypass canonical mutation | E1; E5; E6 | Nonconforming | Remove or equivalently constrain the broad legacy column-update path so allowlist validation, protected-field rules, normalization, and provenance are identical to the canonical operation. | Effective column-grant audit; direct/RPC equivalence and denial tests. | Yes — verify target grants and PostgREST behavior. | Yes | Profile compatibility |
| 19 | Grants remain least privilege | E1; E7; E8; E9; E11 | Partially conforming | Preserve revocations and scoped functions; narrow the authenticated direct-update column set and public projection exposure. | Effective relation, column, sequence, and function privilege graph. | Yes — target privilege graph is mandatory. | Yes | Authentication, Profile |
| 20 | Security-definer functions are constrained to required operations | E1; E7; E8; E9; E11 | Nonconforming | Correct the confirmed hidden-value search and generic source-domain Identity output defects; separately preserve and verify every function's bounded caller, target selection, authorization, output, mutation, owner, search path, and execution grant. | Focused regression for confirmed defects plus a disposable-database audit of the complete effective function graph, runtime behavior, privileges, and payload keys. | Yes — verify the corrected functions and complete effective graph against the exact target after migration. | Yes | Authentication, Recognition, Vault |
| 21 | Canonical functions use controlled resolution/search paths | E1; E8; E11 | Conforming | Preserve fixed `search_path` and qualified canonical objects. | Function catalog audit; fail on any security-definer function lacking a controlled path. | Yes — target catalog verification. | Yes | None |
| 22 | Browser clients have no service-role authority | E5; E7; E9 | Conforming | Preserve anon/authenticated client configuration and service-role denial. | Source credential scan and runtime access regression. | Yes — verify deployed client configuration separately. | Yes | Deployment configuration |
| 23 | Normalization is deterministic | E1; E4; E6 | Conforming | Preserve deterministic identifier, text, array, location, and vocabulary normalization except where evidence-free defaults must be removed. | Repeat, case-folding, collision, ordering, and cap fixtures. | Yes — post-migration sampling without exposing private data. | Yes | None |
| 24 | Backfill preserves evidence and privacy | E1; E2 | Partially conforming | Retain valid values and conservative privacy; eliminate fabricated defaults and public fallback on missing visibility; never rewrite unsupported truth. | Before/after category counts, row hashes where safe, and interrupted-backfill fixtures. | Yes — authorized target classification and post-write reconciliation. | Yes | None |
| 25 | Provenance is preserved and protected | E1; E6 | Partially conforming | Preserve anti-forgery controls; make every permitted compatibility mutation record truthful provenance or retire that path; preserve honest absence for legacy values. | RPC/direct-write provenance matrix and immutability tests. | Yes — inspect target provenance categories before and after. | Yes | None |
| 26 | Canonical duplicate identifiers are prevented | E1; E6 | Conforming | Preserve normalized partial unique index and deterministic validation. | Concurrent normalized-collision tests and index inspection. | Yes — preflight target duplicates, then verify constraint. | Yes | None |
| 27 | Identifier conflict never overwrites/reassigns truth | E1; E6 | Conforming | Preserve conflict failure and existing owner/identifier evidence. | Collision and concurrent-claim tests with before/after proof. | Yes — target conflict category preflight. | Yes | Authentication |
| 28 | Protected/system-controlled values remain protected | E1; E6 | Nonconforming | Preserve verified/reserved/provenance protection; remove direct owner mutation of unapproved `profile_type`, `account_type`, identity/QR/timestamp, and other protected or non-allowlisted columns. | Canonical allowlist comparison and adversarial mass-assignment tests. | Yes — target column grants and RPC probes. | Yes | Recognition, Profile |
| 29 | Self-declared Identity is not Recognition/trust/evidence | E1; E6 | Conforming | Preserve distinct provenance values and separate Recognition storage/projection. | Mutation and response-domain separation tests. | Yes — target data and callable verification. | Yes | Recognition |
| 30 | Suggested values require member confirmation | E1; E4; E5 | Not applicable to repository implementation | Phase 1 contains no suggestion-to-Identity operation; preserve the prohibition and stop if one is discovered. | Source/function search and negative route inventory. | No | N/A | Future suggestion capability |
| 31 | Downstream Profiles cannot mutate protected truth outside canonical operations | E1; E5; E12; E13 | Nonconforming | The Profile client constructs `profile_type` and directly upserts it through the granted compatibility path. Retire or equivalently constrain that path so supported owner edits use approved canonical operations with identical owner, allowlist, protected-field, normalization, grant, and provenance outcomes. | Profile consumer write-route, direct/RPC equivalence, protected-field, privilege, and provenance tests. | Yes — verify the deployed consumer and effective target grants later. | Yes | Profile |
| 32 | Profile composition cannot redefine Identity | E5; E12; E13 | Conforming | Preserve composition as a consumer and keep catalog/presentation fields outside canonical Identity meaning. | Persistence and consumer inventory. | No | Yes | Profile |
| 33 | Presentation-only privacy is insufficient | E1; E2; E5; E6 | Conforming | Preserve server-side filtering; repair server payload defects rather than hiding them in the client. | Network-response tests proving hidden keys are absent. | Yes — target endpoint probes. | Yes | Profile |
| 34 | Relationship and Recognition authority stay separate | A1; E1; E6 | Nonconforming | Generic Identity currently reads and serializes Recognition and verification data directly. Preserve Recognition-domain ownership and valid durable references; require Identity to consume only an authorized privacy-safe Recognition projection without acquiring, reproducing, or broadening Recognition projection authority. | Authorized/unauthorized viewer, visibility, payload-key, output-field, source-leakage, data-preservation, and durable-reference tests. | Yes — verify the effective Recognition projection and payload boundary against the exact target. | Yes | Recognition |
| 35 | Session, Vault, Network, Community, and Learn ownership stay separate | E1; E5; E12 | Conforming | Preserve read-only bounded consumption and reject cross-domain writes. | Domain ownership and write-route inventory. | No | Yes | Named source domains |
| 36 | A source relationship grants no broader Identity disclosure than its purpose | A1; E1; E6; E16 | Nonconforming | The direct Vault relationship can bypass normal profile scope and receive a generic Identity response. Remove that generic path or narrow it to demonstrably authorized Vault-purpose attribution; preserve valid sharing and owner attribution, and stop rather than invent authority if the exact purpose cannot be traced. | All-field source-context tests covering owner/non-owner viewers, profile and field scope, search, payload keys, access denial, connection scope, and absence of general Profile access from Vault sharing. | Yes — repeat purpose-bound relationship and denial fixtures against the exact target after migration. | Yes | Seed Vault, Grow Network |
| 37 | Included implementation evidence does not become authority | A1 | Not applicable to repository implementation | This is a governance rule applied by this ICE; no implementation change is created. | Architecture audit checks evidence/authority separation. | No | N/A | Governance |
| 38 | “No known correction” is not implementation acceptance | A1 | Not applicable to repository implementation | This ICE performs the required assessment and does not inherit prior acceptance. | Audit the findings and evidence chain. | No | N/A | Governance |
| 39 | IC-GI-001 creates no retrospective authorization | A1; E3 | Not applicable to repository implementation | Preserve introduction chronology and avoid retrospective claims. | Governance and Git-history audit. | No | N/A | Governance |
| 40 | IC-GI-001 authorizes no implementation | A1 | Not applicable to repository implementation | Require separate approved ICE and explicit execution authorization. | Governance-state preflight. | No | N/A | Governance |
| 41 | IC-GI-001 authorizes no migration/schema change | A1 | Not applicable to repository implementation | Require separately authorized ICE execution and bounded paths. | Governance-state and diff preflight. | No | N/A | Governance |
| 42 | IC-GI-001 authorizes no deployment/production activity | A1 | Not applicable to repository implementation | Require separate target-specific deployment and connected-access authority. | Authorization and target-identity preflight. | No | N/A | Governance |
| 43 | Conformance distinguishes grounded outcomes from implementation choices | A1 | Not applicable to repository implementation | Maintain the classification/evidence model in this ICE and its audit. | Traceability audit of all 48 rows. | No | N/A | Governance |
| 44 | Migration/backfill interruption and rerun are deterministic before execution | E1; E2; E6 | Verification pending | Rehearse clean apply, safe rerun, seeded legacy apply, mid-phase failure, retry, and projection replacement; correct only contract-conflicting behavior. | Disposable-database replay, failure injection, before/after comparison, and ledger simulation. | Yes — target ledger preflight and post-migration verification. | Yes | Migration 20260719140000 |
| 45 | Products remain replaceable without replacing Identity | E1; E4; E5; E12; E13 | Conforming | Preserve stable privacy-safe meaning rather than every adapter or view shape. | Consumer substitution and persistence-boundary review. | No | Yes | Profile, Community |
| 46 | Public Profile compatibility cannot justify extra disclosure | E1; E2; E13 | Nonconforming | Reduce the public view to canonically public, field-authorized values; downstream compatibility must adapt to safe output. | Exact public column/payload allowlist and anonymous tests. | Yes — deployed public endpoint verification. | Yes | Profile |
| 47 | Missing evidence remains missing, not completed for Presentation | E1 | Nonconforming | Remove unsupported role/experience/profile-type completion; preserve null, legacy, or unresolved meaning where authority permits and stop where schema cannot represent truth safely. | Null/invalid/legacy fixture matrix and before/after evidence proof. | Yes — target classification required before backfill. | Yes | Profile |
| 48 | No excluded capability gains implementation authority | A1 | Not applicable to repository implementation | Keep execution paths and phases bounded to Grow Identity; create separate authority for any dependency change. | Architecture audit, path-boundary check, and final diff review. | No | N/A | Governance |

## 12. Recovery Boundary and Conforming Behavior to Preserve

Recovery must preserve:

- the one canonical member Identity and durable owner reference;
- distinction between authentication account state and canonical Identity;
- existing valid identifiers and normalized uniqueness;
- owner/viewer separation and cross-owner denial;
- exact profile and field-visibility vocabularies;
- server-side privacy enforcement and omission of hidden payload values;
- existing intentional private, connections-only, or public choices;
- valid field visibility and its attributable provenance;
- existing valid Recognition records and durable references without deletion,
  recreation, reinterpretation, or reclassification;
- separate Community, Grow Network, Seed Vault, Session, Learn, and Profile
  ownership;
- valid connection and direct-Vault relationship records plus purpose-bounded
  owner attribution, without preserving generic or broader Identity disclosure;
- valid existing data, unknown values, unavailable values, and honest
  provenance absence;
- no browser service-role authority;
- controlled security-definer search paths; and
- Canonical Platform → Products → Presentation dependency direction.

Conforming code may be changed only when unavoidable to implement an approved
bounded correction, and equivalent preservation must be proven.

## 13. Confirmed Recovery Obligations

The following obligations are mandatory before any production migration
execution can be considered:

1. make every public projection deny by default when field-visibility evidence
   is absent or incomplete;
2. remove, null, or canonically authorize every raw public column that bypasses
   field-level visibility, including raw username and system/profile state;
3. ensure search inclusion and ordering depend only on fields searchable by the
   current viewer;
4. retire or equivalently constrain the legacy direct-update path, including
   the Profile client's construction and direct upsert of `profile_type`, so it
   cannot bypass the canonical allowlist, normalization, protected fields,
   grants, canonical operations, or provenance;
5. narrow relation and column privileges to least privilege;
6. remove evidence-free categorical completion and define truthful treatment
   for missing, invalid, ambiguous, and legacy values;
7. preserve existing valid values and intentional privacy without destructive
   rewrite;
8. correct the confirmed security-definer authorization and output defects,
   including hidden-value search behavior and generic Identity source-domain
   output, while retaining complete effective-function verification;
9. preserve Recognition-domain ownership and require Identity to consume only
   an authorized privacy-safe Recognition projection, without acquiring,
   reproducing, or broadening Recognition projection authority;
10. remove the generic Vault Identity path or narrow it to demonstrably
    authorized Vault-purpose attribution while preserving valid sharing and
    owner-attribution behavior; and
11. add regression coverage that fails on every confirmed defect.

The exact SQL shape, function name, adapter, migration timestamp, and test
framework remain implementation choices. No correction may introduce new
canonical meaning.

## 14. Verification-Pending and Unresolved Obligations

Before any execution write, Phase 0 must verify immutable governing bytes,
attributable working-tree state, exact migration chronology, path scope, and the
absence of a competing Identity authority.

Local disposable-database verification must prove each confirmed correction and
resolve the remaining verification obligations:

- the complete effective security-definer function and privilege graph after
  correcting the known authorization and output defects, including runtime
  behavior, ownership, grants, search paths, authorization, output fields, and
  payload keys;
- the corrected shared-Vault and connection disclosure scopes for every
  applicable source context, including profile scope, field scope, search,
  access denial, and absence of general Profile access from Vault sharing;
- the authorized Recognition projection for authorized and unauthorized
  viewers, including visibility, output keys, source-domain non-leakage, valid
  data preservation, and durable references;
- migration clean replay, rerun, interruption, partial failure, and retry;
- schema snapshot and client/database contract parity; and
- the full owner/viewer/public/search/direct-write matrix.

Later connected or production verification must establish the exact target,
current migration ledger, schema, roles, privileges, data categories, backup
and recovery boundary, execution result, and post-migration behavior. Those
target facts remain unverified until separately authorized and observed, but
they do not change the primary `Nonconforming` classifications for invariants
20, 31, 34, and 36. Invariant 44 is the sole primary `Verification pending`
row.

There are no present `Unresolved because authoritative evidence is unavailable`
classifications. Discovery of missing authority during audit or execution is a
stop condition, not permission to invent a resolution.

## 15. Dependencies and Ordering Constraints

1. IC-GI-001 remains the only direct Identity authority for this execution.
2. Authentication is consumed only to establish the actor and stable owner.
3. Recognition, Grow Network, Seed Vault, Community, and Profile decisions are
   read-only dependencies unless separately authorized.
4. Grow Identity recovery must precede
   `20260719140000_profile_hero_catalog_safe_projection.sql`.
5. The remaining eight later prerequisite migrations remain ordered after that
   projection and outside this ICE.
6. No migration may be replayed out of timestamp order.
7. No connected target may be inspected merely to improve this document.
8. ICE-SC-003 remains stopped until every prerequisite branch is separately
   governed, recovered, verified, and closed.

## 16. Data Preservation and Existing-Record Treatment

Existing records must be classified without changing them before correction is
designed. At minimum classify:

- supported and attributable values;
- missing values;
- invalid but attributable legacy values;
- ambiguous values;
- explicit private, connections-only, and public choices;
- missing or partial field-visibility rows;
- identifier collisions;
- owner-association conflicts;
- absent, valid, or suspicious provenance; and
- public rows whose current projection would disclose unapproved columns.

Valid evidence is retained. Missing evidence stays missing. Ambiguous evidence
receives no broader privacy or meaning. No record is assigned `grower`, `new`,
verified, recognized, connected, public, or any other canonical state merely to
satisfy a constraint or Presentation. If the approved schema cannot represent
truthful treatment safely, execution stops for the smallest bounded governance
decision.

## 17. Authentication, Authorization, Privacy, Visibility, and RLS

Every owner operation derives `auth.uid()` at the trusted boundary. Caller
input cannot select the acting owner or viewer. Anonymous callers receive only
an explicitly public-safe projection. Authenticated non-owners receive only the
intersection of profile scope, field scope, context, and source-domain
authority.

Recognition and verification may enter Identity only through the owning
Recognition domain's authorized privacy-safe projection. A Vault relationship
may provide only demonstrably authorized Vault-purpose attribution and cannot
become general Profile or Identity access. If either source-domain boundary
cannot be traced to approved authority, execution stops rather than inventing
authority.

RLS, policies, grants, revocations, constraints, triggers, and canonical
functions must be evaluated together. New or corrected operations remain
inaccessible until their security and response filtering pass. Application
hiding cannot cure a server payload leak. Service-role authority cannot be
shipped to a browser or inferred for an owner-facing operation.

## 18. Authorized Path Envelope and Prohibited Actions

A future execution authorization must list exact paths. Expected categories are
limited to:

- a forward-only Grow Identity corrective migration if evidence requires one;
- the minimum Identity client or consumer compatibility path;
- focused Identity and security regression paths;
- execution evidence and an approved ledger entry when applicable; and
- this ICE's execution-status normalization only under separate authority.

The existing committed migration must not be rewritten unless a separate
governance decision explicitly overrides forward-only repository practice.

Execution must not:

- fabricate canonical values or provenance;
- broaden disclosure during fallback, interruption, or compatibility work;
- overwrite identifiers or reassign owners;
- use production as a test environment;
- blindly retry an uncertain write;
- repair unrelated schema or migration ledger state;
- absorb another prerequisite capability;
- stage or commit unrelated content; or
- restart ICE-SC-003.

## 19. Ordered Execution Model

Execution is ordered and gated:

1. Phase 0 — Repository, authority, and evidence preflight
2. Phase 1 — Reproducible local baseline and data-category model
3. Phase 2 — Privacy, public-projection, and search recovery
4. Phase 3 — Canonical mutation, grants, protected-field, and provenance recovery
5. Phase 4 — Existing-record, backfill, idempotency, and interruption recovery
6. Phase 5 — Full local verification and downstream compatibility
7. Phase 6 — Connected-target and production-readiness gate
8. Phase 7 — Separately authorized target migration and post-migration verification
9. Phase 8 — Closure, interruption, and predecessor handoff

No phase begins before its entry gate passes. Phase 6 requires separate
connected-access authority. Phase 7 requires separate target-specific migration
and deployment authority in addition to ICE execution authority.

## 20. Phase 0 — Repository, Authority, and Evidence Preflight

### Entry Conditions

- ICE governance is complete and explicit execution authority exists.
- No connected or production access is needed.

### Authorized Work

- Verify Section 7 preconditions, exact path boundary, evidence hashes,
  migration chronology, and invariant dispositions.
- Reconfirm no new authority or later capability is needed.

### Required Evidence and Exit

- Exact repository and governing baseline.
- Zero unexplained staged or attributable paths.
- One accepted disposition for each invariant.
- A disposable local verification target and safe restart point.

### Stop and Interruption

Stop before mutation on any mismatch, authority gap, privacy ambiguity,
unattributable change, or path expansion. Record the discrepancy and the
smallest restart condition.

## 21. Phase 1 — Reproducible Local Baseline

### Entry Conditions

- Phase 0 passes.
- A disposable local database is authorized and isolated.

### Authorized Work

- Reproduce clean migration order and focused regressions.
- Inventory schema, grants, functions, consumers, public payloads, and legacy
  record categories without production access.
- Convert every assumption into a testable baseline fact.

### Exit Conditions

- Confirmed defects reproduce.
- Conforming behavior has preservation tests.
- Pending local obligations have deterministic test plans.

### Stop and Interruption

Stop if repository migrations cannot reproduce, fixtures require invented
truth, or an observed defect exceeds IC-GI-001.

## 22. Phase 2 — Privacy, Public Projection, and Search Recovery

### Entry Conditions

- Phase 1 baseline is reproducible.
- The exact public, viewer-aware, Recognition-projection, and source-purpose
  allowlists are traced to approved authority.

### Authorized Work

- Implement the minimum forward-only correction for invariants 9, 12, 13, 15,
  16, 17, 20, 33, 34, 36, and 46. Invariant 20 work in this phase is limited to
  its confirmed projection, search, authorization, and output defects.
- Make missing visibility fail closed.
- Ensure search matching, sorting, metadata, and payloads cannot use hidden
  values.
- Require generic Identity to consume only an authorized privacy-safe
  Recognition projection and never reproduce or broaden Recognition authority.
- Remove the generic Vault Identity path or narrow it to demonstrably authorized
  Vault-purpose attribution without damaging valid sharing or attribution.

### Exit Conditions

- Every viewer/source-context/field combination has a passing response-key and
  access-denial test.
- Public compatibility exposes no value beyond canonical privacy.
- Known security-definer output defects are corrected; generic Identity neither
  leaks direct Recognition source data nor derives general Profile access solely
  from Vault sharing.

### Stop and Interruption

Keep corrected projections inaccessible or retain the last safe projection if
authorization, field classification, source-purpose attribution, Recognition
projection authority, or compatibility cannot be proven. Stop rather than
invent source-domain authority.

## 23. Phase 3 — Mutation, Grants, Protected Fields, and Provenance Recovery

### Entry Conditions

- Phase 2 passes.
- Owner-controlled and protected allowlists are exact.

### Authorized Work

- Implement the minimum correction for invariants 18, 19, 25, 28, and 31.
- Retire or constrain direct compatibility writes, including the Profile
  client's construction and direct upsert of `profile_type`.
- Preserve owner scope, normalization, protected state, and truthful
  self-declared provenance.

### Exit Conditions

- RPC and any retained compatibility path have equivalent approved outcomes.
- Effective grants are least privilege.
- Protected/system fields and provenance cannot be forged.

### Stop and Interruption

Revoke or keep new write paths inaccessible on any partial authorization,
provenance, privilege, or direct-write failure.

## 24. Phase 4 — Existing Records, Backfill, Idempotency, and Interruption

### Entry Conditions

- Phases 2 and 3 pass locally.
- The Section 16 category model is complete.

### Authorized Work

- Implement truthful treatment for invariants 6, 8, 9, 24, 25, 44, and 47.
- Rehearse clean apply, rerun, partial failure, uncertain completion, and retry.
- Prove valid values and privacy are preserved.

### Exit Conditions

- No fixture gains fabricated Identity, provenance, ownership, or disclosure.
- Identical retry is safe and conflicting retry stops.
- Interrupted work has a known schema/data/authority state and restart point.

### Stop and Interruption

Do not coerce unresolved records to satisfy constraints. Preserve the last
known truthful state and require bounded authority if no safe representation
exists.

## 25. Phase 5 — Full Local Verification and Compatibility

### Entry Conditions

- All local corrections are complete.
- No corrected path is exposed to a connected target.

### Authorized Work

- Run the Section 28 matrix, security verification, client/database parity,
  downstream compatibility, failure injection, and complete invariant review.
- Verify the complete effective security-definer graph, corrected Recognition
  projection boundary, and every applicable purpose-bounded Vault, connection,
  search, owner, and non-owner source context.
- Review the entire bounded diff for new authority or unrelated change.

### Exit Conditions

- All blocking local checks pass.
- All confirmed security-definer, Profile mutation, Recognition projection, and
  Vault-purpose disclosure corrections pass their focused regressions.
- All 48 invariant dispositions are satisfied; only explicitly target-dependent
  verification facts may remain for Phases 6–7.
- A target-independent recovery package is reviewable.

### Stop and Interruption

Any failed, missing, flaky, or un-attributable blocking result stops target
preparation. Tests alone cannot override ambiguous authority or data.

## 26. Phase 6 and Phase 7 — Connected and Production Gates

Phase 6 is inaccessible until a separate instruction authorizes read-only
access to one exact target. It must verify target identity, migration ledger,
schema, extensions, roles, grants, RLS, function ownership/search paths,
canonical row categories, identifier conflicts, visibility completeness,
backup/recovery readiness, maintenance/cutover constraints, and the exact
ordered migration plan.

If the target differs from the earlier ten-migration observation, stop and
record current evidence. Do not repair the ledger or broaden the plan.

Phase 7 is inaccessible until all prior phases pass and a separate explicit
target-specific instruction authorizes migration execution, deployment,
production mutation, rollback boundary, evidence recording, and accountable
operators. The execution must follow dependency order, use forward-only
correction, verify each committed outcome, and stop before the next
prerequisite capability.

Post-migration verification must repeat owner/viewer/public/search/security,
effective-function, Recognition-projection, and purpose-bounded Vault tests
against the exact target without exposing private payloads in logs.

## 27. Transaction, Idempotency, Concurrency, and Recovery Model

Correction operations must be atomic at their governed boundary. Identifier
uniqueness must remain database-enforced under concurrency. Visibility rows and
their canonical values must not reach a state where absent evidence silently
means public. Provenance and the value it describes must not commit
inconsistently.

Every migration or repair operation must distinguish:

- not started;
- applied successfully;
- failed and rolled back;
- partially applied but safely dormant;
- completion uncertain; and
- verified complete.

Identical retry may proceed only when idempotency is proven. Conflicting or
uncertain retry stops for inspection. Roll-forward is preferred only when it
preserves evidence and the last safe authority. Rollback must not erase newly
committed canonical evidence. An interruption record identifies completed and
incomplete phases, active schema and write authority, preserved evidence, and
safe restart conditions.

## 28. Verification Matrix

| Requirement | Invariants | Phase | Verification | Required result | Blocking |
| --- | --- | --- | --- | --- | --- |
| Canonical authority and owner association | 1–5, 7 | 0–1 | Schema, consumer, and ownership inventory | One stable owner-bound Identity | Yes |
| Truthful normalization/backfill | 6, 8–9, 23–25, 47 | 1, 4 | Category fixtures and before/after proof | No fabrication or disclosure broadening | Yes |
| Visibility vocabularies and enforcement | 10–16 | 1–2 | Scope/field/viewer matrix | Only authorized keys and values | Yes |
| Search privacy | 16–17, 20 | 2, 5 | Hidden-match, hidden-sort, metadata, payload, and effective-function tests | Hidden evidence has no observable effect | Yes |
| Security-definer operation bounds | 20 | 2–3, 5 | Confirmed-defect regression plus complete runtime function, ownership, grant, search-path, authorization, and output audit | Known defects corrected; every effective function remains purpose-bounded | Yes |
| Canonical mutation and grants | 18–19, 21–22, 28, 31 | 3, 5 | Direct/RPC, Profile `profile_type`, privilege, RLS, provenance, and credential tests | No bypass; least privilege; protected values remain canonical | Yes |
| Identifier conflicts | 26–27 | 1, 4 | Concurrent normalized collision tests | Deterministic conflict; no overwrite | Yes |
| Domain separation | 29–36, 45 | 1–2, 5 | Ownership, Recognition-projection, durable-reference, and purpose-bounded Vault/connection disclosure tests | No transferred authority, direct source leakage, or source-derived general Profile access | Yes |
| Migration safety | 44 | 4 | Clean replay, rerun, failure injection, retry | Deterministic safe outcome | Yes |
| Public Profile safety | 12–15, 33, 46 | 2, 5 | Anonymous response-column and payload tests | Canonically public fields only | Yes |
| Governance boundary | 37–43, 48 | 0, 5, 8 | Authority, path, diff, and chronology review | No retrospective or expanded authority | Yes |
| Target conformance | Implementation invariants | 6–7 | Exact-target preflight plus post-migration function, Profile mutation, Recognition-projection, Vault-purpose, and privacy checks | Recorded target-specific evidence without broader authority | Yes |
| Closure and interruption | All | 8 | Evidence and attributable-diff review | Truthful complete or interrupted record | Yes |

Verification must include E6 through E14 and E16 where applicable, plus new
focused tests for every confirmed defect. Test modification is permitted only
during a separately authorized execution and only within its exact path
boundary.

## 29. Stop Conditions, Success Criteria, and Closure

Execution stops when:

- approved authority is missing, contradictory, or would need expansion;
- canonical ownership, owner association, privacy, provenance, or a protected
  field cannot be classified;
- a correction requires fabricated truth or destructive rewrite;
- a Recognition projection or source-purpose disclosure cannot be traced to
  approved authority;
- a security-definer function retains authorization or output behavior beyond
  its required operation;
- a security boundary depends only on application behavior;
- a required test fails, is absent, or cannot be attributed;
- a connected target differs materially from the approved recovery plan;
- migration order, ledger state, backup, rollback, or completion is uncertain;
- another capability must change;
- unrelated repository content cannot be isolated; or
- execution or target-specific authority is absent.

Repository recovery succeeds only when all local confirmed obligations are
corrected, conforming behavior is preserved, every blocking verification
passes, valid Recognition records and Vault sharing remain preserved, no
unauthorized authority or path is added, and the bounded result is Git-closed
under separate authorization.

Production recovery succeeds only after separate target-specific authority,
ordered migration execution, post-migration verification, truthful ledger
evidence, and confirmation that no broader prerequisite was executed.

Closure must record either:

- complete success with exact paths, commits, migration identity, environment,
  effective-function, Recognition-projection, Vault-purpose, privacy
  verification, and active authority; or
- interruption with completed/incomplete phases, current schema/data/write
  authority, preserved evidence, failed gate, and safe restart conditions.

Neither outcome restarts ICE-SC-003 automatically.

## 30. Production Evidence and Ledger Obligations

Any later authorized production execution must record:

- repository, commit, migration, and target identity;
- preflight migration-ledger and schema state;
- backup/recovery and operator boundary;
- exact attributable paths and deployed bytes;
- pre-migration category counts without leaking private data;
- phase start, completion, failure, retry, and interruption evidence;
- effective grants, RLS, functions, source-domain projections, purpose-bounded
  disclosures, and client configuration;
- post-migration invariant verification;
- active write authority and next prerequisite boundary; and
- an entry in the [Grow Production Ledger](../../production/grow-production-ledger.md)
  under its separately applicable governance.

Evidence must distinguish planned, attempted, completed, failed, rolled back,
and interrupted work. This authoring task modifies no production record or
ledger.

## 31. Governance Status and Exact Next Stage

ICE-GI-001-1 has passed its complete strict read-only Architecture and
Execution-Readiness Re-Audit. The re-audit returned PASS. The founder
explicitly approved the exact audited substantive content represented by
pre-normalization SHA-256
`4d2f3aac295e4fcb84f83327bca4fec6aaf114b805592799255cd362bc8cf67a`.
Implementation Contract Execution governance for this artifact is complete.

Approval-state normalization and execution-index registration are
repository-recording actions only. They do not authorize execution or alter
the approved substantive authority, classifications, obligations, scope,
phases, gates, dependencies, safety requirements, stop conditions, or closure
criteria.

ICE-GI-001-1 remains unexecuted. Execution requires separate explicit
authorization. Source, tests, schema, migrations, data, connected environments,
production, deployment, and ICE-SC-003 remain untouched and unauthorized.
ICE-SC-003 remains stopped at Phase 0.

The exact next eligible action after bounded Git closure is a separately
instructed execution-preflight and execution-authorization decision for
ICE-GI-001-1. Connected-environment access, production activity, migration
execution, and deployment require additional target-specific authority.
