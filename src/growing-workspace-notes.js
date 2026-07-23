(function growingWorkspaceNotesFactory(root, factory) {
  const contract = factory();
  if (typeof module === "object" && module.exports) module.exports = contract;
  root.GrowingWorkspaceNotes = contract;
}(typeof globalThis !== "undefined" ? globalThis : this, function createGrowingWorkspaceNotes() {
  const NOTE_CONTEXT_TYPES = Object.freeze(["session", "plant_group", "task", "event"]);

  function freeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach((key) => freeze(value[key]));
    return Object.freeze(value);
  }

  function first(record, camelKey, snakeKey, fallback = "") {
    if (record?.[camelKey] !== undefined && record[camelKey] !== null) return record[camelKey];
    if (record?.[snakeKey] !== undefined && record[snakeKey] !== null) return record[snakeKey];
    return fallback;
  }

  function normalizeNarrative(value) {
    return String(value ?? "").replace(/\r\n?/g, "\n").trim();
  }

  function normalizeNoteRecord(record = {}) {
    return freeze({
      id: String(first(record, "id", "id")).trim(),
      sessionId: String(first(record, "sessionId", "session_id")).trim(),
      authorId: String(first(record, "authorId", "author_user_id")).trim(),
      narrative: normalizeNarrative(first(record, "narrative", "narrative")),
      contextType: String(first(record, "contextType", "context_type", "session")).trim(),
      plantGroupId: String(first(record, "plantGroupId", "plant_group_id")).trim(),
      taskId: String(first(record, "taskId", "task_id")).trim(),
      eventId: String(first(record, "eventId", "event_id")).trim(),
      createdAt: String(first(record, "createdAt", "created_at")).trim(),
      updatedAt: String(first(record, "updatedAt", "updated_at")).trim(),
    });
  }

  function validateNoteInput(input = {}, context = {}) {
    const sessionId = String(context.sessionId || "").trim();
    const narrative = normalizeNarrative(input.narrative);
    const contextType = String(input.contextType || "session").trim();
    const contextId = String(input.contextId || "").trim();
    if (!sessionId) return freeze({ isValid: false, message: "A canonical Session is required." });
    if (!narrative) return freeze({ isValid: false, message: "Enter a note." });
    if (narrative.length > 10000) return freeze({ isValid: false, message: "Keep the note to 10,000 characters or fewer." });
    if (!NOTE_CONTEXT_TYPES.includes(contextType)) return freeze({ isValid: false, message: "Choose an approved Note context." });
    if (contextType === "session" && contextId) return freeze({ isValid: false, message: "Session context does not use a separate reference." });
    const collections = {
      plant_group: Array.isArray(context.plantGroups) ? context.plantGroups : [],
      task: Array.isArray(context.tasks) ? context.tasks : [],
      event: Array.isArray(context.events) ? context.events : [],
    };
    if (contextType !== "session") {
      const match = collections[contextType].find((item) => String(item.id || "").trim() === contextId);
      const existing = context.existingNote || null;
      const existingContextId = contextType === "plant_group" ? existing?.plantGroupId
        : contextType === "task" ? existing?.taskId : existing?.eventId;
      const retainsUnavailableContext = Boolean(
        existing
        && String(existing.sessionId || existing.session_id || "").trim() === sessionId
        && String(existing.contextType || existing.context_type || "").trim() === contextType
        && String(existingContextId || "").trim() === contextId,
      );
      if ((!match || String(match.sessionId || match.session_id || sessionId).trim() !== sessionId) && !retainsUnavailableContext) {
        return freeze({ isValid: false, message: "Choose context from this Session." });
      }
    }
    return freeze({
      isValid: true,
      value: {
        narrative,
        contextType,
        plantGroupId: contextType === "plant_group" ? contextId : "",
        taskId: contextType === "task" ? contextId : "",
        eventId: contextType === "event" ? contextId : "",
      },
    });
  }

  function buildNotePersistencePayload(value = {}, options = {}) {
    const payload = {
      session_id: String(options.sessionId || ""),
      narrative: normalizeNarrative(value.narrative),
      context_type: value.contextType || "session",
      plant_group_id: value.plantGroupId || null,
      task_id: value.taskId || null,
      event_id: value.eventId || null,
    };
    if (!options.existing) payload.author_user_id = String(options.authorId || "");
    return freeze(payload);
  }

  return freeze({
    NOTE_CONTEXT_TYPES,
    normalizeNarrative,
    normalizeNoteRecord,
    validateNoteInput,
    buildNotePersistencePayload,
  });
}));
