"use strict";

const {
  getCstpSupabaseRuntimeConfig,
  supabaseRest,
} = require("./execution");
const { CstpAuthorizationError } = require("./errors");
const {
  canUseLocalDemoAdminAccess,
  getAdminAccessLevel,
  getConfiguredAdminEmailAllowlist,
  isFounderAdminUser,
} = require("../../admin-access");

const ADMIN_USERS_TABLE = "admin_users";
const LOCAL_DEMO_ADMIN_ACCESS_TOKEN = "local-dev-qa-bypass";
const LOCAL_DEMO_ADMIN_USER_ID = "00000000-0000-4000-8000-000000000001";
const LOCAL_DEMO_ADMIN_EMAIL = "dev-qa@localhost";

/*
 * Internal CSTP admin authorization boundary.
 *
 * CSTP mutation routes must call this layer before any execution helper. The
 * actor returned from this module is the audit identity used by admin events;
 * ambiguous, anonymous, or missing identities must fail closed to protect
 * future reporting and certification integrity.
 *
 * This module does not expose CSTP data, does not mutate records, and does not
 * make CSTP public. It only verifies whether a bearer-authenticated Supabase
 * user is allowed to perform internal CSTP admin actions.
 */

function getAuthorizationHeader(request) {
  const headers = request?.headers || {};
  return String(headers.authorization || headers.Authorization || "").trim();
}

function extractBearerToken(source) {
  const authorizationHeader =
    typeof source === "string" ? source.trim() : getAuthorizationHeader(source);

  if (!authorizationHeader.startsWith("Bearer ")) {
    return "";
  }

  return authorizationHeader.slice("Bearer ".length).trim();
}

async function authorizeCstpAdminRequest(request, options = {}) {
  return validateCstpAdminAuthorization({
    accessToken: extractBearerToken(request),
    ...options,
  });
}

async function validateCstpAdminAuthorization(input = {}) {
  const accessToken = String(input.accessToken || "").trim();

  if (!accessToken) {
    return buildCstpAuthorizationFailure({
      status: "cstp_admin_auth_missing",
      httpStatus: 401,
      message: "Missing bearer token.",
      code: "CSTP_ADMIN_AUTH_MISSING",
    });
  }

  if (
    accessToken === LOCAL_DEMO_ADMIN_ACCESS_TOKEN
    && canUseLocalDemoAdminAccess(input)
  ) {
    return buildCstpAuthorizationSuccess(
      normalizeCstpAdminActor({
        userId: LOCAL_DEMO_ADMIN_USER_ID,
        email: LOCAL_DEMO_ADMIN_EMAIL,
        authorizationSource: "local_demo_auth_enabled",
        adminAccessLevel: "local-demo",
      }),
    );
  }

  const config = resolveAuthorizationConfig(input);
  if (!config.ok) {
    return buildCstpAuthorizationFailure({
      status: "cstp_admin_authorization_deferred",
      httpStatus: 501,
      message: "CSTP admin authorization is not configured.",
      code: "CSTP_ADMIN_AUTH_NOT_CONFIGURED",
      details: config.error.details,
    });
  }

  const fetchImpl = resolveFetchImplementation(input);

  let user;
  try {
    user = await verifySupabaseUserFromBearerToken(accessToken, config.value, {
      fetchImpl,
    });
  } catch (error) {
    return buildCstpAuthorizationFailure({
      status: "cstp_admin_auth_invalid",
      httpStatus: 401,
      message: "Invalid or expired bearer token.",
      code: "CSTP_ADMIN_AUTH_INVALID",
      details: normalizeAuthorizationError(error),
    });
  }

  const normalizedUser = normalizeSupabaseAuthUser(user);
  if (!normalizedUser.userId) {
    return buildCstpAuthorizationFailure({
      status: "cstp_admin_actor_unresolved",
      httpStatus: 401,
      message: "Authenticated user identity could not be resolved.",
      code: "CSTP_ADMIN_ACTOR_UNRESOLVED",
    });
  }

  const adminAccess = getAdminAccessLevel(normalizedUser, input);
  if (adminAccess.isAdmin) {
    return buildCstpAuthorizationSuccess(
      normalizeCstpAdminActor({
        ...normalizedUser,
        authorizationSource: adminAccess.reason,
        adminAccessLevel: adminAccess.level,
      }),
    );
  }

  let adminMembership = null;
  try {
    adminMembership = await checkCstpAdminMembership(normalizedUser.userId, {
      config: config.value,
      fetchImpl,
    });
  } catch (error) {
    return buildCstpAuthorizationFailure({
      status: "cstp_admin_membership_check_failed",
      httpStatus: 500,
      message: "CSTP admin membership could not be verified.",
      code: "CSTP_ADMIN_MEMBERSHIP_CHECK_FAILED",
      details: normalizeAuthorizationError(error),
    });
  }

  if (adminMembership.authorized) {
    return buildCstpAuthorizationSuccess(
      normalizeCstpAdminActor({
        ...normalizedUser,
        authorizationSource: "admin_users",
        adminMembershipId: adminMembership.record?.id || "",
      }),
    );
  }

  return buildCstpAuthorizationFailure({
    status: "cstp_admin_forbidden",
    httpStatus: 403,
    message: "Authenticated user is not authorized for CSTP admin actions.",
    code: "CSTP_ADMIN_FORBIDDEN",
  });
}

