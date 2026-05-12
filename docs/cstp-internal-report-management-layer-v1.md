# CSTP Internal Report Management Layer v1

## 1. Purpose

This document defines the internal admin-only CSTP report management layer that will safely expose immutable report workflows to future internal admin APIs and tools.

This is implementation-planning documentation only. It does not modify migrations, modify `app.js`, modify APIs/routes, modify UI, implement services/functions, implement rendering, implement certifications, expose CSTP publicly, add automation, add Community Grow integration, add Source Directory integration, add breeder/source portals, or add RLS/public policies.

The management layer sits above the existing internal immutable report modules:

- `immutable-report-orchestrator.js`
- `immutable-report-validator.js`
- `immutable-snapshot-assembler.js`
- `immutable-snapshot-persistence-orchestrator.js`
- `immutable-report-lineage-orchestrator.js`

Its purpose is to define how future admin-only callers should request report preparation, generation, regeneration, supersession, status inspection, lineage inspection, validation inspection, and internal report listing without bypassing immutable evidence safeguards.

## 2. Management Layer Principles

The internal report management layer must follow these principles:

- admin-only access is required for every action
- immutable snapshots are frozen historical evidence records
- operational CSTP tables remain mutable working data
- `grow_sessions` remain canonical operational records and are not mutated by report workflows
- validation must run before persistence
- regeneration creates a new snapshot candidate
- supersession replaces current evidence through lineage, not destructive mutation
- historical report and snapshot evidence must remain retained
- public visibility, rendering, certifications, Source Directory integration, and Community Grow integration are deferred

The management layer is a future internal control surface. It is not a public API, report renderer, certification publisher, badge issuer, or automation scheduler.

## 3. Internal Admin Report Management Responsibilities

### Prepare Report

Prepare report means assemble and validate an immutable snapshot candidate into an internally prepared state.

Responsibilities:

- require a target CSTP request/test context
- require loaded operational data
- require admin context
- require explicit workflow timestamp
- call the unified report orchestrator in `prepare` mode
- return structured validation, assembly, lineage, and persistence summaries
- preserve a prepared snapshot candidate or persisted snapshot record as internal-only evidence

Prepare report does not render a report, publish a certification, or expose public report content.

### Generate Immutable Snapshot

Generate immutable snapshot means produce a frozen report snapshot candidate from supplied operational CSTP data.

Responsibilities:

- require operational inputs for request, test, session links, grow sessions, source, admin context, and audit context when available
- call the unified report orchestrator in `generate` mode
- support persistence-deferred planning for review workflows
- support persistence-enabled execution when a caller-supplied transaction-compatible database client is provided
- return the generated candidate when persistence is deferred
- return inserted row counts when persistence occurs

Generation must not mutate operational CSTP data or `grow_sessions`.

### Regenerate Report

Regenerate report means create a new immutable snapshot candidate from current operational data while preserving prior report lineage.

Responsibilities:

- require an existing report root
- require existing snapshot lineage
- require admin context
- require explicit workflow timestamp
- call the unified report orchestrator in `regenerate` mode
- build a regeneration plan before accepting a successor candidate
- preserve the prior snapshot chain
- require later supersession when replacing active prepared or internally published evidence

Regeneration is not an update to an existing snapshot payload.

### Supersede Report

Supersede report means replace a current prepared or internally published snapshot with a newer immutable snapshot through explicit lineage.

Responsibilities:

- require target snapshot or resolvable active lineage
- require successor candidate or generated successor snapshot
- require admin context
- require explicit supersession timestamp
- call the unified report orchestrator in `supersede` mode
- produce planned predecessor status changes
- preserve predecessor child evidence
- return lineage and audit context summaries

Supersession must not delete, overwrite, or hide historical evidence.

### Inspect Report Status

Inspect report status means return an internal read model for one report root and its current immutable workflow state.

Responsibilities:

- identify report root status
- identify current snapshot pointer when present
- identify latest snapshot version
- identify validation or integrity state when available
- identify whether the report is draft, preparing, prepared, internally published, superseded, archived, or failed through stored status plus audit context
- distinguish report-root coordination state from snapshot evidence state

Status inspection is internal-only and does not imply report visibility.

### Inspect Lineage

Inspect lineage means return an internal view of snapshot history for one report.

Responsibilities:

- list snapshots in stable lineage order
- identify active prepared or internally published snapshot
- identify superseded ancestors
- identify successor links
- detect duplicate active lineage
- detect cycles or invalid successor/predecessor references
- expose lineage validation warnings to admin callers

Lineage inspection must be read-oriented and must not repair data silently.

### Inspect Validation Failures

Inspect validation failures means return deterministic validation results for report workflow inputs, generated candidates, persistence candidates, or lineage plans.

Responsibilities:

- expose validation status, severity, validation code, message, affected table/entity, affected field/key, blocking flag, and metadata
- distinguish blocking integrity failures from warnings and audit-only information
- preserve enough context for internal review
- avoid public-facing wording or certification interpretations

Validation failure inspection must not automatically override or persist rejected candidates.

### List Internal Reports By CSTP Test Or Request

List internal reports means provide internal report discovery scoped to CSTP test or request context.

Responsibilities:

- filter by `cstp_test_id`
- filter by `cstp_request_id`
- optionally filter by internal status
- include current snapshot summary when available
- include latest snapshot version when available
- include validation or lineage warning summaries where useful
- avoid returning public visibility, certification, badge, or rendering fields

The list view is for internal admin workflows only.

## 4. Safe Service Boundaries

The management layer may coordinate existing internal modules. It must not own low-level immutable report logic.

Allowed internal dependencies:

- immutable report validator
- immutable snapshot assembler
- immutable snapshot persistence orchestrator
- immutable report lineage orchestrator
- unified immutable report orchestrator
- future internal CSTP operational data collectors
- future internal admin authorization helpers
- future internal audit event helpers

Prohibited responsibilities:

- public report exposure
- public read APIs
- report rendering
- PDF/export generation
- certification publishing
- badge issuance
- Source Directory integration
- Community Grow integration
- breeder/source portal access
- RLS/public policy design
- mutation of `grow_sessions`
- destructive replacement of frozen snapshot evidence

The management layer should translate future internal admin intent into safe orchestrator calls. It should not bypass validation, lineage planning, or persistence gates.

## 5. Future Internal API Requirements

This section plans future admin-only actions. It does not implement routes.

### `prepareImmutableCstpReport`

Purpose:

- prepare an immutable snapshot for a CSTP report.

Required inputs:

- authenticated admin actor
- `cstp_test_id`
- optional `cstp_request_id`
- optional existing `report_id`
- explicit workflow timestamp
- loaded operational data or an internal data-collection instruction
- audit event or admin context

Expected output:

- `ok`
- workflow mode `prepare`
- validation result
- assembly summary
- lineage summary
- persistence summary when persisted
- generated candidate when persistence is deferred
- blocking errors and warnings

Validation gates:

- admin context required
- CSTP test required
- session links required
- included Grow sessions required
- explicit timestamp required
- candidate validation required before persistence

Failure responses:

- unauthorized admin
- missing operational data
- validation failed
- persistence rejected
- duplicate active lineage detected

Audit expectations:

- create or link an internal admin event for preparation
- preserve actor reference
- preserve workflow timestamp

### `generateImmutableCstpSnapshot`

Purpose:

- generate a frozen snapshot candidate from operational CSTP data.

Required inputs:

- authenticated admin actor
- `cstp_test_id`
- explicit workflow timestamp
- operational request/test/session/grow/source context
- audit context
- optional `persist` flag

Expected output:

- workflow mode `generate`
- generated candidate when persistence is deferred
- inserted row counts when persisted
- validation summary
- immutable safety summary

Validation gates:

- workflow input validation
- snapshot candidate validation
- persistence candidate validation if `persist` is true

Failure responses:

- missing admin context
- missing timestamp
- invalid operational references
- malformed frozen payload
- DB client missing when persistence is requested

Audit expectations:

- event role should represent snapshot generation
- link to admin event when available

### `regenerateImmutableCstpReport`

Purpose:

- create a new snapshot version while preserving existing lineage.

Required inputs:

- authenticated admin actor
- existing `report_id`
- existing snapshot lineage
- `cstp_test_id`
- explicit workflow timestamp
- operational inputs for the new candidate
- reason or internal note reference when available

Expected output:

- workflow mode `regenerate`
- regeneration plan summary
- next snapshot version
- whether supersession is required
- generated candidate when persistence is deferred
- validation summary

Validation gates:

- existing report required
- existing snapshots required
- regeneration eligibility validation
- duplicate active lineage detection
- lineage cycle detection
- candidate validation

Failure responses:

