# Foundation Note FN-004 — Session Context, Operational Intelligence & Evidence Readiness

**Version:** Draft 1.0
**Status:** Foundational Architecture
**Domain:** Sessions / Session Context / Evidence Readiness / Seed Vault / Grow Companion / GEE
**Last Updated:** July 2026

## Purpose

This document establishes the canonical architecture for the Grow Session lifecycle, Grow Companion, Session Context, Operational Intelligence, and evidence readiness.

Grow is the platform.

Session is the canonical user-owned object. There is one Session from start to finish.

Users create evidence through their actions, observations, decisions, and recorded outcomes.

Grow Companion is the permanent operational hub inside the Session. It captures, structures, organizes, preserves, and presents user-produced evidence while improving operational awareness and evidence readiness.

The Session Context Engine deterministically evaluates canonical Session records for operational state, workflow continuity, evidence readiness, and relevant operational attention. Its context serves the grower and GEE without becoming original evidence or GEE-level interpretation.

GEE is Grow's canonical evidence interpretation engine. It governs evidence eligibility, normalization, lineage, confidence, interpretation, and knowledge distillation.

The Seed Vault preserves inventory, genetics, ownership and acquisition information, and intentionally distilled knowledge.

Together these responsibilities form one canonical evidence architecture and preserve Grow's core philosophy:

> “Every grow should make the next grow better.”

## Canonical Domain Model

### Grow

Grow is the platform that connects Sessions, Grow Companion, the Session Context Engine, GEE, the Seed Vault, Testing Programs, and other canonical domains.

### Session

Session is the canonical object created and owned by the user.

A Session evolves across one complete lifecycle. Grow must not define separate Germination Sessions, Growing Sessions, Testing Sessions, or Reflection Sessions.

A Session contains:

- Session identity, ownership, and privacy
- Grow Companion
- canonical user-produced evidence
- distinguishable canonical system records
- completed phase records
- reports and canonical relationships
- the full lifecycle history

### Grow Companion

Grow Companion is the permanent operational hub of every Session.

It is not a separate Session, a replacement for the Session, or a competing context, evidence, interpretation, or knowledge system.

Grow Companion is responsible for:

- lifecycle guidance
- current-phase workflow
- access to completed-phase history
- capturing user actions, observations, decisions, and recorded outcomes
- structuring, organizing, preserving, and presenting user-produced evidence
- improving evidence completeness, continuity, and quality
- supporting Testing Program guidance and Reflection within the canonical Session

Grow Companion does not independently create evidence. Users create evidence through activity performed or recorded through Grow Companion and other authorized Session capabilities.

### Session Context Engine

The Session Context Engine is the deterministic platform service responsible for:

- summarizing canonical Session records
- prioritizing relevant operational attention
- classifying operational context
- organizing context projections
- evaluating operational Session state
- evaluating workflow continuity
- evaluating evidence readiness

It turns canonical Session records into consistent context without inventing evidence, substituting derived state for original evidence, or interpreting evidence as knowledge.

Platform surfaces and consumers, such as Grow Companion, Home, Reflection, notifications, reports, future APIs, and future AI capabilities, consume the Session Context Engine rather than calculating competing Session context independently.

### Operational Intelligence

Operational Intelligence is the deterministic understanding of current Session state, workflow continuity, evidence readiness, and relevant operational attention derived from canonical Session records.

Operational Intelligence does not constitute biological diagnosis, predictive cultivation advice, generated evidence, inferred user observations, or GEE-level evidence interpretation.

### Evidence Sources and Attribution

Grow distinguishes four related but separate categories:

1. **User-produced evidence** — actions, observations, decisions, and outcomes attributable to the user.
2. **Canonical system records** — platform events or recorded state attributable to the system.
3. **Deterministically derived context** — operational summaries, classifications, priorities, continuity evaluations, and readiness evaluations produced from canonical records.
4. **GEE interpretation** — governed interpretation of eligible evidence with lineage and confidence.

Automated system records may document platform events or derived state, but they must remain distinguishable from user-produced evidence and must never be represented as user observations.

Original evidence remains attributable and traceable to its canonical source. Derived context and GEE interpretation must preserve that distinction.

## Core Philosophy

Grow exists to help growers build knowledge, not simply record activities.

Users create evidence. Grow Companion helps them produce higher-quality evidence by capturing, structuring, organizing, preserving, and presenting it.

GEE transforms eligible evidence into trusted interpretation and supports intentional knowledge distillation.

Each completed Session should increase the value of the next Session. The objective is not collecting data. The objective is improving future decisions.

This creates the Grow knowledge loop:

