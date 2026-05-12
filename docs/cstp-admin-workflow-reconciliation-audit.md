# CSTP Admin Workflow Reconciliation Audit

## 1. Purpose

This document records the CSTP admin workflow reconciliation pass that made the API-backed CSTP admin workflow the canonical internal operational path.

The reconciliation focused on removing active UI access to older static/admin-preview CSTP lab behavior while preserving admin-only boundaries, API-driven architecture, lifecycle/audit centralization, and session compatibility protections.

This audit does not add reports, certifications, public CSTP features, automation, breeder/source portals, Community Grow integration, Source Directory integration, or `grow_sessions` mutation behavior.

## 2. Old Flows Found

The audit found an older static/admin-preview CSTP lab workflow coexisting with the newer API-backed workflow in `app.js`.

Older behavior included:

- static/local CSTP request queue rendering
- static/local CSTP request detail rendering
- local tester assignment controls
- local assigned CSTP session creation controls
- admin-only `#admin/cstp-session/...` route rendering
- admin-only `#admin/cstp-report/...` route rendering
- local report preparation controls
- local certification/publish preview controls
- local mock/session-state mutation helpers for CSTP preview data

These older flows were admin-only, but they duplicated the newer operational workflow and introduced confusing report/certification preview language before immutable reporting and certification systems exist.

## 3. Reconciliation Performed

### Canonical Admin Section Rendering

The rendered CSTP Testing Lab admin section now shows only the API-backed operational surfaces:

- CSTP request queue
- CSTP request detail
- CSTP request status actions
- CSTP test creation from eligible requests
- CSTP test list/detail
- CSTP test status actions
- CSTP session-link relationship management

The older static/local CSTP queue, filter row, metrics preview, and static detail panel are no longer rendered in the admin CSTP Testing Lab section.

### Legacy Route Isolation

Legacy admin-only hashes are now isolated:

- `#admin/cstp-session/...`
- `#admin/cstp-report/...`

Those routes no longer render the older static CSTP session or report preview pages. Instead, after normal admin authorization checks, they resolve back to the canonical CSTP Testing Lab section so operators land on the API-backed workflow.

### Featured Admin CTA Repointed

The CSTP admin section CTA now scrolls/focuses to the API-backed request queue/test management workspace instead of the removed static detail panel.

### Public Exposure Preserved

No public route, main nav item, Source Directory integration, Community Grow integration, public report page, certification page, or public API was added.

## 4. Canonical Operational Workflow

The canonical internal CSTP workflow is now:

```text
Admin CSTP Testing Lab
-> API-backed Request Queue
-> Request Detail / Request Status Actions
-> CSTP Test Creation
-> API-backed Test Management
-> Session-Link Relationship Management
```

Canonical APIs remain:

- `GET /api/cstp-admin-requests-list`
- `GET /api/cstp-admin-request-detail`
- `POST /api/cstp-admin-request-status-update`
- `POST /api/cstp-admin-test-create`
- `GET /api/cstp-admin-tests-list`
- `GET /api/cstp-admin-test-detail`
- `POST /api/cstp-admin-test-status-update`
- `GET /api/cstp-admin-session-links-list`
- `POST /api/cstp-admin-session-link-create`
- `POST /api/cstp-admin-session-link-archive`

The frontend remains thin. Backend APIs and internal helpers remain canonical for authorization, lifecycle validation, audit behavior, duplicate-link protection, and database mutation.

## 5. Session Compatibility Confirmation

The reconciliation preserves session compatibility rules:

- No `grow_sessions` mutation was added.
- Session-link management remains relationship-only.
- CSTP does not own linked Grow sessions.
- No session stage, timeline, analytics, media, reminder, partition, ownership, visibility, or completion logic was added to the API-backed workflow.
- Legacy static session/report routes no longer expose local CSTP session editing or report preview behavior.

## 6. Remaining Intentionally Deferred Areas

Still deferred:

- immutable report schema
- snapshot generation pipeline
- report publication workflow implementation
- certifications
- certification eligibility
- public CSTP reports
- public report APIs
- public CSTP badges
- Source Directory CSTP exposure
- Community Grow CSTP exposure
- breeder/source portals
- automation
- admin audit-event read UI

## 7. Remaining Stabilization Recommendations

Recommended follow-up stabilization:

1. Remove or archive unused legacy static CSTP helper functions after confirming no remaining internal references are needed.
2. Update `docs/cstp-architecture-master-index.md` to reference the completed API/admin UI workflow and this reconciliation pass.
3. Add focused CSTP admin workflow smoke tests for the API-backed path.
4. QA the canonical workflow with configured local Supabase/admin auth.
5. Defer report/snapshot/certification implementation until the canonical admin workflow is operationally stable.

## 8. Final Reconciliation Verdict

The API-backed CSTP admin workflow is now the single canonical internal operational path.

Older static/admin-preview behavior has been removed from active admin rendering and isolated from legacy admin hash routes. CSTP remains internal-only, admin-only, API-driven, and free of new public report/certification behavior.

## 9. Validation Summary

Validation completed:

- `node --check app.js` passed.
- `npm run build` passed with the expected missing Supabase runtime config warning in this local environment.
- CSTP admin API syntax checks passed for 11 files.
- CSTP internal helper syntax checks passed for 10 files.
- Static search confirmed the old rendered admin lab list/detail ids and legacy certification filter copy are no longer present in active rendered markup.
- Static public exposure search found no new public CSTP route/content exposure in `index.html` or `public/`; `styles.css` contains admin-scoped CSTP selectors only.
- `git diff --check` passed with line-ending warnings for existing generated/config files.
