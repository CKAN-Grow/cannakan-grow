# Developer Scenarios

Developer Scenarios is an in-app, local-development presentation tool. It is separate from the scripts in `scripts/local-demo/`, which seed or clear the local Supabase database for integration testing.

## Safety model

- `isDeveloperScenariosAllowed()` is the authoritative runtime gate and is evaluated before scenario preferences are read or written.
- Known production hostnames always deny access. Production builds also fail if scenarios are not disabled by default, and Vercel builds reject the explicit preview-data environment flag.
- Scenario choices are stored under `grow_developer_scenarios_v1`. Only enabled state, mode, and selector choices are persisted; fixture records are never stored.
- Each supported module resolves data through a provider boundary: Seed Vault, Sessions, Profile, Community, and Explore.
- In **Unified Demo** mode, every provider selects from one memoized relational graph. Cards, totals, charts, rankings, profile trends, and detail views therefore resolve from shared records instead of mixing unrelated fixtures or cached live GIE analytics.
- Active scenario routes do not invoke the corresponding live GIE owner, community, or global analytics loader. Production routes continue to use the existing canonical contracts unchanged.
- Fixture sources are deeply frozen and cloned before use. Records use `scenario-` or `preview-` IDs and carry an explicit `isPreview` marker.
- A centralized write guard blocks scenario records and every write path for an active scenario module. Analytics events and visitor-presence updates are also suppressed while any scenario is active.
- The fixed warning and affected-page badge make preview state visible. **Return to Live Data** disables all scenario providers and restores live state without modifying it.

## Using the panel

On an allowed local host, open **Developer Scenarios** at the lower-right of the application and enable scenarios. **Unified Demo** is the local default and selects **Full Grow Demo**, one synchronized sample ecosystem across the entire app. Use **Reload Scenario** to rebuild the deterministic graph, **Reset Scenario** to restore that default, or **Return to Live Data** to exit.

**Mix & Match** retains the independent module selectors for edge-case and empty-state testing:

The panel supports:

- Seed Vault: empty, first seed, small collection, collector vault, planning focus, testing program
- Sessions: none, one or multiple active, ready to complete, completed history, mixed results
- Profile: new user, active grower, founding grower, product tester, community leader
- Community: empty, growing, featured, high activity
- Explore: empty, limited, healthy, high diversity, strong attribution, mixed confidence

## Full Grow Demo

The master graph contains a current user and seven related contributors, identity and nine Recognition records, 38 sources, 91 varieties, 23 personal session records, 50 Vault entries in 11 collections, follows/network relationships, activity/reminders, supply tracking, and complete Explore report projections. Its derived contracts produce 4 active sessions, 1 ready-to-complete session, 15 completed sessions, 2 drafts, 2 archived sessions, 265 Vault seeds across 22 sources, 30 approved Community reports, and 6 pending-review reports.

Explore is projected from 180 eligible completed evidence sessions and 4,230 tested seeds. KAN contributes 115 sessions (63.9%) and carries the richest documentation and image coverage; the remaining evidence covers TRā, Paper Towel, Rockwool, Starter Plug, Water Soak, Direct Sow, and Custom workflows. Trends, distribution buckets, regional coverage, recent activity, rankings, confidence, relationships, and image galleries all derive from those records rather than typed summary totals.

`validateFullGrowDemoGraph()` rejects inconsistent session states/results, Vault rollups, missing relational references, invalid Recognition ownership, invalid collection membership, undefined summary contracts, and cross-module count disagreements with `DEVELOPER_SCENARIO_FIXTURE_INVALID`.

## Verification

Run `npm run qa:developer-scenarios`, `npm run build`, and the Playwright suite. The regression check verifies the production gate, provider boundaries, enriched fixture scale, scenario analytics adapters, fixture lifecycle, warning UI, central guards, and responsive styling. The detailed route/child-component audit is recorded in `docs/developer-scenarios-coverage.md`.
