alter table public.profiles
  add column if not exists notify_followed_snapshot boolean not null default true;

alter table public.profiles
  add column if not exists notify_followed_session_complete boolean not null default true;

alter table public.profiles
  add column if not exists notify_new_follower boolean not null default true;

alter table public.profiles
  add column if not exists notify_snapshot_like boolean not null default true;
