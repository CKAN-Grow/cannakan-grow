# Developer Scenarios Coverage Audit

This matrix records the audited scenario-data boundary. “Scenario-aware” means the rendered records and every listed child summary are derived from the selected module fixture. Live mode continues to use the production data and canonical GIE contracts.

| Module | Route / component | Expected source | Before audit | Scenario-aware | Resolution |
| --- | --- | --- | --- | --- | --- |
| Sessions | Home session summary | Session provider | Cards used fixtures; some summaries used cached owner GIE | Yes | Canonical-owner accessor resolves the session scenario analytics contract on in-scope routes. |
| Sessions | My Sessions cards/history | Session provider | Fixture records | Yes | Preserved provider records and added fixture validation. |
| Sessions | My Sessions analytics | Same session fixture | Cached owner GIE | Yes | Added deterministic owner-shaped scenario analytics adapter. |
| Sessions | Active Sessions command center | Same session fixture | Mixed fixture records and owner cache | Yes | Shared owner accessor now resolves the active session provider. |
| Sessions | Session detail/result breakdown | Selected scenario session | Non-completed custom results could display as pending | Yes | Fully accounted preview results render as recorded without changing completion behavior. |
| Profile | Profile settings/stats | Profile provider | Profile fixture with partially independent totals | Yes | Profile fixture now includes its own sessions, analytics, recognition, activity, and network contract. |
| Profile | Grow Network hero/stats/trends | Same profile fixture | Live identity, owner/community caches, and follow counts | Yes | Network route uses profile-provider identity, analytics, sessions, and network totals. |
| Community | Community cards/feed | Community provider | Fixture snapshots | Yes | Preserved normalized fixture card feed. |
| Community | At-a-glance dashboard | Same community fixture | Cached Community GIE | Yes | Added a deterministic community analytics adapter. |
| Community | Leaderboards/Insights | Same community fixture | Cached Community GIE | Yes | Rankings and Insights resolve from fixture-derived rows and are labeled sample data. |
| Seed Vault | Vault entries | Seed Vault provider | Fixture entries | Yes | Preserved existing provider boundary. |
| Seed Vault | Overview/insights | Same vault fixture | Explicit provider records already supplied | Yes | Audited and retained existing fixture-derived analytics. |
| Explore | Home global metrics | Explore provider | Cached global GIE | Yes | Home cache facade returns the selected Explore scenario contract. |
| Explore | Seed Explorer cards/metrics | Explore provider | Canonical aggregate or legacy demo fallback | Yes | Added normalized deterministic Explore aggregate scenarios. |
| Explore | Source Explorer/cards | Same Explore fixture | Canonical source map | Yes | Source aggregates are derived from scenario seed records. |
| Explore | Seed/source reports | Same Explore fixture | Canonical/community report lookup | Yes | Scenario report adapters derive rankings, relationships, confidence, distributions, trends, and coverage summaries from the Explore fixture. |
| Admin / unrelated analytics | All routes outside module scope | Live production data | Protected by route scope | Yes | Scenario provider routing still excludes admin and unrelated analytics routes. |

Fixture validation rejects missing or duplicate preview IDs, invalid seed-result math, completed sessions with pending results, and session aggregate disagreements. Playwright coverage verifies persistence, route scoping, write blocking, session child consistency, Community summary consistency, Explore aggregate consistency, no live GIE calls after scenario activation, and clean return to live data.
