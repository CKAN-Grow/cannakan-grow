# CSTP Session Compatibility Rules

## 1. Purpose

Grow session integrity is critical to the Cannakan Grow ecosystem. Sessions are the core evidence and workflow object for germination tracking, timelines, partitions, notes, images, reminders, analytics, and user history.

CSTP must layer onto grow sessions without mutating core session behavior. The CSTP v1 migration creates an internal join relationship through `cstp_test_sessions`; it does not create a replacement session model.

Compatibility protection is required before implementation so future CSTP helpers, admin UI, APIs, reports, and automation do not accidentally fragment the session system.

This document references:

- `docs/cstp-admin-workflow-state-machine.md`
- `docs/cstp-admin-service-layer-plan.md`
- `docs/cstp-existing-system-reuse-audit.md`
- `docs/cstp-backend-implementation-checklist.md`
- `supabase/migrations/20260511222737_cstp_migration_v1.sql`

This is architecture and planning only. It does not implement code, APIs, UI, routes, RLS, reports, certifications, public CSTP features, automation, or breeder/source portals.

## 2. Core Compatibility Principles

- `grow_sessions` remain the canonical session entity.
- CSTP references sessions externally through CSTP-owned relationship records.
- CSTP must not fork or duplicate grow session logic.
- CSTP should reuse existing session infrastructure whenever possible.
- CSTP should avoid introducing session-specific branching into the core app.
- CSTP should consume session evidence rather than redefine the evidence model.
- CSTP workflow state should stay in CSTP tables, not in core session fields.

## 3. Session Ownership Rules

Grow sessions are never CSTP-owned.

Ownership rules:

- CSTP Tests may reference sessions through `cstp_test_sessions`.
- A linked session remains owned by the existing grow session system.
- A linked session must remain independently viewable.
- A linked session must remain independently editable according to normal session rules.
- A session must remain functional if CSTP links are removed or archived.
- A session may exist without any CSTP linkage.
- CSTP archival must not delete or damage a grow session.
- CSTP linkage must not imply public visibility or certification.

The CSTP relationship is contextual. It does not transfer ownership.

## 4. Session Mutation Restrictions

CSTP helpers/services should not modify core session behavior or internal structures.

CSTP should not modify:

- session stage logic
- germination calculations
- timeline logic
- analytics logic
- notes structure
- media systems
- reminder systems
- partition structures
- historical timestamps
- session ownership
- session visibility rules
- session completion logic

CSTP should consume session data, not redefine it. Any CSTP-specific interpretation should happen in CSTP-owned tables, admin events, future report snapshots, or future certification records.

## 5. Allowed CSTP Relationships

Allowed linkage behavior:

- One CSTP Test may reference multiple grow sessions.
- Linked sessions may remain standard sessions.
- Sessions may exist without CSTP linkage.
- Multiple linked sessions may represent multi-KAN testing.
- `kan_label` may describe CSTP-specific grouping without changing session data.
- `included_in_report` may prepare for future report selection without creating reports in v1.
- Archived CSTP Tests must not destroy sessions.
- Archived CSTP/session links must not destroy sessions.
- Session deletion protections should remain intact.

The allowed relationship model is:

```text
cstp_tests
-> cstp_test_sessions
-> grow_sessions
```

No CSTP helper should bypass this relationship model by embedding session data directly into CSTP workflow records.

## 6. Session Reuse Expectations

CSTP should reuse existing session foundations where possible.

Expected reuse areas:

- germination metrics
- timeline systems
- analytics structures
- partition structures
- session visual structures
- notes and observation evidence
- image/media attachment logic later
- snapshot/report foundations later

Reuse should minimize duplicated logic. If future CSTP reporting needs stable public values, those values should be generated from session data and frozen into immutable CSTP report snapshots later, not stored as a second mutable session system.

## 7. Compatibility Risks

### CSTP-Specific Session Forks

Risk: CSTP creates a second kind of session with different rules.

Avoidance: Use `grow_sessions` and link through `cstp_test_sessions`.

### Duplicated Germination Calculations

Risk: CSTP calculates germination differently from session analytics and creates conflicting truth sources.

Avoidance: Use existing session metrics as source data; freeze future public report values only in report snapshots.

### Separate CSTP Timeline Engines

Risk: CSTP introduces a separate timeline model that conflicts with session lifecycle.

Avoidance: Use existing session timeline/stage data and add CSTP review state separately.

### Public/Private Session Divergence

Risk: CSTP linkage changes whether a session is treated as public or private.

Avoidance: CSTP linkage should not change session visibility.

### Multiple Competing Germination Truth Sources

Risk: Session views, CSTP admin views, reports, and Source Directory display different active values.

Avoidance: Session data remains source-of-truth; future public reports read immutable snapshots.

### CSTP-Specific Analytics Fragmentation

Risk: CSTP creates analytics that cannot be reconciled with normal session analytics.

Avoidance: CSTP aggregates should derive from linked sessions and keep their methodology explicit.

## 8. Future Reporting Considerations

Future CSTP reports should:

- derive from linked grow session data
- freeze public values in immutable CSTP report snapshots
- preserve original grow session history
- avoid mutating historical session data
- avoid reading live mutable session data for published public reports
- keep public report terminology separate from internal session workflow terms

No reporting implementation is included in v1. Reports, snapshots, certifications, badges, and public visibility remain future phases.

## 9. Internal-Only Boundary

These compatibility rules are internal architecture rules only.

Current boundary:

- no public CSTP exposure exists yet
- no certification logic exists yet
- no report logic exists yet
- no Source Directory public CSTP integration exists yet
- no Community Grow CSTP integration exists yet
- no automation exists yet
- no breeder/source portal exists yet

CSTP v1 should validate internal orchestration and session linkage only.

## 10. Validation Checklist

Before implementation and during future reviews, confirm:

- [ ] Grow sessions remain primary.
- [ ] CSTP remains additive.
- [ ] CSTP links through `cstp_test_sessions`.
- [ ] No duplicated lifecycle engines exist.
- [ ] No competing germination calculations exist.
- [ ] Linked sessions remain app-compatible.
- [ ] CSTP helpers do not mutate core session fields.
- [ ] CSTP archival does not delete sessions.
- [ ] CSTP admin workflow state stays out of session state fields.
- [ ] Future reports use immutable snapshots rather than mutating session history.

## 11. Explicit Non-Goals

This document does not include or implement:

- code
- APIs
- RLS
- UI
- route changes
- reports
- report snapshots
- certifications
- public badges
- Source Directory public CSTP integration
- Community Grow CSTP integration
- automation
- breeder/source portal functionality

This is a CSTP/session compatibility planning document only.

