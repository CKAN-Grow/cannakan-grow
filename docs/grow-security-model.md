# Grow database security model

Last reviewed: 2026-07-15  
Detailed evidence: `grow-supabase-security-access-audit-2026-07-15.md` and `grow-function-access-audit-2026-07-15.md`

## Architecture overview

Grow applies access controls in this order:

1. The application chooses a direct REST operation or a named RPC boundary.
2. PostgreSQL privileges decide whether the active role may attempt that operation.
3. Row Level Security (RLS) decides which rows the caller may read or change.
4. The operation reaches an authoritative table, a deliberately narrow view, or an RPC projection.

Privileges do not grant row visibility. They only permit an attempt; RLS remains the row boundary. Security-definer RPCs provide controlled elevated behavior for canonical analytics, public projections, sharing, and administration. They must authorize callers internally and use a fixed safe `search_path`.

The `service_role` is server-only and must never enter browser code or generated client configuration. CSTP is reachable only through protected server routes using exact service-role table privileges; it is never browser-accessible. Database-owner/`postgres` execution is limited to migrations, triggers, and internal function composition.

## Roles

| Role/context | Intended use |
|---|---|
| `anon` | Unauthenticated public projections, approved Community content, public Source metadata, public submissions, and public Storage reads only. |
| `authenticated` | Owner-scoped CRUD, authenticated RPCs, shared resources, and admin RPC entry points that perform an internal admin check. |
| `service_role` | Protected API/worker operations: CSTP persistence, reminders/push delivery, Community reset maintenance, and explicitly granted diagnostics. Never a client role. |
| `postgres` / database owner | Migration replay, trigger execution, and internal helper composition. Not an application identity. |
| Founder/admin authorization | Durable `founders`/`admin_users` checks inside RLS or RPCs. An authenticated grant alone never implies admin access. |
| Worker/server | A narrowly scoped service-role process. Each route receives only the relations/functions its implementation uses. |

## Access categories

- Public read-only data: approved Community publications, active Source metadata, safe public profile projections, and canonical public analytics.
- Authenticated owner data: profiles, sessions, Seed Vault, settings, subscriptions, and owner publication state under UID-based RLS.
- Shared/read-only data: Seed Vault sharing through security-definer RPCs that enforce slug visibility or an explicit share.
- Community publication data: direct REST only for operational state; GEE RPCs remain authoritative for analytics evidence.
- Admin-only data: admin reports, contact inbox, cleanup/time-edit audit, moderation, and role management.
- Canonical analytics: RPC-first GEE contracts. Browser access to raw cross-user evidence or GEE internals is prohibited.
- Server-only operations: CSTP, notification delivery, reminder orchestration, and elevated publication reset.
- Storage: bucket-specific read rules and UID/admin write rules; database table access does not imply object access.

## Current relation matrix

Operations use `S/I/U/D`. “Owner” means authenticated UID-scoped RLS; “admin” means an internal founder/admin predicate. Service access shown here is intentional, not an RLS bypass recommendation.

