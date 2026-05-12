-- ============================================================================
-- CSTP MIGRATION V1 - EXECUTABLE-QUALITY CANDIDATE
-- ============================================================================
--
-- DRAFTS FOLDER ONLY.
-- DO NOT RUN UNTIL REVIEWED.
-- DO NOT MOVE INTO ACTIVE MIGRATIONS UNTIL APPROVED.
--
-- Purpose:
-- - Internal-only CSTP v1 foundation.
-- - Additive-only migration candidate.
-- - Validates CSTP request intake, parent test orchestration, admin events,
--   and linkage to existing Grow sessions.
--
-- Explicit exclusions:
-- - No public CSTP exposure.
-- - No RLS policies yet.
-- - No reports.
-- - No report snapshots.
-- - No certifications.
-- - No public badges.
-- - No public report visibility.
-- - No Source Directory public CSTP integration.
-- - No Community Grow CSTP filters.
-- - No automation.
-- - No breeder/source portals.
-- - No external APIs.
--
-- Confirmed existing schema dependencies:
-- - public.grow_sessions(id uuid)
-- - public.sources(id uuid)
-- - auth.users(id uuid)
--
-- Status values are implemented as CHECK constraints for v1 rather than enums.
-- Database enums remain deferred.
--

-- ============================================================================
-- Table: public.cstp_requests
-- ============================================================================
-- Internal CSTP intake table. A request does not imply public testing,
-- certification, report publication, or Source Directory CSTP display.
-- source_id is nullable because early intake may occur before source matching.

create table if not exists public.cstp_requests (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete set null,
  contact_name text,
  contact_email text,
  website text,
  variety_name text,
  seed_type text,
  breeder_name text,
  batch_lot text,
  requested_seed_count integer,
  request_message text,
  status text not null default 'received',
  internal_notes text,
  archived boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cstp_requests_status_check
    check (status in ('received', 'accepted', 'awaiting_seeds', 'declined', 'archived'))
);

comment on table public.cstp_requests is
  'CSTP v1 internal request intake. No public publishing, reports, certifications, badges, or RLS policies are included in v1.';

comment on column public.cstp_requests.source_id is
  'Nullable reference to public.sources for early intake before source matching is complete.';

comment on column public.cstp_requests.status is
  'Internal request intake status. Allowed v1 values: received, accepted, awaiting_seeds, declined, archived.';

comment on column public.cstp_requests.internal_notes is
  'Private/admin CSTP intake notes. Not public report content.';

comment on column public.cstp_requests.archived is
  'Internal archive flag for request lifecycle. Archive is preferred over destructive deletion.';

-- ============================================================================
-- Table: public.cstp_tests
-- ============================================================================
-- Parent CSTP orchestration table. CSTP Tests coordinate internal workflow and
-- linked sessions without owning or mutating the underlying Grow sessions.
-- Reports and certifications remain intentionally deferred.

create table if not exists public.cstp_tests (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete set null,
  request_id uuid references public.cstp_requests(id) on delete set null,
  status text not null default 'pending',
  internal_state text,
  created_by uuid references auth.users(id) on delete set null,
  archived boolean not null default false,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cstp_tests_status_check
    check (status in ('pending', 'active', 'completed', 'archived'))
);

comment on table public.cstp_tests is
  'CSTP v1 parent orchestration record. Internal-only foundation for linked-session testing; reports and certifications are deferred.';

comment on column public.cstp_tests.source_id is
  'Nullable reference to public.sources. Source Directory remains shared and is not duplicated by CSTP.';

comment on column public.cstp_tests.request_id is
  'Optional link back to CSTP request intake. Deleting or archiving intake should not destroy a CSTP Test.';

comment on column public.cstp_tests.status is
  'Internal CSTP Test orchestration status. Allowed v1 values: pending, active, completed, archived.';

comment on column public.cstp_tests.internal_state is
  'Private/admin workflow detail. Not public certification or report state.';

comment on column public.cstp_tests.created_by is
  'Auth user who created the CSTP Test. Future RLS should restrict CSTP management to admins.';

comment on column public.cstp_tests.archived is
  'Internal archive flag. Archive is preferred over destructive deletion for CSTP orchestration history.';

-- ============================================================================
-- Table: public.cstp_admin_events
-- ============================================================================
-- Internal append-oriented CSTP workflow event log.
-- Admin events are private operational records and are not public report content.

