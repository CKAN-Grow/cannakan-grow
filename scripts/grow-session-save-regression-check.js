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

console.log("Grow session save regression check passed.");
