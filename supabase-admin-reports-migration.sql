-- Admin/user reporting inbox for footer contact forms and public content flags.
-- Apply this migration in Supabase before using the Report / Contact Admin inbox.

create extension if not exists pgcrypto;

create table if not exists public.admin_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text,
  email text not null default '',
  issue_type text not null default 'Other',
  message text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists admin_reports_created_at_idx
  on public.admin_reports (created_at desc);

create index if not exists admin_reports_status_created_at_idx
  on public.admin_reports (status, created_at desc);

alter table public.admin_reports enable row level security;

drop policy if exists "Anyone can insert admin reports" on public.admin_reports;
create policy "Anyone can insert admin reports"
on public.admin_reports
for insert
to anon, authenticated
with check (
  user_id is null
  or auth.uid() = user_id
);

drop policy if exists "Admins can read admin reports" on public.admin_reports;
create policy "Admins can read admin reports"
on public.admin_reports
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

drop policy if exists "Admins can update admin reports" on public.admin_reports;
create policy "Admins can update admin reports"
on public.admin_reports
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
