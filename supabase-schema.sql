create extension if not exists pgcrypto;

create table if not exists public.grow_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  time text not null,
  system_type text not null,
  unit_id text not null,
  session_name text not null,
  custom_session_name text default '',
  session_notes text default '',
  session_images jsonb not null default '[]'::jsonb,
  snapshot_state jsonb not null default '{}'::jsonb,
  session_status text default '',
  germination_started_at timestamptz,
  first_planted_at timestamptz,
  completed_at timestamptz,
  partitions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null default '',
  avatar_url text default '',
  avatar_path text default '',
  deletion_requested_at timestamptz,
  deletion_scheduled_for timestamptz,
  deletion_status text default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.grow_gallery_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.grow_sessions(id) on delete cascade,
  snapshot_title text not null,
  snapshot_image_url text not null,
  snapshot_image_path text not null default '',
  session_date date,
  system_type text not null default 'KAN',
  success_percent integer not null default 0,
  submitted_by text default '',
  include_profile_in_gallery boolean not null default false,
  submitted_profile_name text default '',
  submitted_profile_avatar_url text default '',
  status text not null default 'private',
  is_published boolean not null default true,
  include_notes boolean not null default false,
  published_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists grow_gallery_snapshots_user_session_idx
  on public.grow_gallery_snapshots (user_id, session_id)
  where session_id is not null;

alter table public.profiles
  add column if not exists deletion_requested_at timestamptz;

alter table public.profiles
  add column if not exists deletion_scheduled_for timestamptz;

alter table public.profiles
  add column if not exists deletion_status text default '';

create index if not exists grow_sessions_user_created_idx
  on public.grow_sessions (user_id, created_at desc);

alter table public.grow_sessions
  add column if not exists session_images jsonb not null default '[]'::jsonb;

alter table public.grow_sessions
  add column if not exists snapshot_state jsonb not null default '{}'::jsonb;

alter table public.grow_gallery_snapshots
  add column if not exists submitted_by text default '';

alter table public.grow_gallery_snapshots
  add column if not exists include_profile_in_gallery boolean not null default false;

alter table public.grow_gallery_snapshots
  add column if not exists submitted_profile_name text default '';

alter table public.grow_gallery_snapshots
  add column if not exists submitted_profile_avatar_url text default '';

alter table public.grow_gallery_snapshots
  add column if not exists status text not null default 'private';

update public.grow_gallery_snapshots
set status = case
  when coalesce(is_published, false) then 'approved'
  else 'private'
end
where status is null or status = '' or status = 'private';

create or replace function public.set_grow_sessions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_grow_gallery_snapshots_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists grow_sessions_set_updated_at on public.grow_sessions;
create trigger grow_sessions_set_updated_at
before update on public.grow_sessions
for each row
execute procedure public.set_grow_sessions_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute procedure public.set_profiles_updated_at();

drop trigger if exists grow_gallery_snapshots_set_updated_at on public.grow_gallery_snapshots;
create trigger grow_gallery_snapshots_set_updated_at
before update on public.grow_gallery_snapshots
for each row
execute procedure public.set_grow_gallery_snapshots_updated_at();

alter table public.grow_sessions enable row level security;
alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.grow_gallery_snapshots enable row level security;

drop policy if exists "Users can view their own grow sessions" on public.grow_sessions;
create policy "Users can view their own grow sessions"
on public.grow_sessions
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their own grow sessions" on public.grow_sessions;
create policy "Users can create their own grow sessions"
on public.grow_sessions
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own grow sessions" on public.grow_sessions;
create policy "Users can update their own grow sessions"
on public.grow_sessions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own grow sessions" on public.grow_sessions;
create policy "Users can delete their own grow sessions"
on public.grow_sessions
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can view their own admin membership" on public.admin_users;
create policy "Users can view their own admin membership"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Anyone can view published gallery snapshots" on public.grow_gallery_snapshots;
create policy "Anyone can view published gallery snapshots"
on public.grow_gallery_snapshots
for select
using (
  status = 'approved'
  or auth.uid() = user_id
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Users can create their own gallery snapshots" on public.grow_gallery_snapshots;
create policy "Users can create their own gallery snapshots"
on public.grow_gallery_snapshots
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own gallery snapshots" on public.grow_gallery_snapshots;
create policy "Users can update their own gallery snapshots"
on public.grow_gallery_snapshots
for update
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete their own gallery snapshots" on public.grow_gallery_snapshots;
create policy "Users can delete their own gallery snapshots"
on public.grow_gallery_snapshots
for delete
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

-- To make yourself an admin, add your Supabase auth user id and email to public.admin_users.

insert into storage.buckets (id, name, public)
values ('session-images', 'session-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('grow-gallery', 'grow-gallery', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can read session images" on storage.objects;
create policy "Authenticated users can read session images"
on storage.objects
for select
to authenticated
using (bucket_id = 'session-images');

drop policy if exists "Authenticated users can upload their own session images" on storage.objects;
create policy "Authenticated users can upload their own session images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'session-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can update their own session images" on storage.objects;
create policy "Authenticated users can update their own session images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'session-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'session-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can delete their own session images" on storage.objects;
create policy "Authenticated users can delete their own session images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'session-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can read profile avatars" on storage.objects;
create policy "Authenticated users can read profile avatars"
on storage.objects
for select
to authenticated
using (bucket_id = 'profile-avatars');

drop policy if exists "Authenticated users can upload their own profile avatars" on storage.objects;
create policy "Authenticated users can upload their own profile avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can update their own profile avatars" on storage.objects;
create policy "Authenticated users can update their own profile avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can delete their own profile avatars" on storage.objects;
create policy "Authenticated users can delete their own profile avatars"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Anyone can read grow gallery images" on storage.objects;
create policy "Anyone can read grow gallery images"
on storage.objects
for select
using (bucket_id = 'grow-gallery');

drop policy if exists "Authenticated users can upload their own grow gallery images" on storage.objects;
create policy "Authenticated users can upload their own grow gallery images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'grow-gallery'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can update their own grow gallery images" on storage.objects;
create policy "Authenticated users can update their own grow gallery images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'grow-gallery'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'grow-gallery'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can delete their own grow gallery images" on storage.objects;
create policy "Authenticated users can delete their own grow gallery images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'grow-gallery'
  and (storage.foldername(name))[1] = auth.uid()::text
);
