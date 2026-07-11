const assert = require("assert");
const fs = require("fs");
const http = require("http");
const path = require("path");
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
    localStorage.setItem("cannakanGrowNetworkUnlocked", "true");
  });
}

async function dismissSessionNamePrompt(page) {
  const skipButton = page.locator("[data-new-session-name-skip]");
  if (await skipButton.count()) {
    await skipButton.click();
    await page.waitForFunction(() => !document.querySelector("#new-session-name-modal-overlay"));
  }
}

async function fillFirstSeedRow(page) {
  await page.fill('input[name="seedVariety-0"]', "Blue Dream");
  await page.selectOption('select[name="seedType-0"]', { index: 1 });
  await page.selectOption('select[name="feminized-0"]', { index: 1 });
  await page.fill('input[name="seedCount-0"]', "3");
}

async function submitNewSession(page) {
  await page.evaluate(() => {
    const form = document.querySelector("form#session-form");
    const submitter = document.querySelector('[data-new-session-save-button="true"]');
    form.dispatchEvent(new SubmitEvent("submit", {
      bubbles: true,
      cancelable: true,
      submitter,
    }));
  });
}

(async () => {
  const { server, baseUrl } = await createStaticServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await prepareLocalQaStorage(page);

  try {
    await page.goto(`${baseUrl}/#new/PAPER_TOWEL_SOAK`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("form#session-form", { timeout: 10000 });
    await dismissSessionNamePrompt(page);
    await fillFirstSeedRow(page);

    const draftSnapshotDisabled = await page.$eval("#generate-snapshot", (button) => button.disabled);
    assert.equal(draftSnapshotDisabled, true, "Snapshot generation should be disabled until the session is saved.");

    await submitNewSession(page);
    await page.waitForFunction(() => getSessions().length > 0, { timeout: 10000 });

    const savedSession = await page.evaluate(() => {
      const session = getSessions()[0];
      return {
        id: session.id,
        methodType: session.methodType,
        sessionStartedAt: session.sessionStartedAt,
        isMock: session.isMock,
        filterPaperDeducted: Boolean(session.filterPaperDeducted),
        filterPaperUsage: getFilterPaperUsageForSessionStart(session),
        timestampHealth: getSessionLifecycleTimestampHealth(session),
        snapshotIntegrity: getSnapshotSessionIntegrity(session),
      };
    });

    assert.ok(savedSession.id, "Initial save should create a persisted session id.");
    assert.equal(savedSession.methodType, "PAPER_TOWEL_SOAK", "Soak + Paper Towel should persist as the accepted internal method id.");
    assert.ok(savedSession.sessionStartedAt, "Initial save should create an official session start timestamp.");
    assert.equal(savedSession.isMock, false, "User-created local QA sessions should not be hidden as mock data.");
    assert.equal(savedSession.filterPaperDeducted, false, "Paper Towel sessions should not receive KAN filter-paper deduction state.");
    assert.equal(savedSession.filterPaperUsage, 0, "Paper Towel sessions should not consume KAN filter-paper inventory.");
    assert.equal(savedSession.timestampHealth.isValid, true, "Saved workflow session timestamps should be valid.");
    assert.equal(savedSession.snapshotIntegrity.ok, true, "Saved workflow sessions should be eligible for snapshots.");

    await page.evaluate(() => {
      document.querySelector("#seed-chart-expanded-modal-overlay")?.remove();
      document.body.classList.remove("modal-open");
    });

    await page.goto(`${baseUrl}/#sessions/${savedSession.id}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#detail-generate-snapshot", { timeout: 10000 });
    const detailSnapshotDisabled = await page.$eval("#detail-generate-snapshot", (button) => button.disabled);
    assert.equal(detailSnapshotDisabled, false, "Saved session detail should enable snapshot generation.");

    await page.click("#detail-generate-snapshot");
    await page.waitForFunction(() => /Snapshot ready/i.test(document.body.innerText), { timeout: 15000 });

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => getSessions().length > 0, { timeout: 10000 });
    if (!page.url().includes(`#sessions/${savedSession.id}`)) {
      await page.goto(`${baseUrl}/#sessions/${savedSession.id}`, { waitUntil: "domcontentloaded" });
      await page.waitForFunction((sessionId) => getSessions().some((entry) => entry.id === sessionId), savedSession.id, { timeout: 10000 });
    }

    const reloaded = await page.evaluate(() => {
      const sessionId = location.hash.split("/").pop();
      const session = getSessions().find((entry) => entry.id === sessionId);
      return {
        methodType: session?.methodType || "",
        sessionStartedAt: session?.sessionStartedAt || "",
        snapshotReferenceId: session?.snapshotState?.referenceId || "",
      };
    });

    assert.equal(reloaded.methodType, "PAPER_TOWEL_SOAK", "Reloaded saved session should preserve the method.");
    assert.ok(reloaded.sessionStartedAt, "Reloaded saved session should preserve the start timestamp.");
    assert.ok(reloaded.snapshotReferenceId, "Generated snapshot state should persist on the saved session.");
  } finally {
    await browser.close();
    server.close();
  }

  console.log("New Session save flow regression check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
