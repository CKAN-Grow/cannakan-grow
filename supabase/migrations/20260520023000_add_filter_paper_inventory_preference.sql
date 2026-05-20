-- Additive account preference for the Global Filter Paper Supply card.
-- The app preserves a browser-local fallback, but this JSONB column lets signed-in
-- users carry the count/settings across refreshes and future sessions when the
-- notification preferences table is available.

alter table if exists public.user_notification_preferences
  add column if not exists filter_paper_inventory jsonb not null default '{}'::jsonb;

do $$
begin
  if to_regclass('public.user_notification_preferences') is not null then
    comment on column public.user_notification_preferences.filter_paper_inventory is
      'Optional signed-in user preference for Global Filter Paper Supply. Stores count, auto-subtract, low-supply reminder, store region, and updatedAt; browser local storage remains the safe fallback.';
  end if;
end $$;

notify pgrst, 'reload schema';
