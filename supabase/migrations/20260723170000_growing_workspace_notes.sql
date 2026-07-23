-- IC-GC-004: canonical owner-private Growing Workspace Notes.
create table if not exists public.grow_session_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.grow_sessions(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  narrative text not null,
  context_type text not null default 'session',
  plant_group_id uuid,
  task_id uuid,
  event_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_notes_narrative_check check (char_length(btrim(narrative)) between 1 and 10000),
  constraint grow_session_notes_context_type_check check (context_type in ('session', 'plant_group', 'task', 'event')),
  constraint grow_session_notes_context_shape_check check (
    (context_type = 'session' and plant_group_id is null and task_id is null and event_id is null)
    or (context_type = 'plant_group' and plant_group_id is not null and task_id is null and event_id is null)
    or (context_type = 'task' and plant_group_id is null and task_id is not null and event_id is null)
    or (context_type = 'event' and plant_group_id is null and task_id is null and event_id is not null)
  )
);

create or replace function public.enforce_grow_session_note_integrity()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare session_owner uuid;
begin
  select user_id into session_owner from public.grow_sessions where id = new.session_id;
  if session_owner is null then raise exception 'Note requires an existing Session.'; end if;
  if tg_op = 'INSERT' and new.author_user_id is distinct from auth.uid() then raise exception 'Note authorship must match the authenticated creator.'; end if;
  if tg_op = 'UPDATE' then
    if new.session_id is distinct from old.session_id then raise exception 'Note containment is immutable.'; end if;
    if new.author_user_id is distinct from old.author_user_id then raise exception 'Note authorship is immutable.'; end if;
    if new.created_at is distinct from old.created_at then raise exception 'Note created_at is immutable.'; end if;
  end if;
  if new.plant_group_id is not null and (
    tg_op = 'INSERT'
    or new.context_type is distinct from old.context_type
    or new.plant_group_id is distinct from old.plant_group_id
  ) and not exists (
    select 1 from public.grow_session_plant_groups g
    join public.grow_session_growing_phases p on p.id = g.growing_phase_id
    where g.id = new.plant_group_id and p.session_id = new.session_id
  ) then raise exception 'Note Plant Group must belong to its Session.'; end if;
  if new.task_id is not null and (
    tg_op = 'INSERT'
    or new.context_type is distinct from old.context_type
    or new.task_id is distinct from old.task_id
  ) and not exists (
    select 1 from public.grow_session_tasks t where t.id = new.task_id and t.session_id = new.session_id
  ) then raise exception 'Note Task must belong to its Session.'; end if;
  if new.event_id is not null and (
    tg_op = 'INSERT'
    or new.context_type is distinct from old.context_type
    or new.event_id is distinct from old.event_id
  ) and not exists (
    select 1 from public.grow_session_events e where e.id = new.event_id and e.session_id = new.session_id
  ) then raise exception 'Note Event must belong to its Session.'; end if;
  return new;
end;
$$;
revoke all on function public.enforce_grow_session_note_integrity() from public, anon, authenticated, service_role;
drop trigger if exists grow_session_notes_enforce_integrity on public.grow_session_notes;
create trigger grow_session_notes_enforce_integrity before insert or update on public.grow_session_notes
for each row execute function public.enforce_grow_session_note_integrity();

drop trigger if exists grow_session_notes_set_updated_at on public.grow_session_notes;
create trigger grow_session_notes_set_updated_at before update on public.grow_session_notes
for each row execute function public.set_grow_session_activity_updated_at();

create index if not exists grow_session_notes_session_updated_idx on public.grow_session_notes (session_id, updated_at desc, id);
alter table public.grow_session_notes enable row level security;
drop policy if exists "Owners can read their Session notes" on public.grow_session_notes;
create policy "Owners can read their Session notes" on public.grow_session_notes for select to authenticated
using (exists (select 1 from public.grow_sessions s where s.id = grow_session_notes.session_id and s.user_id = auth.uid()));
drop policy if exists "Owners can create their Session notes" on public.grow_session_notes;
create policy "Owners can create their Session notes" on public.grow_session_notes for insert to authenticated
with check (author_user_id = auth.uid() and exists (select 1 from public.grow_sessions s where s.id = grow_session_notes.session_id and s.user_id = auth.uid()));
drop policy if exists "Owners can update their Session notes" on public.grow_session_notes;
create policy "Owners can update their Session notes" on public.grow_session_notes for update to authenticated
using (exists (select 1 from public.grow_sessions s where s.id = grow_session_notes.session_id and s.user_id = auth.uid()))
with check (exists (select 1 from public.grow_sessions s where s.id = grow_session_notes.session_id and s.user_id = auth.uid()));
drop policy if exists "Owners can delete their Session notes" on public.grow_session_notes;
create policy "Owners can delete their Session notes" on public.grow_session_notes for delete to authenticated
using (exists (select 1 from public.grow_sessions s where s.id = grow_session_notes.session_id and s.user_id = auth.uid()));
revoke all on public.grow_session_notes from public, anon, authenticated, service_role;
grant select, insert, update, delete on public.grow_session_notes to authenticated;
comment on table public.grow_session_notes is 'Canonical owner-private Growing Workspace authored narrative Notes.';
notify pgrst, 'reload schema';
