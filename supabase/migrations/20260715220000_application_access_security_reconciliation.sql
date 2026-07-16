-- Application access security reconciliation
-- Date: 2026-07-15
--
-- Purpose:
--   Reconcile the clean migration replay with the production application's
--   layered access model. The legacy baseline created core tables without
--   replaying their table privileges and RLS policies. Production retained
--   those objects from its historical schema, which hid the clean-replay gap.
--
-- Scope:
--   * explicit least-privilege table grants used by current REST paths;
--   * strict owner/admin/publication RLS policies for legacy tables;
--   * service-role privileges required by server-only reminder and CSTP routes;
--   * removal of named permissive policies left by superseded prototypes;
--   * storage buckets and object policies used by the current application.
--
-- This migration does not alter GIE functions, analytics formulas, ranking,
-- confidence, eligibility, publication state, or application data.

-- ---------------------------------------------------------------------------
-- 1. Remove superseded permissive production policies before installing the
--    audited policies below. Each DROP is harmless on a clean replay.
-- ---------------------------------------------------------------------------

drop policy if exists "Allow public read sources" on public.sources;
drop policy if exists "Allow insert gallery likes" on public.grow_gallery_snapshot_likes;
drop policy if exists "Allow read gallery likes" on public.grow_gallery_snapshot_likes;
drop policy if exists "Allow delete own gallery likes" on public.grow_gallery_snapshot_likes;
drop policy if exists "Allow read for authenticated" on public.site_analytics_events;
drop policy if exists "Allow insert for all" on public.site_analytics_events;
drop policy if exists "Allow insert site analytics" on public.site_analytics_events;
drop policy if exists "Allow inserts for all" on public.site_analytics_events;
drop policy if exists "Visible public profiles can be read" on public.public_member_profiles;

-- ---------------------------------------------------------------------------
-- 2. RLS is the row boundary. PostgreSQL grants below only make an operation
--    available to PostgREST; these policies continue to decide which rows.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.grow_sessions enable row level security;
alter table public.admin_reports enable row level security;
alter table public.admin_users enable row level security;
alter table public.sources enable row level security;
alter table public.grow_gallery_snapshots enable row level security;
alter table public.grow_gallery_snapshot_likes enable row level security;
alter table public.grow_follows enable row level security;
alter table public.community_activity enable row level security;
alter table public.site_analytics_events enable row level security;
alter table public.user_notification_preferences enable row level security;
alter table public.user_filter_paper_supply_settings enable row level security;
alter table public.user_push_subscriptions enable row level security;
alter table public.push_notification_deliveries enable row level security;
alter table public.grow_session_reminder_events enable row level security;
alter table public.public_member_profiles enable row level security;

-- Server-only CSTP tables remain inaccessible to anon/authenticated. RLS is
-- enabled as defense in depth; service_role bypasses it for audited API routes.
alter table public.cstp_requests enable row level security;
alter table public.cstp_tests enable row level security;
alter table public.cstp_test_sessions enable row level security;
alter table public.cstp_admin_events enable row level security;
alter table public.cstp_reports enable row level security;
alter table public.cstp_report_snapshots enable row level security;
alter table public.cstp_report_metrics enable row level security;
alter table public.cstp_report_sessions enable row level security;
alter table public.cstp_report_audit_links enable row level security;

-- Profiles: owner CRUD; admins may read/update/delete for account support.
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles
for select to authenticated
using (auth.uid() = id or public.current_user_is_admin());

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile" on public.profiles
for insert to authenticated with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
for update to authenticated
using (auth.uid() = id or public.current_user_is_admin())
with check (auth.uid() = id or public.current_user_is_admin());

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile" on public.profiles
for delete to authenticated
using (auth.uid() = id or public.current_user_is_admin());

-- Sessions: owner read/create/update. Permanent deletion remains admin-only.
drop policy if exists "Users can view their own grow sessions" on public.grow_sessions;
create policy "Users can view their own grow sessions" on public.grow_sessions
for select to authenticated
using (auth.uid() = user_id or public.current_user_is_admin());

drop policy if exists "Users can create their own grow sessions" on public.grow_sessions;
create policy "Users can create their own grow sessions" on public.grow_sessions
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can update their own grow sessions" on public.grow_sessions;
create policy "Users can update their own grow sessions" on public.grow_sessions
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admins can permanently delete grow sessions" on public.grow_sessions;
create policy "Admins can permanently delete grow sessions" on public.grow_sessions
for delete to authenticated using (public.current_user_is_admin());

