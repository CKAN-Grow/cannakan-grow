alter table public.grow_sessions
  add column if not exists is_deleted boolean not null default false;

alter table public.grow_sessions
  add column if not exists deleted_at timestamptz;

alter table public.grow_sessions
  add column if not exists visibility_status text not null default 'active';

update public.grow_sessions
set visibility_status = case
  when coalesce(is_deleted, false) = true or deleted_at is not null then 'deleted'
  when coalesce(visibility_status, '') = '' then 'active'
  else visibility_status
end
where coalesce(visibility_status, '') = ''
   or coalesce(is_deleted, false) = true
   or deleted_at is not null;

create index if not exists grow_sessions_user_visibility_created_idx
  on public.grow_sessions (user_id, visibility_status, created_at desc);

create index if not exists grow_sessions_user_deleted_completed_idx
  on public.grow_sessions (user_id, is_deleted, completed_at desc);
