# Foundation Note FN-004 — Session Lifecycle & Grow Companion

**Version:** Draft 1.0
**Status:** Foundational Architecture
**Domain:** Sessions / Seed Vault / Grow Companion / GEE
**Last Updated:** July 2026

## Purpose

This document establishes the canonical architecture for the Grow Session lifecycle and Grow Companion.

Grow is the platform.

Session is the canonical user-owned object.

There is one Session from start to finish.

Grow Companion is the permanent operational hub inside that Session.

Together they preserve Grow’s core philosophy:

> “Every grow should make the next grow better.”

The Session is the complete story and historical record of one grow experience.

Grow Companion guides the work through Germination, Growing, and Reflection.

GEE interprets eligible canonical evidence and produces knowledge.

The Seed Vault preserves inventory and distilled lessons.

These responsibilities create a continuous improvement loop without creating parallel systems.

## Canonical Domain Model

### Grow

Grow is the platform that connects Sessions, Grow Companion, GEE, the Seed Vault, Testing Programs, and other canonical domains.

### Session

Session is the canonical object created and owned by the user.

A Session evolves across one complete lifecycle. Grow must not define separate Germination Sessions, Growing Sessions, Testing Sessions, or Reflection Sessions.

A Session contains:

- Session Overview
- Grow Companion
- completed phase records
- reports and canonical relationships
- privacy and ownership context
- the full lifecycle history

### Grow Companion

Grow Companion is the permanent operational hub of every Session.

It is not a separate Session, a lower-page feature card, a replacement for the Session, or a competing evidence engine.

Grow Companion is the operational workflow engine responsible for:

- lifecycle navigation
- the current phase and current work
- completed-phase access
- future Tasks, Events, Calendar, Journal, Photos, and Milestones
- future Testing Program guidance
- future Reflection workflow

Grow Companion remains in the same primary position while its active workspace changes with the current phase.


## Core Philosophy

Grow exists to help growers build knowledge, not simply record activities.

Each completed Session should increase the value of the next Session.

The objective is not collecting data.

The objective is improving future decisions.

This creates the Grow knowledge loop:

```text
Seed Vault
→ Start Session
→ Germination
→ Growing
→ Reflection
→ Seed Vault
→ Repeat
```

Every completed grow enriches the grower’s personal knowledge library.

## Architectural Principles

### Nothing Disappears

No Session information is archived away into separate pages.

Completed phases become historical but remain immediately accessible.

Users should never lose access to:

- KAN Seed Chart
- Fair View
- Reports
- Images
- Notes
- Timeline
- Analytics

Historical information remains inside the Session.

The Session becomes the complete story of that grow.

### Sessions Are Living Documents

A Session evolves over time.

It is never intended to become longer through endless forms.

Instead:

- Current work remains expanded.
- Completed work becomes collapsed history.
- Future work becomes available only when appropriate.

## Session Lifecycle

The visible top-level phases are:

1. Germination
2. Growing
3. Reflection

Use “Growing” rather than “Grow” for the middle visible phase so it cannot be confused with the Grow platform. Internal compatibility identifiers may remain stable where implementation history requires them.

Only one phase is current at a time.

Every phase has one of three states:

- future
- current
- complete

The governing interaction pattern is:

> Work → Complete → Collapse → Preserve → Continue

Do not make Vegetative, Flower, Harvest, or other cannabis-specific stages mandatory top-level phases.

Those may later exist as optional milestones, templates, user-defined stages, or structured events inside Grow Companion so the architecture remains useful for cannabis, vegetables, flowers, and other seed-grown plants.

### 1. Germination

Purpose:

Successfully germinate seeds under controlled conditions.

Typical content:

- Grow Companion germination status
- KAN Seed Chart
- Progress
- Timeline
- Fair View
- Notes
- Images
- Reports
- Community eligibility
- Germination analytics

When completed:

The Germination phase becomes historical.

