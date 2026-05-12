# CSTP Existing System Reuse Audit

## 1. Purpose

The Cannakan Seed Testing Program (CSTP) was intentionally designed as an extension of Cannakan Grow, not as a parallel platform. This audit identifies which existing Cannakan Grow systems CSTP should reuse, extend, isolate, or avoid duplicating before future engineering implementation begins.

This document bridges CSTP architecture planning and future real implementation. It is informed by:

- `docs/cstp-session-architecture-alignment-specification.md`
- `docs/cstp-relational-data-planning-specification.md`
- `docs/cstp-supabase-schema-planning-specification.md`
- `docs/cstp-supabase-schema-definition-draft.md`
- `docs/cstp-implementation-roadmap-specification.md`
- `docs/cstp-architecture-master-index.md`

Reusing stable systems reduces risk. Cannakan Grow already has session lifecycle behavior, stage/timeline logic, partition mechanics, image and snapshot patterns, Source Directory identity, Community Grow publication workflows, notification preferences, admin surfaces, and Supabase ownership patterns. CSTP should build on those proven structures wherever the existing system already expresses the needed concept.

Avoiding duplicated logic is critical. Duplicate session systems, duplicate metrics, duplicate source records, duplicate visibility rules, or duplicate report calculations would create inconsistent user experience, unreliable analytics, migration pain, and weaker public trust.

This is an architecture and implementation-readiness audit only. It does not modify code, schema, routes, UI, backend logic, APIs, SQL, migrations, or RLS.

## 2. Existing System Audit Categories

The following existing Cannakan Grow systems are relevant to CSTP implementation planning:

- Session System
- Stage / Timeline Logic
- Partition Architecture
- Snapshot / Image System
- Metrics & Analytics
- Source Directory
- Community Grow
- Notification Patterns
- Admin Workflow Patterns
- Status / Badge Systems
- Notes / Observation Systems
- Session Ownership / Visibility
- Existing Supabase Architecture
- Existing UI Component Patterns

Each category should be evaluated for direct reuse, additive extension, intentional isolation, and duplication risk.

## 3. Session System Reuse Analysis

### Existing Pattern

Cannakan Grow already has a mature session model with local and Supabase-backed behavior. The current architecture includes session storage, cloud creation/update paths, notes updates, image handling, status/stage fields, seed age metadata, partition data, timestamps, session detail rendering, session analytics, and completion behavior.

Relevant existing concepts include:

- Session identity
- User ownership
- Session status
- Session notes
- Session images
- Partition rows
- Seed source and variety fields
- Seed type, sex, and age fields
- Started/completed timestamps
- Germination timing fields
- Session-level totals and success rate calculations
- Session detail and history views

### CSTP Should Directly Reuse

- Session identity for each CSTP test run
- Existing session ownership model
- Session notes where they represent operational observations
- Session image attachment patterns
- Existing observation/timing fields
- Existing partition data
- Existing session metrics and totals
- Existing session timestamps where they reflect real test activity

### CSTP Should Leave Untouched

- Core session save/update behavior
- Normal user session ownership
- Normal session visibility behavior
- Existing session stage transitions
- Existing partition chart mechanics
- Existing session analytics calculations

### Possible Future Extension Hooks

- A join relationship from CSTP Tests to sessions
- Optional CSTP inclusion flags at the relationship layer
- Admin-only CSTP context that references sessions without changing their base meaning
- Report aggregation functions that read session evidence and produce frozen CSTP report snapshots

### Architectural Rule

Sessions remain the source of truth for observed activity. CSTP should link to sessions rather than becoming a second session system.

## 4. Stage / Timeline Reuse Analysis

### Existing Pattern

The Grow App already models stage and lifecycle concepts around soaking, germinating, germination started, first planted, and completed states. It also has timeline display logic for private session detail and public session snapshots.

Relevant stage/timeline concepts include:

- `soaking`
- `germinating`
- germination started timestamp
- first planted timestamp
- completed timestamp
- lifecycle timeline events
- stage badges and progress displays
- public session timeline rendering

### CSTP Should Reuse

