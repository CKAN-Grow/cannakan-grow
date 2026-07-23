begin;

insert into auth.users (id, email, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000101', 'notes-owner-one@example.test', now(), now()),
  ('00000000-0000-0000-0000-000000000102', 'notes-owner-two@example.test', now(), now());

insert into public.grow_sessions (
  id, user_id, date, time, system_type, unit_id, session_name, entry_path
) values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', current_date, '12:00', 'Test', 'notes-1', 'Notes owner one', 'grow'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102', current_date, '12:00', 'Test', 'notes-2', 'Notes owner two', 'grow');

insert into public.grow_session_growing_phases (
  id, session_id, environment_type, grow_method
) values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', 'Indoor', 'Soil'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000202', 'Indoor', 'Soil');

insert into public.grow_session_plant_groups (
  id, growing_phase_id, plant_label, plant_count
) values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000301', 'Owner one group', 1),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000302', 'Owner two group', 1);

insert into public.grow_session_tasks (
  id, session_id, user_id, title, due_kind
) values
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'Owner one task', 'none'),
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102', 'Owner two task', 'none');

insert into public.grow_session_events (
  id, session_id, user_id, title, category, occurred_kind, occurred_date
) values
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'Owner one event', 'observation', 'date', current_date),
  ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102', 'Owner two event', 'observation', 'date', current_date);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);

insert into public.grow_session_notes (
  id, session_id, author_user_id, narrative, context_type
) values (
  '00000000-0000-0000-0000-000000000701',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101',
  'Owner CRUD note',
  'session'
);

do $$
begin
  if (select count(*) from public.grow_session_notes where id = '00000000-0000-0000-0000-000000000701') <> 1 then
    raise exception 'Owner could not read canonical Note.';
  end if;
end
$$;

update public.grow_session_notes
set narrative = 'Owner corrected note'
where id = '00000000-0000-0000-0000-000000000701';

insert into public.grow_session_notes (
  id, session_id, author_user_id, narrative, context_type, plant_group_id
) values (
  '00000000-0000-0000-0000-000000000711',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101',
  'Plant Group context',
  'plant_group',
  '00000000-0000-0000-0000-000000000401'
);

insert into public.grow_session_notes (
  id, session_id, author_user_id, narrative, context_type, task_id
) values (
  '00000000-0000-0000-0000-000000000712',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101',
  'Task context',
  'task',
  '00000000-0000-0000-0000-000000000501'
);

insert into public.grow_session_notes (
  id, session_id, author_user_id, narrative, context_type, event_id
) values (
  '00000000-0000-0000-0000-000000000713',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101',
  'Event context',
  'event',
  '00000000-0000-0000-0000-000000000601'
);

do $$
begin
  begin
    insert into public.grow_session_notes (
      session_id, author_user_id, narrative, context_type, task_id
    ) values (
      '00000000-0000-0000-0000-000000000201',
      '00000000-0000-0000-0000-000000000101',
      'Cross-Session reference',
      'task',
      '00000000-0000-0000-0000-000000000502'
    );
    raise exception 'Cross-Session Task reference was accepted.';
  exception when others then
    if sqlerrm = 'Cross-Session Task reference was accepted.' then raise; end if;
  end;

  begin
    insert into public.grow_session_notes (
      session_id, author_user_id, narrative, context_type, task_id
    ) values (
      '00000000-0000-0000-0000-000000000201',
      '00000000-0000-0000-0000-000000000101',
      'Missing reference',
      'task',
      '00000000-0000-0000-0000-000000000599'
    );
    raise exception 'Missing Task reference was accepted.';
  exception when others then
    if sqlerrm = 'Missing Task reference was accepted.' then raise; end if;
  end;

  begin
    insert into public.grow_session_notes (
      session_id, author_user_id, narrative, context_type, task_id, event_id
    ) values (
      '00000000-0000-0000-0000-000000000201',
      '00000000-0000-0000-0000-000000000101',
      'Invalid context shape',
      'task',
      '00000000-0000-0000-0000-000000000501',
      '00000000-0000-0000-0000-000000000601'
    );
    raise exception 'Invalid context shape was accepted.';
  exception when check_violation then null;
  end;

  begin
    update public.grow_session_notes
    set session_id = '00000000-0000-0000-0000-000000000202'
    where id = '00000000-0000-0000-0000-000000000701';
    raise exception 'Immutable Session containment changed.';
  exception when others then
    if sqlerrm = 'Immutable Session containment changed.' then raise; end if;
  end;

  begin
    update public.grow_session_notes
    set author_user_id = '00000000-0000-0000-0000-000000000102'
    where id = '00000000-0000-0000-0000-000000000701';
    raise exception 'Immutable Note authorship changed.';
  exception when others then
    if sqlerrm = 'Immutable Note authorship changed.' then raise; end if;
  end;

  begin
    update public.grow_session_notes
    set created_at = created_at - interval '1 day'
    where id = '00000000-0000-0000-0000-000000000701';
    raise exception 'Immutable Note created_at changed.';
  exception when others then
    if sqlerrm = 'Immutable Note created_at changed.' then raise; end if;
  end;
