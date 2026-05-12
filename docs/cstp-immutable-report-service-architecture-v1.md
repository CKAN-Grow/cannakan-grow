# CSTP Immutable Report Service Architecture v1

## 1. Purpose

This document defines the internal service-layer architecture for generating, validating, persisting, superseding, and managing immutable CSTP report snapshots.

This is implementation-planning documentation only. It does not modify migrations, modify `app.js`, modify APIs/routes, modify UI, implement services/functions, implement rendering, implement certifications, expose CSTP publicly, add automation, add Community Grow integration, add Source Directory integration, add breeder/source portals, or add RLS/public policies.

The service architecture described here is an internal backend design contract. It defines conceptual modules, ownership boundaries, validation checkpoints, failure handling, and immutable persistence expectations for future implementation.

## 2. Architectural Principles

Immutable CSTP report services must follow these principles:

- operational CSTP tables remain mutable working data
- `grow_sessions` remain canonical Grow session records
- report snapshots preserve historical evidence
- generated snapshot evidence is never rewritten to follow live operational changes
- corrections use regeneration and supersession
- persistence is transactional and auditable
- public exposure remains deferred

Services may coordinate immutable report workflow. They must not become public APIs, UI controllers, report renderers, certification engines, or automation schedulers.

## 3. Service Architecture Layers

The internal service architecture is composed of conceptual modules:

- report preparation orchestrator
- operational data collector
- metric calculation engine
- snapshot assembler
- integrity validator
- immutable persistence manager
- supersession manager
- lineage resolver
- publication preparation coordinator
- audit linkage coordinator

Each module should have a narrow responsibility. Modules may be implemented as functions, classes, files, or service objects later, but this document does not prescribe code shape or implement them.

## 4. Module Responsibilities And Boundaries

### Report Preparation Orchestrator

Authoritative responsibilities:

- coordinate the full internal report preparation flow
- accept a target CSTP test context from a future internal caller
- resolve or request creation of the report root
- invoke collection, assembly, validation, persistence, lineage, and audit modules in order
- enforce lifecycle state expectations from the report lifecycle state machine
- return a structured internal result to the future caller

Prohibited responsibilities:

- calculating metrics directly
- writing snapshot child rows directly
- rendering reports
- publishing public reports
- certifying sources
- mutating `grow_sessions`

Ownership boundary:

The orchestrator owns flow control, not domain calculations or persistence details.

Deterministic expectation:

For the same request, same operational state, and same calculation version, the orchestrator should choose the same service path and validation sequence.

Immutability expectation:

The orchestrator must never request in-place mutation of generated snapshot evidence.

### Operational Data Collector

Authoritative responsibilities:

- read bounded operational data for one CSTP test
- collect `cstp_tests`, linked `cstp_requests`, linked `sources`, `cstp_test_sessions`, linked `grow_sessions`, relevant `cstp_admin_events`, and admin actor context
- normalize collected rows into an internal read model
- preserve enough identifiers for traceability

Prohibited responsibilities:

- calculating report metrics
- deciding publication readiness
- mutating operational rows
- filtering data for public display
- copying full Grow session records into CSTP-owned session models

Ownership boundary:

The collector owns operational read boundaries and row shape normalization.

Deterministic expectation:

The collector must use stable query scopes and stable ordering rules, especially for session relationships.

Immutability expectation:

Collected data is input to a new snapshot candidate only. It must not be used to rewrite an existing snapshot.

### Metric Calculation Engine

Authoritative responsibilities:

- calculate reportable metrics from the collected read model
- apply approved CSTP methodology and calculation version rules
- produce stable metric keys
- preserve numerator and denominator values where applicable
- distinguish missing data from zero values
- define precision and rounding behavior for frozen metric storage

Prohibited responsibilities:

- reading directly from the database outside the provided read model
- persisting metrics
- rendering display text
- determining certification qualification
- mutating snapshots

Ownership boundary:

The metric engine owns calculation logic and calculation-version semantics.

Deterministic expectation:

Given identical normalized inputs and calculation version, the engine must produce identical metric outputs.

Immutability expectation:

Metric corrections require a new snapshot version. The engine must not recalculate stored metrics in place.

### Snapshot Assembler

