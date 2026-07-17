const { test, expect } = require("@playwright/test");
const { enableFounderLocalQa } = require("./support/founder-smoke");

const STORAGE_KEY = "grow_developer_scenarios_v1";
const LEGACY_STORAGE_KEYS = ["cannakan-grow-sample-seed-version", "cannakanGrowMockDataEnabled", "cannakanMockGalleryLikes", "cannakanMockGalleryLikes:legacy-user", "cannakanSeedAgeAnalyticsMockData"];

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

async function useFullGrowDemo(page) {
  await openScenarioPanel(page);
  await page.getByRole("button", { name: "Full Grow Demo", exact: true }).click();
  await expect(page.locator("#developer-scenarios-banner")).toContainText("FULL GROW DEMO");
}

async function closeScenarioPanel(page) {
  const launcher = page.locator("#developer-scenarios-launcher");
  if ((await launcher.getAttribute("aria-expanded")) === "true") await launcher.click();
  await expect(page.locator("#developer-scenarios-panel")).toBeHidden();
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
    const methodBadges = historyRows.locator("[data-session-history-method]");
    await expect(methodBadges).toHaveCount(23);
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
    await expect(rockwoolCard).toContainText("Keep Cubes Moist");
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
    await expect(inventoryCards).toHaveCount(50);
    await expect(page.locator(".seed-vault-expanded-profile")).toHaveCount(0);
    await expect(page.locator(".seed-vault-entry-details--lazy")).toHaveCount(50);

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
    await expect(page.locator(".seed-vault-entry-details--lazy")).toHaveCount(49);
    const profile = firstCard.locator(".seed-vault-expanded-profile");
    for (const sectionName of ["Overview", "Planning & Collections", "Sessions & Analytics", "Notes", "Images"]) {
      await expect(profile).toContainText(sectionName);
    }
    await firstCard.getByRole("button", { name: "Close Entry Profile", exact: true }).click();

    await page.locator('[data-seed-vault-quick-view="favorites"]').click();
    await expect(page.locator(".seed-vault-browse-context")).toContainText("Favorites");
    await expect(page.locator(".seed-vault-browse-context")).toContainText("10 matching Vault Entries");
    await expect(inventoryCards).toHaveCount(10);
    await page.getByRole("button", { name: "View All Inventory", exact: true }).click();
    await expect(inventoryCards).toHaveCount(50);

    const inventoryControls = page.locator(".seed-vault-controls");
    const inventorySearch = inventoryControls.locator('[data-seed-vault-search="true"]');
    await inventorySearch.fill("Do-Si-Dos");
    await expect(inventoryCards).toHaveCount(1);
    await page.locator('.seed-vault-sort-control [data-seed-vault-sort="true"]').selectOption("quantity");
    await expect(page.locator('.seed-vault-sort-control [data-seed-vault-sort="true"]')).toHaveValue("quantity");
    await inventorySearch.fill("");
    await inventoryControls.locator('[data-seed-vault-favorite-filter="true"]').selectOption("favorites");
    await expect(inventoryCards).toHaveCount(10);
    await inventoryControls.locator('[data-seed-vault-clear-filters="true"]').click();
    await expect(inventoryCards).toHaveCount(50);

    await page.locator(".seed-vault-more-filters > summary").click();
    await expect(page.locator(".seed-vault-more-filters-panel")).toBeVisible();
    await expect(page.locator(".seed-vault-more-filters-panel [data-seed-vault-manage-collections='true']")).toBeVisible();
    const sourceFilter = page.locator('.seed-vault-more-filters [data-seed-vault-source-filter="true"]');
    const firstSourceValue = await sourceFilter.locator("option").nth(1).getAttribute("value");
    await sourceFilter.selectOption(firstSourceValue);
    expect(await inventoryCards.count()).toBeLessThan(50);
    await inventoryControls.locator('[data-seed-vault-clear-filters="true"]').click();
    await expect(inventoryCards).toHaveCount(50);

    const filterCases = [
      { selector: '[data-seed-vault-status-filter="true"]', advanced: false },
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
      if (filterCase.advanced && !await page.locator(".seed-vault-more-filters-panel").isVisible()) {
        await page.locator(".seed-vault-more-filters > summary").click();
      }
      const filter = inventoryControls.locator(filterCase.selector);
      const optionValue = await filter.locator("option").nth(1).getAttribute("value");
      await filter.selectOption(optionValue);
      await expect(inventoryControls.locator(filterCase.selector)).toHaveValue(optionValue);
      await expect(inventoryControls.locator('[data-seed-vault-clear-filters="true"]')).toBeVisible();
      await inventoryControls.locator('[data-seed-vault-clear-filters="true"]').click();
      await expect(inventoryCards).toHaveCount(50);
    }

    await page.locator('[data-seed-vault-layout="gallery"]').click();
    await expect(page.locator(".seed-vault-entry-grid")).toHaveClass(/seed-vault-entry-grid--gallery/);
    await page.locator('[data-seed-vault-layout="list"]').click();
    await expect(page.locator(".seed-vault-entry-grid")).toHaveClass(/seed-vault-entry-grid--list/);

    await useMixAndMatch(page);
    const seedVaultScenario = page.locator("select[data-developer-scenario-module='seedVault']");
    await seedVaultScenario.selectOption("empty");
    await expect(inventoryCards).toHaveCount(0);
    await expect(page.locator(".seed-vault-approved-hero")).toBeVisible();
    await expect(page.locator(".seed-vault-library-shell")).toBeVisible();
    await openScenarioPanel(page);
    await seedVaultScenario.selectOption("small");
    await expect(inventoryCards).toHaveCount(3);
    await openScenarioPanel(page);
    await seedVaultScenario.selectOption("collector");
    await expect(page.locator(".developer-scenario-page-badge")).toContainText("Collector Vault");
    await expect(inventoryCards).toHaveCount(9);
    expect(consoleErrors).toEqual([]);
  });

  test("Seed Vault 3.0 stays centered, capped, stacked, and overflow-free", async ({ page }) => {
    for (const [index, width] of [320, 375, 390, 430, 768, 1024, 1280, 1600].entries()) {
      await page.setViewportSize({ width, height: width < 700 ? 844 : 980 });
      await page.goto("/#seed-vault");
      if (index === 0) await useFullGrowDemo(page);
      await expect(page.locator("#my-seed-vault .seed-vault-entry-card")).toHaveCount(50);
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
      expect(computed.overviewIcons.map(({ tone, color }) => ({ tone, color }))).toEqual([
        { tone: "is-varieties", color: "rgb(157, 232, 79)" },
        { tone: "is-seeds", color: "rgb(181, 233, 101)" },
        { tone: "is-sources", color: "rgb(67, 217, 245)" },
        { tone: "is-collections", color: "rgb(200, 124, 242)" },
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
    expect(smallVaultOverview.colors).toEqual([
      "rgb(157, 232, 79)",
      "rgb(181, 233, 101)",
      "rgb(67, 217, 245)",
      "rgb(200, 124, 242)",
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
