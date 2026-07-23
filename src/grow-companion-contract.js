(function growCompanionContractFactory(root, factory) {
  const contract = factory();
  if (typeof module === "object" && module.exports) module.exports = contract;
  root.GrowCompanionContract = contract;
}(typeof globalThis !== "undefined" ? globalThis : this, function createGrowCompanionContract() {
  const TASK_STATUSES = Object.freeze(["open", "completed"]);
  const TASK_DUE_KINDS = Object.freeze(["none", "date", "instant"]);
  const ACTIVITY_ORIGINS = Object.freeze(["user", "system", "testing_program"]);
  const EVENT_CATEGORIES = Object.freeze([
    Object.freeze({ id: "observation", label: "Observation" }),
    Object.freeze({ id: "transplant", label: "Transplant" }),
    Object.freeze({ id: "plant-health", label: "Plant Health" }),
    Object.freeze({ id: "environment", label: "Environment" }),
    Object.freeze({ id: "nutrition", label: "Nutrition" }),
    Object.freeze({ id: "harvest", label: "Harvest" }),
  ]);
  const EVENT_CATEGORY_IDS = new Set(EVENT_CATEGORIES.map((category) => category.id));

  function freeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach((key) => freeze(value[key]));
    return Object.freeze(value);
  }

  function firstValue(record, camelKey, snakeKey, fallback = "") {
    if (record && record[camelKey] !== undefined && record[camelKey] !== null) return record[camelKey];
    if (record && record[snakeKey] !== undefined && record[snakeKey] !== null) return record[snakeKey];
    return fallback;
  }

  function hasOwnValue(record, camelKey, snakeKey) {
    return Boolean(record && (
      Object.prototype.hasOwnProperty.call(record, camelKey)
      || Object.prototype.hasOwnProperty.call(record, snakeKey)
    ));
  }

  function normalizeDateOnly(value) {
    const normalized = String(value || "").trim();
    const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return "";
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return "";
    return normalized;
  }

  function normalizeTimeOnly(value) {
    const normalized = String(value || "").trim();
    const match = normalized.match(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
    return match ? `${match[1]}:${match[2]}` : "";
  }

  function normalizeLocalDateTime(value) {
    const normalized = String(value || "").trim().replace(" ", "T");
    const match = normalized.match(/^(\d{4}-\d{2}-\d{2})T([0-2]\d:[0-5]\d)(?::[0-5]\d)?$/);
    if (!match || !normalizeDateOnly(match[1]) || !normalizeTimeOnly(match[2])) return "";
    return `${match[1]}T${match[2]}`;
  }

  function normalizeUtcInstant(value) {
    const normalized = String(value || "").trim();
    const parsed = Date.parse(normalized);
    return normalized && Number.isFinite(parsed) ? new Date(parsed).toISOString() : "";
  }

  function normalizeTimeZone(value) {
    const normalized = String(value || "").trim();
    if (!normalized) return "";
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: normalized }).format(new Date(0));
      return normalized;
    } catch {
      return "";
    }
  }

  function normalizeUtcOffsetMinutes(value) {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= -840 && parsed <= 840 ? parsed : null;
  }

  function normalizeOrigin(value) {
    const normalized = String(value || "user").trim().toLowerCase();
    return ACTIVITY_ORIGINS.includes(normalized) ? normalized : "user";
  }

  function classifyTaskState(record = {}) {
    const present = hasOwnValue(record, "status", "status");
    const raw = present ? firstValue(record, "status", "status", null) : null;
    if (raw === null || raw === undefined || String(raw).trim() === "") {
      return freeze({ status: "open", classification: "legacy", raw: raw ?? null });
    }
    const normalized = String(raw).trim().toLowerCase();
    if (normalized === "upcoming") return freeze({ status: "open", classification: "legacy", raw });
    if (TASK_STATUSES.includes(normalized)) return freeze({ status: normalized, classification: "valid", raw });
    return freeze({ status: "", classification: "invalid", raw });
  }

  function classifyTaskDue(record = {}) {
    const kindPresent = hasOwnValue(record, "dueKind", "due_kind");
    const rawKindValue = kindPresent ? firstValue(record, "dueKind", "due_kind", null) : null;
    const rawKind = rawKindValue === null || rawKindValue === undefined ? "" : String(rawKindValue).trim().toLowerCase();
    const rawDate = firstValue(record, "dueDate", "due_date", "");
    const rawTime = firstValue(record, "dueTime", "due_time", "");
    const rawAt = firstValue(record, "dueAt", "due_at", "");
    const rawLocal = firstValue(record, "dueLocalDateTime", "due_local_datetime", "");
    const rawZone = firstValue(record, "dueTimeZone", "due_timezone", "");
    const rawOffset = firstValue(record, "dueUtcOffsetMinutes", "due_utc_offset_minutes", null);
    const dueDate = normalizeDateOnly(rawDate);
    const dueTime = normalizeTimeOnly(rawTime);
    const dueAt = normalizeUtcInstant(rawAt);
    const dueLocalDateTime = normalizeLocalDateTime(rawLocal);
    const dueTimeZone = normalizeTimeZone(rawZone);
    const dueUtcOffsetMinutes = normalizeUtcOffsetMinutes(rawOffset);
    const raw = freeze({
      dueKind: rawKindValue ?? null,
      dueDate: rawDate ?? null,
      dueTime: rawTime ?? null,
      dueAt: rawAt ?? null,
      dueLocalDateTime: rawLocal ?? null,
      dueTimeZone: rawZone ?? null,
      dueUtcOffsetMinutes: rawOffset ?? null,
    });

    if (!kindPresent || !rawKind) {
      const hasDateRaw = String(rawDate || "").trim() !== "";
      const hasTimeRaw = String(rawTime || "").trim() !== "";
      if (!hasDateRaw && !hasTimeRaw) return freeze({ kind: "none", classification: "legacy", projectionDate: "", dueDate: "", dueTime: "", dueAt: "", dueLocalDateTime: "", dueTimeZone: "", dueUtcOffsetMinutes: null, raw });
      if (dueDate && !hasTimeRaw) return freeze({ kind: "date", classification: "legacy", projectionDate: dueDate, dueDate, dueTime: "", dueAt: "", dueLocalDateTime: "", dueTimeZone: "", dueUtcOffsetMinutes: null, raw });
      if (dueDate && dueTime) return freeze({ kind: "legacy-local", classification: "legacy", projectionDate: dueDate, dueDate, dueTime, dueAt: "", dueLocalDateTime: "", dueTimeZone: "", dueUtcOffsetMinutes: null, raw });
      return freeze({ kind: "invalid", classification: "invalid", projectionDate: "", dueDate: "", dueTime: "", dueAt: "", dueLocalDateTime: "", dueTimeZone: "", dueUtcOffsetMinutes: null, raw });
    }

    if (!TASK_DUE_KINDS.includes(rawKind)) return freeze({ kind: "invalid", classification: "invalid", projectionDate: "", dueDate: "", dueTime: "", dueAt: "", dueLocalDateTime: "", dueTimeZone: "", dueUtcOffsetMinutes: null, raw });
    if (rawKind === "none") {
      const hasOther = [rawDate, rawTime, rawAt, rawLocal, rawZone].some((value) => String(value || "").trim()) || rawOffset !== null && rawOffset !== undefined && rawOffset !== "";
      return hasOther
        ? freeze({ kind: "invalid", classification: "invalid", projectionDate: "", dueDate: "", dueTime: "", dueAt: "", dueLocalDateTime: "", dueTimeZone: "", dueUtcOffsetMinutes: null, raw })
        : freeze({ kind: "none", classification: "valid", projectionDate: "", dueDate: "", dueTime: "", dueAt: "", dueLocalDateTime: "", dueTimeZone: "", dueUtcOffsetMinutes: null, raw });
    }
    if (rawKind === "date") {
      const valid = Boolean(dueDate) && !String(rawTime || rawAt || rawLocal || rawZone || "").trim() && (rawOffset === null || rawOffset === undefined || rawOffset === "");
      return valid
        ? freeze({ kind: "date", classification: "valid", projectionDate: dueDate, dueDate, dueTime: "", dueAt: "", dueLocalDateTime: "", dueTimeZone: "", dueUtcOffsetMinutes: null, raw })
        : freeze({ kind: "invalid", classification: "invalid", projectionDate: "", dueDate: "", dueTime: "", dueAt: "", dueLocalDateTime: "", dueTimeZone: "", dueUtcOffsetMinutes: null, raw });
    }
    const instantCandidates = dueAt && dueLocalDateTime && dueTimeZone && dueUtcOffsetMinutes !== null
      ? getZonedLocalCandidates(dueLocalDateTime, dueTimeZone)
      : [];
    const validInstant = instantCandidates.some((candidate) => (
      candidate.dueAt === dueAt
      && candidate.dueUtcOffsetMinutes === dueUtcOffsetMinutes
    ));
    return validInstant
      ? freeze({ kind: "instant", classification: "valid", projectionDate: dueLocalDateTime.slice(0, 10), dueDate: "", dueTime: "", dueAt, dueLocalDateTime, dueTimeZone, dueUtcOffsetMinutes, raw })
      : freeze({ kind: "invalid", classification: "invalid", projectionDate: "", dueDate: "", dueTime: "", dueAt: "", dueLocalDateTime: "", dueTimeZone: "", dueUtcOffsetMinutes: null, raw });
  }

  function normalizeTaskRecord(record = {}) {
    const state = classifyTaskState(record);
    const due = classifyTaskDue(record);
    return freeze({
      id: String(firstValue(record, "id", "id", "")).trim(),
      sessionId: String(firstValue(record, "sessionId", "session_id", "")).trim(),
      ownerId: String(firstValue(record, "ownerId", "user_id", "")).trim(),
      growingPhaseId: String(firstValue(record, "growingPhaseId", "growing_phase_id", "")).trim(),
      plantGroupId: String(firstValue(record, "plantGroupId", "plant_group_id", "")).trim(),
      title: String(firstValue(record, "title", "title", "")).trim(),
      details: String(firstValue(record, "details", "details", "")).trim(),
      status: state.status,
      stateClassification: state.classification,
      rawStatus: state.raw,
      dueKind: due.kind,
      dueClassification: due.classification,
      projectionDate: due.projectionDate,
      dueDate: due.dueDate,
      dueTime: due.dueTime,
      dueAt: due.dueAt,
      dueLocalDateTime: due.dueLocalDateTime,
      dueTimeZone: due.dueTimeZone,
      dueUtcOffsetMinutes: due.dueUtcOffsetMinutes,
      rawDue: due.raw,
      origin: normalizeOrigin(firstValue(record, "origin", "origin", "user")),
      createdAt: String(firstValue(record, "createdAt", "created_at", "")).trim(),
      updatedAt: String(firstValue(record, "updatedAt", "updated_at", "")).trim(),
      completedAt: normalizeUtcInstant(firstValue(record, "completedAt", "completed_at", "")),
    });
  }

  function normalizeEventRecord(record = {}) {
    const categoryValue = String(firstValue(record, "category", "category", "")).trim().toLowerCase();
    return freeze({
      id: String(firstValue(record, "id", "id", "")).trim(),
      sessionId: String(firstValue(record, "sessionId", "session_id", "")).trim(),
      ownerId: String(firstValue(record, "ownerId", "user_id", "")).trim(),
      title: String(firstValue(record, "title", "title", "")).trim(),
      details: String(firstValue(record, "details", "details", "")).trim(),
      occurredDate: normalizeDateOnly(firstValue(record, "occurredDate", "occurred_date", "")),
      occurredTime: normalizeTimeOnly(firstValue(record, "occurredTime", "occurred_time", "")),
      category: EVENT_CATEGORY_IDS.has(categoryValue) ? categoryValue : "",
      origin: normalizeOrigin(firstValue(record, "origin", "origin", "user")),
      createdAt: String(firstValue(record, "createdAt", "created_at", "")).trim(),
      updatedAt: String(firstValue(record, "updatedAt", "updated_at", "")).trim(),
    });
  }

  function getLocalDateOnly(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatPartsInZone(date, timeZone) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(date);
    return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  }

  function getZonedLocalCandidates(localDateTime, timeZone) {
    const local = normalizeLocalDateTime(localDateTime);
    const zone = normalizeTimeZone(timeZone);
    if (!local || !zone) return freeze([]);
    const [datePart, timePart] = local.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    const naive = Date.UTC(year, month - 1, day, hour, minute);
    const matches = [];
    for (let offset = -840; offset <= 840; offset += 15) {
      const instant = new Date(naive - offset * 60000);
      const parts = formatPartsInZone(instant, zone);
      if (Number(parts.year) === year && Number(parts.month) === month && Number(parts.day) === day && Number(parts.hour) === hour && Number(parts.minute) === minute) {
        matches.push(freeze({ dueAt: instant.toISOString(), dueUtcOffsetMinutes: offset }));
      }
    }
    return freeze(matches.sort((left, right) => left.dueAt.localeCompare(right.dueAt)));
  }

  function validateTaskContext(input = {}, context = {}) {
    const sessionId = String(context.sessionId || "").trim();
    const phase = context.growingPhase || null;
    const phaseId = String(input.growingPhaseId || "").trim();
    const plantGroupId = String(input.plantGroupId || "").trim();
    if (!phaseId && !plantGroupId) return freeze({ isValid: true, growingPhaseId: "", plantGroupId: "" });
    const canonicalPhaseId = String(phase?.id || "").trim();
    const phaseSessionId = String(phase?.sessionId || phase?.session_id || sessionId).trim();
    if (!canonicalPhaseId || phaseId !== canonicalPhaseId || phaseSessionId !== sessionId) return freeze({ isValid: false, message: "Choose Growing context from this Session." });
    if (!plantGroupId) return freeze({ isValid: true, growingPhaseId: phaseId, plantGroupId: "" });
    const groups = Array.isArray(phase?.plantGroups) ? phase.plantGroups : [];
    const group = groups.find((candidate) => String(candidate?.id || "").trim() === plantGroupId);
    if (!group || String(group.growingPhaseId || group.growing_phase_id || canonicalPhaseId).trim() !== canonicalPhaseId) return freeze({ isValid: false, message: "Choose a Plant Group from this Session." });
    return freeze({ isValid: true, growingPhaseId: phaseId, plantGroupId });
  }

  function validateTaskInput(input = {}, context = {}) {
    const title = String(input.title || "").trim();
    const details = String(input.details || "").trim();
    const status = TASK_STATUSES.includes(String(input.status || "open").trim().toLowerCase()) ? String(input.status || "open").trim().toLowerCase() : "";
    const dueKind = String(input.dueKind || "none").trim().toLowerCase();
    if (!title) return freeze({ isValid: false, message: "Enter a task title." });
    if (title.length > 160) return freeze({ isValid: false, message: "Keep the task title to 160 characters or fewer." });
    if (details.length > 2000) return freeze({ isValid: false, message: "Keep task details to 2,000 characters or fewer." });
    if (!status) return freeze({ isValid: false, message: "Choose a valid task state." });
    const contextValidation = validateTaskContext(input, context);
    if (!contextValidation.isValid) return contextValidation;
    if (input.preserveDue === true && context.existingTask) {
      return freeze({ isValid: true, value: {
        title, details, status, dueKind: "preserve",
        growingPhaseId: contextValidation.growingPhaseId,
        plantGroupId: contextValidation.plantGroupId,
      } });
    }
    if (!TASK_DUE_KINDS.includes(dueKind)) return freeze({ isValid: false, message: "Choose a valid due type." });
    let due = { dueKind, dueDate: "", dueAt: "", dueLocalDateTime: "", dueTimeZone: "", dueUtcOffsetMinutes: null };
    if (dueKind === "date") {
      const dueDate = normalizeDateOnly(input.dueDate);
      if (!dueDate) return freeze({ isValid: false, message: "Choose a valid due date." });
      due = { ...due, dueDate };
    } else if (dueKind === "instant") {
      const dueLocalDateTime = normalizeLocalDateTime(input.dueLocalDateTime || `${input.dueDate || ""}T${input.dueTime || ""}`);
      const dueTimeZone = normalizeTimeZone(input.dueTimeZone);
      if (!dueLocalDateTime) return freeze({ isValid: false, message: "Choose a valid local due date and time." });
      if (!dueTimeZone) return freeze({ isValid: false, message: "Choose a valid IANA time zone." });
      const candidates = getZonedLocalCandidates(dueLocalDateTime, dueTimeZone);
      if (!candidates.length) return freeze({ isValid: false, message: "That local time does not exist because of daylight saving time." });
      const selectedOffset = normalizeUtcOffsetMinutes(input.dueUtcOffsetMinutes);
      const candidate = candidates.length === 1
        ? candidates[0]
        : candidates.find((item) => item.dueUtcOffsetMinutes === selectedOffset);
      if (!candidate) return freeze({ isValid: false, message: "Choose which daylight-saving occurrence this due time represents.", candidates });
      due = { dueKind, dueDate: "", dueAt: candidate.dueAt, dueLocalDateTime, dueTimeZone, dueUtcOffsetMinutes: candidate.dueUtcOffsetMinutes };
    }
    return freeze({ isValid: true, value: {
      title, details, status, ...due,
      growingPhaseId: contextValidation.growingPhaseId,
      plantGroupId: contextValidation.plantGroupId,
    } });
  }

  function buildTaskPersistencePayload(value = {}, options = {}) {
    const now = normalizeUtcInstant(options.now || new Date().toISOString());
    const existing = options.existing ? normalizeTaskRecord(options.existing) : null;
    const status = TASK_STATUSES.includes(value.status) ? value.status : "open";
    const completedAt = status === "completed"
      ? (existing?.status === "completed" ? existing.completedAt || null : now)
      : null;
    const preservedDue = value.dueKind === "preserve" && existing ? {
      due_kind: existing.rawDue.dueKind,
      due_date: existing.rawDue.dueDate,
      due_time: existing.rawDue.dueTime,
      due_at: existing.rawDue.dueAt,
      due_local_datetime: existing.rawDue.dueLocalDateTime,
      due_timezone: existing.rawDue.dueTimeZone,
      due_utc_offset_minutes: existing.rawDue.dueUtcOffsetMinutes,
    } : null;
    return freeze({
      session_id: String(options.sessionId || ""),
      user_id: String(options.ownerId || ""),
      growing_phase_id: value.growingPhaseId || null,
      plant_group_id: value.plantGroupId || null,
      title: value.title,
      details: value.details,
      due_kind: preservedDue ? preservedDue.due_kind : value.dueKind,
      due_date: preservedDue ? preservedDue.due_date : value.dueKind === "date" ? value.dueDate : null,
      due_time: preservedDue ? preservedDue.due_time : null,
      due_at: preservedDue ? preservedDue.due_at : value.dueKind === "instant" ? value.dueAt : null,
      due_local_datetime: preservedDue ? preservedDue.due_local_datetime : value.dueKind === "instant" ? value.dueLocalDateTime.replace("T", " ") : null,
      due_timezone: preservedDue ? preservedDue.due_timezone : value.dueKind === "instant" ? value.dueTimeZone : null,
      due_utc_offset_minutes: preservedDue ? preservedDue.due_utc_offset_minutes : value.dueKind === "instant" ? value.dueUtcOffsetMinutes : null,
      status,
      origin: "user",
      completed_at: completedAt,
    });
  }

  function buildTaskStateTransitionPayload(task = {}, nextStatus = "", now = new Date().toISOString()) {
    const normalized = normalizeTaskRecord(task);
    if (!normalized.id || normalized.stateClassification === "invalid" || !TASK_STATUSES.includes(nextStatus)) return freeze({ isValid: false, message: "This Task state is unavailable." });
    if (normalized.status === nextStatus) return freeze({ isValid: true, isNoop: true, payload: null });
    const allowed = (normalized.status === "open" && nextStatus === "completed") || (normalized.status === "completed" && nextStatus === "open");
    if (!allowed) return freeze({ isValid: false, message: "That Task state transition is not allowed." });
    return freeze({ isValid: true, isNoop: false, payload: {
      status: nextStatus,
      completed_at: nextStatus === "completed" ? normalizeUtcInstant(now) : null,
    } });
  }

  function compareStableIds(left, right) {
    return String(left?.id || "").localeCompare(String(right?.id || ""));
  }

  function compareTaskProjectionOrder(left, right) {
    const dateComparison = String(left?.projectionDate || "").localeCompare(String(right?.projectionDate || ""));
    if (dateComparison) return dateComparison;
    const instantComparison = String(left?.dueAt || "").localeCompare(String(right?.dueAt || ""));
    if (instantComparison) return instantComparison;
    const timeComparison = String(left?.dueTime || "").localeCompare(String(right?.dueTime || ""));
    return timeComparison || compareStableIds(left, right);
  }

  function projectTasks(records = [], today = getLocalDateOnly()) {
    const normalizedToday = normalizeDateOnly(today) || getLocalDateOnly();
    const tasks = records.map(normalizeTaskRecord).filter((task) => task.id && task.title);
    const open = tasks.filter((task) => task.status === "open" && task.stateClassification !== "invalid").sort(compareTaskProjectionOrder);
    const completed = tasks.filter((task) => task.status === "completed" && task.stateClassification !== "invalid")
      .sort((left, right) => String(right.completedAt || "").localeCompare(String(left.completedAt || "")) || compareStableIds(left, right));
    const dated = open.filter((task) => task.dueClassification !== "invalid" && task.projectionDate).sort(compareTaskProjectionOrder);
    return freeze({
      open,
      completed,
      overdue: dated.filter((task) => task.projectionDate < normalizedToday),
      today: dated.filter((task) => task.projectionDate === normalizedToday),
      upcoming: dated.filter((task) => task.projectionDate > normalizedToday),
    });
  }

  function groupUpcomingTasks(records = [], today = getLocalDateOnly()) {
    const projected = projectTasks(records, today);
    return freeze({ overdue: projected.overdue, today: projected.today, upcoming: projected.upcoming });
  }

  function dateTimeSortValue(dateOnly = "", timeOnly = "", isoFallback = "") {
    const date = normalizeDateOnly(dateOnly);
    if (date) {
      const time = normalizeTimeOnly(timeOnly) || "00:00";
      const [year, month, day] = date.split("-").map(Number);
      const [hours, minutes] = time.split(":").map(Number);
      return Date.UTC(year, month - 1, day, hours, minutes);
    }
    const fallback = Date.parse(String(isoFallback || ""));
    return Number.isFinite(fallback) ? fallback : 0;
  }

  function buildActivityItems(taskRecords = [], eventRecords = []) {
    const taskItems = projectTasks(taskRecords).completed.map((task) => freeze({
      id: `task:${task.id}`, sourceId: task.id, sessionId: task.sessionId, type: "task",
      title: task.title, details: task.details, date: "", time: "", category: "task",
      status: task.status, origin: task.origin, occurredAt: task.completedAt,
      sortValue: dateTimeSortValue("", "", task.completedAt),
    }));
    const eventItems = eventRecords.map(normalizeEventRecord)
      .filter((event) => event.id && event.title && event.occurredDate)
      .map((event) => freeze({
        id: `event:${event.id}`, sourceId: event.id, sessionId: event.sessionId, type: "event",
        title: event.title, details: event.details, date: event.occurredDate, time: event.occurredTime,
        category: event.category, status: "recorded", origin: event.origin,
        occurredAt: event.updatedAt || event.createdAt,
        sortValue: dateTimeSortValue(event.occurredDate, event.occurredTime, event.updatedAt || event.createdAt),
      }));
    return freeze([...taskItems, ...eventItems].sort((left, right) => (
      right.sortValue - left.sortValue || left.type.localeCompare(right.type)
      || left.title.localeCompare(right.title) || left.sourceId.localeCompare(right.sourceId)
    )));
  }

  function validateEventInput(input = {}) {
    const title = String(input.title || "").trim();
    const details = String(input.details || "").trim();
    const occurredDate = normalizeDateOnly(input.occurredDate);
    const occurredTime = input.occurredTime ? normalizeTimeOnly(input.occurredTime) : "";
    const category = String(input.category || "").trim().toLowerCase();
    if (!title) return freeze({ isValid: false, message: "Enter an event title." });
    if (title.length > 160) return freeze({ isValid: false, message: "Keep the event title to 160 characters or fewer." });
    if (details.length > 2000) return freeze({ isValid: false, message: "Keep event details to 2,000 characters or fewer." });
    if (!occurredDate) return freeze({ isValid: false, message: "Choose a valid event date." });
    if (input.occurredTime && !occurredTime) return freeze({ isValid: false, message: "Choose a valid event time." });
    if (category && !EVENT_CATEGORY_IDS.has(category)) return freeze({ isValid: false, message: "Choose a supported event category." });
    return freeze({ isValid: true, value: { title, details, occurredDate, occurredTime, category } });
  }

  return freeze({
    TASK_STATUSES, TASK_DUE_KINDS, ACTIVITY_ORIGINS, EVENT_CATEGORIES,
    normalizeDateOnly, normalizeTimeOnly, normalizeLocalDateTime, normalizeUtcInstant,
    classifyTaskState, classifyTaskDue, normalizeTaskRecord, normalizeEventRecord,
    getLocalDateOnly, getZonedLocalCandidates, validateTaskContext, validateTaskInput,
    buildTaskPersistencePayload, buildTaskStateTransitionPayload, projectTasks,
    groupUpcomingTasks, buildActivityItems, validateEventInput,
  });
}));