create table if not exists public.cstp_admin_events (
  id uuid primary key default gen_random_uuid(),
  cstp_test_id uuid not null references public.cstp_tests(id) on delete restrict,
  admin_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  event_notes text,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.cstp_admin_events is
  'CSTP v1 internal admin event log. Append-oriented audit trail; no public visibility or RLS policies in v1.';

comment on column public.cstp_admin_events.cstp_test_id is
  'Parent CSTP Test. ON DELETE RESTRICT protects internal workflow history.';

comment on column public.cstp_admin_events.admin_user_id is
  'Auth user who recorded the event. Future RLS should restrict CSTP management to admins.';

comment on column public.cstp_admin_events.event_type is
  'Internal audit event type. Not a public lifecycle, report, or certification status.';

comment on column public.cstp_admin_events.event_notes is
  'Private/admin event notes. Not public report content.';

-- ============================================================================
-- Table: public.cstp_test_sessions
-- ============================================================================
-- Join layer between CSTP Tests and existing Grow sessions.
-- This table validates CSTP parent/child orchestration and multi-KAN grouping.
-- Existing Grow sessions remain source-of-truth for observations, images,
-- partition data, timeline/stage behavior, notes, and session metrics.

create table if not exists public.cstp_test_sessions (
  id uuid primary key default gen_random_uuid(),
  cstp_test_id uuid not null references public.cstp_tests(id) on delete restrict,
  session_id uuid not null references public.grow_sessions(id) on delete restrict,
  kan_label text,
  included_in_report boolean not null default true,
  archived boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  constraint cstp_test_sessions_test_session_key unique (cstp_test_id, session_id)
);

comment on table public.cstp_test_sessions is
  'CSTP v1 join table linking CSTP Tests to existing Grow sessions. Sessions remain source-of-truth and are not CSTP-owned.';

comment on column public.cstp_test_sessions.cstp_test_id is
  'Parent CSTP Test. ON DELETE RESTRICT protects orchestration history.';

comment on column public.cstp_test_sessions.session_id is
  'Existing public.grow_sessions record. Linking to CSTP must not mutate normal session behavior.';

comment on column public.cstp_test_sessions.kan_label is
  'Internal KAN/run label for multi-KAN grouping.';

comment on column public.cstp_test_sessions.included_in_report is
  'Future report inclusion planning flag only. Reports are not implemented in v1.';

comment on column public.cstp_test_sessions.archived is
  'Internal archive flag for the relationship. Archiving the link must not delete the session.';

comment on constraint cstp_test_sessions_test_session_key on public.cstp_test_sessions is
  'Prevents duplicate linking of the same session to the same CSTP Test.';

-- ============================================================================
-- Indexes
-- ============================================================================

create index if not exists cstp_requests_source_id_idx
  on public.cstp_requests (source_id);

create index if not exists cstp_requests_status_idx
  on public.cstp_requests (status);

create index if not exists cstp_requests_archived_idx
  on public.cstp_requests (archived);

create index if not exists cstp_tests_source_id_idx
  on public.cstp_tests (source_id);

create index if not exists cstp_tests_request_id_idx
  on public.cstp_tests (request_id);

create index if not exists cstp_tests_status_idx
  on public.cstp_tests (status);

create index if not exists cstp_tests_archived_idx
  on public.cstp_tests (archived);

create index if not exists cstp_admin_events_cstp_test_id_idx
  on public.cstp_admin_events (cstp_test_id);

create index if not exists cstp_admin_events_event_type_idx
  on public.cstp_admin_events (event_type);

create index if not exists cstp_test_sessions_cstp_test_id_idx
  on public.cstp_test_sessions (cstp_test_id);

create index if not exists cstp_test_sessions_session_id_idx
  on public.cstp_test_sessions (session_id);

create index if not exists cstp_test_sessions_archived_idx
  on public.cstp_test_sessions (archived);

-- ============================================================================
-- updated_at trigger planning
-- ============================================================================
--
-- Existing schema uses table-specific updated_at trigger functions such as:
-- - public.set_grow_sessions_updated_at()
-- - public.set_sources_updated_at()
--
-- No generic reusable updated_at trigger function is currently present.
-- This candidate intentionally does not invent a new trigger function.
-- Before activation, updated_at trigger handling for public.cstp_requests and
-- public.cstp_tests should be aligned with the existing schema trigger pattern.
--

-- ============================================================================
-- RLS placeholder
-- ============================================================================
--
-- RLS is intentionally deferred in this candidate.
-- Future policies should restrict CSTP management to admins.
-- No public read policies should be added for CSTP v1 internal tables.
-- Public reports, certifications, badges, and Source Directory public CSTP
-- integration remain deferred.
--

-- ============================================================================
-- Final safety notes
-- ============================================================================
--
-- This executable-quality candidate must be reviewed before becoming an active
-- migration.
-- This candidate must be tested in staging first.
-- No public CSTP data should depend on this candidate yet.
-- Reports, report snapshots, certifications, public badges, public report
-- visibility, Source Directory public CSTP integration, Community Grow CSTP
-- filters, automation, breeder/source portals, external APIs, and RLS policies
-- remain intentionally deferred.
--
