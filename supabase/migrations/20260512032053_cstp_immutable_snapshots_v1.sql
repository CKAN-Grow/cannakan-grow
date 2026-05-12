-- ============================================================================
-- CSTP IMMUTABLE SNAPSHOTS V1
-- ============================================================================
--
-- Purpose:
-- - Internal-only CSTP immutable snapshot infrastructure.
-- - Additive-only migration.
-- - Preserve frozen historical report evidence for future internal report
--   preparation and publication workflows.
--
-- Explicit exclusions:
-- - No public CSTP exposure.
-- - No public read policies or RLS policies.
-- - No public report APIs or UI.
-- - No report rendering or media storage implementation.
-- - No certifications, certification history, badges, or public trust scoring.
-- - No Source Directory public CSTP integration.
-- - No Community Grow CSTP integration.
-- - No automation.
-- - No breeder/source portals.
--
-- Boundary:
-- - Existing CSTP operational tables remain the workflow source of truth.
-- - public.grow_sessions remains the canonical Grow session source of truth.
-- - Snapshot tables are historical evidence records, not operational truth.
-- - Snapshot records must not mutate grow_sessions or CSTP operational state.
--
-- Status values are implemented as CHECK constraints for v1 rather than enums.
-- Database enums remain deferred.
--

-- ============================================================================
-- Table: public.cstp_reports
-- ============================================================================
-- Internal report root. This coordinates report preparation state for one CSTP
-- Test but does not store frozen metric/session evidence directly.
-- Public reports and certifications are intentionally deferred.

create table if not exists public.cstp_reports (
  id uuid primary key default gen_random_uuid(),
  cstp_test_id uuid not null references public.cstp_tests(id) on delete restrict,
  cstp_request_id uuid references public.cstp_requests(id) on delete set null,
  source_id uuid references public.sources(id) on delete set null,
  current_snapshot_id uuid,
  status text not null default 'draft',
  archived boolean not null default false,
  prepared_at timestamptz,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  prepared_by uuid references auth.users(id) on delete set null,
  published_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cstp_reports_status_check
    check (status in ('draft', 'preparing', 'prepared', 'published', 'superseded', 'archived')),
  constraint cstp_reports_prepared_state_check
    check (status not in ('prepared', 'published', 'superseded') or prepared_at is not null),
  constraint cstp_reports_published_state_check
    check (status not in ('published', 'superseded') or published_at is not null),
  constraint cstp_reports_published_after_prepared_check
    check (published_at is null or prepared_at is null or published_at >= prepared_at)
);

comment on table public.cstp_reports is
  'CSTP internal immutable snapshot report root. Coordinates future report preparation only; public reports, certifications, badges, APIs, UI, and RLS policies are deferred.';

comment on column public.cstp_reports.cstp_test_id is
  'Parent CSTP Test. Reports do not replace or mutate CSTP operational workflow state.';

comment on column public.cstp_reports.cstp_request_id is
  'Optional intake request traceability. Request records remain operational, mutable internal records.';

comment on column public.cstp_reports.source_id is
  'Optional source traceability. Source Directory public CSTP exposure is deferred.';

comment on column public.cstp_reports.current_snapshot_id is
  'Internal pointer to the current report snapshot. Frozen evidence remains in cstp_report_snapshots and child evidence tables.';

comment on column public.cstp_reports.status is
  'Internal report lifecycle status only. This is not a public visibility, certification, or badge status.';

comment on column public.cstp_reports.archived is
  'Internal archive marker. Archive is preferred over destructive deletion for report lineage.';

-- ============================================================================
-- Table: public.cstp_report_snapshots
-- ============================================================================
-- Frozen report version. Snapshots preserve historical evidence context for a
-- report version. They are not operational truth and must not mutate
-- cstp_tests, cstp_test_sessions, cstp_requests, or grow_sessions.

