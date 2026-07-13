-- Require a positive whole-number Seeds Owned quantity for every Vault entry.
-- The integer column already rejects decimal and non-numeric database values.

do $$
declare
  violation_count integer;
begin
  select count(*)::integer
  into violation_count
  from public.seed_vault_entries
  where quantity is null or quantity < 1;

  if violation_count > 0 then
    raise exception 'Cannot enforce positive Seed Vault quantity: % existing row(s) have a null or sub-1 quantity. No data was changed.', violation_count
      using errcode = '23514',
        hint = 'Review: select id, user_id, quantity from public.seed_vault_entries where quantity is null or quantity < 1 order by id;';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.seed_vault_entries'::regclass
      and conname = 'seed_vault_entries_quantity_positive'
  ) then
    alter table public.seed_vault_entries
      add constraint seed_vault_entries_quantity_positive
      check (quantity is not null and quantity >= 1) not valid;
  end if;

  alter table public.seed_vault_entries
    validate constraint seed_vault_entries_quantity_positive;
end;
$$;

comment on constraint seed_vault_entries_quantity_positive on public.seed_vault_entries is
  'Seeds Owned is required and must be a positive whole number.';
