"use strict";

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const htmlSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");
const schemaSource = fs.readFileSync(path.join(repoRoot, "supabase-schema.sql"), "utf8");
const migrationSource = fs.readFileSync(path.join(repoRoot, "supabase", "migrations", "20260606090000_public_profile_country_code.sql"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing Community Grow country flag support: ${label}`);
  }
}

[
  'name="countrySearch"',
  'name="countryCode"',
  'data-country-options',
  "Country (optional)",
].forEach((needle) => requireNeedle(htmlSource, needle));

[
  "const ISO_COUNTRY_CODES = Object.freeze([",
  "function normalizeCountryCode(value = \"\")",
  "function getCountryFlagEmoji(countryCode = \"\")",
  "function renderCountryFlagMarkup(countryCode = \"\", className = \"country-flag\")",
  "function renderDisplayNameWithCountryFlag(displayName = \"\", countryCode = \"\", className = \"profile-identity-name\")",
  "function inferCountryCodeFromLegacyRegion(value = \"\")",
  "function initProfileCountryCombobox(form, selectedCountryCode = \"\")",
  "country_code: countryCode || null",
  "const countryCode = normalizeCountryCode(row.country_code || row.countryCode || \"\")",
  "const countryCode = publicProfile?.countryCode || privateViewerProfile?.countryCode || \"\"",
  "renderDisplayNameWithCountryFlag(member.displayName, member.countryCode, \"gallery-card-profile-name\")",
  "renderDisplayNameWithCountryFlag(member.displayName, member.countryCode, \"gallery-tile-profile-name\")",
  "renderDisplayNameWithCountryFlag(displayName, countryCode, \"public-member-profile-name\")",
  "renderDisplayNameWithCountryFlag(row.displayName, row.countryCode, \"public-member-profile-connection-name\")",
  "renderDisplayNameWithCountryFlag(activity.displayName, activity.countryCode, \"grow-network-feed-member-name\")",
  "PUBLIC_MEMBER_PROFILE_SAFE_SELECT = \"id,user_id,display_name,avatar_url,bio,public_handle,location_region,country_code",
].forEach((needle) => requireNeedle(appSource, needle));

[
  ".profile-country-dropdown",
  ".profile-country-option",
  ".country-flag",
  ".gallery-card-profile-name .country-flag",
  ".public-member-profile-country",
].forEach((needle) => requireNeedle(stylesSource, needle));

[
  "add column if not exists country_code text",
  "public_member_profiles_country_code_check",
  "country_code is null or country_code ~ '^[A-Z]{2}$'",
  "country_code,",
  "new.country_code = nullif(upper(btrim(coalesce(new.country_code, ''))), '')",
].forEach((needle) => {
  requireNeedle(schemaSource, needle, `schema ${needle}`);
  requireNeedle(migrationSource, needle, `migration ${needle}`);
});

[
  'Region (optional)',
  'name="locationRegion"',
  'Public Handle (optional)',
  'name="publicHandle"',
  "const locationRegionInput = form.elements.locationRegion",
  "const publicHandleInput = form.elements.publicHandle",
  "Public Handle\", value:",
  "Public handle must be",
].forEach((retiredNeedle) => {
  if (htmlSource.includes(retiredNeedle) || appSource.includes(retiredNeedle)) {
    throw new Error(`Retired profile Region UI still present: ${retiredNeedle}`);
  }
});

console.log("Community Grow country flag regression check passed.");
