# ICE-SC-001 — Session Conditions Implementation Contract Execution

## 1. Purpose

Authorize implementation of the bounded production slice established by IC-SC-001B — Canonical Growing Commencement and Legacy Chronology.

Execution shall realize approved authority without establishing, reinterpreting, extending, or replacing architecture.

This artifact authorizes implementation work only. It creates no Foundation truth, Product Composition, canonical authority, repository-governance authority, or presentation authority.

## 2. Governing Authority

Implementation inherits, in order:

1. Grow Platform Architecture;
2. Grow Architecture Governance;
3. applicable Foundation Notes, including FN-004, FN-005, FN-006, and FN-007;
4. applicable Product Composition Specifications, including CS-SC-001, CS-SC-001A, and CS-SC-001B; and
5. IC-SC-001B, including the compatible IC-SC-001 obligations that it supplements.

Higher-order authority remains governing.

Architectural ambiguity, contradiction, or insufficient authority shall stop execution. Implementation shall not resolve such conditions through convenience, precedent, inferred behavior, or working code.

## 3. Execution Scope

Execution is limited to the IC-SC-001B production slice:

- canonical recording of Growing commencement for future authorized lifecycle entries;
- one canonical Session Lifecycle boundary supporting both authorized Growing-entry paths;
- atomic preservation of lifecycle action, resulting state, and commencement;
- deterministic, access-safe retrieval of canonical commencement;
- deterministic unresolved meaning for legacy Sessions without authoritative commencement;
- read-only consumption by Session Conditions and other authorized consumers;
- required integrity, authorization, rollback, concurrency, and idempotency behavior; and
- executable verification of the approved observable outcomes.

This execution does not independently authorize IC-SC-001 migration, cutover, legacy backfill, chronology recovery, or broader Session Conditions implementation.

## 4. Authorized Implementation

Implementation may establish the internal production mechanisms required to:

- record exactly one durable canonical Growing commencement when an authorized Growing entry succeeds;
- use one canonical Session Lifecycle boundary for Seed-to-Growing and direct-Growing entry;
- preserve completed Germination as durable canonical history;
- keep Germination completion separate from the authorized Begin Growing transition;
- preserve direct-Growing creation and lifecycle entry as one bounded domain action;
- make lifecycle action, resulting current phase, and commencement observable as one indivisible outcome;
- roll back or keep non-canonical every failed or interrupted attempt;
- retrieve either authoritative commencement or unresolved commencement for an authorized Session;
- preserve unresolved legacy chronology without manufacturing a timestamp;
- expose canonical commencement to Session Conditions through a read-only lifecycle boundary;
- prevent consumers from creating, changing, repairing, or replacing commencement;
- enforce parent-Session ownership and access-safe retrieval;
- reject anonymous, cross-owner, cross-Session, stale, conflicting, or unauthorized mutation;
- prevent duplicate chronology through idempotent operation handling; and
- preserve canonical commencement through later lifecycle activity.

Implementation teams retain freedom to choose schema organization, transaction mechanisms, service or RPC organization, indexes, deployment sequencing, concurrency controls, query optimization, and internal adapters, provided every contractual obligation remains satisfied.

## 5. Required Observable Outcomes

Implementation is successful only when the following behavior is observable:

- a successful authorized Seed-to-Growing transition exposes Growing as current with matching canonical commencement;
- Germination completion alone exposes no Growing commencement and does not make Growing current;
- a successful authorized direct-Growing entry exposes the initial current phase and matching canonical commencement;
- generic Session creation exposes no Growing commencement;
- a failed or interrupted entry exposes neither partial lifecycle state nor partial chronology;
- future authorized Growing entries expose authoritative commencement;
- legacy Sessions without authoritative chronology expose unresolved commencement;
- unchanged authoritative inputs produce stable, repeatable retrieval meaning;
- retrieval exposes no classification other than authoritative or unresolved;
- inaccessible Session chronology is not returned;
- Session Conditions consume commencement without acquiring mutation or lifecycle authority;
- unresolved commencement produces no manufactured condition-period boundary or Current Conditions result; and
- existing unrelated lifecycle, Session Context, Grow Companion, Product, and Presentation behavior remains unchanged.

