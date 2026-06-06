-- Create the contact_messages inbox table used by Contact submissions and
-- the admin-only Communications inbox.

create extension if not exists pgcrypto;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'Other',
  name text not null default '',
  email text not null default '',
  company text,
  website text,
  subject text,
  message text not null default '',
  routed_to text not null default 'growsupport@cannakan.com',
  status text not null default 'new',
  internal_notes text,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contact_messages
  add column if not exists type text not null default 'Other',
  add column if not exists name text not null default '',
  add column if not exists email text not null default '',
  add column if not exists company text,
  add column if not exists website text,
  add column if not exists subject text,
  add column if not exists message text not null default '',
  add column if not exists routed_to text not null default 'growsupport@cannakan.com',
  add column if not exists status text not null default 'new',
  add column if not exists internal_notes text,
  add column if not exists submitted_at timestamptz not null default now(),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.contact_messages
  alter column status set default 'new',
  alter column submitted_at set default now(),
  alter column created_at set default now(),
  alter column updated_at set default now();

create index if not exists contact_messages_submitted_at_idx
  on public.contact_messages (submitted_at desc);

create index if not exists contact_messages_status_submitted_at_idx
  on public.contact_messages (status, submitted_at desc);

create or replace function public.set_contact_messages_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contact_messages_set_updated_at on public.contact_messages;
create trigger contact_messages_set_updated_at
before update on public.contact_messages
for each row
execute function public.set_contact_messages_updated_at();

alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can insert contact messages" on public.contact_messages;
create policy "Anyone can insert contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

drop policy if exists "Founder admins can read contact messages" on public.contact_messages;
create policy "Founder admins can read contact messages"
on public.contact_messages
for select
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'don@cannakan.com'
);

drop policy if exists "Founder admins can update contact messages" on public.contact_messages;
create policy "Founder admins can update contact messages"
on public.contact_messages
for update
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'don@cannakan.com'
)
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'don@cannakan.com'
);

drop policy if exists "Founder admins can delete contact messages" on public.contact_messages;
create policy "Founder admins can delete contact messages"
on public.contact_messages
for delete
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'don@cannakan.com'
);
