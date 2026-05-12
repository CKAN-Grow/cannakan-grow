"use strict";

const assert = require("assert/strict");

const requestCreateRoute = require("../api/cstp-admin-request-create");
const requestStatusUpdateRoute = require("../api/cstp-admin-request-status-update");
const requestDetailRoute = require("../api/cstp-admin-request-detail");
const requestsListRoute = require("../api/cstp-admin-requests-list");
const testCreateRoute = require("../api/cstp-admin-test-create");
const testStatusUpdateRoute = require("../api/cstp-admin-test-status-update");
const testDetailRoute = require("../api/cstp-admin-test-detail");
const testsListRoute = require("../api/cstp-admin-tests-list");
const sessionLinkCreateRoute = require("../api/cstp-admin-session-link-create");
const sessionLinkArchiveRoute = require("../api/cstp-admin-session-link-archive");
const sessionLinksListRoute = require("../api/cstp-admin-session-links-list");
const { validateCstpAdminAuthorization } = require("../src/services/cstp/internal");

const ADMIN_USER_ID = "11111111-1111-4111-8111-111111111111";
const NON_ADMIN_USER_ID = "22222222-2222-4222-8222-222222222222";
const SOURCE_ID = "33333333-3333-4333-8333-333333333333";
const SESSION_ID = "66666666-6666-4666-8666-666666666666";
const ADMIN_TOKEN = "valid-admin-token";
const USER_TOKEN = "valid-user-token";

const CONFIG = Object.freeze({
  supabaseUrl: "http://cstp-smoke.local",
  supabaseServiceRoleKey: "service-role-key",
});

