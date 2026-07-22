(function growCompanionContractFactory(root, factory) {
  const contract = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = contract;
  }
  root.GrowCompanionContract = contract;
}(typeof globalThis !== "undefined" ? globalThis : this, function createGrowCompanionContract() {
  const TASK_STATUSES = Object.freeze(["upcoming", "completed"]);
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

  function normalizeOrigin(value) {
    const normalized = String(value || "user").trim().toLowerCase();
    return ACTIVITY_ORIGINS.includes(normalized) ? normalized : "user";
  }

  function normalizeTaskRecord(record = {}) {
    const statusValue = String(firstValue(record, "status", "status", "upcoming") || "upcoming").trim().toLowerCase();
    const status = TASK_STATUSES.includes(statusValue) ? statusValue : "upcoming";
    return freeze({
      id: String(firstValue(record, "id", "id", "")).trim(),
      sessionId: String(firstValue(record, "sessionId", "session_id", "")).trim(),
      ownerId: String(firstValue(record, "ownerId", "user_id", "")).trim(),
      title: String(firstValue(record, "title", "title", "")).trim(),
      details: String(firstValue(record, "details", "details", "")).trim(),
      dueDate: normalizeDateOnly(firstValue(record, "dueDate", "due_date", "")),
      dueTime: normalizeTimeOnly(firstValue(record, "dueTime", "due_time", "")),
      status,
      origin: normalizeOrigin(firstValue(record, "origin", "origin", "user")),
      createdAt: String(firstValue(record, "createdAt", "created_at", "")).trim(),
      updatedAt: String(firstValue(record, "updatedAt", "updated_at", "")).trim(),
      completedAt: String(firstValue(record, "completedAt", "completed_at", "")).trim(),
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

  function compareStableIds(left, right) {
    return String(left?.id || "").localeCompare(String(right?.id || ""));
  }

  function compareUpcomingTasks(left, right) {
    const dateComparison = String(left?.dueDate || "").localeCompare(String(right?.dueDate || ""));
    if (dateComparison !== 0) return dateComparison;
    const leftTime = left?.dueTime || "23:59";
    const rightTime = right?.dueTime || "23:59";
    const timeComparison = leftTime.localeCompare(rightTime);
    if (timeComparison !== 0) return timeComparison;
    const titleComparison = String(left?.title || "").localeCompare(String(right?.title || ""));
    return titleComparison || compareStableIds(left, right);
  }

  function groupUpcomingTasks(records = [], today = getLocalDateOnly()) {
    const normalizedToday = normalizeDateOnly(today) || getLocalDateOnly();
    const tasks = records.map(normalizeTaskRecord)
      .filter((task) => task.id && task.title && task.dueDate && task.status === "upcoming")
      .sort(compareUpcomingTasks);
    return freeze({
      overdue: tasks.filter((task) => task.dueDate < normalizedToday),
      today: tasks.filter((task) => task.dueDate === normalizedToday),
      upcoming: tasks.filter((task) => task.dueDate > normalizedToday),
    });
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
    const taskItems = taskRecords.map(normalizeTaskRecord)
      .filter((task) => task.id && task.title && task.status === "completed")
      .map((task) => freeze({
        id: `task:${task.id}`,
        sourceId: task.id,
        sessionId: task.sessionId,
        type: "task",
        title: task.title,
        details: task.details,
        date: "",
        time: "",
        category: "task",
        status: task.status,
        origin: task.origin,
        occurredAt: task.completedAt || task.updatedAt || task.createdAt,
        sortValue: dateTimeSortValue("", "", task.completedAt || task.updatedAt || task.createdAt),
      }));
    const eventItems = eventRecords.map(normalizeEventRecord)
      .filter((event) => event.id && event.title && event.occurredDate)
      .map((event) => freeze({
        id: `event:${event.id}`,
        sourceId: event.id,
        sessionId: event.sessionId,
        type: "event",
        title: event.title,
        details: event.details,
        date: event.occurredDate,
        time: event.occurredTime,
        category: event.category,
        status: "recorded",
        origin: event.origin,
        occurredAt: event.updatedAt || event.createdAt,
        sortValue: dateTimeSortValue(event.occurredDate, event.occurredTime, event.updatedAt || event.createdAt),
      }));
    return freeze([...taskItems, ...eventItems].sort((left, right) => (
      right.sortValue - left.sortValue
      || left.type.localeCompare(right.type)
      || left.title.localeCompare(right.title)
      || left.sourceId.localeCompare(right.sourceId)
    )));
  }

  function validateTaskInput(input = {}) {
    const title = String(input.title || "").trim();
    const details = String(input.details || "").trim();
    const dueDate = normalizeDateOnly(input.dueDate);
    const dueTime = input.dueTime ? normalizeTimeOnly(input.dueTime) : "";
    const status = TASK_STATUSES.includes(String(input.status || "upcoming")) ? String(input.status || "upcoming") : "upcoming";
    if (!title) return freeze({ isValid: false, message: "Enter a task title." });
    if (title.length > 160) return freeze({ isValid: false, message: "Keep the task title to 160 characters or fewer." });
    if (details.length > 2000) return freeze({ isValid: false, message: "Keep task details to 2,000 characters or fewer." });
    if (!dueDate) return freeze({ isValid: false, message: "Choose a valid due date." });
    if (input.dueTime && !dueTime) return freeze({ isValid: false, message: "Choose a valid due time." });
    return freeze({ isValid: true, value: { title, details, dueDate, dueTime, status } });
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
    TASK_STATUSES,
    ACTIVITY_ORIGINS,
    EVENT_CATEGORIES,
    normalizeDateOnly,
    normalizeTimeOnly,
    normalizeTaskRecord,
    normalizeEventRecord,
    getLocalDateOnly,
    groupUpcomingTasks,
    buildActivityItems,
    validateTaskInput,
    validateEventInput,
  });
}));
