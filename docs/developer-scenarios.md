# Developer Scenarios

Developer Scenarios is an in-app, local-development presentation tool. It is separate from the scripts in `scripts/local-demo/`, which seed or clear the local Supabase database for integration testing.

## Safety model

- `isDeveloperScenariosAllowed()` is the authoritative runtime gate and is evaluated before scenario preferences are read or written.
- Known production hostnames always deny access. Production builds also fail if scenarios are not disabled by default, and Vercel builds reject the explicit preview-data environment flag.
- Scenario choices are stored under `grow_developer_scenarios_v1`. Only enabled state and selector choices are persisted; fixture records are never stored.
- Each supported module resolves data through a provider boundary: Seed Vault, Sessions, Profile, Community, and Explore.
- Scenario providers return deterministic records plus derived summary contracts. Cards, totals, charts, rankings, profile trends, and detail views therefore resolve from one module-level fixture instead of mixing fixture records with cached live GIE analytics.
- Active scenario routes do not invoke the corresponding live GIE owner, community, or global analytics loader. Production routes continue to use the existing canonical contracts unchanged.
- Fixture sources are deeply frozen and cloned before use. Records use `scenario-` or `preview-` IDs and carry an explicit `isPreview` marker.
- A centralized write guard blocks scenario records and every write path for an active scenario module. Analytics events and visitor-presence updates are also suppressed while any scenario is active.
- The fixed warning and affected-page badge make preview state visible. **Return to Live Data** disables all scenario providers and restores live state without modifying it.

## Using the panel

On an allowed local host, open **Developer Scenarios** at the lower-right of the application. Choose a scenario for any module, enable scenarios, and navigate normally. Use **Reset Scenarios** for the default cross-module fixture set or **Return to Live Data** to exit.

The panel supports:

- Seed Vault: empty, first seed, small collection, collector vault, planning focus, testing program
- Sessions: none, one or multiple active, ready to complete, completed history, mixed results
- Profile: new user, active grower, founding grower, product tester, community leader
- Community: empty, growing, featured, high activity
- Explore: empty, limited, healthy, high diversity, strong attribution, mixed confidence

## Verification

Run `npm run qa:developer-scenarios`, `npm run build`, and the Playwright suite. The regression check verifies the production gate, provider boundaries, scenario analytics adapters, fixture lifecycle, warning UI, central guards, and responsive styling. The detailed route/child-component audit is recorded in `docs/developer-scenarios-coverage.md`.
