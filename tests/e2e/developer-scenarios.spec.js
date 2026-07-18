const { test, expect } = require("@playwright/test");
const { enableFounderLocalQa } = require("./support/founder-smoke");

const STORAGE_KEY = "grow_developer_scenarios_v1";
const LEGACY_STORAGE_KEYS = ["cannakan-grow-sample-seed-version", "cannakanGrowMockDataEnabled", "cannakanMockGalleryLikes", "cannakanMockGalleryLikes:legacy-user", "cannakanSeedAgeAnalyticsMockData"];
const SEED_VAULT_ENTITY_RGB = Object.freeze({
  "is-varieties": [148, 209, 89],
  "is-seeds": [184, 135, 91],
  "is-sources": [85, 202, 231],
  "is-collections": [184, 137, 232],
});

function normalizeComputedCssColor(value) {
  const input = String(value || "").trim().toLowerCase();
  const clampByte = (channel) => Math.max(0, Math.min(255, Math.round(channel)));
  const normalizeAlpha = (alpha = 1) => Math.max(0, Math.min(1, Number(alpha.toFixed(4))));
  const parseAlpha = (part = "1") => part.endsWith("%") ? Number.parseFloat(part) / 100 : Number.parseFloat(part);
  const format = (channels, alpha = 1) => {
    const [red, green, blue] = channels.map(clampByte);
    const normalizedAlpha = normalizeAlpha(alpha);
    return normalizedAlpha === 1
      ? "rgb(" + red + ", " + green + ", " + blue + ")"
      : "rgba(" + red + ", " + green + ", " + blue + ", " + normalizedAlpha + ")";
  };

  const hexMatch = input.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1].length === 3
      ? [...hexMatch[1]].map((character) => character + character).join("")
      : hexMatch[1];
    return format([0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16)));
  }

  const srgbMatch = input.match(/^color\(srgb\s+(.+)\)$/);
  if (srgbMatch) {
    const [channelSource, alphaSource = "1"] = srgbMatch[1].split(/\s*\/\s*/);
    const parts = channelSource.trim().split(/\s+/);
    if (parts.length !== 3) throw new Error("Unsupported color(srgb) value: " + value);
    const channels = parts.map((part) => part.endsWith("%") ? Number.parseFloat(part) * 2.55 : Number.parseFloat(part) * 255);
    return format(channels, parseAlpha(alphaSource));
  }

  const rgbMatch = input.match(/^rgba?\((.+)\)$/);
  if (rgbMatch) {
    const [channelSource, slashAlpha] = rgbMatch[1].split(/\s*\/\s*/);
    const parts = channelSource.trim().split(/[\s,]+/).filter(Boolean);
    const alphaSource = slashAlpha || (parts.length === 4 ? parts.pop() : "1");
    if (parts.length !== 3) throw new Error("Unsupported rgb() value: " + value);
    const channels = parts.map((part) => part.endsWith("%") ? Number.parseFloat(part) * 2.55 : Number.parseFloat(part));
    return format(channels, parseAlpha(alphaSource));
  }

  throw new Error("Unsupported computed CSS color: " + value);
}

function getExpectedSeedVaultOverviewColor(tone) {
  const channels = SEED_VAULT_ENTITY_RGB[tone];
  if (!channels) throw new Error("Unknown Seed Vault overview tone: " + tone);
  const mixed = channels.map((channel) => (channel * 0.88) + (255 * 0.12));
  return normalizeComputedCssColor("rgb(" + mixed.join(", ") + ")");
}

async function expectExactComputedCssColor(locator, property, expectedColor) {
  const actualColor = await locator.evaluate((element, cssProperty) => getComputedStyle(element).getPropertyValue(cssProperty), property);
  expect(normalizeComputedCssColor(actualColor)).toBe(normalizeComputedCssColor(expectedColor));
}


async function openScenarioPanel(page) {
  const launcher = page.locator("#developer-scenarios-launcher");
  await expect(launcher).toBeVisible();
  if ((await launcher.getAttribute("aria-expanded")) !== "true") {
    await launcher.click();
  }
  await expect(page.locator("#developer-scenarios-panel")).toBeVisible();
}

async function waitForDeveloperScenarioMode(page, expectedMode) {
  await expect.poll(async () => page.evaluate(() => ({
    mode: getDeveloperScenarioControlMode(),
    unified: isUnifiedDeveloperScenarioActive(),
  }))).toEqual({ mode: expectedMode, unified: expectedMode === "unified" });
}

async function useMixAndMatch(page) {
  await openScenarioPanel(page);
  const modeButton = page.getByRole("button", { name: "Mix & Match", exact: true });
  await expect(modeButton).toBeVisible();
  await expect(modeButton).toBeEnabled();
  await modeButton.click();
  await waitForDeveloperScenarioMode(page, "mixed");
  await openScenarioPanel(page);
}

async function useFullGrowDemo(page) {
  await openScenarioPanel(page);
  const modeButton = page.getByRole("button", { name: "Full Grow Demo", exact: true });
  await expect(modeButton).toBeVisible();
  await expect(modeButton).toBeEnabled();
  await modeButton.click();
  await waitForDeveloperScenarioMode(page, "unified");
  await expect(page.locator("#developer-scenarios-banner")).toContainText("FULL GROW DEMO");
}

async function closeScenarioPanel(page) {
  const launcher = page.locator("#developer-scenarios-launcher");
  if ((await launcher.getAttribute("aria-expanded")) === "true") await launcher.click();
  await expect(page.locator("#developer-scenarios-panel")).toBeHidden();
}

async function getReadySeedVaultFilter(page, selector) {
  const filter = page.locator(`#my-seed-vault .seed-vault-controls ${selector}`);
  if (await filter.count() === 0) return null;
  await expect(filter).toHaveCount(1);
  await expect(filter).toBeVisible();
  await expect(filter).toBeEnabled();
  return filter;
}

async function waitForSeedVaultInventoryState(page, expectedTotal = 50) {
  await expect.poll(async () => {
    const cardCount = await page.locator("#my-seed-vault .seed-vault-entry-card").count();
    const resultsText = await page.locator("#my-seed-vault .seed-vault-results-count").textContent();
    const countMatch = String(resultsText || "").match(/(\d+) of (\d+) Vault Entries/);
    const matchingCount = Number(countMatch?.[1]);
    return Boolean(countMatch && cardCount === Math.min(10, matchingCount) && Number(countMatch[2]) === expectedTotal);
  }).toBe(true);
}

async function revealAllSeedVaultListRows(page) {
  const cards = page.locator("#my-seed-vault .seed-vault-entry-card");
  for (let batch = 0; batch < 10; batch += 1) {
    const showMore = page.locator("#my-seed-vault [data-seed-vault-show-more='true']");
    if (await showMore.count() === 0) return;
    const previousCount = await cards.count();
    await showMore.click();
    await expect.poll(async () => cards.count()).toBeGreaterThan(previousCount);
  }
  throw new Error("Seed Vault Show More did not complete within ten batches");
}

async function clearSeedVaultFiltersAndWait(page, resetSelector, resetValue = "all") {
  const clearFilters = page.locator('#my-seed-vault .seed-vault-controls [data-seed-vault-clear-filters="true"]');
  if (await clearFilters.count()) {
    await expect(clearFilters).toHaveCount(1);
    await expect(clearFilters).toBeVisible();
    await expect(clearFilters).toBeEnabled();
    await clearFilters.evaluate((button) => button.click());
  } else {
    const activeFilter = page.locator(`#my-seed-vault .seed-vault-controls ${resetSelector}`);
    await expect(activeFilter).toHaveCount(1);
    await expect(activeFilter).toBeVisible();
    await expect(activeFilter).toBeEnabled();
    await activeFilter.selectOption(resetValue);
  }
  const resetFilter = page.locator(`#my-seed-vault .seed-vault-controls ${resetSelector}`);
  await expect(resetFilter).toHaveCount(1);
  await expect(resetFilter).toHaveValue(resetValue);
  await expect(page.locator("#my-seed-vault .seed-vault-entry-card")).toHaveCount(10);
  await expect(page.locator("#my-seed-vault .seed-vault-results-count")).toContainText("50 of 50 Vault Entries");
}

async function expectNoFullGrowPlaceholders(page) {
  const placeholders = await page.locator("main").evaluate((root) => {
    const exactPlaceholders = new Set(["—", "--", "…", "Loading", "Loading...", "Loading…"]);
    const blockedPhrases = [/not enough data/i, /canonical data is not available/i, /global analytics is unavailable/i];
    return [...root.querySelectorAll("strong, span, p, small, td, dd")]
      .filter((element) => element.childElementCount === 0 && element.getClientRects().length > 0)
      .map((element) => String(element.textContent || "").replace(/\s+/g, " ").trim())
      .filter((text) => exactPlaceholders.has(text) || blockedPhrases.some((pattern) => pattern.test(text)));
  });
  expect(placeholders).toEqual([]);
}

