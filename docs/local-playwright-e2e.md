# Local Playwright Founder E2E Smoke Tests

This suite is designed to run locally on Windows without Codex browser automation. It uses Playwright in an isolated browser context and does not change app behavior.

## One-time setup

From the repo root:

```powershell
npm install
npx playwright install chromium
```

## Run desktop smoke tests

```powershell
npm run test:e2e
```

This runs the `founder-desktop` Playwright project at `1366x900`.

## Run mobile smoke tests

```powershell
npm run test:e2e:mobile
```

This runs the mobile projects at:

- `390x844`
- `430x932`
- `768x1024`

## Local server behavior

By default, Playwright starts the existing static server:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\local-server.ps1
```

The server listens on:

```text
http://127.0.0.1:5500
```

If you already have the app running somewhere else, point the tests at it:

```powershell
$env:E2E_BASE_URL = "http://127.0.0.1:5500"
npm run test:e2e
npm run test:e2e:mobile
Remove-Item Env:E2E_BASE_URL
```

## What the tests cover

- App shell loads
- Home
- My Sessions
- New Session
- Seed Vault
- Analytics
- Community Grow
- Community Insights
- Source Directory
- Profile
- Mobile viewport checks at 390px, 430px, and 768px
- No horizontal page overflow
- Key CTAs are visible/reachable
- Available modal surfaces fit the viewport
- Mobile navigation drawer fits the viewport

## Local QA auth behavior

When `supabase-config.js` is empty, the tests enable the app's localhost-only Dev QA bypass inside Playwright's isolated browser context using:

```text
cannakanGrowDevQaBypass=true
```

That lets private founder screens render for smoke testing without using your normal browser profile. It is scoped to the Playwright test context.

## Reports and debugging

Playwright writes failure artifacts to:

```text
test-results/
playwright-report/
```

Open the HTML report after a run:

```powershell
npx playwright show-report
```