-- Source metadata is public only while active; all mutations are admin-only.
drop policy if exists "Anyone can view active sources" on public.sources;
create policy "Anyone can view active sources" on public.sources
for select to anon, authenticated
using (status = 'active' or public.current_user_is_admin());

drop policy if exists "Admins can create sources" on public.sources;
create policy "Admins can create sources" on public.sources
for insert to authenticated with check (public.current_user_is_admin());

drop policy if exists "Admins can update sources" on public.sources;
create policy "Admins can update sources" on public.sources
for update to authenticated
using (public.current_user_is_admin()) with check (public.current_user_is_admin());

drop policy if exists "Admins can delete sources" on public.sources;
create policy "Admins can delete sources" on public.sources
for delete to authenticated using (public.current_user_is_admin());

-- Community snapshots expose only approved canonical evidence publicly. Owners
-- manage their rows; admin moderation remains separately authorized.
drop policy if exists "Anyone can view published gallery snapshots" on public.grow_gallery_snapshots;
create policy "Anyone can view published gallery snapshots" on public.grow_gallery_snapshots
for select to anon, authenticated
using (
  (status = 'approved' and coalesce(analytics_excluded, false) = false)
  or auth.uid() = user_id
  or public.current_user_is_admin()
);

drop policy if exists "Users can create their own gallery snapshots" on public.grow_gallery_snapshots;
create policy "Users can create their own gallery snapshots" on public.grow_gallery_snapshots
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can update their own gallery snapshots" on public.grow_gallery_snapshots;
create policy "Users can update their own gallery snapshots" on public.grow_gallery_snapshots
for update to authenticated
using (auth.uid() = user_id or public.current_user_is_admin())
with check (auth.uid() = user_id or public.current_user_is_admin());

drop policy if exists "Users can delete their own gallery snapshots" on public.grow_gallery_snapshots;
create policy "Users can delete their own gallery snapshots" on public.grow_gallery_snapshots
for delete to authenticated
using (auth.uid() = user_id or public.current_user_is_admin());

drop policy if exists "Visible grow gallery likes can be read" on public.grow_gallery_snapshot_likes;
create policy "Visible grow gallery likes can be read" on public.grow_gallery_snapshot_likes
for select to anon, authenticated
using (exists (
  select 1 from public.grow_gallery_snapshots snapshot
  where snapshot.id = snapshot_id
    and (
      (snapshot.status = 'approved' and coalesce(snapshot.analytics_excluded, false) = false)
      or snapshot.user_id = auth.uid()
      or public.current_user_is_admin()
    )
));

drop policy if exists "Users can like visible gallery snapshots" on public.grow_gallery_snapshot_likes;
create policy "Users can like visible gallery snapshots" on public.grow_gallery_snapshot_likes
for insert to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.grow_gallery_snapshots snapshot
    where snapshot.id = snapshot_id
      and (
        (snapshot.status = 'approved' and coalesce(snapshot.analytics_excluded, false) = false)
        or snapshot.user_id = auth.uid()
      )
  )
);

drop policy if exists "Users can remove their own gallery likes" on public.grow_gallery_snapshot_likes;
create policy "Users can remove their own gallery likes" on public.grow_gallery_snapshot_likes
for delete to authenticated
using (auth.uid() = user_id or public.current_user_is_admin());

-- Grow Network relationships are visible only to participants and admins.
drop policy if exists "Users can view their own follow relationships" on public.grow_follows;
create policy "Users can view their own follow relationships" on public.grow_follows
for select to authenticated
using (auth.uid() in (follower_id, following_id) or public.current_user_is_admin());

drop policy if exists "Users can follow other members" on public.grow_follows;
create policy "Users can follow other members" on public.grow_follows
for insert to authenticated
with check (auth.uid() = follower_id and follower_id is distinct from following_id);

drop policy if exists "Users can unfollow members" on public.grow_follows;
create policy "Users can unfollow members" on public.grow_follows
for delete to authenticated
using (auth.uid() = follower_id or public.current_user_is_admin());

