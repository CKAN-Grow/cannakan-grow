# CSTP Internal Admin Report Action Contract v1

## 1. Purpose

This document defines the internal admin-only action contract layer for operating immutable CSTP reports from future admin routes or callable admin actions.

The contract layer sits above the internal admin report management service and below any future route, controller, command, or admin tooling surface. It defines how future callers should request immutable report workflows without weakening CSTP snapshot integrity.

This is implementation-planning documentation only. It does not implement routes, callable actions, service functions, UI, public report access, rendering, certification behavior, automation, Source Directory integration, Community Grow integration, breeder/source portals, RLS, or public policies.

## 2. Contract Principles

- All actions are internal admin-only.
- Action handlers must authenticate and authorize the admin before invoking internal CSTP report services.
- Action handlers are responsible for loading operational CSTP records before calling the admin service.
- Operational CSTP tables and `grow_sessions` remain canonical mutable working data.
- Immutable report snapshots are frozen historical evidence records.
- Reports must not render from live operational values after snapshot generation.
- Write actions require an explicit caller-supplied workflow timestamp.
- Persistence-capable actions require a caller-supplied database client or transaction-compatible client.
- No action may create public visibility, public report access, certification publication, rendering output, or destructive snapshot edits.

## 3. Shared Contract Terms

### Admin Context

Every action requires an authenticated admin context. The minimum context should include:

- `adminId` or `userId`
- authenticated user reference suitable for future audit linkage
- admin role or authorization evidence checked before the action is invoked
- optional request metadata such as request id, reason, source tool, or correlation id

The contract layer must reject anonymous, public, or missing admin context before calling internal report services.

### Loaded Operational Input

Future handlers must load the operational data needed by the target action before service invocation. IDs alone are not sufficient for write workflows.

Expected loaded inputs can include:

- `cstpRequest`
- `cstpTest`
- `cstpTestSessions`
- `growSessions`
- `source`
- `auditEvents`
- `existingReport`
- `existingSnapshots`
- `supersededSnapshot` or target lineage records when relevant

The action contract does not define the query implementation. It only requires that handlers provide complete, already-loaded objects to the internal service layer.

### Workflow Timestamp

Write and validation-sensitive actions must receive an explicit timestamp from the caller. The action handler must not rely on hidden `Date.now` behavior inside CSTP services.

The timestamp should be normalized before service invocation when a handler has a standard timestamp utility available. The internal service may validate timestamp shape, but the action handler owns explicit timestamp capture.

### Database Client

Persistence actions require a caller-supplied database client or transaction-compatible client. The contract layer must not create global Supabase clients inside CSTP action handling.

Where transactions are available, handlers should execute immutable report persistence inside the caller's transaction boundary. If no transaction helper is available, the handler must treat the persistence result as requiring caller-level rollback awareness.

## 4. Shared Response Model

All admin action responses should follow this internal response shape:

```js
{
  success: boolean,
  ok: boolean,
  action: string,
  workflowMode: string,
  status: string,
  reportId: string | null,
  snapshotId: string | null,
  cstpRequestId: string | null,
  cstpTestId: string | null,
  validationSummary: {
    ok: boolean,
    status: string,
    blockingCount: number,
    warningCount: number,
    issueCount: number
  },
  lineageSummary: object | null,
  persistenceSummary: object | null,
  insertedRowCounts: object | null,
  message: string,
  blockingErrors: array,
  warnings: array,
  internalOnly: true
}
```

Action handlers may add transport-specific envelope fields later, but they must not remove the internal safety fields or expose public report payloads through this contract.

## 5. Shared Blocking Failure Cases

All actions must block when any of the following apply:

- admin context is missing or not authorized
- action is attempted from a public or anonymous surface
- required identifiers are missing
- required loaded records are missing for the requested workflow
- required explicit workflow timestamp is missing for write or validation-sensitive flows
- required database client is missing for persistence flows
- supplied report or snapshot lineage is malformed
- validation returns blocking integrity failures
- the action would destructively edit, delete, overwrite, or publicly expose immutable snapshot records
- the action attempts rendering, certification publication, Source Directory integration, or Community Grow integration