create table if not exists public.cstp_report_snapshots (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.cstp_reports(id) on delete restrict,
  cstp_test_id uuid not null references public.cstp_tests(id) on delete restrict,
  cstp_request_id uuid references public.cstp_requests(id) on delete set null,
  source_id uuid references public.sources(id) on delete set null,
  snapshot_version integer not null,
  status text not null default 'draft',
  locked boolean not null default false,
  frozen_report_payload jsonb not null default '{}'::jsonb,
  report_schema_version text not null default 'cstp_report_schema_v1',
  methodology_version text,
  generated_at timestamptz not null default timezone('utc', now()),
  prepared_at timestamptz,
  published_at timestamptz,
  supersedes_snapshot_id uuid references public.cstp_report_snapshots(id) on delete restrict,
  superseded_by_snapshot_id uuid references public.cstp_report_snapshots(id) on delete restrict,
  created_by uuid references auth.users(id) on delete set null,
  prepared_by uuid references auth.users(id) on delete set null,
  published_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint cstp_report_snapshots_version_check
    check (snapshot_version >= 1),
  constraint cstp_report_snapshots_status_check
    check (status in ('draft', 'generated', 'prepared', 'published', 'superseded', 'archived')),
  constraint cstp_report_snapshots_prepared_state_check
    check (status not in ('prepared', 'published', 'superseded') or prepared_at is not null),
  constraint cstp_report_snapshots_published_state_check
    check (status not in ('published', 'superseded') or (published_at is not null and locked = true)),
  constraint cstp_report_snapshots_superseded_state_check
    check (status <> 'superseded' or superseded_by_snapshot_id is not null),
  constraint cstp_report_snapshots_supersedes_self_check
    check (supersedes_snapshot_id is null or supersedes_snapshot_id <> id),
  constraint cstp_report_snapshots_superseded_by_self_check
    check (superseded_by_snapshot_id is null or superseded_by_snapshot_id <> id),
  constraint cstp_report_snapshots_published_after_prepared_check
    check (published_at is null or prepared_at is null or published_at >= prepared_at),
  constraint cstp_report_snapshots_prepared_after_generated_check
    check (prepared_at is null or prepared_at >= generated_at),
  constraint cstp_report_snapshots_version_unique
    unique (report_id, snapshot_version)
);

comment on table public.cstp_report_snapshots is
  'CSTP internal immutable report snapshot records. Snapshots are historical evidence, not operational truth. Public reports, certifications, and rendering are deferred.';

comment on column public.cstp_report_snapshots.frozen_report_payload is
  'Internal frozen report context payload for v1. Not rendered publicly and not a certification payload.';

comment on column public.cstp_report_snapshots.locked is
  'Internal publication lock marker for future workflow enforcement. Published snapshots should be corrected through new versions, not in-place mutation.';

comment on column public.cstp_report_snapshots.supersedes_snapshot_id is
  'Optional prior snapshot in historical lineage. Supersession preserves old evidence instead of deleting or overwriting it.';

comment on column public.cstp_report_snapshots.superseded_by_snapshot_id is
  'Optional successor snapshot in historical lineage. Self-reference is prohibited by constraint.';

-- Add the report root pointer after cstp_report_snapshots exists.
alter table public.cstp_reports
  add constraint cstp_reports_current_snapshot_id_fkey
  foreign key (current_snapshot_id)
  references public.cstp_report_snapshots(id)
  on delete restrict;

-- ============================================================================
-- Table: public.cstp_report_metrics
-- ============================================================================
-- Frozen metric evidence for a snapshot. Metric records are historical values
-- captured for reproducibility; they are not recalculated from live operational
-- tables for published output.

create table if not exists public.cstp_report_metrics (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.cstp_reports(id) on delete restrict,
  snapshot_id uuid not null references public.cstp_report_snapshots(id) on delete restrict,
  cstp_test_id uuid not null references public.cstp_tests(id) on delete restrict,
  metric_key text not null,
  metric_type text not null default 'json',
  metric_unit text,
  metric_value jsonb not null default '{}'::jsonb,
  frozen_metric_payload jsonb not null default '{}'::jsonb,
  numerator numeric,
  denominator numeric,
  calculated_at timestamptz,
  observation_window_start timestamptz,
  observation_window_end timestamptz,
  calculation_version text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint cstp_report_metrics_key_not_blank_check
    check (length(btrim(metric_key)) > 0),
  constraint cstp_report_metrics_type_check
    check (metric_type in ('count', 'rate', 'timestamp', 'duration', 'boolean', 'text', 'json')),
  constraint cstp_report_metrics_denominator_check
    check (denominator is null or denominator >= 0),
  constraint cstp_report_metrics_observation_window_check
    check (observation_window_end is null or observation_window_start is null or observation_window_end >= observation_window_start),
  constraint cstp_report_metrics_snapshot_key_unique
    unique (snapshot_id, metric_key)
);

