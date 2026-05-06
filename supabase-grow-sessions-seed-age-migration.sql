alter table public.grow_sessions
  add column if not exists seed_age_tracking_enabled boolean not null default false;

alter table public.grow_sessions
  add column if not exists seed_age_mode text;

alter table public.grow_sessions
  add column if not exists session_seed_age_years numeric;