async function run() {
  const db = createSmokeDatabase();
  const fetchImpl = createMockSupabaseFetch(db);
  const options = {
    authorizationOptions: { config: CONFIG, fetchImpl },
    executionOptions: { config: CONFIG, fetchImpl },
    readOptions: { config: CONFIG, fetchImpl },
  };

  await testAdminAuthorization(fetchImpl);

  const missingAuthResponse = await invokeRoute(
    requestCreateRoute,
    {
      method: "POST",
      body: buildRequestCreationPayload(),
    },
    options,
  );
  assert.equal(missingAuthResponse.statusCode, 401);
  assert.equal(missingAuthResponse.body.ok, false);

  const forbiddenResponse = await invokeRoute(
    requestCreateRoute,
    {
      method: "POST",
      headers: bearerHeaders(USER_TOKEN),
      body: buildRequestCreationPayload(),
    },
    options,
  );
  assert.equal(forbiddenResponse.statusCode, 403);
  assert.equal(forbiddenResponse.body.ok, false);

  const createRequestResponse = await invokeRoute(
    requestCreateRoute,
    {
      method: "POST",
      headers: bearerHeaders(ADMIN_TOKEN),
      body: buildRequestCreationPayload(),
    },
    options,
  );
  assert.equal(createRequestResponse.statusCode, 200);
  assert.equal(createRequestResponse.body.ok, true);
  assert.equal(createRequestResponse.body.transaction.primaryMutationCommitted, true);
  assert.ok(["deferred", "inserted"].includes(createRequestResponse.body.adminEvent.status));

  const requestId = createRequestResponse.body.request.record.id;
  assert.ok(requestId);
  assert.equal(db.cstp_requests.length, 1);

  const listRequestsResponse = await invokeRoute(
    requestsListRoute,
    {
      method: "GET",
      headers: bearerHeaders(ADMIN_TOKEN),
      query: { status: "received" },
    },
    options,
  );
  assert.equal(listRequestsResponse.statusCode, 200);
  assert.equal(listRequestsResponse.body.ok, true);
  assert.equal(listRequestsResponse.body.requests.length, 1);

  const requestDetailResponse = await invokeRoute(
    requestDetailRoute,
    {
      method: "GET",
      headers: bearerHeaders(ADMIN_TOKEN),
      query: { requestId },
    },
    options,
  );
  assert.equal(requestDetailResponse.statusCode, 200);
  assert.equal(requestDetailResponse.body.request.id, requestId);

  const updateRequestResponse = await invokeRoute(
    requestStatusUpdateRoute,
    {
      method: "POST",
      headers: bearerHeaders(ADMIN_TOKEN),
      body: {
        requestId,
        currentStatus: "received",
        nextStatus: "accepted",
      },
    },
    options,
  );
  assert.equal(updateRequestResponse.statusCode, 200);
  assert.equal(updateRequestResponse.body.ok, true);
  assert.equal(updateRequestResponse.body.request.record.status, "accepted");

  const invalidRequestTransitionResponse = await invokeRoute(
    requestStatusUpdateRoute,
    {
      method: "POST",
      headers: bearerHeaders(ADMIN_TOKEN),
      body: {
        requestId,
        currentStatus: "declined",
        nextStatus: "accepted",
      },
    },
    options,
  );
  assert.equal(invalidRequestTransitionResponse.statusCode, 400);
  assert.equal(invalidRequestTransitionResponse.body.ok, false);

  const createTestResponse = await invokeRoute(
    testCreateRoute,
    {
      method: "POST",
      headers: bearerHeaders(ADMIN_TOKEN),
      body: {
        sourceId: SOURCE_ID,
        requestId,
        status: "pending",
        internalState: "smoke test",
      },
    },
    options,
  );
  assert.equal(createTestResponse.statusCode, 200);
  assert.equal(createTestResponse.body.ok, true);

  const testId = createTestResponse.body.test.record.id;
  assert.ok(testId);
  assert.equal(db.cstp_tests.length, 1);

  const listTestsResponse = await invokeRoute(
    testsListRoute,
    {
      method: "GET",
      headers: bearerHeaders(ADMIN_TOKEN),
      query: { requestId, status: "pending" },
    },
    options,
  );
  assert.equal(listTestsResponse.statusCode, 200);
  assert.equal(listTestsResponse.body.tests.length, 1);

  const testDetailResponse = await invokeRoute(
    testDetailRoute,
    {
      method: "GET",
      headers: bearerHeaders(ADMIN_TOKEN),
      query: { testId },
    },
    options,
  );
  assert.equal(testDetailResponse.statusCode, 200);
  assert.equal(testDetailResponse.body.test.id, testId);

  const updateTestResponse = await invokeRoute(
    testStatusUpdateRoute,
    {
      method: "POST",
      headers: bearerHeaders(ADMIN_TOKEN),
      body: {
        testId,
        currentStatus: "pending",
        nextStatus: "active",
      },
    },
    options,
  );
  assert.equal(updateTestResponse.statusCode, 200);
  assert.equal(updateTestResponse.body.ok, true);
  assert.equal(updateTestResponse.body.test.record.status, "active");

  const invalidTestTransitionResponse = await invokeRoute(
    testStatusUpdateRoute,
    {
      method: "POST",
      headers: bearerHeaders(ADMIN_TOKEN),
      body: {
        testId,
        currentStatus: "completed",
        nextStatus: "active",
      },
    },
    options,
  );
  assert.equal(invalidTestTransitionResponse.statusCode, 400);
  assert.equal(invalidTestTransitionResponse.body.ok, false);

  const createLinkResponse = await invokeRoute(
    sessionLinkCreateRoute,
    {
      method: "POST",
      headers: bearerHeaders(ADMIN_TOKEN),
      body: {
        cstpTestId: testId,
        sessionId: SESSION_ID,
        kanLabel: "KAN-A",
      },
    },
    options,
  );
  assert.equal(createLinkResponse.statusCode, 200);
  assert.equal(createLinkResponse.body.ok, true);
  assert.equal(createLinkResponse.body.mutatesGrowSession, false);

  const linkId = createLinkResponse.body.link.record.id;
  assert.ok(linkId);
  assert.equal(db.cstp_test_sessions.length, 1);

  const listLinksResponse = await invokeRoute(
    sessionLinksListRoute,
    {
      method: "GET",
      headers: bearerHeaders(ADMIN_TOKEN),
      query: { cstpTestId: testId },
    },
    options,
  );
  assert.equal(listLinksResponse.statusCode, 200);
  assert.equal(listLinksResponse.body.sessionLinks.length, 1);

  const duplicateLinkResponse = await invokeRoute(
    sessionLinkCreateRoute,
    {
      method: "POST",
      headers: bearerHeaders(ADMIN_TOKEN),
      body: {
        cstpTestId: testId,
        sessionId: SESSION_ID,
        kanLabel: "KAN-A",
      },
    },
    options,
  );
  assert.equal(duplicateLinkResponse.statusCode, 500);
  assert.equal(duplicateLinkResponse.body.ok, false);
  assert.equal(duplicateLinkResponse.body.status, "session_link_duplicate_rejected");
  assert.equal(db.cstp_test_sessions.length, 1);

  const archiveLinkResponse = await invokeRoute(
    sessionLinkArchiveRoute,
    {
      method: "POST",
      headers: bearerHeaders(ADMIN_TOKEN),
      body: {
        linkId,
        cstpTestId: testId,
        sessionId: SESSION_ID,
      },
    },
    options,
  );
  assert.equal(archiveLinkResponse.statusCode, 200);
  assert.equal(archiveLinkResponse.body.ok, true);
  assert.equal(archiveLinkResponse.body.link.record.archived, true);
  assert.equal(archiveLinkResponse.body.mutatesGrowSession, false);

  assert.deepEqual(db.mutatedTables.has("grow_sessions"), false);
  assert.deepEqual(db.grow_sessions, [
    {
      id: SESSION_ID,
      name: "Smoke Grow Session",
      status: "active",
    },
  ]);

  console.log("CSTP smoke tests passed.");
}

