# CSTP Internal Admin Report Routes Plan v1

## 1. Purpose

This document defines how the internal CSTP admin report action layer should be exposed later through protected admin-only backend routes or callable backend actions.

This is implementation-planning documentation only. It does not implement routes, modify `app.js`, wire UI, modify migrations, expose CSTP publicly, render reports, publish certifications, add automation, integrate Source Directory, integrate Community Grow, add breeder/source portals, or define RLS/public policies.

The planned route/action layer should sit above `src/services/cstp/internal/admin-report-actions.js` and below future protected admin transport handlers. It should authenticate the admin, load required operational CSTP records, build admin context, call the internal action handler, and return a structured internal admin response.

## 2. Route Layer Principles

- Routes/actions are internal admin-only.
- Anonymous and public callers must be rejected before any CSTP data loading.
- Future handlers must not expose public report pages, public report payloads, or public verification behavior.
- Future handlers must load operational CSTP objects before invoking internal action handlers.
- Future handlers must pass explicit workflow timestamps into action handlers.
- Future handlers must pass caller-owned database clients or transaction-compatible clients when persistence is requested.
- Future handlers must not create rendering output, certification output, public badge state, Source Directory state, or Community Grow links.
- Future handlers must not destructively mutate immutable snapshots.
- `grow_sessions` remain canonical operational records and must not be mutated by report routes.

## 3. Shared Protected Route Requirements

Every future route/action in this plan requires:

- authenticated admin identity
- authorization check proving the caller can operate internal CSTP admin report workflows
- `adminContext` containing admin user id and request metadata
- explicit workflow timestamp for write and validation-sensitive actions
- loaded operational or immutable report records appropriate to the action
- structured response using the internal action result model
- failure-closed behavior for missing admin identity, missing authorization, missing inputs, or public context

RLS and database policy work is deferred. Future route handlers must still enforce admin-only access at the application layer until database policies are separately designed and implemented.

## 4. Shared Response Shape

Protected admin routes/actions should return an internal response envelope that preserves the internal action result fields:

```js
{
  success: boolean,
  ok: boolean,
  action: string,
  actionName: string,
  workflowMode: string,
  status: string,
  reportId: string | null,
  snapshotId: string | null,
  cstpRequestId: string | null,
  cstpTestId: string | null,
  validationSummary: object | null,
  lineageSummary: object | null,
  persistenceSummary: object | null,
  message: string,
  blockingErrors: array,
  warnings: array,
  internalOnly: true
}
```

Transport-specific metadata may be added later, but route handlers must not strip safety fields from the internal action response.

## 5. Planned Route Surface Summary

| Planned route/action | Method | Internal action handler | Workflow mode |
| --- | --- | --- | --- |
| `/internal/admin/cstp/reports/prepare` | `POST` | `prepareCstpReportAction` | `prepare` |
| `/internal/admin/cstp/reports/generate` | `POST` | `generateCstpReportAction` | `generate` |
| `/internal/admin/cstp/reports/regenerate` | `POST` | `regenerateCstpReportAction` | `regenerate` |
| `/internal/admin/cstp/reports/supersede` | `POST` | `supersedeCstpReportAction` | `supersede` |
| `/internal/admin/cstp/reports/:reportId/lineage` | `GET` or callable read action | `inspectCstpReportLineageAction` | `inspect_lineage` |
| `/internal/admin/cstp/reports/validation` | `POST` | `inspectCstpReportValidationAction` | `inspect_validation` |
| `/internal/admin/cstp/reports` | `GET` or callable read action | `listCstpReportsAction` | `list_internal_reports` |

Names and paths are planning placeholders. Actual route registration is deferred.

## 6. Prepare Report Route

### Internal Route/Action Name

`prepare_cstp_report_for_admin`

### Planned Surface

`POST /internal/admin/cstp/reports/prepare`

### Purpose

Prepare an internal immutable CSTP report snapshot candidate from loaded CSTP operational data. Preparation may return a candidate with persistence deferred or may call persistence through the internal action stack when explicitly requested.

### Required Inputs

- `cstpRequestId`
- `cstpTestId`
- `workflowTimestamp`
- persistence mode such as `persist` or `deferPersistence`
- optional report id or snapshot id when supplied by a future internal workflow

### Expected Loaded Operational Objects

The handler should load and pass:

- `cstpRequest`
- `cstpTest`
- `cstpTestSessions`
- `growSessions`
- `source`
- `auditEvents` when available
- `existingReport` and `existingSnapshots` when a report already exists

### Admin Context Requirements

The handler must build `adminContext` from authenticated admin identity. It should include admin user id, request correlation metadata, and future audit metadata when available.

### Service/Action Handler Called

`prepareCstpReportAction(input, options)`

### Expected Response Shape

