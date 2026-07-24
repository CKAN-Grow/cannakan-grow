# Grow Production Standard

| Governance | Value |
| --- | --- |
| **Status** | Active |
| **Applies to** | Grow production methodology |

## Purpose

The Grow Production Standard defines the enduring methodology used to execute
approved production work. It distinguishes implementation outcomes from
execution-environment outcomes so that infrastructure conditions are never
misrepresented as product, architecture, implementation, or quality failures.

## Engineering Commission Rules

### EC-001 — Interrupted Commission Rule

| Rule | Value |
| --- | --- |
| **Status** | Frozen |

#### Principle

A Build Status of `INTERRUPTED` immediately terminates the active Engineering
Commission.

An interruption is an execution-environment condition. It is not:

- an implementation failure;
- a product failure;
- an architectural failure; or
- a quality failure.

#### Definition

Engineering shall classify a commission as `INTERRUPTED` whenever
implementation cannot proceed because of an external execution condition.

Examples include:

- sandbox failure;
- repository access failure;
- patch mechanism failure;
- execution-environment failure;
- infrastructure outage; and
- tooling failure.

#### Required Engineering Behaviour

Engineering must:

- immediately stop implementation;
- not continue implementation;
- not modify additional files; and
- preserve repository state.

#### Required Report

Return only:

- Build Status;
- Interruption Reason;
- Evidence;
- Repository Status; and
- Recovery Recommendation.

Do not include:

- implementation summary;
- QA;
- Product Acceptance;
- Git commands;
- release recommendation; or
- fabricated implementation details.

#### Recovery Rule

When the execution environment is restored, resubmit the same Engineering
Commission unchanged.

#### Engineering Principle

> An interruption is a property of the execution environment—not the
> implementation.

## Frozen Engineering Commissions

### EC-S-001.2 — Session Orientation

| Record | Value |
| --- | --- |
| **Status** | Frozen |
| **Reason** | The commission demonstrated correct engineering behaviour. |

Engineering:

- honored architectural authority;
- honored capability boundaries;
- refused to fabricate implementation; and
- correctly classified the interruption.

No further modifications to EC-S-001.2 are authorized unless a genuine
production defect is discovered.
