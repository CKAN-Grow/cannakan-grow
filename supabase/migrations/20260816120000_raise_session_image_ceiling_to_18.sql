begin;

alter table public.grow_sessions
  drop constraint if exists grow_sessions_session_images_limit_check;

alter table public.grow_sessions
  add constraint grow_sessions_session_images_limit_check check (
    jsonb_typeof(session_images) = 'array'
    and jsonb_array_length(session_images) <= 18
  ) not valid;

comment on constraint grow_sessions_session_images_limit_check on public.grow_sessions is
  'Canonical maximum of eighteen private images for the entire Session.';

notify pgrst, 'reload schema';

commit;
