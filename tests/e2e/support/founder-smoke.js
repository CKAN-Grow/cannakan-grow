const { expect } = require("@playwright/test");

const LOCAL_DEV_QA_STORAGE_KEY = "cannakanGrowDevQaBypass";

const FOUNDER_ROUTES = Object.freeze([
  {
    name: "Home",
    hash: "#home",
    expectedText: /Cannakan|Grow Session Tracker|Start My First Session|My Sessions/i,
    ctas: [/Start/i, /My Sessions/i, /Community Grow/i],
  },
  {
    name: "My Sessions",
    hash: "#sessions",
    expectedText: /My Sessions|Start New Session|Create Your First Session|Sign In|Profile Setup/i,
    ctas: [/Start New Session|Create Your First Session|Sign In/i, /View Full Analytics/i],
  },
  {
    name: "New Session",
    hash: "#new",
    expectedText: /Choose System Type|New Session|My Sessions|Sign In|Profile Setup/i,
    ctas: [/KAN|TRa|Sign In/i],
  },
  {
    name: "Seed Vault",
    hash: "#seed-vault",
    expectedText: /My Seed Vault|Seed Vault|Add Seeds|Sign In|Profile Setup/i,
    ctas: [/Add Seed|Sign In/i],
  },
  {
    name: "Analytics",
    hash: "#analytics",
    expectedText: /Analytics Dashboard|Average Germination Rate|Sign In|Profile Setup/i,
    ctas: [/My Sessions|Seed Vault|Community Grow|Sign In/i],
  },
  {
    name: "Community Grow",
    hash: "#gallery",
    expectedText: /Community Grow|Community Snapshots|Source Directory|approved public/i,
    ctas: [/Source Directory|Community Insights|Load More|Sign In/i],
  },
  {
    name: "Community Insights",
    hash: "#community-insights",
    expectedText: /Community Insights|Community Average Germination Rate|Source Intelligence|Seed Age/i,
    ctas: [/Community Grow|Source Directory/i],
  },
  {
    name: "Source Directory",
    hash: "#source-directory",
    expectedText: /Source Directory|Community results|Search|Sort|Testing & Certification/i,
    ctas: [/Explore Top Sources|How Rankings Work/i],
  },
  {
    name: "Profile",
    hash: "#profile",
    expectedText: /Profile|Public Profile|Edit Profile|Profile Settings|Member Profile|Analytics Dashboard|Display Name|Sign In/i,
    ctas: [/Edit Profile|Public Profile|Analytics Dashboard|Save Profile|Sign In|Delete Account/i],
    markers: [
      /Profile Settings/i,
      /Public Profile/i,
      /Edit Profile/i,
      /Member Profile/i,
      /Analytics Dashboard/i,
      /Display Name/i,
      /Profile Setup/i,
    ],
  },
]);

async function enableFounderLocalQa(page) {
  await page.addInitScript((storageKey) => {
    try {
      window.localStorage.setItem(storageKey, "true");
    } catch (error) {
      window.__cannakanPlaywrightStorageError = String(error && error.message ? error.message : error);
    }
  }, LOCAL_DEV_QA_STORAGE_KEY);
}

async function gotoFounderRoute(page, route) {
  const hash = typeof route === "string" ? route : route.hash;
  await page.goto(`/${hash}`);
  await waitForAppReady(page);
}

async function waitForAppReady(page) {
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("#app")).toBeVisible();
  await page.waitForFunction(() => {
    const app = document.querySelector("#app");
    if (!app) {
      return false;
    }
    const text = String(app.innerText || "").trim();
    return text.length > 0 && !/^Loading Cannakan/i.test(text);
  });
}

async function expectRouteSmoke(page, route) {
  await expect(page.locator("body"), `${route.name} should render expected page copy`).toContainText(route.expectedText);
  await expect(page.locator("#app"), `${route.name} should not render an empty app shell`).not.toBeEmpty();
}

async function expectAnyRouteCta(page, route) {
  for (const name of route.ctas || []) {
    if (await hasVisibleRoleMatch(page, "link", name) || await hasVisibleRoleMatch(page, "button", name)) {
      return;
    }
  }

  for (const marker of route.markers || []) {
    if (await hasVisibleTextMarker(page, marker)) {
      return;
    }
  }

  throw new Error(`${route.name} did not expose any expected key CTA or stable marker: ${[
    ...(route.ctas || []),
    ...(route.markers || []),
  ].join(", ")}`);
}

async function hasVisibleRoleMatch(page, role, name) {
  const locator = page.getByRole(role, { name }).first();
  try {
    return await locator.isVisible({ timeout: 750 });
  } catch (error) {
    return false;
  }
}

