const { test, expect } = require("@playwright/test");
const {
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
} = require("./support/founder-smoke");

test.describe("founder mobile responsiveness smoke", () => {
  test.beforeEach(async ({ page }) => {
    await enableFounderLocalQa(page);
  });

  for (const route of FOUNDER_ROUTES) {
    test(`${route.name} has no horizontal overflow and keeps key UI reachable`, async ({ page }) => {
      await gotoFounderRoute(page, route);
      await expectRouteSmoke(page, route);
      await expectAnyRouteCta(page, route);
      await expectNoHorizontalOverflow(page);
      await expectPrimaryTapTargets(page);
    });
  }

  test("mobile navigation drawer fits the viewport", async ({ page }) => {
    await gotoFounderRoute(page, "#home");
    await page.locator("#mobile-nav-toggle").click();
    await expect(page.locator("#mobile-nav-drawer")).toBeVisible();
    await expectVisibleModalFitsViewport(page, "mobile navigation drawer");
    await expect(page.locator("#mobile-nav-content")).toContainText(/Home|My Sessions|Community Grow|Source Directory/i);
    await closeOpenModal(page);
  });

  test("available mobile modals fit the viewport", async ({ page }, testInfo) => {
    let checked = 0;

    await gotoFounderRoute(page, "#new");
    if (await page.locator(".new-session-system-modal").first().isVisible().catch(() => false)) {
      checked += 1;
      await expectVisibleModalFitsViewport(page, "New Session system modal");
      await closeOpenModal(page);
    }

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
        description: "No modal triggers were present in this mobile data state.",
      });
    }
  });
});
