-- Production repair for grow_sessions timer/session-clock schema drift.
--
-- The frontend writes timer_start_at for the soak timer and also reads the
-- adjacent lifecycle timestamps used by session details, reminders, and
-- analytics eligibility. This migration is additive only and intentionally
-- does not rewrite, delete, or backfill existing user rows.

alter table public.grow_sessions
  add column if not exists timer_start_at timestamptz,
  add column if not exists session_started_at timestamptz,
  add column if not exists soak_started_at timestamptz,
  add column if not exists germination_started_at timestamptz,
  add column if not exists first_planted_at timestamptz,
  add column if not exists completed_at timestamptz;

comment on column public.grow_sessions.timer_start_at is
  'Legacy soak timer start used by the app for countdowns and reminders. Mirrors soak_started_at when owner-time columns are available.';

comment on column public.grow_sessions.session_started_at is
  'Session lifecycle timestamp for when the grow session was created or started.';

comment on column public.grow_sessions.soak_started_at is
  'Session lifecycle timestamp for when soaking began.';

comment on column public.grow_sessions.germination_started_at is
  'Session lifecycle timestamp for when germination tracking began.';

comment on column public.grow_sessions.first_planted_at is
  'Optional timestamp for the first planted seed/partition event in a grow session.';

comment on column public.grow_sessions.completed_at is
  'Session lifecycle timestamp for completed grow sessions used by analytics eligibility.';

notify pgrst, 'reload schema';
