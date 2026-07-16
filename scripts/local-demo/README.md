# Local demo framework (Phase 1)

This subsystem creates a small, connected proof dataset for local CannaKAN development. It inserts legitimate source records, sessions, approved Community evidence, profiles, and Seed Vault records; report data is then derived by the existing canonical GIE RPCs. It does not seed report payloads or implement a demo analytics path.

> **Local only:** never use these commands against a hosted, staging, or production Supabase project. Every command fails closed unless it can positively identify this repository's running local Supabase database and Docker project.

## Prerequisites

- Docker Desktop is running.
- Dependencies have been installed with `npm install`.
- Local Supabase is running: `npx supabase start`.
- Run commands from the repository root through the package scripts below.

## Commands

- `npm run demo:seed` reconciles the deterministic dataset in one transaction. Repeating it produces the same IDs, counts, timestamps, and canonical GIE output.
- `npm run demo:clear` deletes only the exact IDs in the ownership manifest. It does not reset the database or delete unrelated local records.
- `npm run demo:reset` performs clear, seed, and verification without invoking `supabase db reset`.
- `npm run demo:verify` checks local-only protections, manifest ownership, exact counts and relationships, session eligibility, local authentication, and canonical GIE Empty/Sparse/multi-period/regional outputs.

## Demo login

- Email: `founder.demo@example.test`
- Password: `CannaKAN-Local-Demo-2026!`

The address is reserved and non-deliverable. The account is confirmed only in local Supabase and includes a completed public grower profile, Massachusetts/United States identity, owner sessions, Vault inventory, planning records, collections, tags, grow notes, and Community activity.

## Expected Phase 1 dataset

| Entity | Exact count |
| --- | ---: |
| Local auth users / identities / profiles / public profiles | 4 each |
| Sources | 4 |
| Directory varieties | 9 |
| Analytics varieties | 8 |
| Eligible completed Community sessions / approved evidence snapshots | 8 each |
| Active owner sessions | 2 |
| Seed Vault entries | 5 |
| Collections / collection links | 2 / 5 |
| Tags / tag links | 5 / 8 |
| Planning entries | 2 |
| Grow notes / profile activities | 2 / 4 |

The fixtures include an evidence-empty Vault variety, a one-session Chad Westport sparse report, and a Seedsman multi-period report spanning Massachusetts, California, and Germany. Values such as distribution, ranks, confidence, coverage, and activity are calculated only by canonical GIE.

## Safety and ownership

The shared guard runs before every database mutation and requires development/test execution mode, the dedicated npm lifecycle and command marker, local API and database hosts, the expected local Supabase config and Docker label, a positively identified local Postgres container, no remote target, no non-local Supabase secrets, and no override-style arguments. Failure lists the rejected checks and occurs before writes; there is no force or skip mechanism.

All owned rows use stable IDs and fixed timestamps recorded in `manifest.mjs` and `ids.mjs`. Relationship rows use their exact deterministic composite keys. Cleanup uses only these IDs, in dependency-safe order, inside a transaction, and asserts that no manifest-owned rows remain. It never filters by email domain, source name, date, status, or all local users.

The local demo subsystem is not imported by browser code, startup, build, deployment hooks, migrations, or default Supabase seed workflows. Credentials are local proof credentials—not production secrets.

## Troubleshooting

- **Local Supabase is not running:** start Docker Desktop, then run `npx supabase start` and retry.
- **Safety check failed:** read every reported check. Confirm the current directory, package command, `supabase/config.toml`, local Docker project, and any `SUPABASE_*`/database environment variables. Remove remote environment values; do not bypass the guard.
- **Schema changed:** run `npx supabase db reset` only if discarding other local database work is acceptable, then rerun `npm run demo:reset`. The demo reset itself intentionally preserves unrelated local work.
- **Verification failed:** the command exits nonzero and names the count, relationship, eligibility, authentication, or GIE assertion that failed. Fix the underlying schema or fixture mismatch; do not weaken the assertion.

Phase 1 deliberately excludes the 60–80-session dataset, expanded Vault/source catalog, generated branding, image and avatar libraries, and presentation polish planned for later phases.