It remains fully accessible inside the same Session.

It is never removed, moved to a separate archive, or replaced by only a summary report.

The original Germination experience remains reopenable.

### 2. Growing

Purpose:

Guide the grower through post-germination work inside Grow Companion.

Grow Companion remains the primary Session hub and changes its active workspace from Germination to Growing.

Grow Companion is intentionally generic and not cannabis-specific.

Future implementations may include:

- Today
- Upcoming Tasks
- Tasks
- Events
- Calendar
- Journal
- Milestones
- Environment
- Photos
- Growing Completion

Different plant types may use different stages or milestones without changing the overall architecture.

### 3. Reflection

Purpose:

Capture the grower’s distilled experience.

Reflection is intentionally different from the Session Journal.

The Journal records the full history.

Reflection records what mattered most.

Reflection includes:

- Overall Experience
- Would Grow Again?
- Final Thoughts

Reflection completes the knowledge loop and returns the learned experience to the Seed Vault.

## Session Phase Navigator

Grow Companion exposes the Session lifecycle through a persistent phase navigator.

The navigator lives inside Grow Companion and always communicates:

- where the grow currently is
- where it has been
- what comes next

Behavioral principles:

- The current phase is active and emphasized.
- Completed phases remain expandable.
- Future phases remain visible but unavailable until eligible.
- Selecting a completed phase reopens its full original record.
- Selecting the current phase returns focus to the current workspace.
- Phase navigation never hides or destroys historical information.

## Completed Phase Records

Completed phases become historical records inside the same Session and Grow Companion composition.

Completed phase records:

- remain permanently accessible
- preserve the complete original experience
- do not move to separate archive pages
- do not become report-only summaries
- retain notes, images, evidence, analytics, and controls
- may collapse by default when no longer current
- remain expandable from the lifecycle navigator or phase summary

Nothing disappears.

Germination completion produces a completed Germination Record. Future Growing completion produces a completed Growing Record. Reflection completion completes the overall Session.

## Session Status vs Phase Status

Session status and phase status are separate concepts.

### Germination Completion

- Germination has ended.
- Canonical germination results exist.
- Germination status becomes complete.
- The Germination Record becomes historical.
- Session status remains active or in progress.
- Current phase becomes Growing.

### Growing Completion

- Germination remains complete.
- Growing status becomes complete.
- Session status remains active or in progress.
- Current phase becomes Reflection.

### Reflection Completion

- Captures the grower’s concise lesson.
- Completes the overall Session.
- Links the distilled lesson into the related Seed Vault history.

Compatibility adapters may translate legacy completion fields, but canonical Session status must remain distinct from phase completion.

## Phase Capabilities

Tasks, Events, Calendar, Journal, Photos, Milestones, and Testing Program guidance are capabilities of the active phase. They are not separate top-level platform systems, and not every capability must appear in every phase.

Grow Companion reveals only the tools appropriate to the current phase. Germination may emphasize evidence, notes, images, and phase-relevant work. Growing may emphasize Tasks, Events, Calendar, Journal, Photos, Milestones, and Testing Program guidance. Reflection remains concise and focused on the final lesson.

## Tasks vs Events

Grow Companion separates intended work from historical observations.

### Tasks

Tasks represent things the grower intends to do.

Examples:

- Water
- Feed
- Check pH
- Rotate
- Transplant
- Defoliate
- Clean
- Take a weekly photo

Future task capabilities may include:

- due date and time
- reminders
- recurrence
- priority
- completion
- skipped state
- rescheduling
- snooze

Tasks belong to planning and action.

### Events

Events represent things that happened or were observed.

Examples:

- Seed germinated
- First true leaves appeared
- Pest discovered
- Nutrient deficiency observed
- Temperature spike
- Humidity issue
- Power outage
- Harvested

Events become historical observations. They become canonical evidence only when GEE determines that they are eligible through an explicit evidence boundary.