comment on table public.cstp_report_metrics is
  'Frozen CSTP report metric records for internal immutable snapshots. Metrics are historical evidence and not live operational truth or certification decisions.';

comment on column public.cstp_report_metrics.metric_value is
  'Frozen metric value stored as JSONB to support counts, rates, timestamps, text summaries, and structured internal metric values.';

comment on column public.cstp_report_metrics.frozen_metric_payload is
  'Optional frozen calculation context for reproducibility. This does not implement report rendering or certification logic.';

-- ============================================================================
-- Table: public.cstp_report_sessions
-- ============================================================================
-- Frozen session relationship evidence for a snapshot. These rows record which
-- CSTP test-session links and Grow sessions were considered for a snapshot.
-- grow_sessions remain canonical and are not mutated, copied, or forked.

create table if not exists public.cstp_report_sessions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.cstp_reports(id) on delete restrict,
  snapshot_id uuid not null references public.cstp_report_snapshots(id) on delete restrict,
  cstp_test_id uuid not null references public.cstp_tests(id) on delete restrict,
  cstp_test_session_id uuid not null references public.cstp_test_sessions(id) on delete restrict,
  grow_session_id uuid not null references public.grow_sessions(id) on delete restrict,
  kan_label text,
  included_in_report boolean not null default true,
  relationship_archived_at_snapshot boolean not null default false,
  frozen_session_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint cstp_report_sessions_snapshot_test_session_unique
    unique (snapshot_id, cstp_test_session_id)
);

comment on table public.cstp_report_sessions is
  'Frozen CSTP report session relationship records. grow_sessions remain canonical operational records; these rows are historical evidence only.';

comment on column public.cstp_report_sessions.grow_session_id is
  'Existing public.grow_sessions record. Snapshotting this reference must not mutate, fork, or replace the Grow session.';

comment on column public.cstp_report_sessions.frozen_session_summary is
  'Frozen internal session relationship summary used for reproducibility. This is not a full Grow session copy or report rendering output.';

-- ============================================================================
-- Table: public.cstp_report_audit_links
-- ============================================================================
-- Internal linkage between report/snapshot records and append-oriented CSTP
-- admin events. Raw admin notes and audit details remain internal-only.

create table if not exists public.cstp_report_audit_links (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.cstp_reports(id) on delete restrict,
  snapshot_id uuid references public.cstp_report_snapshots(id) on delete restrict,
  cstp_admin_event_id uuid references public.cstp_admin_events(id) on delete restrict,
  event_role text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint cstp_report_audit_links_event_role_check
    check (event_role in (
      'report_created',
      'snapshot_generated',
      'snapshot_prepared',
      'report_prepared',
      'snapshot_published',
      'report_published',
      'snapshot_superseded',
      'report_superseded',
      'report_archived',
      'validation_failed'
    )),
  constraint cstp_report_audit_links_event_or_actor_check
    check (cstp_admin_event_id is not null or created_by is not null)
);

comment on table public.cstp_report_audit_links is
  'Internal CSTP report/snapshot audit linkage. This preserves traceability to admin events without creating public audit exposure.';

comment on column public.cstp_report_audit_links.event_role is
  'Internal role for the linked audit event. This is not a public report status or certification state.';

-- ============================================================================
-- Indexes
-- ============================================================================

create index if not exists cstp_reports_cstp_test_id_idx
  on public.cstp_reports (cstp_test_id);

create index if not exists cstp_reports_cstp_request_id_idx
  on public.cstp_reports (cstp_request_id);

create index if not exists cstp_reports_status_idx
  on public.cstp_reports (status);

create index if not exists cstp_reports_created_at_idx
  on public.cstp_reports (created_at);

create index if not exists cstp_reports_prepared_at_idx
  on public.cstp_reports (prepared_at);

create index if not exists cstp_reports_published_at_idx
  on public.cstp_reports (published_at);

create index if not exists cstp_report_snapshots_report_id_idx
  on public.cstp_report_snapshots (report_id);