async function verifySupabaseUserFromBearerToken(
  accessToken,
  config,
  options = {},
) {
  const fetchImpl = resolveFetchImplementation(options);

  if (typeof fetchImpl !== "function") {
    throw new CstpAuthorizationError("A fetch implementation is required.", {
      code: "CSTP_ADMIN_AUTH_FETCH_UNAVAILABLE",
    });
  }

  const response = await fetchImpl(`${config.supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new CstpAuthorizationError(
      `Supabase auth verification failed with ${response.status}.`,
      {
        code: "CSTP_ADMIN_AUTH_USER_LOOKUP_FAILED",
        status: response.status,
      },
    );
  }

  return response.json();
}

async function checkCstpAdminMembership(userId, options = {}) {
  const normalizedUserId = String(userId || "").trim();
  if (!normalizedUserId) {
    throw new CstpAuthorizationError("A user id is required.", {
      code: "CSTP_ADMIN_MEMBERSHIP_USER_ID_REQUIRED",
    });
  }

  const config = options.config
    ? { ok: true, value: options.config }
    : resolveAuthorizationConfig(options);

  if (!config.ok) {
    throw config.error;
  }

  const rows = await supabaseRest(
    `${ADMIN_USERS_TABLE}?user_id=eq.${encodeURIComponent(normalizedUserId)}&select=id,user_id,email&limit=1`,
    config.value,
    {
      method: "GET",
      fetchImpl: resolveFetchImplementation(options),
    },
  );

  const record = Array.isArray(rows) && rows.length ? rows[0] : null;
  return deepFreeze({
    authorized: Boolean(record),
    record,
  });
}

function normalizeSupabaseAuthUser(user = {}) {
  const source = user?.user && typeof user.user === "object" ? user.user : user;
  return deepFreeze({
    userId: String(source?.id || "").trim(),
    email: normalizeEmail(source?.email),
  });
}

function normalizeCstpAdminActor(actor = {}) {
  const userId = String(actor.userId || "").trim();
  if (!userId) {
    throw new CstpAuthorizationError("CSTP admin actor requires a user id.", {
      code: "CSTP_ADMIN_ACTOR_USER_ID_REQUIRED",
    });
  }

  return deepFreeze({
    userId,
    email: normalizeEmail(actor.email),
    authorizationSource: String(actor.authorizationSource || "").trim(),
    adminAccessLevel: String(actor.adminAccessLevel || "").trim(),
    adminMembershipId: String(actor.adminMembershipId || "").trim(),
    internalOnly: true,
  });
}

function buildCstpAuthorizationSuccess(actor) {
  return deepFreeze({
    ok: true,
    status: "cstp_admin_authorized",
    httpStatus: 200,
    actor,
    error: null,
    internalOnly: true,
  });
}

function buildCstpAuthorizationFailure({
  status,
  httpStatus,
  message,
  code,
  details = {},
}) {
  return deepFreeze({
    ok: false,
    status,
    httpStatus,
    actor: null,
    error: {
      name: "CstpAuthorizationError",
      code,
      message,
      details,
    },
    internalOnly: true,
  });
}

function isCstpAuthorizationSuccess(result = {}) {
  return Boolean(result?.ok && result?.actor?.userId);
}

function resolveAuthorizationConfig(options = {}) {
  const config = options.config || getCstpSupabaseRuntimeConfig(options.env);

  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    return {
      ok: false,
      error: new CstpAuthorizationError(
        "CSTP admin authorization is not configured.",
        {
          code: "CSTP_ADMIN_AUTH_NOT_CONFIGURED",
          supabaseUrlAvailable: Boolean(config.supabaseUrl),
          supabaseServiceRoleKeyAvailable: Boolean(
            config.supabaseServiceRoleKey,
          ),
        },
      ),
    };
  }

  return {
    ok: true,
    value: config,
  };
}

function resolveFetchImplementation(options = {}) {
  return options.fetchImpl || globalThis.fetch;
}

function getTrustedAdminEmailAllowlist(options = {}) {
  return getConfiguredAdminEmailAllowlist(options);
}

function isTrustedAdminEmail(email, options = {}) {
  return isFounderAdminUser({ email }, options);
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeAuthorizationError(error) {
  return {
    name: error?.name || "Error",
    code: error?.code || "CSTP_AUTHORIZATION_UNKNOWN_ERROR",
    message: error?.message || String(error),
    details: error?.details || {},
  };
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

module.exports = {
  authorizeCstpAdminRequest,
  buildCstpAuthorizationFailure,
  buildCstpAuthorizationSuccess,
  checkCstpAdminMembership,
  extractBearerToken,
  getAuthorizationHeader,
  getTrustedAdminEmailAllowlist,
  isCstpAuthorizationSuccess,
  isTrustedAdminEmail,
  normalizeCstpAdminActor,
  normalizeSupabaseAuthUser,
  validateCstpAdminAuthorization,
  verifySupabaseUserFromBearerToken,
};
