# PF-003 — Profiles, Relationships & Access

**Status:** Canonical

**Scope:** Person, Source, Breeder, Organization, Garden, and future Entity Profiles

**Classification:** Platform architecture

## Purpose

This specification defines the canonical architectural relationship between:

- Profiles
- Identity
- Relationships
- Permissions
- Information Ownership

It applies to every current and future Profile type in Grow, including Person,
Source, Breeder, Organization, Garden, and future Entity Profiles.

This document defines architecture, not implementation.

## North Star

> Profiles introduce identities.

> Relationships create experiences.

Profiles answer:

> Who is this?

Relationships answer:

> What can we share together?

These responsibilities remain intentionally separate throughout Grow.

## Information Ownership

Profiles do not own information.

Profiles present curated views of information owned by other canonical domains.
Those domains remain responsible for:

- data ownership
- lifecycle
- permissions
- business logic
- visibility
- security

Profiles are presentation surfaces, not information owners.

Information shown on a Profile remains governed by the domain that owns it. A
Profile may introduce, summarize, preview, or link to that information without
absorbing its ownership or redefining its rules.

## Design Philosophy

A Grow Profile is a curated introduction.

It is not:

- a dashboard
- a file browser
- an inventory
- a permissions page
- a collection of everything an identity owns

Profiles should tell the story of an identity. Relationships determine access
to deeper experiences.

## Identity and Presentation

Profiles represent identities.

Profiles do not contain every piece of information owned by an identity.
Instead, they present curated entry points into information owned by other
canonical domains.

This separation allows identity, domain information, permissions, and Profile
presentation to evolve independently while preserving a coherent Grow
experience.

## Architectural Principles

### Profiles Introduce

Profiles help visitors understand an identity. They may communicate:

- identity
- personality
- journey
- trust
- public contributions

Profiles intentionally avoid exposing everything an identity owns.

### Relationships Create Experiences

Relationships—not Profiles—determine access.

Relationships may unlock experiences such as:

- Shared Seed Vaults
- Shared Collections
- Grow Plans
- Grow Alongs
- future collaboration features
- additional Profile fields
- other permission-controlled resources

Profiles never own authorization. The Relationship layer owns relationship
permissions, while each canonical domain continues enforcing its own ownership,
visibility, and access rules.

### Domains Retain Authority

Every domain remains authoritative for its information and behavior. Profile
composition must consume viewer-safe domain projections rather than duplicating
or bypassing domain logic.

### Presentation Does Not Grant Access

Displaying a link, preview, relationship state, or action on a Profile does not
grant access. Every destination must enforce its canonical access contract.

## Profile Composition Principles

Profiles are composed from foundational and conditional sections.

### Foundational Sections

Foundational sections are always present. Examples include:

- Hero
- Journey
- Recognition
- Grow ID

Foundational sections maintain the identity narrative even when an identity has
limited public activity.

### Conditional Sections

Conditional sections appear only when they contain eligible public content.
Examples include:

- Featured Collections
- Public Grow Snapshots

If no eligible content exists:

- owners receive appropriate onboarding
- visitors do not see the section

Conditional content must be evaluated through the owning domain's visibility
and permission rules.

## Owner Experience

Owners may receive contextual onboarding where appropriate. Examples include:

- Create your first Collection
- Publish your first Grow Snapshot
- Write your introduction

Owner onboarding is never visible to visitors. It is a presentation aid, not a
substitute for the workflows owned by Collections, Community, Sessions, or
other canonical domains.

## Visitor Experience

Visitors never see:

- empty placeholders
- “No collections”
- “Nothing here”
- “Profile incomplete”
- setup guidance

Sections without eligible public content are omitted entirely. A visitor-facing
Profile should always feel intentional.

## Foundational Experience Contracts

### Journey

Journey is foundational and always exists.

The minimum Journey milestone is:

- Joined Grow

Every identity begins its story here. Additional Journey information remains
subject to its owning domain and visibility rules.

### Recognition

Recognition is foundational and always exists.

The minimum Recognition is:

- Grow Member

Recognition reflects trust, participation, and contribution. Its definitions,
eligibility, lifecycle, and visibility remain governed by the canonical
Recognition architecture.

## Conditional Experience Contracts

### Collections

Collections are conditional.

When eligible public featured Collections exist, the Profile may display them.

When none exist:

- the owner receives onboarding
- a visitor does not see the section

Collections remain owned by the Seed Vault and Collection domains. The Profile
provides a curated introduction and entry point only.

### Public Grow Snapshots

Public Grow Snapshots may appear on a Profile because they were intentionally
shared.

Private snapshots never appear. Snapshot ownership, publication, moderation,
visibility, and lifecycle remain with the canonical Community and Session
domains.

Visitors may discover a grower’s public work through the Profile without the
Profile becoming the owner of that work.

## Grow Network and Connections

Connections belong to the Grow Network.

Profiles may display relationship state or Connection actions. The Relationship
determines which additional experiences become available, and the destination
domain enforces the resulting permissions.

A Profile must not independently infer, expand, or override Connection access.

## Entity Profile Boundaries

Person Profiles must never contain:

- Featured Sources
- Featured Breeders

Sources and Breeders are canonical entities with their own Profiles. Visitors
discover those entities through:

- Collections
- Sessions
- Community
- Entity Profiles

They are not presented as curated identity sections on another Person Profile.

The same principle extends to future Entity Profiles: one Profile may introduce
or link to another canonical entity, but it must not absorb that entity’s
identity, information ownership, or management surface.

## Canonical Access Principle

Profiles never determine authorization.

Profiles may provide:

- links
- previews
- entry points
- relationship-state indicators
- permitted actions

Authorization is determined exclusively by the combined canonical contracts
for:

- Relationship
- Visibility
- Ownership
- domain-specific permissions

Profiles remain presentation surfaces rather than permission systems.

## Separation of Architectural Concerns

Grow preserves the following boundaries:

| Concern | Canonical responsibility |
| --- | --- |
| Identity | Defines who or what the Profile represents |
| Profile | Curates the introduction and presentation |
| Relationship | Defines how identities are connected |
| Permission | Determines which actions and resources are allowed |
| Information Ownership | Determines which domain owns lifecycle and business rules |
| Visibility | Determines which viewer-safe information may be presented |

No Profile implementation may collapse these concerns into one Profile-owned
model.

## Future Compatibility

This specification must remain compatible with:

- Shared Vaults
- Trusted Connections
- Grow Teams
- Organizations
- Gardens
- future permission models

Future capabilities must preserve the separation between:

- Identity
- Relationships
- Permissions
- Information Ownership
- Presentation

New relationship types may expand shared experiences without expanding the
Profile’s ownership or authorization responsibilities.

## Architectural Guarantees

Every future Profile implementation must preserve these guarantees.

Profiles never become:

- dashboards
- inventories
- permission systems

Profiles never:

- own another domain’s data
- bypass the Relationship model
- bypass domain-specific permissions
- expose private information through presentation logic
- expose the absence of visitor-ineligible content
- grant access merely by displaying an entry point

Identity, Relationships, Permissions, Information Ownership, Visibility, and
Presentation remain separate architectural concerns.

## Design Principle

> Profiles introduce identities. Relationships create experiences.

Identity and access remain intentionally separate throughout Grow.

## Relationship to Other Profile Specifications

This document defines the access and ownership architecture inherited by the
[Profile Experience Framework](../profile-experience-framework/README.md) and
all entity-specific Profile specifications.

The Profile Experience Framework defines shared composition and presentation.
Entity-specific specifications define the content appropriate to the identity
being presented. Neither layer may override the ownership and authorization
boundaries established here.

## Implementation Notes

This specification is architectural only.

It does not:

- modify application code
- create UI
- change routing
- modify database schemas
- define a storage model
- change runtime behavior
- implement new Relationship or permission features

Implementation work must reference this specification while continuing to use
the canonical contracts owned by Identity, Relationship, Visibility, and each
information-owning domain.