end
$$;

create temporary table note_source_baseline on commit drop as
select id, session_id, author_user_id, narrative, created_at
from public.grow_session_notes
where id in (
  '00000000-0000-0000-0000-000000000711',
  '00000000-0000-0000-0000-000000000712',
  '00000000-0000-0000-0000-000000000713'
);

delete from public.grow_session_plant_groups where id = '00000000-0000-0000-0000-000000000401';
delete from public.grow_session_tasks where id = '00000000-0000-0000-0000-000000000501';
delete from public.grow_session_events where id = '00000000-0000-0000-0000-000000000601';

do $$
begin
  if (
    select count(*)
    from public.grow_session_notes note
    join note_source_baseline baseline using (id, session_id, author_user_id, narrative, created_at)
  ) <> 3 then
    raise exception 'Source deletion removed or mutated a canonical Note.';
  end if;
end
$$;

update public.grow_session_notes
set narrative = 'Corrected after source deletion'
where id = '00000000-0000-0000-0000-000000000712';

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);

do $$
declare affected integer;
begin
  if (select count(*) from public.grow_session_notes where session_id = '00000000-0000-0000-0000-000000000201') <> 0 then
    raise exception 'Another owner could read Notes.';
  end if;

  update public.grow_session_notes
  set narrative = 'Unauthorized correction'
  where id = '00000000-0000-0000-0000-000000000701';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Another owner updated a Note.'; end if;

  delete from public.grow_session_notes
  where id = '00000000-0000-0000-0000-000000000701';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Another owner deleted a Note.'; end if;
end
$$;

set local role anon;
select set_config('request.jwt.claim.sub', '', true);

do $$
begin
  begin
    perform 1 from public.grow_session_notes;
    raise exception 'Anonymous Note read was accepted.';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.grow_session_notes (
      session_id, author_user_id, narrative, context_type
    ) values (
      '00000000-0000-0000-0000-000000000201',
      '00000000-0000-0000-0000-000000000101',
      'Anonymous create',
      'session'
    );
    raise exception 'Anonymous Note creation was accepted.';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.grow_session_notes
    set narrative = 'Anonymous correction'
    where id = '00000000-0000-0000-0000-000000000701';
    raise exception 'Anonymous Note correction was accepted.';
  exception when insufficient_privilege then null;
  end;

  begin
    delete from public.grow_session_notes
    where id = '00000000-0000-0000-0000-000000000701';
    raise exception 'Anonymous Note deletion was accepted.';
  exception when insufficient_privilege then null;
  end;
end
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);

delete from public.grow_session_notes
where id = '00000000-0000-0000-0000-000000000701';

do $$
begin
  if exists (select 1 from public.grow_session_notes where id = '00000000-0000-0000-0000-000000000701') then
    raise exception 'Physical Note hard deletion failed.';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'grow_session_notes'
      and column_name in ('archived_at', 'deleted_at', 'tombstone', 'recovered_at', 'retained_history')
  ) then
    raise exception 'Unauthorized Note retention state exists.';
  end if;
end
$$;

rollback;
\echo 'Growing Workspace Notes database regression checks passed.'
