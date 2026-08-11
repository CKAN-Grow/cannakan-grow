-- Germination Setup coordinates Session-owned frozen evidence with Seed
-- Vault-owned inventory through one owner-scoped, idempotent transaction.

alter table public.seed_vault_entries
  add column if not exists inventory_depleted_at timestamptz;

alter table public.seed_vault_entries
  drop constraint if exists seed_vault_entries_quantity_positive;

alter table public.seed_vault_entries
  drop constraint if exists seed_vault_entries_germination_inventory_boundary;
alter table public.seed_vault_entries
  add constraint seed_vault_entries_germination_inventory_boundary
  check (
    quantity is not null
    and quantity >= 0
    and (quantity > 0 or inventory_depleted_at is not null)
  );

create or replace function public.enforce_seed_vault_germination_depletion()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.quantity = 0
    and coalesce(current_setting('app.germination_setup_inventory_write', true), 'false') <> 'true' then
    raise exception 'Seed Vault depletion must use the Germination Setup inventory operation.'
      using errcode = '42501';
  end if;

  if new.quantity > 0 then
    new.inventory_depleted_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists seed_vault_entries_enforce_germination_depletion
  on public.seed_vault_entries;
create trigger seed_vault_entries_enforce_germination_depletion
  before insert or update of quantity, inventory_depleted_at
  on public.seed_vault_entries
  for each row execute function public.enforce_seed_vault_germination_depletion();

