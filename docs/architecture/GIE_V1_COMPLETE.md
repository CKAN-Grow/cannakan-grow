# Grow Intelligence Engine v1

| Milestone | Value |
| --- | --- |
| **Status** | **COMPLETE** |
| **Date** | July 13, 2026 |
| **Git tags** | `gie-phase-1-complete`, `gie-v1-complete` |
| **Architecture** | **Frozen** |
| **Analytics consumer adoption** | **100%** |

> [!IMPORTANT]
> Grow Intelligence Engine v1 is the single canonical analytics platform for
> Grow. Future analytics extend one of its existing versioned contracts before
> any product surface consumes them.

---

## Executive Summary

Grow Intelligence Engine (GIE) v1 centralizes Grow's analytics, confidence,
recommendations, rankings, and data-quality calculations behind one engine and
three privacy-scoped contracts. It establishes one definition for lifecycle
eligibility, normalized evidence, canonical metrics, and analytical quality.

Phase 1 established and froze the architecture. Phase 2 migrated every
analytics consumer to the appropriate contract. Global platform intelligence,
authenticated owner analytics, approved Community evidence, recommendations,
Admin analytics, Grow Network analytics, Explorer dashboards, Health, and AI
analytics context now originate in GIE. UI components render normalized
contract values and do not independently calculate canonical analytics.

Operational workflows remain separate. Session editing, Seed Vault CRUD,
social connections, profile management, moderation, publications, and account
administration continue to use operational data without becoming competing
analytics engines.

---

## Architecture Diagram

```text
Operational Data
        │
        ▼
Lifecycle Resolver
        │
        ▼
Grow Intelligence Engine
        │
        ├── Global Contract
        ├── Owner Contract
        └── Community Contract
                │
                ▼
100% Analytics Consumers
```

| Layer | Permanent responsibility |
| --- | --- |
| Operational Data | Stores sessions, results, snapshots, profiles, Seed Vault records, and workflow state. |
| Lifecycle Resolver | Determines the canonical lifecycle state, analytics eligibility, and exclusion reason. |
| Grow Intelligence Engine | Normalizes eligible evidence and produces canonical metrics, rankings, confidence, recommendations, and data quality. |
| Global Contract | Exposes anonymous platform-wide analytics and aggregate data quality. |
| Owner Contract | Exposes authenticated private owner analytics; normal identity comes only from `auth.uid()`. |
| Community Contract | Exposes approved, published, public-safe Community evidence. |
| Analytics Consumers | Select the correct contract and render its normalized values without recalculation. |

The contracts are not separate engines. They are privacy and authorization
boundaries over the same Grow Intelligence Engine.

---

## Current Versions

| Component | Version |
| --- | --- |
| Engine | `gie.v1` |
| Global Analytics Contract | `gie-global.v1` |
| Owner Analytics Contract | `gie-owner.v1` |
| Community Analytics Contract | `gie-community.v1` |
| Contract schema | `2026-07-13.7` |
| Data Quality | `gie-dq.v1` |

Engine behavior, individual contracts, payload schema, and data-quality logic
are versioned independently. All three v1 contracts currently report the same
engine, schema, and data-quality versions.

---

## Data Quality

GIE owns data-quality measurement. Consumers do not infer missing attribution,
recalculate coverage, assign status thresholds, or silently substitute zero
when the contract is unavailable.

### Current Production Verification Values

| Canonical metric | Verified value |
| --- | ---: |
| Completed Sessions | 4 |
| Seeds Tested | 262 |
| Seeds Germinated | 242 |
| Varieties | 28 |
| Sources | 9 |
| Source Attribution | 89% |
| Data Quality | 88 — Needs Attention |

Source attribution represents 234 seeds with a canonical source out of 262
seeds tested; 28 seeds are missing source attribution. These values are
production verification records, not application constants.

The canonical data-quality payload also reports attribution thresholds,
unknown sources and varieties, duplicate sources, varieties missing source,
invalid result rows, and the explainable score breakdown.