-- Activity is read-only over REST. Writes remain on record_community_activity().
drop policy if exists "Anyone can view public community activity" on public.community_activity;
create policy "Anyone can view public community activity" on public.community_activity
for select to anon, authenticated
using (visibility = 'public' or auth.uid() = user_id or public.current_user_is_admin());

-- Anonymous analytics submission is an explicit public feature; raw event reads
-- remain admin-only. This is the only intentional WITH CHECK (true) table policy.
drop policy if exists "Anyone can insert site analytics events" on public.site_analytics_events;
create policy "Anyone can insert site analytics events" on public.site_analytics_events
for insert to anon, authenticated with check (true);

drop policy if exists "Admins can read site analytics events" on public.site_analytics_events;
create policy "Admins can read site analytics events" on public.site_analytics_events
for select to authenticated using (public.current_user_is_admin());

-- Admin reports are public submissions but only admins can inspect/update them.
drop policy if exists "Anyone can insert admin reports" on public.admin_reports;
create policy "Anyone can insert admin reports" on public.admin_reports
for insert to anon, authenticated
with check (user_id is null or auth.uid() = user_id);

drop policy if exists "Admins can read admin reports" on public.admin_reports;
create policy "Admins can read admin reports" on public.admin_reports
for select to authenticated using (public.current_user_is_admin());

drop policy if exists "Admins can update admin reports" on public.admin_reports;
create policy "Admins can update admin reports" on public.admin_reports
for update to authenticated
using (public.current_user_is_admin()) with check (public.current_user_is_admin());

-- ---------------------------------------------------------------------------
-- 3. Explicit table privileges. No GRANT ALL and no default-privilege changes.
-- ---------------------------------------------------------------------------

revoke all privileges on table public.profiles from anon, authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;

revoke all privileges on table public.grow_sessions from anon, authenticated;
grant select, insert, update, delete on table public.grow_sessions to authenticated;

revoke all privileges on table public.sources from anon, authenticated;
grant select on table public.sources to anon;
grant select, insert, update, delete on table public.sources to authenticated;

revoke all privileges on table public.grow_gallery_snapshots from anon, authenticated;
grant select on table public.grow_gallery_snapshots to anon;
grant select, insert, update, delete on table public.grow_gallery_snapshots to authenticated;

revoke all privileges on table public.grow_gallery_snapshot_likes from anon, authenticated;
grant select on table public.grow_gallery_snapshot_likes to anon;
grant select, insert, delete on table public.grow_gallery_snapshot_likes to authenticated;

revoke all privileges on table public.grow_follows from anon, authenticated;
grant select, insert, delete on table public.grow_follows to authenticated;

revoke all privileges on table public.community_activity from anon, authenticated;
grant select on table public.community_activity to anon, authenticated;

revoke all privileges on table public.site_analytics_events from anon, authenticated;
grant insert on table public.site_analytics_events to anon;
grant select, insert on table public.site_analytics_events to authenticated;

revoke all privileges on table public.admin_reports from anon, authenticated;
grant insert on table public.admin_reports to anon;
grant select, insert, update on table public.admin_reports to authenticated;

-- These owner-scoped tables already have strict policies from later migrations;
-- this section supplies only the REST operations used by the current client.
revoke all privileges on table public.user_notification_preferences from anon, authenticated;
grant select, insert, update on table public.user_notification_preferences to authenticated;

revoke all privileges on table public.user_filter_paper_supply_settings from anon, authenticated;
grant select, insert, update on table public.user_filter_paper_supply_settings to authenticated;

revoke all privileges on table public.user_push_subscriptions from anon, authenticated;
grant select, insert, update, delete on table public.user_push_subscriptions to authenticated;

revoke all privileges on table public.push_notification_deliveries from anon, authenticated;
grant select, insert, update, delete on table public.push_notification_deliveries to authenticated;

-- Existing strict policies govern these reads.
grant select on table public.admin_users to authenticated;
grant select on table public.founders to authenticated;

-- Browser access to public_member_profiles remains owner-only. Public profile
-- discovery continues through safe_public_member_profiles and profile RPCs.
revoke all privileges on table public.public_member_profiles from anon, authenticated;
grant select, insert, update on table public.public_member_profiles to authenticated;
grant select on table public.safe_public_member_profiles to anon, authenticated;

