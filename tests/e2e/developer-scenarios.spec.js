const { test, expect } = require("@playwright/test");
const { enableFounderLocalQa } = require("./support/founder-smoke");

const STORAGE_KEY = "grow_developer_scenarios_v1";

async function openScenarioPanel(page) {
  const launcher = page.locator("#developer-scenarios-launcher");
  await expect(launcher).toBeVisible();
  if ((await launcher.getAttribute("aria-expanded")) !== "true") {
    await launcher.click();
  }
  await expect(page.locator("#developer-scenarios-panel")).toBeVisible();
}

async function useMixAndMatch(page) {
  await openScenarioPanel(page);
  await page.getByRole("button", { name: "Mix & Match", exact: true }).click();
  await openScenarioPanel(page);
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

  test("defaults off and restores live data without a refresh", async ({ page }) => {
    await page.goto("/#sessions");
    await expect(page.locator("#developer-scenarios-launcher")).toContainText("OFF");
    await expect(page.locator("#developer-scenarios-banner")).toHaveCount(0);
    await openScenarioPanel(page);
    await page.getByRole("button", { name: "Enable Scenarios", exact: true }).click();
    await expect(page.locator("#developer-scenarios-banner")).toContainText("NOTHING WILL BE SAVED");
    await expect(page.locator(".developer-scenario-page-badge")).toContainText("Full Grow Demo");

    await openScenarioPanel(page);
    await page.getByRole("button", { name: "Return to Live Data", exact: true }).click();
    await expect(page.locator("#developer-scenarios-banner")).toHaveCount(0);
    await expect(page.locator(".developer-scenario-page-badge")).toHaveCount(0);
    await expect(page.locator("#developer-scenarios-launcher")).toContainText("OFF");
  });

  test("Full Grow Demo synchronizes sessions, Vault, Profile, and Community", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    await page.goto("/#home");
    await openScenarioPanel(page);
    await page.getByRole("button", { name: "Enable Scenarios", exact: true }).click();
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
        kanEvidence: graph.exploreEvidenceSessions.filter((session) => session.method === "KAN").length,
        sessionImages: [...graph.sessions, ...graph.draftSessions].filter((session) => session.sessionImages.length).length,
        vaultImages: graph.vaultEntries.filter((entry) => entry.varietyImageUrl || entry.thumbnailUrl).length,
        evidenceImages: graph.exploreEvidenceSessions.filter((session) => session.imageUrl).length,
        communityImages: graph.communitySnapshots.filter((snapshot) => snapshot.imageUrl).length,
        profileCompleted: graph.profileAnalytics.completedSessions,
        profileActive: graph.profileAnalytics.activeSessions,
        profileVaultEntries: graph.profileAnalytics.seedVault.overview.totalVarieties,
        profileVaultSeeds: graph.profileAnalytics.seedVault.overview.totalSeedsOwned,
        recognitions: graph.recognition.recognitions.length,
        networkGrowers: graph.network.growers.length,
        methods: [...graph.activeSessions, ...graph.completedSessions, ...graph.draftSessions].map((session) => session.systemType),
        evidenceMethods: graph.exploreEvidenceSessions.reduce((counts, session) => {
          counts[session.method] = (counts[session.method] || 0) + 1;
          return counts;
        }, {}),
      };
    });
    expect(graphSummary).toMatchObject({
      sessions: 21,
      active: 4,
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
      kanEvidence: 115,
      sessionImages: 15,
      vaultImages: 38,
      evidenceImages: 87,
      profileCompleted: 15,
      profileActive: 4,
      profileVaultEntries: 50,
      profileVaultSeeds: 265,
      recognitions: 9,
      networkGrowers: 7,
      evidenceMethods: { KAN: 115, TRA: 23, PAPER_TOWEL: 16, ROCKWOOL: 5, RAPID_ROOTER: 6, WATER_SOAK: 7, DIRECT_SOW: 4, OTHER: 4 },
    });
    expect(graphSummary.communityImages).toBeGreaterThan(15);
    expect(graphSummary.communityImages).toBeLessThan(30);
    expect(new Set(graphSummary.methods)).toEqual(new Set(["KAN", "TRA", "PAPER_TOWEL", "ROCKWOOL", "RAPID_ROOTER", "WATER_SOAK", "DIRECT_SOW", "OTHER"]));
    await expect(page.locator("[data-session-history-row^='scenario-full-grow-session-']")).toHaveCount(6);
    await expect(page.locator("main")).toContainText("PAPER_TOWEL");
    await expect(page.locator("main")).toContainText("TRā");
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

  test("Full Grow Demo exposes the complete Explore graph without backend writes", async ({ page }) => {
    const forbiddenRequests = [];
    page.on("request", (request) => {
      if (/\/rpc\/get_gie_(global|community|my)_analytics/.test(request.url())
        || (["POST", "PUT", "PATCH", "DELETE"].includes(request.method()) && /\/rest\/v1\/|\/storage\/v1\//.test(request.url()))) {
        forbiddenRequests.push(`${request.method()} ${request.url()}`);
      }
    });
    await page.goto("/#seeds");
    await openScenarioPanel(page);
    await page.getByRole("button", { name: "Enable Scenarios", exact: true }).click();
    await expect(page.locator("#seed-explorer-results .seed-explorer-card, #seed-explorer-results .seed-explorer-list-row")).toHaveCount(91);
    await expect(page.locator(".developer-scenario-page-badge")).toContainText("Developer Scenario — Sample Explore Analytics · Full Grow Demo");
    await page.goto("/#sources");
    await expect(page.locator("main")).toContainText("38 sources");
    await expect(page.locator("#source-directory-card-results .source-directory-card")).toHaveCount(12);
    const topSources = await page.evaluate(() => getExploreProvider().rankings.sources.slice(0, 4).map((row) => row.name));
    expect(topSources).toEqual(["Seedsman", "Poppin’ Fire", "Good Genetix", "Chad Westport"]);
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
    for (const [index, width] of [320, 375, 390, 430, 768, 1280].entries()) {
      await page.setViewportSize({ width, height: width < 700 ? 844 : 900 });
      await page.goto("/#home");
      await openScenarioPanel(page);
      if (index === 0) {
        await page.getByRole("button", { name: "Enable Scenarios", exact: true }).click();
        await openScenarioPanel(page);
      }
      await expect(page.getByRole("button", { name: "Unified Demo", exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("select[data-developer-unified-scenario]")).toBeVisible();
      await expect(page.locator(".developer-scenario-page-badge")).toContainText("Full Grow Demo");
      const panelBox = await page.locator("#developer-scenarios-panel").boundingBox();
      expect(panelBox.x).toBeGreaterThanOrEqual(0);
      expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(width);
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
    await openScenarioPanel(page);
    await page.getByRole("button", { name: "Enable Scenarios", exact: true }).click();
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
    await openScenarioPanel(page);
    await page.getByRole("button", { name: "Enable Scenarios", exact: true }).click();
    await page.getByRole("button", { name: "Close Developer Scenarios", exact: true }).click();
    let dialogMessage = "";
    page.once("dialog", async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });
    await page.locator("[data-seed-vault-add='true']").click();
    expect(dialogMessage).toBe("Developer Scenario data is preview-only and cannot be saved or published.");
    expect(backendMutations).toEqual([]);
  });

  test("handles malformed saved state and reset safely", async ({ page }) => {
    await page.addInitScript((key) => localStorage.setItem(key, "{not-json"), STORAGE_KEY);
    await page.goto("/#home");
    await expect(page.locator("#developer-scenarios-launcher")).toContainText("OFF");
    await openScenarioPanel(page);
    await page.getByRole("button", { name: "Reset Scenario", exact: true }).click();
    await expect(page.locator("#developer-scenarios-banner")).toBeVisible();
    await openScenarioPanel(page);
    await expect(page.locator("select[data-developer-unified-scenario]")).toHaveValue("full-grow-demo");
    await expect(page.getByText("One synchronized sample ecosystem across the entire app.", { exact: true })).toBeVisible();
  });

  test("keeps session cards, analytics, and ready-result details on one fixture", async ({ page }) => {
    await page.goto("/#sessions");
    await openScenarioPanel(page);
    await page.getByRole("button", { name: "Enable Scenarios", exact: true }).click();
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
    await openScenarioPanel(page);
    await page.getByRole("button", { name: "Enable Scenarios", exact: true }).click();
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
    await openScenarioPanel(page);
    await page.getByRole("button", { name: "Enable Scenarios", exact: true }).click();
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

  test("keeps Seed Vault overview, planning, collections, and insights on one fixture", async ({ page }) => {
    await page.goto("/#seed-vault");
    await openScenarioPanel(page);
    await page.getByRole("button", { name: "Enable Scenarios", exact: true }).click();
    await useMixAndMatch(page);
    await page.locator("select[data-developer-scenario-module='seedVault']").selectOption("first");
    await expect(page.locator("#my-seed-vault")).toContainText("1 Vault Entry");
    await expect(page.locator(".seed-vault-overview-planning")).toContainText("Grow Planning");
    await expect(page.locator(".seed-vault-overview-collections")).toContainText("Next Grow");
    await expect(page.locator(".seed-vault-overview-insights")).toContainText("Quick Insights");
    await expect(page.locator("#my-seed-vault")).not.toContainText("Loading");
  });

  test("renders Explore scenarios without canonical GIE requests or fixture leakage", async ({ page }) => {
    const scenarioGieRequests = [];
    await page.goto("/#seeds");
    await openScenarioPanel(page);
    await page.getByRole("button", { name: "Enable Scenarios", exact: true }).click();
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
});
