# Profile Visual Language

## Purpose

This document defines the shared visual direction for all Grow Profiles.

## Brand Direction

The approved standing direction uses:

- Grow brand colors
- a dark glass-style theme
- premium visual depth
- calm presentation
- editorial spacing
- restrained use of brand green
- color to create hierarchy and prevent the page from becoming visually lost in black

## Relationship to the Seed Vault

The Profile may share established design principles with the current premium Seed Vault direction, including:

- centered constrained page width
- atmospheric backgrounds
- glass surfaces
- soft borders
- subtle glow
- generous spacing
- strong typography
- section-specific accent colors
- clear separation between major sections

The Profile should share this design language without duplicating the Seed Vault layout or becoming a copy of the Vault.

## Color Use

- Brand green is a meaningful accent, not a blanket tint.
- Supporting accent colors may distinguish modules.
- Accent colors should remain restrained and cohesive.
- Photography and content should remain visually dominant where appropriate.
- Dark backgrounds should retain texture, depth, and separation.
- Avoid endless identical black glass cards.

## Glass Surfaces

- Glass should support hierarchy rather than become the subject.
- Use controlled transparency.
- Use subtle borders and restrained glow.
- Preserve readable contrast.
- Maintain sufficient separation from background imagery.
- Avoid stacking unnecessary glass containers inside one another.

## Typography and Rhythm

- Use strong display typography for identity and major section titles.
- Keep supporting text restrained.
- Maintain generous vertical rhythm and clear content hierarchy.
- Limit competing labels.
- Use editorial transitions between sections.
- Not every section needs to be enclosed in a card.

## Imagery

- Profile design must not depend on a human face.
- Avatars may be imported social images, logos, illustrations, initials, plants, animals, or other personal imagery.
- Cover and featured imagery may communicate personality more strongly than the avatar.
- Branded fallbacks must remain premium.
- Imagery should not assume cannabis.
- The Profile must work equally well for tomatoes, peppers, flowers, herbs, cannabis, and other grow interests.

## Canonical Profile Hero Backgrounds

Profile Hero backgrounds are governed by the metadata catalog at
`public/assets/images/profile-heroes/catalog.json`. The catalog is the source of
truth for picker labels, entity eligibility, and defaults; user-facing code must
not duplicate filename lists.
Defaults are selected only through the catalog's explicit `default: true`
metadata. Filename prefixes and asset ordering have no product meaning.

The catalog has separate groups for Person, Source, and Breeder Profiles. An
image from one entity group must never be selected as another entity type's
curated background. Each group has exactly one default and may contain multiple
curated alternatives.

The shared resolver applies this order:

1. an authorized, saved custom cover
2. an eligible curated catalog selection
3. the entity-specific default

A malformed or unavailable catalog falls back to a validated runtime projection
generated from the same canonical metadata during the build. The projection is
not independently authored. The failure is cached so rendering does not
repeatedly request metadata or enter a refresh loop.

Hero composition preserves the image as the atmospheric foundation, then adds a
controlled vignette, subtle grid or grain, and restrained Grow lighting. The
left identity region remains readable while the center and right retain visible
photographic depth.
