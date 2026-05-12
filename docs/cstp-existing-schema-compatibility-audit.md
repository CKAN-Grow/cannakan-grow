# CSTP Existing Schema Compatibility Audit

## 1. Purpose

This document audits the actual Cannakan Grow Supabase schema and compares it against the planned CSTP migration v1 SQL draft before executable migrations are created.

This audit validates CSTP assumptions against the real schema in:

- `supabase-schema.sql`
- `supabase/migrations/drafts/cstp_migration_v1_draft.sql`
- `docs/cstp-architecture-master-index.md`
- `docs/cstp-entity-relationship-model-specification.md`
- `docs/cstp-migration-v1-sql-design-draft.md`
- `docs/cstp-migration-v1-sql-review-checklist.md`

Implementation safety depends on matching existing database patterns. Architecture correctness alone is not sufficient; the first executable CSTP migration must align with actual table names, primary key types, timestamp conventions, ownership models, delete behavior, index naming, and RLS expectations already present in Cannakan Grow.

This is a schema compatibility audit only. It does not execute SQL, modify schema files, create active migrations, modify app/backend/UI/routes, implement APIs, or implement RLS.

## 2. Existing Schema Discovery

### Sessions Table

The actual session table is `public.grow_sessions`, not `public.sessions`.

Key findings:

- Primary key: `id uuid primary key default gen_random_uuid()`
- Ownership: `user_id uuid not null references auth.users(id) on delete cascade`
- Timestamps: `created_at timestamptz not null default timezone('utc', now())`, `updated_at timestamptz not null default timezone('utc', now())`
- Soft delete/lifecycle fields: `is_deleted boolean not null default false`, `deleted_at timestamptz`, `visibility_status text not null default 'active'`
- Session evidence fields include `session_images jsonb`, `snapshot_state jsonb`, `session_status`, `germination_started_at`, `first_planted_at`, `completed_at`, `timer_start_at`, `partitions jsonb`
- Index: `grow_sessions_user_created_idx` on `(user_id, created_at desc)`
- Updated-at trigger: `grow_sessions_set_updated_at`

### Sources-Related Tables

The actual source table is `public.sources`.

Key findings:

- Primary key: `id uuid primary key default gen_random_uuid()`
- Core fields: `name`, `logo_url`, `logo_path`, `website_url`, `description`, `contact_name`, `contact_email`, `notes`, `status`
- Timestamps: `created_at` and `updated_at` use `timezone('utc', now())`
- Status default: `status text not null default 'active'`
- Unique index: `sources_name_lower_idx` on `lower(name)`
- Updated-at trigger: `sources_set_updated_at`
- RLS exists with public active-source read and admin-managed write behavior

### Auth/User Ownership Structure

Existing user ownership patterns use `auth.users(id)` directly for user-owned records.

Examples:

- `grow_sessions.user_id references auth.users(id) on delete cascade`
- `profiles.id references auth.users(id) on delete cascade`
- `public_member_profiles.user_id references auth.users(id) on delete cascade`
- `admin_users.user_id references auth.users(id) on delete cascade`
- `admin_reports.user_id references auth.users(id) on delete set null`

Admin identity is represented through `public.admin_users`, where:

- `admin_users.id uuid primary key default gen_random_uuid()`
- `admin_users.user_id uuid not null unique references auth.users(id) on delete cascade`
- Admin checks in RLS commonly use `exists (select 1 from public.admin_users where admin_users.user_id = auth.uid())`

### Timestamps

The dominant schema convention is:

- `created_at timestamptz not null default timezone('utc', now())`
- `updated_at timestamptz not null default timezone('utc', now())`

Tables with `updated_at` commonly have table-specific `set_*_updated_at()` trigger functions and `before update` triggers.

### Soft-Delete / Archive Patterns

Existing lifecycle patterns are mixed:

- `grow_sessions` uses `is_deleted`, `deleted_at`, and `visibility_status`
- `profiles` uses account/deletion fields such as `account_status`, `deletion_requested_at`, `deletion_scheduled_for`, and `deletion_status`
- `sources` uses `status`
- `announcements` uses `status`, `publish_at`, and `expires_at`
- `grow_gallery_snapshots` uses `status`, `is_published`, and `published_at`

The existing schema does not have a universal `archived` convention.

### Existing Indexes

Existing index patterns are descriptive and table-prefixed:

- `grow_sessions_user_created_idx`
- `sources_name_lower_idx`
- `admin_reports_status_created_at_idx`
- `grow_gallery_snapshots_user_session_idx`
- `community_activity_visibility_created_idx`

Composite indexes frequently include status/visibility plus descending timestamp columns for list views.

