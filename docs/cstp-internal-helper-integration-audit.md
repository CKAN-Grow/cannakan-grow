# CSTP Internal Helper Integration Audit

## 1. Purpose

This audit reviews the completed internal CSTP helper layers before any database execution, APIs, UI, RLS, reports, certifications, automation, breeder/source portals, or public features are introduced.

The current helper layer is intentionally internal-only. It prepares and validates payloads for future backend work, but it does not mutate the database or connect to existing app flows.

## 2. Helper Layers Completed

Completed internal helper layers:

- `constants.js`: shared CSTP table names and status vocabulary.
- `errors.js`: CSTP-specific validation error classes.
- `lifecycle.js`: canonical request/test state transition validation.
- `admin-events.js`: append-only admin event payload construction and validation.
- `requests.js`: request creation/status/archive payload preparation.
- `tests.js`: test creation/status/archive payload preparation.
- `session-links.js`: CSTP test-to-grow-session link payload preparation and duplicate-link validation.
- `index.js`: internal module export surface.

## 3. Export Structure

`src/services/cstp/internal/index.js` now exports each helper layer as a named internal namespace:

- `constants`
- `errors`
- `lifecycle`
- `adminEvents`
- `requests`
- `tests`
- `sessionLinks`

It also keeps the flattened helper exports for future internal service consumers. This file is not imported by app routes, public UI, APIs, or runtime flows.

## 4. Shared Conventions

Shared conventions are consistent across the internal helper files:

- CommonJS module format, matching the current backend/serverless project style.
- Internal-only return markers through `internalOnly: true`.
- Deferred database execution markers through `dbExecution: "deferred"` where helpers prepare future mutations.
- Schema-aligned table names from `CSTP_TABLES`.
- CSTP-specific validation errors with stable `name`, `code`, and `details`.
- UUID validation before relationship payloads are prepared.
- Plain-object metadata validation for future audit consistency.
- ISO timestamp normalization when timestamp values are emitted into prepared records.

## 5. Deferred DB Execution Status

All helper layers remain in preparation/validation mode only.

No helper currently:

- Instantiates a Supabase client.
- Calls Supabase REST.
- Writes to CSTP tables.
- Updates existing Grow tables.
- Creates API responses.
- Reads public data.

This is intentional because the project does not yet have a shared internal CSTP server client pattern, and RLS/admin ownership boundaries are intentionally deferred.

## 6. Audit/Event Consistency

Request, test, and session-link helpers all prepare append-only admin event payloads or explicit deferred audit intents.

Current behavior:

- Request creation prepares `request_created`.
- Request status changes prepare `request_status_changed`, `request_archived`, or `seeds_received`.
- Test creation prepares `test_created`.
- Test status changes prepare `test_status_changed` or `test_archived`.
- Session link creation prepares `session_linked`.
- Session link archival prepares `session_link_archived`.

When a future database-generated id is required before an event can be persisted, helpers return `readyForPersistence: false` and `deferred: true` rather than silently skipping audit preparation.

## 7. Lifecycle Validation Consistency

Request and test status updates consume the centralized lifecycle validation layer.

Request transitions follow:

- `received -> accepted`
- `received -> declined`
- `received -> archived`
- `accepted -> awaiting_seeds`
- `accepted -> archived`
- `awaiting_seeds -> accepted`
- `awaiting_seeds -> archived`
- `declined -> archived`

Test transitions follow:

- `pending -> active`
- `pending -> archived`
- `active -> completed`
- `active -> archived`
- `completed -> archived`

Archived states do not transition elsewhere in v1.

## 8. Session Compatibility Protection

Session-link helpers prepare only `cstp_test_sessions` relationship payloads.

They do not mutate:

- `grow_sessions`
- session stage logic
- timeline logic
- germination metrics
- analytics
- notes
- reminders
- media
- partitions
- visibility
- ownership

Duplicate active links are rejected when existing link context is provided, and prepared insert payloads document the backing database unique constraint on `(cstp_test_id, session_id)`.

## 9. Remaining Boundaries Before DB Execution

Before database execution is added, the following must be designed and reviewed:

- Shared internal Supabase/server client pattern.
- Admin ownership and actor requirements.
- Transaction sequencing for paired record mutation and admin event creation.
- RLS strategy.
- Error handling and rollback behavior.
- Local integration tests against the CSTP v1 tables.
- Admin-only API boundary.

Reports, snapshots, certifications, public badges, Source Directory integration, Community Grow integration, automation, and breeder/source portals remain out of scope.

## 10. Final Audit Finding

The internal CSTP helper layers are aligned for preparation-only backend work. They centralize lifecycle rules, audit event construction, request/test payload preparation, and session-link compatibility checks without introducing public behavior or runtime app integration.

No APIs, UI, public routes, database writes, RLS policies, reports, certifications, automation, breeder/source portals, or Grow session mutations exist in this helper layer.
