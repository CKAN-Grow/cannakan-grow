"use strict";

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("@playwright/test");

const repoRoot = path.resolve(__dirname, "..");
const indexUrl = pathToFileURL(path.join(repoRoot, "index.html")).href;
const stylesPath = path.join(repoRoot, "styles.css");
const appPath = path.join(repoRoot, "app.js");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const requiredCountries = [
  "Austria",
  "Germany",
  "French Polynesia",
  "United Kingdom",
  "United States",
  "Zimbabwe",
];

function readIsoCountryCodes() {
  const match = appSource.match(/const ISO_COUNTRY_CODES = Object\.freeze\(\[([\s\S]*?)\]\);/);
  if (!match) {
    throw new Error("Could not read ISO_COUNTRY_CODES from app.js.");
  }
  return Array.from(match[1].matchAll(/"([A-Z]{2})"/g)).map((entry) => entry[1]);
}

function readCountryNameOverrides() {
  const match = appSource.match(/const COUNTRY_NAME_OVERRIDES = Object\.freeze\(\{([\s\S]*?)\}\);/);
  if (!match) {
    throw new Error("Could not read COUNTRY_NAME_OVERRIDES from app.js.");
  }
  return Object.fromEntries(
    Array.from(match[1].matchAll(/([A-Z]{2}):\s*"([^"]+)"/g))
      .map((entry) => [entry[1], entry[2]]),
  );
}

function getCountryFlagEmoji(countryCode) {
  return [...countryCode]
    .map((letter) => String.fromCodePoint(0x1F1E6 + letter.charCodeAt(0) - 65))
    .join("");
}

const isoCountryCodes = readIsoCountryCodes();
const countryNameOverrides = readCountryNameOverrides();
const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
const countryOptions = isoCountryCodes
  .map((code) => ({
    code,
    name: countryNameOverrides[code] || displayNames.of(code) || code,
  }))
  .sort((left, right) => left.name.localeCompare(right.name));

function renderCountryOptions(filterValue = "") {
  const normalizedFilter = String(filterValue || "").trim().toLowerCase();
  return countryOptions
    .filter((country) => {
      if (!normalizedFilter) {
        return true;
      }
      const label = `${getCountryFlagEmoji(country.code)} ${country.name} ${country.code}`.toLowerCase();
      return country.code.toLowerCase().includes(normalizedFilter)
        || country.name.toLowerCase().includes(normalizedFilter)
        || label.includes(normalizedFilter);
    })
    .map((country) => `
      <button
        type="button"
        class="profile-country-option"
        role="option"
        data-country-option="${country.code}"
        aria-label="${country.name}, ${country.code}"
      >
        <span class="profile-country-option-flag" aria-hidden="true">${getCountryFlagEmoji(country.code)}</span>
        <span class="profile-country-option-name">${country.name}</span>
        <span class="profile-country-option-code">${country.code}</span>
      </button>
    `)
    .join("");
}