```text
Seed Vault
→ Start Session
→ Germination
→ Growing
→ Reflection
→ GEE Interpretation
→ Intentional Knowledge Distillation
→ Seed Vault
→ Repeat
```

A completed grow may enrich the grower's personal knowledge library only through intentional knowledge distillation.

## Session Evidence Pipeline

The canonical evidence flow is:

```text
User Activity
↓
Session Records
↓
Session Context
↓
Evidence Readiness
↓
GEE Interpretation
↓
Intentional Knowledge Distillation
↓
Seed Vault
```

User activity creates evidence within canonical Session records. Grow Companion captures, structures, organizes, preserves, and presents that evidence. The Session Context Engine evaluates operational state, workflow continuity, and evidence readiness. GEE interprets eligible evidence and governs downstream knowledge distillation. The Seed Vault preserves knowledge only after it is intentionally distilled.

Reflection is structured subjective evidence within this same pipeline:

```text
Completed Session Evidence
↓
Grower Reflection
↓
GEE Interpretation
↓
Intentional Knowledge Distillation
↓
Seed Vault
```

Reflection does not create a parallel evidence path. It adds the grower's intentional review to the same canonical Session evidence interpreted by GEE.

Every future platform capability must strengthen one or more stages of this pipeline rather than introduce an alternative evidence path.

This is Grow's canonical evidence architecture.

## Architectural Principles

### Nothing Disappears

Canonical Session history remains part of the Session.

Completed phases become historical but remain accessible through authorized Session capabilities. Historical preservation must not depend on a particular page, card, chart, view, or navigation structure.

The Session remains the complete story of one grow experience.

### Sessions Are Living Documents

A Session evolves over time.

Its architecture distinguishes current work, completed history, and future work without prescribing how a particular interface presents those states.

### Evidence Before Intelligence

Grow always improves evidence before expanding intelligence.

Reliable interpretation depends upon reliable evidence.

Future capabilities should first improve:

- evidence completeness
- evidence continuity, including chronological and workflow consistency
- evidence quality, including internal reliability, clarity, and descriptive integrity

Only then should they introduce more analytical behavior.

### Context Never Creates Evidence

Session Context may:

- summarize
- prioritize
- classify
- organize
- evaluate operational state
- evaluate workflow continuity
- evaluate evidence readiness

Session Context shall never invent, fabricate, substitute, or present derived interpretation as original evidence.

Users create evidence through their activity. Canonical system records may record attributable platform events or derived state, but they remain distinguishable from user-produced evidence. Session Context derives operational understanding from those records; GEE interprets eligible evidence.

## Session Lifecycle

The canonical top-level phases are:

1. Germination
2. Growing
3. Reflection

Use “Growing” rather than “Grow” for the middle phase so it cannot be confused with the Grow platform.

Only one phase is current at a time. Every phase has one of three canonical states:

- future
- current
- complete

The lifecycle preserves a durable transition:

> Work → Complete → Preserve → Continue

Vegetative, Flower, Harvest, and other plant-specific stages are not mandatory top-level phases. They may exist as optional milestones, templates, user-defined stages, or structured events inside the canonical Session so the architecture remains useful across plant types and cultivation methods.

### 1. Germination

Germination represents the controlled work and evidence associated with successfully germinating seeds.

When completed, Germination becomes historical but remains part of the same Session. Its canonical records are not removed, relocated into a separate Session archive, or reduced to only a summary.

### 2. Growing

Growing represents post-germination work and evidence inside the same Session and Grow Companion.

Different plant types may use different stages, milestones, tasks, events, observations, and environmental records without changing the overall Session architecture.

### 3. Reflection

Reflection is an intentional review of completed Session experience and a structured subjective evidence capability.

Its full evidence and knowledge boundary is defined in the dedicated Reflection section.

## Completed Phase Records

Completed phases become historical records inside the same Session.

They remain attributable, preserve their canonical evidence and relationships, and remain available to authorized Session capabilities. They do not become separate Sessions or report-only substitutes for the underlying records.

Germination completion produces a completed Germination Record. Growing completion produces a completed Growing Record. Reflection completion completes the overall Session.

## Session Status vs Phase Status

Session status and phase status are separate concepts.

### Germination Completion

- Germination has ended and canonical germination results exist.
- Germination status becomes complete and its record becomes historical.
- Session status remains active or in progress.
- Current phase becomes Growing.

### Growing Completion

- Germination remains complete.
- Growing status becomes complete.
- Session status remains active or in progress.
- Current phase becomes Reflection.

### Reflection Completion

- The grower's structured subjective evidence is complete.
- The overall Session becomes complete.
- The Reflection becomes eligible for GEE interpretation and later intentional knowledge distillation.

Backward compatibility is an architectural obligation, but compatibility mechanisms must not alter the canonical distinction between Session status and phase completion.

