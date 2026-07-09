const assert = require("assert");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { chromium } = require("@playwright/test");

const repoRoot = path.resolve(__dirname, "..");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function createStaticServer() {
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
    const relativePath = decodeURIComponent(requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname);
    const targetPath = path.resolve(repoRoot, `.${relativePath}`);
    if (!targetPath.startsWith(repoRoot)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.readFile(targetPath, (error, contents) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      response.writeHead(200, {
        "Content-Type": MIME_TYPES[path.extname(targetPath).toLowerCase()] || "application/octet-stream",
      });
      response.end(contents);
    });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${server.address().port}`,
      });
    });
  });
}

async function prepareLocalQaStorage(page) {
  await page.addInitScript(() => {
    localStorage.setItem("cannakanGrowDevQaBypass", "true");
    localStorage.setItem("cannakanGrowProfileSetupComplete:local-dev-qa-user", "true");
    localStorage.setItem("cannakanGrowMethodSetupPreferences", "{}");
    localStorage.removeItem("cannakanGrowSessionMethodSetup");
  });
}

async function applySetupChoice(page, scenario) {
  if (scenario.paperTowelChoice) {
    await page.waitForSelector(
      `#paper-towel-setup-modal-overlay [data-paper-towel-setup='${scenario.paperTowelChoice}']`,
      { timeout: 10000 },
    );
    await page.click(`#paper-towel-setup-modal-overlay [data-paper-towel-setup='${scenario.paperTowelChoice}']`);
    await page.waitForFunction(() => !document.querySelector("#paper-towel-setup-modal-overlay"));
  }

  if (scenario.preparedMediaChoice) {
    await page.waitForSelector(
      `#prepared-media-setup-modal-overlay [data-prepared-media-choice='${scenario.preparedMediaChoice}']`,
      { timeout: 10000 },
    );
    await page.click(`#prepared-media-setup-modal-overlay [data-prepared-media-choice='${scenario.preparedMediaChoice}']`);
    await page.waitForFunction(() => !document.querySelector("#prepared-media-setup-modal-overlay"));
  }
}

async function assertDraftStartsAtStart(page, baseUrl, scenario) {
  await page.goto(`${baseUrl}/#new/${scenario.routeMethod}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("form#session-form select[name='systemType']", { timeout: 10000 });
  await page.evaluate(() => {
    localStorage.setItem("cannakanGrowMethodSetupPreferences", "{}");
    localStorage.removeItem("cannakanGrowSessionMethodSetup");
  });
  await applySetupChoice(page, scenario);
  await page.waitForTimeout(250);

  const state = await page.evaluate(() => {
    const form = document.querySelector("form#session-form");
    const lifecycle = buildFormLifecycleState(form);
    const visualCurrent = document.querySelector("#session-engine-visual-timeline .session-engine-visual-timeline-step.is-current");
    const companionCurrent = document.querySelector("#session-lifecycle-progress .session-progress-companion-roadmap-step.is-current");
    const phaseTitle = document.querySelector("#session-lifecycle-progress .session-progress-companion-hero h4");
    return {
      savedSessionId: form.dataset.savedSessionId || "",
      selectedMethod: form.elements.systemType.value,
      isDraftSession: lifecycle.engineState?.isDraftSession === true,
      lifecycleStartedAt: lifecycle.startedAt ? lifecycle.startedAt.toISOString() : "",
      engineStartedAt: lifecycle.engineState?.startedAt || "",
      phaseLabel: lifecycle.engineState?.phaseLabel || "",
      currentPhaseKey: lifecycle.engineState?.currentPhase?.key || "",
      currentStepLabel: lifecycle.engineState?.timelineSteps?.find((step) => step.isCurrent)?.label || "",
      timelineStepKeys: (lifecycle.engineState?.timelineSteps || []).map((step) => step.key),
      visualCurrentText: visualCurrent?.innerText || "",
      companionCurrentText: companionCurrent?.innerText || "",
      phaseTitleText: phaseTitle?.innerText || "",
    };
  });

  assert.equal(state.savedSessionId, "", `${scenario.name} should still be unsaved.`);
  assert.equal(state.isDraftSession, true, `${scenario.name} should use draft timeline state.`);
  assert.equal(state.lifecycleStartedAt, "", `${scenario.name} should not expose a lifecycle start timestamp before save.`);
  assert.equal(state.engineStartedAt, "", `${scenario.name} should not expose an engine start timestamp before save.`);
  assert.equal(state.phaseLabel, "Session Setup", `${scenario.name} should describe setup before save.`);
  assert.equal(state.currentPhaseKey, "started", `${scenario.name} should keep Start as the current phase before save.`);
  assert.equal(state.currentStepLabel, "Start", `${scenario.name} should keep the Start step current before save.`);
  assert.match(state.visualCurrentText, /Start/, `${scenario.name} visual timeline should show Start as current.`);
  assert.match(state.companionCurrentText, /Start/, `${scenario.name} Grow Companion roadmap should show Start as current.`);
  assert.match(state.phaseTitleText, /Session Setup/, `${scenario.name} Grow Companion hero should show setup copy.`);

  if (scenario.absentStepKey) {
    assert.equal(state.timelineStepKeys.includes(scenario.absentStepKey), false, `${scenario.name} should omit ${scenario.absentStepKey}.`);
  }
  if (scenario.presentStepKey) {
    assert.equal(state.timelineStepKeys.includes(scenario.presentStepKey), true, `${scenario.name} should include ${scenario.presentStepKey}.`);
  }
}

(async () => {
  const { server, baseUrl } = await createStaticServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await prepareLocalQaStorage(page);
  try {
    const scenarios = [
      { name: "KAN", routeMethod: "KAN" },
      { name: "TRā", routeMethod: "TRA" },
      { name: "Soak + Paper Towel", routeMethod: "PAPER_TOWEL_SOAK" },
      { name: "Paper Towel Only", routeMethod: "PAPER_TOWEL", paperTowelChoice: "PAPER_TOWEL" },
      { name: "Water Glass", routeMethod: "WATER_SOAK" },
      { name: "Direct Soil", routeMethod: "DIRECT_SOW" },
      { name: "Custom Method", routeMethod: "OTHER" },
      { name: "Prepared Rockwool", routeMethod: "ROCKWOOL", preparedMediaChoice: "prepared", presentStepKey: "seeds-planted", absentStepKey: "prep-cubes" },
      { name: "Unprepared Rockwool", routeMethod: "ROCKWOOL", preparedMediaChoice: "needs-prep", presentStepKey: "prep-cubes" },
      { name: "Prepared Starter Plug", routeMethod: "RAPID_ROOTER", preparedMediaChoice: "prepared", presentStepKey: "seeds-planted", absentStepKey: "prep-plugs" },
      { name: "Unprepared Starter Plug", routeMethod: "RAPID_ROOTER", preparedMediaChoice: "needs-prep", presentStepKey: "prep-plugs" },
    ];

    for (const scenario of scenarios) {
      await assertDraftStartsAtStart(page, baseUrl, scenario);
    }
  } finally {
    await browser.close();
    server.close();
  }
  console.log("New Session draft timeline Start-stage regression check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
