# Grow Supabase security and access audit

Date: 2026-07-15

## Executive finding

The REST failures were not caused by PostgREST cache staleness, schema exposure, or a single revoked grant. The `public` schema is exposed correctly and canonical RPCs worked because their migrations contain explicit function privileges. The clean-replay failure came from an incomplete historical split:

- `20260501000000_legacy_public_schema_baseline.sql` creates the original operational tables.
- It does not replay the RLS enablement, policies, storage buckets, storage policies, or application DML privileges retained by production history.
- Later migrations secure and grant newer tables/RPCs individually, which is why GEE, Seed Vault, sharing, directories, and recognition continued to work.
- Production retained broad historical `GRANT ALL` ACLs and the policies found in `supabase-schema.sql`; a clean database did not.

The root cause is therefore migration-history incompleteness plus production ACL drift, not a PostgREST defect.

## Security architecture

The audited architecture is:

1. The browser or server selects REST or an RPC according to the feature boundary.
2. PostgreSQL privileges decide whether the role may attempt the operation.
3. RLS decides which rows that role can read or mutate.
4. Security-definer RPCs encapsulate canonical analytics, public projections, sharing, and admin workflows.
5. Base tables remain authoritative; public views and RPCs are intentionally narrower projections.

The reconciliation migration does not use grants as a replacement for RLS. Every browser-writable table is RLS-enabled and has an owner/admin/publication policy matching the granted operation.

## Root cause by observed failure

| Failure | Actual cause | Required path | Resolution |
|---|---|---|---|
| `profiles` | Clean replay had neither DML privileges nor RLS/policies. | Owner REST CRUD is required for auth hydration, onboarding, settings, and account removal. | Authenticated CRUD grant plus owner/admin policies. No anonymous base-table access. |
| `grow_sessions` | Clean replay lacked DML privileges and owner policies; only a later admin-delete policy existed. | Owner REST read/create/update remains authoritative. GEE reads evidence through RPCs. | Authenticated CRUD capability with owner read/create/update and admin-only permanent delete RLS. |
| `sources` | Clean replay lacked usable SELECT/DML privileges and RLS. Production also retained a superseded `USING (true)` read policy. | REST is still required for public active metadata and admin source management; analytics remain RPC-only. | Public active-only SELECT, authenticated admin mutation, strict policies; permissive legacy policy removed. |
| `grow_gallery_snapshots` | A later migration created a SELECT policy but RLS was not enabled and table DML privileges were missing. Mutation policies were absent. | Canonical public evidence uses GEE RPC; direct REST is still required for owner operational rows and publication submission. | Public approved-only read; authenticated owner/admin CRUD policies and exact grants. |
| `grow_gallery_snapshot_likes` | Later SELECT/INSERT policies existed, but RLS was off, ACLs were missing, and DELETE policy was absent. Production had prototype public insert/read policies. | Direct REST remains the interactive like/unlike path. | Public visible-like read, authenticated owner insert/delete, prototype permissive policies removed. |
| `grow_follows` | Baseline table existed without replayed grants, RLS, or policies. | Direct REST is still used for follow/unfollow and relationship state; public summaries use RPCs. | Participant-only read, follower-only insert/delete, admin support boundary. |
| `community_activity` | Baseline table existed without grants/RLS/policy. | REST read is required; writes use `record_community_activity`. | Public/owner/admin SELECT only. No browser INSERT/UPDATE/DELETE grant. |
| notification/preference tables | Policies existed in later migrations, but clean ACLs omitted required DML operations. | Owner REST settings/subscription CRUD and server notification delivery. | Exact owner grants; exact service-role worker grants. |
| Storage | Clean replay contained neither application buckets nor object policies. | Storage API remains required for session images, avatars, gallery images, source logos, and announcements. | Idempotent bucket creation and bucket-specific owner/admin/read policies. |

PostgREST returned PostgreSQL `42501` errors consistently with these ACL conditions. Restarting PostgREST or refreshing its schema cache could not correct them.