## 6. Implementation Boundaries

Session Lifecycle remains the exclusive owner of canonical Growing commencement.

Session Conditions and other consumers remain read-only.

Implementation may select internal technical mechanisms but may not alter:

- canonical ownership;
- lifecycle-transition meaning;
- the two authorized Growing-entry paths;
- atomic observable behavior;
- unresolved legacy meaning;
- authorization boundaries;
- historical durability;
- IC-SC-001 authority; or
- Product and Presentation non-authority.

No user interface, workflow, Timeline, Calendar, analytics, reporting, notification, or presentation behavior is authorized.

Technical schema or deployment work is permitted only where necessary to realize future canonical recording and retrieval. It must not populate unresolved legacy chronology or execute a legacy migration or backfill.

## 7. Prohibited Implementation

Implementation shall not:

- infer, estimate, approximate, reconstruct, backdate, or administratively select commencement;
- use Session creation time except within the authorized direct-Growing domain action;
- substitute Germination completion, phase creation, update timestamps, first evidence, or another capability record;
- derive commencement from Tasks, Events, Notes, Photos, Documents, Timeline, Calendar, analytics, or reports;
- migrate or backfill unresolved legacy chronology;
- create a chronology recovery or correction operation;
- create a new lifecycle phase, lifecycle state, Session status, or commencement classification;
- create duplicate, Product-owned, consumer-owned, or implementation-owned chronology;
- create a privileged browser write path;
- modify Session ownership, privacy, sharing, authorization, RLS, scenario, or service-credential boundaries;
- implement presentation behavior;
- execute IC-SC-001 migration for a Session whose required commencement remains unresolved;
- expand Session Conditions dimensions or applicability; or
- perform repository-governance work.

## 8. Validation Requirements

Implementation evidence must executablely demonstrate that:

- both authorized Growing-entry paths establish commencement;
- Germination completion alone does not establish commencement;
- generic Session creation does not establish commencement;
- lifecycle action, state, and commencement become observable atomically;
- failed operations expose no partial canonical outcome;
- duplicate submission creates no duplicate chronology;
- reuse of an operation identity with different input fails;
- stale and conflicting mutation fails;
- authoritative retrieval is deterministic;
- unresolved legacy Sessions remain unresolved;
- no prohibited fallback timestamp becomes canonical;
- Session Conditions consume but cannot mutate commencement;
- authorized owner lifecycle actions succeed;
- anonymous, cross-owner, cross-Session, and unauthorized mutations fail;
- inaccessible chronology is excluded from retrieval;
- canonical commencement remains durable after later lifecycle activity;
- existing IC-SC-001 behavior remains intact; and
- unrelated lifecycle, Session Context, Grow Companion, Product, and Presentation behavior remains unchanged.

Verification evidence may prove conformance. It may not create architecture or expand execution scope.

## 9. Completion Criteria

Execution is complete only when:

- every implemented behavior is attributable to IC-SC-001B;
- all required observable outcomes are realized;
- all validation requirements pass;
- no prohibited implementation exists;
- canonical authority and implementation freedom remain preserved;
- unresolved legacy chronology remains honest;
- no unrelated capability behavior changed;
- repository attribution is bounded to the authorized implementation slice; and
- the implementation is ready for a separate read-only Implementation Audit.

Completion does not authorize staging, committing, pushing, architectural revision, or additional production work.

## 10. Repository Safety

Before implementation, record the working-tree and staged-file state.

Modify only production and verification files required to realize the authorized IC-SC-001B slice.

Leave all unrelated tracked and untracked work untouched.

Do not modify governing architecture, Product Composition, Implementation Contracts, unrelated documentation, dependencies, assets, or unfinished milestones unless a separately authorized execution requirement makes a specific change necessary.

Do not stage, commit, amend, push, restore, delete, or clean repository content without separate authorization.

Stop execution if:

- required authority is absent, ambiguous, or contradictory;
- implementation would need to manufacture canonical truth;
- attribution cannot be proven;
- unrelated repository state cannot be preserved; or
- completing the slice would require work prohibited by IC-SC-001B.
