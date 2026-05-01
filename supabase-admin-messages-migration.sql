-- Admin/user reporting inbox for bugs, content flags, and support questions.
-- Apply this migration in Supabase before using the Report / Contact Admin workflow.

create extension if not exists pgcrypto;

create table if not exists public.admin_messages (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  message_type text,
  message text not null,
  page_context text,
  session_id text,
  snapshot_id text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists admin_messages_created_at_idx
  on public.admin_messages (created_at desc);

create index if not exists admin_messages_status_created_at_idx
  on public.admin_messages (status, created_at desc);

alter table public.admin_messages enable row level security;

drop policy if exists "Anyone can insert admin messages" on public.admin_messages;
create policy "Anyone can insert admin messages"
on public.admin_messages
for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can read admin messages" on public.admin_messages;
create policy "Admins can read admin messages"
on public.admin_messages
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

drop policy if exists "Admins can update admin messages" on public.admin_messages;
create policy "Admins can update admin messages"
on public.admin_messages
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
