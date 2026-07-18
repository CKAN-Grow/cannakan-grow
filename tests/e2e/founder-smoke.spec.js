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
    await expect(page.locator(".app-logo-wrap")).toHaveAttribute("aria-label", "Cannakan® Grow");
    await expect(page.getByText("Grow Session Tracker", { exact: true })).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("header keeps the brand and controls centered across responsive widths", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    for (const viewport of [
      { width: 1280, height: 900 },
      { width: 768, height: 1024 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/#home");

      const topbar = page.locator(".topbar");
      const brand = topbar.locator(".topbar-brand");
      const controls = topbar.locator(".topbar-controls");

      await expect(topbar).toBeVisible();
      await expect(brand).toBeVisible();
      await expect(controls).toBeVisible();
      await expect(brand.locator(".app-logo-wrap")).toBeVisible();
      await expect(page.getByText("Grow Session Tracker", { exact: true })).toHaveCount(0);

      const geometry = await topbar.evaluate((header) => {
        const headerRect = header.getBoundingClientRect();
        const brandRect = header.querySelector(".topbar-brand").getBoundingClientRect();
        const controlsRect = header.querySelector(".topbar-controls").getBoundingClientRect();
        const style = getComputedStyle(header);
        const centerY = (rect) => rect.top + rect.height / 2;
        return {
          paddingTop: Number.parseFloat(style.paddingTop),
          paddingBottom: Number.parseFloat(style.paddingBottom),
          brandCenterGap: Math.abs(centerY(brandRect) - centerY(headerRect)),
          controlsCenterGap: Math.abs(centerY(controlsRect) - centerY(headerRect)),
          brandClipped: brandRect.top < headerRect.top || brandRect.bottom > headerRect.bottom,
          controlsClipped: controlsRect.top < headerRect.top || controlsRect.bottom > headerRect.bottom,
          horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });

      expect(geometry.paddingTop).toBe(8);
      expect(geometry.paddingBottom).toBe(8);
      expect(geometry.brandCenterGap).toBeLessThanOrEqual(1);
      expect(geometry.controlsCenterGap).toBeLessThanOrEqual(1);
      expect(geometry.brandClipped).toBe(false);
      expect(geometry.controlsClipped).toBe(false);
      expect(geometry.horizontalOverflow).toBeLessThanOrEqual(1);

      if (viewport.width <= 900) {
        await expect(topbar.locator(".topbar-nav")).toBeHidden();
        await expect(topbar.locator("#mobile-nav-toggle")).toBeVisible();
      } else {
        await expect(topbar.locator(".topbar-nav")).toBeVisible();
        await expect(topbar.locator("#mobile-nav-toggle")).toBeHidden();
      }
    }

    expect(consoleErrors).toEqual([]);
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
