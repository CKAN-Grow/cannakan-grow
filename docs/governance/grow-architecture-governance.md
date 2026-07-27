# Grow Architecture Governance

| Governance | Value |
| --- | --- |
| **Status** | Proposed — Requires Read-Only Governance Audit |
| **Applies to** | Repository-level architectural evolution |
| **Governs** | How Grow evolves |
| **Does not govern** | What Grow is |

## Purpose

This document defines how architectural authority moves through the Grow
repository.

It exists to keep proposals, architecture, implementation authority,
implementation, verification, and Git history distinct. It governs the process
by which Grow evolves without becoming a source of canonical product or
platform truth.

This document does not redefine:

- the Grow Philosophy;
- the Grow Platform Architecture;
- the Grow Foundation or any Foundation Note;
- Product Composition;
- an Implementation Contract;
- implementation behavior; or
- quality requirements.

Those authorities retain their existing meanings and boundaries.

## Governing Question

This document answers one question:

> How does Grow evolve from a proposal into authorized, verified, and
> attributable repository history?

It does not answer what Grow is, what a canonical capability means, how a
product composes that capability, or how an implementation behaves.

## Relationship to Existing Governance

The [Grow Platform Architecture](../platform/grow-platform-architecture.md)
defines the enduring organization of Grow.

The [Grow Foundation](../foundation/grow-foundation.md) defines canonical
platform truth and durable architectural boundaries.

The [Grow Philosophy](../philosophy/grow-philosophy.md) defines enduring
purpose and product commitments.

The [Grow Production Standard](../production/grow-production-standard.md)
governs approved production execution methodology.

The [Grow Production Ledger](../production/grow-production-ledger.md) records
factual production outcomes and their evidence.

This document owns none of those responsibilities. It governs the authority
flow between architectural layers and the repository gates that preserve that
flow.

If this document conflicts with a higher-order governing authority, the
higher-order authority governs and evolution stops until the conflict is
resolved.

## Development Governance Progression

Grow development progresses through six procedural responsibility stages.

The Grow Platform Architecture remains the sole authority defining Grow's
architectural layer model. This procedural progression does not replace or
extend that model.

| Responsibility stage | Governing responsibility | May authorize | Must not do |
| --- | --- | --- | --- |
| **Platform** | Define Grow's enduring organizational model and highest-order architectural boundaries. | Lower architectural work consistent with the platform model. | Define individual capabilities, products, implementations, or presentation. |
| **Foundation** | Define canonical capability identity, truth, ownership, authority, and durable invariants. | Product Composition for the approved capability boundary. | Define product participation, implementation, or presentation. |
| **Product Composition** | Define how products consume and organize approved canonical truth. | A bounded Implementation Contract after audit and Git closure. | Create canonical truth, transfer ownership, or authorize implementation by itself. |
| **Implementation Contract** | Authorize one bounded production implementation of approved architecture. | Implementation within the explicit contract boundary. | Establish, reinterpret, extend, or replace architecture. |
| **Implementation** | Realize the authorized contract in production artifacts. | No architectural authority. | Treat convenience, precedent, or working code as architecture. |
| **QA** | Verify implementation behavior, conformance, and repository integrity. | Evidence for acceptance or rejection. | Create architecture, expand scope, or convert a failure into authority. |

The procedural responsibility stages are ordered:

```text
Platform
  ↓
Foundation
  ↓
Product Composition
  ↓
Implementation Contract
  ↓
Implementation
  ↓
QA
```

Procedural authority moves downward through explicit authorization. Evidence moves upward
to demonstrate conformance. Neither implementation nor QA may create
retroactive architectural authority.

## Authority Flow

Every procedural stage inherits all applicable higher-order authority without
reinterpretation.

An artifact may authorize only the next bounded stage or artifact stated by its
governing workflow. Approval of one artifact does not authorize later stages
automatically.

Authority becomes actionable only when:

1. the required governing artifact exists;
2. its required audit has passed;
3. owner approval is recorded;
4. its attribution-safe Git step is complete; and
5. any explicit prerequisite is formally closed.

If authority is absent, ambiguous, contradictory, uncommitted when commitment
is required, or insufficient for the proposed work, the work stops at its
current layer.

Implementation shall never compensate for missing architecture. Product
Composition shall never compensate for missing Foundation authority. QA shall
never compensate for missing implementation authority.

## Capability Lifecycle

The canonical governance lifecycle is:

```text
Proposal
  → Architecture
  → Foundation
  → Audit
  → Approval
  → Git
  → Product Composition
  → Audit
  → Approval
  → Git
  → Implementation Contract
  → Audit
  → Approval
  → Git
  → Implementation
  → QA
  → Git
  → Capability Closed
```

Each stage has one responsibility:

- **Proposal** identifies a candidate problem or capability without authority.
- **Architecture** classifies the decision and identifies the governing layer.
- **Foundation** establishes required canonical truth and boundaries.
- **Product Composition** establishes approved product participation.
- **Implementation Contract** grants bounded implementation authority.
- **Implementation** realizes only that authority.
- **QA** verifies the realized behavior and conformance.
- **Audit** verifies the integrity appropriate to the current artifact or
  repository boundary.
