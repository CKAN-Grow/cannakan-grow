# Foundation Note FN-003 — Canonical Entities & Representation

**Status:** Validated
**Captured:** July 19, 2026
**Related areas:** Grow Profile, Grow Network, Sources, Breeders, Organizations, Testing Programs, GEE, GKG

## Observation

Grow needs a durable way to distinguish the members who participate in the platform, the ecosystem objects they interact with, and the knowledge created through that activity.

Without this distinction, a person can be mistaken for an organization, a representative can appear to own an Entity, and evidence can become coupled to a temporary account or role. That would fragment identity, weaken historical continuity, and encourage separate architectures for each new capability.

> Every major capability within Grow should primarily belong to one of these three foundational domains. Future platform capabilities should extend these domains rather than introducing parallel architectural models.

## Core Ecosystem Model

Grow is organized around three foundational domains: **People**, **Entities**, and **Knowledge**. Relationships connect these domains, and Grow Network is the platform layer through which those relationships can be understood and navigated.

```text
                    Grow

        ┌───────────┼───────────┐
        │           │           │
      People      Entities    Knowledge
        │           │           │
        └────── Relationships ───┘
                 Grow Network
```

> People create, manage, and share knowledge. Entities accumulate identity, context, relationships, and evidence. Knowledge connects the Grow ecosystem.

People may come and go. Organizations may evolve. Evidence should remain durable.

Sources and Breeders are the first supported Entity types. Future Entity types should extend the canonical Entity architecture rather than introducing parallel systems.

## People

People are individual members represented by Grow Profiles.

Examples include:

- Growers
- Testers
- Educators
- Collectors
- Community Contributors
- Individual breeders
- Employees or representatives of organizations

People may:

- own Grow Profiles
- create Grow Sessions
- maintain Seed Vaults
- earn Recognition
- build Connections
- participate in Testing Programs
- participate in Grow Alongs
- represent canonical Entities when authorized

People create, manage, and share knowledge.

People are never interchangeable with the Entities they represent. A person may practice breeding or work for a source without becoming the canonical Breeder or Source Entity.

## Entities

Entities are durable ecosystem objects that exist independently of any one member.

Sources and Breeders are the first supported Entity types. Future architectural direction may include:

- Organizations
- Manufacturers
- Research Groups
- Laboratories
- Universities
- Retailers
- Events
- Strategic Partners

This note does not imply that Grow currently supports every future Entity type.

Entities accumulate identity, context, relationships, and evidence over time. They may:

- maintain a canonical identity
- connect to varieties
- connect to evidence
- connect to Testing Programs
- have multiple Authorized Representatives
- maintain historical continuity as representatives change

Entities do not create Grow Sessions. People create Grow Sessions. Sessions and other evidence may reference canonical Entities.

## Knowledge

Knowledge is everything Grow learns, records, aggregates, and publishes.

Examples include:

- Grow Sessions
- GEE — Grow Evidence Engine evidence
- Variety information
- Source evidence
- Breeder evidence
- Community Reports
- Testing Program results
- Grow Along results
- Recognition
- Learning content
- analytics
- aggregated insights
- future AI-generated summaries

Knowledge connects People and Entities. It should remain durable even when people, representatives, or organizational structures change.

Evidence provenance must remain understandable. Knowledge may reference the person who created it and the Entities to which it relates, but neither a representative nor an Entity may rewrite system-owned evidence.

## Foundational Principles

- People create, manage, and share knowledge.
- Entities accumulate identity, context, relationships, and evidence.
- Knowledge connects the Grow ecosystem.
- People may come and go.
- Organizations may evolve.
- Evidence should remain durable.
- Sources and Breeders are the first Entity types.
- Future Entity types should extend the canonical Entity architecture rather than introducing parallel systems.

## Ownership

This domain ownership complements Grow's platform-wide Information Ownership Model. It describes which experience is authoritative for a concept; it does not transfer legal ownership or permit a member to control system-owned evidence.

