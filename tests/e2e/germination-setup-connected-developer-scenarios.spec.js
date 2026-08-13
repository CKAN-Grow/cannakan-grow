const { test, expect } = require("@playwright/test");
const { execFileSync } = require("child_process");
const path = require("path");

const LOCAL_DB_CONTAINER = "supabase_db_Cannakan_Grow_App";
const FIXTURE_VAULT_ID = "96000000-0000-4000-8000-000000000101";
const FIXTURE_VAULT_SECONDARY_ID = "96000000-0000-4000-8000-000000000102";
const FIXTURE_SESSION_NAME = "Connected Germination Browser Fixture";
const LOCAL_SUPABASE_URL = String(process.env.CANNAKAN_E2E_LOCAL_SUPABASE_URL || "").trim();
const LOCAL_SUPABASE_ANON_KEY = String(process.env.CANNAKAN_E2E_LOCAL_SUPABASE_ANON_KEY || "").trim();

function escapeSqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function runLocalSql(sql) {
  return String(execFileSync(
    "docker",
    [
      "exec",
      "-i",
      LOCAL_DB_CONTAINER,
      "psql",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-q",
      "-A",
      "-t",
    ],
    { input: sql, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
  ) || "").trim();
}

async function loadLocalDemoIdentity() {
  const [{ DEMO_OWNER_EMAIL, DEMO_OWNER_PASSWORD }, { ids }] = await Promise.all([
    import("../../scripts/local-demo/config.mjs"),
    import("../../scripts/local-demo/ids.mjs"),
  ]);
  return {
    email: DEMO_OWNER_EMAIL,
    password: DEMO_OWNER_PASSWORD,
    ownerId: ids.users.owner,
  };
}

function removeFocusedFixture(ownerId) {
  runLocalSql(`
begin;
delete from public.seed_vault_germination_inventory_operations
where owner_user_id = ${escapeSqlLiteral(ownerId)}::uuid
  and vault_entry_id in (${escapeSqlLiteral(FIXTURE_VAULT_ID)}::uuid, ${escapeSqlLiteral(FIXTURE_VAULT_SECONDARY_ID)}::uuid);
delete from public.grow_sessions
where user_id = ${escapeSqlLiteral(ownerId)}::uuid
  and session_name = ${escapeSqlLiteral(FIXTURE_SESSION_NAME)};
delete from public.seed_vault_entries
where id in (${escapeSqlLiteral(FIXTURE_VAULT_ID)}::uuid, ${escapeSqlLiteral(FIXTURE_VAULT_SECONDARY_ID)}::uuid)
  and user_id = ${escapeSqlLiteral(ownerId)}::uuid;
commit;
`);
}

function createFocusedFixture(ownerId) {
  removeFocusedFixture(ownerId);
  runLocalSql(`
insert into public.seed_vault_entries (
  id, user_id, seed_name, seed_variety, seed_type, sex, source, breeder,
  quantity, seed_count, remaining_count, year_acquired, visibility,
  is_archived, is_deleted, created_at, updated_at
) values
(
  ${escapeSqlLiteral(FIXTURE_VAULT_ID)}::uuid,
  ${escapeSqlLiteral(ownerId)}::uuid,
  'Blue Dream',
  'Blue Dream',
  'photoperiod',
  'feminized',
  'Pacific Seed Co.',
  'Atlas Genetics',
  7, 7, 7, 2025, 'private', false, false, now(), now()
),
(
  ${escapeSqlLiteral(FIXTURE_VAULT_SECONDARY_ID)}::uuid,
  ${escapeSqlLiteral(ownerId)}::uuid,
  'Northern Lights',
  'Northern Lights',
  'photoperiod',
  'regular',
  'Heritage Seed Exchange',
  'Northern Heritage',
  3, 3, 3, 2022, 'private', false, false, now(), now()
);
`);
}

test.describe("connected Germination Setup", () => {
  test.use({ serviceWorkers: "block" });
  test.skip(
    !LOCAL_SUPABASE_URL || !LOCAL_SUPABASE_ANON_KEY,
    "Requires explicitly supplied local Supabase endpoint metadata.",
  );

  let demoIdentity;

  test.beforeAll(async () => {
    demoIdentity = await loadLocalDemoIdentity();
  });

  test.beforeEach(() => {
    createFocusedFixture(demoIdentity.ownerId);
  });

  test.afterEach(() => {
    removeFocusedFixture(demoIdentity.ownerId);
  });

  test.skip("legacy full connected save and reload qualification (superseded by bounded correction coverage)", async ({ page }) => {
    test.setTimeout(90000);
    const consoleErrors = [];
    const pageErrors = [];
    const failedApplicationRequests = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });
    page.on("requestfailed", (request) => {
      if (["fetch", "xhr"].includes(request.resourceType())) {
        failedApplicationRequests.push(`${request.method()} ${new URL(request.url()).pathname} ${request.failure()?.errorText || "failed"}`);
      }
    });
    page.on("response", (response) => {
      const request = response.request();
      if (["fetch", "xhr"].includes(request.resourceType()) && response.status() >= 400) {
        failedApplicationRequests.push(`${request.method()} ${new URL(response.url()).pathname} ${response.status()}`);
      }
    });

    await page.route("**/supabase-config.js", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/javascript; charset=utf-8",
        body: `window.CANNAKAN_SUPABASE_CONFIG = ${JSON.stringify({
          url: LOCAL_SUPABASE_URL,
          anonKey: LOCAL_SUPABASE_ANON_KEY,
          pushPublicKey: "",
          cloudflareStreamCustomerCode: "",
          devPreviewDataEnabled: false,
          localDemoAuthEnabled: true,
        })};`,
      });
    });

    await page.goto("/#seed-vault");
    const authForm = page.locator("#auth-form");
    await expect(authForm).toBeVisible();
    await authForm.locator('input[name="email"]').fill(demoIdentity.email);
    await authForm.locator('input[name="password"]').fill(demoIdentity.password);
    await authForm.locator('button[value="login"]').click();

    const fixtureCard = page.locator(`[data-seed-vault-entry-id="${FIXTURE_VAULT_ID}"]`);
    await expect(fixtureCard).toBeVisible({ timeout: 15000 });
    await expect(fixtureCard).toContainText("Blue Dream");
    await fixtureCard.locator(`[data-seed-vault-more="${FIXTURE_VAULT_ID}"]`).click();
    const startSessionButton = fixtureCard.locator(`[data-seed-vault-start-session="${FIXTURE_VAULT_ID}"]`);
    await expect(startSessionButton).toBeVisible();
    await startSessionButton.click();

    const decisionDialog = page.getByRole("dialog", { name: "How does this Session begin?" });
    await expect(decisionDialog).toBeVisible();
    await decisionDialog.getByRole("button", { name: /Seed Session/ }).click();
    await decisionDialog.locator('[data-system-type="KAN"]').click();

    const setup = page.locator("[data-germination-setup-preview]");
    await expect(setup).toHaveAttribute("data-preview-state", "incomplete", { timeout: 15000 });
    await expect(setup.locator("[data-germination-entry]")).toHaveCount(1);
    await expect(setup).not.toContainText("Blue Dream");
    const primaryReviewSetup = setup.getByRole("button", { name: "Review Setup", exact: true }).first();
    await primaryReviewSetup.click();
    await expect(setup.locator("[data-germination-session-name]")).toBeFocused();
    await setup.locator("[data-germination-session-name]").fill(FIXTURE_SESSION_NAME);
    await setup.locator("[data-germination-start-date]").fill("2026-08-12");
    await expect(setup.locator("[data-germination-summary]")).toContainText("Aug 12, 2026");

    const methodSelect = setup.locator("[data-germination-method]");
    const entryList = setup.locator("[data-germination-entry-list]");
    const addEntry = setup.getByRole("button", { name: "Add Seed Entry", exact: true });
    await expect(addEntry).toHaveCount(1);
    await expect(setup.getByRole("button", { name: "Save Session", exact: true })).toBeHidden();
    await expect(methodSelect.locator('option[value="PAPER_TOWEL_SOAK"]')).toHaveText("Soak + Paper Towel");
    await expect(methodSelect.locator('option[value="TRA"]')).toHaveAttribute("disabled", "");

    const firstEntry = entryList.locator("[data-germination-entry]").first();
    const manualOrigin = firstEntry.getByLabel("Enter manually", { exact: true });
    const vaultOrigin = firstEntry.getByLabel("Choose from My Seed Vault", { exact: true });
    await expect(firstEntry.locator(".germination-seed-entry__index")).toHaveText("P1");
    await expect(firstEntry.locator("[data-germination-kan-assignment-select]")).toHaveValue("P1");
    await expect(setup.locator('[data-germination-kan-partition="P1"]')).toHaveAttribute("data-partition-state", "selected");
    await expect(setup.locator("[data-germination-summary]")).toContainText("Active assignmentP1 · Seed Entry 1");
    await expect(vaultOrigin).not.toBeChecked();
    await expect(manualOrigin).not.toBeChecked();
    await expect(firstEntry.locator("[data-germination-vault-selected]")).toHaveCount(0);
    await expect(firstEntry).toContainText("No Seed Vault record is selected.");
    await expect(firstEntry).not.toContainText(FIXTURE_VAULT_ID);
    await addEntry.click();
    await expect(entryList.locator("[data-germination-entry]")).toHaveCount(2);
    await primaryReviewSetup.click();
    await expect(vaultOrigin).toBeFocused();
    await expect(entryList.locator("[data-germination-entry]").nth(0).locator("[data-germination-entry-validation]")).toContainText("P1: Choose a Seed Entry origin.");
    await expect(entryList.locator("[data-germination-entry]").nth(1).locator("[data-germination-entry-validation]")).toContainText("P2: Choose a Seed Entry origin.");
    await expect(setup.locator("[data-germination-validation]")).toContainText("Review found 2 problems.");
    await expect(setup.locator("[data-germination-validation]")).toContainText("P1: Choose a Seed Entry origin.");
    await expect(entryList.locator(".germination-entry-origin")).toHaveCount(2);
    await expect(entryList.locator(".germination-entry-origin").nth(0)).toHaveAttribute("aria-invalid", "true");
    await expect(entryList.locator(".germination-entry-origin").nth(0)).toHaveAttribute("aria-describedby", /germination-validation-entry-/);
    await expect(entryList.locator(".germination-entry-origin").nth(1)).toHaveAttribute("aria-invalid", "true");
    await entryList.locator("[data-germination-entry]").nth(1).locator("[data-germination-remove-entry]").click();
    await expect(entryList.locator("[data-germination-entry]")).toHaveCount(1);
    await expect(setup.locator("[data-germination-session-name]")).toHaveValue(FIXTURE_SESSION_NAME);
    await vaultOrigin.focus();
    await page.keyboard.press("Space");
    await expect(firstEntry.locator("[data-germination-vault-search]")).toBeFocused();
    await firstEntry.locator("[data-germination-vault-search]").fill("Northern");
    await firstEntry.getByRole("button", { name: /Northern Lights/ }).click();
    await expect(firstEntry.locator("[data-germination-vault-selected]")).toContainText("Northern Heritage");
    await firstEntry.getByRole("button", { name: "Change selection" }).click();
    await firstEntry.locator("[data-germination-vault-search]").fill("Blue Dream");
    await firstEntry.locator(`[data-germination-vault-option="${FIXTURE_VAULT_ID}"]`).click();
    await expect(firstEntry.locator("[data-germination-vault-selected]")).toContainText("Atlas Genetics");
    await manualOrigin.focus();
    await page.keyboard.press("Space");
    await expect(manualOrigin).toBeChecked();
    await expect(firstEntry.locator('[data-germination-entry-field="breeder"]')).toHaveValue("Atlas Genetics");
    await vaultOrigin.focus();
    await page.keyboard.press("Space");
    await firstEntry.locator("[data-germination-vault-search]").fill("Blue Dream");
    await firstEntry.locator(`[data-germination-vault-option="${FIXTURE_VAULT_ID}"]`).click();
    await expect(firstEntry.locator(".germination-entry-origin")).not.toHaveAttribute("aria-invalid", "true");
    await expect(firstEntry.locator("[data-germination-entry-validation]")).toBeEmpty();
    await expect(entryList.locator(".germination-seed-entry__index")).toHaveText("P1");
    await expect(setup.locator("[data-germination-summary]")).toContainText("Active assignmentP1 · Blue Dream");
    await expect(setup.locator('[data-germination-kan-partition="P1"]')).toHaveAttribute("data-partition-state", "selected");
    await primaryReviewSetup.click();
    const initialReviewDialog = setup.locator("[data-germination-review-dialog]");
    await expect(initialReviewDialog).toBeVisible();
    await initialReviewDialog.getByRole("button", { name: "Return to setup" }).click();
    await expect(entryList.locator(".germination-seed-entry__index")).toHaveText("P1");
    await expect(setup.locator('[data-germination-kan-partition="P1"]')).toHaveAttribute("data-partition-state", "selected");
    await expect(setup.locator("[data-germination-summary]")).toContainText("Active assignmentP1 · Blue Dream");

    await methodSelect.selectOption("PAPER_TOWEL_SOAK");
    await manualOrigin.check();
    const typeField = firstEntry.locator('[data-germination-entry-field="seedType"]');
    const sexField = firstEntry.locator('[data-germination-entry-field="sex"]');
    expect(await typeField.locator("option").evaluateAll((options) => options.map((option) => [option.value, option.textContent.trim()]))).toEqual([
      ["not_applicable", "Not applicable"],
      ["photoperiod", "Photoperiod"],
      ["autoflower", "Autoflower"],
      ["fast_flower", "Fast Flower"],
      ["unknown", "Unknown"],
    ]);
    expect(await sexField.locator("option").evaluateAll((options) => options.map((option) => [option.value, option.textContent.trim()]))).toEqual([
      ["not_applicable", "Not applicable"],
      ["feminized", "Feminized"],
      ["regular", "Regular"],
      ["unknown", "Unknown"],
    ]);
    await typeField.selectOption("fast_flower");
    await sexField.selectOption("not_applicable");
    await expect(typeField).toHaveValue("fast_flower");
    await expect(sexField).toHaveValue("not_applicable");
    await expect(setup.locator("[data-germination-inventory-empty]")).toContainText("No Vault inventory impact");
    await expect(setup.locator("[data-germination-inventory-empty]")).toContainText("No Seed Entries in this setup are linked to My Seed Vault.");
    await expect(setup.locator("[data-germination-inventory]")).not.toContainText("Current Vault Balance");
    await expect(setup.locator("[data-germination-inventory]")).not.toContainText("Projected Vault Balance");
    await expect(setup.locator("[data-germination-inventory-breakdown]")).toContainText("1 seed in this Session");
    await setup.getByLabel("Same for all Seed Entries").check();
    await addEntry.click();
    const secondEntry = entryList.locator("[data-germination-entry]").nth(1);
    await secondEntry.getByLabel("Choose from My Seed Vault", { exact: true }).check();
    await secondEntry.locator("[data-germination-vault-search]").fill("Northern");
    await secondEntry.locator(`[data-germination-vault-option="${FIXTURE_VAULT_SECONDARY_ID}"]`).click();
    await expect(typeField).toHaveValue("fast_flower");
    await expect(sexField).toHaveValue("not_applicable");
    await expect(setup.locator("[data-germination-inventory]")).toContainText("Current Vault Balance");
    await expect(setup.locator("[data-germination-inventory]")).toContainText("Projected Vault Balance");
    expect(await entryList.locator('[data-germination-entry-field="ageReferenceKind"]').evaluateAll((fields) => fields.map((field) => field.value))).toEqual(["unknown", "unknown"]);
    await expect(entryList.locator('[data-germination-entry-field="ageSourceValue"]')).toHaveCount(0);

    await page.setViewportSize({ width: 1366, height: 900 });
    const desktopVaultLayout = await secondEntry.locator("[data-germination-vault-selected]").evaluate((selection) => {
      const identity = selection.querySelector(".germination-vault-selection__identity").getBoundingClientRect();
      const actions = selection.querySelector(".germination-vault-selection__actions").getBoundingClientRect();
      const metrics = selection.querySelector("dl").getBoundingClientRect();
      const selectionBounds = selection.getBoundingClientRect();
      return {
        actionsRight: actions.right,
        identityRight: identity.right,
        metricsWidth: metrics.width,
        selectionWidth: selectionBounds.width,
      };
    });
    expect(desktopVaultLayout.actionsRight).toBeGreaterThan(desktopVaultLayout.identityRight);
    expect(desktopVaultLayout.metricsWidth).toBeGreaterThan(desktopVaultLayout.selectionWidth * 0.9);

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileVaultLayout = await secondEntry.locator("[data-germination-vault-selected]").evaluate((selection) => {
      const identity = selection.querySelector(".germination-vault-selection__identity").getBoundingClientRect();
      const actions = selection.querySelector(".germination-vault-selection__actions").getBoundingClientRect();
      return { identityBottom: identity.bottom, actionsTop: actions.top };
    });
    expect(mobileVaultLayout.actionsTop).toBeGreaterThanOrEqual(mobileVaultLayout.identityBottom);
    await primaryReviewSetup.click();
    const validationReviewDialog = setup.locator("[data-germination-review-dialog]");
    await expect(validationReviewDialog).toBeVisible();
    await validationReviewDialog.getByRole("button", { name: "Return to setup" }).click();
    await secondEntry.locator("[data-germination-remove-entry]").click();
    await page.setViewportSize({ width: 1280, height: 900 });
    await vaultOrigin.check();
    await firstEntry.locator("[data-germination-vault-search]").fill("Blue Dream");
    await firstEntry.locator(`[data-germination-vault-option="${FIXTURE_VAULT_ID}"]`).click();
    await methodSelect.selectOption("KAN");
    await setup.locator('[data-germination-kan-partition="P1"]').click();
    const blueDreamIncrease = firstEntry.getByRole("button", { name: "Increase Blue Dream quantity" });
    for (let quantity = 2; quantity <= 7; quantity += 1) await blueDreamIncrease.click();
    await expect(firstEntry.getByRole("button", { name: "Increase Blue Dream quantity" })).toBeDisabled();
    await expect(firstEntry.locator("[data-germination-vault-selected] dl div").filter({ hasText: "Projected after save" })).toContainText("0 seeds");
    expect(runLocalSql(`select quantity from public.seed_vault_entries where id = ${escapeSqlLiteral(FIXTURE_VAULT_ID)}::uuid;`)).toBe("7");
    for (let quantity = 6; quantity >= 1; quantity -= 1) {
      await firstEntry.getByRole("button", { name: "Decrease Blue Dream quantity" }).click();
    }

    for (const [methodId, label, propagationCopy] of [
      ["ROCKWOOL", "Rockwool", "1 seed per cube"],
      ["RAPID_ROOTER", "Starter Plug", "1 seed per plug"],
      ["DIRECT_SOW", "Direct Sow", "1 seed per planting location"],
      ["OTHER", "Other", ""],
    ]) {
      await methodSelect.selectOption(methodId);
      await expect(setup.locator(`[data-germination-method-visual="${methodId}"]`)).toBeVisible();
      await expect(setup.locator("[data-germination-method-structure]")).toContainText(`${label} setup visual`);
      if (propagationCopy) await expect(setup.locator("[data-germination-method-position]").first()).toContainText(propagationCopy);
      if (methodId === "ROCKWOOL") await expect(entryList.locator(".germination-seed-entry__index")).toHaveText("Cube 1");
      if (methodId === "RAPID_ROOTER") await expect(entryList.locator(".germination-seed-entry__index")).toHaveText("Plug 1");
      if (methodId === "DIRECT_SOW") await expect(entryList.locator(".germination-seed-entry__index")).toHaveText("Planting Location 1");
      if (propagationCopy) {
        await expect(entryList.locator("[data-germination-structure-assignment]")).toHaveCount(0);
        await expect(entryList.locator("[data-germination-fixed-quantity]")).toHaveCount(0);
        await expect(entryList.locator(".germination-seed-entry__quantity")).toHaveCount(0);
      }
    }
    for (const [methodId, label, stages] of [
      ["PAPER_TOWEL", "Paper Towel", 1],
      ["PAPER_TOWEL_SOAK", "Soak + Paper Towel", 2],
      ["WATER_SOAK", "Water Glass", 1],
    ]) {
      await methodSelect.selectOption(methodId);
      const sharedVisual = setup.locator(`[data-germination-method-visual="${methodId}"][data-germination-shared-method]`);
      await expect(sharedVisual).toBeVisible();
      await expect(setup.locator("[data-germination-method-structure]")).toContainText(`${label} setup visual`);
      await expect(sharedVisual.locator(".germination-shared-unit")).toHaveCount(1);
      await expect(sharedVisual.locator(".germination-shared-stage")).toHaveCount(stages);
      await expect(entryList.locator("[data-germination-structure-assignment]")).toHaveCount(0);
    }
    await methodSelect.selectOption("KAN");

    const kanPartitions = setup.locator("[data-germination-kan-partition]");
    await expect(kanPartitions).toHaveCount(8);
    await expect(setup.locator("[data-germination-method-structure]")).toContainText("KAN® setup · 8 positions");
    const kanImage = setup.locator('.germination-kan-layout__image img[src="/public/assets/images/images/placeholder/kan_method.png"]');
    await expect(kanImage).toBeVisible();
    await expect(setup.locator(".germination-kan-layout__image [data-germination-kan-partition]")).toHaveCount(8);
    await expect(setup.locator("[data-germination-kan-partition-control] [data-germination-kan-partition]")).toHaveCount(8);
    await expect(setup.locator(".germination-kan-partition-control")).toHaveCount(0);
    await expect(entryList.locator("[data-germination-structure-assignment]")).toHaveCount(0);
    await expect(setup.locator("[data-germination-kan-filter-paper]")).toContainText("Filter paper required at Germination start: 1");
    await expect(setup.locator("[data-germination-kan-filter-paper]")).toContainText("Nothing is deducted while this setup remains a draft.");
    await expect(setup.locator('[data-germination-kan-partition="P1"]')).toHaveAttribute("data-partition-state", "selected");
    await expect(entryList.locator(".germination-seed-entry__index").first()).toHaveText("P1");
    await entryList.locator("[data-germination-kan-assignment-select]").first().selectOption("P2");
    await expect(entryList.locator(".germination-seed-entry__index").first()).toHaveText("P2");
    await expect(setup.locator('[data-germination-kan-partition="P2"]')).toHaveAttribute("data-partition-state", "selected");
    await setup.locator('[data-germination-kan-partition="P1"]').click();
    await expect(firstEntry).toBeFocused();
    await expect(firstEntry).toHaveClass(/is-navigation-target/);
    await expect(firstEntry.locator(".germination-seed-entry__index")).toHaveText("P1");
    await expect(setup.locator('[data-germination-kan-partition="P1"]')).toHaveAttribute("data-partition-state", "selected");

    await addEntry.click();
    await expect(entryList.locator("[data-germination-entry]")).toHaveCount(2);
    await expect(entryList.getByLabel("Choose from My Seed Vault", { exact: true }).last()).not.toBeChecked();
    await expect(entryList.getByLabel("Enter manually", { exact: true }).last()).not.toBeChecked();
    await expect(entryList.getByLabel("Choose from My Seed Vault", { exact: true }).last()).toBeFocused();
    await entryList.getByLabel("Enter manually", { exact: true }).last().check();
    await entryList.locator('[data-germination-entry-field="variety"]').last().fill("Manual P2");
    await expect(entryList.locator(".germination-seed-entry__index").last()).toHaveText("P2");
    await setup.locator('[data-germination-kan-partition="P2"]').click();
    await addEntry.focus();
    await expect(addEntry).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(entryList.locator("[data-germination-entry]")).toHaveCount(3);
    await entryList.getByLabel("Enter manually", { exact: true }).last().check();
    await entryList.locator('[data-germination-entry-field="variety"]').last().fill("Manual P3");
    await setup.locator('[data-germination-kan-partition="P3"]').click();
    for (let count = 4; count <= 8; count += 1) {
      await addEntry.click();
      await expect(entryList.locator("[data-germination-entry]")).toHaveCount(count);
      await expect(entryList.getByLabel("Choose from My Seed Vault", { exact: true }).last()).not.toBeChecked();
      await expect(entryList.getByLabel("Enter manually", { exact: true }).last()).not.toBeChecked();
      await entryList.getByLabel("Enter manually", { exact: true }).last().check();
      await entryList.locator('[data-germination-entry-field="variety"]').last().fill(`Manual P${count}`);
      await expect(entryList.locator(".germination-seed-entry__index").last()).toHaveText(`P${count}`);
      await setup.locator(`[data-germination-kan-partition="P${count}"]`).click();
    }
    await expect(entryList.locator("[data-germination-entry]")).toHaveCount(8);
    await expect(addEntry).toBeDisabled();
    await expect(setup.locator("[data-germination-capacity-message]")).toHaveText("All 8 KAN® partitions are assigned.");

    const p3EntryId = await entryList.locator("[data-germination-entry]").evaluateAll((entries) => (
      entries.find((entry) => entry.querySelector(".germination-seed-entry__index")?.textContent.trim() === "P3")?.dataset.germinationEntry
    ));
    await entryList.locator(`[data-germination-entry="${p3EntryId}"] [data-germination-remove-entry]`).click();
    await expect(entryList.locator("[data-germination-entry]")).toHaveCount(7);
    expect(await entryList.locator(".germination-seed-entry__index").allTextContents()).toEqual(["P1", "P2", "P4", "P5", "P6", "P7", "P8"]);
    await addEntry.click();
    await entryList.getByLabel("Enter manually", { exact: true }).last().check();
    await entryList.locator('[data-germination-entry-field="variety"]').last().fill("Replacement P3");
    await expect(entryList.locator(".germination-seed-entry__index").last()).toHaveText("P3");
    await expect(setup.locator('[data-germination-kan-partition="P3"]')).toHaveAttribute("data-partition-state", "selected");

    await methodSelect.selectOption("ROCKWOOL");
    expect(await entryList.locator(".germination-seed-entry__index").allTextContents()).toEqual(Array.from({ length: 8 }, (_, index) => `Cube ${index + 1}`));
    await expect(entryList.locator("[data-germination-structure-assignment]")).toHaveCount(0);
    await expect(entryList.locator("[data-germination-fixed-quantity]")).toHaveCount(0);
    await expect(addEntry).toBeEnabled();
    await addEntry.click();
    await entryList.getByLabel("Enter manually", { exact: true }).last().check();
    await entryList.locator('[data-germination-entry-field="variety"]').last().fill("Rockwool Nine");
    await expect(entryList.locator("[data-germination-entry]")).toHaveCount(9);
    await expect(entryList.locator(".germination-seed-entry__index").last()).toHaveText("Cube 9");
    await expect(entryList.getByRole("button", { name: /Increase .* quantity/ })).toHaveCount(0);

    while (await entryList.locator("[data-germination-entry]").count() > 6) {
      await entryList.locator("[data-germination-entry]").last().locator("[data-germination-remove-entry]").click();
    }
    await expect(entryList.locator("[data-germination-entry]")).toHaveCount(6);
    await page.setViewportSize({ width: 1366, height: 900 });
    const rockwoolVisual = setup.locator('[data-germination-method-visual="ROCKWOOL"]');
    const rockwoolPositions = rockwoolVisual.locator("[data-germination-method-position]");
    const rockwoolEntrySix = entryList.locator("[data-germination-entry]").nth(5);
    const entrySixValuesBeforeNavigation = await rockwoolEntrySix.locator("input, select, textarea").evaluateAll((controls) => controls.map((control) => [control.tagName, control.type, control.value, control.checked]));
    await rockwoolVisual.scrollIntoViewIfNeeded();
    expect((await rockwoolEntrySix.boundingBox()).y).toBeGreaterThan(900);
    await rockwoolPositions.nth(5).click();
    await expect(rockwoolEntrySix).toBeFocused();
    await expect(rockwoolEntrySix).toHaveClass(/is-navigation-target/);
    await expect(rockwoolEntrySix).toHaveClass(/is-selected/);
    await expect(rockwoolPositions.nth(5)).toHaveAttribute("aria-pressed", "true");
    await expect.poll(async () => Math.round((await rockwoolEntrySix.boundingBox()).y)).toBeLessThan(900);
    expect((await rockwoolEntrySix.boundingBox()).y).toBeGreaterThanOrEqual(108);
    expect(await rockwoolEntrySix.locator("input, select, textarea").evaluateAll((controls) => controls.map((control) => [control.tagName, control.type, control.value, control.checked]))).toEqual(entrySixValuesBeforeNavigation);

    await rockwoolVisual.scrollIntoViewIfNeeded();
    await rockwoolPositions.nth(5).click();
    await expect(rockwoolEntrySix).toBeFocused();
    await expect(rockwoolEntrySix).toHaveClass(/is-navigation-target/);

    const rockwoolEntryFive = entryList.locator("[data-germination-entry]").nth(4);
    await rockwoolVisual.scrollIntoViewIfNeeded();
    await rockwoolPositions.nth(4).focus();
    await page.keyboard.press("Enter");
    await expect(rockwoolEntryFive).toBeFocused();
    await expect(rockwoolPositions.nth(4)).toHaveAttribute("aria-pressed", "true");

    const rockwoolEntryTwo = entryList.locator("[data-germination-entry]").nth(1);
    await rockwoolEntryTwo.locator("[data-germination-entry-select]").click();
    await expect(rockwoolPositions.nth(1)).toHaveAttribute("aria-pressed", "true");
    const rockwoolEntryThreeVariety = entryList.locator("[data-germination-entry]").nth(2).locator('[data-germination-entry-field="variety"]');
    await rockwoolEntryThreeVariety.focus();
    await expect(rockwoolPositions.nth(2)).toHaveAttribute("aria-pressed", "true");
    const rockwoolEntryThreeVarietyValue = await rockwoolEntryThreeVariety.inputValue();
    await rockwoolEntryThreeVariety.fill(`${rockwoolEntryThreeVarietyValue} edited`);
    await expect(rockwoolPositions.nth(2)).toContainText(`${rockwoolEntryThreeVarietyValue} edited`);
    await rockwoolEntryThreeVariety.fill(rockwoolEntryThreeVarietyValue);

    await page.setViewportSize({ width: 390, height: 844 });
    await rockwoolVisual.scrollIntoViewIfNeeded();
    await rockwoolPositions.nth(5).click();
    await expect(rockwoolEntrySix).toBeFocused();
    await expect(rockwoolEntrySix).toHaveClass(/is-navigation-target/);
    await expect.poll(async () => Math.round((await rockwoolEntrySix.boundingBox()).y)).toBeLessThan(844);
    expect((await rockwoolEntrySix.boundingBox()).y).toBeGreaterThanOrEqual(108);
    await page.setViewportSize({ width: 1280, height: 900 });

    await methodSelect.selectOption("PAPER_TOWEL_SOAK");
    await expect(setup.locator("[data-germination-summary]")).toContainText("Soak + Paper Towel");
    await expect(entryList.locator("[data-germination-structure-assignment]")).toHaveCount(0);
    await expect(setup.locator("[data-germination-shared-method] .germination-shared-unit")).toHaveCount(6);
    await expect(setup.locator("[data-germination-shared-method] .germination-shared-stage")).toHaveCount(12);
    await expect(addEntry).toBeEnabled();
    await entryList.getByRole("button", { name: "Increase Blue Dream quantity" }).click();
    await entryList.getByRole("button", { name: "Increase Blue Dream quantity" }).click();
    const firstAgeSource = entryList.locator('[data-germination-entry-field="ageReferenceKind"]').first();
    await firstAgeSource.selectOption("user_statement");
    await entryList.locator('[data-germination-entry-field="ageSourceValue"]').first().fill("1.5");
    await firstAgeSource.selectOption("unknown");
    await expect(entryList.locator("[data-germination-entry]").first().locator('[data-germination-entry-field="ageSourceValue"]')).toHaveCount(0);
    await setup.getByLabel("Same for all Seed Entries").check();
    await entryList.locator('[data-germination-entry-field="ageReferenceKind"]').first().selectOption("user_statement");
    await entryList.locator('[data-germination-entry-field="ageSourceValue"]').first().fill("2.5");
    expect(await entryList.locator('[data-germination-entry-field="ageReferenceKind"]').evaluateAll((fields) => fields.map((field) => field.value))).toEqual(Array(6).fill("user_statement"));
    expect(await entryList.locator('[data-germination-entry-field="ageSourceValue"]').evaluateAll((fields) => fields.map((field) => field.value))).toEqual(Array(6).fill("2.5"));

    await methodSelect.selectOption("DIRECT_SOW");
    await expect(setup.locator("[data-germination-summary]")).toContainText("Direct Sow");
    expect(await entryList.locator(".germination-seed-entry__index").allTextContents()).toEqual(Array.from({ length: 6 }, (_, index) => `Planting Location ${index + 1}`));
    await expect(entryList.locator("[data-germination-structure-assignment]")).toHaveCount(0);
    await expect(entryList.locator("[data-germination-fixed-quantity]")).toHaveCount(0);
    await expect(entryList.locator(".germination-seed-entry__quantity")).toHaveCount(0);
    await expect(setup.locator("[data-germination-method-notice]")).toContainText("each entry now represents one physical unit");

    const stickyRail = setup.locator("[data-germination-sticky-rail]");
    for (const viewport of [{ width: 1280, height: 900 }, { width: 1366, height: 900 }]) {
      await page.setViewportSize(viewport);
      await expect(stickyRail).toHaveCSS("position", "sticky");
      await page.evaluate(() => {
        const entries = document.querySelector("[data-germination-entry-list]");
        window.scrollTo(0, window.scrollY + entries.getBoundingClientRect().top - 180);
      });
      await page.waitForTimeout(100);
      const railBeforeLowerEntries = await stickyRail.boundingBox();
      await entryList.locator("[data-germination-entry]").last().scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
      const railAtLowerEntries = await stickyRail.boundingBox();
      expect(railBeforeLowerEntries.y).toBeGreaterThanOrEqual(84);
      expect(railAtLowerEntries.y).toBeCloseTo(railBeforeLowerEntries.y, 0);
      expect(railAtLowerEntries.y + railAtLowerEntries.height).toBeLessThanOrEqual(viewport.height + 1);
      expect(await stickyRail.evaluate((element) => ({ overflowY: getComputedStyle(element).overflowY, hasInternalScroll: element.scrollHeight > element.clientHeight + 1 }))).toEqual({ overflowY: "visible", hasInternalScroll: false });
      await expect(stickyRail.getByRole("button", { name: "Review Setup", exact: true })).toBeVisible();
    }

    await methodSelect.selectOption("KAN");
    while (await entryList.locator("[data-germination-entry]").count() > 1) {
      await entryList.locator("[data-germination-entry]").last().locator("[data-germination-remove-entry]").click();
    }
    expect(runLocalSql(`select quantity from public.seed_vault_entries where id = ${escapeSqlLiteral(FIXTURE_VAULT_ID)}::uuid;`)).toBe("7");
    await expect(entryList.locator(".germination-seed-entry__index")).toHaveText("P1");
    await expect(entryList.locator("[data-germination-kan-assignment-select]")).toHaveValue("P1");
    await manualOrigin.check();
    const finalManualEntry = entryList.locator("[data-germination-entry]").first();
    await finalManualEntry.locator('[data-germination-entry-field="seedType"]').selectOption("fast_flower");
    await finalManualEntry.locator('[data-germination-entry-field="sex"]').selectOption("not_applicable");
    await finalManualEntry.locator('[data-germination-entry-field="ageReferenceKind"]').selectOption("unknown");
    await expect(setup.locator("[data-germination-inventory-empty]")).toContainText("No Vault inventory impact");
    await primaryReviewSetup.click();
    const reviewDialog = setup.locator("[data-germination-review-dialog]");
    await expect(reviewDialog).toBeVisible();
    await expect(reviewDialog.locator("[data-germination-review-dialog-entries] .germination-review-dialog__entry")).toHaveCount(1);
    await expect(reviewDialog.locator("[data-germination-review-dialog-entries]")).toContainText("P1");
    await expect(reviewDialog.locator("[data-germination-review-dialog-entries]")).toContainText("Blue Dream");
    await expect(reviewDialog.locator("[data-germination-review-dialog-entries]")).toContainText("1 seed");
    await expect(reviewDialog.getByRole("button", { name: "Save Session", exact: true })).toBeVisible();
    expect(runLocalSql(`select quantity from public.seed_vault_entries where id = ${escapeSqlLiteral(FIXTURE_VAULT_ID)}::uuid;`)).toBe("7");
    const filterPaperBeforeSave = await page.evaluate(() => localStorage.getItem("cannakanGrowFilterPaperInventory"));
    await reviewDialog.getByRole("button", { name: "Save Session", exact: true }).click();
    await expect(page.locator("[data-germination-connection-status]")).toContainText("Saved setup", { timeout: 15000 });
    await expect.poll(() => page.evaluate(() => window.location.hash)).toMatch(/^#new\/germination-setup\/[0-9a-f-]{36}$/i);
    expect(await page.evaluate(() => localStorage.getItem("cannakanGrowFilterPaperInventory"))).toBe(filterPaperBeforeSave);
    await expect(page.getByRole("button", { name: /Start Germination/i })).toHaveCount(0);

    expect(runLocalSql(`
select concat_ws('|',
  (select count(*) from public.grow_sessions where user_id = ${escapeSqlLiteral(demoIdentity.ownerId)}::uuid and session_name = ${escapeSqlLiteral(FIXTURE_SESSION_NAME)}),
  (select quantity from public.seed_vault_entries where id = ${escapeSqlLiteral(FIXTURE_VAULT_ID)}::uuid),
  (select count(*) from public.seed_vault_germination_inventory_operations where vault_entry_id = ${escapeSqlLiteral(FIXTURE_VAULT_ID)}::uuid),
  (select entry_path from public.grow_sessions where user_id = ${escapeSqlLiteral(demoIdentity.ownerId)}::uuid and session_name = ${escapeSqlLiteral(FIXTURE_SESSION_NAME)}),
  (select count(*) from public.grow_session_condition_periods where session_id = (select id from public.grow_sessions where user_id = ${escapeSqlLiteral(demoIdentity.ownerId)}::uuid and session_name = ${escapeSqlLiteral(FIXTURE_SESSION_NAME)})),
  (select setup_evidence #>> '{entries,0,position}' from public.grow_session_germination_setups where session_id = (select id from public.grow_sessions where user_id = ${escapeSqlLiteral(demoIdentity.ownerId)}::uuid and session_name = ${escapeSqlLiteral(FIXTURE_SESSION_NAME)}))
);
`)).toBe("1|7|0|seed|0|P1");

    await page.reload();
    await expect(page.locator("[data-germination-connection-status]")).toContainText("Saved setup", { timeout: 15000 });
    await expect(page.locator("[data-germination-entry]")).toHaveCount(1);
    await expect(page.locator('[data-germination-entry-field="seedType"]')).toHaveValue("fast_flower");
    await expect(page.locator('[data-germination-entry-field="sex"]')).toHaveValue("not_applicable");
    await expect(page.locator('[data-germination-entry-field="ageReferenceKind"]')).toHaveValue("unknown");
    await expect(page.locator("[data-germination-inventory-empty]")).toContainText("No Vault inventory impact");
    await expect(page.locator(".germination-seed-entry__index")).toHaveText("P1");
    await expect(page.locator("[data-germination-kan-assignment-select]")).toHaveValue("P1");
    await expect(page.locator('[data-germination-kan-partition="P1"]')).toHaveAttribute("data-partition-state", "selected");

    const reloadedEntry = page.locator("[data-germination-entry]").first();
    await reloadedEntry.getByLabel("Choose from My Seed Vault", { exact: true }).check();
    await reloadedEntry.locator("[data-germination-vault-search]").fill("Blue Dream");
    await reloadedEntry.locator(`[data-germination-vault-option="${FIXTURE_VAULT_ID}"]`).click();
    await reloadedEntry.getByRole("button", { name: "Increase Blue Dream quantity" }).click();
    await reloadedEntry.getByRole("button", { name: "Increase Blue Dream quantity" }).click();
    await expect(page.locator("[data-germination-inventory]")).toContainText("Current Vault Balance");
    await page.getByRole("button", { name: "Review Setup", exact: true }).first().click();
    await page.getByRole("button", { name: "Save Session", exact: true }).click();
    await expect(page.locator("[data-germination-connection-status]")).toContainText("Saved setup", { timeout: 15000 });
    await expect(page.locator("[data-germination-review-dialog]")).toBeHidden({ timeout: 15000 });
    await expect(page.locator("[data-germination-method]")).toHaveValue("KAN", { timeout: 15000 });
    expect(runLocalSql(`
select concat_ws('|',
  (select quantity from public.seed_vault_entries where id = ${escapeSqlLiteral(FIXTURE_VAULT_ID)}::uuid),
  (select count(*) from public.seed_vault_germination_inventory_operations where vault_entry_id = ${escapeSqlLiteral(FIXTURE_VAULT_ID)}::uuid)
);
`)).toBe("4|1");

    await page.reload();
    await expect(page.locator("[data-germination-connection-status]")).toContainText("Saved setup", { timeout: 15000 });
    await expect(page.locator("[data-germination-inventory]")).toContainText("4");

    await page.getByRole("button", { name: "Decrease Blue Dream quantity" }).click();
    await page.getByRole("button", { name: "Review Setup", exact: true }).first().click();
    await page.getByRole("button", { name: "Save Session", exact: true }).click();
    await expect(page.locator("[data-germination-connection-status]")).toContainText("Saved setup", { timeout: 15000 });
    await expect(page.locator("[data-germination-review-dialog]")).toBeHidden({ timeout: 15000 });
    await expect(page.locator("[data-germination-method]")).toHaveValue("KAN", { timeout: 15000 });
    expect(runLocalSql(`
select concat_ws('|',
  (select quantity from public.seed_vault_entries where id = ${escapeSqlLiteral(FIXTURE_VAULT_ID)}::uuid),
  (select count(*) from public.seed_vault_germination_inventory_operations where vault_entry_id = ${escapeSqlLiteral(FIXTURE_VAULT_ID)}::uuid)
);
`)).toBe("5|2");

    await methodSelect.selectOption("PAPER_TOWEL");
    await expect(entryList.locator(".germination-seed-entry__index")).toHaveText("Paper Towel 1");
    await addEntry.click();
    const towelEntry = entryList.locator("[data-germination-entry]").last();
    await towelEntry.getByLabel("Enter manually", { exact: true }).check();
    await towelEntry.locator('[data-germination-entry-field="variety"]').fill("Towel Companion");
    await towelEntry.locator('[data-germination-quantity="increase"]').click();
    await towelEntry.locator('[data-germination-quantity="increase"]').click();
    expect(await entryList.locator(".germination-seed-entry__index").allTextContents()).toEqual(["Paper Towel 1", "Paper Towel 2"]);
    await expect(setup.locator('[data-germination-method-visual="PAPER_TOWEL"] .germination-shared-unit')).toHaveCount(2);
    await expect(setup.locator('[data-germination-method-visual="PAPER_TOWEL"] .germination-shared-stage')).toHaveCount(2);
    await page.getByRole("button", { name: "Review Setup", exact: true }).first().click();
    const towelReview = page.locator("[data-germination-review-dialog]");
    await expect(towelReview.locator(".germination-review-dialog__entry")).toHaveCount(2);
    await expect(towelReview.locator("[data-germination-review-dialog-entries]")).toContainText("Paper Towel 1");
    await expect(towelReview.locator("[data-germination-review-dialog-entries]")).toContainText("Paper Towel 2");
    await expect(towelReview.locator("[data-germination-review-dialog-entries]")).toContainText("Towel Companion");
    await expect(towelReview.locator("[data-germination-review-dialog-entries]")).toContainText("3 seeds");
    await towelReview.getByRole("button", { name: "Save Session", exact: true }).click();
    await expect(page.locator("[data-germination-connection-status]")).toContainText("Saved setup", { timeout: 15000 });
    await expect(page.locator("[data-germination-review-dialog]")).toBeHidden({ timeout: 15000 });
    await expect(page.locator("[data-germination-method]")).toHaveValue("PAPER_TOWEL", { timeout: 15000 });
    await page.reload();
    await expect(page.locator("[data-germination-connection-status]")).toContainText("Saved setup", { timeout: 15000 });
    await expect(page.locator("[data-germination-method]")).toHaveValue("PAPER_TOWEL");
    expect(await page.locator(".germination-seed-entry__index").allTextContents()).toEqual(["Paper Towel 1", "Paper Towel 2"]);
    await expect(page.locator('[data-germination-method-visual="PAPER_TOWEL"] .germination-shared-unit')).toHaveCount(2);

    await page.locator("[data-germination-method]").selectOption("WATER_SOAK");
    expect(await page.locator(".germination-seed-entry__index").allTextContents()).toEqual(["Glass 1", "Glass 2"]);
    await expect(page.locator('[data-germination-method-visual="WATER_SOAK"] .germination-shared-unit')).toHaveCount(2);
    await expect(page.locator('[data-germination-method-visual="WATER_SOAK"] .germination-shared-stage')).toHaveCount(2);
    await page.getByRole("button", { name: "Review Setup", exact: true }).first().click();
    const glassReview = page.locator("[data-germination-review-dialog]");
    await expect(glassReview.locator("[data-germination-review-dialog-entries]")).toContainText("Glass 1");
    await expect(glassReview.locator("[data-germination-review-dialog-entries]")).toContainText("Glass 2");
    await glassReview.getByRole("button", { name: "Save Session", exact: true }).click();
    await expect(page.locator("[data-germination-connection-status]")).toContainText("Saved setup", { timeout: 15000 });
    await expect(page.locator("[data-germination-review-dialog]")).toBeHidden({ timeout: 15000 });
    await expect(page.locator("[data-germination-method]")).toHaveValue("WATER_SOAK", { timeout: 15000 });
    await page.reload();
    await expect(page.locator("[data-germination-connection-status]")).toContainText("Saved setup", { timeout: 15000 });
    await expect(page.locator("[data-germination-method]")).toHaveValue("WATER_SOAK");
    expect(await page.locator(".germination-seed-entry__index").allTextContents()).toEqual(["Glass 1", "Glass 2"]);
    await expect(page.locator('[data-germination-method-visual="WATER_SOAK"] .germination-shared-unit')).toHaveCount(2);
    await page.locator("[data-germination-method]").selectOption("KAN");

    for (const viewport of [
      { width: 1280, height: 900 },
      { width: 1366, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await expect(setup).toBeVisible();
      const geometry = await page.evaluate(() => {
        const root = document.querySelector("[data-germination-setup-preview]");
        const bounds = root?.getBoundingClientRect();
        return {
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
          rootLeft: bounds?.left ?? -1,
          rootRight: bounds?.right ?? Number.POSITIVE_INFINITY,
        };
      });
      expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1);
      expect(geometry.rootLeft).toBeGreaterThanOrEqual(-1);
      expect(geometry.rootRight).toBeLessThanOrEqual(geometry.viewportWidth + 1);
      const rail = setup.locator("[data-germination-sticky-rail]");
      const kanLayoutBounds = await setup.locator(".germination-kan-layout").boundingBox();
      expect(kanLayoutBounds.width).toBeLessThanOrEqual(431);
      const kanTargetSizes = await setup.locator("[data-germination-kan-partition]").evaluateAll((buttons) => buttons.map((button) => {
        const bounds = button.getBoundingClientRect();
        return [bounds.width, bounds.height];
      }));
      for (const [width, height] of kanTargetSizes) {
        expect(width).toBeGreaterThanOrEqual(44);
        expect(height).toBeGreaterThanOrEqual(44);
      }
      const kanIndicatorGeometry = await setup.locator(".germination-kan-layout__indicators").evaluate((overlay) => {
        const bounds = overlay.getBoundingClientRect();
        return Object.fromEntries([...overlay.querySelectorAll("[data-germination-kan-partition]")].map((button) => {
          const buttonBounds = button.getBoundingClientRect();
          return [button.dataset.germinationKanPartition, {
            x: (buttonBounds.left + buttonBounds.width / 2 - bounds.left) / bounds.width,
            y: (buttonBounds.top + buttonBounds.height / 2 - bounds.top) / bounds.height,
          }];
        }));
      });
      for (const [partition, expectedPosition] of Object.entries({
        P1: [0.5, 0.23], P2: [0.695, 0.3], P3: [0.76, 0.505], P4: [0.7, 0.705],
        P5: [0.5, 0.76], P6: [0.3, 0.705], P7: [0.24, 0.505], P8: [0.305, 0.3],
      })) {
        expect(kanIndicatorGeometry[partition].x).toBeCloseTo(expectedPosition[0], 2);
        expect(kanIndicatorGeometry[partition].y).toBeCloseTo(expectedPosition[1], 2);
      }
      expect((await setup.locator("[data-germination-kan-partition]").allTextContents()).some((text) => text.includes("✓"))).toBe(false);
      if (viewport.width >= 981) {
        await expect(rail).toHaveCSS("position", "sticky");
        await expect(rail.getByRole("button", { name: "Review Setup", exact: true })).toBeVisible();
        const details = setup.locator("[data-germination-entry]").last().locator(".germination-seed-entry__details");
        const sourceWidth = await details.locator(".germination-entry-field--source").first().evaluate((field) => field.getBoundingClientRect().width);
        const typeWidth = await details.locator('[data-germination-entry-field="seedType"]').evaluate((field) => field.closest("label").getBoundingClientRect().width);
        expect(sourceWidth).toBeGreaterThan(typeWidth * 1.5);
      }
      if (viewport.width === 390) {
        await expect(rail).toHaveCSS("position", "static");
        await expect(setup.getByRole("button", { name: "Review Setup", exact: true })).toHaveCount(1);
        await expect(setup.locator(".germination-setup-preview__aside [data-germination-review-setup]")).toBeHidden();
        await expect(setup.locator(".germination-review-action--primary").getByRole("button", { name: "Review Setup", exact: true })).toBeVisible();
        const draftBadge = await page.locator("[data-germination-draft-badge]").boundingBox();
        expect(draftBadge?.width).toBeLessThan(100);
      }
    }

    const testedFlowConsoleErrors = consoleErrors.filter((message) => (
      /\[Germination Setup\]/i.test(message)
      || !message.startsWith("Failed to load resource:")
    ));
    const testedFlowRequestFailures = failedApplicationRequests.filter((request) => (
      /\/auth\/v1\/|germination_setup/i.test(request)
    ));
    expect(testedFlowConsoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(testedFlowRequestFailures).toEqual([]);
  });

  test("implements the final founder corrections without repeating full reload qualification", async ({ page }) => {
    test.setTimeout(90000);
    const consoleErrors = [];
    const pageErrors = [];
    const failedApplicationRequests = [];
    const directVaultUpdateRequests = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("request", (request) => {
      const path = new URL(request.url()).pathname;
      if (/seed_vault_entries/i.test(path) && ["PATCH", "PUT", "DELETE"].includes(request.method())) {
        directVaultUpdateRequests.push(`${request.method()} ${path}`);
      }
    });
    page.on("requestfailed", (request) => {
      if (["fetch", "xhr"].includes(request.resourceType())) {
        failedApplicationRequests.push(`${request.method()} ${new URL(request.url()).pathname} ${request.failure()?.errorText || "failed"}`);
      }
    });
    page.on("response", (response) => {
      const request = response.request();
      if (["fetch", "xhr"].includes(request.resourceType()) && response.status() >= 400) {
        failedApplicationRequests.push(`${request.method()} ${new URL(response.url()).pathname} ${response.status()}`);
      }
    });

    await page.route("**/supabase-config.js", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/javascript; charset=utf-8",
        body: `window.CANNAKAN_SUPABASE_CONFIG = ${JSON.stringify({
          url: LOCAL_SUPABASE_URL,
          anonKey: LOCAL_SUPABASE_ANON_KEY,
          pushPublicKey: "",
          cloudflareStreamCustomerCode: "",
          devPreviewDataEnabled: false,
          localDemoAuthEnabled: true,
        })};`,
      });
    });

    await page.goto("/#seed-vault");
    const authForm = page.locator("#auth-form");
    await expect(authForm).toBeVisible();
    await authForm.locator('input[name="email"]').fill(demoIdentity.email);
    await authForm.locator('input[name="password"]').fill(demoIdentity.password);
    await authForm.locator('button[value="login"]').click();

    const fixtureCard = page.locator(`[data-seed-vault-entry-id="${FIXTURE_VAULT_ID}"]`);
    await expect(fixtureCard).toBeVisible({ timeout: 15000 });
    await fixtureCard.locator(`[data-seed-vault-more="${FIXTURE_VAULT_ID}"]`).click();
    await fixtureCard.locator(`[data-seed-vault-start-session="${FIXTURE_VAULT_ID}"]`).click();
    const decisionDialog = page.getByRole("dialog", { name: "How does this Session begin?" });
    await decisionDialog.getByRole("button", { name: /Seed Session/ }).click();
    await decisionDialog.locator('[data-system-type="KAN"]').click();

    const setup = page.locator("[data-germination-setup-preview]");
    const entryList = setup.locator("[data-germination-entry-list]");
    const entries = entryList.locator("[data-germination-entry]");
    const addEntry = setup.getByRole("button", { name: "Add Seed Entry", exact: true });
    const reviewSetup = setup.getByRole("button", { name: "Review Setup", exact: true }).first();
    await expect(setup).toHaveAttribute("data-preview-state", "incomplete", { timeout: 15000 });
    await setup.locator("[data-germination-session-name]").fill(FIXTURE_SESSION_NAME);
    await setup.locator("[data-germination-start-date]").fill("2026-08-12");
    await expect(entries).toHaveCount(1);
    await expect(entries.first().locator(".germination-seed-entry__index")).toHaveText("P1");
    await expect(setup.locator("[data-germination-kan-assignment-select]")).toHaveCount(0);
    await expect(setup.locator("[data-germination-kan-list-row]")).toHaveCount(8);
    await expect(setup.locator('[data-germination-kan-list-row="P1"]')).toContainText("Seed Entry 1");
    await expect(setup.locator('[data-germination-kan-list-row="P8"]')).toContainText("Available");
    await expect(setup.locator('[data-germination-kan-partition="P8"]')).toBeDisabled();

    const firstEntryId = await entries.first().getAttribute("data-germination-entry");
    await setup.locator('[data-germination-kan-partition="P1"]').click();
    await expect(entries.first()).toBeFocused();
    await expect(entries.first()).toHaveClass(/is-navigation-target/);
    await expect(entries.first()).toHaveAttribute("data-germination-entry", firstEntryId);

    const setManualEntry = async (entry, variety) => {
      await entry.getByLabel("Enter manually", { exact: true }).check();
      await entry.locator('[data-germination-entry-field="variety"]').fill(variety);
    };
    await setManualEntry(entries.nth(0), "Alpha Manual");
    await addEntry.click();
    await setManualEntry(entries.nth(1), "Beta Manual");
    await addEntry.click();
    await setManualEntry(entries.nth(2), "Gamma Manual");
    await entries.nth(0).getByRole("button", { name: /Increase Alpha Manual quantity/ }).click();
    await entries.nth(1).getByRole("button", { name: /Increase Beta Manual quantity/ }).click();
    await expect(setup.locator('[data-germination-kan-list-row="P1"]')).toContainText("Alpha Manual");
    await expect(setup.locator('[data-germination-kan-list-row="P1"]')).toContainText("2 seeds");
    await expect(setup.locator('[data-germination-kan-list-row="P2"]')).toContainText("Beta Manual");
    await expect(setup.locator('[data-germination-kan-list-row="P3"]')).toContainText("Gamma Manual");

    await entries.nth(1).locator("[data-germination-remove-entry]").click();
    await expect(entries).toHaveCount(2);
    expect(await entries.locator(".germination-seed-entry__index").allTextContents()).toEqual(["P1", "P2"]);
    await expect(entries.nth(1).locator('[data-germination-entry-field="variety"]')).toHaveValue("Gamma Manual");
    await expect(setup.locator('[data-germination-kan-list-row="P2"]')).toContainText("Gamma Manual");
    await expect(setup.locator('[data-germination-kan-list-row="P3"]')).toContainText("Available");

    page.once("dialog", (dialog) => dialog.dismiss());
    await setup.getByRole("button", { name: "Reset Setup", exact: true }).click();
    await expect(entries).toHaveCount(2);
    page.once("dialog", (dialog) => dialog.accept());
    await setup.getByRole("button", { name: "Reset Setup", exact: true }).click();
    await expect(entries).toHaveCount(1);
    await expect(entries.first().locator(".germination-seed-entry__index")).toHaveText("P1");
    await expect(setup.locator("[data-germination-method]")).toHaveValue("KAN");
    await expect(setup.locator("[data-germination-session-name]")).toHaveValue(FIXTURE_SESSION_NAME);
    await expect(setup.locator("[data-germination-start-date]")).toHaveValue("2026-08-12");
    await expect(setup).toContainText("Nothing was saved and Germination has not started.");
    expect(runLocalSql(`select count(*) from public.grow_sessions where user_id = ${escapeSqlLiteral(demoIdentity.ownerId)}::uuid and session_name = ${escapeSqlLiteral(FIXTURE_SESSION_NAME)};`)).toBe("0");
    expect(runLocalSql(`select concat_ws('|', quantity, year_acquired) from public.seed_vault_entries where id = ${escapeSqlLiteral(FIXTURE_VAULT_ID)}::uuid;`)).toBe("7|2025");

    await reviewSetup.click();
    const validation = setup.locator("[data-germination-validation]");
    await expect(validation.locator(".germination-setup-validation__notice")).toContainText("!");
    await expect(validation).toContainText("Review found 1 problem.");
    const validationAlignment = await validation.evaluate((node) => {
      const notice = node.querySelector(".germination-setup-validation__notice");
      const rootBounds = node.getBoundingClientRect();
      const noticeBounds = notice.getBoundingClientRect();
      return Math.abs((rootBounds.left + rootBounds.width / 2) - (noticeBounds.left + noticeBounds.width / 2));
    });
    expect(validationAlignment).toBeLessThan(2);

    const selectVaultEntry = async (entry, search, vaultId) => {
      await entry.getByLabel("Choose from My Seed Vault", { exact: true }).check();
      await entry.locator("[data-germination-vault-search]").fill(search);
      await entry.locator(`[data-germination-vault-option="${vaultId}"]`).click();
    };
    await selectVaultEntry(entries.nth(0), "Blue Dream", FIXTURE_VAULT_ID);
    await expect(entries.nth(0).locator("[data-germination-vault-selected]")).toContainText("Acquired 2025");
    await expect(entries.nth(0).locator(".germination-seed-entry__identity")).toHaveCount(1);
    await expect(entries.nth(0).locator(".germination-seed-entry__evidence")).toHaveCount(0);
    await expect(entries.nth(0).locator(".germination-seed-entry__details")).toHaveCount(0);

    await addEntry.click();
    await selectVaultEntry(entries.nth(1), "Northern Lights", FIXTURE_VAULT_SECONDARY_ID);
    await expect(entries.nth(1).locator("[data-germination-vault-selected]")).toContainText("Acquired 2022");
    const sameAge = setup.locator('input[name="germination-preview-tracking"][value="same"]');
    const mixedAge = setup.locator('input[name="germination-preview-tracking"][value="mixed"]');
    await expect(sameAge).toBeDisabled();
    await expect(mixedAge).toBeChecked();
    await expect(setup.locator("[data-germination-tracking-note]")).toContainText("different acquisition years");

    await addEntry.click();
    await setManualEntry(entries.nth(2), "Manual Blend");
    await entries.nth(2).locator('[data-germination-entry-field="ageReferenceKind"]').selectOption("user_statement");
    await entries.nth(2).locator('[data-germination-entry-field="ageSourceValue"]').fill("3.5");
    await expect(entries.nth(2).locator(".germination-seed-entry__identity")).toHaveCount(1);
    await expect(entries.nth(2).locator(".germination-seed-entry__details")).toHaveCount(1);
    await expect(entries.nth(2).locator(".germination-seed-entry__evidence")).toHaveCount(1);
    await expect(setup.locator("[data-germination-kan-list-row]")).toHaveCount(8);
    expect(await entries.locator(".germination-seed-entry__index").allTextContents()).toEqual(["P1", "P2", "P3"]);

    await page.setViewportSize({ width: 1366, height: 900 });
    const desktopGeometry = await setup.locator(".germination-kan-composition").evaluate((node) => {
      const layout = node.querySelector(".germination-kan-layout").getBoundingClientRect();
      const contents = node.querySelector(".germination-kan-contents").getBoundingClientRect();
      return { layoutWidth: layout.width, layoutRight: layout.right, contentsLeft: contents.left };
    });
    expect(desktopGeometry.layoutWidth).toBeLessThanOrEqual(361);
    expect(desktopGeometry.contentsLeft).toBeGreaterThan(desktopGeometry.layoutRight);
    const cardGaps = await entries.evaluateAll((cards) => cards.slice(1).map((card, index) => (
      card.getBoundingClientRect().top - cards[index].getBoundingClientRect().bottom
    )));
    expect(Math.max(...cardGaps)).toBeLessThanOrEqual(9);

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileGeometry = await setup.locator(".germination-kan-composition").evaluate((node) => {
      const layout = node.querySelector(".germination-kan-layout").getBoundingClientRect();
      const contents = node.querySelector(".germination-kan-contents").getBoundingClientRect();
      return {
        layoutBottom: layout.bottom,
        contentsTop: contents.top,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      };
    });
    expect(mobileGeometry.contentsTop).toBeGreaterThan(mobileGeometry.layoutBottom);
    expect(mobileGeometry.documentWidth).toBeLessThanOrEqual(mobileGeometry.viewportWidth + 1);
    const targetSizes = await setup.locator("[data-germination-kan-partition]").evaluateAll((buttons) => buttons.map((button) => {
      const bounds = button.getBoundingClientRect();
      return [bounds.width, bounds.height];
    }));
    for (const [width, height] of targetSizes) {
      expect(width).toBeGreaterThanOrEqual(44);
      expect(height).toBeGreaterThanOrEqual(44);
    }

    await page.setViewportSize({ width: 1366, height: 900 });
    await reviewSetup.click();
    const reviewDialog = setup.locator("[data-germination-review-dialog]");
    await expect(reviewDialog).toBeVisible();
    await expect(reviewDialog.locator("[data-germination-review-dialog-entries]")).toContainText("Acquired 2025 · My Seed Vault");
    await expect(reviewDialog.locator("[data-germination-review-dialog-entries]")).toContainText("Acquired 2022 · My Seed Vault");
    await expect(reviewDialog.locator("[data-germination-review-dialog-entries]")).toContainText("Seed age 3.5 · Session");
    await reviewDialog.getByRole("button", { name: "Save Session", exact: true }).click();
    await expect(page.locator("[data-germination-connection-status]")).toContainText("Saved setup", { timeout: 15000 });
    await expect(page.locator("[data-germination-review-dialog]")).toBeHidden({ timeout: 15000 });

    expect(runLocalSql(`
select concat_ws('|',
  (select quantity from public.seed_vault_entries where id = ${escapeSqlLiteral(FIXTURE_VAULT_ID)}::uuid),
  (select year_acquired from public.seed_vault_entries where id = ${escapeSqlLiteral(FIXTURE_VAULT_ID)}::uuid),
  (select quantity from public.seed_vault_entries where id = ${escapeSqlLiteral(FIXTURE_VAULT_SECONDARY_ID)}::uuid),
  (select year_acquired from public.seed_vault_entries where id = ${escapeSqlLiteral(FIXTURE_VAULT_SECONDARY_ID)}::uuid),
  (select setup_evidence #>> '{entries,0,position}' from public.grow_session_germination_setups where session_id = (select id from public.grow_sessions where user_id = ${escapeSqlLiteral(demoIdentity.ownerId)}::uuid and session_name = ${escapeSqlLiteral(FIXTURE_SESSION_NAME)})),
  (select setup_evidence #>> '{entries,0,seed_age,reference_kind}' from public.grow_session_germination_setups where session_id = (select id from public.grow_sessions where user_id = ${escapeSqlLiteral(demoIdentity.ownerId)}::uuid and session_name = ${escapeSqlLiteral(FIXTURE_SESSION_NAME)})),
  (select setup_evidence #>> '{entries,0,seed_age,source_value}' from public.grow_session_germination_setups where session_id = (select id from public.grow_sessions where user_id = ${escapeSqlLiteral(demoIdentity.ownerId)}::uuid and session_name = ${escapeSqlLiteral(FIXTURE_SESSION_NAME)})),
  (select setup_evidence #>> '{entries,1,position}' from public.grow_session_germination_setups where session_id = (select id from public.grow_sessions where user_id = ${escapeSqlLiteral(demoIdentity.ownerId)}::uuid and session_name = ${escapeSqlLiteral(FIXTURE_SESSION_NAME)})),
  (select setup_evidence #>> '{entries,1,seed_age,reference_kind}' from public.grow_session_germination_setups where session_id = (select id from public.grow_sessions where user_id = ${escapeSqlLiteral(demoIdentity.ownerId)}::uuid and session_name = ${escapeSqlLiteral(FIXTURE_SESSION_NAME)})),
  (select setup_evidence #>> '{entries,1,seed_age,source_value}' from public.grow_session_germination_setups where session_id = (select id from public.grow_sessions where user_id = ${escapeSqlLiteral(demoIdentity.ownerId)}::uuid and session_name = ${escapeSqlLiteral(FIXTURE_SESSION_NAME)})),
  (select setup_evidence #>> '{entries,2,position}' from public.grow_session_germination_setups where session_id = (select id from public.grow_sessions where user_id = ${escapeSqlLiteral(demoIdentity.ownerId)}::uuid and session_name = ${escapeSqlLiteral(FIXTURE_SESSION_NAME)})),
  (select setup_evidence #>> '{entries,2,seed_age,reference_kind}' from public.grow_session_germination_setups where session_id = (select id from public.grow_sessions where user_id = ${escapeSqlLiteral(demoIdentity.ownerId)}::uuid and session_name = ${escapeSqlLiteral(FIXTURE_SESSION_NAME)})),
  (select setup_evidence #>> '{entries,2,seed_age,source_value}' from public.grow_session_germination_setups where session_id = (select id from public.grow_sessions where user_id = ${escapeSqlLiteral(demoIdentity.ownerId)}::uuid and session_name = ${escapeSqlLiteral(FIXTURE_SESSION_NAME)}))
);
`)).toBe("6|2025|2|2022|P1|acquisition_year|2025|P2|acquisition_year|2022|P3|user_statement|3.5");

    const beginGermination = page.getByRole("button", { name: "Begin Germination", exact: true });
    await expect(beginGermination).toBeVisible();
    await beginGermination.click();
    await expect.poll(() => page.evaluate(() => window.location.hash)).toMatch(/^#sessions\/[0-9a-f-]{36}$/i);
    await page.clock.setFixedTime(new Date(Date.now() + (57 * 60 * 60 * 1000)));
    await page.reload();

    const activeGermination = page.locator("[data-active-germination-workspace]");
    const activeCompanion = page.locator(".session-grow-companion-surface");
    const activeOverview = activeCompanion.locator("[data-active-germination-overview]");
    await expect(activeGermination).toBeVisible({ timeout: 15000 });
    await expect(activeGermination.getByRole("heading", { name: "Germination", exact: true })).toBeVisible();
    await expect(activeGermination.locator("[data-active-germination-elapsed]")).toContainText("Germination ·");
    await expect(activeGermination.locator("[data-active-germination-day]")).toHaveText("Day 3");
    await expect(activeOverview).toContainText("KAN");
    await expect(activeOverview).toContainText(FIXTURE_SESSION_NAME);
    const lifecycleRail = activeCompanion.locator("[data-active-germination-orientation] .botanical-phase-timeline");
    await expect(lifecycleRail).toBeVisible();
    await expect(lifecycleRail.locator(".botanical-phase-segment__number")).toHaveText(["1", "2", "3"]);
    await expect(lifecycleRail.locator(".botanical-phase-segment__label")).toHaveText(["Germination", "Growing", "Reflection"]);
    await expect(activeCompanion.locator("[data-active-germination-orientation] .germination-progress-preview")).toHaveCount(0);
    await expect(activeGermination.locator(".active-germination-companion-grid")).toBeVisible();
    await expect(activeGermination.getByRole("heading", { name: "Session Progress (KAN)", exact: true })).toBeVisible();
    await expect(activeOverview).not.toContainText("Unit ID");
    await expect(activeOverview).not.toContainText("Elapsed time");
    await expect(activeOverview).not.toContainText("Germinated");
    await expect(activeGermination).toContainText("Completion readiness");
    await expect(activeGermination.locator(".active-germination-context")).toContainText("3 Seed Entries");
    await expect(activeGermination.locator(".active-germination-context")).toContainText("3 seeds");
    await expect(activeGermination.locator("[data-active-germination-saved-total]")).toHaveText("0");
    const completeSessionButton = activeGermination.getByRole("button", { name: "Complete Session", exact: true });
    await expect(completeSessionButton).toBeDisabled();
    await expect(page.locator(".session-workspace-shell--detail")).toHaveClass(/is-active-germination-companion/);
    await expect(page.locator(".session-workspace-shell--detail > .session-workspace-header")).toBeHidden();
    await expect(page.locator(".session-workspace-shell--detail > .session-orientation")).toBeHidden();

    const activeTimeline = activeGermination.locator(".active-germination-timeline .session-engine-visual-timeline-card");
    await expect(activeTimeline).toBeVisible();
    for (const label of ["Start", "Soak", "Transfer Window", "Germination", "Check Seeds", "Complete"]) {
      await expect(activeTimeline.locator(".session-engine-visual-timeline-step strong", { hasText: label })).toBeVisible();
    }
    const checkSeedsTimelineStep = activeTimeline.locator(".session-engine-visual-timeline-step", { hasText: "Check Seeds" });
    const completeTimelineStep = activeTimeline.locator(".session-engine-visual-timeline-step", { hasText: "Complete" }).last();
    await expect(checkSeedsTimelineStep).toHaveClass(/is-action-required/);
    await expect(checkSeedsTimelineStep).toContainText("Action needed");
    await expect(completeTimelineStep).toHaveClass(/is-upcoming/);
    await expect(completeTimelineStep).not.toContainText("Action needed");
    await expect(page.locator("#detail-session-status-alerts")).toContainText("Urgent inspection reminder");
    await expect(page.locator("#detail-session-status-alerts")).toContainText("Inspect the remaining seeds and record each Seed Entry outcome.");
    await expect(page.locator("#detail-session-status-alerts")).not.toContainText("Complete the session or snooze this reminder.");
    const screenshotDirectory = String(process.env.CANNAKAN_TIMELINE_SCREENSHOT_DIR || "").trim();
    if (screenshotDirectory) {
      await page.locator("#developer-scenarios-launcher").evaluate((launcher) => launcher.remove());
      await activeCompanion.screenshot({
        path: path.join(screenshotDirectory, "compact-active-germination-companion-v2-desktop-1366x900.png"),
      });
    }
    expect(await activeTimeline.locator(".session-engine-visual-timeline-step.is-upcoming").count()).toBeGreaterThan(0);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => activeTimeline.locator(".session-engine-visual-timeline-scroll").evaluate((scroller) => {
      const currentStep = scroller.querySelector(
        ".session-engine-visual-timeline-step.is-action-required, .session-engine-visual-timeline-step.is-current, .session-engine-visual-timeline-step.is-overdue",
      );
      if (!(currentStep instanceof HTMLElement)) return false;
      const scrollerRect = scroller.getBoundingClientRect();
      const currentStepRect = currentStep.getBoundingClientRect();
      return currentStepRect.left >= scrollerRect.left && currentStepRect.right <= scrollerRect.right;
    })).toBe(true);
    expect(await activeTimeline.locator(".session-engine-visual-timeline-scroll").evaluate(
      (scroller) => scroller.scrollWidth > scroller.clientWidth,
    )).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
    if (screenshotDirectory) {
      await activeOverview.scrollIntoViewIfNeeded();
      await page.locator("#developer-scenarios-launcher").evaluate((launcher) => launcher.remove());
      await page.screenshot({
        path: path.join(screenshotDirectory, "compact-active-germination-companion-v2-mobile-390x844.png"),
        fullPage: false,
      });
      await page.reload();
      await expect(activeGermination).toBeVisible({ timeout: 15000 });
      failedApplicationRequests.length = 0;
    }

    const firstCheckInCount = activeGermination.locator('[data-active-germination-count="0"]');
    await activeGermination.getByRole("button", { name: "Increase P1 germinated seed count" }).click();
    await expect(firstCheckInCount).toHaveValue("1");
    await expect(completeSessionButton).toBeDisabled();
    await activeGermination.locator('[data-active-germination-count="1"]').fill("0");
    await activeGermination.locator('[data-active-germination-count="2"]').fill("0");
    await activeGermination.getByRole("button", { name: "Save check-in", exact: true }).click();
    await expect(activeGermination.locator("[data-active-germination-check-in-status]")).toHaveText("Check-in saved with this Session.", { timeout: 15000 });
    await expect(activeGermination).toContainText("Check-in recorded");
    await expect(activeGermination.locator("[data-active-germination-saved-total]")).toHaveText("1");
    await expect(completeSessionButton).toBeEnabled();
    await expect(completeTimelineStep).toHaveClass(/is-action-required/);
    await expect(completeTimelineStep).toContainText("Action needed");
    await expect(completeTimelineStep).not.toHaveClass(/is-final-complete/);
    await expect(checkSeedsTimelineStep).not.toHaveClass(/is-action-required|is-current/);

    await firstCheckInCount.fill("0");
    await expect(completeSessionButton).toBeEnabled();
    await activeGermination.getByRole("button", { name: "Save check-in", exact: true }).click();
    await expect(activeGermination.locator("[data-active-germination-check-in-status]")).toHaveText("Check-in saved with this Session.", { timeout: 15000 });
    await expect(activeGermination.locator("[data-active-germination-saved-total]")).toHaveText("0");
    await expect(completeSessionButton).toBeDisabled();

    await activeGermination.getByRole("button", { name: "Increase P1 germinated seed count" }).click();
    await activeGermination.getByRole("button", { name: "Save check-in", exact: true }).click();
    await expect(completeSessionButton).toBeEnabled();
    await completeSessionButton.click();
    await expect(page.getByRole("dialog", { name: "Complete Session?" })).toBeVisible();
    await page.getByRole("button", { name: "Complete Session", exact: true }).last().click();
    await expect(page.getByRole("heading", { name: "Next step", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Germination Complete", exact: true })).toBeVisible();
    expect(runLocalSql(`
select count(*)
from public.seed_vault_germination_inventory_operations
where owner_user_id = ${escapeSqlLiteral(demoIdentity.ownerId)}::uuid
  and session_id is not null
  and vault_entry_id = ${escapeSqlLiteral(FIXTURE_VAULT_ID)}::uuid;
`)).toBe("1");
    const completedTimeline = page.locator(".active-germination-timeline--completed .session-engine-visual-timeline-card");
    await expect(completedTimeline.locator(".session-engine-visual-timeline-step", { hasText: "Complete" }).last()).toHaveClass(/is-final-complete/);
    await expect(completedTimeline.locator(".session-engine-visual-timeline-step.is-final-complete")).toHaveCount(1);

    expect(runLocalSql(`
select concat_ws('|',
  session_status,
  (germination_started_at is not null)::text,
  coalesce(partitions #>> '{0,plantedCount}', partitions #>> '{0,planted_count}', '')
)
from public.grow_sessions
where user_id = ${escapeSqlLiteral(demoIdentity.ownerId)}::uuid
  and session_name = ${escapeSqlLiteral(FIXTURE_SESSION_NAME)};
`)).toBe("");

    expect(directVaultUpdateRequests).toEqual([]);
    const testedFlowConsoleErrors = consoleErrors.filter((message) => (
      /\[Germination Setup\]/i.test(message) || !message.startsWith("Failed to load resource:")
    ));
    const testedFlowRequestFailures = failedApplicationRequests.filter((request) => (
      /\/auth\/v1\/|germination_setup/i.test(request)
    ));
    expect(testedFlowConsoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(testedFlowRequestFailures).toEqual([]);
  });
});