- Existing stage/timeline state interpretation
- Existing germination started and completed timestamp meaning
- Existing lifecycle timeline display concepts for internal/admin views
- Existing public timeline summarization patterns where appropriate

### CSTP Should Not Duplicate

- A parallel CSTP timeline engine
- CSTP-only stage names that conflict with normal session stages
- Separate completion logic for the same observed session event

### Possible Future Extension Hooks

- CSTP methodology validation around required observation windows
- Report snapshot fields that freeze selected timeline values
- Admin review states that sit above session lifecycle, not inside it

## 5. Partition Architecture Reuse Analysis

### Existing Pattern

Cannakan Grow already supports KAN and TRa system concepts, partition rows, partition icons, partition counts, source/variety inputs, seed type metadata, planted counts, and partition-level analytics.

### CSTP Should Reuse

- KAN partition logic
- TRa partition concepts
- Partition row data
- Partition-level seed counts
- Partition-level germination/planted values
- Existing partition visualization concepts
- Existing device/system type handling

### CSTP Should Not Duplicate

- A separate CSTP partition schema for the same KAN/TRa mechanics
- Separate partition visualization logic unless a public report needs a frozen display representation
- Independent partition metrics that disagree with session metrics

### Possible Future Extension Hooks

- CSTP Test Session metadata such as `kan_label`
- Report snapshot summaries of partition outcomes
- Multi-KAN aggregation derived from linked sessions

## 6. Snapshot / Image System Reuse Analysis

### Existing Pattern

The app has session image handling, public gallery snapshot behavior, image buckets, image URL helpers, image normalization, image grid rendering, and Community Grow snapshot publication/review patterns.

Existing image-related concepts include:

- Session image bucket usage
- Session image public URL resolution
- Session image normalization
- Image grid and carousel display patterns
- Gallery snapshot data generated from sessions
- Public snapshot moderation and approval flows

### CSTP Should Reuse

- Session image ownership for raw evidence
- Existing upload/storage patterns where compatible
- Existing image normalization ideas
- Existing gallery/public snapshot lessons around moderation and visibility
- Existing public image fallback discipline

### CSTP Should Extend

- Report-approved image selection
- Report asset records for first germination, final observation, and multi-KAN images
- Snapshot-frozen media metadata for published reports

### CSTP Should Isolate

- Raw internal CSTP images that are not approved for public reports
- Admin-only image review decisions
- Report media approval status

### CSTP Should Not Duplicate

- A separate upload pipeline unless report publication requires a distinct asset persistence layer
- Public media display that bypasses existing visibility and approval patterns

## 7. Metrics & Analytics Reuse Analysis

### Existing Pattern

Cannakan Grow already calculates and displays session metrics, seed totals, success rates, seed age analytics, category breakdowns, source performance, Community Grow insights, and partition-level data.

Relevant metrics include:

- Germination percentage
- Session seed totals
- Time-to-germination timing
- Source performance
- Seed type analytics
- Seed age analytics
- Partition-level metrics
- Historical session analytics

### CSTP Should Reuse

- Session-level metric source data
- Existing total seed and germination calculations where terminology aligns
- Existing seed age and seed type analytics concepts
- Existing source and partition aggregation patterns

### CSTP Should Extend

- Multi-session CSTP aggregation
- Gold/Silver qualification evaluation
- Report snapshot frozen metrics
- Certification lifecycle metrics
- Public report terminology such as Observed Germination Rate

### CSTP Should Not Duplicate

- Active metric calculations in multiple mutable places
- Separate CSTP germination calculations that disagree with session evidence
- Source performance calculations detached from Source Directory and session data

### Architectural Rule

Session metrics remain source-of-truth. CSTP aggregate metrics are derived. Report metrics are frozen snapshots.

## 8. Source Directory Reuse Analysis

### Existing Pattern

The app already has a Source Directory system using a shared `sources` concept, source loading, source catalog records, source pages/cards, source metrics, source review/admin patterns, status pills, filters, sorting, pagination, and CSTP soft-link UI treatment.

Existing source concepts include:

- Source records
- Source profile pages
- Source cards
- Source metrics
- Source status pills
- Source review flows
- Source Directory filtering/sorting
- CSTP badge/report link treatment for approved mock states

