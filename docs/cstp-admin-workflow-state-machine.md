# CSTP Admin Workflow State Machine

## 1. Purpose

This document defines the canonical CSTP admin workflow lifecycle and state behavior that future backend helpers, admin UI, APIs, and automation should follow.

It references:

- `docs/cstp-admin-service-layer-plan.md`
- `docs/cstp-backend-implementation-checklist.md`
- `docs/cstp-architecture-master-index.md`
- `supabase/migrations/20260511222737_cstp_migration_v1.sql`

All future CSTP systems should follow these lifecycle rules. Workflow consistency is required for reporting integrity later. Reports, certifications, public badges, and Source Directory trust signals will eventually depend on a clear internal history of request review, seed receipt, test preparation, active testing, completion, and internal review.

This is architecture and planning only. It does not implement code, APIs, RLS, UI, routes, reports, certifications, public CSTP features, automation, or breeder/source portals.

## 2. High-Level Workflow Overview

Canonical conceptual lifecycle:

```text
Request Intake
↓
Admin Review
↓
Accepted / Declined
↓
Awaiting Seeds
↓
Seeds Received
↓
Test Preparation
↓
Active Testing
↓
Completed Testing
↓
Internal Review
↓
Future Publication Layer (not implemented)
```

Migration v1 supports only the internal foundation:

- request intake through `cstp_requests`
- parent test orchestration through `cstp_tests`
- linked Grow sessions through `cstp_test_sessions`
- internal audit events through `cstp_admin_events`

Publication, report snapshots, certifications, public Source Directory signals, Community Grow filters, automation, and breeder/source portals are intentionally excluded.

## 3. Request Lifecycle States

### received

**Purpose:** A CSTP request has been captured but has not yet been accepted or declined.

**Who Can Move Into This State:** Future admin helpers or intake workflows when a request is created.

**Expected Admin Behavior:** Review source identity, contact information, variety details, seed type, batch/lot information, requested seed count, and request message.

**Terminal or Reversible:** Not terminal. May transition to `accepted`, `declined`, or `archived`.

### accepted

**Purpose:** Admin has approved the request for CSTP handling or test preparation.

**Who Can Move Into This State:** Admin-only workflow.

**Expected Admin Behavior:** Confirm source matching, seed intake requirements, tester assignment, and whether a CSTP Test should be created.

**Terminal or Reversible:** Not terminal. May transition to `awaiting_seeds` or `archived`. It may also be used after `awaiting_seeds` when seeds are received and the request is ready for test preparation.

### awaiting_seeds

**Purpose:** Request is accepted but physical seed samples have not yet been received or confirmed.

**Who Can Move Into This State:** Admin-only workflow after acceptance.

**Expected Admin Behavior:** Track seed receipt, source communication, shipping status, and readiness for test preparation.

**Terminal or Reversible:** Not terminal. May transition back to `accepted` when seeds are received or administrative review returns the request to preparation.

### declined

**Purpose:** Admin has decided not to proceed with the request.

**Who Can Move Into This State:** Admin-only workflow from `received`.

**Expected Admin Behavior:** Record internal reason or note when appropriate. Do not create public CSTP status.

**Terminal or Reversible:** Treated as terminal for v1 unless a future explicit reopen workflow is defined. May transition to `archived`.

### archived

**Purpose:** Request is retained for history but removed from active workflow.

**Who Can Move Into This State:** Admin-only workflow from any active request state.

**Expected Admin Behavior:** Use archival instead of destructive deletion. Preserve internal history and related admin events.

**Terminal or Reversible:** Terminal for v1 unless a future explicit restore workflow is defined.

## 4. Test Lifecycle States

### pending

**Meaning:** A CSTP Test exists but active testing has not begun.

**Expected Admin Actions:** Prepare testing plan, assign or create linked sessions, review seed/source context, and confirm readiness.

**Linkage Expectations:** Session linkage may or may not exist yet. Pending tests can be created before sessions are attached.

**Whether Session Linkage Should Exist:** Optional.

### active

**Meaning:** CSTP testing is underway using one or more linked Grow sessions.

**Expected Admin Actions:** Monitor linked sessions, add admin events, track observations through normal session systems, and ensure session evidence remains intact.

**Linkage Expectations:** At least one linked Grow session should normally exist before or shortly after moving to active.

**Whether Session Linkage Should Exist:** Expected.

### completed

**Meaning:** Operational testing has completed. This does not imply public report preparation, certification, or publication.

**Expected Admin Actions:** Review linked session evidence, confirm test completion, preserve admin notes/events, and prepare for future internal review/report phases when those exist.

**Linkage Expectations:** Completed tests should retain linked sessions for auditability.

**Whether Session Linkage Should Exist:** Expected.

### archived

**Meaning:** CSTP Test is retained for history but removed from active workflow.

**Expected Admin Actions:** Archive rather than delete. Ensure linked sessions remain normal Grow sessions and historical relationships remain queryable.

