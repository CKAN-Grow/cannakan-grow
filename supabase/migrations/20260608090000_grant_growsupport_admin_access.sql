-- Grant Grow Support the same production admin role used by founder/admin flows.
-- The durable database role is public.admin_users(user_id, email).

insert into public.admin_users (user_id, email)
select auth_users.id, lower(auth_users.email)
from auth.users auth_users
where lower(auth_users.email) = 'growsupport@cannakan.com'
on conflict (user_id) do update
set email = excluded.email;

create or replace function public.sync_growsupport_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if lower(coalesce(new.email, '')) = 'growsupport@cannakan.com' then
    insert into public.admin_users (user_id, email)
    values (new.id, lower(new.email))
    on conflict (user_id) do update
    set email = excluded.email;
  end if;

  return new;
end;
$$;

revoke all on function public.sync_growsupport_admin_user() from public;

drop trigger if exists sync_growsupport_admin_user on auth.users;
create trigger sync_growsupport_admin_user
after insert or update of email on auth.users
for each row
execute function public.sync_growsupport_admin_user();

drop policy if exists "Founder admins can read contact messages" on public.contact_messages;
create policy "Founder admins can read contact messages"
on public.contact_messages
for select
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (
    array['don@cannakan.com', 'growsupport@cannakan.com']
  )
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Founder admins can update contact messages" on public.contact_messages;
create policy "Founder admins can update contact messages"
on public.contact_messages
for update
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (
    array['don@cannakan.com', 'growsupport@cannakan.com']
  )
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (
    array['don@cannakan.com', 'growsupport@cannakan.com']
  )
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Founder admins can delete contact messages" on public.contact_messages;
create policy "Founder admins can delete contact messages"
on public.contact_messages
for delete
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (
    array['don@cannakan.com', 'growsupport@cannakan.com']
  )
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);
