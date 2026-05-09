alter table public.grow_sessions
  add column if not exists timer_start_at timestamptz;

comment on column public.grow_sessions.timer_start_at is
  'Official session timer start time. New sessions use created_at + 30 minutes so setup time does not count toward elapsed durations or reminders.';