## Application access inventory

### Browser direct REST

| Relation | Purpose | Operations | Required status | Authority/security decision |
|---|---|---:|---|---|
| `profiles` | Private account/profile hydration | S/I/U/D | Required | Authoritative private owner table; never public. |
| `grow_sessions` | Owner session lifecycle and history | S/I/U/D capability | Required | Authoritative evidence; owner S/I/U, admin-only hard delete. |
| `seed_vault_entries` | Owner inventory | S/I/U/D | Required | Authoritative private inventory; existing strict RLS retained. |
| `user_filter_paper_supply_settings` | Owner supply settings | S/I/U | Required | Owner-only. |
| `user_notification_preferences` | Notification preferences | S/I/U | Required | Owner-only. |
| `user_push_subscriptions` | Browser push endpoints | S/I/U/D | Required | Owner-only. |
| `push_notification_deliveries` | Owner delivery state | S/I/U/D | Required | Owner-only. |
| `source_directory` | Source autocomplete | S | Required | Authenticated visible rows; usage writes use RPC. |
| `variety_directory` | Variety autocomplete | S | Required | Authenticated visible rows; usage writes use RPC. |
| `sources` | Source metadata/admin management | public S; admin I/U/D | Required | Active metadata only publicly; not an analytics path. |
| `grow_gallery_snapshots` | Owner publication workflow | public S; owner I/U/D | Required operationally | GEE RPC is authoritative for Community analytics/public evidence. |
| `grow_gallery_snapshot_likes` | Likes | public S; owner I/D | Required | Visibility derives from the linked approved snapshot. |
| `grow_follows` | Grow Network relationships | S/I/D | Required | Participant-scoped. Public summaries remain RPC-based. |
| `community_activity` | Recent public/owner activity | S | Required | REST read-only; writes remain RPC-controlled. |
| `public_member_profiles` | Owner profile editing | owner S/I/U | Required | Private columns stay owner/admin-only. |
| `safe_public_member_profiles` | Public profile projection | S | Required | Safe view; anonymous/authenticated SELECT only. |
| `admin_users`, `founders` | Current caller role discovery | S | Required | Authenticated self/active-founder policies. |
| `admin_reports` | Public issue reports and admin triage | public I; admin S/U | Required | No public reads. |
| `contact_messages` | Contact submission/admin inbox | public I; admin S/U/D | Required | Already correctly migrated; unchanged. |
| `site_analytics_events` | Anonymous event submission/admin review | public I; admin S | Required | Intentional public insert is documented; public reads prohibited. |

### RPC-first browser paths

| Feature | RPC boundary | Recommendation |
|---|---|---|
| Global, Community, Owner, Source, and Variety analytics | Versioned GEE RPCs and public wrappers | Keep RPC-only. Do not grant browser reads on GEE configuration or raw cross-user evidence. |
| Community gallery analytics evidence | `get_gie_community_gallery_evidence` | Keep RPC-first. Direct snapshot REST remains only for the caller's operational/moderation state. |
| Public identity/recognition | identity and recognition RPCs | Keep RPC-first to avoid exposing private profile columns. |
| Seed Vault sharing | sharing/search/update RPCs | Keep RPC-first. Base share tables retain existing owner RLS only for internal consistency. |
| Directory usage and promotion | record/review RPCs | Keep RPC-first; browser receives SELECT only on directory projections. |
| Admin moderation and cleanup | admin RPCs | Keep authenticated/service-only with internal admin checks. Anonymous EXECUTE is removed. |

### Server actions and service-role REST

