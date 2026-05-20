-- Dedicated per-user Global Filter Paper Supply settings.
-- This keeps signed-in supply counts out of browser storage so they survive
-- cache clears and reload on sign-in. Local storage remains only a fallback.

create table if not exists public.user_filter_paper_supply_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  filter_paper_count integer not null default 0 check (filter_paper_count >= 0),
  store_region text not null default 'US' check (store_region in ('US', 'EU')),
  auto_subtract_on_complete boolean not null default true,
  low_supply_reminders_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_filter_paper_supply_settings is
  'Per-user Global Filter Paper Supply settings for Cannakan Grow. Used as the signed-in source of truth for supply counts and reminder options.';

comment on column public.user_filter_paper_supply_settings.filter_paper_count is
  'Current global filter paper count for the signed-in user.';

create or replace function public.set_user_filter_paper_supply_settings_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_filter_paper_supply_settings_updated_at
  on public.user_filter_paper_supply_settings;

create trigger set_user_filter_paper_supply_settings_updated_at
  before update on public.user_filter_paper_supply_settings
  for each row
  execute function public.set_user_filter_paper_supply_settings_updated_at();

alter table public.user_filter_paper_supply_settings enable row level security;

drop policy if exists "Users can read their filter paper supply settings"
  on public.user_filter_paper_supply_settings;
drop policy if exists "Users can insert their filter paper supply settings"
  on public.user_filter_paper_supply_settings;
drop policy if exists "Users can update their filter paper supply settings"
  on public.user_filter_paper_supply_settings;

create policy "Users can read their filter paper supply settings"
  on public.user_filter_paper_supply_settings
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their filter paper supply settings"
  on public.user_filter_paper_supply_settings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their filter paper supply settings"
  on public.user_filter_paper_supply_settings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