- **Approval** records the owner's governance decision.
- **Git** preserves the approved milestone as attributable history.
- **Capability Closed** records that no required work remains in the authorized
  slice.

A stage may be omitted only when governing authority explicitly establishes
that it is not applicable. Silence does not authorize omission.

When a later stage discovers missing or contradictory authority, work returns
to the earliest layer that owns the unresolved decision. The later stage may
describe the gap but may not resolve it by precedent.

## Audit Model

Grow uses three distinct repository-governance audits.

### Architecture Audit

An Architecture Audit verifies that a Foundation, Product Composition, or
Implementation Contract artifact:

- remains within its layer;
- inherits higher-order authority correctly;
- introduces no duplicate or transferred authority;
- contains no material contradiction or unresolved ambiguity; and
- is complete enough to authorize its stated next step.

It does not implement, edit, stage, or commit the artifact under review.

### Governance Audit

A Governance Audit determines whether the available approval, reconciliation,
downstream consumption, repository integration, and conflict history provide
sufficient evidence that an artifact is governance-complete.

It may confirm existing governance evidence. It may not manufacture missing
architecture, replace owner approval, or reinterpret the artifact.

### Git Attribution Audit

A Git Attribution Audit determines the exact repository boundary attributable
to an approved milestone.

It verifies:

- complete and correct files;
- shared-index attribution;
- absence of unrelated staged content;
- whitespace and line-ending integrity;
- working-tree preservation; and
- an attribution-safe commit boundary.

It does not change architecture. If safe isolation cannot be proven, Git work
stops.

Audit evidence informs authority decisions. Audit success does not itself
replace owner approval or the required Git milestone.

## Repository and Git Governance

Every approved architectural milestone must become attributable repository
history before dependent work begins when its workflow requires Git closure.

Repository operations must:

- use the smallest complete path-scoped boundary;
- preserve unrelated working-tree changes;
- exclude unrelated staged content;
- keep shared index attribution explicit;
- preserve textual content, encoding, whitespace, and line endings unless a
  separately authorized change requires otherwise;
- pass repository integrity validation; and
- leave no uncertain content in the commit boundary.

Broad staging commands do not establish attribution. Mixed shared files require
deterministic isolation that changes only the Git index and preserves working
tree bytes. If such isolation cannot be proven safe, the milestone remains
unstaged.

A commit records only the milestone named by its approved boundary. A push is a
separate repository action and occurs only when explicitly authorized.

Git history is governance evidence. It is not architectural authority by
itself.

## Historical Authority

Approved and attributable Git milestones preserve the historical sequence by
which authority became available.

Later artifacts inherit from the governing versions that were approved for
their work. A later correction may supersede only the authority it explicitly
identifies. Compatible earlier authority remains governing.

Repository history must make it possible to determine:

- what authority existed;
- when it became actionable;
- what was superseded;
- why work stopped or resumed; and
- which implementation was authorized.

Working-tree presence, elapsed time, implementation precedent, owner memory,
and downstream convenience do not replace attributable governing history.

## Authority Debt

Authority debt exists when repository work depends on a decision, approval,
audit, attribution boundary, or historical fact that is not yet explicit and
governance-complete.

Authority debt must be:

1. identified at the layer where it is discovered;
2. classified by the layer that owns the missing decision;
3. resolved by the smallest bounded governing artifact or evidence review;
4. audited when required;
5. approved; and
6. preserved through an attribution-safe Git milestone.

Authority debt is not implementation debt. It cannot be paid by code,
migrations, tests, UI behavior, inferred data, or implementation precedent.

## Governance Stop Conditions

Work stops immediately when:

- governing authority is missing, ambiguous, or contradictory;
- a downstream stage would need to make an upstream architectural decision;
- implementation would need to infer or fabricate canonical truth;
- a proposed change creates duplicate authority or a competing architecture;
- prerequisites are not approved and Git-closed as required;
- repository attribution cannot be proven;
- unrelated work would be overwritten, staged, or committed;
- required verification fails;
- an execution-environment interruption prevents safe continuation; or
- the current artifact attempts to authorize work outside its established authority.

Stopping is a correct governance outcome. The report must identify the owning
layer and the smallest unresolved authority. It must not invent a workaround.

Execution-environment interruptions remain governed by the Grow Production
Standard and are not architectural failures.

## Progressive Reduction of Uncertainty

Grow reduces uncertainty one authorized governance stage at a time.

- Platform classifies enduring organization.
- Foundation resolves canonical truth and ownership.
- Product Composition resolves participation and meaning in products.
- Implementation Contracts resolve bounded implementation obligations.
- Implementation resolves technical realization within those obligations.
- QA resolves whether the realization conforms.
- Git resolves historical attribution.

Each governance stage should decide only what the next stage requires. It must leave later
technical freedom intact and must not defer decisions that belong to itself.

Unknown remains a valid governance state. Explicit uncertainty is safer than
premature authority.

## Governance Philosophy

Architecture precedes implementation.

Authority must be explicit before it is exercised.

Implementation shall never compensate for missing architecture.

Every governance stage owns one kind of decision.

Audits verify boundaries; they do not create them.

Git preserves approved authority; it does not invent it.

Repository integrity takes precedence over completion.

Grow evolves by progressively reducing uncertainty while preserving truth,
ownership, attribution, and trust.