---

## Security Model

The security boundary follows analytics scope:

- Global Analytics is anonymous and identity-free. It exposes aggregate
  platform intelligence only.
- Owner Analytics is private and authenticated. Normal browser code calls only
  `public.get_gie_my_analytics()` without an owner UUID; identity comes from
  `auth.uid()`.
- Cross-owner inspection is Admin-only and may use only
  `public.get_gie_admin_owner_analytics(target_user_id uuid)`, whose
  authorization is enforced inside the database function.
- Community Analytics contains only approved, published evidence that is not
  analytics-excluded. Public profile analytics additionally require explicit
  profile sharing.
- Unpublished, rejected, hidden, deleted, private, test, and excluded evidence
  cannot enter the Community contract.
- Public consumers and public AI context never receive private Owner fields.
- AI analytics context uses an explicit scope, preserves contract metadata,
  applies field allowlists, and returns unavailable or unauthorized states
  instead of reading raw records.
- Browser code never receives service-role keys, secret keys, authentication
  tokens, private notes, or private images as analytics context.
- GIE and contract diagnostics remain protected by existing Admin or
  service-role authorization.

Unavailable, unauthorized, insufficient-evidence, and true-zero states remain
distinct throughout the contract and presentation layers.

---

## Versioning

GIE uses additive, explicit versioning:

1. `engine_version` changes when canonical analytics behavior changes.
2. `contract_version` changes when a contract's semantic boundary changes.
3. `schema_version` changes when fields are added or the payload shape evolves.
4. `data_quality_version` changes when quality measurements, deductions, or
   classifications change.
5. Released migrations are immutable. Contract extensions use a new additive
   migration and preserve compatible fields.
6. Contract metadata includes the contract name and version, engine version,
   schema version, data-quality version, authorization state, and generation
   timestamp.
7. Global, Owner, and Community remain the only analytics contracts. New
   requirements extend the correct existing contract rather than creating a
   new engine or contract.

The v1 architecture is frozen. A future version may evolve behavior through
the versioning model, but it must preserve the single-engine and explicit
privacy-scope principles.

---

## Permanent Development Rules

**No analytics without GIE.**

- Determine whether the requirement is Global, Owner, or Community scope.
- Extend the applicable existing GIE contract when a canonical field is
  missing.
- Version the affected schema or contract explicitly.
- Reuse the canonical lifecycle resolver, eligibility rules, normalization,
  confidence model, and data-quality model.
- Consume normalized contract payloads and preserve their metadata.
- Render unavailable, unauthorized, insufficient-evidence, and zero states
  accurately.
- Never calculate totals, percentages, rankings, confidence, recommendations,
  or data-quality metrics in UI components.
- Never derive canonical analytics by traversing operational records in a
  consumer.
- Never pass an owner UUID through normal Owner Analytics browser calls.
- Never mix private Owner scope with public Global or Community scope.
- Keep operational CRUD and workflow state separate from analytical results.
- Add regression coverage for contract provenance, privacy, version parity,
  unavailable behavior, and calculation-free consumers.

Permanent workflow:

```text
Need analytics?
        │
        ▼
Determine Global, Owner, or Community scope
        │
        ▼
Extend the existing GIE contract if required
        │
        ▼
Version the contract or schema
        │
        ▼
Consume the normalized contract
        │
        ▼
Never calculate analytics locally
```

---

## Future Roadmap

Phase 2 is complete.

Future work focuses on product features rather than analytics architecture.
New dashboards, planning tools, recommendations, reports, AI experiences, and
Community features should build on the existing Global, Owner, and Community
contracts. When a feature requires new intelligence, the correct existing GIE
contract is extended and versioned first.

The frozen architecture does not prevent product evolution. It ensures that
future products share one trustworthy analytical foundation.

---

# Grow Intelligence Engine v1

**COMPLETE**

**Architecture Frozen**

**100% Analytics Consumer Adoption**

**Future analytics extend GIE.**