### People own

- Profiles
- Sessions
- Vaults
- Connections

### Entities own

- Canonical identity
- Representation relationships
- Context

### Knowledge owns

- Evidence
- Reports
- Analytics
- Learning

Knowledge remains authoritative for evidence even when a Person represents an Entity associated with that evidence.

## Canonical Entity Rules

> One Entity. One Canonical Page. Many Authorized Representatives.

The canonical Entity is the durable record. Therefore:

- aliases map to the canonical Entity
- historical names map to the canonical Entity
- regional names map to the canonical Entity
- duplicate records must not produce competing public pages
- evidence remains attached to the canonical Entity
- representatives never own the evidence
- representatives never replace the Entity

Canonicalization must preserve provenance. An alias, former name, regional division, or merged duplicate may remain discoverable as historical context while resolving to one canonical Entity Profile.

When Entity records merge, immutable evidence relationships must be reassigned through an auditable process without changing the meaning, author, eligibility, or original provenance of the evidence.

## Entity Profiles

Source and Breeder pages should eventually use a shared Entity Profile architecture.

Examples include:

- Source Entity Profile
- Breeder Entity Profile
- Organization Entity Profile
- Research Entity Profile

Entity type determines capabilities and presentation, but the underlying canonical model remains shared. Grow should not create a separate identity system for every Entity type.

An Entity Profile may combine canonical identity, approved descriptive fields, relationships, representation state, verification, and system-owned evidence summaries. Entity capabilities must be explicit and type-aware rather than inferred from free text.

## Representation

Representation is an explicit relationship between a Person and a canonical Entity. It allows an Authorized Representative to manage approved Entity fields within a defined scope.

Representation is not ownership. It does not transfer the Entity, its history, its evidence, or its reputation to the representative.

### Claim Representation

Claim Representation should be a controlled workflow rather than an account-role shortcut. A future workflow should:

1. identify the canonical Entity;
2. collect the member's asserted relationship and supporting information;
3. verify authority using an appropriate process;
4. grant only the approved permission scope;
5. record the decision and audit history;
6. support review, revocation, succession, and dispute resolution.

An Entity may have multiple Authorized Representatives or representative teams. A Person may represent multiple Entities when each relationship is independently authorized.

Representation permissions should be scoped. For example, one representative might maintain contact details while another manages Testing Program administration. No representation scope may permit alteration of system-owned evidence.

## Relationship Model

Grow Network is the relationship layer of the Grow ecosystem, not merely a directory of people.

The architecture should eventually support:

- Person ↔ Person
- Person ↔ Entity
- Entity ↔ Entity
- Person ↔ Knowledge
- Entity ↔ Knowledge

Examples include:

- a grower connects with another grower
- a tester is authorized to represent a breeder
- a source is associated with available varieties
- a breeder launches a Testing Program
- a Grow Session contributes evidence to a Variety and an Entity
- an Authorized Representative manages approved fields on an Entity Profile
- an Entity is connected to Community evidence
- a regional division relates to a parent Entity

Each relationship must have a canonical type, direction, provenance, authorization boundary, and lifecycle where applicable. Connections between People must not be treated as representation, and direct access to shared knowledge must not automatically create a broader relationship.

## Separation of Concerns

Grow must preserve clear boundaries between:

- **Identity** — who a Person is through a Grow Profile
- **Entity** — the durable ecosystem object
- **Representation** — the authorized Person-to-Entity relationship
- **Verification** — confirmation of a specific claim or status
- **Reputation** — context accumulated through trusted activity and evidence
- **Permissions** — the actions an authenticated actor may perform
- **Evidence** — system-owned records and derived knowledge

These concepts must not collapse into one another:

- choosing a role never creates an Entity
- a self-declared Breeder role does not create a Breeder Entity
- a self-declared Source role does not create a Source Entity
- choosing a role never grants representation
- representation never grants verification
- verification never alters GEE evidence
- reputation does not create permissions
- permissions do not make evidence member-owned
- Authorized Representatives may manage approved Entity fields but may never alter system-owned evidence

## Verification, Reputation, and Evidence

Verification should describe what Grow has validated and at what scope. Entity verification, representation verification, and evidence eligibility are separate decisions.

Representation verification confirms that a Person may act for an Entity. It does not certify every Entity claim, endorse a product, or modify GEE calculations.

Reputation may emerge from durable, attributable activity, but it should not become a follower-based popularity system. Recognition remains system-owned and should reflect defined accomplishments or participation rather than self-declared status.

Evidence must retain its original author, timestamps, eligibility state, Entity relationships, and provenance. Representatives may correct approved descriptive Entity fields through audited workflows, but they may not edit results, analytics, Community evidence, or other system-owned knowledge.

## Why It Matters

This model allows Grow to expand without confusing People, organizations, and evidence. It:

- preserves one identity system for People
- creates one extensible architecture for Entities
- protects evidence through representative and organizational change
- supports multiple representatives without duplicate public pages
- gives Grow Network a durable relationship vocabulary
- gives GKG — Grow Knowledge Graph stable nodes and relationships
- allows GEE evidence to remain independent from representation and verification
- supports future Testing Programs and Grow Alongs without parallel ownership models

## Foundation Alignment

- Build once, extend forever
- One canonical source of truth
- Honest evidence
- Clear information ownership
- Privacy and authorization by design
- Durable history and provenance
- Connections, not follower-based popularity
- People and shared experiences should remain understandable

## Explicit Non-Goals

This note does not:

- create Entity tables or Entity Profiles now
- introduce future Entity types now
- grant representation through a selected role
- authorize Claim Representation UI or workflows now
- change GEE calculations or evidence eligibility
- change Grow Network behavior now
- implement Testing Program or Grow Along ownership now
- alter RLS, permissions, APIs, or application behavior
- allow representatives to edit system-owned evidence

## Future Implementation Direction

### Canonical Identity

- define the canonical Entity model
- define an Entity type taxonomy
- support aliases and canonicalization
- add duplicate detection
- define an auditable Entity merge workflow

### Representation

- define the Person-to-Entity representation relationship model
- support multiple representatives and representative teams
- define scoped permissions
- define representation verification
- preserve audit history
- support revocation
- support succession
- define dispute resolution

### Relationships

- model parent and subsidiary Entities
- model regional divisions
- integrate canonical Entity relationships with Grow Network
- preserve relationship provenance and lifecycle state

### Knowledge

- preserve immutable evidence relationships
- integrate Testing Program ownership
- map People, Entities, Knowledge, and relationships into GKG
- integrate Entity relationships with analytics without altering underlying evidence

### Platform

- define the Entity Profile rendering contract
- enforce authorization and RLS
- design a backward-compatible migration strategy
- add migration, security, compatibility, and regression coverage

## Open Questions

- Which Entity types launch first?
- Can one Entity fulfill multiple operational roles?
- Are Source and Breeder always separate Entity types?
- How are aliases normalized?
- How are duplicate Entities merged?
- How are regional divisions represented?
- How should parent and subsidiary relationships work?
- What fields may Authorized Representatives edit?
- Which fields remain system-owned?
- How are representation disputes resolved?
- Can one member represent multiple Entities?
- Can one Entity have multiple representative teams?
- How does Grow preserve evidence when Entity records merge?
- Which representation claims require external verification?
- How should representation succession work when an organization changes personnel?
- Which relationships belong in Grow Network, and which should remain internal GKG context?

## Decision History

- **2026-07-19 — Validated:** People, Entities, and Knowledge were established as Grow's three foundational domains. Sources and Breeders were identified as the first supported Entity types, with representation retained as an explicit, scoped relationship rather than identity or ownership.