async function hasVisibleTextMarker(page, marker) {
  const locator = page.locator("#app").getByText(marker).first();
  try {
    return await locator.isVisible({ timeout: 750 });
  } catch (error) {
    return false;
  }
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const documentWidth = Math.ceil(Math.max(
      document.documentElement.scrollWidth,
      document.body ? document.body.scrollWidth : 0,
    ));
    const offenders = Array.from(document.body.querySelectorAll("*"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return {
          tag: element.tagName.toLowerCase(),
          id: element.id || "",
          className: typeof element.className === "string" ? element.className : "",
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          display: style.display,
          visibility: style.visibility,
          position: style.position,
          hidden: element.hidden || element.getAttribute("aria-hidden") === "true",
        };
      })
      .filter((entry) => {
        if (entry.hidden || entry.display === "none" || entry.visibility === "hidden") {
          return false;
        }
        if (!entry.width || entry.position === "fixed") {
          return false;
        }
        return entry.left < -2 || entry.right > viewportWidth + 2;
      })
      .slice(0, 10);

    return {
      viewportWidth,
      documentWidth,
      overflowPx: documentWidth - viewportWidth,
      offenders,
    };
  });

  expect(
    overflow.overflowPx,
    `Expected no horizontal page overflow. Details: ${JSON.stringify(overflow, null, 2)}`,
  ).toBeLessThanOrEqual(2);
}

async function expectPrimaryTapTargets(page) {
  const smallTargets = await page.evaluate(() => {
    const selectors = "a.button, button.button, .mobile-nav-link, [data-session-entry='true'], [data-seed-vault-add='true']";
    return Array.from(document.querySelectorAll(selectors))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return {
          label: String(element.innerText || element.getAttribute("aria-label") || element.getAttribute("href") || "").trim(),
          tag: element.tagName.toLowerCase(),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          display: style.display,
          visibility: style.visibility,
          hidden: element.hidden || element.getAttribute("aria-hidden") === "true",
        };
      })
      .filter((entry) => {
        if (entry.hidden || entry.display === "none" || entry.visibility === "hidden") {
          return false;
        }
        if (!entry.width || !entry.height) {
          return false;
        }
        return entry.width < 40 || entry.height < 40;
      })
      .slice(0, 10);
  });

  expect(
    smallTargets,
    `Expected primary mobile tap targets to be at least 40px. Details: ${JSON.stringify(smallTargets, null, 2)}`,
  ).toEqual([]);
}

async function expectVisibleModalFitsViewport(page, label = "modal") {
  const modal = page.locator([
    "dialog[open]",
    "[role='dialog']:visible",
    ".new-session-system-modal:visible",
    ".seed-vault-entry-modal:visible",
    ".mobile-nav-panel:visible",
  ].join(", ")).first();

  await expect(modal, `Expected ${label} to be visible`).toBeVisible();

  const box = await modal.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: Math.round(rect.left),
      top: Math.round(rect.top),
      right: Math.round(rect.right),
      bottom: Math.round(rect.bottom),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });

  expect(box.left, `${label} should not overflow left: ${JSON.stringify(box)}`).toBeGreaterThanOrEqual(-2);
  expect(box.top, `${label} should not overflow top: ${JSON.stringify(box)}`).toBeGreaterThanOrEqual(-2);
  expect(box.right, `${label} should not overflow right: ${JSON.stringify(box)}`).toBeLessThanOrEqual(box.viewportWidth + 2);
  expect(box.bottom, `${label} should not overflow bottom: ${JSON.stringify(box)}`).toBeLessThanOrEqual(box.viewportHeight + 2);
}

async function openIfVisible(page, selector, label, options = {}) {
  const locator = page.locator(selector).first();
  if (!await isVisible(locator)) {
    return false;
  }

  await locator.click();
  await page.waitForTimeout(options.settleMs || 150);
  await expectVisibleModalFitsViewport(page, label);
  return true;
}

async function closeOpenModal(page) {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  const openModal = page.locator([
    "dialog[open]",
    "[role='dialog']:visible",
    ".new-session-system-modal:visible",
    ".seed-vault-entry-modal:visible",
    ".mobile-nav-panel:visible",
  ].join(", ")).first();

  if (!await isVisible(openModal)) {
    return;
  }

  const closeButton = page.locator([
    "[data-seed-vault-modal-close='true']",
    "[data-auth-modal-close]",
    "[data-mobile-nav-close='true']",
    ".modal-close",
  ].join(", ")).filter({ visible: true }).first();

  if (await isVisible(closeButton)) {
    await closeButton.click({ force: true, timeout: 1000 });
    await page.waitForTimeout(150);
  }
}

async function isVisible(locator) {
  try {
    return await locator.isVisible({ timeout: 750 });
  } catch (error) {
    return false;
  }
}

module.exports = {
  FOUNDER_ROUTES,
  closeOpenModal,
  enableFounderLocalQa,
  expectAnyRouteCta,
  expectNoHorizontalOverflow,
  expectPrimaryTapTargets,
  expectRouteSmoke,
  expectVisibleModalFitsViewport,
  gotoFounderRoute,
  openIfVisible,
};
