# CSTP Operational Validation Checklist

## 1. Purpose

This checklist prepares the internal CSTP system for real operational usage and manual QA before immutable reporting implementation begins.

The checklist covers the current internal CSTP admin UI, admin APIs, smoke-test framework, and recent operational UX polish. It is validation planning only. It does not add features, modify architecture, implement reports, implement certifications, expose CSTP publicly, add automation, add breeder/source portals, integrate Community Grow, integrate Source Directory, or mutate `grow_sessions`.

## 2. Pre-Validation Setup

Before running manual QA:

- Confirm a local or isolated staging Supabase environment is available.
- Confirm CSTP migration v1 is applied in the isolated environment.
- Confirm an admin user can authenticate.
- Confirm a non-admin user is available for authorization checks.
- Confirm at least one existing `grow_sessions.id` is available for relationship-link testing.
- Confirm the browser is pointed at the local/internal app environment, not production.
- Run `node scripts/cstp-smoke-tests.js` before manual QA.

## 3. Request Workflow Checklist

### Create Request

- Create or seed a CSTP request through the current internal admin/API workflow.
- Confirm the request appears in the internal request queue.
- Confirm request fields render clearly:
  - contact name
  - contact email
  - breeder/source identity
  - variety
  - seed type
  - batch/lot
  - requested seed count
  - request message
- Confirm no public CSTP UI changes occur.

Expected result:

- Request exists as an internal CSTP request.
- Request starts in `received`.
- Admin UI shows loading, success, or error feedback clearly.

### Accept Request

- Open request detail.
- Select `Accept Request`.
- Confirm the status updates to `accepted`.
- Confirm the request queue/detail refresh after success.

Expected result:

- Status changes from `received` to `accepted`.
- Audit behavior remains API-owned.
- No report/certification/public UI appears.

### Decline Request

- Use a separate `received` request.
- Select `Decline Request`.
- Confirm the status updates to `declined`.
- Confirm no test creation action is available after decline.

Expected result:

- Status changes from `received` to `declined`.
- Declined request remains internal.

### Move to Awaiting Seeds

- Use an `accepted` request.
- Select `Mark Awaiting Seeds`.
- Confirm the status updates to `awaiting_seeds`.
- Confirm the request can return to `accepted` if needed.

Expected result:

- Status transitions follow canonical lifecycle rules.
- UI remains a thin affordance; backend remains authoritative.

### Archive Request

- Open an active/non-archived request.
- Select `Archive Request`.
- Confirm the archive confirmation prompt appears.
- Confirm cancellation leaves the request unchanged.
- Confirm approval archives the request.
- Switch to the Archived filter and confirm the request is discoverable.

Expected result:

- Archive behavior is explicit.
- Archived records remain internally visible.
- No public reference is created.

### Invalid Request Transitions

Attempt invalid transitions through API/manual QA tooling where safe, such as:

- `declined` to `accepted`
- `archived` to `accepted`
- missing current status
- unsupported next status

Expected result:

- Invalid transitions are rejected by the API/helper layer.
- UI or API response shows a safe error.
- No partial public state is created.

## 4. Test Workflow Checklist

### Create Test From Eligible Request

- Open an `accepted` or `awaiting_seeds` request.
- Select `Create CSTP Test`.
- Confirm success feedback.
- Open Test Management and refresh if needed.
- Confirm the test appears with `pending` status.

Expected result:

- CSTP test is linked to the request.
- Request remains an internal request record.
- No session-link, report, or certification is created automatically.

### Activate Test

- Open a `pending` CSTP test.
- Select `Start Test`.
- Confirm status updates to `active`.

Expected result:

- Status changes from `pending` to `active`.
- Audit behavior remains API-owned.

### Complete Test

- Open an `active` CSTP test.
- Select `Mark Completed`.
- Confirm status updates to `completed`.

Expected result:

- Status changes from `active` to `completed`.
- No report snapshot or certification is created yet.

### Archive Test

- Open a `pending`, `active`, or `completed` test.
- Select `Archive Test`.
- Confirm the archive confirmation prompt appears.
- Confirm the prompt states Grow sessions are not changed.
- Confirm cancellation leaves the test unchanged.
- Confirm approval archives the test.
- Switch to the Archived filter and confirm the test is discoverable.

Expected result:

- Archive affects the CSTP test record only.
- Existing Grow sessions remain unchanged.

### Invalid Test Transitions

Attempt invalid transitions through API/manual QA tooling where safe, such as:

- `completed` to `active`
- `archived` to `active`
- missing test id
- unsupported next status

Expected result:

- Invalid transitions are rejected.
- Error response is visible and safe.
- No public state or report state is created.

## 5. Session-Link Workflow Checklist

### Attach Grow Session

- Open an internal CSTP test detail.
- Locate Session-Link Management.
- Paste an existing `grow_sessions.id`.
- Optionally add a KAN label.
- Select `Attach Existing Session`.
- Confirm success feedback.
- Confirm the link appears in the relationship list.

Expected result:

- A CSTP relationship row is created.
- `grow_sessions` remains unchanged.
- No session timeline, media, analytics, reminders, notes, partitions, ownership, or visibility are changed.