- missing report
- missing lineage
- duplicate active lineage
- archived report rejected
- missing admin context
- candidate validation failed

Audit expectations:

- capture regeneration intent
- preserve actor and explicit timestamp
- record reason when available

### `supersedeImmutableCstpReport`

Purpose:

- replace current internal evidence with a newer snapshot through explicit supersession.

Required inputs:

- authenticated admin actor
- existing `report_id`
- target snapshot id or resolvable active snapshot
- successor snapshot candidate or operational inputs for generated successor
- explicit supersession timestamp
- reason or internal note reference when available

Expected output:

- workflow mode `supersede`
- supersession plan summary
- target snapshot id
- superseding snapshot id
- snapshots to mark superseded
- report state changes needed
- audit context summary
- inserted row counts when persistence occurs

Validation gates:

- admin context required
- timestamp required
- target snapshot required
- successor snapshot required
- no self-supersession
- no cycle
- no duplicate active lineage
- prior snapshot not already superseded unless explicitly allowed

Failure responses:

- target snapshot missing
- successor candidate missing
- self-supersession rejected
- cycle detected
- duplicate active lineage detected
- persistence rejected

Audit expectations:

- event role should represent snapshot supersession
- preserve predecessor and successor references
- preserve actor and timestamp

### `getImmutableCstpReportStatus`

Purpose:

- inspect internal report state.

Required inputs:

- authenticated admin actor
- `report_id` or `cstp_test_id`

Expected output:

- report root summary
- current snapshot summary
- current status
- latest snapshot version
- validation summary if available
- lineage warning summary if available

Validation gates:

- admin authorization
- report/test reference required

Failure responses:

- report not found
- admin unauthorized
- inconsistent report/snapshot relationship

Audit expectations:

- read actions may be audit-light
- privileged review actions may still record an admin event depending on future policy

### `getImmutableCstpReportLineage`

Purpose:

- inspect immutable snapshot history.

Required inputs:

- authenticated admin actor
- `report_id`

Expected output:

- ordered snapshot lineage
- active snapshot id
- supersession chain
- duplicate active lineage status
- cycle detection result
- warnings and blocking issues

Validation gates:

- report required
- admin authorization
- lineage consistency checks

Failure responses:

- report not found
- lineage invalid
- duplicate active snapshots detected
- cycle detected

Audit expectations:

- read-only lineage inspection may not require lifecycle audit event
- unresolved blocking lineage findings should be reviewable by admins

### `getImmutableCstpReportValidationFailures`

Purpose:

- inspect validation failures for a candidate, report, snapshot, lineage, or workflow attempt.

Required inputs:

- authenticated admin actor
- validation target reference
- validation mode or stored workflow attempt reference when available

Expected output:

- validation status
- issue list
- severity counts
- blocking errors
- warnings
- affected entity/table/field/key
- metadata/context

Validation gates:

- admin authorization
- target reference required

Failure responses:

- validation target not found
- unsupported validation target type

Audit expectations:

- validation failure review can be linked to internal admin events when future policy requires it

### `listImmutableCstpReports`

Purpose:

- list internal immutable reports by CSTP test or request.

Required inputs:

- authenticated admin actor
- `cstp_test_id` or `cstp_request_id`
- optional status filters
- pagination controls

Expected output:

- report summaries
- current snapshot summaries
- latest version summaries
- internal status
- validation warning counts when available

Validation gates:

- admin authorization
- at least one scoped filter required
- pagination bounds

Failure responses:

- missing scope
- invalid filter
- admin unauthorized

Audit expectations:

- listing is internal read activity
- future audit policy may decide whether broad exports require explicit events

## 6. Admin Permission Expectations

Every future management-layer action requires:

- authenticated user identity
- verified internal admin authorization
- admin context passed to workflow services
- explicit actor id or admin event id for lifecycle-changing actions
- no anonymous access
- no public access
- no source/breeder self-service access

Permission checks should occur before operational data collection, workflow planning, validation, assembly, persistence, or lineage mutation.

Admin context should include:

- admin user id
- role or permission context where available
- admin event id when available
- request/action reason when available
- explicit workflow timestamp supplied by the caller

This document does not implement RLS, policies, route middleware, or auth helpers.

## 7. Workflow Mapping

Future management actions should map to existing orchestrator modes as follows:

| Management action | Orchestrator mode | Primary internal function |
| --- | --- | --- |
| prepare report | `prepare` | `prepareImmutableReportSnapshot` |
| generate immutable snapshot | `generate` | `generateImmutableReportSnapshot` |
| regenerate report | `regenerate` | `regenerateImmutableReportSnapshot` |
| supersede report | `supersede` | `supersedeImmutableReportSnapshot` |
| inspect status | read-only | future internal read model over report/snapshot records |
| inspect lineage | read-only | lineage resolver and validation helpers |
| inspect validation failures | read-only | validator result inspection |
| list internal reports | read-only | future internal read model scoped by test/request |

Management callers must not directly call low-level persistence helpers unless they are part of a controlled internal workflow. The unified orchestrator should remain the preferred write workflow boundary.

## 8. Safety And Integrity Gates

### Validation Before Persistence

Future management actions must validate:

- workflow inputs
- operational references
- frozen payload shape
- session references
- metric payloads
- timestamps
- lineage expectations
- persistence candidate shape

Persistence must be rejected when validation contains blocking issues.

### Explicit Timestamp Requirement

Lifecycle-changing actions require an explicit timestamp supplied by the caller.

The management layer must not rely on implicit clock reads to:

- generate snapshots
- prepare snapshots
- persist snapshots
- supersede snapshots
- create audit context

### No Destructive Edits

The management layer must not:

- delete prior snapshots
- overwrite frozen payloads
- overwrite frozen metrics
- overwrite frozen session summaries
- remove audit links to hide history
- mutate `grow_sessions`

### Supersession Instead Of Mutation

When current evidence needs correction:

- generate a new snapshot candidate
- validate the successor
- plan supersession
- retain predecessor evidence
- preserve predecessor/successor references
- record audit context

### Immutable History Retention

The management layer must retain:

- generated snapshots
- prepared snapshots
- internally published snapshots
- superseded snapshots
- archived internal snapshots
- failure evidence when already persisted

Historical retention is internal-only and does not grant public visibility.

### Public Systems Deferred

The following remain out of scope:

- public report visibility
- public verification endpoints
- certification qualification
- certification publishing
- badge issuance
- PDF/export rendering
- Source Directory display
- Community Grow linking
- breeder/source portal access

## 9. Failure Response Model

Future internal management responses should be structured and deterministic.

Common response fields:

- `ok`
- `status`
- `action`
- `workflowMode`
- `reportId`
- `snapshotId`
- `validation`
- `blockingErrors`
- `warnings`
- `assemblySummary`
- `lineageSummary`
- `persistenceSummary`
- `auditContext`
- `internalOnly`

Failure statuses should distinguish:

- unauthorized admin
- missing required input
- operational data incomplete
- validation failed
- lineage validation failed
- duplicate active lineage
- persistence validation failed
- persistence failed
- unsupported action

Failure responses should not expose public report content, certification claims, raw private notes, or UI-specific instructions.

## 10. Audit Expectations

Lifecycle-changing actions should be auditable:

- prepare report
- generate snapshot
- regenerate report
- supersede report
- archive report or snapshot in future workflows
- internal publication in future workflows
- validation failure review when future policy requires it

Audit linkage should preserve:

- admin actor id
- admin event id when available
- action type
- report id
- snapshot id
- target snapshot id for supersession
- successor snapshot id for supersession
- explicit action timestamp
- reason or internal note reference when available

Raw admin notes remain internal. Audit linkage does not create public audit exposure.

## 11. Future UI Placeholders

Future UI concepts are deferred placeholders only:

- admin report dashboard
- report review screen
- validation failure panel
- lineage/history view
- regenerate controls
- supersede controls
- internal status filters
- internal report search by CSTP request or test

This document does not design screens, components, routes, copy, or interaction flows.

## 12. Explicit Non-Goals

This document does not implement or define:

- `app.js` changes
- API route implementations
- UI implementation
- database migrations
- service functions
- workers/jobs
- cron systems
- automation
- rendering engine
- PDF/export generation
- public report visibility
- public read policies
- RLS policies
- certification qualification logic
- certification publishing
- badge systems
- Source Directory integration
- Community Grow integration
- breeder/source portal access
- moderation systems

## 13. Final Management Rule

The CSTP internal report management layer exists to make immutable report workflows safe for future admin tools.

It should translate admin intent into controlled orchestration, require validation before persistence, preserve lineage, retain historical evidence, and avoid all public/report-rendering/certification behavior until those systems are deliberately designed later.