Events are not reminders.

Tasks and Events may appear together on the same Calendar or Timeline, but they remain distinct domain concepts.

## Milestones

Milestones are significant lifecycle achievements.

Examples:

- Germinated
- Transplanted
- Flowering Started
- Harvested
- Grow Completed

Milestones become anchors within the Session timeline.

Milestones should remain configurable so Grow is not limited to a single plant type, cultivation method, or grow lifecycle.

## Journal

The Grow Journal is private by default.

Its purpose is to record the complete history of the grow.

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

The Journal belongs to the Session.

The full Journal is not copied into the Seed Vault.

## Reflection

Reflection is intentionally concise.

It answers:

> “If you grow this variety again, what should you remember?”

Canonical structure:

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

One canonical Reflection should eventually relate to:

- grower
- Session
- canonical variety
- Vault item where applicable
- source attribution from the Session
- overall experience
- Would Grow Again rating
- final thoughts
- completion timestamp

The same Reflection is referenced from both the completed Session and the linked Seed Vault variety history. Grow must not create a separate Session Reflection and duplicate Vault note.

The Reflection is the distilled lesson, not a duplicate of the full Session Journal. It remains private unless the owner explicitly changes visibility under future sharing rules.

## Seed Vault Integration

The Seed Vault stores inventory and accumulated personal knowledge.

It does not duplicate Session history.

Each completed grow may link one canonical Reflection into the related variety history.

Example:

> **Previous Grows**
>
> ★★★★★
>
> **Would Grow Again:** ★★★★★
>
> “Excellent vigor. Reduce nutrients during early growth.”

Multiple Reflections create a private personal history for each variety.

Over time, the Seed Vault may summarize the grower’s own experience, such as:

- number of completed grows
- germination performance
- average lifecycle duration
- Would Grow Again history
- recurring observations
- useful lessons

These summaries must remain grounded in canonical Session and GEE evidence.

The Seed Vault receives the distilled lesson. It does not receive the full Grow Companion timeline or Journal.

## GEE Responsibilities

GEE remains the heart of Grow’s canonical evidence and knowledge architecture.

> Grow Companion records. GEE understands.

Grow Companion may capture:

- Tasks
- Events
- Notes
- Photos
- milestones
- Reflection
- program-guided observations

GEE is responsible for:

- canonical evidence
- normalization
- canonical calculations
- reporting
- analytics
- eligibility
- aggregation
- recommendations
- insights
- evidence interpretation

Grow Companion must not create a competing evidence or analytics engine. GEE may later consume eligible post-germination observations through an explicit Evidence Adapter.

Not every Task, Event, note, photo, milestone, or Reflection is automatically verified evidence. GEE determines eligibility, lineage, confidence, and interpretation.

## Objective and Subjective Evidence

Objective evidence may include:

- germination count
- tested count
- germination rate
- elapsed time
- canonical completion data
- structured measured outcomes

Subjective evidence may include:

- Overall Experience
- Would Grow Again
- Final Thoughts
- future structured grower observations

Would Grow Again may become a Variety result through GEE aggregation, for example:

> **Would Grow Again**
>
> 4.6 / 5
>
> Based on 243 completed Reflections

GEE must preserve sample size, evidence lineage, source attribution, confidence context, and distribution where appropriate. A subjective rating must not be presented as equivalent to measured performance.

For Source Reports, Would Grow Again may contribute indirectly through attributed variety outcomes. It must not be mislabeled as a direct rating of the Source unless Grow later asks a separate Source-specific question.

## Session, GEE, and Seed Vault Responsibilities

### Session

Stores the story: identity, ownership, privacy, complete lifecycle, completed records, and historical context.

### Grow Companion

Guides the work: lifecycle navigation, current-phase workflow, and access to completed phase records.

### GEE

Interprets the evidence: normalization, eligibility, analytics, aggregation, reports, recommendations, and insights.

