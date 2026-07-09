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

async function runPreparedScenario(page, baseUrl, methodType, absentStepKey) {
  await page.goto(`${baseUrl}/#new/WATER_SOAK`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("form#session-form select[name='systemType']", { timeout: 10000 });
  await page.evaluate(() => {
    localStorage.setItem("cannakanGrowMethodSetupPreferences", "{}");
    localStorage.removeItem("cannakanGrowSessionMethodSetup");
  });

  await page.selectOption("form#session-form select[name='systemType']", methodType);
  await page.waitForSelector("#prepared-media-setup-modal-overlay [data-prepared-media-choice='prepared']", { timeout: 10000 });
  await page.click("#prepared-media-setup-modal-overlay [data-prepared-media-choice='prepared']");
  await page.waitForFunction(() => !document.querySelector("#prepared-media-setup-modal-overlay"));

  return page.evaluate(() => {
    const form = document.querySelector("form#session-form");
    const lifecycle = buildFormLifecycleState(form);
    const setup = getMethodSetupStateFromForm(form);
    return {
      selectedMethod: form.elements.systemType.value,
      dataset: {
        methodSetupMethod: form.dataset.methodSetupMethod || "",
        methodSetupChoice: form.dataset.methodSetupChoice || "",
        methodSetupPreparedMedia: form.dataset.methodSetupPreparedMedia || "",
      },
      setup,
      currentPhaseKey: lifecycle.engineState?.currentPhase?.key || "",
      timelineStepKeys: (lifecycle.engineState?.timelineSteps || []).map((step) => step.key),
      visualTimelineText: document.querySelector("#session-engine-visual-timeline")?.innerText || "",
      companionText: document.querySelector("#session-lifecycle-progress")?.innerText || "",
    };
  }).then((result) => {
    assert.equal(result.selectedMethod, methodType);
    assert.equal(result.dataset.methodSetupMethod, methodType);
    assert.equal(result.dataset.methodSetupChoice, "prepared");
    assert.equal(result.dataset.methodSetupPreparedMedia, "true");
    assert.equal(result.setup.choice, "prepared");
    assert.equal(result.setup.preparedMedia, true);
    assert.equal(result.currentPhaseKey, "seeds-planted");
    assert.equal(result.timelineStepKeys.includes(absentStepKey), false);
    assert.equal(result.timelineStepKeys.includes("seeds-planted"), true);
    assert.match(result.visualTimelineText, /Plant Seeds/);
    assert.doesNotMatch(result.visualTimelineText, new RegExp(absentStepKey === "prep-cubes" ? "Prep Cubes" : "Prep Plugs"));
    assert.match(result.companionText, /Plant Seeds/);
    return result;
  });
}

(async () => {
  const { server, baseUrl } = await createStaticServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await prepareLocalQaStorage(page);
  try {
    await runPreparedScenario(page, baseUrl, "ROCKWOOL", "prep-cubes");
    await runPreparedScenario(page, baseUrl, "RAPID_ROOTER", "prep-plugs");
  } finally {
    await browser.close();
    server.close();
  }
  console.log("Prepared media live form regression check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
