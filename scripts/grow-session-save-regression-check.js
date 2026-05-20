const assert = require("node:assert/strict");

const SESSION_SETUP_GRACE_MS = 5 * 60 * 1000;

function parseSessionStartDateTime(sessionDate, sessionTime) {
  if (!sessionDate) {
    return null;
  }

  const parsedDate = new Date(`${sessionDate}T${sessionTime || "00:00"}:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function getTimerStartAtFromCreatedAt(createdAt = "") {
  const createdDate = new Date(createdAt);
  const validCreatedDate = Number.isNaN(createdDate.getTime()) ? new Date() : createdDate;
  return new Date(validCreatedDate.getTime() + SESSION_SETUP_GRACE_MS).toISOString();
}

function getInitialSoakStartedAt(sessionStartedAt = "", createdAt = "", sessionStatus = "") {
  const sessionStartedDate = new Date(sessionStartedAt);
  const graceDate = new Date(getTimerStartAtFromCreatedAt(createdAt));
  const normalizedStatus = String(sessionStatus || "").trim().toLowerCase();
  if (Number.isNaN(sessionStartedDate.getTime())) {
    return graceDate.toISOString();
  }
  if (["germinating", "completed"].includes(normalizedStatus)) {
    return sessionStartedDate.toISOString();
  }
  if (graceDate < sessionStartedDate) {
    return sessionStartedDate.toISOString();
  }
  return graceDate.toISOString();
}

function validateGrowSessionTimelineOrder(timestamps = {}) {
  const sessionStartedDate = new Date(timestamps.sessionStartedAt || "");
  const soakStartedDate = new Date(timestamps.soakStartedAt || "");
  const germinationStartedDate = timestamps.germinationStartedAt ? new Date(timestamps.germinationStartedAt) : null;
  const completedDate = timestamps.completedAt ? new Date(timestamps.completedAt) : null;

  if (Number.isNaN(sessionStartedDate.getTime())) {
    return false;
  }
  if (Number.isNaN(soakStartedDate.getTime())) {
    return false;
  }
  if (soakStartedDate < sessionStartedDate) {
    return false;
  }
  if (germinationStartedDate && soakStartedDate > germinationStartedDate) {
    return false;
  }
  if (completedDate && germinationStartedDate && germinationStartedDate > completedDate) {
    return false;
  }
  if (completedDate && completedDate < sessionStartedDate) {
    return false;
  }
  return true;
}

function normalizeSessionStatus(sessionStatus) {
  const normalizedStatus = String(sessionStatus || "").trim().toLowerCase();
  return normalizedStatus || "unselected";
}

function normalizeGrowSessionLifecycleState(session = null) {
  if (["deleted", "archived", "archived_test"].includes(normalizeSessionStatus(session?.sessionStatus || session?.session_status || ""))) {
    return "deleted";
  }
  const normalizedStatus = normalizeSessionStatus(session?.sessionStatus || session?.session_status || "");
  if (["abandoned", "failed", "canceled", "cancelled"].includes(normalizedStatus)) {
    return "abandoned";
  }
  if (normalizedStatus === "completed") {
    return "completed";
  }
  if (["soaking", "germinating", "active"].includes(normalizedStatus)) {
    return "active";
  }
  return "draft";
}

function isGrowSessionAnalyticsEligible(session = {}) {
  if (session?.isTest || session?.is_test || session?.excludedFromAnalytics || session?.excluded_from_analytics) {
    return false;
  }
  if (session?.isMock || session?.is_mock) {
    return false;
  }
  if (normalizeGrowSessionLifecycleState(session) !== "completed") {
    return false;
  }
  return validateGrowSessionTimelineOrder({
    sessionStartedAt: session.sessionStartedAt,
    soakStartedAt: session.soakStartedAt,
    germinationStartedAt: session.germinationStartedAt,
    completedAt: session.completedAt,
  });
}

function mapSessionToRecord(session, userId, options = {}) {
  const includeOwnerTimeColumns = options.includeOwnerTimeColumns !== false;
  const record = {
    id: session.id,
    user_id: userId,
    date: session.date,
    time: session.time,
    system_type: session.systemType,
    unit_id: session.unitId,
    session_name: session.sessionName,
    custom_session_name: session.customSessionName || "",
    session_status: session.sessionStatus || "",
    germination_started_at: session.germinationStartedAt || null,
    completed_at: session.completedAt || null,
    partitions: session.partitions || [],
    is_mock: false,
    created_at: session.createdAt,
    timer_start_at: session.soakStartedAt,
    updated_at: session.updatedAt || session.createdAt,
  };

  if (includeOwnerTimeColumns) {
    record.session_started_at = session.sessionStartedAt;
    record.soak_started_at = session.soakStartedAt;
  }

  return record;
}

function canRegularUserEditSessionTimes(session = null, currentUserId = "") {
  if (!session) {
    return false;
  }
  return false;
}

function canFounderAdminEditOwnSessionTimes(session = null, currentUserId = "") {
  if (!session) {
    return false;
  }

  const ownerUserId = String(session.userId || session.user_id || "").trim();
  return Boolean(currentUserId && ownerUserId && currentUserId === ownerUserId);
}

function applyAutomaticGrowSessionCreationTimestamps(session = {}, referenceDate = new Date()) {
  const actionAt = referenceDate.toISOString();
  const date = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}-${String(referenceDate.getDate()).padStart(2, "0")}`;
  const time = `${String(referenceDate.getHours()).padStart(2, "0")}:${String(referenceDate.getMinutes()).padStart(2, "0")}`;
  const normalizedStatus = String(session.sessionStatus || "").trim().toLowerCase();
  return {
    ...session,
    date,
    time,
    sessionStartedAt: actionAt,
    soakStartedAt: actionAt,
    timerStartAt: actionAt,
    germinationStartedAt: ["germinating", "completed"].includes(normalizedStatus) ? actionAt : "",
    completedAt: normalizedStatus === "completed" ? actionAt : "",
  };
}

const createdAt = "2026-05-19T15:00:00.000Z";
const sessionStartedAt = parseSessionStartDateTime("2026-05-19", "12:00").toISOString();
const soakStartedAt = getInitialSoakStartedAt(sessionStartedAt, createdAt, "soaking");
const session = {
  id: "11111111-1111-4111-8111-111111111111",
  date: "2026-05-19",
  time: "12:00",
  systemType: "KAN",
  unitId: "A",
  sessionName: "Regression Basic Session",
  sessionStatus: "soaking",
  createdAt,
  updatedAt: createdAt,
  sessionStartedAt,
  soakStartedAt,
  partitions: [{ id: 1, source: "Test", seedVariety: "Basic", seedCount: 1 }],
};

assert.equal(validateGrowSessionTimelineOrder(session), true, "basic session timeline should be valid");

const modernRecord = mapSessionToRecord(session, "owner-user-id");
assert.equal(modernRecord.user_id, "owner-user-id");
assert.equal(modernRecord.is_mock, false);
assert.equal(modernRecord.session_started_at, sessionStartedAt);
assert.equal(modernRecord.soak_started_at, soakStartedAt);

const legacyRecord = mapSessionToRecord(session, "owner-user-id", { includeOwnerTimeColumns: false });
assert.equal("session_started_at" in legacyRecord, false);
assert.equal("soak_started_at" in legacyRecord, false);
assert.equal(legacyRecord.timer_start_at, soakStartedAt);

assert.equal(canRegularUserEditSessionTimes({ userId: "owner-user-id" }, "owner-user-id"), false);
assert.equal(canFounderAdminEditOwnSessionTimes({ userId: "owner-user-id" }, "owner-user-id"), true);
assert.equal(canFounderAdminEditOwnSessionTimes({ userId: "other-user-id" }, "owner-user-id"), false);

const automaticReferenceDate = new Date("2026-05-19T18:25:00.000Z");
const automaticReferenceDateValue = `${automaticReferenceDate.getFullYear()}-${String(automaticReferenceDate.getMonth() + 1).padStart(2, "0")}-${String(automaticReferenceDate.getDate()).padStart(2, "0")}`;
const automaticReferenceTimeValue = `${String(automaticReferenceDate.getHours()).padStart(2, "0")}:${String(automaticReferenceDate.getMinutes()).padStart(2, "0")}`;
const automaticSession = applyAutomaticGrowSessionCreationTimestamps({
  ...session,
  date: "2026-01-01",
  time: "01:00",
  sessionStatus: "completed",
  sessionStartedAt: "2026-01-01T06:00:00.000Z",
  soakStartedAt: "2026-01-01T06:05:00.000Z",
}, automaticReferenceDate);
assert.equal(automaticSession.date, automaticReferenceDateValue);
assert.equal(automaticSession.time, automaticReferenceTimeValue);
assert.equal(automaticSession.sessionStartedAt, "2026-05-19T18:25:00.000Z");
assert.equal(automaticSession.soakStartedAt, "2026-05-19T18:25:00.000Z");
assert.equal(automaticSession.germinationStartedAt, "2026-05-19T18:25:00.000Z");
assert.equal(automaticSession.completedAt, "2026-05-19T18:25:00.000Z");

const completedAnalyticsSession = {
  ...session,
  sessionStatus: "completed",
  germinationStartedAt: "2026-05-19T16:10:00.000Z",
  completedAt: "2026-05-19T17:00:00.000Z",
};
assert.equal(isGrowSessionAnalyticsEligible(completedAnalyticsSession), true);
assert.equal(isGrowSessionAnalyticsEligible({ ...completedAnalyticsSession, sessionStatus: "germinating" }), false);
assert.equal(isGrowSessionAnalyticsEligible({ ...completedAnalyticsSession, sessionStatus: "abandoned" }), false);
assert.equal(isGrowSessionAnalyticsEligible({ ...completedAnalyticsSession, userDeleted: true }), true);
assert.equal(isGrowSessionAnalyticsEligible({ ...completedAnalyticsSession, isDeleted: true }), true);
assert.equal(isGrowSessionAnalyticsEligible({ ...completedAnalyticsSession, sessionStatus: "archived_test", isDeleted: true }), false);
assert.equal(isGrowSessionAnalyticsEligible({ ...completedAnalyticsSession, isMock: true }), false);
assert.equal(isGrowSessionAnalyticsEligible({ ...completedAnalyticsSession, isTest: true }), false);
assert.equal(isGrowSessionAnalyticsEligible({ ...completedAnalyticsSession, excludedFromAnalytics: true }), false);
assert.equal(isGrowSessionAnalyticsEligible({
  ...completedAnalyticsSession,
  germinationStartedAt: "2026-05-19T18:00:00.000Z",
}), false);

console.log("Grow session save regression check passed.");