## 6. Action Contract: Prepare Report

### Action Name

`prepare_cstp_report_for_admin`

### Purpose

Prepare an internal immutable CSTP report snapshot candidate from loaded operational CSTP records. Preparation validates the candidate and may persist preparation records only through the internal admin service and persistence orchestrator when persistence is explicitly requested.

### Required Inputs

- `cstpRequest`
- `cstpTest`
- `cstpTestSessions`
- `growSessions`
- `adminContext`
- `workflowTimestamp`

### Optional Inputs

- `source`
- `auditEvents`
- `existingReport`
- `existingSnapshots`
- `dbClient` when preparation persistence is requested
- `deferPersistence` or equivalent service option when candidate-only preparation is desired

### Required Admin Context

The handler must provide an authenticated admin user reference and a preparation reason or correlation context when available.

### Expected Service Call

`prepareCstpReportForAdmin(input, options)`

Expected workflow mode: `prepare`

### Expected Response Shape

The response should include:

- `success` and `ok`
- `action: "prepare_cstp_report_for_admin"`
- `workflowMode: "prepare"`
- generated candidate summary when persistence is deferred
- report and snapshot identifiers when persistence occurs
- validation summary
- persistence summary when applicable
- safe admin-facing message
- blocking errors and warnings

### Blocking Failure Cases

- missing admin context
- missing workflow timestamp
- missing operational CSTP request or test
- missing CSTP test sessions or grow session evidence required for snapshot preparation
- blocking validation failures from the validator or orchestrator
- missing database client when persistence is requested
- attempted public exposure, rendering, certification publication, or destructive mutation

### Audit Expectations

Preparation should produce an internal audit intent or audit context describing:

- admin identity
- action name
- CSTP request id
- CSTP test id
- workflow timestamp
- whether persistence was deferred
- validation status

The contract does not implement audit persistence.

## 7. Action Contract: Generate Report

### Action Name

`generate_cstp_report_for_admin`

### Purpose

Generate an immutable report snapshot candidate or persisted immutable snapshot from loaded operational CSTP records. Generation freezes report summary, metric payloads, session summaries, operational references, and audit link candidates into deterministic internal evidence structures.

### Required Inputs

- `cstpRequest`
- `cstpTest`
- `cstpTestSessions`
- `growSessions`
- `adminContext`
- `workflowTimestamp`

### Optional Inputs

- `source`
- `auditEvents`
- `existingReport`
- `existingSnapshots`
- `dbClient` when persistence is requested
- persistence mode or `deferPersistence`

### Required Admin Context

The handler must provide an authenticated admin user reference and should include the admin reason for generation when available.

### Expected Service Call

`generateCstpReportForAdmin(input, options)`

Expected workflow mode: `generate`

### Expected Response Shape

The response should include:

- `success` and `ok`
- `action: "generate_cstp_report_for_admin"`
- `workflowMode: "generate"`
- generated candidate when persistence is deferred
- persisted report id and snapshot id when persistence occurs
- inserted row counts when persistence occurs
- validation summary
- persistence summary
- safe admin-facing message
- blocking errors and warnings

### Blocking Failure Cases

- missing or unauthorized admin context
- missing workflow timestamp
- incomplete operational inputs
- malformed frozen payload candidate
- duplicate active lineage where generation would create ambiguous active evidence
- missing database client when persistence is requested
- validator or persistence planner returns blocking failures
- attempted public visibility, rendering, certification publication, or destructive mutation

### Audit Expectations

Generation should capture internal audit context for:

- admin identity
- generated report lineage target
- CSTP request and test references
- workflow timestamp
- persistence mode
- validation result
- generated snapshot version or candidate reference when available

The contract does not create audit rows itself.

## 8. Action Contract: Regenerate Report

### Action Name

`regenerate_cstp_report_for_admin`

### Purpose

Regenerate an immutable CSTP report snapshot candidate from current operational data while preserving prior immutable snapshot history. Regeneration is used when a newer snapshot is needed; it must not rewrite an existing immutable snapshot.