| Resource | Purpose / authority | Method | `anon` | `authenticated` | `service_role` | RLS/publication rule | Feature / RPC boundary |
|---|---|---|---|---|---|---|---|
| `profiles` | Private account authority | REST | — | owner S/I/U/D | — | owner/admin | auth, profile, settings |
| `grow_sessions` | Canonical session/evidence authority | REST + RPC evidence | — | owner S/I/U; admin D | S/U | owner lifecycle; admin hard delete | sessions; GEE reads via RPC |
| `sources` | Active Source metadata authority | REST | active S | S; admin I/U/D | S | active public/admin mutation | Source directory/report metadata |
| `grow_gallery_snapshots` | Publication workflow authority | REST + GEE RPC | approved S | owner/admin S/I/U/D | — | approved public; owner/admin mutation | Community Gallery |
| `grow_gallery_snapshot_likes` | Like authority | REST | visible S | owner S/I/D | — | linked approved snapshot; liker owns write | Community likes |
| `grow_follows` | Follow relationship authority | REST | — | participant S; follower I/D | — | participant/admin | Grow Network |
| `community_activity` | Community feed authority | REST read, RPC write | public S | public/owner/admin S | — | public or owner/admin | `record_community_activity` |
| `site_analytics_events` | Site event authority | REST | I | S/I | — | public insert; admin read | telemetry/admin analytics |
| `admin_reports` | User report/admin triage authority | REST | I | admin S/I/U | — | public insert; admin review | issue reporting |
| `contact_messages` | Contact inbox authority | REST | I | I; admin S/U/D | — | public insert; admin inbox | Contact form |
| `admin_users` | Admin membership authority | REST self-read + RPC mutation | — | scoped S | S | self/admin | `set_member_admin_access` |
| `founders` | Founder authorization authority | REST read helper | — | active/scoped S | — | active founder/admin | authorization checks |
| `public_member_profiles` | Private profile-publication settings authority | REST | — | owner S/I/U | — | owner/admin | profile editing |
| `safe_public_member_profiles` | Narrow public profile projection | REST view | S | S | — | view exposes approved fields only | public profile pages |
| `recognition_definitions` | Recognition catalog authority | REST + RPC | — | S | — | active catalog | identity/recognition RPCs |
| `user_recognitions` | Award authority | REST read + RPC mutation | — | self S | — | self/admin | recognition RPCs |
| `source_directory` | Source suggestion projection | REST read, RPC write | — | visible S | — | visible/admin | record/review directory RPCs |
| `source_directory_user_usage` | Per-user Source usage support | RPC-first | — | self S | — | self/admin | Source usage RPC |
| `variety_directory` | Variety suggestion projection | REST read, RPC write | — | visible S | — | visible/admin | record/review directory RPCs |
| `variety_directory_user_usage` | Per-user Variety usage support | RPC-first | — | self S | — | self/admin | Variety usage RPC |
| `user_notification_preferences` | Delivery preference authority | REST | — | owner S/I/U | S | owner | notification settings/worker |
| `user_filter_paper_supply_settings` | Supply preference authority | REST | — | owner S/I/U | — | owner | Seed Session setup |
| `user_push_subscriptions` | Push endpoint authority | REST | — | owner S/I/U/D | S/U/D | owner | push worker |
| `push_notification_deliveries` | Delivery audit authority | REST/server | — | owner S/I/U/D | S/I/U | owner | push worker |
| `grow_session_reminder_events` | Reminder queue authority | server-only | — | — | S/I/U/D | no browser policy | reminder worker |
| `grow_session_cleanup_audit` | Cleanup audit authority | admin read | — | admin S | — | admin | cleanup RPC |
| `grow_session_time_edit_audit` | Time-edit audit authority | admin read | — | admin S | — | admin | session admin editing |
| `seed_vault_entries` | Seed inventory authority | REST | — | owner S/I/U/D | — | owner | Seed Vault |
| `seed_vault_collections` | Collection authority | REST | — | owner S/I/U/D | — | owner | Seed Vault |
| `seed_vault_entry_collections` | Entry/collection membership | REST | — | owner S/I/U/D | — | owner through entry/collection | Seed Vault |
| `seed_vault_tags` | Tag authority | REST | — | owner S/I/U/D | — | owner | Seed Vault |
| `seed_vault_entry_tags` | Entry/tag membership | REST | — | owner S/I/U/D | — | owner through entry/tag | Seed Vault |
| `seed_vault_grow_notes` | Private grow notes | REST | — | owner S/I/U/D | — | owner | Seed Vault |
| `seed_vault_share_settings` | Vault publication settings | RPC-first | — | owner support access | — | owner | sharing RPCs |
| `seed_vault_share_users` | Direct-share authority | RPC-first | — | owner support access | — | owner/shared target | sharing RPCs |
| `grow_intelligence_engine_config` | Canonical GEE configuration | server/internal | — | — | S/I/U | no browser access | GEE internal contracts |
| `cstp_requests` | CSTP request authority | server-only | — | — | S/I/U/D | RLS, no browser policy | protected CSTP API |
| `cstp_tests` | CSTP test authority | server-only | — | — | S/I/U/D | RLS, no browser policy | protected CSTP API |
| `cstp_test_sessions` | CSTP session links | server-only | — | — | S/I/U/D | RLS, no browser policy | protected CSTP API |
| `cstp_admin_events` | CSTP admin audit | server-only | — | — | S/I/U/D | RLS, no browser policy | protected CSTP API |
| `cstp_reports` | Immutable report lineage authority | server-only | — | — | S/I/U/D | RLS, no browser policy | protected CSTP API |
| `cstp_report_snapshots` | Immutable report snapshot authority | server-only | — | — | S/I/U/D | RLS, no browser policy | protected CSTP API |
| `cstp_report_metrics` | Report metric authority | server-only | — | — | S/I/U/D | RLS, no browser policy | protected CSTP API |
| `cstp_report_sessions` | Report/session evidence links | server-only | — | — | S/I/U/D | RLS, no browser policy | protected CSTP API |
| `cstp_report_audit_links` | Report audit lineage | server-only | — | — | S/I/U/D | RLS, no browser policy | protected CSTP API |

