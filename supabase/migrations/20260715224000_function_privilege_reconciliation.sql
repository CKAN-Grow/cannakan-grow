-- Function-only least-privilege reconciliation following the reviewed caller audit.
-- No function body is changed here. Every privilege uses an explicit signature.

-- Historical one-time maintenance and trigger-only functions are owner-internal.
revoke all on function public.backfill_community_activity_snapshot_posts() from public, anon, authenticated, service_role;
revoke all on function public.enforce_cstp_report_session_analytics_eligibility() from public, anon, authenticated, service_role;
revoke all on function public.enforce_gallery_snapshot_analytics_eligibility() from public, anon, authenticated, service_role;
revoke all on function public.enforce_grow_session_analytics_eligibility() from public, anon, authenticated, service_role;
revoke all on function public.enforce_grow_session_regular_delete_policy() from public, anon, authenticated, service_role;
revoke all on function public.enforce_grow_session_timestamp_edit_policy() from public, anon, authenticated, service_role;
revoke all on function public.protect_founder_admin_user() from public, anon, authenticated, service_role;
revoke all on function public.reconcile_recognition_after_owner_activity_v1() from public, anon, authenticated, service_role;
revoke all on function public.set_contact_messages_updated_at() from public, anon, authenticated, service_role;
revoke all on function public.set_push_notification_deliveries_updated_at() from public, anon, authenticated, service_role;
revoke all on function public.set_seed_vault_entries_calculated_age() from public, anon, authenticated, service_role;
revoke all on function public.set_seed_vault_entries_updated_at() from public, anon, authenticated, service_role;
revoke all on function public.set_seed_vault_share_settings_updated_at() from public, anon, authenticated, service_role;
revoke all on function public.set_seed_vault_share_users_updated_at() from public, anon, authenticated, service_role;
revoke all on function public.set_source_directory_updated_at() from public, anon, authenticated, service_role;
revoke all on function public.set_user_filter_paper_supply_settings_updated_at() from public, anon, authenticated, service_role;
revoke all on function public.set_user_notification_preferences_updated_at() from public, anon, authenticated, service_role;
revoke all on function public.set_user_push_subscriptions_updated_at() from public, anon, authenticated, service_role;
revoke all on function public.set_variety_directory_updated_at() from public, anon, authenticated, service_role;
revoke all on function public.sync_founder_admin_user() from public, anon, authenticated, service_role;
revoke all on function public.sync_gallery_snapshot_analytics_exclusion_for_session(uuid) from public, anon, authenticated, service_role;
revoke all on function public.sync_grow_gallery_snapshot_status_is_mock() from public, anon, authenticated, service_role;
revoke all on function public.sync_public_member_profiles_identity() from public, anon, authenticated, service_role;

-- Helpers execute only inside owner-controlled trigger/RPC contexts.
revoke all on function public.calculate_seed_vault_age_years(integer) from public, anon, authenticated, service_role;
revoke all on function public.generate_seed_vault_share_slug() from public, anon, authenticated, service_role;
revoke all on function public.normalize_seed_vault_share_slug(text) from public, anon, authenticated, service_role;

-- Seed Vault sharing is authenticated RPC-only, except the slug reader below.
revoke all on function public.get_direct_shared_seed_vault(uuid) from public, anon, authenticated, service_role;
revoke all on function public.get_or_create_seed_vault_share_settings() from public, anon, authenticated, service_role;
revoke all on function public.get_seed_vault_user_shares() from public, anon, authenticated, service_role;
revoke all on function public.get_seed_vaults_shared_with_me() from public, anon, authenticated, service_role;
revoke all on function public.remove_seed_vault_user_share(uuid) from public, anon, authenticated, service_role;
revoke all on function public.search_seed_vault_share_users(text) from public, anon, authenticated, service_role;
revoke all on function public.update_seed_vault_share_settings(text,boolean,boolean,boolean,boolean,text) from public, anon, authenticated, service_role;
revoke all on function public.upsert_seed_vault_user_share(uuid,boolean,boolean,boolean,boolean) from public, anon, authenticated, service_role;
grant execute on function public.get_direct_shared_seed_vault(uuid) to authenticated;
grant execute on function public.get_or_create_seed_vault_share_settings() to authenticated;
grant execute on function public.get_seed_vault_user_shares() to authenticated;
grant execute on function public.get_seed_vaults_shared_with_me() to authenticated;
grant execute on function public.remove_seed_vault_user_share(uuid) to authenticated;
grant execute on function public.search_seed_vault_share_users(text) to authenticated;
grant execute on function public.update_seed_vault_share_settings(text,boolean,boolean,boolean,boolean,text) to authenticated;
grant execute on function public.upsert_seed_vault_user_share(uuid,boolean,boolean,boolean,boolean) to authenticated;

-- Public slug lookup remains the intentionally anonymous sharing boundary.
revoke all on function public.get_shared_seed_vault(text) from public, anon, authenticated, service_role;
grant execute on function public.get_shared_seed_vault(text) to anon, authenticated;
