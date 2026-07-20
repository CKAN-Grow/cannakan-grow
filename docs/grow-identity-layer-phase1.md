# Grow Identity Layer, Phase 1

## Purpose

Grow Identity is the privacy-aware member identity contract shared by Profile,
Grow Network, Community attribution, direct Seed Vault sharing, and future Grow
features. It is not a reputation score and it does not replace Recognition.
Phase 1 adds the data and authorization boundary only; it makes no visual or
analytics changes.

## Existing architecture audit

Before Phase 1, identity was split across several working contracts:

- `profiles` was the private account authority for authentication-adjacent data,
  account status, username, email, and avatar.
- `public_member_profiles` was the member-facing Profile and publication row,
  including display name, handle, avatar, public bio/location, Profile settings,
  Vault theme, Grow ID type, and verification flags.
- `safe_public_member_profiles` projected publishable rows for public Profile,
  Network, Community, and Vault-share lookup consumers.
- `grow_follows` was the only relationship graph. It represented one-way follows,
  not accepted connections.
- `seed_vault_share_users` was the authority for direct Vault access.
- `recognition_definitions` and `user_recognitions` were system-owned evidence and
  Recognition data.
- Developer Scenario profiles and Recognition records were isolated browser
  fixtures and did not establish a production identity authority.

The principal conflict was that profile publication, search discovery, field
privacy, follower permission, and optional personalization were represented by a
small group of booleans and a legacy `public/private` value. Safe projections
could protect legacy public pages, but there was no one viewer-aware server
contract for future consumers. Phase 1 keeps both existing profile tables and
formalizes `public_member_profiles` as the canonical member identity row while
leaving private account data in `profiles`.

## Canonical model

Migration `20260718120000_grow_identity_layer_phase1.sql` extends
`public_member_profiles` with:

- identity: canonical username, cover image, primary role, experience level,
  years growing, languages;
- growing style: environments, favorite germination methods, interests, goals,
  favorite breeders, and favorite sources;
- general location: city, state/province, country, and optional timezone;
- independent preferences: Network discoverability, connection-request
  permission, invitation preferences, and personalization consent;
- provenance: an allowlisted, versionable per-field JSON object.

Multi-value fields are normalized arrays, trimmed, case-insensitively deduplicated,
ordered by first occurrence, and capped server-side. The model is plant-neutral;
current cannabis data remains valid without constraining future seed-grown plants.

Shared constants live in the database contract function
`get_grow_identity_contract_v1()` and the checked JavaScript mirror
`src/grow-identity-contract.js`. A regression check compares their values.

## Privacy dimensions

Profile visibility is one of:

- `personal`: full identity is owner/admin only and ordinary Network search omits it;
- `connections`: reciprocal `grow_follows` relationships can receive
  connection-visible fields, and discoverable profiles can provide a limited
  search preview;
- `public`: signed-in members can receive public fields. Existing explicitly
  public URLs retain their pre-existing anonymous safe projection only.

An accepted connection is conservatively defined as reciprocal rows in the
existing `grow_follows` graph. No second relationship system was introduced.

`grow_network_discoverable` is independent. Disabling it removes the member from
ordinary search but does not delete reciprocal follows or direct Vault shares.

`grow_identity_field_visibility` stores an allowlisted field key and one of
`only_me`, `connections`, or `public`. RLS allows an owner or administrator to
read that configuration. Browser roles cannot mutate the table directly;
validated owner mutations occur through the canonical update RPC.

Location storage and display are separate. City defaults to `only_me`;
state/province and country default to `public`. Viewer RPCs construct a location
object only from authorized fields and safely fall back to country when state is
absent. Hidden city values never enter unauthorized payloads.

Connection-request permission (`anyone`, `mutual_connections`, `nobody`), future
invitation preferences, and optional personalization consent are separate from
display privacy. Consent does not publish a field. Mutual-connection evaluation
uses reciprocal relationships through a fixed server-side validation helper.

## Viewer-aware read flow

`get_grow_identity_v1(owner_user_id, read_context)` is the canonical boundary:

1. derive the viewer from `auth.uid()`;
2. verify the owner is an active account;
3. derive owner/admin, reciprocal connection, or direct Vault-share context;
4. enforce profile visibility and, for search, discoverability;
5. resolve each allowlisted field on the server;
6. construct JSON only from authorized values.

