# Grow Companion Capability 1 — Tasks, Events, and Activity

## Scope

Capability 1 adds the first durable post-germination records to the existing Grow Companion workspace. A Task plans owner work for one Grow Session. An Event records something that occurred in that same Session. Recent Activity is a normalized read model derived from those two canonical record types; it is not a third persistence table.

## Persistence contract

- `public.grow_session_tasks` owns task identity, due date/time, lifecycle status, restrained origin, and audit timestamps.
- `public.grow_session_events` owns event identity, occurred date/time, optional neutral category, restrained origin, and audit timestamps.
- Both tables require `session_id` and `user_id`; a database trigger verifies that the activity owner is the parent Session owner.
- Parent Session deletion cascades to its private activity. Soft-deleted, archived, terminal, and non-Growing Sessions are read-only in the application.
- Date-only values remain SQL `date` values and are normalized without constructing UTC-midnight display timestamps.

## Access and privacy

RLS and explicit grants make both tables authenticated-owner only. Anonymous access is revoked. Preview Studio records are blocked before any write request. Browser code never exposes a service-role credential.

Tasks and Events are private Session workflow records. They are **not GEE evidence**, do not change analytics or report eligibility, and are not projected into Seed Vault, Community, shared Vaults, public profiles, or Grow Network.

## Read model and UI

The shared browser contract in `src/grow-companion-contract.js` normalizes rows, validates form input, groups upcoming tasks as Overdue / Today / Upcoming, and merges completed Tasks with Events into deterministic Recent Activity. Phase 1 intentionally has no Skip action or `skipped` status; that lifecycle can be introduced later through an additive migration if the product adds a genuine owner-facing behavior.

The existing Growing workspace owns the interface. It provides loading, error, and empty states; Add Task / Add Event forms; task completion; edit and delete actions; duplicate-submission guards; and destructive confirmation. No parallel Session or Germination renderer was introduced.

## Intentionally deferred

Capability 1 does not add recurring tasks, reminders, notifications, assignments, attachments, batch operations, public sharing, automation, grow-stage inference, GEE derivation, Session completion controls, or Reflection persistence.