## Phase Capabilities

Tasks, Events, Journal, Photos, Milestones, scheduling, notifications, Testing Program guidance, and Reflection are capabilities associated with canonical Session workflow. They do not create separate top-level platform systems, and not every capability must apply to every phase.

Grow Companion makes phase-appropriate capabilities available without changing the canonical Session, evidence, context, or GEE architecture.

## Tasks vs Events

Tasks represent things the grower intends to do. Events represent things that happened or were observed.

Tasks belong to planning and action. Events become historical observations and become eligible evidence only through the canonical GEE evidence boundary.

Events are not reminders. Tasks and Events may contribute to common operational projections while remaining distinct domain concepts.

## Milestones

Milestones are significant lifecycle achievements and anchors within the Session chronology.

They remain configurable so Grow is not limited to a single plant type, cultivation method, or grow lifecycle.

## Journal

The Grow Journal is private by default and records the complete history of the grow.

It may contain:

- notes
- observations
- images
- problems
- solutions
- environmental changes
- task history
- event history
- milestone history

The Journal belongs to the Session. The full Journal is not copied into the Seed Vault.

## Evidence Readiness

Evidence Readiness describes whether available Session evidence is prepared for responsible GEE interpretation. It has three architectural dimensions.

### Evidence Completeness

Required information exists.

### Evidence Continuity

The Session tells one coherent chronological story.

Continuity includes consistency of chronology, sequencing, phase transitions, and workflow coherence. It may be weakened by missing timeline segments, missing phase transitions, or inconsistent chronology.

### Evidence Quality

Observations contain enough operational detail to improve future interpretation.

Quality includes the internal reliability, clarity, consistency, and descriptive integrity of the available evidence.

Completeness, continuity, and quality measure evidence. They do not measure cultivation success.

### Evidence Confidence

Evidence Confidence represents confidence in GEE's ability to interpret the available evidence responsibly.

It is conceptually informed by:

- Evidence Completeness
- Evidence Continuity
- Evidence Quality

Evidence Confidence does not measure cultivation success, user credibility, source reputation, biological quality, or predicted outcomes. Those concepts require separate architecture.

Evidence Confidence is an architectural concept supporting future capabilities. This Foundation Note does not define an algorithm, score, weight, threshold, or presentation system.

## Reflection

Reflection is structured subjective evidence produced by the grower through an intentional review of completed Session experience.

It answers:

> “If you grow this variety again, what should you remember?”

Its canonical structure remains:

### Overall Experience

A structured 1–5 star rating.

### Would Grow Again?

A structured 1–5 star variety-experience signal:

- 5 stars: absolutely would grow again
- 4 stars: probably would
- 3 stars: maybe
- 2 stars: probably would not
- 1 star: would not grow again

### Final Thoughts

One concise answer to the Reflection question.

One canonical Reflection should eventually relate to the grower, Session, canonical variety, Vault item where applicable, source attribution, its structured answers, and completion timestamp.

The same Reflection may be referenced from the completed Session and linked Seed Vault history without creating duplicate evidence records.

Reflection is the bridge from completed operational experience into downstream GEE interpretation and intentional knowledge distillation. It may contribute meaning from the grower's perspective, but it does not automatically become trusted or canonical knowledge.

Reflection remains private unless the owner explicitly changes visibility under authorized sharing rules.

## Seed Vault Integration

The Seed Vault stores:

- inventory
- genetics
- ownership and acquisition information
- intentionally distilled knowledge grounded in one or more completed Sessions

It does not duplicate Session history.

Operational Session history and Reflection do not automatically become permanent knowledge. Knowledge enters the Vault intentionally through downstream capabilities governed by GEE, with canonical lineage back to supporting evidence.

The Seed Vault does not receive the full Grow Companion chronology or Journal.

## GEE Responsibilities

GEE is Grow's canonical evidence interpretation engine.

> Users create evidence. Grow Companion captures and organizes it. GEE interprets eligible evidence and governs knowledge distillation.

GEE governs and performs:

- evidence eligibility
- evidence normalization
- evidence lineage
- evidence confidence
- evidence interpretation
- knowledge distillation

GEE does not create or own original Session evidence. It does not replace or mutate original evidence without preserved lineage.

Grow Companion and the Session Context Engine must not create competing evidence, interpretation, analytics, or knowledge engines.

Not every Task, Event, note, photo, milestone, system record, or Reflection is automatically verified evidence. GEE determines eligibility and preserves attribution and lineage throughout interpretation.

Every future capability should strengthen one or more of:

- evidence completeness
- evidence continuity
- evidence quality
- evidence confidence
- evidence interpretation
- knowledge distillation