The response should include action name, workflow mode `prepare`, validation summary, candidate or persistence summary, report/snapshot identifiers when available, safe admin-facing message, blocking errors, warnings, and `internalOnly: true`.

### Failure Cases

- unauthenticated or unauthorized admin
- anonymous/public context
- missing request/test identifiers
- missing loaded CSTP request, test, session, grow session, or source records
- missing workflow timestamp
- missing database client when persistence is requested
- blocking validation failures
- attempted rendering, certification, public exposure, or destructive snapshot edits

### Audit Expectations

Future handlers should record or pass audit context for admin identity, action name, CSTP request id, CSTP test id, workflow timestamp, persistence mode, and validation result.

## 7. Generate Report Route

### Internal Route/Action Name

`generate_cstp_report_for_admin`

### Planned Surface

`POST /internal/admin/cstp/reports/generate`

### Purpose

Generate an immutable CSTP report snapshot candidate or persist a generated snapshot through the internal immutable persistence stack.

### Required Inputs

- `cstpRequestId`
- `cstpTestId`
- `workflowTimestamp`
- persistence mode such as `persist` or `deferPersistence`
- optional caller-supplied report id or snapshot id if future governance permits externally assigned ids

### Expected Loaded Operational Objects

The handler should load and pass:

- `cstpRequest`
- `cstpTest`
- `cstpTestSessions`
- `growSessions`
- `source`
- `auditEvents`
- `existingReport` and `existingSnapshots` when a report lineage already exists

### Admin Context Requirements

Authenticated admin identity is required. The admin context should include admin user id, action reason when supplied, and request metadata.

### Service/Action Handler Called

`generateCstpReportAction(input, options)`

### Expected Response Shape

The response should include action name, workflow mode `generate`, validation summary, generated candidate summary when persistence is deferred, persistence summary when persistence runs, inserted row counts when available, safe admin-facing message, errors, warnings, and `internalOnly: true`.

### Failure Cases

- missing admin authentication or authorization
- public/anonymous context
- missing operational inputs
- missing workflow timestamp
- duplicate active lineage risk
- malformed frozen payload candidate
- missing database client when persistence is requested
- blocking validation or persistence planning failure
- attempted public visibility, rendering, certification, integration, or destructive update

### Audit Expectations

Future handlers should preserve audit context for generated snapshot attempt, admin identity, request/test references, persistence mode, validation status, and generated snapshot reference when available.

## 8. Regenerate Report Route

### Internal Route/Action Name

`regenerate_cstp_report_for_admin`

### Planned Surface

`POST /internal/admin/cstp/reports/regenerate`

### Purpose

Regenerate an immutable CSTP report snapshot from current operational CSTP data while preserving historical report lineage. Regeneration creates a new candidate or snapshot rather than modifying older immutable records.

### Required Inputs

- `reportId`
- `cstpRequestId` or loadable report reference
- `cstpTestId` or loadable report reference
- `workflowTimestamp`
- regeneration reason when future governance requires it
- persistence mode

### Expected Loaded Operational Objects

The handler should load and pass:

- `existingReport`
- `existingSnapshots`
- `cstpRequest`
- `cstpTest`
- `cstpTestSessions`
- `growSessions`
- `source`
- `auditEvents` when available

### Admin Context Requirements

Authenticated admin identity is required. The admin context should include the admin user id and regeneration reason or correlation context.

### Service/Action Handler Called

`regenerateCstpReportAction(input, options)`

### Expected Response Shape

The response should include action name, workflow mode `regenerate`, validation summary, lineage plan summary, regenerated candidate summary or persistence summary, report/snapshot identifiers when available, safe admin-facing message, blocking errors, warnings, and `internalOnly: true`.

### Failure Cases

- missing admin context
- public/anonymous context
- missing existing report or existing snapshots
- missing workflow timestamp
- missing loaded operational data needed for deterministic regeneration
- lineage cycle
- duplicate active lineage
- attempt to overwrite an existing immutable snapshot
- blocking validation or lineage failures
- missing database client when persistence is requested

### Audit Expectations

Future handlers should record admin identity, report id, active snapshot id, regeneration reason, workflow timestamp, lineage validation result, and persistence mode.

## 9. Supersede Report Route

### Internal Route/Action Name

`supersede_cstp_report_for_admin`

### Planned Surface

`POST /internal/admin/cstp/reports/supersede`

### Purpose

Supersede a current immutable report snapshot with a newer immutable snapshot through explicit lineage while retaining all historical evidence.

### Required Inputs

- `reportId`
- target snapshot id or active lineage target
- successor snapshot id or successor candidate reference
- `workflowTimestamp`
- supersession reason
- persistence mode when changes should be persisted

### Expected Loaded Operational Objects