async function testAdminAuthorization(fetchImpl) {
  const missing = await validateCstpAdminAuthorization({
    accessToken: "",
    config: CONFIG,
    fetchImpl,
  });
  assert.equal(missing.ok, false);
  assert.equal(missing.httpStatus, 401);

  const forbidden = await validateCstpAdminAuthorization({
    accessToken: USER_TOKEN,
    config: CONFIG,
    fetchImpl,
  });
  assert.equal(forbidden.ok, false);
  assert.equal(forbidden.httpStatus, 403);

  const authorized = await validateCstpAdminAuthorization({
    accessToken: ADMIN_TOKEN,
    config: CONFIG,
    fetchImpl,
  });
  assert.equal(authorized.ok, true);
  assert.equal(authorized.actor.userId, ADMIN_USER_ID);
}

function createSmokeDatabase() {
  return {
    admin_users: [
      {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        user_id: ADMIN_USER_ID,
        email: "admin@example.com",
      },
    ],
    grow_sessions: [
      {
        id: SESSION_ID,
        name: "Smoke Grow Session",
        status: "active",
      },
    ],
    cstp_requests: [],
    cstp_tests: [],
    cstp_admin_events: [],
    cstp_test_sessions: [],
    mutatedTables: new Set(),
    idCounter: 1,
  };
}

function createMockSupabaseFetch(db) {
  return async function mockSupabaseFetch(rawUrl, options = {}) {
    const url = new URL(String(rawUrl));

    if (url.pathname === "/auth/v1/user") {
      return handleMockAuthUser(options);
    }

    const restPrefix = "/rest/v1/";
    if (!url.pathname.startsWith(restPrefix)) {
      return mockResponse(404, { message: "Unknown mock Supabase path." });
    }

    const tableName = decodeURIComponent(url.pathname.slice(restPrefix.length));
    const table = db[tableName];
    if (!Array.isArray(table)) {
      return mockResponse(404, { message: `Unknown mock table ${tableName}.` });
    }

    const method = String(options.method || "GET").toUpperCase();
    if (method === "GET") {
      return mockResponse(200, applyPostgrestQuery(table, url.searchParams));
    }

    if (method === "POST") {
      db.mutatedTables.add(tableName);
      const record = {
        id: nextUuid(db),
        ...parseMockBody(options.body),
      };
      table.push(applyTimestampDefaults(record));
      return mockResponse(201, [table[table.length - 1]]);
    }

    if (method === "PATCH") {
      db.mutatedTables.add(tableName);
      const updates = parseMockBody(options.body);
      const rows = applyPostgrestQuery(table, url.searchParams);
      rows.forEach((row) => {
        Object.assign(row, updates, { updated_at: isoNow() });
      });
      return mockResponse(200, rows);
    }

    return mockResponse(405, { message: `Unsupported mock method ${method}.` });
  };
}

