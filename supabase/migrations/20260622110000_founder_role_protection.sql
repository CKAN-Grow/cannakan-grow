-- Founder-level role protection.
-- Active founders are the durable root admins and cannot be removed from admin_users.

create table if not exists public.founders (
  email text primary key,
  role text not null default 'founder',
  active boolean not null default true
);

insert into public.founders (email, role, active)
values
  ('don@cannakan.com', 'founder', true),
  ('mo@cannakan.com', 'founder', true),
  ('growsupport@cannakan.com', 'founder', true)
on conflict (email) do update
set role = excluded.role,
    active = excluded.active;

create or replace function public.is_active_founder(candidate_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.founders
    where lower(founders.email) = lower(trim(coalesce(candidate_email, '')))
      and founders.active = true
  );
$$;

revoke all on function public.is_active_founder(text) from public;
grant execute on function public.is_active_founder(text) to authenticated;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_active_founder(auth.jwt() ->> 'email')
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    );
$$;

revoke all on function public.current_user_is_admin() from public;
grant execute on function public.current_user_is_admin() to authenticated;

create or replace function public.sync_founder_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if public.is_active_founder(new.email) then
    insert into public.admin_users (user_id, email)
    values (new.id, lower(new.email))
    on conflict (user_id) do update
    set email = excluded.email;
  end if;

  return new;
end;
$$;

revoke all on function public.sync_founder_admin_user() from public;

drop trigger if exists sync_growsupport_admin_user on auth.users;
drop trigger if exists sync_founder_admin_user on auth.users;
create trigger sync_founder_admin_user
after insert or update of email on auth.users
for each row
execute function public.sync_founder_admin_user();

drop function if exists public.sync_growsupport_admin_user();

insert into public.admin_users (user_id, email)
select auth_users.id, lower(auth_users.email)
from auth.users auth_users
join public.founders
  on lower(founders.email) = lower(auth_users.email)
where founders.active = true
on conflict (user_id) do update
set email = excluded.email;

create or replace function public.protect_founder_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  old_auth_email text;
  old_founder_email text;
  new_auth_email text;
begin
  select lower(email)
  into old_auth_email
  from auth.users
  where id = old.user_id;

  old_founder_email := coalesce(old_auth_email, lower(coalesce(old.email, '')));

  if not public.is_active_founder(old_founder_email) then
    if tg_op = 'DELETE' then
      return old;
    end if;

    return new;
  end if;

  if tg_op = 'DELETE' then
    raise exception 'Founder admin access cannot be removed.' using errcode = '42501';
  end if;

  if new.user_id <> old.user_id then
    raise exception 'Founder admin access cannot be reassigned.' using errcode = '42501';
  end if;

  select lower(email)
  into new_auth_email
  from auth.users
  where id = new.user_id;

  if not public.is_active_founder(coalesce(new_auth_email, new.email)) then
    raise exception 'Founder admin access cannot be downgraded.' using errcode = '42501';
  end if;

  new.email := coalesce(new_auth_email, old_founder_email);
  return new;
end;
$$;

revoke all on function public.protect_founder_admin_user() from public;

drop trigger if exists protect_founder_admin_user on public.admin_users;
create trigger protect_founder_admin_user
before update or delete on public.admin_users
for each row
execute function public.protect_founder_admin_user();

create or replace function public.set_member_admin_access(target_user_id uuid, should_be_admin boolean)
returns table (
  user_id uuid,
  email text,
  is_admin boolean,
  is_founder boolean
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_email text;
  target_is_founder boolean;
begin
  if not public.current_user_is_admin() then
    raise exception 'Admin access is required to manage member roles.' using errcode = '42501';
  end if;

  select lower(auth_users.email)
  into target_email
  from auth.users auth_users
  where auth_users.id = target_user_id;

  if target_email is null then
    select lower(profiles.email)
    into target_email
    from public.profiles
    where profiles.id = target_user_id;
  end if;

  if target_email is null then
    raise exception 'Member account not found.' using errcode = 'P0002';
  end if;

  target_is_founder := public.is_active_founder(target_email);

  if target_is_founder and should_be_admin = false then
    raise exception 'Founder accounts cannot be demoted.' using errcode = '42501';
  end if;

  if should_be_admin or target_is_founder then
    insert into public.admin_users (user_id, email)
    values (target_user_id, target_email)
    on conflict (user_id) do update
    set email = excluded.email;
  else
    delete from public.admin_users
    where admin_users.user_id = target_user_id;
  end if;

  return query
  select
    target_user_id,
    target_email,
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = target_user_id
    ) as is_admin,
    target_is_founder as is_founder;
end;
$$;

revoke all on function public.set_member_admin_access(uuid, boolean) from public;
grant execute on function public.set_member_admin_access(uuid, boolean) to authenticated;

alter table public.founders enable row level security;

drop policy if exists "Authenticated users can read active founders" on public.founders;
create policy "Authenticated users can read active founders"
on public.founders
for select
to authenticated
using (
  active = true
  or public.current_user_is_admin()
);

drop policy if exists "Users can view their own admin membership" on public.admin_users;
create policy "Users can view their own admin membership"
on public.admin_users
for select
to authenticated
using (
  auth.uid() = user_id
  or public.current_user_is_admin()
);