The handler should load and pass:

- `existingReport`
- `existingSnapshots`
- target snapshot record
- successor snapshot record or successor candidate data
- operational CSTP records when a successor candidate must be generated
- `auditEvents` when available

### Admin Context Requirements

Authenticated admin identity is required. Supersession should require a strong admin context because it changes active immutable lineage.

### Service/Action Handler Called

`supersedeCstpReportAction(input, options)`

### Expected Response Shape

The response should include action name, workflow mode `supersede`, target report id, target snapshot id, superseding snapshot or candidate reference, lineage plan summary, validation summary, persistence summary when applicable, safe admin-facing message, errors, warnings, and `internalOnly: true`.

### Failure Cases

- missing admin context or authorization
- public/anonymous context
- missing workflow timestamp
- missing supersession reason when required
- missing target snapshot
- missing successor snapshot or candidate
- self-supersession
- lineage cycle
- duplicate active lineage
- target already superseded unless explicitly allowed by future governance
- destructive mutation or deletion attempt
- missing database client when persistence is requested

### Audit Expectations

Future handlers should record admin identity, supersession reason, report id, target snapshot id, successor reference, workflow timestamp, validation result, and expected lineage changes.

## 10. Inspect Report Lineage Route

### Internal Route/Action Name

`inspect_cstp_report_lineage_for_admin`

### Planned Surface

`GET /internal/admin/cstp/reports/:reportId/lineage`

Callable backend action alternative: `inspect_cstp_report_lineage_for_admin`.

### Purpose

Return an internal read-only lineage view for one immutable CSTP report.

### Required Inputs

- `reportId`
- `workflowTimestamp` if timestamp-sensitive validation is applied

### Expected Loaded Operational Objects

The handler should load and pass:

- `existingReport`
- `existingSnapshots`
- optional `auditEvents` when included in future inspection output

### Admin Context Requirements

Authenticated admin identity is required. Read-only inspection is still internal admin-only.

### Service/Action Handler Called

`inspectCstpReportLineageAction(input, options)`

### Expected Response Shape

The response should include action name, workflow mode `inspect_lineage`, report id, active snapshot summary, snapshot count, duplicate active lineage status, cycle detection status, validation summary, safe admin-facing message, errors, warnings, and `internalOnly: true`.

### Failure Cases

- missing admin authentication or authorization
- public/anonymous context
- missing report id
- missing loaded report or snapshot records
- malformed lineage
- duplicate active lineage when strict inspection requires clean lineage
- attempted repair, mutation, rendering, certification, or public exposure

### Audit Expectations

Future audit handling may log admin identity, report id, inspection timestamp, and whether blocking lineage defects were found.

## 11. Inspect Validation Failures Route

### Internal Route/Action Name

`inspect_cstp_report_validation_for_admin`

### Planned Surface

`POST /internal/admin/cstp/reports/validation`

### Purpose

Return deterministic validation results for supplied workflow inputs, generated candidates, persistence candidates, report records, snapshot records, or lineage records without mutating or persisting data.

### Required Inputs

- validation target type
- loaded validation target payload
- `workflowTimestamp` when target validation is timestamp-sensitive

### Expected Loaded Operational Objects

Depending on target type, the handler may load and pass:

- `cstpRequest`
- `cstpTest`
- `cstpTestSessions`
- `growSessions`
- `source`
- `existingReport`
- `existingSnapshots`
- candidate payload
- lineage plan payload

### Admin Context Requirements

Authenticated admin identity is required. Validation inspection must not be exposed to public callers.

### Service/Action Handler Called

`inspectCstpReportValidationAction(input, options)`

### Expected Response Shape

The response should include action name, workflow mode `inspect_validation`, validation target summary, issue list, validation summary, safe admin-facing message, blocking errors, warnings, and `internalOnly: true`.

### Failure Cases

- missing admin context
- public/anonymous context
- missing validation target
- malformed validation target
- attempt to persist rejected candidate
- attempt to repair, render, certify, or publicly expose report data

### Audit Expectations

Future handlers should be able to log admin identity, validation target type, workflow timestamp, blocking issue count, warning count, and whether the validation was used for a governance decision.

## 12. List Reports By CSTP Request Or Test Route

### Internal Route/Action Name

`list_cstp_reports_for_admin`

### Planned Surface

`GET /internal/admin/cstp/reports?cstpRequestId=:id&cstpTestId=:id`

Callable backend action alternative: `list_cstp_reports_for_admin`.

### Purpose

List internal immutable CSTP report records scoped by CSTP request id, CSTP test id, or both.

### Required Inputs

At least one of:

- `cstpRequestId`
- `cstpTestId`

Also required:

- authenticated admin context
- explicit workflow or inspection timestamp

### Expected Loaded Operational Objects