### Required Inputs

- `cstpRequest`
- `cstpTest`
- `cstpTestSessions`
- `growSessions`
- `existingReport`
- `existingSnapshots`
- `adminContext`
- `workflowTimestamp`

### Optional Inputs

- `source`
- `auditEvents`
- `dbClient` when regenerated candidate persistence is requested
- target snapshot id or regeneration reason
- option indicating whether an already-superseded target is allowed, if future governance permits it

### Required Admin Context

The handler must provide an authenticated admin user reference and a regeneration reason suitable for future audit review.

### Expected Service Call

`regenerateCstpReportForAdmin(input, options)`

Expected workflow mode: `regenerate`

### Expected Response Shape

The response should include:

- `success` and `ok`
- `action: "regenerate_cstp_report_for_admin"`
- `workflowMode: "regenerate"`
- regenerated candidate summary
- lineage plan summary
- report and snapshot identifiers when persistence occurs
- validation summary
- persistence summary when applicable
- safe admin-facing message
- blocking errors and warnings

### Blocking Failure Cases

- missing admin context
- missing regeneration reason where future policy requires one
- missing workflow timestamp
- missing existing report or snapshot lineage
- lineage cycle or duplicate active lineage
- attempt to mutate an existing immutable snapshot instead of creating a new candidate
- missing operational source data required to regenerate reproducibly
- blocking validator or lineage planner failures
- missing database client when persistence is requested

### Audit Expectations

Regeneration should capture:

- admin identity
- regeneration reason
- prior report id and active snapshot id
- new candidate reference when available
- workflow timestamp
- lineage validation result
- persistence mode

Audit recording remains a future implementation concern.

## 9. Action Contract: Supersede Report

### Action Name

`supersede_cstp_report_for_admin`

### Purpose

Supersede a current immutable report snapshot with a newer immutable snapshot through explicit lineage. Supersession preserves historical evidence and prevents destructive replacement.

### Required Inputs

- `existingReport`
- `existingSnapshots`
- target snapshot to supersede or active lineage target
- successor snapshot candidate or successor snapshot reference
- `adminContext`
- `workflowTimestamp`

### Optional Inputs

- `cstpRequest`
- `cstpTest`
- `cstpTestSessions`
- `growSessions`
- `source`
- `auditEvents`
- `dbClient` when persistence is requested
- supersession reason
- option for strict active-lineage enforcement

### Required Admin Context

The handler must provide an authenticated admin user reference and a supersession reason. Supersession should be treated as a governance-sensitive write action.

### Expected Service Call

`supersedeCstpReportForAdmin(input, options)`

Expected workflow mode: `supersede`

### Expected Response Shape

The response should include:

- `success` and `ok`
- `action: "supersede_cstp_report_for_admin"`
- `workflowMode: "supersede"`
- target report id
- target snapshot id
- superseding snapshot id or candidate reference when available
- snapshots to mark superseded
- report state changes needed
- lineage plan summary
- validation summary
- persistence summary when applicable
- safe admin-facing message
- blocking errors and warnings

### Blocking Failure Cases

- missing admin context
- missing supersession reason where policy requires one
- missing workflow timestamp
- self-supersession
- lineage cycle
- duplicate active lineage
- target already superseded unless explicitly allowed by supplied policy options
- missing successor candidate or successor snapshot reference
- destructive update, delete, or overwrite attempt
- blocking validator or lineage planner failures
- missing database client when persistence is requested

### Audit Expectations

Supersession should capture:

- admin identity
- supersession reason
- target report id
- target snapshot id
- successor candidate or snapshot reference
- workflow timestamp
- validation and lineage plan status
- expected report and snapshot state changes

The contract does not implement audit persistence or database updates directly.

## 10. Action Contract: Inspect Report Lineage

### Action Name

`inspect_cstp_report_lineage_for_admin`

### Purpose

Return an internal read-only view of immutable report snapshot lineage for a loaded report and its supplied snapshots.