This is the architectural filter for future capability planning.

## Objective and Subjective Evidence

Objective evidence may include germination count, tested count, germination rate, elapsed time, canonical completion data, and structured measured outcomes.

Subjective evidence may include Overall Experience, Would Grow Again, Final Thoughts, and future structured grower observations.

Would Grow Again may become a Variety result through GEE aggregation, provided the result retains sample size, lineage, attribution, distribution, and confidence context.

A subjective rating must not be presented as equivalent to measured performance.

For Source Reports, Would Grow Again may contribute indirectly through attributed variety outcomes. It must not be mislabeled as a direct rating of the Source unless Grow later establishes a separate Source-specific evidence boundary.

## Session, Context, GEE, and Seed Vault Responsibilities

### Session

Stores the story: identity, ownership, privacy, complete lifecycle, completed records, original evidence, attributable system records, and historical context.

### Grow Companion

Guides the work and captures, structures, organizes, preserves, and presents user-produced evidence.

### Session Context Engine

Produces deterministic operational context from canonical records by evaluating operational state, workflow continuity, evidence readiness, and relevant operational attention.

### GEE

Governs eligibility, normalization, lineage, confidence, interpretation, and knowledge distillation without creating or owning original evidence.

### Seed Vault

Preserves inventory, genetics, ownership and acquisition information, and intentionally distilled knowledge grounded in canonical evidence.

These responsibilities remain separate.

## Testing Programs

Testing Programs configure the existing Session and Grow Companion architecture. They do not create a second Session type, task system, event system, scheduling system, notification system, Reflection system, context engine, or evidence engine.

Program guidance must use the same canonical Session, Grow Companion, Task, Event, Reflection, Session Context, and GEE architecture.

## Privacy

Grow Companion and original Session evidence are private by default. Future sharing remains explicit and owner-controlled.

Tasks, events, journal entries, scheduling records, environment data, grow photos, and Reflection must not become public automatically.

Knowledge distillation into the Seed Vault does not imply public visibility. Any future sharing capability must preserve ownership, attribution, provenance, and explicit owner control.

## Long-Term Platform Architecture

Grow's conceptual long-term architecture is:

```text
User Activity
↓
Grow Companion
↓
Session Records
↓
Session Context
↓
Evidence Readiness
↓
GEE
↓
Intentional Knowledge Distillation
↓
Seed Vault
```

Users produce evidence through canonical Session activity. Grow Companion captures, structures, organizes, preserves, and presents that evidence. Session Context deterministically organizes operational understanding and evaluates evidence readiness. GEE interprets eligible evidence and governs intentional knowledge distillation. The Seed Vault preserves the resulting knowledge without becoming Session history.

Future capabilities—including Reflection, reports, Community, Testing Programs, Grow Network, recommendations, and commercial intelligence—must integrate into this architecture instead of introducing parallel systems.

## Repeat

Repeat means beginning the next grow with more trusted knowledge than the previous one.

Each repetition may increase knowledge, confidence, historical evidence, decision quality, personal recommendations, and understanding of varieties and sources.

The goal is continuous improvement, not continuous data collection.

## Guiding Principles

> “Every grow should make the next grow better.”

> “Evidence before intelligence.”

> “Users create evidence. Grow Companion captures, structures, organizes, and preserves it.”

> “Context never creates evidence.”

> “Nothing disappears. Completed phases remain accessible history.”

> “The Session stores the story.”

> “The Session Context Engine provides deterministic Operational Intelligence.”

> “GEE interprets eligible evidence and governs knowledge distillation.”

> “The Seed Vault preserves inventory and intentionally distilled knowledge.”

> “Grow does not just help people grow plants. Grow helps people grow knowledge.”

## Foundational Decision

The Session is one continuous, user-owned lifecycle, not a germination-only record or a set of phase-specific Sessions.

Grow Companion is the permanent operational hub inside that Session. It captures, structures, organizes, preserves, and presents evidence created by users through their activity.

Germination, Growing, and Reflection are canonical phases. Completed phases remain permanently accessible records inside the same Session.

The Session Context Engine is the deterministic platform service for operational state, workflow continuity, evidence readiness, and relevant operational attention. It never creates evidence or substitutes derived context for original evidence.

GEE remains the canonical evidence interpretation engine. It does not create or own original Session evidence.

Testing Programs configure this architecture rather than creating a parallel workflow.

Backward compatibility is an architectural obligation, but implementation mechanisms require an approved Implementation Contract.

> “Every new capability must strengthen the canonical Session Evidence Pipeline through Grow Companion, the Session Context Engine, GEE, the Seed Vault, or another established canonical domain. It must not create a parallel system without an explicit foundational decision.”