### CSTP Should Reuse

- Existing `sources` identity
- Existing source card/profile surfaces
- Existing source metrics context
- Existing source review/admin concepts where useful
- Existing tested-source filter UI vocabulary where already aligned

### CSTP Should Extend

- Tested source indicators
- Gold/Silver certification badge state
- Report Available / Report Unavailable state
- Source certification history display
- Source-level report links backed by published snapshots

### CSTP Should Not Duplicate

- Source records
- Source Directory pages
- Source identity or slug logic
- Separate CSTP-only source directory

### Architectural Rule

CSTP enhances Source Directory. It does not replace Source Directory.

## 9. Community Grow Reuse Analysis

### Existing Pattern

Community Grow already handles public gallery snapshots, snapshot moderation, approved/published visibility, likes, follows, community activity, filtering, leaderboard/trust displays, and public session timeline summaries.

### CSTP Should Reuse

- Public visibility discipline
- Moderation and approval concepts
- Filter patterns
- Trust indicator patterns
- Public snapshot fallback behavior
- Community activity lessons around approved public data only

### CSTP Should Extend Carefully

- CSTP Tested filters
- Approved report discoverability
- Public trust indicators for approved certifications
- Links to public report snapshots

### CSTP Should Isolate

- Failed tests
- Internal tests
- Draft reports
- Invalidated tests
- Private admin workflow state

### CSTP Should Not Duplicate

- Community publication logic
- Public/private visibility handling
- Leaderboard/trust calculation patterns without clear CSTP-specific reasons

## 10. Notification Patterns Reuse Analysis

### Existing Pattern

The app has notification center state, user notification preferences, push subscription tables, reminder events, notification delivery tracking, snooze actions, and guarded fallback behavior when optional notification backend columns are unavailable.

### CSTP Should Reuse

- Existing notification preference patterns
- Existing fallback/latching behavior for unavailable backend features
- Existing notification center UI concepts
- Existing reminder/event delivery principles

### CSTP Should Extend Later

- Report prepared notifications
- Report published notifications
- Certification expiration reminders
- Renewal workflow reminders
- Source/breeder communications

### CSTP Should Isolate

- Admin-only workflow reminders until CSTP workflows stabilize
- Breeder/source notification delivery until portal ownership is defined

### CSTP Should Not Duplicate

- A separate notification preference system
- A separate push delivery table pattern unless future requirements justify it

## 11. Admin Workflow Reuse Analysis

### Existing Pattern

The app already contains admin navigation, admin access checks, admin reports, admin messages, source review tools, admin communications, announcement management, tutorial management, and current CSTP lab mock/admin surfaces.

### CSTP Should Reuse Conceptually

- Admin-only visibility patterns
- Admin status pill patterns
- Review/approval flows
- Internal notes and event concepts
- Admin communication patterns
- List/detail admin workspace patterns
- Source review workflow lessons

### CSTP Should Extend

- CSTP request intake management
- CSTP Test lifecycle management
- Session linkage review
- Report preparation and snapshot approval
- Certification publication decisions
- Admin event audit trail

### CSTP Should Isolate

- Certification decision authority
- Internal CSTP notes
- Failed/invalid/private test details
- Admin-only report preparation state

### CSTP Should Not Duplicate

- Separate admin authentication logic
- Separate admin navigation principles
- Separate moderation concepts for public approval

## 12. Status / Badge Systems Reuse Analysis

### Existing Pattern

Cannakan Grow already uses status pills, badges, stage badges, Source Directory status, Community Grow publication states, notification badges, and CSTP badge assets for current soft-release UI.

### CSTP Should Reuse

- Existing pill/badge visual language
- Existing status-driven rendering patterns
- Existing understated Source Directory badge placement
- Existing public-safe terminology patterns

### CSTP Should Extend

- Gold Certified
- Silver Certified
- CSTP Tested
- Previously Tested
- Report Available
- Report Unavailable
- Expired Certification

### CSTP Should Not Duplicate

- Conflicting certification labels
- Marketing-heavy badge language
- Badge state separate from certification history

## 13. Notes / Observation Systems Reuse Analysis

