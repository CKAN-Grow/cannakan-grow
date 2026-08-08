# Grow Production Ledger

## Purpose

The Grow Production Ledger is the permanent production history of Grow.

It records evidence of what happened, never plans or intentions. Repository
evidence takes precedence over memory. Where repository evidence is
unavailable, an owner-confirmed record may be included and must be identified
as such. Unknown remains Unknown; the ledger never fills gaps with assumptions.

## Production Principle

The Production Ledger records what happened.

Never what was intended.

## Evidence Hierarchy

Every ledger entry must identify at least one evidence source. Valid evidence
sources are:

- Git Commit
- Repository File
- Repository Inspection
- Current Working Tree
- Owner-Confirmed Record
- Unknown

## Production Status

Every ledger entry uses exactly one of these primary production statuses:

- `PLANNED`
- `READY`
- `BUILDING`
- `BLOCKED`
- `INTERRUPTED`
- `IMPLEMENTED`
- `COMMITTED`
- `UNKNOWN`

These statuses describe production state. Nothing else is a primary production
status.

## Current Production Ledger

| ID | Work | Type | Status | Evidence | Next Action |
| --- | --- | --- | --- | --- | --- |
| GPSC-001 | Adopt EC-001 | Production Standard | `COMMITTED` | Git Commit `8d8d5a7` | None |
| CS-001.1 | Session Identity | Product Capability | `COMMITTED` | Git Commit `33ab720` | None |
| CS-001.2 | Session Orientation | Product Capability | `INTERRUPTED` | Owner-Confirmed Record | Resubmit the frozen Engineering Commission |
| GPSC-002 | Truth; Honest Value | Product Standard | `INTERRUPTED` | Owner-Confirmed Record | Resubmit the frozen commission |
| 20260807100000_session_conditions_canonical_restoration.sql | Seven-function Session Conditions canonical restoration; successfully applied and verified in production; production stable after restoration | Production Restoration | `IMPLEMENTED` | Owner-Confirmed Record; Repository File `supabase/migrations/20260807100000_session_conditions_canonical_restoration.sql` (SHA-256 `2821e5da9f2a014927ac7f03bf598caed47c61c79a25cbb608c74217e7c0fc65`) | None |

### CS-001.2 Interruption Record

**Interruption**

Windows sandbox failed:

```text
helper_unknown_error:
apply deny-read ACLs
```

**Repository State**

No attributable implementation.

### GPSC-002 Interruption Record

**Repository State**

No attributable documentation changes.

## Audit Summary

### Confirmed Committed Production Work

- GPSC-001 — Adopt EC-001
- CS-001.1 — Session Identity

### Confirmed Interrupted Production Work

- CS-001.2 — Session Orientation
- GPSC-002 — Truth; Honest Value

### Known Unknowns

No additional interrupted production attempts were confirmed through
repository evidence.

This does not prove that additional interruptions never occurred.

Only that current evidence cannot establish them.

## Maintenance Rule

Every production attempt shall update the Production Ledger before the work is
considered operationally complete.

This includes:

- successful implementations;
- interrupted implementations;
- blocked implementations;
- rejected implementations; and
- production-standard updates.

The Production Ledger is Grow's permanent manufacturing history.
