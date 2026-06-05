-- Make My Seed Vault year_acquired the source of truth for seed_age_years.
-- Additive repair only: seed_age_years remains as a derived/cache column for
-- existing REST consumers, but users and clients should not set it manually.

create or replace function public.calculate_seed_vault_age_years(year_acquired_value integer)
returns numeric
language sql
stable
as $$
  select case
    when year_acquired_value is null then null
    when year_acquired_value < 1980 then null
    when year_acquired_value > date_part('year', timezone('utc', now()))::integer then null
    else greatest(1, date_part('year', timezone('utc', now()))::integer - year_acquired_value)::numeric
  end;
$$;

create or replace function public.set_seed_vault_entries_calculated_age()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.seed_age_years = public.calculate_seed_vault_age_years(new.year_acquired);
  return new;
end;
$$;

update public.seed_vault_entries
set seed_age_years = public.calculate_seed_vault_age_years(year_acquired)
where seed_age_years is distinct from public.calculate_seed_vault_age_years(year_acquired);

drop trigger if exists seed_vault_entries_calculated_age
  on public.seed_vault_entries;

create trigger seed_vault_entries_calculated_age
  before insert or update of year_acquired, seed_age_years
  on public.seed_vault_entries
  for each row
  execute function public.set_seed_vault_entries_calculated_age();

comment on column public.seed_vault_entries.seed_age_years is
  'Derived from year_acquired by public.set_seed_vault_entries_calculated_age; clients should not treat this as user-editable.';

notify pgrst, 'reload schema';
