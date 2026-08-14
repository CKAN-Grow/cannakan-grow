-- Private Session Journal: immutable note context, canonical image limit, and owner-private image reads.
alter table public.grow_session_notes
  add column if not exists journal_phase text,
  add column if not exists journal_phase_label text,
  add column if not exists journal_day_label text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.grow_session_notes'::regclass
      and conname = 'grow_session_notes_journal_context_check'
  ) then
    alter table public.grow_session_notes
      add constraint grow_session_notes_journal_context_check check (
        journal_phase is null
        or (
          context_type = 'session'
          and journal_phase in ('germination', 'grow', 'reflection')
          and char_length(btrim(journal_phase_label)) between 1 and 40
          and (journal_day_label is null or char_length(btrim(journal_day_label)) between 1 and 40)
          and char_length(btrim(narrative)) between 1 and 2000
        )
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.grow_sessions'::regclass
      and conname = 'grow_sessions_session_images_limit_check'
  ) then
    alter table public.grow_sessions
      add constraint grow_sessions_session_images_limit_check check (
        jsonb_typeof(session_images) = 'array'
        and jsonb_array_length(session_images) <= 3
      ) not valid;
  end if;
end;
$$;

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
    if new.journal_phase is distinct from old.journal_phase
      or new.journal_phase_label is distinct from old.journal_phase_label
      or new.journal_day_label is distinct from old.journal_day_label then
      raise exception 'Journal phase and day context are immutable.';
    end if;
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

drop policy if exists "Authenticated users can read session images" on storage.objects;
drop policy if exists "Owners can read their own session images" on storage.objects;
create policy "Authenticated users can read eligible session images"
on storage.objects for select to authenticated
using (
  bucket_id = 'session-images'
  and (
    (storage.foldername(name))[3] is distinct from 'journal'
    or
    (storage.foldername(name))[1] = auth.uid()::text
    or public.current_user_is_admin()
  )
);

comment on column public.grow_session_notes.journal_phase is 'Immutable canonical Session phase captured when a private Journal note is created.';
comment on column public.grow_session_notes.journal_phase_label is 'Immutable grower-facing phase label captured when a private Journal note is created.';
comment on column public.grow_session_notes.journal_day_label is 'Immutable canonical phase/day context captured when a private Journal note is created.';
comment on constraint grow_sessions_session_images_limit_check on public.grow_sessions is 'Canonical maximum of three private images for the entire Session.';
notify pgrst, 'reload schema';