The browser cannot supply a viewer UUID. Supported contexts are `direct`,
`network_search`, `community_attribution`, and `vault_share`. Direct Vault access
does not grant a full identity: without another relationship it receives only the
public-safe fields needed for attribution. `get_my_grow_identity()`,
`search_grow_identities_v1()`, and `can_request_grow_connection_v1()` reuse the
same boundary.

The legacy `safe_public_member_profiles` view remains for compatible public URLs
and existing consumers, but now contains only explicitly public profiles and
public fields. Connections-only Network discovery belongs to the authenticated
RPC. `get_public_identity_and_recognition()` also consults the canonical profile
and Recognition-field visibility so it cannot bypass private Profile settings.

## Owner update and provenance

`update_my_grow_identity_v1(identity_input)` derives the owner from `auth.uid()`,
accepts an explicit allowlist, validates all enums, normalizes arrays and empty
values, validates visibility keys, and records touched self-declared fields as:

```json
{
  "experience_level": {
    "source": "self_declared",
    "updated_at": "2026-07-18T00:00:00Z"
  }
}
```

The provenance vocabulary is `self_declared`, `observed`, `suggested`,
`user_confirmed`, and `system_verified`. Only `self_declared` is produced here.
Recognition, verification flags, evidence, admin state, and arbitrary keys are
not accepted. A trigger also blocks direct member writes to verification,
reserved identity, and provenance state. Self-declared role/experience therefore
never becomes Recognition or verified trust state.

## Migration and compatibility

- Explicit legacy private or disabled profiles map to `personal` and are not
  discoverable.
- Explicit legacy public profiles remain `public` to preserve intentional
  publication and URLs.
- Existing `connections` values remain `connections`.
- Ambiguous legacy state maps to `connections`, never broader.
- Existing public profiles receive public field defaults (except city); personal
  profiles receive `only_me`; new and connections profiles use public identity
  basics plus connection-scoped details.
- Legacy show/follower booleans remain synchronized. The small client normalizer
  understands the canonical values, so ordinary Profile edits do not silently
  broaden a connections-only member.
- Existing Recognition rows, follows, Vault shares, URLs, fixtures, and analytics
  tables are not rewritten.

The migration is additive and does not delete legacy columns. For rollback,
revoke the new RPCs, restore the prior safe view and legacy sync function, stop
new writes to the visibility table, and remove the new trigger/table/columns only
after verifying no consumer has adopted them. Production rollback should be a
new forward migration; never edit applied history.

## Security boundary

All new callable browser RPCs require `authenticated`; anonymous execution is
revoked. Internal relationship/visibility helpers are also revoked from browser
roles. RLS is enabled on the visibility table, there is no browser insert/update/
delete grant, and owner updates cannot name another owner. SQL resolution uses a
fixed key allowlist rather than dynamic SQL. No service-role key or precise
location was introduced into client code.

## Future integration points

- Profile: adopt the owner read/update RPCs before adding new controls.
- Grow Network: use authenticated search previews and direct reads rather than
  hydrating the entire profile row.
- Community and Vault sharing: request the relevant read context; never cache a
  fuller identity payload into public records.
- GPE/GCE/GRE/GTE, Testing Programs, Grow Alongs, learning, and recommendations:
  consume only consented, server-filtered identity fields and keep evidence-based
  outputs separate from self-declared values.
- Invitations: honor the centralized preference contract when those products are
  built; Phase 1 deliberately creates no invitation system.
- CSTP: no Phase 1 dependency was found. Its public-product retirement remains a
  separate product migration; no CSTP behavior changes here.

## GIE to GEE naming plan

GIE is becoming **GEE — Grow Evidence Engine**, but Phase 1 does not rename it or
alter formulas, contracts, eligibility, ranking, or analytics. The audit found
1,050 matching lines across 55 files: 15 migration files, 28 scripts, 9 docs, one
Playwright file, and two root application/style files. Applied migration names,
database objects, RPC names, security fingerprints, fixtures, and tests are all
coupled to the current name.

A safe later migration should:

1. inventory exact database objects and external clients;
2. add GEE-named compatibility wrappers without dropping GIE contracts;
3. migrate application call sites and observability labels in bounded groups;
4. run dual-contract parity and analytics-eligibility tests;
5. deprecate old names for a documented release window;
6. remove aliases only in a later additive migration after usage confirms zero
   callers.

Applied migration filenames remain historical records and should not be renamed.