### Existing Pattern

Sessions already support notes, observations through stage/timeline and partition updates, public grow notes, and snapshot state. Admin systems also have internal notes/message patterns.

### CSTP Should Reuse

- Session notes for operational evidence
- Stage/timeline observations
- Partition observations
- Public note inclusion patterns where appropriate
- Admin notes as private workflow data

### CSTP Should Extend

- CSTP-specific admin notes
- Report-approved observation summaries
- Methodology-specific observation checkpoints

### CSTP Should Isolate

- Internal certification reasoning
- Failed test moderation notes
- Private request discussions

### CSTP Should Not Duplicate

- A second observation stream for the same session activity
- Public report notes that expose raw admin discussions

## 14. Session Ownership / Visibility Reuse Analysis

### Existing Pattern

The current Supabase design uses user-scoped session policies, admin membership concepts, public Source Directory visibility, public gallery snapshot visibility, and approved Community Grow publishing.

### CSTP Should Reuse

- User-owned normal sessions
- Admin-managed private workflow records
- Explicit public visibility for published data
- Approved-only public sharing patterns

### CSTP Should Extend

- CSTP admin visibility states
- Public report snapshot visibility
- Public certification visibility
- Future breeder/source scoped visibility

### CSTP Should Not Duplicate

- Separate session ownership rules
- Public visibility inferred from private workflow status
- Certification visibility inferred only from source card display

## 15. Existing Supabase Architecture Audit

### Existing Pattern

The current Supabase architecture includes:

- `grow_sessions` for user-owned sessions
- `sources` for Source Directory records
- `grow_gallery_snapshots` for public/moderated snapshots
- `grow_gallery_snapshot_likes` for public interaction
- `grow_follows` and `community_activity` for network/community behavior
- `user_notification_preferences`, push subscriptions, delivery records, and reminder events
- `admin_users`, `admin_reports`, and admin-related tables
- RLS policies for user ownership, admin access, and public approved data
- Additive migration files for session seed age, soft delete, reminders, gallery metadata, and notification preferences

### CSTP Should Reuse

- User-scoped session ownership model
- Admin role concepts
- Public approved-read patterns
- Additive migration style
- `updated_at` trigger conventions where appropriate
- Existing naming conventions for timestamps and relationship fields

### CSTP Should Extend

- CSTP-owned tables
- CSTP Test to session join table
- CSTP report snapshots
- CSTP certification history
- Source certification history

### CSTP Should Avoid

- Direct mutation of existing session tables for initial CSTP implementation
- Cascading deletes that remove published reports or certification history
- RLS policies that expose draft/internal CSTP data
- Schema changes that force migration of existing sessions

## 16. Existing UI Component Patterns Audit

### Existing Pattern

The app uses established UI patterns across sessions, Source Directory, Community Grow, admin, and notifications:

- Cards for repeated items
- Status pills
- Badges
- Filter pills
- List/detail layouts
- Metric cards
- Timeline sections
- Image grids
- Empty states
- Unavailable/fallback pages
- Admin tables and panels
- Responsive stacked card layouts

### CSTP Should Reuse

- Source Directory card integration patterns
- Admin list/detail patterns
- Metric card patterns for report/admin summaries
- Timeline section patterns for session-derived evidence
- Badge/pill styling conventions
- Graceful unavailable state patterns

### CSTP Should Extend

- Premium but restrained certification badge display
- Report snapshot sections
- Public report unavailable fallback
- Certification history display

### CSTP Should Not Duplicate

- A separate UI language for CSTP
- Separate navigation architecture during soft release
- Public components that overclaim certification status

## 17. Reuse vs Extension vs Isolation Matrix

