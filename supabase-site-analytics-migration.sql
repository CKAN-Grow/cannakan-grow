-- Site visitor analytics event log for admin-only reporting.
-- Apply this migration in Supabase before using historical visitor analytics.

create table if not exists public.site_analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text,
  page text,
  session_id text,
  created_at timestamptz default timezone('utc', now())
);

alter table public.site_analytics_events
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.site_analytics_events
  add column if not exists event_type text;

alter table public.site_analytics_events
  add column if not exists page text;

alter table public.site_analytics_events
  add column if not exists session_id text;

alter table public.site_analytics_events
  add column if not exists created_at timestamptz default timezone('utc', now());

create index if not exists site_analytics_events_created_at_idx
  on public.site_analytics_events (created_at desc);

create index if not exists site_analytics_events_event_type_created_at_idx
  on public.site_analytics_events (event_type, created_at desc);

create index if not exists site_analytics_events_page_created_at_idx
  on public.site_analytics_events (page, created_at desc);

create index if not exists site_analytics_events_session_idx
  on public.site_analytics_events (session_id, created_at desc);

create index if not exists site_analytics_events_user_idx
  on public.site_analytics_events (user_id, created_at desc);

alter table public.site_analytics_events enable row level security;

drop policy if exists "Anyone can insert site analytics events" on public.site_analytics_events;
create policy "Anyone can insert site analytics events"
on public.site_analytics_events
for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can read site analytics events" on public.site_analytics_events;
create policy "Admins can read site analytics events"
on public.site_analytics_events
for select
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);
