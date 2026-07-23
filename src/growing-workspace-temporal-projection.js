(function temporalProjectionFactory(root, factory) {
  const sourceContract = typeof module === "object" && module.exports
    ? require("./grow-companion-contract.js")
    : root.GrowCompanionContract;
  const contract = factory(sourceContract);
  if (typeof module === "object" && module.exports) module.exports = contract;
  root.GrowingWorkspaceTemporalProjection = contract;
}(typeof globalThis !== "undefined" ? globalThis : this, function createTemporalProjection(sourceContract) {
  if (!sourceContract) throw new Error("Canonical Task and Event adapters are required.");

  function freeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach((key) => freeze(value[key]));
    return Object.freeze(value);
  }

  function isAuthorizedSource(record = {}, options = {}) {
    const sessionId = String(options.sessionId || "").trim();
    const ownerId = String(options.ownerId || "").trim();
    return (!sessionId || record.sessionId === sessionId)
      && (!ownerId || !record.ownerId || record.ownerId === ownerId);
  }

  function getContextId(record = {}) {
    return record.plantGroupId || record.growingPhaseId || record.sessionId || "";
  }

  function mapTaskToTemporalEntry(record = {}, options = {}) {
    const task = record;
    if (!task.id || !task.sessionId || !task.title || !isAuthorizedSource(task, options)) return null;
    if (task.dueClassification === "invalid" || task.dueKind === "none" || !task.projectionDate) return null;
    let startsAt = "";
    let localTime = "";
    if (task.dueKind === "instant") {
      startsAt = task.dueAt;
      localTime = task.dueLocalDateTime.slice(11);
    } else if (task.dueKind === "legacy-local") {
      startsAt = `${task.dueDate}T${task.dueTime}`;
      localTime = task.dueTime;
    } else {
      startsAt = task.dueDate || task.projectionDate;
    }
    if (!startsAt) return null;
    return freeze({
      key: `task:${task.id}`,
      sourceType: "task",
      sourceId: task.id,
      sessionId: task.sessionId,
      contextId: getContextId(task),
      growingPhaseId: task.growingPhaseId,
      plantGroupId: task.plantGroupId,
      temporalKind: task.dueKind,
      startsAt,
      endsAt: "",
      dateKey: task.projectionDate,
      localTime,
      timeZone: task.dueTimeZone,
      status: task.status || "unavailable",
      displayLabel: task.title,
    });
  }

  function mapEventToTemporalEntry(record = {}, options = {}) {
    const event = record;
    if (!event.id || !event.sessionId || !isAuthorizedSource(event, options)) return null;
    if (event.occurrenceClassification === "invalid" || !event.projectionDate) return null;
    let startsAt = "";
    let localTime = "";
    if (event.occurredKind === "instant") {
      startsAt = event.occurredAt;
      localTime = event.occurredLocalDateTime.slice(11);
    } else if (event.occurredKind === "legacy-local") {
      startsAt = event.occurredLocalDateTime;
      localTime = event.occurredTime;
    } else {
      startsAt = event.occurredDate || event.projectionDate;
    }
    if (!startsAt) return null;
    const categoryLabel = sourceContract.EVENT_CATEGORIES.find((category) => category.id === event.category)?.label;
    return freeze({
      key: `event:${event.id}`,
      sourceType: "event",
      sourceId: event.id,
      sessionId: event.sessionId,
      contextId: getContextId(event),
      growingPhaseId: event.growingPhaseId,
      plantGroupId: event.plantGroupId,
      temporalKind: event.occurredKind,
      startsAt,
      endsAt: "",
      dateKey: event.projectionDate,
      localTime,
      timeZone: event.occurredTimeZone,
      status: "recorded",
      displayLabel: event.title || categoryLabel || "Event",
    });
  }

  function compareTemporalEntries(left = {}, right = {}) {
    const temporal = String(left.startsAt || "").localeCompare(String(right.startsAt || ""));
    if (temporal) return temporal;
    const source = String(left.sourceType || "").localeCompare(String(right.sourceType || ""));
    return source || String(left.sourceId || "").localeCompare(String(right.sourceId || ""));
  }

  function projectTemporalRecords(taskRecords = [], eventRecords = [], options = {}) {
    const tasks = Array.isArray(taskRecords) ? taskRecords : [];
    const events = Array.isArray(eventRecords) ? eventRecords : [];
    return freeze([
      ...tasks.map((record) => mapTaskToTemporalEntry(record, options)).filter(Boolean),
      ...events.map((record) => mapEventToTemporalEntry(record, options)).filter(Boolean),
    ].sort(compareTemporalEntries));
  }

  function filterTemporalEntries(entries = [], options = {}) {
    const fromDate = sourceContract.normalizeDateOnly(options.fromDate);
    const toDate = sourceContract.normalizeDateOnly(options.toDate);
    const sourceTypes = Array.isArray(options.sourceTypes)
      ? new Set(options.sourceTypes.filter((value) => value === "task" || value === "event"))
      : null;
    return freeze((Array.isArray(entries) ? entries : []).filter((entry) => (
      (!fromDate || entry.dateKey >= fromDate)
      && (!toDate || entry.dateKey <= toDate)
      && (!sourceTypes || sourceTypes.size === 0 || sourceTypes.has(entry.sourceType))
    )));
  }

  function createTimelineView(entries = [], options = {}) {
    return filterTemporalEntries(entries, options);
  }

  function createCalendarView(entries = [], options = {}) {
    const filtered = filterTemporalEntries(entries, options);
    const groups = [];
    filtered.forEach((entry) => {
      const previous = groups[groups.length - 1];
      if (previous?.date === entry.dateKey) {
        previous.entries.push(entry);
      } else {
        groups.push({ date: entry.dateKey, entries: [entry] });
      }
    });
    return freeze(groups.map((group) => ({ date: group.date, entries: group.entries })));
  }

  function shiftDateOnly(value = "", months = 0) {
    const date = sourceContract.normalizeDateOnly(value);
    const amount = Number(months);
    if (!date || !Number.isInteger(amount)) return "";
    const [year, month, day] = date.split("-").map(Number);
    const target = new Date(Date.UTC(year, month - 1 + amount, 1));
    const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
    target.setUTCDate(Math.min(day, lastDay));
    return target.toISOString().slice(0, 10);
  }

  function getMonthRange(value = "") {
    const date = sourceContract.normalizeDateOnly(value);
    if (!date) return freeze({ fromDate: "", toDate: "" });
    const [year, month] = date.split("-").map(Number);
    const fromDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const toDate = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
    return freeze({ fromDate, toDate });
  }

  return freeze({
    mapTaskToTemporalEntry,
    mapEventToTemporalEntry,
    compareTemporalEntries,
    projectTemporalRecords,
    filterTemporalEntries,
    createTimelineView,
    createCalendarView,
    shiftDateOnly,
    getMonthRange,
  });
}));
