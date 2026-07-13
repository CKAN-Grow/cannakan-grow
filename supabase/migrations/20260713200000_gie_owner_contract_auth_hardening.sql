-- GIE Owner Analytics authorization hardening.
--
-- Normal owner analytics derives identity only from auth.uid(). Administrative
-- cross-owner access uses a separate, explicitly named and authorized RPC.
-- The Phase 1 UUID implementation remains internal so calculation logic is not
-- duplicated and the gie-owner.v1 payload remains unchanged.

create or replace function public.get_gie_my_analytics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  requester_id uuid := auth.uid();
begin
  if requester_id is null then
    raise exception 'Authentication required for owner analytics'
      using errcode = '42501';
  end if;

  -- The authenticated session is the sole source of owner identity. No caller
  -- argument exists and no browser-supplied UUID participates in this call.
  return public.get_gie_owner_analytics(requester_id);
end;
$$;

revoke all on function public.get_gie_my_analytics() from public;
revoke all on function public.get_gie_my_analytics() from anon;
grant execute on function public.get_gie_my_analytics() to authenticated;

create or replace function public.get_gie_admin_owner_analytics(target_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  requester_id uuid := auth.uid();
begin
  if requester_id is null then
    raise exception 'Authentication required for admin owner analytics'
      using errcode = '42501';
  end if;

  if target_user_id is null then
    raise exception 'Target owner is required'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.admin_users
    where admin_users.user_id = requester_id
  ) then
    raise exception 'Admin access required for cross-owner analytics'
      using errcode = '42501';
  end if;

  -- Delegates to the same canonical Owner Analytics implementation. That
  -- implementation also validates the admin boundary before reading the target.
  return public.get_gie_owner_analytics(target_user_id);
end;
$$;

revoke all on function public.get_gie_admin_owner_analytics(uuid) from public;
revoke all on function public.get_gie_admin_owner_analytics(uuid) from anon;
grant execute on function public.get_gie_admin_owner_analytics(uuid) to authenticated;

-- The caller-supplied UUID function is no longer a browser contract. SECURITY
-- DEFINER wrappers owned by the same trusted database role may still delegate
-- to it, but neither anon nor authenticated receives direct EXECUTE permission.
revoke all on function public.get_gie_owner_analytics(uuid) from public;
revoke all on function public.get_gie_owner_analytics(uuid) from anon;
revoke all on function public.get_gie_owner_analytics(uuid) from authenticated;

create or replace function public.get_gie_contract_diagnostics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  global_contract jsonb;
  owner_contract jsonb;
  community_contract jsonb;
  requester_id uuid := auth.uid();
  requester_is_admin boolean := false;
begin
  select exists (
    select 1 from public.admin_users where admin_users.user_id = requester_id
  ) into requester_is_admin;

  if not requester_is_admin
    and coalesce(auth.role(), '') <> 'service_role'
    and session_user not in ('postgres', 'service_role') then
    raise exception 'Admin or service-role access is required'
      using errcode = '42501';
  end if;

  global_contract := public.get_gie_global_analytics();
  owner_contract := case
    when requester_id is null then null
    else public.get_gie_my_analytics()
  end;
  community_contract := public.get_gie_community_analytics();

  return jsonb_build_object(
    'contracts', jsonb_build_array(
      jsonb_build_object(
        'contract_name', 'global_analytics',
        'availability', global_contract is not null,
        'contract_version', global_contract ->> 'contract_version',
        'engine_version', global_contract ->> 'engine_version',
        'schema_version', global_contract ->> 'schema_version',
        'data_quality_version', global_contract ->> 'data_quality_version',
        'generated_at', global_contract ->> 'generated_at',
        'authorization_status', global_contract ->> 'authorization_status',
        'payload_validation_status', global_contract ->> 'payload_validation_status'
      ),
      jsonb_build_object(
        'contract_name', 'owner_analytics',
        'availability', owner_contract is not null,
        'contract_version', coalesce(owner_contract ->> 'contract_version', 'gie-owner.v1'),
        'engine_version', coalesce(owner_contract ->> 'engine_version', 'gie.v1'),
        'schema_version', coalesce(owner_contract ->> 'schema_version', '2026-07-13.4'),
        'data_quality_version', coalesce(owner_contract ->> 'data_quality_version', 'gie-dq.v1'),
        'generated_at', owner_contract ->> 'generated_at',
        'authorization_status', coalesce(owner_contract ->> 'authorization_status', 'service_role_no_owner_context'),
        'payload_validation_status', case when owner_contract is null then 'not_exercised' else owner_contract ->> 'payload_validation_status' end,
        'canonical_rpc', 'get_gie_my_analytics()',
        'admin_rpc', 'get_gie_admin_owner_analytics(uuid)',
        'caller_supplied_owner_id', 'Disabled',
        'cross_owner_access_protection', 'Enforced',
        'admin_authorization_status', case when requester_is_admin then 'authorized_admin' else 'service_role' end
      ),
      jsonb_build_object(
        'contract_name', 'community_analytics',
        'availability', community_contract is not null,
        'contract_version', community_contract ->> 'contract_version',
        'engine_version', community_contract ->> 'engine_version',
        'schema_version', community_contract ->> 'schema_version',
        'data_quality_version', community_contract ->> 'data_quality_version',
        'generated_at', community_contract ->> 'generated_at',
        'authorization_status', community_contract ->> 'authorization_status',
        'payload_validation_status', community_contract ->> 'payload_validation_status'
      )
    )
  );
end;
$$;

revoke all on function public.get_gie_contract_diagnostics() from public;
revoke all on function public.get_gie_contract_diagnostics() from anon;
grant execute on function public.get_gie_contract_diagnostics() to authenticated;
grant execute on function public.get_gie_contract_diagnostics() to service_role;

comment on function public.get_gie_my_analytics() is
  'Canonical gie-owner.v1 browser contract. Takes no owner identifier and derives identity exclusively from auth.uid().';
comment on function public.get_gie_admin_owner_analytics(uuid) is
  'Admin-only gie-owner.v1 cross-owner contract. Requires admin_users authorization and delegates to the shared Owner Analytics implementation.';
comment on function public.get_gie_owner_analytics(uuid) is
  'DEPRECATED internal Owner Analytics implementation. No anon or authenticated EXECUTE grant; use get_gie_my_analytics() or get_gie_admin_owner_analytics(uuid).';
comment on function public.get_gie_contract_diagnostics() is
  'Admin/service-role read-only diagnostics for the three canonical GIE contracts, including hardened Owner RPC boundaries.';

notify pgrst, 'reload schema';
