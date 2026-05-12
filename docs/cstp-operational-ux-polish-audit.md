# CSTP Operational UX Polish Audit

## 1. Purpose

This audit reviews the internal CSTP admin workflow for operational clarity and low-risk UX polish before immutable reporting implementation begins.

The audit focuses on the current admin-only CSTP workflow in `app.js`, the completed CSTP admin APIs, the prior admin UI integration audit, loose-ends stabilization audit, and the CSTP smoke-test framework.

This pass does not add new CSTP feature categories, reports, certifications, public exposure, automation, breeder/source portals, Community Grow integration, Source Directory integration, or Grow session mutation behavior.

## 2. Operational Friction Findings

### Request Workflow

Findings:

- The request queue empty state did not explain what an admin should try next.
- Request detail copy implied test/session workflows were outside the view, even though test creation now happens from request detail.
- The request queue description did not clearly state the operational path from intake review to test creation.
- Archive actions were available without an explicit confirmation step.

### Test Workflow

Findings:

- Test management copy still described session linking as deferred even though session-link management now exists in the test detail workflow.
- Test list empty state did not guide admins toward creating a test from an eligible request.
- Test detail copy needed clearer separation between supported internal operations and deferred reporting/certification work.
- Archive actions were available without a confirmation that Grow sessions are not affected.

### Session-Link Workflow

Findings:

- The session-link empty state did not reinforce that links are external overlays.
- The attach action wording was slightly abstract for operators who need to paste an existing `grow_sessions.id`.
- The archive button wording did not make clear that only the relationship row is archived.
- Relationship archival was available without a confirmation step.

### Status and Archive Visibility

Findings:

- Archived records were available through filters, but the empty states did not help admins discover that path.
- Status-action feedback existed but could benefit from clearer surrounding copy.
- Backend lifecycle validation remains canonical, and the UI should continue to avoid becoming a second lifecycle authority.

## 3. Polish Improvements Made

Lightweight polish changes were made in `app.js` only.

### Request Queue and Detail

Updated:

- Loading copy now says requests are being loaded from the admin API.
- Empty state now suggests trying another status filter, refreshing the queue, or using the Archived filter.
- Request queue copy now clarifies it supports intake review and test creation.
- Request detail copy now clarifies that admins create a test there and use Test Management for status/session-link work.
- Request archive action now asks for confirmation before submitting the status update.

### Test Management

Updated:

- Loading copy now says tests are being loaded from the admin API.
- Empty state now suggests creating a test from an eligible request, refreshing, or using the Archived filter.
- Test management copy now acknowledges session-link management as an active internal operation.
- Test detail copy now clarifies that status and external Grow session links are managed there.
- Test archive action now asks for confirmation and confirms Grow sessions are not changed.

### Session-Link Management

Updated:

- Empty state now explains admins can paste an existing `grow_sessions.id` to create a relationship overlay.
- Session ID input placeholder now says "Paste existing grow_sessions.id".
- Attach button now reads "Attach Existing Session".
- Archive button now reads "Archive Relationship".
- Session-link archival now asks for confirmation and states that the Grow session is not changed.

## 4. Confirmed Boundaries

Confirmed during this audit:

- The frontend remains API-driven.
- No direct Supabase access was added.
- No frontend audit construction was added.
- No frontend lifecycle authority was added beyond simple action affordances.
- No public CSTP routes, pages, badges, reports, certifications, or source-facing surfaces were added.
- No `grow_sessions` mutation was added.
- Session-link copy continues to frame links as external overlays.

## 5. Remaining UX Gaps

Remaining operational polish items:

- Admin UI still needs browser-level layout QA with a configured local admin session.
- Authorization and configuration failure states could eventually be mapped to more tailored admin messages.
- Audit warning states could become more visually distinct once audit-event read APIs exist.
- Session selection is still manual by `grow_sessions.id`; a future read-only session picker may reduce operator error.
- Test/request list pagination remains intentionally simple and does not display total counts.
- Older static/admin-preview CSTP routes remain reconciled away from the canonical flow, but deeper removal should remain a separate stabilization decision.

## 6. Recommended Future Admin UX Work

Recommended future sequence:

1. Run manual browser QA against a configured local Supabase admin account.
2. Add browser smoke coverage for the internal admin CSTP workflow.
3. Plan a read-only Grow session lookup/picker for session-link creation.
4. Plan internal audit-event read APIs and audit inspection UI.
5. Add clearer config/auth failure copy after admin authorization behavior is stable in operational use.
6. Begin immutable reporting UX planning only after the operational workflow is stable.

## 7. Immutable Reporting UX Deferred

Immutable reporting remains intentionally deferred.

This audit did not implement or expose:

- report generation
- report snapshots
- report publication
- certifications
- public report pages
- public certification badges
- Source Directory CSTP exposure
- Community Grow CSTP filters
- breeder/source portal workflows
- automation or notifications

Future reporting UX should be planned after snapshot schema, generation pipeline, and publication workflow boundaries are implemented and validated.

## 8. Validation Summary

Validation performed for this pass:

- `node --check app.js`
- `node scripts/cstp-smoke-tests.js`
- CSTP API/helper syntax checks
- `npm run build`
- search for accidental public CSTP admin exposure in `index.html`, `public`, and `styles.css`
- `git diff --check`

The internal CSTP workflow remains admin-only and operationally focused.
