(function workspaceCompositionFactory(root, factory) {
  const taskEventContract = typeof module === "object" && module.exports
    ? require("./grow-companion-contract.js")
    : root.GrowCompanionContract;
  const temporalProjection = typeof module === "object" && module.exports
    ? require("./growing-workspace-temporal-projection.js")
    : root.GrowingWorkspaceTemporalProjection;
  const notesContract = typeof module === "object" && module.exports
    ? require("./growing-workspace-notes.js")
    : root.GrowingWorkspaceNotes;
  const contract = factory(taskEventContract, temporalProjection, notesContract);
  if (typeof module === "object" && module.exports) module.exports = contract;
  root.WorkspaceComposition = contract;
}(typeof globalThis !== "undefined" ? globalThis : this, function createWorkspaceComposition(
  taskEventContract,
  temporalProjection,
  notesContract,
) {
  if (!taskEventContract || !temporalProjection || !notesContract) {
    throw new Error("Canonical Task, Event, Temporal Projection, and Note capabilities are required.");
  }

  function freezeList(records = []) {
    return Object.freeze([...records]);
  }

  function belongsToSession(record = {}, sessionId = "") {
    return Boolean(record.id) && record.sessionId === sessionId;
  }

  function composeWorkspace(input = {}) {
    const sessionId = String(input.sessionId || "").trim();
   if (!sessionId) throw new Error("Workspace Composition requires a canonical Session.");

    const tasks = freezeList((Array.isArray(input.tasks) ? input.tasks : [])
      .filter((record) => belongsToSession(record, sessionId)));
    const events = freezeList((Array.isArray(input.events) ? input.events : [])
      .filter((record) => belongsToSession(record, sessionId)));
    const notes = freezeList((Array.isArray(input.notes) ? input.notes : [])
      .filter((record) => belongsToSession(record, sessionId)));
    const temporalEntries = temporalProjection.projectTemporalRecords(tasks, events, { sessionId });

    return Object.freeze({
      sessionId,
      tasks,
      events,
      notes,
      taskProjection: taskEventContract.projectTasks(tasks),
      activity: taskEventContract.buildActivityItems(tasks, events),
      temporalEntries,
    });
  }

  return Object.freeze({
    composeWorkspace,
  });
}));
