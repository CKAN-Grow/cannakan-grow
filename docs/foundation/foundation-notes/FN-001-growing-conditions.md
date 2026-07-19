# Foundation Note FN-001 — Growing Conditions

**Status:** Validated  
**Captured:** July 19, 2026  
**Related areas:** Grow Sessions, GEE, GPE, GRE, Learning, Explore

## Observation

Growing conditions materially affect outcomes. Capturing standardized conditions at the session level would allow Grow to compare evidence under similar circumstances and eventually provide more relevant insights, learning, and recommendations.

## Proposed capability

Introduce optional, standardized session-level context in a future platform phase.

### Growing Environment

- Indoor
- Outdoor
- Greenhouse
- Other

Environment subtype examples:

- Tent
- Grow room
- Cabinet
- Garden
- Raised bed
- Container
- Field
- Controlled greenhouse

### Growing Method

- Living Soil
- Organic Soil
- Coco
- Hydroponic
- DWC
- RDWC
- Aeroponic
- Other

### Growing Medium

- Soil
- Coco
- Rockwool
- Peat
- Water
- Soilless mix
- Other

### Lighting, when applicable

- LED
- HPS
- CMH
- Fluorescent
- Sunlight
- Other

These are characteristics of a session, not permanent Grow Identity fields.

Repeated session patterns may later allow GPE to suggest an Identity preference, but the member must approve any addition to Grow Identity. An observed pattern or suggestion must not be treated as a user-confirmed or system-verified identity value.

## Why it matters

This context could allow GEE to move from broad evidence such as:

> “Variety X averaged 92%.”

toward qualified evidence such as:

> “Growers using similar indoor and growing-method conditions achieved 96%.”

These examples describe a future evidence direction, not conclusions supported by current data. Any future qualified evidence must satisfy canonical eligibility, data-quality, privacy, sample-size, and confidence rules.

## Foundation alignment

- Honest evidence
- Better learning
- Better recommendations
- Better decisions
- User-controlled personalization
- Build once, extend forever

## Related models, engines, and experiences

- Grow Sessions as the authoritative context record
- GEE for qualified evidence
- GPE for consent-aware suggestions
- GRE for future recommendation use
- Learning and Explore for understandable evidence presentation
- Grow Identity only after explicit member confirmation of a suggested preference

## Explicit non-goals

- Do not add these fields to Sessions now.
- Do not alter GEE calculations now.
- Do not add inferred Identity values now.
- Do not redesign Session setup.
- Do not create climate-zone or precise-location collection now.

## Dependencies

- Canonical session lifecycle and ownership
- Controlled vocabulary governance
- Evidence eligibility and minimum-sample rules
- Privacy and personalization-consent review
- A progressive data-entry design that does not obstruct session creation

## Open questions

- Which conditions materially improve evidence qualification at realistic sample sizes?
- Which fields should be captured directly, imported, or omitted?
- How should vocabulary versions and historical values remain comparable?
- When is an observed pattern strong enough for GPE to suggest a preference?
- Which condition combinations create re-identification or location-privacy risk?

## Future implementation direction

- Define a canonical controlled vocabulary.
- Add a backward-compatible session schema.
- Keep collection optional and progressive.
- Validate values server-side.
- Define GEE eligibility and sample-size rules before producing qualified evidence.
- Complete a privacy review, including combination and location risks.
- Preserve species-neutral architecture.
- Add migration, compatibility, and regression coverage.

## Decision history

- **2026-07-19 — Validated:** The concept aligns with the Grow Foundation and should be preserved for a future session-context phase. No implementation work is authorized by this note.

