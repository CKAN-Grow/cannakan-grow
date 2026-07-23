-- ICE-GC-002C-1: canonical Session Entry discriminator.
--
-- Both entry paths remain public.grow_sessions rows. Existing rows stay null
-- and retain legacy Germination-first behavior without inferred reclassification.

alter table public.grow_sessions
  add column if not exists entry_path text;

do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.grow_sessions'::regclass
       and conname = 'grow_sessions_entry_path_check'
  ) then
    alter table public.grow_sessions
      add constraint grow_sessions_entry_path_check
      check (entry_path is null or entry_path in ('seed', 'grow'));
  end if;
end;
$$;

comment on column public.grow_sessions.entry_path is
  'Canonical Session entry path: seed begins with Germination; grow begins with Growing. Null preserves unclassified legacy Sessions.';