### Seed Vault

Preserves the lesson: inventory, variety history, and the linked distilled Reflection.

These responsibilities must remain separate.

## Testing Programs

Testing Programs configure the existing Session and Grow Companion architecture. They do not create a second Session type, Task system, Event system, Calendar, timeline, or evidence engine.

Testing Programs may later provide:

- program-created Tasks
- required checkpoints and due windows
- required observations
- milestones
- evidence requests
- completion rules
- participant progress
- recognition outcomes

All program guidance must use the same canonical Session, Grow Companion, Task, Event, Reflection, and GEE architecture.

## Privacy

Grow Companion is private by default.

Future sharing must remain explicit and owner-controlled.

The following must not become public automatically:

- tasks
- events
- journal entries
- calendar entries
- environment data
- grow photos
- Reflection

Saving a Reflection to the Seed Vault does not imply public visibility.

Public or social sharing must always require an explicit owner action and must respect Grow’s existing privacy and visibility architecture.

## Photos and Sharing

Grow Companion may allow growers to capture meaningful progress photos.

The goal is not to create an unrestricted public gallery.

Future sharing may generate a clean external Share Card or selected social-ready summary containing approved information, such as:

- variety
- source
- key milestones
- germination result
- grow duration
- selected final photos
- optional Reflection excerpt

The grower controls what is included.

No direct in-app public grow feed is required by this foundation.

## Version 1 Boundary

The architectural completion target for Version 1 includes:

- Session lifecycle and composition
- Grow Companion foundation
- Tasks, Events, and activity history
- Growing progress
- Testing Program integration through Grow Companion
- Reflection and Seed Vault linkage
- a GEE-compatible subjective evidence boundary

Advanced capabilities remain extensions of this architecture and may be deferred, including:

- full Calendar
- recurrence
- reminders
- notifications
- AI recommendations
- advanced environment tracking
- advanced breeder and Source dashboards

## Custom Scheduling and Notifications

Future Grow Companion scheduling may support:

- basic Upcoming Tasks
- advanced Calendar views
- custom tasks
- recurring tasks
- custom reminder times
- snooze
- rescheduling
- grow templates
- user-created notifications

The default experience should remain simple.

Advanced scheduling should be available progressively without overwhelming new users.

Basic mode should prioritize:

- Today
- Upcoming Tasks
- Quick Add

Advanced mode may introduce:

- full Calendar
- templates
- recurrence
- filters
- journal overlays
- event history

## Repeat

The lifecycle intentionally ends where it began:

```text
Seed Vault
→ Start Session
→ Germination
→ Growing
→ Reflection
→ Seed Vault
→ Repeat
```

Repeat is not merely restarting.

It means beginning the next grow with more knowledge than the previous one.

Each repetition increases:

- knowledge
- confidence
- historical evidence
- decision quality
- personal recommendations
- understanding of varieties and sources

The goal is continuous improvement, not continuous data collection.

## Guiding Principles

> “Every grow should make the next grow better.”

> “Nothing disappears. Completed phases become accessible history.”

> “Grow Companion is the operational hub of the Session.”

> “The Session stores the story.”

> “Grow Companion guides the work.”

> “GEE interprets the evidence.”

> “The Seed Vault preserves the lesson.”

> “Grow does not just help people grow plants. Grow helps people grow knowledge.”

## Foundational Decision

The Session is one continuous, user-owned lifecycle, not a germination-only record or a set of phase-specific Sessions.

Grow Companion is the permanent operational hub inside that Session.

Germination, Growing, and Reflection are phase workspaces. Completed phases remain permanently accessible records inside the same Session.

GEE remains the canonical evidence and interpretation layer.

Testing Programs configure this architecture rather than creating a parallel workflow.

> “Every new feature must extend the existing Session through Grow Companion or integrate with GEE, the Seed Vault, or another established canonical domain. It must not create a parallel system without an explicit foundational decision.”