Authoritative responsibilities:

- convert collected operational data and calculated metrics into a snapshot candidate
- assemble the report-level frozen payload
- assemble session summary payloads
- assemble metric payloads and child-row candidates
- assemble environmental metadata payloads when available
- assemble audit linkage candidates

Prohibited responsibilities:

- writing to the database
- bypassing integrity validation
- choosing public report copy
- deriving certification outcomes
- mutating source operational records

Ownership boundary:

The assembler owns candidate construction, not persistence or lifecycle transition authority.

Deterministic expectation:

The same collected data and metric outputs must assemble into the same payload structure for the same report schema version.

Immutability expectation:

The assembler produces a new candidate. It must not patch an existing snapshot payload.

### Integrity Validator

Authoritative responsibilities:

- validate operational completeness
- validate metric consistency
- validate timestamp ordering
- validate lineage and version expectations
- validate snapshot uniqueness
- validate supersession integrity
- validate publication readiness when requested
- return structured rejection reasons

Prohibited responsibilities:

- fixing data silently
- persisting snapshots
- rendering validation messages for public users
- mutating lifecycle state directly
- waiving required integrity checks without a documented internal exception path

Ownership boundary:

The validator owns go/no-go decisions for persistence and lifecycle advancement.

Deterministic expectation:

The same candidate and same validation mode must produce the same validation result.

Immutability expectation:

Validation failure must prevent new persistence or require a later supersession path. It must not edit old evidence.

### Immutable Persistence Manager

Authoritative responsibilities:

- persist snapshot rows and child evidence rows transactionally
- write `cstp_report_snapshots`
- write `cstp_report_metrics`
- write `cstp_report_sessions`
- write `cstp_report_audit_links` where provided
- update report-root coordination fields only after child evidence is valid
- ensure atomic success or rollback

Prohibited responsibilities:

- calculating metrics
- collecting operational data
- deciding public visibility
- deleting historical evidence as normal flow
- mutating `grow_sessions`

Ownership boundary:

The persistence manager owns database writes for immutable report infrastructure.

Deterministic expectation:

Given a validated candidate and the same persistence preconditions, writes should produce the expected row set and lineage references exactly once.

Immutability expectation:

Persistence must favor inserts and lineage updates over destructive replacement.

### Supersession Manager

Authoritative responsibilities:

- determine whether a new snapshot supersedes a prior snapshot
- validate supersession eligibility
- coordinate prior and successor lineage references
- ensure old snapshot evidence remains retained
- prevent supersession cycles

Prohibited responsibilities:

- recalculating metrics
- deleting prior snapshot evidence
- publishing public corrections
- using supersession to hide failed integrity checks

Ownership boundary:

The supersession manager owns replacement semantics and correction lineage.

Deterministic expectation:

For a given report root and selected predecessor, supersession rules must produce one valid lineage path.

Immutability expectation:

Supersession must preserve old evidence and create or select a new successor. It must not mutate prior frozen payloads.

### Lineage Resolver

Authoritative responsibilities:

- resolve current report lineage
- identify current prepared or internally published snapshot
- identify superseded ancestors and successors
- validate version monotonicity
- support duplicate active lineage detection

Prohibited responsibilities:

- changing lineage by itself
- calculating metrics
- rendering timeline output
- deciding certification history

Ownership boundary:

The lineage resolver owns lineage read models and lineage consistency checks.

Deterministic expectation:

Given the same persisted report/snapshot rows, the resolver must identify the same active lineage and historical chain.

Immutability expectation:

Lineage resolution is read-oriented. It must not rewrite old evidence.

### Publication Preparation Coordinator

Authoritative responsibilities:

- coordinate internal movement from prepared evidence to internally published evidence
- verify publication readiness requirements
- ensure `prepared_at` and `published_at` expectations are met
- coordinate locking semantics where schema supports them
- coordinate audit linkage for internal publication

Prohibited responsibilities:

- exposing public reports
- generating PDFs
- publishing certifications
- creating badge states
- bypassing integrity validation

Ownership boundary:

The publication preparation coordinator owns internal publication readiness, not public distribution.

Deterministic expectation:

The same prepared snapshot and same validation context must produce the same readiness decision.

Immutability expectation:

After internal publication, corrections must route through supersession.

### Audit Linkage Coordinator

Authoritative responsibilities:

- identify relevant `cstp_admin_events`
- create audit linkage candidates for report and snapshot lifecycle actions
- preserve actor context when available
- ensure validation failures, generation, preparation, internal publication, supersession, and archival are traceable

Prohibited responsibilities:

- exposing raw admin notes publicly
- deciding metric correctness
- mutating operational audit events
- replacing lifecycle validation

Ownership boundary:

The audit linkage coordinator owns report/snapshot audit traceability.

Deterministic expectation:

For a given lifecycle action and actor/event context, audit linkage should produce a stable event role and target references.

Immutability expectation:

Audit links should be append-oriented and should not be removed to hide historical actions.

## 5. Service Interaction Flow

The intended orchestration order is:

1. report preparation orchestrator receives a future internal preparation request
2. lineage resolver identifies current report and snapshot lineage
3. operational data collector reads bounded operational inputs
4. metric calculation engine calculates deterministic metrics
5. snapshot assembler builds a snapshot candidate
6. integrity validator checks operational completeness, metrics, timestamps, uniqueness, lineage, and supersession rules
7. audit linkage coordinator attaches generation or rejection audit context
8. immutable persistence manager writes the validated snapshot candidate transactionally
9. supersession manager coordinates prior/successor lineage when applicable
10. publication preparation coordinator moves a validated snapshot to prepared or internally published state when requested
11. audit linkage coordinator records final lifecycle action links

Validation checkpoints should occur:

- before metric calculation when operational inputs are incomplete
- after metric calculation before payload assembly is considered valid
- before persistence
- before supersession linkage
- before publication preparation

Persistence checkpoints should occur:

- only after integrity validation passes
- only inside a transaction
- only with a clear previous stable state
- only with rollback behavior defined

Failure handling boundaries:

- input collection failures return operational completeness errors
- calculation failures return metric consistency errors
- validation failures return integrity rejection reasons
- persistence failures roll back all writes
- supersession failures roll back lineage changes
- publication readiness failures preserve the prepared or previous stable state

## 6. Immutable Persistence Expectations

### Transactional Expectations

Snapshot persistence must be atomic.

Future implementation should treat these writes as one logical transaction:

- snapshot row
- metric rows
- session rows
- audit links
- report root current snapshot/status updates
- supersession lineage updates

If any required write fails, all writes in the assembly attempt should roll back.

### Atomic Persistence Philosophy

A snapshot is useful only when its core evidence is complete.

The service layer must avoid:

- half-created snapshots
- orphan metric rows
- orphan session rows
- audit links pointing to missing snapshots
- current snapshot pointers without valid snapshots
- supersession references without a valid successor

### Supersession Persistence Rules

Supersession persistence must:

- create or select a validated successor snapshot
- ensure the successor version is greater than the predecessor version
- set successor `supersedes_snapshot_id`
- set predecessor `superseded_by_snapshot_id` only as part of a valid lineage update
- retain all predecessor child evidence
- preserve audit linkage for the supersession action

### Historical Preservation Requirements

The persistence layer must preserve:

- generated snapshots
- prepared snapshots
- internally published snapshots
- superseded snapshots
- archived internal snapshots
- validation failure evidence when a generated snapshot already exists

Deletion is not normal lifecycle management.

### Orphan Prevention Expectations

The persistence manager must reject or roll back writes that would create:

- snapshot without report root
- snapshot with mismatched CSTP test
- session snapshot without matching CSTP test session
- session snapshot with missing Grow session
- metric row without snapshot
- audit link without valid report context
- supersession reference across unrelated reports

## 7. Integrity Validation Architecture

### Operational Completeness

Operational completeness validation checks:

- target CSTP test exists
- report root exists or can be selected in future implementation
- linked request exists when referenced
- linked source exists when referenced
- included CSTP test-session rows exist
- included Grow session rows exist
- actor or audit context exists when workflow requires it

### Metric Consistency

Metric consistency validation checks:

- metric keys are stable and non-empty
- duplicate metric keys are absent within a snapshot
- numerator and denominator values are coherent
- rates align with stored numerator and denominator values
- missing data is represented explicitly
- calculation version is present when required