The handler should load and pass:

- matching `cstp_reports`
- matching `cstp_report_snapshots`
- optional summary fields from `cstp_report_metrics`, `cstp_report_sessions`, or `cstp_report_audit_links` only if future internal list requirements need them

The handler should not load public rendering projections because public report surfaces are deferred.

### Admin Context Requirements

Authenticated admin identity is required. Listing is internal discovery only and must not become public search or public verification.

### Service/Action Handler Called

`listCstpReportsAction(input, options)`

### Expected Response Shape

The response should include action name, workflow mode `list_internal_reports`, request/test scope, result count, internal report rows, active snapshot summaries, validation summary, safe admin-facing message, errors, warnings, and `internalOnly: true`.

### Failure Cases

- missing admin authentication or authorization
- public/anonymous context
- missing both CSTP request id and CSTP test id
- missing loaded report list
- unsupported filters that imply public visibility
- request attempts to include rendering, certification, badge, Source Directory, or Community Grow data

### Audit Expectations

Future handlers may log admin identity, action name, request/test scope, filters, result count, and inspection timestamp.

## 13. Authentication And Authorization Expectations

Future route/action implementation must:

- authenticate the caller before CSTP data loading
- verify the caller is an internal admin authorized for CSTP report operations
- reject anonymous, public, breeder/source portal, Source Directory, Community Grow, or customer-facing contexts
- fail closed if admin authorization cannot be proven
- build `adminContext` from trusted server-side identity, not from untrusted request body fields alone
- preserve admin identity for future audit linkage

RLS and policy changes are deferred. This plan does not define database-level access policies.

## 14. Data Loading Responsibilities

Route/action handlers own data loading. Internal action handlers should receive already-loaded objects.

Write workflow handlers should load:

- `cstp_requests` by request id or through the loaded test relationship
- `cstp_tests` by test id
- `cstp_test_sessions` linked to the CSTP test
- `grow_sessions` linked through CSTP test sessions
- `sources` linked through CSTP request or test
- current `cstp_reports` for the CSTP request/test when lineage exists
- current `cstp_report_snapshots` for existing report lineage
- relevant `cstp_admin_events` or future audit records when available

Read workflow handlers should load:

- report records by report id, CSTP request id, or CSTP test id
- snapshot records by report id
- validation target records explicitly requested by the admin action

Handlers should pass loaded objects into the action layer as:

- `cstpRequest`
- `cstpTest`
- `cstpTestSessions`
- `growSessions`
- `source`
- `existingReport`
- `existingSnapshots`
- `auditEvents`
- `adminContext`
- `workflowTimestamp`
- `dbClient` when persistence is requested

No route should assume UI state. The backend route contract should be complete without relying on client-side data assembly.

## 15. Persistence And Transaction Expectations

Persistence-capable routes should use a caller-owned database client or transaction-compatible client. The route layer should not ask internal CSTP services to create global Supabase clients.

When a transaction helper exists, handlers should execute generation, regeneration, or supersession persistence in a transaction boundary controlled by the route layer. If no transaction helper exists, the handler must treat persistence results as requiring explicit rollback/error handling.

Read-only routes must not persist, repair, delete, or rewrite immutable records.

## 16. Safety Boundaries

The planned route/action layer must not implement:

- public CSTP report pages
- public read APIs
- public verification endpoints
- report rendering
- PDF/export rendering
- certification publication
- badge issuance
- Source Directory integration
- Community Grow integration
- breeder/source portals
- destructive snapshot mutation
- deletion of historical immutable snapshots
- mutation of operational `grow_sessions`
- RLS or public policies

Immutable snapshots remain historical evidence records. Operational CSTP tables and `grow_sessions` remain operational truth.

## 17. Future Implementation Placeholders

The following are deferred placeholders only:

- actual route/action implementation
- `app.js` route registration
- route-level transaction helper integration
- admin UI wiring
- report rendering/export
- PDF generation
- certification publishing
- public verification
- public report explorer
- RLS and policy enforcement

This document does not design those systems beyond naming them as deferred.

## 18. Explicit Non-Goals

This document does not:

- modify backend code
- register routes
- modify `app.js`
- create route handlers
- add UI controls
- modify migrations
- expose CSTP publicly
- implement rendering
- implement certifications
- add automation
- integrate Source Directory
- integrate Community Grow
- add breeder/source portals
- add RLS or public policies

## 19. Final Route Planning Rule

Future protected admin routes/actions may call the internal CSTP admin report action layer only after admin authentication, authorization, operational data loading, explicit timestamp capture, and safety validation have completed.

Any route behavior that exposes public reports, renders report output, publishes certifications, mutates historical snapshots destructively, or bypasses immutable lineage is outside this v1 route plan.
