-- Recovery migration for the console errors caused by missing Supabase tables.
-- Apply this in Supabase SQL editor when `user_notification_preferences`,
-- `site_analytics_events`, `sources`, or `grow_gallery_snapshot_likes`
-- are missing from the project schema or still use an older shape.

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text default '',
  logo_path text default '',
  website_url text default '',
  description text default '',
  contact_name text default '',
  contact_email text default '',
  notes text default '',
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists sources_name_lower_idx
  on public.sources (lower(name));

create or replace function public.set_sources_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists sources_set_updated_at on public.sources;
create trigger sources_set_updated_at
before update on public.sources
for each row
execute procedure public.set_sources_updated_at();

alter table public.sources enable row level security;

drop policy if exists "Anyone can view active sources" on public.sources;
create policy "Anyone can view active sources"
on public.sources
for select
using (
  status = 'active'
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Admins can create sources" on public.sources;
create policy "Admins can create sources"
on public.sources
for insert
to authenticated
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Admins can update sources" on public.sources;
create policy "Admins can update sources"
on public.sources
for update
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Admins can delete sources" on public.sources;
create policy "Admins can delete sources"
on public.sources
for delete
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create table if not exists public.grow_gallery_snapshot_likes (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.grow_gallery_snapshots(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists grow_gallery_snapshot_likes_snapshot_user_idx
  on public.grow_gallery_snapshot_likes (snapshot_id, user_id);

create index if not exists grow_gallery_snapshot_likes_snapshot_idx
  on public.grow_gallery_snapshot_likes (snapshot_id, created_at desc);

alter table public.grow_gallery_snapshot_likes enable row level security;

drop policy if exists "Visible grow gallery likes can be read" on public.grow_gallery_snapshot_likes;
create policy "Visible grow gallery likes can be read"
on public.grow_gallery_snapshot_likes
for select
using (
  exists (
    select 1
    from public.grow_gallery_snapshots
    where grow_gallery_snapshots.id = snapshot_id
      and (
        grow_gallery_snapshots.status = 'approved'
        or auth.uid() = grow_gallery_snapshots.user_id
        or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
        or exists (
          select 1
          from public.admin_users
          where admin_users.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "Users can like visible gallery snapshots" on public.grow_gallery_snapshot_likes;
create policy "Users can like visible gallery snapshots"
on public.grow_gallery_snapshot_likes
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.grow_gallery_snapshots
    where grow_gallery_snapshots.id = snapshot_id
      and (
        grow_gallery_snapshots.status = 'approved'
        or auth.uid() = grow_gallery_snapshots.user_id
        or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
        or exists (
          select 1
          from public.admin_users
          where admin_users.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "Users can remove their own gallery likes" on public.grow_gallery_snapshot_likes;
create policy "Users can remove their own gallery likes"
on public.grow_gallery_snapshot_likes
for delete
to authenticated
using (
  auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create table if not exists public.user_notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notify_snapshot boolean not null default true,
  notify_completion boolean not null default true,
  notify_follow boolean not null default true,
  notify_like boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_notification_preferences
  add column if not exists notify_snapshot boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists notify_completion boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists notify_follow boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists notify_like boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.user_notification_preferences
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

create or replace function public.set_user_notification_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists user_notification_preferences_set_updated_at on public.user_notification_preferences;
create trigger user_notification_preferences_set_updated_at
before update on public.user_notification_preferences
for each row
execute procedure public.set_user_notification_preferences_updated_at();

alter table public.user_notification_preferences enable row level security;

drop policy if exists "Users can view their own notification preferences" on public.user_notification_preferences;
create policy "Users can view their own notification preferences"
on public.user_notification_preferences
for select
using (
  auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Users can create their own notification preferences" on public.user_notification_preferences;
create policy "Users can create their own notification preferences"
on public.user_notification_preferences
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own notification preferences" on public.user_notification_preferences;
create policy "Users can update their own notification preferences"
on public.user_notification_preferences
for update
using (
  auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

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
