const { defineConfig } = require("@playwright/test");

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:5500";

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  expect: {
    timeout: 8000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
  ],
  use: {
    baseURL,
    actionTimeout: 10000,
    navigationTimeout: 15000,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: process.platform === "win32"
          ? "powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\\local-server.ps1"
          : "pwsh -NoProfile -File ./local-server.ps1",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 15000,
      },
  projects: [
    {
      name: "founder-desktop",
      testMatch: /(founder-smoke|developer-scenarios)\.spec\.js/,
      use: {
        viewport: { width: 1366, height: 900 },
      },
    },
    {
      name: "mobile-390",
      testMatch: /founder-mobile\.spec\.js/,
      use: {
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: "mobile-430",
      testMatch: /founder-mobile\.spec\.js/,
      use: {
        viewport: { width: 430, height: 932 },
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: "tablet-768",
      testMatch: /founder-mobile\.spec\.js/,
      use: {
        viewport: { width: 768, height: 1024 },
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
});
