# Foundation Note FN-004 — Session Lifecycle & Grow Companion

**Version:** Draft 1.0
**Status:** Foundational Architecture
**Domain:** Sessions / Seed Vault / Grow Companion / GEE
**Last Updated:** July 2026

## Purpose

This document establishes the long-term architecture for the Grow Session lifecycle.

It defines how a Session evolves beyond germination while preserving Grow’s core philosophy:

> “Every grow should make the next grow better.”

The Session is not merely a germination tracker.

It is the grower’s private workspace, historical record, and learning engine.

The Seed Vault stores what the grower owns.

The Session records what happened.

The Final Reflection preserves what was learned.

Together they create a continuous improvement loop.

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
→ Grow Companion
→ Final Reflection
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

Grow recognizes three primary lifecycle phases:

1. Germination
2. Grow Companion
3. Final Reflection

These are broad, top-level lifecycle phases.

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

### 2. Grow Companion

Purpose:

Guide the grower through the remainder of the grow.

Grow Companion becomes the primary workspace after germination.

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
- Grow Completion

Different plant types may use different stages or milestones without changing the overall architecture.

### 3. Final Reflection

Purpose:

Capture the grower’s distilled experience.

This is intentionally different from the Session journal.

The Journal records the complete history.

Final Reflection records what mattered most.

Future Reflection may include:

- Overall Experience
- Would Grow Again?
- Final Thoughts

Reflection completes the knowledge loop and returns the learned experience to the Seed Vault.

## Session Phase Navigator

Every Session should expose its lifecycle through a persistent phase navigator.

The navigator should always communicate:

- where the grow currently is
- where it has been
- what comes next

Behavioral principles:

- The current phase is active and emphasized.
- Completed phases remain expandable.
- Future phases remain visible but unavailable until eligible.
- Selecting a completed phase reopens its full original record.
- Phase navigation must never hide or destroy historical information.

## Germination Completion vs Grow Completion

Germination completion and Grow completion are separate concepts.

### Germination Completion

- Germination has ended.
- Canonical germination results exist.
- The Germination record becomes historical.
- It does not inherently mean the entire grow has ended.

### Grow Completion

- The post-germination Grow Companion lifecycle has ended.
- This is distinct from germination completion.
- It precedes Final Reflection.

### Final Reflection Completion

- Captures the grower’s concise lesson.
- Closes the complete grow lifecycle.
- Returns the learned experience to the Seed Vault.

Existing legacy Session completion behavior may continue to represent germination completion for backward compatibility, but it must not permanently define full-grow completion.

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

Events become historical evidence.

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

## Final Reflection

Final Reflection is intentionally concise.

It answers:

> “If you grow this variety again, what should you remember?”

Future structure:

### Overall Experience

### Would Grow Again?

- Yes
- Maybe
- No

### Final Thoughts

One concise summary.

A Reflection should remain associated with:

- grower
- Session
- canonical variety or Vault item
- overall experience
- Would Grow Again response
- final thoughts
- completion timestamp

The Reflection is the distilled lesson.

It is not a duplicate of the full Session Journal.

## Seed Vault Integration

The Seed Vault stores accumulated personal knowledge.

It does not duplicate Session history.

Each completed grow may contribute one Final Reflection to the related variety history.

Example:

> **Previous Grows**
>
> ★★★★★
>
> **Would Grow Again:** Yes
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

## GEE Responsibilities

GEE remains Grow’s canonical evidence and analytics engine.

GEE is responsible for:

- evidence
- normalization
- canonical calculations
- reporting
- analytics
- eligibility
- aggregation

Grow Companion does not create competing evidence or duplicate canonical calculations.

The Session lifecycle is a workflow and presentation layer.

Grow Companion consumes canonical GEE-backed information where applicable.

GEE remains the source of truth.

## Session, GEE, and Seed Vault Responsibilities

### Session

Stores the complete history of what happened.

### GEE

Normalizes and interprets canonical evidence.

### Seed Vault

Stores what the grower owns and the distilled lessons they want to remember.

These responsibilities must remain separate.

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
- Final Reflection

Saving a Final Reflection to the Seed Vault does not imply public visibility.

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
→ Grow Companion
→ Final Reflection
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

> “The Session stores the story. GEE preserves the evidence. The Seed Vault preserves the lesson.”

> “Grow does not just help people grow plants. Grow helps people grow knowledge.”

## Foundational Decision

The Grow Session is a continuous lifecycle, not a germination-only record.

Germination remains permanently accessible.

Grow Companion becomes the ongoing workspace.

Final Reflection closes the grow.

The Seed Vault preserves the lesson.

Repeat turns the lesson into action.
