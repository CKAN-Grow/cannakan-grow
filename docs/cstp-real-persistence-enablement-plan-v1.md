# CSTP Real Persistence Enablement Plan v1

## 1. Purpose

This document defines the safest step-by-step plan for moving internal CSTP immutable report workflows from mock/deferred mode to real internal Supabase persistence.

This is implementation-planning documentation only. It does not modify `app.js`, UI, migrations, route wiring, persistence behavior, rendering/export systems, certifications, public CSTP exposure, Source Directory integration, Community Grow integration, breeder/source portals, RLS, or public policies.

The plan assumes the existing internal stack remains authoritative:

- Protected admin route/action handlers load or receive data.
- Internal admin actions enforce callable action contracts.
- The admin management service enforces admin workflow boundaries.
- The immutable report orchestrator coordinates validation, assembly, lineage, and optional persistence.
- The immutable snapshot persistence orchestrator maps validated candidates into immutable report tables using a caller-supplied database client.
- Operational CSTP tables and `grow_sessions` remain canonical operational truth.
- Immutable report records are frozen historical evidence records, not operational truth.

## 2. Real Persistence Enablement Scope

### Prepare Report

`prepare` should remain non-persistent by default. It may continue to assemble and validate an immutable snapshot candidate without inserting report or snapshot records.

Preparation persistence is deferred unless a future internal admin workflow needs a durable preparation record. If durable preparation is enabled later, it must use the same validation, transaction, and audit gates as generation.

### Generate Report

`generate` is the first workflow eligible for real persistence. It may persist:

- one `cstp_reports` root record when a report does not already exist
- one `cstp_report_snapshots` record
- zero or more `cstp_report_metrics` records
- zero or more `cstp_report_sessions` records
- zero or more `cstp_report_audit_links` records

Generation must only persist after operational data loading, candidate assembly, validation, and table/column mapping checks pass.

### Regenerate Report

`regenerate` should create a follow-up immutable snapshot for an existing internal report lineage. It must not overwrite the prior snapshot payload, metrics, sessions, or audit links.

Regeneration persistence is enabled only after Generate Report persistence has been validated locally and after real lineage reads are enabled.

### Supersede Report

`supersede` must preserve historical records and mark lineage transitions instead of destructively replacing snapshots.

Supersession persistence requires a transaction boundary that can atomically create the successor snapshot and apply lineage state changes required by the schema and service plan. No old snapshot may be deleted.

### Inspect Lineage

`inspect_lineage` should move from mock lineage data to reads from `cstp_reports` and `cstp_report_snapshots`.

Lineage inspection must remain read-only. It may report active lineage, duplicate active lineage, superseded counts, cycle detection, and continuity status.

### Inspect Validation

`inspect_validation` may validate real loaded report records, snapshot records, candidate payloads, and child evidence rows.

Validation inspection remains read-only. It should not repair, mutate, regenerate, publish, or supersede records.

## 3. Required Data-Loading Responsibilities

Route/action handlers are responsible for loading required records before invoking the internal admin action layer. Lower service layers should continue to accept already-loaded objects and caller-supplied dependencies.

### Admin Context

Handlers must establish authenticated internal admin context before data loading. Required context includes:

- admin user id or actor id
- authorization evidence from the internal admin guard
- action name or workflow mode
- workflow timestamp for write or validation-sensitive workflows
- optional request/correlation id for diagnostics

Anonymous, public, or missing admin context must be rejected before operational or immutable report data is loaded.

### Operational CSTP Inputs

For prepare, generate, regenerate, and supersede, handlers should load:

- `cstp_requests`: intake/request traceability for the test when available
- `cstp_tests`: authoritative CSTP test identity and source linkage
- `cstp_test_sessions`: authoritative CSTP-to-Grow session relationships
- `grow_sessions`: canonical Grow session records referenced by CSTP test sessions
- `sources`: source identity and metadata at generation time
- `cstp_admin_events`: optional audit references available to link to the generated report/snapshot

Loading must verify that each loaded record belongs to the requested CSTP request/test lineage. A handler must not assemble a snapshot from mixed request, test, source, or session records.

`grow_sessions` must never be mutated, copied into operational replacement records, or treated as report truth. Snapshot payloads may freeze summaries and references for evidence.

### Immutable Report Inputs

For real persisted workflows, handlers should load:

- `cstp_reports`: existing report root for the CSTP test/request when available
- `cstp_report_snapshots`: existing snapshot lineage ordered deterministically
- `cstp_report_metrics`: frozen metric evidence when validation or detail inspection needs it
- `cstp_report_sessions`: frozen session evidence when validation or detail inspection needs it
- `cstp_report_audit_links`: internal audit traceability for report/snapshot workflows

Regenerate and supersede must load the existing report and complete snapshot lineage before planning any successor snapshot.

### Loading Rules