### Required Inputs

- `existingReport`
- `existingSnapshots`
- `adminContext`
- `workflowTimestamp` when validation inspection requires timestamp-sensitive checks

### Optional Inputs

- target report id
- target snapshot id
- include audit context flag
- include validation issue details flag

### Required Admin Context

The handler must provide an authenticated admin user reference. Read-only lineage inspection remains internal-only and admin-only.

### Expected Service Call

`inspectCstpReportLineageForAdmin(input, options)`

Expected workflow mode: `inspect_lineage`

### Expected Response Shape

The response should include:

- `success` and `ok`
- `action: "inspect_cstp_report_lineage_for_admin"`
- `workflowMode: "inspect_lineage"`
- target report id
- active snapshot summary
- superseded snapshot summary
- duplicate active lineage status
- cycle detection status
- validation summary
- safe admin-facing message
- blocking errors and warnings

### Blocking Failure Cases

- missing or unauthorized admin context
- missing existing report
- missing snapshot list
- malformed lineage shape
- duplicate active lineage when strict inspection requires a clean lineage
- lineage cycle
- attempted write, repair, deletion, public exposure, rendering, or certification behavior

### Audit Expectations

Lineage inspection may record audit context later depending on admin governance requirements. At minimum, future handlers should be able to log:

- admin identity
- action name
- target report id
- target CSTP request or test id when known
- inspection timestamp
- whether blocking lineage defects were found

## 11. Action Contract: Inspect Validation Failures

### Action Name

`inspect_cstp_report_validation_for_admin`

### Purpose

Return deterministic validation results for supplied CSTP report workflow inputs, candidates, lineage records, or persistence candidate shapes without persisting or mutating records.

### Required Inputs

- `adminContext`
- validation target such as workflow inputs, candidate, report, snapshots, lineage plan, or persistence candidate

### Optional Inputs

- `workflowTimestamp`
- `existingReport`
- `existingSnapshots`
- `cstpRequest`
- `cstpTest`
- `cstpTestSessions`
- `growSessions`
- candidate payload
- include warnings flag

### Required Admin Context

The handler must provide an authenticated admin user reference. Validation inspection must not be available to anonymous or public callers.

### Expected Service Call

`inspectCstpReportValidationForAdmin(input, options)`

Expected workflow mode: `inspect_validation`

### Expected Response Shape

The response should include:

- `success` and `ok`
- `action: "inspect_cstp_report_validation_for_admin"`
- `workflowMode: "inspect_validation"`
- validation target count
- validation summary
- issue list with severity, code, entity, field, blocking flag, and metadata
- safe admin-facing message
- warnings and blocking errors

### Blocking Failure Cases

- missing admin context
- no validation target supplied
- malformed validation target
- action attempts to persist rejected candidates
- action attempts to repair, mutate, render, certify, or publicly expose report data

### Audit Expectations

Validation inspection should be auditable later when used for governance decisions. Future handlers should be able to record:

- admin identity
- action name
- validation target type
- workflow timestamp when supplied
- blocking issue count
- warning count

No audit persistence is implemented by this document.

## 12. Action Contract: List Reports By CSTP Request Or Test

### Action Name

`list_cstp_reports_for_admin`

### Purpose

List internal immutable CSTP report records scoped to a CSTP request id, CSTP test id, or both. This is a future read-only admin contract and is not implemented by the current admin report management service.

### Required Inputs

At least one of:

- `cstpRequestId`
- `cstpTestId`

Also required:

- `adminContext`

### Optional Inputs

- status filters such as `draft`, `preparing`, `prepared`, `integrity_failed`, `published_internal`, `superseded`, or `archived_internal`
- snapshot status filters
- created timestamp range
- prepared timestamp range
- published timestamp range
- pagination cursor or limit
- include active snapshot summary flag
- include lineage summary flag
- include validation summary flag

### Required Admin Context

The handler must provide an authenticated admin user reference. Listing is internal admin discovery only and must not expose public report payloads.

### Expected Service Call

Future internal read model helper, not yet implemented.

