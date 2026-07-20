const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const catalogApi = require(path.join(repoRoot, "profile-hero-catalog.js"));
const catalogPath = path.join(repoRoot, "public", "assets", "images", "profile-heroes", "catalog.json");
const catalogRuntimePath = path.join(repoRoot, "profile-hero-catalog-data.js");
delete require.cache[require.resolve(catalogRuntimePath)];
require(catalogRuntimePath);
const catalogJson = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const validated = catalogApi.validateCatalog(catalogJson);
const expectedRuntimeFallback = Object.fromEntries(catalogApi.PROFILE_TYPES.map((profileType) => [
  profileType,
  [validated[profileType].find((entry) => entry.default === true)],
]));
assert.deepEqual(globalThis.CANNAKAN_PROFILE_HERO_CATALOG_FALLBACK, expectedRuntimeFallback, "Generated runtime defaults must exactly match validated catalog metadata");

assert.deepEqual(Object.keys(validated), ["person", "source", "breeder"]);
for (const entityType of catalogApi.PROFILE_TYPES) {
  const rows = validated[entityType];
  assert.ok(rows.length > 0, `${entityType} catalog must not be empty`);
  assert.equal(rows.filter((row) => row.default).length, 1, `${entityType} must have exactly one default`);
  assert.equal(new Set(rows.map((row) => row.id)).size, rows.length, `${entityType} IDs must be unique`);
  for (const row of rows) {
    const assetPath = path.join(repoRoot, "public", "assets", "images", "profile-heroes", ...row.file.split("/"));
    assert.ok(fs.existsSync(assetPath), `Catalog asset is missing: ${row.file}`);
    assert.ok(fs.statSync(assetPath).size > 0, `Catalog asset is empty: ${row.file}`);
  }
}

const catalogFiles = new Set(Object.values(validated).flat().map((row) => row.file.replace(/\\/g, "/")));
const diskFiles = [];
for (const folder of ["person", "sources", "breeder"]) {
  const folderPath = path.join(repoRoot, "public", "assets", "images", "profile-heroes", folder);
  for (const fileName of fs.readdirSync(folderPath)) {
    if (/\.(?:avif|jpe?g|png|webp)$/i.test(fileName)) diskFiles.push(`${folder}/${fileName}`);
  }
}
assert.deepEqual(new Set(diskFiles), catalogFiles, "Every supported catalog asset must be listed exactly once");
assert.equal(fs.existsSync(path.join(repoRoot, "public", "assets", "images", "profile-heros")), false, "Misspelled legacy Profile Hero root must not return");

