# Profile Experience Framework

This document defines the canonical shared experience framework for all Grow Profiles.

It governs how Profiles are presented while allowing each canonical entity type to expose content appropriate to its identity and role within Grow.

## North Star

A Grow Profile should feel like a thoughtfully designed personal homepage that introduces a grower or entity in approximately thirty seconds and invites visitors to explore the rest of their Grow experience.

The page remains the Profile. “Personal homepage” describes how the experience should feel: an intentional introduction and overview that creates curiosity rather than attempting to summarize everything.

> The Grow Profile is curated, not configured.

Users and entity managers choose what represents them.

Grow decides how it is presented.

The platform owns composition.

The Profile owner owns the story.

## Framework Principles

- Use one shared Profile framework.
- Present entity-aware content.
- Maintain a consistent visual rhythm.
- Support structured personalization.
- Limit featured sections.
- Do not provide a free-form page builder.
- Treat mobile behavior as authoritative.
- Preview canonical product areas rather than duplicating their ownership.
- Allow content to vary while presentation remains consistently Grow.

## Thirty-Second Experience

Within approximately thirty seconds, a visitor should understand:

- who or what this Profile represents
- what is most important to that person or entity
- what they have chosen to feature
- why the visitor may want to explore further
- where to go next

## Shared Profile Anatomy

1. Hero
2. Lightweight identity or introductory statement
3. Primary featured content
4. Up to three supporting featured modules
5. Clear pathways into owning product areas
6. Profile footer and supporting actions

Entity-specific specifications may use terminology appropriate to the subject. A Person Profile may use **From the Grower**, a Source Profile may use **From the Source** or **Source Story**, and a Breeder Profile may use **Breeding Philosophy** or **From the Breeder**.

## Consistency Model

Every Profile should feel related. Every Profile should not feel identical.

The framework controls:

- page width
- hierarchy
- section rhythm
- typography
- responsive behavior
- module composition
- visual language

Entity-specific specifications control:

- available modules
- terminology
- content
- trust signals
- featured material
- entity-specific actions

## Information Ownership

The [Grow Foundation](../../foundation/README.md) defines canonical identity, ownership, privacy, People, Entities, and Knowledge. Profile modules preview canonical information owned elsewhere:

- Grow Sessions owns session evidence and performance.
- Seed Vault owns collections.
- Grow Network owns relationships and Connections.
- Community owns shared evidence, analytics, statistics, insights, and trends.
- Learn owns education.
- Canonical Entity systems own Source and Breeder identity.

The Profile must not become the canonical owner of those areas.

## Future Entity Types

Future Entity types may adopt this framework without redesigning the Profile system. Their entity-specific specifications should define appropriate modules, terminology, content, trust signals, and actions before implementation is authorized.

## Profile Hero Background Governance

Profile Hero backgrounds use one catalog, validator, and resolver shared by all
canonical Profile entities. Metadata defines stable IDs, human-readable titles,
relative files, and exactly one default for each of Person, Source, and Breeder.
The catalog's explicit `default: true` property is the sole default-selection
authority. Filenames, prefixes, and array order are implementation details and
must never determine Profile behavior. The emergency runtime projection is
generated from this catalog and checked for exact semantic equality.

Person owners may choose Person catalog backgrounds or upload a custom cover
through the existing Profile media and privacy contracts. Selection remains
pending until the Profile is saved; closing the editor does not mutate the saved
Profile.

Source and Breeder catalog groups establish safe defaults and future curated
choices. Management controls must not be shown until the corresponding entity
claiming and authorized media contract exists. A self-declared Person account
type is not a claimed Source or Breeder entity.

Public rendering receives only the privacy-approved cover URL. Storage paths and
private media metadata must never be exposed through public projections.

The resolver is entity-safe and deterministic: custom cover, eligible curated
selection, then entity default. Invalid IDs, cross-entity IDs, malformed paths,
or catalog-load failures resolve to the entity default without causing repeated
network requests or synchronous render-state mutation.