This action should not call write workflow methods. It may later read from:

- `cstp_reports`
- `cstp_report_snapshots`
- `cstp_report_metrics`
- `cstp_report_sessions`
- `cstp_report_audit_links`

### Expected Response Shape

The response should include:

- `success` and `ok`
- `action: "list_cstp_reports_for_admin"`
- `workflowMode: "list_internal_reports"`
- request and test scope
- result count
- pagination metadata when applicable
- report rows with internal ids, statuses, timestamps, and active snapshot summary
- validation summary for query scope when applicable
- safe admin-facing message
- errors and warnings

### Blocking Failure Cases

- missing admin context
- missing both CSTP request id and CSTP test id
- public or anonymous access attempt
- request attempts to include public rendering payloads
- request attempts to expose certification, badge, Source Directory, or Community Grow details
- unsupported filters that would imply public visibility behavior

### Audit Expectations

Listing may be audit-light compared with write actions, but future handlers should be able to record:

- admin identity
- action name
- CSTP request id or test id scope
- filters used
- result count
- inspection timestamp

## 13. Input Loading Expectations

Future admin action handlers are responsible for loading operational inputs before calling the internal admin service.

Write workflow handlers should:

- load `cstp_requests` into `cstpRequest`
- load `cstp_tests` into `cstpTest`
- load `cstp_test_sessions` into `cstpTestSessions`
- load linked `grow_sessions` into `growSessions`
- load source metadata into `source` when available
- load current immutable report records into `existingReport` when regenerating or superseding
- load current immutable snapshot records into `existingSnapshots` when regenerating, superseding, or inspecting lineage
- load relevant `cstp_admin_events` or audit event records into `auditEvents` when available
- normalize ordering before service invocation when the handler owns query order

Read-only handlers should:

- load immutable report and snapshot records by internal id, CSTP request id, or CSTP test id
- avoid loading public projection data because public report surfaces are deferred
- pass loaded records into inspection helpers instead of repairing malformed lineage inside the action handler

No action handler should ask the admin service to query Supabase implicitly. Data access remains the responsibility of the future route/action layer or its dedicated loading helpers.

## 14. Permission Expectations

All actions require authenticated admin access before invocation.

The contract expects:

- no anonymous access
- no public access
- no unauthenticated callable action
- no breeder/source portal access
- no Source Directory access
- no Community Grow access
- no customer-facing report access
- RLS and database policy implementation deferred

Future route or action handlers should fail closed when admin authorization cannot be proven.

## 15. Safety Boundaries

The admin action contract must never perform or imply:

- public report exposure
- public visibility flags
- public read policies
- report rendering
- PDF or export generation
- certification publication
- badge issuance
- Source Directory integration
- Community Grow integration
- breeder or source account access
- destructive immutable snapshot edits
- deletion of historical snapshots
- mutation of `grow_sessions`

Immutable snapshots remain historical evidence records. Operational CSTP data and `grow_sessions` remain canonical operational truth.

## 16. Future Implementation Placeholders

The following systems are deferred placeholders only:

- actual admin route or callable action implementation
- admin UI wiring
- report rendering engine
- PDF/export generation
- certification publishing
- public report visibility
- public verification endpoints
- admin report dashboard
- RLS and policy enforcement

These placeholders must not be treated as designed or implemented by this contract.

## 17. Explicit Non-Goals

This document does not define or implement:

- Express routes, API endpoints, or callable action handlers
- app.js wiring
- UI screens or admin dashboard behavior
- database migrations
- persistence services or query loaders
- background jobs or automation
- rendering or PDF output
- certification qualification logic
- public access rules
- RLS or public policies
- Source Directory integration
- Community Grow integration
- breeder/source portals

## 18. Final Contract Rule

Future admin action handlers may use this contract to call internal CSTP report services only after authentication, authorization, input loading, timestamp capture, and validation gates are satisfied.

Any behavior that exposes CSTP reports publicly, renders reports, publishes certifications, mutates historical snapshots destructively, or bypasses immutable lineage must remain outside this v1 contract.