### Verify Duplicate-Link Rejection

- Attempt to attach the same `grow_sessions.id` to the same CSTP test again.

Expected result:

- Duplicate relationship is rejected.
- Existing relationship remains unchanged.
- Error message is visible and safe.

### Archive Relationship

- Select `Archive Relationship`.
- Confirm the archive prompt appears.
- Confirm cancellation leaves the relationship active.
- Confirm approval archives the relationship.
- Refresh the link list.

Expected result:

- Only the CSTP relationship row is archived.
- The Grow session itself is not deleted or modified.

### Confirm Grow Sessions Remain Unchanged

After link creation and archival:

- Inspect the referenced Grow session through normal app/admin tools.
- Confirm no CSTP action changed:
  - stage
  - timeline
  - analytics
  - media
  - reminders
  - notes
  - partitions
  - ownership
  - visibility

Expected result:

- CSTP remains an external overlay.
- `grow_sessions` remains canonical.

## 6. Authorization and Security Checklist

### Unauthorized Access

- Attempt to call CSTP admin APIs without an auth token.

Expected result:

- Request is rejected with a normalized unauthorized response.
- No CSTP records are returned.
- No mutation occurs.

### Non-Admin Access

- Authenticate as a non-admin user.
- Attempt request list/detail and mutation APIs.

Expected result:

- Request is rejected as forbidden.
- No CSTP records are returned.
- No mutation occurs.

### Expired or Missing Auth Behavior

- Use an expired, invalid, or missing token.
- Attempt UI/API access.

Expected result:

- Admin UI shows safe loading/error feedback.
- API rejects before execution helpers run.
- No internal data is leaked.

### Admin Session Validation

- Authenticate as a valid admin.
- Confirm admin request/test/session-link workflows load and mutate only through CSTP admin APIs.

Expected result:

- Admin actor identity is available for audit behavior.
- Routes remain authorization-first.

## 7. Operational UX Checklist

Validate:

- Loading states are visible for request queue, request detail, test list, test detail, and session links.
- Empty states explain what admins can try next.
- Error messages are visible without exposing sensitive internal details.
- Archive confirmation prompts appear for requests, tests, and session-link relationships.
- Archived request/test records are discoverable through the Archived filter.
- Status labels are clear and match the canonical lifecycle vocabulary.
- Request-to-test workflow is understandable.
- Test-to-session-link workflow is understandable.
- Session-link copy clearly states Grow sessions are not edited.
- Public report/certification language does not appear in operational v1 workflows except as deferred boundary copy.

## 8. Operational Friction Notes

During validation, capture:

- confusing wording
- unclear button labels
- missing success/error feedback
- stale state after mutation
- unclear archive visibility
- confusing status labels
- hard-to-find workflow steps
- session-link operator mistakes
- authorization/config failures that need better copy

Record the page, user role, exact action, expected behavior, actual behavior, and recommended fix.

## 9. Future UX Polish Ideas

Candidates for later polish:

- read-only Grow session picker for session-link creation
- clearer admin authorization/config failure messages
- audit-event inspection UI after read APIs exist
- richer queue filtering and total counts
- browser smoke tests for admin CSTP workflow
- visual distinction for audit warning states
- operator notes for why a request/test was archived

These should remain internal/admin-only until reporting and public trust systems are explicitly planned and implemented.

## 10. Deferred Immutable Reporting Concerns

Do not test or expect these yet:

- report generation
- report snapshots
- report publication
- certification eligibility
- certification issuance
- public report pages
- public CSTP badges
- Source Directory CSTP exposure
- Community Grow CSTP filters
- breeder/source portal flows
- automation or notifications

Immutable reporting should begin only after this operational workflow is stable and manual QA friction has been resolved.

## 11. What Should Not Be Tested Yet

The current CSTP v1 operational validation should not include:

- production data
- public CSTP pages
- public report APIs
- certification workflows
- report renderer behavior
- Source Directory badge behavior
- Community Grow discovery
- automation/reminder delivery
- breeder/source portal access
- direct Grow session mutation by CSTP

## 12. Recommended Stabilization Loop

Use this loop before immutable reporting implementation:

1. Run `node scripts/cstp-smoke-tests.js`.
2. Run the manual request/test/session-link workflows in a local or isolated staging environment.
3. Capture friction notes and unclear behavior.
4. Make a small, bounded polish pass.
5. Run `node scripts/cstp-smoke-tests.js` again.
6. Run `node --check app.js`.
7. Run `npm run build` when app-level changes are present.
8. Repeat until the internal operational workflow is predictable and low-friction.

## 13. Readiness Exit Criteria

CSTP is ready to move toward immutable reporting implementation only when:

- request workflow validates cleanly
- test workflow validates cleanly
- session-link workflow validates cleanly
- duplicate-link rejection is confirmed
- invalid lifecycle transitions are rejected
- authorization boundaries are confirmed
- archived records remain discoverable internally
- `grow_sessions` remains unchanged
- admin UX friction is documented or resolved
- smoke tests pass after the final polish pass
