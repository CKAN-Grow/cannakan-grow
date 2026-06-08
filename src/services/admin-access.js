"use strict";

const FOUNDER_ADMIN_EMAILS = Object.freeze([
  "don@cannakan.com",
  "growsupport@cannakan.com",
]);
const TRUSTED_ADMIN_EMAIL_ALLOWLIST_ENV_KEYS = Object.freeze([
  "CSTP_ADMIN_EMAIL_ALLOWLIST",
  "CANNAKAN_ADMIN_EMAIL_ALLOWLIST",
]);

function normalizeAdminEmail(email = "") {
  return String(email || "").trim().toLowerCase();
}

function getFounderAdminEmails() {
  return FOUNDER_ADMIN_EMAILS.slice();
}

function getConfiguredAdminEmailAllowlist(options = {}) {
  const env = options.env || process.env;
  const explicitAllowlist = options.trustedAdminEmailAllowlist;
  const rawAllowlist =
    explicitAllowlist !== undefined
      ? Array.isArray(explicitAllowlist)
        ? explicitAllowlist.join(",")
        : String(explicitAllowlist || "")
      : TRUSTED_ADMIN_EMAIL_ALLOWLIST_ENV_KEYS.map((key) => env?.[key] || "")
          .filter(Boolean)
          .join(",");

  return rawAllowlist
    .split(",")
    .map(normalizeAdminEmail)
    .filter(Boolean);
}

function isLocalDemoAdminEnabled(options = {}) {
  const env = options.env || process.env;
  return String(env?.VITE_ENABLE_LOCAL_DEMO_AUTH || env?.ENABLE_LOCAL_DEMO_AUTH || "")
    .trim()
    .toLowerCase() === "true";
}

function canUseLocalDemoAdminAccess(options = {}) {
  const env = options.env || process.env;
  const explicitlyLocal = options.localDevelopment === true
    || String(env?.LOCAL_DEVELOPMENT || "").trim().toLowerCase() === "true";
  const vercelProduction = String(env?.VERCEL || "").trim() === "1";
  const nodeProduction = String(env?.NODE_ENV || "").trim().toLowerCase() === "production";
  return isLocalDemoAdminEnabled(options)
    && (explicitlyLocal || (!vercelProduction && !nodeProduction));
}

function getAdminAccessLevel(user = {}, options = {}) {
  const email = normalizeAdminEmail(
    typeof user === "string" ? user : user?.email,
  );

  if (!email) {
    return {
      isAdmin: false,
      level: "none",
      reason: "missing_email",
      email,
    };
  }

  if (FOUNDER_ADMIN_EMAILS.includes(email)) {
    return {
      isAdmin: true,
      level: "founder",
      reason: "verified_founder_email",
      email,
    };
  }

  if (getConfiguredAdminEmailAllowlist(options).includes(email)) {
    return {
      isAdmin: true,
      level: "admin",
      reason: "configured_admin_email_allowlist",
      email,
    };
  }

  if (options.allowLocalDemoAdmin === true && isLocalDemoAdminEnabled(options)) {
    return {
      isAdmin: true,
      level: "local-demo",
      reason: "local_demo_auth_enabled",
      email,
    };
  }

  return {
    isAdmin: false,
    level: "none",
    reason: "email_not_authorized",
    email,
  };
}

function isFounderAdminUser(user = {}, options = {}) {
  return getAdminAccessLevel(user, options).isAdmin;
}

module.exports = {
  FOUNDER_ADMIN_EMAILS,
  canUseLocalDemoAdminAccess,
  getAdminAccessLevel,
  getConfiguredAdminEmailAllowlist,
  getFounderAdminEmails,
  isFounderAdminUser,
  isLocalDemoAdminEnabled,
  normalizeAdminEmail,
};