create table if not exists public.grow_session_germination_setups (
  session_id uuid primary key references public.grow_sessions(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  revision bigint not null default 1,
  setup_evidence jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_germination_setups_revision_check check (revision >= 1),
  constraint grow_session_germination_setups_evidence_check
    check (jsonb_typeof(setup_evidence) = 'object')
);

create table if not exists public.grow_session_germination_operations (
  operation_id uuid primary key,
  session_id uuid not null references public.grow_sessions(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  operation_kind text not null,
  input_fingerprint text not null,
  before_revision bigint not null,
  after_revision bigint not null,
  before_evidence jsonb not null,
  after_evidence jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_germination_operations_kind_check
    check (operation_kind in ('create', 'correction', 'no_change')),
  constraint grow_session_germination_operations_revision_check
    check (before_revision >= 0 and after_revision >= before_revision),
  constraint grow_session_germination_operations_fingerprint_check
    check (input_fingerprint ~ '^[0-9a-f]{64}$')
);

create table if not exists public.seed_vault_germination_inventory_operations (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null
    references public.grow_session_germination_operations(operation_id)
    deferrable initially deferred,
  session_id uuid not null references public.grow_sessions(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  vault_entry_id uuid not null references public.seed_vault_entries(id) on delete restrict,
  operation_kind text not null,
  quantity_delta integer not null,
  quantity_before integer not null,
  quantity_after integer not null,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint seed_vault_germination_inventory_operations_unique
    unique (operation_id, vault_entry_id),
  constraint seed_vault_germination_inventory_operations_kind_check
    check (operation_kind in ('allocation', 'correction')),
  constraint seed_vault_germination_inventory_operations_delta_check
    check (quantity_delta <> 0),
  constraint seed_vault_germination_inventory_operations_quantity_check
    check (quantity_before >= 0 and quantity_after >= 0
      and quantity_after = quantity_before + quantity_delta),
  constraint seed_vault_germination_inventory_operations_evidence_check
    check (jsonb_typeof(evidence) = 'object')
);

create index if not exists grow_session_germination_setups_owner_updated_idx
  on public.grow_session_germination_setups (owner_user_id, updated_at desc);
create index if not exists grow_session_germination_operations_session_created_idx
  on public.grow_session_germination_operations (session_id, created_at desc);
create index if not exists seed_vault_germination_inventory_entry_created_idx
  on public.seed_vault_germination_inventory_operations (vault_entry_id, created_at desc);

alter table public.grow_session_germination_setups enable row level security;
alter table public.grow_session_germination_operations enable row level security;
alter table public.seed_vault_germination_inventory_operations enable row level security;

drop policy if exists "Owners can read Germination Setup evidence"
  on public.grow_session_germination_setups;
create policy "Owners can read Germination Setup evidence"
  on public.grow_session_germination_setups
  for select to authenticated
  using (
    owner_user_id = auth.uid()
    and exists (
      select 1 from public.grow_sessions session_row
      where session_row.id = session_id and session_row.user_id = auth.uid()
    )
  );

drop policy if exists "Owners can read Germination Setup operations"
  on public.grow_session_germination_operations;
create policy "Owners can read Germination Setup operations"
  on public.grow_session_germination_operations
  for select to authenticated
  using (
    owner_user_id = auth.uid()
    and exists (
      select 1 from public.grow_sessions session_row
      where session_row.id = session_id and session_row.user_id = auth.uid()
    )
  );

drop policy if exists "Owners can read Germination Seed Vault operations"
  on public.seed_vault_germination_inventory_operations;
create policy "Owners can read Germination Seed Vault operations"
  on public.seed_vault_germination_inventory_operations
  for select to authenticated
  using (
    owner_user_id = auth.uid()
    and exists (
      select 1 from public.grow_sessions session_row
      where session_row.id = session_id and session_row.user_id = auth.uid()
    )
    and exists (
      select 1 from public.seed_vault_entries vault_row
      where vault_row.id = vault_entry_id and vault_row.user_id = auth.uid()
    )
  );

revoke all on public.grow_session_germination_setups
  from public, anon, authenticated, service_role;
revoke all on public.grow_session_germination_operations
  from public, anon, authenticated, service_role;
revoke all on public.seed_vault_germination_inventory_operations
  from public, anon, authenticated, service_role;
grant select on public.grow_session_germination_setups to authenticated;
grant select on public.grow_session_germination_operations to authenticated;
grant select on public.seed_vault_germination_inventory_operations to authenticated;

create or replace function public.get_germination_setup_vault_entries_v1()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  saved_result jsonb;
begin
  if actor_id is null then
    raise exception 'You must be signed in to load Germination Setup inventory.'
      using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(to_jsonb(vault_record) order by vault_record.seed_variety, vault_record.id), '[]'::jsonb)
  into saved_result
  from (
    select
      vault_row.id,
      coalesce(nullif(vault_row.seed_variety, ''), nullif(vault_row.seed_name, '')) as seed_variety,
      vault_row.source,
      vault_row.breeder,
      vault_row.seed_type,
      coalesce(nullif(vault_row.sex, ''), nullif(vault_row.seed_sex, '')) as sex,
      vault_row.quantity,
      vault_row.year_acquired,
      vault_row.acquired_at
    from public.seed_vault_entries vault_row
    where vault_row.user_id = actor_id
      and not coalesce(vault_row.is_archived, false)
      and not coalesce(vault_row.is_deleted, false)
      and vault_row.quantity > 0
    order by coalesce(nullif(vault_row.seed_variety, ''), nullif(vault_row.seed_name, '')), vault_row.id
  ) vault_record;

  return saved_result;
end;
$$;

create or replace function public.get_germination_setup_v1(p_session_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  session_row public.grow_sessions%rowtype;
  setup_row public.grow_session_germination_setups%rowtype;
  inventory_result jsonb;
begin
  if actor_id is null then
    raise exception 'You must be signed in to load Germination Setup.'
      using errcode = '42501';
  end if;
  if p_session_id is null then
    raise exception 'A Session identity is required.' using errcode = '22023';
  end if;

  select * into session_row
  from public.grow_sessions
  where id = p_session_id and user_id = actor_id;
  if not found then
    raise exception 'The Germination Setup is not accessible.' using errcode = '42501';
  end if;

  select * into setup_row
  from public.grow_session_germination_setups
  where session_id = p_session_id and owner_user_id = actor_id;
  if not found then
    raise exception 'The Germination Setup was not found.' using errcode = 'P0002';
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'vault_entry_id', allocation.vault_entry_id,
      'available_quantity', vault_row.quantity,
      'allocated_quantity', allocation.allocated_quantity,
      'is_archived', coalesce(vault_row.is_archived, false),
      'is_deleted', coalesce(vault_row.is_deleted, false)
    ) order by allocation.vault_entry_id
  ), '[]'::jsonb)
  into inventory_result
  from (
    select
      (entry ->> 'vault_entry_id')::uuid as vault_entry_id,
      sum((entry ->> 'quantity')::integer)::integer as allocated_quantity
    from jsonb_array_elements(setup_row.setup_evidence -> 'entries') entry
    where entry ->> 'reference_type' = 'vault'
      and nullif(entry ->> 'vault_entry_id', '') is not null
    group by (entry ->> 'vault_entry_id')::uuid
  ) allocation
  join public.seed_vault_entries vault_row
    on vault_row.id = allocation.vault_entry_id
   and vault_row.user_id = actor_id;

  return jsonb_build_object(
    'session', jsonb_build_object(
      'id', session_row.id,
      'session_name', session_row.session_name,
      'proposed_start', session_row.date,
      'method_type', session_row.system_type,
      'germination_started_at', session_row.germination_started_at,
      'session_status', session_row.session_status
    ),
    'revision', setup_row.revision,
    'setup', setup_row.setup_evidence,
    'vault_inventory', inventory_result,
    'created_at', setup_row.created_at,
    'updated_at', setup_row.updated_at
  );
