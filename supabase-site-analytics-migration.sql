-- Site visitor analytics event log for admin-only reporting.
-- Apply this migration in Supabase before using historical visitor analytics.

create table if not exists public.site_analytics_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  visit_id text not null default '',
  user_id uuid references auth.users(id) on delete set null,
  profile_name text default '',
  user_email text default '',
  event_type text not null default 'page_view',
  page_group text not null default 'other',
  page_key text not null default 'other',
  page_label text default '',
  page_path text default '',
  device_type text default 'desktop',
  browser_name text default '',
  referrer text default '',
  is_pwa boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.site_analytics_events
  add column if not exists visitor_id text;

alter table public.site_analytics_events
  add column if not exists visit_id text default '';

alter table public.site_analytics_events
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.site_analytics_events
  add column if not exists profile_name text default '';

alter table public.site_analytics_events
  add column if not exists user_email text default '';

alter table public.site_analytics_events
  add column if not exists event_type text default 'page_view';

alter table public.site_analytics_events
  add column if not exists page_group text default 'other';

alter table public.site_analytics_events
  add column if not exists page_key text default 'other';

alter table public.site_analytics_events
  add column if not exists page_label text default '';

alter table public.site_analytics_events
  add column if not exists page_path text default '';

alter table public.site_analytics_events
  add column if not exists device_type text default 'desktop';

alter table public.site_analytics_events
  add column if not exists browser_name text default '';

alter table public.site_analytics_events
  add column if not exists referrer text default '';

alter table public.site_analytics_events
  add column if not exists is_pwa boolean default false;

alter table public.site_analytics_events
  add column if not exists metadata jsonb default '{}'::jsonb;

alter table public.site_analytics_events
  add column if not exists occurred_at timestamptz default timezone('utc', now());

alter table public.site_analytics_events
  add column if not exists created_at timestamptz default timezone('utc', now());

create index if not exists site_analytics_events_occurred_at_idx
  on public.site_analytics_events (occurred_at desc);

create index if not exists site_analytics_events_event_type_idx
  on public.site_analytics_events (event_type, occurred_at desc);

create index if not exists site_analytics_events_page_group_idx
  on public.site_analytics_events (page_group, occurred_at desc);

create index if not exists site_analytics_events_visitor_idx
  on public.site_analytics_events (visitor_id, occurred_at desc);

create index if not exists site_analytics_events_user_idx
  on public.site_analytics_events (user_id, occurred_at desc);

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
