# FN-004 Extracted Implementation Considerations

**Status:** Non-Canonical Working Material
**Source:** FN-004 — Session Context, Operational Intelligence & Evidence Readiness
**Purpose:** Preservation and ownership classification only

## Authority Boundary

This document preserves implementation-specific material extracted from FN-004.

It does not establish approved architecture, does not authorize implementation, and may not override FN-004.

Every item requires classification into a future approved Implementation Contract, product roadmap, release boundary, or capability document before implementation.

No item is assigned to Grow Companion Capability 2A unless it is specifically identified as Session Context, Operational Intelligence, Evidence Readiness, or a directly related compatibility obligation.

## Extracted Material

| Original FN-004 heading | Preserved consideration | Likely architectural owner | Status | Why it is not in an approved contract |
|---|---|---|---|---|
| Grow Companion | Grow Companion should not be treated as a lower-page feature card and was expected to remain in the same primary position while the active phase changed. | Session Lifecycle | TBD — Requires Architecture Approval | This is page placement and shell behavior, not a Session Context requirement. No Session Lifecycle interface contract exists. |
| Nothing Disappears | Named current surfaces—including KAN Seed Chart, Fair View, Reports, Images, Notes, Timeline, and Analytics—were expected to remain accessible. | Session Lifecycle | TBD — Requires Architecture Approval | FN-004 retains the durable historical-access rule, but exact surface names and access paths require a lifecycle or product-surface contract. |
| Sessions Are Living Documents | Current work was expected to remain expanded, completed work to become collapsed history, and future work to appear only when appropriate. | Session Lifecycle | TBD — Requires Architecture Approval | These are presentation and availability rules. No approved Session Lifecycle interface contract exists. |
| Session Lifecycle | The interaction pattern was “Work → Complete → Collapse → Preserve → Continue.” | Session Lifecycle | TBD — Requires Architecture Approval | FN-004 retains the durable “Work → Complete → Preserve → Continue” transition; Collapse is an interface behavior requiring approval. |
| Session Lifecycle | Internal compatibility identifiers could remain stable when implementation history required them. | Backward Compatibility | TBD — Requires Architecture Approval | FN-004 preserves compatibility as an obligation but does not approve identifier strategy. |
| Germination | Typical content named Grow Companion germination status, KAN Seed Chart, Progress, Timeline, Fair View, Notes, Images, Reports, Community eligibility, and germination analytics. | Session Lifecycle | TBD — Requires Architecture Approval | These named surface projections are non-binding examples and need an owning phase-capability contract. |
| Growing | Potential implementation views included Tasks, Events, and Recent Activity. | Grow Companion Capability 1 | TBD — Requires Architecture Approval | Capability 1 owns these capabilities, but FN-004 must not prescribe their composition inside the broader Growing experience. |
| Growing | Potential implementation views also included Today, Upcoming Tasks, Calendar, Journal, Milestones, Environment, Photos, and Growing Completion. | Unresolved — Requires Architecture Approval | TBD — Requires Architecture Approval | The list crosses scheduling, lifecycle, journal, environment, and media ownership. It cannot be assigned to one contract without architecture approval. |
| Session Phase Navigator | A persistent navigator communicated current, completed, and future phases. | Session Lifecycle | TBD — Requires Architecture Approval | FN-004 retains canonical phases and states; the navigator itself is an interface choice. |
| Session Phase Navigator | Current phase emphasis, completed-phase expansion, future-phase availability, and exact selection behavior were specified. | Session Lifecycle | TBD — Requires Architecture Approval | These are UI acceptance criteria with no approved lifecycle interface contract. |
| Completed Phase Records | Completed records could collapse by default and remain expandable from a navigator or phase summary. | Session Lifecycle | TBD — Requires Architecture Approval | Historical preservation remains canonical; collapse and expansion mechanisms do not. |
| Session Status vs Phase Status | Compatibility adapters could translate legacy completion fields. | Backward Compatibility | TBD — Requires Architecture Approval | The architectural compatibility obligation remains in FN-004, but adapter and field-level mechanisms require a compatibility contract. |
| Tasks vs Events | Future Tasks could include due date/time, reminders, recurrence, priority, completion, skipped state, rescheduling, and snooze. | Scheduling and Notifications | TBD — Requires Architecture Approval | Capability 1 explicitly defers several of these behaviors. They require an approved scheduling and notification contract. |
| GEE Responsibilities | Eligible post-germination observations could be consumed through an explicit Evidence Adapter. | Unresolved — Requires Architecture Approval | TBD — Requires Architecture Approval | This is a mechanism spanning Session evidence and GEE. No approved GEE integration contract owns it. |
| Photos and Sharing | A future external Share Card or social-ready summary could contain approved variety, source, milestone, germination, duration, photo, and Reflection information. | Unresolved — Requires Architecture Approval | TBD — Requires Architecture Approval | This is a sharing projection and interface concept. It is not owned by Capability 2A and no approved sharing contract exists. |
| Version 1 Boundary | Version 1 included Session composition, Grow Companion foundation, Tasks, Events, activity history, Growing progress, Testing Program integration, Reflection linkage, and a subjective evidence boundary. | Product Roadmap or Release Boundary | TBD — Requires Architecture Approval | Release scope and implementation sequencing do not belong in a durable Foundation Note. |
| Version 1 Boundary | Calendar, recurrence, reminders, notifications, AI recommendations, advanced environment tracking, and advanced breeder and Source dashboards could be deferred. | Product Roadmap or Release Boundary | TBD — Requires Architecture Approval | Deferral decisions require an approved roadmap or release plan. |
| Custom Scheduling and Notifications | Scheduling could support Upcoming Tasks, advanced Calendar views, custom and recurring Tasks, reminders, snooze, rescheduling, templates, and user-created notifications. | Scheduling and Notifications | TBD — Requires Architecture Approval | No approved scheduling and notification contract exists. |
| Custom Scheduling and Notifications | Basic mode prioritized Today, Upcoming Tasks, and Quick Add; Advanced mode added Calendar, templates, recurrence, filters, journal overlays, and event history. | Scheduling and Notifications | TBD — Requires Architecture Approval | These are named modes, views, and prioritization decisions requiring a dedicated implementation contract. |

## Material Assigned to Capability 2A

The following extracted concerns are owned by the Capability 2A contract:

- deterministic evaluation of operational Session state
- deterministic evaluation of workflow continuity
- deterministic evaluation of Evidence Completeness, Evidence Continuity, and Evidence Quality
- relevant operational attention and highest-priority context
- shared context projections for authorized platform consumers
- provenance boundaries among user evidence, system records, derived context, and GEE interpretation
- compatibility obligations directly affecting context evaluation
- applicable context acceptance and regression requirements

These concerns are preserved in:

`docs/foundation/implementation-contracts/IC-GC-002A-session-context-foundation.md`

Incomplete behavior remains **TBD — Requires Architecture Approval**.

## Existing Capability 1 Boundary

`docs/architecture/grow-companion-capability-1.md` already owns implemented Task, Event, and Recent Activity behavior.

This working note does not alter that document or assign scheduling, notifications, phase navigation, Reflection, GEE integration, or release planning to Capability 1.

## Required Future Classification

Before any preserved consideration is implemented, architecture approval must identify or create its authoritative owner.

Likely future destinations include:

- a Session Lifecycle interface contract
- an additive Grow Companion capability contract
- a Reflection implementation contract
- a Scheduling and Notifications contract
- a Backward Compatibility contract
- a GEE evidence-integration contract
- a sharing-projection contract
- an approved product roadmap or release boundary