### Timestamp Validation

Timestamp validation checks:

- generated timestamp exists
- prepared timestamp does not precede generated timestamp
- published timestamp does not precede prepared timestamp
- observation window end does not precede observation window start
- operational test timestamps are coherent where used
- display-local formatting is not stored as evidence

### Lineage Validation

Lineage validation checks:

- report root and snapshot point to the same CSTP test
- snapshot version is monotonic
- current snapshot pointer does not hide history
- prior and successor snapshots belong to the same report
- lineage remains queryable after archival or supersession

### Snapshot Uniqueness

Snapshot uniqueness validation checks:

- one version number per report
- no duplicate active current snapshot for the same report
- no duplicate metric key within a snapshot
- no duplicate CSTP test-session reference within a snapshot
- no conflicting in-flight generation path in future concurrent execution

### Supersession Integrity

Supersession integrity validation checks:

- predecessor snapshot exists
- successor snapshot exists or candidate is valid
- successor version is greater than predecessor version
- snapshot does not supersede itself
- lineage does not create cycles
- predecessor child evidence remains retained

### Publication Readiness Validation

Publication readiness validation checks:

- prepared snapshot exists
- required metrics and sessions are present
- integrity validation passed
- audit linkage exists or an approved internal exception is recorded
- lifecycle timestamps are valid
- snapshot status can move to internally published governance state
- no unresolved integrity failure applies to the selected snapshot

Publication readiness remains internal-only.

## 8. Regeneration And Supersession Architecture

### When Regeneration Is Allowed

Regeneration is allowed when:

- operational CSTP data changed before internal publication
- linked session selection changed
- metric calculation rules were corrected
- source/request/test metadata needs a new frozen representation
- prior validation failed
- an internally prepared snapshot needs correction before publication
- an internally published snapshot requires correction through new lineage

Regeneration always creates a new snapshot candidate.

### When Supersession Is Required

Supersession is required when a new snapshot replaces a prepared or internally published snapshot as the current evidence source.

Supersession is also required when:

- a correction changes reportable values
- methodology changes alter metric interpretation
- linked session inclusion changes after preparation
- source/request/test metadata correction materially affects report evidence
- a prior internally published snapshot should no longer be current

### Lineage Continuity Expectations

Lineage continuity requires:

- monotonic version numbers
- predecessor/successor references
- retained child evidence
- retained audit links
- consistent report id and CSTP test id across lineage
- clear current snapshot resolution

### Historical Retention Requirements

Historical retention applies to:

- previous prepared snapshots
- previous internally published snapshots
- superseded snapshots
- archived internal snapshots
- generated snapshots that later fail validation

Retention supports internal auditability and reproducibility. It does not imply public access.

### Prohibited Destructive Replacement Behavior

Future services must not:

- overwrite frozen metrics
- overwrite frozen session summaries
- overwrite generated snapshot payloads
- reuse snapshot version numbers
- delete a predecessor snapshot to hide correction history
- mutate `grow_sessions` to match report output
- recalculate published output from live operational data

## 9. Future Deferred Implementation Placeholders

The following systems are deferred and are not designed here:

- rendering engine
- PDF generation
- public verification APIs
- public report explorer
- certification publishing
- Source Directory integration
- Community Grow integration
- badge systems
- breeder/source access portals

Future systems must consume immutable snapshot evidence and respect service-layer governance.

## 10. Explicit Implementation Boundaries

This document does not implement or define:

- APIs
- routes
- UI
- workers/jobs
- cron systems
- queue systems
- rendering
- PDF/export generation
- automation
- public systems
- public read policies
- RLS policies
- certification qualification logic
- certification schema
- moderation systems
- Community Grow integration
- Source Directory integration
- breeder/source accounts
- service functions
- database migrations

## 11. Final Architecture Rule

The immutable CSTP report service layer should make snapshot generation boringly deterministic and hard to misuse.

Each service owns one part of the evidence path. The orchestrator coordinates, the collector reads, the calculator derives, the assembler freezes, the validator rejects unsafe candidates, the persistence manager commits atomically, the supersession manager preserves lineage, and audit linkage keeps the history explainable. None of those layers may rewrite old evidence to make it look current.
