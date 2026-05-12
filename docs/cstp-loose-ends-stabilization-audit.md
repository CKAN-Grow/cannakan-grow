# CSTP Loose-Ends and Stabilization Audit

## 1. Purpose

This audit identifies loose ends, inconsistencies, fragile areas, and polish needs before CSTP moves from implementation into operational stabilization.

The review covered:

- CSTP documentation
- CSTP migration files
- `src/services/cstp/internal/`
- `api/cstp-admin-*.js`
- CSTP admin UI surfaces in `app.js`
- current git status

This is audit and planning only. It does not implement new features, add reports, add certifications, expose CSTP publicly, add automation, add breeder/source portals, integrate Community Grow, integrate Source Directory, or mutate `grow_sessions`.

## 2. Current CSTP Completion Summary

Completed internal CSTP foundation:

- Active CSTP migration v1 exists for `cstp_requests`, `cstp_tests`, `cstp_admin_events`, and `cstp_test_sessions`.
- Internal helper modules exist for constants, errors, lifecycle validation, admin events, requests, tests, session links, authorization, and execution.
- Internal execution boundary exists for request creation/status updates, test creation/status updates, and session-link creation/archival.
- Admin-only mutation APIs exist for request creation/status updates, test creation/status updates, and session-link creation/archival.
- Admin-only read APIs exist for request list/detail, test list/detail, and session-link list.
- Internal CSTP admin UI exists inside the admin area for request queue/detail/status actions, test creation, test management, and session-link relationship management.
- Planning documents now exist for immutable reporting architecture, report snapshot schema planning, report publication workflow planning, and snapshot generation pipeline planning.

The current operational CSTP implementation remains internal/admin-only and API-driven.

## 3. Git Status Summary

Initial audit check:

- `git status --short --untracked-files=all` returned clean output before this audit document was created.
- No untracked CSTP implementation files were detected at audit start.
- No unstaged CSTP implementation changes were detected at audit start.
- No duplicate `api/cstp-admin-*.js` route filenames were detected.

After this audit pass, the expected pending change is this new document:

- `docs/cstp-loose-ends-stabilization-audit.md`

No commit was created.

## 4. Confirmed Clean Areas

### Internal Helper Surface

Confirmed:

- `src/services/cstp/internal/index.js` exports the helper modules consistently.
- CSTP error classes use consistent `Cstp...Error` naming and `CSTP_..._ERROR` codes.
- Lifecycle status vocabulary is centralized in constants and lifecycle helpers.
- Request, test, and session-link helpers keep validation/preparation separated from route logic.
- Execution helpers centralize database writes instead of scattering Supabase calls through routes.
- Module load checks passed for the internal helper surface.

### Admin API Surface

Confirmed:

- 11 CSTP admin API route files exist.
- Routes follow consistent CommonJS exports.
- Routes enforce method boundaries.
- Read routes support `GET` plus `OPTIONS`.
- Mutation routes support `POST` or `POST/PATCH` plus `OPTIONS` where appropriate.
- Routes call `authorizeCstpAdminRequest` before query or mutation execution.
- Routes do not construct admin events directly.
- Routes do not mutate `grow_sessions`.
- Route syntax checks passed.
- Route module load checks passed.

### Admin UI Surface

Confirmed:

- The API-backed CSTP request/test/session-link UI is inside the existing admin area.
- The admin UI calls CSTP admin APIs using bearer auth.
- No direct Supabase table access was found in the API-backed CSTP admin UI helpers.
- The new API-backed request/test/session-link workflow has loading, saving, empty, and error handling.
- Session-link management treats links as external relationships and does not edit Grow sessions.
- The UI still states public reports/certifications/source badges are deferred in the newer API-backed panels.

### Migration Foundation

Confirmed:

- Active migration v1 exists at `supabase/migrations/20260511222737_cstp_migration_v1.sql`.
- The active migration scope remains limited to the approved v1 internal tables.
- Draft SQL files remain in `supabase/migrations/drafts/` and are not active migrations.

## 5. Identified Loose Ends

### Architecture Master Index Is Behind the Implemented Phases

`docs/cstp-architecture-master-index.md` does not yet reference the newer completed architecture and implementation phases:

- admin API integration audit
- admin UI architecture plan
- admin UI integration audit
- immutable reporting architecture plan
- report snapshot schema plan
- report publication workflow plan
- snapshot generation pipeline plan

It also contains older conceptual request status guidance such as `draft`, `submitted`, `under_review`, and `rejected`, while the implemented v1 status vocabulary is:

- requests: `received`, `accepted`, `awaiting_seeds`, `declined`, `archived`
- tests: `pending`, `active`, `completed`, `archived`

Recommended stabilization action: update the master index to reference newer documents and reconcile canonical v1 status vocabulary.

### Older Static CSTP Admin Lab Still Coexists With API-Backed Workflow

`app.js` still contains an older admin-only CSTP lab/session/report preview flow alongside the newer API-backed request/test/session-link workflow.

Observed older/admin-only surfaces include:

- `#admin/cstp-session/...`
- `#admin/cstp-report/...`
- static/local report preparation controls
- local certification/publish controls
- report/certification copy inside older admin lab areas

This is not public exposure, but it is a stabilization risk because it can confuse operators and blur which CSTP workflow is canonical.

Recommended stabilization action: reconcile, hide, or clearly label the older local/static admin lab preview before operational use.

### Draft SQL Files Remain After Active Migration Promotion

The following draft files still exist:

- `supabase/migrations/drafts/cstp_migration_v1_draft.sql`
- `supabase/migrations/drafts/cstp_migration_v1_candidate.sql`

They are safely outside active migrations, but their presence could confuse future migration review.

Recommended stabilization action: either keep them intentionally as reviewed artifacts with a README/note, or archive/remove them after confirming the active migration is the only migration source of truth.

### Some Planning Documents Still Say Later Phases Are Deferred

Older planning documents correctly used deferred language when written, but several are now historical rather than current-state accurate. Examples include API and UI planning documents that say routes or UI remain deferred even though those phases now exist.

This is not a code issue, but it can make onboarding harder.

Recommended stabilization action: add a brief status note or master-index update clarifying which documents are historical planning inputs versus current authoritative state.

### Helper Preparation Functions Still Return Deferred Execution Markers

Request, test, and session-link preparation helpers still return `dbExecution: "deferred"` because they are payload-preparation helpers. Actual execution is now handled by `execution.js`.

This is not necessarily wrong, but it is easy to misread as "DB execution is not implemented."

Recommended stabilization action: update helper comments later to clarify that `dbExecution: "deferred"` applies to preparation helpers only, while execution helpers perform controlled writes.

### Admin Read Logic Is Route-Local

Admin read APIs currently contain route-local query helpers. The API audit already notes this is acceptable for first slices, but it may become harder to maintain as admin read capabilities expand.

Recommended stabilization action: defer until needed, then consider a read/repository helper layer for CSTP admin reads.

### No Dedicated CSTP API/UI Automated Test Suite Yet

Syntax and module-load validation pass, but there is no dedicated automated test suite covering:

- authorization failure shapes
- lifecycle rejection responses
- audit failure visibility
- duplicate session-link rejection
- admin UI API response handling
- older static lab vs API-backed workflow boundaries

Recommended stabilization action: add focused CSTP helper/API smoke tests before adding report snapshot implementation.

### Build Emits Expected Missing Runtime Config Warning

`npm run build` passes, but reports:

```text
Supabase runtime config was generated without values. The app will show the setup screen until config values are provided.
```

This is expected in the current environment, but operational QA should use a configured local or staging environment.

## 6. Recommended Stabilization Fixes

Recommended order:

1. Update `docs/cstp-architecture-master-index.md` with newer completed docs and implemented v1 status vocabulary.
2. Decide the fate of `supabase/migrations/drafts/` now that migration v1 is active.
3. Reconcile the older static/admin-only CSTP lab/report flow with the API-backed admin workflow.
4. Clarify preparation-helper comments around `dbExecution: "deferred"` so they do not appear stale.
5. Add targeted CSTP helper/API smoke tests.
6. Run manual admin UI QA against a configured local Supabase admin account.
7. Only after stabilization, move into immutable report snapshot implementation planning.

## 7. What Should Not Be Touched Yet

Do not start these areas during stabilization:

- public CSTP report pages
- public certifications
- public report APIs
- Source Directory CSTP exposure
- Community Grow CSTP integration
- breeder/source portals
- automation
- report snapshot migrations
- certification migrations
- public badge logic
- `grow_sessions` mutation from CSTP workflows

The next implementation work should reduce drift and ambiguity before expanding the CSTP surface area.

## 8. Recommended Next Implementation Order

Recommended next steps:

1. Governance/doc cleanup: master index update and newer document cross-references.
2. Migration artifact cleanup: decide whether draft SQL files stay as reference artifacts.
3. Admin UI stabilization: reconcile old static lab/report controls with the API-backed workflow.
4. Helper/API test stabilization: add focused tests or scripted checks for lifecycle/auth/session-link boundaries.
5. Operational QA: run the admin workflow end-to-end with local Supabase data.
6. Reporting readiness: only then move toward report snapshot migration scope planning.

## 9. Validation Results

Validation commands run during this audit:

| Check | Result |
|---|---:|
| `git status --short --untracked-files=all` | Clean at audit start |
| `node --check app.js` | Passed |
| CSTP internal helper syntax checks | Passed for 10 files |
| CSTP admin API syntax checks | Passed for 11 files |
| CSTP helper/API module load check | Passed for internal helpers and 11 API modules |
| `npm run build` | Passed with expected missing Supabase runtime config warning |
| `git diff --check` | Passed; Git emitted line-ending warnings for existing generated/config files outside this audit |

## 10. Final Stabilization Verdict

CSTP is structurally ready for operational stabilization, not expansion.

The core internal foundation is in place and validates cleanly, but stabilization should address documentation drift, old static admin CSTP workflow remnants, draft migration artifact clarity, and targeted test coverage before report snapshots, certifications, or public trust systems are implemented.
