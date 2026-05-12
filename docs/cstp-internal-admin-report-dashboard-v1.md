# CSTP Internal Admin Report Dashboard v1

## 1. Purpose

This document defines the first internal-only CSTP admin report management UI/dashboard layer for operating immutable CSTP report workflows.

This is UI/UX and implementation-planning documentation only. It does not modify `app.js`, implement UI, implement rendering/export, implement certifications, expose CSTP publicly, add public report pages, add automation, integrate Source Directory, integrate Community Grow, add breeder/source portals, add RLS/public policies, or modify immutable backend orchestration logic.

The dashboard should provide operational admin tooling for prepared immutable reports, validation failures, lineage review, regeneration, and supersession. It is not a public report viewer, not a certification portal, not a breeder/source portal, and not a public verification surface.

## 2. Scope

The v1 dashboard scope is internal admin report management over immutable CSTP report records.

In scope:

- internal report queue visibility
- immutable report status inspection
- snapshot metadata inspection
- validation failure review
- lineage/history review
- controlled admin actions through protected internal handlers
- operational CSTP request/test/session linkage context
- audit activity visibility

Out of scope:

- public report pages
- report rendering/export
- PDF generation
- certification issuance
- badge issuance
- Source Directory publishing
- Community Grow integration
- breeder/source portal access
- RLS or public policy implementation

## 3. Dashboard Placement

The dashboard should align with existing CSTP admin tooling patterns and remain inside the protected admin experience. Existing CSTP admin areas already distinguish request management, test management, and session linkage; the report dashboard should extend that operational pattern rather than becoming a marketing, public trust, or certification surface.

Expected placement:

- admin-only CSTP report workspace
- reachable from internal admin navigation only
- compatible with existing `#admin/cstp-report` style routing when UI implementation occurs
- visually and behaviorally consistent with existing CSTP admin queue/detail pages

No UI wiring is implemented by this document.

## 4. Core Dashboard Sections

### Report Queue

The report queue should list internal immutable CSTP reports by CSTP request, CSTP test, status, created time, prepared time, and active snapshot state.

Primary admin use:

- find reports needing preparation or review
- filter by request/test context
- identify reports blocked by validation
- open report detail inspector

### Draft And Prepared Reports

This section should separate reports that are not yet internally published or superseded.

It should show:

- draft reports
- preparing reports
- prepared reports
- generated candidates when represented by backend responses
- last validation state
- available next action

### Validation Failures

This section should surface blocking validation failures and warning states from the internal validator/action response model.

It should show:

- validation status
- severity
- validation code
- affected table/entity
- affected field/key
- blocking flag
- admin-facing message
- metadata/context summary

Validation review must not silently override or persist rejected candidates.

### Regeneration Queue

This section should identify reports that require regeneration because operational data changed, prior assembly failed, or an admin intentionally requests a new immutable snapshot.

It should show:

- current active snapshot
- next expected snapshot version
- regeneration eligibility state
- reason required by future governance
- validation status before regeneration

### Superseded Reports

This section should list reports and snapshots no longer active because they have been superseded.

It should show:

- superseded snapshot id
- superseding snapshot id
- superseded timestamp
- supersession reason when available
- admin actor/audit context when available
- historical status

Superseded records remain historical evidence and should not be hidden as if deleted.

### Lineage And History Viewer

The lineage viewer should show the immutable snapshot chain for one report.

It should show:

- report id
- active snapshot id
- snapshot versions in stable order
- supersedes/superseded-by relationships
- active-lineage conflicts
- lineage cycle warnings
- archived/internal failed states
- audit references

### Report Detail Inspector

The detail inspector is the main review surface for one report and its current snapshot.

It should show:

- report status
- snapshot status
- snapshot version
- CSTP request/test references
- source reference
- session linkage summary
- frozen metrics summary
- frozen session summary metadata
- prepared/published/internal timestamps
- created/updated timestamps
- validation summary
- lineage summary
- audit activity

### Immutable Snapshot Metadata

This section should expose internal frozen evidence metadata without rendering a public report.

It should show:

- snapshot id
- report id
- version
- status
- generated/prepared/published timestamps
- frozen metric payload presence
- frozen session summary payload presence
- operational reference map presence
- created by/prepared by references where available
- supersedes/superseded-by links

### Operational CSTP Linkage

This section should connect the immutable report to mutable operational CSTP data without treating live operational values as the report output.

It should show:

- CSTP request id and status
- CSTP test id and status
- linked CSTP test sessions
- linked grow session ids
- source id/name
- audit event references

The UI should clearly communicate that operational records remain working data while snapshots are frozen evidence.

### Audit Activity Panel

The audit panel should show admin traceability for report workflows.

It should show:

- action name
- admin actor
- timestamp
- validation result
- persistence result when applicable
- lineage change summary
- audit link references

## 5. Report Detail Screen Expectations

The report detail screen should provide a complete internal review surface for one immutable report lineage.

Required detail areas:

- immutable report status
- current snapshot status
- snapshot version
- lineage relationships
- validation results
- operational CSTP references
- session linkage summaries
- supersession history
- audit activity
- available admin actions

