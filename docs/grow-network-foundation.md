# Grow Network Foundation

## Purpose

Grow Network is the authenticated relationship workspace for Grow. It helps a
member find and recognize growers, breeders, sources, and industry participants
without turning Grow into a follower-count or social-feed product.

The canonical route is `#network`, the navigation label is **Network**, and the
page title is **Grow Network**. The existing personal Grow Profile dashboard is
preserved at `#grow-profile`; account settings remain at `#profile`.

## Architecture audit

Before this foundation, `#network` rendered the personal “My Grow Home” profile
dashboard. That screen included follower-oriented presentation and did not
provide a dedicated relationship directory. Grow already had the correct
backend foundations, so no parallel relationship store or provider was needed:

- `grow_follows` is the existing relationship table.
- An accepted connection is the reciprocal pair of `grow_follows` rows defined
  by `grow_identity_is_connection_v1`.
- `get_grow_identity_v1` is the viewer-aware identity boundary for an accepted
  connection.
- `search_grow_identities_v1` is the privacy-aware discovery boundary.
- Recognition is system-owned and arrives only through the authorized Grow
  Identity payload.

The Network page is therefore a read projection over existing contracts, not a
new social graph.

## Page structure

Grow Network uses a focused, responsive workspace without a permanent sidebar:

1. a premium hero with Network search and **Discover Growers**;
2. authoritative accepted-connection metrics;
3. **Browse by Type** filters for Growers, Sources, and Breeders;
4. **My Connections**, containing reciprocal relationships only;
5. privacy-aware discovery results;
6. a compact, non-interactive future-integration summary.

The interface intentionally avoids a feed, likes, popularity rankings, and
follower counts. Future Grow Along, mentorship, and testing-program integration
is presented as product direction, not as active functionality.

## Identity and role model

Cards consume only fields returned by the canonical Grow Identity contract.
The primary-role taxonomy remains:

- Grower
- Breeder
- Source
- Educator
- Researcher
- Community Contributor
- Industry Partner

For browsing, educators, researchers, and community contributors remain in the
Grower category; industry partners use the Source category. This is a display
grouping only and does not alter stored identity roles.

## Privacy and security

The browser never chooses the identity viewer. RPCs derive the viewer from the
authenticated session and construct payloads only from fields authorized for
that relationship.

- Personal identities are excluded from discovery.
- Undiscoverable identities are excluded from search.
- Connections-only identities are available only when the reciprocal
  connection contract permits them.
- Hidden city or other restricted fields never enter the Network payload.
- Safe state/province and country fallbacks are rendered only when supplied by
  the canonical RPC.
- Recognition remains system-owned and cannot be self-asserted by this page.
- Live failures show a generic retry state and do not expose database details.

## Requests and pending state

There is not yet an authoritative connection-request state or request table.
Directional `grow_follows` rows cannot safely be relabeled as pending requests,
because they predate request semantics and are used by existing follow
behavior. The foundation therefore does **not** fabricate a Pending metric or
Requests panel. Those interfaces should be added only when a canonical request
lifecycle exists.

## Developer Scenarios

Full Grow Demo includes the minimum synchronized Network fixture needed for
coverage:

- four reciprocal accepted connections;
- Grower, Breeder, and Source roles;
- authorized location and Recognition examples;
- one public discoverable identity;
- one connections-only undiscoverable identity;
- one personal identity excluded from Network presentation.

The scenario page uses the same reciprocal resolver and normalized identity
shape as live data. Preview records remain browser-only and write-blocked.

## Extension points

Future Network work should extend the existing contracts rather than introduce
another graph. Suitable additions include a canonical request lifecycle,
connection invitations, Grow Along participation, mentorship, and testing
program coordination. Each addition must preserve viewer-aware identity reads,
reciprocal accepted-connection semantics, and system-owned Recognition.
