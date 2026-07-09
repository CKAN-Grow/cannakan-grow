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

async function runPreparedScenario(page, baseUrl, methodType, choice, expected) {
  await page.goto(`${baseUrl}/#new/${methodType}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("form#session-form select[name='systemType']", { timeout: 10000 });
  await page.evaluate(() => {
    localStorage.setItem("cannakanGrowMethodSetupPreferences", "{}");
    localStorage.removeItem("cannakanGrowSessionMethodSetup");
  });

  await page.waitForSelector(`#prepared-media-setup-modal-overlay [data-prepared-media-choice='${choice}']`, { timeout: 10000 });
  await page.click(`#prepared-media-setup-modal-overlay [data-prepared-media-choice='${choice}']`);
  await page.waitForFunction(() => !document.querySelector("#prepared-media-setup-modal-overlay"));
  await page.waitForTimeout(250);

  return page.evaluate(() => {
    const form = document.querySelector("form#session-form");
    const lifecycle = buildFormLifecycleState(form);
    const setup = getMethodSetupStateFromForm(form);
    const visualSteps = [...document.querySelectorAll("#session-engine-visual-timeline .session-engine-visual-timeline-step")]
      .map((step) => ({
        text: step.innerText || "",
        className: step.className || "",
      }));
    const companionSteps = [...document.querySelectorAll("#session-lifecycle-progress .session-progress-companion-roadmap-step")]
      .map((step) => ({
        text: step.innerText || "",
        className: step.className || "",
      }));
    return {
      selectedMethod: form.elements.systemType.value,
      dataset: {
        methodSetupMethod: form.dataset.methodSetupMethod || "",
        methodSetupChoice: form.dataset.methodSetupChoice || "",
        methodSetupPreparedMedia: form.dataset.methodSetupPreparedMedia || "",
      },
      setup,
      isDraftSession: lifecycle.engineState?.isDraftSession === true,
      phaseLabel: lifecycle.engineState?.phaseLabel || "",
      lifecycleStartedAt: lifecycle.startedAt ? lifecycle.startedAt.toISOString() : "",
      engineStartedAt: lifecycle.engineState?.startedAt || "",
      currentPhaseKey: lifecycle.engineState?.currentPhase?.key || "",
      timelineStepKeys: (lifecycle.engineState?.timelineSteps || []).map((step) => step.key),
      timelineStepLabels: (lifecycle.engineState?.timelineSteps || []).map((step) => step.label),
      visualTimelineText: document.querySelector("#session-engine-visual-timeline")?.innerText || "",
      companionText: document.querySelector("#session-lifecycle-progress")?.innerText || "",
      visualSteps,
      companionSteps,
    };
  }).then((result) => {
    assert.equal(result.selectedMethod, methodType);
    assert.equal(result.dataset.methodSetupMethod, methodType);
    assert.equal(result.dataset.methodSetupChoice, choice);
    assert.equal(result.dataset.methodSetupPreparedMedia, choice === "prepared" ? "true" : "false");
    assert.equal(result.setup.choice, choice);
    assert.equal(result.setup.preparedMedia, choice === "prepared");
    assert.equal(result.isDraftSession, true);
    assert.equal(result.phaseLabel, "Session Setup");
    assert.equal(result.lifecycleStartedAt, "");
    assert.equal(result.engineStartedAt, "");
    assert.equal(result.currentPhaseKey, expected.currentKey);
    assert.equal(result.timelineStepKeys.includes(expected.absentKey), false);
    assert.equal(result.timelineStepKeys.includes(expected.presentKey), true);
    assert.match(result.visualTimelineText, new RegExp(expected.visibleLabel));
    assert.match(result.companionText, new RegExp(expected.visibleLabel));
    assert.equal(
      result.visualSteps.some((step) => step.className.includes("is-current") && step.text.includes(expected.visibleLabel)),
      true,
      `${methodType} ${choice} should render ${expected.visibleLabel} as current in visual timeline.`,
    );
    assert.equal(
      result.companionSteps.some((step) => step.className.includes("is-current") && step.text.includes(expected.visibleLabel)),
      true,
      `${methodType} ${choice} should render ${expected.visibleLabel} as current in Grow Companion.`,
    );
    if (expected.hiddenLabel) {
      assert.doesNotMatch(result.visualTimelineText, new RegExp(expected.hiddenLabel));
      assert.doesNotMatch(result.companionText, new RegExp(expected.hiddenLabel));
    }
    return result;
  });
}

(async () => {
  const { server, baseUrl } = await createStaticServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await prepareLocalQaStorage(page);
  try {
    await runPreparedScenario(page, baseUrl, "ROCKWOOL", "prepared", {
      currentKey: "started",
      presentKey: "seeds-planted",
      absentKey: "prep-cubes",
      visibleLabel: "Start",
      hiddenLabel: "Prep Cubes",
    });
    await runPreparedScenario(page, baseUrl, "ROCKWOOL", "needs-prep", {
      currentKey: "started",
      presentKey: "prep-cubes",
      absentKey: "not-a-real-step",
      visibleLabel: "Start",
    });
    await runPreparedScenario(page, baseUrl, "RAPID_ROOTER", "prepared", {
      currentKey: "started",
      presentKey: "seeds-planted",
      absentKey: "prep-plugs",
      visibleLabel: "Start",
      hiddenLabel: "Prep Plugs",
    });
    await runPreparedScenario(page, baseUrl, "RAPID_ROOTER", "needs-prep", {
      currentKey: "started",
      presentKey: "prep-plugs",
      absentKey: "not-a-real-step",
      visibleLabel: "Start",
    });
  } finally {
    await browser.close();
    server.close();
  }
  console.log("Prepared media live form regression check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
