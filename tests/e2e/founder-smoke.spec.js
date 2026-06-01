const { test, expect } = require("@playwright/test");
const {
  FOUNDER_ROUTES,
  closeOpenModal,
  enableFounderLocalQa,
  expectAnyRouteCta,
  expectNoHorizontalOverflow,
  expectRouteSmoke,
  expectVisibleModalFitsViewport,
  gotoFounderRoute,
  openIfVisible,
} = require("./support/founder-smoke");

test.describe("founder desktop smoke", () => {
  test.beforeEach(async ({ page }) => {
    await enableFounderLocalQa(page);
  });

  test("app shell loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("#app")).toBeVisible();
    await expect(page.locator(".topbar")).toBeVisible();
    await expect(page.locator("body")).toContainText(/Cannakan|Grow Session Tracker/i);
    await expectNoHorizontalOverflow(page);
  });

  for (const route of FOUNDER_ROUTES) {
    test(`${route.name} route renders key smoke UI`, async ({ page }) => {
      await gotoFounderRoute(page, route);
      await expectRouteSmoke(page, route);
      await expectAnyRouteCta(page, route);
      await expectNoHorizontalOverflow(page);
    });
  }

  test("New Session system modal fits the desktop viewport when available", async ({ page }, testInfo) => {
    await gotoFounderRoute(page, "#new");

    if (await page.locator(".new-session-system-modal").first().isVisible().catch(() => false)) {
      await expectVisibleModalFitsViewport(page, "New Session system modal");
      return;
    }

    testInfo.annotations.push({
      type: "note",
      description: "New Session rendered without the system modal, likely because the route is auth/profile gated in this local run.",
    });
    await expect(page.locator("body")).toContainText(/Sign In|Profile Setup|My Sessions|New Session/i);
  });

  test("available founder modal surfaces fit the desktop viewport", async ({ page }, testInfo) => {
    let checked = 0;

    await gotoFounderRoute(page, "#seed-vault");
    if (await openIfVisible(page, "[data-seed-vault-add='true']", "Seed Vault entry modal")) {
      checked += 1;
      await closeOpenModal(page);
    }

    await gotoFounderRoute(page, "#gallery");
    if (await openIfVisible(page, "[data-gallery-preview]", "Community Grow detail modal")) {
      checked += 1;
      await closeOpenModal(page);
    }

    if (!checked) {
      testInfo.annotations.push({
        type: "note",
        description: "No optional modal triggers were present in this data state; route/modal base checks still ran.",
      });
    }
  });
});