### Naming Conventions

Existing schema conventions include:

- snake_case table and column names
- `*_id` relationship fields
- `*_at` timestamp fields
- table-prefixed index names
- `status` text fields for lifecycle state
- `jsonb` fields for flexible app-owned session/gallery metadata

### Relationship Conventions

Existing FK delete behavior varies by ownership:

- User-owned private rows often use `on delete cascade`
- Optional references often use `on delete set null`
- Dependent interaction rows such as likes/follows often use `on delete cascade`
- Public or history-sensitive optional references tend to use `set null` rather than destructive ownership

## 3. Session Table Compatibility Audit

### Actual Session Table

The actual session table is `public.grow_sessions`.

### PK Datatype

`grow_sessions.id` is `uuid`, generated with `gen_random_uuid()`.

### Ownership Fields

`grow_sessions.user_id` references `auth.users(id)` with `on delete cascade`.

### Timestamp Patterns

The table uses `timestamptz` with `timezone('utc', now())` defaults and a `grow_sessions_set_updated_at` trigger.

### Archive/Delete Handling

The table supports soft-delete style fields:

- `is_deleted`
- `deleted_at`
- `visibility_status`

It also still has an RLS delete policy, so destructive delete may exist as a permission path, but the app has soft-delete metadata available.

### Relationship Naming

Related tables use `session_id` when referencing `public.grow_sessions(id)`.

### CSTP Compatibility

`cstp_test_sessions.session_id uuid` is compatible with `public.grow_sessions(id uuid)`.

The CSTP draft correctly references `public.grow_sessions(id)` rather than inventing `public.sessions`.

Compatibility status: Compatible, with one caution. The draft's `on delete restrict` behavior protects linked session evidence but differs from some existing dependent rows that use cascade. This is appropriate for CSTP history protection, but should be explicitly reviewed before executable SQL.

## 4. Source Table Compatibility Audit

### Actual Source Table

The actual source table is `public.sources`.

### PK Datatype

`sources.id` is `uuid`, generated with `gen_random_uuid()`.

### Naming Conventions

The table uses snake_case fields and `status` for lifecycle state.

### Ownership Structure

Sources are admin-managed and publicly readable when active. They do not appear to be user-owned by `user_id`.

### CSTP Compatibility

`cstp_requests.source_id uuid` is compatible with `public.sources(id uuid)`.

`cstp_tests.source_id uuid` is compatible with `public.sources(id uuid)`.

The draft's nullable `source_id` approach is compatible with early intake and with the Source Directory model.

Compatibility status: Compatible.

## 5. User/Admin Relationship Audit

### Auth Users

The existing schema uses `auth.users(id)` for core user ownership and account linkage.

### Profiles

`public.profiles.id` references `auth.users(id)`.

### Admin Users

