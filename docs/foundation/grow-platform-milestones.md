# Grow Platform Milestones

This document records permanent architectural milestones in the evolution of Grow. A milestone is recorded only when it establishes a durable foundation that future capabilities extend rather than replace.

# Platform Milestone 1 — Grow Identity Layer

**Status:** Complete  
**Completed:** July 18, 2026

## Summary

Grow established one canonical, privacy-aware identity foundation for members across the ecosystem. The milestone extended the existing member profile architecture instead of creating a competing identity record.

The canonical contract now supports normalized core identity and growing preferences, profile and field visibility, Grow Network discoverability, connection and invitation preferences, personalization consent, and identity provenance. Viewer-aware server authorization determines which fields a member may receive based on ownership, Connections, field visibility, discovery context, direct Vault relationships, and explicit administrative authority.

An owner-only update contract validates supported fields, normalizes multi-value data, and prevents members from changing system-owned Recognition, verification, trust, evidence, or administrative state.

## Why It Matters

Grow now has one trusted answer to who a member is, what they choose to share, and who may receive it. Private identity data is filtered at the server boundary rather than delivered to unauthorized clients and hidden in presentation code.

The architecture explicitly separates:

- **Identity** — member attributes and preferences
- **Reputation and Recognition** — system-owned acknowledgements supported by activity or evidence
- **Evidence** — canonical grow records and qualified analytical outputs

This separation lets future capabilities become more useful without treating self-declared information as verified fact or weakening member privacy.

## Foundation Principles Reinforced

- Create genuine value first
- Trust is earned
- Evidence matters
- Knowledge should be shared responsibly
- Better decisions create better outcomes
- Build durable foundations that future capabilities extend

## Enabled Capabilities

The foundation can support future work for:

- Grow Network Connections and discovery
- Shared Vault identity and attribution
- Community attribution
- Grow Alongs and collaboration invitations
- Testing Program participation and invitations
- Breeder and Source participation
- Consent-aware personalization and recommendations
- Location-aware discovery with controlled display precision
- GPE, GCE, GRE, and GTE integrations

These capabilities are enabled architecturally; they were not built as part of this milestone.

## Architectural Impact

### Before

- Member identity was split across private account profiles, public member profiles, and feature-specific consumers.
- Profile publication, discoverability, communication permissions, and field privacy were partially collapsed into legacy booleans and broad visibility states.
- Consumers could implement inconsistent identity filtering.
- Location storage and display precision were not governed by one field-aware contract.
- Self-declared identity and system-owned Recognition needed a stronger formal boundary.

### After

- The existing member profile is formalized as the canonical Grow Identity record.
- Profile visibility uses `personal`, `connections`, and `public`.
- Each supported field can use `only_me`, `connections`, or `public` visibility.
- Grow Network discoverability, connection permissions, invitation preferences, and personalization consent are independent settings.
- Viewer-aware RPCs derive authenticated identity server-side and return only authorized fields.
- Identity provenance distinguishes self-declared, observed, suggested, user-confirmed, and system-verified values.
- Recognition and evidence remain system-owned and cannot be assigned through member profile updates.
- Existing Profile, Community, Grow Network, shared Vault, Recognition, and Developer Scenario behavior remains compatible.
- Existing members receive privacy-preserving migration defaults; unclear legacy states are never broadened automatically.

