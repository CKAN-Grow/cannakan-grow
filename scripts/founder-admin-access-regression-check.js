const assert = require("assert/strict");
const {
  getAdminAccessLevel,
  isFounderAdminUser,
} = require("../src/services/admin-access");
const {
  validateCstpAdminAuthorization,
} = require("../src/services/cstp/internal");

const CONFIG = Object.freeze({
  supabaseUrl: "https://example.supabase.co",
  supabaseServiceRoleKey: "service-role-key",
});

async function main() {
  assert.equal(isFounderAdminUser({ email: "don@cannakan.com" }), true);
  assert.equal(isFounderAdminUser({ email: "DON@CANNAKAN.COM" }), true);
  assert.equal(isFounderAdminUser({ email: "user@example.com" }), false);
  assert.deepEqual(
    getAdminAccessLevel({ email: "don@cannakan.com" }),
    {
      isAdmin: true,
      level: "founder",
      reason: "verified_founder_email",
      email: "don@cannakan.com",
    },
  );

  let adminUsersWasQueried = false;
  const founderAuthorization = await validateCstpAdminAuthorization({
    accessToken: "founder-token",
    config: CONFIG,
    fetchImpl: async (url) => {
      const textUrl = String(url);
      if (textUrl.includes("/auth/v1/user")) {
        return createFetchResponse(200, {
          id: "11111111-1111-4111-8111-111111111111",
          email: "don@cannakan.com",
        });
      }
      if (textUrl.includes("/rest/v1/admin_users")) {
        adminUsersWasQueried = true;
        return createFetchResponse(404, { message: "admin_users does not exist" });
      }
      throw new Error(`Unexpected fetch: ${textUrl}`);
    },
  });

  assert.equal(founderAuthorization.ok, true);
  assert.equal(founderAuthorization.actor.email, "don@cannakan.com");
  assert.equal(founderAuthorization.actor.authorizationSource, "verified_founder_email");
  assert.equal(adminUsersWasQueried, false);

  const normalUserAuthorization = await validateCstpAdminAuthorization({
    accessToken: "user-token",
    config: CONFIG,
    fetchImpl: async (url) => {
      const textUrl = String(url);
      if (textUrl.includes("/auth/v1/user")) {
        return createFetchResponse(200, {
          id: "22222222-2222-4222-8222-222222222222",
          email: "user@example.com",
        });
      }
      if (textUrl.includes("/rest/v1/admin_users")) {
        return createFetchResponse(200, []);
      }
      throw new Error(`Unexpected fetch: ${textUrl}`);
    },
  });

  assert.equal(normalUserAuthorization.ok, false);
  assert.equal(normalUserAuthorization.httpStatus, 403);

  const localDemoAuthorization = await validateCstpAdminAuthorization({
    accessToken: "local-dev-qa-bypass",
    env: {
      VITE_ENABLE_LOCAL_DEMO_AUTH: "true",
      LOCAL_DEVELOPMENT: "true",
    },
  });
  assert.equal(localDemoAuthorization.ok, true);
  assert.equal(localDemoAuthorization.actor.authorizationSource, "local_demo_auth_enabled");

  const productionLocalDemoAuthorization = await validateCstpAdminAuthorization({
    accessToken: "local-dev-qa-bypass",
    env: {
      VITE_ENABLE_LOCAL_DEMO_AUTH: "true",
      VERCEL: "1",
      NODE_ENV: "production",
    },
  });
  assert.equal(productionLocalDemoAuthorization.ok, false);
  assert.equal(productionLocalDemoAuthorization.httpStatus, 501);

  console.log("Founder/admin access regression checks passed.");
}

function createFetchResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return payload;
    },
    async text() {
      return payload === undefined ? "" : JSON.stringify(payload);
    },
  };
}

main().catch((error) => {
  console.error("Founder/admin access regression checks failed.");
  console.error(error);
  process.exitCode = 1;
});
