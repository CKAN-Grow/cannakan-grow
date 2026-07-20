(function initializeProfileHeroCatalog(globalScope, factory) {
  const catalogApi = factory(globalScope);
  if (typeof module !== "undefined" && module.exports) module.exports = catalogApi;
  if (globalScope && typeof globalScope === "object") globalScope.ProfileHeroCatalog = catalogApi;
}(typeof globalThis !== "undefined" ? globalThis : this, function createProfileHeroCatalog(globalScope) {
  "use strict";

  const ROOT_URL = "/assets/images/profile-heroes/";
  const CATALOG_URL = `${ROOT_URL}catalog.json`;
  const PROFILE_TYPES = Object.freeze(["person", "source", "breeder"]);
  const FOLDER_BY_TYPE = Object.freeze({ person: "person", source: "sources", breeder: "breeder" });
  const ALLOWED_IMAGE_EXTENSION = /\.(?:avif|jpe?g|png|webp)$/i;
  const GENERATED_FALLBACK_GLOBAL = "CANNAKAN_PROFILE_HERO_CATALOG_FALLBACK";

  function normalizeProfileType(value = "person") {
    const normalized = String(value || "person").trim().toLowerCase();
    if (["source", "sources"].includes(normalized)) return "source";
    if (normalized === "breeder") return "breeder";
    return "person";
  }

  function freezeCatalog(catalog) {
    PROFILE_TYPES.forEach((type) => {
      catalog[type].forEach(Object.freeze);
      Object.freeze(catalog[type]);
    });
    return Object.freeze(catalog);
  }

  function validateCatalog(rawCatalog) {
    if (!rawCatalog || typeof rawCatalog !== "object" || Array.isArray(rawCatalog)) {
      throw new Error("Profile Hero catalog must be an object.");
    }
    const normalizedCatalog = {};
    PROFILE_TYPES.forEach((type) => {
      const rows = rawCatalog[type];
      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error(`Profile Hero catalog requires a non-empty ${type} group.`);
      }
      const expectedFolder = `${FOLDER_BY_TYPE[type]}/`;
      const ids = new Set();
      const files = new Set();
      normalizedCatalog[type] = rows.map((row) => {
        if (!row || typeof row !== "object" || Array.isArray(row)) {
          throw new Error(`Profile Hero ${type} entries must be objects.`);
        }
        const id = String(row.id || "").trim().toLowerCase();
        const title = String(row.title || "").trim();
        const file = String(row.file || "").trim().replace(/\\/g, "/");
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
          throw new Error(`Profile Hero ${type} entry has an invalid ID.`);
        }
        if (ids.has(id)) throw new Error(`Profile Hero ${type} ID ${id} is duplicated.`);
        if (!title) throw new Error(`Profile Hero ${type} entry ${id} requires a title.`);
        if (!file || file.startsWith("/") || file.includes("..") || /[?#]/.test(file) || /^[a-z]+:/i.test(file)) {
          throw new Error(`Profile Hero ${type} entry ${id} has an unsafe file path.`);
        }
        if (!file.startsWith(expectedFolder)) {
          throw new Error(`Profile Hero ${type} entry ${id} crosses its entity folder boundary.`);
        }
        if (!ALLOWED_IMAGE_EXTENSION.test(file)) {
          throw new Error(`Profile Hero ${type} entry ${id} uses an unsupported image format.`);
        }
        if (files.has(file.toLowerCase())) throw new Error(`Profile Hero ${type} file ${file} is duplicated.`);
        ids.add(id);
        files.add(file.toLowerCase());
        return { id, title, file, default: row.default === true };
      });
      if (normalizedCatalog[type].filter((row) => row.default).length !== 1) {
        throw new Error(`Profile Hero catalog requires exactly one ${type} default.`);
      }
    });
    return freezeCatalog(normalizedCatalog);
  }

  function createCompiledFallbackCatalog() {
    const generatedCatalog = globalScope?.[GENERATED_FALLBACK_GLOBAL];
    if (!generatedCatalog) return null;
    try {
      return validateCatalog(generatedCatalog);
    } catch (error) {
      return null;
    }
  }

  function buildPublicUrl(file = "") {
    return ROOT_URL + String(file || "").split("/").map((segment) => encodeURIComponent(segment)).join("/");
  }

  function normalizeComparablePath(url = "") {
    try {
      const parsed = new URL(String(url || ""), "https://grow.invalid");
      return decodeURIComponent(parsed.pathname).replace(/\\/g, "/");
    } catch (error) {
      return "";
    }
  }

  function getSafeCustomUrl(url = "", options = {}) {
    const value = String(url || "").trim();
    if (!value) return "";
    if (/^https:\/\/[^\s]+$/i.test(value)) return value;
    if (/^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/[^\s]*$/i.test(value)) return value;
    if (/^\/assets\/(?!images\/profile-heroes\/)[^?#]+\.(?:avif|jpe?g|png|webp)(?:[?#].*)?$/i.test(value)) return value;
    if (options.allowPreviewUrl && (/^blob:/i.test(value) || /^data:image\/(?:avif|jpeg|png|webp);base64,/i.test(value))) return value;
    return "";
  }

  const state = {
    status: "idle",
    catalog: createCompiledFallbackCatalog(),
    promise: null,
    error: null,
  };

  function getCatalog() {
    return state.catalog || createCompiledFallbackCatalog();
  }

  function getChoices(type = "person") {
    return getCatalog()?.[normalizeProfileType(type)] || [];
  }

  function getDefault(type = "person") {
    const normalizedType = normalizeProfileType(type);
    return getChoices(normalizedType).find((row) => row.default) || null;
  }

  function findEligibleChoice(type = "person", selectedId = "") {
    const normalizedId = String(selectedId || "").trim().toLowerCase();
    return getChoices(type).find((row) => row.id === normalizedId) || null;
  }

  function findChoiceByUrl(type = "person", url = "") {
    const comparablePath = normalizeComparablePath(url);
    return getChoices(type).find((row) => comparablePath === decodeURIComponent(buildPublicUrl(row.file))) || null;
  }

  function resolve(options = {}) {
    const profileType = normalizeProfileType(options.profileType || options.entityType || "person");
    const fallbackChoice = getDefault(profileType);
    const selectedChoice = findEligibleChoice(profileType, options.selectedHeroId) || fallbackChoice;
    const customUrl = getSafeCustomUrl(options.customCoverUrl, { allowPreviewUrl: options.allowPreviewUrl === true });
    if (!fallbackChoice) {
      throw new Error(`Profile Hero ${profileType} metadata is unavailable.`);
    }
    if (customUrl) {
      return Object.freeze({
        profileType,
        url: customUrl,
        sourceType: "custom",
        selectedHeroId: selectedChoice.id,
        fallbackUrl: buildPublicUrl(fallbackChoice.file),
      });
    }
    return Object.freeze({
      profileType,
      url: buildPublicUrl(selectedChoice.file),
      sourceType: selectedChoice.default ? "default" : "curated",
      selectedHeroId: selectedChoice.id,
      fallbackUrl: buildPublicUrl(fallbackChoice.file),
    });
  }

  function load(options = {}) {
    if (state.status === "loaded" || state.status === "failed") return Promise.resolve(state.catalog);
    if (state.promise) return state.promise;
    const fetchImplementation = options.fetchImpl || globalScope.fetch;
    state.status = "loading";
    state.promise = (async () => {
      try {
        if (typeof fetchImplementation !== "function") throw new Error("Profile Hero catalog fetch is unavailable.");
        const response = await fetchImplementation(CATALOG_URL, { cache: "no-cache" });
        if (!response || response.ok !== true) throw new Error(`Profile Hero catalog request failed (${response?.status || "unknown"}).`);
        state.catalog = validateCatalog(await response.json());
        state.status = "loaded";
        state.error = null;
      } catch (error) {
        const compiledFallbackCatalog = createCompiledFallbackCatalog();
        state.catalog = compiledFallbackCatalog;
        state.status = "failed";
        state.error = error;
        if (options.silent !== true && globalScope.console?.warn) {
          globalScope.console.warn("[Profile Hero] Catalog unavailable; using the generated metadata fallback.", error);
        }
        if (!compiledFallbackCatalog) throw error;
      }
      return state.catalog;
    })();
    return state.promise;
  }

  return Object.freeze({
    ROOT_URL,
    CATALOG_URL,
    PROFILE_TYPES,
    FOLDER_BY_TYPE,
    GENERATED_FALLBACK_GLOBAL,
    normalizeProfileType,
    validateCatalog,
    createCompiledFallbackCatalog,
    buildPublicUrl,
    getSafeCustomUrl,
    getCatalog,
    getChoices,
    getDefault,
    findEligibleChoice,
    findChoiceByUrl,
    resolve,
    load,
    getStatus: () => state.status,
    getError: () => state.error,
  });
}));