`public.admin_users` stores admin membership with:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null unique references auth.users(id) on delete cascade`
- `email text`

RLS policies commonly check admin membership through `admin_users.user_id = auth.uid()`.

### created_by Compatibility

The CSTP draft uses `cstp_tests.created_by uuid` without an FK. This is compatible as a placeholder because the final target is a design decision:

- `auth.users(id)` would align with direct user ownership references.
- `public.admin_users(user_id)` would align with admin membership checks.
- `public.admin_users(id)` would reference the admin membership row rather than the underlying user.

Recommendation: Before executable SQL, choose one canonical actor reference. The safest alignment appears to be `auth.users(id)` for actor identity, with admin authorization enforced through RLS or app logic later.

### admin_user_id Compatibility

The CSTP draft uses `cstp_admin_events.admin_user_id uuid` without an FK. This is compatible as a placeholder, but the same actor-reference decision must be made before executable SQL.

Compatibility status: Compatible as a draft placeholder; unresolved for executable SQL.

## 6. Timestamp Convention Audit

### Existing Convention

The existing schema predominantly uses:

- `timezone('utc', now())`
- `timestamptz`
- table-specific `updated_at` trigger functions

### CSTP Draft Convention

The draft uses:

- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### Compatibility Assessment

Datatype compatibility is fine because `now()` returns a timestamp with time zone in PostgreSQL contexts. However, naming and style consistency would be stronger if the executable CSTP migration used `timezone('utc', now())`, matching current schema style.

The CSTP draft also notes that updated-at triggers should be reviewed. That is correct. If `cstp_requests` and `cstp_tests` include `updated_at`, executable SQL should add corresponding `set_cstp_*_updated_at()` triggers or a shared trigger function pattern.

Compatibility status: Compatible by datatype; style adjustment recommended before executable SQL.

## 7. Archive / Soft Delete Pattern Audit

### Existing Patterns

Existing schema does not use one universal archive pattern:

- Sessions: `is_deleted`, `deleted_at`, `visibility_status`
- Profiles: deletion status and scheduled deletion fields
- Sources: `status`
- Gallery snapshots: `status`, `is_published`, `published_at`
- Announcements: `status`, `publish_at`, `expires_at`

### CSTP Draft Pattern

The CSTP draft uses:

- `archived boolean not null default false`

### Compatibility Assessment

The draft's `archived` flag is simple and aligns with the internal-only v1 goal. It does not conflict with existing schema, but it does introduce a new lifecycle naming pattern.

Recommendation: Before executable SQL, decide whether v1 should use:

- `archived boolean`, as currently drafted
- `archived_at timestamptz`, for auditability
- `status = 'archived'`, matching status-driven lifecycle patterns
- both `archived boolean` and `archived_at`, if operationally useful

Compatibility status: Structurally compatible; naming/lifecycle convention should be confirmed.

## 8. Existing Relationship Pattern Audit

### FK Naming Conventions

Existing relationships use `*_id` fields, matching the CSTP draft.

Examples:

- `user_id`
- `session_id`
- `snapshot_id`
- `source_id`

### ON DELETE Patterns

Existing delete behavior includes:

- `on delete cascade` for tightly owned user/session dependent records
- `on delete set null` for optional audit/notification/report-like references
- no observed widespread use of `on delete restrict` in the inspected schema

### CSTP Draft Relationship Behavior

The CSTP draft proposes:

- `cstp_requests.source_id references public.sources(id) on delete set null`
- `cstp_tests.source_id references public.sources(id) on delete set null`
- `cstp_tests.request_id references public.cstp_requests(id) on delete set null`
- `cstp_admin_events.cstp_test_id references public.cstp_tests(id) on delete restrict`
- `cstp_test_sessions.cstp_test_id references public.cstp_tests(id) on delete restrict`
- `cstp_test_sessions.session_id references public.grow_sessions(id) on delete restrict`

### Compatibility Assessment

The `set null` choices align with existing optional-reference patterns.

The `restrict` choices are conservative and protect CSTP audit/linkage integrity, but they differ from existing cascade-heavy dependent-row patterns. For CSTP, this difference is intentional because migration v1 is preparing a history-sensitive system.

Compatibility status: Compatible if intentionally approved; `restrict` behavior should be reviewed as a conscious CSTP-specific safety choice.

## 9. Existing Index Pattern Audit

### Existing Index Naming

Existing index names are generally table-prefixed and descriptive:

- `grow_sessions_user_created_idx`
- `admin_reports_status_created_at_idx`
- `sources_name_lower_idx`
- `grow_gallery_snapshots_user_session_idx`

### Existing Indexed Fields

Common indexed fields include:

- `user_id`
- `status`
- `created_at desc`
- `visibility`
- relationship IDs such as `snapshot_id`, `following_id`, `session_id`

### CSTP Draft Index Alignment

The CSTP draft uses table-prefixed index names such as:

- `cstp_requests_source_id_idx`
- `cstp_tests_request_id_idx`
- `cstp_admin_events_cstp_test_id_idx`
- `cstp_test_sessions_session_id_idx`

This aligns well with existing naming conventions.

Recommendation: Consider composite indexes for common admin list views after query behavior is known, such as `(status, created_at desc)` or `(archived, created_at desc)`. Single-column indexes are acceptable for v1 planning but may not be optimal long term.

Compatibility status: Compatible.

## 10. Compatibility Findings Matrix

| Planned CSTP Assumption | Existing Schema Reality | Compatible? | Action Needed |
|---|---|---:|---|
| CSTP session link uses UUID `session_id` | `public.grow_sessions.id` is UUID | Yes | Reference `public.grow_sessions(id)`, not `public.sessions`. |
| CSTP source links use UUID `source_id` | `public.sources.id` is UUID | Yes | Keep nullable `source_id` for early intake. |
| Source table exists | `public.sources` exists | Yes | Use existing Source Directory identity. |
| Sessions table exists as shared source-of-truth | Actual table is `public.grow_sessions` | Yes | Keep CSTP as join/extension layer. |
| `created_by` can be UUID | Users/admin identities are UUID-backed | Partial | Choose FK target before executable SQL. |
| `admin_user_id` can be UUID | `admin_users.user_id` and `auth.users.id` are UUID | Partial | Choose actor-reference convention before executable SQL. |
| `created_at` / `updated_at` use `timestamptz` | Existing schema uses `timestamptz` | Yes | Prefer `timezone('utc', now())` for style consistency. |
| CSTP uses `archived` boolean | Existing schema uses mixed lifecycle patterns | Partial | Confirm `archived`, `archived_at`, or status-only approach. |
| `on delete set null` for optional source/request refs | Existing optional references often use `set null` | Yes | Keep for optional source/request relationships. |
| `on delete restrict` for CSTP linkage/audit | Existing schema mostly uses cascade/set null | Partial | Review and approve as CSTP history-protection behavior. |
| Unique CSTP test/session link | Existing schema uses unique indexes/constraints for duplicate prevention | Yes | Keep `unique(cstp_test_id, session_id)` or partial equivalent. |
| Indexes are table-prefixed | Existing index names are table-prefixed/descriptive | Yes | Keep draft naming style. |
| RLS deferred in draft | Existing schema enables RLS broadly | Partial | Accept for draft; executable migration must plan RLS timing carefully. |

## 11. Risk Findings

### Datatype Mismatches

No major datatype mismatch was found for v1 relationship IDs. `grow_sessions.id`, `sources.id`, `auth.users.id`, and `admin_users.user_id` are UUID-compatible with the CSTP draft.

### Missing Source Relationships

No missing source table issue was found. `public.sources` exists and is compatible.

### Auth Ownership Uncertainty

`created_by` and `admin_user_id` remain unresolved. The draft correctly avoids hard FK assumptions. Executable SQL should decide whether these reference `auth.users(id)`, `public.admin_users(user_id)`, or `public.admin_users(id)`.

### Naming Drift

The draft uses `archived`, while existing tables use mixed lifecycle approaches such as `status`, `is_deleted`, `deleted_at`, and `visibility_status`. This is not a blocker, but it should be approved explicitly.

### Timestamp Inconsistency

The draft uses `now()`, while existing schema consistently favors `timezone('utc', now())`. This should be adjusted before executable SQL for consistency.

### Archive Strategy Conflicts

The draft's archive behavior is compatible with CSTP planning, but `archived boolean` alone may be less auditable than `archived_at`.

### FK Uncertainty

`on delete restrict` is safer for preserving CSTP history but less common in the existing schema. It should be retained only if the team accepts the operational implication that parent/session deletion may be blocked until CSTP links are archived or resolved.

## 12. Recommended Adjustments Before Executable SQL

Recommended draft alignment adjustments only:

1. Change CSTP timestamp defaults from `now()` to `timezone('utc', now())` for consistency with existing schema.
2. Add updated-at trigger planning for `cstp_requests` and `cstp_tests` if those tables include `updated_at`.
3. Decide canonical actor FK target for `cstp_tests.created_by` and `cstp_admin_events.admin_user_id`.
4. Decide whether CSTP should keep `archived boolean`, add `archived_at timestamptz`, use status-only archival, or use both flag and timestamp.
5. Explicitly approve `on delete restrict` for `cstp_admin_events` and `cstp_test_sessions`, or choose a softer behavior with documented fallback.
6. Consider composite admin query indexes after the first real admin query patterns are known.
7. Keep RLS out of the draft, but require an RLS implementation plan before exposing CSTP tables beyond internal/admin contexts.

Do not implement these adjustments in this audit document.

## 13. Final Readiness Assessment

CSTP migration v1 is structurally compatible with the current Cannakan Grow Supabase schema.

Validated assumptions:

- Existing session table exists as `public.grow_sessions`.
- Existing source table exists as `public.sources`.
- Session and source primary keys are UUIDs.
- CSTP `source_id`, `request_id`, `cstp_test_id`, and `session_id` relationship planning aligns with current naming and datatype conventions.
- Additive CSTP-owned tables are compatible with the current architecture.
- The draft correctly avoids public CSTP exposure and avoids active RLS/API/UI implementation.

Clarifications required before executable SQL:

- Final FK target for `created_by` and `admin_user_id`.
- Timestamp default style should align to `timezone('utc', now())`.
- Updated-at trigger approach for CSTP tables.
- Final archive/lifecycle convention.
- Final approval of `on delete restrict` for history-sensitive CSTP relationships.

Overall assessment: Ready for careful SQL refinement after the above clarifications, but not ready for executable migration until those alignment decisions are made.

## 14. Explicit Non-Goals

This document does not include or implement:

- Executable SQL
- Migrations
- Schema changes
- Schema file edits
- Backend implementation
- App implementation
- UI changes
- Route changes
- APIs
- Row-level security
- Public rollout
- Reports
- Certifications
- Source Directory public CSTP integration
- Community Grow CSTP integration

This is a final schema compatibility audit only.