create index if not exists cstp_report_snapshots_cstp_test_id_idx
  on public.cstp_report_snapshots (cstp_test_id);

create index if not exists cstp_report_snapshots_cstp_request_id_idx
  on public.cstp_report_snapshots (cstp_request_id);

create index if not exists cstp_report_snapshots_status_idx
  on public.cstp_report_snapshots (status);

create index if not exists cstp_report_snapshots_created_at_idx
  on public.cstp_report_snapshots (created_at);

create index if not exists cstp_report_snapshots_prepared_at_idx
  on public.cstp_report_snapshots (prepared_at);

create index if not exists cstp_report_snapshots_published_at_idx
  on public.cstp_report_snapshots (published_at);

create index if not exists cstp_report_snapshots_supersedes_idx
  on public.cstp_report_snapshots (supersedes_snapshot_id);

create index if not exists cstp_report_snapshots_superseded_by_idx
  on public.cstp_report_snapshots (superseded_by_snapshot_id);

create index if not exists cstp_report_metrics_snapshot_id_idx
  on public.cstp_report_metrics (snapshot_id);

create index if not exists cstp_report_metrics_report_id_idx
  on public.cstp_report_metrics (report_id);

create index if not exists cstp_report_metrics_cstp_test_id_idx
  on public.cstp_report_metrics (cstp_test_id);

create index if not exists cstp_report_metrics_metric_key_idx
  on public.cstp_report_metrics (metric_key);

create index if not exists cstp_report_metrics_created_at_idx
  on public.cstp_report_metrics (created_at);

create index if not exists cstp_report_metrics_calculated_at_idx
  on public.cstp_report_metrics (calculated_at);

create index if not exists cstp_report_sessions_snapshot_id_idx
  on public.cstp_report_sessions (snapshot_id);

create index if not exists cstp_report_sessions_report_id_idx
  on public.cstp_report_sessions (report_id);

create index if not exists cstp_report_sessions_cstp_test_id_idx
  on public.cstp_report_sessions (cstp_test_id);

create index if not exists cstp_report_sessions_cstp_test_session_id_idx
  on public.cstp_report_sessions (cstp_test_session_id);

create index if not exists cstp_report_sessions_grow_session_id_idx
  on public.cstp_report_sessions (grow_session_id);

create index if not exists cstp_report_sessions_created_at_idx
  on public.cstp_report_sessions (created_at);

create index if not exists cstp_report_audit_links_report_id_idx
  on public.cstp_report_audit_links (report_id);

create index if not exists cstp_report_audit_links_snapshot_id_idx
  on public.cstp_report_audit_links (snapshot_id);

create index if not exists cstp_report_audit_links_cstp_admin_event_id_idx
  on public.cstp_report_audit_links (cstp_admin_event_id);

create index if not exists cstp_report_audit_links_event_role_idx
  on public.cstp_report_audit_links (event_role);

create index if not exists cstp_report_audit_links_created_at_idx
  on public.cstp_report_audit_links (created_at);

-- ============================================================================
-- updated_at trigger planning
-- ============================================================================
--
-- Existing CSTP v1 migration intentionally did not invent a generic updated_at
-- trigger function. This migration follows that boundary. updated_at handling
-- for public.cstp_reports should be aligned with the existing project trigger
-- pattern before backend workflows depend on automatic timestamp updates.
--

-- ============================================================================
-- RLS/public exposure placeholder
-- ============================================================================
--
-- RLS and public read policies are intentionally deferred.
-- Future policies should restrict CSTP report/snapshot management to admins.
-- No public read policies are added for immutable CSTP snapshot tables.
-- Public reports, certifications, badges, report rendering, Source Directory
-- public CSTP integration, and Community Grow CSTP filters remain deferred.
--

-- ============================================================================
-- Final safety notes
-- ============================================================================
--
-- These tables are internal immutable snapshot infrastructure only.
-- They preserve historical evidence for future report workflows without
-- creating public reports, certifications, public APIs/UI, public policies, or
-- report rendering output.
--
-- grow_sessions remain canonical operational records.
-- CSTP operational tables remain operational truth.
-- Snapshot records are frozen historical evidence records, not live operational
-- truth and not a replacement lifecycle for CSTP Tests or Grow sessions.
--