void (async () => {
let fetchCount = 0;
const fetchImpl = async () => {
  fetchCount += 1;
  return { ok: true, json: async () => catalogJson };
};
await catalogApi.load({ fetchImpl });
await catalogApi.load({ fetchImpl });
assert.equal(fetchCount, 1, "Catalog metadata must load once and remain cached");

const personDefault = catalogApi.getDefault("person");
const sourceDefault = catalogApi.getDefault("source");
const breederDefault = catalogApi.getDefault("breeder");
assert.equal(personDefault.id, validated.person.find((row) => row.default).id);
assert.equal(sourceDefault.id, validated.source.find((row) => row.default).id);
assert.equal(breederDefault.id, validated.breeder.find((row) => row.default).id);

const curated = catalogApi.resolve({ entityType: "person", selectedHeroId: "starry-garden-retreat" });
const curatedMetadata = validated.person.find((row) => row.id === "starry-garden-retreat");
assert.equal(curated.sourceType, "curated");
assert.equal(curated.url, catalogApi.buildPublicUrl(curatedMetadata.file));
assert.equal(catalogApi.resolve({ entityType: "person", selectedHeroId: sourceDefault.id }).selectedHeroId, personDefault.id);
assert.equal(catalogApi.resolve({ entityType: "source", selectedHeroId: breederDefault.id }).selectedHeroId, sourceDefault.id);
assert.equal(catalogApi.resolve({ entityType: "breeder", selectedHeroId: "missing" }).selectedHeroId, breederDefault.id);

const custom = catalogApi.resolve({
  entityType: "person",
  selectedHeroId: "starry-garden-retreat",
  customCoverUrl: "https://cdn.example.test/profile-cover.webp",
});
assert.equal(custom.sourceType, "custom");
assert.equal(custom.url, "https://cdn.example.test/profile-cover.webp");
assert.equal(catalogApi.getSafeCustomUrl("javascript:alert(1)"), "");
assert.equal(catalogApi.getSafeCustomUrl("/assets/images/profile-heroes/sources/secret.png"), "");

assert.throws(() => catalogApi.validateCatalog({ ...catalogJson, person: [] }), /non-empty person group/);
assert.throws(() => catalogApi.validateCatalog({
  ...catalogJson,
  source: catalogJson.source.map((row) => ({ ...row, default: false })),
}), /exactly one source default/);
assert.throws(() => catalogApi.validateCatalog({
  ...catalogJson,
  breeder: [{ id: "unsafe", title: "Unsafe", file: "../person/escape.png", default: true }],
}), /unsafe file path/);

const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const serviceWorkerSource = fs.readFileSync(path.join(repoRoot, "service-worker.js"), "utf8");
const migrationSource = fs.readFileSync(path.join(repoRoot, "supabase", "migrations", "20260719140000_profile_hero_catalog_safe_projection.sql"), "utf8");

const buildSource = fs.readFileSync(path.join(repoRoot, "scripts", "build-config.mjs"), "utf8");
for (const needle of [
  "renderProfileHeroPickerMarkup",
  "resolveProfileHeroImage",
  "uploadProfileHeroCover",
  "data-profile-hero-image",
  "coverImageUrl: heroCoverUrl",
]) assert.ok(appSource.includes(needle), `Missing Profile Hero integration: ${needle}`);
assert.ok(indexSource.indexOf("profile-hero-catalog-data.js") < indexSource.indexOf("profile-hero-catalog.js"), "Generated metadata fallback must load before the catalog module");
assert.ok(indexSource.indexOf("profile-hero-catalog.js") < indexSource.indexOf("app.js?v="), "Catalog module must load before app.js");
assert.ok(buildSource.includes("buildProfileHeroCatalogRuntimeContents"), "Build must generate the runtime fallback from catalog.json");
assert.equal(appSource.includes("PROFILE_HERO_COMPILED_DEFAULT_URLS"), false, "App code must not duplicate metadata default filenames");
assert.ok(serviceWorkerSource.includes("/profile-hero-catalog-data.js"));
assert.ok(serviceWorkerSource.includes("/assets/images/profile-heroes/catalog.json"));
assert.match(migrationSource, /cover_image[^\n]+public[^\n]+cover_image_url/);
assert.equal(/cover_image_path/i.test(migrationSource), false, "Private storage paths must not enter the public projection");

delete require.cache[require.resolve(path.join(repoRoot, "profile-hero-catalog.js"))];
const failedCatalogApi = require(path.join(repoRoot, "profile-hero-catalog.js"));
let failedFetchCount = 0;
const failingFetch = async () => {
  failedFetchCount += 1;
  throw new Error("simulated catalog outage");
};
await failedCatalogApi.load({ fetchImpl: failingFetch, silent: true });
await failedCatalogApi.load({ fetchImpl: failingFetch, silent: true });
assert.equal(failedFetchCount, 1, "A failed catalog request must be negatively cached");
assert.equal(failedCatalogApi.getStatus(), "failed");
assert.equal(failedCatalogApi.resolve({ entityType: "source" }).selectedHeroId, sourceDefault.id);

console.log(`Profile Hero catalog regression passed: ${validated.person.length} Person, ${validated.source.length} Source, ${validated.breeder.length} Breeder backgrounds.`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