| Tables | Purpose | Required service-role operations |
|---|---|---|
| `cstp_requests`, `cstp_tests`, `cstp_test_sessions`, `cstp_admin_events` | CSTP administration workflow | S/I/U/D |
| `cstp_reports`, `cstp_report_snapshots`, `cstp_report_metrics`, `cstp_report_sessions`, `cstp_report_audit_links` | Immutable report persistence/lineage | S/I/U/D |
| `grow_sessions`, `sources`, `admin_users` | CSTP validation and authorization dependencies | S, with session U separately required by reminder action |
| `grow_session_reminder_events` | Reminder scheduling/delivery state | S/I/U/D |
| `user_notification_preferences` | Delivery eligibility | S |
| `user_push_subscriptions` | Delivery destinations/cleanup | S/U/D |
| `push_notification_deliveries` | Delivery audit state | S/I/U |

CSTP tables are RLS-enabled with no browser policies and no anon/authenticated DML privileges. They remain private and server-only.

## Remaining application tables

| Relations | Classification | Audit result |
|---|---|---|
| Seed Vault collection/tag/grow-note tables | Authoritative owner tables | Existing RLS and authenticated CRUD grants are correct; no changes required. |
| Seed Vault share tables | RPC-first support tables | Existing owner RLS retained. No anonymous table grants. |
| Recognition definitions/user recognitions | RPC-backed plus authenticated catalog/self reads | Existing strict RLS and SELECT grants retained. |
| Directory usage tables | RPC-written support tables | Authenticated self/admin SELECT only; no direct browser writes. |
| GEE configuration | Internal authoritative configuration | Service-role only; browser access remains RPC-based. |
| Cleanup/time-edit audit tables | Admin audit records | Existing admin-only SELECT retained. |
| `announcements` | Legacy database delivery path | Current client uses the generated announcement manifest, not table REST. No new table privilege was restored. The existing image bucket remains used. |
| `grow_gallery_snapshot_like` | Deprecated singular name | Only appears in missing-table error compatibility logic; no query targets it. No table or privilege was created. |

## Privilege plan

The exact grants are recorded in `20260715220000_application_access_security_reconciliation.sql`. The plan intentionally excludes:

- `GRANT ALL` or default privilege changes;
- blanket schema grants;
- anonymous private-table reads;
- browser writes to Community activity or directory usage;
- browser access to CSTP tables;
- serial/identity sequence grants (all audited application IDs use UUID defaults);
- new access to GEE internals.

## RLS and leakage verification

The regression verifies that:

- RLS is enabled on every active browser/server application table.
- A normal owner sees one private profile and cannot read another user's sessions or Vault rows.
- Anonymous roles cannot read `profiles`, `grow_sessions`, `public_member_profiles`, or CSTP tables.
- Public Source and Community reads succeed only through their strict policies.
- anonymous gallery-like insertion is unavailable;
- Community activity remains REST read-only;
- administrative functions are not executable by anonymous callers;
- private Storage buckets are authenticated-only and write paths are UID-prefixed;
- public Storage reads are limited to gallery, source-logo, and announcement buckets.

## Production comparison

The linked production schema was inspected read-only. It already had RLS enabled and the intended historical policies, but retained broad table ACLs and several prototype permissive policies. The additive migration is safe in both environments:

- clean replay gains the missing policies, buckets, and exact privileges;
- production policies are recreated idempotently;
- named superseded permissive policies are removed;
- broad legacy ACLs are replaced only for audited browser roles on the reconciled tables;
- existing data and canonical functions are not rewritten.

## Remaining risks and long-term recommendations

1. Move owner operational session mutations behind narrowly designed RPCs if richer lifecycle invariants continue to accumulate; do not move GEE reads back to REST.
2. Replace email-list admin fallbacks in older policies/functions with the durable `founders`/`admin_users` helpers during a separately tested authorization migration.
3. Retire duplicate historical policies and excessive function EXECUTE ACLs across the rest of the remote schema after a function-by-function caller audit.
4. Decide whether the database `announcements` table is permanently deprecated; remove it only after production telemetry confirms no external consumer.
5. Add this security regression to migration CI after local Supabase and the deterministic demo seed are available.
6. Periodically compare a clean replay dump with a read-only production schema dump to prevent future privilege and policy drift.