end;
$$;

create or replace function public.save_germination_setup_v1(
  p_session_id uuid,
  p_operation_id uuid,
  p_expected_revision bigint,
  p_setup jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  operation_at timestamptz := clock_timestamp();
  fingerprint text;
  existing_operation public.grow_session_germination_operations%rowtype;
  session_row public.grow_sessions%rowtype;
  setup_row public.grow_session_germination_setups%rowtype;
  vault_row public.seed_vault_entries%rowtype;
  session_exists boolean := false;
  normalized_session_name text;
  proposed_start date;
  method_type text;
  tracking_mode text;
  raw_entries jsonb;
  raw_entry jsonb;
  previous_entry jsonb;
  normalized_entry jsonb;
  normalized_entries jsonb := '[]'::jsonb;
  normalized_evidence jsonb;
  before_evidence jsonb := '{}'::jsonb;
  before_revision bigint := 0;
  after_revision bigint;
  entry_id text;
  position_label text;
  reference_type text;
  vault_entry_id uuid;
  vault_ids uuid[] := array[]::uuid[];
  entry_quantity integer;
  seed_variety text;
  source_name text;
  breeder_name text;
  seed_type text;
  seed_sex text;
  age_reference_kind text;
  age_source_value text;
  age_precision text;
  age_provenance text;
  age_captured_at timestamptz;
  same_age_evidence jsonb;
  current_age_evidence jsonb;
  vault_snapshot jsonb;
  previous_quantity integer;
  desired_quantity integer;
  allocation_delta integer;
  quantity_before integer;
  quantity_after integer;
  saved_result jsonb;
begin
  if actor_id is null then
    raise exception 'You must be signed in to save Germination Setup.'
      using errcode = '42501';
  end if;
  if p_session_id is null or p_operation_id is null
    or p_expected_revision is null or p_expected_revision < 0
    or jsonb_typeof(p_setup) is distinct from 'object' then
    raise exception 'Session, operation, expected revision, and setup are required.'
      using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_object_keys(p_setup) field
    where field not in ('session_name', 'proposed_start', 'method_type', 'tracking_mode', 'entries')
  ) then
    raise exception 'The Germination Setup contains an unauthorized field.'
      using errcode = '22023';
  end if;

  fingerprint := encode(
    extensions.digest(
      jsonb_build_object(
        'session_id', p_session_id,
        'expected_revision', p_expected_revision,
        'setup', p_setup
      )::text,
      'sha256'
    ),
    'hex'
  );

  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text, 0));
  select * into existing_operation
  from public.grow_session_germination_operations
  where operation_id = p_operation_id
  for update;
  if found then
    if existing_operation.session_id is distinct from p_session_id
      or existing_operation.owner_user_id is distinct from actor_id
      or existing_operation.input_fingerprint is distinct from fingerprint then
      raise exception 'The operation identity was already used with different input.'
        using errcode = '23505';
    end if;
    if not exists (
      select 1 from public.grow_sessions
      where id = p_session_id and user_id = actor_id
    ) then
      raise exception 'The Germination Setup operation is not accessible.'
        using errcode = '42501';
    end if;
    return existing_operation.result;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_session_id::text, 0));
  select * into session_row
  from public.grow_sessions
  where id = p_session_id
  for update;
  if found then
    session_exists := true;
    if session_row.user_id is distinct from actor_id then
      raise exception 'The Germination Setup is not accessible.' using errcode = '42501';
    end if;
    if session_row.germination_started_at is not null
      or lower(coalesce(session_row.session_status, '')) in ('completed', 'deleted', 'archived', 'abandoned', 'failed', 'canceled', 'cancelled') then
      raise exception 'Germination Setup can only be changed before Germination starts.'
        using errcode = '23514';
    end if;
  end if;

  select * into setup_row
  from public.grow_session_germination_setups
  where session_id = p_session_id
  for update;
  if found then
    if setup_row.owner_user_id is distinct from actor_id then
      raise exception 'The Germination Setup is not accessible.' using errcode = '42501';
    end if;
    before_revision := setup_row.revision;
    before_evidence := setup_row.setup_evidence;
  end if;
  if before_revision is distinct from p_expected_revision then
    raise exception 'The Germination Setup revision is stale.' using errcode = '40001';
  end if;

  normalized_session_name := btrim(coalesce(p_setup ->> 'session_name', ''));
  if normalized_session_name = '' or char_length(normalized_session_name) > 80 then
    raise exception 'Session name must contain between 1 and 80 characters.'
      using errcode = '22023';
  end if;
  begin
    proposed_start := (p_setup ->> 'proposed_start')::date;
  exception when others then
    raise exception 'Proposed start must be a valid date.' using errcode = '22023';
  end;
  method_type := upper(btrim(coalesce(p_setup ->> 'method_type', '')));
  if method_type not in ('KAN', 'PAPER_TOWEL', 'PAPER_TOWEL_SOAK', 'ROCKWOOL', 'RAPID_ROOTER', 'WATER_SOAK', 'DIRECT_SOW', 'OTHER') then
    raise exception 'The Germination method is invalid.' using errcode = '22023';
  end if;
  tracking_mode := lower(btrim(coalesce(p_setup ->> 'tracking_mode', '')));
  if tracking_mode not in ('same', 'mixed') then
    raise exception 'The seed-age recording choice is invalid.' using errcode = '22023';
  end if;
  raw_entries := p_setup -> 'entries';
  if jsonb_typeof(raw_entries) is distinct from 'array'
    or jsonb_array_length(raw_entries) < 1 then
    raise exception 'Germination Setup requires at least one Seed Entry.'
      using errcode = '22023';
  end if;
  if method_type = 'KAN' and jsonb_array_length(raw_entries) > 8 then
    raise exception 'KAN supports no more than 8 populated Seed Entries.'
      using errcode = '22023';
  end if;

  for raw_entry in select value from jsonb_array_elements(raw_entries)
  loop
    if jsonb_typeof(raw_entry) is distinct from 'object'
      or exists (
        select 1 from jsonb_object_keys(raw_entry) field
        where field not in (
          'id', 'position', 'quantity', 'reference_type', 'vault_entry_id',
          'variety', 'source', 'breeder', 'seed_type', 'sex',
          'age_reference_kind', 'age_source_value'
        )
      ) then
      raise exception 'A Seed Entry contains an unauthorized field.' using errcode = '22023';
    end if;
    reference_type := lower(btrim(coalesce(raw_entry ->> 'reference_type', '')));
    if reference_type not in ('vault', 'manual') then
      raise exception 'A Seed Entry source is invalid.' using errcode = '22023';
    end if;
    if reference_type = 'vault' then
      begin
        vault_entry_id := nullif(btrim(coalesce(raw_entry ->> 'vault_entry_id', '')), '')::uuid;
      exception when others then
        raise exception 'A Vault-backed Seed Entry requires a valid Vault identity.'
          using errcode = '22023';
      end;
      if vault_entry_id is null then
        raise exception 'A Vault-backed Seed Entry requires a Vault identity.'
          using errcode = '22023';
      end if;
      if not vault_entry_id = any(vault_ids) then
        vault_ids := array_append(vault_ids, vault_entry_id);
      end if;
    end if;
  end loop;

  if jsonb_typeof(before_evidence -> 'entries') = 'array' then
    for previous_entry in select value from jsonb_array_elements(before_evidence -> 'entries')
    loop
      if previous_entry ->> 'reference_type' = 'vault'
        and nullif(previous_entry ->> 'vault_entry_id', '') is not null then
        vault_entry_id := (previous_entry ->> 'vault_entry_id')::uuid;
        if not vault_entry_id = any(vault_ids) then
          vault_ids := array_append(vault_ids, vault_entry_id);
        end if;
      end if;
    end loop;
  end if;

  for vault_entry_id in
    select distinct vault_identity from unnest(vault_ids) vault_identity order by vault_identity
  loop
    select * into vault_row
    from public.seed_vault_entries
    where id = vault_entry_id
    for update;
    if not found or vault_row.user_id is distinct from actor_id then
      raise exception 'A referenced Vault Entry is not accessible.' using errcode = '42501';
    end if;
  end loop;

  for raw_entry in select value from jsonb_array_elements(raw_entries)
  loop
    entry_id := btrim(coalesce(raw_entry ->> 'id', ''));
    position_label := nullif(btrim(coalesce(raw_entry ->> 'position', '')), '');
    reference_type := lower(btrim(coalesce(raw_entry ->> 'reference_type', '')));
    if entry_id = '' or char_length(entry_id) > 160
      or char_length(position_label) > 80 then
      raise exception 'Every Seed Entry requires a bounded identity and any supplied position must be bounded.'
        using errcode = '22023';
    end if;
    if method_type in ('KAN', 'ROCKWOOL', 'RAPID_ROOTER', 'DIRECT_SOW', 'OTHER')
      and position_label is null then
      raise exception 'This Germination method requires a physical position for every Seed Entry.'
        using errcode = '22023';
    end if;
    if method_type in ('PAPER_TOWEL', 'PAPER_TOWEL_SOAK', 'WATER_SOAK')
      and position_label is not null then
      raise exception 'Shared Germination methods must not persist entry-level physical positions.'
        using errcode = '22023';
    end if;
    if (method_type = 'KAN' and position_label !~ '^P[1-8]$')
      or (method_type = 'ROCKWOOL' and position_label !~ '^Cube [1-9][0-9]*$')
      or (method_type = 'RAPID_ROOTER' and position_label !~ '^Plug [1-9][0-9]*$')
      or (method_type = 'DIRECT_SOW' and position_label !~ '^Planting position [1-9][0-9]*$') then
      raise exception 'A Seed Entry has an invalid method-specific assignment.'
        using errcode = '22023';
    end if;
    if exists (
      select 1 from jsonb_array_elements(normalized_entries) entry
      where entry ->> 'id' = entry_id
        or (position_label is not null and entry ->> 'position' = position_label)
    ) then
      raise exception 'Seed Entry identities and positions must be unique.'
        using errcode = '23505';
    end if;
    begin
      entry_quantity := (raw_entry ->> 'quantity')::integer;
    exception when others then
      raise exception 'Seed Entry quantity must be a whole number.' using errcode = '22023';
    end;
    if entry_quantity < 1 then
      raise exception 'Seed Entry quantity must be positive.' using errcode = '22023';
    end if;
    if method_type in ('ROCKWOOL', 'RAPID_ROOTER', 'DIRECT_SOW')
      and entry_quantity <> 1 then
      raise exception 'Individually positioned Germination methods require quantity one per Seed Entry.'
        using errcode = '22023';
    end if;

    seed_type := lower(btrim(coalesce(raw_entry ->> 'seed_type', 'unknown')));
    seed_sex := lower(btrim(coalesce(raw_entry ->> 'sex', 'unknown')));
    if seed_type not in ('unknown', 'photoperiod', 'autoflower')
      or seed_sex not in ('unknown', 'feminized', 'regular') then
      raise exception 'Seed type or sex is invalid.' using errcode = '22023';
    end if;

    age_reference_kind := lower(btrim(coalesce(raw_entry ->> 'age_reference_kind', 'unknown')));
    age_source_value := btrim(coalesce(raw_entry ->> 'age_source_value', ''));
    if age_reference_kind not in ('unknown', 'acquisition_year', 'user_statement')
      or char_length(age_source_value) > 120 then
      raise exception 'Seed-age evidence is invalid.' using errcode = '22023';
    end if;
    if age_reference_kind = 'unknown' and age_source_value <> '' then
      raise exception 'Unknown seed age cannot retain a source-specific value.' using errcode = '22023';
    end if;
    if age_reference_kind = 'acquisition_year' then
      if age_source_value !~ '^[0-9]{4}$'
        or age_source_value::integer < 1980 or age_source_value::integer > 2100 then
        raise exception 'Acquired year must be between 1980 and 2100.' using errcode = '22023';
      end if;
    end if;
    if age_reference_kind = 'user_statement' then
      if age_source_value !~ '^[0-9]+([.]5)?$'
        or age_source_value::numeric < 1 or age_source_value::numeric > 99 then
        raise exception 'Grower estimate must be 1 through 99 years in 0.5-year increments.'
          using errcode = '22023';
      end if;
    end if;
    current_age_evidence := jsonb_build_object(
      'reference_kind', age_reference_kind,
      'source_value', nullif(age_source_value, '')
    );
    if tracking_mode = 'same' then
      if same_age_evidence is null then
        same_age_evidence := current_age_evidence;
      elsif same_age_evidence is distinct from current_age_evidence then
        raise exception 'Same seed-age tracking requires one qualified source and value.'
          using errcode = '22023';
      end if;
    end if;

    select value into previous_entry
    from jsonb_array_elements(coalesce(before_evidence -> 'entries', '[]'::jsonb))
    where value ->> 'id' = entry_id
    limit 1;

    if reference_type = 'vault' then
      vault_entry_id := (raw_entry ->> 'vault_entry_id')::uuid;
      select * into vault_row from public.seed_vault_entries where id = vault_entry_id;
      if previous_entry is not null
        and previous_entry ->> 'reference_type' = 'vault'
        and previous_entry ->> 'vault_entry_id' = vault_entry_id::text then
        seed_variety := previous_entry ->> 'variety';
        source_name := coalesce(previous_entry ->> 'source', '');
        breeder_name := coalesce(previous_entry ->> 'breeder', '');
        vault_snapshot := previous_entry -> 'vault_snapshot';
      else
        if coalesce(vault_row.is_archived, false) or coalesce(vault_row.is_deleted, false)
          or vault_row.quantity <= 0 then
          raise exception 'A selected Vault Entry is archived, deleted, or depleted.'
            using errcode = '23514';
        end if;
        seed_variety := btrim(coalesce(nullif(vault_row.seed_variety, ''), nullif(vault_row.seed_name, ''), ''));
        source_name := btrim(coalesce(vault_row.source, ''));
        breeder_name := btrim(coalesce(vault_row.breeder, ''));
        vault_snapshot := jsonb_build_object(
          'vault_entry_id', vault_row.id,
          'variety', nullif(seed_variety, ''),
          'source', nullif(source_name, ''),
          'breeder', nullif(breeder_name, ''),
          'seed_type', nullif(lower(btrim(coalesce(vault_row.seed_type, ''))), ''),
          'sex', nullif(lower(btrim(coalesce(nullif(vault_row.sex, ''), nullif(vault_row.seed_sex, ''), ''))), ''),
          'year_acquired', vault_row.year_acquired,
          'acquired_at', vault_row.acquired_at,
          'quantity_at_capture', vault_row.quantity,
          'captured_at', operation_at
        );
      end if;
      if seed_variety = '' then
        raise exception 'A selected Vault Entry has no variety identity.' using errcode = '23514';
      end if;
      if age_reference_kind = 'acquisition_year' and age_source_value = ''
        and previous_entry is null and vault_row.year_acquired is not null then
        age_source_value := vault_row.year_acquired::text;
      end if;
    else
      vault_entry_id := null;
      seed_variety := btrim(coalesce(raw_entry ->> 'variety', ''));
      source_name := btrim(coalesce(raw_entry ->> 'source', ''));
      breeder_name := btrim(coalesce(raw_entry ->> 'breeder', ''));
      vault_snapshot := null;
      if seed_variety = '' or char_length(seed_variety) > 160
        or char_length(source_name) > 160 or char_length(breeder_name) > 160 then
        raise exception 'Manual Seed Entries require a bounded variety.' using errcode = '22023';
      end if;
    end if;

    if age_reference_kind = 'acquisition_year' then
      age_precision := 'year';
      age_provenance := case when reference_type = 'vault' then 'seed_vault' else 'grower_provided' end;
    elsif age_reference_kind = 'user_statement' then
      age_precision := 'approximate_statement';
      age_provenance := 'grower_statement';
    else
      age_precision := 'unknown';
      age_provenance := 'explicit_unknown';
    end if;
    age_captured_at := coalesce(
      nullif(previous_entry #>> '{seed_age,captured_at}', '')::timestamptz,
      operation_at
    );

    normalized_entry := jsonb_build_object(
      'id', entry_id,
      'position', position_label,
      'quantity', entry_quantity,
      'reference_type', reference_type,
      'vault_entry_id', vault_entry_id,
      'variety', seed_variety,
      'source', nullif(source_name, ''),
      'breeder', nullif(breeder_name, ''),
      'seed_type', seed_type,
      'sex', seed_sex,
      'seed_age', jsonb_build_object(
        'reference_kind', age_reference_kind,
        'source_value', nullif(age_source_value, ''),
        'precision', age_precision,
        'provenance', age_provenance,
        'evaluation_point', 'canonical_germination_commencement',
        'evaluation_status', 'unresolved',
        'captured_at', age_captured_at
      ),
      'vault_snapshot', vault_snapshot,
      'provenance', case when reference_type = 'vault' then 'seed_vault_snapshot' else 'grower_provided' end
    );
    normalized_entries := normalized_entries || jsonb_build_array(normalized_entry);
  end loop;

  normalized_evidence := jsonb_build_object(
    'schema_version', 1,
    'session_name', normalized_session_name,
    'proposed_start', proposed_start,
    'method_type', method_type,
    'tracking_mode', tracking_mode,
    'entries', normalized_entries,
    'captured_at', coalesce(nullif(before_evidence ->> 'captured_at', '')::timestamptz, operation_at),
    'updated_at', operation_at
  );

  if before_revision > 0
    and (before_evidence - 'updated_at') = (normalized_evidence - 'updated_at') then
    saved_result := public.get_germination_setup_v1(p_session_id)
      || jsonb_build_object(
        'operation_id', p_operation_id,
        'operation_kind', 'save_germination_setup',
        'status', 'no_change'
      );
    insert into public.grow_session_germination_operations (
      operation_id, session_id, owner_user_id, operation_kind, input_fingerprint,
      before_revision, after_revision, before_evidence, after_evidence, result, created_at
    ) values (
      p_operation_id, p_session_id, actor_id, 'no_change', fingerprint,
      before_revision, before_revision, before_evidence, before_evidence, saved_result, operation_at
    );
    return saved_result;
  end if;

  if not session_exists then
    insert into public.grow_sessions (
      id, user_id, date, time, system_type, unit_id, session_name,
      session_status, entry_path, partitions, created_at, updated_at
    ) values (
      p_session_id, actor_id, proposed_start, '', method_type, '', normalized_session_name,
      'active', 'seed', '[]'::jsonb, operation_at, operation_at
    ) returning * into session_row;
  else
    update public.grow_sessions
    set system_type = method_type,
        session_name = normalized_session_name,
        updated_at = operation_at
    where id = p_session_id and user_id = actor_id
    returning * into session_row;
  end if;

  perform set_config('app.germination_setup_inventory_write', 'true', true);
  for vault_entry_id in
    select distinct vault_identity from unnest(vault_ids) vault_identity order by vault_identity
  loop
    select coalesce(sum((entry ->> 'quantity')::integer), 0)::integer
    into previous_quantity
    from jsonb_array_elements(coalesce(before_evidence -> 'entries', '[]'::jsonb)) entry
    where entry ->> 'reference_type' = 'vault'
      and entry ->> 'vault_entry_id' = vault_entry_id::text;
    select coalesce(sum((entry ->> 'quantity')::integer), 0)::integer
    into desired_quantity
    from jsonb_array_elements(normalized_entries) entry
    where entry ->> 'reference_type' = 'vault'
      and entry ->> 'vault_entry_id' = vault_entry_id::text;
    allocation_delta := desired_quantity - previous_quantity;
    if allocation_delta = 0 then
      continue;
    end if;

    select * into vault_row
    from public.seed_vault_entries
    where id = vault_entry_id and user_id = actor_id
    for update;
    if not found then
      raise exception 'A referenced Vault Entry is not accessible.' using errcode = '42501';
    end if;
    quantity_before := vault_row.quantity;
    quantity_after := quantity_before - allocation_delta;
    if allocation_delta > 0
      and (coalesce(vault_row.is_archived, false) or coalesce(vault_row.is_deleted, false)) then
      raise exception 'A selected Vault Entry is archived or deleted.' using errcode = '23514';
    end if;
    if quantity_after < 0 then
      raise exception 'The requested Seed Vault allocation exceeds current availability.'
        using errcode = '23514';
    end if;

    update public.seed_vault_entries
    set quantity = quantity_after,
        seed_count = quantity_after,
        remaining_count = quantity_after,
        inventory_depleted_at = case when quantity_after = 0 then operation_at else null end,
        updated_at = operation_at
    where id = vault_entry_id and user_id = actor_id;

    insert into public.seed_vault_germination_inventory_operations (
      operation_id, session_id, owner_user_id, vault_entry_id, operation_kind,
      quantity_delta, quantity_before, quantity_after, evidence, created_at
    ) values (
      p_operation_id,
      p_session_id,
      actor_id,
      vault_entry_id,
      case when previous_quantity = 0 and allocation_delta > 0 then 'allocation' else 'correction' end,
      -allocation_delta,
      quantity_before,
      quantity_after,
      jsonb_build_object(
        'previous_session_quantity', previous_quantity,
        'corrected_session_quantity', desired_quantity,
        'meaning', case when allocation_delta > 0 then 'germination_setup_commitment' else 'germination_setup_correction' end
      ),
      operation_at
    );
  end loop;
  perform set_config('app.germination_setup_inventory_write', 'false', true);

  after_revision := before_revision + 1;
  insert into public.grow_session_germination_setups (
    session_id, owner_user_id, revision, setup_evidence, created_at, updated_at
  ) values (
    p_session_id, actor_id, after_revision, normalized_evidence, operation_at, operation_at
  )
  on conflict (session_id) do update
  set revision = excluded.revision,
      setup_evidence = excluded.setup_evidence,
      updated_at = excluded.updated_at
  where public.grow_session_germination_setups.owner_user_id = actor_id;

  saved_result := public.get_germination_setup_v1(p_session_id)
    || jsonb_build_object(
      'operation_id', p_operation_id,
      'operation_kind', 'save_germination_setup',
      'status', 'success'
    );

  insert into public.grow_session_germination_operations (
    operation_id, session_id, owner_user_id, operation_kind, input_fingerprint,
    before_revision, after_revision, before_evidence, after_evidence, result, created_at
  ) values (
    p_operation_id,
    p_session_id,
    actor_id,
    case when before_revision = 0 then 'create' else 'correction' end,
    fingerprint,
    before_revision,
    after_revision,
    before_evidence,
    normalized_evidence,
    saved_result,
    operation_at
  );

  return saved_result;
end;
$$;

revoke all on function public.enforce_seed_vault_germination_depletion()
  from public, anon, authenticated, service_role;
revoke all on function public.get_germination_setup_vault_entries_v1()
  from public, anon, service_role;
revoke all on function public.get_germination_setup_v1(uuid)
  from public, anon, service_role;
revoke all on function public.save_germination_setup_v1(uuid, uuid, bigint, jsonb)
  from public, anon, service_role;
grant execute on function public.get_germination_setup_vault_entries_v1()
  to authenticated;
grant execute on function public.get_germination_setup_v1(uuid)
  to authenticated;
grant execute on function public.save_germination_setup_v1(uuid, uuid, bigint, jsonb)
  to authenticated;

comment on table public.grow_session_germination_setups is
  'Current Session-owned Germination Setup evidence, including frozen Vault snapshots.';
comment on table public.grow_session_germination_operations is
  'Attributable Germination Setup create/correction history and idempotency ledger.';
comment on table public.seed_vault_germination_inventory_operations is
  'Seed Vault-owned inventory adjustments coordinated with Germination Setup.';
comment on function public.save_germination_setup_v1(uuid, uuid, bigint, jsonb) is
  'Owner-scoped atomic save for frozen Germination Setup evidence and net Seed Vault inventory adjustment.';

notify pgrst, 'reload schema';