-- Server-only reminder workers. No browser role receives reminder-event access.
revoke all privileges on table public.grow_session_reminder_events from anon, authenticated;
-- Remove historical service-role table defaults before granting the exact
-- server access documented below. Security-definer RPCs execute as their owner
-- and do not depend on these direct table ACLs.
revoke all privileges on table
  public.profiles,
  public.sources,
  public.grow_gallery_snapshots,
  public.grow_gallery_snapshot_likes,
  public.grow_follows,
  public.community_activity,
  public.site_analytics_events,
  public.admin_reports,
  public.user_filter_paper_supply_settings,
  public.public_member_profiles
from service_role;
revoke all privileges on table public.grow_session_reminder_events from service_role;
revoke all privileges on table public.grow_sessions from service_role;
revoke all privileges on table public.user_notification_preferences from service_role;
revoke all privileges on table public.user_push_subscriptions from service_role;
revoke all privileges on table public.push_notification_deliveries from service_role;
grant select, insert, update, delete on table public.grow_session_reminder_events to service_role;
grant select, update on table public.grow_sessions to service_role;
grant select on table public.user_notification_preferences to service_role;
grant select, update, delete on table public.user_push_subscriptions to service_role;
grant select, insert, update on table public.push_notification_deliveries to service_role;

-- CSTP is server-only. Browser roles are explicitly denied; route handlers use
-- service_role and require the exact CRUD set used by their persistence layer.
revoke all privileges on table
  public.cstp_requests,
  public.cstp_tests,
  public.cstp_test_sessions,
  public.cstp_admin_events,
  public.cstp_reports,
  public.cstp_report_snapshots,
  public.cstp_report_metrics,
  public.cstp_report_sessions,
  public.cstp_report_audit_links
from anon, authenticated;

revoke all privileges on table
  public.cstp_requests,
  public.cstp_tests,
  public.cstp_test_sessions,
  public.cstp_admin_events,
  public.cstp_reports,
  public.cstp_report_snapshots,
  public.cstp_report_metrics,
  public.cstp_report_sessions,
  public.cstp_report_audit_links
from service_role;

grant select, insert, update, delete on table
  public.cstp_requests,
  public.cstp_tests,
  public.cstp_test_sessions,
  public.cstp_admin_events,
  public.cstp_reports,
  public.cstp_report_snapshots,
  public.cstp_report_metrics,
  public.cstp_report_sessions,
  public.cstp_report_audit_links
to service_role;

revoke all privileges on table public.admin_users, public.sources from service_role;
grant select on table public.admin_users, public.sources to service_role;

-- UUID defaults use gen_random_uuid(); there are no application-owned serial or
-- identity sequences requiring USAGE grants.

-- ---------------------------------------------------------------------------
-- 4. Function exposure. Internal/admin RPCs retain their internal authorization
--    checks, and anonymous EXECUTE inherited from historical defaults is removed.
-- ---------------------------------------------------------------------------

-- Public RLS policies call this boolean-only security-definer helper. Anonymous
-- execution reveals no data; it only evaluates the caller's own JWT/admin state.
grant execute on function public.current_user_is_admin() to anon, authenticated;

revoke execute on function public.admin_moderate_grow_gallery_snapshot(uuid, text) from anon;
revoke execute on function public.admin_delete_grow_gallery_snapshot(uuid) from anon;
revoke execute on function public.admin_preview_community_grow_publication_reset() from anon, authenticated;
revoke execute on function public.admin_execute_community_grow_publication_reset() from anon, authenticated;
grant execute on function public.admin_moderate_grow_gallery_snapshot(uuid, text) to authenticated;
grant execute on function public.admin_delete_grow_gallery_snapshot(uuid) to authenticated;
grant execute on function public.admin_preview_community_grow_publication_reset() to service_role;
grant execute on function public.admin_execute_community_grow_publication_reset() to service_role;