| Existing System | Reuse | Extend | Isolate | Avoid Duplication |
|---|---|---|---|---|
| Session System | Session identity, ownership, notes, images, metrics, timestamps | CSTP join hooks and report aggregation | CSTP admin review state | Parallel CSTP sessions |
| Stage / Timeline Logic | Soaking, germinating, germination started, completed | Methodology checkpoints and frozen report timeline values | Admin workflow status | Parallel timeline engine |
| Partition Architecture | KAN/TRa partitions, counts, partition metrics | Multi-KAN aggregation | Qualification decisions | CSTP-only partition model |
| Snapshot / Image System | Session images, gallery snapshot lessons | Report-approved media assets | Internal review images | Separate image pipeline unless required |
| Metrics & Analytics | Session totals, germination %, seed age, source and partition analytics | CSTP aggregates and frozen report metrics | Certification thresholds | Duplicate active calculations |
| Source Directory | Shared source identity, cards, profiles, metrics | Badges, report links, certification history | Internal CSTP source review | CSTP-only source directory |
| Community Grow | Approved public data, filters, trust displays | CSTP Tested filters and report discovery | Failed/internal CSTP tests | Separate community publication model |
| Notification Patterns | Preferences, fallback latches, reminder concepts | CSTP report/certification notifications later | Breeder/source delivery until ownership exists | Separate notification settings |
| Admin Workflow Patterns | Admin access, review flows, notes, status pills | CSTP intake, test, report, certification workflows | Certification authority and internal notes | Separate admin auth logic |
| Status / Badge Systems | Pills, badges, source/card status conventions | CSTP certification states | Private workflow statuses | Conflicting badge vocabulary |
| Notes / Observation Systems | Session notes and observation evidence | Report-approved summaries | Admin notes and failed-test discussions | Duplicate observation stream |
| Session Ownership / Visibility | User-owned sessions, approved public snapshots | CSTP public report/certification visibility | Draft/internal CSTP data | Separate visibility rules |
| Supabase Architecture | Existing ownership, admin, public-read patterns | CSTP-owned additive tables | Future RLS until validated | Destructive shared-table changes |
| UI Component Patterns | Cards, filters, metrics, timelines, image grids | CSTP report/certification presentation | Unfinished workflows | Separate CSTP visual system |

## 18. High-Risk Duplication Areas

### Duplicate Session Systems

A CSTP-specific session system would fragment the evidence model and create conflicting lifecycle, metrics, notes, and visibility behavior.

### Duplicate Metrics

If CSTP stores active calculations separately from session metrics, report values and analytics may drift. CSTP should derive aggregates and freeze only report snapshots.

### Duplicate Report Calculations

Report calculations should use one standardized framework. Public report values should be locked in snapshots to avoid recalculating into different values later.

### Duplicate Visibility Logic

CSTP should not invent unrelated public/private rules. It should extend existing approved-public and admin-private patterns with explicit CSTP visibility fields.

### Duplicate Source Systems

CSTP should never create separate certified-source identities. Source Directory remains the shared source system.

### Duplicate Certification Tracking

Certification state should live in persistent certification/history records, not only in source cards, report UI, or badge display flags.

## 19. Recommended Engineering Guidance

### Keep Shared

- Sessions
- Session ownership
- Stage/timeline behavior
- Partition mechanics
- Raw observations
- Raw session images
- Session metrics
- Source identity
- Approved public visibility patterns
- Admin access concepts

### Keep Isolated

- CSTP admin workflow state
- Internal notes
- Failed/invalid tests
- Draft reports
- Certification decision records
- Report publication approval
- Future breeder/source portal access

### Additive Only

- CSTP Tests
- CSTP Test Session links
- CSTP report containers
- CSTP report snapshots
- CSTP certifications
- Source certification history
- CSTP admin events
- Source Directory tested-source enhancements

### May Require Abstraction Later

- Shared metric calculation helpers
- Shared image asset selection helpers
- Shared public visibility resolution
- Shared status/badge rendering vocabulary
- Shared admin workflow components
- Shared notification event routing

### Should Not Be Touched Early

- Core session table structure
- Session lifecycle behavior
- Partition chart mechanics
- Source identity model
- Community Grow public publishing rules
- Notification preference schema
- Global navigation structure
- Public CSTP workflows

## 20. Explicit Non-Goals

This document does not include or implement:

- App code changes
- Backend changes
- UI changes
- Route changes
- SQL
- Migrations
- Schema edits
- Row-level security
- API implementation
- Report builder implementation
- Automation
- Breeder/source portal functionality
- Public CSTP rollout

This is an implementation-readiness audit and architecture reuse guide only.