function handleMockAuthUser(options) {
  const token = getBearerToken(options.headers);
  if (token === ADMIN_TOKEN) {
    return mockResponse(200, {
      id: ADMIN_USER_ID,
      email: "admin@example.com",
    });
  }

  if (token === USER_TOKEN) {
    return mockResponse(200, {
      id: NON_ADMIN_USER_ID,
      email: "user@example.com",
    });
  }

  return mockResponse(401, { message: "Invalid token." });
}

function applyPostgrestQuery(rows, searchParams) {
  let filteredRows = [...rows];

  searchParams.forEach((value, key) => {
    if (["select", "order", "limit", "offset"].includes(key)) {
      return;
    }

    filteredRows = filteredRows.filter((row) => matchesFilter(row, key, value));
  });

  const order = searchParams.get("order");
  if (order) {
    const [fieldName, direction = "asc"] = order.split(".");
    filteredRows.sort((left, right) => {
      if (left[fieldName] === right[fieldName]) {
        return 0;
      }
      const comparison = left[fieldName] > right[fieldName] ? 1 : -1;
      return direction === "desc" ? -comparison : comparison;
    });
  }

  const offset = Number(searchParams.get("offset") || 0);
  const limit = Number(searchParams.get("limit") || filteredRows.length);
  return filteredRows.slice(offset, offset + limit);
}

function matchesFilter(row, key, value) {
  if (value.startsWith("eq.")) {
    return String(row[key] ?? "") === value.slice(3);
  }

  if (value.startsWith("is.")) {
    const expected = value.slice(3) === "true";
    return Boolean(row[key]) === expected;
  }

  return true;
}

function parseMockBody(body) {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    return JSON.parse(body);
  }

  return body;
}

function applyTimestampDefaults(record) {
  const timestamp = isoNow();
  return {
    ...record,
    created_at: record.created_at || timestamp,
    updated_at: record.updated_at || timestamp,
  };
}

function nextUuid(db) {
  const suffix = String(db.idCounter++).padStart(12, "0");
  return `00000000-0000-4000-8000-${suffix}`;
}

function mockResponse(status, payload) {
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

function bearerHeaders(token) {
  return {
    authorization: `Bearer ${token}`,
  };
}

function getBearerToken(headers = {}) {
  const value = headers.authorization || headers.Authorization || "";
  const match = String(value).match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

async function invokeRoute(route, request, options) {
  const response = createMockRouteResponse();
  await route(
    {
      headers: {},
      query: {},
      ...request,
    },
    response,
    options,
  );
  return response;
}

function createMockRouteResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end(payload) {
      this.body = payload;
      return this;
    },
  };
}

function buildRequestCreationPayload() {
  return {
    sourceId: SOURCE_ID,
    contactName: "CSTP Smoke Contact",
    contactEmail: "smoke@example.com",
    website: "https://example.com",
    varietyName: "Smoke Variety",
    seedType: "regular",
    breederName: "Smoke Breeder",
    batchLot: "SMOKE-LOT-1",
    requestedSeedCount: 12,
    requestMessage: "Internal smoke-test request.",
  };
}

function isoNow() {
  return new Date().toISOString();
}

run().catch((error) => {
  console.error("CSTP smoke tests failed.");
  console.error(error);
  process.exitCode = 1;
});