-- ---------------------------------------------------------------------------
-- 5. Storage. Buckets are existing production dependencies; ON CONFLICT keeps
--    remote environments unchanged while making clean replay complete.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values
  ('session-images', 'session-images', false),
  ('profile-avatars', 'profile-avatars', false),
  ('grow-gallery', 'grow-gallery', true),
  ('source-logos', 'source-logos', true),
  ('announcements', 'announcements', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can read session images" on storage.objects;
create policy "Authenticated users can read session images" on storage.objects
for select to authenticated using (bucket_id = 'session-images');

drop policy if exists "Authenticated users can upload their own session images" on storage.objects;
create policy "Authenticated users can upload their own session images" on storage.objects
for insert to authenticated
with check (bucket_id = 'session-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Authenticated users can update their own session images" on storage.objects;
create policy "Authenticated users can update their own session images" on storage.objects
for update to authenticated
using (bucket_id = 'session-images' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'session-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Authenticated users can delete their own session images" on storage.objects;
create policy "Authenticated users can delete their own session images" on storage.objects
for delete to authenticated
using (bucket_id = 'session-images' and ((storage.foldername(name))[1] = auth.uid()::text or public.current_user_is_admin()));

drop policy if exists "Authenticated users can read profile avatars" on storage.objects;
create policy "Authenticated users can read profile avatars" on storage.objects
for select to authenticated using (bucket_id = 'profile-avatars');

drop policy if exists "Authenticated users can upload their own profile avatars" on storage.objects;
create policy "Authenticated users can upload their own profile avatars" on storage.objects
for insert to authenticated
with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Authenticated users can update their own profile avatars" on storage.objects;
create policy "Authenticated users can update their own profile avatars" on storage.objects
for update to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Authenticated users can delete their own profile avatars" on storage.objects;
create policy "Authenticated users can delete their own profile avatars" on storage.objects
for delete to authenticated
using (bucket_id = 'profile-avatars' and ((storage.foldername(name))[1] = auth.uid()::text or public.current_user_is_admin()));

drop policy if exists "Anyone can read grow gallery images" on storage.objects;
create policy "Anyone can read grow gallery images" on storage.objects
for select to anon, authenticated using (bucket_id = 'grow-gallery');

drop policy if exists "Authenticated users can upload their own grow gallery images" on storage.objects;
create policy "Authenticated users can upload their own grow gallery images" on storage.objects
for insert to authenticated
with check (bucket_id = 'grow-gallery' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Authenticated users can update their own grow gallery images" on storage.objects;
create policy "Authenticated users can update their own grow gallery images" on storage.objects
for update to authenticated
using (bucket_id = 'grow-gallery' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'grow-gallery' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Authenticated users can delete their own grow gallery images" on storage.objects;
create policy "Authenticated users can delete their own grow gallery images" on storage.objects
for delete to authenticated
using (bucket_id = 'grow-gallery' and ((storage.foldername(name))[1] = auth.uid()::text or public.current_user_is_admin()));

drop policy if exists "Anyone can read source logos" on storage.objects;
create policy "Anyone can read source logos" on storage.objects
for select to anon, authenticated using (bucket_id = 'source-logos');

drop policy if exists "Anyone can read announcement images" on storage.objects;
create policy "Anyone can read announcement images" on storage.objects
for select to anon, authenticated using (bucket_id = 'announcements');

drop policy if exists "Admins can upload source logos" on storage.objects;
create policy "Admins can upload source logos" on storage.objects
for insert to authenticated with check (bucket_id = 'source-logos' and public.current_user_is_admin());

drop policy if exists "Admins can update source logos" on storage.objects;
create policy "Admins can update source logos" on storage.objects
for update to authenticated
using (bucket_id = 'source-logos' and public.current_user_is_admin())
with check (bucket_id = 'source-logos' and public.current_user_is_admin());

drop policy if exists "Admins can delete source logos" on storage.objects;
create policy "Admins can delete source logos" on storage.objects
for delete to authenticated using (bucket_id = 'source-logos' and public.current_user_is_admin());

drop policy if exists "Admins can upload announcement images" on storage.objects;
create policy "Admins can upload announcement images" on storage.objects
for insert to authenticated with check (bucket_id = 'announcements' and public.current_user_is_admin());

drop policy if exists "Admins can update announcement images" on storage.objects;
create policy "Admins can update announcement images" on storage.objects
for update to authenticated
using (bucket_id = 'announcements' and public.current_user_is_admin())
with check (bucket_id = 'announcements' and public.current_user_is_admin());

drop policy if exists "Admins can delete announcement images" on storage.objects;
create policy "Admins can delete announcement images" on storage.objects
for delete to authenticated using (bucket_id = 'announcements' and public.current_user_is_admin());