async function verifyViewport(viewport, label) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport });
    await page.goto(indexUrl, { waitUntil: "load" });
    await page.addStyleTag({ path: stylesPath });
    await page.addScriptTag({ path: appPath });
    const result = await page.evaluate(({ countries, defaultMarkup, searchMarkup }) => {
      if (
        typeof window.initProfileCountryCombobox !== "function"
        || typeof window.renderCountryComboboxOptions !== "function"
      ) {
        throw new Error("Country combobox functions are not available after loading app.js.");
      }

      const form = document.createElement("form");
      const field = document.createElement("label");
      field.className = "profile-country-field";
      field.style.position = "fixed";
      field.style.left = "16px";
      field.style.top = "16px";
      field.style.width = "min(360px, calc(100vw - 32px))";
      field.innerHTML = '<span>Country (optional)</span><input type="text" name="countrySearch"><input type="hidden" name="countryCode">';
      const dropdown = document.createElement("div");
      dropdown.className = "profile-country-dropdown";
      dropdown.setAttribute("role", "listbox");
      dropdown.setAttribute("data-country-options", "");
      field.appendChild(dropdown);
      form.appendChild(field);
      document.body.appendChild(form);
      window.initProfileCountryCombobox(form, "");
      const searchInput = field.querySelector("[name='countrySearch']");
      const hiddenInput = field.querySelector("[name='countryCode']");
      searchInput.focus();
      searchInput.dispatchEvent(new FocusEvent("focus"));
      dropdown.hidden = false;

      const optionNames = Array.from(dropdown.querySelectorAll("[data-country-option]"))
        .map((option) => option.textContent.replace(/\s+/g, " ").trim());
      const missing = countries.filter((countryName) => (
        !optionNames.some((optionText) => optionText.includes(countryName))
      ));

      dropdown.scrollTop = dropdown.scrollHeight;
      const bottomText = Array.from(dropdown.querySelectorAll("[data-country-option]"))
        .filter((option) => {
          const optionRect = option.getBoundingClientRect();
          const dropdownRect = dropdown.getBoundingClientRect();
          return optionRect.bottom > dropdownRect.top && optionRect.top < dropdownRect.bottom;
        })
        .map((option) => option.textContent.replace(/\s+/g, " ").trim());
      const scrollHeight = dropdown.scrollHeight;
      const clientHeight = dropdown.clientHeight;
      const canScroll = scrollHeight > clientHeight;
      const computedStyle = getComputedStyle(dropdown);
      const computedMaxHeight = computedStyle.maxHeight;
      const computedOverflowY = computedStyle.overflowY;
      const computedDisplay = computedStyle.display;
      const computedVisibility = computedStyle.visibility;
      const dropdownHiddenBeforeSelect = dropdown.hidden;
      const unitedStatesOption = Array.from(dropdown.querySelectorAll("[data-country-option]"))
        .find((option) => option.textContent.includes("United States"));
      unitedStatesOption?.click();

      return {
        optionCount: optionNames.length,
        missing,
        bottomText,
        scrollHeight,
        clientHeight,
        canScroll,
        searchIncludesUnitedStates: searchMarkup.includes("United States"),
        computedMaxHeight,
        computedOverflowY,
        computedDisplay,
        computedVisibility,
        dropdownHidden: dropdownHiddenBeforeSelect,
        fieldDisplay: getComputedStyle(field).display,
        formDisplay: getComputedStyle(form).display,
        bodyDisplay: getComputedStyle(document.body).display,
        selectedCountryCode: hiddenInput?.value || "",
        selectedCountrySearch: searchInput?.value || "",
        hiddenAfterSelect: dropdown.hidden,
      };
    }, {
      countries: requiredCountries,
      defaultMarkup: renderCountryOptions(""),
      searchMarkup: renderCountryOptions("United States"),
    });

    if (result.missing.length) {
      throw new Error(`${label}: missing countries from default list: ${result.missing.join(", ")}`);
    }
    if (!result.canScroll || result.optionCount < 200) {
      throw new Error(`${label}: country dropdown is not exposing the full scrollable list. options=${result.optionCount}, scrollHeight=${result.scrollHeight}, clientHeight=${result.clientHeight}, maxHeight=${result.computedMaxHeight}, overflowY=${result.computedOverflowY}, display=${result.computedDisplay}, visibility=${result.computedVisibility}, hidden=${result.dropdownHidden}, fieldDisplay=${result.fieldDisplay}, formDisplay=${result.formDisplay}, bodyDisplay=${result.bodyDisplay}`);
    }
    if (!result.bottomText.some((entry) => entry.includes("Zimbabwe"))) {
      throw new Error(`${label}: Zimbabwe is not reachable at the bottom of the scrolled country list.`);
    }
    if (!result.searchIncludesUnitedStates) {
      throw new Error(`${label}: search no longer finds United States.`);
    }
    if (result.selectedCountryCode !== "US" || !result.selectedCountrySearch.includes("United States")) {
      throw new Error(`${label}: selecting United States did not update the hidden country code. code=${result.selectedCountryCode}, label=${result.selectedCountrySearch}`);
    }

    console.log(`${label} country selector scroll passed: ${result.optionCount} options, bottom=${result.bottomText.join(" | ")}`);
  } finally {
    await browser.close();
  }
}

(async () => {
  await verifyViewport({ width: 1280, height: 900 }, "desktop");
  await verifyViewport({ width: 390, height: 844 }, "mobile");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