test.describe("local Developer Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await enableFounderLocalQa(page);
  });

  test("authorizes local environments and only resolved hosted Founders", async ({ page }) => {
    await page.goto("/#home");
    const access = await page.evaluate(() => {
      const source = isApprovedDeveloperScenariosEnvironment.toString() + "\n" + canUseDeveloperScenarios.toString();
      const evaluate = ({ hostname, authReady = false, user = null, founderMembership = false, accessLevel = "none", explicitFlag = false }) => Function(
        "window",
        "appState",
        "getAdminAccessLevel",
        source + "; return canUseDeveloperScenarios();",
      )(
        { location: { hostname }, CANNAKAN_SUPABASE_CONFIG: { devPreviewDataEnabled: explicitFlag } },
        { authReady, authSession: user ? { user } : null, currentUserFounderMembership: founderMembership },
        () => ({ level: accessLevel }),
      );
      return {
        localhost: evaluate({ hostname: "localhost" }),
        founder: evaluate({ hostname: "grow.cannakan.com", authReady: true, user: { id: "founder" }, founderMembership: true, accessLevel: "founder" }),
        admin: evaluate({ hostname: "grow.cannakan.com", authReady: true, user: { id: "admin" }, accessLevel: "admin" }),
        normal: evaluate({ hostname: "grow.cannakan.com", authReady: true, user: { id: "normal" } }),
        anonymous: evaluate({ hostname: "grow.cannakan.com" }),
        loading: evaluate({ hostname: "grow.cannakan.com", user: { id: "founder" }, founderMembership: true, accessLevel: "founder" }),
        explicitFlag: evaluate({ hostname: "grow.cannakan.com", explicitFlag: true }),
      };
    });
    expect(access).toEqual({
      localhost: true,
      founder: true,
      admin: false,
      normal: false,
      anonymous: false,
      loading: false,
      explicitFlag: false,
    });
  });

  test("clears obsolete Dev Mode state while preserving Full Grow Demo", async ({ page }) => {
    await page.addInitScript(({ scenarioKey, legacyKeys }) => {
      legacyKeys.forEach((key) => localStorage.setItem(key, key.includes("Likes") ? "{}" : "true"));
      localStorage.setItem("cannakan-grow-sessions", JSON.stringify([
        { id: "live-local-session", sessionName: "Keep me" },
        { id: "mock-local-session", sessionName: "Remove me", devModeOnly: true, isMock: true },
      ]));
      localStorage.setItem(scenarioKey, JSON.stringify({
        enabled: true,
        mode: "unified",
        unifiedScenario: "full-grow-demo",
        selections: { seedVault: "live", sessions: "live", profile: "live", community: "live", explore: "live" },
      }));
    }, { scenarioKey: STORAGE_KEY, legacyKeys: LEGACY_STORAGE_KEYS });

    await page.goto("/#home");
    const state = await page.evaluate(({ scenarioKey, legacyKeys }) => ({
      legacyValues: legacyKeys.map((key) => localStorage.getItem(key)),
      scenarios: JSON.parse(localStorage.getItem(scenarioKey)),
      sessions: JSON.parse(localStorage.getItem("cannakan-grow-sessions") || "[]"),
    }), { scenarioKey: STORAGE_KEY, legacyKeys: LEGACY_STORAGE_KEYS });

    expect(state.legacyValues).toEqual(LEGACY_STORAGE_KEYS.map(() => null));
    expect(state.scenarios.mode).toBe("unified");
    expect(state.sessions.map((session) => session.id)).toEqual(["live-local-session"]);
    await expect(page.locator("#developer-scenarios-launcher")).toHaveCount(1);
    await expect(page.getByText("Mock Community Grow data", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Reset & Reseed Demo", { exact: true })).toHaveCount(0);
    await openScenarioPanel(page);
    await expect(page.getByRole("button", { name: "Full Grow Demo", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-developer-scenario-module]")).toHaveCount(0);
  });

  test("Shift+D only opens and closes the new controller", async ({ page }) => {
    await page.goto("/#home");
    await expect(page.locator("#developer-scenarios-launcher")).toContainText("Preview Studio");
    await expect(page.locator("#developer-scenarios-launcher")).toContainText("LIVE");
    await page.keyboard.press("Shift+D");
    await expect(page.locator("#developer-scenarios-panel")).toBeVisible();
    await expect(page.locator("#developer-scenarios-panel")).toHaveAttribute("aria-label", "Preview Studio");
    await expect(page.getByRole("group", { name: "Preview Mode", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Live Data", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#developer-scenarios-banner")).toHaveCount(0);
    await page.keyboard.press("Shift+D");
    await expect(page.locator("#developer-scenarios-panel")).toHaveCount(0);
    await expect(page.locator("#developer-scenarios-launcher")).toContainText("LIVE");
    await expect(page.locator("#developer-scenarios-banner")).toHaveCount(0);
  });
  test("Preview Studio stays within the viewport across responsive sizes", async ({ page }) => {
    test.slow();
    for (const viewport of [
      { width: 320, height: 760 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1280, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/#home");
      await useFullGrowDemo(page);
      await openScenarioPanel(page);

      const panel = page.locator("#developer-scenarios-panel");
      const layout = await panel.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          hasHorizontalOverflow: element.scrollWidth > element.clientWidth + 1,
        };
      });
      expect(layout.left).toBeGreaterThanOrEqual(0);
      expect(layout.right).toBeLessThanOrEqual(layout.innerWidth);
      expect(layout.top).toBeGreaterThanOrEqual(0);
      expect(layout.bottom).toBeLessThanOrEqual(layout.innerHeight);
      expect(layout.hasHorizontalOverflow).toBe(false);
      await expect(panel.getByText("Preview Studio", { exact: true })).toBeVisible();
      await expect(panel.getByText("Preview Mode", { exact: true })).toBeVisible();
      await expect(panel.locator(".developer-scenarios-full-demo-summary span")).toHaveCount(4);
    }
  });

  test("defaults to Live Data and restores it without a refresh", async ({ page }) => {
    await page.goto("/#sessions");
    await expect(page.locator("#developer-scenarios-launcher")).toContainText("LIVE");
    await expect(page.locator("#developer-scenarios-banner")).toHaveCount(0);
    await openScenarioPanel(page);
    await expect(page.getByRole("button", { name: "Live Data", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-developer-scenario-module]")).toHaveCount(0);
    await useFullGrowDemo(page);
    await expect(page.locator("#developer-scenarios-banner")).toHaveText("PREVIEW STUDIO — FULL GROW DEMO — SAMPLE DATA — NOTHING WILL BE SAVED");
    await expect(page.locator(".developer-scenario-page-badge")).toContainText("Full Grow Demo");
    await openScenarioPanel(page);
    const summary = page.locator(".developer-scenarios-full-demo-summary");
    await expect(summary.locator("span")).toHaveCount(4);
    await expect(summary).toContainText("38 Sources");
    await expect(summary).toContainText("91 Varieties");
    await expect(summary).toContainText("50 Vault Entries");
    await expect(summary).toContainText("30 Community Reports");
    await expect(page.getByRole("button", { name: "Full Grow Demo", exact: true })).toContainText("(Recommended)");

    await openScenarioPanel(page);
    await page.getByRole("button", { name: "Return to Live Data", exact: true }).click();
    await expect(page.locator("#developer-scenarios-banner")).toHaveCount(0);
    await expect(page.locator(".developer-scenario-page-badge")).toHaveCount(0);
    await expect(page.locator("#developer-scenarios-launcher")).toContainText("LIVE");
    await openScenarioPanel(page);
    await expect(page.getByRole("button", { name: "Live Data", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-developer-scenario-module]")).toHaveCount(0);
  });

  test("migrates legacy module choices to Mix & Match and masks them in Full Grow Demo", async ({ page }) => {
    const legacySelections = { seedVault: "collector", sessions: "mixed", profile: "founding-grower", community: "featured", explore: "strong-attribution" };
    await page.addInitScript(({ key, selections }) => {
      localStorage.setItem(key, JSON.stringify({ enabled: true, selections }));
    }, { key: STORAGE_KEY, selections: legacySelections });

    await page.goto("/#home");
    await openScenarioPanel(page);
    await expect(page.getByRole("button", { name: "Mix & Match", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-developer-scenario-module]")).toHaveCount(5);
    await expect(page.locator("select[data-developer-scenario-module='explore']")).toHaveValue("strong-attribution");
    await expect(page.getByText("Choose a presentation state for each module. Some states intentionally contain sparse or empty data.", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Full Grow Demo", exact: true }).click();
    await openScenarioPanel(page);
    await expect(page.locator("[data-developer-scenario-module]")).toHaveCount(0);
    const unifiedState = await page.evaluate((key) => ({
      effectiveSelections: DEVELOPER_SCENARIO_MODULES.map((moduleName) => getDeveloperScenarioSelection(moduleName)),
      stored: JSON.parse(localStorage.getItem(key)),
    }), STORAGE_KEY);
    expect(unifiedState.effectiveSelections).toEqual(["live", "live", "live", "live", "live"]);
    expect(unifiedState.stored.mode).toBe("unified");
    expect(unifiedState.stored.selections).toMatchObject(legacySelections);

    await page.getByRole("button", { name: "Mix & Match", exact: true }).click();
    await openScenarioPanel(page);
    await expect(page.locator("select[data-developer-scenario-module='seedVault']")).toHaveValue("collector");
    await expect(page.locator("select[data-developer-scenario-module='sessions']")).toHaveValue("mixed");
    await expect(page.locator("select[data-developer-scenario-module='explore']")).toHaveValue("strong-attribution");
  });

  test("Full Grow Demo synchronizes sessions, Vault, Profile, and Community", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    await page.goto("/#home");
    await useFullGrowDemo(page);
    await expect(page.locator(".developer-scenario-page-badge")).toContainText("Full Grow Demo");
    await expect(page.getByRole("heading", { name: "Other Active Sessions" })).toBeVisible();
    await expect(page.locator("main")).toContainText("3 sessions");
    await expect(page.locator(".home-seed-vault-card")).toContainText("50");
    await expect(page.locator(".home-seed-vault-card")).toContainText("265");
    await expect(page.locator(".home-seed-vault-card")).toContainText("22");
    await expectNoFullGrowPlaceholders(page);

    await page.goto("/#sessions");
    await expect(page.locator("main")).toContainText("Filter papers remaining: 84");
    await expectNoFullGrowPlaceholders(page);
    const graphSummary = await page.evaluate(() => {
      const graph = getFullGrowDemoGraph();
      return {
        sessions: graph.sessions.length,
        active: graph.activeSessions.length,
        ready: graph.activeSessions.filter((session) => session.isReadyToComplete).length,
        completed: graph.completedSessions.length,
        drafts: graph.draftSessions.length,
        archived: graph.archivedSessions.length,
        totalSessionRecords: graph.sessions.length + graph.draftSessions.length,
        vaultEntries: graph.vaultEntries.length,
        vaultSeeds: graph.vaultAnalytics.overview.totalSeedsOwned,
        vaultSources: graph.vaultAnalytics.overview.totalSources,
        sources: graph.sources.length,
        varieties: graph.varieties.length,
        approvedCommunity: graph.communitySnapshots.length,
        pendingCommunity: graph.communityPendingSnapshots.length,
        collections: graph.collections.length,
        evidenceSessions: graph.exploreEvidenceSessions.length,
        evidenceSeeds: graph.exploreEvidenceSessions.reduce((sum, session) => sum + session.totalSeeds, 0),
        evidenceGerminated: graph.exploreEvidenceSessions.reduce((sum, session) => sum + session.totalGerminated, 0),
        kanEvidence: graph.exploreEvidenceSessions.filter((session) => session.method === "KAN").length,
        completedKan: graph.completedSessions.filter((session) => session.systemType === "KAN").length,
        approvedKan: graph.communitySnapshots.filter((snapshot) => snapshot.systemType === "KAN").length,
        completeKanReports: graph.communitySnapshots.filter((snapshot) => snapshot.systemType === "KAN" && snapshot.documentationLevel === "complete" && snapshot.notes).length,
        kanCommunityImages: graph.communitySnapshots.filter((snapshot) => snapshot.systemType === "KAN" && snapshot.imageUrl).length,
        alternativeCommunityImages: graph.communitySnapshots.filter((snapshot) => snapshot.systemType !== "KAN" && snapshot.imageUrl).length,
        completeKanDocumentation: graph.exploreEvidenceSessions.filter((session) => session.method === "KAN" && session.documentationLevel === "complete").length,
        kanEvidenceImages: graph.exploreEvidenceSessions.filter((session) => session.method === "KAN" && session.imageUrl).length,
        alternativeEvidenceImages: graph.exploreEvidenceSessions.filter((session) => session.method !== "KAN" && session.imageUrl).length,
        sessionImages: [...graph.sessions, ...graph.draftSessions].filter((session) => session.sessionImages.length).length,
        vaultImages: graph.vaultEntries.filter((entry) => entry.varietyImageUrl || entry.thumbnailUrl).length,
        evidenceImages: graph.exploreEvidenceSessions.filter((session) => session.imageUrl).length,
        communityImages: graph.communitySnapshots.filter((snapshot) => snapshot.imageUrl).length,
        profileCompleted: graph.profileAnalytics.completedSessions,
        profileActive: graph.profileAnalytics.activeSessions,
        profileVaultEntries: graph.profileAnalytics.seedVault.overview.totalVarieties,
        profileVaultSeeds: graph.profileAnalytics.seedVault.overview.totalSeedsOwned,
        recognitions: graph.recognition.recognitions.length,
        kanRecognitions: graph.recognition.recognitions.filter((recognition) => recognition.method === "KAN").length,
        networkGrowers: graph.network.growers.length,
        methods: [...graph.activeSessions, ...graph.completedSessions, ...graph.draftSessions, ...graph.archivedSessions].map((session) => session.systemType),
        rockwoolPersonalSessions: [...graph.activeSessions, ...graph.completedSessions, ...graph.draftSessions, ...graph.archivedSessions].filter((session) => session.systemType === "ROCKWOOL").length,
        rockwoolEvidenceSessions: graph.exploreEvidenceSessions.filter((session) => session.method === "ROCKWOOL").length,
        rockwoolCommunityReports: graph.communitySnapshots.filter((snapshot) => snapshot.systemType === "ROCKWOOL").length,
        traPresentationRecords: [
          ...graph.activeSessions.map((session) => session.systemType),
          ...graph.completedSessions.map((session) => session.systemType),
          ...graph.draftSessions.map((session) => session.systemType),
          ...graph.archivedSessions.map((session) => session.systemType),
          ...graph.exploreEvidenceSessions.map((session) => session.method),
          ...graph.communitySnapshots.map((snapshot) => snapshot.systemType),
          ...graph.communityPendingSnapshots.map((snapshot) => snapshot.systemType),
        ].filter((method) => method === "TRA").length,
        evidenceMethods: graph.exploreEvidenceSessions.reduce((counts, session) => {
          counts[session.method] = (counts[session.method] || 0) + 1;
          return counts;
        }, {}),
      };
    });
    expect(graphSummary).toMatchObject({
      sessions: 21,
      active: 4,
      ready: 1,
      completed: 15,
      drafts: 2,
      archived: 2,
      totalSessionRecords: 23,
      vaultEntries: 50,
      vaultSeeds: 265,
      vaultSources: 22,
      sources: 38,
      varieties: 91,
      approvedCommunity: 30,
      pendingCommunity: 6,
      collections: 11,
      evidenceSessions: 180,
      evidenceSeeds: 4230,
      evidenceGerminated: 3773,
      kanEvidence: 144,
      completedKan: 12,
      approvedKan: 23,
      completeKanReports: 23,
      kanCommunityImages: 19,
      alternativeCommunityImages: 2,
      completeKanDocumentation: 144,
      kanEvidenceImages: 101,
      alternativeEvidenceImages: 3,
      sessionImages: 17,
      vaultImages: 38,
      evidenceImages: 104,
      profileCompleted: 15,
      profileActive: 4,
      profileVaultEntries: 50,
      profileVaultSeeds: 265,
      recognitions: 12,
      kanRecognitions: 3,
      networkGrowers: 7,
      rockwoolPersonalSessions: 3,
      rockwoolEvidenceSessions: 13,
      rockwoolCommunityReports: 2,
      traPresentationRecords: 0,
      evidenceMethods: { KAN: 144, ROCKWOOL: 13, PAPER_TOWEL: 7, RAPID_ROOTER: 4, WATER_SOAK: 4, DIRECT_SOW: 4, OTHER: 4 },
    });
    expect(graphSummary.communityImages).toBeGreaterThan(15);
    expect(graphSummary.communityImages).toBeLessThan(30);
    expect(new Set(graphSummary.methods)).toEqual(new Set(["KAN", "PAPER_TOWEL", "ROCKWOOL", "RAPID_ROOTER", "WATER_SOAK", "DIRECT_SOW", "OTHER"]));
    await expect(page.locator("[data-session-history-row^='scenario-full-grow-session-']")).toHaveCount(6);
    const historyToggle = page.locator("[data-session-history-toggle='true']");
    if (await historyToggle.getAttribute("aria-expanded") !== "true") await historyToggle.click();
    while (await page.locator("[data-session-history-see-more='true']").count()) {
      await page.locator("[data-session-history-see-more='true']").click();
    }
    await expect(page.locator("[data-session-history-row^='scenario-full-grow-session-']")).toHaveCount(23);
    await expect(page.locator("#session-history")).toContainText("4 active");
    await expect(page.locator("#session-history")).toContainText("15 completed");
    await expect(page.locator("#session-history")).toContainText("2 drafts");
    await expect(page.locator("#session-history")).toContainText("2 archived");
    const historyRows = page.locator("[data-session-history-row^='scenario-full-grow-session-']");
    await expect(page.locator(".session-history-table-head > span")).toHaveText([
      "SESSION",
      "DATE",
      "SOURCE",
      "METHOD",
      "STATUS",
      "SEEDS",
      "GERMINATION",
      "ACTIONS",
    ]);
    await expect(historyRows.locator("[data-label='Variety']")).toHaveCount(0);
    await expect(historyRows.locator("[data-label='Source'] strong")).toHaveCount(23);
    await expect(historyRows.locator("[data-label='Source'] strong").filter({ hasText: "Seedsman" }).first()).toBeVisible();
    const methodBadges = historyRows.locator("[data-session-history-method]");
    const methodColumnBadges = historyRows.locator("[data-session-history-method-column]");
    await expect(methodBadges).toHaveCount(23);
    await expect(methodColumnBadges).toHaveCount(23);
    await expect(methodBadges.filter({ hasText: /^KAN • Unit / }).first()).toBeVisible();
    await expect(historyRows.locator("[data-session-history-method='TRA']")).toHaveCount(0);
    for (const methodType of ["KAN", "PAPER_TOWEL", "ROCKWOOL", "RAPID_ROOTER", "WATER_SOAK", "DIRECT_SOW", "OTHER"]) {
      await expect(historyRows.locator(`[data-session-history-method='${methodType}']`).first()).toBeVisible();
    }
    await expect(methodBadges.filter({ hasText: "Paper Towel" }).first()).toBeVisible();
    await expect(methodBadges.filter({ hasText: "Rockwool" }).first()).toBeVisible();
    await expect(methodBadges.filter({ hasText: "Starter Plug" }).first()).toBeVisible();
    await expect(methodBadges.filter({ hasText: "Water Soak" }).first()).toBeVisible();
    await expect(methodBadges.filter({ hasText: "Direct Sow" }).first()).toBeVisible();
    await expect(methodBadges.filter({ hasText: "Custom" }).first()).toBeVisible();
    await expect(historyRows.locator(".session-history-session-title").filter({ hasText: / Demo$/ })).toHaveCount(0);
    for (const width of [1280, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(methodBadges.first()).toBeVisible();
      await expect(methodColumnBadges.first()).toBeVisible();
      const overflowingRows = await historyRows.evaluateAll((rows) => rows
        .filter((row) => row.scrollWidth > row.clientWidth + 1)
        .map((row) => row.getAttribute("data-session-history-row")));
      expect(overflowingRows).toEqual([]);
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator("main")).toContainText("PAPER_TOWEL");
    await expect(page.locator("main")).toContainText("Rockwool");
    await page.goto("/#sessions/scenario-full-grow-session-18");
    await expect(page.locator("#detail-session-result-breakdown")).toBeVisible();
    await expect(page.locator("#detail-session-result-breakdown")).not.toContainText("Pending");

    await page.goto("/#seed-vault");
    await expect(page.locator("#my-seed-vault")).toContainText("50 Vault Entries");
    await expect(page.locator("#my-seed-vault")).toContainText("265");
    await expect(page.locator("#my-seed-vault")).toContainText("22");
    await expect(page.locator(".seed-vault-overview-collections")).toContainText("Favorites");
    await expectNoFullGrowPlaceholders(page);

    await page.goto("/#network");
    await expect(page.locator(".grow-network-page")).toContainText("Morgan Green");
    await expect(page.locator(".grow-network-page")).toContainText("Founding Grower");
    await expect(page.getByRole("heading", { name: "Germination Trend" })).toBeVisible();
    await expect(page.locator(".grow-network-page")).not.toContainText("Complete a session and record results to begin");
    await expectNoFullGrowPlaceholders(page);

    await page.goto("/#gallery");
    await expect(page.locator("#gallery-grid .gallery-card")).toHaveCount(12);
    await expect(page.getByRole("heading", { name: "Scenario Community Analytics" })).toBeVisible();
    await expect(page.locator("main")).not.toContainText("Loading");
    await expectNoFullGrowPlaceholders(page);
    expect(consoleErrors).toEqual([]);
  });

  test("Full Grow Demo always features the preferred active KAN session", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.goto("/#home");
    await useFullGrowDemo(page);
    await closeScenarioPanel(page);

    const currentSession = page.locator("[data-home-current-session-companion='true']");
    await expect(currentSession).toHaveCount(1);
    await expect(currentSession).toBeVisible();
    await expect(currentSession).toContainText("KAN");
    await expect(currentSession).not.toContainText("ROCKWOOL");
    await expect(currentSession).not.toContainText("Keep Cubes Moist");

    const continueSession = currentSession.getByRole("link", { name: "Continue Session", exact: true });
    await expect(continueSession).toHaveAttribute("href", "#sessions/scenario-full-grow-session-18");

    const otherActiveCards = page.locator("[data-home-current-session-select]");
    await expect(otherActiveCards).toHaveCount(3);
    const rockwoolCard = otherActiveCards.filter({ hasText: "ROCKWOOL" });
    await expect(rockwoolCard).toHaveCount(1);
    await expect(rockwoolCard).toContainText("Blue Ridge Berry Rockwool Demo");
    await expect(otherActiveCards.filter({ hasText: "Jack Herer KAN Demo" })).toHaveCount(0);

    const orderingAudit = await page.evaluate(() => {
      const featuredHref = document.querySelector("[data-home-current-session-companion='true'] a[href^='#sessions/']")?.getAttribute("href") || "";
      const featuredId = featuredHref.replace(/^#sessions\//, "");
      const otherIds = [...document.querySelectorAll("[data-home-current-session-select]")]
        .map((card) => card.getAttribute("data-home-current-session-select"));
      const activeSessions = getFullGrowDemoGraph().activeSessions;
      const featuredSession = activeSessions.find((session) => session.id === featuredId) || null;
      return {
        activeCount: activeSessions.length,
        renderedIds: [featuredId, ...otherIds],
        uniqueRenderedCount: new Set([featuredId, ...otherIds]).size,
        featuredName: featuredSession?.sessionName || "",
        featuredMethod: featuredSession?.systemType || "",
        featuredLifecycle: featuredSession ? normalizeGrowSessionLifecycleState(featuredSession) : "",
      };
    });
    expect(orderingAudit).toEqual({
      activeCount: 4,
      renderedIds: [
        "scenario-full-grow-session-18",
        "scenario-full-grow-session-19",
        "scenario-full-grow-session-17",
        "scenario-full-grow-session-16",
      ],
      uniqueRenderedCount: 4,
      featuredName: "Jack Herer KAN Demo",
      featuredMethod: "KAN",
      featuredLifecycle: "active",
    });

    await continueSession.click();
    await expect(page).toHaveURL(/#sessions\/scenario-full-grow-session-18$/);
    await expect(page.locator("main")).toContainText("Jack Herer");
    expect(consoleErrors).toEqual([]);
  });
  test("Full Grow Demo enforces one provider identity across every scenario module", async ({ page }) => {
    await page.goto("/#home");
    await useFullGrowDemo(page);
    const providerChecks = [
      ["sessions", "sessions"],
      ["profile", "profile"],
      ["gallery", "community"],
      ["seeds", "explore"],
      ["seed-vault", "seedVault"],
    ];
    for (const [route, moduleName] of providerChecks) {
      await page.goto(`/#${route}`);
      const provider = await page.evaluate((name) => {
        const providers = {
          sessions: () => getSessionProvider(),
          profile: () => getProfileProvider(),
          community: () => getCommunityProvider(),
          explore: () => getExploreProvider(),
          seedVault: () => getActiveSeedVaultProvider(),
        };
        const resolved = providers[name]();
        return { id: resolved.id, label: resolved.label, isPreview: resolved.isPreview };
      }, moduleName);
      expect(provider).toEqual({ id: "full-grow-demo", label: "Full Grow Demo", isPreview: true });
      await expect(page.locator(".developer-scenario-page-badge")).toHaveText("Full Grow Demo");
    }

    const mismatchCode = await page.evaluate(() => {
      try {
        assertUnifiedDeveloperScenarioProvider("test", { id: "partial-module-fixture", label: "Wrong", isPreview: true });
        return "";
      } catch (error) {
        return error.code;
      }
    });
    expect(mismatchCode).toBe("DEVELOPER_SCENARIO_UNIFIED_PROVIDER_MISMATCH");
  });

  test("Seed Vault Hero uses the approved unique semantic icons", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.goto("/#home");
    await useFullGrowDemo(page);
    await page.goto("/#seed-vault");

    const hero = page.locator(".seed-vault-approved-hero");
    await expect(hero).toBeVisible();
    const titleIcon = hero.locator("[data-seed-vault-title-icon='vault']");
    await expect(titleIcon).toBeVisible();
    await expect(titleIcon.locator("svg")).toHaveCount(1);

    const metricIcons = hero.locator("[data-seed-vault-hero-metric-icon]");
    await expect(metricIcons).toHaveCount(4);
    expect(await metricIcons.evaluateAll((nodes) => nodes.map((node) => node.dataset.seedVaultHeroMetricIcon))).toEqual([
      "leaf",
      "seed",
      "sourceCompanyBuilding",
      "collection",
    ]);
    const sourceBuilding = hero.locator(".seed-vault-overview-stat.is-sources[data-seed-vault-hero-metric-icon='sourceCompanyBuilding']");
    await expect(sourceBuilding).toBeVisible();
    await expect(sourceBuilding.locator("[data-building-shell='true']")).toHaveCount(1);
    await expect(sourceBuilding.locator("[data-building-roofline='true']")).toHaveCount(1);
    await expect(sourceBuilding.locator("[data-building-window-columns='true']")).toHaveCount(1);
    await expect(sourceBuilding.locator("[data-building-entry='true']")).toHaveCount(1);
    await expect(sourceBuilding.locator("[data-building-base='true']")).toHaveCount(1);
    await expect(page.locator(".seed-vault-planning-destination.is-testing[data-seed-vault-planning-icon='flask']")).toBeVisible();

    const iconGeometry = await hero.locator("[data-seed-vault-title-icon], [data-seed-vault-hero-metric-icon] .seed-vault-overview-stat-icon").evaluateAll((nodes) => nodes.map((node) => {
      const svg = node.querySelector("svg");
      const container = node.getBoundingClientRect();
      const graphic = svg?.getBoundingClientRect();
      return {
        svgCount: node.querySelectorAll("svg").length,
        viewBox: svg?.getAttribute("viewBox") || "",
        visible: Boolean(graphic?.width && graphic?.height),
        contained: Boolean(graphic && graphic.left >= container.left - 1 && graphic.top >= container.top - 1 && graphic.right <= container.right + 1 && graphic.bottom <= container.bottom + 1),
      };
    }));
    expect(iconGeometry).toHaveLength(5);
    expect(iconGeometry.every((icon) => icon.svgCount === 1 && icon.viewBox === "0 0 24 24" && icon.visible && icon.contained)).toBe(true);
    const metricPresentation = await metricIcons.first().locator(".seed-vault-overview-stat-icon").evaluate((node) => {
      const box = node.getBoundingClientRect();
      const svgBox = node.querySelector("svg").getBoundingClientRect();
      const shape = node.querySelector("svg :is(path, circle, rect, line, polyline, polygon)");
      return {
        containerWidth: box.width,
        containerHeight: box.height,
        glyphWidth: svgBox.width,
        strokeWidth: Number.parseFloat(getComputedStyle(shape).strokeWidth),
      };
    });
    expect(metricPresentation.containerWidth).toBe(54);
    expect(metricPresentation.containerHeight).toBe(54);
    expect(metricPresentation.glyphWidth).toBeGreaterThanOrEqual(38);
    expect(metricPresentation.strokeWidth).toBeGreaterThanOrEqual(2.4);
    expect(consoleErrors).toEqual([]);
  });

  test("Seed Vault 3.0 preserves premium browsing and every inventory control", async ({ page }) => {
    test.setTimeout(60_000);
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.goto("/#seed-vault");
    await useFullGrowDemo(page);
    await closeScenarioPanel(page);

    await expect(page.locator(".seed-vault-approved-hero")).toContainText("My Seed Vault");
    await expect(page.locator(".seed-vault-approved-hero")).toContainText("Collect. Learn. Plan. Grow.");
    await expect(page.locator(".seed-vault-overview-snapshot .seed-vault-overview-stat")).toHaveCount(4);
    await expect(page.locator(".seed-vault-overview-primary-grid")).toBeVisible();
    await expect(page.locator(".seed-vault-overview-engagement-grid")).toBeVisible();
    await expect(page.locator(".seed-vault-living-dashboard, .seed-vault-collection-layout")).toHaveCount(0);

    const inventoryCards = page.locator("#my-seed-vault .seed-vault-entry-card");
    await expect(inventoryCards).toHaveCount(10);
    await expect(page.locator(".seed-vault-expanded-profile")).toHaveCount(0);
    await expect(page.locator(".seed-vault-entry-details--lazy")).toHaveCount(10);

    const firstCard = inventoryCards.first();
    const firstVisualBox = await firstCard.locator("[data-seed-vault-quick-peek]").boundingBox();
    expect(firstVisualBox.width).toBeGreaterThanOrEqual(74);
    expect(firstVisualBox.height).toBeGreaterThanOrEqual(68);
    await expect(firstCard.locator(".seed-vault-entry-insight-strip")).toContainText("Seeds");
    await expect(firstCard.locator(".seed-vault-entry-insight-strip")).toContainText("Acquired");
    await expect(firstCard.getByRole("button", { name: /Favorite Vault Entry|Remove Vault Entry from favorites/ })).toBeVisible();

    await firstCard.locator("[data-seed-vault-quick-peek]").click();
    await expect(page.getByRole("dialog", { name: /.+/ })).toBeVisible();
    await expect(page.locator(".seed-vault-quick-peek-content")).toContainText("Available");
    await expect(page.locator(".seed-vault-quick-peek-content")).toContainText("Seed Age");
    await page.getByRole("button", { name: "Close Quick Peek", exact: true }).click();

    await firstCard.locator("summary[data-seed-vault-more]").click();
    await firstCard.getByRole("menuitem", { name: "Open Entry Profile", exact: true }).click();
    await expect(page.locator(".seed-vault-expanded-profile")).toHaveCount(1);
    await expect(page.locator(".seed-vault-entry-details--lazy")).toHaveCount(9);
    const profile = firstCard.locator(".seed-vault-expanded-profile");
    for (const sectionName of ["Overview", "Planning & Collections", "Sessions & Analytics", "Notes", "Images"]) {
      await expect(profile).toContainText(sectionName);
    }
    await firstCard.getByRole("button", { name: "Close Entry Profile", exact: true }).click();
    await expect(page.locator(".seed-vault-entry-details--lazy")).toHaveCount(10);

    const showMore = page.locator("#my-seed-vault [data-seed-vault-show-more='true']");
    await expect(showMore).toBeVisible();
    await expect(showMore).toBeEnabled();
    await showMore.click();
    await expect(inventoryCards).toHaveCount(20);
    await expect(page.locator(".seed-vault-entry-details--lazy")).toHaveCount(20);
    await revealAllSeedVaultListRows(page);
    await expect(inventoryCards).toHaveCount(50);
    await expect(page.locator(".seed-vault-entry-details--lazy")).toHaveCount(50);
    await expect(page.locator("#my-seed-vault [data-seed-vault-show-more='true']")).toHaveCount(0);

    await page.locator('[data-seed-vault-quick-view="favorites"]').click();
    await expect(page.locator(".seed-vault-browse-context")).toContainText("Favorites");
    await expect(page.locator(".seed-vault-browse-context")).toContainText("10 matching Vault Entries");
    await expect(inventoryCards).toHaveCount(10);
    await page.getByRole("button", { name: "View All Inventory", exact: true }).click();
    await waitForSeedVaultInventoryState(page);
    await expect(inventoryCards).toHaveCount(10);

    let inventorySearch = await getReadySeedVaultFilter(page, '[data-seed-vault-search="true"]');
    await inventorySearch.fill("Do-Si-Dos");
    inventorySearch = await getReadySeedVaultFilter(page, '[data-seed-vault-search="true"]');
    await expect(inventorySearch).toHaveValue("Do-Si-Dos");
    await expect(inventoryCards).toHaveCount(1);
    await page.locator('.seed-vault-sort-control [data-seed-vault-sort="true"]').selectOption("quantity");
    await expect(page.locator('.seed-vault-sort-control [data-seed-vault-sort="true"]')).toHaveValue("quantity");
    inventorySearch = await getReadySeedVaultFilter(page, '[data-seed-vault-search="true"]');
    await inventorySearch.fill("");
    await expect(await getReadySeedVaultFilter(page, '[data-seed-vault-search="true"]')).toHaveValue("");
    const favoriteFilter = await getReadySeedVaultFilter(page, '[data-seed-vault-favorite-filter="true"]');
    await favoriteFilter.selectOption("favorites");
    await expect(await getReadySeedVaultFilter(page, '[data-seed-vault-favorite-filter="true"]')).toHaveValue("favorites");
    await expect(inventoryCards).toHaveCount(10);
    await clearSeedVaultFiltersAndWait(page, '[data-seed-vault-favorite-filter="true"]');

    const moreFiltersSummary = page.locator("#my-seed-vault .seed-vault-more-filters > summary");
    await expect(moreFiltersSummary).toBeVisible();
    await expect(moreFiltersSummary).toBeEnabled();
    await moreFiltersSummary.click();
    await expect(page.locator("#my-seed-vault .seed-vault-more-filters-panel")).toBeVisible();
    await expect(page.locator("#my-seed-vault .seed-vault-more-filters-panel [data-seed-vault-manage-collections='true']")).toBeVisible();
    const sourceSelector = '[data-seed-vault-source-filter="true"]';
    const sourceFilter = await getReadySeedVaultFilter(page, sourceSelector);
    expect(sourceFilter).not.toBeNull();
    const firstSourceValue = await sourceFilter.locator("option").nth(1).getAttribute("value");
    expect(firstSourceValue).toBeTruthy();
    await sourceFilter.selectOption(firstSourceValue);
    await expect(await getReadySeedVaultFilter(page, sourceSelector)).toHaveValue(firstSourceValue);
    await expect.poll(async () => inventoryCards.count()).toBeLessThan(50);
    await clearSeedVaultFiltersAndWait(page, sourceSelector);

    const filterCases = [
      { selector: '[data-seed-vault-status-filter="true"]', advanced: false, resetValue: "all" },
      { selector: '[data-seed-vault-collection-filter="true"]', advanced: false },
      { selector: '[data-seed-vault-tag-filter="true"]', advanced: false },
      { selector: '[data-seed-vault-breeder-filter="true"]', advanced: true },
      { selector: '[data-seed-vault-type-filter="true"]', advanced: true },
      { selector: '[data-seed-vault-sex-filter="true"]', advanced: true },
      { selector: '[data-seed-vault-age-filter="true"]', advanced: true },
      { selector: '[data-seed-vault-grow-along-filter="true"]', advanced: true },
      { selector: '[data-seed-vault-testing-program-filter="true"]', advanced: true },
      { selector: '[data-seed-vault-planning-status-filter="true"]', advanced: true },
    ];
    for (const filterCase of filterCases) {
      if (filterCase.advanced && !await page.locator("#my-seed-vault .seed-vault-more-filters-panel").isVisible()) {
        const summary = page.locator("#my-seed-vault .seed-vault-more-filters > summary");
        await expect(summary).toBeVisible();
        await expect(summary).toBeEnabled();
        await summary.click();
        await expect(page.locator("#my-seed-vault .seed-vault-more-filters-panel")).toBeVisible();
      }
      const renderedFilter = page.locator(`#my-seed-vault .seed-vault-controls ${filterCase.selector}`);
      if (await renderedFilter.count() === 0) continue;

      const filter = await getReadySeedVaultFilter(page, filterCase.selector);
      if (!filter) continue;
      const optionValue = await filter.locator("option").nth(1).getAttribute("value");
      expect(optionValue).toBeTruthy();
      await filter.selectOption(optionValue);
      const selectedFilter = page.locator(`#my-seed-vault .seed-vault-controls ${filterCase.selector}`);
      await expect(selectedFilter).toHaveCount(1);
      await expect(selectedFilter).toBeVisible();
      await expect(selectedFilter).toBeEnabled();
      await expect(selectedFilter).toHaveValue(optionValue);
      await waitForSeedVaultInventoryState(page);
      await clearSeedVaultFiltersAndWait(page, filterCase.selector, filterCase.resetValue || "all");
    }

    await page.locator('[data-seed-vault-layout="gallery"]').click();
    await expect(page.locator(".seed-vault-entry-grid")).toHaveClass(/seed-vault-entry-grid--gallery/);
    await page.locator('[data-seed-vault-layout="list"]').click();
    await expect(page.locator(".seed-vault-entry-grid")).toHaveClass(/seed-vault-entry-grid--list/);

    await useMixAndMatch(page);
    let seedVaultScenario = page.locator("select[data-developer-scenario-module='seedVault']");
    await expect(seedVaultScenario).toBeVisible();
    await expect(seedVaultScenario).toBeEnabled();
    await seedVaultScenario.selectOption("empty");
    seedVaultScenario = page.locator("select[data-developer-scenario-module='seedVault']");
    await expect(seedVaultScenario).toHaveValue("empty");
    await expect(inventoryCards).toHaveCount(0);
    await expect(page.locator(".seed-vault-approved-hero")).toBeVisible();
    await expect(page.locator(".seed-vault-library-shell")).toBeVisible();
    await openScenarioPanel(page);
    seedVaultScenario = page.locator("select[data-developer-scenario-module='seedVault']");
    await expect(seedVaultScenario).toBeVisible();
    await expect(seedVaultScenario).toBeEnabled();
    await seedVaultScenario.selectOption("small");
    seedVaultScenario = page.locator("select[data-developer-scenario-module='seedVault']");
    await expect(seedVaultScenario).toHaveValue("small");
    await expect(inventoryCards).toHaveCount(3);
    await openScenarioPanel(page);
    seedVaultScenario = page.locator("select[data-developer-scenario-module='seedVault']");
    await expect(seedVaultScenario).toBeVisible();
    await expect(seedVaultScenario).toBeEnabled();
    await seedVaultScenario.selectOption("collector");
    seedVaultScenario = page.locator("select[data-developer-scenario-module='seedVault']");
    await expect(seedVaultScenario).toHaveValue("collector");
    await expect(page.locator(".developer-scenario-page-badge")).toContainText("Collector Vault");
    await expect(inventoryCards).toHaveCount(9);
    expect(consoleErrors).toEqual([]);
  });

  test("Seed Vault sections use contextual artwork without changing responsive geometry", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.goto("/#seed-vault");
    await useFullGrowDemo(page);
    await closeScenarioPanel(page);

    const contextualSurfaces = [
      { selector: ".seed-vault-overview-snapshot", desktopMin: 0.12, mobileMin: 0.08 },
      { selector: ".seed-vault-overview-planning", desktopMin: 0.22, mobileMin: 0.14 },
      { selector: ".seed-vault-overview-collections", desktopMin: 0.18, mobileMin: 0.13 },
      { selector: ".seed-vault-overview-recent-activity", desktopMin: 0.15, mobileMin: 0.11 },
      { selector: ".seed-vault-sharing-hub", desktopMin: 0.2, mobileMin: 0.14 },
      {
        selector: ".seed-vault-library-shell",
        desktopMin: 0.8,
        mobileMin: 0.62,
        desktopMax: 0.84,
        mobileMax: 0.66,
      },
    ];

    for (const viewport of [
      { width: 1280, height: 900 },
      { width: 768, height: 1024 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      const panel = page.locator("#my-seed-vault").first();
      await expect(panel).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

      const signatures = [];
      for (const {
        selector,
        desktopMin,
        mobileMin,
        desktopMax = 0.28,
        mobileMax = 0.28,
      } of contextualSurfaces) {
        const surface = panel.locator(selector);
        await expect(surface).toBeVisible();
        const artwork = await surface.evaluate((node) => {
          const pseudo = getComputedStyle(node, "::before");
          const rect = node.getBoundingClientRect();
          return {
            content: pseudo.content,
            background: pseudo.backgroundImage,
            opacity: Number.parseFloat(pseudo.opacity),
            pointerEvents: pseudo.pointerEvents,
            left: rect.left,
            right: rect.right,
          };
        });
        expect(artwork.content).not.toBe("none");
        expect(artwork.background).toContain("gradient");
        expect(artwork.background).not.toContain("url(");
        expect(artwork.opacity).toBeGreaterThanOrEqual(viewport.width <= 600 ? mobileMin : desktopMin);
        expect(artwork.opacity).toBeLessThanOrEqual(viewport.width <= 600 ? mobileMax : desktopMax);
        expect(artwork.pointerEvents).toBe("none");
        expect(artwork.left).toBeGreaterThanOrEqual(-1);
        expect(artwork.right).toBeLessThanOrEqual(viewport.width + 1);
        signatures.push(artwork.background);
      }
      expect(new Set(signatures).size).toBe(contextualSurfaces.length);
    }

    await page.setViewportSize({ width: 1280, height: 900 });
    const planningArtwork = await page.locator("#my-seed-vault .seed-vault-planning-destination").evaluateAll((cards) => cards.map((card) => {
      const pseudo = getComputedStyle(card, "::before");
      return { className: card.className, background: pseudo.backgroundImage, pointerEvents: pseudo.pointerEvents };
    }));
    expect(planningArtwork).toHaveLength(3);
    expect(new Set(planningArtwork.map((artwork) => artwork.background)).size).toBe(3);
    expect(planningArtwork.every((artwork) => artwork.background.includes("gradient") && artwork.pointerEvents === "none")).toBe(true);

    await useMixAndMatch(page);
    let seedVaultScenario = page.locator("select[data-developer-scenario-module='seedVault']");
    await expect(seedVaultScenario).toBeVisible();
    await seedVaultScenario.selectOption("empty");
    seedVaultScenario = page.locator("select[data-developer-scenario-module='seedVault']");
    await expect(seedVaultScenario).toHaveValue("empty");
    await closeScenarioPanel(page);

    const firstEntry = page.locator("#my-seed-vault .seed-vault-empty-state");
    await expect(firstEntry).toBeVisible();
    const emptyArtwork = await firstEntry.evaluate((node) => {
      const style = getComputedStyle(node);
      const pseudo = getComputedStyle(node, "::before");
      return { surfaceBackground: style.backgroundImage, background: pseudo.backgroundImage, opacity: Number.parseFloat(pseudo.opacity), pointerEvents: pseudo.pointerEvents };
    });
    expect((emptyArtwork.background.match(/radial-gradient/g) || []).length).toBeGreaterThanOrEqual(6);
    expect(emptyArtwork.surfaceBackground).toContain("gradient");
    expect(emptyArtwork.surfaceBackground).not.toContain("url(");
    expect(emptyArtwork.surfaceBackground).not.toContain("kan-grow-companion-bg.png");
    expect(emptyArtwork.background).not.toContain("url(");
    expect(emptyArtwork.opacity).toBeGreaterThanOrEqual(0.2);
    expect(emptyArtwork.pointerEvents).toBe("none");
    expect(consoleErrors).toEqual([]);
  });

  test("Seed Vault premium surfaces retain atmospheric rendering without geometry regressions", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/#seed-vault");
    await useFullGrowDemo(page);
    await closeScenarioPanel(page);

    const panel = page.locator("#my-seed-vault").first();
    const hero = panel.locator(".seed-vault-approved-hero");
    const surfaceSelectors = [
      ".seed-vault-overview-snapshot",
      ".seed-vault-overview-planning",
      ".seed-vault-overview-collections",
      ".seed-vault-overview-recent-activity",
      ".seed-vault-sharing-hub",
      ".seed-vault-library-shell",
    ];
    const viewports = [
      { width: 1280, height: 900 },
      { width: 768, height: 1024 },
      { width: 390, height: 844 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await expect(hero).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

      const surfaceToken = await panel.evaluate((node) => getComputedStyle(node).getPropertyValue("--vault-surface-shadow").trim());
      expect(surfaceToken).not.toBe("");

      const heroRendering = await hero.evaluate((node) => {
        const style = getComputedStyle(node);
        const overlay = getComputedStyle(node, "::after");
        return {
          background: style.backgroundImage,
          shadow: style.boxShadow,
          overlayBackground: overlay.backgroundImage,
          overlayPointerEvents: overlay.pointerEvents,
        };
      });
      expect(heroRendering.background).toContain("seed-vault-hero-bg.png");
      expect(heroRendering.shadow).not.toBe("none");
      expect(heroRendering.overlayBackground).toContain("radial-gradient");
      expect(heroRendering.overlayPointerEvents).toBe("none");

      for (const selector of surfaceSelectors) {
        const surface = panel.locator(selector);
        await expect(surface).toBeVisible();
        const rendering = await surface.evaluate((node) => {
          const style = getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return {
            background: style.backgroundImage,
            backgroundSize: style.backgroundSize,
            backgroundRepeat: style.backgroundRepeat,
            shadow: style.boxShadow,
            textureOpacity: Number.parseFloat(style.getPropertyValue("--vault-section-texture-opacity")),
            left: rect.left,
            right: rect.right,
          };
        });
        expect((rendering.background.match(/gradient/g) || []).length).toBeGreaterThanOrEqual(3);
        if (selector === ".seed-vault-library-shell") {
          expect(rendering.backgroundSize).toContain("3px 5px");
          expect(rendering.backgroundSize).toContain("5px 7px");
          expect(rendering.backgroundSize).not.toContain("17px 17px");
        } else {
          expect(rendering.backgroundSize).toMatch(/(?:14|15|16|17|18)px (?:14|15|16|17|18)px/);
        }
        expect(rendering.backgroundRepeat.split(",").some((value) => value.trim() === "repeat")).toBe(true);
        expect(rendering.textureOpacity).toBeGreaterThan(0);
        expect(rendering.textureOpacity).toBeLessThanOrEqual(viewport.width <= 390 ? 4.2 : 6.5);
        expect(rendering.shadow).not.toBe("none");
        expect(rendering.left).toBeGreaterThanOrEqual(-1);
        expect(rendering.right).toBeLessThanOrEqual(viewport.width + 1);
      }
    }

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.locator('[data-seed-vault-layout="gallery"]').click();
    const gallery = panel.locator(".seed-vault-entry-grid--gallery");
    await expect(gallery).toBeVisible();
    const galleryCard = gallery.locator(".seed-vault-entry-card:not(.is-expanded)").first();
    await expect(galleryCard).toBeVisible();
    const galleryRendering = await galleryCard.evaluate((node) => {
      const style = getComputedStyle(node);
      const imageOverlay = getComputedStyle(node.querySelector(".seed-vault-entry-visual-button"), "::after");
      return {
        background: style.backgroundImage,
        backgroundSize: style.backgroundSize,
        shadow: style.boxShadow,
        imageOverlay: imageOverlay.backgroundImage,
      };
    });
    expect((galleryRendering.background.match(/gradient/g) || []).length).toBeGreaterThanOrEqual(2);
    expect(galleryRendering.backgroundSize).not.toMatch(/(?:14|15|16|17|18)px (?:14|15|16|17|18)px/);
    expect(galleryRendering.shadow).not.toBe("none");
    expect(galleryRendering.imageOverlay).toContain("radial-gradient");

    const galleryLayoutBeforeHover = await gallery.evaluate((node) => Array.from(node.children).slice(0, 2).map((card) => ({
      offsetTop: card.offsetTop,
      offsetLeft: card.offsetLeft,
      offsetWidth: card.offsetWidth,
      offsetHeight: card.offsetHeight,
    })));
    await galleryCard.hover();
    await expect.poll(() => galleryCard.evaluate((node) => getComputedStyle(node).transform)).not.toBe("none");
    const galleryLayoutAfterHover = await gallery.evaluate((node) => Array.from(node.children).slice(0, 2).map((card) => ({
      offsetTop: card.offsetTop,
      offsetLeft: card.offsetLeft,
      offsetWidth: card.offsetWidth,
      offsetHeight: card.offsetHeight,
    })));
    expect(galleryLayoutAfterHover).toEqual(galleryLayoutBeforeHover);

    await page.locator('[data-seed-vault-layout="list"]').click();
    const listCard = panel.locator(".seed-vault-entry-grid--list .seed-vault-entry-card").first();
    await expect(listCard).toBeVisible();
    const listRendering = await listCard.evaluate((node) => {
      const style = getComputedStyle(node);
      const imageOverlay = getComputedStyle(node.querySelector(".seed-vault-entry-visual-button"), "::after");
      return {
        background: style.backgroundImage,
        backgroundSize: style.backgroundSize,
        shadow: style.boxShadow,
        imageOverlay: imageOverlay.backgroundImage,
      };
    });
    expect((listRendering.background.match(/gradient/g) || []).length).toBeGreaterThanOrEqual(2);
    expect(listRendering.backgroundSize).not.toMatch(/(?:14|15|16|17|18)px (?:14|15|16|17|18)px/);
    expect(listRendering.shadow).not.toBe("none");
    expect(listRendering.imageOverlay).toContain("radial-gradient");

    const cleanNestedSelectors = [
      ".seed-vault-controls",
      ".seed-vault-planning-destination",
      ".seed-vault-overview-collection-card",
      ".seed-vault-overview-recent-row",
    ];
    for (const selector of cleanNestedSelectors) {
      const nestedSurface = panel.locator(selector).first();
      await expect(nestedSurface).toBeVisible();
      const backgroundSize = await nestedSurface.evaluate((node) => getComputedStyle(node).backgroundSize);
      expect(backgroundSize).not.toMatch(/(?:14|15|16|17|18)px (?:14|15|16|17|18)px/);
    }
    expect(consoleErrors).toEqual([]);
  });

  test("Seed Vault and KAN companion hero assets survive hard reloads without fallback failures", async ({ page }) => {
    const consoleErrors = [];
    const failedAssetRequests = [];
    const obsoleteAssetRequests = [];
    const correctedAssetPaths = [
      "/assets/images/seed-vault-hero-bg.png",
      "/assets/images/methods/kan-grow-companion-bg.png",
      "/assets/images/tutorials/placeholders/kan-system-walkthrough.webp",
      "/assets/images/tutorials/placeholders/germination-stages.webp",
    ];
    const correctedAssetPathSet = new Set(correctedAssetPaths);

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    page.on("request", (request) => {
      const pathname = new URL(request.url()).pathname;
      if (pathname.endsWith("/kan-grow-companion-hero.png")) obsoleteAssetRequests.push(pathname);
    });
    page.on("requestfailed", (request) => {
      const pathname = new URL(request.url()).pathname;
      if (correctedAssetPathSet.has(pathname) || pathname.endsWith("/kan-grow-companion-hero.png")) {
        failedAssetRequests.push({ pathname, error: request.failure()?.errorText || "request failed" });
      }
    });
    page.on("response", (response) => {
      const pathname = new URL(response.url()).pathname;
      if (correctedAssetPathSet.has(pathname) && response.status() >= 400) {
        failedAssetRequests.push({ pathname, error: "HTTP " + response.status() });
      }
    });

    for (const assetPath of correctedAssetPaths) {
      const response = await page.request.get(assetPath);
      expect(response.status(), assetPath).toBe(200);
      expect(response.headers()["content-type"], assetPath).toMatch(/^image\//);
      expect((await response.body()).byteLength, assetPath).toBeGreaterThan(1024);
    }

    await page.goto("/#seed-vault");
    await useFullGrowDemo(page);
    await closeScenarioPanel(page);
    const seedVaultHero = page.locator(".seed-vault-approved-hero");
    await expect(seedVaultHero).toBeVisible();
    await expect.poll(() => seedVaultHero.evaluate((node) => getComputedStyle(node).backgroundImage)).toContain("seed-vault-hero-bg.png");
    await expect.poll(() => page.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration())?.active))).toBe(true);

    const devtools = await page.context().newCDPSession(page);
    await devtools.send("Network.enable");
    await devtools.send("Network.clearBrowserCache");
    const hardReloadComplete = page.waitForLoadState("domcontentloaded");
    await devtools.send("Page.reload", { ignoreCache: true });
    await hardReloadComplete;
    await expect(seedVaultHero).toBeVisible();
    await expect.poll(() => seedVaultHero.evaluate((node) => getComputedStyle(node).backgroundImage)).toContain("seed-vault-hero-bg.png");

    await page.goto("/#home");
    const kanCompanion = page.locator('.session-progress-companion-card[data-method-companion-bg-src$="/assets/images/methods/kan-grow-companion-bg.png"]').first();
    await expect(kanCompanion).toBeVisible();
    await expect(kanCompanion).toHaveClass(/has-method-companion-background/);
    const kanHero = kanCompanion.locator(".session-progress-companion-hero");
    await expect.poll(() => kanHero.evaluate((node) => getComputedStyle(node, "::before").backgroundImage)).toContain("kan-grow-companion-bg.png");

    await expect.poll(() => page.evaluate(() => {
      const visibleImages = Array.from(document.images).filter((image) => image.getClientRects().length > 0 && image.currentSrc);
      return {
        pending: visibleImages.filter((image) => !image.complete).map((image) => image.currentSrc),
        broken: visibleImages.filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc),
      };
    })).toEqual({ pending: [], broken: [] });

    expect(obsoleteAssetRequests).toEqual([]);
    expect(failedAssetRequests).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test("Seed Vault Status filter exposes one canonical option per status", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.goto("/#seed-vault");
    await useFullGrowDemo(page);
    await closeScenarioPanel(page);

    const statusFilter = page.locator("#my-seed-vault .seed-vault-controls [data-seed-vault-status-filter='true']");
    const expectedOptions = [
      ["all", "All"],
      ["in-vault", "In Stock"],
      ["inventory", "Inventory"],
      ["planned", "Planned"],
      ["active", "Active"],
      ["completed", "Completed"],
      ["archived", "Archived"],
    ];
    const renderedOptions = await statusFilter.locator("option").evaluateAll((options) => options.map((option) => [option.value, option.textContent.trim()]));
    expect(renderedOptions).toEqual(expectedOptions);
    expect(new Set(renderedOptions.map(([value]) => value)).size).toBe(expectedOptions.length);
    expect(renderedOptions.filter(([, label]) => label === "All")).toHaveLength(1);
    expect(renderedOptions.filter(([, label]) => label === "Archived")).toHaveLength(1);

    const cards = page.locator("#my-seed-vault .seed-vault-entry-card");
    const results = page.locator("#my-seed-vault .seed-vault-results-count");
    for (const [value] of expectedOptions) {
      await statusFilter.selectOption(value);
      await expect(statusFilter).toHaveValue(value);
      await expect.poll(async () => {
        const match = String(await results.textContent() || "").match(/(\d+) of (\d+) Vault Entries/);
        const matchingCount = Number(match?.[1]);
        return Boolean(match && await cards.count() === Math.min(10, matchingCount));
      }).toBe(true);
      if (value === "all") {
        await expect(results).toContainText("50 of 50 Vault Entries");
      } else if (value === "in-vault") {
        await expect(cards.locator(".is-archived")).toHaveCount(0);
      } else {
        const renderedPlanningStates = await cards.evaluateAll((items) => items.map((item) => item.dataset.seedVaultPlanningState));
        expect(renderedPlanningStates.every((planningState) => planningState === value)).toBe(true);
      }
    }

    await statusFilter.selectOption("planned");
    const clearFilters = page.locator("#my-seed-vault .seed-vault-controls [data-seed-vault-clear-filters='true']");
    await expect(clearFilters).toBeVisible();
    await clearFilters.click();
    await expect(statusFilter).toHaveValue("all");
    await expect(results).toContainText("50 of 50 Vault Entries");
    expect(consoleErrors).toEqual([]);
  });
  test("Seed Vault List View reveals matching entries ten at a time", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.setViewportSize({ width: 1280, height: 980 });
    await page.goto("/#seed-vault");
    await useFullGrowDemo(page);
    await closeScenarioPanel(page);

    const cards = page.locator("#my-seed-vault .seed-vault-entry-card");
    const results = page.locator("#my-seed-vault .seed-vault-results-count");
    const showMore = page.locator("#my-seed-vault [data-seed-vault-show-more='true']");
    await expect(results).toContainText("50 of 50 Vault Entries");
    await expect(cards).toHaveCount(10);
    await expect(showMore).toHaveAttribute("aria-controls", "my-seed-vault-entry-grid");
    await expect(showMore).toHaveAttribute("aria-label", "Show 10 more Seed Vault entries");

    await showMore.scrollIntoViewIfNeeded();
    const scrollBeforeFirstClick = await page.evaluate(() => window.scrollY);
    await showMore.click();
    await expect(cards).toHaveCount(20);
    await expect.poll(async () => page.evaluate((before) => Math.abs(window.scrollY - before), scrollBeforeFirstClick)).toBeLessThanOrEqual(1);
    for (const expectedCount of [30, 40, 50]) {
      await showMore.click();
      await expect(cards).toHaveCount(expectedCount);
    }
    await expect(showMore).toHaveCount(0);
    const renderedIds = await cards.evaluateAll((items) => items.map((item) => item.dataset.seedVaultEntryId));
    expect(new Set(renderedIds).size).toBe(50);

    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: width === 390 ? 900 : 980 });
      await expect.poll(async () => page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth))).toBeLessThanOrEqual(1);
    }

    await page.setViewportSize({ width: 1280, height: 980 });
    await page.locator("[data-seed-vault-layout='gallery']").click();
    await expect(page.locator("#my-seed-vault .seed-vault-entry-grid")).toHaveClass(/seed-vault-entry-grid--gallery/);
    await expect(cards).toHaveCount(50);
    await expect(showMore).toHaveCount(0);
    await page.locator("[data-seed-vault-layout='list']").click();
    await expect(cards).toHaveCount(10);
    await expect(showMore).toHaveCount(1);

    await showMore.click();
    await expect(cards).toHaveCount(20);
    const search = page.locator("#my-seed-vault .seed-vault-controls [data-seed-vault-search='true']");
    await search.fill("a");
    await expect.poll(async () => page.evaluate(() => appState.seedVaultListVisibleCount)).toBe(10);
    await search.fill("");
    await expect(cards).toHaveCount(10);

    await showMore.click();
    await expect(cards).toHaveCount(20);
    const favorites = page.locator("#my-seed-vault [data-seed-vault-favorite-filter='true']");
    await favorites.selectOption("favorites");
    await expect.poll(async () => page.evaluate(() => appState.seedVaultListVisibleCount)).toBe(10);
    await favorites.selectOption("all");
    await expect(cards).toHaveCount(10);

    await showMore.click();
    await expect(cards).toHaveCount(20);
    await page.locator("#my-seed-vault [data-seed-vault-sort='true']").selectOption("oldest");
    await expect.poll(async () => page.evaluate(() => appState.seedVaultListVisibleCount)).toBe(10);
    await expect(cards).toHaveCount(10);

    await page.evaluate(() => setSeedVaultListVisibleCount("shared", 50));
    await page.getByRole("button", { name: "Shared With Me", exact: true }).click();
    await expect.poll(async () => page.evaluate(() => appState.seedVaultSharedListVisibleCount)).toBe(10);
    await page.evaluate(() => setSeedVaultListVisibleCount("owner", 50));
    await page.getByRole("button", { name: "My Vault", exact: true }).click();
    await expect.poll(async () => page.evaluate(() => appState.seedVaultListVisibleCount)).toBe(10);
    await expect(cards).toHaveCount(10);

    await useMixAndMatch(page);
    await page.evaluate(() => setSeedVaultListVisibleCount("owner", 50));
    const seedVaultScenario = page.locator("select[data-developer-scenario-module='seedVault']");
    await seedVaultScenario.selectOption("collector");
    await expect.poll(async () => page.evaluate(() => appState.seedVaultListVisibleCount)).toBe(10);
    await expect(cards).toHaveCount(9);
    await expect(showMore).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });
  test("Seed Vault inventory rows expose collectible semantic hierarchy", async ({ page }) => {
    test.setTimeout(90_000);
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.goto("/#seed-vault");
    await useFullGrowDemo(page);
    await closeScenarioPanel(page);

    const semanticTokens = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return Object.fromEntries([
        "variety", "seed", "source", "collection", "planned", "testing", "growalong", "favorite",
      ].map((name) => [name, styles.getPropertyValue(`--grow-color-${name}`).trim()]));
    });
    expect(semanticTokens).toEqual({
      variety: "#94d159",
      seed: "#b8875b",
      source: "#55cae7",
      collection: "#b889e8",
      planned: "#e9b34d",
      testing: "#94d159",
      growalong: "#55cae7",
      favorite: "#e84c5b",
    });

    const semanticSurfaces = {
      ".seed-vault-overview-stat.is-varieties .seed-vault-overview-stat-icon": ["variety", true],
      ".seed-vault-overview-stat.is-seeds .seed-vault-overview-stat-icon": ["seed", true],
      ".seed-vault-overview-stat.is-sources .seed-vault-overview-stat-icon": ["source", true],
      ".seed-vault-overview-stat.is-collections .seed-vault-overview-stat-icon": ["collection", true],
      ".seed-vault-planning-destination.is-next-grow .seed-vault-overview-card-icon": ["planned", false],
      ".seed-vault-planning-destination.is-testing .seed-vault-overview-card-icon": ["testing", false],
      ".seed-vault-planning-destination.is-grow-along .seed-vault-overview-card-icon": ["growalong", false],
    };
    for (const [selector, [token, usesHeroMix]] of Object.entries(semanticSurfaces)) {
      const colors = await page.locator(selector).evaluate((icon, { tokenName, mixed }) => {
        const probe = document.createElement("span");
        probe.style.color = mixed
          ? `color-mix(in srgb, var(--grow-color-${tokenName}) 88%, white 12%)`
          : `var(--grow-color-${tokenName})`;
        document.body.append(probe);
        const expected = getComputedStyle(probe).color;
        probe.remove();
        return { actual: getComputedStyle(icon).color, expected };
      }, { tokenName: token, mixed: usesHeroMix });
      expect(normalizeComputedCssColor(colors.actual)).toBe(normalizeComputedCssColor(colors.expected));
    }

    const cards = page.locator("#my-seed-vault .seed-vault-entry-card");
    await revealAllSeedVaultListRows(page);
    await expect(cards).toHaveCount(50);
    const favoriteButton = cards.locator(".seed-vault-favorite-button.is-active").first();
    const inactiveButton = cards.locator(".seed-vault-favorite-button:not(.is-active)").first();
    await expect(favoriteButton).toHaveAttribute("aria-pressed", "true");
    await expect(favoriteButton).toHaveAttribute("aria-label", "Remove Vault Entry from favorites");
    await expect(inactiveButton).toHaveAttribute("aria-pressed", "false");
    await expect(inactiveButton).toHaveAttribute("aria-label", "Favorite Vault Entry");
    await expectExactComputedCssColor(favoriteButton, "color", "rgb(232, 76, 91)");
    await expectExactComputedCssColor(favoriteButton.locator("path"), "fill", "rgb(232, 76, 91)");
    await expect(inactiveButton.locator("path")).toHaveCSS("fill", "none");

    const favoriteOnlyCard = page.locator('#my-seed-vault .seed-vault-entry-card.is-favorite[data-seed-vault-planning-state="inventory"]:not(:has(.seed-vault-entry-status-pill.is-testing)):not(:has(.seed-vault-entry-status-pill.is-grow-along))').first();
    const favoritePlanningCard = page.locator('#my-seed-vault .seed-vault-entry-card.is-favorite:is([data-seed-vault-planning-state="planned"], [data-seed-vault-planning-state="active"], :has(.seed-vault-entry-status-pill.is-testing), :has(.seed-vault-entry-status-pill.is-grow-along))').first();
    const neutralCard = page.locator('#my-seed-vault .seed-vault-entry-card:not(.is-favorite)[data-seed-vault-planning-state="inventory"]:not(:has(.seed-vault-entry-status-pill.is-testing)):not(:has(.seed-vault-entry-status-pill.is-grow-along))').first();
    await expect(favoriteOnlyCard).toBeVisible();
    await expect(favoritePlanningCard).toBeVisible();
    await expect(neutralCard).toBeVisible();

    const favoriteOnlyTreatment = await favoriteOnlyCard.evaluate((card) => {
      const style = getComputedStyle(card);
      const accent = getComputedStyle(card, "::before");
      const neutral = document.querySelector('.seed-vault-entry-card:not(.is-favorite)[data-seed-vault-planning-state="inventory"]:not(:has(.seed-vault-entry-status-pill.is-testing)):not(:has(.seed-vault-entry-status-pill.is-grow-along))');
      const probe = document.createElement("span");
      probe.style.color = "var(--grow-color-favorite)";
      document.body.append(probe);
      const favoriteColor = getComputedStyle(probe).color;
      probe.remove();
      return {
        background: style.backgroundImage,
        borderColor: style.borderColor,
        glow: style.boxShadow,
        accentWidth: parseFloat(accent.width),
        accentColor: accent.backgroundColor,
        accentGlow: accent.boxShadow,
        favoriteColor,
        neutralBackground: getComputedStyle(neutral).backgroundImage,
        neutralBorderColor: getComputedStyle(neutral).borderColor,
        neutralAccentContent: getComputedStyle(neutral, "::before").content,
        titleColor: getComputedStyle(card.querySelector(".seed-vault-entry-identity-copy h4")).color,
      };
    });
    expect(favoriteOnlyTreatment.background).not.toBe(favoriteOnlyTreatment.neutralBackground);
    expect(favoriteOnlyTreatment.borderColor).not.toBe(favoriteOnlyTreatment.neutralBorderColor);
    expect(favoriteOnlyTreatment.accentWidth).toBeGreaterThanOrEqual(3);
    expect(normalizeComputedCssColor(favoriteOnlyTreatment.accentColor)).toBe(normalizeComputedCssColor(favoriteOnlyTreatment.favoriteColor));
    expect(favoriteOnlyTreatment.accentGlow).not.toBe("none");
    expect(favoriteOnlyTreatment.glow).not.toBe("none");
    expect(favoriteOnlyTreatment.neutralAccentContent).toBe("none");
    expect(favoriteOnlyTreatment.titleColor).toMatch(/(?:rgb|color\()/);

    const favoriteOnlyHeart = favoriteOnlyCard.locator(".seed-vault-favorite-button.is-active");
    await expect(favoriteOnlyHeart).toHaveAttribute("aria-pressed", "true");
    await expectExactComputedCssColor(favoriteOnlyHeart.locator("path"), "fill", "rgb(232, 76, 91)");

    const favoritePlanningTreatment = await favoritePlanningCard.evaluate((card) => {
      const accent = getComputedStyle(card, "::before");
      const secondary = getComputedStyle(card, "::after");
      const testingPill = card.querySelector(".seed-vault-entry-status-pill.is-testing");
      const growAlongPill = card.querySelector(".seed-vault-entry-status-pill.is-grow-along");
      const planningPill = card.querySelector('.seed-vault-entry-status-pill[data-seed-vault-status-role="planning"]');
      const primaryPill = testingPill || growAlongPill || planningPill;
      let token = testingPill ? "testing"
        : growAlongPill ? "growalong"
          : card.dataset.seedVaultPlanningState === "planned" ? "planned" : "healthy";
      const probe = document.createElement("span");
      probe.style.color = "var(--grow-color-" + token + ")";
      document.body.append(probe);
      const primaryColor = getComputedStyle(probe).color;
      probe.style.color = "var(--grow-color-favorite)";
      const favoriteColor = getComputedStyle(probe).color;
      probe.remove();
      return {
        primaryColor,
        favoriteColor,
        accentColor: accent.backgroundColor,
        accentWidth: parseFloat(accent.width),
        secondaryColor: secondary.backgroundColor,
        secondaryWidth: parseFloat(secondary.width),
        planningPillColor: getComputedStyle(primaryPill).color,
      };
    });
    expect(favoritePlanningTreatment.accentWidth).toBeGreaterThanOrEqual(3);
    expect(normalizeComputedCssColor(favoritePlanningTreatment.accentColor)).toBe(normalizeComputedCssColor(favoritePlanningTreatment.primaryColor));
    expect(normalizeComputedCssColor(favoritePlanningTreatment.planningPillColor)).toBe(normalizeComputedCssColor(favoritePlanningTreatment.primaryColor));
    expect(favoritePlanningTreatment.secondaryWidth).toBeGreaterThanOrEqual(2);
    expect(normalizeComputedCssColor(favoritePlanningTreatment.secondaryColor)).toBe(normalizeComputedCssColor(favoritePlanningTreatment.favoriteColor));

    const favoriteCollectionCard = page.locator('#my-seed-vault .seed-vault-entry-card.is-favorite:has(.is-collection[data-seed-vault-collection-key])').first();
    const favoriteCollectionTreatment = await favoriteCollectionCard.locator(".is-collection").evaluate((collection) => {
      const marker = getComputedStyle(collection.querySelector("strong"), "::before");
      const probe = document.createElement("span");
      probe.style.color = "var(--seed-vault-collection-color)";
      collection.append(probe);
      const collectionColor = getComputedStyle(probe).color;
      probe.remove();
      return { collectionColor, markerColor: marker.backgroundColor, key: collection.dataset.seedVaultCollectionKey };
    });
    expect(favoriteCollectionTreatment.key).toBeTruthy();
    expect(normalizeComputedCssColor(favoriteCollectionTreatment.markerColor)).toBe(normalizeComputedCssColor(favoriteCollectionTreatment.collectionColor));

    const preHoverBackground = await favoriteOnlyCard.evaluate((card) => getComputedStyle(card).backgroundImage);
    await favoriteOnlyCard.hover();
    expect(await favoriteOnlyCard.evaluate((card) => getComputedStyle(card).backgroundImage)).not.toBe(preHoverBackground);
    await page.mouse.move(1, 1);
    await favoriteOnlyHeart.focus();
    const focusTreatment = await favoriteOnlyCard.evaluate((card) => {
      const style = getComputedStyle(card);
      return { style: style.outlineStyle, width: parseFloat(style.outlineWidth), color: style.outlineColor };
    });
    expect(focusTreatment.style).toBe("solid");
    expect(focusTreatment.width).toBeGreaterThanOrEqual(2);
    expect(focusTreatment.color).not.toBe(favoriteOnlyTreatment.favoriteColor);

    const expectedTones = {
      healthy: "rgb(148, 209, 89)",
      "low-stock": "rgb(237, 160, 90)",
      "older-seed": "rgb(219, 183, 104)",
      planned: "rgb(233, 179, 77)",
      testing: "rgb(148, 209, 89)",
      "grow-along": "rgb(85, 202, 231)",
      "recently-added": "rgb(85, 202, 231)",
    };
    for (const [tone, color] of Object.entries(expectedTones)) {
      const pill = page.locator(`.seed-vault-entry-status-pill.is-${tone}`).first();
      await expect(pill).toBeVisible();
      await expectExactComputedCssColor(pill, "color", color);
    }
    await expect(page.locator(".seed-vault-entry-collapsed-row .seed-vault-entry-status-pill.is-favorite")).toHaveCount(10);
    await expect(page.locator(".seed-vault-entry-collapsed-row .seed-vault-entry-status-pill.is-favorite").first()).toBeHidden();

    const collectionContext = await page.locator(".seed-vault-entry-insight-strip .is-collection").evaluateAll((items) => {
      const multiple = items.find((item) => Number(item.dataset.collectionCount || 0) > 1);
      if (!multiple) return null;
      const marker = getComputedStyle(multiple.querySelector("strong"), "::before");
      return { text: multiple.querySelector("strong")?.textContent || "", tone: multiple.dataset.seedVaultCollectionTone, markerColor: marker.backgroundColor, markerWidth: parseFloat(marker.width) };
    });
    expect(collectionContext).not.toBeNull();
    expect(collectionContext.text).toMatch(/ \+\d+$/);
    expect(normalizeComputedCssColor(collectionContext.markerColor)).toBe(normalizeComputedCssColor({ violet: "rgb(184, 137, 232)", cyan: "rgb(85, 202, 231)", amber: "rgb(233, 179, 77)", green: "rgb(148, 209, 89)", bronze: "rgb(184, 135, 91)", rose: "rgb(232, 76, 91)" }[collectionContext.tone]));
    expect(collectionContext.markerWidth).toBe(6);

    expect(await cards.locator(".seed-vault-seed-thumb:not(.has-image)").count()).toBeGreaterThan(0);
    const longestNameTreatment = await cards.locator(".seed-vault-entry-identity-copy h4").evaluateAll((items) => {
      const longest = [...items].sort((left, right) => (right.textContent || "").trim().length - (left.textContent || "").trim().length)[0];
      const style = getComputedStyle(longest);
      return { length: (longest.textContent || "").trim().length, overflow: style.overflow, textOverflow: style.textOverflow, whiteSpace: style.whiteSpace };
    });
    expect(longestNameTreatment.length).toBeGreaterThanOrEqual(15);
    expect(longestNameTreatment).toMatchObject({ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });

    for (const width of [1280, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 900 : 980 });
      const responsive = await page.evaluate(() => {
        const card = document.querySelector(".seed-vault-entry-grid--list .seed-vault-entry-card:first-child");
        const row = card.querySelector(".seed-vault-entry-collapsed-row").getBoundingClientRect();
        const visual = card.querySelector(".seed-vault-entry-visual-button").getBoundingClientRect();
        const identity = card.querySelector(".seed-vault-entry-identity").getBoundingClientRect();
        const statuses = card.querySelector(".seed-vault-entry-status-pills").getBoundingClientRect();
        const actions = card.querySelector(".seed-vault-entry-actions").getBoundingClientRect();
        const actionControls = [...card.querySelectorAll(".seed-vault-favorite-button, .seed-vault-more-button")];
        const favorite = document.querySelector(".seed-vault-favorite-button.is-active");
        const favoriteBox = favorite.getBoundingClientRect();
        const favoriteAccent = getComputedStyle(favorite.closest(".seed-vault-entry-card"), "::before");
        const pills = [...card.querySelectorAll(".seed-vault-entry-status-pill")]
          .filter((pill) => getComputedStyle(pill).display !== "none")
          .map((pill) => pill.getBoundingClientRect());
        const overlap = pills.some((left, index) => pills.slice(index + 1).some((right) => !(left.right <= right.left || right.right <= left.left || left.bottom <= right.top || right.bottom <= left.top)));
        return {
          overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
          identityGap: identity.left - visual.right,
          actionsRightInset: row.right - actions.right,
          actionsAreFinalDesktopColumn: window.innerWidth < 560 || actions.left >= statuses.right - 1,
          actionOrder: actionControls.map((control) => control.matches(".seed-vault-favorite-button") ? "favorite" : "overflow"),
          actionSizes: actionControls.map((control) => { const box = control.getBoundingClientRect(); return [box.width, box.height]; }),
          favoriteVisible: getComputedStyle(favorite).display !== "none" && favoriteBox.width > 0 && favoriteBox.height > 0,
          favoriteWidth: favoriteBox.width,
          favoriteHeight: favoriteBox.height,
          favoriteAccentWidth: parseFloat(favoriteAccent.width),
          badgeOverlap: overlap,
        };
      });
      expect(responsive.overflow).toBeLessThanOrEqual(1);
      expect(responsive.identityGap).toBeGreaterThanOrEqual(0);
      expect(responsive.identityGap).toBeLessThanOrEqual(14);
      expect(responsive.actionsRightInset).toBeGreaterThanOrEqual(0);
      expect(responsive.actionsRightInset).toBeLessThanOrEqual(15);
      expect(responsive.actionsAreFinalDesktopColumn).toBe(true);
      expect(responsive.actionOrder).toEqual(["favorite", "overflow"]);
      expect(responsive.actionSizes).toHaveLength(2);
      if (width === 390) {
        expect(Math.min(...responsive.actionSizes.flat())).toBeGreaterThanOrEqual(44);
      }
      expect(responsive.favoriteVisible).toBe(true);
      expect(responsive.favoriteWidth).toBeGreaterThanOrEqual(width === 390 ? 44 : 40);
      expect(responsive.favoriteHeight).toBeGreaterThanOrEqual(width === 390 ? 44 : 38);
      expect(responsive.favoriteAccentWidth).toBeGreaterThanOrEqual(3);
      expect(responsive.badgeOverlap).toBe(false);
    }

    await favoriteButton.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(favoriteButton).toBeFocused();
    expect(await favoriteButton.evaluate((button) => getComputedStyle(button).outlineStyle)).not.toBe("none");

    await page.getByRole("button", { name: "Shared With Me", exact: true }).click();
    await expect(page.locator(".seed-vault-shared-with-me-panel")).toBeVisible();
    expect(await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth))).toBeLessThanOrEqual(1);
    expect(consoleErrors).toEqual([]);
  });


  test("Seed Vault collection palette stays deterministic and presentation-only", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.goto("/#seed-vault");
    await useFullGrowDemo(page);
    await closeScenarioPanel(page);

    const contract = await page.evaluate(() => {
      const canonical = getSeedVaultCollectionPresentation("Purple Hunt");
      const caseVariant = getSeedVaultCollectionPresentation("  PURPLE HUNT  ");
      const spacingVariant = getSeedVaultCollectionPresentation("purple   hunt");
      const paletteNames = ["Purple Hunt", "Next Grow", "Outdoor 2027", "Breeder Trials", "Hash Project", "Rare Packs"];
      const normalizedCollections = normalizeSeedVaultTextList([" Purple Hunt ", "Next Grow"]);
      const mappedRow = mapSeedVaultEntryToRow({
        id: "palette-contract-entry",
        userId: "palette-contract-user",
        seedName: "Palette Contract Entry",
        collections: normalizedCollections,
      });
      return {
        canonical,
        caseVariant,
        spacingVariant,
        distinctTones: [...new Set(paletteNames.map((name) => getSeedVaultCollectionPresentation(name).tone))],
        normalizedCollections,
        persistedCollections: mappedRow.collections,
        unexpectedPresentationFields: Object.keys(mappedRow).filter((key) => /(?:collection.*(?:color|theme)|(?:color|theme).*collection)/i.test(key)),
      };
    });
    expect(contract.caseVariant).toEqual(contract.canonical);
    expect(contract.spacingVariant).toEqual(contract.canonical);
    expect(contract.distinctTones.length).toBeGreaterThan(1);
    expect(contract.normalizedCollections).toEqual(["Purple Hunt", "Next Grow"]);
    expect(contract.persistedCollections).toEqual(["Purple Hunt", "Next Grow"]);
    expect(contract.unexpectedPresentationFields).toEqual([]);

    const presentationSurfaces = [
      ".seed-vault-overview-collection-card[data-seed-vault-collection-key]",
      ".seed-vault-entry-insight-strip .is-collection[data-seed-vault-collection-key]",
      ".seed-vault-collection-filter-control option[data-seed-vault-collection-key]",
    ];
    for (const selector of presentationSurfaces) {
      const surface = page.locator(selector);
      expect(await surface.count()).toBeGreaterThan(0);
      const mismatches = await surface.evaluateAll((items) => items
        .map((item) => ({ key: item.dataset.seedVaultCollectionKey, tone: item.dataset.seedVaultCollectionTone }))
        .filter(({ key, tone }) => getSeedVaultCollectionPresentation(key).tone !== tone));
      expect(mismatches).toEqual([]);
    }

    const firstCard = page.locator("#my-seed-vault .seed-vault-entry-card").first();
    const firstCardId = await firstCard.getAttribute("data-seed-vault-entry-id");
    await firstCard.locator(".seed-vault-more-button").click();
    await firstCard.getByRole("menuitem", { name: "Open Entry Profile" }).click();
    const expandedCard = page.locator('[data-seed-vault-entry-id="' + firstCardId + '"]');
    const collectionPills = expandedCard.locator(".seed-vault-collection-pill[data-seed-vault-collection-key]");
    expect(await collectionPills.count()).toBeGreaterThan(0);
    const detailMismatches = await collectionPills.evaluateAll((items) => items
      .map((item) => ({ key: item.dataset.seedVaultCollectionKey, tone: item.dataset.seedVaultCollectionTone }))
      .filter(({ key, tone }) => getSeedVaultCollectionPresentation(key).tone !== tone));
    expect(detailMismatches).toEqual([]);

    const selectedCollection = await page.locator(".seed-vault-overview-collection-main").first().getAttribute("data-seed-vault-overview-collection");
    await page.locator("[data-seed-vault-collection-filter='true']").selectOption(selectedCollection);
    const expectedTone = await page.evaluate((name) => getSeedVaultCollectionPresentation(name).tone, selectedCollection);
    await expect(page.locator(".seed-vault-collection-filter-control")).toHaveAttribute("data-seed-vault-collection-tone", expectedTone);
    await expect(page.locator("[data-seed-vault-browse-context]")).toHaveAttribute("data-seed-vault-collection-tone", expectedTone);
    expect(consoleErrors).toEqual([]);
  });

  test("Seed Vault Entry Profile hero uses the dedicated cinematic seed background", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    const assetResponse = await page.request.get("/assets/images/seed-vault-entry-profile-bg.png");
    expect(assetResponse.status()).toBe(200);
    expect(assetResponse.headers()["content-type"]).toMatch(/^image\//);
    expect((await assetResponse.body()).byteLength).toBeGreaterThan(1024);

    await page.setViewportSize({ width: 1280, height: 980 });
    await page.goto("/#seed-vault");
    await useFullGrowDemo(page);
    await closeScenarioPanel(page);

    const firstCard = page.locator("#my-seed-vault .seed-vault-entry-card").first();
    await firstCard.locator(".seed-vault-more-button").click();
    await firstCard.getByRole("menuitem", { name: "Open Entry Profile", exact: true }).click();
    const profile = firstCard.locator(".seed-vault-expanded-profile");
    const hero = profile.locator(".seed-vault-expanded-profile-hero");
    const tabs = profile.locator(".seed-vault-expanded-profile-nav");
    await expect(hero).toBeVisible();
    await expect(hero.locator(".seed-vault-expanded-profile-copy h3")).toBeVisible();
    await expect(hero.locator(".seed-vault-expanded-profile-stats > div")).toHaveCount(3);

    const focalPositions = new Map([[390, "68% 50%"], [768, "62% 50%"], [1024, "58% 52%"], [1280, "58% 52%"]]);
    for (const [width, expectedPosition] of focalPositions) {
      await page.setViewportSize({ width, height: width <= 390 ? 844 : 980 });
      const contract = await hero.evaluate((node) => {
        const style = getComputedStyle(node);
        const heroBox = node.getBoundingClientRect();
        const titleBox = node.querySelector(".seed-vault-expanded-profile-copy h3").getBoundingClientRect();
        const thumbnailBox = node.querySelector(".seed-vault-expanded-profile-visual").getBoundingClientRect();
        const metricBoxes = [...node.querySelectorAll(".seed-vault-expanded-profile-stats > div")].map((metric) => metric.getBoundingClientRect());
        const tabsBox = node.nextElementSibling.getBoundingClientRect();
        return {
          backgroundImage: style.backgroundImage,
          backgroundSize: style.backgroundSize,
          backgroundPosition: style.backgroundPosition,
          backgroundRepeat: style.backgroundRepeat,
          titleInside: titleBox.left >= heroBox.left - 1 && titleBox.right <= heroBox.right + 1,
          thumbnailInside: thumbnailBox.left >= heroBox.left - 1 && thumbnailBox.right <= heroBox.right + 1,
          metricsInside: metricBoxes.every((box) => box.left >= heroBox.left - 1 && box.right <= heroBox.right + 1),
          tabsFollowHero: tabsBox.top >= heroBox.bottom - 1,
          overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
        };
      });
      expect(contract.backgroundImage).toContain("seed-vault-entry-profile-bg.png");
      expect((contract.backgroundImage.match(/linear-gradient/g) || []).length).toBeGreaterThanOrEqual(2);
      expect(contract.backgroundSize.split(",").map((value) => value.trim()).every((value) => value === "cover")).toBe(true);
      expect(contract.backgroundPosition.split(",").map((value) => value.trim()).every((value) => value === expectedPosition)).toBe(true);
      expect(contract.backgroundRepeat.split(",").map((value) => value.trim()).every((value) => value === "no-repeat")).toBe(true);
      expect(contract.titleInside).toBe(true);
      expect(contract.thumbnailInside).toBe(true);
      expect(contract.metricsInside).toBe(true);
      expect(contract.tabsFollowHero).toBe(true);
      expect(contract.overflow).toBeLessThanOrEqual(1);
      await expect(tabs).toBeVisible();
    }

    await firstCard.getByRole("button", { name: "Close Entry Profile", exact: true }).click();
    await expect(page.locator(".seed-vault-expanded-profile")).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });
  test("Seed Vault Gallery renders premium image-led collectible cards", async ({ page }) => {
    test.setTimeout(90_000);
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.setViewportSize({ width: 1280, height: 980 });
    await page.goto("/#seed-vault");
    await useFullGrowDemo(page);
    await closeScenarioPanel(page);

    const grid = page.locator("#my-seed-vault .seed-vault-entry-grid");
    await expect(grid).toHaveClass(/seed-vault-entry-grid--list/);
    const listVisualBox = await grid.locator(".seed-vault-entry-card").first().locator("[data-seed-vault-quick-peek]").boundingBox();
    expect(listVisualBox.height).toBeLessThan(110);

    await page.locator('[data-seed-vault-layout="gallery"]').click();
    await expect(grid).toHaveClass(/seed-vault-entry-grid--gallery/);
    const cards = grid.locator(".seed-vault-entry-card");
    await expect(cards).toHaveCount(50);

    const firstCard = cards.first();
    const galleryContract = await firstCard.evaluate((card) => {
      const visual = card.querySelector("[data-seed-vault-quick-peek]").getBoundingClientRect();
      const actionBoxes = [...card.querySelectorAll(".seed-vault-favorite-button, .seed-vault-more-button")].map((control) => control.getBoundingClientRect());
      const name = card.querySelector(".seed-vault-entry-identity-copy h4");
      const nameStyle = getComputedStyle(name);
      const cardBox = card.getBoundingClientRect();
      const identityName = card.querySelector(".seed-vault-entry-identity-copy h4").getBoundingClientRect();
      const identitySource = card.querySelector(".seed-vault-entry-provenance").getBoundingClientRect();
      const identityTraits = card.querySelector(".seed-vault-entry-traits").getBoundingClientRect();
      const insight = card.querySelector(".seed-vault-entry-insight-strip");
      const quantity = insight.querySelector(".is-quantity").getBoundingClientRect();
      const acquired = insight.querySelector(".is-acquired").getBoundingClientRect();
      const collection = insight.querySelector(".is-collection").getBoundingClientRect();
      const statusFooter = card.querySelector(".seed-vault-entry-status-pills").getBoundingClientRect();
      const copyStyle = getComputedStyle(card.querySelector(".seed-vault-entry-library-copy"));
      const visibleStatuses = [...card.querySelectorAll(".seed-vault-entry-status-pill")]
        .filter((pill) => getComputedStyle(pill).display !== "none")
        .map((pill) => pill.dataset.seedVaultStatusRole);
      return {
        cardHeight: cardBox.height,
        mediaHeight: visual.height,
        mediaRatio: visual.height / cardBox.height,
        actionsInsideMedia: actionBoxes.length === 2 && actionBoxes.every((box) => box.top >= visual.top - 1 && box.right <= visual.right + 1 && box.bottom <= visual.bottom + 1),
        lineClamp: nameStyle.webkitLineClamp,
        nameOverflow: nameStyle.overflow,
        identityOrder: identityName.top < identitySource.top && identitySource.top < identityTraits.top,
        metadataAligned: Math.abs(quantity.top - acquired.top) <= 1,
        collectionHeight: collection.height,
        statusFooterFollowsCollection: statusFooter.top >= collection.bottom,
        copyGap: Number.parseFloat(copyStyle.rowGap || copyStyle.gap),
        copyPaddingTop: Number.parseFloat(copyStyle.paddingTop),
        visibleStatuses,
      };
    });
    expect(galleryContract.cardHeight).toBeGreaterThanOrEqual(369);
    expect(galleryContract.cardHeight).toBeLessThanOrEqual(371);
    expect(galleryContract.mediaHeight).toBeGreaterThanOrEqual(147);
    expect(galleryContract.mediaHeight).toBeLessThanOrEqual(149);
    expect(galleryContract.mediaRatio).toBeGreaterThanOrEqual(0.38);
    expect(galleryContract.mediaRatio).toBeLessThanOrEqual(0.43);
    expect(galleryContract.actionsInsideMedia).toBe(true);
    expect(galleryContract.identityOrder).toBe(true);
    expect(galleryContract.metadataAligned).toBe(true);
    expect(galleryContract.collectionHeight).toBeLessThanOrEqual(28);
    expect(galleryContract.statusFooterFollowsCollection).toBe(true);
    expect(galleryContract.copyGap).toBeLessThanOrEqual(9);
    expect(galleryContract.copyPaddingTop).toBeLessThanOrEqual(11);
    expect(galleryContract.lineClamp).toBe("2");
    expect(galleryContract.nameOverflow).toBe("hidden");
    expect(galleryContract.visibleStatuses.length).toBeGreaterThanOrEqual(1);
    expect(galleryContract.visibleStatuses.length).toBeLessThanOrEqual(2);
    expect(galleryContract.visibleStatuses.every((role) => role === "health" || role === "planning")).toBe(true);

    const rowAlignment = await cards.evaluateAll((items) => {
      const firstRow = items.slice(0, 3).map((card) => card.getBoundingClientRect().height);
      const accents = items.map((card) => getComputedStyle(card).getPropertyValue("--seed-vault-gallery-accent").trim()).filter(Boolean);
      return {
        heightDelta: Math.max(...firstRow) - Math.min(...firstRow),
        distinctAccents: new Set(accents).size,
      };
    });
    expect(rowAlignment.heightDelta).toBeLessThanOrEqual(1);
    expect(rowAlignment.distinctAccents).toBeGreaterThan(1);

    const favorite = cards.locator(".seed-vault-favorite-button.is-active").first();
    await expectExactComputedCssColor(favorite, "color", "rgb(232, 76, 91)");
    await expectExactComputedCssColor(favorite.locator("path"), "fill", "rgb(232, 76, 91)");
    await expect(cards.locator('.seed-vault-entry-status-pill[data-seed-vault-status-role="context"]').first()).toBeHidden();
    const collection = cards.locator('.seed-vault-entry-insight-strip .is-collection[data-collection-count]:not([data-collection-count="0"])').first();
    await expect(collection).toBeVisible();
    await expect(collection).toContainText(/.+/);
    expect(await cards.locator(".seed-vault-seed-thumb:not(.has-image)").count()).toBeGreaterThan(0);
    await expect(cards.locator(".seed-vault-seed-thumb:not(.has-image)").first()).toBeVisible();

    const expectedColumns = new Map([[320, 1], [375, 1], [390, 1], [430, 1], [768, 2], [1024, 3], [1280, 3], [1600, 4]]);
    for (const [width, columnCount] of expectedColumns) {
      await page.setViewportSize({ width, height: width < 700 ? 844 : 980 });
      const responsive = await grid.evaluate((element) => {
        const first = element.querySelector(".seed-vault-entry-card");
        const visual = first.querySelector("[data-seed-vault-quick-peek]").getBoundingClientRect();
        const card = first.getBoundingClientRect();
        const actionBoxes = [...first.querySelectorAll(".seed-vault-favorite-button, .seed-vault-more-button")].map((control) => control.getBoundingClientRect());
        return {
          columns: getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length,
          overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
          canvasWidth: document.querySelector(".seed-vault-page").getBoundingClientRect().width,
          cardInsideViewport: card.left >= -0.5 && card.right <= document.documentElement.clientWidth + 0.5,
          cardHeight: card.height,
          mediaHeight: visual.height,
          mediaRatio: visual.height / card.height,
          imageObjectFit: getComputedStyle(element.querySelector(".seed-vault-seed-thumb img")).objectFit,
          smallestAction: Math.min(...actionBoxes.flatMap((box) => [box.width, box.height])),
        };
      });
      expect(responsive.columns).toBe(columnCount);
      expect(responsive.overflow).toBeLessThanOrEqual(1);
      expect(responsive.canvasWidth).toBeLessThanOrEqual(1280.5);
      expect(responsive.cardInsideViewport).toBe(true);
      expect(responsive.cardHeight).toBeGreaterThanOrEqual(width <= 700 ? 383 : 369);
      expect(responsive.cardHeight).toBeLessThanOrEqual(width <= 700 ? 385 : 371);
      expect(responsive.mediaHeight).toBeGreaterThanOrEqual(width <= 700 ? 153 : 147);
      expect(responsive.mediaHeight).toBeLessThanOrEqual(width <= 700 ? 155 : 149);
      expect(responsive.mediaRatio).toBeGreaterThanOrEqual(0.38);
      expect(responsive.mediaRatio).toBeLessThanOrEqual(0.43);
      expect(responsive.imageObjectFit).toBe("cover");
      expect(responsive.smallestAction).toBeGreaterThanOrEqual(width <= 700 ? 44 : 40);
    }

    await page.setViewportSize({ width: 1280, height: 980 });
    await page.locator('[data-seed-vault-layout="list"]').click();
    await expect(grid).toHaveClass(/seed-vault-entry-grid--list/);
    const restoredListVisualBox = await grid.locator(".seed-vault-entry-card").first().locator("[data-seed-vault-quick-peek]").boundingBox();
    expect(Math.abs(restoredListVisualBox.width - listVisualBox.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(restoredListVisualBox.height - listVisualBox.height)).toBeLessThanOrEqual(1);
    expect(consoleErrors).toEqual([]);
  });

  test("Seed Vault 3.0 stays centered, capped, stacked, and overflow-free", async ({ page }) => {
    for (const [index, width] of [320, 375, 390, 430, 768, 1024, 1280, 1600].entries()) {
      await page.setViewportSize({ width, height: width < 700 ? 844 : 980 });
      await page.goto("/#seed-vault");
      if (index === 0) await useFullGrowDemo(page);
      await expect(page.locator("#my-seed-vault .seed-vault-entry-card")).toHaveCount(10);
      await expect(page.locator(".seed-vault-collection-layout, .seed-vault-summary-panel")).toHaveCount(0);

      const geometry = await page.evaluate(() => {
        const canvas = document.querySelector(".seed-vault-page").getBoundingClientRect();
        const firstCard = document.querySelector("#my-seed-vault .seed-vault-entry-card").getBoundingClientRect();
        return {
          overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
          canvas: { x: canvas.x, width: canvas.width, right: canvas.right },
          card: { x: firstCard.x, right: firstCard.right },
        };
      });
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.canvas.width).toBeLessThanOrEqual(1280.5);
      expect(geometry.canvas.x).toBeGreaterThanOrEqual(0);
      expect(geometry.canvas.right).toBeLessThanOrEqual(width + 0.5);
      expect(geometry.card.x).toBeGreaterThanOrEqual(0);
      expect(geometry.card.right).toBeLessThanOrEqual(width + 0.5);

      const primary = page.locator(".seed-vault-overview-primary-grid");
      const engagement = page.locator(".seed-vault-overview-engagement-grid");
      if (width > 960) {
        const planningBox = await primary.locator(".seed-vault-overview-planning").boundingBox();
        const collectionsBox = await primary.locator(".seed-vault-overview-collections").boundingBox();
        const recentBox = await engagement.locator(".seed-vault-overview-recent-activity").boundingBox();
        const sharingBox = await engagement.locator(".seed-vault-sharing-hub").boundingBox();
        expect(collectionsBox.width).toBeGreaterThan(planningBox.width);
        expect(recentBox.width).toBeGreaterThan(sharingBox.width * 1.7);
      } else {
        const recentBox = await engagement.locator(".seed-vault-overview-recent-activity").boundingBox();
        const sharingBox = await engagement.locator(".seed-vault-sharing-hub").boundingBox();
        expect(Math.abs(recentBox.x - sharingBox.x)).toBeLessThanOrEqual(1);
        expect(sharingBox.y).toBeGreaterThan(recentBox.y);
      }
    }
  });

  test("Seed Vault hero owns the scope control without a permanent utility strip", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.goto("/#seed-vault");
    await useFullGrowDemo(page);
    await closeScenarioPanel(page);

    const pageShell = page.locator(".seed-vault-page");
    const hero = page.locator("#my-seed-vault .seed-vault-approved-hero");
    const scope = hero.locator(".seed-vault-hero-scope-control");
    const myVaultTab = scope.locator("[data-seed-vault-page-view='mine']");
    const sharedTab = scope.locator("[data-seed-vault-page-view='shared']");
    await expect(pageShell.locator(":scope > .seed-vault-page-nav")).toHaveCount(0);
    await expect(pageShell.locator(".seed-vault-back-button", { hasText: "Back to My Sessions" })).toHaveCount(0);
    await expect(pageShell.locator(":scope > #seed-vault-section")).toBeVisible();
    await expect(scope).toBeVisible();
    await expect(scope).toHaveAttribute("role", "tablist");
    await expect(myVaultTab).toHaveAttribute("aria-selected", "true");
    await expect(sharedTab).toHaveAttribute("aria-selected", "false");
    await expect(myVaultTab.locator(".seed-vault-scope-tab-icon")).toBeVisible();
    await expect(sharedTab.locator(".seed-vault-scope-tab-icon")).toBeVisible();

    const readingOrder = await hero.evaluate((node) => {
      const title = node.querySelector("#my-seed-vault-title");
      const tabs = node.querySelector(".seed-vault-hero-scope-control");
      return Boolean(title && tabs && (title.compareDocumentPosition(tabs) & Node.DOCUMENT_POSITION_FOLLOWING));
    });
    expect(readingOrder).toBe(true);

    for (const width of [390, 768, 1024, 1280]) {
      await page.setViewportSize({ width, height: width <= 768 ? 900 : 820 });
      await expect(hero).toBeVisible();
      await expect(scope).toBeVisible();
      const geometry = await hero.evaluate((node) => {
        const utility = node.querySelector(".seed-vault-approved-hero-utility");
        const tabs = node.querySelector(".seed-vault-hero-scope-control");
        const controls = node.querySelector(".seed-vault-approved-hero-controls");
        const search = node.querySelector(".seed-vault-overview-search");
        const addButton = node.querySelector(".seed-vault-add-button");
        const newest = node.querySelector(".seed-vault-newest-addition");
        const rect = (element) => {
          const box = element.getBoundingClientRect();
          return { x: box.x, y: box.y, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
        };
        return {
          hero: rect(node),
          utility: rect(utility),
          tabs: rect(tabs),
          controls: rect(controls),
          search: rect(search),
          add: rect(addButton),
          newest: rect(newest),
          tabHeights: [...tabs.querySelectorAll(".seed-vault-page-tab")].map((tab) => tab.getBoundingClientRect().height),
          overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
        };
      });
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.tabs.y).toBeGreaterThanOrEqual(geometry.hero.y);
      expect(geometry.tabs.right).toBeLessThanOrEqual(geometry.hero.right + 1);
      expect(geometry.tabs.bottom).toBeLessThanOrEqual(geometry.controls.y + 1);
      expect(geometry.newest.y).toBeGreaterThanOrEqual(geometry.controls.bottom);
      expect(geometry.tabHeights.every((height) => height >= 44)).toBe(true);
      if (width <= 760) {
        expect(geometry.tabs.width).toBeGreaterThanOrEqual(geometry.utility.width - 1);
        expect(geometry.add.y).toBeGreaterThanOrEqual(geometry.search.bottom);
      } else {
        expect(Math.abs(geometry.tabs.right - geometry.controls.right)).toBeLessThanOrEqual(1);
      }
    }

    await myVaultTab.focus();
    await page.keyboard.press("Tab");
    await expect(sharedTab).toBeFocused();
    const focusStyle = await sharedTab.evaluate((tab) => getComputedStyle(tab).outlineStyle);
    expect(focusStyle).not.toBe("none");

    await sharedTab.click();
    const sharedPanel = page.locator(".seed-vault-shared-with-me-panel");
    await expect(sharedPanel).toBeVisible();
    const sharedScope = sharedPanel.locator(".seed-vault-header .seed-vault-hero-scope-control");
    await expect(sharedScope).toBeVisible();
    await expect(sharedScope.locator("[data-seed-vault-page-view='shared']")).toHaveAttribute("aria-selected", "true");
    await expect(pageShell.locator(":scope > .seed-vault-page-nav")).toHaveCount(0);
    await sharedScope.locator("[data-seed-vault-page-view='mine']").click();
    await expect(hero).toBeVisible();
    await expect(hero.locator("[data-seed-vault-page-view='mine']")).toHaveAttribute("aria-selected", "true");
    expect(consoleErrors).toEqual([]);
  });

  test("Seed Vault hero search submits canonical results into view without interrupting typing", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.setViewportSize({ width: 1280, height: 820 });
    await page.goto("/#seed-vault");
    await useFullGrowDemo(page);
    await closeScenarioPanel(page);

    const viewportCases = [
      { width: 1280, height: 820 },
      { width: 768, height: 900 },
      { width: 390, height: 844 },
    ];
    for (const viewport of viewportCases) {
      await page.setViewportSize(viewport);
      await page.goto("/#seed-vault");
      await closeScenarioPanel(page);

      const vault = page.locator("#my-seed-vault");
      const library = vault.locator(".seed-vault-library-shell");
      const libraryTitle = vault.locator("#seed-vault-library-title");
      const heroSearch = vault.locator("[data-seed-vault-hero-search-form='true'] input");
      const heroSearchForm = vault.locator("[data-seed-vault-hero-search-form='true']");
      const searchButton = vault.locator(".seed-vault-overview-search-submit");
      const resultsCount = vault.locator(".seed-vault-results-count");

      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      const typingScrollY = await page.evaluate(() => window.scrollY);
      await heroSearch.fill("no-vault-entry-matches-this");
      await expect(resultsCount).toContainText("0 of 50 Vault Entries");
      await expect(heroSearch).toHaveValue("no-vault-entry-matches-this");
      expect(Math.abs((await page.evaluate(() => window.scrollY)) - typingScrollY)).toBeLessThanOrEqual(2);

      await heroSearch.press("Enter");
      await expect(heroSearch).toBeFocused();
      await expect.poll(async () => library.evaluate((node) => {
        const navigation = document.querySelector(".topbar");
        const navigationStyle = navigation instanceof HTMLElement ? getComputedStyle(navigation) : null;
        const navigationRect = navigation instanceof HTMLElement ? navigation.getBoundingClientRect() : null;
        const stickyOffset = navigationRect && (navigationStyle?.position === "sticky" || navigationStyle?.position === "fixed")
          ? Math.max(0, navigationRect.bottom)
          : 0;
        const rootStyle = getComputedStyle(document.documentElement);
        const pageGap = Number.parseFloat(rootStyle.getPropertyValue("--space-5")) || 0;
        return Math.abs(node.getBoundingClientRect().top - stickyOffset - pageGap);
      })).toBeLessThanOrEqual(2);
      const titlePosition = await libraryTitle.evaluate((node) => {
        const navigation = document.querySelector(".topbar");
        const navigationStyle = navigation instanceof HTMLElement ? getComputedStyle(navigation) : null;
        const navigationRect = navigation instanceof HTMLElement ? navigation.getBoundingClientRect() : null;
        const stickyOffset = navigationRect && (navigationStyle?.position === "sticky" || navigationStyle?.position === "fixed")
          ? Math.max(0, navigationRect.bottom)
          : 0;
        return { titleTop: node.getBoundingClientRect().top, stickyOffset };
      });
      expect(titlePosition.titleTop).toBeGreaterThan(titlePosition.stickyOffset);

      const visibleLibraryScrollY = await page.evaluate(() => window.scrollY);
      await heroSearchForm.evaluate((form) => form.requestSubmit());
      expect(Math.abs((await page.evaluate(() => window.scrollY)) - visibleLibraryScrollY)).toBeLessThanOrEqual(2);

      const clearScrollY = await page.evaluate(() => window.scrollY);
      await heroSearch.evaluate((input) => {
        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
      await expect(resultsCount).toContainText("50 of 50 Vault Entries");
      await expect(heroSearch).toHaveValue("");
      expect(Math.abs((await page.evaluate(() => window.scrollY)) - clearScrollY)).toBeLessThanOrEqual(2);

      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await heroSearch.fill("Blue Dream");
      const iconTypingScrollY = await page.evaluate(() => window.scrollY);
      expect(iconTypingScrollY).toBeLessThanOrEqual(2);
      await searchButton.click();
      await expect.poll(async () => library.evaluate((node) => {
        const rootStyle = getComputedStyle(document.documentElement);
        const pageGap = Number.parseFloat(rootStyle.getPropertyValue("--space-5")) || 0;
        return Math.abs(node.getBoundingClientRect().top - pageGap);
      })).toBeLessThanOrEqual(2);
    }

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 820 });
    await page.goto("/#seed-vault");
    await closeScenarioPanel(page);
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
      const nativeScrollTo = window.scrollTo.bind(window);
      window.__seedVaultSearchScrollBehaviors = [];
      window.scrollTo = (options, ...rest) => {
        if (options && typeof options === "object") {
          window.__seedVaultSearchScrollBehaviors.push(options.behavior);
          return nativeScrollTo({ ...options, behavior: "auto" });
        }
        return nativeScrollTo(options, ...rest);
      };
    });
    const reducedMotionSearch = page.locator("#my-seed-vault [data-seed-vault-hero-search-form='true'] input");
    await reducedMotionSearch.fill("no-vault-entry-matches-this");
    await reducedMotionSearch.press("Enter");
    await expect.poll(() => page.evaluate(() => window.__seedVaultSearchScrollBehaviors?.at(-1))).toBe("auto");

    expect(consoleErrors).toEqual([]);
  });

  test("Seed Vault cards and hero search use existing canonical filters and destinations", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.setViewportSize({ width: 1280, height: 820 });
    await page.goto("/#seed-vault");
    await useFullGrowDemo(page);
    await closeScenarioPanel(page);

    const library = page.locator("#my-seed-vault .seed-vault-library-shell");
    const heroSearch = page.locator("#my-seed-vault [data-seed-vault-hero-search-form='true'] input");
    const searchButton = page.locator("#my-seed-vault .seed-vault-overview-search-submit");
    const initialScrollY = await page.evaluate(() => window.scrollY);
    await heroSearch.fill("no-vault-entry-matches-this");
    await expect(page.locator("#my-seed-vault .seed-vault-results-count")).toContainText("0 of 50 Vault Entries");
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - initialScrollY)).toBeLessThanOrEqual(2);

    await heroSearch.press("Enter");
    await expect.poll(async () => library.evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThanOrEqual(80);
    const libraryScrollY = await page.evaluate(() => window.scrollY);
    await page.locator("#my-seed-vault [data-seed-vault-hero-search-form='true']").evaluate((form) => form.requestSubmit());
    await expect.poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - libraryScrollY)).toBeLessThanOrEqual(2);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator("#my-seed-vault [data-seed-vault-clear-filters='true']").click();
    await expect(page.locator("#my-seed-vault .seed-vault-results-count")).toContainText("50 of 50 Vault Entries");
    await searchButton.click();
    await expect.poll(async () => library.evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThanOrEqual(80);

    const planningCases = [
      { card: ".seed-vault-planning-destination.is-next-grow", filter: "[data-seed-vault-planning-status-filter='true']", value: "planned", quick: "planned" },
      { card: ".seed-vault-planning-destination.is-testing", filter: "[data-seed-vault-testing-program-filter='true']", value: "yes", quick: "testing" },
      { card: ".seed-vault-planning-destination.is-grow-along", filter: "[data-seed-vault-grow-along-filter='true']", value: "yes", quick: "all" },
    ];
    for (const planningCase of planningCases) {
      await page.locator("#my-seed-vault " + planningCase.card).click();
      await expect(page.locator("#my-seed-vault " + planningCase.filter)).toHaveValue(planningCase.value);
      await expect(page.locator("#my-seed-vault [data-seed-vault-quick-view='" + planningCase.quick + "']")).toHaveAttribute("aria-selected", "true");
      await expect.poll(async () => library.evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThanOrEqual(80);
    }

    const collectionCard = page.locator("#my-seed-vault .seed-vault-overview-collection-main").first();
    const collectionName = await collectionCard.getAttribute("data-seed-vault-overview-collection");
    expect(collectionName).toBeTruthy();
    await collectionCard.click();
    await expect(page.locator("#my-seed-vault [data-seed-vault-collection-filter='true']")).toHaveValue(collectionName);
    await expect.poll(async () => library.evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThanOrEqual(80);

    await page.locator("#my-seed-vault .seed-vault-overview-stat.is-sources").click();
    await expect(page.locator("#my-seed-vault .seed-vault-more-filters")).toHaveAttribute("open", "");
    await expect(page.locator("#my-seed-vault [data-seed-vault-source-filter='true']")).toBeFocused();
    await page.locator("#my-seed-vault .seed-vault-overview-stat.is-collections").click();
    await expect.poll(async () => page.locator("#my-seed-vault .seed-vault-overview-collections").evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThanOrEqual(80);

    await page.locator("#my-seed-vault .seed-vault-overview-stat.is-varieties").focus();
    await page.keyboard.press("Enter");
    await expect.poll(async () => library.evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThanOrEqual(80);
    expect(consoleErrors).toEqual([]);
  });

  test("Seed Vault footer settings remain balanced and accessible", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.goto("/#seed-vault");
    await useFullGrowDemo(page);
    await closeScenarioPanel(page);

    const settings = page.locator("#my-seed-vault .seed-vault-secondary-settings");
    const theme = settings.locator(".seed-vault-theme-control");
    const sharing = settings.locator(".seed-vault-share-status");
    const shareButton = sharing.locator("[data-seed-vault-share='true']");
    await expect(settings).toBeVisible();
    await expect(theme).toContainText("Vault Theme");
    await expect(sharing).toHaveAttribute("data-seed-vault-sharing-state", "private");
    await expect(sharing.locator("#seed-vault-sharing-settings-title")).toHaveText("Private Vault");
    await expect(sharing.locator(".seed-vault-sharing-settings-badge")).toHaveText("Private");
    await expect(sharing).toContainText("Only you can view your Vault.");
    await expect(sharing).toContainText("Invite others to view your Vault or collaborate on grows.");
    await expect(shareButton).toHaveAccessibleName("Share Vault for your Seed Vault");

    for (const width of [390, 768, 1024, 1280]) {
      await page.setViewportSize({ width, height: width <= 768 ? 900 : 820 });
      await expect(settings).toBeVisible();
      await expect(theme).toBeVisible();
      await expect(sharing).toBeVisible();
      await expect(shareButton).toBeVisible();
      const geometry = await settings.evaluate((node) => {
        const themeCard = node.querySelector(".seed-vault-theme-control");
        const sharingCard = node.querySelector(".seed-vault-share-status");
        const action = node.querySelector("[data-seed-vault-share='true']");
        const themeRect = themeCard.getBoundingClientRect();
        const sharingRect = sharingCard.getBoundingClientRect();
        const actionRect = action.getBoundingClientRect();
        return {
          theme: { x: themeRect.x, y: themeRect.y, right: themeRect.right, bottom: themeRect.bottom, width: themeRect.width },
          sharing: { x: sharingRect.x, y: sharingRect.y, right: sharingRect.right, bottom: sharingRect.bottom, width: sharingRect.width },
          actionHeight: actionRect.height,
          overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
        };
      });
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.actionHeight).toBeGreaterThanOrEqual(44);
      expect(geometry.theme.x).toBeGreaterThanOrEqual(0);
      expect(geometry.sharing.right).toBeLessThanOrEqual(width + 1);
      if (width > 960) {
        expect(Math.abs(geometry.theme.y - geometry.sharing.y)).toBeLessThanOrEqual(1);
        expect(Math.abs(geometry.theme.bottom - geometry.sharing.bottom)).toBeLessThanOrEqual(1);
        expect(geometry.theme.width).toBeGreaterThan(geometry.sharing.width * 1.6);
      } else {
        expect(Math.abs(geometry.theme.x - geometry.sharing.x)).toBeLessThanOrEqual(1);
        expect(geometry.sharing.y).toBeGreaterThan(geometry.theme.bottom);
      }
    }

    await shareButton.focus();
    await expect(shareButton).toBeFocused();
    const focusTreatment = await shareButton.evaluate((button) => {
      const style = getComputedStyle(button);
      return { outline: style.outlineStyle, shadow: style.boxShadow };
    });
    expect(focusTreatment.outline !== "none" || focusTreatment.shadow !== "none").toBe(true);

    const sharedState = await page.evaluate(() => {
      const host = document.createElement("div");
      host.dataset.seedVaultSharingTestHost = "true";
      host.innerHTML = renderSeedVaultShareStatusMarkup({ visibility: "link", publicSlug: "qa-vault" });
      document.body.append(host);
      const card = host.querySelector(".seed-vault-share-status");
      const result = {
        state: card?.getAttribute("data-seed-vault-sharing-state"),
        title: card?.querySelector("#seed-vault-sharing-settings-title")?.textContent?.trim(),
        badge: card?.querySelector(".seed-vault-sharing-settings-badge")?.textContent?.trim(),
        action: card?.querySelector("[data-seed-vault-share='true'] > span:last-child")?.textContent?.trim(),
      };
      host.remove();
      return result;
    });
    expect(sharedState).toEqual({ state: "shared", title: "Shared Vault", badge: "Share by Link", action: "Manage Sharing" });

    const directShareState = await page.evaluate(() => {
      const previousLoaded = appState.seedVaultUserSharesLoaded;
      const previousShares = appState.seedVaultUserShares;
      appState.seedVaultUserSharesLoaded = true;
      appState.seedVaultUserShares = [{ userId: "qa-grower-one" }, { userId: "qa-grower-two" }];
      const host = document.createElement("div");
      host.innerHTML = renderSeedVaultShareStatusMarkup({ visibility: "private" });
      const card = host.querySelector(".seed-vault-share-status");
      const result = {
        state: card?.getAttribute("data-seed-vault-sharing-state"),
        title: card?.querySelector("#seed-vault-sharing-settings-title")?.textContent?.trim(),
        badge: card?.querySelector(".seed-vault-sharing-settings-badge")?.textContent?.trim(),
        description: card?.querySelector(".seed-vault-sharing-settings-description")?.textContent?.trim(),
        support: card?.querySelector(".seed-vault-sharing-settings-support")?.textContent?.trim(),
      };
      appState.seedVaultUserSharesLoaded = previousLoaded;
      appState.seedVaultUserShares = previousShares;
      return result;
    });
    expect(directShareState).toEqual({
      state: "shared",
      title: "Shared Vault",
      badge: "Direct Share",
      description: "Shared privately with selected people.",
      support: "2 people have direct access.",
    });
    expect(consoleErrors).toEqual([]);
  });

  test("Seed Vault final visual alignment meets the computed design contract", async ({ page }) => {
    test.setTimeout(90_000);
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    for (const [index, width] of [390, 768, 1280].entries()) {
      await page.setViewportSize({ width, height: width === 390 ? 900 : 980 });
      await page.goto("/#seed-vault");
      if (index === 0) await useFullGrowDemo(page);
      await closeScenarioPanel(page);
      await expect(page.locator(".seed-vault-planning-destination")).toHaveCount(3);

      const computed = await page.evaluate(() => {
        const size = (selector) => {
          const box = document.querySelector(selector)?.getBoundingClientRect();
          return box ? { width: box.width, height: box.height } : null;
        };
        const overviewIcons = [...document.querySelectorAll(".seed-vault-overview-stat")].map((stat) => {
          const tile = stat.querySelector(".seed-vault-overview-stat-icon");
          const svg = tile.querySelector("svg");
          const tileBox = tile.getBoundingClientRect();
          const svgBox = svg.getBoundingClientRect();
          const tileStyle = getComputedStyle(tile);
          const beforeStyle = getComputedStyle(tile, "::before");
          const afterStyle = getComputedStyle(tile, "::after");
          return {
            tone: [...stat.classList].find((className) => className.startsWith("is-")),
            color: tileStyle.color,
            borderColor: tileStyle.borderColor,
            glow: tileStyle.boxShadow !== "none" ? tileStyle.boxShadow : tileStyle.filter,
            tileWidth: tileBox.width,
            tileHeight: tileBox.height,
            svgWidth: svgBox.width,
            svgHeight: svgBox.height,
            beforeContent: beforeStyle.content,
            afterContent: afterStyle.content,
          };
        });
        const planningCard = document.querySelector(".seed-vault-planning-destination");
        const planningIcon = planningCard.querySelector(".seed-vault-overview-card-icon").getBoundingClientRect();
        const planningTitle = planningCard.querySelector(":scope > span:not(.seed-vault-overview-card-icon)").getBoundingClientRect();
        return {
          hero: size(".seed-vault-approved-hero"),
          overviewIcons,
          planningTile: size(".seed-vault-overview-card-icon"),
          planningSvg: size(".seed-vault-overview-card-icon svg"),
          sectionSvg: size(".seed-vault-overview-section-icon svg"),
          barHeight: parseFloat(getComputedStyle(planningCard, "::after").height),
          titleGap: planningTitle.left - planningIcon.right,
          titleOverlapsIconRow: planningTitle.top < planningIcon.bottom && planningTitle.bottom > planningIcon.top,
          allIconsUseViewBox: [...document.querySelectorAll(".seed-vault-overview svg, .seed-vault-library-title-icon svg")]
            .every((svg) => svg.hasAttribute("viewBox")),
          overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
        };
      });

      expect(computed.overflow).toBeLessThanOrEqual(1);
      expect(computed.overviewIcons).toHaveLength(4);
      expect(computed.overviewIcons.map(({ tone, color }) => ({ tone, color: normalizeComputedCssColor(color) }))).toEqual([
        { tone: "is-varieties", color: getExpectedSeedVaultOverviewColor("is-varieties") },
        { tone: "is-seeds", color: getExpectedSeedVaultOverviewColor("is-seeds") },
        { tone: "is-sources", color: getExpectedSeedVaultOverviewColor("is-sources") },
        { tone: "is-collections", color: getExpectedSeedVaultOverviewColor("is-collections") },
      ]);
      expect(new Set(computed.overviewIcons.map(({ color }) => color)).size).toBe(4);
      expect(new Set(computed.overviewIcons.map(({ borderColor }) => borderColor)).size).toBe(4);
      expect(new Set(computed.overviewIcons.map(({ glow }) => glow)).size).toBe(4);
      expect(computed.overviewIcons.every(({ glow }) => glow && glow !== "none")).toBe(true);
      expect(computed.overviewIcons.every(({ beforeContent, afterContent }) => beforeContent === "none" && afterContent === "none")).toBe(true);
      expect(computed.planningTile.width).toBeGreaterThanOrEqual(46);
      expect(computed.planningSvg.width).toBeGreaterThanOrEqual(24);
      expect(computed.sectionSvg.width).toBeGreaterThanOrEqual(20);
      expect(computed.barHeight).toBeGreaterThanOrEqual(6);
      expect(computed.titleGap).toBeGreaterThanOrEqual(width === 390 ? 10 : 12);
      expect(computed.titleOverlapsIconRow).toBe(true);
      expect(computed.allIconsUseViewBox).toBe(true);

      if (width === 1280) {
        expect(computed.hero.height).toBeGreaterThanOrEqual(420);
        expect(computed.hero.height).toBeLessThanOrEqual(500);
        expect(computed.overviewIcons.every(({ tileWidth, tileHeight }) => tileWidth >= 54 && tileHeight >= 54)).toBe(true);
        expect(computed.overviewIcons.every(({ svgWidth, svgHeight }) => svgWidth >= 32 && svgHeight >= 32)).toBe(true);
      } else if (width === 390) {
        expect(computed.overviewIcons.every(({ tileWidth, tileHeight }) => tileWidth >= 44 && tileHeight >= 44)).toBe(true);
        expect(computed.overviewIcons.every(({ svgWidth, svgHeight }) => svgWidth >= 28 && svgHeight >= 28)).toBe(true);
      }
    }

    await useMixAndMatch(page);
    const seedVaultScenario = page.locator("select[data-developer-scenario-module='seedVault']");
    await seedVaultScenario.selectOption("empty");
    await expect(page.locator(".seed-vault-overview-stat-icon")).toHaveCount(4);
    await expect(page.locator(".seed-vault-planning-destination")).toHaveCount(3);
    await openScenarioPanel(page);
    await seedVaultScenario.selectOption("small");
    await expect(page.locator("#my-seed-vault .seed-vault-entry-card")).toHaveCount(3);
    await expect(page.locator(".seed-vault-overview-stat-icon")).toHaveCount(4);
    const smallVaultOverview = await page.locator(".seed-vault-overview-stat-icon").evaluateAll((icons) => ({
      colors: icons.map((icon) => getComputedStyle(icon).color),
      overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    }));
    expect(smallVaultOverview.colors.map(normalizeComputedCssColor)).toEqual([
      getExpectedSeedVaultOverviewColor("is-varieties"),
      getExpectedSeedVaultOverviewColor("is-seeds"),
      getExpectedSeedVaultOverviewColor("is-sources"),
      getExpectedSeedVaultOverviewColor("is-collections"),
    ]);
    expect(smallVaultOverview.overflow).toBeLessThanOrEqual(1);

    await page.getByRole("button", { name: "Shared With Me", exact: true }).click();
    await expect(page.locator(".seed-vault-shared-with-me-panel")).toBeVisible();
    expect(await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth))).toBeLessThanOrEqual(1);
    expect(consoleErrors).toEqual([]);
  });
  test("Full Grow Demo exposes the complete Explore graph without backend writes", async ({ page }) => {
    const forbiddenRequests = [];
    page.on("request", (request) => {
      if (/\/rpc\/get_gie_(global|community|my)_analytics/.test(request.url())
        || (["POST", "PUT", "PATCH", "DELETE"].includes(request.method()) && /\/rest\/v1\/|\/storage\/v1\//.test(request.url()))) {
        forbiddenRequests.push(`${request.method()} ${request.url()}`);
      }
    });
    await page.goto("/#seeds");
    await useFullGrowDemo(page);
    await expect(page.locator("#seed-explorer-results .seed-explorer-card, #seed-explorer-results .seed-explorer-list-row")).toHaveCount(91);
    await expect(page.locator(".developer-scenario-page-badge")).toHaveText("Full Grow Demo");
    await expect(page.locator('[data-seed-explorer-filter="all"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-seed-explorer-advanced-filter]:checked")).toHaveCount(0);
    await page.locator("#seed-explorer-search").fill("Sunset Auto Test 3");
    await expect(page.locator("#seed-explorer-results .seed-explorer-card, #seed-explorer-results .seed-explorer-list-row")).toHaveCount(1);
    await page.locator("#seed-explorer-search").fill("");
    await expect(page.locator("#seed-explorer-results .seed-explorer-card, #seed-explorer-results .seed-explorer-list-row")).toHaveCount(91);
    const seedReportHref = await page.locator("#seed-explorer-results a[href^='#seeds/']").first().getAttribute("href");
    await page.goto(`/${seedReportHref}`);
    await expect(page.locator("main")).toContainText("Variety Report");
    expect(await page.evaluate(() => getExploreProvider().varietyReports.length)).toBe(91);
    await page.goto("/#sources");
    await expect(page.locator("main")).toContainText("38 sources");
    await expect(page.locator('[data-source-directory-filter="all"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#source-directory-results-summary")).toHaveText("Showing 12 of 38 matching sources");
    await expect(page.locator("#source-directory-card-results .source-directory-card")).toHaveCount(12);
    await page.locator("#source-directory-search").fill("Northern Lights Collective");
    await expect(page.locator("#source-directory-card-results .source-directory-card")).toHaveCount(1);
    await expect(page.locator("#source-directory-card-results")).toContainText("Northern Lights Collective");
    await page.locator("#source-directory-search").fill("");
    await expect(page.locator("#source-directory-card-results .source-directory-card")).toHaveCount(12);
    for (const expectedCount of [24, 36, 38]) {
      await page.getByRole("button", { name: /Show More Sources/ }).click();
      await expect(page.locator("#source-directory-card-results .source-directory-card")).toHaveCount(expectedCount);
    }
    await expect(page.locator("#source-directory-results-summary")).toHaveText("Showing 38 of 38 matching sources");
    const sourceRanking = await page.evaluate(() => getExploreProvider().rankings.sources.map((row) => ({ name: row.name, rank: row.performanceRank })));
    expect(sourceRanking.map((row) => row.rank)).toEqual(sourceRanking.map((_, index) => index + 1));
    expect(new Set(sourceRanking.map((row) => row.name)).size).toBe(sourceRanking.length);
    expect(sourceRanking.slice(0, 4).map((row) => row.name)).toEqual(["Poppin’ Fire", "Good Genetix", "Chad Westport", "Seedsman"]);
    const sourceHref = await page.locator("#source-directory-card-results a[href^='#sources/']").first().getAttribute("href");
    await page.goto(`/${sourceHref}`);
    await expect(page.locator("main")).toContainText("Source Report");
    await expect(page.locator("main")).not.toContainText("Canonical data is not available");
    await expect(page.locator("main")).not.toContainText("Not enough data");
    await expectNoFullGrowPlaceholders(page);
    const reportCoverage = await page.evaluate(() => {
      const report = getExploreProvider().sourceReports[0];
      return {
        months: report.monthlyTrends.length,
        regions: report.regionalCoverage.regions.length,
        activity: report.recentActivity.length,
        distributionSeeds: report.germinationDistribution.totalSeeds,
      };
    });
    expect(reportCoverage.months).toBeGreaterThan(1);
    expect(reportCoverage.regions).toBeGreaterThan(0);
    expect(reportCoverage.activity).toBeGreaterThan(0);
    expect(reportCoverage.distributionSeeds).toBeGreaterThan(0);
    expect(forbiddenRequests).toEqual([]);
  });

  test("Full Grow Demo controls remain usable at target responsive widths", async ({ page }) => {
    test.slow();
    for (const [index, width] of [320, 375, 390, 430, 768, 1280].entries()) {
      await page.setViewportSize({ width, height: width < 700 ? 844 : 900 });
      await page.goto("/#home");
      await openScenarioPanel(page);
      if (index === 0) {
        await page.getByRole("button", { name: "Full Grow Demo", exact: true }).click();
        await openScenarioPanel(page);
      }
      await expect(page.getByRole("button", { name: "Full Grow Demo", exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("[data-developer-scenario-module]")).toHaveCount(0);
      await expect(page.locator(".developer-scenarios-full-demo-card")).toBeVisible();
      await expect(page.locator(".developer-scenario-page-badge")).toContainText("Full Grow Demo");
      const panelBox = await page.locator("#developer-scenarios-panel").boundingBox();
      expect(panelBox.x).toBeGreaterThanOrEqual(0);
      expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(width);
      expect(panelBox.y).toBeGreaterThanOrEqual(0);
      expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(width < 700 ? 844 : 900);
      const launcherGeometry = await page.locator("#developer-scenarios-launcher").evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, position: style.position, zIndex: Number(style.zIndex) };
      });
      expect(launcherGeometry.position).toBe("fixed");
      expect(launcherGeometry.zIndex).toBeGreaterThanOrEqual(10000);
      expect(launcherGeometry.left).toBeGreaterThanOrEqual(0);
      expect(launcherGeometry.right).toBeLessThanOrEqual(width);
      expect(launcherGeometry.top).toBeGreaterThanOrEqual(0);
      expect(launcherGeometry.bottom).toBeLessThanOrEqual(width < 700 ? 844 : 900);
      const horizontalOverflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
      expect(horizontalOverflow).toBeLessThanOrEqual(1);
    }
  });

  test("supports independent normalized providers and persists choices", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(`${message.text()} @ ${message.location().url || "unknown"}`);
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    await page.goto("/#home");
    await useFullGrowDemo(page);
    await useMixAndMatch(page);
    await page.locator("select[data-developer-scenario-module='seedVault']").selectOption("first");
    await openScenarioPanel(page);
    await page.locator("select[data-developer-scenario-module='sessions']").selectOption("multiple-active");
    await openScenarioPanel(page);
    await page.locator("select[data-developer-scenario-module='profile']").selectOption("community-leader");
    await openScenarioPanel(page);
    await page.locator("select[data-developer-scenario-module='community']").selectOption("empty");
    await openScenarioPanel(page);
    await page.locator("select[data-developer-scenario-module='explore']").selectOption("healthy");

    await page.goto("/#sessions");
    await expect(page.locator(".developer-scenario-page-badge")).toContainText("Multiple Active Sessions");
    await page.reload();
    await expect(page.locator(".developer-scenario-page-badge")).toContainText("Multiple Active Sessions");
    const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
    expect(saved.selections).toMatchObject({ seedVault: "first", sessions: "multiple-active", profile: "community-leader", community: "empty", explore: "healthy" });

    await page.goto("/#profile");
    await expect(page.locator(".developer-scenario-page-badge")).toContainText("Community Leader");
    await expect(page.locator(".profile-page")).toContainText("222");
    await page.goto("/#gallery");
    await expect(page.locator(".developer-scenario-page-badge")).toContainText("Empty Community");
    await page.goto("/#seed-vault");
    await expect(page.locator(".developer-scenario-page-badge")).toContainText("First Seed");
    await expect(page.locator("#my-seed-vault")).toContainText("1 Vault Entry");
    await page.goto("/#analytics");
    await expect(page.locator("[href*='scenario-'], [data-session-id^='scenario-'], [data-snapshot-id^='scenario-']")).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });

  test("blocks preview writes and does not issue backend mutations", async ({ page }) => {
    const backendMutations = [];
    page.on("request", (request) => {
      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method()) && /\/rest\/v1\/|\/storage\/v1\//.test(request.url())) {
        backendMutations.push(`${request.method()} ${request.url()}`);
      }
    });
    await page.goto("/#seed-vault");
    await useFullGrowDemo(page);
    await page.getByRole("button", { name: "Close Preview Studio", exact: true }).click();
    let dialogMessage = "";
    page.once("dialog", async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });
    await page.locator("[data-seed-vault-add='true']").click();
    expect(dialogMessage).toBe("Preview Studio data is preview-only and cannot be saved or published.");
    expect(backendMutations).toEqual([]);
  });

  test("handles malformed saved state and reset safely", async ({ page }) => {
    await page.addInitScript((key) => localStorage.setItem(key, "{not-json"), STORAGE_KEY);
    await page.goto("/#home");
    await expect(page.locator("#developer-scenarios-launcher")).toContainText("LIVE");
    await openScenarioPanel(page);
    await expect(page.getByRole("button", { name: "Live Data", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Full Grow Demo", exact: true }).click();
    await openScenarioPanel(page);
    await page.getByRole("button", { name: "Reset Demo", exact: true }).click();
    await expect(page.locator("#developer-scenarios-banner")).toBeVisible();
    await openScenarioPanel(page);
    await expect(page.getByRole("button", { name: "Full Grow Demo", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("One synchronized, fully populated sample ecosystem across Grow.", { exact: true })).toBeVisible();
  });

  test("keeps session cards, analytics, and ready-result details on one fixture", async ({ page }) => {
    await page.goto("/#sessions");
    await useFullGrowDemo(page);
    await useMixAndMatch(page);
    await page.locator("select[data-developer-scenario-module='sessions']").selectOption("multiple-active");
    await expect(page.locator("[data-session-history-row^='scenario-']")).toHaveCount(3);
    await expect(page.locator("#session-analytics")).toContainText("Scenario Analytics");
    await expect(page.locator("#session-analytics")).toContainText("Completed vs Active Sessions");

    await openScenarioPanel(page);
    await page.locator("select[data-developer-scenario-module='sessions']").selectOption("ready");
    await page.goto("/#sessions/scenario-session-ready-1");
    await expect(page.locator("#detail-session-result-breakdown")).toBeVisible();
    await expect(page.locator("#detail-session-result-breakdown")).not.toContainText("Pending");
  });

  test("renders Community scenario analytics and cards from the same records", async ({ page }) => {
    await page.goto("/#gallery");
    await useFullGrowDemo(page);
    await useMixAndMatch(page);
    await page.locator("select[data-developer-scenario-module='community']").selectOption("growing");
    await expect(page.locator(".developer-scenario-page-badge")).toContainText("Sample Community Data");
    await expect(page.getByRole("heading", { name: "Scenario Community Analytics" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Scenario Leaderboards" })).toBeVisible();
    await expect(page.locator("#gallery-grid .gallery-card")).toHaveCount(4);
    await expect(page.locator("[data-community-intelligence-section='canonical-overview']")).not.toContainText("Loading");
    await page.goto("/#community-insights");
    await expect(page.locator("main")).not.toContainText("Loading");
    await expect(page.locator("main")).toContainText("Seedsman");
  });

  test("keeps profile summary, trend, identity, and recognition on one profile fixture", async ({ page }) => {
    await page.goto("/#profile");
    await useFullGrowDemo(page);
    await useMixAndMatch(page);
    await page.locator("select[data-developer-scenario-module='profile']").selectOption("community-leader");
    await page.goto("/#network");
    await expect(page.locator(".developer-scenario-page-badge")).toContainText("Community Leader");
    await expect(page.locator(".grow-network-page")).toContainText("Community Leader");
    await expect(page.locator(".grow-network-page")).toContainText("222");
    await expect(page.locator(".grow-network-page")).toContainText("93%");
    await expect(page.getByRole("heading", { name: "Germination Trend" })).toBeVisible();
    await expect(page.locator(".grow-network-page")).not.toContainText("Complete a session and record results to begin your Germination Trend.");
  });

  test("keeps the approved Seed Vault overview, planning, collections, and Library insights on one fixture", async ({ page }) => {
    await page.goto("/#seed-vault");
    await useFullGrowDemo(page);
    await useMixAndMatch(page);
    await page.locator("select[data-developer-scenario-module='seedVault']").selectOption("first");
    await expect(page.locator("#my-seed-vault")).toContainText("1 Vault Entry");
    await expect(page.locator(".seed-vault-overview-planning")).toContainText("Next Grow");
    await expect(page.locator(".seed-vault-overview-collections")).toContainText("Collections");
    await expect(page.locator(".seed-vault-overview-recent-activity")).toContainText("Recent Activity");
    await expect(page.locator(".seed-vault-sharing-hub")).toContainText("Share Your Vault");
    await expect(page.locator(".seed-vault-library-shell .seed-vault-insights")).toContainText("Insights");
    await expect(page.locator(".seed-vault-overview")).not.toContainText("Quick Insights");
    await expect(page.locator("#my-seed-vault")).not.toContainText("Loading");
  });

  test("renders Explore scenarios without canonical GIE requests or fixture leakage", async ({ page }) => {
    const scenarioGieRequests = [];
    await page.goto("/#seeds");
    await useFullGrowDemo(page);
    await useMixAndMatch(page);
    await page.locator("select[data-developer-scenario-module='explore']").selectOption("healthy");
    page.on("request", (request) => {
      if (/\/rpc\/get_gie_(global|community|my)_analytics/.test(request.url())) scenarioGieRequests.push(request.url());
    });
    await page.goto("/#seeds");
    await expect(page.locator(".developer-scenario-page-badge")).toContainText("Sample Explore Analytics");
    await expect(page.locator("#seed-explorer-results .seed-explorer-card, #seed-explorer-results .seed-explorer-list-row")).toHaveCount(4);
    const firstSeedReportHref = await page.locator("#seed-explorer-results a[href^='#seeds/']").first().getAttribute("href");
    await page.goto(`/${firstSeedReportHref}`);
    await expect(page.locator("main")).toContainText("Community Sessions");
    await expect(page.locator("main")).not.toContainText("Canonical analytics are unavailable");
    await page.goto("/#sources");
    await expect(page.locator("#source-directory-card-results .source-directory-card")).toHaveCount(2);
    const firstSourceReportHref = await page.locator("#source-directory-card-results a[href^='#sources/']").first().getAttribute("href");
    await page.goto(`/${firstSourceReportHref}`);
    await expect(page.locator("main")).toContainText("Source Report");
    await expect(page.locator("main")).not.toContainText("Canonical data is not available");
    expect(scenarioGieRequests).toEqual([]);

    await openScenarioPanel(page);
    await page.getByRole("button", { name: "Return to Live Data", exact: true }).click();
    await expect(page.locator("[href*='scenario-explore'], [data-seed-id^='scenario-explore']")).toHaveCount(0);
  });
  test("enforces one physical seed per affected method row", async ({ page }) => {
    await page.goto("/#home");
    await useFullGrowDemo(page);
    const audit = await page.evaluate(() => {
      const methodUi = ["ROCKWOOL", "RAPID_ROOTER", "DIRECT_SOW"].map((methodType) => {
        const method = getMethodConfig(methodType);
        const partition = createPartitionsForSystem(methodType, 1)[0];
        const host = document.createElement("div");
        host.dataset.methodType = methodType;
        const row = buildPartitionFormCard(partition, 0, {
          methodType,
          rowLabel: method.rowLabel,
        });
        host.appendChild(row);
        document.body.appendChild(host);
        hydratePartitionRow(row, partition);
        bindWholeSeedCountInputGuards(host);
        const seedInput = row.querySelector('input[name^="seedCount-"]');
        const resultInput = row.querySelector('input[name="plantedCount"]');
        seedInput.value = "9";
        seedInput.dispatchEvent(new Event("input", { bubbles: true }));
        const seedAfterProgrammaticInput = seedInput.value;
        resultInput.value = "2";
        resultInput.dispatchEvent(new Event("input", { bubbles: true }));
        const invalidResultAfterInput = resultInput.value;
        resultInput.value = "1";
        resultInput.dispatchEvent(new Event("input", { bubbles: true }));
        const validResultAfterInput = resultInput.value;
        const details = {
          methodType,
          rowLabel: method.rowLabel,
          addLabel: `+ Add ${method.rowLabel}`,
          seedValue: seedInput.value,
          seedReadOnly: seedInput.readOnly,
          seedAriaReadOnly: seedInput.getAttribute("aria-readonly"),
          resultPattern: resultInput.getAttribute("pattern"),
          resultMaxLength: resultInput.maxLength,
          seedAfterProgrammaticInput,
          invalidResultAfterInput,
          validResultAfterInput,
        };
        host.remove();
        return details;
      });

      const graph = getFullGrowDemoGraph();
      const affectedFixtureSessions = [...graph.sessions, ...graph.draftSessions]
        .filter((session) => isSingleSeedPositionMethod(session.systemType));
      const affectedFixtureRowsValid = affectedFixtureSessions.every((session) => (
        session.partitions.every((partition) => Number(partition.seedCount) === 1 && ["0", "1"].includes(String(partition.plantedCount)))
        && validateSessionSingleSeedPositionRules(session).isValid
        && getSessionResultSummary(session, { includePendingCustomResults: true }).overall.totalSeeds === session.partitions.length
      ));

      const legacy = normalizeStoredSession({
        id: "legacy-rockwool",
        systemType: "ROCKWOOL",
        sessionStatus: "completed",
        partitions: [{ id: 1, seedCount: 4, plantedCount: "3" }],
      });
      const legacyOriginalValid = validateSessionSingleSeedPositionRules(legacy).isValid;
      legacy.partitions[0].seedCount = 5;
      const legacyIncreaseRejected = !validateSessionSingleSeedPositionRules(legacy).isValid;
      legacy.partitions[0].seedCount = 4;

      return {
        methodUi,
        aliases: {
          rockWool: normalizeMethodType("Rock Wool"),
          rapidRooter: normalizeMethodType("Rapid Rooter"),
          starterPlug: normalizeMethodType("Starter Plug"),
          plantingPosition: normalizeMethodType("Planting Position"),
        },
        successDisplays: [formatSuccessPercent(1, 0), formatSuccessPercent(1, 1)],
        affectedFixtureSessionCount: affectedFixtureSessions.length,
        affectedFixtureRowsValid,
        legacyOriginalValid,
        legacyIncreaseRejected,
        legacyBaselineNotPersisted: !JSON.stringify(legacy).includes(SINGLE_SEED_POSITION_LEGACY_BASELINE_PROPERTY),
        newMultiSeedRejected: !validateSessionSingleSeedPositionRules({
          systemType: "DIRECT_SOW",
          sessionStatus: "completed",
          partitions: [{ id: 1, seedCount: 2, plantedCount: "1" }],
        }).isValid,
        validBinaryRowAccepted: validateSessionSingleSeedPositionRules({
          systemType: "RAPID_ROOTER",
          sessionStatus: "completed",
          partitions: [{ id: 1, seedCount: 1, plantedCount: "0" }],
        }).isValid,
      };
    });

    expect(audit.methodUi).toEqual([
      expect.objectContaining({ methodType: "ROCKWOOL", rowLabel: "Cube", addLabel: "+ Add Cube" }),
      expect.objectContaining({ methodType: "RAPID_ROOTER", rowLabel: "Plug", addLabel: "+ Add Plug" }),
      expect.objectContaining({ methodType: "DIRECT_SOW", rowLabel: "Planting Position", addLabel: "+ Add Planting Position" }),
    ]);
    for (const method of audit.methodUi) {
      expect(method).toMatchObject({
        seedValue: "1",
        seedReadOnly: true,
        seedAriaReadOnly: "true",
        resultPattern: "[01]",
        resultMaxLength: 1,
        seedAfterProgrammaticInput: "1",
        invalidResultAfterInput: "",
        validResultAfterInput: "1",
      });
    }
    expect(audit.aliases).toEqual({
      rockWool: "ROCKWOOL",
      rapidRooter: "RAPID_ROOTER",
      starterPlug: "RAPID_ROOTER",
      plantingPosition: "DIRECT_SOW",
    });
    expect(audit.successDisplays).toEqual(["0%", "100%"]);
    expect(audit.affectedFixtureSessionCount).toBeGreaterThan(0);
    expect(audit.affectedFixtureRowsValid).toBe(true);
    expect(audit.legacyOriginalValid).toBe(true);
    expect(audit.legacyIncreaseRejected).toBe(true);
    expect(audit.legacyBaselineNotPersisted).toBe(true);
    expect(audit.newMultiSeedRejected).toBe(true);
    expect(audit.validBinaryRowAccepted).toBe(true);
  });
});