- Handlers own Supabase read queries and authorization checks.
- Handlers must pass loaded objects into `admin-report-actions`, not bypass it.
- The admin action layer must continue delegating to `admin-report-management-service`.
- The management service must continue delegating workflow execution to `immutable-report-orchestrator`.
- Persistence must continue through `immutable-snapshot-persistence-orchestrator`.
- UI components must not query immutable report tables directly.
- No public or anonymous loading path is allowed.

## 4. Transaction Expectations

Real persistence must be transaction-oriented even if the first implementation uses an existing Supabase-compatible transaction helper or a caller-managed rollback boundary.

### Atomic Persistence

The following Generate Report persistence steps should be atomic:

1. Insert `cstp_reports` if no report root exists.
2. Insert `cstp_report_snapshots`.
3. Insert `cstp_report_metrics`.
4. Insert `cstp_report_sessions`.
5. Insert `cstp_report_audit_links`.
6. Update report root linkage only if a future mapping requires `current_snapshot_id` to point to the newly persisted snapshot.

If any required step fails, the workflow should roll back all inserted rows for that attempt.

### No Orphans

Persistence must not leave:

- snapshot rows without a valid report root
- metric rows without a valid snapshot
- session rows without a valid snapshot and operational session references
- audit links without a valid report or actor/event reference
- report roots that imply a generated snapshot when snapshot insertion failed

### No Destructive Edits

Real persistence must not delete prior reports, snapshots, metrics, sessions, audit links, CSTP operational records, or `grow_sessions`.

Corrections must be represented by regeneration or supersession lineage, not destructive replacement.

### Supersession Transaction Boundary

Supersession requires one transaction boundary that can cover:

- validation of the target report and target snapshot lineage
- insertion of the superseding snapshot and child evidence rows when applicable
- lineage pointer/state changes required to mark the old snapshot superseded
- report state/current snapshot changes when applicable
- audit link creation for the supersession action

If the successor snapshot cannot be persisted, the existing lineage must remain unchanged.

## 5. Persistence Rollout Phases

### Phase 1: Read Real Operational CSTP Data, Persistence Deferred

Replace mock operational payloads with protected server-side reads for `cstp_requests`, `cstp_tests`, `cstp_test_sessions`, `grow_sessions`, `sources`, and relevant admin/audit context.

Keep `persist: false`. Validate that prepare, generate, regenerate, supersede, lineage inspection, and validation inspection still return structured internal results using real operational inputs.

Exit criteria:

- admin-only route guards remain active
- loaded operational records are complete and internally consistent
- candidate assembly remains deterministic
- no immutable report tables are written
- smoke checks pass with mock and real-read/deferred modes

### Phase 2: Persist Generate Report Only

Enable real persistence for Generate Report behind an internal-only guard or configuration switch.

Prepare remains non-persistent. Regenerate and supersede remain deferred. Inspect Lineage may still use mock lineage until Phase 3.

Exit criteria:

- table/column mapping is confirmed against `20260512032053_cstp_immutable_snapshots_v1.sql`
- `buildImmutablePersistencePlan` output matches the insert plan
- inserts run inside the chosen transaction boundary
- validation must pass before insertion
- inserted row counts match the persistence plan
- rollback is verified for simulated insert failures

### Phase 3: Read Persisted Lineage And Validation Records

Move Inspect Lineage and Inspect Validation to real internal reads from immutable report tables.

This phase is read-only. It should validate persisted rows and lineage shape without creating new snapshots or mutating status fields.

Exit criteria:

- lineage reads return deterministic ordering
- duplicate active lineage and cycle checks operate on real persisted rows
- validation inspection can inspect report, snapshot, metric, session, and audit link records
- no public access or rendering behavior is added

### Phase 4: Persist Regenerate

Enable persisted regeneration after Generate Report and real lineage reads are stable.

Regeneration must create a new immutable snapshot version and preserve all prior snapshot records.

Exit criteria:

- existing report and full snapshot lineage are loaded before planning
- next snapshot version is deterministic
- prior snapshots are not overwritten or deleted
- rollback preserves the prior lineage when successor persistence fails
- validation and lineage planning pass before persistence

### Phase 5: Persist Supersede

Enable persisted supersession after regeneration persistence and lineage inspection are proven stable.

Supersession must preserve history and apply lineage transitions only through the validated supersession plan.

Exit criteria:

- no self-supersession is possible
- duplicate active lineage is rejected
- lineage cycles are rejected
- already-superseded targets are rejected unless a future explicit option permits them
- old snapshot evidence remains retained
- successor persistence and lineage state changes are atomic

### Phase 6: Remove Mock-Only Assumptions

Retire mock-only dashboard assumptions after real reads and real writes are stable for all enabled internal workflows.

This phase must not remove useful in-memory smoke tests. Mock clients and fixtures should remain available for deterministic service verification.

Exit criteria:

- dashboard result states identify real/deferred modes accurately
- internal route handlers no longer rely on mock payloads for normal operation
- smoke tests continue covering pure services and mock persistence behavior
- no public, certification, rendering, or integration systems are introduced

## 6. Safety Gates Before Live Persistence

Live persistence must not be enabled until all applicable gates pass:

- Authenticated internal admin access is required.
- Anonymous and public contexts are rejected before data loading.
- Admin user id or actor id is present.
- Explicit workflow timestamp is supplied by the caller.
- Operational CSTP records are complete and belong to the same request/test/source lineage.
- `grow_sessions` referenced by `cstp_test_sessions` are present.
- Source metadata is loaded when required by workflow validation.
- Immutable candidate validation passes with no blocking issues.
- Persistence candidate shape validation passes.
- Table/column mapping is verified against the migration.
- Insert order and foreign key dependencies are confirmed locally.
- Transaction/rollback behavior is validated locally.
- Mock client smoke checks pass.
- Existing immutable/admin smoke checks pass.
- `git diff --check` passes before merging implementation work.
- A guarded internal-only switch or environment flag is available if production rollout needs staged enablement.

## 7. Failure And Rollback Behavior

### Validation Failures

Blocking validation failures must stop persistence before any insert begins. The response should include validation codes, severity, affected entity/table, affected field/key, and a safe internal admin message.

Warnings may be returned with successful validation only when the validator marks them non-blocking.

### Insert Failures

Insert failures must return a structured persistence result with:

- failed step
- target table
- attempted record count
- Supabase or database error details safe for internal diagnostics
- inserted row counts up to the failure when available
- rollback status or caller-transaction requirement

When a transaction boundary exists, all rows from the failed workflow attempt must be rolled back.

### Lineage Conflicts

Lineage conflicts must block regenerate and supersede before persistence. Blocking conflicts include:

- duplicate active lineage
- lineage cycle
- missing target report
- missing target snapshot
- target snapshot from a different report
- self-supersession
- superseding an already superseded snapshot unless explicitly allowed by a future internal option

### Missing Operational Data

Missing CSTP request/test/session/source/grow session records must reject write workflows. Handlers must not fill missing operational evidence with invented defaults.

### Timestamp Inconsistency

Invalid or inconsistent timestamps must block persistence. Generated, prepared, published, superseded, and persistence timestamps must preserve database constraint ordering and service-level lifecycle expectations.

### Supabase Errors

Supabase errors must be captured as internal diagnostics and returned through safe structured admin results. They must not expose public report state, certification claims, or raw sensitive operational notes.

## 8. Audit And Observability Expectations

Each real persistence workflow should produce internal audit and observability context sufficient for later investigation.

Required fields should include:

- admin actor id
- admin role or authorization evidence when available
- action name
- workflow mode
- CSTP request id
- CSTP test id
- source id when available
- report id and snapshot id when available
- validation summary
- persistence result summary
- lineage result summary for regenerate/supersede/inspect lineage
- workflow timestamp
- persistence timestamp
- correlation id or request id when available
- safe internal diagnostics for failures

Audit links should use `cstp_report_audit_links` only for internal traceability. They do not create public audit exposure, public report verification, certification history, or Source Directory indicators.

## 9. Table Mapping Confirmation Checklist

Before enabling each write workflow, confirm the persistence plan only writes columns that exist in the immutable migration.

Expected table mapping:

- `cstp_reports`: report root, CSTP request/test/source references, status, lifecycle timestamps, admin references, current snapshot linkage when safely available
- `cstp_report_snapshots`: report reference, CSTP request/test/source references, version, status, locked flag, frozen report payload, schema/methodology versions, lifecycle timestamps, supersession pointers, admin references
- `cstp_report_metrics`: frozen metric key/type/unit/value/payload, calculation metadata, observation window, report/snapshot/test references
- `cstp_report_sessions`: frozen CSTP test-session and Grow session references, inclusion state, archived relationship flag, frozen session summary
- `cstp_report_audit_links`: report/snapshot references, CSTP admin event reference when available, event role, admin actor reference

No mapping may add public visibility, certification, badge, rendering, media, Source Directory, Community Grow, or public verification columns.

## 10. Explicit Non-Goals

This plan does not implement or define:

- public reports
- public CSTP pages
- certification publishing
- certification qualification logic
- badge issuance
- rendering/export
- PDF generation
- Source Directory integration
- Community Grow integration
- breeder/source portals
- public verification endpoints
- RLS or public policy changes
- UI implementation
- persistence wiring changes
- migration changes
- automation or cron systems

## 11. Validation Checklist For Future Implementation

Before any future code change enables real persistence, run the available checks for that implementation slice:

- syntax checks for changed backend files
- immutable service smoke checks
- admin action/route smoke checks
- mock persistence insert-plan checks
- local transaction validation when available
- `npm run build` when safe
- `git diff --check`

Successful validation of this planning document only confirms that the plan exists and is structurally reviewable. It does not enable real persistence.
