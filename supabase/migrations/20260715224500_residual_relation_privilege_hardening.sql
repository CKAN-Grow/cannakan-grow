-- Follow-up to the application access reconciliation: remove residual historical
-- DDL-adjacent ACLs from explicitly named relations. This migration was prompted
-- by the deterministic broad-grant audit; it does not alter RLS or table data.

revoke truncate, references, trigger on table
  public.admin_users,
  public.announcements,
  public.contact_messages,
  public.founders,
  public.grow_intelligence_engine_config,
  public.grow_session_cleanup_audit,
  public.grow_session_time_edit_audit,
  public.recognition_definitions,
  public.safe_public_member_profiles,
  public.seed_vault_collections,
  public.seed_vault_entries,
  public.seed_vault_entry_collections,
  public.seed_vault_entry_tags,
  public.seed_vault_grow_notes,
  public.seed_vault_share_settings,
  public.seed_vault_share_users,
  public.seed_vault_tags,
  public.source_directory,
  public.source_directory_user_usage,
  public.user_recognitions,
  public.variety_directory,
  public.variety_directory_user_usage
from anon, authenticated, service_role;

-- Contact submission is an active REST path. Policies already constrain public
-- inserts and founder/admin reads and mutations; only the attempt privileges were
-- missing from clean replay.
revoke select, insert, update, delete on table public.contact_messages from anon, authenticated, service_role;
grant insert on table public.contact_messages to anon, authenticated;
grant select, update, delete on table public.contact_messages to authenticated;