**Linkage Expectations:** Existing session links may remain archived or active depending on future helper behavior, but linked Grow sessions must not be destroyed.

**Whether Session Linkage Should Exist:** Optional; historical links should remain queryable when they existed.

## 5. Allowed Transition Matrix

Invalid transitions should be rejected later by helpers/services. Lifecycle protection is required for consistency across admin UI, APIs, automation, and future reporting.

### Request Status Transitions

| From | To | Allowed | Notes |
|---|---|---:|---|
| `received` | `accepted` | Yes | Admin accepts request for CSTP handling. |
| `received` | `declined` | Yes | Admin declines request. |
| `received` | `archived` | Yes | Request removed from active queue. |
| `accepted` | `awaiting_seeds` | Yes | Accepted request is waiting on physical sample receipt. |
| `accepted` | `archived` | Yes | Accepted request removed from active queue. |
| `awaiting_seeds` | `accepted` | Yes | Seeds received or request returned to preparation. |
| `awaiting_seeds` | `archived` | Yes | Request removed from active queue. |
| `declined` | `archived` | Yes | Declined request retained but hidden from active workflow. |
| `archived` | any state | No | Restore workflow is not defined in v1. |
| `declined` | `accepted` | No | Reopen workflow is not defined in v1. |

### Test Status Transitions

| From | To | Allowed | Notes |
|---|---|---:|---|
| `pending` | `active` | Yes | Testing begins. |
| `pending` | `archived` | Yes | Test removed from active workflow before start. |
| `active` | `completed` | Yes | Operational testing ends. |
| `active` | `archived` | Yes | Active test removed from active workflow. |
| `completed` | `archived` | Yes | Completed test retained for history. |
| `completed` | `active` | No | Reopening completed tests is not defined in v1. |
| `archived` | any state | No | Restore workflow is not defined in v1. |

## 6. Session Relationship Rules

Grow sessions remain primary entities.

Rules:

- CSTP Tests reference Grow sessions through `cstp_test_sessions`.
- Sessions should never become CSTP-owned.
- Linked sessions must remain compatible with standard app logic.
- CSTP helpers must not mutate normal session lifecycle, partitions, observations, images, notes, ownership, or metrics.
- A session should not be linked twice to the same CSTP Test.
- Archival must not destroy Grow session history.
- Removing or archiving a CSTP session link should affect the relationship record, not the Grow session.
- Linked sessions should remain queryable for internal review.

## 7. Admin Action Expectations

Expected future admin actions:

- accept request
- decline request
- mark awaiting seeds
- mark seeds received
- create CSTP Test
- attach Grow session
- remove or archive Grow session link
- archive request
- archive test
- add internal note

No implementation is defined here. Future helpers should map these actions to validated status transitions and append-only admin events.

## 8. Audit / Event Expectations

All meaningful lifecycle changes should create `cstp_admin_events` records.

Event history expectations:

- Admin events should remain append-only in principle.
- Admin events should be internal-only.
- Admin events should preserve historical auditability.
- Admin events should record the acting user when available.
- Admin events should use consistent `event_type` vocabulary.
- Admin events should not become public report content.

Recommended event types:

- `request_created`
- `request_status_changed`
- `request_archived`
- `seeds_received`
- `test_created`
- `test_status_changed`
- `session_linked`
- `session_link_archived`
- `note_added`
- `test_archived`

## 9. Internal-Only Boundary

The workflow remains private/admin-only.

Current boundaries:

- no public CSTP visibility
- no public source scoring
- no public certification layer
- no public reports
- no report snapshots
- no public badges
- no Source Directory public CSTP integration
- no Community Grow CSTP filters
- no automation
- no breeder/source portal

The admin workflow should not expose public trust signals. Future publication systems must be built on top of stable internal state, not mixed into the v1 workflow tables.

## 10. Future Integration Considerations

### Admin UI

Future admin UI should use this state machine for button availability, status labels, validation errors, and lifecycle history displays.

### Reports

Reports should only be introduced after internal request/test/session linkage behavior is stable. Completed testing does not automatically create a report.

### Certifications

Certification states should remain separate from v1 test statuses. A completed CSTP Test is not the same as certification.

### Source Directory

Source Directory public CSTP indicators should only appear after future public report/certification layers exist. Request/test workflow state should not directly create public source badges.

### Community Grow Filters

Community Grow CSTP filters should rely on future approved public states, not internal admin workflow states.

### Automation

Automation should follow this state machine later for reminders and notifications, but no automation is implemented now.

These integrations are future-facing only and intentionally excluded from the current v1 implementation scope.

## 11. Explicit Non-Goals

This document does not include or implement:

- code
- APIs
- RLS
- UI changes
- route changes
- public exposure
- reports
- report snapshots
- certifications
- public badges
- Source Directory public CSTP integration
- Community Grow CSTP filters
- automation
- breeder/source portal functionality

This is a CSTP admin workflow architecture document only.