Deprecated/unused: `announcements` is a legacy database table with no current repository consumer and no application-role CRUD privileges. The client uses `announcement-slides-manifest.js` plus browser-local admin state. Keep the table during an observation period; remove it only in a separate migration after external-consumer verification. The `announcements` Storage bucket remains active for image delivery.

## Storage model

| Bucket | Purpose | State/readers | Uploader and ownership path | Update/delete rule |
|---|---|---|---|---|
| `session-images` | Private session media | private; authenticated reads | authenticated owner; first path segment is `auth.uid()` | matching UID path owner |
| `profile-avatars` | Account avatar media | private; authenticated reads | authenticated owner; UID-prefixed path | matching UID path owner |
| `grow-gallery` | Published gallery media | public read | authenticated owner; UID-prefixed path | matching UID path owner |
| `source-logos` | Source brand media | public read | admin only | admin only |
| `announcements` | Announcement slide media | public read | admin only | admin only |

Storage object policies are fingerprinted by name, command, roles, normalized `USING`, and normalized `WITH CHECK`. Bucket public state, size limit, and MIME allow-list are also fingerprinted.

## RPC boundaries

- GEE canonical analytics: public Global/Community projections, authenticated Owner projection, admin cross-owner projection, and protected diagnostics. Internal versioned helpers are owner-only.
- Public identity: safe public identity, recognition, and follow projections; private profile tables are not exposed.
- Sharing: authenticated management/direct-share RPCs and one intentionally public slug reader.
- Directory mutation: authenticated record-usage and admin review/promote RPCs; direct REST remains read-only.
- Community activity: authenticated owner write RPC; public/owner/admin feed reads through RLS.
- Admin workflows: moderation, cleanup, role management, and recognition administration require internal admin authorization.
- Notifications/workers: service-role table paths are explicit and limited to delivery/reminder needs.
- CSTP: no browser RPC. Protected server routes use service-role table access while preserving immutability triggers and publication rules.

Exact function callers, signatures, privileges, owners, and search paths are maintained in `grow-function-access-audit-2026-07-15.md`.

## Developer Preview and Developer Scenarios

Preview fixtures are client-memory/static fixtures. They never write to Supabase, never mix with live records, never contribute to GEE analytics, never appear in production mode, and are not part of the database security model. Preview mutation guards must remain read-only. Deterministic local database demo fixtures are a separate local-only QA system with explicit safety checks.

## Migration and review rules

- Use forward/additive migrations; do not rewrite applied production history.
- Use explicit relation operations and explicit function signatures. Never use `GRANT ALL`, blanket schema function grants, or blanket default privileges.
- Every grant must map to a confirmed application/server behavior.
- Every new table requires an access-method, privilege, RLS, policy, and service-role review.
- Every security-definer function requires a caller, internal authorization, owner, mutation/exposure, and fixed-search-path review.
- Keep canonical analytics RPC-first; do not grant raw cross-user evidence to browser roles.
- Review the human-readable fingerprint diff before intentionally updating `scripts/security/approved-security-fingerprint.json`. CI has no accept mode.
- Run `npm run security:verify` with local Supabase started before pushing. This cleanly replays migrations, seeds/verifies deterministic demo data, checks access/fingerprints/function inventory/GEE regressions/lint, runs Playwright and the production build, and finishes with `git diff --check`.