The screen should prioritize review clarity over decorative presentation. It should help admins answer:

- Is this report valid?
- Which operational records generated it?
- Which snapshot is active?
- Has this report been superseded?
- What validation failures block workflow progress?
- What action is safe next?

## 6. Planned Admin Actions

Dashboard actions should call protected internal admin report handlers only. They must not call public endpoints or client-only mutation logic.

Planned actions:

- prepare report via `prepare_cstp_report_for_admin`
- generate report via `generate_cstp_report_for_admin`
- regenerate report via `regenerate_cstp_report_for_admin`
- supersede report via `supersede_cstp_report_for_admin`
- inspect lineage via `inspect_cstp_report_lineage_for_admin`
- inspect validation failures via `inspect_cstp_report_validation_for_admin`
- list reports via `list_cstp_reports_for_admin`

Action buttons should be enabled only when the current report state and validation state make the action meaningful. Destructive edit controls should not exist.

## 7. Action UX Rules

Prepare report:

- available when operational CSTP records are complete enough for snapshot preparation
- should show validation before persistence when possible
- should display candidate or persistence summary

Generate report:

- available when operational records are complete
- should show whether persistence is deferred or executed
- should surface inserted row counts when persistence runs

Regenerate report:

- available only when an existing report lineage exists
- should require explicit admin intent/reason when future governance requires it
- should show next snapshot version and supersession implications

Supersede report:

- available only when there is a valid target and successor
- should require clear confirmation language
- should show that historical records are retained

Inspect lineage:

- read-only
- should show active-lineage conflicts and cycle warnings
- should not repair lineage automatically

Inspect validation failures:

- read-only
- should show issue severity, code, entity/table, field/key, message, and metadata
- should not persist rejected candidates

## 8. UI/UX Expectations

The dashboard should feel like operational admin software: dense enough for repeated work, calm enough for careful review, and explicit about irreversible history.

Expected UX traits:

- efficient queue scanning
- status filters by draft/preparing/prepared/integrity failed/internal published/superseded/archived
- visible validation summaries
- clear lineage visualization
- immutable-state indicators
- failure-state callouts
- audit trace visibility
- disabled action states with concise reasons
- confirmation steps for supersession
- clear separation between live operational data and frozen snapshot data

The UI should avoid public-report language such as "publish publicly", "certify", "badge", or "share" until those systems are deliberately designed later.

## 9. Safety Boundaries

The dashboard must preserve immutable report safety:

- no public visibility controls
- no certification publishing
- no public verification
- no public report pages
- no report rendering/export
- no PDF generation
- no destructive snapshot edits
- no deletion of historical snapshots
- no mutation of frozen payloads
- no mutation of operational `grow_sessions`
- supersession instead of mutation
- immutable history preservation

Any correction workflow should create a new snapshot or supersession plan through internal handlers, not edit existing evidence records.

## 10. Failure-State Handling

The dashboard should make failure states actionable without bypassing integrity gates.

Failure states should show:

- blocking validation count
- warning count
- top validation codes
- affected entities and fields
- missing operational references
- malformed payload indicators
- duplicate active lineage warnings
- timestamp ordering problems
- persistence rejection summaries

The UI should allow admins to inspect failures and retry after operational data is corrected. It should not allow force-persisting invalid snapshots.

## 11. Lineage Visualization Expectations

Lineage visualization should make immutable history understandable at a glance.

The first version can use a compact ordered list or timeline. It should show:

- snapshot version
- snapshot id
- status
- generated/prepared/published timestamps
- supersedes link
- superseded-by link
- active marker
- integrity failure marker
- archived/internal marker

The viewer should highlight duplicate active lineage and cycles as blocking governance issues.

## 12. Data And API Expectations

The dashboard should use protected internal admin report route/action handlers only.

Expected backend surfaces:

- `/api/cstp-admin-reports-list`
- `/api/cstp-admin-report-prepare`
- `/api/cstp-admin-report-generate`
- `/api/cstp-admin-report-regenerate`
- `/api/cstp-admin-report-supersede`
- `/api/cstp-admin-report-lineage`
- `/api/cstp-admin-report-validation`

The UI should send authenticated admin requests and rely on server-side authorization. It should not assemble privileged data from public routes.

## 13. Future Deferred Placeholders

Deferred systems:

- report rendering/export
- PDF generation
- certification issuance
- badge issuance
- public report pages
- public verification endpoints
- Source Directory integration
- Community Grow integration

These placeholders are named only so the dashboard does not accidentally pre-design them.

## 14. Explicit Non-Goals

This document does not define or implement:

- UI code
- route registration
- `app.js` changes
- backend orchestration changes
- database migrations
- rendering/export engine
- certification logic
- public access
- Source Directory publishing
- Community Grow linking
- breeder/source portal access
- RLS or public policies

## 15. Final Dashboard Rule

The CSTP internal admin report dashboard should help admins operate immutable CSTP report workflows safely: review operational linkage, inspect frozen evidence, understand validation failures, preserve lineage, and call protected internal admin handlers.

It must not become a public report viewer, certification portal, rendering engine, or destructive snapshot editor.
