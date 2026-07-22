# Grow Platform Engineering Principles

| Governance | Value |
| --- | --- |
| **Status** | Active |
| **Established** | July 13, 2026 |
| **Applies to** | Entire Grow Platform |

> [!IMPORTANT]
> This is Grow's engineering constitution. It defines how architectural
> decisions are made; it is not implementation documentation or an API
> reference. Every contributor should read it before changing the platform.

## Purpose

These principles guide engineering decisions over the lifetime of Grow. They
exist to protect consistency, maintainability, security, scalability, and
long-term architectural stability. Implementations will change; these
decision-making principles should remain stable.

## Principle 1 — One Grow Evidence Engine

Grow has exactly one analytics engine. Do not create another. When analytics
need to evolve, extend the existing Grow Evidence Engine (GEE).

**Why:** One engine eliminates conflicting statistics and preserves one
canonical source of analytical truth.

## Principle 2 — No Analytics Without GEE

Whenever a feature requires analytics:

1. Determine the appropriate analytics scope.
2. Extend the existing GEE contract if necessary.
3. Version the contract or schema.
4. Consume the normalized contract.

Never calculate analytics inside UI components.

**Why:** Analytics belong in one canonical layer; presentation belongs in the
UI.

## Principle 3 — Lifecycle Determines Participation

The Grow Session Lifecycle Resolver decides whether a session participates in
analytics. GEE consumes that decision and never duplicates lifecycle logic.

**Why:** One lifecycle decision prevents inconsistent inclusion, exclusion,
and completion rules.

## Principle 4 — Operational Data Is Not Analytics

Operational tables support workflows such as editing and completing sessions,
updating Seed Vault, managing profiles, and publishing Community reports. They
must not become analytics engines. Derived statistics originate only from GEE.

**Why:** Workflow state and analytical interpretation have different
responsibilities and change for different reasons.

## Principle 5 — Separation of Concerns

```text
Lifecycle
    │
    ▼
Grow Evidence Engine
    │
    ▼
Contracts
    │
    ▼
Consumers
    │
    ▼
UI
```

Each layer has one responsibility. No layer recreates the responsibility of
another.

## Principle 6 — Exactly Three Analytics Contracts

GEE exposes exactly three analytics contracts:

- **Global Analytics:** anonymous platform-wide truth, trends, confidence, and
  aggregate data quality.
- **Owner Analytics:** private analytics for the authenticated owner.
- **Community Analytics:** approved, published, public-safe evidence.

Do not introduce a fourth contract without deliberate architectural review.

**Why:** Explicit scopes keep analytics understandable, secure, and resistant
to overlapping implementations.

## Principle 7 — Privacy First

- Global Analytics is anonymous.
- Owner Analytics is available only to the authenticated owner or a dedicated,
  authorized administrative path.
- Community Analytics contains approved public evidence only.

Private information must never leak between contracts. When scopes differ,
keep their payloads and caches separate rather than merging them implicitly.

## Principle 8 — Owner Identity

Normal Owner Analytics always derive identity from `auth.uid()`. Never trust a
caller-supplied owner UUID. Administrative owner inspection must use a
dedicated Admin-only API that authorizes cross-owner access at the server or
database boundary.

**Why:** Client-supplied identity creates an insecure direct-object-reference
risk. Authorization must decide identity before analytics are produced.

## Principle 9 — Version Everything

Analytics contracts expose:

- `engine_version`
- `schema_version`
- `contract_version`
- `data_quality_version`
- `generated_at`

Behavior or payload changes require the appropriate version change. Never
silently remove, rename, or reinterpret released analytics.

## Principle 10 — Compatibility Over Breakage

Prefer this sequence:

```text
Deprecate
    │
    ▼
Version
    │
    ▼
Replace
```

Preserve compatibility whenever practical. Compatibility wrappers may remain
only when they delegate without recalculating analytics.

## Principle 11 — Data Quality Matters

Data quality is a first-class platform capability. GEE owns Source Attribution,
Data Quality Score, duplicate detection, Unknown Sources, and Unknown
Varieties. Consumers render canonical values and states; they never calculate
or reclassify them.

## Principle 12 — Community Evidence

Community snapshots are public evidence. They are not the source of anonymous
aggregate truth. Hiding or deleting public evidence removes it from Community
Analytics but does not erase valid anonymous historical analytics.

**Why:** Public visibility and historical analytical validity are separate
concerns.

## Principle 13 — Build Features, Not Workarounds

If a feature appears to require bypassing the architecture, reconsider the
design. Extend the correct canonical layer instead of introducing duplicate
systems, local formulas, or private fallbacks.

## Principle 14 — Architecture Stability

The Grow Evidence Engine architecture is stable. Evolve it only to solve a
genuine platform limitation—not for local convenience. Future work should
focus on products and user experience built on top of the established
architecture.

## Engineering Decision Framework

Before implementing an engineering decision, ask:

1. Does this belong in GEE?
2. Which analytics contract owns it?
3. Does this duplicate existing logic?
4. Does it preserve privacy?
5. Does it preserve compatibility?
6. Will this still make sense in five years?

If the proposed design fails these questions, redesign it before implementing.

## Closing Statement

> The Grow Evidence Engine is the permanent analytics foundation of the
> Grow platform.
>
> Engineering decisions should strengthen this foundation rather than work
> around it.
