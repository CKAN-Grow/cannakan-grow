# CSTP Helper Implementation Roadmap

## 1. Purpose

This document defines the implementation order for the internal CSTP helper/service layer after the initial migration v1 foundation. The helper layer should centralize CSTP request handling, test orchestration, session linkage, admin event logging, and lifecycle validation without introducing public CSTP behavior.

The helper layer must remain internal-only until the CSTP admin workflow, RLS posture, and future API boundaries are reviewed. It must protect the existing Cannakan Grow session system by linking to grow sessions rather than mutating core session behavior.

Current-state note: the helper/service layer, execution boundary, admin authorization, admin APIs, and initial internal admin UI have now been implemented for the v1 internal workflow. This roadmap remains useful as historical sequencing and boundary guidance; future work should treat reports, certifications, public exposure, automation, and portals as still deferred.

## 2. Helper Implementation Order

Recommended implementation order:

1. Lifecycle constants and validation helpers - completed for v1.
2. Admin event payload helpers - completed for v1.
3. CSTP request helpers - completed for v1.
4. CSTP test orchestration helpers - completed for v1.
5. CSTP session linkage helpers - completed for v1.
6. Internal service composition/execution helpers - completed for v1.
7. Admin-only API integration - completed for v1 request/test/session-link operations.
8. Admin UI integration - completed for the internal API-backed workflow.

Lifecycle validation should be implemented first so every later helper uses the same transition rules. Admin event helpers should follow so meaningful workflow actions can be logged consistently from the beginning.

## 3. Dependency Sequencing

Helper implementation depends on:

- The CSTP migration v1 tables existing in the target environment.
- The approved request and test status vocabulary from the workflow state machine.
- The session compatibility rules that keep grow sessions canonical.
- A reviewed admin ownership strategy before user/admin foreign key behavior is enforced in code.
- A reviewed RLS strategy before any API or UI integration is exposed.

No helper should depend on reports, report snapshots, certifications, public badges, Source Directory exposure, Community Grow filters, automation, or breeder/source portals.

## 4. Validation Priorities

Primary validation priorities:

- CSTP helpers do not mutate `grow_sessions`.
- Session linkage only creates or archives CSTP linkage records.
- Invalid request and test transitions are rejected by centralized lifecycle helpers.
- Meaningful lifecycle actions create admin event records.
- Archive behavior is preferred over destructive deletion.
- No public read helpers are introduced.
- No report or certification state is created by v1 helpers.

## 5. Testing Priorities

Recommended testing sequence:

1. Unit tests for lifecycle transition validators.
2. Unit tests for admin event payload shaping.
3. Unit tests for request and test helper input validation.
4. Local Supabase integration tests for request/test creation and status updates.
5. Local Supabase integration tests for session linkage uniqueness and FK behavior.
6. Regression checks confirming grow session rows are not modified by CSTP helpers.
7. Negative-path tests for invalid statuses, invalid session IDs, duplicate links, and archived records.

Testing should remain internal and database-focused before any API or admin UI layer is added.

## 6. Future API Integration Boundaries

Future API routes should call the internal helper layer rather than duplicating CSTP lifecycle or linkage logic. APIs should remain admin-only and should not expose public CSTP reads until report snapshots, certification lifecycle, and RLS policies are implemented and validated.

API integration must not introduce:

- Public report visibility.
- Public certification visibility.
- Source Directory CSTP exposure.
- Community Grow CSTP filters.
- Breeder/source portal access.
- Automation or notification workflows.

## 7. Future Admin UI Boundaries

Future admin UI work should depend on reviewed admin-only APIs or an approved server-side integration layer. The UI should not encode independent lifecycle rules; it should reflect helper/service validation results.

Admin UI should initially support only internal workflow operations:

- Reviewing requests.
- Updating request state.
- Creating internal CSTP tests.
- Linking existing grow sessions.
- Viewing admin event history.
- Archiving internal records.

Public publishing, reports, certifications, Source Directory badges, and Community Grow exposure remain separate future phases.

## 8. Explicit Non-Goals

This roadmap does not implement:

- APIs.
- UI routes.
- RLS.
- Public CSTP reads.
- Reports.
- Report snapshots.
- Certifications.
- Automation.
- Breeder/source portals.

## 9. Final Recommendation

The CSTP helper layer should begin as a thin internal orchestration layer. It should centralize lifecycle rules and admin event expectations while preserving the existing grow session system as the source-of-truth.

Implementation should proceed only after this scaffold is reviewed, and each future helper should be validated locally before any API or admin UI integration is introduced.
